/* ============================================================
   drivflaadt · CLAGE — eget skript
   Varmebølger på canvas, roterende 3D-tank, temperaturskala,
   servicesaker i panelet. Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temp = 48;

  /* ---------- 1. Varmebølger på canvas ---------- */
  var lerretHolder = document.querySelector('[data-bolger]');
  var ctx = null, w = 0, h = 0, dpr = 1, fase = 0, raf = 0, aktiv = true;

  function tegnBolger() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    var varme = Math.max(0, Math.min(1, (temp - 30) / 30));
    var antall = 30;
    for (var i = 0; i < antall; i++) {
      var t = i / antall;
      var yBase = h * (0.28 + t * 0.74);
      var amp = 7 + t * 26;
      var hue = 32 - varme * 24 + t * 10;
      var alpha = (0.10 + t * 0.24) * (0.7 + varme * 0.5);
      ctx.beginPath();
      for (var x = 0; x <= w; x += 8) {
        var y = yBase + Math.sin(x * 0.006 + fase * (1 + t * 1.6) + i * 0.7) * amp + Math.sin(x * 0.017 - fase * 0.8 + i) * (amp * 0.32);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'hsla(' + hue + ',88%,' + (60 - t * 14) + '%,' + alpha + ')';
      ctx.lineWidth = 1.2 + t * 2.2;
      ctx.stroke();
    }
    fase += 0.012;
    if (aktiv) raf = requestAnimationFrame(tegnBolger);
  }

  function startBolger() {
    if (!lerretHolder) return;
    var c = document.createElement('canvas');
    lerretHolder.appendChild(c);
    ctx = c.getContext('2d');
    if (!ctx) { c.remove(); return; }
    function tilpass() {
      var r = lerretHolder.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(320, Math.round(r.width));
      h = Math.max(160, Math.round(r.height));
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      c.style.width = w + 'px'; c.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    tilpass();
    window.addEventListener('resize', function () { setTimeout(function () { tilpass(); tegnBolger(); }, 120); });
    if (redusert) { tegnBolger(); } else { tegnBolger(); }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { aktiv = false; cancelAnimationFrame(raf); }
      else if (!redusert) { aktiv = true; tegnBolger(); }
    });
  }
  startBolger();

  /* ---------- 2. Temperaturkontroll ---------- */
  var skyver = document.getElementById('temp');
  var ut = document.getElementById('temp-ut');
  var panelTall = document.querySelector('[data-tank-tall]');
  var hjelp = document.getElementById('temp-hjelp');
  var tekster = {
    30: 'Behagelig for håndvask og sensitive hender',
    35: 'Normal dusjtemperatur i Norge',
    40: 'Varm dusj – anbefalt maks for barn',
    45: 'Varmt vann til kjøkken og vask',
    50: 'Høy vasktemperatur, krever sikring',
    55: 'Maks på gjennomstrømmer – advarsel: skoldingsfare'
  };
  function oppdaterTemp(ny, fraSkyver) {
    temp = Math.round(ny);
    if (ut) ut.textContent = temp + ' °C';
    if (panelTall) panelTall.childNodes[0].nodeValue = String(temp);
    if (skyver && !fraSkyver) skyver.value = String(temp);
    if (hjelp) {
      var nokkel = Math.round(temp / 5) * 5;
      hjelp.textContent = tekster[nokkel] || 'Temperatur innenfor anbefalt område';
    }
  }
  if (skyver) {
    skyver.value = String(temp);
    skyver.addEventListener('input', function () { oppdaterTemp(Number(skyver.value), true); });
  }
  oppdaterTemp(temp, false);

  /* ---------- 3. 3D-tank som roterer med scroll ---------- */
  var tank = document.querySelector('[data-tank]');
  if (tank && !redusert) {
    var vinkel = -24, mal = -24;
    var siste = window.scrollY;
    function rull() {
      var y = window.scrollY;
      vinkel += (y - siste) * 0.16;
      siste = y;
      mal += (vinkel - mal) * 0.08;
      tank.style.transform = 'rotateX(-6deg) rotateY(' + mal.toFixed(2) + 'deg)';
      requestAnimationFrame(rull);
    }
    requestAnimationFrame(rull);
  }

  /* ---------- 4. Temperaturskalaen: nål og fyll ---------- */
  var skala = document.querySelector('.skala-lenker');
  if (skala) {
    var lenker = skala.querySelectorAll('a');
    var her = window.location.pathname.split('/').pop() || 'index.html';
    var aktivIndeks = 0;
    lenker.forEach(function (a, i) {
      var href = (a.getAttribute('href') || '').split('#')[0];
      if (href === her) { a.setAttribute('aria-current', 'page'); aktivIndeks = i; }
    });
    var nal = document.querySelector('.nal');
    var linje = document.querySelector('.skala-linje');
    function settNal() {
      var n = lenker.length || 1;
      var p = ((aktivIndeks + 0.5) / n) * 100;
      if (nal) nal.style.left = p + '%';
      if (linje) linje.style.setProperty('--prosent', p + '%');
    }
    settNal();
    window.addEventListener('resize', settNal);
    if (aktivIndeks > 0 && window.innerWidth < 961) {
      var mål = lenker[aktivIndeks];
      if (mål && mål.scrollIntoView) {
        setTimeout(function () { mål.scrollIntoView({ block: 'nearest', inline: 'center' }); }, 60);
      }
    }
  }

  /* ---------- 5. Avsløring ved scroll ---------- */
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) {
        if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    avslor.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 5, 4) * 55 + 'ms';
      io.observe(el);
    });
  } else {
    avslor.forEach(function (el) { el.classList.add('inn'); });
  }

  /* ---------- 6. Skjema ---------- */
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var melding = form.querySelector('.skjema-melding');
      if (!melding) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      melding.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') +
        'Henvendelsen er registrert i demoen. I en ekte løsning går den rett til servicesakene i panelet.';
      melding.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 7. Servicepanelet ---------- */
  var saker = document.querySelector('[data-saker]');
  if (saker) {
    var kpiAapne = document.querySelector('[data-kpi-aapne]');
    var kpiFerdig = document.querySelector('[data-kpi-ferdig]');
    var logg = document.querySelector('[data-logg]');
    var faner = document.querySelectorAll('[data-filter]');

    function skrivLogg(tekst) {
      if (!logg) return;
      var t = new Date();
      var kl = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') + ':' + String(t.getSeconds()).padStart(2, '0');
      var rad = document.createElement('div');
      rad.innerHTML = '<span>' + kl + '</span> <b>OK</b> ';
      rad.appendChild(document.createTextNode(tekst));
      logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = saker.querySelectorAll('.sak');
      var aapne = 0, ferdig = 0;
      alle.forEach(function (s) {
        if (s.getAttribute('data-status') === 'ferdig') ferdig++; else aapne++;
      });
      if (kpiAapne) kpiAapne.textContent = String(aapne);
      if (kpiFerdig) kpiFerdig.textContent = String(ferdig);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall');
        if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'aapne' ? aapne : ferdig);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        f.setAttribute('aria-pressed', 'true');
        saker.querySelectorAll('.sak').forEach(function (s) {
          var st = s.getAttribute('data-status');
          var vis = k === 'alle' || (k === 'aapne' && st !== 'ferdig') || (k === 'ferdig' && st === 'ferdig');
          s.style.display = vis ? '' : 'none';
        });
      });
    });
    saker.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var sak = knapp.closest('.sak');
      if (!sak) return;
      var id = sak.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      if (h === 'montor') {
        var st = sak.querySelector('.sak-status');
        if (st) st.textContent = 'Montør sendt · ' + (sak.getAttribute('data-montor') || 'Vakttelefonen');
        knapp.disabled = true;
        knapp.textContent = 'Montør sendt';
        skrivLogg('montør sendt på sak ' + id);
        visToast('Montør sendt på sak ' + id + '. Kunden får SMS med ankomsttid.');
      } else if (h === 'ferdig') {
        sak.setAttribute('data-status', 'ferdig');
        sak.classList.add('sak--ferdig');
        var st2 = sak.querySelector('.sak-status');
        if (st2) st2.textContent = 'Ferdig · kvittert';
        sak.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        tell();
        skrivLogg('sak ' + id + ' merket ferdig');
        visToast('Sak ' + id + ' er ferdig og kvittert ut.');
      } else if (h === 'ring') {
        skrivLogg('ringt kunde på sak ' + id);
        visToast('Ringer kunden på sak ' + id + ' …');
      }
    });
    tell();
  }

  var toastTid = null;
  function visToast(tekst) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = tekst;
    t.classList.add('vis');
    clearTimeout(toastTid);
    toastTid = setTimeout(function () { t.classList.remove('vis'); }, 3600);
  }

  /* ---------- 8. Små tall som teller opp ---------- */
  var tellere = document.querySelectorAll('[data-teller]');
  if (tellere.length && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) {
        if (!r.isIntersecting) return;
        var el = r.target;
        var mål = Number(el.getAttribute('data-teller'));
        var steg = 0;
        var start = performance.now();
        function gå() {
          var p = Math.min(1, (performance.now() - start) / 900);
          el.textContent = String(Math.round(mål * p));
          if (p < 1) requestAnimationFrame(gå);
        }
        if (!redusert) gå(); else el.textContent = String(mål);
        io2.unobserve(el);
      });
    }, { threshold: 0.4 });
    tellere.forEach(function (el) { io2.observe(el); });
  }
})();
