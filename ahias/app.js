/*
  Arne Hansen Installasjon AS — interaksjon.
  Alt kjører i nettleseren. Ingenting samles inn, ingenting sendes før
  brukeren selv trykker «Send forespørselen på e-post» og sender i
  e-postprogrammet sitt.
*/
(function () {
  'use strict';

  var dokument = document;

  /* ---------- Meny ---------- */

  var bryter = dokument.querySelector('.nav-toggle');
  var meny = dokument.getElementById('hovedmeny');

  function settMeny(apen) {
    if (!bryter || !meny) return;
    bryter.setAttribute('aria-expanded', apen ? 'true' : 'false');
    bryter.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    meny.classList.toggle('is-open', apen);
  }

  if (bryter && meny) {
    bryter.addEventListener('click', function () {
      settMeny(bryter.getAttribute('aria-expanded') !== 'true');
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    dokument.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && bryter.getAttribute('aria-expanded') === 'true') {
        settMeny(false);
        bryter.focus();
      }
    });
  }

  /* ---------- Forespørsel i tre steg ---------- */

  var skjema = dokument.getElementById('foresporsel-skjema');
  if (!skjema) return;

  var paneler = [
    dokument.getElementById('steg-1'),
    dokument.getElementById('steg-2'),
    dokument.getElementById('steg-3'),
    dokument.getElementById('steg-4')
  ];
  var prikker = skjema.querySelectorAll('.foresp__prikker span');
  var stegtekst = dokument.getElementById('stegtekst');
  var feilboks = dokument.getElementById('foresp-feil');
  var status = dokument.getElementById('foresp-status');
  var steg = 1;

  function visSteg(n, flyttFokus) {
    steg = n;
    for (var i = 0; i < paneler.length; i++) {
      if (paneler[i]) paneler[i].hidden = i !== n - 1;
    }

    for (var j = 0; j < prikker.length; j++) {
      prikker[j].classList.toggle('is-aktiv', j === Math.min(n, 3) - 1 && n <= 3);
      prikker[j].classList.toggle('is-ferdig', n === 4 || j < n - 1);
    }

    if (stegtekst) {
      stegtekst.textContent = n === 4 ? 'Kvittering' : 'Steg ' + n + ' av 3';
    }

    skjulFeil();

    if (flyttFokus && paneler[n - 1]) {
      paneler[n - 1].setAttribute('tabindex', '-1');
      paneler[n - 1].focus({ preventScroll: false });
    }

    if (status) {
      status.textContent = n === 4
        ? 'Kvittering laget. Ingenting er sendt ennå.'
        : 'Steg ' + n + ' av 3.';
    }
  }

  function visFeil(melding, felt) {
    if (!feilboks) return;
    feilboks.textContent = melding;
    feilboks.hidden = false;
    if (felt && typeof felt.focus === 'function') felt.focus();
    if (status) status.textContent = melding;
  }

  function skjulFeil() {
    if (feilboks) {
      feilboks.textContent = '';
      feilboks.hidden = true;
    }
  }

  function valgt(navn) {
    var felt = skjema.querySelector('input[name="' + navn + '"]:checked');
    return felt ? felt.value : '';
  }

  function tekstfelt(navn) {
    var felt = skjema.querySelector('[name="' + navn + '"]');
    return felt ? felt.value.trim() : '';
  }

  function telefonGyldig(verdi) {
    var tall = verdi.replace(/[^0-9]/g, '');
    return tall.length >= 8 && tall.length <= 15;
  }

  function epostGyldig(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function sjekkSteg() {
    if (steg === 1 && !valgt('tjeneste')) {
      visFeil('Velg hva forespørselen gjelder.');
      return false;
    }

    if (steg === 2 && !valgt('naar')) {
      visFeil('Velg når det passer.');
      return false;
    }

    if (steg === 3) {
      var navn = tekstfelt('navn');
      var telefon = tekstfelt('telefon');
      var epost = tekstfelt('epost');

      if (navn.length < 2) {
        visFeil('Fyll inn navnet ditt.', skjema.querySelector('[name="navn"]'));
        return false;
      }
      if (!telefonGyldig(telefon)) {
        visFeil('Fyll inn et telefonnummer vi kan nå deg på.', skjema.querySelector('[name="telefon"]'));
        return false;
      }
      if (!epostGyldig(epost)) {
        visFeil('Fyll inn en gyldig e-postadresse.', skjema.querySelector('[name="epost"]'));
        return false;
      }
    }

    return true;
  }

  /* ---------- Kvittering ---------- */

  var kv = {
    tjeneste: dokument.getElementById('kv-tjeneste'),
    naar: dokument.getElementById('kv-naar'),
    mate: dokument.getElementById('kv-mate'),
    navn: dokument.getElementById('kv-navn'),
    telefon: dokument.getElementById('kv-telefon'),
    epost: dokument.getElementById('kv-epost'),
    notat: dokument.getElementById('kv-notat'),
    notatRad: dokument.getElementById('kv-notat-rad'),
    ref: dokument.getElementById('kvittering-ref')
  };
  var epostLenke = dokument.getElementById('send-epost');
  var kopierStatus = dokument.getElementById('kopier-status');
  var sisteTekst = '';

  function lagReferanse() {
    var na = new Date();
    var dato = String(na.getFullYear()) +
      String(na.getMonth() + 1).padStart(2, '0') +
      String(na.getDate()).padStart(2, '0');
    var tilfeldig = String(Math.floor(Math.random() * 900) + 100);
    return 'AH-' + dato + '-' + tilfeldig;
  }

  function lagTekst(referanse) {
    var linjer = [
      'Hei,',
      '',
      'Jeg sender en forespørsel via nettsiden:',
      '',
      'Tjeneste: ' + valgt('tjeneste'),
      'Når: ' + valgt('naar'),
      'Hvordan: ' + tekstfelt('mate'),
      'Navn: ' + tekstfelt('navn'),
      'Telefon: ' + tekstfelt('telefon'),
      'E-post: ' + tekstfelt('epost')
    ];
    var notat = tekstfelt('notat');
    if (notat) linjer.push('Notat: ' + notat);
    linjer.push('', 'Referanse: ' + referanse, '', 'Hilsen ' + tekstfelt('navn'));
    return linjer.join('\r\n');
  }

  function lagKvittering() {
    var referanse = lagReferanse();

    if (kv.tjeneste) kv.tjeneste.textContent = valgt('tjeneste');
    if (kv.naar) kv.naar.textContent = valgt('naar');
    if (kv.mate) kv.mate.textContent = tekstfelt('mate');
    if (kv.navn) kv.navn.textContent = tekstfelt('navn');
    if (kv.telefon) kv.telefon.textContent = tekstfelt('telefon');
    if (kv.epost) kv.epost.textContent = tekstfelt('epost');
    if (kv.ref) kv.ref.textContent = referanse;

    var notat = tekstfelt('notat');
    if (kv.notat && kv.notatRad) {
      if (notat) {
        kv.notat.textContent = notat;
        kv.notatRad.hidden = false;
      } else {
        kv.notat.textContent = '';
        kv.notatRad.hidden = true;
      }
    }

    sisteTekst = lagTekst(referanse);

    if (epostLenke) {
      var emne = 'Forespørsel fra nettsiden: ' + valgt('tjeneste') + ' (' + referanse + ')';
      epostLenke.href = 'mailto:post@ahias.no?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(sisteTekst);
    }

    if (kopierStatus) kopierStatus.textContent = '';
    visSteg(4, true);
  }

  skjema.addEventListener('click', function (hendelse) {
    var neste = hendelse.target.closest('[data-neste]');
    var tilbake = hendelse.target.closest('[data-tilbake]');

    if (neste) {
      if (sjekkSteg()) visSteg(steg + 1, true);
      return;
    }

    if (tilbake && steg > 1) visSteg(steg - 1, true);
  });

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    if (sjekkSteg()) lagKvittering();
  });

  skjema.addEventListener('change', skjulFeil);
  skjema.addEventListener('input', function (hendelse) {
    if (hendelse.target.matches('input, textarea')) skjulFeil();
  });

  var nyKnapp = dokument.getElementById('ny-foresporsel');
  if (nyKnapp) {
    nyKnapp.addEventListener('click', function () {
      skjema.reset();
      sisteTekst = '';
      if (kopierStatus) kopierStatus.textContent = '';
      visSteg(1, true);
    });
  }

  var kopierKnapp = dokument.getElementById('kopier');
  if (kopierKnapp) {
    kopierKnapp.addEventListener('click', function () {
      if (!sisteTekst) return;

      function meld(tekst) {
        if (kopierStatus) {
          kopierStatus.textContent = tekst;
          window.setTimeout(function () {
            if (kopierStatus.textContent === tekst) kopierStatus.textContent = '';
          }, 5000);
        }
      }

      function reserveKopier() {
        var omrade = dokument.createElement('textarea');
        omrade.value = sisteTekst;
        omrade.setAttribute('readonly', '');
        omrade.style.position = 'fixed';
        omrade.style.top = '0';
        omrade.style.left = '-9999px';
        dokument.body.appendChild(omrade);
        omrade.select();
        var ok = false;
        try {
          ok = dokument.execCommand('copy');
        } catch (feil) {
          ok = false;
        }
        dokument.body.removeChild(omrade);
        meld(ok ? 'Kopiert til utklippstavlen.' : 'Kunne ikke kopiere automatisk. Merk teksten og kopier selv.');
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sisteTekst).then(function () {
          meld('Kopiert til utklippstavlen.');
        }, reserveKopier);
      } else {
        reserveKopier();
      }
    });
  }

  visSteg(1, false);
})();
