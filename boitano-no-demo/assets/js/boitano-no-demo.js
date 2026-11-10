(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var kaleido = document.querySelector('[data-kaleido]');
  if (kaleido && !redusert) {
    var biter = [].slice.call(kaleido.querySelectorAll('.k-bit'));
    var vinkel = 0, mal = 0;
    function rull() {
      var y = window.scrollY;
      vinkel = y * 0.06;
      mal += (vinkel - mal) * 0.12;
      biter.forEach(function (b, i) {
        var retning = i % 2 === 0 ? 1 : -1;
        b.style.transform = 'rotate(' + (mal * retning).toFixed(2) + 'deg)';
      });
      requestAnimationFrame(rull);
    }
    requestAnimationFrame(rull);
  }
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 45 + 'ms'; io.observe(el); });
  } else { avslor.forEach(function (el) { el.classList.add('inn'); }); }
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = form.querySelector('.skjema-melding');
      if (!m) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte losning gar den til pipeline i panelet.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });
  var liste = document.querySelector('[data-saker]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kD = document.querySelector('[data-kpi-dialog]');
    var kL = document.querySelector('[data-kpi-levering]');
    var kF = document.querySelector('[data-kpi-ferdig]');
    function skriv(t) {
      if (!logg) return;
      var d = new Date();
      var kl = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      var rad = document.createElement('div'); rad.innerHTML = '<b>' + kl + '</b> ';
      rad.appendChild(document.createTextNode(t)); logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = liste.querySelectorAll('.sak'); var d0 = 0, l = 0, f = 0;
      alle.forEach(function (s) { var st = s.getAttribute('data-status'); if (st === 'dialog') d0++; else if (st === 'ferdig') f++; else l++; });
      if (kD) kD.textContent = String(d0); if (kL) kL.textContent = String(l); if (kF) kF.textContent = String(f);
      faner.forEach(function (x) {
        var n = x.querySelector('.antall'); if (!n) return;
        var k = x.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'dialog' ? d0 : k === 'levering' ? l : f);
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
      var k = e.target.closest('[data-handling]'); if (!k) return;
      var s = k.closest('.sak'); if (!s) return;
      var id = s.getAttribute('data-id') || '';
      var h = k.getAttribute('data-handling');
      var st = s.querySelector('.status');
      if (h === 'start') {
        s.setAttribute('data-status','levering');
        if (st) { st.textContent = 'Levering'; st.setAttribute('data-status','levering'); }
        k.disabled = true; k.textContent = 'Startet';
        skriv('oppdrag ' + id + ' satt i gang'); visToast('Oppdrag ' + id + ' er i gang.'); tell();
      } else if (h === 'ferdig') {
        s.setAttribute('data-status','ferdig'); s.classList.add('sak--ferdig');
        if (st) { st.textContent = 'Ferdig'; st.setAttribute('data-status','ferdig'); }
        s.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skriv('oppdrag ' + id + ' levert'); visToast('Oppdrag ' + id + ' er levert. Sluttfaktura klargjores.'); tell();
      } else if (h === 'ring') { skriv('ringt kunde om ' + id); visToast('Ringer kunden om ' + id + ' ...'); }
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
