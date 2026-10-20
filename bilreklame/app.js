/*
  Bilreklame AS — app.js
  Én interaksjon: forespørsel i fire steg med oppsummering og kvittering.
  Alt skjer i nettleseren. Ingenting sendes til en server, og ingenting lagres.
*/
(function () {
  'use strict';

  document.documentElement.classList.add('js');

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
      if (window.innerWidth > 980) lukkMeny();
    });
  }

  /* ---------------- Årstall i footer ---------------- */
  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* Bevegelse skal dempes for dem som ber om det */
  var rolige = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------- Forespørsel ---------------- */
  var skjema = document.getElementById('foresporsel-skjema');
  var kort = document.querySelector('.request__card');
  if (!skjema) return;

  var visninger = Array.prototype.slice.call(skjema.querySelectorAll('.wiz__view'));
  var indikatorer = Array.prototype.slice.call(skjema.querySelectorAll('.wiz__bar li'));
  var nesteKnapp = document.getElementById('neste');
  var tilbakeKnapp = document.getElementById('tilbake');
  var sendKnapp = document.getElementById('send');
  var statusFelt = document.getElementById('wizStatus');
  var oppsummering = document.getElementById('oppsummering');

  var kvittering = document.getElementById('kvittering');
  var kvittRef = document.getElementById('kvittRef');
  var kvittSum = document.getElementById('kvittSum');
  var kvittEpost = document.getElementById('kvittEpost');
  var nyForesporsel = document.getElementById('nyForesporsel');

  var steg = 1;
  var SISTE = 4;
  var sendt = false;

  var NAVN = {
    tjeneste: 'Tjeneste',
    objekt: 'Gjelder',
    oppstart: 'Ønsket oppstart',
    navn: 'Navn',
    bedrift: 'Bedrift',
    epost: 'E-post',
    telefon: 'Telefon',
    melding: 'Omfang'
  };

  function felt(verdi) {
    var el = skjema.elements[verdi];
    return el && el.value !== undefined ? el.value : '';
  }

  function valgtTjeneste() {
    var valgt = skjema.querySelector('input[name="tjeneste"]:checked');
    return valgt ? valgt.value : '';
  }

  function feilEl(nokkel) {
    return skjema.querySelector('[data-err="' + nokkel + '"]');
  }

  function visFeil(nokkel) {
    var el = feilEl(nokkel);
    if (el) el.hidden = false;
  }

  function skjulFeil(nokkel) {
    var el = feilEl(nokkel);
    if (el) el.hidden = true;
  }

  function ryddFeil() {
    Array.prototype.forEach.call(skjema.querySelectorAll('.field__err'), function (el) {
      el.hidden = true;
    });
    Array.prototype.forEach.call(skjema.querySelectorAll('[data-invalid]'), function (el) {
      el.removeAttribute('data-invalid');
    });
  }

  function merkFelt(nokkel, ugyldig) {
    var el;
    if (nokkel === 'tjeneste') {
      el = skjema.querySelector('.opt-grid');
    } else {
      el = skjema.elements[nokkel];
      if (el && el.closest) el = el.closest('.field') || el;
    }
    if (!el || !el.setAttribute) return;
    if (ugyldig) el.setAttribute('data-invalid', 'true');
    else el.removeAttribute('data-invalid');
  }

  function erEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function erTelefon(verdi) {
    var sifre = verdi.replace(/\D/g, '');
    return sifre.length >= 8;
  }

  function sjekkSteg(nummer) {
    ryddFeil();
    var forsteFeil = null;

    if (nummer === 1) {
      if (!valgtTjeneste()) {
        visFeil('tjeneste');
        merkFelt('tjeneste', true);
        forsteFeil = skjema.querySelector('input[name="tjeneste"]');
      }
      if (!felt('objekt')) {
        visFeil('objekt');
        merkFelt('objekt', true);
        if (!forsteFeil) forsteFeil = skjema.elements.objekt;
      }
    }

    if (nummer === 2) {
      if (!felt('oppstart')) {
        visFeil('oppstart');
        merkFelt('oppstart', true);
        forsteFeil = skjema.elements.oppstart;
      }
    }

    if (nummer === 3) {
      if (felt('navn').trim().length < 2) {
        visFeil('navn');
        merkFelt('navn', true);
        forsteFeil = skjema.elements.navn;
      }
      if (!erEpost(felt('epost').trim())) {
        visFeil('epost');
        merkFelt('epost', true);
        if (!forsteFeil) forsteFeil = skjema.elements.epost;
      }
      if (!erTelefon(felt('telefon').trim())) {
        visFeil('telefon');
        merkFelt('telefon', true);
        if (!forsteFeil) forsteFeil = skjema.elements.telefon;
      }
    }

    if (forsteFeil) {
      try {
        forsteFeil.focus({ preventScroll: false });
      } catch (e) {
        forsteFeil.focus();
      }
      if (statusFelt) statusFelt.textContent = 'Sjekk feltene som er merket.';
      return false;
    }
    return true;
  }

  function visSteg(nummer) {
    steg = nummer;
    visninger.forEach(function (v) {
      v.classList.toggle('is-active', Number(v.getAttribute('data-view')) === nummer);
    });
    indikatorer.forEach(function (li) {
      var n = Number(li.getAttribute('data-step'));
      li.classList.toggle('is-current', n === nummer);
      li.classList.toggle('is-done', n < nummer);
      if (n === nummer) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });

    if (tilbakeKnapp) tilbakeKnapp.hidden = nummer === 1;
    if (nesteKnapp) nesteKnapp.hidden = nummer === SISTE;
    if (sendKnapp) sendKnapp.hidden = nummer !== SISTE;

    if (nummer === 4) byggOppsummering(oppsummering);

    if (statusFelt) {
      var etikett = indikatorer[nummer - 1]
        ? indikatorer[nummer - 1].querySelector('.wiz__label').textContent
        : '';
      statusFelt.textContent = 'Steg ' + nummer + ' av ' + SISTE + ': ' + etikett + '.';
    }

    var aktiv = visninger[nummer - 1];
    if (aktiv) {
      var fokus = aktiv.querySelector('input, select, textarea, a, button');
      if (fokus && nummer !== SISTE) {
        try {
          fokus.focus({ preventScroll: true });
        } catch (e) {
          /* eldre nettlesere */
        }
      }
    }
    if (kort && kort.getBoundingClientRect().top < 0) {
      kort.scrollIntoView({ block: 'start', behavior: rolige && rolige.matches ? 'auto' : 'smooth' });
    }
  }

  function lesVerdier() {
    return {
      tjeneste: valgtTjeneste(),
      objekt: felt('objekt'),
      oppstart: felt('oppstart'),
      navn: felt('navn').trim(),
      bedrift: felt('bedrift').trim(),
      epost: felt('epost').trim(),
      telefon: felt('telefon').trim(),
      melding: felt('melding').trim()
    };
  }

  function byggOppsummering(beholder) {
    if (!beholder) return;
    var v = lesVerdier();
    beholder.textContent = '';
    Object.keys(NAVN).forEach(function (nokkel) {
      var verdi = v[nokkel];
      if (!verdi) return;
      var dt = document.createElement('dt');
      dt.textContent = NAVN[nokkel];
      var dd = document.createElement('dd');
      dd.textContent = nokkel === 'navn' && v.bedrift ? verdi + ', ' + v.bedrift : verdi;
      beholder.appendChild(dt);
      beholder.appendChild(dd);
    });
  }

  function lagReferanse() {
    var d = new Date();
    var dato =
      String(d.getFullYear()).slice(2) +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    var tilfeldig = String(Math.floor(Math.random() * 900) + 100);
    return 'BR-' + dato + '-' + tilfeldig;
  }

  function lagEpostlenke(v, ref) {
    var emne = 'Forespørsel ' + ref + ' – ' + v.tjeneste;
    var linjer = [
      'Referanse: ' + ref,
      'Tjeneste: ' + v.tjeneste,
      'Gjelder: ' + v.objekt,
      'Ønsket oppstart: ' + v.oppstart,
      '',
      'Navn: ' + v.navn,
      v.bedrift ? 'Bedrift: ' + v.bedrift : '',
      'E-post: ' + v.epost,
      'Telefon: ' + v.telefon,
      '',
      'Omfang: ' + (v.melding || 'Ikke oppgitt'),
      '',
      'Sendt fra skjemaet på nettsiden.'
    ].filter(function (linje) {
      return linje !== '';
    });
    return (
      'mailto:salg@bilreklame.no?subject=' +
      encodeURIComponent(emne) +
      '&body=' +
      encodeURIComponent(linjer.join('\n'))
    );
  }

  function send() {
    if (sendt) return;
    if (!sjekkSteg(3)) {
      visSteg(3);
      return;
    }
    var v = lesVerdier();
    var ref = lagReferanse();
    sendt = true;

    if (kvittRef) kvittRef.textContent = ref;
    byggOppsummering(kvittSum);
    if (kvittEpost) {
      kvittEpost.href = lagEpostlenke(v, ref);
      kvittEpost.setAttribute('aria-label', 'Send forespørselen ' + ref + ' på e-post til salg@bilreklame.no');
    }

    skjema.hidden = true;
    if (kvittering) {
      kvittering.hidden = false;
      var tittel = kvittering.querySelector('h3');
      if (tittel) {
        tittel.setAttribute('tabindex', '-1');
        tittel.focus({ preventScroll: true });
      }
    }
    if (statusFelt) statusFelt.textContent = 'Forespørsel ' + ref + ' er registrert.';
    if (kort && kort.getBoundingClientRect().top < 0) {
      kort.scrollIntoView({ block: 'start', behavior: rolige && rolige.matches ? 'auto' : 'smooth' });
    }
  }

  function startPaaNytt() {
    sendt = false;
    if (kvittering) kvittering.hidden = true;
    skjema.hidden = false;
    skjema.reset();
    ryddFeil();
    if (statusFelt) statusFelt.textContent = '';
    visSteg(1);
    var forste = skjema.querySelector('input[name="tjeneste"]');
    if (forste) {
      try {
        forste.focus({ preventScroll: true });
      } catch (e) {
        /* eldre nettlesere */
      }
    }
  }

  if (nesteKnapp) {
    nesteKnapp.addEventListener('click', function () {
      if (!sjekkSteg(steg)) return;
      visSteg(Math.min(steg + 1, SISTE));
    });
  }

  if (tilbakeKnapp) {
    tilbakeKnapp.addEventListener('click', function () {
      ryddFeil();
      visSteg(Math.max(steg - 1, 1));
    });
  }

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    if (steg === SISTE) send();
    else if (sjekkSteg(steg)) visSteg(Math.min(steg + 1, SISTE));
  });

  Array.prototype.forEach.call(skjema.querySelectorAll('input, select, textarea'), function (el) {
    el.addEventListener('input', function () {
      var nokkel = el.name;
      skjulFeil(nokkel);
      merkFelt(nokkel, false);
    });
    el.addEventListener('change', function () {
      var nokkel = el.name;
      skjulFeil(nokkel);
      merkFelt(nokkel, false);
    });
  });

  if (nyForesporsel) nyForesporsel.addEventListener('click', startPaaNytt);

  visSteg(1);
})();
