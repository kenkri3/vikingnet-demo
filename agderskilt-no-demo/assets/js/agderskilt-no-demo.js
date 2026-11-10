/* ============================================================
   DekorShop — eget skript (demo-v3)
   Rullen som ruller ut, avsløring, produksjonskø.
   Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Folien som ruller seg ut ---------- */
  var rull = document.querySelector('[data-rull]');
  if (rull) {
    if ('IntersectionObserver' in window && !redusert) {
      var io0 = new IntersectionObserver(function (r) {
        r.forEach(function (x) {
          if (x.isIntersecting) { setTimeout(function () { rull.classList.add('utrullet'); }, 260); }
          else { rull.classList.remove('utrullet'); }
        });
      }, { threshold: 0.35 });
      io0.observe(rull);
    } else {
      rull.classList.add('utrullet');
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
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '. ' : 'Takk. ') + 'Forespørselen er registrert i demoen. I en ekte løsning går den rett til produksjonskøen.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 4. Produksjonskøen i panelet ---------- */
  var liste = document.querySelector('[data-ordrer]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiNy = document.querySelector('[data-kpi-ny]');
    var kpiProd = document.querySelector('[data-kpi-prod]');
    var kpiSendt = document.querySelector('[data-kpi-sendt]');
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
      var alle = liste.querySelectorAll('.ordre');
      var ny = 0, prod = 0, sendt = 0;
      alle.forEach(function (o) {
        var st = o.getAttribute('data-status');
        if (st === 'ny') ny++; else if (st === 'sendt') sendt++; else prod++;
      });
      if (kpiNy) kpiNy.textContent = String(ny);
      if (kpiProd) kpiProd.textContent = String(prod);
      if (kpiSendt) kpiSendt.textContent = String(sendt);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall'); if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'ny' ? ny : k === 'produksjon' ? prod : sendt);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed','false'); });
        f.setAttribute('aria-pressed','true');
        liste.querySelectorAll('.ordre').forEach(function (o) {
          o.style.display = (k === 'alle' || o.getAttribute('data-status') === k) ? '' : 'none';
        });
      });
    });
    liste.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var o = knapp.closest('.ordre');
      if (!o) return;
      var id = o.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      var st = o.querySelector('.status');
      if (h === 'start') {
        o.setAttribute('data-status','produksjon');
        if (st) { st.textContent = 'I produksjon'; st.setAttribute('data-status','produksjon'); }
        knapp.disabled = true; knapp.textContent = 'Startet';
        skrivLogg('produksjon startet på ' + id);
        visToast('Produksjon startet på ' + id + '. Skjærebordet får jobben i køen.');
        tell();
      } else if (h === 'send') {
        o.setAttribute('data-status','sendt');
        o.classList.add('ordre--sendt');
        if (st) { st.textContent = 'Sendt'; st.setAttribute('data-status','sendt'); }
        o.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg('ordre ' + id + ' sendt med Posten');
        visToast('Ordre ' + id + ' er sendt. Sporing er sendt til kunden.');
        tell();
      } else if (h === 'ring') {
        skrivLogg('ringt kunde om ' + id);
        visToast('Ringer kunden om ' + id + ' …');
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
