/*
  Ecofact — app.js
  Forespørselen i tre steg og kvitteringen. Alt skjer i nettleseren:
  ingenting sendes til en server, og ingenting lagres etter at fanen lukkes.
  Knappen i kvitteringen åpner et e-postutkast i brukerens egen klient.
*/
(function () {
  'use strict';

  var skjema = document.getElementById('foresporselSkjema');
  if (!skjema) return;

  var MOTTAKER = 'ole@ecofact.no';
  var MAKS_STEG = 3;
  var steg = 1;

  var paneler = Array.prototype.slice.call(skjema.querySelectorAll('[data-panel]'));
  var punkter = Array.prototype.slice.call(document.querySelectorAll('.steg__punkt'));
  var valgKnapper = Array.prototype.slice.call(document.querySelectorAll('.valg__knapp'));
  var fagtemaFelt = document.getElementById('fagtema');
  var kvittering = document.getElementById('kvittering');

  /* ---------- Fagtema: knapper som oppfører seg som ett valg ---------- */

  valgKnapper.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var varValgt = knapp.getAttribute('aria-pressed') === 'true';
      valgKnapper.forEach(function (annen) {
        annen.setAttribute('aria-pressed', 'false');
      });
      if (varValgt) {
        fagtemaFelt.value = '';
      } else {
        knapp.setAttribute('aria-pressed', 'true');
        fagtemaFelt.value = (knapp.textContent || '').trim();
      }
    });
  });

  /* ---------- Steg ---------- */

  function visSteg(n) {
    steg = Math.min(Math.max(n, 1), MAKS_STEG);
    paneler.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute('data-panel')) !== steg;
    });
    punkter.forEach(function (punkt) {
      var nr = Number(punkt.getAttribute('data-punkt'));
      punkt.classList.toggle('er-ferdig', nr < steg);
      if (nr === steg) punkt.setAttribute('aria-current', 'step');
      else punkt.removeAttribute('aria-current');
    });
    var forste = paneler[steg - 1].querySelector('input:not([type="hidden"]), select, textarea');
    if (forste) forste.focus();
  }

  /* ---------- Validering ---------- */

  function visFeil(id, melding) {
    var el = document.getElementById(id);
    if (!el) return;
    if (melding) {
      el.textContent = melding;
      el.hidden = false;
    } else {
      el.textContent = '';
      el.hidden = true;
    }
  }

  function merk(felt, ugyldig) {
    if (ugyldig) felt.setAttribute('aria-invalid', 'true');
    else felt.removeAttribute('aria-invalid');
  }

  function sjekkEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function valider(n) {
    var feil = [];

    if (n === 2) {
      var melding = document.getElementById('melding');
      if (melding.value.trim().length < 10) {
        visFeil('feil-melding', 'Skriv noen ord om oppdraget — minst ti tegn.');
        merk(melding, true);
        feil.push(melding);
      } else {
        visFeil('feil-melding', '');
        merk(melding, false);
      }
    }

    if (n === 3) {
      var navn = document.getElementById('navn');
      var epost = document.getElementById('epost');
      var telefon = document.getElementById('telefon');

      if (navn.value.trim().length < 2) {
        visFeil('feil-navn', 'Skriv inn navnet ditt.');
        merk(navn, true);
        feil.push(navn);
      } else {
        visFeil('feil-navn', '');
        merk(navn, false);
      }

      if (!sjekkEpost(epost.value.trim())) {
        visFeil('feil-epost', 'Skriv inn en gyldig e-postadresse.');
        merk(epost, true);
        feil.push(epost);
      } else {
        visFeil('feil-epost', '');
        merk(epost, false);
      }

      if (telefon.value.replace(/\D/g, '').length < 8) {
        visFeil('feil-telefon', 'Skriv inn et telefonnummer med minst åtte sifre.');
        merk(telefon, true);
        feil.push(telefon);
      } else {
        visFeil('feil-telefon', '');
        merk(telefon, false);
      }
    }

    return feil;
  }

  function gaaVidere() {
    var feil = valider(steg);
    if (feil.length) {
      feil[0].focus();
      return;
    }
    if (steg < MAKS_STEG) visSteg(steg + 1);
  }

  skjema.addEventListener('click', function (event) {
    if (event.target.closest('[data-neste]')) {
      event.preventDefault();
      gaaVidere();
    } else if (event.target.closest('[data-forrige]')) {
      event.preventDefault();
      if (steg > 1) visSteg(steg - 1);
    }
  });

  skjema.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'TEXTAREA') return;
    if (steg >= MAKS_STEG) return;
    event.preventDefault();
    gaaVidere();
  });

  /* ---------- Kvittering ---------- */

  function felt(verdi, tomTekst) {
    var ren = (verdi || '').trim();
    return ren === '' ? tomTekst : ren;
  }

  function saksnummer() {
    var aar = new Date().getFullYear();
    var nr = Math.floor(1000 + Math.random() * 9000);
    return 'EF-' + aar + '-' + nr;
  }

  function lesSkjema() {
    return {
      emne: document.getElementById('emne').value,
      fagtema: felt(fagtemaFelt.value, 'Ikke valgt'),
      omrade: felt(document.getElementById('omrade').value, 'Ikke oppgitt'),
      fase: document.getElementById('fase').value,
      melding: document.getElementById('melding').value.trim(),
      navn: document.getElementById('navn').value.trim(),
      epost: document.getElementById('epost').value.trim(),
      telefon: document.getElementById('telefon').value.trim()
    };
  }

  function lagKvittering() {
    var data = lesSkjema();
    var nr = saksnummer();

    var rader = [
      ['Emne', data.emne],
      ['Fagtema', data.fagtema],
      ['Område', data.omrade],
      ['Fase', data.fase],
      ['Oppdraget', data.melding],
      ['Navn', data.navn],
      ['E-post', data.epost],
      ['Telefon', data.telefon]
    ];

    var liste = document.getElementById('kvitteringListe');
    liste.textContent = '';
    rader.forEach(function (rad) {
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      liste.appendChild(dt);
      liste.appendChild(dd);
    });

    document.getElementById('kvitteringNr').textContent = nr;

    var linjer = [
      'Saksnummer: ' + nr,
      'Emne: ' + data.emne,
      'Fagtema: ' + data.fagtema,
      'Område: ' + data.omrade,
      'Fase: ' + data.fase,
      '',
      data.melding,
      '',
      'Navn: ' + data.navn,
      'E-post: ' + data.epost,
      'Telefon: ' + data.telefon
    ];

    var epostLenke = document.getElementById('kvitteringEpost');
    epostLenke.href =
      'mailto:' + MOTTAKER +
      '?subject=' + encodeURIComponent('Forespørsel ' + nr + ' — ' + data.emne) +
      '&body=' + encodeURIComponent(linjer.join('\n'));

    skjema.hidden = true;
    kvittering.hidden = false;
    var tittel = kvittering.querySelector('h3');
    if (tittel) {
      tittel.setAttribute('tabindex', '-1');
      tittel.focus();
    }
  }

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    var feil = valider(3);
    if (feil.length) {
      feil[0].focus();
      return;
    }
    lagKvittering();
  });

  document.getElementById('kvitteringEndre').addEventListener('click', function () {
    kvittering.hidden = true;
    skjema.hidden = false;
    visSteg(3);
  });

  document.getElementById('kvitteringNy').addEventListener('click', function () {
    skjema.reset();
    valgKnapper.forEach(function (knapp) {
      knapp.setAttribute('aria-pressed', 'false');
    });
    fagtemaFelt.value = '';
    ['feil-melding', 'feil-navn', 'feil-epost', 'feil-telefon'].forEach(function (id) {
      visFeil(id, '');
    });
    ['melding', 'navn', 'epost', 'telefon'].forEach(function (id) {
      merk(document.getElementById(id), false);
    });
    kvittering.hidden = true;
    skjema.hidden = false;
    visSteg(1);
  });
})();
