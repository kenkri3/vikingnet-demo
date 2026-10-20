/*
  Zegabit — interaksjon uten backend.
  1) Mobilmeny.
  2) Forespørselen: fire steg, validering, sammendrag og en kvittering med
     referansenummer. Alt skjer i nettleseren. Ingenting sendes til en server:
     kvitteringen ender i en mailto: til Zegabits egen adresse, slik en statisk
     side må gjøre det.
*/

(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Åpne meny');
      }
    });
  }

  /* ---------- Forespørselen ---------- */

  var form = document.getElementById('wiz');
  if (!form) return;

  var panels = form.querySelectorAll('[data-panel]');
  var dots = form.querySelectorAll('[data-stepdot]');
  var nextBtn = form.querySelector('[data-next]');
  var backBtn = form.querySelector('[data-back]');
  var copyBtn = form.querySelector('[data-copy]');
  var navRow = form.querySelector('.wiz__nav');
  var statusEl = document.getElementById('wizStatus');
  var announceEl = document.getElementById('wizAnnounce');
  var sumList = document.getElementById('sumList');
  var liveList = document.getElementById('liveList');
  var refEl = document.getElementById('refNum');
  var mailBtn = document.getElementById('mailBtn');

  var MOTTAKER = 'sindre@zegabit.no';
  var steg = 1;
  var referanse = '';

  function felt(selector) {
    return form.querySelector(selector);
  }

  function valgtType() {
    var valgt = form.querySelector('input[name="type"]:checked');
    return valgt ? valgt.value : '';
  }

  function valgteBehov() {
    var ut = [];
    var bokser = form.querySelectorAll('input[name="behov"]:checked');
    for (var i = 0; i < bokser.length; i++) ut.push(bokser[i].value);
    return ut;
  }

  function hent() {
    return {
      type: valgtType(),
      behov: valgteBehov(),
      start: felt('[name="start"]') ? felt('[name="start"]').value : '',
      navn: felt('[name="navn"]') ? felt('[name="navn"]').value.trim() : '',
      epost: felt('[name="epost"]') ? felt('[name="epost"]').value.trim() : '',
      firma: felt('[name="firma"]') ? felt('[name="firma"]').value.trim() : '',
      melding: felt('[name="melding"]') ? felt('[name="melding"]').value.trim() : ''
    };
  }

  function melding(tekst, feltNode) {
    statusEl.textContent = tekst || '';
    if (feltNode) {
      feltNode.setAttribute('aria-invalid', 'true');
      feltNode.focus();
    }
  }

  function kunngjor(tekst) {
    if (!announceEl) return;
    announceEl.textContent = '';
    window.setTimeout(function () {
      announceEl.textContent = tekst;
    }, 60);
  }

  function godEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(verdi);
  }

  function sjekkSteg(n) {
    var d = hent();
    if (n === 1 && !d.type) {
      melding('Velg hva slags oppdrag det er, så går vi videre.');
      return false;
    }
    if (n === 3) {
      if (!d.navn) {
        melding('Skriv inn navnet ditt.', felt('[name="navn"]'));
        return false;
      }
      if (!d.epost) {
        melding('Skriv inn e-postadressen din, så vi kan svare.', felt('[name="epost"]'));
        return false;
      }
      if (!godEpost(d.epost)) {
        melding('E-postadressen ser ikke riktig ut. Skriv den som navn@firma.no.', felt('[name="epost"]'));
        return false;
      }
    }
    statusEl.textContent = '';
    return true;
  }

  function visSteg(n) {
    for (var i = 0; i < panels.length; i++) {
      var nummer = Number(panels[i].getAttribute('data-panel'));
      panels[i].hidden = nummer !== n;
    }

    for (var j = 0; j < dots.length; j++) {
      var d = Number(dots[j].getAttribute('data-stepdot'));
      dots[j].classList.toggle('is-active', d === n);
      dots[j].classList.toggle('is-done', n > d || n > 3);
    }

    if (backBtn) {
      backBtn.hidden = n === 1 || n === 5;
      backBtn.textContent = n === 4 ? 'Endre svarene' : 'Tilbake';
    }
    if (nextBtn) {
      nextBtn.hidden = n === 5;
      nextBtn.textContent = n === 3 ? 'Se sammendrag' : n === 4 ? 'Registrer forespørsel' : 'Neste';
    }
    if (navRow) navRow.hidden = n === 5;

    if (n !== steg && n <= 3) {
      kunngjor('Steg ' + n + ' av 3: ' + ['type oppdrag', 'behov', 'kontakt'][n - 1]);
    }
    steg = n;

    if (n === 4) tegnSammendrag();
    if (n === 5) {
      refEl.setAttribute('tabindex', '-1');
      refEl.focus();
    } else {
      var forste = panels[n - 1].querySelector('input, select, textarea, button');
      if (forste && n > 1) forste.focus();
    }
  }

  /* ---------- Sammendrag ---------- */

  function sammendrag() {
    var d = hent();
    var rader = [
      ['Type', d.type],
      ['Behov', d.behov.join(', ')],
      ['Oppstart', d.start],
      ['Navn', d.navn],
      ['E-post', d.epost],
      ['Firma', d.firma],
      ['Om oppdraget', d.melding]
    ];
    return rader.filter(function (rad) {
      return String(rad[1]).trim() !== '';
    });
  }

  function tegnSammendrag() {
    var rader = sammendrag();
    sumList.textContent = '';
    rader.forEach(function (rad) {
      var div = document.createElement('div');
      div.className = 'sum__row';
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      sumList.appendChild(div);
    });
  }

  function tegnLive() {
    var rader = sammendrag();
    liveList.textContent = '';
    if (!rader.length) {
      var tom = document.createElement('li');
      tom.className = 'livecard__empty';
      tom.textContent = 'Ingen valg ennå.';
      liveList.appendChild(tom);
      return;
    }
    rader.forEach(function (rad) {
      var li = document.createElement('li');
      var b = document.createElement('b');
      b.textContent = rad[0] + ': ';
      li.appendChild(b);
      li.appendChild(document.createTextNode(rad[1]));
      liveList.appendChild(li);
    });
  }

  /* ---------- Tekst til e-post og utklippstavle ---------- */

  function lagRef() {
    var naa = new Date();
    var dato = String(naa.getFullYear()) +
      String(naa.getMonth() + 1).padStart(2, '0') +
      String(naa.getDate()).padStart(2, '0');
    var nr = String(Math.floor(100 + Math.random() * 900));
    return 'ZB-' + dato + '-' + nr;
  }

  function somTekst() {
    var rader = sammendrag();
    var linjer = ['Forespørsel fra zegabit.no'];
    if (referanse) linjer.push('Referanse: ' + referanse);
    linjer.push('');
    rader.forEach(function (rad) {
      linjer.push(rad[0] + ': ' + rad[1]);
    });
    return linjer.join('\n');
  }

  function registrer() {
    referanse = lagRef();
    refEl.textContent = referanse;

    var emne = 'Forespørsel: ' + (hent().type || 'nettsiden');
    var kropp = somTekst() + '\n\nSendt fra nettsiden til Zegabit.';
    mailBtn.setAttribute('href', 'mailto:' + MOTTAKER +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(kropp));

    visSteg(5);
    statusEl.textContent = '';
    kunngjor('Forespørselen er klar med referanse ' + referanse + '. Ingenting er sendt før du sender e-posten.');
  }

  /* ---------- Knapper ---------- */

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (steg === 4) {
        registrer();
        return;
      }
      if (!sjekkSteg(steg)) return;
      visSteg(steg + 1);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (steg > 1) visSteg(steg - 1);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var tekst = somTekst();
      function kvitter(meldingstekst) {
        statusEl.textContent = meldingstekst;
        copyBtn.textContent = 'Kopiert';
        window.setTimeout(function () {
          copyBtn.textContent = 'Kopier sammendraget';
        }, 2400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () {
          kvitter('Sammendraget er kopiert. Lim det inn i en e-post til ' + MOTTAKER + '.');
        }, function () {
          kvitter('Nettleseren stoppet kopieringen — merk teksten og kopier manuelt.');
        });
        return;
      }
      var omrade = document.createElement('textarea');
      omrade.value = tekst;
      omrade.setAttribute('readonly', '');
      omrade.style.position = 'absolute';
      omrade.style.left = '-9999px';
      document.body.appendChild(omrade);
      omrade.select();
      try {
        document.execCommand('copy');
        kvitter('Sammendraget er kopiert.');
      } catch (feil) {
        kvitter('Kopieringen virket ikke — merk teksten og kopier manuelt.');
      }
      document.body.removeChild(omrade);
    });
  }

  /* ---------- Skjemafelt ---------- */

  form.addEventListener('input', function (event) {
    if (event.target.getAttribute('aria-invalid') === 'true') {
      event.target.removeAttribute('aria-invalid');
      statusEl.textContent = '';
    }
    tegnLive();
  });

  form.addEventListener('change', function () {
    tegnLive();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (steg === 4) registrer();
    else if (sjekkSteg(steg)) visSteg(steg + 1);
  });

  visSteg(1);
  tegnLive();
})();
