/*
  People4you — demo.
  To ting som faktisk virker: timelisten (sum, kvittering, status) og
  forespørselsskjemaet (blir en e-post du sender selv). Alt skjer i
  nettleseren; ingenting samles inn og ingenting sendes herfra.
*/
(function () {
  'use strict';

  var naa = new Date();

  /* ---------- Ukenummer ---------- */

  function isoUke(dato) {
    var d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
    var ukedag = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - ukedag);
    var aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - aarStart) / 86400000 + 1) / 7);
  }

  function toSiffer(n) {
    return n < 10 ? '0' + n : String(n);
  }

  var ukeNr = isoUke(naa);
  var datoTekst = toSiffer(naa.getDate()) + '.' + toSiffer(naa.getMonth() + 1) + '.' + naa.getFullYear();

  var ukeFelt = document.querySelectorAll('[data-uke]');
  for (var u = 0; u < ukeFelt.length; u++) {
    ukeFelt[u].textContent = String(ukeNr);
  }

  /* ---------- Meny ---------- */

  var menyKnapp = document.querySelector('.nav-toggle');
  var meny = document.getElementById('nav');

  if (menyKnapp && meny) {
    var erBred = function () {
      return window.matchMedia('(min-width: 901px)').matches;
    };
    var settMeny = function (aapen) {
      meny.hidden = !aapen;
      menyKnapp.setAttribute('aria-expanded', aapen ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', aapen ? 'Lukk meny' : 'Åpne meny');
    };

    settMeny(erBred());

    menyKnapp.addEventListener('click', function () {
      settMeny(meny.hidden);
    });

    meny.addEventListener('click', function (hendelse) {
      if (!erBred() && hendelse.target.closest('a')) {
        settMeny(false);
      }
    });

    window.addEventListener('resize', function () {
      if (erBred()) {
        settMeny(true);
      }
    });
  }

  /* ---------- Timelisten ---------- */

  var skjema = document.getElementById('timeliste');

  if (skjema) {
    var dager = skjema.querySelectorAll('[data-day]');
    var sumFelt = document.getElementById('sum');
    var panelSum = document.getElementById('panel-sum');
    var feilFelt = document.getElementById('sheet-feil');
    var kvittering = document.getElementById('kvittering');
    var tomPanel = document.getElementById('panel-tom');
    var kvUke = document.getElementById('kv-uke');
    var kvTimer = document.getElementById('kv-timer');
    var kvDato = document.getElementById('kv-dato');
    var endreKnapp = document.getElementById('endre');

    var tilTall = function (verdi) {
      var renset = String(verdi).replace(',', '.').replace(/[^0-9.]/g, '');
      var tall = parseFloat(renset);
      if (isNaN(tall)) {
        return 0;
      }
      if (tall < 0) {
        tall = 0;
      }
      if (tall > 24) {
        tall = 24;
      }
      return tall;
    };

    var tilTekst = function (tall) {
      var avrundet = Math.round(tall * 10) / 10;
      var hele = Math.floor(avrundet);
      var desimal = Math.round((avrundet - hele) * 10);
      return desimal === 0 ? hele + ' t' : hele + ',' + desimal + ' t';
    };

    var oppdater = function () {
      var sum = 0;
      for (var i = 0; i < dager.length; i++) {
        sum += tilTall(dager[i].value);
      }
      sum = Math.round(sum * 10) / 10;
      sumFelt.textContent = tilTekst(sum);
      if (panelSum) {
        panelSum.textContent = tilTekst(sum);
      }
      if (feilFelt) {
        feilFelt.hidden = true;
      }
      return sum;
    };

    for (var d = 0; d < dager.length; d++) {
      dager[d].addEventListener('input', oppdater);
      dager[d].addEventListener('blur', function () {
        var tall = tilTall(this.value);
        this.value = tall === 0 ? '' : String(tall).replace('.', ',');
        oppdater();
      });
    }

    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      var sum = oppdater();

      if (sum <= 0) {
        if (feilFelt) {
          feilFelt.hidden = false;
        }
        dager[0].focus();
        return;
      }

      kvUke.textContent = String(ukeNr);
      kvTimer.textContent = tilTekst(sum);
      kvDato.textContent = datoTekst;
      if (tomPanel) {
        tomPanel.hidden = true;
      }
      kvittering.hidden = false;

      var tittel = kvittering.querySelector('h3');
      if (tittel) {
        tittel.setAttribute('tabindex', '-1');
        tittel.focus();
      }
    });

    if (endreKnapp) {
      endreKnapp.addEventListener('click', function () {
        kvittering.hidden = true;
        if (tomPanel) {
          tomPanel.hidden = false;
        }
        dager[0].focus();
      });
    }

    oppdater();
  }

  /* ---------- Forespørselsskjema ---------- */

  var foresporsel = document.getElementById('foresporsel');

  if (foresporsel) {
    var status = document.getElementById('skjema-status');

    foresporsel.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();

      if (!foresporsel.checkValidity()) {
        foresporsel.reportValidity();
        return;
      }

      var data = new FormData(foresporsel);
      var til = data.get('kontor') || 'askim@people4you.no';
      var behov = data.get('behov') || 'Bemanning';
      var telefon = data.get('telefon') || 'ikke oppgitt';

      var linjer = [
        'Navn: ' + (data.get('navn') || ''),
        'Bedrift: ' + (data.get('bedrift') || ''),
        'E-post: ' + (data.get('epost') || ''),
        'Telefon: ' + telefon,
        'Behov: ' + behov,
        '',
        data.get('melding') || ''
      ];

      var emne = 'Forespørsel fra nettsiden: ' + behov;
      var lenke = 'mailto:' + til +
        '?subject=' + encodeURIComponent(emne) +
        '&body=' + encodeURIComponent(linjer.join('\n'));

      window.location.href = lenke;

      if (status) {
        status.hidden = false;
        status.textContent = 'E-postprogrammet ditt åpnes med forespørselen til ' + til +
          '. Ingenting er sendt før du trykker send i e-postprogrammet.';
      }
    });
  }
})();
