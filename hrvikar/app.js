/*
  HR Vikar AS — app.js
  Én interaksjon: «Bestill vikar» i tre steg, med oppsummering og mailto.
  Alt skjer i nettleseren. Ingenting sendes til en server, og ingenting lagres.
*/
(function () {
  'use strict';

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
      var open = meny.classList.toggle('is-open');
      menyKnapp.setAttribute('aria-expanded', open ? 'true' : 'false');
      menyKnapp.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
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

  /* ---------------- Årstall i footer ---------------- */
  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());

  /* ---------------- Bestill vikar ----------------
     Steg 1: rolle/bransje. Steg 2: oppstart og varighet.
     Steg 3: kontaktinfo. Steg 4: se over og send på e-post.
  */
  var skjema = document.getElementById('bestill-skjema');
  var kort = document.getElementById('bestill-kort');

  if (skjema && kort) {
    var visninger = Array.prototype.slice.call(kort.querySelectorAll('.wizard__view'));
    var indikatorer = Array.prototype.slice.call(kort.querySelectorAll('.wizard__bar li'));
    var oppsummering = document.getElementById('summary');
    var sendStatus = document.getElementById('sendStatus');

    var FELT = {
      1: ['rolle'],
      2: ['startdato', 'varighet'],
      3: ['navn', 'virksomhet', 'telefon', 'epost']
    };

    var PAAKREVD = {
      rolle: 'Velg hvilken rolle du trenger.',
      startdato: 'Velg en startdato.',
      varighet: 'Velg hvor lenge du trenger folk.',
      navn: 'Fyll inn navnet ditt.',
      virksomhet: 'Fyll inn navnet på virksomheten.',
      telefon: 'Fyll inn et telefonnummer vi kan nå deg på.',
      epost: 'Fyll inn en e-postadresse vi kan svare til.'
    };

    var steg = 1;

    function felt(navn) {
      return skjema.elements[navn];
    }

    function feilFor(el) {
      var navn = el.name;
      var verdi = (el.value || '').trim();

      if (!verdi) return PAAKREVD[navn] || 'Feltet må fylles ut.';

      if (navn === 'epost') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi)) {
          return 'Skriv en gyldig e-postadresse, f.eks. navn@virksomhet.no.';
        }
      }

      if (navn === 'telefon') {
        var siffer = verdi.replace(/[^0-9]/g, '');
        if (siffer.length < 8) return 'Telefonnummeret må ha minst åtte siffer.';
      }

      if (navn === 'startdato') {
        var valgt = new Date(verdi + 'T00:00:00');
        var iDag = new Date();
        iDag.setHours(0, 0, 0, 0);
        if (isNaN(valgt.getTime())) return 'Skriv inn en dato på formatet år-måned-dag.';
        if (valgt < iDag) return 'Velg dagens dato eller en dato fram i tid.';
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

    function sjekkSteg(nummer) {
      var ok = true;
      var forsteFeil = null;

      FELT[nummer].forEach(function (navn) {
        var el = felt(navn);
        if (!el) return;
        var melding = feilFor(el);
        merkFelt(el, melding);
        if (melding) {
          ok = false;
          if (!forsteFeil) forsteFeil = el;
        }
      });

      if (forsteFeil) forsteFeil.focus();
      return ok;
    }

    function vis(nummer, flytt) {
      steg = nummer;

      visninger.forEach(function (visning) {
        visning.hidden = Number(visning.getAttribute('data-view')) !== nummer;
      });

      indikatorer.forEach(function (ind, i) {
        var n = i + 1;
        ind.classList.toggle('is-current', nummer === n);
        ind.classList.toggle('is-done', nummer > n);
        if (nummer === n) {
          ind.setAttribute('aria-current', 'step');
        } else {
          ind.removeAttribute('aria-current');
        }
      });

      if (nummer === 4) oppdaterOppsummering();

      // Ikke flytt fokus eller scroll ved første tegning — bare når brukeren bytter steg.
      if (flytt === false) return;

      var overskrift = kort.querySelector('.wizard__view:not([hidden]) legend');
      if (overskrift) {
        kort.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        overskrift.setAttribute('tabindex', '-1');
        overskrift.focus({ preventScroll: true });
      }
    }

    function formaterDato(verdi) {
      if (!verdi) return 'Ikke oppgitt';
      var d = new Date(verdi + 'T00:00:00');
      if (isNaN(d.getTime())) return verdi;
      try {
        return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch (error) {
        return verdi;
      }
    }

    function verdier() {
      return {
        rolle: (felt('rolle').value || '').trim(),
        bransje: (felt('bransje').value || '').trim(),
        startdato: (felt('startdato').value || '').trim(),
        varighet: (felt('varighet').value || '').trim(),
        navn: (felt('navn').value || '').trim(),
        virksomhet: (felt('virksomhet').value || '').trim(),
        telefon: (felt('telefon').value || '').trim(),
        epost: (felt('epost').value || '').trim(),
        merknad: (felt('merknad').value || '').trim()
      };
    }

    function oppdaterOppsummering() {
      var v = verdier();
      var rader = [
        ['Rolle', v.rolle],
        ['Bransje', v.bransje || 'Ikke oppgitt'],
        ['Startdato', formaterDato(v.startdato)],
        ['Varighet', v.varighet],
        ['Navn', v.navn],
        ['Virksomhet', v.virksomhet],
        ['Telefon', v.telefon],
        ['E-post', v.epost]
      ];

      if (v.merknad) rader.push(['Om oppdraget', v.merknad]);

      oppsummering.textContent = '';
      rader.forEach(function (rad) {
        var div = document.createElement('div');
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = rad[0];
        dd.textContent = rad[1];
        div.appendChild(dt);
        div.appendChild(dd);
        oppsummering.appendChild(div);
      });
    }

    function lagEpost() {
      var v = verdier();
      var emne = 'Forespørsel om vikar – ' + v.rolle + ' – ' + formaterDato(v.startdato);

      var linjer = [
        'Hei!',
        '',
        'Jeg sender en forespørsel om vikar fra nettsiden deres.',
        '',
        'Rolle: ' + v.rolle,
        'Bransje: ' + (v.bransje || 'Ikke oppgitt'),
        'Startdato: ' + formaterDato(v.startdato),
        'Varighet: ' + v.varighet,
        '',
        'Kontaktperson: ' + v.navn,
        'Virksomhet: ' + v.virksomhet,
        'Telefon: ' + v.telefon,
        'E-post: ' + v.epost
      ];

      if (v.merknad) linjer.push('', 'Om oppdraget:', v.merknad);
      linjer.push('', 'Hilsen ' + v.navn);

      return {
        emne: emne,
        lenke: 'mailto:heidi@hrvikar.no?subject=' + encodeURIComponent(emne) +
          '&body=' + encodeURIComponent(linjer.join('\n'))
      };
    }

    kort.addEventListener('click', function (event) {
      var knapp = event.target.closest('[data-next], [data-back]');
      if (!knapp) return;

      var neste = knapp.getAttribute('data-next');
      var tilbake = knapp.getAttribute('data-back');

      if (tilbake) {
        vis(Number(tilbake));
        return;
      }

      if (neste) {
        var mal = Number(neste);
        if (mal > steg && !sjekkSteg(steg)) return;
        vis(mal);
      }
    });

    skjema.addEventListener('input', function (event) {
      var el = event.target;
      if (!el.name) return;
      if (el.closest('.field') && el.closest('.field').hasAttribute('data-invalid')) {
        merkFelt(el, feilFor(el));
      }
    });

    skjema.addEventListener('change', function (event) {
      var el = event.target;
      if (!el.name) return;
      if (el.closest('.field') && el.closest('.field').hasAttribute('data-invalid')) {
        merkFelt(el, feilFor(el));
      }
    });

    skjema.addEventListener('submit', function (event) {
      event.preventDefault();

      // Enter i et tidligere steg skal gå videre, ikke sende.
      if (steg !== 4) {
        if (sjekkSteg(steg)) vis(Math.min(steg + 1, 4));
        return;
      }

      var epost = lagEpost();
      window.location.href = epost.lenke;

      if (sendStatus) {
        sendStatus.classList.remove('is-error');
        sendStatus.textContent = 'E-postklienten din åpnes med forespørselen ferdig utfylt. ' +
          'Skjer det ingenting, kan du sende den til heidi@hrvikar.no.';
      }
    });

    // Startdato kan ikke være bakover i tid.
    var datoFelt = felt('startdato');
    if (datoFelt) {
      var iDag = new Date();
      var iso = new Date(iDag.getTime() - iDag.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      datoFelt.setAttribute('min', iso);
    }

    vis(1, false);
  }

})()
