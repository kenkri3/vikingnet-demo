/* ==========================================================================
   Liacoaching — interaksjon.

   To ting: mobilmenyen, og henvendelsen i tre steg som setter sammen et
   e-postutkast og viser kvittering. Alt skjer i nettleseren; ingenting sendes
   eller lagres noe sted.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- menyen */

  var meny = document.getElementById('meny');
  var menyKnapp = document.getElementById('meny-knapp');

  function settMeny(apen) {
    if (!meny || !menyKnapp) return;
    meny.classList.toggle('is-open', apen);
    menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
    menyKnapp.setAttribute('aria-label', apen ? 'Lukk menyen' : 'Åpne menyen');
  }

  if (meny && menyKnapp) {
    menyKnapp.addEventListener('click', function () {
      settMeny(!meny.classList.contains('is-open'));
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape') settMeny(false);
    });
  }

  /* ------------------------------------------------------- henvendelsen */

  var skjema = document.getElementById('henvendelse');
  if (!skjema) return;

  var paneler = Array.prototype.slice.call(skjema.querySelectorAll('.steg-panel'));
  var prikker = Array.prototype.slice.call(document.querySelectorAll('#stegliste li'));
  var skjemaKropp = document.getElementById('skjema-kropp');
  var kvittering = document.getElementById('kvittering');
  var brevEl = document.getElementById('kvittering-brev');
  var epostLenke = document.getElementById('apne-epost');
  var kopierKnapp = document.getElementById('kopier');
  var nyKnapp = document.getElementById('start-pa-nytt');
  var knappTilbake = document.getElementById('tilbake');
  var knappNeste = document.getElementById('neste');
  var knappUtkast = document.getElementById('lag-utkast');
  var oppsummering = document.getElementById('oppsummering');

  var MOTTAKER = 'jorn@liacoaching.no';
  var EPOST = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var aktiv = 1;
  var forsteVisning = true;

  function felt(id) {
    return document.getElementById(id);
  }

  function settFeil(id, melding, feltId) {
    var meldingEl = felt(id);
    if (meldingEl) {
      meldingEl.textContent = melding || '';
      meldingEl.hidden = !melding;
    }
    if (feltId) {
      var input = felt(feltId);
      if (input) {
        if (melding) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
    }
  }

  function lesVerdier() {
    var valgt = skjema.querySelector('input[name="tema"]:checked');
    return {
      tema: valgt ? valgt.value : '',
      temaTekst: valgt ? valgt.getAttribute('data-tekst') : '',
      navn: felt('navn').value.trim(),
      epost: felt('epost').value.trim(),
      telefon: felt('telefon').value.trim(),
      melding: felt('melding').value.trim()
    };
  }

  function sjekkSteg(nr) {
    if (nr === 1) {
      var valgt = skjema.querySelector('input[name="tema"]:checked');
      settFeil('feil-tema', valgt ? '' : 'Velg et tema før du går videre.');
      return Boolean(valgt);
    }

    var v = lesVerdier();
    var ok = true;

    if (v.navn.length < 2) {
      settFeil('feil-navn', 'Skriv navnet ditt.', 'navn');
      ok = false;
    } else {
      settFeil('feil-navn', '', 'navn');
    }

    if (!EPOST.test(v.epost)) {
      settFeil('feil-epost', 'Skriv en e-postadresse vi kan svare på.', 'epost');
      ok = false;
    } else {
      settFeil('feil-epost', '', 'epost');
    }

    if (v.melding.length < 10) {
      settFeil('feil-melding', 'Skriv noen ord om situasjonen din.', 'melding');
      ok = false;
    } else {
      settFeil('feil-melding', '', 'melding');
    }

    return ok;
  }

  function visSteg(nr) {
    aktiv = Math.min(3, Math.max(1, nr));

    paneler.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute('data-steg')) !== aktiv;
    });

    prikker.forEach(function (prikk) {
      var nummer = Number(prikk.getAttribute('data-nr'));
      prikk.classList.toggle('er-aktiv', nummer === aktiv);
      prikk.classList.toggle('er-ferdig', nummer < aktiv);
    });

    knappTilbake.hidden = aktiv === 1;
    knappNeste.hidden = aktiv === 3;
    knappUtkast.hidden = aktiv !== 3;

    if (aktiv === 3) byggOppsummering();

    if (!forsteVisning) {
      var maal = paneler[aktiv - 1].querySelector('input[name="tema"], #navn, #oppsummering');
      if (maal) {
        if (maal === oppsummering) {
          oppsummering.setAttribute('tabindex', '-1');
        }
        maal.focus({ preventScroll: true });
      }
    }
    forsteVisning = false;
  }

  function byggOppsummering() {
    var v = lesVerdier();
    var rader = [
      ['Tema', v.tema],
      ['Navn', v.navn],
      ['E-post', v.epost],
      ['Telefon', v.telefon || 'Ikke oppgitt'],
      ['Situasjon', v.melding]
    ];

    oppsummering.textContent = '';
    rader.forEach(function (rad) {
      var radEl = document.createElement('div');
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = rad[0];
      dd.textContent = rad[1];
      radEl.appendChild(dt);
      radEl.appendChild(dd);
      oppsummering.appendChild(radEl);
    });
  }

  function lagBrev(v) {
    var linjer = [
      'Hei Jørn,',
      '',
      'Jeg vil gjerne snakke med deg om ' + v.temaTekst + '.',
      '',
      v.melding,
      '',
      'Navn: ' + v.navn,
      'E-post: ' + v.epost
    ];

    if (v.telefon) linjer.push('Telefon: ' + v.telefon);

    linjer.push('', 'Hilsen', v.navn);
    return linjer.join('\n');
  }

  function visKvittering() {
    var v = lesVerdier();
    var brev = lagBrev(v);
    var emne = 'Henvendelse: ' + v.tema + ' — ' + v.navn;

    brevEl.textContent = brev;
    epostLenke.href = 'mailto:' + MOTTAKER +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(brev);

    skjemaKropp.hidden = true;
    kvittering.hidden = false;
    kvittering.focus({ preventScroll: true });
  }

  function startPaNytt() {
    skjema.reset();
    ['navn', 'epost', 'telefon', 'melding'].forEach(function (id) {
      var input = felt(id);
      if (input) input.removeAttribute('aria-invalid');
    });
    ['feil-tema', 'feil-navn', 'feil-epost', 'feil-melding'].forEach(function (id) {
      settFeil(id, '');
    });
    brevEl.textContent = '';
    epostLenke.href = '#';
    kvittering.hidden = true;
    skjemaKropp.hidden = false;
    forsteVisning = false;
    visSteg(1);
  }

  function velgOgKopier(tekst) {
    try {
      var midlertidig = document.createElement('textarea');
      midlertidig.value = tekst;
      midlertidig.setAttribute('readonly', '');
      midlertidig.style.position = 'fixed';
      midlertidig.style.top = '-1000px';
      midlertidig.style.opacity = '0';
      document.body.appendChild(midlertidig);
      midlertidig.select();
      var kopiert = document.execCommand('copy');
      document.body.removeChild(midlertidig);
      return kopiert;
    } catch (feil) {
      return false;
    }
  }

  knappNeste.addEventListener('click', function () {
    if (sjekkSteg(aktiv)) visSteg(aktiv + 1);
  });

  knappTilbake.addEventListener('click', function () {
    visSteg(aktiv - 1);
  });

  knappUtkast.addEventListener('click', function () {
    if (sjekkSteg(2)) visKvittering();
  });

  kopierKnapp.addEventListener('click', function () {
    var tekst = brevEl.textContent;
    var opprinnelig = 'Kopier teksten';

    function svar(ok) {
      kopierKnapp.textContent = ok ? 'Kopiert' : 'Kunne ikke kopiere';
      window.setTimeout(function () {
        kopierKnapp.textContent = opprinnelig;
      }, 2500);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(
        function () { svar(true); },
        function () { svar(velgOgKopier(tekst)); }
      );
    } else {
      svar(velgOgKopier(tekst));
    }
  });

  nyKnapp.addEventListener('click', startPaNytt);

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
  });

  visSteg(1);
})();
