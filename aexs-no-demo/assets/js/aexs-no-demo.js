/* ÆXS — skuff-meny, 3D-konsortiumring og panel */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- høgre skuff ---------- */
  var skuff = document.querySelector('.skuff');
  var slor = document.querySelector('.slør');
  var opne = document.querySelector('.skuff-knapp');
  var lukk = document.querySelector('.skuff__lukk');
  var siste = null;
  function setSkuff(open) {
    if (!skuff) return;
    skuff.classList.toggle('open', open);
    if (slor) slor.classList.toggle('open', open);
    document.body.classList.toggle('las', open);
    if (opne) opne.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      siste = document.activeElement;
      var f = skuff.querySelector('.skuff__lenke');
      if (f) f.focus({ preventScroll: true });
    } else if (siste && siste.focus) siste.focus({ preventScroll: true });
  }
  if (skuff && opne) {
    opne.setAttribute('aria-expanded', 'false');
    opne.addEventListener('click', function () { setSkuff(!skuff.classList.contains('open')); });
    if (lukk) lukk.addEventListener('click', function () { setSkuff(false); });
    if (slor) slor.addEventListener('click', function () { setSkuff(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setSkuff(false);
      if (e.key !== 'Tab' || !skuff.classList.contains('open')) return;
      var f = skuff.querySelectorAll('a[href], button');
      if (!f.length) return;
      var f0 = f[0], f1 = f[f.length - 1];
      if (e.shiftKey && document.activeElement === f0) { e.preventDefault(); f1.focus(); }
      else if (!e.shiftKey && document.activeElement === f1) { e.preventDefault(); f0.focus(); }
    });
    Array.prototype.forEach.call(skuff.querySelectorAll('a[href]'), function (a) {
      a.addEventListener('click', function () { setSkuff(false); });
    });
  }

  /* marker gjeldande side */
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.skuff__lenke'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- 3D-konsortiumring ---------- */
  var ramme = document.querySelector('.ring');
  var hjul = ramme ? ramme.querySelector('.ring__hjul') : null;
  var flater = ramme ? ramme.querySelectorAll('.ring__flate') : [];
  if (hjul && flater.length) {
    var n = flater.length;
    function bygg() {
      var r = ramme.clientWidth;
      var radius = Math.max(130, Math.min(240, r * 0.26));
      Array.prototype.forEach.call(flater, function (f, i) {
        f.style.transform = 'rotateY(' + (i * (360 / n)) + 'deg) translateZ(' + radius + 'px)';
      });
    }
    var setRing = function () {
      var b = ramme.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var p = Math.max(0, Math.min(1, (vh - b.top) / (vh + b.height)));
      var vinkel = redusert.matches ? -8 : -10 + p * 140;
      hjul.style.transform = 'rotateX(-6deg) rotateY(' + vinkel.toFixed(1) + 'deg)';
    };
    bygg();
    setRing();
    if (!redusert.matches) {
      var vent = false;
      window.addEventListener('scroll', function () {
        if (vent) return;
        vent = true;
        window.requestAnimationFrame(function () { setRing(); vent = false; });
      }, { passive: true });
    }
    window.addEventListener('resize', function () { bygg(); setRing(); });
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
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' saker lukket';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-lukk]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad');
      if (!rad) return;
      rad.setAttribute('data-status', 'ferdig');
      rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Lukket'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Lukket';
      var meld = document.querySelector('[data-panelmelding]');
      if (meld) meld.textContent = 'Saken er kvittert og lukket med tidsstempel.';
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
