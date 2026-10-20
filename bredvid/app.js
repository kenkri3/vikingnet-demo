/* Bredvid — demo. Alt skjer i nettleseren: ingen data sendes noe sted. */
(function () {
  'use strict';

  var KR = 'kontakt@bredvid.no';

  /* ---------------- Mobilmeny ---------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  var smalSkjerm = window.matchMedia('(max-width: 900px)');

  if (toggle && nav) {
    /* På smal skjerm skal menyen starte lukket — ellers legger den seg
       over herotittelen før brukeren har trykket på noe. */
    function settMeny() {
      nav.hidden = smalSkjerm.matches;
      toggle.setAttribute('aria-expanded', smalSkjerm.matches ? 'false' : 'true');
    }

    settMeny();

    if (smalSkjerm.addEventListener) {
      smalSkjerm.addEventListener('change', settMeny);
    } else if (smalSkjerm.addListener) {
      smalSkjerm.addListener(settMeny);
    }

    toggle.addEventListener('click', function () {
      var apen = nav.hidden;
      nav.hidden = !apen;
      toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && smalSkjerm.matches) {
        nav.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- Hjelpere ---------------- */

  var UKEDAGER = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
  var MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli',
    'august', 'september', 'oktober', 'november', 'desember'];

  function toSiffer(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function lagDager(antall) {
    var dager = [];
    var dato = new Date();
    dato.setHours(12, 0, 0, 0);
    while (dager.length < antall) {
      dato.setDate(dato.getDate() + 1);
      var dag = dato.getDay();
      if (dag === 0 || dag === 6) continue;
      dager.push({
        iso: dato.getFullYear() + '-' + toSiffer(dato.getMonth() + 1) + '-' + toSiffer(dato.getDate()),
        kort: UKEDAGER[dag].slice(0, 3),
        dato: dato.getDate() + '. ' + MANEDER[dato.getMonth()].slice(0, 3),
        lang: UKEDAGER[dag] + ' ' + dato.getDate() + '. ' + MANEDER[dato.getMonth()]
      });
    }
    return dager;
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function velg(beholder, knapp) {
    Array.prototype.forEach.call(beholder.querySelectorAll('[aria-pressed]'), function (b) {
      b.setAttribute('aria-pressed', b === knapp ? 'true' : 'false');
    });
  }

  function settAktiv(knapp, erAktiv) {
    knapp.setAttribute('aria-pressed', erAktiv ? 'true' : 'false');
  }

  /* ---------------- Booking ---------------- */

  var kort = document.getElementById('book-kort');

  if (kort) {
    var steg1 = document.getElementById('book-steg1');
    var steg2 = document.getElementById('book-steg2');
    var steg3 = document.getElementById('book-steg3');
    var kvit = document.getElementById('book-kvittering');
    var stegInd = document.getElementById('book-steg-ind');
    var prikker = kort.querySelectorAll('.prikk');
    var dagerBeholder = document.getElementById('book-dager');
    var tiderBeholder = document.getElementById('book-tider');
    var neste1 = document.getElementById('book-neste1');
    var neste2 = document.getElementById('book-neste2');
    var feilBoks = document.getElementById('book-feil');
    var navnFelt = document.getElementById('book-navn');
    var selskapFelt = document.getElementById('book-selskap');
    var epostFelt = document.getElementById('book-epost');

    var valg = { omrade: '', dag: '', tid: '' };
    var dager = lagDager(5);

    dager.forEach(function (dag) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dag-knapp';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('data-dag', dag.iso);
      b.innerHTML = '<span>' + dag.kort + '</span><strong>' + dag.dato + '</strong>';
      b.setAttribute('aria-label', dag.lang);
      dagerBeholder.appendChild(b);
    });

    function visSteg(n) {
      steg1.hidden = n !== 1;
      steg2.hidden = n !== 2;
      steg3.hidden = n !== 3;
      kvit.hidden = n !== 4;
      stegInd.textContent = n === 4 ? 'Klar til å sende' : 'Steg ' + n + ' av 3';
      for (var i = 0; i < prikker.length; i++) {
        prikker[i].classList.toggle('is-aktiv', i < n);
      }
    }

    kort.addEventListener('click', function (e) {
      var omradeKnapp = e.target.closest('.valg-knapp');
      if (omradeKnapp) {
        velg(kort.querySelector('.valg'), omradeKnapp);
        valg.omrade = omradeKnapp.getAttribute('data-omrade');
        neste1.disabled = false;
      }

      var dagKnapp = e.target.closest('.dag-knapp');
      if (dagKnapp) {
        velg(dagerBeholder, dagKnapp);
        valg.dag = dagKnapp.getAttribute('data-dag');
        // Dagen vises med sin fulle tekst i kvitteringen.
        for (var i = 0; i < dager.length; i++) {
          if (dager[i].iso === valg.dag) {
            valg.dagLang = dager[i].lang;
          }
        }
        oppdaterNeste2();
      }

      var tidKnapp = e.target.closest('.tid-knapp');
      if (tidKnapp) {
        velg(tiderBeholder, tidKnapp);
        valg.tid = tidKnapp.getAttribute('data-tid');
        oppdaterNeste2();
      }
    });

    function oppdaterNeste2() {
      neste2.disabled = !(valg.dag && valg.tid);
    }

    neste1.addEventListener('click', function () {
      visSteg(2);
    });

    document.getElementById('book-tilbake2').addEventListener('click', function () {
      visSteg(1);
    });

    neste2.addEventListener('click', function () {
      visSteg(3);
      navnFelt.focus();
    });

    document.getElementById('book-tilbake3').addEventListener('click', function () {
      visSteg(2);
    });

    function lagReferanse() {
      var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var ut = '';
      for (var i = 0; i < 4; i++) {
        ut += tegn.charAt(Math.floor(Math.random() * tegn.length));
      }
      return 'BR-' + ut;
    }

    document.getElementById('book-bekreft').addEventListener('click', function () {
      var navn = navnFelt.value.trim();
      var selskap = selskapFelt.value.trim();
      var epost = epostFelt.value.trim();

      if (!navn || !gyldigEpost(epost)) {
        feilBoks.hidden = false;
        (navn ? epostFelt : navnFelt).focus();
        return;
      }
      feilBoks.hidden = true;

      document.getElementById('kv-omrade').textContent = valg.omrade;
      document.getElementById('kv-dag').textContent = valg.dagLang || valg.dag;
      document.getElementById('kv-tid').textContent = valg.tid;
      document.getElementById('kv-navn').textContent = navn;
      document.getElementById('kv-selskap').textContent = selskap || 'Ikke oppgitt';
      document.getElementById('kv-epost').textContent = epost;

      var ref = lagReferanse();
      document.getElementById('kv-ref').textContent = ref;

      var emne = 'Forespørsel om en prat: ' + valg.omrade;
      var kropp = [
        'Hei Bredvid,',
        '',
        'Vi ønsker en uforpliktet prat om ' + valg.omrade.toLowerCase() + '.',
        'Foreslått tidspunkt: ' + (valg.dagLang || valg.dag) + ' kl. ' + valg.tid + '.',
        '',
        'Navn: ' + navn,
        'Selskap: ' + (selskap || 'ikke oppgitt'),
        'E-post: ' + epost,
        'Referanse: ' + ref
      ].join('\r\n');

      document.getElementById('kv-mailto').href =
        'mailto:' + KR + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);

      visSteg(4);
      document.getElementById('book-kvittering').focus();
    });

    document.getElementById('book-ny').addEventListener('click', function () {
      valg = { omrade: '', dag: '', tid: '' };
      navnFelt.value = '';
      selskapFelt.value = '';
      epostFelt.value = '';
      feilBoks.hidden = true;
      neste1.disabled = true;
      neste2.disabled = true;
      Array.prototype.forEach.call(kort.querySelectorAll('[aria-pressed]'), function (b) {
        b.setAttribute('aria-pressed', 'false');
      });
      visSteg(1);
      kort.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }

  /* ---------------- Kontaktskjema ---------------- */

  var skjema = document.getElementById('kontakt-skjema');

  if (skjema) {
    var kFeil = document.getElementById('k-feil');
    var kKvit = document.getElementById('kontakt-kvittering');
    var kTekst = document.getElementById('k-kv-tekst');
    var kLenke = document.getElementById('k-mailto');

    skjema.addEventListener('submit', function (e) {
      e.preventDefault();

      var navn = document.getElementById('k-navn').value.trim();
      var epost = document.getElementById('k-epost').value.trim();
      var selskap = document.getElementById('k-selskap').value.trim();
      var melding = document.getElementById('k-melding').value.trim();

      if (!navn || !gyldigEpost(epost) || melding.length < 5) {
        kFeil.hidden = false;
        kKvit.hidden = true;
        document.getElementById(!navn ? 'k-navn' : (!gyldigEpost(epost) ? 'k-epost' : 'k-melding')).focus();
        return;
      }
      kFeil.hidden = true;

      var emne = 'Henvendelse fra nettsiden: ' + navn;
      var kropp = [
        'Navn: ' + navn,
        'E-post: ' + epost,
        'Selskap: ' + (selskap || 'ikke oppgitt'),
        '',
        melding
      ].join('\r\n');

      kLenke.href = 'mailto:' + KR + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp);
      kTekst.textContent = 'Utkastet er adressert til ' + KR + ' med navn, e-post og meldingen din. Åpne det og send.';
      kKvit.hidden = false;
    });
  }
})();
