/* Smartpeople Search & Selection — demointeraksjon.
   Alt regnes lokalt i nettleseren. Ingen data sendes, ingenting lagres.
   Interaksjonen er en oppdragsprofil i tre steg: behov → samtale → kvittering. */

(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */

  var meny = document.getElementById('meny');
  var menyKnapp = document.getElementById('menuBtn');

  if (meny && menyKnapp) {
    var settMeny = function (apen) {
      meny.hidden = !apen;
      menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
    };

    menyKnapp.addEventListener('click', function () {
      settMeny(meny.hidden);
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && !meny.hidden) {
        settMeny(false);
        menyKnapp.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) settMeny(false);
    });
  }

  /* ---------------- Oppdragsprofil ---------------- */

  var panel = document.querySelector('.panel');
  var steg = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var stegStatus = document.getElementById('stegStatus');
  var stegNavn = document.getElementById('stegNavn');
  var dagChips = document.getElementById('dagChips');
  var tidChips = document.getElementById('tidChips');
  var feilBoks = document.getElementById('feil');
  var navnFelt = document.getElementById('navn');
  var epostFelt = document.getElementById('epost');
  var refFelt = document.getElementById('ref');
  var oppsummering = document.getElementById('oppsummering');
  var sendLenke = document.getElementById('sendLenke');
  var metodeFelt = document.getElementById('metode');
  var bransjeFelt = document.getElementById('bransje');

  if (!panel || steg.length !== 3 || !dagChips || !tidChips) return;

  var navn = { 1: 'Behov', 2: 'Samtale', 3: 'Kvittering' };
  var tider = ['09:00', '11:00', '13:00', '15:00'];

  steg.forEach(function (element) {
    var overskrift = element.querySelector('.panel__h');
    if (overskrift) overskrift.setAttribute('tabindex', '-1');
  });

  var pad = function (tall) {
    return tall < 10 ? '0' + tall : String(tall);
  };

  var tilIso = function (dato) {
    return dato.getFullYear() + '-' + pad(dato.getMonth() + 1) + '-' + pad(dato.getDate());
  };

  var kortDato = new Intl.DateTimeFormat('nb-NO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  var langDato = new Intl.DateTimeFormat('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  function nesteHverdager(antall) {
    var dato = new Date();
    var ut = [];
    dato.setHours(12, 0, 0, 0);
    while (ut.length < antall) {
      dato.setDate(dato.getDate() + 1);
      var ukedag = dato.getDay();
      if (ukedag === 0 || ukedag === 6) continue;
      ut.push(new Date(dato));
    }
    return ut;
  }

  function lagChip(gruppe, verdi, tekst, valgt, ekstra) {
    var etikett = document.createElement('label');
    etikett.className = 'chip';

    var inngang = document.createElement('input');
    inngang.type = 'radio';
    inngang.name = gruppe;
    inngang.value = verdi;
    if (valgt) inngang.checked = true;
    if (ekstra) inngang.setAttribute('data-lang', ekstra);

    var spenn = document.createElement('span');
    spenn.textContent = tekst;

    etikett.appendChild(inngang);
    etikett.appendChild(spenn);
    return etikett;
  }

  nesteHverdager(6).forEach(function (dato, indeks) {
    dagChips.appendChild(
      lagChip('dag', tilIso(dato), kortDato.format(dato), indeks === 0, langDato.format(dato))
    );
  });

  tider.forEach(function (tid, indeks) {
    tidChips.appendChild(lagChip('tid', tid, tid, indeks === 0));
  });

  function valgt(gruppe) {
    return document.querySelector('input[name="' + gruppe + '"]:checked');
  }

  function visSteg(nummer) {
    steg.forEach(function (element) {
      element.hidden = Number(element.getAttribute('data-step')) !== nummer;
    });

    if (stegStatus) stegStatus.textContent = 'Steg ' + nummer + ' av 3';
    if (stegNavn) stegNavn.textContent = navn[nummer];

    var aktiv = document.querySelector('.step[data-step="' + nummer + '"]');
    var mal = aktiv ? aktiv.querySelector('.panel__h') : null;
    if (mal) {
      try {
        mal.focus();
      } catch (feil) {
        /* eldre nettlesere */
      }
    }
  }

  function visFeil(tekst) {
    if (!feilBoks) return;
    if (!tekst) {
      feilBoks.hidden = true;
      feilBoks.textContent = '';
      return;
    }
    feilBoks.hidden = false;
    feilBoks.textContent = tekst;
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(verdi);
  }

  function lagReferanse() {
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var ut = '';
    var tilfeldig = new Uint8Array(4);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(tilfeldig);
      for (var i = 0; i < 4; i++) ut += tegn.charAt(tilfeldig[i] % tegn.length);
    } else {
      for (var j = 0; j < 4; j++) ut += tegn.charAt(Math.floor(Math.random() * tegn.length));
    }
    return 'SP-' + new Date().getFullYear() + '-' + ut;
  }

  var tilSteg2 = document.getElementById('tilSteg2');
  var tilbake1 = document.getElementById('tilbake1');
  var tilSteg3 = document.getElementById('tilSteg3');
  var startPaaNytt = document.getElementById('startPaaNytt');

  if (tilSteg2) {
    tilSteg2.addEventListener('click', function () {
      visSteg(2);
    });
  }

  if (tilbake1) {
    tilbake1.addEventListener('click', function () {
      visSteg(1);
    });
  }

  if (startPaaNytt) {
    startPaaNytt.addEventListener('click', function () {
      if (navnFelt) navnFelt.value = '';
      if (epostFelt) epostFelt.value = '';
      visFeil('');
      visSteg(1);
    });
  }

  if (tilSteg3) {
    tilSteg3.addEventListener('click', function () {
      var dag = valgt('dag');
      var tid = valgt('tid');
      var person = navnFelt ? navnFelt.value.trim() : '';
      var epost = epostFelt ? epostFelt.value.trim() : '';

      if (person.length < 2) {
        visFeil('Fyll inn navnet ditt, slik at vi vet hvem som kommer.');
        if (navnFelt) navnFelt.focus();
        return;
      }

      if (!gyldigEpost(epost)) {
        visFeil('Fyll inn en gyldig e-postadresse.');
        if (epostFelt) epostFelt.focus();
        return;
      }

      if (!dag || !tid) {
        visFeil('Velg en dag og et tidspunkt.');
        return;
      }

      visFeil('');

      var niva = valgt('niva');
      var nivaTekst = niva ? niva.value : 'Ikke valgt';
      var metode = metodeFelt ? metodeFelt.value : '';
      var bransje = bransjeFelt ? bransjeFelt.value : '';
      var naaRef = lagReferanse();
      var datoTekst = (dag.getAttribute('data-lang') || dag.value) + ' kl. ' + tid.value;

      var rader = [
        ['Nivå', nivaTekst],
        ['Metode', metode],
        ['Bransje', bransje],
        ['Samtale', datoTekst],
        ['Navn', person],
        ['E-post', epost]
      ];

      if (oppsummering) {
        oppsummering.textContent = '';
        rader.forEach(function (rad) {
          var div = document.createElement('div');
          div.className = 'kvittering__rad';
          var dt = document.createElement('dt');
          dt.textContent = rad[0];
          var dd = document.createElement('dd');
          dd.textContent = rad[1];
          div.appendChild(dt);
          div.appendChild(dd);
          oppsummering.appendChild(div);
        });
      }

      if (refFelt) refFelt.textContent = naaRef;

      if (sendLenke) {
        var emne = 'Oppdragsprofil ' + naaRef + ' — ' + nivaTekst;
        var kropp = [
          'Hei Smartpeople,',
          '',
          'Vi ønsker en samtale om et oppdrag.',
          '',
          'Referanse: ' + naaRef,
          'Nivå: ' + nivaTekst,
          'Metode: ' + metode,
          'Bransje: ' + bransje,
          'Ønsket tidspunkt: ' + datoTekst,
          '',
          'Kontakt: ' + person + ' · ' + epost,
          ''
        ].join('\n');
        sendLenke.href =
          'mailto:firmapost@smartpeople.no?subject=' +
          encodeURIComponent(emne) +
          '&body=' +
          encodeURIComponent(kropp);
      }

      visSteg(3);
    });
  }

  if (navnFelt) {
    navnFelt.addEventListener('input', function () {
      if (feilBoks && !feilBoks.hidden) visFeil('');
    });
  }

  if (epostFelt) {
    epostFelt.addEventListener('input', function () {
      if (feilBoks && !feilBoks.hidden) visFeil('');
    });
  }
})();
