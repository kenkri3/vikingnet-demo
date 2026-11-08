/* AVE Systemer — sidepanel med søk og WebGL-nettverksgraf. Ingen biblioteker. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Sidepanel med søk ---------- */
  function sidepanel() {
    var panel = document.querySelector("[data-sidepanel]");
    var slor = document.querySelector("[data-slor]");
    var apne = document.querySelector("[data-apne]");
    var lukk = document.querySelector("[data-lukk]");
    var felt = document.querySelector("[data-sok]");
    var tom = document.querySelector("[data-sok-tom]");
    if (!panel) return;

    function sett(aapen) {
      panel.setAttribute("data-aapen", aapen ? "true" : "false");
      if (slor) slor.setAttribute("data-aapen", aapen ? "true" : "false");
      if (apne) apne.setAttribute("aria-expanded", aapen ? "true" : "false");
      if (aapen && felt) setTimeout(function () { felt.focus(); }, 120);
    }

    if (apne) apne.addEventListener("click", function () { sett(true); });
    if (lukk) lukk.addEventListener("click", function () { sett(false); if (apne) apne.focus(); });
    if (slor) slor.addEventListener("click", function () { sett(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.getAttribute("data-aapen") === "true") {
        sett(false);
        if (apne) apne.focus();
      }
    });

    if (felt) {
      var punkter = Array.prototype.slice.call(panel.querySelectorAll(".panelmeny li"));
      felt.addEventListener("input", function () {
        var q = felt.value.trim().toLowerCase();
        var treff = 0;
        punkter.forEach(function (li) {
          var tekst = (li.textContent || "").toLowerCase();
          var vis = !q || tekst.indexOf(q) !== -1;
          li.hidden = !vis;
          if (vis) treff++;
        });
        if (tom) tom.hidden = treff !== 0;
      });
      felt.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var forste = punkter.filter(function (li) { return !li.hidden; })[0];
          if (forste) {
            var a = forste.querySelector("a");
            if (a) window.location.href = a.getAttribute("href");
          }
        }
      });
    }
  }

  /* ---------- 2. WebGL-nettverksgraf ---------- */
  var VERT =
    "attribute vec2 a_pos;" +
    "attribute float a_node;" +
    "uniform float u_t;" +
    "uniform vec2 u_res;" +
    "varying float v_node;" +
    "void main(){" +
    "  vec2 p = a_pos;" +
    "  p.x += sin(u_t * 0.35 + a_pos.y * 3.1) * 0.012;" +
    "  p.y += cos(u_t * 0.28 + a_pos.x * 2.7) * 0.012;" +
    "  v_node = a_node;" +
    "  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);" +
    "  gl_PointSize = a_node > 0.5 ? 9.0 : 1.0;" +
    "}";

  var FRAG =
    "precision mediump float;" +
    "varying float v_node;" +
    "void main(){" +
    "  if (v_node > 0.5) {" +
    "    vec2 d = gl_PointCoord - vec2(0.5);" +
    "    float r = length(d);" +
    "    if (r > 0.5) discard;" +
    "    float a = smoothstep(0.5, 0.05, r);" +
    "    gl_FragColor = vec4(1.0, 0.84, 0.35, a);" +
    "  } else {" +
    "    gl_FragColor = vec4(0.66, 0.78, 0.82, 0.5);" +
    "  }" +
    "}";

  function nettverk() {
    var canvas = document.querySelector("[data-nett]");
    var fallback = document.querySelector("[data-nett-fallback]");
    if (!canvas) return;

    function visFallback() {
      canvas.style.display = "none";
      if (fallback) fallback.style.display = "block";
    }
    if (rolig) { visFallback(); return; }

    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: true, antialias: true }); } catch (e) { gl = null; }
    if (!gl) { visFallback(); return; }
    if (fallback) fallback.style.display = "none";

    function lag(type, kilde) {
      var s = gl.createShader(type);
      gl.shaderSource(s, kilde); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = lag(gl.VERTEX_SHADER, VERT);
    var fs = lag(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { visFallback(); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { visFallback(); return; }
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var bufP = gl.createBuffer();
    var bufN = gl.createBuffer();
    var aP = gl.getAttribLocation(prog, "a_pos");
    var aN = gl.getAttribLocation(prog, "a_node");
    var uT = gl.getUniformLocation(prog, "u_t");
    var uR = gl.getUniformLocation(prog, "u_res");

    /* noder: varmepumper og soner i et anlegg */
    var N = 54;
    var noder = [];
    for (var i = 0; i < N; i++) {
      noder.push({
        x: 0.08 + Math.random() * 0.84,
        y: 0.12 + Math.random() * 0.76,
        vx: (Math.random() - 0.5) * 0.00012,
        vy: (Math.random() - 0.5) * 0.00012
      });
    }

    var w = 0, h = 0;
    function storrelse() {
      var dpr = Math.min(1.6, window.devicePixelRatio || 1);
      var r = canvas.parentNode.getBoundingClientRect();
      w = Math.max(280, Math.round(r.width * dpr));
      h = Math.max(240, Math.round(r.height * dpr));
      canvas.width = w; canvas.height = h;
      canvas.style.width = "100%"; canvas.style.height = "100%";
      gl.viewport(0, 0, w, h);
    }
    storrelse();

    var linjer = new Float32Array(N * N * 4);
    var linjeN = new Float32Array(N * N * 2);
    var punkter = new Float32Array(N * 2);
    var punktN = new Float32Array(N);

    var start = performance.now();
    var kjorer = true;

    function tegn(naa) {
      if (!kjorer) return;
      var t = (naa - start) / 1000;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      for (var i = 0; i < N; i++) {
        var n = noder[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0.06 || n.x > 0.94) n.vx *= -1;
        if (n.y < 0.08 || n.y > 0.92) n.vy *= -1;
      }

      var li = 0, ln = 0;
      for (var a = 0; a < N; a++) {
        for (var b = a + 1; b < N; b++) {
          var dx = noder[a].x - noder[b].x;
          var dy = noder[a].y - noder[b].y;
          if (dx * dx + dy * dy < 0.028) {
            linjer[li++] = noder[a].x; linjer[li++] = noder[a].y;
            linjer[li++] = noder[b].x; linjer[li++] = noder[b].y;
            linjeN[ln++] = 0; linjeN[ln++] = 0;
          }
        }
      }
      for (var k = 0; k < N; k++) {
        punkter[k * 2] = noder[k].x;
        punkter[k * 2 + 1] = noder[k].y;
        punktN[k] = 1;
      }

      gl.uniform1f(uT, t);
      gl.uniform2f(uR, w, h);

      gl.bindBuffer(gl.ARRAY_BUFFER, bufP);
      gl.bufferData(gl.ARRAY_BUFFER, linjer.subarray(0, li), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aP);
      gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufN);
      gl.bufferData(gl.ARRAY_BUFFER, linjeN.subarray(0, ln), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aN);
      gl.vertexAttribPointer(aN, 1, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINES, 0, ln);

      gl.bindBuffer(gl.ARRAY_BUFFER, bufP);
      gl.bufferData(gl.ARRAY_BUFFER, punkter, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aP);
      gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufN);
      gl.bufferData(gl.ARRAY_BUFFER, punktN, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aN);
      gl.vertexAttribPointer(aN, 1, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, N);

      requestAnimationFrame(tegn);
    }
    requestAnimationFrame(tegn);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (o) {
        o.forEach(function (x) {
          if (x.isIntersecting && !kjorer) { kjorer = true; start = performance.now() - 2000; requestAnimationFrame(tegn); }
          else if (!x.isIntersecting) { kjorer = false; }
        });
      }, { threshold: 0.02 });
      io.observe(canvas);
    }

    var tm = null;
    window.addEventListener("resize", function () {
      clearTimeout(tm);
      tm = setTimeout(storrelse, 200);
    });
  }

  /* ---------- 3. Avsløring ---------- */
  function avslor() {
    if (rolig || !("IntersectionObserver" in window)) return;
    var ting = document.querySelectorAll(".seksjon > .skal");
    if (!ting.length) return;
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("er-inne"); io.unobserve(x.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    Array.prototype.forEach.call(ting, function (t) { io.observe(t); });
  }

  /* ---------- 4. Skjema ---------- */
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) {
          ut.hidden = false;
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til post@ave.no.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* ---------- 5. Panel: serviceordrer ---------- */
  function panel() {
    var liste = document.querySelector("[data-ordrer]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiFerdig = document.querySelector("[data-kpi-ferdig]");
    var kpiVei = document.querySelector("[data-kpi-vei]");
    var teller = document.querySelector("[data-antall]");

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
      var ferdig = 0, vei = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".ordre"), function (rad) {
        var st = rad.getAttribute("data-status");
        if (st === "ferdig") ferdig++;
        if (st === "paa-vei") vei++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiFerdig) kpiFerdig.textContent = ferdig;
      if (kpiVei) kpiVei.textContent = vei;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".ordre").length + " ordrer";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-status-knapp]");
      if (!knapp) return;
      var rad = knapp.closest(".ordre");
      if (!rad) return;
      var st = rad.getAttribute("data-status");
      var neste = st === "ny" ? "paa-vei" : "ferdig";
      rad.setAttribute("data-status", neste);
      var merke = rad.querySelector(".ordre__status");
      if (merke) merke.textContent = neste === "paa-vei" ? "Montør på vei" : "Fullført";
      if (neste === "paa-vei") {
        knapp.textContent = "Fullfør";
      } else {
        knapp.disabled = true;
        knapp.textContent = "Fullført";
      }
      var navn = rad.querySelector(".ordre__navn");
      skrivLogg((neste === "paa-vei" ? "Sendte montør til " : "Fullførte ") + (navn ? navn.textContent : "ordre"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".ordre"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-status") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Dagens serviceordrer er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  sidepanel();
  nettverk();
  avslor();
  skjema();
  panel();
  ar();
})();