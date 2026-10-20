/* Aurora Offshore — demoens ene interaksjon:
   1) filtrering av flåteoversikten, 2) forespørsel i tre steg med kvittering.
   Alt skjer i nettleseren. Ingenting sendes, ingenting lagres. */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var redusertBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var apne = nav.hasAttribute('hidden');
      if (apne) nav.removeAttribute('hidden');
      else nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(apne));
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && window.innerWidth <= 900) {
        nav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Rolig innkomst ---------- */

  var reveal = document.querySelectorAll('.reveal');
  if (redusertBevegelse || !('IntersectionObserver' in window)) {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    reveal.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Flåteoversikten: filter ---------- */

  var rader = Array.prototype.slice.call(document.querySelectorAll('[data-flate] .flate__rad'));
  var typeKnapper = Array.prototype.slice.call(document.querySelectorAll('[data-type]'));
  var landVelger = document.querySelector('[data-filter-land]');
  var teller = document.querySelector('[data-teller]');
  var tomt = document.querySelector('[data-tomt]');

  function filtrer() {
    var type = 'alle';
    typeKnapper.forEach(function (knapp) {
      if (knapp.getAttribute('aria-pressed') === 'true') type = knapp.getAttribute('data-type');
    });
    var land = landVelger ? landVelger.value : 'alle';
    var synlige = 0;

    rader.forEach(function (rad) {
      var passerType = type === 'alle' || rad.getAttribute('data-type') === type;
      var passerLand = land === 'alle' || rad.getAttribute('data-land') === land;
      var vis = passerType && passerLand;
      rad.hidden = !vis;
      if (vis) synlige += 1;
    });

    if (teller) {
      teller.textContent = 'Viser ' + synlige + ' av ' + rader.length + ' fartøy';
    }
    if (tomt) tomt.hidden = synlige !== 0;
  }

  typeKnapper.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      typeKnapper.forEach(function (annen) {
        annen.setAttribute('aria-pressed', String(annen === knapp));
      });
      filtrer();
    });
  });

  if (landVelger) landVelger.addEventListener('change', filtrer);

  /* ---------- Forespørsel i tre steg ---------- */

  var skjema = document.querySelector('[data-foresporsel]');
  if (skjema) {
    var paneler = Array.prototype.slice.call(skjema.querySelectorAll('.steg-panel'));
    var stegMerker = Array.prototype.slice.call(document.querySelectorAll('.steg li'));
    var fartoyFelt = skjema.querySelector('#fartoy');
    var oppstartFelt = skjema.querySelector('#oppstart');
    var varighetFelt = skjema.querySelector('#varighet');
    var omradeFelt = skjema.querySelector('#omrade');
    var navnFelt = skjema.querySelector('#navn');
    var selskapFelt = skjema.querySelector('#selskap');
    var epostFelt = skjema.querySelector('#epost');
    var telefonFelt = skjema.querySelector('#telefon');
    var meldingFelt = skjema.querySelector('#melding');
    var refFelt = skjema.querySelector('[data-ref]');
    var epostKnapp = skjema.querySelector('[data-send-epost]');
    var aktivtSteg = 1;

    function feilmelding(steg, tekst) {
      var el = skjema.querySelector('[data-feil="' + steg + '"]');
      if (el) el.textContent = tekst || '';
    }

    function visSteg(steg) {
      aktivtSteg = steg;
      paneler.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-panel') !== String(steg);
      });
      stegMerker.forEach(function (merke) {
        if (merke.getAttribute('data-steg') === String(steg)) merke.setAttribute('aria-current', 'step');
        else merke.removeAttribute('aria-current');
      });
      var felt = skjema.querySelector('.steg-panel[data-panel="' + steg + '"] input, .steg-panel[data-panel="' + steg + '"] select');
      if (felt) felt.focus({ preventScroll: true });
    }

    function datoTekst(verdi) {
      if (!verdi) return '';
      var d = new Date(verdi + 'T12:00:00');
      if (isNaN(d.getTime())) return verdi;
      return new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    }

    function gyldigEpost(verdi) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
    }

    function validerSteg(steg) {
      feilmelding(steg, '');
      if (steg === 1) {
        if (!oppstartFelt.value) {
          feilmelding(1, 'Velg ønsket oppstart.');
          oppstartFelt.focus();
          return false;
        }
        return true;
      }
      if (steg === 2) {
        if (navnFelt.value.trim().length < 2) {
          feilmelding(2, 'Fyll inn navnet ditt.');
          navnFelt.focus();
          return false;
        }
        if (!gyldigEpost(epostFelt.value.trim())) {
          feilmelding(2, 'Fyll inn en gyldig e-postadresse.');
          epostFelt.focus();
          return false;
        }
        return true;
      }
      return true;
    }

    function lagReferanse() {
      var ar = new Date().getFullYear();
      var nr = Math.floor(1000 + Math.random() * 9000);
      return 'AO-' + ar + '-' + nr;
    }

    function fyllKvittering() {
      var kontakt = [navnFelt.value.trim(), selskapFelt.value.trim(), epostFelt.value.trim(), telefonFelt.value.trim()]
        .filter(function (del) { return del !== ''; })
        .join(' · ');

      var verdier = {
        fartoy: fartoyFelt.value || 'Ikke bestemt ennå',
        oppstart: datoTekst(oppstartFelt.value),
        varighet: varighetFelt.value,
        omrade: omradeFelt.value.trim() || 'Ikke oppgitt',
        kontakt: kontakt || 'Ikke oppgitt',
        melding: meldingFelt.value.trim() || 'Ingen melding'
      };

      Object.keys(verdier).forEach(function (nokkel) {
        var el = skjema.querySelector('[data-ut="' + nokkel + '"]');
        if (el) el.textContent = verdier[nokkel];
      });

      var ref = lagReferanse();
      if (refFelt) refFelt.textContent = ref;

      if (epostKnapp) {
        var emne = 'Charterforespørsel ' + ref + ' — ' + verdier.fartoy;
        var linjer = [
          'Charterforespørsel ' + ref,
          '',
          'Fartøy: ' + verdier.fartoy,
          'Ønsket oppstart: ' + verdier.oppstart,
          'Varighet: ' + verdier.varighet,
          'Område/oppdrag: ' + verdier.omrade,
          '',
          'Kontakt: ' + verdier.kontakt,
          '',
          'Melding:',
          verdier.melding,
          '',
          'Sendt fra auroraoffshore-demoen.'
        ];
        epostKnapp.href = 'mailto:chartering@auroraoffshore.com' +
          '?subject=' + encodeURIComponent(emne) +
          '&body=' + encodeURIComponent(linjer.join('\n'));
      }
    }

    skjema.querySelectorAll('[data-neste]').forEach(function (knapp) {
      knapp.addEventListener('click', function () {
        var til = Number(knapp.getAttribute('data-neste'));
        if (validerSteg(aktivtSteg)) visSteg(til);
      });
    });

    skjema.querySelectorAll('[data-tilbake]').forEach(function (knapp) {
      knapp.addEventListener('click', function () {
        visSteg(Number(knapp.getAttribute('data-tilbake')));
      });
    });

    var nullstill = skjema.querySelector('[data-nullstill]');
    if (nullstill) {
      nullstill.addEventListener('click', function () {
        skjema.reset();
        feilmelding(1, '');
        feilmelding(2, '');
        visSteg(1);
      });
    }

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validerSteg(2)) return;
      fyllKvittering();
      visSteg(3);
      var ref = skjema.querySelector('[data-ref]');
      if (ref) ref.focus({ preventScroll: true });
    });

    /* Fra flåteoversikten: velg fartøy og hopp til skjemaet */
    document.querySelectorAll('[data-velg]').forEach(function (knapp) {
      knapp.addEventListener('click', function () {
        if (fartoyFelt) fartoyFelt.value = knapp.getAttribute('data-velg');
        visSteg(1);
        feilmelding(1, '');
        var mal = document.getElementById('kontakt');
        if (mal) {
          mal.scrollIntoView({ behavior: redusertBevegelse ? 'auto' : 'smooth', block: 'start' });
        }
        var merke = skjema.querySelector('[data-ref]');
        if (merke) merke.textContent = 'AO-0000-0000';
      });
    });
  }

  /* ---------- Årstall i footer ---------- */

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
