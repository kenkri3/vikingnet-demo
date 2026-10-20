/*
  Animer — demo.
  Alt kjører i nettleseren. Ingenting sendes, ingenting lagres.
  Tre ting: menyen, sanntidssvaret (en liten demobot med svar hentet fra
  animer.no) og forespørselsskjemaet med kvittering.
*/
(function () {
  'use strict';

  /* ---------- Meny ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var lukk = function () {
      nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', function () {
      var apen = !nav.hasAttribute('hidden');
      if (apen) {
        lukk();
      } else {
        nav.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    nav.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) lukk();
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && !nav.hasAttribute('hidden')) {
        lukk();
        toggle.focus();
      }
    });
  }

  /* ---------- Sanntidssvar ---------- */
  var logg = document.getElementById('svar-logg');
  var skjema = document.getElementById('svar-form');
  var felt = document.getElementById('svar-felt');
  var chips = document.getElementById('svar-chips');

  function normaliser(tekst) {
    return String(tekst)
      .toLowerCase()
      .replace(/æ/g, 'ae')
      .replace(/ø/g, 'o')
      .replace(/å/g, 'a')
      .trim();
  }

  /* Svarene er hentet fra animer.no — ofte stilte spørsmål og leveranseprosessen. */
  var SVAR = [
    {
      nykel: ['pris', 'kost', 'koster', 'fastpris', 'budsjett', 'tilbud', 'billig', 'dyrt', 'hva koster'],
      svar: 'Vi jobber med fastpris basert på lengden på filmen og behovet deres. Vi anbefaler en online kaffe — der gir vi en konkret prisvurdering ut fra det dere ser for dere.'
    },
    {
      nykel: ['hvor lang', 'hvor lenge', 'lang tid', 'uker', 'leveranse', 'ferdig', 'produksjonstid'],
      svar: '3–4 uker når vi følger leveranseprosessen. Leveransen varierer med kompleksiteten i filmen og korrekturrundene underveis.'
    },
    {
      nykel: ['haster', 'raskere', 'rask', 'fort', 'frist', 'deadline'],
      svar: 'Ja, det kan ordnes. Da setter vi flere på produksjonen og færre korrekturrunder. Ta kontakt, så ser vi om vi rekker fristen deres.'
    },
    {
      nykel: ['3d', 'tredimensjon'],
      svar: 'Ja, vi har erfaring med 3D-animasjon. Den typen koster ekstra mot vanlig 2D og tar lengre tid å produsere.'
    },
    {
      nykel: ['språk', 'engelsk', 'oversett', 'dubbe', 'stemme'],
      svar: 'Ja. Vi samarbeider med stemmeskuespillere over hele verden, og én film kan lages på fire forskjellige språk om ønskelig.'
    },
    {
      nykel: ['hvor holder', 'kontor', 'adresse', 'lokasjon', 'hjemmefra', 'hvor er', 'hvor sitter'],
      svar: 'Vi arbeider hjemmefra og har derfor ikke et fast kontor. Vil dere møtes fysisk, kommer vi gjerne til dere — ellers tar vi gjerne et online møte.'
    },
    {
      nykel: ['opplaering', 'e-laering', 'kurs', 'laere', 'trene', 'ansatte', 'opplæring'],
      svar: 'Opplæring er det vi lager mest av: film som lærer opp ansatte og kunder i arbeidsprosesser, produkter og tjenester. Veidekke brukte det til e-læring.'
    },
    {
      nykel: ['kunde', 'referanse', 'portefolje', 'eksempel', 'tidligere', 'hvem har'],
      svar: 'Over 450 filmer for over 300 kunder siden 2016. Blant dem Elkjøp, Falck, Uno X og Veidekke.'
    },
    {
      nykel: ['mote', 'booke', 'book', 'kaffe', 'avtale', 'ringe', 'telefon', 'kontakt'],
      svar: 'Book et møte via skjemaet lenger ned, eller ring 942 91 169. Vi svarer så snart vi kan.'
    }
  ];

  var STANDARD = 'Det står ikke på animer.no, så det vil jeg ikke gjette på. Ring 942 91 169 eller bruk skjemaet lenger ned, så svarer vi så snart vi kan.';

  function finnSvar(sporsmal) {
    var tekst = normaliser(sporsmal);
    var beste = null;
    var bestPoeng = 0;

    for (var i = 0; i < SVAR.length; i += 1) {
      var poeng = 0;
      for (var j = 0; j < SVAR[i].nykel.length; j += 1) {
        if (tekst.indexOf(normaliser(SVAR[i].nykel[j])) !== -1) poeng += 1;
      }
      if (poeng > bestPoeng) {
        bestPoeng = poeng;
        beste = SVAR[i].svar;
      }
    }

    return bestPoeng > 0 ? beste : STANDARD;
  }

  function legg(tekst, hvem) {
    var boble = document.createElement('p');
    boble.className = 'boble boble--' + (hvem === 'meg' ? 'jeg' : 'bot');
    boble.textContent = tekst;
    logg.appendChild(boble);
    logg.scrollTop = logg.scrollHeight;
    return boble;
  }

  function svarMed(tekst) {
    var skriver = document.createElement('p');
    skriver.className = 'boble boble--bot boble--skriv';
    skriver.setAttribute('aria-label', 'Skriver');
    skriver.innerHTML = '<span class="prikk"></span><span class="prikk"></span><span class="prikk"></span>';
    logg.appendChild(skriver);
    logg.scrollTop = logg.scrollHeight;

    var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.setTimeout(function () {
      if (skriver.parentNode) skriver.parentNode.removeChild(skriver);
      legg(tekst, 'bot');
    }, rolig ? 40 : 560);
  }

  function spor(tekst) {
    var rein = String(tekst || '').trim();
    if (!rein) {
      if (felt) felt.focus();
      return;
    }
    legg(rein, 'meg');
    svarMed(finnSvar(rein));
  }

  if (logg && skjema && felt) {
    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      spor(felt.value);
      felt.value = '';
    });
  }

  if (chips) {
    chips.addEventListener('click', function (hendelse) {
      var knapp = hendelse.target.closest('.chip');
      if (knapp) spor(knapp.textContent);
    });
  }

  /* ---------- Forespørsel med kvittering ---------- */
  var foresporsel = document.getElementById('foresporsel');
  var kvittering = document.getElementById('kvittering');
  var teller = 0;

  function rad(term, verdi) {
    var div = document.createElement('div');
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = verdi;
    div.appendChild(dt);
    div.appendChild(dd);
    return div;
  }

  if (foresporsel && kvittering) {
    foresporsel.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      if (typeof foresporsel.reportValidity === 'function' && !foresporsel.reportValidity()) return;

      var navn = document.getElementById('navn').value.trim();
      var epost = document.getElementById('epost').value.trim();
      var telefon = document.getElementById('telefon').value.trim();
      var behov = document.getElementById('behov').value;
      var melding = document.getElementById('melding').value.trim();

      teller += 1;
      var na = new Date();
      var nr = 'A-' +
        String(na.getMonth() + 1).padStart(2, '0') +
        String(na.getDate()).padStart(2, '0') + '-' +
        String(teller).padStart(3, '0');

      document.getElementById('kvittering-nr').textContent = nr;
      document.getElementById('kvittering-navn').textContent = navn ? navn.split(' ')[0] : 'du';
      document.getElementById('kvittering-tekst').textContent =
        'Vi har registrert en henvendelse om ' + behov.toLowerCase() +
        '. Slik ser den ut — dette er kvitteringen som vises med en gang, uten å vente på e-post.';

      var liste = document.getElementById('kvittering-liste');
      liste.textContent = '';
      liste.appendChild(rad('Navn', navn));
      liste.appendChild(rad('E-post', epost));
      if (telefon) liste.appendChild(rad('Telefon', telefon));
      liste.appendChild(rad('Gjelder', behov));
      if (melding) {
        liste.appendChild(rad('Melding', melding.length > 90 ? melding.slice(0, 90) + ' …' : melding));
      }

      foresporsel.hidden = true;
      kvittering.hidden = false;
      kvittering.focus();
    });

    var ny = document.getElementById('kvittering-ny');
    if (ny) {
      ny.addEventListener('click', function () {
        kvittering.hidden = true;
        foresporsel.hidden = false;
        foresporsel.reset();
        document.getElementById('navn').focus();
      });
    }
  }

})();
