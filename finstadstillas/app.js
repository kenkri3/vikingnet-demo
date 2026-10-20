/* Finstad Stillas — demo.
   Alt skjer i nettleseren: ingen innsending, ingen lagring, ingen backend.
   Forespørselen bygger et sammendrag brukeren selv sender eller kopierer. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var menyKnapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');
  var smalSkjerm = window.matchMedia('(max-width: 900px)');

  function settMeny(apen) {
    if (!menyKnapp || !meny) return;
    meny.hidden = !apen;
    menyKnapp.setAttribute('aria-expanded', apen ? 'true' : 'false');
    menyKnapp.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
  }

  if (menyKnapp && meny) {
    if (smalSkjerm.matches) settMeny(false);

    menyKnapp.addEventListener('click', function () {
      settMeny(menyKnapp.getAttribute('aria-expanded') !== 'true');
    });

    meny.addEventListener('click', function (hendelse) {
      if (smalSkjerm.matches && hendelse.target.closest('a')) settMeny(false);
    });

    smalSkjerm.addEventListener('change', function (hendelse) {
      if (hendelse.matches) {
        settMeny(false);
      } else {
        meny.hidden = false;
        menyKnapp.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Innhold som kommer inn ved scroll ---------- */

  var avslor = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window && avslor.length) {
    var observator = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (oppforing) {
        if (!oppforing.isIntersecting) return;
        oppforing.target.classList.add('is-visible');
        observator.unobserve(oppforing.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    avslor.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 45, 270) + 'ms';
      observator.observe(el);
    });
  } else {
    avslor.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- Forespørsel i tre nivåer ---------- */

  var skjema = document.getElementById('fpsForm');
  if (!skjema) return;

  var paneler = Array.prototype.slice.call(skjema.querySelectorAll('[data-panel]'));
  var stegMerker = Array.prototype.slice.call(document.querySelectorAll('.niva__steg'));
  var lagKnapp = document.getElementById('fpsLag');
  var kvittering = document.getElementById('kvittering');
  var kvTittel = document.getElementById('kvTittel');
  var kvStatus = document.getElementById('kvStatus');
  var kvSend = document.getElementById('kvSend');
  var kvKopier = document.getElementById('kvKopier');
  var kvNy = document.getElementById('kvNy');
  var aktivtSteg = 1;
  var sisteVerdier = null;
  var sisteReferanse = '';

  function panelFor(n) {
    return skjema.querySelector('[data-panel="' + n + '"]');
  }

  function visSteg(n) {
    aktivtSteg = n;
    paneler.forEach(function (panel) {
      panel.hidden = Number(panel.dataset.panel) !== n;
    });
    stegMerker.forEach(function (merke) {
      var erAktivt = Number(merke.dataset.niva) === n;
      merke.classList.toggle('is-aktiv', erAktivt);
      if (erAktivt) {
        merke.setAttribute('aria-current', 'step');
      } else {
        merke.removeAttribute('aria-current');
      }
    });

    var panel = panelFor(n);
    if (!panel) return;
    var forste = panel.querySelector('input[type="radio"], select, input:not([type="radio"]), textarea');
    if (forste) forste.focus({ preventScroll: true });
  }

  function visFeil(n, tekst) {
    var felt = skjema.querySelector('[data-feil="' + n + '"]');
    if (!felt) return;
    felt.textContent = tekst || '';
    felt.setAttribute('role', tekst ? 'alert' : 'presentation');
  }

  function gyldigSteg(n) {
    var verdier = lesVerdier();

    if (n === 1) {
      if (!verdier.stillas) {
        visFeil(1, 'Velg hvilken type stillas du trenger — eller «Vet ikke ennå».');
        return false;
      }
      visFeil(1, '');
      return true;
    }

    if (n === 2) {
      if (!verdier.bygg) {
        visFeil(2, 'Velg type bygg.');
        return false;
      }
      if (!verdier.etasjer) {
        visFeil(2, 'Velg antall etasjer.');
        return false;
      }
      visFeil(2, '');
      return true;
    }

    if (n === 3) {
      if (verdier.navn.length < 2) {
        visFeil(3, 'Skriv navnet ditt.');
        return false;
      }
      var siffer = verdier.telefon.replace(/[^0-9]/g, '');
      if (siffer.length < 8) {
        visFeil(3, 'Skriv et telefonnummer med minst åtte siffer.');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdier.epost)) {
        visFeil(3, 'Skriv en e-postadresse vi kan svare på.');
        return false;
      }
      visFeil(3, '');
      return true;
    }

    return true;
  }

  function lesVerdier() {
    var data = new FormData(skjema);
    function hent(nokkel) {
      var verdi = data.get(nokkel);
      return verdi === null ? '' : String(verdi).trim();
    }
    return {
      stillas: hent('stillas'),
      bygg: hent('bygg'),
      etasjer: hent('etasjer'),
      dato: hent('dato'),
      kommentar: hent('kommentar'),
      navn: hent('navn'),
      telefon: hent('telefon'),
      epost: hent('epost')
    };
  }

  function norskDato(iso) {
    var deler = iso.split('-');
    if (deler.length !== 3) return iso;
    return deler[2] + '.' + deler[1] + '.' + deler[0];
  }

  function lagReferanse() {
    var na = new Date();
    var to = function (tall) {
      return tall < 10 ? '0' + tall : String(tall);
    };
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var kode = '';
    for (var i = 0; i < 4; i++) {
      kode += tegn.charAt(Math.floor(Math.random() * tegn.length));
    }
    return 'FS-' + na.getFullYear() + to(na.getMonth() + 1) + to(na.getDate()) + '-' + kode;
  }

  function sammendrag(verdier, referanse) {
    return [
      'Hei,',
      'jeg vil gjerne ha et tilbud på stillas.',
      '',
      'Stillas: ' + verdier.stillas,
      'Type bygg: ' + verdier.bygg,
      'Etasjer: ' + verdier.etasjer,
      'Ønsket oppstart: ' + (verdier.dato ? norskDato(verdier.dato) : 'ikke oppgitt'),
      'Kommentar: ' + (verdier.kommentar ? verdier.kommentar : 'ingen'),
      '',
      'Referanse: ' + referanse,
      '',
      'Navn: ' + verdier.navn,
      'Telefon: ' + verdier.telefon,
      'E-post: ' + verdier.epost
    ].join('\n');
  }

  function fyllKvittering() {
    var verdier = lesVerdier();
    sisteVerdier = verdier;
    sisteReferanse = lagReferanse();

    var sett = function (id, tekst) {
      var el = document.getElementById(id);
      if (el) el.textContent = tekst;
    };

    sett('kvRef', sisteReferanse);
    sett('kvStillas', verdier.stillas);
    sett('kvBygg', verdier.bygg);
    sett('kvEtasjer', verdier.etasjer);
    sett('kvDato', verdier.dato ? norskDato(verdier.dato) : 'Ikke oppgitt');
    sett('kvKommentar', verdier.kommentar ? verdier.kommentar : 'Ingen kommentar');
    sett('kvKontakt', verdier.navn + ' · ' + verdier.telefon + ' · ' + verdier.epost);

    kvSend.setAttribute(
      'href',
      'mailto:post@finstadstillas.no?subject=' +
        encodeURIComponent('Forespørsel om ' + verdier.stillas.toLowerCase() + ' — ' + sisteReferanse) +
        '&body=' +
        encodeURIComponent(sammendrag(verdier, sisteReferanse))
    );

    kvStatus.textContent = '';
    skjema.hidden = true;
    kvittering.hidden = false;

    var roligBevegelse = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    kvittering.scrollIntoView({ behavior: roligBevegelse ? 'auto' : 'smooth', block: 'center' });
    if (kvTittel) kvTittel.focus({ preventScroll: true });
  }

  skjema.addEventListener('submit', function (hendelse) {
    hendelse.preventDefault();
    if (aktivtSteg < 3) {
      if (gyldigSteg(aktivtSteg)) visSteg(aktivtSteg + 1);
    } else if (gyldigSteg(3)) {
      fyllKvittering();
    }
  });

  Array.prototype.forEach.call(skjema.querySelectorAll('[data-neste]'), function (knapp) {
    knapp.addEventListener('click', function () {
      if (!gyldigSteg(aktivtSteg)) return;
      if (aktivtSteg < 3) visSteg(aktivtSteg + 1);
    });
  });

  Array.prototype.forEach.call(skjema.querySelectorAll('[data-tilbake]'), function (knapp) {
    knapp.addEventListener('click', function () {
      if (aktivtSteg > 1) visSteg(aktivtSteg - 1);
    });
  });

  if (lagKnapp) {
    lagKnapp.addEventListener('click', function () {
      if (!gyldigSteg(3)) return;
      fyllKvittering();
    });
  }

  skjema.addEventListener('input', function (hendelse) {
    var felt = hendelse.target;
    if (!felt.matches('input, select, textarea')) return;
    visFeil(aktivtSteg, '');
  });

  if (kvKopier) {
    kvKopier.addEventListener('click', function () {
      if (!sisteVerdier) return;
      var tekst = sammendrag(sisteVerdier, sisteReferanse);

      function virket() {
        kvStatus.textContent = 'Kopiert. Lim det inn i e-posten eller der du vil sende det.';
      }

      function virketIkke() {
        kvStatus.textContent =
          'Nettleseren ville ikke kopiere automatisk. Merk teksten i sammendraget og kopier den selv.';
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tekst).then(virket, virketIkke);
      } else {
        virketIkke();
      }
    });
  }

  if (kvNy) {
    kvNy.addEventListener('click', function () {
      skjema.reset();
      sisteVerdier = null;
      sisteReferanse = '';
      [1, 2, 3].forEach(function (n) {
        visFeil(n, '');
      });
      kvittering.hidden = true;
      skjema.hidden = false;
      visSteg(1);
    });
  }
})();
