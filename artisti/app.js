/*
  Artisti — app.js
  To ting: menyen på små skjermer og to skjemaer som bare lever i nettleseren.
  Ingenting sendes til en server; kvitteringen åpner et e-postutkast i
  brukerens egen e-postklient.
*/
(function () {
  'use strict';

  var MOTTAKER = 'profil@artisti.no';

  /* ---------- Meny ------------------------------------------------------ */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('nav');
  var bred = window.matchMedia('(min-width: 901px)');

  function settMeny(apen) {
    if (!nav || !toggle) return;
    nav.hidden = !apen;
    toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
  }

  function synkMeny() {
    if (!nav || !toggle) return;
    if (bred.matches) {
      nav.hidden = false;
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      nav.hidden = true;
    }
  }

  if (toggle && nav) {
    synkMeny();
    toggle.addEventListener('click', function () {
      settMeny(nav.hidden);
    });
    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A' && !bred.matches) settMeny(false);
    });
    if (bred.addEventListener) bred.addEventListener('change', synkMeny);
    else if (bred.addListener) bred.addListener(synkMeny);
  }

  /* ---------- Profilpakken ---------------------------------------------- */

  var brukKnapper = Array.prototype.slice.call(document.querySelectorAll('[data-bruk]'));
  var behovKnapper = Array.prototype.slice.call(document.querySelectorAll('[data-behov]'));
  var sammendragBruk = document.getElementById('sammendragBruk');
  var sammendragBehov = document.getElementById('sammendragBehov');
  var teller = document.getElementById('pakkeTeller');
  var lagKnapp = document.getElementById('lagForesporsel');
  var kvittering = document.getElementById('kvittering');
  var kvitteringNr = document.getElementById('kvitteringNr');
  var kvitteringEpost = document.getElementById('kvitteringEpost');
  var kvitteringEndre = document.getElementById('kvitteringEndre');

  var valgtBruk = '';
  var valgteBehov = [];

  function valgteBehovsnavn() {
    return behovKnapper
      .filter(function (knapp) {
        return knapp.getAttribute('aria-pressed') === 'true';
      })
      .map(function (knapp) {
        return knapp.getAttribute('data-behov');
      });
  }

  function oppdater() {
    if (!sammendragBruk) return;
    valgteBehov = valgteBehovsnavn();

    sammendragBruk.textContent = valgtBruk || 'Ikke valgt';
    sammendragBehov.textContent = valgteBehov.length ? valgteBehov.join(', ') : 'Ingen valgt';
    teller.textContent = valgteBehov.length + ' av ' + behovKnapper.length + ' behov valgt';
    lagKnapp.disabled = valgtBruk === '' && valgteBehov.length === 0;
  }

  brukKnapper.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var varValgt = knapp.getAttribute('aria-pressed') === 'true';
      brukKnapper.forEach(function (annen) {
        annen.setAttribute('aria-pressed', 'false');
      });
      if (varValgt) {
        valgtBruk = '';
      } else {
        knapp.setAttribute('aria-pressed', 'true');
        valgtBruk = knapp.getAttribute('data-bruk');
      }
      oppdater();
    });
  });

  behovKnapper.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var apen = knapp.getAttribute('aria-pressed') === 'true';
      knapp.setAttribute('aria-pressed', apen ? 'false' : 'true');
      oppdater();
    });
  });

  function referanse() {
    var aar = new Date().getFullYear();
    var nr = Math.floor(1000 + Math.random() * 9000);
    return 'ART-' + aar + '-' + nr;
  }

  function lagKvittering() {
    var nr = referanse();
    var linjer = [
      'Referanse: ' + nr,
      'Bruksområde: ' + (valgtBruk || 'Ikke valgt'),
      'Behov: ' + (valgteBehov.length ? valgteBehov.join(', ') : 'Ikke valgt'),
      '',
      'Sendt fra nettsiden til artisti.no'
    ];

    kvitteringNr.textContent = nr;
    kvitteringEpost.href =
      'mailto:' + MOTTAKER +
      '?subject=' + encodeURIComponent('Forespørsel ' + nr + ' — profilpakke') +
      '&body=' + encodeURIComponent(linjer.join('\n'));

    lagKnapp.hidden = true;
    kvittering.hidden = false;
    kvitteringNr.setAttribute('tabindex', '-1');
    kvitteringNr.focus();
  }

  if (lagKnapp && kvittering) {
    oppdater();

    lagKnapp.addEventListener('click', function () {
      if (valgtBruk === '' && valgteBehov.length === 0) {
        teller.textContent = 'Velg minst ett bruksområde eller ett behov først.';
        if (brukKnapper[0]) brukKnapper[0].focus();
        return;
      }
      lagKvittering();
    });

    kvitteringEndre.addEventListener('click', function () {
      kvittering.hidden = true;
      lagKnapp.hidden = false;
      lagKnapp.focus();
    });
  }

  /* ---------- Kontaktskjemaet -------------------------------------------- */

  var skjema = document.getElementById('kontaktskjema');

  if (skjema) {
    var feilFelt = document.getElementById('skjemaFeil');
    var kvitteringFelt = document.getElementById('skjemaKvittering');

    function visFeil(melding) {
      if (!feilFelt) return;
      if (melding) {
        feilFelt.textContent = melding;
        feilFelt.hidden = false;
      } else {
        feilFelt.textContent = '';
        feilFelt.hidden = true;
      }
    }

    function merk(felt, ugyldig) {
      if (ugyldig) felt.setAttribute('aria-invalid', 'true');
      else felt.removeAttribute('aria-invalid');
    }

    function gyldigEpost(verdi) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
    }

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();

      var navn = document.getElementById('navn');
      var bedrift = document.getElementById('bedrift');
      var epost = document.getElementById('epost');
      var telefon = document.getElementById('telefon');
      var melding = document.getElementById('melding');

      if (navn.value.trim().length < 2) {
        visFeil('Skriv inn navnet ditt.');
        merk(navn, true);
        navn.focus();
        return;
      }
      merk(navn, false);

      if (!gyldigEpost(epost.value.trim())) {
        visFeil('Skriv inn en gyldig e-postadresse.');
        merk(epost, true);
        epost.focus();
        return;
      }
      merk(epost, false);

      if (melding.value.trim().length < 10) {
        visFeil('Skriv noen ord om hva dere trenger — minst ti tegn.');
        merk(melding, true);
        melding.focus();
        return;
      }
      merk(melding, false);

      visFeil('');

      var linjer = [
        melding.value.trim(),
        '',
        'Navn: ' + navn.value.trim(),
        'Virksomhet: ' + (bedrift.value.trim() || 'Ikke oppgitt'),
        'E-post: ' + epost.value.trim(),
        'Telefon: ' + (telefon.value.trim() || 'Ikke oppgitt'),
        '',
        'Sendt fra nettsiden til artisti.no'
      ];

      window.location.href =
        'mailto:' + MOTTAKER +
        '?subject=' + encodeURIComponent('Henvendelse fra ' + (bedrift.value.trim() || navn.value.trim())) +
        '&body=' + encodeURIComponent(linjer.join('\n'));

      if (kvitteringFelt) {
        kvitteringFelt.textContent = 'E-postutkastet er klart i din e-postklient. Send det derfra, så tar vi kontakt.';
        kvitteringFelt.hidden = false;
      }
    });
  }
})();
