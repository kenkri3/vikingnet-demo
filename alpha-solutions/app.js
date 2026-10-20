/* Alpha Solutions — demo. Alt skjer i nettleseren: ingenting sendes eller lagres.
   Interaksjonen er en behovsavklaring i tre steg som ender i en kvittering
   brukeren selv kan sende som e-post. */
(function () {
  'use strict';

  /* ---------------- Mobilmeny ---------------- */

  var toggle = document.querySelector('.nav-toggle');
  var meny = document.getElementById('hovedmeny');

  if (toggle && meny) {
    var settMeny = function (apen) {
      toggle.setAttribute('aria-expanded', String(apen));
      if (apen) {
        meny.removeAttribute('hidden');
      } else {
        meny.setAttribute('hidden', '');
      }
    };

    toggle.addEventListener('click', function () {
      settMeny(toggle.getAttribute('aria-expanded') !== 'true');
    });

    meny.addEventListener('click', function (hendelse) {
      if (hendelse.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (hendelse) {
      if (hendelse.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        settMeny(false);
        toggle.focus();
      }
    });
  }

  /* ---------------- Årstall ---------------- */

  var aar = String(new Date().getFullYear());
  Array.prototype.forEach.call(document.querySelectorAll('[data-ar]'), function (el) {
    el.textContent = aar;
  });

  /* ---------------- Behovsavklaring ---------------- */

  var rot = document.querySelector('[data-skjema]');
  if (!rot) return;

  var skjema = rot.querySelector('form');
  var paneler = Array.prototype.slice.call(rot.querySelectorAll('[data-panel]'));
  var punkter = Array.prototype.slice.call(rot.querySelectorAll('.steg__punkt'));
  var knappSend = rot.querySelector('[data-send-epost]');
  var referanseEl = rot.querySelector('[data-referanse]');
  var listeEl = rot.querySelector('[data-kvittering-liste]');
  var tittelEl = rot.querySelector('[data-kvittering-tittel]');
  var sisteSteg = 1;

  function panelFor(steg) {
    return rot.querySelector('[data-panel="' + steg + '"]');
  }

  function visSteg(steg, taFokus) {
    paneler.forEach(function (panel) {
      var erAktiv = panel.getAttribute('data-panel') === String(steg);
      if (erAktiv) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    punkter.forEach(function (punkt) {
      var nummer = Number(punkt.getAttribute('data-merke'));
      punkt.classList.toggle('is-aktiv', nummer === steg);
      punkt.classList.toggle('er-ferdig', nummer < steg);
      if (nummer === steg) {
        punkt.setAttribute('aria-current', 'step');
      } else {
        punkt.removeAttribute('aria-current');
      }
    });

    sisteSteg = steg;

    if (taFokus) {
      var aktivt = panelFor(steg);
      var mal = aktivt && aktivt.querySelector('input, textarea, button');
      if (mal) {
        if (mal.type === 'radio') {
          var valgt = aktivt.querySelector('input[type="radio"]:checked');
          if (valgt) mal = valgt;
        }
        mal.focus({ preventScroll: false });
      }
    }
  }

  function visFeil(navn, tekst) {
    var melding = rot.querySelector('[data-feil-for="' + navn + '"]');
    if (melding) {
      melding.textContent = tekst;
      melding.removeAttribute('hidden');
    }
    var felt = rot.querySelector('[name="' + navn + '"]');
    if (felt && felt.type !== 'radio') felt.setAttribute('aria-invalid', 'true');
  }

  function ryddFeil(navn) {
    var melding = rot.querySelector('[data-feil-for="' + navn + '"]');
    if (melding) melding.setAttribute('hidden', '');
    var felt = rot.querySelector('[name="' + navn + '"]');
    if (felt && felt.type !== 'radio') felt.removeAttribute('aria-invalid');
  }

  Array.prototype.forEach.call(skjema.querySelectorAll('input, textarea'), function (felt) {
    felt.addEventListener('input', function () {
      ryddFeil(felt.name);
    });
    felt.addEventListener('change', function () {
      ryddFeil(felt.name);
    });
  });

  function verdi(navn) {
    var felt = skjema.querySelector('[name="' + navn + '"]');
    if (!felt) return '';
    if (felt.type === 'radio') {
      var valgt = skjema.querySelector('[name="' + navn + '"]:checked');
      return valgt ? valgt.value : '';
    }
    return felt.value.trim();
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[a-zæøåA-ZÆØÅ]{2,}$/.test(verdi);
  }

  function valider(steg) {
    var ok = true;

    if (steg === 1 && !verdi('omrade')) {
      visFeil('omrade', 'Velg ett område.');
      ok = false;
    }

    if (steg === 2 && !verdi('situasjon')) {
      visFeil('situasjon', 'Velg ett alternativ.');
      ok = false;
    }

    if (steg === 3) {
      if (!verdi('navn')) {
        visFeil('navn', 'Skriv inn navnet ditt.');
        ok = false;
      }
      if (!verdi('firma')) {
        visFeil('firma', 'Skriv inn firmanavnet.');
        ok = false;
      }
      var epost = verdi('epost');
      if (!epost) {
        visFeil('epost', 'Skriv inn e-postadressen din.');
        ok = false;
      } else if (!gyldigEpost(epost)) {
        visFeil('epost', 'Skriv inn en gyldig e-postadresse.');
        ok = false;
      }
    }

    if (!ok) {
      var forsteFeil = rot.querySelector('.feil:not([hidden])');
      if (forsteFeil) {
        var navn = forsteFeil.getAttribute('data-feil-for');
        var felt = rot.querySelector('[name="' + navn + '"]');
        if (felt) felt.focus();
      }
    }

    return ok;
  }

  function referanse() {
    var naa = new Date();
    var dato =
      String(naa.getFullYear()) +
      String(naa.getMonth() + 1).padStart(2, '0') +
      String(naa.getDate()).padStart(2, '0');
    var lop = String((naa.getHours() * 60 + naa.getMinutes()) * 7 % 9000 + 1000);
    return 'AV-' + dato + '-' + lop;
  }

  function leggTilRad(forelder, merke, innhold) {
    if (!innhold) return;
    var rad = document.createElement('div');
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.textContent = merke;
    dd.textContent = innhold;
    rad.appendChild(dt);
    rad.appendChild(dd);
    forelder.appendChild(rad);
  }

  function visKvittering() {
    if (!valider(3)) return;

    listeEl.textContent = '';
    leggTilRad(listeEl, 'Område', verdi('omrade'));
    leggTilRad(listeEl, 'Situasjon', verdi('situasjon'));
    leggTilRad(listeEl, 'Navn', verdi('navn'));
    leggTilRad(listeEl, 'Firma', verdi('firma'));
    leggTilRad(listeEl, 'E-post', verdi('epost'));
    leggTilRad(listeEl, 'Telefon', verdi('telefon'));
    leggTilRad(listeEl, 'Merknad', verdi('merknad'));

    referanseEl.textContent = referanse();
    tittelEl.textContent = 'Takk, ' + verdi('navn').split(' ')[0] + '. Forespørselen er klar.';
    knappSend.textContent = 'Send til oslo@alpha-solutions.com';

    visSteg(4, true);
    var kvittering = panelFor(4);
    if (kvittering) kvittering.scrollIntoView({ block: 'nearest' });
  }

  function epostLenke() {
    var linjer = [
      'Område: ' + verdi('omrade'),
      'Situasjon: ' + verdi('situasjon'),
      '',
      'Navn: ' + verdi('navn'),
      'Firma: ' + verdi('firma'),
      'E-post: ' + verdi('epost')
    ];
    if (verdi('telefon')) linjer.push('Telefon: ' + verdi('telefon'));
    if (verdi('merknad')) linjer.push('', 'Kort om situasjonen:', verdi('merknad'));
    linjer.push('', 'Referanse: ' + (referanseEl.textContent || ''));

    var emne = 'Forespørsel: ' + verdi('omrade') + ' – ' + verdi('firma');
    return (
      'mailto:oslo@alpha-solutions.com?subject=' +
      encodeURIComponent(emne) +
      '&body=' +
      encodeURIComponent(linjer.join('\n'))
    );
  }

  skjema.addEventListener('click', function (hendelse) {
    var knapp = hendelse.target.closest('button');
    if (!knapp || !rot.contains(knapp)) return;

    if (knapp.hasAttribute('data-neste')) {
      if (valider(sisteSteg)) visSteg(sisteSteg + 1, true);
      return;
    }

    if (knapp.hasAttribute('data-tilbake')) {
      visSteg(Math.max(1, sisteSteg - 1), true);
      return;
    }

    if (knapp.hasAttribute('data-kvitter')) {
      visKvittering();
      return;
    }

    if (knapp.hasAttribute('data-send-epost')) {
      window.location.href = epostLenke();
      return;
    }

    if (knapp.hasAttribute('data-start-pa-nytt')) {
      skjema.reset();
      Array.prototype.forEach.call(rot.querySelectorAll('.feil'), function (melding) {
        melding.setAttribute('hidden', '');
      });
      Array.prototype.forEach.call(rot.querySelectorAll('[aria-invalid]'), function (felt) {
        felt.removeAttribute('aria-invalid');
      });
      listeEl.textContent = '';
      referanseEl.textContent = '';
      visSteg(1, true);
    }
  });

  skjema.addEventListener('keydown', function (hendelse) {
    if (hendelse.key === 'Enter' && hendelse.target.tagName === 'INPUT' && hendelse.target.type !== 'radio') {
      var panel = hendelse.target.closest('[data-panel]');
      if (!panel) return;
      hendelse.preventDefault();
      var steg = Number(panel.getAttribute('data-panel'));
      if (steg === 3) {
        visKvittering();
      } else if (valider(steg)) {
        visSteg(steg + 1, true);
      }
    }
  });

  visSteg(1, false);
})();
