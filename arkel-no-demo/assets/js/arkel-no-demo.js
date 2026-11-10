/* ============================================================
   ARKEL Alliansen — eget skript (demo-v3)
   Nettdiagram som tegnes ved scroll, avsløring og
   oppdragspanel. Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Nettdiagrammet som tegner seg ---------- */
  var nett = document.querySelector('[data-nett]');
  if (nett) {
    var linjer = [].slice.call(nett.querySelectorAll('path[data-tegn]'));
    var noder = [].slice.call(nett.querySelectorAll('circle[data-node]'));
    function mal() {
      linjer.forEach(function (p) {
        var l = p.getTotalLength();
        p.style.strokeDasharray = l;
        p.style.strokeDashoffset = redusert ? 0 : l;
        p.dataset.lengde = String(l);
      });
    }
    mal();
    function tegn() {
      var r = nett.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.92 - r.top) / (r.height * 1.1)));
      linjer.forEach(function (l) { l.style.strokeDashoffset = (parseFloat(l.dataset.lengde) * (1 - p)).toFixed(1); });
      noder.forEach(function (n, i) {
        var aktiv = p > (i + 1) / (noder.length + 1);
        n.style.opacity = aktiv ? '1' : '0.25';
      });
    }
    if (redusert) { tegn(); } else { tegn(); window.addEventListener('scroll', tegn, { passive: true }); }
    window.addEventListener('resize', function () { setTimeout(function () { mal(); tegn(); }, 120); });
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
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte losning gar den til oppdragskoen i panelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 4. Oppdragspanelet ---------- */
  var liste = document.querySelector('[data-oppdrag]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiNy = document.querySelector('[data-kpi-ny]');
    var kpiPagar = document.querySelector('[data-kpi-pagar]');
    var kpiFerdig = document.querySelector('[data-kpi-ferdig]');
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
      var alle = liste.querySelectorAll('.sak');
      var ny = 0, pagar = 0, ferdig = 0;
      alle.forEach(function (s) {
        var st = s.getAttribute('data-status');
        if (st === 'ny') ny++; else if (st === 'ferdig') ferdig++; else pagar++;
      });
      if (kpiNy) kpiNy.textContent = String(ny);
      if (kpiPagar) kpiPagar.textContent = String(pagar);
      if (kpiFerdig) kpiFerdig.textContent = String(ferdig);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall'); if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'ny' ? ny : k === 'pagaar' ? pagar : ferdig);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed','false'); });
        f.setAttribute('aria-pressed','true');
        liste.querySelectorAll('.sak').forEach(function (s) {
          s.style.display = (k === 'alle' || s.getAttribute('data-status') === k) ? '' : 'none';
        });
      });
    });
    liste.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var s = knapp.closest('.sak');
      if (!s) return;
      var id = s.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      var st = s.querySelector('.status');
      if (h === 'start') {
        s.setAttribute('data-status','pagaar');
        if (st) { st.textContent = 'Pagar'; st.setAttribute('data-status','pagaar'); }
        knapp.disabled = true; knapp.textContent = 'Startet';
        skrivLogg('oppdrag ' + id + ' satt i arbeid');
        visToast('Oppdrag ' + id + ' er startet. Montor far oppdraget i appen.');
        tell();
      } else if (h === 'ferdig') {
        s.setAttribute('data-status','ferdig');
        s.classList.add('sak--ferdig');
        if (st) { st.textContent = 'Ferdig'; st.setAttribute('data-status','ferdig'); }
        s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg('oppdrag ' + id + ' meldt ferdig');
        visToast('Oppdrag ' + id + ' er ferdig. Timeliste klar for faktura.');
        tell();
      } else if (h === 'ring') {
        skrivLogg('ringt kunde om ' + id);
        visToast('Ringer kunden om ' + id + ' ...');
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
