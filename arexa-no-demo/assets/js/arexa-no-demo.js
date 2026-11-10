/* AREXA — keypad, sonekart og panel */
(function () {
  'use strict';
  var red = window.matchMedia('(prefers-reduced-motion: reduce)');

  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.sone'), function (a) {
    if (a.getAttribute('href') === her) {
      a.setAttribute('aria-current', 'page');
      var d = document.querySelector('[data-display]');
      if (d) d.textContent = a.querySelector('.sone__namn').textContent;
    }
  });

  /* ---------- sonekart: plan med sensorar og bevegelse ---------- */
  var kart = document.querySelector('.sonekart');
  var c = kart ? kart.querySelector('canvas') : null;
  var ctx = c && c.getContext ? c.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var t = 0, W = 0, H = 0;
    var soner = [
      { x: .16, y: .22, w: .3, h: .28, namn: 'S1' },
      { x: .52, y: .2, w: .34, h: .24, namn: 'S2' },
      { x: .12, y: .56, w: .26, h: .3, namn: 'S3' },
      { x: .44, y: .5, w: .2, h: .2, namn: 'S4' },
      { x: .68, y: .52, w: .24, h: .34, namn: 'S5' }
    ];
    var blips = [
      { x: .28, y: .36, vx: .0009, vy: .0006, s: 1 },
      { x: .66, y: .32, vx: -.0007, vy: .0009, s: 2 },
      { x: .25, y: .7, vx: .0006, vy: -.0008, s: 3 },
      { x: .78, y: .68, vx: -.0008, vy: -.0005, s: 5 },
      { x: .54, y: .6, vx: .0011, vy: .0004, s: 4 }
    ];
    function storleik() {
      var b = c.clientWidth, h = c.clientHeight;
      c.width = Math.max(1, Math.round(b * DPR));
      c.height = Math.max(1, Math.round(h * DPR));
      W = b; H = h;
    }
    function teikn() {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // rutenett
      ctx.strokeStyle = 'rgba(238,241,240,.07)';
      ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 26) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = 0; gy < H; gy += 26) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      // soner
      soner.forEach(function (s, i) {
        var puls = 0.35 + 0.3 * Math.sin(t * 1.2 + i);
        ctx.fillStyle = 'rgba(242,162,12,' + (0.05 + puls * 0.05).toFixed(3) + ')';
        ctx.fillRect(s.x * W, s.y * H, s.w * W, s.h * H);
        ctx.strokeStyle = 'rgba(242,162,12,' + (0.3 + puls * 0.35).toFixed(3) + ')';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(s.x * W, s.y * H, s.w * W, s.h * H);
        ctx.fillStyle = 'rgba(238,241,240,.5)';
        ctx.font = '600 9px Poppins, sans-serif';
        ctx.fillText(s.namn, s.x * W + 5, s.y * H + 13);
      });
      // blips i rørsle
      blips.forEach(function (b, i) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < .05 || b.x > .93) b.vx *= -1;
        if (b.y < .08 || b.y > .9) b.vy *= -1;
        var px = b.x * W, py = b.y * H;
        var rad = 8 + Math.sin(t * 3 + i) * 2;
        ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(242,162,12,.35)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = '#f2a20c'; ctx.fill();
      });
      // skannestripe
      var sy = ((t * 22) % (H + 40)) - 20;
      var grd = ctx.createLinearGradient(0, sy - 16, 0, sy + 16);
      grd.addColorStop(0, 'rgba(242,162,12,0)');
      grd.addColorStop(.5, 'rgba(242,162,12,.10)');
      grd.addColorStop(1, 'rgba(242,162,12,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, sy - 16, W, 32);
      // ramme
      ctx.strokeStyle = 'rgba(238,241,240,.16)'; ctx.lineWidth = 1;
      ctx.strokeRect(.5, .5, W - 1, H - 1);
    }
    function rull() { t += .016; teikn(); if (!red.matches) window.requestAnimationFrame(rull); }
    storleik(); window.addEventListener('resize', function () { storleik(); teikn(); });
    window.requestAnimationFrame(rull);
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
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' saker lukka';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-lukk]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad'); if (!rad) return;
      rad.setAttribute('data-status', 'ferdig'); rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Lukka'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Lukka';
      var m = document.querySelector('[data-panelmelding]');
      if (m) m.textContent = 'Saka er kvittert og loggført.';
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
