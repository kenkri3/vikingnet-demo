/* ODA Connect — meny, forespørselsskjema og årstall. Alt kjører i nettleseren. */
(function () {
  'use strict';

  /* ---- Meny ---- */
  var toggle = document.querySelector('.nav-toggle');
  var meny = document.getElementById('meny');
  var smal = window.matchMedia('(max-width: 900px)');

  function settMeny(apen) {
    if (!toggle || !meny) return;
    toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
    toggle.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    meny.hidden = !apen;
  }

  if (toggle && meny) {
    meny.hidden = smal.matches;
    toggle.addEventListener('click', function () {
      settMeny(meny.hidden);
    });
    meny.addEventListener('click', function (e) {
      if (e.target.closest('a') && smal.matches) settMeny(false);
    });
    var vedEndring = function () {
      if (!smal.matches) settMeny(true);
      else settMeny(false);
    };
    if (smal.addEventListener) smal.addEventListener('change', vedEndring);
    else smal.addListener(vedEndring);
  }

  /* ---- Årstall ---- */
  var aar = document.getElementById('ar');
  if (aar) aar.textContent = String(new Date().getFullYear());

  /* ---- Forespørsel i tre steg ---- */
  var skjema = document.getElementById('behov-form');
  if (!skjema) return;

  var paneler = Array.prototype.slice.call(skjema.querySelectorAll('.steg-panel'));
  var punkter = Array.prototype.slice.call(skjema.querySelectorAll('.steg__punkt'));
  var feilboks = document.getElementById('behov-feil');
  var stegNaa = document.getElementById('steg-nå');
  var knappTilbake = document.getElementById('tilbake');
  var knappNeste = document.getElementById('neste');
  var knappSend = document.getElementById('send');
  var kvittering = document.getElementById('kvittering');
  var liste = document.getElementById('kvittering-liste');
  var sendLenke = document.getElementById('kvittering-send');
  var knappNy = document.getElementById('kvittering-ny');
  var steg = 1;

  var meldinger = {
    fagomrade: 'Velg et fagområde før du går videre.',
    antall: 'Skriv inn antall personer, fra 1 til 99.',
    varighet: 'Velg hvor lenge dere trenger folk.',
    start: 'Velg når dere trenger folk.',
    navn: 'Fyll inn navnet ditt.',
    bedrift: 'Fyll inn hvilken bedrift du ringer fra.',
    epost: 'Fyll inn en gyldig e-postadresse.',
    telefon: 'Telefonnummeret ser ikke riktig ut.'
  };

  function visFeil(tekst) {
    if (!feilboks) return;
    feilboks.textContent = tekst;
    feilboks.hidden = false;
  }

  function skjulFeil() {
    if (!feilboks) return;
    feilboks.hidden = true;
    feilboks.textContent = '';
  }

  function visSteg(n) {
    steg = n;
    paneler.forEach(function (p) {
      p.hidden = Number(p.getAttribute('data-panel')) !== n;
    });
    punkter.forEach(function (p) {
      var s = Number(p.getAttribute('data-steg'));
      p.classList.toggle('is-aktiv', s === n);
      p.classList.toggle('is-ferdig', s < n);
    });
    if (knappTilbake) knappTilbake.hidden = n === 1;
    if (knappNeste) knappNeste.hidden = n === 3;
    if (knappSend) knappSend.hidden = n !== 3;
    if (stegNaa) stegNaa.textContent = String(n);
    skjulFeil();

    var aktiv = paneler[n - 1];
    if (aktiv) {
      var felt = aktiv.querySelector('input, select, textarea');
      if (felt) felt.focus({ preventScroll: false });
    }
  }

  function sjekkVerdi(felt) {
    if (!felt || felt.disabled) return true;
    if (felt.type === 'radio') return true;
    var verdi = (felt.value || '').trim();
    if (felt.required && !verdi) return false;
    if (felt.id === 'antall') {
      var tall = Number(verdi);
      return Number.isFinite(tall) && tall >= 1 && tall <= 99;
    }
    if (felt.type === 'email' && verdi) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
    if (felt.type === 'tel' && verdi) return verdi.replace(/[^\d]/g, '').length >= 6;
    return true;
  }

  function validerSteg(n) {
    var panel = paneler[n - 1];
    if (!panel) return true;
    var felt = Array.prototype.slice.call(panel.querySelectorAll('input, select, textarea'));
    for (var i = 0; i < felt.length; i++) {
      if (felt[i].type === 'radio') {
        var gruppe = panel.querySelectorAll('input[name="' + felt[i].name + '"]');
        var valgt = Array.prototype.some.call(gruppe, function (r) { return r.checked; });
        if (!valgt) {
          visFeil('Velg type oppdrag.');
          return false;
        }
        continue;
      }
      if (!sjekkVerdi(felt[i])) {
        visFeil(meldinger[felt[i].id] || 'Fyll ut feltet.');
        felt[i].focus();
        return false;
      }
    }
    return true;
  }

  function verdi(id) {
    var felt = document.getElementById(id);
    return felt ? (felt.value || '').trim() : '';
  }

  function typeOppdrag() {
    var valgt = skjema.querySelector('input[name="type"]:checked');
    return valgt ? valgt.value : 'Innleie';
  }

  function lagOppsummering() {
    var rader = [
      ['Fagområde', verdi('fagomrade')],
      ['Type oppdrag', typeOppdrag()],
      ['Antall personer', verdi('antall')],
      ['Varighet', verdi('varighet')],
      ['Oppstart', verdi('start')],
      ['Kontaktperson', verdi('navn')],
      ['Bedrift', verdi('bedrift')],
      ['E-post', verdi('epost')]
    ];
    if (verdi('telefon')) rader.push(['Telefon', verdi('telefon')]);
    if (verdi('kommentar')) rader.push(['Om oppdraget', verdi('kommentar')]);

    liste.innerHTML = '';
    rader.forEach(function (rad) {
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      liste.appendChild(dt);
      liste.appendChild(dd);
    });
    return rader;
  }

  function lagEpost(rader) {
    var emne = 'Bemanningsbehov – ' + verdi('fagomrade');
    var linjer = ['Hei,', '', 'Vi har et bemanningsbehov:', ''];
    rader.forEach(function (rad) {
      linjer.push(rad[0] + ': ' + rad[1]);
    });
    linjer.push('', 'Hilsen ' + verdi('navn') + ', ' + verdi('bedrift'));
    var kropp = linjer.join('\r\n');
    return 'mailto:oyvind@odaconnect.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);
  }

  function visKvittering() {
    var rader = lagOppsummering();
    if (sendLenke) sendLenke.setAttribute('href', lagEpost(rader));
    skjema.hidden = true;
    kvittering.hidden = false;
    var overskrift = kvittering.querySelector('h3');
    if (overskrift) {
      overskrift.setAttribute('tabindex', '-1');
      overskrift.focus();
    }
  }

  if (knappNeste) {
    knappNeste.addEventListener('click', function () {
      if (!validerSteg(steg)) return;
      visSteg(Math.min(3, steg + 1));
    });
  }

  if (knappTilbake) {
    knappTilbake.addEventListener('click', function () {
      visSteg(Math.max(1, steg - 1));
    });
  }

  skjema.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validerSteg(1) || !validerSteg(2) || !validerSteg(3)) return;
    visKvittering();
  });

  if (knappNy) {
    knappNy.addEventListener('click', function () {
      skjema.reset();
      kvittering.hidden = true;
      skjema.hidden = false;
      visSteg(1);
    });
  }

  skjema.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT' && steg < 3) {
      e.preventDefault();
      if (validerSteg(steg)) visSteg(steg + 1);
    }
  });
})();
