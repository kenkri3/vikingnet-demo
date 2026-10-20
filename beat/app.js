/*
  Beat Technology AS — demo, alt regnes i nettleseren.
  Ingenting sendes til noen server; skjemaet åpner bare et e-postutkast.
*/
(function () {
  'use strict';

  var d = document;
  d.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var toggle = d.querySelector('.nav-toggle');
  var meny = d.getElementById('hovedmeny');

  if (toggle && meny) {
    toggle.addEventListener('click', function () {
      var aapen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!aapen));
      meny.hidden = aapen;
    });

    meny.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.matchMedia('(max-width: 900px)').matches) {
        meny.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Bevisst ingen scroll-avsløring her: innholdet skal være synlig også når
     siden skrives ut, fotograferes i full høyde eller JavaScript svikter. */

  /* ---------- Priskalkulator ----------
     Satsene er Beats egne, fra pristabellen på beat.no/solutions:
       Shelf: 0 USD oppstart, 0 USD årlig minimum, 0,30 USD per kjøp
       Pulse: 12 500 USD oppstart, 8 % av omsetning, årlig minimum 44 000 USD
     For Pulse viser vi den høyeste av 8 % av omsetningen og minimumet. */

  var SATS = {
    kjopPerStk: 0.3,
    pulseStart: 12500,
    pulseMinimum: 44000,
    pulseProsent: 0.08
  };

  var kalk = d.getElementById('kalkulator');
  var feltKjop = d.getElementById('kjop');
  var feltOmsetning = d.getElementById('omsetning');
  var feltAar = d.getElementById('aar');

  var AARORD = ['Ett år', 'To år', 'Tre år', 'Fire år', 'Fem år'];

  var tall = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 });
  var siste = null;

  function usd(verdi) {
    return 'USD ' + tall.format(Math.round(verdi));
  }

  function lesTall(el) {
    if (!el) return 0;
    var v = parseFloat(String(el.value).replace(/\s/g, '').replace(',', '.'));
    return isFinite(v) && v > 0 ? v : 0;
  }

  function regn() {
    if (!kalk || !feltKjop || !feltOmsetning) return;

    var kjop = lesTall(feltKjop);
    var omsetning = lesTall(feltOmsetning);
    var aar = feltAar ? parseInt(feltAar.value, 10) : 3;
    if (!isFinite(aar) || aar < 1) aar = 3;
    if (aar > 5) aar = 5;

    var shelfAar = kjop * SATS.kjopPerStk;
    var pulseBruk = Math.max(omsetning * SATS.pulseProsent, SATS.pulseMinimum);
    var pulseAar1 = SATS.pulseStart + pulseBruk;
    var shelfTre = shelfAar * aar;
    var pulseTre = pulseAar1 + pulseBruk * (aar - 1);

    var skriv = function (id, tekst) {
      var el = d.getElementById(id);
      if (el) el.textContent = tekst;
    };

    skriv('shelf-horisont', AARORD[aar - 1]);
    skriv('pulse-horisont', AARORD[aar - 1]);

    skriv('shelf-aar', usd(shelfAar));
    skriv('shelf-tre', usd(shelfTre));
    skriv('shelf-bruk', usd(shelfAar));
    skriv('pulse-prosent', usd(omsetning * SATS.pulseProsent));
    skriv('pulse-bruk', usd(pulseBruk));
    skriv('pulse-aar', usd(pulseAar1));
    skriv('pulse-tre', usd(pulseTre));

    var merkeShelf = d.getElementById('shelf-merke');
    var merkePulse = d.getElementById('pulse-merke');
    var dom = d.getElementById('anbefaling');

    if (kjop === 0 && omsetning === 0) {
      if (merkeShelf) merkeShelf.hidden = true;
      if (merkePulse) merkePulse.hidden = true;
      if (dom) dom.textContent = 'Fyll inn kjøp og omsetning for å sammenligne de to modellene.';
      siste = null;
      return;
    }

    var shelfBilligst = shelfTre <= pulseTre;
    if (merkeShelf) merkeShelf.hidden = !shelfBilligst;
    if (merkePulse) merkePulse.hidden = shelfBilligst;

    if (dom) {
      dom.textContent = 'Over ' + AARORD[aar - 1].toLowerCase() + ' koster Shelf ' + usd(shelfTre) +
        ' og Pulse ' + usd(pulseTre) + '. ' +
        (shelfBilligst ? 'Shelf' : 'Pulse') + ' er lavest med disse tallene.';
    }

    siste = {
      kjop: kjop,
      omsetning: omsetning,
      aar: aar,
      shelfTre: shelfTre,
      pulseTre: pulseTre,
      billigst: shelfBilligst ? 'Shelf' : 'Pulse'
    };
  }

  if (kalk) {
    ['input', 'change'].forEach(function (type) {
      if (feltKjop) feltKjop.addEventListener(type, regn);
      if (feltOmsetning) feltOmsetning.addEventListener(type, regn);
      if (feltAar) feltAar.addEventListener(type, regn);
    });
    regn();
  }

  /* ---------- Ta tallene med til skjemaet ---------- */

  var brukTall = d.getElementById('bruk-tall');
  var melding = d.getElementById('melding');
  var kontakt = d.getElementById('kontakt');

  if (brukTall && melding) {
    brukTall.addEventListener('click', function () {
      if (siste) {
        melding.value = 'Hei! Vi har regnet på ' + tall.format(siste.kjop) + ' kjøp og ' +
          usd(siste.omsetning) + ' i omsetning per år. ' +
          'Kalkulatoren gir Shelf ' + usd(siste.shelfTre) + ' og Pulse ' +
          usd(siste.pulseTre) + ' over ' + AARORD[siste.aar - 1].toLowerCase() + '. ' +
          'Kan dere bekrefte tallene og sende et tilbud?';
      } else {
        melding.value = 'Hei! Vi vil gjerne høre hva Shelf og Pulse koster for oss.';
      }
      if (kontakt) kontakt.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(function () { melding.focus(); }, 250);
    });
  }

  /* ---------- Skjema: e-postutkast, ingen innsending ---------- */

  var skjema = d.getElementById('henvendelse');
  var kvittering = d.getElementById('kvittering');

  if (skjema) {
    skjema.addEventListener('submit', function (e) {
      e.preventDefault();

      var navn = (d.getElementById('navn') || {}).value || '';
      var epost = (d.getElementById('epost') || {}).value || '';
      var tekst = (melding || {}).value || '';

      var emne = 'Henvendelse fra beat.no' + (navn.trim() ? ' – ' + navn.trim() : '');
      var kropp = tekst.trim() + '\n\n' + navn.trim() + (epost.trim() ? '\n' + epost.trim() : '');

      window.location.href = 'mailto:njaha@beat.no?subject=' +
        encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);

      if (kvittering) {
        kvittering.hidden = false;
        kvittering.textContent = 'E-postutkastet er åpnet i e-postprogrammet ditt. ' +
          'Ingenting er sendt fra denne siden.';
      }
    });
  }
})();
