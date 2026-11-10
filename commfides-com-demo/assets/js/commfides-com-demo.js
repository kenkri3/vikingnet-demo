/* Commfides — eget skript (demo-v3). ID-kortet som vender seg + støttepanel. */
(function () {
  'use strict';
  var rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var kort = document.querySelector('[data-idkort]');
  if (kort) {
    var vinklet = 0;
    if (rolig) {
      kort.style.transform = 'rotateY(168deg)';
    } else if ('IntersectionObserver' in window) {
      var io0 = new IntersectionObserver(function (r) {
        r.forEach(function (x) {
          if (x.isIntersecting) {
            var t0 = performance.now();
            function snu(t) {
              var p = Math.min(1, (t - t0) / 950);
              vinklet = -18 + 186 * (1 - Math.pow(1 - p, 3));
              kort.style.transform = 'rotateY(' + vinklet.toFixed(1) + 'deg) rotateX(6deg)';
              if (p < 1) requestAnimationFrame(snu);
            }
            requestAnimationFrame(snu);
          } else {
            kort.style.transform = 'rotateY(-18deg) rotateX(6deg)';
          }
        });
      }, { threshold: 0.5 });
      io0.observe(kort);
    } else kort.style.transform = 'rotateY(168deg)';
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
      var m = form.querySelector('.skjema-melding');
      if (!m) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte losning gar den til supportsaken i panelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });
  var liste = document.querySelector('[data-saker]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kN = document.querySelector('[data-kpi-ny]'), kB = document.querySelector('[data-kpi-behandles]'), kL = document.querySelector('[data-kpi-lukket]');
    function skriv(t) {
      if (!logg) return;
      var d = new Date();
      var kl = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      var rad = document.createElement('div'); rad.innerHTML = '<b>' + kl + '</b> ';
      rad.appendChild(document.createTextNode(t)); logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = liste.querySelectorAll('.sak'), n = 0, b = 0, l = 0;
      alle.forEach(function (s) { var st = s.getAttribute('data-status'); if (st === 'ny') n++; else if (st === 'lukket') l++; else b++; });
      if (kN) kN.textContent = String(n); if (kB) kB.textContent = String(b); if (kL) kL.textContent = String(l);
      faner.forEach(function (x) { var el = x.querySelector('.antall'); if (!el) return; var k = x.getAttribute('data-filter'); el.textContent = String(k === 'alle' ? alle.length : k === 'ny' ? n : k === 'behandles' ? b : l); });
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
        s.setAttribute('data-status','behandles');
        if (st) { st.textContent = 'Behandles'; st.setAttribute('data-status','behandles'); }
        k.disabled = true; k.textContent = 'Startet';
        skriv('sak ' + id + ' satt i behandling'); visToast('Sak ' + id + ' er satt i behandling.'); tell();
      } else if (h === 'lukk') {
        s.setAttribute('data-status','lukket'); s.classList.add('sak--lukket');
        if (st) { st.textContent = 'Lukket'; st.setAttribute('data-status','lukket'); }
        s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skriv('sak ' + id + ' lukket'); visToast('Sak ' + id + ' er lukket og svart ut.'); tell();
      } else if (h === 'sperr') { skriv('sperret sertifikat i ' + id); visToast('Sertifikatet i ' + id + ' er sperret.'); }
    });
    tell();
  }
  var toastTid = null;
  function visToast(t) {
    var el = document.getElementById('toast'); if (!el) return;
    el.textContent = t; el.classList.add('vis');
    clearTimeout(toastTid); toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3400);
  }
})();
