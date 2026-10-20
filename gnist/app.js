/* Gnist — interaksjon.
   Alt kjører i nettleseren. Bookingflyten lager et e-postutkast (mailto) og
   lagrer eller sender ingenting selv. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------------- Mobilmeny ---------------- */
  var toggle = $('.nav-toggle');
  var nav = $('#hovedmeny');

  if (toggle && nav) {
    var settMeny = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
      nav.hidden = !open;
    };

    if (window.matchMedia('(max-width: 900px)').matches) nav.hidden = true;

    toggle.addEventListener('click', function () {
      settMeny(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') settMeny(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) settMeny(true);
    });
  }

  /* ---------------- Årstall i footer ---------------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------- Booking ---------------- */
  var book = $('#book');
  if (!book) return;

  var panelEls = $$('.book__panel', book);
  var stegTekst = $('#bookSteg');
  var live = $('#bookLive');
  var meter = $$('.book__meter span', book);
  var dagerEl = $('#dager');
  var tiderEl = $('#tider');
  var tiderTom = $('#tiderTom');
  var tiderLabel = $('#tiderLabel');
  var skjema = $('#bookSkjema');

  var STEG_TEKST = {
    1: 'Steg 1 av 3 · Velg tema',
    2: 'Steg 2 av 3 · Velg dag og tid',
    3: 'Steg 3 av 3 · Kontaktinfo',
    4: 'Kvittering · klar til å sende'
  };

  var state = { tema: '', dato: null, dagIndeks: -1, tid: '' };
  var oppsummering = '';

  var pad = function (n) { return String(n).padStart(2, '0'); };

  var isoDato = function (d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };

  var langDato = function (d) {
    return d.toLocaleDateString('nb-NO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  function vis(steg) {
    panelEls.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute('data-panel')) !== steg;
    });

    if (stegTekst) stegTekst.textContent = STEG_TEKST[steg] || '';
    meter.forEach(function (stripe, i) {
      stripe.classList.toggle('is-on', steg === 4 ? true : i < steg);
    });

    if (live) live.textContent = STEG_TEKST[steg] || '';

    if (steg === 3) {
      window.setTimeout(function () {
        var navnFelt = $('#navn');
        if (navnFelt) navnFelt.focus({ preventScroll: true });
      }, 80);
    }
  }

  /* Seks ukedager fra og med i morgen. */
  function nesteUkedager(antall) {
    var dager = [];
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (dager.length < antall) {
      if (d.getDay() !== 0 && d.getDay() !== 6) dager.push(new Date(d.getTime()));
      d.setDate(d.getDate() + 1);
    }
    return dager;
  }

  function lagDager() {
    if (!dagerEl) return;
    dagerEl.innerHTML = '';

    nesteUkedager(6).forEach(function (dato, indeks) {
      var knapp = document.createElement('button');
      knapp.type = 'button';
      knapp.className = 'dag';
      knapp.setAttribute('data-dato', isoDato(dato));
      knapp.setAttribute('aria-pressed', 'false');
      knapp.textContent = dato.toLocaleDateString('nb-NO', {
        weekday: 'short', day: 'numeric', month: 'short'
      });

      knapp.addEventListener('click', function () {
        state.dato = dato;
        state.dagIndeks = indeks;
        state.tid = '';
        $$('.dag', dagerEl).forEach(function (annen) {
          annen.setAttribute('aria-pressed', String(annen === knapp));
        });
        visTider(indeks);
      });

      dagerEl.appendChild(knapp);
    });
  }

  /* Ledige tider varierer med dagen, men er alltid de samme for samme dag. */
  function visTider(dagIndeks) {
    if (!tiderEl) return;
    tiderEl.innerHTML = '';
    tiderEl.hidden = false;
    if (tiderTom) tiderTom.hidden = true;
    if (tiderLabel) tiderLabel.textContent = 'Ledige tider ' + (state.dato ? '· ' + state.dato.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' }) : '');

    ['09:00', '11:00', '13:00', '15:00'].forEach(function (klokke, i) {
      var opptatt = (i + dagIndeks) % 3 === 0;
      var knapp = document.createElement('button');
      knapp.type = 'button';
      knapp.className = 'tid';
      knapp.textContent = klokke;

      if (opptatt) {
        knapp.disabled = true;
        knapp.title = 'Opptatt';
        knapp.setAttribute('aria-label', klokke + ' — opptatt');
      } else {
        knapp.setAttribute('aria-pressed', 'false');
        knapp.addEventListener('click', function () {
          state.tid = klokke;
          $$('.tid', tiderEl).forEach(function (annen) {
            if (!annen.disabled) annen.setAttribute('aria-pressed', String(annen === knapp));
          });
          vis(3);
        });
      }

      tiderEl.appendChild(knapp);
    });
  }

  $$('.chip', book).forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      $$('.chip', book).forEach(function (annen) {
        annen.setAttribute('aria-pressed', String(annen === knapp));
      });
      state.tema = knapp.getAttribute('data-tema');
      window.setTimeout(function () { vis(2); }, 180);
    });
  });

  $$('[data-tilbake]', book).forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      vis(Number(knapp.getAttribute('data-tilbake')));
    });
  });

  if (skjema) {
    skjema.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!skjema.checkValidity()) {
        if (typeof skjema.reportValidity === 'function') skjema.reportValidity();
        return;
      }

      if (!state.tema || !state.dato || !state.tid) {
        vis(state.tema ? 2 : 1);
        return;
      }

      var navn = ($('#navn') || {}).value || '';
      var epost = ($('#epost') || {}).value || '';
      var bedrift = ($('#bedrift') || {}).value || '';
      var melding = ($('#melding') || {}).value || '';

      navn = navn.trim();
      epost = epost.trim();
      bedrift = bedrift.trim();
      melding = melding.trim();

      var dagTekst = langDato(state.dato);

      var sett = function (id, tekst) {
        var el = document.getElementById(id);
        if (el) el.textContent = tekst;
      };

      sett('sumTema', state.tema);
      sett('sumDag', dagTekst);
      sett('sumTid', state.tid);
      sett('sumNavn', navn);
      sett('sumEpost', epost);
      sett('sumBedrift', bedrift || 'Ikke oppgitt');

      var linjer = [
        'Hei,',
        '',
        'Vi ønsker en uforpliktende prat med Gnist.',
        '',
        'Tema: ' + state.tema,
        'Dag: ' + dagTekst,
        'Klokkeslett: ' + state.tid,
        'Navn: ' + navn,
        'E-post: ' + epost
      ];

      if (bedrift) linjer.push('Virksomhet: ' + bedrift);
      if (melding) linjer.push('', 'Kort om saken: ' + melding);

      linjer.push('', 'Tidspunktet er et forslag fra nettsiden — si gjerne fra om en annen tid passer bedre.');

      oppsummering = linjer.join('\n');

      var emne = 'Forespørsel om en prat – ' + state.tema + ', ' + dagTekst + ' kl. ' + state.tid;
      var lenke = $('#mailtoLenke');
      if (lenke) {
        lenke.href = 'mailto:ellen-marie@gnist.as'
          + '?subject=' + encodeURIComponent(emne)
          + '&body=' + encodeURIComponent(oppsummering);
      }

      vis(4);
    });
  }

  var kopier = $('#kopier');
  if (kopier) {
    var giTilbakemelding = function () {
      var opprinnelig = 'Kopier oppsummeringen';
      kopier.textContent = 'Kopiert';
      window.setTimeout(function () { kopier.textContent = opprinnelig; }, 2200);
    };

    var kopierMedTekstfelt = function () {
      var felt = document.createElement('textarea');
      felt.value = oppsummering;
      felt.setAttribute('readonly', '');
      felt.style.position = 'fixed';
      felt.style.top = '-1000px';
      document.body.appendChild(felt);
      felt.select();
      try {
        document.execCommand('copy');
        giTilbakemelding();
      } catch (feil) {
        /* Nettleseren nekter — brukeren kan markere teksten selv. */
      }
      document.body.removeChild(felt);
    };

    kopier.addEventListener('click', function () {
      if (!oppsummering) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(oppsummering).then(giTilbakemelding, kopierMedTekstfelt);
      } else {
        kopierMedTekstfelt();
      }
    });
  }

  lagDager();
  if (tiderEl) tiderEl.hidden = true;
  if (tiderTom) tiderTom.hidden = false;
  vis(1);
})();
