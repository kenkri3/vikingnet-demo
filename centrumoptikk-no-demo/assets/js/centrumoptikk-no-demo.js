/* CENTRUM OPTIKK — scroll-spy i delt topp, linse-parallakse og panel */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- scroll-spy ---------- */
  var lenker = Array.prototype.slice.call(document.querySelectorAll('.topp__lenke[data-seksjon]'));
  if (lenker.length && 'IntersectionObserver' in window) {
    var kart = {};
    lenker.forEach(function (a) { kart[a.getAttribute('data-seksjon')] = a; });
    var io = new IntersectionObserver(function (opp) {
      opp.forEach(function (o) {
        if (!o.isIntersecting) return;
        lenker.forEach(function (a) { a.classList.remove('aktiv'); a.removeAttribute('aria-current'); });
        var aktiv = kart[o.target.id];
        if (aktiv) { aktiv.classList.add('aktiv'); aktiv.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    Array.prototype.forEach.call(document.querySelectorAll('[data-spy]'), function (seksjon) { io.observe(seksjon); });
  }

  /* ---------- linse-parallakse ---------- */
  var scene = document.querySelector('.linse-scene');
  if (scene) {
    var linser = scene.querySelectorAll('.linse');
    if (!redusert.matches) {
      var vent = false;
      var flytt = function () {
        if (vent) return;
        vent = true;
        window.requestAnimationFrame(function () {
          var r = scene.getBoundingClientRect();
          var vh = window.innerHeight || 800;
          var p = Math.max(-1, Math.min(1, (vh * 0.5 - (r.top + r.height * 0.5)) / vh));
          Array.prototype.forEach.call(linser, function (l, i) {
            var djupn = i === 0 ? 1 : 1.8;
            l.style.transform = 'translate3d(' + (p * 26 * djupn).toFixed(1) + 'px,' +
              (p * -34 * djupn).toFixed(1) + 'px,0) rotateX(' + (p * 6 * djupn).toFixed(1) + 'deg) rotate(' +
              (p * 4).toFixed(1) + 'deg)';
          });
          vent = false;
        });
      };
      window.addEventListener('scroll', flytt, { passive: true });
      window.addEventListener('resize', flytt);
      flytt();
    }
  }

  /* ---------- panel ---------- */
  var faner = document.querySelectorAll('.fane');
  if (faner.length) {
    Array.prototype.forEach.call(faner, function (fane) {
      fane.addEventListener('click', function () {
        Array.prototype.forEach.call(faner, function (f) {
          var vald = f === fane;
          f.setAttribute('aria-selected', vald ? 'true' : 'false');
          var mal = document.getElementById(f.getAttribute('aria-controls'));
          if (mal) mal.hidden = !vald;
        });
      });
    });
  }
  function telOpp() {
    var ventar = document.querySelectorAll('.rad[data-status="ventar"]').length;
    var ferdige = document.querySelectorAll('.rad[data-status="ferdig"]').length;
    var kV = document.querySelector('[data-kpi="ventar"] .kpi__tal');
    var kF = document.querySelector('[data-kpi="ferdig"] .kpi__tal');
    if (kV) kV.textContent = ventar;
    if (kF) kF.textContent = ferdige;
    var fram = document.querySelector('[data-framdrift]');
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' fullført i dag';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad');
      if (!rad) return;
      rad.setAttribute('data-status', 'ferdig');
      rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Ferdig'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Ferdig';
      var meld = document.querySelector('[data-panelmelding]');
      if (meld) meld.textContent = 'Posten er merket ferdig og journalført.';
      telOpp();
    });
  });
  telOpp();

  /* ---------- skjema ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-skjema]'), function (skjema) {
    var kvit = skjema.parentNode.querySelector('.skjema__kvittering');
    var feil = skjema.querySelector('.skjema__feil');
    skjema.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var navn = skjema.querySelector('[name="navn"]');
      var epost = skjema.querySelector('[name="epost"]');
      var melding = '';
      if (navn && !navn.value.trim()) melding = 'Fyll inn navnet ditt.';
      else if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.value.trim())) melding = 'Fyll inn en gyldig e-postadresse.';
      if (feil) feil.textContent = melding;
      if (melding) { (navn && !navn.value.trim() ? navn : epost).focus(); return; }
      if (kvit) {
        var t = kvit.querySelector('[data-kvittering-navn]');
        if (t) t.textContent = navn && navn.value.trim() ? 'Takk, ' + navn.value.trim().split(' ')[0] + '!' : 'Takk!';
        skjema.hidden = true; kvit.classList.add('vis'); kvit.focus();
      }
    });
  });
})();
