/* No Isolation — demoens oppførsel.
   Alt kjører i nettleseren: meny, innsynsanimasjon, hurtigsvarpanelet og et
   kontaktskjema som bare lager et e-postutkast. Ingenting sendes eller lagres. */

(function () {
  'use strict';

  var d = document;

  /* ---------- Mobilmeny ---------- */

  var menyKnapp = d.getElementById('menyKnapp');
  var meny = d.getElementById('meny');
  var smalSkjerm = window.matchMedia('(max-width: 900px)');

  function settMeny(apen) {
    if (!menyKnapp || !meny) {
      return;
    }
    meny.dataset.open = apen ? 'true' : 'false';
    menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
    menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
  }

  if (menyKnapp && meny) {
    if (smalSkjerm.matches) {
      settMeny(false);
    }

    menyKnapp.addEventListener('click', function () {
      settMeny(meny.dataset.open !== 'true');
    });

    meny.addEventListener('click', function (hendelse) {
      if (smalSkjerm.matches && hendelse.target.closest('a')) {
        settMeny(false);
      }
    });

    var folgBredde = function (hendelse) {
      settMeny(!hendelse.matches);
    };

    if (typeof smalSkjerm.addEventListener === 'function') {
      smalSkjerm.addEventListener('change', folgBredde);
    } else if (typeof smalSkjerm.addListener === 'function') {
      smalSkjerm.addListener(folgBredde);
    }
  }

  /* ---------- Innhold som kommer til syne ---------- */

  var synlige = Array.prototype.slice.call(d.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window && synlige.length) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (oppforing) {
        if (oppforing.isIntersecting) {
          oppforing.target.classList.add('is-visible');
          observator.unobserve(oppforing.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    synlige.forEach(function (element) {
      observator.observe(element);
    });
  } else {
    synlige.forEach(function (element) {
      element.classList.add('is-visible');
    });
  }

  /* ---------- Hurtigsvar: svar hentet fra kundens egne sider ---------- */

  var logg = d.getElementById('chatLogg');
  var skjema = d.getElementById('chatSkjema');
  var felt = d.getElementById('chatFelt');

  var SVAR = {
    hva: 'AV1 er en skolerobot som plasseres i klasserommet. Eleven kobler seg til via AV1-appen og kan se, høre, rekke opp hånda og delta i timen – fra et grupperom, en behandlingsinstitusjon eller hjemmefra.',
    pris: 'Priser står ikke på nettsiden. Der beskrives AV1 som en kostnadseffektiv løsning sammenlignet med alternative tiltak. For et konkret svar: ring +47 37 71 52 10 eller skriv til norden@noisolation.com.',
    igang: 'Fyll ut kontaktskjemaet på noisolation.com, eller ring +47 37 71 52 10. No Isolation tar kontakt med informasjon om hvordan AV1 kan brukes i din skole eller kommune.',
    resultat: 'Nye data fra over 3 000 AV1-insatser viser at 77,9 % av intervensjonene oppnår sitt tiltenkte formål, og at 77,6 % bidrar til at eleven kommer fysisk tilbake til klasserommet.',
    tid: 'Telefonlinjene er åpne 09.00–16.00, mandag–fredag. Norsk nummer: +47 37 71 52 10.',
    app: 'AV1-appen er gratis og kompatibel med iPhone og iPad med iOS/iPadOS 16.6 eller nyere, samt utvalgte Android-nettbrett. Eleven kobler til sin tildelte robot med en unik kode.',
    kamera: 'Kameraet i AV1 er enveiskjørt: eleven kan se og høre klassen uten å være synlig for andre. Det kan være særlig viktig for elever som er syke, engstelige eller har smerter.',
    hvem: 'AV1 brukes av kommuner, grunnskoler, videregående skoler, sykehusskoler og veldedighetsorganisasjoner. Foresatte kan også ta kontakt.',
    nei: 'Det spørsmålet har jeg ikke svar på her. Ring +47 37 71 52 10 (09.00–16.00) eller skriv til norden@noisolation.com.'
  };

  /* Rekkefølgen betyr noe: pris og telefontid må sjekkes før det generelle
     «hva er AV1», ellers ville «hva koster AV1» blitt svart som en definisjon. */
  var REGLER = [
    { nokler: ['pris', 'kost', 'koster', 'kr', 'billig'], svar: SVAR.pris },
    { nokler: ['ringe', 'telefon', 'telefontid', 'åpningstid', 'åpent', 'når kan'], svar: SVAR.tid },
    { nokler: ['resultat', 'effekt', 'insats', 'tall', '77'], svar: SVAR.resultat },
    { nokler: ['ipad', 'iphone', 'app', 'android', 'ios', 'nettbrett', 'enhet'], svar: SVAR.app },
    { nokler: ['kamera', 'synlig', 'se meg', 'privat', 'anonym', 'bli sett'], svar: SVAR.kamera },
    { nokler: ['hvem', 'kommune', 'skole', 'foresatt', 'foreldre'], svar: SVAR.hvem },
    { nokler: ['i gang', 'begynne', 'start', 'bestille', 'kjøpe', 'komme i gang'], svar: SVAR.igang },
    { nokler: ['av1', 'robot', 'skolerobot', 'hva er'], svar: SVAR.hva }
  ];

  function finnSvar(sporsmal) {
    var tekst = sporsmal.toLowerCase();
    for (var i = 0; i < REGLER.length; i++) {
      for (var j = 0; j < REGLER[i].nokler.length; j++) {
        if (tekst.indexOf(REGLER[i].nokler[j]) !== -1) {
          return REGLER[i].svar;
        }
      }
    }
    return SVAR.nei;
  }

  if (logg && skjema && felt) {
    var ko = [];
    var svarer = false;

    function leggTil(tekst, hvem) {
      var bobble = d.createElement('p');
      bobble.className = 'msg msg--' + hvem;
      bobble.textContent = tekst;
      logg.appendChild(bobble);
      logg.scrollTop = logg.scrollHeight;
    }

    function skriveIndikator() {
      var indikator = d.createElement('p');
      indikator.className = 'msg msg--bot msg--skriv';
      indikator.setAttribute('aria-label', 'AV1-svar skriver');
      indikator.innerHTML = '<span></span><span></span><span></span>';
      logg.appendChild(indikator);
      logg.scrollTop = logg.scrollHeight;
      return indikator;
    }

    function kjorKo() {
      if (svarer || ko.length === 0) {
        return;
      }
      svarer = true;
      var neste = ko.shift();
      leggTil(neste.sporsmal, 'user');
      var indikator = skriveIndikator();

      setTimeout(function () {
        indikator.remove();
        leggTil(neste.svar, 'bot');
        svarer = false;
        kjorKo();
      }, 620);
    }

    function spor(sporsmal) {
      var renset = sporsmal.trim();
      if (!renset) {
        return;
      }
      ko.push({ sporsmal: renset, svar: finnSvar(renset) });
      kjorKo();
    }

    Array.prototype.forEach.call(d.querySelectorAll('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        spor(chip.getAttribute('data-sporsmal') || chip.textContent);
      });
    });

    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      var sporsmal = felt.value;
      felt.value = '';
      spor(sporsmal);
    });
  }

  /* ---------- Kontaktskjema: lager et e-postutkast, sender ingenting ---------- */

  var kontakt = d.getElementById('kontaktSkjema');
  var kvittering = d.getElementById('kvittering');

  if (kontakt && kvittering) {
    kontakt.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();

      if (!kontakt.reportValidity()) {
        return;
      }

      var data = new FormData(kontakt);
      var emne = String(data.get('emne') || 'Forespørsel');
      var linjer = [
        'Navn: ' + (data.get('navn') || ''),
        'E-post: ' + (data.get('epost') || ''),
        'Skole eller kommune: ' + (data.get('organisasjon') || ''),
        'Gjelder: ' + emne,
        '',
        String(data.get('melding') || '')
      ];

      var mottaker = 'norden@noisolation.com';
      var lenke = 'mailto:' + mottaker +
        '?subject=' + encodeURIComponent('Forespørsel fra nettsiden: ' + emne) +
        '&body=' + encodeURIComponent(linjer.join('\n'));

      kvittering.hidden = false;
      kvittering.textContent = 'Utkastet er klart i e-postprogrammet ditt og adressert til ' +
        mottaker + '. Ingenting er sendt fra denne siden. Åpnet det seg ikke, kan du sende ' +
        'e-posten direkte til ' + mottaker + ' eller ringe +47 37 71 52 10.';

      window.location.href = lenke;
    });
  }

  /* ---------- Årstall i footer ---------- */

  var ar = d.getElementById('ar');
  if (ar) {
    ar.textContent = String(new Date().getFullYear());
  }
})();
