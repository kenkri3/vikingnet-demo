/*
  Accountor — interaksjon.
  To ting: mobilmeny og en forespørselsflyt i tre steg med kvittering.
  Alt skjer i nettleseren. Ingenting sendes, og ingenting lagres.
*/
(function () {
  'use strict';

  var $ = function (sel, rot) { return (rot || document).querySelector(sel); };
  var $$ = function (sel, rot) {
    return Array.prototype.slice.call((rot || document).querySelectorAll(sel));
  };

  document.documentElement.classList.add('js');

  /* --- Årstall i footer ------------------------------------------------- */

  var aar = $('#aar');
  if (aar) aar.textContent = String(new Date().getFullYear());

  /* --- Mobilmeny -------------------------------------------------------- */

  var toggle = $('#navToggle');
  var nav = $('#nav');

  if (toggle && nav) {
    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
      nav.hidden = !open;
    };

    toggle.addEventListener('click', function () {
      setNav(nav.hidden);
    });

    nav.addEventListener('click', function (event) {
      var lenke = event.target && event.target.closest ? event.target.closest('a') : null;
      if (lenke) setNav(false);
    });

    var vedBredde = function () {
      if (window.innerWidth > 900) {
        nav.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
      }
    };
    window.addEventListener('resize', vedBredde);
    vedBredde();
  }

  /* --- Innhold som toner inn -------------------------------------------- */

  var synlige = $$('.reveal');
  if (synlige.length) {
    if (!('IntersectionObserver' in window)) {
      synlige.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observator = new IntersectionObserver(function (oppforinger) {
        oppforinger.forEach(function (oppforing) {
          if (oppforing.isIntersecting) {
            oppforing.target.classList.add('is-visible');
            observator.unobserve(oppforing.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
      synlige.forEach(function (el) { observator.observe(el); });
    }
  }

  /* --- Forespørsel i tre steg ------------------------------------------- */

  var form = $('#tilbudForm');
  if (!form) return;

  var stegene = $$('.fsteg', form);
  var knappNeste = $('#neste');
  var knappTilbake = $('#tilbake');
  var stegTekst = $('#stegTekst');
  var barene = $$('.bar');
  var oppsum = $('#oppsum');
  var kvittering = $('#kvittering');
  var kvTittel = $('#kvTittel');
  var kvRef = $('#kvRef');
  var kvOppsum = $('#kvOppsum');
  var knappPaany = $('#paany');
  var stegnavn = ['Behov', 'Kontakt', 'Send'];
  var maksSteg = stegene.length;
  var steg = 1;

  function behovValgt() {
    return $$('input[name="behov"]:checked', form).map(function (i) { return i.value; });
  }

  function settFeil(navn, melding) {
    var p = $('[data-feil="' + navn + '"]');
    if (!p) return;
    if (melding) {
      p.textContent = melding;
      p.hidden = false;
    } else {
      p.hidden = true;
    }
  }

  function merkFelt(felt, feil) {
    if (!felt) return;
    if (feil) felt.setAttribute('aria-invalid', 'true');
    else felt.removeAttribute('aria-invalid');
  }

  function validerSteg1() {
    var ok = true;
    if (behovValgt().length === 0) {
      settFeil('behov', 'Velg minst én tjeneste.');
      ok = false;
    } else {
      settFeil('behov', '');
    }
    return ok;
  }

  function validerSteg2() {
    var ok = true;
    var forsteFeil = null;

    var navn = form.elements.navn;
    if (!navn.value.trim()) {
      settFeil('navn', 'Skriv navnet ditt.');
      merkFelt(navn, true);
      ok = false;
      forsteFeil = forsteFeil || navn;
    } else {
      settFeil('navn', '');
      merkFelt(navn, false);
    }

    var firma = form.elements.firma;
    if (!firma.value.trim()) {
      settFeil('firma', 'Skriv firmanavnet.');
      merkFelt(firma, true);
      ok = false;
      forsteFeil = forsteFeil || firma;
    } else {
      settFeil('firma', '');
      merkFelt(firma, false);
    }

    var epost = form.elements.epost;
    var epostOk = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(epost.value.trim());
    if (!epostOk) {
      settFeil('epost', 'Skriv en e-postadresse vi kan svare på, for eksempel navn@firma.no.');
      merkFelt(epost, true);
      ok = false;
      forsteFeil = forsteFeil || epost;
    } else {
      settFeil('epost', '');
      merkFelt(epost, false);
    }

    var telefon = form.elements.telefon;
    var tall = telefon.value.replace(/[\s.]/g, '');
    var telefonOk = /^(?:\+47)?\d{8}$/.test(tall);
    if (!telefonOk) {
      settFeil('telefon', 'Skriv et telefonnummer med 8 siffer.');
      merkFelt(telefon, true);
      ok = false;
      forsteFeil = forsteFeil || telefon;
    } else {
      settFeil('telefon', '');
      merkFelt(telefon, false);
    }

    if (forsteFeil) forsteFeil.focus();
    return ok;
  }

  function lagRad(container, term, verdi) {
    var rad = document.createElement('div');
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = verdi;
    rad.appendChild(dt);
    rad.appendChild(dd);
    container.appendChild(rad);
  }

  function sammendrag() {
    return [
      ['Tjenester', behovValgt().join(', ')],
      ['Ansatte', form.elements.ansatte.value || 'Ikke oppgitt'],
      ['Navn', form.elements.navn.value.trim()],
      ['Firma', form.elements.firma.value.trim()],
      ['E-post', form.elements.epost.value.trim()],
      ['Telefon', form.elements.telefon.value.trim()],
      ['Ringehelst', form.elements.ringetid.value]
    ];
  }

  function fyllOppsummering(container) {
    container.textContent = '';
    sammendrag().forEach(function (par) {
      lagRad(container, par[0], par[1]);
    });
  }

  function fokuserForst() {
    var aktiv = stegene[steg - 1];
    if (!aktiv) return;
    var forste = aktiv.querySelector('input, select, textarea, button');
    if (forste) forste.focus();
  }

  function visSteg(n) {
    steg = n;
    stegene.forEach(function (del) {
      del.hidden = Number(del.getAttribute('data-steg')) !== n;
    });
    barene.forEach(function (bar) {
      bar.classList.toggle('is-on', Number(bar.getAttribute('data-bar')) <= n);
    });
    if (stegTekst) stegTekst.textContent = 'Steg ' + n + ' av ' + maksSteg + ' · ' + stegnavn[n - 1];
    if (knappTilbake) knappTilbake.hidden = n === 1;
    if (knappNeste) knappNeste.textContent = n === maksSteg ? 'Send forespørsel' : 'Neste';
    if (n === maksSteg && oppsum) fyllOppsummering(oppsum);
  }

  function lagReferanse() {
    var tid = Date.now().toString(36).toUpperCase().slice(-5);
    var slump = Math.random().toString(36).toUpperCase().slice(2, 5);
    return 'ACC-' + tid + slump;
  }

  function send() {
    if (!kvittering) return;
    fyllOppsummering(kvOppsum);
    if (kvRef) kvRef.textContent = lagReferanse();
    var fornavn = form.elements.navn.value.trim().split(/\s+/)[0];
    if (kvTittel) kvTittel.textContent = fornavn ? 'Takk, ' + fornavn + '!' : 'Takk!';
    if (stegTekst) stegTekst.textContent = 'Kvittering';
    barene.forEach(function (bar) { bar.classList.add('is-on'); });
    form.hidden = true;
    kvittering.hidden = false;
    if (kvTittel) {
      kvTittel.setAttribute('tabindex', '-1');
      kvTittel.focus();
    }
  }

  function startPaany() {
    form.reset();
    ['navn', 'firma', 'epost', 'telefon', 'behov'].forEach(function (navn) {
      settFeil(navn, '');
    });
    ['navn', 'firma', 'epost', 'telefon'].forEach(function (navn) {
      merkFelt(form.elements[navn], false);
    });
    if (kvittering) kvittering.hidden = true;
    form.hidden = false;
    visSteg(1);
    var forste = form.querySelector('input[name="behov"]');
    if (forste) forste.focus();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (steg === 1) {
      if (!validerSteg1()) return;
      visSteg(2);
      fokuserForst();
      return;
    }

    if (steg === 2) {
      if (!validerSteg2()) return;
      visSteg(3);
      var tittel = form.querySelector('.oppsum__tittel');
      if (tittel) {
        tittel.setAttribute('tabindex', '-1');
        tittel.focus();
      }
      return;
    }

    send();
  });

  if (knappTilbake) {
    knappTilbake.addEventListener('click', function () {
      if (steg > 1) {
        visSteg(steg - 1);
        fokuserForst();
      }
    });
  }

  if (knappPaany) knappPaany.addEventListener('click', startPaany);

  /* Feilmelding forsvinner så snart brukeren retter på feltet. */
  form.addEventListener('input', function (event) {
    var felt = event.target;
    if (!felt || !felt.name) return;
    if (felt.getAttribute('aria-invalid') === 'true' && felt.value.trim()) {
      merkFelt(felt, false);
      settFeil(felt.name, '');
    }
    if (felt.name === 'behov' && behovValgt().length) settFeil('behov', '');
  });

  visSteg(1);
})();
