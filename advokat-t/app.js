(function () {
  'use strict';

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var aar = document.getElementById('aar');
  if (aar) { aar.textContent = String(new Date().getFullYear()); }

  // Statisk hosting har ingen backend: skjemaet faller tilbake på mailto.
  var form = document.getElementById('skjema');
  var status = document.getElementById('skjema-status');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var navn = (form.navn.value || '').trim();
      var firma = (form.firma.value || '').trim();
      var epost = (form.epost.value || '').trim();
      var emne = form.emne.value;
      var melding = (form.melding.value || '').trim();

      if (!navn || !epost || !melding) {
        if (status) { status.textContent = 'Fyll ut navn, e-post og en kort beskrivelse.'; }
        return;
      }

      var emnefelt = 'Henvendelse: ' + emne + (firma ? ' — ' + firma : '');
      var kropp = 'Navn: ' + navn + '\n' +
                  'Firma: ' + (firma || '-') + '\n' +
                  'E-post: ' + epost + '\n' +
                  'Gjelder: ' + emne + '\n\n' + melding;

      if (status) { status.textContent = 'Åpner e-postprogrammet ditt …'; }
      window.location.href = 'mailto:rune@advokat-t.no' +
        '?subject=' + encodeURIComponent(emnefelt) +
        '&body=' + encodeURIComponent(kropp);
    });
  }
})();
