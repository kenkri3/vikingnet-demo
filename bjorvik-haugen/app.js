/*
  Bjørvik & Haugen AS — app.js
  Én interaksjon: en forespørsel som bygger seg opp som en arbeidsseddel mens
  du fyller ut, og som ender i et ferdig sammendrag du kan sende på e-post.
  Alt skjer i nettleseren. Ingenting sendes til en server, og ingenting lagres.
*/
(function () {
  'use strict';

  var rot = document.documentElement;

  /* ---------------- Mobilmeny ---------------- */
  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');

  function lukkMeny() {
    if (!meny || !menyKnapp) return;
    meny.classList.remove('is-open');
    meny.removeAttribute('data-open');
    menyKnapp.setAttribute('aria-expanded', 'false');
    menyKnapp.setAttribute('aria-label', 'Åpne meny');
  }

  if (menyKnapp && meny) {
    menyKnapp.addEventListener('click', function () {
      var apen = menyKnapp.getAttribute('aria-expanded') !== 'true';
      menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');

      // base.css viser menyen når den ikke er [hidden]; vi styrer den med attributtet.
      if (apen) {
        meny.removeAttribute('hidden');
      } else {
        meny.setAttribute('hidden', '');
      }
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        lukkMeny();
        if (window.innerWidth <= 900) meny.setAttribute('hidden', '');
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        lukkMeny();
        if (window.innerWidth <= 900) meny.setAttribute('hidden', '');
      }
    });

    var smal = window.innerWidth <= 900;

    window.addEventListener('resize', function () {
      var erSmal = window.innerWidth <= 900;
      if (erSmal === smal) return;
      smal = erSmal;

      if (erSmal) {
        lukkMeny();
        meny.setAttribute('hidden', '');
      } else {
        meny.removeAttribute('hidden');
        lukkMeny();
      }
    });

    // Under 900 px skal menyen være lukket fra start.
    if (smal) meny.setAttribute('hidden', '');
  }

  /* ---------------- Årstall i footer ---------------- */
  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Svak innkomst av innhold ---------------- */
  var rolige = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !rolige) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (opp) {
        if (opp.isIntersecting) {
          opp.target.classList.add('is-visible');
          observator.unobserve(opp.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
      observator.observe(el);
    });

    // Sikkerhetsnett: blir noe stående usynlig — fordi det aldri kommer i
    // betraktning, eller fordi observatøren ikke fyrer — vises det likevel.
    window.setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal:not(.is-visible)'), function (el) {
        el.classList.add('is-visible');
        observator.unobserve(el);
      });
    }, 1600);
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------------- Forespørselen ----------------
     Skjemaet er en arbeidsseddel: hvert felt speiles i sammendraget til høyre,
     og når alt er gyldig lages en ferdig utfylt e-post.
  */
  var skjema = document.getElementById('reqSkjema');

  if (skjema) {
    var chips = Array.prototype.slice.call(document.querySelectorAll('#tjenesteValg .chip'));
    var valgBoks = document.getElementById('tjenesteValg');
    var feilTjeneste = document.getElementById('feilTjeneste');
    var seddel = document.getElementById('seddel');
    var stempel = document.getElementById('stempel');
    var kvittering = document.getElementById('kvittering');
    var kvitteringTekst = document.getElementById('kvitteringTekst');
    var epostLenke = document.getElementById('epostLenke');
    var kopierKnapp = document.getElementById('kopierKnapp');
    var kopierStatus = document.getElementById('kopierStatus');
    var seddelTid = document.getElementById('seddelTid');
    var sendKnapp = document.getElementById('sendKnapp');

    var MOTTAKER = 'henrik@bjorvik-haugen.no';

    var FELTER = ['omfang', 'naar', 'navn', 'telefon', 'epost', 'adresse', 'merknad'];

    var MELDING = {
      omfang: 'Velg hvor stor jobben er.',
      naar: 'Velg når du ønsker at jobben skal gjøres.',
      navn: 'Fyll inn navnet ditt.',
      telefon: 'Fyll inn et telefonnummer vi kan nå deg på.',
      epost: 'Fyll inn en e-postadresse vi kan svare til.'
    };

    var TOM_tekst = {
      tjenester: 'Ikke valgt',
      omfang: 'Ikke valgt',
      naar: 'Ikke valgt',
      navn: 'Ikke fylt ut',
      telefon: 'Ikke fylt ut',
      epost: 'Ikke fylt ut',
      adresse: 'Ikke fylt ut',
      merknad: 'Ingen'
    };

    function felt(navn) {
      return skjema.elements[navn] || null;
    }

    function verdi(navn) {
      var el = felt(navn);
      return el ? String(el.value || '').trim() : '';
    }

    function valgteTjenester() {
      return chips
        .filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; })
        .map(function (c) { return c.getAttribute('data-tjeneste'); });
    }

    function skriv(navn, tekst) {
      var dd = seddel.querySelector('[data-felt="' + navn + '"]');
      if (!dd) return;
      var tomt = !tekst || tekst === TOM_tekst[navn];
      dd.textContent = tekst || TOM_tekst[navn];
      if (tomt) {
        dd.setAttribute('data-tom', 'true');
      } else {
        dd.removeAttribute('data-tom');
      }
    }

    function oppdaterSeddel() {
      skriv('tjenester', valgteTjenester().join(', '));
      skriv('omfang', verdi('omfang'));
      skriv('naar', verdi('naar'));
      skriv('navn', verdi('navn'));
      skriv('telefon', verdi('telefon'));
      skriv('epost', verdi('epost'));
      skriv('adresse', verdi('adresse'));
      skriv('merknad', verdi('merknad'));

      if (seddelTid && !kvittering.hidden) {
        seddelTid.textContent = 'Endret ' + klokke() + ' — trykk «Lag forespørselen» igjen for å oppdatere e-posten.';
      } else if (seddelTid && harInnhold()) {
        seddelTid.textContent = 'Oppdatert ' + klokke();
      }
    }

    function harInnhold() {
      if (valgteTjenester().length) return true;
      return FELTER.some(function (n) { return verdi(n) !== ''; });
    }

    function klokke() {
      var d = new Date();
      function to(n) { return (n < 10 ? '0' : '') + n; }
      return 'kl. ' + to(d.getHours()) + ':' + to(d.getMinutes());
    }

    function feilFor(navn) {
      var v = verdi(navn);
      if (!v) return MELDING[navn] || 'Feltet må fylles ut.';

      if (navn === 'epost') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
          return 'Skriv en gyldig e-postadresse, for eksempel navn@firma.no.';
        }
      }

      if (navn === 'telefon') {
        var siffer = v.replace(/[^0-9]/g, '');
        if (siffer.length < 8) return 'Telefonnummeret må ha minst åtte siffer.';
      }

      return '';
    }

    function merk(navn, melding) {
      var el = felt(navn);
      if (!el) return;
      var ramme = el.closest('.felt');
      if (!ramme) return;
      var feil = ramme.querySelector('.felt__feil');

      if (melding) {
        ramme.setAttribute('data-invalid', 'true');
        el.setAttribute('aria-invalid', 'true');
        if (feil) feil.textContent = melding;
      } else {
        ramme.setAttribute('data-invalid', 'false');
        el.removeAttribute('aria-invalid');
        if (feil) feil.textContent = '';
      }
    }

    function sjekk() {
      var forsteFeil = null;

      if (!valgteTjenester().length) {
        valgBoks.setAttribute('data-invalid', 'true');
        feilTjeneste.textContent = 'Velg minst én tjeneste.';
      } else {
        valgBoks.setAttribute('data-invalid', 'false');
        feilTjeneste.textContent = '';
      }

      ['omfang', 'naar', 'navn', 'telefon', 'epost'].forEach(function (navn) {
        var melding = feilFor(navn);
        merk(navn, melding);
        if (melding && !forsteFeil) forsteFeil = felt(navn);
      });

      // Valgfrie felt: tøm eventuell gammel feil.
      ['adresse', 'merknad'].forEach(function (navn) { merk(navn, ''); });

      if (!valgteTjenester().length) {
        if (forsteFeil) {
          forsteFeil.focus();
        } else {
          chips[0].focus();
        }
      } else if (forsteFeil) {
        forsteFeil.focus();
      }

      return !forsteFeil && valgteTjenester().length > 0;
    }

    function sammendrag() {
      var tjenester = valgteTjenester();
      var navn = verdi('navn');
      var linjer = [
        'Hei!',
        '',
        'Jeg sender en forespørsel om befaring fra nettsiden deres.',
        '',
        'Tjenester: ' + tjenester.join(', '),
        'Omfang: ' + verdi('omfang'),
        'Ønsket tidspunkt: ' + verdi('naar')
      ];

      if (verdi('adresse')) linjer.push('Adresse: ' + verdi('adresse'));

      linjer.push(
        '',
        'Navn: ' + navn,
        'Telefon: ' + verdi('telefon'),
        'E-post: ' + verdi('epost')
      );

      if (verdi('merknad')) linjer.push('', 'Om jobben:', verdi('merknad'));

      linjer.push('', 'Hilsen ' + navn);

      return {
        emne: 'Forespørsel om befaring – ' + tjenester.join(', '),
        tekst: linjer.join('\n'),
        kort: linjer.slice(2).join('\n')
      };
    }

    function lagForespørsel() {
      if (!sjekk()) return;

      var samlet = sammendrag();

      epostLenke.href = 'mailto:' + MOTTAKER +
        '?subject=' + encodeURIComponent(samlet.emne) +
        '&body=' + encodeURIComponent(samlet.tekst);

      kvitteringTekst.textContent =
        'Forespørselen er klar ' + klokke() + '. Trykk «Send på e-post», så åpnes ' +
        'e-postklienten din med alt ferdig utfylt til ' + MOTTAKER + '.';

      kvittering.hidden = false;
      seddel.classList.add('is-klar');
      stempel.textContent = 'Klar';
      seddelTid.textContent = 'Klar ' + klokke() + '. Endrer du noe, må du lage forespørselen på nytt.';
      if (sendKnapp) sendKnapp.textContent = 'Oppdater forespørselen';
      kopierStatus.textContent = '';

      if (window.innerWidth < 940) {
        seddel.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }

      var overskrift = seddel.querySelector('.seddel__tittel');
      if (overskrift) {
        overskrift.setAttribute('tabindex', '-1');
        overskrift.focus({ preventScroll: true });
      }
    }

    /* --- Chips --- */
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var trykket = chip.getAttribute('aria-pressed') === 'true';
        chip.setAttribute('aria-pressed', trykket ? 'false' : 'true');
        if (!trykket) {
          valgBoks.setAttribute('data-invalid', 'false');
          feilTjeneste.textContent = '';
        }
        oppdaterSeddel();
      });
    });

    /* --- Felt --- */
    FELTER.forEach(function (navn) {
      var el = felt(navn);
      if (!el) return;
      var skriv_naar = function () {
        var ramme = el.closest('.felt');
        if (ramme && ramme.getAttribute('data-invalid') === 'true') {
          merk(navn, feilFor(navn));
        }
        oppdaterSeddel();
      };
      el.addEventListener('input', skriv_naar);
      el.addEventListener('change', skriv_naar);
    });

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();
      lagForespørsel();
    });

    /* --- Kopier --- */
    if (kopierKnapp) {
      kopierKnapp.addEventListener('click', function () {
        if (!kvittering.hidden) {
          var tekst = sammendrag().kort;

          function kvitter(melding) {
            kopierStatus.textContent = melding;
          }

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(tekst).then(function () {
              kvitter('Kopiert. Du kan lime det inn i en e-post eller et dokument.');
            }, function () {
              kvitter('Nettleseren stoppet kopieringen. Marker teksten i e-posten i stedet.');
            });
          } else {
            kvitter('Nettleseren støtter ikke kopiering her. Bruk «Send på e-post».');
          }
        }
      });
    }

    oppdaterSeddel();
  }
})();
