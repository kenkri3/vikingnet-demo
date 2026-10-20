/*
  GøLv AS — demoens ene interaksjon: en forespørsel i tre steg med kvittering.
  Alt skjer i nettleseren. Ingenting sendes eller lagres: kvitteringen bygger
  en ferdig e-posttekst og en mailto-lenke, og brukeren velger selv å sende.
*/
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Mobilmeny ---------- */

  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');

  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Lukk menyen' : 'Åpne menyen');
    };

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  /* ---------- Forespørsel i tre steg ---------- */

  var form = document.getElementById('wiz');
  if (!form) return;

  var panels = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
  var pills = Array.prototype.slice.call(form.querySelectorAll('[data-pill]'));
  var back = document.getElementById('wizBack');
  var next = document.getElementById('wizNext');
  var error = document.getElementById('wizError');
  var receipt = document.getElementById('wizReceipt');
  var receiptList = document.getElementById('receiptList');
  var mailLink = document.getElementById('wizMail');
  var copyBtn = document.getElementById('wizCopy');
  var restartBtn = document.getElementById('wizRestart');
  var steps = 3;
  var current = 1;
  var epostmonster = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function felt(tekst, verdi) {
    var rad = document.createElement('div');
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.textContent = tekst;
    dd.textContent = verdi;
    rad.appendChild(dt);
    rad.appendChild(dd);
    return rad;
  }

  function svar(navn) {
    var valgt = form.querySelector('input[name="' + navn + '"]:checked');
    return valgt ? valgt.value : '';
  }

  function visSteg(steg, flyttFokus) {
    current = steg;
    panels.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute('data-step')) !== steg;
    });
    pills.forEach(function (pill) {
      var nummer = Number(pill.getAttribute('data-pill'));
      pill.classList.toggle('is-active', nummer === steg);
      pill.classList.toggle('is-done', nummer < steg);
    });
    back.hidden = steg === 1;
    next.textContent = steg === steps ? 'Lag forespørselen' : 'Neste';
    error.hidden = true;
    error.textContent = '';

    if (flyttFokus) {
      var fokus = panels[steg - 1].querySelector('input, textarea, select');
      if (fokus) fokus.focus({ preventScroll: true });
      form.scrollIntoView({ block: 'nearest' });
    }
  }

  function feil(tekst) {
    error.textContent = tekst;
    error.hidden = false;
  }

  function valider(steg) {
    if (steg === 1 && !svar('emne')) {
      feil('Velg hva forespørselen gjelder.');
      return false;
    }
    if (steg === 2 && !svar('behov')) {
      feil('Velg hva du trenger.');
      return false;
    }
    if (steg === 3) {
      if (form.navn.value.trim().length < 2) {
        feil('Skriv navnet ditt.');
        form.navn.focus();
        return false;
      }
      if (!epostmonster.test(form.epost.value.trim())) {
        feil('Skriv en gyldig e-postadresse, så vi kan svare deg.');
        form.epost.focus();
        return false;
      }
    }
    return true;
  }

  function lagKvittering() {
    var emne = svar('emne');
    var behov = svar('behov');
    var areal = form.areal.value.trim();
    var melding = form.melding.value.trim();
    var navn = form.navn.value.trim();
    var post = form.epost.value.trim();
    var telefon = form.telefon.value.trim();

    receiptList.textContent = '';
    receiptList.appendChild(felt('Gjelder', emne));
    receiptList.appendChild(felt('Behov', behov));
    if (areal) receiptList.appendChild(felt('Areal', areal + ' m²'));
    if (melding) receiptList.appendChild(felt('Melding', melding));
    receiptList.appendChild(felt('Navn', navn));
    receiptList.appendChild(felt('E-post', post));
    if (telefon) receiptList.appendChild(felt('Telefon', telefon));

    var linjer = [
      'Hei GøLv AS,',
      '',
      'Gjelder: ' + emne,
      'Behov: ' + behov
    ];
    if (areal) linjer.push('Areal: ' + areal + ' m²');
    if (melding) linjer.push('Melding: ' + melding);
    linjer.push('', 'Navn: ' + navn, 'E-post: ' + post);
    if (telefon) linjer.push('Telefon: ' + telefon);
    linjer.push('', 'Sendt fra nettsiden til GøLv AS.');

    var tekst = linjer.join('\n');
    mailLink.href =
      'mailto:even@golvas.no' +
      '?subject=' + encodeURIComponent('Forespørsel: ' + emne + ' – ' + behov) +
      '&body=' + encodeURIComponent(tekst);
    mailLink.dataset.tekst = tekst;

    panels.forEach(function (panel) {
      panel.hidden = true;
    });
    pills.forEach(function (pill) {
      pill.classList.add('is-done');
      pill.classList.remove('is-active');
    });
    back.hidden = true;
    next.hidden = true;
    receipt.hidden = false;
    receipt.setAttribute('tabindex', '-1');
    receipt.focus({ preventScroll: true });
    form.scrollIntoView({ block: 'nearest' });
  }

  next.addEventListener('click', function () {
    if (!valider(current)) return;
    if (current === steps) {
      lagKvittering();
      return;
    }
    visSteg(current + 1, true);
  });

  back.addEventListener('click', function () {
    if (current > 1) visSteg(current - 1, true);
  });

  form.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && event.target.type !== 'radio') {
      event.preventDefault();
      next.click();
    }
  });

  copyBtn.addEventListener('click', function () {
    var tekst = mailLink.dataset.tekst || '';
    var kvittering = function () {
      copyBtn.textContent = 'Kopiert';
      window.setTimeout(function () {
        copyBtn.textContent = 'Kopier teksten';
      }, 2200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(kvittering, function () {
        copyBtn.textContent = 'Kunne ikke kopiere';
      });
    } else {
      copyBtn.textContent = 'Kunne ikke kopiere';
    }
  });

  restartBtn.addEventListener('click', function () {
    form.reset();
    receipt.hidden = true;
    next.hidden = false;
    visSteg(1, true);
  });

  visSteg(1, false);

  /* ---------- Rolig innkomst av seksjoner ---------- */

  var elementer = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && elementer.length) {
    var observator = new IntersectionObserver(
      function (oppforinger) {
        oppforinger.forEach(function (oppforing) {
          if (oppforing.isIntersecting) {
            oppforing.target.classList.add('is-visible');
            observator.unobserve(oppforing.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    elementer.forEach(function (element) {
      observator.observe(element);
    });
  } else {
    elementer.forEach(function (element) {
      element.classList.add('is-visible');
    });
  }
})();
