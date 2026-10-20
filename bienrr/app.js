/*
  Bien RR AS — app.js
  Mobilmeny, årstall, rolig innlasting og én interaksjon: forespørsel i fire
  steg med oppsummering, kvittering og ferdig utfylt e-post.
  Alt skjer i nettleseren. Ingenting sendes til en server, og ingenting lagres.
*/
(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */

  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');

  function lukkMeny() {
    if (!meny || !menyKnapp) return;
    meny.classList.remove('is-open');
    menyKnapp.setAttribute('aria-expanded', 'false');
    menyKnapp.setAttribute('aria-label', 'Åpne meny');
  }

  if (menyKnapp && meny) {
    menyKnapp.addEventListener('click', function () {
      var open = meny.classList.toggle('is-open');
      menyKnapp.setAttribute('aria-expanded', open ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') lukkMeny();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) lukkMeny();
    });
  }

  /* ---------------- Årstall i bunnen ---------------- */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Rolig innlasting ----------------
     Innholdet er synlig uten JavaScript (se base.css). Animasjonen legges bare
     på når vi vet at IntersectionObserver finnes. */

  (function () {
    var elementer = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!elementer.length) return;

    function visAlt() {
      elementer.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }

    if (!('IntersectionObserver' in window)) {
      visAlt();
      return;
    }

    try {
      var observator = new IntersectionObserver(function (oppforinger) {
        oppforinger.forEach(function (oppforing) {
          if (!oppforing.isIntersecting) return;
          oppforing.target.classList.add('is-visible');
          observator.unobserve(oppforing.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

      elementer.forEach(function (el) {
        observator.observe(el);
      });
    } catch (error) {
      visAlt();
    }
  })();

  /* ---------------- Forespørsel ----------------
     Steg 1: tjeneste. Steg 2: virksomheten. Steg 3: kontakt.
     Steg 4: se over. Deretter kvittering med referanse og e-postlenke. */

  var skjema = document.getElementById('foresporsel-skjema');
  var kort = document.getElementById('foresporsel-kort');
  var kvittering = document.getElementById('kvittering');

  if (!skjema || !kort || !kvittering) return;

  var visninger = Array.prototype.slice.call(kort.querySelectorAll('.stegvisning'));
  var visere = Array.prototype.slice.call(kort.querySelectorAll('.stegviser li'));
  var oppsummering = document.getElementById('oppsummering');
  var kvListe = document.getElementById('kv-liste');
  var kvNavn = document.getElementById('kv-navn');
  var kvRef = document.getElementById('kv-ref');
  var kvSend = document.getElementById('kv-send');
  var kvEndre = document.getElementById('kv-endre');
  var SISTE = 4;
  var steg = 1;
  var referanse = '';

  var PAAKREVD = {
    2: ['selskapsform', 'system'],
    3: ['navn', 'epost', 'telefon']
  };

  function redusertBevegelse() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function verdi(navn) {
    var el = skjema.elements[navn];
    if (!el) return '';
    return (el.value || '').trim();
  }

  function feilFor(navn) {
    var v = verdi(navn);

    if (navn === 'tjeneste') return v ? '' : 'Velg hva forespørselen gjelder.';
    if (navn === 'selskapsform') return v ? '' : 'Velg selskapsform.';
    if (navn === 'system') return v ? '' : 'Velg hvordan regnskapet føres i dag.';
    if (navn === 'navn') return v.length >= 2 ? '' : 'Fyll inn navnet ditt.';

    if (navn === 'epost') {
      if (!v) return 'Fyll inn e-postadressen din.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
        ? ''
        : 'Skriv en gyldig e-postadresse, f.eks. navn@firma.no.';
    }

    if (navn === 'telefon') {
      if (!v) return 'Fyll inn et telefonnummer vi kan nå deg på.';
      var siffer = v.replace(/[^0-9]/g, '');
      return siffer.length >= 8 ? '' : 'Telefonnummeret må ha minst åtte siffer.';
    }

    return '';
  }

  function merk(navn, melding) {
    if (navn === 'tjeneste') {
      var gruppe = document.getElementById('valg-tjeneste');
      var gruppeFeil = document.getElementById('feil-tjeneste');
      if (gruppe) {
        if (melding) gruppe.setAttribute('data-invalid', 'true');
        else gruppe.removeAttribute('data-invalid');
      }
      if (gruppeFeil) gruppeFeil.textContent = melding;
      return;
    }

    var el = skjema.elements[navn];
    if (!el) return;
    var ramme = el.closest('.felt');
    if (!ramme) return;
    var feil = ramme.querySelector('.felt__feil');

    if (melding) {
      ramme.setAttribute('data-invalid', 'true');
      el.setAttribute('aria-invalid', 'true');
      if (feil) feil.textContent = melding;
    } else {
      ramme.removeAttribute('data-invalid');
      el.removeAttribute('aria-invalid');
      if (feil) feil.textContent = '';
    }
  }

  function synkValg() {
    var valg = skjema.querySelectorAll('#valg-tjeneste input');
    Array.prototype.forEach.call(valg, function (input) {
      var boks = input.closest('.valg__kort');
      if (boks) boks.classList.toggle('is-valgt', input.checked);
    });
  }

  function ryddFeil(navn) {
    if (navn) merk(navn, feilFor(navn));
  }

  function sjekkSteg(nummer) {
    var ok = true;
    var forsteFeil = null;

    if (nummer === 1) {
      var melding = feilFor('tjeneste');
      merk('tjeneste', melding);
      if (melding) {
        ok = false;
        forsteFeil = skjema.querySelector('#valg-tjeneste input');
      }
    }

    (PAAKREVD[nummer] || []).forEach(function (navn) {
      var feil = feilFor(navn);
      merk(navn, feil);
      if (feil) {
        ok = false;
        if (!forsteFeil) forsteFeil = skjema.elements[navn];
      }
    });

    if (forsteFeil && forsteFeil.focus) forsteFeil.focus();
    return ok;
  }

  function byggRader() {
    var rader = [
      ['Tjeneste', verdi('tjeneste')],
      ['Selskapsform', verdi('selskapsform')],
      ['Regnskap i dag', verdi('system')],
      ['Navn', verdi('navn')],
      ['E-post', verdi('epost')],
      ['Telefon', verdi('telefon')]
    ];
    if (verdi('melding')) rader.push(['Om saken', verdi('melding')]);
    return rader;
  }

  function fyllListe(liste) {
    if (!liste) return;
    liste.textContent = '';
    byggRader().forEach(function (rad) {
      var radEl = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      radEl.appendChild(dt);
      radEl.appendChild(dd);
      liste.appendChild(radEl);
    });
  }

  function vis(nummer, flytt) {
    steg = nummer;

    visninger.forEach(function (visning) {
      visning.hidden = Number(visning.getAttribute('data-view')) !== nummer;
    });

    visere.forEach(function (li, i) {
      var n = i + 1;
      li.classList.toggle('is-current', n === nummer);
      li.classList.toggle('is-done', n < nummer);
      if (n === nummer) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });

    if (nummer === SISTE) fyllListe(oppsummering);

    if (flytt === false) return;

    var legend = kort.querySelector('.stegvisning:not([hidden]) legend');
    if (legend) {
      legend.setAttribute('tabindex', '-1');
      legend.focus({ preventScroll: true });
    }

    kort.scrollIntoView({
      block: 'nearest',
      behavior: redusertBevegelse() ? 'auto' : 'smooth'
    });
  }

  function lagReferanse() {
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var kode = '';
    for (var i = 0; i < 4; i++) {
      kode += tegn.charAt(Math.floor(Math.random() * tegn.length));
    }
    return 'RR-' + new Date().getFullYear() + '-' + kode;
  }

  function lagEpost() {
    var emne = 'Forespørsel fra nettsiden: ' + verdi('tjeneste');
    var linjer = [
      'Hei!',
      '',
      'Jeg sender en forespørsel via nettsiden deres.',
      ''
    ];

    byggRader().forEach(function (rad) {
      linjer.push(rad[0] + ': ' + rad[1]);
    });

    linjer.push('', 'Referanse: ' + referanse, '', 'Hilsen ' + verdi('navn'));

    return 'mailto:post@bienrr.no'
      + '?subject=' + encodeURIComponent(emne)
      + '&body=' + encodeURIComponent(linjer.join('\n'));
  }

  kort.addEventListener('click', function (event) {
    var knapp = event.target.closest('[data-neste], [data-tilbake]');
    if (!knapp) return;

    var tilbake = knapp.getAttribute('data-tilbake');
    if (tilbake) {
      vis(Number(tilbake));
      return;
    }

    var neste = Number(knapp.getAttribute('data-neste'));
    if (neste > steg && !sjekkSteg(steg)) return;
    if (neste > 0) vis(neste);
  });

  skjema.addEventListener('input', function (event) {
    var el = event.target;
    if (!el.name) return;
    if (el.type === 'radio') synkValg();
    ryddFeil(el.name);
  });

  skjema.addEventListener('change', function (event) {
    var el = event.target;
    if (!el.name) return;
    if (el.type === 'radio') synkValg();
    ryddFeil(el.name);
  });

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();

    // Enter i et tidligere steg skal gå videre, ikke registrere.
    if (steg !== SISTE) {
      if (sjekkSteg(steg)) vis(Math.min(steg + 1, SISTE));
      return;
    }

    for (var n = 1; n < SISTE; n++) {
      if (!sjekkSteg(n)) {
        vis(n);
        return;
      }
    }

    referanse = lagReferanse();
    var fornavn = verdi('navn').split(/\s+/)[0];

    if (kvNavn) kvNavn.textContent = fornavn || 'du';
    if (kvRef) kvRef.textContent = referanse;
    if (kvSend) kvSend.setAttribute('href', lagEpost());
    fyllListe(kvListe);

    skjema.hidden = true;
    kvittering.hidden = false;

    var overskrift = kvittering.querySelector('h3');
    if (overskrift) overskrift.focus({ preventScroll: true });

    kvittering.scrollIntoView({
      block: 'nearest',
      behavior: redusertBevegelse() ? 'auto' : 'smooth'
    });
  });

  if (kvEndre) {
    kvEndre.addEventListener('click', function () {
      kvittering.hidden = true;
      skjema.hidden = false;
      vis(3);
    });
  }

  synkValg();
  vis(1, false);
})();
