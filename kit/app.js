/* Kit-hjelpere. Ingen avhengigheter, ingen sporing, ingen backend.
   Skjemaet faller tilbake på mailto: fordi GitHub Pages er statisk hosting. */

(function () {
  'use strict';

  // Uten denne klassen er alt innhold synlig. Da kan en JS-feil aldri gjøre
  // seksjoner usynlige for en besøkende.
  document.documentElement.classList.add('js');

  // Mobilmeny
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.hasAttribute('hidden');
      if (open) nav.removeAttribute('hidden');
      else nav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Rolig innkomst når seksjonen kommer i bildet
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveal = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveal.forEach(function (el) { io.observe(el); });
  }

  // Kontaktskjema → mailto. Firmaets egen adresse står i data-mailto.
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var to = form.getAttribute('data-mailto') || '';
      var data = new FormData(form);
      var linjer = [];
      data.forEach(function (value, key) {
        if (String(value).trim() === '') return;
        linjer.push(key + ': ' + value);
      });
      var emne = form.getAttribute('data-subject') || 'Henvendelse fra nettsiden';
      window.location.href =
        'mailto:' + to + '?subject=' + encodeURIComponent(emne) + '&body=' + encodeURIComponent(linjer.join('\n'));
      var note = form.querySelector('[data-form-note]');
      if (note) note.textContent = 'E-postprogrammet åpnes med opplysningene fylt ut.';
    });
  }

  // Årstall i footer
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
