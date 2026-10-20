/* Crisp Ideas — demo.
   Alt kjører i nettleseren. Ingen backend, ingen sporing, ingen innsamling.
   Skjemaene faller tilbake på mailto: fordi GitHub Pages er statisk hosting. */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     Mobilmeny
     --------------------------------------------------------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    var lukk = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Åpne meny');
    };

    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') lukk();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') lukk();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 940) lukk();
    });
  }

  /* ---------------------------------------------------------
     Brief-bygger — tre spørsmål, ett ferdig utkast
     --------------------------------------------------------- */
  var briefForm = document.querySelector('[data-brief]');

  if (briefForm) {
    var utskrift = document.querySelector('[data-brief-output]');
    var statusEl = document.querySelector('[data-brief-status]');
    var datoEl = document.querySelector('[data-brief-date]');
    var epostLenke = document.querySelector('[data-brief-mail]');
    var kopierKnapp = document.querySelector('[data-brief-copy]');

    var svar = { maal: '', leveranse: '', horisont: '' };

    var opplegg = {
      maal: {
        'Finansiering og eierskap':
          'Finansieringsløp og eierstrategi, med opsjonalitet og sekvensielle trinn modellert som beslutningstre.',
        'Marked og markedsposisjon':
          'Markedsstørrelse fra både etterspørsels- og tilbudssiden, med egen metodikk og tydelige forutsetninger.',
        'Teknologi- og produktvalg':
          'Teknologigap-analyse og veikart, med kostnadsanslag for å tette gapene.',
        'Partnerskap og oppkjøp':
          'Vurdering av partner- og oppkjøpskandidater, med usikkerhet og opsjonsverdi synliggjort.',
        'Salg, kanal og vekst':
          'Salgs- og markedsprosess, kanalvalg og CRM-utrulling, med oppfølging til resultatene kommer.'
      },
      leveranse: {
        'Analyse og modell':
          'En modell dere kan bruke selv: beslutningstre i DPL, systemdynamikkmodell eller markedsmodell.',
        'Strategi og anbefaling':
          'Et beslutningsdokument for toppledelse eller styre, der anbefaling og forutsetninger er tydelig atskilt.',
        'Forretningsplan og gjennomføring':
          'Forretningsplan, og hands-on gjennomføring sammen med eier, gründer og organisasjon.'
      },
      horisont: {
        'Innen fire uker':
          'Kort løp. Da må vi avgrense analysen hardt og heller levere én beslutning enn fem.',
        'Om én til tre måneder':
          'Ett kvartal gir rom for innsikt, modell og en anbefaling som tåler å bli utfordret.',
        'Om tre til seks måneder':
          'Vi kan gå bredere: flere scenarioer, mer datainnsamling og en grundigere modell.',
        'Om seks til tolv måneder':
          'Lengre løp, normalt med flere beslutningspunkter underveis.',
        'Ikke avklart ennå':
          'Da begynner vi med å finne ut når beslutningen faktisk må tas. Det preger alt annet.'
      }
    };

    var TOM_TEKST =
      'Velg mål, leveranse og tidshorisont til venstre.\n' +
      'Så settes et ferdig brief-utkast sammen her — med\n' +
      'opplegg, kontaktinformasjon og plass til egne ord.';

    var datoStreng = function () {
      var d = new Date();
      var dag = String(d.getDate()).padStart(2, '0');
      var mnd = String(d.getMonth() + 1).padStart(2, '0');
      return dag + '.' + mnd + '.' + d.getFullYear();
    };

    var lagBrief = function () {
      var komplett = svar.maal && svar.leveranse && svar.horisont;

      datoEl.textContent = datoStreng();

      if (!komplett) {
        utskrift.textContent = TOM_TEKST;
        statusEl.textContent = 'Aktiveres når du har svart på alle tre';
        epostLenke.href =
          'mailto:grimg@crispideas.com?subject=' + encodeURIComponent('Brief fra nettsiden');
        return;
      }

      var linjer = [
        'BRIEF — CRISP IDEAS',
        'Utkast satt sammen ' + datoStreng(),
        '',
        'MÅL',
        svar.maal,
        '',
        'LEVERANSE',
        svar.leveranse,
        '',
        'TIDSHORISONT',
        svar.horisont,
        '',
        'FORESLÅTT OPPLEGG',
        '1. ' + opplegg.maal[svar.maal],
        '2. ' + opplegg.leveranse[svar.leveranse],
        '3. ' + opplegg.horisont[svar.horisont],
        '',
        'KONTAKT',
        'Crisp Ideas AS',
        'Fornebuveien 1, 1366 Lysaker',
        'grimg@crispideas.com · +47 934 01 002'
      ];

      var tekst = linjer.join('\n');
      utskrift.textContent = tekst;
      statusEl.textContent = 'Klar — kopier eller send';

      epostLenke.href =
        'mailto:grimg@crispideas.com' +
        '?subject=' +
        encodeURIComponent('Brief: ' + svar.maal) +
        '&body=' +
        encodeURIComponent(tekst);
    };

    var velg = function (knapp) {
      var gruppe = knapp.getAttribute('data-group');
      var sosken = briefForm.querySelectorAll('.chip[data-group="' + gruppe + '"]');

      Array.prototype.forEach.call(sosken, function (annet) {
        annet.setAttribute('aria-checked', String(annet === knapp));
      });

      svar[gruppe] = knapp.getAttribute('data-value');
      lagBrief();
    };

    var flytt = function (knapp, retning) {
      var gruppe = knapp.getAttribute('data-group');
      var sosken = Array.prototype.slice.call(
        briefForm.querySelectorAll('.chip[data-group="' + gruppe + '"]')
      );
      var i = sosken.indexOf(knapp);
      if (i === -1) return;
      var neste = sosken[(i + retning + sosken.length) % sosken.length];
      if (neste) {
        neste.focus();
        velg(neste);
      }
    };

    Array.prototype.forEach.call(briefForm.querySelectorAll('.chip'), function (knapp) {
      knapp.addEventListener('click', function () {
        velg(knapp);
      });

      knapp.addEventListener('keydown', function (event) {
        var t = event.key;
        if (t === 'ArrowRight' || t === 'ArrowDown') {
          event.preventDefault();
          flytt(knapp, 1);
        } else if (t === 'ArrowLeft' || t === 'ArrowUp') {
          event.preventDefault();
          flytt(knapp, -1);
        }
      });
    });

    if (kopierKnapp && utskrift) {
      var merkTekst = function () {
        var range = document.createRange();
        range.selectNodeContents(utskrift);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        statusEl.textContent = 'Markert — trykk Ctrl+C eller ⌘+C';
      };

      kopierKnapp.addEventListener('click', function () {
        var tekst = utskrift.textContent;

        var kvitter = function () {
          kopierKnapp.textContent = 'Kopiert';
          window.setTimeout(function () {
            kopierKnapp.textContent = 'Kopier briefen';
          }, 2200);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(tekst).then(kvitter, merkTekst);
        } else {
          merkTekst();
        }
      });
    }

    lagBrief();
  }

  /* ---------------------------------------------------------
     Kontaktskjema → mailto
     --------------------------------------------------------- */
  var kontaktskjema = document.querySelector('[data-contact-form]');

  if (kontaktskjema) {
    kontaktskjema.addEventListener('submit', function (event) {
      event.preventDefault();
      var til = kontaktskjema.getAttribute('data-mailto') || 'grimg@crispideas.com';
      var emne = kontaktskjema.getAttribute('data-subject') || 'Henvendelse fra nettsiden';
      var data = new FormData(kontaktskjema);
      var linjer = [];

      data.forEach(function (verdi, navn) {
        if (String(verdi).trim() === '') return;
        linjer.push(navn + ': ' + verdi);
      });

      window.location.href =
        'mailto:' +
        til +
        '?subject=' +
        encodeURIComponent(emne) +
        '&body=' +
        encodeURIComponent(linjer.join('\n'));

      var notat = kontaktskjema.querySelector('[data-form-note]');
      if (notat) notat.textContent = 'E-postprogrammet åpnes med feltene fylt ut.';
    });
  }

  /* ---------------------------------------------------------
     Årstall
     --------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
