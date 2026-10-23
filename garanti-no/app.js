/* Vestbo Garanti Sentrum — skjema som faller tilbake på e-post, og årstall. */
(function () {
  'use strict';

  var skjema = document.getElementById('skjema');
  var status = document.getElementById('status');

  if (skjema) {
    skjema.addEventListener('submit', function (e) {
      e.preventDefault();

      var navn = skjema.elements.navn;
      var epost = skjema.elements.epost;
      var melding = skjema.elements.melding;
      var telefon = skjema.elements.telefon.value.trim();
      var mangler = false;

      [navn, epost, melding].forEach(function (felt) {
        var tomt = felt.value.trim() === '';
        felt.setAttribute('aria-invalid', tomt ? 'true' : 'false');
        if (tomt) mangler = true;
      });
      if (epost.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost.value.trim())) {
        epost.setAttribute('aria-invalid', 'true');
        mangler = true;
      }
      if (mangler) {
        status.textContent = 'Fyll ut navn, e-post og hva du lurer på.';
        return;
      }

      var linjer = [
        'Navn: ' + navn.value.trim(),
        'E-post: ' + epost.value.trim(),
        telefon ? 'Telefon: ' + telefon : '',
        '',
        melding.value.trim(),
      ].filter(function (l) { return l !== ''; });

      window.location.href = 'mailto:ph@garanti.no'
        + '?subject=' + encodeURIComponent('Henvendelse fra nettsiden')
        + '&body=' + encodeURIComponent(linjer.join('\n'));

      status.textContent = 'E-postprogrammet åpnes med opplysningene fylt inn.';
    });
  }

  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());
})();
