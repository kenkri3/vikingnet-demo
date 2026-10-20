/*
  Teleplan — demo. Ingen avhengigheter, ingen backend, ingen lagring.
  Skjemaet lager en kvittering i nettleseren og åpner e-postklienten med
  mottaker, emne og tekst ferdig utfylt. Ingenting sendes fra siden.
*/

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  function settMeny(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      settMeny(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') settMeny(false);
    });
  }

  /* ---------- Rolig innkomst ---------- */

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveal = document.querySelectorAll('.reveal');

  if (reveal.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      reveal.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      reveal.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Henvendelse ---------- */

  var skjema = document.getElementById('henvendelse-skjema');
  if (!skjema) return;

  var TEMA = {
    holding: {
      mottaker: 'Teleplan Holding',
      epost: 'contact-tph@teleplan.no',
      navn: 'Eierskap og konsern'
    },
    eiendom: {
      mottaker: 'Teleplan Eiendom',
      epost: 'contact-tpe@teleplan.no',
      navn: 'Eiendom og lokaler'
    },
    teleplanbyen: {
      mottaker: 'Teleplan Eiendom',
      epost: 'contact-tpe@teleplan.no',
      navn: 'Teleplanbyen og Nettas Hus'
    },
    annet: {
      mottaker: 'Teleplan Holding',
      epost: 'contact-tph@teleplan.no',
      navn: 'Annet'
    }
  };

  var paneler = skjema.querySelectorAll('[data-steg-panel]');
  var steg = document.querySelectorAll('[data-steg]');
  var nesteKnapp = skjema.querySelector('[data-neste]');
  var tilbakeKnapp = skjema.querySelector('[data-tilbake]');
  var feil1 = document.getElementById('feil-steg1');
  var feil2 = document.getElementById('feil-steg2');
  var mottakerLinje = skjema.querySelector('[data-mottaker]');
  var navnFelt = document.getElementById('navn');
  var epostFelt = document.getElementById('epost');
  var meldingFelt = document.getElementById('melding');
  var kvittTittel = skjema.querySelector('[data-kvitt-tittel]');
  var kvittRef = skjema.querySelector('[data-kvitt-ref]');
  var kvittMottaker = skjema.querySelector('[data-kvitt-mottaker]');
  var kvittTema = skjema.querySelector('[data-kvitt-tema]');
  var kvittFra = skjema.querySelector('[data-kvitt-fra]');
  var kvittMelding = skjema.querySelector('[data-kvitt-melding]');
  var kvittEpost = skjema.querySelector('[data-kvitt-epost]');
  var kvittStatus = skjema.querySelector('[data-kvitt-status]');
  var kopierKnapp = skjema.querySelector('[data-kopier]');
  var nyKnapp = skjema.querySelector('[data-ny]');
  var siste = null;

  function valgtTema() {
    var valgt = skjema.querySelector('input[name="tema"]:checked');
    return valgt ? { noekkel: valgt.value, data: TEMA[valgt.value] } : null;
  }

  function visSteg(nummer) {
    paneler.forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-steg-panel') !== String(nummer);
    });
    steg.forEach(function (punkt) {
      punkt.setAttribute('data-aktiv', punkt.getAttribute('data-steg') === String(nummer) ? 'true' : 'false');
    });
    if (feil1) feil1.hidden = true;
    if (feil2) feil2.hidden = true;
  }

  function visFeil(element, melding) {
    if (!element) return;
    element.textContent = melding;
    element.hidden = false;
  }

  function lagReferanse() {
    var alfabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    var tegn = '';
    var buffer = new Uint8Array(4);

    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(buffer);
    } else {
      for (var i = 0; i < buffer.length; i++) buffer[i] = Math.floor(Math.random() * 256);
    }

    for (var j = 0; j < buffer.length; j++) {
      tegn += alfabet.charAt(buffer[j] % alfabet.length);
    }

    return 'TP-' + new Date().getFullYear() + '-' + tegn;
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(verdi);
  }

  function sammendrag(data) {
    return [
      'Saksnummer: ' + data.referanse,
      'Mottaker: ' + data.mottaker + ' (' + data.epost + ')',
      'Tema: ' + data.tema,
      'Navn: ' + data.navn,
      'E-post: ' + data.svarTil,
      '',
      data.melding
    ].join('\n');
  }

  if (nesteKnapp) {
    nesteKnapp.addEventListener('click', function () {
      var valgt = valgtTema();
      if (!valgt) {
        visFeil(feil1, 'Velg hva henvendelsen gjelder før du går videre.');
        return;
      }
      mottakerLinje.textContent = 'Sendes til: ' + valgt.data.mottaker + ' — ' + valgt.data.epost;
      visSteg(2);
      if (navnFelt) navnFelt.focus();
    });
  }

  if (tilbakeKnapp) {
    tilbakeKnapp.addEventListener('click', function () {
      visSteg(1);
    });
  }

  skjema.querySelectorAll('input[name="tema"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (feil1) feil1.hidden = true;
    });
  });

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();

    var valgt = valgtTema();
    if (!valgt) {
      visSteg(1);
      visFeil(feil1, 'Velg hva henvendelsen gjelder før du går videre.');
      return;
    }

    var navn = (navnFelt.value || '').trim();
    var epost = (epostFelt.value || '').trim();
    var melding = (meldingFelt.value || '').trim();

    navnFelt.removeAttribute('aria-invalid');
    epostFelt.removeAttribute('aria-invalid');
    meldingFelt.removeAttribute('aria-invalid');

    if (navn.length < 2) {
      navnFelt.setAttribute('aria-invalid', 'true');
      visFeil(feil2, 'Skriv inn navnet ditt.');
      navnFelt.focus();
      return;
    }

    if (!gyldigEpost(epost)) {
      epostFelt.setAttribute('aria-invalid', 'true');
      visFeil(feil2, 'Skriv inn en gyldig e-postadresse, slik at vi kan svare.');
      epostFelt.focus();
      return;
    }

    if (melding.length < 10) {
      meldingFelt.setAttribute('aria-invalid', 'true');
      visFeil(feil2, 'Skriv noen ord om saken — minst ti tegn.');
      meldingFelt.focus();
      return;
    }

    var referanse = lagReferanse();
    var emne = 'Henvendelse ' + referanse + ' — ' + valgt.data.navn;
    var kropp = sammendrag({
      referanse: referanse,
      mottaker: valgt.data.mottaker,
      epost: valgt.data.epost,
      tema: valgt.data.navn,
      navn: navn,
      svarTil: epost,
      melding: melding
    });

    siste = {
      referanse: referanse,
      mottaker: valgt.data.mottaker,
      epost: valgt.data.epost,
      tema: valgt.data.navn,
      navn: navn,
      svarTil: epost,
      melding: melding,
      emne: emne,
      kropp: kropp
    };

    kvittRef.textContent = referanse;
    kvittMottaker.textContent = valgt.data.mottaker + ' — ' + valgt.data.epost;
    kvittTema.textContent = valgt.data.navn;
    kvittFra.textContent = navn + ' — ' + epost;
    kvittMelding.textContent = melding;
    kvittEpost.setAttribute(
      'href',
      'mailto:' + valgt.data.epost +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(kropp)
    );
    if (kvittStatus) kvittStatus.textContent = '';

    visSteg(3);
    if (kvittTittel) kvittTittel.focus();
  });

  if (kopierKnapp) {
    kopierKnapp.addEventListener('click', function () {
      if (!siste) return;

      var tekst = sammendrag(siste);

      function meld(melding) {
        if (kvittStatus) kvittStatus.textContent = melding;
      }

      function fallback() {
        var hjelp = document.createElement('textarea');
        hjelp.value = tekst;
        hjelp.setAttribute('readonly', 'readonly');
        hjelp.style.position = 'fixed';
        hjelp.style.top = '-1000px';
        document.body.appendChild(hjelp);
        hjelp.select();
        var ok = false;
        try {
          ok = document.execCommand('copy');
        } catch (error) {
          ok = false;
        }
        document.body.removeChild(hjelp);
        meld(ok ? 'Sammendraget er kopiert.' : 'Kopiering er ikke tillatt i denne nettleseren. Merk teksten og kopier manuelt.');
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () {
          meld('Sammendraget er kopiert.');
        }, fallback);
      } else {
        fallback();
      }
    });
  }

  if (nyKnapp) {
    nyKnapp.addEventListener('click', function () {
      skjema.reset();
      siste = null;
      navnFelt.removeAttribute('aria-invalid');
      epostFelt.removeAttribute('aria-invalid');
      meldingFelt.removeAttribute('aria-invalid');
      if (kvittStatus) kvittStatus.textContent = '';
      visSteg(1);
      var forste = skjema.querySelector('input[name="tema"]');
      if (forste) forste.focus();
    });
  }

  /* Snarveier fra selskapsradene: velg tema og bli med ned til skjemaet. */
  document.querySelectorAll('[data-tema]').forEach(function (lenke) {
    lenke.addEventListener('click', function () {
      var noekkel = lenke.getAttribute('data-tema');
      var radio = skjema.querySelector('input[name="tema"][value="' + noekkel + '"]');
      if (radio) radio.checked = true;
      visSteg(1);
      if (feil1) feil1.hidden = true;
    });
  });
})();
