/* SWEET HEART — konfekt-disk, eske som opnar seg, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.brikke'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- konfekteske: loket opnar seg når ein scrollar ---------- */
  var scene = document.querySelector('.eske-scene');
  var lok = scene ? scene.querySelector('.eske__lokk') : null;
  if (lok && !red.matches) {
    var sett = function () {
      var vh = window.innerHeight || 800;
      // loket ligg att ved toppen og opnar seg når ein scrollar
      var p = Math.max(0, Math.min(1, (window.pageYOffset || document.documentElement.scrollTop || 0) / (vh * 0.45)));
      var vinkel = -104 * p;
      lok.style.transform = 'rotateX(' + vinkel.toFixed(1) + 'deg)';
    };
    var vent = false;
    window.addEventListener('scroll', function () {
      if (vent) return;
      vent = true;
      window.requestAnimationFrame(function () { sett(); vent = false; });
    }, { passive: true });
    window.addEventListener('resize', sett);
    sett();
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
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' bestillingar klare';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Klar'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Klar';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Bestillinga er merkt klar til henting.';
      telOpp();
    });
  });
  telOpp();

  /* ---------- skjema ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-skjema]'), function (s) {
    var kvit = s.parentNode.querySelector('.skjema__kvittering');
    var feil = s.querySelector('.skjema__feil');
    s.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = s.querySelector('[name="navn"]'), p = s.querySelector('[name="epost"]');
      var m = '';
      if (n && !n.value.trim()) m = 'Fyll inn namnet ditt.';
      else if (p && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.value.trim())) m = 'Fyll inn ei gyldig e-postadresse.';
      if (feil) feil.textContent = m;
      if (m) { (n && !n.value.trim() ? n : p).focus(); return; }
      if (kvit) {
        var tt = kvit.querySelector('[data-kvittering-navn]');
        if (tt) tt.textContent = n && n.value.trim() ? 'Takk, ' + n.value.trim().split(' ')[0] + '!' : 'Takk!';
        s.hidden = true; kvit.classList.add('vis'); kvit.focus();
      }
    });
  });
})();
