/*
  Bilagsfeber — interaksjon.
  To ting: mobilmenyen og en forespørsel i tre steg som ender i en
  kvittering brukeren kan kopiere eller sende på e-post. Alt skjer i
  nettleseren; det finnes ingen server, og ingenting sendes herfra.
*/
(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('.nav-toggle');
  var meny = document.getElementById('hovedmeny');

  if (toggle && meny) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      meny.hidden = open;
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a') && window.matchMedia('(max-width: 900px)').matches) {
        meny.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Forespørselen ---------- */

  var form = document.getElementById('tilbud-skjema');
  if (!form) return;

  var panels = Array.prototype.slice.call(form.querySelectorAll('.steg-panel'));
  var bars = Array.prototype.slice.call(document.querySelectorAll('.fremdrift__steg'));
  var chips = Array.prototype.slice.call(form.querySelectorAll('.valg__knapp'));

  var oppsummering = document.getElementById('sammendrag');
  var receipt = document.getElementById('kvittering');
  var receiptSummary = document.getElementById('kvittering-sammendrag');
  var epostLenke = document.getElementById('epost-lenke');
  var kopierKnapp = document.getElementById('kopier');
  var kopierStatus = document.getElementById('kopier-status');
  var nyKnapp = document.getElementById('start-pa-nytt');

  var fields = {
    bilag: document.getElementById('felt-bilag'),
    firma: document.getElementById('felt-firma'),
    navn: document.getElementById('felt-navn'),
    epost: document.getElementById('felt-epost'),
    telefon: document.getElementById('felt-telefon'),
    orgnr: document.getElementById('felt-orgnr')
  };

  var state = {
    tjeneste: '',
    bilag: '',
    firma: '',
    navn: '',
    epost: '',
    telefon: '',
    orgnr: '',
    tid: ''
  };

  var current = 1;

  function samle() {
    state.bilag = fields.bilag.value;
    state.firma = fields.firma.value.trim();
    state.navn = fields.navn.value.trim();
    state.epost = fields.epost.value.trim();
    state.telefon = fields.telefon.value.trim();
    state.orgnr = fields.orgnr.value.trim();
  }

  function settFeil(steg, melding) {
    var el = form.querySelector('.feilmelding[data-feil="' + steg + '"]');
    if (!el) return;
    if (melding) {
      el.textContent = melding;
      el.hidden = false;
    } else {
      el.textContent = '';
      el.hidden = true;
    }
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function valider(steg) {
    samle();

    if (steg === 1) {
      if (!state.tjeneste) {
        settFeil(1, 'Velg hva du trenger hjelp til, så går vi videre.');
        return false;
      }
      settFeil(1, '');
      return true;
    }

    if (steg === 2) {
      if (!state.firma) {
        settFeil(2, 'Fyll inn firmanavn, så vi vet hvem forespørselen gjelder.');
        fields.firma.focus();
        return false;
      }
      if (!state.navn) {
        settFeil(2, 'Fyll inn navnet ditt.');
        fields.navn.focus();
        return false;
      }
      if (!state.epost) {
        settFeil(2, 'Fyll inn e-postadressen vi kan svare deg på.');
        fields.epost.focus();
        return false;
      }
      if (!gyldigEpost(state.epost)) {
        settFeil(2, 'E-postadressen ser ikke riktig ut. Skriv den som navn@firma.no.');
        fields.epost.focus();
        return false;
      }
      settFeil(2, '');
      return true;
    }

    return true;
  }

  function rader() {
    var liste = [
      ['Tjeneste', state.tjeneste],
      ['Bilag i måneden', state.bilag || 'Vet ikke ennå'],
      ['Firma', state.firma],
      ['Navn', state.navn],
      ['E-post', state.epost]
    ];
    if (state.telefon) liste.push(['Telefon', state.telefon]);
    if (state.orgnr) liste.push(['Org.nr.', state.orgnr]);
    return liste;
  }

  function fyllListe(el, liste) {
    while (el.firstChild) el.removeChild(el.firstChild);
    liste.forEach(function (rad) {
      var dt = document.createElement('dt');
      dt.textContent = rad[0];
      var dd = document.createElement('dd');
      dd.textContent = rad[1];
      el.appendChild(dt);
      el.appendChild(dd);
    });
  }

  function visSteg(n) {
    current = n;
    panels.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute('data-steg')) !== n;
    });
    bars.forEach(function (bar, i) {
      bar.classList.toggle('er', i === n - 1);
      bar.classList.toggle('ferdig', i < n - 1);
    });
    if (n === 3) {
      samle();
      fyllListe(oppsummering, rader());
    }
    var panel = form.querySelector('.steg-panel[data-steg="' + n + '"]');
    if (panel) {
      panel.setAttribute('tabindex', '-1');
      panel.focus();
    }
  }

  function lagKvittering() {
    samle();
    var naa = new Date();
    state.tid = naa.toLocaleString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    fyllListe(receiptSummary, rader().concat([['Utfylt', state.tid]]));

    var linjer = rader().map(function (rad) {
      return rad[0] + ': ' + rad[1];
    });
    var emne = 'Uforpliktende tilbud – ' + (state.firma || 'forespørsel');
    var kropp = [
      'Hei Bilagsfeber,',
      '',
      'Jeg vil gjerne ha et uforpliktende tilbud på regnskap.',
      '',
      linjer.join('\n'),
      '',
      'Hilsen',
      state.navn
    ].join('\n');

    epostLenke.href =
      'mailto:marius@bilagsfeber.no?subject=' +
      encodeURIComponent(emne) +
      '&body=' +
      encodeURIComponent(kropp);

    form.hidden = true;
    receipt.hidden = false;
    bars.forEach(function (bar) {
      bar.classList.remove('er');
      bar.classList.add('ferdig');
    });
    receipt.focus();
  }

  function startPaNytt() {
    form.reset();
    state.tjeneste = '';
    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', 'false');
    });
    samle();
    settFeil(1, '');
    settFeil(2, '');
    kopierStatus.textContent = '';
    receipt.hidden = true;
    form.hidden = false;
    visSteg(1);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (annen) {
        annen.setAttribute('aria-pressed', annen === chip ? 'true' : 'false');
      });
      state.tjeneste = chip.getAttribute('data-verdi') || '';
      settFeil(1, '');
    });
  });

  form.querySelectorAll('[data-neste]').forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      if (valider(current)) visSteg(current + 1);
    });
  });

  form.querySelectorAll('[data-forrige]').forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      visSteg(Math.max(1, current - 1));
    });
  });

  Array.prototype.forEach.call(form.querySelectorAll('input, select'), function (felt) {
    felt.addEventListener('input', function () {
      settFeil(current, '');
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (current === 1) {
      if (valider(1)) visSteg(2);
      return;
    }
    if (current === 2) {
      if (valider(2)) visSteg(3);
      return;
    }
    if (valider(1) && valider(2)) lagKvittering();
  });

  if (kopierKnapp) {
    kopierKnapp.addEventListener('click', function () {
      var tekst = ['Forespørsel til Bilagsfeber', 'Utfylt: ' + state.tid, '']
        .concat(
          rader().map(function (rad) {
            return rad[0] + ': ' + rad[1];
          })
        )
        .join('\n');

      function merkTekst() {
        var omrade = document.createRange();
        omrade.selectNodeContents(receiptSummary);
        var valg = window.getSelection();
        if (!valg) return;
        valg.removeAllRanges();
        valg.addRange(omrade);
        kopierStatus.textContent = 'Teksten er merket – trykk Ctrl+C for å kopiere.';
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(function () {
          kopierStatus.textContent = 'Kopiert. Lim den inn i en e-post til marius@bilagsfeber.no.';
        }).catch(merkTekst);
      } else {
        merkTekst();
      }
    });
  }

  if (nyKnapp) {
    nyKnapp.addEventListener('click', startPaNytt);
  }
})();
