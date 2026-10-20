/* GN Power Holding AS — oppførsel.
   Ingen avhengigheter, ingen backend, ingen sporing. Skjemaet lager en
   kvittering i nettleseren og gir en mailto-lenke; det sender ingenting selv. */

(function () {
  'use strict';

  /* Merk: vi setter aldri html.js, og .reveal-animasjonen fra kit er derfor
     av. Innholdet står alltid fremme — en skisse skal ikke kunne miste tekst
     fordi en observatør ikke rakk å kjøre. */

  /* Uten denne klassen står mobilmenyen åpen og lesbar. Med den lukkes den,
     og knappen kan åpne den. */
  var masthead = document.querySelector('.masthead');
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (masthead) masthead.classList.add('is-ready');

  function lukkMeny() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) lukkMeny();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') lukkMeny();
    });
  }

  /* ---------- Henvendelse: skjema → kvittering ---------- */

  var form = document.querySelector('[data-henv-form]');
  var panel = document.querySelector('.inquiry__panel');
  var receipt = document.querySelector('[data-receipt]');
  var refOut = document.querySelector('[data-receipt-ref]');
  var timeOut = document.querySelector('[data-receipt-time]');
  var dataOut = document.querySelector('[data-receipt-data]');
  var mailOut = document.querySelector('[data-receipt-mail]');
  var nyKnapp = document.querySelector('[data-receipt-new]');
  var errorBox = document.querySelector('[data-form-error]');
  var MOTTAKER = 'post@gnpower.no';

  var EPSOST = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  function visFeil(melding, felt) {
    if (errorBox) {
      errorBox.textContent = melding;
      errorBox.hidden = false;
    }
    if (felt) {
      felt.setAttribute('aria-invalid', 'true');
      felt.focus();
    }
  }

  function skjulFeil() {
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = '';
    }
    var ugyldige = form ? form.querySelectorAll('[aria-invalid="true"]') : [];
    Array.prototype.forEach.call(ugyldige, function (felt) {
      felt.removeAttribute('aria-invalid');
    });
  }

  function lagReferanse() {
    var tegn = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var kode = '';
    var i;
    if (window.crypto && window.crypto.getRandomValues) {
      var buffer = new Uint8Array(5);
      window.crypto.getRandomValues(buffer);
      for (i = 0; i < buffer.length; i += 1) kode += tegn.charAt(buffer[i] % tegn.length);
    } else {
      for (i = 0; i < 5; i += 1) kode += tegn.charAt(Math.floor(Math.random() * tegn.length));
    }
    return 'GNP-' + new Date().getFullYear() + '-' + kode;
  }

  function lagTidspunkt() {
    var naa = new Date();
    try {
      return new Intl.DateTimeFormat('nb-NO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(naa);
    } catch (feil) {
      return naa.toLocaleString();
    }
  }

  function rad(term, verdi) {
    var div = document.createElement('div');
    div.className = 'receipt__row';
    var dt = document.createElement('dt');
    dt.textContent = term;
    var dd = document.createElement('dd');
    dd.textContent = verdi;
    div.appendChild(dt);
    div.appendChild(dd);
    return div;
  }

  if (form && receipt && refOut && dataOut) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      skjulFeil();

      var omrade = form.elements.omrade;
      var navn = form.elements.navn;
      var epost = form.elements.epost;
      var telefon = form.elements.telefon;
      var melding = form.elements.melding;

      if (!omrade.value) {
        visFeil('Velg hvilket område henvendelsen gjelder.', omrade);
        return;
      }
      if (navn.value.trim().length < 2) {
        visFeil('Skriv navnet ditt, så vi vet hvem henvendelsen gjelder.', navn);
        return;
      }
      if (!EPSOST.test(epost.value.trim())) {
        visFeil('Skriv en gyldig e-postadresse, for eksempel navn@firma.no.', epost);
        return;
      }
      if (telefon.value.trim() !== '' && telefon.value.replace(/[^0-9]/g, '').length < 5) {
        visFeil('Telefonnummeret ser for kort ut. La feltet stå tomt om du heller vil ha svar på e-post.', telefon);
        return;
      }
      if (melding.value.trim().length < 5) {
        visFeil('Skriv noen ord om hva henvendelsen gjelder.', melding);
        return;
      }

      var referanse = lagReferanse();
      var tidspunkt = lagTidspunkt();
      var innhold = {
        Område: omrade.value,
        Navn: navn.value.trim(),
        'E-post': epost.value.trim(),
        Telefon: telefon.value.trim() || 'Ikke oppgitt',
        Melding: melding.value.trim()
      };

      refOut.textContent = referanse;
      if (timeOut) timeOut.textContent = 'Registrert ' + tidspunkt + ' i nettleseren din';

      while (dataOut.firstChild) dataOut.removeChild(dataOut.firstChild);
      Object.keys(innhold).forEach(function (term) {
        dataOut.appendChild(rad(term, innhold[term]));
      });

      if (mailOut) {
        var emne = 'Henvendelse: ' + innhold['Område'] + ' — ' + innhold.Navn;
        var kropp = [
          'Referanse: ' + referanse,
          'Registrert: ' + tidspunkt,
          '',
          'Område: ' + innhold['Område'],
          'Navn: ' + innhold.Navn,
          'E-post: ' + innhold['E-post'],
          'Telefon: ' + innhold.Telefon,
          '',
          innhold.Melding
        ].join('\n');
        mailOut.setAttribute(
          'href',
          'mailto:' + MOTTAKER + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(kropp)
        );
      }

      form.hidden = true;
      receipt.hidden = false;
      receipt.setAttribute('tabindex', '-1');
      receipt.focus();
      if (panel) panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  if (nyKnapp && form && receipt) {
    nyKnapp.addEventListener('click', function () {
      receipt.hidden = true;
      form.hidden = false;
      form.reset();
      skjulFeil();
      var forste = form.querySelector('select, input, textarea');
      if (forste) forste.focus();
    });
  }

  /* ---------- Årstall i bunnteksten ---------- */

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
