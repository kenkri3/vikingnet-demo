/*
  Medical Recruitment and Staffing AS — app.js
  Tre oppgaver: mobilmeny, årstall i footer, og forespørselsskjemaet med kvittering.
  Alt skjer i nettleseren. Ingenting sendes til en server og ingenting lagres:
  kvitteringen ender i en mailto: til selskapets egen adresse, slik en statisk
  side må gjøre det. Telefonnummeret står også i kvitteringen som fallback.
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
      var apen = meny.classList.toggle('is-open');
      menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape') lukkMeny();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) lukkMeny();
    });
  }

  /* ---------------- Årstall ---------------- */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Forespørsel om oppringing ---------------- */

  var skjema = document.getElementById('foresporsel');
  if (!skjema) return;

  var kvittering = document.getElementById('kvittering');
  var kvitteringListe = document.getElementById('kvitteringListe');
  var kvitteringMerke = document.getElementById('kvitteringMerke');
  var kvitteringTittel = document.getElementById('kvitteringTittel');
  var sendEpost = document.getElementById('sendEpost');
  var endreKnapp = document.getElementById('endre');
  var status = document.getElementById('skjemaStatus');
  var sendKnapp = skjema.querySelector('.skjema__send');

  var FELT = ['rolle', 'navn', 'virksomhet', 'telefon', 'epost', 'tid', 'behov'];

  var PAAKREVD = {
    rolle: 'Velg hvem forespørselen gjelder.',
    navn: 'Skriv inn navnet ditt.',
    telefon: 'Skriv inn et telefonnummer vi kan nå deg på.',
    epost: 'Skriv inn en e-postadresse vi kan svare til.',
    tid: 'Velg når det passer å ringe.'
  };

  function felt(navn) {
    return skjema.elements[navn];
  }

  function verdi(navn) {
    var el = felt(navn);
    return el ? String(el.value || '').trim() : '';
  }

  function feilFor(navn) {
    var v = verdi(navn);

    if (PAAKREVD[navn] && !v) return PAAKREVD[navn];

    if (navn === 'navn' && v.length < 2) {
      return 'Navnet må ha minst to tegn.';
    }

    if (navn === 'telefon') {
      var siffer = v.replace(/[^0-9]/g, '');
      if (siffer.length < 8) return 'Telefonnummeret må ha minst åtte siffer.';
    }

    if (navn === 'epost' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      return 'Skriv en gyldig e-postadresse, for eksempel navn@virksomhet.no.';
    }

    return '';
  }

  function visFeil(navn, melding) {
    var el = felt(navn);
    if (!el) return;
    var ramme = el.closest('.felt');
    var feil = skjema.querySelector('[data-feil-for="' + navn + '"]');

    if (ramme) {
      if (melding) {
        ramme.setAttribute('data-invalid', 'true');
      } else {
        ramme.removeAttribute('data-invalid');
      }
    }

    if (melding) {
      el.setAttribute('aria-invalid', 'true');
    } else {
      el.removeAttribute('aria-invalid');
    }

    if (feil) feil.textContent = melding;
  }

  function sjekkAlle() {
    var forsteFeil = null;

    FELT.forEach(function (navn) {
      var melding = feilFor(navn);
      visFeil(navn, melding);
      if (melding && !forsteFeil) forsteFeil = felt(navn);
    });

    if (forsteFeil) {
      if (status) status.textContent = 'Sjekk feltene som er merket med rødt.';
      forsteFeil.focus();
      return false;
    }

    if (status) status.textContent = '';
    return true;
  }

  /* Kort, stabil referanse til kvitteringen. Ikke en server-ID. */
  function lagMerke(v) {
    var basis = v.navn + '|' + v.telefon + '|' + v.epost + '|' + v.tid + '|' + new Date().toDateString();
    var sum = 0;
    for (var i = 0; i < basis.length; i++) {
      sum = (sum * 31 + basis.charCodeAt(i)) % 1679616;
    }
    var kode = sum.toString(36).toUpperCase();
    while (kode.length < 4) kode = '0' + kode;
    return 'MRS-' + kode.slice(0, 4);
  }

  function lagEpost(v) {
    var emne = 'Forespørsel om oppringing – ' + v.rolle;
    var linjer = [
      'Hei,',
      '',
      'Jeg sender en forespørsel om oppringing fra nettsiden deres.',
      '',
      'Gjelder: ' + v.rolle,
      'Navn: ' + v.navn,
      'Virksomhet: ' + (v.virksomhet || 'Ikke oppgitt'),
      'Telefon: ' + v.telefon,
      'E-post: ' + v.epost,
      'Passer å ringe: ' + v.tid
    ];

    if (v.behov) linjer.push('', 'Om behovet:', v.behov);

    linjer.push('', 'Hilsen', v.navn);

    return {
      emne: emne,
      lenke: 'mailto:trygve@medirec.no?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(linjer.join('\n'))
    };
  }

  function tegnKvittering(v, merke) {
    var rader = [
      ['Gjelder', v.rolle],
      ['Navn', v.navn],
      ['Virksomhet', v.virksomhet || 'Ikke oppgitt'],
      ['Telefon', v.telefon],
      ['E-post', v.epost],
      ['Passer å ringe', v.tid]
    ];

    if (v.behov) rader.push(['Om behovet', v.behov]);

    kvitteringListe.textContent = '';
    rader.forEach(function (rad) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      kvitteringListe.appendChild(div);
    });

    kvitteringMerke.textContent = merke;
  }

  function visKvittering() {
    skjema.hidden = true;
    kvittering.hidden = false;

    kvitteringTittel.focus({ preventScroll: true });
    kvitteringTittel.scrollIntoView({ block: 'nearest' });
  }

  function visSkjema() {
    kvittering.hidden = true;
    skjema.hidden = false;

    var navn = felt('navn');
    if (navn) navn.focus();
    skjema.scrollIntoView({ block: 'nearest' });
  }

  skjema.addEventListener('input', function (hendelse) {
    var el = hendelse.target;
    if (!el.name || FELT.indexOf(el.name) === -1) return;
    var ramme = el.closest('.felt');
    if (ramme && ramme.hasAttribute('data-invalid')) {
      visFeil(el.name, feilFor(el.name));
    }
  });

  skjema.addEventListener('change', function (hendelse) {
    var el = hendelse.target;
    if (!el.name || FELT.indexOf(el.name) === -1) return;
    var ramme = el.closest('.felt');
    if (ramme && ramme.hasAttribute('data-invalid')) {
      visFeil(el.name, feilFor(el.name));
    }
  });

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    if (!sjekkAlle()) return;

    var v = {
      rolle: verdi('rolle'),
      navn: verdi('navn'),
      virksomhet: verdi('virksomhet'),
      telefon: verdi('telefon'),
      epost: verdi('epost'),
      tid: verdi('tid'),
      behov: verdi('behov')
    };

    var merke = lagMerke(v);
    var epost = lagEpost(v);

    tegnKvittering(v, merke);
    if (sendEpost) sendEpost.setAttribute('href', epost.lenke);
    visKvittering();

    if (status) status.textContent = '';
    if (sendKnapp) sendKnapp.blur();
  });

  if (endreKnapp) {
    endreKnapp.addEventListener('click', visSkjema);
  }

  /* Lenker som «Jeg er sykepleier» forhåndsvelger hvem forespørselen gjelder. */
  Array.prototype.slice.call(document.querySelectorAll('[data-rolle]')).forEach(function (lenke) {
    lenke.addEventListener('click', function () {
      var valg = lenke.getAttribute('data-rolle');
      if (!valg) return;

      var rolle = felt('rolle');
      if (!rolle) return;

      for (var i = 0; i < rolle.options.length; i++) {
        if (rolle.options[i].value.toLowerCase().indexOf(valg.toLowerCase()) !== -1) {
          rolle.selectedIndex = i;
          visFeil('rolle', '');
          break;
        }
      }
    });
  });
})();
