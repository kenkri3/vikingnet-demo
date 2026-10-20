/*
  Fjorden Regnskap — interaksjon.
  Alt skjer i nettleseren: ingen innsending, ingen lagring, ingen backend.
*/

(function () {
  'use strict';

  var rolig = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------- Mobilmeny ---------------- */

  var toggle = document.querySelector('.nav-toggle');
  var meny = document.getElementById('hovedmeny');
  var smalSkjerm = window.matchMedia('(max-width: 900px)');

  function settMeny(apen) {
    if (!toggle || !meny) return;
    toggle.setAttribute('aria-expanded', apen ? 'true' : 'false');
    toggle.setAttribute('aria-label', apen ? 'Lukk meny' : 'Åpne meny');
    meny.classList.toggle('nav--lukket', !apen);
  }

  if (toggle && meny) {
    toggle.addEventListener('click', function () {
      settMeny(toggle.getAttribute('aria-expanded') !== 'true');
    });

    meny.addEventListener('click', function (event) {
      if (event.target.closest('a')) settMeny(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        settMeny(false);
        toggle.focus();
      }
    });

    var vedBrytning = function () {
      if (!smalSkjerm.matches) settMeny(false);
    };
    if (smalSkjerm.addEventListener) smalSkjerm.addEventListener('change', vedBrytning);
    else if (smalSkjerm.addListener) smalSkjerm.addListener(vedBrytning);
  }

  /* ---------------- Henvendelsen ---------------- */

  var form = document.getElementById('henv-skjema');
  var kvittering = document.getElementById('kvittering');

  if (form && kvittering) {
    var panelene = Array.prototype.slice.call(form.querySelectorAll('[data-panel]'));
    var prikkene = Array.prototype.slice.call(form.querySelectorAll('[data-prikk]'));
    var stegNr = document.getElementById('steg-nr');
    var stegNavn = document.getElementById('steg-navn');
    var tilbakeKnapp = document.getElementById('tilbake');
    var nesteKnapp = document.getElementById('neste');
    var sendKnapp = document.getElementById('send');
    var valgene = Array.prototype.slice.call(form.querySelectorAll('.valg__knapp'));
    var valgNavn = { 1: 'Hva gjelder det', 2: 'System og selskap', 3: 'Kontakt' };

    var felt = {
      system: document.getElementById('system'),
      org: document.getElementById('org'),
      navn: document.getElementById('navn'),
      epost: document.getElementById('epost'),
      telefon: document.getElementById('telefon')
    };

    var steg = 1;
    var teller = 1041;
    var data = { tjeneste: '', system: '', org: '', navn: '', epost: '', telefon: '' };

    function settFeil(nokkel, vis) {
      var melding = document.getElementById('feil-' + nokkel);
      if (melding) melding.hidden = !vis;
      var element = felt[nokkel];
      if (element) {
        if (vis) element.setAttribute('aria-invalid', 'true');
        else element.removeAttribute('aria-invalid');
      }
    }

    function skjulAlleFeil() {
      ['tjeneste', 'system', 'org', 'navn', 'epost', 'telefon'].forEach(function (n) {
        settFeil(n, false);
      });
    }

    function bareSifre(verdi) {
      return String(verdi || '').replace(/\D/g, '');
    }

    function orgPen(verdi) {
      var siffer = bareSifre(verdi);
      if (siffer.length !== 9) return verdi;
      return siffer.slice(0, 3) + ' ' + siffer.slice(3, 6) + ' ' + siffer.slice(6);
    }

    function oppsummer() {
      document.getElementById('sum-tjeneste').textContent = data.tjeneste || 'Ikke valgt';
      document.getElementById('sum-system').textContent = data.system || 'Ikke valgt';
      document.getElementById('sum-org').textContent = data.org ? orgPen(data.org) : 'Ikke oppgitt';

      var kontakt = [];
      if (data.navn) kontakt.push(data.navn);
      if (data.epost) kontakt.push(data.epost);
      if (data.telefon) kontakt.push(data.telefon);
      document.getElementById('sum-kontakt').textContent = kontakt.length ? kontakt.join(' · ') : 'Ikke oppgitt';
    }

    function visSteg(n) {
      steg = n;
      panelene.forEach(function (panel) {
        panel.hidden = Number(panel.getAttribute('data-panel')) !== n;
      });
      prikkene.forEach(function (prikk) {
        var nummer = Number(prikk.getAttribute('data-prikk'));
        prikk.classList.toggle('er-aktiv', nummer === n);
        prikk.classList.toggle('er-ferdig', nummer < n);
      });
      stegNr.textContent = String(n);
      stegNavn.textContent = valgNavn[n];
      tilbakeKnapp.hidden = n === 1;
      nesteKnapp.hidden = n === 3;
      sendKnapp.hidden = n !== 3;
    }

    function flyttFokus(n) {
      var panel = form.querySelector('[data-panel="' + n + '"]');
      if (!panel) return;
      var mal = panel.querySelector('.valg__knapp, input, select, textarea');
      if (mal) {
        try {
          mal.focus({ preventScroll: true });
        } catch (feil) {
          mal.focus();
        }
      }
    }

    function gyldig(n) {
      skjulAlleFeil();
      if (n === 1) {
        if (!data.tjeneste) {
          settFeil('tjeneste', true);
          return false;
        }
        return true;
      }
      if (n === 2) {
        data.system = felt.system.value;
        data.org = bareSifre(felt.org.value);
        var ok = true;
        if (!data.system) {
          settFeil('system', true);
          ok = false;
        }
        if (data.org && data.org.length !== 9) {
          settFeil('org', true);
          ok = false;
        }
        oppsummer();
        return ok;
      }
      data.navn = felt.navn.value.trim();
      data.epost = felt.epost.value.trim();
      data.telefon = felt.telefon.value.trim();
      var gyldigEpost = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.epost);
      var siffer = bareSifre(data.telefon);
      var ok3 = true;
      if (data.navn.length < 2) {
        settFeil('navn', true);
        ok3 = false;
      }
      if (!gyldigEpost) {
        settFeil('epost', true);
        ok3 = false;
      }
      if (siffer.length < 6) {
        settFeil('telefon', true);
        ok3 = false;
      }
      oppsummer();
      return ok3;
    }

    function velgTjeneste(navn) {
      data.tjeneste = navn;
      valgene.forEach(function (knapp) {
        knapp.setAttribute('aria-pressed', knapp.getAttribute('data-tjeneste') === navn ? 'true' : 'false');
      });
      settFeil('tjeneste', false);
      oppsummer();
    }

    function visKvittering() {
      var naa = new Date();
      var dato = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }).format(naa);
      var klokke = new Intl.DateTimeFormat('nb-NO', { hour: '2-digit', minute: '2-digit' }).format(naa);
      var fornavn = data.navn.split(/\s+/)[0];
      var referanse = 'FR-' + naa.getFullYear() + '-' + String(teller);
      teller += 1;

      document.getElementById('kvittering-ref').textContent = referanse;
      document.getElementById('kvittering-tekst').textContent =
        'Takk, ' + fornavn + '. Henvendelsen ligger hos oss med referansen under. Vi tar kontakt på ' +
        data.epost + ' eller ' + data.telefon + '.';
      document.getElementById('kvittering-tjeneste').textContent = data.tjeneste;
      document.getElementById('kvittering-system').textContent = data.system;
      document.getElementById('kvittering-tid').textContent = dato + ' kl. ' + klokke;

      form.hidden = true;
      kvittering.hidden = false;
      try {
        kvittering.focus({ preventScroll: true });
      } catch (feil) {
        kvittering.focus();
      }
      kvittering.scrollIntoView({ behavior: rolig.matches ? 'auto' : 'smooth', block: 'nearest' });
    }

    function startPaaNytt() {
      form.reset();
      data = { tjeneste: '', system: '', org: '', navn: '', epost: '', telefon: '' };
      valgene.forEach(function (knapp) {
        knapp.setAttribute('aria-pressed', 'false');
      });
      skjulAlleFeil();
      oppsummer();
      kvittering.hidden = true;
      form.hidden = false;
      visSteg(1);
      flyttFokus(1);
    }

    valgene.forEach(function (knapp) {
      knapp.addEventListener('click', function () {
        velgTjeneste(knapp.getAttribute('data-tjeneste'));
      });
    });

    ['system', 'org', 'navn', 'epost', 'telefon'].forEach(function (nokkel) {
      if (!felt[nokkel]) return;
      felt[nokkel].addEventListener('input', function () {
        if (nokkel === 'system') data.system = felt.system.value;
        else if (nokkel === 'org') data.org = bareSifre(felt.org.value);
        else data[nokkel] = felt[nokkel].value.trim();
        settFeil(nokkel, false);
        oppsummer();
      });
      felt[nokkel].addEventListener('change', function () {
        settFeil(nokkel, false);
      });
    });

    nesteKnapp.addEventListener('click', function () {
      if (!gyldig(steg)) {
        flyttFokus(steg);
        return;
      }
      if (steg < 3) {
        visSteg(steg + 1);
        flyttFokus(steg);
      }
    });

    tilbakeKnapp.addEventListener('click', function () {
      if (steg > 1) {
        visSteg(steg - 1);
        flyttFokus(steg);
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (steg < 3) {
        if (gyldig(steg)) {
          visSteg(steg + 1);
          flyttFokus(steg);
        }
        return;
      }
      if (!gyldig(3)) {
        flyttFokus(3);
        return;
      }
      visKvittering();
    });

    document.getElementById('ny-henvendelse').addEventListener('click', startPaaNytt);

    /* Tjenestelisten mater skjemaet */
    Array.prototype.slice.call(document.querySelectorAll('[data-velg-tjeneste]')).forEach(function (knapp) {
      knapp.addEventListener('click', function () {
        if (!kvittering.hidden) startPaaNytt();
        velgTjeneste(knapp.getAttribute('data-velg-tjeneste'));
        var maal = document.getElementById('henvendelse');
        if (maal) maal.scrollIntoView({ behavior: rolig.matches ? 'auto' : 'smooth', block: 'start' });
        var valgtKnapp = form.querySelector('.valg__knapp[aria-pressed="true"]');
        if (valgtKnapp) {
          window.setTimeout(function () {
            try {
              valgtKnapp.focus({ preventScroll: true });
            } catch (feil) {
              valgtKnapp.focus();
            }
          }, rolig.matches ? 0 : 320);
        }
      });
    });

    oppsummer();
    visSteg(1);
  }

  /* ---------------- Rolig innstigning ---------------- */

  var elementer = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (!('IntersectionObserver' in window) || rolig.matches) {
    elementer.forEach(function (element) {
      element.classList.add('is-visible');
    });
  } else {
    var observator = new IntersectionObserver(
      function (oppforinger) {
        oppforinger.forEach(function (oppforing) {
          if (oppforing.isIntersecting) {
            oppforing.target.classList.add('is-visible');
            observator.unobserve(oppforing.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    elementer.forEach(function (element) {
      observator.observe(element);
    });
  }
})();
