/* CAPPA — segmentert rollebytte, 3D-skiftkort og panel */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- rollebytte ---------- */
  var segment = document.querySelector('.segment');
  var knappar = document.querySelectorAll('[data-rolle]');

  function setRolle(rolle, varsle) {
    document.body.setAttribute('data-rolle', rolle);
    Array.prototype.forEach.call(knappar, function (k) {
      k.setAttribute('aria-pressed', k.getAttribute('data-rolle') === rolle ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-vis]'), function (el) {
      el.hidden = el.getAttribute('data-vis') !== rolle;
    });
    var hjelp = document.querySelector('[data-rolle-hjelp]');
    if (hjelp) {
      hjelp.innerHTML = rolle === 'kunde'
        ? 'Du ser sida som <strong>kunde</strong> — vi rekrutterer for deg.'
        : 'Du ser sida som <strong>kandidat</strong> — vi finn neste steg for deg.';
    }
    var varsel = document.querySelector('[data-rolle-varsel]');
    if (varsle && varsel) {
      varsel.textContent = rolle === 'kunde' ? 'Viser innhald for kundar.' : 'Viser innhald for kandidatar.';
    }
    try { sessionStorage.setItem('cappa-rolle', rolle); } catch (e) {}
  }

  if (knappar.length) {
    var lagra = null;
    try { lagra = sessionStorage.getItem('cappa-rolle'); } catch (e) {}
    // ?rolle=kandidat gjer det mogleg å lenke direkte til kandidatvisninga
    var iAdressa = /[?&]rolle=(kunde|kandidat)/.test(location.search) ? RegExp.$1 : null;
    setRolle(iAdressa || (lagra === 'kandidat' ? 'kandidat' : 'kunde'), false);
    Array.prototype.forEach.call(knappar, function (k) {
      k.addEventListener('click', function () {
        setRolle(k.getAttribute('data-rolle'), true);
      });
    });
    // piltastar mellom dei to vala
    if (segment) {
      segment.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
        ev.preventDefault();
        var no = document.body.getAttribute('data-rolle');
        var ny = no === 'kunde' ? 'kandidat' : 'kunde';
        setRolle(ny, true);
        var mal = document.querySelector('[data-rolle="' + ny + '"]');
        if (mal) mal.focus();
      });
    }
  }

  /* ---------- svak parallakse på heltebiletet ---------- */
  var heltebilete = document.querySelector('[data-parallakse]');
  if (heltebilete && !redusert.matches) {
    var vent = false;
    window.addEventListener('scroll', function () {
      if (vent) return;
      vent = true;
      window.requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 700);
        heltebilete.style.transform = 'translate3d(0,' + (y * 0.045).toFixed(2) + 'px,0)';
        vent = false;
      });
    }, { passive: true });
  }

  /* ---------- filter på stillingar ---------- */
  var filter = document.querySelector('.filter');
  if (filter) {
    var fk = filter.querySelectorAll('button');
    Array.prototype.forEach.call(fk, function (k) {
      k.addEventListener('click', function () {
        Array.prototype.forEach.call(fk, function (a) { a.setAttribute('aria-pressed', a === k ? 'true' : 'false'); });
        var val = k.getAttribute('data-filter');
        Array.prototype.forEach.call(document.querySelectorAll('[data-kategori]'), function (el) {
          el.hidden = !(val === 'alle' || el.getAttribute('data-kategori') === val);
        });
      });
    });
  }

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
      fram.textContent = ferdige + ' av ' + alle + ' godkjende i dag';
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-godkjenn]'), function (knapp) {
    knapp.addEventListener('click', function () {
      var rad = knapp.closest('.rad');
      if (!rad) return;
      rad.setAttribute('data-status', 'ferdig');
      rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Godkjend'; st.className = 'status status--ferdig'; }
      knapp.disabled = true;
      knapp.textContent = 'Godkjend';
      var meld = document.querySelector('[data-panelmelding]');
      if (meld) meld.textContent = 'Kandidaten er godkjend og saka går vidare til kunde.';
      telOpp();
    });
  });

  telOpp();

  /* ---------- aktiv side i menyen ---------- */
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.topp__lenke'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });
})();
