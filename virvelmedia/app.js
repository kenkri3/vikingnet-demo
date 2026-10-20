/*
  Virvel media AS — app.js
  Mobilmeny, årstall i footer, og én interaksjon: «Lag en forespørsel» i
  fire steg med oppsummering og kvittering. Alt skjer i nettleseren.
  Ingenting sendes til en server, og ingenting lagres.
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

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') lukkMeny();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) lukkMeny();
    });
  }

  /* ---------------- Årstall i footer ---------------- */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Forespørsel ----------------
     Steg 1: hva trenger du. Steg 2: når og hvor. Steg 3: kontakt.
     Steg 4: se over. Deretter kvittering med e-postlenke og kopiknapp.
  */

  var skjema = document.getElementById('foresporsel-skjema');
  if (!skjema) return;

  var visninger = Array.prototype.slice.call(skjema.querySelectorAll('.foresp__visning'));
  var prikker = Array.prototype.slice.call(skjema.querySelectorAll('.fremdrift__steg'));
  var status = document.getElementById('foresp-status');
  var nesteKnapp = document.getElementById('neste');
  var tilbakeKnapp = document.getElementById('tilbake');
  var knapperad = document.getElementById('foresp-knapper');
  var sammendrag = document.getElementById('sammendrag');
  var sendLenke = document.getElementById('send-epost');
  var kopierKnapp = document.getElementById('kopier');
  var kopiStatus = document.getElementById('kopi-status');
  var startPaNytt = document.getElementById('start-pa-nytt');

  var naa = 1;
  var SISTE = 4;

  function tilgang(n) {
    var el = null;
    for (var i = 0; i < visninger.length; i++) {
      if (Number(visninger[i].getAttribute('data-vis')) === n) el = visninger[i];
    }
    return el;
  }

  function feltNavn(navn) {
    return Array.prototype.slice.call(skjema.querySelectorAll('[name="' + navn + '"]'));
  }

  function valgte() {
    return feltNavn('tjeneste')
      .filter(function (el) { return el.checked; })
      .map(function (el) { return el.value; });
  }

  function verdi(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function visFeil(nokkel, vis) {
    var el = skjema.querySelector('[data-feil="' + nokkel + '"]');
    if (el) el.hidden = !vis;
  }

  function gyldigEpost(verdiTekst) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdiTekst);
  }

  function sjekkSteg(n) {
    if (n === 1) {
      var ok = valgte().length > 0;
      visFeil('tjeneste', !ok);
      return ok;
    }
    if (n === 3) {
      var okNavn = verdi('navn').length > 1;
      var okEpost = gyldigEpost(verdi('epost'));
      visFeil('kontakt', !(okNavn && okEpost));
      return okNavn && okEpost;
    }
    return true;
  }

  function datoTekst(iso) {
    if (!iso) return '';
    var deler = iso.split('-');
    if (deler.length !== 3) return iso;
    return deler[2] + '.' + deler[1] + '.' + deler[0];
  }

  function lagSammendrag() {
    var rader = [];
    rader.push(['Leveranser', valgte().join(', ')]);
    rader.push(['Når', datoTekst(verdi('naar')) || 'Ikke oppgitt']);
    rader.push(['Hvor', verdi('sted') || 'Ikke oppgitt']);
    if (verdi('om')) rader.push(['Om oppdraget', verdi('om')]);
    rader.push(['Navn', verdi('navn')]);
    rader.push(['E-post', verdi('epost')]);
    if (verdi('telefon')) rader.push(['Telefon', verdi('telefon')]);
    return rader;
  }

  function tegnSammendrag() {
    if (!sammendrag) return;
    sammendrag.innerHTML = '';
    lagSammendrag().forEach(function (rad) {
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      sammendrag.appendChild(dt);
      sammendrag.appendChild(dd);
    });
  }

  function brevtekst() {
    var linjer = [];
    linjer.push('Hei!');
    linjer.push('');
    linjer.push('Jeg vil gjerne bestille følgende fra Virvel media:');
    linjer.push('');
    lagSammendrag().forEach(function (rad) {
      linjer.push(rad[0] + ': ' + rad[1]);
    });
    linjer.push('');
    linjer.push('Skrevet i forespørselsskjemaet på virvelmedia.no.');
    return linjer.join('\n');
  }

  function oppdaterSendLenke() {
    if (!sendLenke) return;
    var emne = 'Forespørsel fra ' + (verdi('navn') || 'nettsiden');
    sendLenke.setAttribute(
      'href',
      'mailto:stine@virvelmedia.no?subject=' +
        encodeURIComponent(emne) +
        '&body=' +
        encodeURIComponent(brevtekst())
    );
  }

  function vis(n, fokuser) {
    var flyttFokus = fokuser !== false;
    visninger.forEach(function (el) {
      el.hidden = Number(el.getAttribute('data-vis')) !== n;
    });

    prikker.forEach(function (el) {
      var steg = Number(el.getAttribute('data-steg'));
      el.classList.toggle('is-aktiv', steg === n);
      el.classList.toggle('is-ferdig', steg < n);
    });

    if (knapperad) knapperad.hidden = n === 5;
    if (tilbakeKnapp) tilbakeKnapp.hidden = n === 1 || n === 5;
    if (nesteKnapp) {
      nesteKnapp.hidden = n === 5;
      nesteKnapp.textContent = n === SISTE ? 'Lag forespørselen' : n === 1 ? 'Neste' : n === 2 ? 'Neste' : 'Se over';
    }

    var navn = ['Behov', 'Når og hvor', 'Kontakt', 'Se over'];
    if (status && n >= 1 && n <= SISTE) {
      status.textContent = 'Steg ' + n + ' av ' + SISTE + ': ' + navn[n - 1];
    }

    var aktiv = tilgang(n);
    if (aktiv && n !== 5 && flyttFokus) {
      aktiv.setAttribute('tabindex', '-1');
      var forste = aktiv.querySelector('input, textarea, a, button');
      if (forste) forste.focus({ preventScroll: true });
      else aktiv.focus({ preventScroll: true });
    }

    if (n === SISTE) {
      tegnSammendrag();
      oppdaterSendLenke();
    }
  }

  nesteKnapp.addEventListener('click', function () {
    if (!sjekkSteg(naa)) {
      var forsteFeil = skjema.querySelector('.feilmelding:not([hidden])');
      if (forsteFeil) forsteFeil.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    if (naa === SISTE) {
      tegnSammendrag();
      oppdaterSendLenke();
      vis(5);
      if (status) status.textContent = 'Forespørselen er satt sammen. Ingenting er sendt ennå.';
      if (kopiStatus) kopiStatus.textContent = '';
      if (sendLenke) sendLenke.focus({ preventScroll: true });
      return;
    }
    naa += 1;
    vis(naa);
  });

  tilbakeKnapp.addEventListener('click', function () {
    if (naa > 1) {
      naa -= 1;
      vis(naa);
    }
  });

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    nesteKnapp.click();
  });

  if (kopierKnapp) {
    kopierKnapp.addEventListener('click', function () {
      var tekst = brevtekst();
      function kvitter(melding) {
        if (kopiStatus) kopiStatus.textContent = melding;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () {
          kvitter('Teksten er kopiert. Lim den inn i e-posten din.');
        }, function () {
          kvitter('Nettleseren stoppet kopieringen. Du kan merke teksten i e-posten og kopiere den derfra.');
        });
        return;
      }
      var hjelp = document.createElement('textarea');
      hjelp.value = tekst;
      hjelp.setAttribute('readonly', 'readonly');
      hjelp.style.position = 'absolute';
      hjelp.style.left = '-9999px';
      document.body.appendChild(hjelp);
      hjelp.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (feil) {
        ok = false;
      }
      document.body.removeChild(hjelp);
      kvitter(ok ? 'Teksten er kopiert. Lim den inn i e-posten din.' : 'Kopieringen virket ikke i denne nettleseren.');
    });
  }

  if (startPaNytt) {
    startPaNytt.addEventListener('click', function () {
      skjema.reset();
      visFeil('tjeneste', false);
      visFeil('kontakt', false);
      if (kopiStatus) kopiStatus.textContent = '';
      naa = 1;
      vis(1);
      var forsteValg = skjema.querySelector('input[name="tjeneste"]');
      if (forsteValg) forsteValg.focus({ preventScroll: true });
    });
  }

  vis(1, false);
})();
