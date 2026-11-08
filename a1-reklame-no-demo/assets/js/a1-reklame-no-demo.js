/* A1 REKLAME — marqueeteip, kinetisk typografi og canvas 3D-kube */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- kinetisk typografi: linjene glir motsett av scroll ---------- */
  var kinetisk = document.querySelectorAll('[data-kinetisk]');
  var sisteY = -1;
  function flyttTekst() {
    if (!kinetisk.length) return;
    var y = window.scrollY;
    if (Math.abs(y - sisteY) < 1) return;
    sisteY = y;
    Array.prototype.forEach.call(kinetisk, function (el) {
      var fart = parseFloat(el.getAttribute('data-kinetisk')) || 0.06;
      el.style.transform = 'translate3d(' + (y * fart).toFixed(1) + 'px,0,0)';
    });
  }
  if (!redusert.matches && kinetisk.length) {
    window.addEventListener('scroll', function () {
      window.requestAnimationFrame(flyttTekst);
    }, { passive: true });
    flyttTekst();
  }

  /* ---------- 3D-kube på canvas (ortografisk, teikna for hand) ---------- */
  var kube = document.querySelector('.kube');
  if (kube) {
    var lerret = kube.querySelector('canvas');
    var ctx = lerret && lerret.getContext ? lerret.getContext('2d') : null;
    if (ctx) {
      kube.classList.add('teikna');
      var vinklar = { x: 0.32, y: -0.62 };
      var dradd = false, sisteX = 0, sisteYp = 0, fartY = 0;
      var DPR = Math.min(window.devicePixelRatio || 1, 2);

      // kube: 8 hjørne, kvar side med farge og tekst
      var H = [
        { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
        { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
      ];
      var SIDER = [
        { h: [4, 5, 6, 7], farge: '#f26f21', tekst: 'SKILT', skrift: '#12100f' },
        { h: [1, 2, 6, 5], farge: '#e2231a', tekst: 'FOLIE', skrift: '#f6f2ec' },
        { h: [0, 3, 7, 4], farge: '#f6f2ec', tekst: 'PRINT', skrift: '#12100f' },
        { h: [3, 2, 6, 7], farge: '#f6f2ec', tekst: 'A1', skrift: '#12100f' },
        { h: [0, 1, 5, 4], farge: '#2a2724', tekst: 'BIL', skrift: '#f6f2ec' }
      ];

      function roter(p) {
        var cy = Math.cos(vinklar.y), sy = Math.sin(vinklar.y);
        var cx = Math.cos(vinklar.x), sx = Math.sin(vinklar.x);
        var x1 = p.x * cy + p.z * sy;
        var z1 = -p.x * sy + p.z * cy;
        var y1 = p.y * cx - z1 * sx;
        var z2 = p.y * sx + z1 * cx;
        return { x: x1, y: y1, z: z2 };
      }

      function normal(hj) {
        var a = hj[1], b = hj[2], c = hj[0];
        var ux = b.x - a.x, uy = b.y - a.y, uz = b.z - a.z;
        var vx = c.x - a.x, vy = c.y - a.y, vz = c.z - a.z;
        return { x: uy * vz - uz * vy, y: uz * vx - ux * vz, z: ux * vy - uy * vx };
      }

      function skriv() {
        var bredde = lerret.clientWidth, hogde = lerret.clientHeight;
        if (lerret.width !== Math.round(bredde * DPR) || lerret.height !== Math.round(hogde * DPR)) {
          lerret.width = Math.round(bredde * DPR);
          lerret.height = Math.round(hogde * DPR);
        }
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.clearRect(0, 0, bredde, hogde);
        var cx = bredde / 2, cy = hogde / 2;
        var s = Math.min(bredde, hogde) * 0.355;

        var rot = H.map(roter);
        var synlege = [];
        for (var i = 0; i < SIDER.length; i++) {
          var side = SIDER[i];
          var hj = side.h.map(function (n) { return rot[n]; });
          var nrm = normal(hj);
          var mid = { x: (hj[0].x + hj[2].x) / 2, y: (hj[0].y + hj[2].y) / 2, z: (hj[0].z + hj[2].z) / 2 };
          // vend normalen utover, uavhengig av korleis hjørna er nummererte
          if (nrm.x * mid.x + nrm.y * mid.y + nrm.z * mid.z < 0) {
            nrm.x = -nrm.x; nrm.y = -nrm.y; nrm.z = -nrm.z;
          }
          var lengd = Math.sqrt(nrm.x * nrm.x + nrm.y * nrm.y + nrm.z * nrm.z) || 1;
          if (nrm.z / lengd > 0.015) synlege.push({ side: side, hj: hj, djupn: mid.z, loddrett: Math.abs(nrm.y / lengd), mot: nrm.z / lengd });
        }
        synlege.sort(function (a, b) { return a.djupn - b.djupn; });

        for (var j = 0; j < synlege.length; j++) {
          var o = synlege[j];
          var p0 = o.hj[0], p1 = o.hj[1], p3 = o.hj[3];
          var X = function (q) { return cx + q.x * s; };
          var Y = function (q) { return cy - q.y * s; };
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(X(p0), Y(p0));
          for (var k = 1; k < 4; k++) ctx.lineTo(X(o.hj[k]), Y(o.hj[k]));
          ctx.closePath();
          ctx.fillStyle = o.side.farge;
          ctx.fill();
          ctx.strokeStyle = 'rgba(18,16,15,.4)';
          ctx.lineWidth = 1;
          ctx.stroke();

          if (o.loddrett > 0.72 || o.mot < 0.62) { ctx.restore(); continue; }
          // tekst på sida: vel den kanten som er mest vassrett som tekstretning,
          // og snu han så teksten alltid står oppreist
          var q0 = { x: X(p0), y: Y(p0) }, q1 = { x: X(p1), y: Y(p1) }, q3 = { x: X(p3), y: Y(p3) };
          var eA = { x: q1.x - q0.x, y: q1.y - q0.y };
          var eB = { x: q3.x - q0.x, y: q3.y - q0.y };
          var u, v, org;
          if (Math.abs(eA.y) <= Math.abs(eB.y)) {
            u = { x: eA.x / 2, y: eA.y / 2 }; v = { x: eB.x / 2, y: eB.y / 2 }; org = { x: q0.x, y: q0.y };
          } else {
            u = { x: eB.x / 2, y: eB.y / 2 }; v = { x: eA.x / 2, y: eA.y / 2 }; org = { x: q0.x, y: q0.y };
          }
          if (u.x < 0) { org.x += u.x * 2; org.y += u.y * 2; u.x = -u.x; u.y = -u.y; }
          if (v.y < 0) { org.x += v.x * 2; org.y += v.y * 2; v.x = -v.x; v.y = -v.y; }
          ctx.setTransform(u.x, u.y, v.x, v.y, org.x, org.y);
          ctx.fillStyle = o.side.skrift;
          var storleik = o.side.tekst.length > 3 ? 0.4 : 0.62;
          ctx.font = '400 ' + storleik + 'px Anton, Impact, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(o.side.tekst, 1, 1, 1.6);
          ctx.restore();
        }

      }

      var sisteTid = 0;
      function rull(tid) {
        var naa = tid || 0;
        var dt = sisteTid ? Math.min(naa - sisteTid, 80) : 16;
        sisteTid = naa;
        if (!dradd) {
          if (!redusert.matches) {
            // tidsstyrt rotasjon, ikkje rutebasert
            vinklar.y += 0.00016 * dt;
            vinklar.x = 0.32 + Math.sin(vinklar.y * 0.6) * 0.1;
          }
        } else {
          vinklar.y += fartY;
          fartY *= 0.93;
        }
        skriv();
        window.requestAnimationFrame(rull);
      }

      if (lerret.addEventListener) {
        lerret.addEventListener('pointerdown', function (ev) {
          dradd = true; sisteX = ev.clientX; sisteYp = ev.clientY;
          if (lerret.setPointerCapture) { try { lerret.setPointerCapture(ev.pointerId); } catch (e) {} }
        });
        lerret.addEventListener('pointermove', function (ev) {
          if (!dradd) return;
          var dx = ev.clientX - sisteX, dy = ev.clientY - sisteY;
          sisteX = ev.clientX; sisteYp = ev.clientY;
          vinklar.y += dx * 0.01;
          vinklar.x = Math.max(-1.1, Math.min(1.1, vinklar.x + dy * 0.008));
        });
        var slepp = function () { dradd = false; };
        lerret.addEventListener('pointerup', slepp);
        lerret.addEventListener('pointercancel', slepp);
        lerret.addEventListener('pointerleave', slepp);
      }
      rull();
    }
  }

  /* ---------- teljing av tal når dei kjem i syne ---------- */
  var tal = document.querySelectorAll('[data-tal]');
  if (tal.length && 'IntersectionObserver' in window && !redusert.matches) {
    var tel = new IntersectionObserver(function (opp) {
      opp.forEach(function (o) {
        if (!o.isIntersecting) return;
        var el = o.target;
        var maal = parseInt(el.getAttribute('data-tal'), 10) || 0;
        var start = performance.now();
        var steg = function (no) {
          var t = Math.min((no - start) / 900, 1);
          el.textContent = Math.round(maal * (1 - Math.pow(1 - t, 3))).toLocaleString('nb-NO');
          if (t < 1) window.requestAnimationFrame(steg);
        };
        window.requestAnimationFrame(steg);
        tel.unobserve(el);
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(tal, function (el) { tel.observe(el); });
  } else {
    Array.prototype.forEach.call(tal, function (el) { el.textContent = Number(el.getAttribute('data-tal')).toLocaleString('nb-NO'); });
  }

  /* ---------- aktiv side i teipen ---------- */
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.teip__lenke'), function (a) {
    if (a.getAttribute('href') === her && !a.closest('[aria-hidden="true"]')) a.setAttribute('aria-current', 'page');
  });

  /* ---------- filter i arbeidsgalleriet ---------- */
  var filter = document.querySelector('.filter');
  if (filter) {
    var knappar = filter.querySelectorAll('button');
    Array.prototype.forEach.call(knappar, function (k) {
      k.addEventListener('click', function () {
        Array.prototype.forEach.call(knappar, function (annan) { annan.setAttribute('aria-pressed', annan === k ? 'true' : 'false'); });
        var val = k.getAttribute('data-filter');
        var synlege = 0;
        Array.prototype.forEach.call(document.querySelectorAll('[data-kategori]'), function (el) {
          var vis = val === 'alle' || el.getAttribute('data-kategori') === val;
          el.hidden = !vis;
          if (vis) synlege++;
        });
        var teljing = document.querySelector('[data-teljing]');
        if (teljing) teljing.textContent = synlege + ' oppdrag';
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
      if (navn && !navn.value.trim()) melding = 'Skriv inn namnet ditt.';
      else if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.value.trim())) melding = 'Skriv inn ei gyldig e-postadresse.';
      if (feil) feil.textContent = melding;
      if (melding) { (navn && !navn.value.trim() ? navn : epost).focus(); return; }
      if (kvit) {
        var tekst = kvit.querySelector('[data-kvittering-namn]');
        if (tekst) tekst.textContent = navn && navn.value.trim() ? 'Takk, ' + navn.value.trim().split(' ')[0] + '!' : 'Takk!';
        skjema.hidden = true;
        kvit.classList.add('vis');
        kvit.focus();
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
    var ventar = document.querySelectorAll('.kampanje[data-status="ventar"]').length;
    var ferdige = document.querySelectorAll('.kampanje[data-status="ferdig"]').length;
    var kpiVentar = document.querySelector('[data-kpi="ventar"] .kpi__tal');
    var kpiFerdig = document.querySelector('[data-kpi="ferdig"] .kpi__tal');
    if (kpiVentar) kpiVentar.textContent = ventar;
    if (kpiFerdig) kpiFerdig.textContent = ferdige;
    var framdrift = document.querySelector('[data-framdrift]');
    if (framdrift) {
      var alle = document.querySelectorAll('.kampanje').length;
      framdrift.textContent = ferdige + ' av ' + alle + ' leverte i dag';
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-publiser]'), function (knapp) {
    knapp.addEventListener('click', function () {
      var rad = knapp.closest('.kampanje');
      if (!rad) return;
      var steg = Array.prototype.slice.call(rad.querySelectorAll('.lop__steg'));
      var no = -1;
      steg.forEach(function (s, i) { if (s.classList.contains('lop__steg--no')) no = i; });
      if (no > -1 && no < steg.length - 1) {
        steg[no].classList.remove('lop__steg--no');
        steg[no].classList.add('lop__steg--ferdig');
        steg[no + 1].classList.add('lop__steg--no');
        steg[no + 1].classList.remove('lop__steg--neste');
        if (no + 2 < steg.length) steg[no + 2].classList.add('lop__steg--neste');
        var meld = document.querySelector('[data-panelmelding]');
        if (meld) meld.textContent = 'Steg publisert for ' + (rad.querySelector('.kampanje__kunde') ? rad.querySelector('.kampanje__kunde').textContent.trim() : 'kampanjen') + '.';
      } else {
        rad.setAttribute('data-status', 'ferdig');
        rad.classList.add('ferdig');
        knapp.disabled = true;
        knapp.textContent = 'Levert';
        var melding2 = document.querySelector('[data-panelmelding]');
        if (melding2) melding2.textContent = 'Kampanjen er merkt levert.';
      }
      telOpp();
    });
  });

  telOpp();
})();
