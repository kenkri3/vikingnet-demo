/* BARDE — overlay-meny, canvas-datastraum og panel */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- flytande hjørneknapp + overlay ---------- */
  var hjorne = document.querySelector('.hjorne');
  var overlay = document.querySelector('.overlay');
  var sisteFokus = null;

  function opne() {
    if (!overlay) return;
    sisteFokus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    hjorne.setAttribute('aria-expanded', 'true');
    document.body.classList.add('las');
    var forste = overlay.querySelector('.overlay__lenke');
    if (forste) forste.focus();
  }
  function lukke() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    hjorne.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('las');
    if (sisteFokus && sisteFokus.focus) sisteFokus.focus();
  }
  if (hjorne && overlay) {
    hjorne.addEventListener('click', function () {
      if (overlay.classList.contains('open')) lukke(); else opne();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && overlay.classList.contains('open')) lukke();
      if (ev.key !== 'Tab' || !overlay.classList.contains('open')) return;
      var fokuserbare = overlay.querySelectorAll('a[href], button');
      if (!fokuserbare.length) return;
      var forste = fokuserbare[0], siste = fokuserbare[fokuserbare.length - 1];
      if (ev.shiftKey && document.activeElement === forste) { ev.preventDefault(); siste.focus(); }
      else if (!ev.shiftKey && document.activeElement === siste) { ev.preventDefault(); forste.focus(); }
    });
    // lenkjer i overlay lukkar menyen
    Array.prototype.forEach.call(overlay.querySelectorAll('a[href]'), function (a) {
      a.addEventListener('click', function () { lukke(); });
    });
    overlay.setAttribute('aria-hidden', 'true');
  }

  /* marker gjeldande side */
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.overlay__lenke'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- canvas: datastraum frå anlegget ---------- */
  var boks = document.querySelector('.telemetri');
  var lerret = boks ? boks.querySelector('canvas') : null;
  var ctx = lerret && lerret.getContext ? lerret.getContext('2d') : null;
  if (ctx) {
    var maskiner = ['CAT 371 NG', 'Volvo EC380', 'Hitachi ZX350', 'Liebherr R926', 'Komatsu PC290', 'Doosan DX300'];
    var delar = ['hydraulikk', 'motor', 'beltedrift', 'pumpe', 'sensor', 'timar', 'arbeidsordre', 'feilkode'];
    var verdiar = ['OK', '62 °C', '3 412 t', '#A-1042', '8,4 bar', 'service om 20 t', 'ny ordre', 'avvik lukka'];
    var linjer = [];
    for (var i = 0; i < 26; i++) {
      linjer.push({
        m: maskiner[Math.floor(Math.random() * maskiner.length)],
        d: delar[Math.floor(Math.random() * delar.length)],
        v: verdiar[Math.floor(Math.random() * verdiar.length)],
        t: ''
      });
    }
    var rull = [], frekvens = [], siste = 0, skyv = 0;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);

    function tidStreng(n) {
      var t = new Date(Date.now() - n * 1000);
      function to(x) { return (x < 10 ? '0' : '') + x; }
      return to(t.getHours()) + ':' + to(t.getMinutes()) + ':' + to(t.getSeconds());
    }

    function tel(n) {
      var b = lerret.clientWidth, h = lerret.clientHeight;
      if (lerret.width !== Math.round(b * DPR) || lerret.height !== Math.round(h * DPR)) {
        lerret.width = Math.round(b * DPR); lerret.height = Math.round(h * DPR);
      }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, b, h);

      var radH = 24, topp = 30, botn = 54;
      var synlege = Math.ceil((h - topp - botn) / radH) + 2;
      ctx.font = '500 11px "Fira Code", monospace';
      ctx.textBaseline = 'middle';

      var smal = b < 430;
      ctx.font = smal ? '500 10px "Fira Code", monospace' : '500 11px "Fira Code", monospace';
      for (var i = 0; i < synlege; i++) {
        var idx = Math.floor(skyv + i) % linjer.length;
        var l = linjer[idx];
        var y = topp + i * radH;
        if (y > h - botn - 8) break;
        ctx.fillStyle = 'rgba(231,236,234,.05)';
        if (i % 2 === 0) ctx.fillRect(10, y - radH / 2, b - 20, radH);
        ctx.fillStyle = 'rgba(139,154,150,.75)';
        ctx.fillText(smal ? l.t.slice(0, 5) : l.t, 14, y);
        ctx.fillStyle = '#e7ecea';
        ctx.fillText(l.m, smal ? 60 : 92, y);
        var verdi = l.v;
        if (smal && verdi.length > 9) verdi = verdi.slice(0, 8) + '…';
        ctx.fillStyle = l.v === 'OK' || l.v === 'avvik lukka' ? '#37c2b1' : '#ff5a1f';
        var vx = b - 14 - ctx.measureText(verdi).width;
        if (!smal) {
          ctx.fillStyle = 'rgba(139,154,150,.9)';
          ctx.fillText(l.d, Math.min(b * 0.44, 250), y);
          ctx.fillStyle = l.v === 'OK' || l.v === 'avvik lukka' ? '#37c2b1' : '#ff5a1f';
          ctx.fillText(l.v, b - 16 - ctx.measureText(l.v).width, y);
        } else {
          ctx.fillText(verdi, Math.max(vx, 60 + ctx.measureText(l.m).width + 8), y);
        }
      }

      // stolpegraf nederst: siste verdiar
      var grafY = h - botn + 8, grafH = botn - 18;
      ctx.strokeStyle = 'rgba(231,236,234,.10)';
      ctx.beginPath(); ctx.moveTo(12, grafY + grafH); ctx.lineTo(b - 12, grafY + grafH); ctx.stroke();
      for (var j = 0; j < rull.length; j++) {
        var x = 12 + j * 6;
        if (x > b - 16) break;
        var hh = Math.max(2, rull[j] * grafH);
        ctx.fillStyle = j === rull.length - 1 ? '#ff5a1f' : 'rgba(55,194,177,.65)';
        ctx.fillRect(x, grafY + grafH - hh, 4, hh);
      }
      ctx.fillStyle = 'rgba(139,154,150,.8)';
      ctx.font = '500 10px "Fira Code", monospace';
      ctx.fillText('maskindata · siste 60 sek', 12, grafY - 2);
    }

    function steg(tid) {
      var dt = siste ? Math.min(tid - siste, 90) : 16;
      siste = tid;
      if (!redusert.matches) {
        skyv += dt > 700 ? 1 : (dt > 190 ? 0.6 : 0.18);
        if (skyv >= 1) { skyv -= Math.floor(skyv); linjer.unshift(linjer.pop()); }
        linjer[0].t = tidStreng(0);
        for (var i = 1; i < linjer.length; i++) if (!linjer[i].t) linjer[i].t = tidStreng(i * 7);
        if (Math.random() < 0.06) rull.push(Math.random());
        if (rull.length > 60) rull.shift();
      }
      try { tel(); } catch (e) { /* ei teiknefeil skal ikkje stoppe heile straumen */ }
      if (!redusert.matches) window.requestAnimationFrame(steg);
    }
    linjer[0].t = tidStreng(0);
    for (var k = 1; k < linjer.length; k++) linjer[k].t = tidStreng(k * 7);
    for (var r = 0; r < 40; r++) rull.push(Math.random());
    window.requestAnimationFrame(steg);
    window.addEventListener('resize', function () { tel(); });
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
    if (fram) {
      var alle = document.querySelectorAll('.rad').length;
      fram.textContent = ferdige + ' av ' + alle + ' ordrar lukka i dag';
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-lukk]'), function (knapp) {
    knapp.addEventListener('click', function () {
      var rad = knapp.closest('.rad');
      if (!rad) return;
      rad.setAttribute('data-status', 'ferdig');
      rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Lukka'; st.className = 'status status--ferdig'; }
      knapp.disabled = true;
      knapp.textContent = 'Lukka';
      var meld = document.querySelector('[data-panelmelding]');
      if (meld) meld.textContent = 'Arbeidsordre lukka og loggført med tidsstempel.';
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
      if (navn && !navn.value.trim()) melding = 'Fyll inn namnet ditt.';
      else if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.value.trim())) melding = 'Fyll inn ei gyldig e-postadresse.';
      if (feil) feil.textContent = melding;
      if (melding) { (navn && !navn.value.trim() ? navn : epost).focus(); return; }
      if (kvit) {
        var t = kvit.querySelector('[data-kvittering-namn]');
        if (t) t.textContent = navn && navn.value.trim() ? 'Takk, ' + navn.value.trim().split(' ')[0] + '!' : 'Takk!';
        skjema.hidden = true; kvit.classList.add('vis'); kvit.focus();
      }
    });
  });
})();
