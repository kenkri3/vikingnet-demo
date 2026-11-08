/* cranetech-no-demo — WebGL-kranarm, indeks, piler og servicepanelet.
   Skrevet for hånd. Ingen biblioteker. */
(function () {
  "use strict";

  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Mobilmeny ---------- */
  function meny() {
    var knapp = document.querySelector("[data-meny-knapp]");
    var menyboks = document.querySelector(".skuff");
    var slor = document.querySelector(".slor");
    if (!knapp || !menyboks) return;
    function sett(aapen) {
      document.body.setAttribute("data-meny", aapen ? "aapen" : "lukket");
      knapp.setAttribute("aria-expanded", aapen ? "true" : "false");
      if (aapen) {
        var første = menyboks.querySelector("a, button");
        if (første) første.focus({ preventScroll: true });
      }
    }
    knapp.addEventListener("click", function () {
      sett(document.body.getAttribute("data-meny") !== "aapen");
    });
    if (slor) slor.addEventListener("click", function () { sett(false); knapp.focus(); });
    var lukk = menyboks.querySelector("[data-meny-lukk]");
    if (lukk) lukk.addEventListener("click", function () { sett(false); knapp.focus(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.getAttribute("data-meny") === "aapen") { sett(false); knapp.focus(); }
    });
    menyboks.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.innerWidth < 1081) sett(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) document.body.removeAttribute("data-meny");
    });
  }

  /* ---------- 2. Avsløring ---------- */
  function avslor() {
    var ting = Array.prototype.slice.call(document.querySelectorAll(".avslor"));
    if (!ting.length) return;
    if (rolig || !("IntersectionObserver" in window)) {
      ting.forEach(function (el) { el.classList.add("synlig"); });
      return;
    }
    ting.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.8) el.classList.add("synlig");
    });
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("synlig"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px 12% 0px", threshold: 0.05 });
    ting.forEach(function (el) { if (!el.classList.contains("synlig")) io.observe(el); });
    window.setTimeout(function () { ting.forEach(function (el) { el.classList.add("synlig"); }); }, 550);
  }

  /* ---------- 3. WebGL-kranarm ---------- */
  function kranGeometri() {
    var seg = [];
    function linje(a, b) { seg.push(a[0], a[1], a[2], b[0], b[1], b[2]); }
    var w = 0.55, h = 6.0;
    var hj = [[-w, -w], [w, -w], [w, w], [-w, w]];
    var i;
    for (i = 0; i < 4; i++) linje([hj[i][0], 0, hj[i][1]], [hj[i][0], h, hj[i][1]]);
    for (var y = 0.75; y <= h + 0.01; y += 0.75) {
      for (i = 0; i < 4; i++) {
        var a = hj[i], b = hj[(i + 1) % 4];
        linje([a[0], y, a[1]], [b[0], y, b[1]]);
        if (y + 0.75 <= h + 0.01) linje([a[0], y, a[1]], [b[0], y + 0.75, b[1]]);
      }
    }
    // topp-punkt
    linje([-w, h, -w], [0, h + 1.1, 0]);
    linje([w, h, -w], [0, h + 1.1, 0]);
    linje([w, h, w], [0, h + 1.1, 0]);
    linje([-w, h, w], [0, h + 1.1, 0]);
    // bom
    var L = 7.2, bh = 0.72;
    linje([0, h, 0], [L, h, 0]);
    linje([0, h + bh, 0], [L - 0.8, h + bh, 0]);
    for (var x = 0; x < L - 0.05; x += 0.72) {
      linje([x, h, 0], [x + 0.72, h + bh, 0]);
      linje([x + 0.72, h + bh, 0], [x + 0.72, h, 0]);
    }
    // motvekt
    linje([0, h, 0], [-2.5, h, 0]);
    linje([0, h + bh, 0], [-2.2, h + bh, 0]);
    linje([-2.5, h, 0], [-2.2, h + bh, 0]);
    linje([-2.35, h - 0.55, 0], [-2.35, h, 0]);
    // krok og vaier
    var kx = 4.6;
    linje([kx, h, 0], [kx, 2.1, 0]);
    linje([kx - 0.2, 2.1, 0], [kx + 0.2, 2.1, 0]);
    linje([kx, 2.1, 0], [kx, 1.72, 0]);
    linje([kx - 0.13, 1.72, 0], [kx + 0.13, 1.9, 0]);
    return new Float32Array(seg);
  }

  function kran() {
    var lerret = document.getElementById("kran");
    if (!lerret) return;
    var geometri = kranGeometri();
    var antall = geometri.length / 3;
    var smal = window.matchMedia("(max-width: 760px)").matches;

    function projiser(t, bredde, hoyde) {
      var vinkel = rolig ? 0.6 : t * 0.16;
      var el = 0.22, dist = 15.5;
      var skala = hoyde * 1.62;
      var c = Math.cos(vinkel), s = Math.sin(vinkel);
      var ce = Math.cos(el), se = Math.sin(el);
      var punkter = new Float32Array(antall * 2);
      for (var i = 0; i < antall; i++) {
        var x0 = geometri[i * 3], y0 = geometri[i * 3 + 1], z0 = geometri[i * 3 + 2];
        if (y0 < 2.2 && x0 > 4) x0 += Math.sin(t * 0.9) * 0.06;
        var x1 = x0 * c - z0 * s;
        var z1 = x0 * s + z0 * c;
        var y1 = y0 * ce - z1 * se;
        var z2 = y0 * se + z1 * ce;
        var f = skala / Math.max(2.5, z2 + dist);
        punkter[i * 2] = (x1 * f) / (bredde * 0.5);
        punkter[i * 2 + 1] = (y1 * f) / (hoyde * 0.5) - 0.78;
      }
      return punkter;
    }

    function tegn2d() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var ctx = lerret.getContext("2d");
      if (!ctx) { rot.classList.add("uten-webgl"); return; }
      var start2 = performance.now();
      var synleg = true;
      function storrelse() {
        var b = lerret.clientWidth || 1, hh = lerret.clientHeight || 1;
        lerret.width = Math.round(b * dpr);
        lerret.height = Math.round(hh * dpr);
      }
      function tegn(nu) {
        if (!synleg) return;
        var t = (nu - start2) / 1000;
        var p = projiser(t, lerret.width, lerret.height);
        var w = lerret.width, h = lerret.height;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "#f4b41a";
        ctx.lineWidth = Math.max(1.1, w / 420);
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(244,180,26,.45)";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        for (var i = 0; i < antall; i += 2) {
          var ax = (p[i * 2] * 0.5 + 0.5) * w;
          var ay = (0.5 - p[i * 2 + 1] * 0.5) * h;
          var bx = (p[(i + 1) * 2] * 0.5 + 0.5) * w;
          var by = (0.5 - p[(i + 1) * 2 + 1] * 0.5) * h;
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
        }
        ctx.stroke();
        if (!rolig) window.requestAnimationFrame(tegn);
      }
      storrelse();
      window.addEventListener("resize", function () { storrelse(); if (rolig) tegn(performance.now()); });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (o) {
          synleg = o[0].isIntersecting;
          if (synleg) window.requestAnimationFrame(tegn);
        }, { threshold: 0 }).observe(lerret.closest(".kran") || lerret);
      }
      window.requestAnimationFrame(tegn);
    }

    if (smal) { tegn2d(); return; }

    var gl = null;
    try { gl = lerret.getContext("webgl", { antialias: true, alpha: true }); } catch (e) { gl = null; }
    if (!gl) { rot.classList.add("uten-webgl"); return; }

    var VS = ["attribute vec2 aPos;", "void main() { gl_Position = vec4(aPos, 0.0, 1.0); }"].join("\n");
    var FS = ["precision mediump float;", "uniform vec3 uFarge;", "void main() { gl_FragColor = vec4(uFarge, 1.0); }"].join("\n");

    function shader(type, kilde) {
      var s = gl.createShader(type);
      gl.shaderSource(s, kilde);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = shader(gl.VERTEX_SHADER, VS), fs = shader(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { rot.classList.add("uten-webgl"); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { rot.classList.add("uten-webgl"); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, geometri, gl.STATIC_DRAW);
    var pos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);

    var uFarge = gl.getUniformLocation(prog, "uFarge");
    var ut = gl.createBuffer();
    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var start = performance.now();
    var synleg = true;

    function storrelse() {
      var b = lerret.clientWidth || 1, hh = lerret.clientHeight || 1;
      lerret.width = Math.round(b * dpr);
      lerret.height = Math.round(hh * dpr);
      gl.viewport(0, 0, lerret.width, lerret.height);
    }

    function tegn(nu) {
      if (!synleg) return;
      var p = projiser((nu - start) / 1000, lerret.width, lerret.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform3f(uFarge, 0.957, 0.706, 0.102);
      gl.bindBuffer(gl.ARRAY_BUFFER, ut);
      gl.bufferData(gl.ARRAY_BUFFER, p, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINES, 0, antall);
      if (!rolig) window.requestAnimationFrame(tegn);
    }

    storrelse();
    window.addEventListener("resize", function () {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      storrelse();
      if (rolig) tegn(performance.now());
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (o) {
        synleg = o[0].isIntersecting;
        if (synleg && !rolig) window.requestAnimationFrame(tegn);
      }, { threshold: 0 }).observe(lerret.closest(".kran") || lerret);
    }
    window.requestAnimationFrame(tegn);
  }

  /* ---------- 4. Skjema ---------- */
  function skjema() {
    var skj = document.querySelector("form[data-skjema]");
    if (!skj) return;
    var melding = skj.querySelector(".skjema-melding");
    skj.addEventListener("submit", function (e) {
      e.preventDefault();
      var navn = skj.querySelector("#navn"), epost = skj.querySelector("#epost"), tekst = skj.querySelector("#melding");
      var feil = [];
      if (navn && navn.value.trim().length < 2) feil.push("navn");
      if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost.value.trim())) feil.push("e-post");
      if (tekst && tekst.value.trim().length < 8) feil.push("melding");
      if (!melding) { skj.reset(); return; }
      melding.setAttribute("data-vis", "ja");
      if (feil.length) {
        melding.textContent = "Fyll ut " + feil.join(", ") + " før du sender.";
        var første = skj.querySelector(feil[0] === "e-post" ? "#epost" : feil[0] === "melding" ? "#melding" : "#navn");
        if (første) første.focus();
        return;
      }
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til post@cranetech.no.";
      skj.reset();
    });
  }

  /* ---------- 5. Servicepanelet ---------- */
  function panel() {
    var liste = document.getElementById("ordre-liste");
    if (!liste) return;
    var rader = Array.prototype.slice.call(liste.querySelectorAll(".ordre"));
    var varsel = document.getElementById("varsel");
    var tid = null;
    function si(t) {
      if (!varsel) return;
      varsel.textContent = t;
      varsel.setAttribute("data-vis", "ja");
      window.clearTimeout(tid);
      tid = window.setTimeout(function () { varsel.removeAttribute("data-vis"); }, 3200);
    }
    function tell() {
      var apne = rader.filter(function (r) { return r.getAttribute("data-status") !== "ferdig"; }).length;
      var kpi = document.getElementById("kpi-apne");
      if (kpi) kpi.textContent = String(apne);
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (k) {
          k.setAttribute("aria-pressed", k === knapp ? "true" : "false");
        });
        rader.forEach(function (r) { r.hidden = valg !== "alle" && r.getAttribute("data-status") !== valg; });
        si("Filtrert: " + knapp.textContent.trim());
      });
    });
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-handling]");
      if (!knapp) return;
      var rad = knapp.closest(".ordre");
      if (!rad) return;
      var handling = knapp.getAttribute("data-handling");
      var status = rad.querySelector(".status");
      if (handling === "start") {
        rad.setAttribute("data-status", "pagaar");
        if (status) { status.setAttribute("data-status", "pagaar"); status.textContent = "Pågår"; }
        knapp.setAttribute("data-handling", "ferdig");
        knapp.textContent = "Merk ferdig";
        si("Service startet: " + (rad.getAttribute("data-navn") || "ordren"));
      } else if (handling === "ferdig") {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Ferdig"; }
        knapp.disabled = true;
        knapp.textContent = "Ferdig";
        tell();
        si("Service fullført: " + (rad.getAttribute("data-navn") || "ordren"));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    meny();
    avslor();
    kran();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
