/* Elteknikk — eget skript (demo-v3). Brytere som vippes ved scroll + oppdragskø. */
(function () {
  'use strict';
  var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var brytere = document.querySelector('[data-brytere]');
  if (brytere) {
    var alle = [].slice.call(brytere.querySelectorAll('.bryter'));
    var info = document.querySelector('[data-bryter-info]');
    function sett(n) {
      alle.forEach(function (b, i) {
        b.classList.toggle('pa', i < n);
        b.classList.toggle('av', i >= n);
      });
      if (info) info.textContent = (rolig ? alle.length : n) + ' av ' + alle.length + ' kurser aktive';
    }
    if (rolig) sett(alle.length); else {
      sett(0);
      var siste = -1;
      function opp() {
        var r = brytere.getBoundingClientRect();
        var p = (window.innerHeight * 0.9 - r.top) / (r.height + window.innerHeight * 0.4);
        var n = Math.max(0, Math.min(alle.length, Math.round(p * alle.length)));
        if (n !== siste) { siste = n; sett(n); }
      }
      opp(); window.addEventListener('scroll', opp, { passive: true });
    }
  }
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !rolig && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 45 + 'ms'; io.observe(el); });
  } else avslor.forEach(function (el) { el.classList.add('inn'); });
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = form.querySelector('.skjema-melding'); if (!m) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte losning gar den til oppdragskoen.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });
  var liste = document.querySelector('[data-saker]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]'), logg = document.querySelector('[data-logg]');
    var kN = document.querySelector('[data-kpi-ny]'), kP = document.querySelector('[data-kpi-pagar]'), kF = document.querySelector('[data-kpi-ferdig]');
    function skriv(t) {
      if (!logg) return;
      var d = new Date(), kl = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      var rad = document.createElement('div'); rad.innerHTML = '<b>' + kl + '</b> ';
      rad.appendChild(document.createTextNode(t)); logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = liste.querySelectorAll('.sak'), n = 0, p = 0, f = 0;
      alle.forEach(function (s) { var st = s.getAttribute('data-status'); if (st === 'ny') n++; else if (st === 'ferdig') f++; else p++; });
      if (kN) kN.textContent = String(n); if (kP) kP.textContent = String(p); if (kF) kF.textContent = String(f);
      faner.forEach(function (x) { var el = x.querySelector('.antall'); if (!el) return; var k = x.getAttribute('data-filter'); el.textContent = String(k === 'alle' ? alle.length : k === 'ny' ? n : k === 'pagar' ? p : f); });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed','false'); });
        f.setAttribute('aria-pressed','true');
        liste.querySelectorAll('.sak').forEach(function (s) { s.style.display = (k === 'alle' || s.getAttribute('data-status') === k) ? '' : 'none'; });
      });
    });
    liste.addEventListener('click', function (e) {
      var k = e.target.closest('[data-handling]'); if (!k) return;
      var s = k.closest('.sak'); if (!s) return;
      var id = s.getAttribute('data-id') || '', h = k.getAttribute('data-handling'), st = s.querySelector('.status');
      if (h === 'start') {
        s.setAttribute('data-status','pagar');
        if (st) { st.textContent = 'Pagar'; st.setAttribute('data-status','pagar'); }
        k.disabled = true; k.textContent = 'Startet';
        skriv('oppdrag ' + id + ' startet'); visToast('Oppdrag ' + id + ' er startet.'); tell();
      } else if (h === 'ferdig') {
        s.setAttribute('data-status','ferdig'); s.classList.add('sak--ferdig');
        if (st) { st.textContent = 'Ferdig'; st.setAttribute('data-status','ferdig'); }
        s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skriv('oppdrag ' + id + ' ferdig meldt'); visToast('Oppdrag ' + id + ' er ferdig. Rapport klar.'); tell();
      } else if (h === 'ring') { skriv('ringt kunde om ' + id); visToast('Ringer kunden om ' + id + ' ...'); }
    });
    tell();
  }
  var toastTid = null;
  function visToast(t) {
    var el = document.getElementById('toast'); if (!el) return;
    el.textContent = t; el.classList.add('vis');
    clearTimeout(toastTid); toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3300);
  }
})();
