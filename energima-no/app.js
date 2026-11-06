/*
  Energima — demoens interaksjon.
  Alt skjer i nettleseren: ingen data sendes, ingen backend kalles.
  Forespørselen blir en kvittering på siden, med en frivillig
  e-postlenke (mailto) hvis brukeren vil sende den selv.
*/
(function () {
  'use strict';

  /* ---- Mobilmeny ------------------------------------------------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav();
    });
  }

  /* ---- Serviceforespørsel ---------------------------------------------- */

  var form = document.getElementById('req-form');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
  var stepperItems = Array.prototype.slice.call(form.querySelectorAll('[data-stepper]'));
  var chips = Array.prototype.slice.call(form.querySelectorAll('.chip'));
  var receipt = document.getElementById('receipt');
  var errors = {
    service: form.querySelector('[data-err="service"]'),
    kontakt: form.querySelector('[data-err="kontakt"]')
  };

  var teams = {
    'Ventilasjonsservice': 'Serviceteam ventilasjon',
    'Kjøleservice': 'Serviceteam kulde',
    'Solenergi': 'Solteamet',
    'Energi- og driftsovervåkning': 'Energima Overvåkning',
    'Energirådgivning': 'Energima Analyse',
    'Smartbygg': 'Smartbygg-teamet',
    'Prosjekt & Entreprise': 'Prosjektavdelingen',
    'Industri': 'Energima Industri',
    'Boligservice': 'Energima Boligservice'
  };

  var chosen = '';
  var current = 1;

  function felt(navn) {
    return form.querySelector('[name="' + navn + '"]');
  }

  function verdi(navn) {
    var el = felt(navn);
    return el ? el.value.trim() : '';
  }

  function visFeil(nokkel, vis) {
    var el = errors[nokkel];
    if (el) el.hidden = !vis;
  }

  function visSteg(nummer) {
    current = nummer;
    steps.forEach(function (steg) {
      steg.hidden = steg.getAttribute('data-step') !== String(nummer);
    });
    stepperItems.forEach(function (item) {
      var n = Number(item.getAttribute('data-stepper'));
      item.classList.toggle('is-active', n === nummer);
      item.classList.toggle('is-done', n < nummer);
    });
    var aktiv = form.querySelector('[data-step="' + nummer + '"]');
    if (aktiv) {
      aktiv.setAttribute('tabindex', '-1');
      aktiv.focus({ preventScroll: true });
    }
  }

  function gyldigEpost(verdi) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(verdi);
  }

  function oppsummer() {
    var rader = {
      service: chosen,
      bygg: verdi('bygg'),
      navn: verdi('navn'),
      epost: verdi('epost'),
      telefon: verdi('telefon') || 'Ikke oppgitt',
      melding: verdi('melding') || 'Ikke oppgitt'
    };
    Object.keys(rader).forEach(function (nokkel) {
      var el = form.querySelector('[data-sum="' + nokkel + '"]');
      if (el) el.textContent = rader[nokkel];
    });
  }

  function saksnummer() {
    var ar = new Date().getFullYear();
    var nummer = String(Math.floor(1000 + Math.random() * 9000));
    return 'EN-' + ar + '-' + nummer;
  }

  function lagKvittering() {
    var id = saksnummer();
    var kontakt = verdi('navn') + (verdi('epost') ? ' · ' + verdi('epost') : '');
    var map = {
      id: id,
      service: chosen,
      team: teams[chosen] || 'Serviceavdelingen',
      bygg: verdi('bygg'),
      kontakt: kontakt
    };
    Object.keys(map).forEach(function (nokkel) {
      var el = receipt.querySelector('[data-receipt="' + nokkel + '"]');
      if (el) el.textContent = map[nokkel];
    });

    var emne = 'Serviceforespørsel: ' + chosen;
    var kropp = [
      'Saksnummer: ' + id,
      'Tjeneste: ' + chosen,
      'Rutet til: ' + map.team,
      'Byggtype: ' + verdi('bygg'),
      'Navn: ' + verdi('navn'),
      'E-post: ' + verdi('epost'),
      'Telefon: ' + (verdi('telefon') || 'Ikke oppgitt'),
      '',
      'Melding:',
      verdi('melding') || 'Ikke oppgitt'
    ].join('\n');

    var mailto = receipt.querySelector('[data-mailto]');
    if (mailto) {
      mailto.setAttribute(
        'href',
        'mailto:post@energima.no?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp)
      );
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (annen) {
        annen.setAttribute('aria-pressed', 'false');
      });
      chip.setAttribute('aria-pressed', 'true');
      chosen = chip.getAttribute('data-service');
      visFeil('service', false);
    });
  });

  form.addEventListener('click', function (event) {
    var next = event.target.closest('[data-next]');
    var back = event.target.closest('[data-back]');
    var reset = event.target.closest('[data-reset]');

    if (next) {
      if (current === 1) {
        if (!chosen) {
          visFeil('service', true);
          return;
        }
        visSteg(2);
        return;
      }
      if (current === 2) {
        var mangler = !verdi('bygg') || !verdi('navn') || !gyldigEpost(verdi('epost'));
        visFeil('kontakt', mangler);
        if (mangler) return;
        oppsummer();
        visSteg(3);
      }
      return;
    }

    if (back) {
      visSteg(current > 1 ? current - 1 : 1);
      return;
    }

    if (reset) {
      form.reset();
      chosen = '';
      chips.forEach(function (chip) {
        chip.setAttribute('aria-pressed', 'false');
      });
      visFeil('service', false);
      visFeil('kontakt', false);
      receipt.hidden = true;
      form.querySelectorAll('.step').forEach(function (steg) {
        steg.hidden = steg.getAttribute('data-step') !== '1';
      });
      visSteg(1);
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    lagKvittering();
    form.querySelectorAll('.step').forEach(function (steg) {
      steg.hidden = true;
    });
    stepperItems.forEach(function (item) {
      item.classList.remove('is-active');
      item.classList.add('is-done');
    });
    receipt.hidden = false;
    receipt.setAttribute('tabindex', '-1');
    receipt.focus({ preventScroll: true });
  });
})();
