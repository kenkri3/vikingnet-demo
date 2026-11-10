/* ============================================================
   Alfa Kollega — eget skript (demo-v3)
   Pulskurve som tegner seg ved scroll og følger pekeren,
   avsløring og vaktpanel. Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Pulskurven ---------- */
  var puls = document.querySelector('[data-puls]');
  if (puls) {
    var sti = puls.querySelector('.linje');
    var lengde = 0;
    function mal() { if (sti && sti.getTotalLength) { lengde = sti.getTotalLength(); sti.style.strokeDasharray = lengde; sti.style.strokeDashoffset = lengde; } }
    mal();
    window.addEventListener('resize', function () { setTimeout(function () { mal(); if (!redusert) rull(); }, 120); });
    function rull() {
      if (!sti || !lengde) return;
      var r = puls.getBoundingClientRect();
      var synlig = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight * 0.9)));
      sti.style.strokeDashoffset = (lengde * (1 - synlig)).toFixed(1);
    }
    if (redusert) { sti.style.strokeDashoffset = 0; }
    else { rull(); window.addEventListener('scroll', rull, { passive: true }); }
    var prikk = puls.querySelector('.prikk');
    if (prikk && sti && sti.getPointAtLength) {
      function flyttPrikk() {
        var p = sti.getPointAtLength(lengde * (1 - parseFloat(sti.style.strokeDashoffset || 0) / (lengde || 1)));
        if (p) { prikk.setAttribute('cx', p.x); prikk.setAttribute('cy', p.y); }
      }
      window.addEventListener('scroll', function () { requestAnimationFrame(flyttPrikk); }, { passive: true });
    }
  }

  /* ---------- 2. Avsløring ---------- */
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 45 + 'ms'; io.observe(el); });
  } else { avslor.forEach(function (el) { el.classList.add('inn'); }); }

  /* ---------- 3. Skjema ---------- */
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = form.querySelector('.skjema-melding');
      if (!m) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte løsning går den til vaktlisten i panelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 4. Vaktpanelet ---------- */
  var liste = document.querySelector('[data-vakter]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiApen = document.querySelector('[data-kpi-apen]');
    var kpiBesatt = document.querySelector('[data-kpi-besatt]');
    var kpiFull = document.querySelector('[data-kpi-full]');
    function skrivLogg(t) {
      if (!logg) return;
      var d = new Date();
      var kl = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      var rad = document.createElement('div');
      rad.innerHTML = '<b>' + kl + '</b> ';
      rad.appendChild(document.createTextNode(t));
      logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = liste.querySelectorAll('.vakt');
      var apen = 0, besatt = 0, full = 0;
      alle.forEach(function (v) {
        var st = v.getAttribute('data-status');
        if (st === 'apen') apen++; else if (st === 'fullfort') full++; else besatt++;
      });
      if (kpiApen) kpiApen.textContent = String(apen);
      if (kpiBesatt) kpiBesatt.textContent = String(besatt);
      if (kpiFull) kpiFull.textContent = String(full);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall'); if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'apen' ? apen : k === 'besatt' ? besatt : full);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed','false'); });
        f.setAttribute('aria-pressed','true');
        liste.querySelectorAll('.vakt').forEach(function (v) {
          v.style.display = (k === 'alle' || v.getAttribute('data-status') === k) ? '' : 'none';
        });
      });
    });
    liste.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var v = knapp.closest('.vakt');
      if (!v) return;
      var id = v.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      var st = v.querySelector('.status');
      if (h === 'besett') {
        v.setAttribute('data-status','besatt');
        if (st) { st.textContent = 'Besatt'; st.setAttribute('data-status','besatt'); }
        knapp.disabled = true; knapp.textContent = 'Besatt';
        skrivLogg('vakt ' + id + ' besatt med sykepleier');
        visToast('Vakt ' + id + ' er besatt. Fagperson får oppmøtested på SMS.');
        tell();
      } else if (h === 'fullfor') {
        v.setAttribute('data-status','fullfort');
        v.classList.add('vakt--fullfort');
        if (st) { st.textContent = 'Fullført'; st.setAttribute('data-status','fullfort'); }
        v.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg('vakt ' + id + ' fullført og timelistet');
        visToast('Vakt ' + id + ' er fullført. Timene er klare for fakturering.');
        tell();
      } else if (h === 'ring') {
        skrivLogg('ringt på vakt ' + id);
        visToast('Ringer på vakt ' + id + ' …');
      }
    });
    tell();
  }

  var toastTid = null;
  function visToast(t) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = t;
    el.classList.add('vis');
    clearTimeout(toastTid);
    toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3400);
  }
})();
