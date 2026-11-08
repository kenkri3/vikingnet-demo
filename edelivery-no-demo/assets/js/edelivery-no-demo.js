/* ============================================================
   Edelivery AS — eget skript
   Splittmeny, CSS 3D-pakke som åpnes, sporing (demo),
   forsendelsespanel. Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Splittmeny ---------- */
  var splitt = document.getElementById('splitt');
  var apne = document.querySelector('[data-splitt-apne]');
  var lukk = document.querySelector('[data-splitt-lukk]');
  var apen = false;
  function apneMeny() {
    if (!splitt || apen) return;
    apen = true;
    splitt.classList.add('apen');
    splitt.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    if (apne) apne.setAttribute('aria-expanded','true');
    if (lukk) setTimeout(function () { lukk.focus(); }, 60);
  }
  function lukkMeny() {
    if (!splitt || !apen) return;
    apen = false;
    splitt.classList.remove('apen');
    splitt.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (apne) { apne.setAttribute('aria-expanded','false'); apne.focus(); }
  }
  if (apne) apne.addEventListener('click', apneMeny);
  if (lukk) lukk.addEventListener('click', lukkMeny);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && apen) { e.preventDefault(); lukkMeny(); } });
  if (splitt) splitt.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setTimeout(lukkMeny, 30); }); });

  /* ---------- 2. Pakken som åpnes ---------- */
  var pakke = document.querySelector('[data-pakke]');
  var pakkeScene = document.querySelector('.pakke-scene');
  if (pakke) {
    var harApnet = false;
    function apnePakke() {
      if (!pakke || harApnet) return;
      harApnet = true;
      pakke.classList.add('apen');
    }
    if ('IntersectionObserver' in window) {
      var io0 = new IntersectionObserver(function (r) {
        r.forEach(function (x) { if (x.isIntersecting) { setTimeout(apnePakke, 350); io0.unobserve(x.target); } });
      }, { threshold: 0.45 });
      io0.observe(pakke);
    } else { apnePakke(); }
    pakke.addEventListener('click', function () { pakke.classList.toggle('apen'); });
    pakke.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pakke.classList.toggle('apen'); } });
    pakke.setAttribute('tabindex','0');
    pakke.setAttribute('role','button');
    pakke.setAttribute('aria-label','Åpne eller lukk pakken');
    if (pakkeScene && !redusert) {
      pakkeScene.addEventListener('mousemove', function (e) {
        var r = pakkeScene.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        pakke.style.transform = 'rotateX(' + (-16 - y * 10).toFixed(1) + 'deg) rotateY(' + (-18 + x * 16).toFixed(1) + 'deg)';
      });
      pakkeScene.addEventListener('mouseleave', function () {
        pakke.style.transform = '';
      });
    }
  }

  /* ---------- 3. Avsløring ved scroll ---------- */
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 50 + 'ms'; io.observe(el); });
  } else { avslor.forEach(function (el) { el.classList.add('inn'); }); }

  /* ---------- 4. Sporing (demo) ---------- */
  var sporForm = document.querySelector('[data-sporing]');
  if (sporForm) {
    sporForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = sporForm.querySelector('input');
      var svar = document.querySelector('[data-spor-svar]');
      if (!svar) return;
      var v = input && input.value ? input.value.trim() : '';
      if (!v) { svar.textContent = 'Skriv inn et sporingsnummer eller et ordrenummer.'; return; }
      svar.textContent = 'Demo: «' + v + '» er ikke et ekte sporingsnummer. I en ekte løsning slår vi opp status i transportsystemet og viser ruten her.';
    });
  }

  /* ---------- 5. Skjema ---------- */
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = form.querySelector('.skjema-melding');
      if (!m) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte løsning havner den i køen i forsendelsespanelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 6. Forsendelsespanelet ---------- */
  var liste = document.querySelector('[data-forsendelser]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiAktive = document.querySelector('[data-kpi-aktive]');
    var kpiLevert = document.querySelector('[data-kpi-levert]');
    var kpiLager = document.querySelector('[data-kpi-lager]');
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
      var alle = liste.querySelectorAll('.forsendelse');
      var hentet = 0, underveis = 0, levert = 0;
      alle.forEach(function (f) {
        var s = f.getAttribute('data-status');
        if (s === 'levert') levert++; else if (s === 'underveis') underveis++; else hentet++;
      });
      if (kpiAktive) kpiAktive.textContent = String(hentet + underveis);
      if (kpiLevert) kpiLevert.textContent = String(levert);
      if (kpiLager) kpiLager.textContent = String(hentet);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall'); if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'hentet' ? hentet : k === 'underveis' ? underveis : levert);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed','false'); });
        f.setAttribute('aria-pressed','true');
        liste.querySelectorAll('.forsendelse').forEach(function (p) {
          p.style.display = (k === 'alle' || p.getAttribute('data-status') === k) ? '' : 'none';
        });
      });
    });
    liste.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var p = knapp.closest('.forsendelse');
      if (!p) return;
      var id = p.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      var st = p.querySelector('.status');
      if (h === 'hent') {
        p.setAttribute('data-status','hentet');
        if (st) { st.textContent = 'Hentet'; st.setAttribute('data-status','hentet'); }
        knapp.disabled = true; knapp.textContent = 'Hentet';
        skrivLogg(id + ' hentet hos kunde');
        visToast(id + ' er hentet. Sjåføren er på vei til terminalen.');
        tell();
      } else if (h === 'kjor') {
        p.setAttribute('data-status','underveis');
        if (st) { st.textContent = 'Underveis'; st.setAttribute('data-status','underveis'); }
        skrivLogg(id + ' lastet og underveis');
        visToast(id + ' er underveis. Kunden får sporing på SMS.');
        tell();
      } else if (h === 'lever') {
        p.setAttribute('data-status','levert');
        p.classList.add('forsendelse--levert');
        if (st) { st.textContent = 'Levert'; st.setAttribute('data-status','levert'); }
        p.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg(id + ' levert og signert');
        visToast(id + ' er levert. Signatur er lagret på forsendelsen.');
        tell();
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
    toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3600);
  }
})();
