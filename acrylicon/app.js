/*
  AcryliCon — demointeraksjon.

  To ting kan brukeren gjøre:
    1. Systemvelgeren: tre valg gir et systemforslag bygget på Acrylicons egne
       produktbeskrivelser.
    2. Forespørselen: skjemaet gir en kvittering i nettleseren, med en
       mailto-lenke som fallback. Ingenting sendes automatisk.
*/
(function () {
  'use strict';

  /* ---------------------------------------------------------------- årstall */
  var aar = document.getElementById('arstall');
  if (aar) {
    aar.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------- meny */
  var menyKnapp = document.getElementById('menyKnapp');
  var mobilmeny = document.getElementById('mobilmeny');

  function settMeny(aapen) {
    if (!menyKnapp || !mobilmeny) return;
    menyKnapp.setAttribute('aria-expanded', aapen ? 'true' : 'false');
    menyKnapp.setAttribute('aria-label', aapen ? 'Lukk meny' : 'Åpne meny');
    mobilmeny.hidden = !aapen;
  }

  if (menyKnapp && mobilmeny) {
    menyKnapp.addEventListener('click', function () {
      settMeny(menyKnapp.getAttribute('aria-expanded') !== 'true');
    });

    mobilmeny.addEventListener('click', function (hendelse) {
      if (hendelse.target && hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && menyKnapp.getAttribute('aria-expanded') === 'true') {
        settMeny(false);
        menyKnapp.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) settMeny(false);
    });
  }

  /* ---------------------------------------------------------- systemvelger */
  var SYSTEMER = {
    industry: {
      navn: 'Acrylicon Industry System',
      hvorfor: 'Et mørtelsystem som påføres med murskje, laget for offshore og tungindustri — med utmerket trykkstyrke og strekkfasthet.',
      spes: [['Tykkelse', '4 mm'], ['Påføring', 'Murskje'], ['Brukes til', 'Offshore og tungindustri']]
    },
    dekor: {
      navn: 'Acrylicon Dekor System',
      hvorfor: 'Systemet med ekstrem slitestyrke, for våtormråder og tungindustri. Sklisikringen er en del av systemet.',
      spes: [['Tykkelse', '4 mm'], ['Egenskap', 'Ekstrem slitestyrke'], ['Sikkerhet', 'Sklisikring']]
    },
    variant: {
      navn: 'Acrylicon Variant System',
      hvorfor: 'Selvutjevnende og fleksibelt, for tungindustri og rene miljøer, med ekstremt høy trykkstyrke.',
      spes: [['Tykkelse', '1–3 mm'], ['Egenskap', 'Selvutjevnende og fleksibelt'], ['Trykk', 'Ekstremt høy trykkstyrke']]
    },
    multigripID: {
      navn: 'Acrylicon Multi-Grip ID System',
      hvorfor: 'For butikk, lager og lett industri — områder med mye fottrafikk. Bygget opp med primer, bodycoat og sealer.',
      spes: [['Tykkelse', '2–3 mm'], ['Oppbygning', 'Primer, bodycoat og sealer'], ['Sikkerhet', 'Sklisikker']]
    },
    flake: {
      navn: 'Acrylicon Flake System',
      hvorfor: 'Dekorativ overflate for tung fottrafikk og moderat industri, med sklisikring.',
      spes: [['Tykkelse', '2–3 mm'], ['Egenskap', 'Dekorativ overflate'], ['Sikkerhet', 'Sklisikring']]
    },
    wall: {
      navn: 'Acrylicon Wall System',
      hvorfor: 'Dekorativ veggoverflate i en rekke farger, for garderober, helse og matindustri — slitesterk og hygienisk.',
      spes: [['Tykkelse', '0,7–1,2 mm'], ['Egenskap', 'Dekorativ, en rekke farger'], ['Brukes til', 'Garderober, helse og matindustri']]
    },
    multigrip: {
      navn: 'Acrylicon Multigrip',
      hvorfor: 'Elastisk, værbestandig og sklisikkert — for parkering, gangveier og ramper, både utendørs og innendørs.',
      spes: [['Egenskap', 'Elastisk og værbestandig'], ['Sikkerhet', 'Sklisikkert'], ['Brukes til', 'Parkering, gangveier og ramper']]
    },
    tankcoating: {
      navn: 'Acrylicon TankCoating System',
      hvorfor: 'For vertikale og horisontale flater, med ca. 2 timer herdetid og silkematt overflate.',
      spes: [['Tykkelse', '0,4–1,5 mm'], ['Herdetid', 'Ca. 2 timer'], ['Overflate', 'Silkematt']]
    }
  };

  /* Oppslagstabell: flate → miljø → krav → system. */
  var KART = {
    gulv: {
      lett: { skli: 'multigripID', slit: 'multigripID', hyg: 'variant', dekor: 'flake' },
      tung: { skli: 'dekor', slit: 'industry', hyg: 'variant', dekor: 'flake' },
      vaat: { skli: 'dekor', slit: 'dekor', hyg: 'dekor', dekor: 'dekor' },
      ute: { skli: 'multigrip', slit: 'multigrip', hyg: 'multigrip', dekor: 'multigrip' },
      tank: { skli: 'tankcoating', slit: 'tankcoating', hyg: 'tankcoating', dekor: 'tankcoating' }
    },
    vegg: {
      lett: { skli: 'wall', slit: 'wall', hyg: 'wall', dekor: 'wall' },
      tung: { skli: 'wall', slit: 'wall', hyg: 'wall', dekor: 'wall' },
      vaat: { skli: 'wall', slit: 'wall', hyg: 'wall', dekor: 'wall' },
      ute: { skli: 'multigrip', slit: 'multigrip', hyg: 'multigrip', dekor: 'multigrip' },
      tank: { skli: 'tankcoating', slit: 'tankcoating', hyg: 'tankcoating', dekor: 'tankcoating' }
    }
  };

  var resultat = document.getElementById('resultat');
  var resultatStatus = document.getElementById('resultatStatus');
  var resultatNavn = document.getElementById('resultatNavn');
  var resultatHvorfor = document.getElementById('resultatHvorfor');
  var resultatSpes = document.getElementById('resultatSpes');
  var resultatHandling = document.getElementById('resultatHandling');
  var brukSystem = document.getElementById('brukSystem');
  var systemFelt = document.getElementById('system');
  var valg = { flate: '', miljo: '', krav: '' };
  var valgtSystem = '';

  function tomResultat() {
    if (!resultat) return;
    resultat.classList.add('result--empty');
    resultatStatus.textContent = 'Venter';
    resultatNavn.textContent = 'Velg flate, miljø og krav';
    resultatHvorfor.textContent = 'Forslaget bygger på Acrylicons egne produktbeskrivelser. Endelig system velges etter befaring.';
    if (resultatSpes) {
      resultatSpes.textContent = '';
      resultatSpes.hidden = true;
    }
    if (resultatHandling) resultatHandling.hidden = true;
    valgtSystem = '';
  }

  function visResultat() {
    var nokkel = '';
    try {
      nokkel = KART[valg.flate][valg.miljo][valg.krav] || '';
    } catch (feil) {
      nokkel = '';
    }
    if (!nokkel || !SYSTEMER[nokkel]) {
      tomResultat();
      return;
    }

    var system = SYSTEMER[nokkel];
    valgtSystem = nokkel;
    resultat.classList.remove('result--empty');
    resultatStatus.textContent = 'Forslag';
    resultatNavn.textContent = system.navn;
    resultatHvorfor.textContent = system.hvorfor;

    if (resultatSpes) {
      resultatSpes.textContent = '';
      system.spes.forEach(function (rad) {
        var dl = document.createElement('div');
        dl.className = 'specs__row';
        var dt = document.createElement('dt');
        dt.textContent = rad[0];
        var dd = document.createElement('dd');
        dd.textContent = rad[1];
        dl.appendChild(dt);
        dl.appendChild(dd);
        resultatSpes.appendChild(dl);
      });
      resultatSpes.hidden = false;
    }

    if (resultatHandling) resultatHandling.hidden = false;
  }

  var knapper = document.querySelectorAll('.chip[data-gruppe]');
  Array.prototype.forEach.call(knapper, function (knapp) {
    knapp.addEventListener('click', function () {
      var gruppe = knapp.getAttribute('data-gruppe');
      var verdi = knapp.getAttribute('data-verdi');
      valg[gruppe] = verdi;

      Array.prototype.forEach.call(knapper, function (annen) {
        if (annen.getAttribute('data-gruppe') === gruppe) {
          annen.setAttribute('aria-pressed', annen === knapp ? 'true' : 'false');
        }
      });

      visResultat();
    });
  });

  if (brukSystem) {
    brukSystem.addEventListener('click', function () {
      if (!valgtSystem) return;
      if (systemFelt) {
        var finnes = false;
        Array.prototype.forEach.call(systemFelt.options, function (opsjon) {
          if (opsjon.value === valgtSystem) finnes = true;
        });
        if (finnes) systemFelt.value = valgtSystem;
      }
      var kontakt = document.getElementById('kontakt');
      if (kontakt) kontakt.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var navnFelt = document.getElementById('navn');
      if (navnFelt) {
        window.setTimeout(function () {
          navnFelt.focus({ preventScroll: true });
        }, 450);
      }
    });
  }

  /* ------------------------------------------------------------- forespørsel */
  var skjema = document.getElementById('foresporsel');
  var skjemaBoks = document.getElementById('skjemaBoks');
  var skjemaFeil = document.getElementById('skjemaFeil');
  var kvittering = document.getElementById('kvittering');
  var kvitteringRader = document.getElementById('kvitteringRader');
  var kvitteringRef = document.getElementById('kvitteringRef');
  var kvitteringEpost = document.getElementById('kvitteringEpost');
  var nyForesporsel = document.getElementById('nyForesporsel');

  function felt(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function lagRad(term, verdi) {
    if (!verdi) return;
    var rad = document.createElement('div');
    rad.className = 'receipt__row';
    var dt = document.createElement('dt');
    dt.textContent = term;
    var dd = document.createElement('dd');
    dd.textContent = verdi;
    rad.appendChild(dt);
    rad.appendChild(dd);
    kvitteringRader.appendChild(rad);
  }

  function lagReferanse() {
    var tall = Math.floor(1000 + Math.random() * 9000);
    return 'AC-' + new Date().getFullYear() + '-' + tall;
  }

  if (skjema) {
    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();

      var navn = felt('navn');
      var epost = felt('epost');
      var epostOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost);

      if (!navn || !epostOk) {
        if (skjemaFeil) skjemaFeil.hidden = false;
        var mangler = document.getElementById(!navn ? 'navn' : 'epost');
        if (mangler) mangler.focus();
        return;
      }

      if (skjemaFeil) skjemaFeil.hidden = true;

      var bedrift = felt('bedrift');
      var telefon = felt('telefon');
      var areal = felt('areal');
      var melding = felt('melding');
      var systemNokkel = systemFelt ? systemFelt.value : '';
      var systemNavn = 'Ikke valgt';
      if (systemNokkel && systemFelt) {
        systemNavn = systemFelt.options[systemFelt.selectedIndex].textContent;
      }

      kvitteringRader.textContent = '';
      lagRad('Navn', navn);
      lagRad('Bedrift', bedrift);
      lagRad('E-post', epost);
      lagRad('Telefon', telefon);
      lagRad('System', systemNavn);
      lagRad('Areal', areal ? areal + ' m²' : '');
      lagRad('Behov', melding);

      var referanse = lagReferanse();
      if (kvitteringRef) kvitteringRef.textContent = referanse;

      if (kvitteringEpost) {
        var emne = 'Forespørsel om gulv – ' + navn + (bedrift ? ' (' + bedrift + ')' : '');
        var kropp = [
          'Navn: ' + navn,
          'Bedrift: ' + (bedrift || '-'),
          'E-post: ' + epost,
          'Telefon: ' + (telefon || '-'),
          'System: ' + systemNavn,
          'Areal: ' + (areal ? areal + ' m²' : '-'),
          'Behov: ' + (melding || '-'),
          '',
          'Referanse: ' + referanse
        ].join('\n');
        kvitteringEpost.setAttribute('href', 'mailto:ho@acrylicon.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp));
      }

      if (skjemaBoks) skjemaBoks.hidden = true;
      if (kvittering) {
        kvittering.hidden = false;
        kvittering.focus();
        kvittering.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if (nyForesporsel) {
    nyForesporsel.addEventListener('click', function () {
      if (kvittering) kvittering.hidden = true;
      if (skjemaBoks) skjemaBoks.hidden = false;
      if (skjema) {
        skjema.reset();
        if (skjemaFeil) skjemaFeil.hidden = true;
        var navnFelt = document.getElementById('navn');
        if (navnFelt) navnFelt.focus();
      }
    });
  }
})();
