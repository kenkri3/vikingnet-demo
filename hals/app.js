/*
  Hals Advokatfellesskap — demoens ene interaksjon.
  Alt går i nettleseren: ingen backend, ingen innsamling, ingen sending.
  Kvitteringen lages lokalt og kan sendes videre som e-post (mailto).
*/
(function () {
  'use strict';

  /* --- Mobilmeny --------------------------------------------------------- */

  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav');
  var smal = window.matchMedia('(max-width: 900px)');

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
      if (open) {
        nav.removeAttribute('hidden');
      } else {
        nav.setAttribute('hidden', '');
      }
    };

    setOpen(!smal.matches);

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (smal.matches && event.target.closest('a')) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    smal.addEventListener('change', function (event) {
      setOpen(!event.matches);
    });
  }

  /* --- Årstall i footeren ------------------------------------------------- */

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* --- Henvendelse: fagområde → sak → kvittering ------------------------- */

  var form = document.getElementById('intake');
  if (!form) {
    return;
  }

  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var markers = Array.prototype.slice.call(document.querySelectorAll('.stepper__item'));
  var panel = form.closest('.intake__panel');
  var receipt = form.querySelector('.receipt');

  var fields = {
    fag: document.getElementById('fag'),
    advokat: document.getElementById('advokat'),
    navn: document.getElementById('navn'),
    telefon: document.getElementById('telefon'),
    epost: document.getElementById('epost'),
    sak: document.getElementById('sak')
  };

  var errors = {
    one: document.getElementById('feil-1'),
    two: document.getElementById('feil-2')
  };

  var receiptBox = {
    no: document.getElementById('rec-no'),
    fag: document.getElementById('rec-fag'),
    advokat: document.getElementById('rec-advokat'),
    navn: document.getElementById('rec-navn'),
    kontakt: document.getElementById('rec-kontakt'),
    tid: document.getElementById('rec-tid'),
    sak: document.getElementById('rec-sak'),
    send: document.getElementById('rec-send')
  };

  var saksnummer = '';

  if (receipt) {
    receipt.setAttribute('tabindex', '-1');
  }

  function setError(target, message) {
    if (!target) {
      return;
    }
    if (message) {
      target.textContent = message;
      target.hidden = false;
    } else {
      target.textContent = '';
      target.hidden = true;
    }
  }

  function showStep(number, flyttFokus) {
    steps.forEach(function (step) {
      step.hidden = Number(step.dataset.step) !== number;
    });

    markers.forEach(function (marker) {
      var index = Number(marker.dataset.stepper);
      marker.classList.toggle('is-current', index === number);
      marker.classList.toggle('is-done', index < number);
      if (index === number) {
        marker.setAttribute('aria-current', 'step');
      } else {
        marker.removeAttribute('aria-current');
      }
    });

    window.requestAnimationFrame(function () {
      if (!flyttFokus) {
        return;
      }
      if (number === 3 && receipt) {
        receipt.focus();
        return;
      }
      var active = steps.filter(function (step) {
        return Number(step.dataset.step) === number;
      })[0];
      var first = active && active.querySelector('select, input, textarea');
      if (first) {
        first.focus({ preventScroll: true });
      }
    });
  }

  function gyldigEpost(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function kontaktlinje() {
    return [fields.epost.value.trim(), fields.telefon.value.trim()]
      .filter(Boolean)
      .join(' · ');
  }

  function valgtAdvokat() {
    return fields.advokat.options[fields.advokat.selectedIndex].text;
  }

  function lagKvittering() {
    if (!saksnummer) {
      saksnummer = 'HALS-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
    }

    receiptBox.no.textContent = saksnummer;
    receiptBox.fag.textContent = fields.fag.value || 'Ikke valgt';
    receiptBox.advokat.textContent = valgtAdvokat();
    receiptBox.navn.textContent = fields.navn.value.trim() || '—';
    receiptBox.kontakt.textContent = kontaktlinje() || '—';
    receiptBox.tid.textContent = new Date().toLocaleString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    receiptBox.sak.textContent = fields.sak.value.trim() || '—';

    var emne = 'Henvendelse: ' + (fields.fag.value || 'Hals Advokatfellesskap');
    var kropp = [
      'Hei,',
      '',
      'Jeg ønsker å henvende meg til Hals Advokatfellesskap.',
      '',
      'Fagområde: ' + fields.fag.value,
      'Ansvarlig: ' + valgtAdvokat(),
      'Navn: ' + fields.navn.value.trim(),
      'E-post: ' + fields.epost.value.trim(),
      'Telefon: ' + fields.telefon.value.trim(),
      'Saksnummer: ' + saksnummer,
      '',
      'Om saken:',
      fields.sak.value.trim(),
      '',
      'Hilsen',
      fields.navn.value.trim()
    ].join('\r\n');

    receiptBox.send.href =
      'mailto:' + (fields.advokat.value || fields.advokat.options[fields.advokat.selectedIndex].value) +
      '?subject=' + encodeURIComponent(emne) +
      '&body=' + encodeURIComponent(kropp);
  }

  document.getElementById('til-steg-2').addEventListener('click', function () {
    if (!fields.fag.value) {
      setError(errors.one, 'Velg et fagområde før du går videre.');
      fields.fag.focus();
      return;
    }
    setError(errors.one, '');
    showStep(2, true);
  });

  document.getElementById('tilbake-1').addEventListener('click', function () {
    setError(errors.two, '');
    showStep(1, true);
  });

  document.getElementById('til-steg-3').addEventListener('click', function () {
    var navn = fields.navn.value.trim();
    var epost = fields.epost.value.trim();
    var telefon = fields.telefon.value.trim();
    var sak = fields.sak.value.trim();

    if (!navn) {
      setError(errors.two, 'Skriv navnet ditt.');
      fields.navn.focus();
      return;
    }
    if (!epost && !telefon) {
      setError(errors.two, 'Skriv e-post eller telefonnummer, så vi kan svare deg.');
      fields.epost.focus();
      return;
    }
    if (epost && !gyldigEpost(epost)) {
      setError(errors.two, 'E-postadressen ser ikke riktig ut.');
      fields.epost.focus();
      return;
    }
    if (sak.length < 10) {
      setError(errors.two, 'Beskriv saken med noen flere ord, så blir den lettere å vurdere.');
      fields.sak.focus();
      return;
    }

    setError(errors.two, '');
    lagKvittering();
    showStep(3, true);

    if (panel) {
      window.requestAnimationFrame(function () {
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        panel.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      });
    }
  });

  document.getElementById('rec-reset').addEventListener('click', function () {
    form.reset();
    saksnummer = '';
    setError(errors.one, '');
    setError(errors.two, '');
    showStep(1, true);
    fields.fag.focus();
  });

  /* Skjemaet har ingen innsending: Enter skal ikke laste siden på nytt. */
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!steps[0].hidden) {
      document.getElementById('til-steg-2').click();
    } else if (!steps[1].hidden) {
      document.getElementById('til-steg-3').click();
    }
  });

  showStep(1, false);
})();
