/* Ambio People — WebGL-partikkelfelt som samler seg, piller og kandidatpipe. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Signatur: partikkelfelt som går fra spredt sky til ordnet rutenett */
  function partikler() {
    var boks = document.querySelector("[data-felt]");
    if (!boks) return;
    var canvas = boks.querySelector("canvas");
    if (!canvas) return;

    var gl = null;
    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false }) ||
           canvas.getContext("experimental-webgl", { alpha: true, antialias: true });
    } catch (e) { gl = null; }
    if (!gl) { boks.classList.add("uten-webgl"); return; }

    var ANT = 640;
    var pos = new Float32Array(ANT * 2);
    var maal = new Float32Array(ANT * 2);
    var randen = [];
    var i, px, py;
    var side = 36;              // 640 = ca. 25x25 rutenett + rest
    var kolonner = 25, rader = Math.ceil(ANT / kolonner);
    for (i = 0; i < ANT; i++) {
      var a = i * 2.399963;     // gyllen vinkel
      var r = Math.sqrt(i / ANT) * 0.86;
      pos[i * 2] = Math.cos(a) * r;
      pos[i * 2 + 1] = Math.sin(a) * r;
      var k = i % kolonner;
      var rad = Math.floor(i / kolonner);
      maal[i * 2] = (k / (kolonner - 1) - 0.5) * 1.5;
      maal[i * 2 + 1] = (rad / (rader - 1) - 0.5) * 1.5;
    }

    var VS = "attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); gl_PointSize = 2.6; }";
    var FS = "precision mediump float; void main(){ vec2 d = gl_PointCoord - vec2(0.5); float r = length(d); if (r > 0.5) discard; gl_FragColor = vec4(0.753, 0.337, 0.184, 0.85 * (1.0 - r)); }";

    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VS);
    var fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { boks.classList.add("uten-webgl"); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { boks.classList.add("uten-webgl"); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    var bland = 0;
    var arbeid = new Float32Array(ANT * 2);

    function tegn() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var r = boks.getBoundingClientRect();
      var w = Math.max(200, Math.round(r.width));
      var h = Math.max(200, Math.round(canvas.clientHeight || 300));
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (var j = 0; j < ANT * 2; j++) {
        arbeid[j] = pos[j] + (maal[j] - pos[j]) * bland;
      }
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, arbeid);
      gl.drawArrays(gl.POINTS, 0, ANT);
    }

    var synes = false;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (o) { o.forEach(function (x) { synes = x.isIntersecting; }); }, { threshold: 0.05 }).observe(boks);
    } else { synes = true; }

    function rull() {
      var r = boks.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      var p = (vindu * 0.9 - r.top) / (r.height + vindu * 0.5);
      p = Math.min(1, Math.max(0, p));
      var ny = rolig ? 0.65 : p;
      if (Math.abs(ny - bland) > 0.004) { bland = ny; tegn(); }
    }

    var t = null;
    window.addEventListener("scroll", function () { if (synes) { clearTimeout(t); t = setTimeout(rull, 30); } }, { passive: true });
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(function () { rull(); tegn(); }, 180); });
    bland = rolig ? 0.65 : 0;
    tegn();
    rull();
  }

  /* 2. Piller: marker aktiv side */
  function piller() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".pille"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }

  /* 3. Avsløring: synlig som standard */
  function avslor() {
    if (rolig || !("IntersectionObserver" in window)) return;
    var ting = document.querySelectorAll(".avslor");
    if (!ting.length) {
      Array.prototype.forEach.call(document.querySelectorAll(".seksjon > .skal"), function (s) { s.classList.add("avslor"); });
      ting = document.querySelectorAll(".avslor");
    }
    if (!ting.length) return;
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("er-inne"); io.unobserve(x.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    Array.prototype.forEach.call(ting, function (t) { io.observe(t); });
  }

  /* 4. Skjema */
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) {
          ut.hidden = false;
          ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til Ambio People.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* 5. Panel: kandidater mottatt → screening → intervju → tilbud → ansatt */
  function panel() {
    var liste = document.querySelector("[data-kandidater]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiIntervju = document.querySelector("[data-kpi-intervju]");
    var kpiTilbud = document.querySelector("[data-kpi-tilbud]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "screening", "intervju", "tilbud", "ansatt"];
    var navn = { mottatt: "Mottatt", screening: "Screening", intervju: "Intervju", tilbud: "Tilbud", ansatt: "Ansatt" };

    function skrivLogg(tekst) {
      if (!logg) return;
      var na = new Date();
      var linje = document.createElement("div");
      linje.className = "logglinje";
      var t = document.createElement("time");
      t.textContent = ("0" + na.getHours()).slice(-2) + ":" + ("0" + na.getMinutes()).slice(-2);
      var s = document.createElement("span");
      s.textContent = tekst;
      linje.appendChild(t); linje.appendChild(s);
      logg.insertBefore(linje, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }

    function oppdater() {
      var int = 0, til = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".kand"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "intervju") int++;
        if (st === "tilbud") til++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiIntervju) kpiIntervju.textContent = int;
      if (kpiTilbud) kpiTilbud.textContent = til;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".kand").length + " kandidater";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".kand");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".kand__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "ansatt") { knapp.disabled = true; knapp.textContent = "Ansatt"; }
      var navnEl = rad.querySelector(".kand__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "kandidat"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".kand"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Kandidatlisten er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  partikler();
  piller();
  avslor();
  skjema();
  panel();
  ar();
})();
