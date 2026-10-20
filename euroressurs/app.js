/*
  euroRessurs AS — app.js
  Én interaksjon: en bemanningsforespørsel som settes sammen mens man fyller
  ut, og som gir en kvittering med referanse. Alt skjer i nettleseren.
  Ingenting sendes til en server, ingenting lagres, ingen informasjonskapsler.
*/

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var redusertBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------- Mobilmeny ---------------- */

  var menyKnapp = document.getElementById('meny-knapp');
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

  /* ---------------- Skygge under header ved scroll ---------------- */

  var header = document.querySelector('.site-header');

  if (header) {
    var settHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 6);
    };
    settHeader();
    window.addEventListener('scroll', settHeader, { passive: true });
  }

  /* ---------------- Årstall ---------------- */

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Bemanningsforespørsel ---------------- */

  var skjema = document.getElementById('behov-skjema');
  if (!skjema) return;

  var kvittering = document.getElementById('kvittering');
  var stempel = document.getElementById('kv-stempel');
  var referanseFelt = document.getElementById('kv-referanse');
  var tidFelt = document.getElementById('kv-tid');
  var handlinger = document.getElementById('kv-handlinger');
  var epostLenke = document.getElementById('kv-epost');
  var kopierKnapp = document.getElementById('kv-kopier');
  var nyKnapp = document.getElementById('kv-ny');
  var fot = document.getElementById('kv-fot');
  var statusFelt = document.getElementById('skjema-status');

  var felt = {
    rolle: document.getElementById('rolle'),
    antall: document.getElementById('antall'),
    oppstart: document.getElementById('oppstart'),
    sted: document.getElementById('sted'),
    navn: document.getElementById('navn'),
    firma: document.getElementById('firma'),
    epost: document.getElementById('epost'),
    telefon: document.getElementById('telefon'),
    merknad: document.getElementById('merknad')
  };

  var visFelt = {
    fag: document.getElementById('kv-fag'),
    rolle: document.getElementById('kv-rolle'),
    antall: document.getElementById('kv-antall'),
    oppstart: document.getElementById('kv-oppstart'),
    varighet: document.getElementById('kv-varighet'),
    sted: document.getElementById('kv-sted'),
    kontakt: document.getElementById('kv-kontakt')
  };

  var fagValg = Array.prototype.slice.call(skjema.querySelectorAll('[data-fag]'));
  var varighetValg = Array.prototype.slice.call(skjema.querySelectorAll('[data-varighet]'));
  var tellerKnapper = Array.prototype.slice.call(skjema.querySelectorAll('[data-teller]'));

  var valgteFag = [];
  var valgtVarighet = '';
  var registrert = false;
  var nullstiller = false;

  /* Dagens dato som minste oppstart */
  var iDag = new Date();
  var isoIDag = new Date(iDag.getTime() - iDag.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  if (felt.oppstart) felt.oppstart.setAttribute('min', isoIDag);

  function formaterDato(verdi) {
    if (!verdi) return '';
    var d = new Date(verdi + 'T00:00:00');
    if (isNaN(d.getTime())) return verdi;
    try {
      return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (feil) {
      return verdi;
    }
  }

  function antallTekst(antall) {
    var n = Number(antall) || 0;
    return n === 1 ? '1 person' : n + ' personer';
  }

  function settRad(el, tekst) {
    if (!el) return;
    if (tekst) {
      el.textContent = tekst;
      el.classList.remove('is-tom');
    } else {
      el.textContent = '—';
      el.classList.add('is-tom');
    }
  }

  /* ---------------- Kvitteringen oppdateres mens man skriver ---------------- */

  function synk() {
    if (registrert) return;

    settRad(visFelt.fag, valgteFag.join(', '));
    settRad(visFelt.rolle, felt.rolle ? felt.rolle.value : '');
    settRad(visFelt.antall, antallTekst(felt.antall ? felt.antall.value : 1));
    settRad(visFelt.oppstart, felt.oppstart ? formaterDato(felt.oppstart.value) : '');
    settRad(visFelt.varighet, valgtVarighet);
    settRad(visFelt.sted, felt.sted ? felt.sted.value.trim() : '');

    var navn = felt.navn ? felt.navn.value.trim() : '';
    var firma = felt.firma ? felt.firma.value.trim() : '';
    var kontakt = [navn, firma].filter(Boolean).join(', ');
    settRad(visFelt.kontakt, kontakt);
  }

  function synkAntall() {
    if (!felt.antall) return;
    var n = Number(felt.antall.value);
    if (!n || n < 1) n = 1;
    if (n > 60) n = 60;
    felt.antall.value = String(n);
    settRad(visFelt.antall, antallTekst(n));
  }

  /* ---------------- Feilmeldinger ---------------- */

  function settFeil(navn, melding) {
    var ramme = skjema.querySelector('[data-felt="' + navn + '"]') ||
      (felt[navn] ? felt[navn].closest('.felt') : null);
    var feil = document.getElementById('feil-' + navn);

    if (ramme) {
      if (melding) ramme.setAttribute('data-invalid', 'true');
      else ramme.removeAttribute('data-invalid');
    }
    if (feil) feil.textContent = melding || '';

    if (felt[navn]) {
      if (melding) felt[navn].setAttribute('aria-invalid', 'true');
      else felt[navn].removeAttribute('aria-invalid');
    }
  }

  function ryddFeil() {
    ['fag', 'rolle', 'antall', 'oppstart', 'varighet', 'sted', 'navn', 'firma', 'epost', 'telefon'].forEach(function (navn) {
      settFeil(navn, '');
    });
  }

  function valider() {
    var feil = [];
    var forste = null;

    function leggTil(navn, melding, element) {
      settFeil(navn, melding);
      feil.push(navn);
      if (!forste) forste = element;
    }

    if (!valgteFag.length) leggTil('fag', 'Velg minst ett fag.', skjema.querySelector('[data-fag]'));

    if (!felt.rolle.value) leggTil('rolle', 'Velg hvilken rolle dere trenger.', felt.rolle);

    var antall = Number(felt.antall.value);
    if (!antall || antall < 1) leggTil('antall', 'Oppgi hvor mange personer dere trenger.', felt.antall);

    if (!felt.oppstart.value) {
      leggTil('oppstart', 'Velg en planlagt oppstart.', felt.oppstart);
    } else if (felt.oppstart.value < isoIDag) {
      leggTil('oppstart', 'Velg dagens dato eller en dato fram i tid.', felt.oppstart);
    }

    if (!valgtVarighet) leggTil('varighet', 'Velg hvor lenge dere trenger folk.', skjema.querySelector('[data-varighet]'));

    if (!felt.sted.value.trim()) leggTil('sted', 'Skriv hvor prosjektet er.', felt.sted);
    if (!felt.navn.value.trim()) leggTil('navn', 'Skriv navnet ditt.', felt.navn);
    if (!felt.firma.value.trim()) leggTil('firma', 'Skriv navnet på virksomheten.', felt.firma);

    var epost = felt.epost.value.trim();
    if (!epost) {
      leggTil('epost', 'Skriv en e-postadresse vi kan svare til.', felt.epost);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost)) {
      leggTil('epost', 'Skriv en gyldig e-postadresse, f.eks. navn@virksomhet.no.', felt.epost);
    }

    var telefon = felt.telefon.value.trim();
    if (telefon && telefon.replace(/[^0-9]/g, '').length < 6) {
      leggTil('telefon', 'Telefonnummeret ser for kort ut.', felt.telefon);
    }

    return { antall: feil.length, forste: forste };
  }

  /* ---------------- Kvittering ---------------- */

  function lagReferanse() {
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var kode = '';
    for (var i = 0; i < 4; i++) {
      kode += tegn.charAt(Math.floor(Math.random() * tegn.length));
    }
    return 'ER-' + new Date().getFullYear() + '-' + kode;
  }

  function kvitteringTekst(referanse, tidspunkt) {
    var linjer = [
      'Bemanningsforespørsel fra euroRessurs',
      'Referanse: ' + referanse,
      'Registrert: ' + tidspunkt,
      '',
      'Fag: ' + (valgteFag.join(', ') || 'Ikke valgt'),
      'Rolle: ' + (felt.rolle.value || 'Ikke valgt'),
      'Antall: ' + antallTekst(felt.antall.value),
      'Oppstart: ' + (formaterDato(felt.oppstart.value) || 'Ikke valgt'),
      'Varighet: ' + (valgtVarighet || 'Ikke valgt'),
      'Sted: ' + (felt.sted.value.trim() || 'Ikke oppgitt'),
      '',
      'Kontaktperson: ' + felt.navn.value.trim(),
      'Virksomhet: ' + felt.firma.value.trim(),
      'E-post: ' + felt.epost.value.trim()
    ];

    if (felt.telefon.value.trim()) linjer.push('Telefon: ' + felt.telefon.value.trim());
    if (felt.merknad.value.trim()) linjer.push('', 'Om prosjektet:', felt.merknad.value.trim());
    linjer.push('', 'Kvitteringen er laget i nettleseren på euroressurs-siden.');

    return linjer.join('\n');
  }

  function lagEpost(referanse, tidspunkt) {
    var emne = 'Bemanningsforespørsel ' + referanse + ' – ' + (felt.sted.value.trim() || 'prosjekt');
    var kropp = kvitteringTekst(referanse, tidspunkt);
    return 'mailto:contact@euroressurs.com?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(kropp);
  }

  function laasSkjema(laas) {
    Array.prototype.forEach.call(skjema.querySelectorAll('input, select, textarea, button'), function (el) {
      el.disabled = laas;
    });
  }

  function registrer() {
    var resultat = valider();

    if (resultat.antall > 0) {
      if (statusFelt) {
        statusFelt.classList.add('is-error');
        statusFelt.textContent = resultat.antall === 1
          ? 'Én opplysning mangler. Se feltet som er merket.'
          : resultat.antall + ' opplysninger mangler. Se feltene som er merket.';
      }
      if (resultat.forste && resultat.forste.focus) resultat.forste.focus();
      return;
    }

    if (statusFelt) {
      statusFelt.classList.remove('is-error');
      statusFelt.textContent = '';
    }

    var referanse = lagReferanse();
    var naa = new Date();
    var tidspunkt;
    try {
      tidspunkt = naa.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }) +
        ' kl. ' + naa.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    } catch (feil) {
      tidspunkt = naa.toISOString().slice(0, 16).replace('T', ' kl. ');
    }

    registrert = true;

    if (referanseFelt) referanseFelt.textContent = referanse;
    if (tidFelt) tidFelt.textContent = 'Registrert ' + tidspunkt;
    if (stempel) stempel.textContent = 'Registrert';
    if (kvittering) kvittering.classList.add('is-done');

    if (epostLenke) {
      epostLenke.setAttribute('href', lagEpost(referanse, tidspunkt));
      epostLenke.setAttribute('data-referanse', referanse);
    }

    if (handlinger) handlinger.hidden = false;
    if (fot) {
      fot.textContent = 'Kvitteringen ligger bare i denne nettleseren. Vil dere sende den til kontoret, bruk «Send på e-post» — adressen er contact@euroressurs.com.';
    }

    if (statusFelt) {
      statusFelt.classList.remove('is-error');
      statusFelt.textContent = 'Forespørselen er registrert med referanse ' + referanse +
        '. Den er ikke sendt noe sted ennå — bruk «Send på e-post» for å sende den til kontaktadressen.';
    }

    laasSkjema(true);

    if (kvittering) {
      var overskrift = kvittering.querySelector('#kv-tittel');
      if (overskrift) {
        overskrift.setAttribute('tabindex', '-1');
        overskrift.focus({ preventScroll: true });
      }
      if (!redusertBevegelse.matches && kvittering.scrollIntoView) {
        kvittering.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  function tilbakestill() {
    if (nullstiller) return;
    nullstiller = true;
    skjema.reset();
    valgteFag = [];
    valgtVarighet = '';
    registrert = false;

    fagValg.forEach(function (knapp) { knapp.setAttribute('aria-pressed', 'false'); });
    varighetValg.forEach(function (knapp) { knapp.setAttribute('aria-pressed', 'false'); });

    laasSkjema(false);
    ryddFeil();
    synkAntall();

    if (referanseFelt) referanseFelt.textContent = 'Ikke tildelt';
    if (tidFelt) tidFelt.textContent = 'Fyll ut feltene ved siden av';
    if (stempel) stempel.textContent = 'Utkast';
    if (kvittering) kvittering.classList.remove('is-done');
    if (handlinger) handlinger.hidden = true;
    if (epostLenke) epostLenke.setAttribute('href', 'mailto:contact@euroressurs.com');
    if (fot) {
      fot.textContent = 'Referansen tildeles når du registrerer forespørselen. Ingenting sendes før du selv sender e-posten.';
    }
    if (statusFelt) {
      statusFelt.classList.remove('is-error');
      statusFelt.textContent = '';
    }

    synk();
    nullstiller = false;
  }

  /* ---------------- Hendelser ---------------- */

  fagValg.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var fag = knapp.getAttribute('data-fag');
      var indeks = valgteFag.indexOf(fag);

      if (indeks === -1) valgteFag.push(fag);
      else valgteFag.splice(indeks, 1);

      knapp.setAttribute('aria-pressed', indeks === -1 ? 'true' : 'false');
      if (indeks === -1) settFeil('fag', '');
      synk();
    });
  });

  varighetValg.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      valgtVarighet = knapp.getAttribute('data-varighet');
      varighetValg.forEach(function (annen) {
        annen.setAttribute('aria-pressed', annen === knapp ? 'true' : 'false');
      });
      settFeil('varighet', '');
      synk();
    });
  });

  tellerKnapper.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      if (!felt.antall) return;
      var steg = Number(knapp.getAttribute('data-teller')) || 0;
      var n = Number(felt.antall.value) || 1;
      n = Math.min(60, Math.max(1, n + steg));
      felt.antall.value = String(n);
      settFeil('antall', '');
      synk();
    });
  });

  skjema.addEventListener('input', function (event) {
    var navn = event.target && event.target.name;
    if (navn && document.getElementById('feil-' + navn)) settFeil(navn, '');
    if (event.target === felt.antall) synkAntall();
    synk();
  });

  skjema.addEventListener('change', function (event) {
    var navn = event.target && event.target.name;
    if (navn && document.getElementById('feil-' + navn)) settFeil(navn, '');
    synk();
  });

  skjema.addEventListener('submit', function (event) {
    event.preventDefault();
    registrer();
  });

  skjema.addEventListener('reset', function (event) {
    // Når vi nullstiller selv, skal nettleseren få gjøre jobben ferdig.
    if (nullstiller) return;
    event.preventDefault();
    tilbakestill();
  });

  if (kopierKnapp) {
    kopierKnapp.addEventListener('click', function () {
      var referanse = referanseFelt ? referanseFelt.textContent : '';
      var tid = tidFelt ? tidFelt.textContent.replace(/^Registrert\s*/, '') : '';
      var tekst = kvitteringTekst(referanse, tid);

      var kvitter = function () {
        if (statusFelt) {
          statusFelt.classList.remove('is-error');
          statusFelt.textContent = 'Kvitteringen er kopiert. Du kan lime den inn i en e-post eller i prosjektmappen.';
        }
        kopierKnapp.textContent = 'Kopiert';
        window.setTimeout(function () { kopierKnapp.textContent = 'Kopier kvittering'; }, 2400);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(kvitter, function () {
          if (statusFelt) {
            statusFelt.classList.add('is-error');
            statusFelt.textContent = 'Nettleseren ville ikke kopiere. Merk teksten i kvitteringen og kopier manuelt.';
          }
        });
        return;
      }

      var hjelp = document.createElement('textarea');
      hjelp.value = tekst;
      hjelp.setAttribute('readonly', '');
      hjelp.style.position = 'fixed';
      hjelp.style.top = '-1000px';
      document.body.appendChild(hjelp);
      hjelp.select();
      try {
        document.execCommand('copy');
        kvitter();
      } catch (feil) {
        if (statusFelt) {
          statusFelt.classList.add('is-error');
          statusFelt.textContent = 'Kopiering virket ikke i denne nettleseren. Merk teksten og kopier manuelt.';
        }
      }
      document.body.removeChild(hjelp);
    });
  }

  if (nyKnapp) nyKnapp.addEventListener('click', tilbakestill);

  synk();
})();
