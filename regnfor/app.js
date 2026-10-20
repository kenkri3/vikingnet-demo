/* Regnskapsfører'n — mobilmeny, rolleavsløring og skjema som faller tilbake på e-post. */
(function () {
  'use strict';

  var knapp = document.getElementById('menyKnapp');
  var meny = document.getElementById('meny');
  var topp = document.getElementById('topp');

  /* Mobilmeny */
  if (knapp && meny) {
    knapp.addEventListener('click', function () {
      var apen = knapp.getAttribute('aria-expanded') === 'true';
      knapp.setAttribute('aria-expanded', String(!apen));
      meny.classList.toggle('meny--apen', !apen);
    });

    meny.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        knapp.setAttribute('aria-expanded', 'false');
        meny.classList.remove('meny--apen');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && meny.classList.contains('meny--apen')) {
        knapp.setAttribute('aria-expanded', 'false');
        meny.classList.remove('meny--apen');
        knapp.focus();
      }
    });
  }

  /* Skygge under toppen når siden er rullet */
  if (topp) {
    var settSkygge = function () {
      topp.classList.toggle('topp--rullet', window.scrollY > 8);
    };
    settSkygge();
    window.addEventListener('scroll', settSkygge, { passive: true });
  }

  /* Rolig innkomst av seksjoner */
  var deler = document.querySelectorAll('.kort, .trinn li, .band__liste li');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    deler.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity 520ms ease, transform 520ms ease';
    });
    var observator = new IntersectionObserver(function (inn) {
      inn.forEach(function (post) {
        if (post.isIntersecting) {
          post.target.style.opacity = '1';
          post.target.style.transform = 'none';
          observator.unobserve(post.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    deler.forEach(function (el) { observator.observe(el); });
  }

  /* Skjema: statisk hosting har ingen backend, så vi fyller ut e-postprogrammet. */
  var skjema = document.getElementById('skjema');
  var status = document.getElementById('status');

  if (skjema) {
    skjema.addEventListener('submit', function (e) {
      e.preventDefault();

      var navn = skjema.elements.navn;
      var epost = skjema.elements.epost;
      var melding = skjema.elements.melding;
      var firma = skjema.elements.firma.value.trim();
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
        status.textContent = 'Fyll ut navn, e-post og hva du trenger hjelp til.';
        return;
      }

      var emne = 'Henvendelse fra nettsiden';
      var linjer = [
        'Navn: ' + navn.value.trim(),
        firma ? 'Firma: ' + firma : '',
        'E-post: ' + epost.value.trim(),
        telefon ? 'Telefon: ' + telefon : '',
        '',
        melding.value.trim()
      ].filter(function (l) { return l !== ''; });

      var epostadresse = 'jostein@regnfor.no';
      window.location.href = 'mailto:' + epostadresse
        + '?subject=' + encodeURIComponent(emne)
        + '&body=' + encodeURIComponent(linjer.join('\n'));

      status.textContent = 'E-postprogrammet åpnes med opplysningene fylt inn.';
    });
  }

  /* Årstall i bunnen */
  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());
})();
