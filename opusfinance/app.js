/* ==========================================================================
   OPUS Finance Recruitment — demointeraksjon.
   Alt kjører i nettleseren. Ingenting sendes til en server: forespørselen
   bygges opp lokalt og åpnes i brukerens egen e-postklient via mailto.
   ========================================================================== */
(function () {
  'use strict';

  var rot = document.documentElement;
  var header = document.querySelector('.header');

  /* --- Høyde på sticky header, så anker hopper riktig ------------------- */
  function malHeader() {
    if (header) rot.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  malHeader();
  window.addEventListener('resize', malHeader);

  /* --- Mobilmeny -------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var meny = document.getElementById('hovedmeny');
  var smal = window.matchMedia('(max-width: 900px)');

  function lukkMeny() {
    if (!toggle || !meny || !smal.matches) return;
    meny.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Åpne menyen');
  }

  if (toggle && meny) {
    meny.hidden = smal.matches;
    toggle.addEventListener('click', function () {
      var apen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!apen));
      toggle.setAttribute('aria-label', apen ? 'Åpne menyen' : 'Lukk menyen');
      meny.hidden = apen;
    });
    meny.addEventListener('click', function (e) {
      if (e.target.closest('a')) lukkMeny();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        lukkMeny();
        if (toggle.getAttribute('aria-expanded') === 'true') toggle.focus();
      }
    });
    if (smal.addEventListener) {
      smal.addEventListener('change', function () {
        if (!smal.matches) {
          meny.hidden = false;
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          meny.hidden = true;
        }
      });
    }
  }

  /* --- Innhold som kommer til syne -------------------------------------- */
  var reveal = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && reveal.length) {
    var obs = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (o) {
        if (o.isIntersecting) {
          o.target.classList.add('is-visible');
          obs.unobserve(o.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveal.forEach(function (el) { obs.observe(el); });
    // Sikring: hvis noe aldri blir observert, skal det uansett vises.
    window.setTimeout(function () {
      reveal.forEach(function (el) { el.classList.add('is-visible'); });
    }, 2500);
  } else {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --- FAQ: ett åpent svar om gangen ------------------------------------ */
  var faqItems = [].slice.call(document.querySelectorAll('.faqitem'));
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (annen) {
        if (annen !== item) annen.open = false;
      });
    });
  });

  /* --- Forespørselen ----------------------------------------------------- */
  var skjema = document.getElementById('samtale');
  if (!skjema) return;

  var panels = [].slice.call(skjema.querySelectorAll('[data-step]'));
  var indikatorer = [].slice.call(skjema.querySelectorAll('[data-step-ind]'));
  var status = document.getElementById('wiz-status');
  var steg = 1;
  var referanse = '';

  var feltNavn = {
    1: ['behov'],
    2: ['rolle', 'tidsramme'],
    3: ['navn', 'firma', 'epost', 'telefon', 'melding']
  };

  function panel(nr) {
    return skjema.querySelector('.wiz__panel[data-step="' + nr + '"]');
  }

  function verdi(navn) {
    var el = skjema.elements[navn];
    if (!el) return '';
    if (el instanceof RadioNodeList || (el.length && !el.tagName)) {
      return el.value || '';
    }
    return (el.value || '').trim();
  }

  function settFeil(nokkel, tekst) {
    var p = skjema.querySelector('[data-feil="' + nokkel + '"]');
    if (p) p.textContent = tekst || '';
  }

  function tømFeil() {
    [].slice.call(skjema.querySelectorAll('.wiz__feil')).forEach(function (p) {
      p.textContent = '';
    });
    [].slice.call(skjema.querySelectorAll('[aria-invalid]')).forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });
  }

  function visSteg(nr, fokus) {
    steg = nr;
    panels.forEach(function (p) {
      p.hidden = Number(p.getAttribute('data-step')) !== nr;
    });
    indikatorer.forEach(function (li) {
      var n = Number(li.getAttribute('data-step-ind'));
      li.classList.toggle('is-active', n === nr);
      li.classList.toggle('is-done', n < nr);
      if (n === nr) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    if (status) {
      var navn = { 1: 'Behov', 2: 'Rolle', 3: 'Kontakt', 4: 'Oppsummering', 5: 'Kvittering' };
      status.textContent = 'Steg ' + nr + ' av 5: ' + navn[nr];
    }
    if (fokus) {
      var aktiv = panel(nr);
      var mal = aktiv && (aktiv.querySelector('input:not([type="radio"]), select, textarea') || aktiv.querySelector('.valg__kort input') || aktiv.querySelector('button'));
      if (mal) {
        window.setTimeout(function () { mal.focus({ preventScroll: true }); }, 60);
      }
    }
  }

  function gyldigEpost(v) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
  }

  function valider(nr) {
    tømFeil();
    if (nr === 1) {
      if (!verdi('behov')) {
        settFeil('behov', 'Velg hva forespørselen gjelder.');
        return false;
      }
      return true;
    }
    if (nr === 2) {
      var feil = [];
      if (!verdi('rolle')) feil.push('rolle');
      if (!verdi('tidsramme')) feil.push('tidsramme');
      if (feil.length) {
        settFeil('rolle', 'Velg rolle og tidsramme, så vet vi hvem som bør svare.');
        if (feil.indexOf('rolle') > -1) {
          var rolle = document.getElementById('rolle');
          rolle.setAttribute('aria-invalid', 'true');
          rolle.focus();
        } else {
          document.getElementById('tidsramme').focus();
        }
        return false;
      }
      return true;
    }
    if (nr === 3) {
      var mangler = [];
      if (verdi('navn').length < 2) mangler.push('navn');
      if (verdi('firma').length < 2) mangler.push('firma');
      if (!gyldigEpost(verdi('epost'))) mangler.push('epost');
      var siffer = verdi('telefon').replace(/[^\d+]/g, '');
      if (siffer.replace(/\D/g, '').length < 8) mangler.push('telefon');

      if (mangler.length) {
        var tekst = mangler.indexOf('navn') > -1 || mangler.indexOf('firma') > -1
          ? 'Fyll ut navn og virksomhet.'
          : (mangler.indexOf('epost') > -1
            ? 'Skriv en gyldig e-postadresse.'
            : 'Skriv et telefonnummer med minst 8 siffer.');
        settFeil('kontakt', tekst);
        mangler.forEach(function (n) {
          var el = document.getElementById(n);
          if (el) el.setAttribute('aria-invalid', 'true');
        });
        var forste = document.getElementById(mangler[0]);
        if (forste) forste.focus();
        return false;
      }
      return true;
    }
    return true;
  }

  function fyllOppsummering() {
    [].slice.call(skjema.querySelectorAll('[data-sum]')).forEach(function (dd) {
      var navn = dd.getAttribute('data-sum');
      var v = verdi(navn);
      dd.textContent = v || '–';
    });
    var melding = verdi('melding');
    var rad = skjema.querySelector('[data-sum-rad="melding"]');
    if (rad) rad.hidden = !melding;
    var kontakt = skjema.querySelector('[data-kvittering-kontakt]');
    if (kontakt) {
      kontakt.textContent = verdi('navn') + ', ' + verdi('firma') + ' · ' + verdi('epost') + ' · ' + verdi('telefon');
    }
  }

  function lagReferanse() {
    var d = new Date();
    var to = function (n) { return String(n).padStart(2, '0'); };
    var tilfeldig = String(Math.floor(100 + Math.random() * 900));
    return 'OFR-' + d.getFullYear() + to(d.getMonth() + 1) + to(d.getDate()) + '-' + tilfeldig;
  }

  function sammendrag() {
    return [
      'Uforpliktende samtale – OPUS Finance Recruitment',
      'Referanse: ' + referanse,
      '',
      'Behov: ' + verdi('behov'),
      'Rolle: ' + verdi('rolle'),
      'Tidsramme: ' + verdi('tidsramme'),
      'Navn: ' + verdi('navn'),
      'Virksomhet: ' + verdi('firma'),
      'E-post: ' + verdi('epost'),
      'Telefon: ' + verdi('telefon'),
      verdi('melding') ? 'Melding: ' + verdi('melding') : ''
    ].filter(Boolean).join('\n');
  }

  function oppdaterEpost() {
    var lenke = skjema.querySelector('[data-send-epost]');
    if (!lenke) return;
    var emne = 'Uforpliktende samtale – ' + (verdi('firma') || 'forespørsel');
    lenke.setAttribute('href', 'mailto:kontakt@opusfinance.no?subject=' +
      encodeURIComponent(emne) + '&body=' + encodeURIComponent(sammendrag()));
  }

  skjema.addEventListener('click', function (e) {
    var knapp = e.target.closest('button, a');
    if (!knapp) return;

    if (knapp.hasAttribute('data-neste')) {
      if (!valider(steg)) return;
      if (steg === 3) {
        fyllOppsummering();
        visSteg(4, true);
        return;
      }
      if (steg === 4) return;
      visSteg(steg + 1, true);
      return;
    }

    if (knapp.hasAttribute('data-tilbake')) {
      tømFeil();
      visSteg(Math.max(1, steg - 1), true);
      return;
    }

    if (knapp.hasAttribute('data-lag-kvittering')) {
      if (!valider(1) || !valider(2) || !valider(3)) return;
      referanse = lagReferanse();
      var refEl = skjema.querySelector('[data-referanse]');
      if (refEl) refEl.textContent = referanse;
      fyllOppsummering();
      oppdaterEpost();
      visSteg(5, true);
      return;
    }

    if (knapp.hasAttribute('data-kopier')) {
      var tekst = sammendrag();
      var kvit = function () {
        var forrige = knapp.textContent;
        knapp.textContent = 'Kopiert';
        window.setTimeout(function () { knapp.textContent = forrige; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(kvit, function () { fallbackKopier(tekst, kvit); });
      } else {
        fallbackKopier(tekst, kvit);
      }
      return;
    }

    if (knapp.hasAttribute('data-start-pa-nytt')) {
      skjema.reset();
      referanse = '';
      tømFeil();
      var refEl2 = skjema.querySelector('[data-referanse]');
      if (refEl2) refEl2.textContent = '–';
      visSteg(1, true);
      return;
    }
  });

  function fallbackKopier(tekst, ferdig) {
    var ta = document.createElement('textarea');
    ta.value = tekst;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); ferdig(); } catch (err) { /* ignoreres */ }
    document.body.removeChild(ta);
  }

  /* --- Snarveier fra hero og tjenestekort ------------------------------- */
  var preselect = [].slice.call(document.querySelectorAll('[data-preselect]'));
  preselect.forEach(function (knapp) {
    knapp.addEventListener('click', function () {
      var onske = knapp.getAttribute('data-preselect');
      var radio = skjema.querySelector('input[name="behov"][value="' + onske + '"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      tømFeil();
      visSteg(2, false);
      var mal = document.getElementById('kontakt');
      if (mal) {
        mal.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.setTimeout(function () {
        var rolle = document.getElementById('rolle');
        if (rolle) rolle.focus({ preventScroll: true });
      }, 320);
    });
  });

  /* --- Enter i feltene går videre i stedet for å sende ----------------- */
  skjema.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.target.tagName === 'TEXTAREA') return;
    if (e.target.matches('button')) return;
    var neste = panel(steg) && panel(steg).querySelector('[data-neste]');
    if (neste) {
      e.preventDefault();
      neste.click();
    }
  });

  // Skjemaet sendes aldri til en server.
  skjema.addEventListener('submit', function (e) { e.preventDefault(); });

  visSteg(1, false);
}());
