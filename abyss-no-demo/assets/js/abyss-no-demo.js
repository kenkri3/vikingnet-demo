/* ABYSS — mast-meny, canvas ekkolodd og panel */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- mobilmeny ---------- */
  var mast = document.querySelector('.mast');
  var knapp = document.querySelector('.mast__knapp');
  if (mast && knapp) {
    knapp.addEventListener('click', function () {
      var open = mast.classList.toggle('open');
      knapp.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { mast.classList.remove('open'); knapp.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* marker gjeldande side */
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.mast__lenke,.mast__mobil .mast__lenke'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- canvas: ekkolodd / djupneprofil ---------- */
  var boks = document.querySelector('.ekkolodd');
  var lerret = boks ? boks.querySelector('canvas') : null;
  var ctx = lerret && lerret.getContext ? lerret.getContext('2d') : null;
  if (ctx) {
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var fisk = [], bobler = [], t = 0, stor = { w: 0, h: 0 };
    for (var i = 0; i < 46; i++) fisk.push({ x: Math.random(), y: 0.25 + Math.random() * 0.6, r: 0.8 + Math.random() * 2.2, f: 0.2 + Math.random() });
    for (var j = 0; j < 60; j++) bobler.push({ x: Math.random(), y: Math.random(), r: 0.4 + Math.random() * 1.4, f: 0.1 + Math.random() * 0.4 });
    function botnprofil(x) {
      // roleg botn med eit par grunner
      return 0.72 + Math.sin(x * 5.2) * 0.05 + Math.sin(x * 11.7 + 1.2) * 0.02;
    }
    function storleik() {
      var b = lerret.clientWidth, h = lerret.clientHeight;
      lerret.width = Math.max(1, Math.round(b * DPR));
      lerret.height = Math.max(1, Math.round(h * DPR));
      stor = { w: b, h: h };
    }
    function teikn() {
      var w = stor.w, h = stor.h;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // bakgrunn
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(31,122,140,.16)');
      g.addColorStop(1, 'rgba(4,20,28,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // vasslinjer
      ctx.strokeStyle = 'rgba(143,195,207,.10)';
      ctx.lineWidth = 1;
      for (var y = 16; y < h; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (var x = 0; x <= w; x += 12) ctx.lineTo(x, y + Math.sin(x * 0.02 + t * 0.8 + y * 0.1) * 1.6);
        ctx.stroke();
      }
      // ekkolodd-sveip
      var sveip = (t * 0.18) % 1;
      var sx = sveip * w;
      var sg = ctx.createLinearGradient(sx - 60, 0, sx + 10, 0);
      sg.addColorStop(0, 'rgba(143,195,207,0)');
      sg.addColorStop(1, 'rgba(143,195,207,.14)');
      ctx.fillStyle = sg;
      ctx.fillRect(Math.max(0, sx - 60), 0, 70, h);
      // botn
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (var bx = 0; bx <= w; bx += 6) ctx.lineTo(bx, botnprofil(bx / w) * h);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = 'rgba(7,28,38,.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(143,195,207,.5)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (var bx2 = 0; bx2 <= w; bx2 += 6) {
        var by = botnprofil(bx2 / w) * h;
        if (bx2 === 0) ctx.moveTo(bx2, by); else ctx.lineTo(bx2, by);
      }
      ctx.stroke();
      // fisk
      for (var k = 0; k < fisk.length; k++) {
        var f = fisk[k];
        var fx = ((f.x + t * 0.006 * f.f) % 1) * w;
        var fy = f.y * h + Math.sin(t * 0.6 + k) * 3;
        ctx.beginPath();
        ctx.arc(fx, fy, f.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(217,119,66,.75)';
        ctx.fill();
      }
      // bobler
      for (var m = 0; m < bobler.length; m++) {
        var b2 = bobler[m];
        var bxp = b2.x * w + Math.sin(t * 0.4 + m) * 4;
        var byp = ((b2.y - t * 0.01 * b2.f) % 1 + 1) % 1 * h;
        ctx.beginPath();
        ctx.arc(bxp, byp, b2.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(143,195,207,.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // båtsilhuett i overflata
      ctx.strokeStyle = 'rgba(230,239,240,.75)';
      ctx.lineWidth = 1.6;
      var boatX = ((t * 0.02) % 1) * w;
      ctx.beginPath();
      ctx.moveTo(boatX - 16, 12); ctx.lineTo(boatX + 16, 12); ctx.lineTo(boatX + 11, 19); ctx.lineTo(boatX - 11, 19); ctx.closePath();
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(boatX, 12); ctx.lineTo(boatX, 5); ctx.stroke();
      // djupnemerke
      ctx.fillStyle = 'rgba(143,195,207,.6)';
      ctx.font = '600 9px Montserrat, sans-serif';
      ctx.fillText('0 m', 8, 26);
      ctx.fillText('50 m', 8, h * 0.55);
      ctx.fillText('100 m', 8, h - 10);
    }
    function rull(ts) {
      t += 0.016;
      teikn();
      if (!redusert.matches) window.requestAnimationFrame(rull);
    }
    storleik();
    window.addEventListener('resize', function () { storleik(); teikn(); });
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
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppdrag fullført';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad');
      if (!rad) return;
      rad.setAttribute('data-status', 'ferdig');
      rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Fullført'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Fullført';
      var meld = document.querySelector('[data-panelmelding]');
      if (meld) meld.textContent = 'Oppdraget er merket fullført og loggført.';
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
        var t2 = kvit.querySelector('[data-kvittering-navn]');
        if (t2) t2.textContent = navn && navn.value.trim() ? 'Takk, ' + navn.value.trim().split(' ')[0] + '!' : 'Takk!';
        skjema.hidden = true; kvit.classList.add('vis'); kvit.focus();
      }
    });
  });
})();
