/*
  Din Elektriker AS — demointeraksjon.
  Alt skjer i nettleseren: meny, innlesing og forespørselen med kvittering.
  Ingenting sendes eller lagres.
*/
(function () {
  'use strict';

  var dok = document;
  var redusertBevegelse = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ---------- Mobilmeny ---------- */

  var menyKnapp = dok.getElementById('menyKnapp');
  var meny = dok.getElementById('meny');

  function settMeny(apen) {
    if (!menyKnapp || !meny) return;
    menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
    menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    meny.hidden = !apen;
  }

  if (menyKnapp && meny) {
    menyKnapp.addEventListener('click', function () {
      settMeny(menyKnapp.getAttribute('aria-expanded') !== 'true');
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    dok.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && menyKnapp.getAttribute('aria-expanded') === 'true') {
        settMeny(false);
        menyKnapp.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) settMeny(false);
    });
  }

  /* ---------- Innlesing av seksjoner ---------- */

  var innlesing = [].slice.call(dok.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window && innlesing.length) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (oppforing) {
        if (oppforing.isIntersecting) {
          oppforing.target.classList.add('is-visible');
          observator.unobserve(oppforing.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });

    innlesing.forEach(function (element) { observator.observe(element); });

    /* Sikring: innholdet skal aldri bli stående usynlig om observatøren
       ikke får meldt fra (utskrift, lange skjermbilder, gamle nettlesere). */
    setTimeout(function () {
      innlesing.forEach(function (element) { element.classList.add('is-visible'); });
    }, 1000);
  } else {
    innlesing.forEach(function (element) { element.classList.add('is-visible'); });
  }

  /* ---------- Forespørselen ---------- */

  var skjema = dok.getElementById('forespSkjema');
  if (!skjema) return;

  var steg1 = dok.getElementById('steg1');
  var steg2 = dok.getElementById('steg2');
  var kvittering = dok.getElementById('kvittering');
  var stegTekst = dok.getElementById('stegTekst');
  var stegStatus = dok.getElementById('stegStatus');
  var prikk = [].slice.call(dok.querySelectorAll('#prikk li'));
  var kort = dok.getElementById('forespKort');

  var navnFelt = dok.getElementById('navn');
  var telefonFelt = dok.getElementById('telefon');
  var epostFelt = dok.getElementById('epost');
  var beskrivelseFelt = dok.getElementById('beskrivelse');

  var feilTjeneste = dok.getElementById('feil-tjeneste');
  var feilNavn = dok.getElementById('feil-navn');
  var feilTelefon = dok.getElementById('feil-telefon');
  var feilEpost = dok.getElementById('feil-epost');

  var valgtTjeneste = '';
  var valgtKundetype = 'Privatkunde';

  var rullValg = { behavior: redusertBevegelse ? 'auto' : 'smooth', block: 'start' };

  function tjenesteRadio() {
    return [].slice.call(skjema.querySelectorAll('input[name="tjeneste"]'));
  }

  function kundetypeRadio() {
    return [].slice.call(skjema.querySelectorAll('input[name="kundetype"]'));
  }

  function synkValg() {
    [].slice.call(dok.querySelectorAll('.chip, .seg__opt')).forEach(function (merke) {
      var input = merke.querySelector('input');
      merke.classList.toggle('is-on', !!(input && input.checked));
    });
  }

  tjenesteRadio().forEach(function (input) {
    input.addEventListener('change', function () {
      valgtTjeneste = input.value;
      if (feilTjeneste) feilTjeneste.hidden = true;
      synkValg();
    });
  });

  kundetypeRadio().forEach(function (input) {
    input.addEventListener('change', function () {
      valgtKundetype = input.value;
      synkValg();
    });
  });

  function visFeil(element, vis) {
    if (!element) return;
    element.hidden = !vis;
  }

  function merkFelt(felt, ugyldig) {
    if (!felt) return;
    if (ugyldig) felt.setAttribute('aria-invalid', 'true');
    else felt.removeAttribute('aria-invalid');
  }

  function settSteg(steg) {
    steg1.hidden = steg !== 1;
    steg2.hidden = steg !== 2;
    skjema.hidden = steg === 3;
    kvittering.hidden = steg !== 3;

    prikk.forEach(function (prikkElement, indeks) {
      prikkElement.classList.toggle('is-active', indeks < steg);
    });

    if (stegTekst) stegTekst.textContent = steg === 3 ? 'Kvittering' : 'Steg ' + steg + ' av 3';

    if (stegStatus) {
      stegStatus.textContent = steg === 3
        ? 'Forespørselen er registrert. Steg 3 av 3.'
        : 'Steg ' + steg + ' av 3: ' + (steg === 1 ? 'velg tjeneste.' : 'kontaktinfo.');
    }
  }

  function tilSteg1() {
    settSteg(1);
    var valgt = tjenesteRadio().filter(function (input) { return input.checked; })[0];
    if (valgt) valgt.focus({ preventScroll: true });
  }

  dok.getElementById('tilSteg2').addEventListener('click', function () {
    if (!valgtTjeneste) {
      visFeil(feilTjeneste, true);
      var forste = tjenesteRadio()[0];
      if (forste) forste.focus({ preventScroll: true });
      return;
    }
    visFeil(feilTjeneste, false);
    settSteg(2);
    setTimeout(function () { navnFelt.focus({ preventScroll: true }); }, 30);
  });

  dok.getElementById('tilSteg1').addEventListener('click', tilSteg1);

  [navnFelt, telefonFelt, epostFelt].forEach(function (felt) {
    if (!felt) return;
    felt.addEventListener('input', function () {
      merkFelt(felt, false);
      if (felt === navnFelt) visFeil(feilNavn, false);
      if (felt === telefonFelt) visFeil(feilTelefon, false);
      if (felt === epostFelt) visFeil(feilEpost, false);
    });
  });

  function siffer(verdi) {
    return String(verdi || '').replace(/[^0-9]/g, '');
  }

  function epostGyldig(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function lagReferanse() {
    var na = new Date();
    var dato = String(na.getFullYear()) +
      String(na.getMonth() + 1).padStart(2, '0') +
      String(na.getDate()).padStart(2, '0');
    var nummer = 100 + Math.floor(Math.random() * 900);
    return 'DIN-' + dato + '-' + nummer;
  }

  function lagKvittering() {
    var navn = navnFelt.value.trim();
    var telefon = siffer(telefonFelt.value);
    var visTelefon = telefon.replace(/^(\d{3})(\d{2})(\d{3})$/, '$1 $2 $3');
    var epost = epostFelt.value.trim();
    var beskrivelse = beskrivelseFelt.value.trim();
    var referanse = lagReferanse();

    var rader = [
      ['Tjeneste', valgtTjeneste],
      ['Du er', valgtKundetype],
      ['Navn', navn],
      ['Telefon', visTelefon],
      ['E-post', epost || 'Ikke oppgitt'],
      ['Beskrivelse', beskrivelse || 'Ikke oppgitt']
    ];

    var sum = dok.getElementById('kvSum');
    sum.textContent = '';
    rader.forEach(function (rad) {
      var div = dok.createElement('div');
      var dt = dok.createElement('dt');
      var dd = dok.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      div.appendChild(dt);
      div.appendChild(dd);
      sum.appendChild(div);
    });

    dok.getElementById('kvRef').textContent = referanse;

    var kropp = 'Forespørsel ' + referanse + '\n\n' +
      'Tjeneste: ' + valgtTjeneste + '\n' +
      'Kunde: ' + valgtKundetype + '\n' +
      'Navn: ' + navn + '\n' +
      'Telefon: ' + visTelefon + '\n' +
      'E-post: ' + (epost || 'ikke oppgitt') + '\n' +
      'Beskrivelse: ' + (beskrivelse || 'ikke oppgitt') + '\n';

    dok.getElementById('kvMail').href = 'mailto:sven@dinel.no' +
      '?subject=' + encodeURIComponent('Forespørsel ' + referanse + ' – ' + valgtTjeneste) +
      '&body=' + encodeURIComponent(kropp + '\nSendt fra dinel.no');
  }

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();

    var gyldig = true;

    if (!navnFelt.value.trim()) {
      visFeil(feilNavn, true);
      merkFelt(navnFelt, true);
      gyldig = false;
    }

    if (!/^\d{8}$/.test(siffer(telefonFelt.value))) {
      visFeil(feilTelefon, true);
      merkFelt(telefonFelt, true);
      gyldig = false;
    }

    if (epostFelt.value.trim() && !epostGyldig(epostFelt.value.trim())) {
      visFeil(feilEpost, true);
      merkFelt(epostFelt, true);
      gyldig = false;
    }

    if (!gyldig) {
      var forsteFeil = skjema.querySelector('[aria-invalid="true"]');
      if (forsteFeil) forsteFeil.focus({ preventScroll: true });
      return;
    }

    lagKvittering();
    settSteg(3);

    var overskrift = kvittering.querySelector('h3');
    if (overskrift) {
      overskrift.setAttribute('tabindex', '-1');
      overskrift.focus({ preventScroll: true });
    }

    if (kort && kort.getBoundingClientRect().top < 0) {
      kort.scrollIntoView(rullValg);
    }
  });

  dok.getElementById('kvEndre').addEventListener('click', function () {
    settSteg(2);
    setTimeout(function () { navnFelt.focus({ preventScroll: true }); }, 30);
  });

  dok.getElementById('kvNy').addEventListener('click', function () {
    skjema.reset();
    valgtTjeneste = '';
    valgtKundetype = 'Privatkunde';
    [feilTjeneste, feilNavn, feilTelefon, feilEpost].forEach(function (element) {
      visFeil(element, false);
    });
    [navnFelt, telefonFelt, epostFelt].forEach(function (felt) { merkFelt(felt, false); });
    synkValg();
    settSteg(1);
    kort.scrollIntoView(rullValg);
  });

  /* Tjenesteknappene forhåndsvelger tjenesten og tar deg til skjemaet. */

  [].slice.call(dok.querySelectorAll('[data-tjeneste]')).forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var onsket = knapp.getAttribute('data-tjeneste');
      var treff = tjenesteRadio().filter(function (input) { return input.value === onsket; })[0];

      if (treff) {
        treff.checked = true;
        valgtTjeneste = treff.value;
        visFeil(feilTjeneste, false);
        synkValg();
      }

      settSteg(1);
      if (kort) kort.scrollIntoView(rullValg);

      if (treff) {
        setTimeout(function () { treff.focus({ preventScroll: true }); }, 30);
      }
    });
  });

  /* Starttilstand: marker standardvalgene. */
  synkValg();
})();
