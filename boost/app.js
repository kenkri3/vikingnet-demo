/*
  boost.ai — demoens ene interaksjon.
  To ting, begge client-side og uten backend:
    1. Svarskissen i heroen svarer med tekst hentet fra boost.ais egne sider.
    2. Demo-skjemaet gir en kvittering i nettleseren. Ingenting sendes.
*/

(function () {
  'use strict';

  /* ---------- Mobilmeny ---------- */

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  var smal = window.matchMedia('(max-width: 900px)');

  function settMeny(aapen) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', aapen ? 'true' : 'false');
    toggle.setAttribute('aria-label', aapen ? 'Lukk meny' : 'Åpne meny');
    if (smal.matches) {
      nav.hidden = !aapen;
    } else {
      nav.hidden = false;
    }
  }

  if (toggle && nav) {
    settMeny(false);
    toggle.addEventListener('click', function () {
      settMeny(nav.hidden);
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a') && smal.matches) settMeny(false);
    });
    var vedEndring = function () {
      settMeny(false);
    };
    if (typeof smal.addEventListener === 'function') {
      smal.addEventListener('change', vedEndring);
    } else if (typeof smal.addListener === 'function') {
      smal.addListener(vedEndring);
    }
  }

  /* ---------- Svarskissen ---------- */
  /* Svarene er skrevet om fra boost.ais egne sider. Kilden står under hvert svar,
     slik at det er tydelig at dette er deres tekst og ikke vår påstand. */

  var SVAR = {
    plattform: {
      sporsmal: 'Hva gjør boost.ai?',
      svar: 'boost.ai er en conversational AI-plattform for regulerte bransjer. AI-agentene håndterer kundeservice og intern støtte, og tale og meldinger kjører i samme plattform.',
      kilde: 'Kilde: boost.ai/product/conversational-ai-platform'
    },
    bransjer: {
      sporsmal: 'Hvilke bransjer?',
      svar: 'Finans, forsikring, telekom og offentlig sektor. Plattformen er bygget for compliance-tunge miljøer, med krav til sikkerhet, personvern og sporbarhet.',
      kilde: 'Kilde: boost.ai (forsiden)'
    },
    trygghet: {
      sporsmal: 'Er det trygt i regulerte bransjer?',
      svar: 'Plattformen er sertifisert etter ISO 27001 og 27701, og bygget for GDPR og OWASP. Den hybride arkitekturen gir autonomi der det er trygt og kontroll der det er kritisk.',
      kilde: 'Kilde: boost.ai/product/conversational-ai-platform'
    },
    bygg: {
      sporsmal: 'Kan vi bygge agentene selv?',
      svar: 'Ja. Byggeren krever ingen kode, og ferdige bransjemoduler gir brukstilfeller, kunnskapskilder og guardrails fra dag én. Test Studio prøver agenten før den går live.',
      kilde: 'Kilde: boost.ai/product/conversational-ai-platform'
    },
    kontor: {
      sporsmal: 'Hvor har dere kontor?',
      svar: 'Sandnes (Grenseveien 21), Oslo (Nedre Vollgate 3), Stockholm, København, Helsingfors, Boston og London.',
      kilde: 'Kilde: boost.ai/contact'
    },
    demo: {
      sporsmal: 'Hvordan ber jeg om demo?',
      svar: 'Bruk skjemaet lenger ned på denne siden. boost.ai har også en egen demoside og en gratis masterclass i fire deler på e-post.',
      kilde: 'Kilde: boost.ai (forsiden og /demo)'
    }
  };

  var logg = document.getElementById('agent-log');
  var chips = document.querySelectorAll('.chip');
  var opptatt = false;

  function leggInn(type, tekst, kilde, tid) {
    var boble = document.createElement('div');
    boble.className = 'msg msg--' + type;

    var p = document.createElement('p');
    p.textContent = tekst;
    boble.appendChild(p);

    if (kilde) {
      var src = document.createElement('span');
      src.className = 'msg__src';
      src.textContent = kilde;
      boble.appendChild(src);
    }

    if (tid) {
      var meta = document.createElement('span');
      meta.className = 'msg__time';
      meta.textContent = tid;
      boble.appendChild(meta);
    }

    logg.appendChild(boble);
    logg.scrollTop = logg.scrollHeight;

    while (logg.children.length > 8) {
      logg.removeChild(logg.firstElementChild);
    }
  }

  if (logg && chips.length) {
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function (event) {
        if (opptatt) return;
        var nokkel = event.currentTarget.getAttribute('data-q');
        var innslag = SVAR[nokkel];
        if (!innslag) return;

        opptatt = true;
        leggInn('user', innslag.sporsmal, null, 'deg');

        var start = Date.now();
        window.setTimeout(function () {
          var sekunder = ((Date.now() - start) / 1000).toFixed(1).replace('.', ',');
          leggInn('bot', innslag.svar, innslag.kilde, 'svarte på ' + sekunder + ' s');
          opptatt = false;
        }, 420);
      });
    }
  }

  /* ---------- Demo-skjema med kvittering ---------- */

  var skjema = document.getElementById('demo-form');
  var kvittering = document.getElementById('receipt');

  function fyllUt(id, verdi) {
    var el = document.getElementById(id);
    if (el) el.textContent = verdi;
  }

  var BRANSJE = {
    finans: 'Finans',
    forsikring: 'Forsikring',
    telekom: 'Telekom',
    offentlig: 'Offentlig sektor',
    annet: 'Annet'
  };

  if (skjema && kvittering) {
    skjema.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!skjema.checkValidity()) {
        skjema.reportValidity();
        return;
      }

      var navn = skjema.elements.navn.value.trim();
      var bedrift = skjema.elements.bedrift.value.trim();
      var epost = skjema.elements.epost.value.trim();
      var bransje = skjema.elements.bransje.value;
      var referanse = 'BA-' + String(Math.floor(1000 + Math.random() * 9000));

      fyllUt('receipt-lead', 'Takk, ' + navn.split(' ')[0] + '. I denne skissen er forespørselen bare vist her — ingenting er sendt.');
      fyllUt('receipt-ref', referanse);
      fyllUt('receipt-company', bedrift);
      fyllUt('receipt-industry', BRANSJE[bransje] || 'Ikke oppgitt');
      fyllUt('receipt-contact', epost);

      skjema.hidden = true;
      kvittering.hidden = false;
      kvittering.setAttribute('tabindex', '-1');
      kvittering.focus({ preventScroll: false });
    });

    var igjen = kvittering.querySelector('[data-reset]');
    if (igjen) {
      igjen.addEventListener('click', function () {
        skjema.reset();
        skjema.hidden = false;
        kvittering.hidden = true;
        var forste = document.getElementById('f-navn');
        if (forste) forste.focus();
      });
    }
  }
})();
