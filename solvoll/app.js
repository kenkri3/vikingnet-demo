/* Solvoll Drift AS — interaksjon. Ingen data forlater nettleseren før brukeren selv sender e-post. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* --- Topplinje: skygge når siden er scrollet --- */
  var top = $('.top');
  if (top) {
    var onScroll = function () {
      top.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobilmeny --- */
  var menuBtn = $('#menuBtn');
  var mobileNav = $('#mobileNav');

  function setMenu(open) {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    mobileNav.hidden = !open;
  }

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });

    mobileNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) setMenu(false);
    });
  }

  /* --- Rolig innkomst av seksjoner --- */
  var revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && revealItems.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) { io.observe(el); });

    /* Sikkerhetsnett: alt skal være synlig selv om noe blir stående utenfor viewport. */
    window.setTimeout(function () {
      revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    }, 900);
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --- Årstall i footer --- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* --- Bestill pumping --- */
  var form = $('#orderForm');
  if (!form) return;

  var receipt = $('#receipt');
  var mailto = $('#mailtoLink');
  var editBtn = $('#editBtn');
  var dato = $('#dato');

  var pad = function (n) { return String(n).padStart(2, '0'); };
  var now = new Date();
  if (dato) {
    dato.min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  }

  var value = function (id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  var setText = function (id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

    var checked = form.querySelector('input[name="type"]:checked');
    var type = checked ? checked.value : 'Betongpumping';
    var volum = value('volum');
    var datoVerdi = value('dato');
    var navn = value('navn');
    var telefon = value('telefon');
    var sted = value('sted');
    var kommentar = value('kommentar');

    if (!volum || !datoVerdi) return;

    var datoTekst = new Date(datoVerdi + 'T12:00:00').toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    setText('sumType', type);
    setText('sumVolum', volum + ' m³');
    setText('sumDato', datoTekst);
    setText('sumNavn', navn);
    setText('sumTelefon', telefon);
    setText('sumSted', sted);

    var linjer = [
      'Hei,',
      '',
      'Vi ønsker betongpumping.',
      '',
      'Oppdragstype: ' + type,
      'Volum: ' + volum + ' m³',
      'Ønsket dato: ' + datoTekst,
      'Navn: ' + navn,
      'Telefon: ' + telefon,
      'Byggeplass: ' + sted
    ];

    if (kommentar) linjer.push('Kommentar: ' + kommentar);

    linjer.push('', 'Vi bekrefter kapasitet og pris på telefon.');

    var emne = 'Forespørsel om betongpumping – ' + type + ', ' + volum + ' m³, ' + datoTekst;
    mailto.href = 'mailto:joakim@mt-betongpumping.no'
      + '?subject=' + encodeURIComponent(emne)
      + '&body=' + encodeURIComponent(linjer.join('\r\n'));

    receipt.hidden = false;

    var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    receipt.scrollIntoView({ behavior: rolig ? 'auto' : 'smooth', block: 'center' });
  });

  if (editBtn) {
    editBtn.addEventListener('click', function () {
      receipt.hidden = true;
      var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      form.scrollIntoView({ behavior: rolig ? 'auto' : 'smooth', block: 'center' });
      var first = form.querySelector('input[name="type"]:checked') || form.querySelector('input');
      if (first) first.focus({ preventScroll: true });
    });
  }
})();
