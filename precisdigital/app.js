/*
  Precis (precisdigital) — app.js

  To ting brukeren kan gjøre, begge helt i nettleseren:
    1. «Svar direkte»: et lite svarpanel som kun bruker fakta fra Precis' egne
       sider. Det er merket som skisse i grensesnittet.
    2. Kontaktskjema med e-post og telefon, som gir en kvittering med referanse.

  Ingenting sendes til en server, og ingenting lagres.
*/
(function () {
  'use strict';

  var rot = document.documentElement;
  rot.classList.add('js');

  var redusertBevegelse = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Mobilmeny ---------------- */

  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');

  function lukkMeny() {
    if (!meny || !menyKnapp) return;
    meny.classList.remove('is-open');
    menyKnapp.setAttribute('aria-expanded', 'false');
    menyKnapp.setAttribute('aria-label', 'Åpne meny');
  }

  if (menyKnapp && meny) {
    menyKnapp.addEventListener('click', function () {
      var apen = meny.classList.toggle('is-open');
      menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') lukkMeny();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) lukkMeny();
    });
  }

  /* ---------------- Årstall ---------------- */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Svarpanelet ----------------
     Hvert svar bygger på det som står på precis.com (forsiden, om-siden og
     kontakt/karriere-sidene). Står det ikke der, sier panelet det.
  */
  var SVAR = [
    {
      nokler: ['hva gjør', 'hva gjor', 'tjeneste', 'område', 'omrade', 'byrå', 'byra', 'hjelpe'],
      svar: 'Vi kobler medier, kreativt, teknologi og data i én tjeneste. Områdene er medier, data og analyse, Alvie, SEO og CRO, kreativt og AEO/GEO.'
    },
    {
      nokler: ['hvor', 'kontor', 'adresse', 'oslo', 'sitter', 'lokasjon', 'besøke'],
      svar: 'Oslo-kontoret ligger i Møllergata 12, 0179 Oslo. Vi har 13 kontorer, blant annet Stockholm, Göteborg, København, Helsingfors, London, Berlin og Madrid.'
    },
    {
      nokler: ['kunde', 'kunder', 'case', 'referanse', 'volvo', 'fjällräven', 'fjallraven', 'voi'],
      svar: 'Vi viser fram blant annet Volvo, Fjällräven, Voi, Matas, Åhléns og Amazon. Bransjene vi jobber mest med er B2B, e-handel, retail og app.'
    },
    {
      nokler: ['måler', 'maler', 'effekt', 'attribusjon', 'alvie', 'data', 'analyse', 'rapport'],
      svar: 'Vi måler med Alvie — vår egen plattform for attribusjon, rapportering og budsjettfordeling. Den kobler data på tvers av kanaler, så effekten kan vises.'
    },
    {
      nokler: ['pris', 'koster', 'kostnad', 'budsjett', 'rate', 'timepris'],
      svar: 'Priser står ikke på nettsidene våre, og jeg vil ikke gjette på et tall. Skriv hva dere trenger i skjemaet, så svarer Oslo-kontoret.'
    },
    {
      nokler: ['siden', 'grunnlagt', 'historie', 'gammel', '2012', 'hvem er'],
      svar: 'Precis er et teknologidrevet markedsbyrå, grunnlagt i 2012. I Norge er vi Precis Digital AS, med 31 ansatte og kontor i Møllergata 12 i Oslo.'
    },
    {
      nokler: ['partner', 'sertifisert', 'certifisert', 'google', 'meta', 'microsoft', 'hubspot'],
      svar: 'Vi er blant annet Google Premier Partner, Meta Business Partner, Microsoft Elite Partner og HubSpot Platinum Partner.'
    },
    {
      nokler: ['kontakt', 'snakke', 'møte', 'mote', 'forespørsel', 'foresporsel', 'ringe', 'svare'],
      svar: 'Skriv i skjemaet lenger ned på siden, så tar Oslo-kontoret det videre. Vi har også en egen kontaktside på precis.com.'
    }
  ];

  var STANDARD =
    'Det står ikke i kildene jeg har. Skriv det i skjemaet lenger ned, så svarer Oslo-kontoret — jeg er bare en skisse.';

  function normaliser(tekst) {
    return (tekst || '')
      .toLowerCase()
      .replace(/[«»"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function finnSvar(tekst) {
    var t = normaliser(tekst);
    if (!t) return '';

    for (var i = 0; i < SVAR.length; i += 1) {
      for (var j = 0; j < SVAR[i].nokler.length; j += 1) {
        if (t.indexOf(normaliser(SVAR[i].nokler[j])) !== -1) return SVAR[i].svar;
      }
    }

    return STANDARD;
  }

  var logg = document.getElementById('svar-logg');
  var svarSkjema = document.getElementById('svar-skjema');
  var svarFelt = document.getElementById('svar-felt');
  var chips = document.getElementById('svar-chips');
  var venterEl = null;
  var svarer = false;

  function leggTil(klasse, tekst) {
    if (!logg) return null;
    var p = document.createElement('p');
    p.className = 'msg ' + klasse;
    p.textContent = tekst;
    logg.appendChild(p);
    logg.scrollTop = logg.scrollHeight;
    return p;
  }

  function svarPa(sporsmal) {
    if (!logg || svarer) return;

    var renset = (sporsmal || '').trim();
    if (!renset) return;

    svarer = true;
    leggTil('msg--user', renset);
    if (svarFelt) svarFelt.value = '';

    venterEl = leggTil('msg--venter', 'Skriver …');

    var svar = finnSvar(renset);
    var ventetid = redusertBevegelse ? 0 : 420;

    window.setTimeout(function () {
      if (venterEl && venterEl.parentNode) venterEl.parentNode.removeChild(venterEl);
      venterEl = null;
      leggTil('msg--bot', svar);
      svarer = false;
      if (svarFelt) svarFelt.focus({ preventScroll: true });
    }, ventetid);
  }

  if (chips) {
    chips.addEventListener('click', function (event) {
      var knapp = event.target.closest('[data-sporsmal]');
      if (!knapp) return;
      svarPa(knapp.getAttribute('data-sporsmal'));
    });
  }

  if (svarSkjema) {
    svarSkjema.addEventListener('submit', function (event) {
      event.preventDefault();
      svarPa(svarFelt ? svarFelt.value : '');
    });
  }

  /* ---------------- Kontaktskjema med kvittering ---------------- */

  var skjema = document.getElementById('kontakt-skjema');
  var kvittering = document.getElementById('kvittering');
  var kvitteringRef = document.getElementById('kvittering-ref');
  var kvitteringInnhold = document.getElementById('kvittering-innhold');
  var nyKnapp = document.getElementById('ny-foresporsel');

  var PAAKREVD = {
    navn: 'Fyll inn navnet ditt.',
    epost: 'Fyll inn en e-postadresse vi kan svare til.',
    telefon: 'Fyll inn et telefonnummer vi kan nå deg på.',
    melding: 'Skriv noen ord om hva dere vil oppnå.'
  };

  function felt(navn) {
    return skjema ? skjema.elements[navn] : null;
  }

  function feilFor(el) {
    var navn = el.name;
    var verdi = (el.value || '').trim();

    if (!verdi) return PAAKREVD[navn] || 'Feltet må fylles ut.';

    if (navn === 'epost' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi)) {
      return 'Skriv en gyldig e-postadresse, for eksempel navn@virksomhet.no.';
    }

    if (navn === 'telefon') {
      var siffer = verdi.replace(/[^0-9]/g, '');
      if (siffer.length < 8) return 'Telefonnummeret må ha minst åtte siffer.';
    }

    if (navn === 'melding' && verdi.length < 10) {
      return 'Skriv litt mer — minst ti tegn.';
    }

    return '';
  }

  function merkFelt(el, melding) {
    var ramme = el.closest('.field');
    if (!ramme) return;
    var feil = ramme.querySelector('.field__error');

    if (melding) {
      ramme.setAttribute('data-invalid', 'true');
      el.setAttribute('aria-invalid', 'true');
      if (feil) feil.textContent = melding;
    } else {
      ramme.removeAttribute('data-invalid');
      el.removeAttribute('aria-invalid');
      if (feil) feil.textContent = '';
    }
  }

  function lagReferanse() {
    var arstall = new Date().getFullYear();
    var nummer = String(Math.floor(1000 + Math.random() * 9000));
    return 'PR-' + arstall + '-' + nummer;
  }

  function visKvittering(verdier) {
    if (!kvittering || !kvitteringInnhold) return;

    if (kvitteringRef) kvitteringRef.textContent = lagReferanse();

    kvitteringInnhold.textContent = '';
    var rader = [
      ['Navn', verdier.navn],
      ['E-post', verdier.epost],
      ['Telefon', verdier.telefon],
      ['Gjelder', verdier.tema]
    ];

    rader.forEach(function (rad) {
      var div = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      kvitteringInnhold.appendChild(div);
    });

    skjema.hidden = true;
    kvittering.hidden = false;

    var overskrift = kvittering.querySelector('h3');
    if (overskrift) {
      overskrift.setAttribute('tabindex', '-1');
      overskrift.focus({ preventScroll: true });
    }
  }

  if (skjema && kvittering) {
    var overvaket = ['navn', 'epost', 'telefon', 'tema', 'melding'];

    overvaket.forEach(function (navn) {
      var el = felt(navn);
      if (!el) return;
      var oppdater = function () {
        var ramme = el.closest('.field');
        if (ramme && ramme.hasAttribute('data-invalid')) merkFelt(el, feilFor(el));
      };
      el.addEventListener('input', oppdater);
      el.addEventListener('change', oppdater);
    });

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();

      var forsteFeil = null;

      overvaket.forEach(function (navn) {
        var el = felt(navn);
        if (!el) return;
        var melding = navn === 'tema' ? '' : feilFor(el);
        merkFelt(el, melding);
        if (melding && !forsteFeil) forsteFeil = el;
      });

      if (forsteFeil) {
        forsteFeil.focus();
        return;
      }

      visKvittering({
        navn: (felt('navn').value || '').trim(),
        epost: (felt('epost').value || '').trim(),
        telefon: (felt('telefon').value || '').trim(),
        tema: felt('tema') ? felt('tema').value : 'Annet'
      });
    });
  }

  if (nyKnapp) {
    nyKnapp.addEventListener('click', function () {
      if (!skjema || !kvittering) return;
      skjema.reset();
      overvaket.forEach(function (navn) {
        var el = felt(navn);
        if (el) merkFelt(el, '');
      });
      kvittering.hidden = true;
      skjema.hidden = false;
      var forste = felt('navn');
      if (forste) forste.focus();
    });
  }
})();
