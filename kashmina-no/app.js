/*
  Kashmina — demo.
  Alt skjer i nettleseren: status regnes ut fra telefontiden som står på
  kashmina.no, og forespørselen blir til en kvittering lokalt. Ingenting
  sendes, ingenting lagres.
*/
(function () {
  'use strict';

  const UKEDAG = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const NORSK_DAG = {
    1: 'mandag',
    2: 'tirsdag',
    3: 'onsdag',
    4: 'torsdag',
    5: 'fredag',
    6: 'lørdag',
    7: 'søndag'
  };

  /* Kundeservice på telefon: mandag og torsdag kl. 10–12. */
  const TELEFON_DAGER = [1, 4];
  const APNER = 10 * 60;
  const STENGER = 12 * 60;

  const roligBevegelse = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /* ---------------- Tid i Oslo, uavhengig av nettleserens sone ---------- */

  function norskTid() {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Oslo',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    });
    const deler = {};
    fmt.formatToParts(new Date()).forEach(function (del) {
      deler[del.type] = del.value;
    });
    return {
      dag: UKEDAG[deler.weekday],
      minutter: Number(deler.hour) * 60 + Number(deler.minute)
    };
  }

  function telefontidNa() {
    const na = norskTid();
    if (TELEFON_DAGER.indexOf(na.dag) !== -1 && na.minutter >= APNER && na.minutter < STENGER) {
      return { apen: true, neste: '' };
    }
    for (let i = 0; i < 8; i += 1) {
      const dag = ((na.dag - 1 + i) % 7) + 1;
      if (TELEFON_DAGER.indexOf(dag) === -1) continue;
      if (i === 0 && na.minutter < APNER) return { apen: false, neste: 'i dag kl. 10:00' };
      if (i === 0) continue;
      if (i === 1) return { apen: false, neste: 'i morgen kl. 10:00' };
      return { apen: false, neste: NORSK_DAG[dag] + ' kl. 10:00' };
    }
    return { apen: false, neste: 'neste telefontid' };
  }

  function oppdaterStatus() {
    const kort = document.getElementById('status');
    const tilstand = document.getElementById('status-state');
    const detalj = document.getElementById('status-detail');
    if (!kort || !tilstand || !detalj) return;

    const t = telefontidNa();
    if (t.apen) {
      kort.classList.remove('is-closed');
      tilstand.textContent = 'Åpent nå';
      detalj.textContent = '· stenger kl. 12:00';
    } else {
      kort.classList.add('is-closed');
      tilstand.textContent = 'Stengt nå';
      detalj.textContent = '· åpner ' + t.neste;
    }
  }

  /* ---------------- Meny ------------------------------------------------ */

  function initMeny() {
    const knapp = document.querySelector('.nav-toggle');
    const meny = document.getElementById('nav');
    if (!knapp || !meny) return;

    function lukk() {
      meny.classList.remove('is-open');
      knapp.setAttribute('aria-expanded', 'false');
    }

    knapp.addEventListener('click', function () {
      const apen = meny.classList.toggle('is-open');
      knapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) lukk();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) lukk();
    });
  }

  /* ---------------- Innhold som tones inn ------------------------------ */

  function initAvslor() {
    const elementer = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!elementer.length) return;

    function synlig(el) {
      el.classList.add('is-visible');
    }

    if (!('IntersectionObserver' in window) || roligBevegelse()) {
      elementer.forEach(synlig);
      return;
    }

    const observator = new IntersectionObserver(
      function (oppforinger) {
        oppforinger.forEach(function (opp) {
          if (opp.isIntersecting) {
            synlig(opp.target);
            observator.unobserve(opp.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
    );

    elementer.forEach(function (el) {
      observator.observe(el);
    });

    /* Sikkerhetsnett: et skjermbilde eller en skjermleser skal aldri møte tomme flater. */
    window.setTimeout(function () {
      elementer.forEach(synlig);
    }, 1400);
  }

  /* ---------------- Forespørsel med kvittering ------------------------- */

  function initSkjema() {
    const skjema = document.getElementById('foresporsel-form');
    const kvittering = document.getElementById('kvittering');
    if (!skjema || !kvittering) return;

    const stegElementer = Array.prototype.slice.call(skjema.querySelectorAll('.step'));
    const punkter = Array.prototype.slice.call(document.querySelectorAll('.progress__dot'));
    const stegTekst = document.getElementById('steg-tekst');
    const framdrift = document.querySelector('.progress');
    const feilboks = document.getElementById('form-feil');
    const chips = Array.prototype.slice.call(skjema.querySelectorAll('.chip'));
    const sporsmalFelt = document.getElementById('sporsmal-felt');
    const navnFelt = document.getElementById('navn');
    const epostFelt = document.getElementById('epost');
    const telefonFelt = document.getElementById('telefon');
    const stegNavn = ['tema og spørsmål', 'kontaktinformasjon', 'se over'];

    const oppsummering = {
      tema: document.getElementById('sum-tema'),
      sporsmal: document.getElementById('sum-sporsmal'),
      navn: document.getElementById('sum-navn'),
      kontakt: document.getElementById('sum-kontakt')
    };

    let steg = 1;
    let tema = '';

    function visFeil(melding) {
      if (!feilboks) return;
      if (!melding) {
        feilboks.hidden = true;
        feilboks.textContent = '';
        return;
      }
      feilboks.hidden = false;
      feilboks.textContent = melding;
    }

    function visSteg(n) {
      steg = n;
      stegElementer.forEach(function (el) {
        el.hidden = Number(el.dataset.steg) !== n;
      });
      punkter.forEach(function (prikk, i) {
        prikk.classList.toggle('is-done', i < n);
      });
      if (stegTekst) stegTekst.textContent = 'Steg ' + n + ' av 3 · ' + stegNavn[n - 1];
      visFeil('');
    }

    function gyldigEpost(verdi) {
      return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(verdi.trim());
    }

    function valider(n) {
      if (n === 1) {
        if (!tema) return 'Velg hva forespørselen gjelder.';
        if (sporsmalFelt.value.trim().length < 5) return 'Skriv noen ord om hva vi kan hjelpe med.';
        return '';
      }
      if (n === 2) {
        if (navnFelt.value.trim().length < 2) return 'Fyll inn navnet ditt.';
        if (!gyldigEpost(epostFelt.value)) return 'Fyll inn en gyldig e-postadresse, så vi får svart.';
        const telefon = telefonFelt.value.trim();
        if (telefon && !/^[0-9 +().-]{6,}$/.test(telefon)) return 'Telefonnummeret ser ikke riktig ut.';
        return '';
      }
      return '';
    }

    function kontaktlinje() {
      const deler = [epostFelt.value.trim()];
      if (telefonFelt.value.trim()) deler.push(telefonFelt.value.trim());
      return deler.join(' · ');
    }

    function fyllOppsummering() {
      if (oppsummering.tema) oppsummering.tema.textContent = tema;
      if (oppsummering.sporsmal) oppsummering.sporsmal.textContent = sporsmalFelt.value.trim();
      if (oppsummering.navn) oppsummering.navn.textContent = navnFelt.value.trim();
      if (oppsummering.kontakt) oppsummering.kontakt.textContent = kontaktlinje();
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        tema = chip.dataset.tema;
        chips.forEach(function (annen) {
          annen.setAttribute('aria-pressed', annen === chip ? 'true' : 'false');
        });
        visFeil('');
      });
    });

    skjema.addEventListener('click', function (hendelse) {
      const nesteKnapp = hendelse.target.closest('[data-neste]');
      const tilbakeKnapp = hendelse.target.closest('[data-forrige]');

      if (nesteKnapp) {
        const feil = valider(steg);
        if (feil) {
          visFeil(feil);
          if (steg === 1) {
            (tema ? sporsmalFelt : chips[0]).focus();
          } else {
            navnFelt.focus();
          }
          return;
        }
        if (steg === 2) fyllOppsummering();
        visSteg(Math.min(3, steg + 1));
        const overskrift = skjema.querySelector('.step[data-steg="' + steg + '"] legend');
        if (overskrift) {
          overskrift.setAttribute('tabindex', '-1');
          overskrift.focus({ preventScroll: true });
        }
      }

      if (tilbakeKnapp) visSteg(Math.max(1, steg - 1));
    });

    function lagReferanse() {
      const ar = new Date().getFullYear();
      const nummer = String(1000 + Math.floor(Math.random() * 9000));
      return 'KS-' + ar + '-' + nummer;
    }

    function visKvittering() {
      const t = telefontidNa();
      document.getElementById('kv-ref').textContent = lagReferanse();
      document.getElementById('kv-tema').textContent = tema;
      document.getElementById('kv-sporsmal').textContent = sporsmalFelt.value.trim();
      document.getElementById('kv-navn').textContent = navnFelt.value.trim();
      document.getElementById('kv-kontakt').textContent = kontaktlinje();
      document.getElementById('kv-neste').textContent = t.apen
        ? 'Telefonen er betjent nå — svar før kl. 12:00'
        : 'Åpner ' + t.neste;

      skjema.hidden = true;
      if (framdrift) framdrift.hidden = true;
      kvittering.hidden = false;

      const tittel = document.getElementById('kv-tittel');
      if (tittel) tittel.focus({ preventScroll: true });
      kvittering.scrollIntoView({
        block: 'center',
        behavior: roligBevegelse() ? 'auto' : 'smooth'
      });
    }

    skjema.addEventListener('submit', function (hendelse) {
      hendelse.preventDefault();
      const feil = valider(1) || valider(2);
      if (feil) {
        visFeil(feil);
        return;
      }
      visKvittering();
    });

    const nyKnapp = document.getElementById('kv-ny');
    if (nyKnapp) {
      nyKnapp.addEventListener('click', function () {
        skjema.reset();
        tema = '';
        chips.forEach(function (chip) {
          chip.setAttribute('aria-pressed', 'false');
        });
        kvittering.hidden = true;
        skjema.hidden = false;
        if (framdrift) framdrift.hidden = false;
        visSteg(1);
        sporsmalFelt.focus();
      });
    }

    visSteg(1);
  }

  /* ---------------- Start ---------------------------------------------- */

  function start() {
    initMeny();
    initAvslor();
    initSkjema();
    oppdaterStatus();
    window.setInterval(oppdaterStatus, 60 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
