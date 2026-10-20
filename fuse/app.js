/*
  Fuse-demoen — all logikk er lokal og leser bare det brukeren selv velger.
  Ingenting sendes til en server; «Send til Stine» åpner brukerens egen e-postklient.
*/
(function () {
  'use strict';

  /* --- Mobilmeny ------------------------------------------------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('hovedmeny');
  var smalSkjerm = window.matchMedia('(max-width: 900px)');

  function settMeny(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      settMeny(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && smalSkjerm.matches) settMeny(false);
    });

    smalSkjerm.addEventListener('change', function (event) {
      if (!event.matches) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        settMeny(false);
        toggle.focus();
      }
    });
  }

  /* --- Svarskissen ----------------------------------------------------- */

  var skjema = document.getElementById('svar-skjema');
  if (!skjema) return;

  var stegEls = Array.prototype.slice.call(document.querySelectorAll('.steg'));
  var indPunkter = Array.prototype.slice.call(document.querySelectorAll('#steg-ind li'));
  var feilEl = document.getElementById('svar-feil');
  var kvittering = document.getElementById('kvittering');
  var kvListe = document.getElementById('kv-liste');
  var kvMeta = document.getElementById('kv-meta');
  var kvIngress = document.getElementById('kv-ingress');
  var kvTittel = document.getElementById('kv-tittel');
  var kvStatus = document.getElementById('kv-status');
  var kopierKnapp = document.getElementById('kopier');
  var nullstillKnapp = document.getElementById('nullstill');
  var sendKnapp = kvittering.querySelector('a[href^="mailto:"]');
  var aktivSteg = 1;

  var produkter = {
    studio: {
      navn: 'Fuse Studio',
      tekst: 'Grensesnittet der alle ansatte ser kunder, kampanjer, bookinger og innhold – og samarbeider i sanntid.'
    },
    app: {
      navn: 'Fuse App',
      tekst: 'iOS og Android raskt og kostnadseffektivt, med design og brukeropplevelse tilpasset ned til minste detalj.'
    },
    web: {
      navn: 'Fuse Web',
      tekst: 'Moderne webapper tilpasset deres behov, for å nå ut til og interagere med kundene på nett.'
    },
    pay: {
      navn: 'Fuse Pay',
      tekst: 'Engangs- eller gjentakende betalinger via nettside eller app, fullintegrert i løsningen.'
    },
    engage: {
      navn: 'Fuse Engage',
      tekst: 'Personlige brukerreiser med automatisert e-post, push-varsler, SMS og innhold i appen, styrt fra Fuse Studio.'
    },
    core: {
      navn: 'Fuse Core',
      tekst: 'Forvaltning, hosting, lisenser, feilsøking, overvåking og infrastruktur – ende-til-ende ansvar i drift.'
    }
  };

  var rekkefolge = ['studio', 'app', 'web', 'pay', 'engage', 'core'];

  var statusTekst = {
    ingenting: 'Vi har ingenting i dag',
    videre: 'Vi har noe som skal videreutvikles',
    drift: 'Vi har en løsning som må driftes'
  };

  function visFeil(melding) {
    if (feilEl) feilEl.textContent = melding || '';
  }

  function visSteg(n, flyttFokus) {
    aktivSteg = n;
    stegEls.forEach(function (steg) {
      steg.hidden = Number(steg.getAttribute('data-steg')) !== n;
    });
    indPunkter.forEach(function (punkt) {
      var nummer = Number(punkt.getAttribute('data-steg'));
      if (nummer === n) {
        punkt.setAttribute('data-aktiv', 'ja');
        punkt.removeAttribute('data-ferdig');
      } else {
        punkt.removeAttribute('data-aktiv');
        if (nummer < n) punkt.setAttribute('data-ferdig', 'ja');
        else punkt.removeAttribute('data-ferdig');
      }
    });
    visFeil('');
    if (flyttFokus) {
      var forste = skjema.querySelector('.steg[data-steg="' + n + '"] input');
      if (forste) forste.focus();
    }
  }

  function valgteBehov() {
    return Array.prototype.slice
      .call(skjema.querySelectorAll('input[name="behov"]:checked'))
      .map(function (input) { return input.value; });
  }

  function valgtStatus() {
    var valgt = skjema.querySelector('input[name="status"]:checked');
    return valgt ? valgt.value : '';
  }

  function tekstfelt(selector) {
    var felt = skjema.querySelector(selector);
    return felt ? felt.value.trim() : '';
  }

  function gyldigEpost(verdi) {
    return verdi === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function sjekkSteg(n) {
    if (n === 1 && valgteBehov().length === 0) {
      visFeil('Velg minst ett behov før du går videre.');
      return false;
    }
    if (n === 2 && !valgtStatus()) {
      visFeil('Velg hvor dere står i dag.');
      return false;
    }
    if (n === 3) {
      if (!tekstfelt('input[name="navn"]')) {
        visFeil('Fyll inn navnet ditt.');
        skjema.querySelector('input[name="navn"]').focus();
        return false;
      }
      if (!tekstfelt('input[name="selskap"]')) {
        visFeil('Fyll inn navnet på selskapet.');
        skjema.querySelector('input[name="selskap"]').focus();
        return false;
      }
      if (!gyldigEpost(tekstfelt('input[name="epost"]'))) {
        visFeil('E-postadressen ser ikke ut som en gyldig adresse.');
        skjema.querySelector('input[name="epost"]').focus();
        return false;
      }
    }
    visFeil('');
    return true;
  }

  function byggOppsummering() {
    var valgt = valgteBehov();
    var linjer = [];
    linjer.push('Fuse – skisse fra svarskissen');
    linjer.push('');
    linjer.push('Navn: ' + tekstfelt('input[name="navn"]'));
    linjer.push('Selskap: ' + tekstfelt('input[name="selskap"]'));
    var epost = tekstfelt('input[name="epost"]');
    if (epost) linjer.push('E-post: ' + epost);
    linjer.push('Hvor dere står: ' + statusTekst[valgtStatus()]);
    linjer.push('');
    linjer.push('Kombinasjonen:');
    var nummer = 0;
    rekkefolge.forEach(function (nokkel) {
      if (valgt.indexOf(nokkel) === -1) return;
      nummer += 1;
      linjer.push(nummer + '. ' + produkter[nokkel].navn + ' – ' + produkter[nokkel].tekst);
    });
    linjer.push('');
    linjer.push('Fuse Core er grunnlaget for alle Fuse-produkter.');
    linjer.push('Ingenting er sendt. Ring +47 24 02 27 27 eller skriv til stine@fuse.no.');
    return linjer.join('\n');
  }

  function visKvittering() {
    var valgt = valgteBehov();
    var nummer = 0;

    kvListe.innerHTML = '';
    rekkefolge.forEach(function (nokkel) {
      if (valgt.indexOf(nokkel) === -1) return;
      nummer += 1;
      var li = document.createElement('li');
      var nr = document.createElement('span');
      nr.className = 'kvittering__nr';
      nr.textContent = String(nummer).padStart(2, '0');
      var innhold = document.createElement('span');
      var navn = document.createElement('span');
      navn.className = 'kvittering__navn';
      navn.textContent = produkter[nokkel].navn;
      var tekst = document.createElement('span');
      tekst.className = 'kvittering__tekst';
      tekst.textContent = produkter[nokkel].tekst;
      innhold.appendChild(navn);
      innhold.appendChild(tekst);
      li.appendChild(nr);
      li.appendChild(innhold);
      kvListe.appendChild(li);
    });

    var rader = [
      ['Navn', tekstfelt('input[name="navn"]')],
      ['Selskap', tekstfelt('input[name="selskap"]')]
    ];
    var epost = tekstfelt('input[name="epost"]');
    if (epost) rader.push(['E-post', epost]);
    rader.push(['Hvor dere står', statusTekst[valgtStatus()]]);

    kvMeta.innerHTML = '';
    rader.forEach(function (rad) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      kvMeta.appendChild(div);
    });

    kvIngress.textContent = 'Basert på tre svar fra ' + tekstfelt('input[name="navn"]') +
      ' i ' + tekstfelt('input[name="selskap"]') + '. Skissen foreslår denne kombinasjonen:';

    skjema.hidden = true;
    document.getElementById('steg-ind').hidden = true;
    kvittering.hidden = false;
    kvStatus.textContent = '';
    kvTittel.focus();

    if (sendKnapp) {
      sendKnapp.href = 'mailto:stine@fuse.no' +
        '?subject=' + encodeURIComponent('Behov fra svarskissen – ' + tekstfelt('input[name="selskap"]')) +
        '&body=' + encodeURIComponent(byggOppsummering());
    }
  }

  skjema.addEventListener('click', function (event) {
    var neste = event.target.closest('[data-neste]');
    var tilbake = event.target.closest('[data-tilbake]');
    if (neste && sjekkSteg(aktivSteg)) visSteg(aktivSteg + 1, true);
    if (tilbake) visSteg(Math.max(1, aktivSteg - 1), true);
  });

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!sjekkSteg(3)) return;
    visKvittering();
  });

  skjema.addEventListener('change', function () { visFeil(''); });
  skjema.addEventListener('input', function () { visFeil(''); });

  if (kopierKnapp) {
    kopierKnapp.addEventListener('click', function () {
      var tekst = byggOppsummering();
      function kvitter(melding) {
        if (kvStatus) kvStatus.textContent = melding;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () {
          kvitter('Oppsummeringen er kopiert. Ingenting er sendt.');
        }, function () {
          kvitter('Nettleseren lot oss ikke kopiere. Merk teksten og kopier manuelt.');
        });
      } else {
        kvitter('Nettleseren støtter ikke kopiering her. Merk teksten og kopier manuelt.');
      }
    });
  }

  if (nullstillKnapp) {
    nullstillKnapp.addEventListener('click', function () {
      skjema.reset();
      skjema.hidden = false;
      document.getElementById('steg-ind').hidden = false;
      kvittering.hidden = true;
      visSteg(1);
      skjema.querySelector('input[name="behov"]').focus();
    });
  }

  visSteg(1);
})();
