/* AUSTEVOLL ASFALT — band, tverrsnitt, panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.band a'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });
  var ramme = document.querySelector('.tv-ramme');
  var c = ramme ? ramme.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, t = 0;
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR)); c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // tverrsnitt: underlag, bereevne, bindlag, slitelag
      var lag = [
        { h: 0.18, f: '#2b2d30', navn: 'underlag' },
        { h: 0.16, f: '#37393c', navn: 'berelag' },
        { h: 0.13, f: '#43464a', navn: 'bindlag' },
        { h: 0.11, f: '#55585c', navn: 'slitelag' }
      ];
      var y = H * 0.26;
      lag.forEach(function (l, i) {
        var hh = H * l.h;
        ctx.fillStyle = l.f;
        ctx.fillRect(0, y, W, hh);
        ctx.strokeStyle = 'rgba(242,244,245,.16)';
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        ctx.fillStyle = 'rgba(242,244,245,.5)';
        ctx.font = '9px Rajdhani, sans-serif';
        ctx.fillText(l.navn, 8, y + 12);
        y += hh;
      });
      // vegmerking (stipla)
      ctx.strokeStyle = 'rgba(240,160,60,.9)'; ctx.lineWidth = 4;
      ctx.setLineDash([18, 14]);
      ctx.beginPath(); ctx.moveTo(0, y - 6); ctx.lineTo(W, y - 6); ctx.stroke();
      ctx.setLineDash([]);
      // valse som flyttar seg
      var vx = ((t * 0.9) % (W + 90)) - 45;
      ctx.fillStyle = 'rgba(240,160,60,.9)';
      ctx.beginPath(); ctx.arc(vx, y - 22, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(240,160,60,.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(vx, y - 22, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(242,244,245,.45)';
      ctx.font = '10px Rajdhani, sans-serif';
      ctx.fillText('tverrsnitt · asfaltlag', 8, H - 10);
      t += 1;
    }
    function rull() { teikn(); if (!red.matches) window.requestAnimationFrame(rull); }
    storleik(); window.addEventListener('resize', function () { storleik(); teikn(); });
    if (red.matches) teikn(); else window.requestAnimationFrame(rull);
  }
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
    var framEl = document.querySelector('[data-framdrift]');
    if (framEl) framEl.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppdrag ferdige';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Ferdig'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Ferdig';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Oppdraget er merkt ferdig.';
      telOpp();
    });
  });
  telOpp();
  Array.prototype.forEach.call(document.querySelectorAll('form[data-skjema]'), function (s) {
    var kvit = s.parentNode.querySelector('.skjema__kvittering');
    var feil = s.querySelector('.skjema__feil');
    s.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = s.querySelector('[name="navn"]'), p = s.querySelector('[name="epost"]');
      var m = '';
      if (n && !n.value.trim()) m = 'Fyll inn navnet ditt.';
      else if (p && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.value.trim())) m = 'Fyll inn en gyldig e-postadresse.';
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
