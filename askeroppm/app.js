/* Asker oppmåling — demo.
   Ingen avhengigheter, ingen backend, ingen lagring. Skjemaet lager en kvittering
   i nettleseren og et e-postutkast til riktig adresse; det sender ingenting selv. */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* --- Mobilmeny --------------------------------------------------------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    // Under 900 px er menyen en nedtrekksliste som skal starte lukket.
    var smalSkjerm = window.matchMedia('(max-width: 900px)');

    function settMeny() {
      if (smalSkjerm.matches) {
        nav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        nav.removeAttribute('hidden');
      }
    }

    settMeny();
    if (smalSkjerm.addEventListener) smalSkjerm.addEventListener('change', settMeny);
    else if (smalSkjerm.addListener) smalSkjerm.addListener(settMeny);

    toggle.addEventListener('click', function () {
      var apen = nav.hasAttribute('hidden');
      if (apen) nav.removeAttribute('hidden');
      else nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(apen));
    });
  }

  /* --- Rolig innkomst ---------------------------------------------------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveal = document.querySelectorAll('.reveal');
  function visAlt() {
    for (var i = 0; i < reveal.length; i++) reveal[i].classList.add('is-visible');
  }
  if (reduced || !('IntersectionObserver' in window)) {
    visAlt();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    reveal.forEach(function (el) { io.observe(el); });
    // Sikkerhetsnett: innhold skal aldri bli stående usynlig.
    window.setTimeout(visAlt, 1800);
  }

  /* --- Årstall ----------------------------------------------------------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* --- Oppdragsbeskrivelse ----------------------------------------------- */
  var rot = document.querySelector('[data-oppdrag]');
  if (!rot) return;

  var form = rot.querySelector('[data-skjema]');
  var steg = rot.querySelectorAll('[data-steg]');
  var punkter = rot.querySelectorAll('[data-punkt]');
  var feilEl = rot.querySelector('[data-feil]');
  var nesteKnapp = rot.querySelector('[data-neste]');
  var tilbakeKnapp = rot.querySelector('[data-tilbake]');
  var kvitterKnapp = rot.querySelector('[data-kvitter]');
  var kvittering = rot.querySelector('[data-kvittering]');
  var sammendrag = rot.querySelector('[data-sammendrag]');
  var mottakerEl = rot.querySelector('[data-mottaker]');
  var sendLenke = rot.querySelector('[data-send]');
  var kopierKnapp = rot.querySelector('[data-kopier]');
  var nyKnapp = rot.querySelector('[data-ny]');
  var kopiertEl = rot.querySelector('[data-kopiert]');

  var FELTNAVN = {
    kundetype: 'hvem oppdraget gjelder',
    tjeneste: 'hvilken tjeneste det gjelder',
    sted: 'adresse eller område',
    oppstart: 'ønsket oppstart',
    navn: 'navn',
    epost: 'e-postadresse',
    telefon: 'telefonnummer'
  };

  var aktivtSteg = 1;
  var kvitteringstekst = '';

  function feltISteg(nr) {
    var fs = rot.querySelector('[data-steg="' + nr + '"]');
    return fs ? fs.querySelectorAll('input, select, textarea') : [];
  }

  function forsteFeil(nr) {
    var felt = feltISteg(nr);
    var settRadio = {};

    for (var i = 0; i < felt.length; i++) {
      var el = felt[i];
      var navn = el.name || 'feltet';

      if (el.type === 'radio') {
        if (settRadio[navn]) continue;
        settRadio[navn] = true;
        var valgt = rot.querySelector('input[name="' + navn + '"]:checked');
        if (!valgt) return { el: el, melding: 'Velg ' + (FELTNAVN[navn] || navn) + '.' };
        continue;
      }

      var verdi = (el.value || '').trim();

      if (el.hasAttribute('required') && verdi === '') {
        return { el: el, melding: 'Fyll inn ' + (FELTNAVN[navn] || navn) + '.' };
      }

      if (el.type === 'email' && verdi !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi)) {
        return { el: el, melding: 'Skriv en gyldig e-postadresse.' };
      }

      if (el.type === 'tel' && verdi !== '' && verdi.replace(/\D/g, '').length < 8) {
        return { el: el, melding: 'Skriv et telefonnummer med minst åtte sifre.' };
      }
    }
    return null;
  }

  function visFeil(melding) {
    if (feilEl) feilEl.textContent = melding || '';
  }

  function visSteg(nr, flyttFokus) {
    aktivtSteg = nr;

    for (var i = 0; i < steg.length; i++) {
      var egetNr = Number(steg[i].getAttribute('data-steg'));
      if (egetNr === nr) steg[i].removeAttribute('hidden');
      else steg[i].setAttribute('hidden', '');
    }

    for (var j = 0; j < punkter.length; j++) {
      var p = Number(punkter[j].getAttribute('data-punkt'));
      punkter[j].classList.toggle('er-aktiv', p === nr);
      punkter[j].classList.toggle('er-ferdig', p < nr);
      if (p === nr) punkter[j].setAttribute('aria-current', 'step');
      else punkter[j].removeAttribute('aria-current');
    }

    if (tilbakeKnapp) tilbakeKnapp.hidden = nr === 1;
    if (nesteKnapp) nesteKnapp.hidden = nr === steg.length;
    if (kvitterKnapp) kvitterKnapp.hidden = nr !== steg.length;
    visFeil('');

    if (flyttFokus) {
      var forste = feltISteg(nr)[0];
      if (forste) forste.focus({ preventScroll: true });
    }
  }

  function gaaVidere() {
    var feil = forsteFeil(aktivtSteg);
    if (feil) {
      visFeil(feil.melding);
      if (feil.el && feil.el.focus) feil.el.focus();
      return;
    }
    if (aktivtSteg < steg.length) {
      visSteg(aktivtSteg + 1, true);
    } else {
      lagKvittering();
    }
  }

  function lagReferanse() {
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var kode = '';
    for (var i = 0; i < 4; i++) kode += tegn.charAt(Math.floor(Math.random() * tegn.length));
    return 'AO-' + new Date().getFullYear() + '-' + kode;
  }

  function lagKvittering() {
    var feil = forsteFeil(aktivtSteg);
    if (feil) {
      visFeil(feil.melding);
      if (feil.el && feil.el.focus) feil.el.focus();
      return;
    }

    var data = new FormData(form);
    var privat = data.get('kundetype') === 'Privat / bolig';
    var mottaker = privat ? 'bolig@askeroppm.no' : 'firmapost@askeroppm.no';
    var referanse = lagReferanse();

    var rader = [
      ['Hvem', data.get('kundetype')],
      ['Tjeneste', data.get('tjeneste')],
      ['Sted', data.get('sted')],
      ['Ønsket oppstart', data.get('oppstart')],
      ['Om oppdraget', data.get('beskrivelse')],
      ['Navn', data.get('navn')],
      ['E-post', data.get('epost')],
      ['Telefon', data.get('telefon')],
      ['Sendes til', mottaker],
      ['Referanse', referanse]
    ].filter(function (rad) { return rad[1] && String(rad[1]).trim() !== ''; });

    sammendrag.innerHTML = '';
    rader.forEach(function (rad) {
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = String(rad[1]);
      sammendrag.appendChild(dt);
      sammendrag.appendChild(dd);
    });

    if (mottakerEl) mottakerEl.textContent = mottaker;

    var emne = 'Oppdragsbeskrivelse ' + referanse + ' — ' + data.get('tjeneste');
    var kropp = rader
      .filter(function (rad) { return rad[0] !== 'Sendes til'; })
      .map(function (rad) { return rad[0] + ': ' + rad[1]; })
      .join('\n');

    kvitteringstekst = 'Oppdragsbeskrivelse til Asker oppmåling AS\n' + kropp;

    if (sendLenke) {
      sendLenke.href = 'mailto:' + mottaker +
        '?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(kropp);
    }

    form.hidden = true;
    if (kvittering) {
      kvittering.hidden = false;
      kvittering.focus({ preventScroll: true });
      if (kvittering.scrollIntoView) {
        kvittering.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
      }
    }
  }

  function kopier() {
    if (!kvitteringstekst) return;

    function kvitter() {
      if (kopiertEl) kopiertEl.textContent = 'Oppsummeringen er kopiert.';
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(kvitteringstekst).then(kvitter, reservemetode);
    } else {
      reservemetode();
    }

    function reservemetode() {
      var ta = document.createElement('textarea');
      ta.value = kvitteringstekst;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); kvitter(); } catch (e) {
        if (kopiertEl) kopiertEl.textContent = 'Kunne ikke kopiere automatisk — merk teksten manuelt.';
      }
      document.body.removeChild(ta);
    }
  }

  function startPaNytt() {
    form.reset();
    kvitteringstekst = '';
    if (kopiertEl) kopiertEl.textContent = '';
    if (kvittering) kvittering.hidden = true;
    form.hidden = false;
    visSteg(1, true);
  }

  if (nesteKnapp) nesteKnapp.addEventListener('click', gaaVidere);
  if (tilbakeKnapp) tilbakeKnapp.addEventListener('click', function () {
    if (aktivtSteg > 1) visSteg(aktivtSteg - 1, true);
  });
  if (kvitterKnapp) kvitterKnapp.addEventListener('click', lagKvittering);
  if (kopierKnapp) kopierKnapp.addEventListener('click', kopier);
  if (nyKnapp) nyKnapp.addEventListener('click', startPaNytt);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    gaaVidere();
  });

  form.addEventListener('input', function () { visFeil(''); });
  form.addEventListener('change', function () { visFeil(''); });

  visSteg(1, false);
})();
