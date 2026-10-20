/*
  A Til Å Bygg AS — interaksjonen på demosiden.

  Alt skjer i nettleseren. Chatten er en skisse: den svarer bare med det som
  faktisk står på atilaabygg.no og i Enhetsregisteret, og den sier fra når den
  ikke vet. Ingenting sendes, ingenting lagres utenfor fanen.
*/
(function () {
  'use strict';

  var doc = document;
  doc.documentElement.classList.add('js');

  /* --- Årstall i footer -------------------------------------------------- */
  var aar = doc.getElementById('ar');
  if (aar) {
    aar.textContent = String(new Date().getFullYear());
  }

  /* --- Mobilmeny ---------------------------------------------------------- */
  var toggle = doc.querySelector('.nav-toggle');
  var meny = doc.getElementById('meny');
  var smal = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;

  function settMeny() {
    if (!toggle || !meny) return;
    var erApen = toggle.getAttribute('aria-expanded') === 'true';
    var skalSkjules = !!(smal && smal.matches) && !erApen;
    meny.hidden = skalSkjules;
  }

  if (toggle && meny) {
    toggle.setAttribute('aria-expanded', 'false');
    settMeny();

    toggle.addEventListener('click', function () {
      var erApen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', erApen ? 'false' : 'true');
      settMeny();
    });

    meny.addEventListener('click', function (hendelse) {
      var mal = hendelse.target;
      if (mal && mal.closest && mal.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        settMeny();
      }
    });

    if (smal) {
      if (smal.addEventListener) smal.addEventListener('change', settMeny);
      else if (smal.addListener) smal.addListener(settMeny);
    }
  }

  /* --- Chatten ------------------------------------------------------------ */
  var TELEFON = '452 28 388';
  var EPOST = 'post@atilaabygg.no';

  /* Svar hentet fra atilaabygg.no (forside, kontakt, om, nyheter) og
     Enhetsregisteret. Ingen priser, ingen tall vi ikke kan vise til. */
  var REGLER = [
    {
      treff: ['be oss ringe', 'ring meg', 'ringe meg', 'tilbakeringing', 'bli oppringt', 'kontakt meg', 'legg igjen nummer'],
      handling: 'ring'
    },
    {
      treff: ['pris', 'koster', 'kostnad', 'tilbud', 'timepris', 'fastpris', 'budsjett', 'hva koster'],
      svar: 'Det står ingen priser på siden deres, og jeg vil ikke gjette. Ring ' + TELEFON + ', så avtaler vi befaring og gir et tilbud på jobben.'
    },
    {
      treff: ['befaring', 'komme og se', 'se på jobben', 'se pa jobben', 'mote', 'møte', 'avtale'],
      svar: 'Befaring avtales på telefon ' + TELEFON + ' eller ' + EPOST + '. Da ser vi jobben før vi sier noe om pris.'
    },
    {
      treff: ['apningstid', 'åpningstid', 'åpent', 'apent', 'åpner', 'apner', 'stenger', 'helg', 'lørdag', 'lordag', 'søndag', 'sondag', 'når er dere', 'nar er dere'],
      svar: 'Åpningstidene er mandag til fredag, 07:00–15:00. Utenom det kan du legge igjen nummeret, så ringer vi opp.'
    },
    {
      treff: ['våtrom', 'vatrom', 'bad', 'flis', 'membran'],
      svar: 'Våtrom tar vi som godkjent våtromsbedrift, etter Byggebransjens våtromsnorm (BVN).'
    },
    {
      treff: ['møbel', 'mobel', 'snekker', 'innredning', 'kjøkken', 'kjokken', 'møbler', 'mobler'],
      svar: 'Møbelsnekring gjør Christian Zander, som er møbelsnekker og tømrer. Treff ham på 41 21 92 70.'
    },
    {
      treff: ['restaurer', 'gammel', '1800', 'verneverdig', 'gammel byggeskikk', 'fortannet'],
      svar: 'Restaurering og gammel byggeskikk er noe vi kan: fortannet drager, og en bolig fra 1800-tallet er blant oppdragene.'
    },
    {
      treff: ['tilbygg', 'påbygg', 'paabygg', 'utvide', 'utvidelse'],
      svar: 'Tilbygg bygger vi, også på eldre hus. Vi har bygget tilbygg og restaurert bolig fra 1800-tallet.'
    },
    {
      treff: ['nybygg', 'oppføring', 'oppforing', 'bygge hus', 'reise hus', 'grunnmur'],
      svar: 'Nybygg og oppføring av bygninger: vi reiser huset fra grunnmur til møne, og er godkjent for ansvarsrett.'
    },
    {
      treff: ['godkjenning', 'godkjent', 'ansvarsrett', 'mester', 'sertifikat', 'lærebedrift', 'laerebedrift', 'lærling', 'larlig'],
      svar: 'Fire godkjenninger: ansvarsrett fra Direktoratet for byggkvalitet, Mester, godkjent våtromsbedrift og godkjent lærebedrift.'
    },
    {
      treff: ['telefon', 'nummer', 'ringe', 'ring ', 'mobil', 'kontakte'],
      svar: 'Telefon ' + TELEFON + '. Det er nummeret til André Storholt, som er daglig leder og tømrer.'
    },
    {
      treff: ['epost', 'e-post', 'mail', '@'],
      svar: 'E-post: ' + EPOST + '. André har andre@atilaabygg.no, Didrik har didrik@atilaabygg.no.'
    },
    {
      treff: ['adresse', 'hvor ligger', 'hvor er', 'hvor holder', 'fiskum', 'dunserudhagan', 'komme innom', 'besøke', 'besoke'],
      svar: 'Vi holder til i Dunserudhagan 111, 3322 Fiskum.'
    },
    {
      treff: ['org.nr', 'orgnr', 'organisasjon', 'foretak', 'stiftet', 'gammel bedrift'],
      svar: 'A Til Å Bygg AS, org.nr 914 116 848. Selskapet ble stiftet i 2014.'
    },
    {
      treff: ['folk', 'ansatt', 'kontaktperson', 'hvem', 'tømrere', 'tomrere', 'team'],
      svar: 'Fire navn: André Storholt (daglig leder) 45 22 83 88, Didrik Oppenheuser 92 81 09 28, Christian Zander 41 21 92 70 og Dainius Mikalauskas 46 50 15 14.'
    },
    {
      treff: ['hei', 'hallo', 'god dag', 'god morgen', 'halla'],
      svar: 'Hei! Spør meg om åpningstid, tjenester, godkjenninger eller befaring. Jeg svarer bare med det som står på atilaabygg.no.'
    },
    {
      treff: ['tjeneste', 'hva bygger', 'hva gjør', 'hva gjor', 'tømrer', 'tomrer', 'arbeid', 'bygger dere', 'tilbyr'],
      svar: 'Vi bygger nytt, bygger til, restaurerer, snekrer møbler og tar våtrom — med egne tømrere på Fiskum.'
    }
  ];

  var SLUTT = 'Det står ikke på siden deres, så det kan jeg ikke svare på. Ring ' + TELEFON + ', eller be oss ringe deg — så tar jeg imot navn og nummer.';

  var logg = doc.getElementById('logg');
  var skjema = doc.getElementById('skjema');
  var felt = doc.getElementById('felt');
  var chips = doc.getElementById('chips');
  var ringSkjema = doc.getElementById('ring');
  var ringNavn = doc.getElementById('ring-navn');
  var ringTlf = doc.getElementById('ring-tlf');
  var ringFeil = doc.getElementById('ring-feil');
  var ringAvbryt = doc.getElementById('ring-avbryt');

  if (!logg || !skjema || !felt) return;

  var SKRIVER = null;

  function legg(tekst, hvem) {
    var p = doc.createElement('p');
    p.className = 'melding melding--' + hvem;
    p.textContent = tekst;
    logg.appendChild(p);
    logg.scrollTop = logg.scrollHeight;
    return p;
  }

  function visSkriver() {
    if (SKRIVER) return;
    SKRIVER = doc.createElement('div');
    SKRIVER.className = 'skriver';
    SKRIVER.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 3; i++) SKRIVER.appendChild(doc.createElement('span'));
    logg.appendChild(SKRIVER);
    logg.scrollTop = logg.scrollHeight;
  }

  function skjulSkriver() {
    if (!SKRIVER) return;
    if (SKRIVER.parentNode) SKRIVER.parentNode.removeChild(SKRIVER);
    SKRIVER = null;
  }

  function botSvar(tekst) {
    visSkriver();
    window.setTimeout(function () {
      skjulSkriver();
      legg(tekst, 'bot');
      logg.scrollTop = logg.scrollHeight;
    }, 540);
  }

  function kvittering(navn, telefon) {
    var kort = doc.createElement('article');
    kort.className = 'kvittering';

    var merke = doc.createElement('p');
    merke.className = 'kvittering__merke';
    merke.textContent = 'Kvittering · skisse';

    var en = doc.createElement('p');
    var navnEl = doc.createElement('strong');
    navnEl.textContent = navn;
    en.appendChild(doc.createTextNode('Takk, '));
    en.appendChild(navnEl);
    en.appendChild(doc.createTextNode('. Vi ringer ' + telefon + ' i åpningstiden, mandag til fredag 07:00–15:00.'));

    var to = doc.createElement('p');
    to.textContent = 'Dette er en skisse: nummeret ligger bare i nettleseren din, og ingenting er sendt. I en ferdig løsning hadde forespørselen gått rett til ' + TELEFON + ' og ' + EPOST + '.';

    kort.appendChild(merke);
    kort.appendChild(en);
    kort.appendChild(to);
    logg.appendChild(kort);
    logg.scrollTop = logg.scrollHeight;
  }

  function apneRing() {
    if (!ringSkjema) return;
    ringSkjema.hidden = false;
    skjema.hidden = true;
    if (ringFeil) ringFeil.hidden = true;
    if (ringNavn) ringNavn.focus();
  }

  function lukkRing() {
    if (!ringSkjema) return;
    ringSkjema.hidden = true;
    skjema.hidden = false;
    if (ringFeil) ringFeil.hidden = true;
    felt.focus();
  }

  function finnRegel(tekst) {
    var t = ' ' + tekst.toLowerCase().replace(/\s+/g, ' ') + ' ';
    for (var i = 0; i < REGLER.length; i++) {
      var regler = REGLER[i].treff;
      for (var j = 0; j < regler.length; j++) {
        if (t.indexOf(regler[j]) !== -1) return REGLER[i];
      }
    }
    return null;
  }

  function svarPa(tekst) {
    var regel = finnRegel(tekst);
    if (!regel) {
      botSvar(SLUTT);
      return;
    }
    if (regel.handling === 'ring') {
      botSvar('Da tar jeg imot navn og nummer her, så ringer vi deg i åpningstiden.');
      window.setTimeout(apneRing, 560);
      return;
    }
    botSvar(regel.svar);
  }

  function send(tekst) {
    var t = String(tekst || '').trim();
    if (!t) return;
    legg(t, 'jeg');
    svarPa(t);
  }

  /* Hurtigsvar */
  var HURTIG = ['Åpningstider', 'Hva bygger dere?', 'Pris og befaring', 'Godkjenninger', 'Be oss ringe deg'];

  function tegnHurtig() {
    if (!chips) return;
    chips.textContent = '';
    for (var i = 0; i < HURTIG.length; i++) {
      (function (tekst) {
        var knapp = doc.createElement('button');
        knapp.type = 'button';
        knapp.className = 'chip';
        knapp.textContent = tekst;
        knapp.addEventListener('click', function () {
          send(tekst);
        });
        chips.appendChild(knapp);
      })(HURTIG[i]);
    }
  }

  tegnHurtig();

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    var tekst = felt.value;
    felt.value = '';
    send(tekst);
  });

  if (ringSkjema) {
    ringSkjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      var navn = (ringNavn && ringNavn.value ? ringNavn.value : '').trim();
      var telefon = (ringTlf && ringTlf.value ? ringTlf.value : '').trim();
      var siffer = telefon.replace(/\D/g, '');

      if (navn.length < 2) {
        if (ringFeil) {
          ringFeil.textContent = 'Skriv navnet ditt, så vi vet hvem vi ringer.';
          ringFeil.hidden = false;
        }
        if (ringNavn) ringNavn.focus();
        return;
      }

      if (siffer.length < 8) {
        if (ringFeil) {
          ringFeil.textContent = 'Skriv et telefonnummer med minst åtte siffer.';
          ringFeil.hidden = false;
        }
        if (ringTlf) ringTlf.focus();
        return;
      }

      if (ringFeil) ringFeil.hidden = true;
      if (ringNavn) ringNavn.value = '';
      if (ringTlf) ringTlf.value = '';
      lukkRing();
      kvittering(navn, telefon);
      window.setTimeout(function () {
        legg('Vil du heller ringe selv, er nummeret ' + TELEFON + '.', 'bot');
      }, 700);
    });
  }

  if (ringAvbryt) {
    ringAvbryt.addEventListener('click', lukkRing);
  }

  /* Åpne samtalen fra «Svar direkte»-knappene */
  var svarLenker = doc.querySelectorAll('a[href="#svar"]');
  for (var s = 0; s < svarLenker.length; s++) {
    svarLenker[s].addEventListener('click', function () {
      window.setTimeout(function () {
        if (felt) felt.focus({ preventScroll: true });
      }, 420);
    });
  }

  /* Første hilsen */
  window.setTimeout(function () {
    legg('Hei! Dette er en skisse av sanntidssvaret på atilaabygg.no.', 'bot');
  }, 420);

  window.setTimeout(function () {
    legg('Jeg svarer bare med det som står på deres egen side — åpningstid, nummer, adresse og hva de bygger. Hva lurer du på?', 'bot');
  }, 1150);
})();
