/* ==========================================================================
   AB Bil AS — ab-bil-no-demo
   Håndskrevet WebGL-wireframe av et hjul som roterer med scroll.
   Fallback: innebygd SVG-hjul når getContext("webgl") er null.
   Panel: jobbkø for verkstedet.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- hjul */
  var hjulBoks = document.getElementById("hjul");
  var canvas = hjulBoks ? hjulBoks.querySelector(".hjul-gl") : null;

  function byggGeometri() {
    var v = [];
    function linje(a, b) { v.push(a[0], a[1], a[2], b[0], b[1], b[2]); }
    // dekk: torus, hovedradius 1.0, rør 0.27
    var R = 1.0, r = 0.2, NA = 56, NB = 8;
    function torusPunkt(i, j, RR, rr) {
      var a = (i / NA) * Math.PI * 2, b = (j / NB) * Math.PI * 2;
      var rr2 = RR + rr * Math.cos(b);
      return [rr2 * Math.cos(a), rr2 * Math.sin(a), rr * Math.sin(b)];
    }
    for (var i = 0; i < NA; i++) {
      for (var j = 0; j < NB; j++) {
        linje(torusPunkt(i, j, R, r), torusPunkt(i + 1, j, R, r));
        linje(torusPunkt(i, j, R, r), torusPunkt(i, j + 1, R, r));
      }
    }
    // ytre dekk-kant
    var NK = 80;
    for (var k = 0; k < NK; k++) {
      var a1 = (k / NK) * Math.PI * 2, a2 = ((k + 1) / NK) * Math.PI * 2;
      linje([1.36 * Math.cos(a1), 1.36 * Math.sin(a1), 0], [1.36 * Math.cos(a2), 1.36 * Math.sin(a2), 0]);
    }
    // eiker: 5 doble eiker med litt dybde
    for (var s = 0; s < 5; s++) {
      var ang = (s / 5) * Math.PI * 2;
      for (var w = -1; w <= 1; w += 2) {
        var side = ang + w * 0.085;
        linje([0.2 * Math.cos(side), 0.2 * Math.sin(side), 0.06 * w],
              [0.76 * Math.cos(side), 0.76 * Math.sin(side), -0.02 * w]);
        linje([0.76 * Math.cos(side), 0.76 * Math.sin(side), -0.02 * w],
              [0.99 * Math.cos(ang), 0.99 * Math.sin(ang), 0]);
      }
    }
    // nav: to sirkler
    var NH = 28;
    for (var h = 0; h < NH; h++) {
      var b1 = (h / NH) * Math.PI * 2, b2 = ((h + 1) / NH) * Math.PI * 2;
      linje([0.2 * Math.cos(b1), 0.2 * Math.sin(b1), 0.06], [0.2 * Math.cos(b2), 0.2 * Math.sin(b2), 0.06]);
      linje([0.1 * Math.cos(b1), 0.1 * Math.sin(b1), 0.08], [0.1 * Math.cos(b2), 0.1 * Math.sin(b2), 0.08]);
    }
    // luftventiler i navet
    for (var n = 0; n < 5; n++) {
      var sa = (n / 5) * Math.PI * 2 + 0.3;
      linje([0.04 * Math.cos(sa), 0.04 * Math.sin(sa), 0.09], [0.16 * Math.cos(sa), 0.16 * Math.sin(sa), 0.07]);
    }
    return new Float32Array(v);
  }

  function startHjul() {
    if (!canvas) return;
    var gl = null;
    try { gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false }); } catch (e) { gl = null; }
    if (!gl) { html.classList.add("no-webgl"); return; }

    var VS = [
      "attribute vec3 aPos;",
      "uniform mat4 uMVP;",
      "varying float vZ;",
      "void main(){ vZ = aPos.z; gl_Position = uMVP * vec4(aPos,1.0); }"
    ].join("\n");
    var FS = [
      "precision mediump float;",
      "varying float vZ;",
      "uniform vec3 uFarge;",
      "void main(){",
      "  float d = clamp((vZ + 1.4) / 2.8, 0.0, 1.0);",
      "  float a = 0.16 + 0.78 * d;",
      "  gl_FragColor = vec4(uFarge, a);",
      "}"
    ].join("\n");

    function lagShader(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
      return s;
    }
    var vs = lagShader(gl.VERTEX_SHADER, VS), fs = lagShader(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { html.classList.add("no-webgl"); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { html.classList.add("no-webgl"); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, byggGeometri(), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);

    var uMVP = gl.getUniformLocation(prog, "uMVP");
    var uFarge = gl.getUniformLocation(prog, "uFarge");
    gl.uniform3f(uFarge, 0.961, 0.769, 0.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    function mult(a, b) {
      var o = new Float32Array(16);
      for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
      return o;
    }
    function perspektiv(fov, ar, n, f) {
      var t = 1 / Math.tan(fov / 2), o = new Float32Array(16);
      o[0] = t / ar; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = (2 * f * n) / (n - f);
      return o;
    }
    function flytt(z) { var o = new Float32Array(16); o[0] = o[5] = o[10] = o[15] = 1; o[14] = z; return o; }
    function rotX(a) { var o = new Float32Array(16); o[0] = o[15] = 1; var c = Math.cos(a), s = Math.sin(a); o[5] = c; o[6] = s; o[9] = -s; o[10] = c; return o; }
    function rotY(a) { var o = new Float32Array(16); o[5] = o[15] = 1; var c = Math.cos(a), s = Math.sin(a); o[0] = c; o[2] = -s; o[8] = s; o[10] = c; return o; }

    var synlig = true, klar = false, t0 = performance.now();

    function tegn(t) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || 300, h = canvas.clientHeight || 300;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      var sc = window.scrollY || window.pageYOffset || 0;
      var roter = sc * 0.0055 + (redusert ? 0.6 : (t - t0) * 0.00022);
      var vipp = 0.28 + Math.sin((redusert ? 0 : (t - t0) * 0.0004)) * 0.05;
      var mvp = mult(perspektiv(0.62, w / h, 0.1, 40), mult(flytt(-4.55), mult(rotX(vipp), rotY(roter))));
      gl.uniformMatrix4fv(uMVP, false, mvp);
      gl.drawArrays(gl.LINES, 0, (byggGeometri().length) / 3);
      klar = true;
    }

    var koe = null;
    function onsker() { if (koe) return; koe = requestAnimationFrame(function (t) { koe = null; tegn(t); if (!redusert && synlig) onsker(); }); }
    window.addEventListener("scroll", function () { if (!redusert) onsker(); else tegn(performance.now()); }, { passive: true });
    window.addEventListener("resize", function () { tegn(performance.now()); if (!redusert && synlig) onsker(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        synlig = e[0].isIntersecting;
        if (synlig && !redusert) onsker();
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && !redusert && synlig) onsker();
    });
    tegn(performance.now());
    if (!redusert) onsker();
  }
  startHjul();

  /* -------------------------------------------------------------- avslør */
  var avslor = document.querySelectorAll(".reveal");
  if (avslor.length && "IntersectionObserver" in window && !redusert) {
    var io = new IntersectionObserver(function (opp) {
      opp.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("er-inne"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    avslor.forEach(function (el) { io.observe(el); });
  } else {
    avslor.forEach(function (el) { el.classList.add("er-inne"); });
  }

  /* -------------------------------------------------------------- skjema */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var svar = form.querySelector(".skjema__svar");
      var navn = form.querySelector("#navn, #kunde");
      if (svar) {
        svar.innerHTML = "<b>Takk" + (navn && navn.value ? ", " + navn.value.split(" ")[0] : "") + "</b>" +
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 55 91 55 55 eller skriv til kontakt@ab-bil.no, så svarer vi samme virkedag.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) {
        if (f.type !== "submit") f.value = "";
      });
    });
  });

  /* --------------------------------------------------------------- panel */
  var kø = document.getElementById("jobbkø");
  if (kø) {
    var jobber = [
      { id: "AB-2418", kunde: "Marius Fosse", bil: "Volvo V70 2015", jobb: "EU-kontroll", frist: "I dag 10:00", status: "paagaar", pris: 1290, mekaniker: "Kristoffer" },
      { id: "AB-2419", kunde: "Silje Nybø", bil: "Toyota Avensis 2017", jobb: "Service 60 000 km", frist: "I dag 12:30", status: "paagaar", pris: 4290, mekaniker: "Odin" },
      { id: "AB-2420", kunde: "Terje Lunde", bil: "VW Golf 2016", jobb: "Hjulskift + lagring", frist: "I dag 13:00", status: "venter", pris: 795, mekaniker: "Kristoffer" },
      { id: "AB-2421", kunde: "Anne Marit Hauge", bil: "BMW 320 2018", jobb: "Klargjøring før salg", frist: "I dag 15:00", status: "venter", pris: 1890, mekaniker: "Odin" },
      { id: "AB-2422", kunde: "Bjarne Skeide", bil: "Ford Focus 2014", jobb: "Bremser foran", frist: "I morgen 09:00", status: "venter", pris: 3450, mekaniker: "Kristoffer" },
      { id: "AB-2423", kunde: "Kari Vårdal", bil: "Nissan Leaf 2019", jobb: "PKK og lysjustering", frist: "I dag 09:00", status: "ferdig", pris: 1490, mekaniker: "Odin" },
      { id: "AB-2424", kunde: "Ole Petter Rong", bil: "Skoda Octavia 2018", jobb: "Klargjøring bruktbil", frist: "I dag 08:30", status: "ferdig", pris: 2490, mekaniker: "Kristoffer" },
      { id: "AB-2425", kunde: "Hilde Krokeide", bil: "Audi A4 2016", jobb: "AC-service", frist: "I morgen 11:00", status: "venter", pris: 1590, mekaniker: "Odin" },
      { id: "AB-2426", kunde: "Petter Tenstrand", bil: "Mercedes C200 2019", jobb: "Service + bremselys", frist: "I dag 14:30", status: "paagaar", pris: 5290, mekaniker: "Kristoffer" }
    ];
    var filter = "alle", sok = "";
    var liste = kø;
    var telle = function (st) { return jobber.filter(function (j) { return j.status === st; }).length; };

    function kpi() {
      var sett = function (id, verdi) { var el = document.getElementById(id); if (el) el.textContent = verdi; };
      sett("kpi-ko", telle("venter"));
      sett("kpi-paa", telle("paagaar"));
      sett("kpi-ferdig", telle("ferdig"));
      var sum = jobber.filter(function (j) { return j.status === "ferdig"; }).reduce(function (a, j) { return a + j.pris; }, 0);
      sett("kpi-sum", sum.toLocaleString("nb-NO") + " kr");
    }
    var statNavn = { venter: "I kø", paagaar: "Pågår", ferdig: "Ferdig" };
    function stempel(st) {
      var kl = st === "paagaar" ? "paa" : st === "ferdig" ? "klar" : "vent";
      return '<span class="stempel stempel--' + kl + '">' + statNavn[st] + "</span>";
    }
    function tegnListe() {
      var vis = jobber.filter(function (j) {
        if (filter !== "alle" && j.status !== filter) return false;
        if (!sok) return true;
        return (j.kunde + " " + j.bil + " " + j.id + " " + j.jobb).toLowerCase().indexOf(sok) > -1;
      });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen jobber i dette utvalget akkurat nå. Prøv et annet filter.</div>'; return; }
      liste.innerHTML = vis.map(function (j) {
        var knapp = j.status === "venter"
          ? '<button class="btn btn--liten" data-jobb="' + j.id + '" data-til="paagaar">Start jobben</button>'
          : j.status === "paagaar"
            ? '<button class="btn btn--liten" data-jobb="' + j.id + '" data-til="ferdig">Merk ferdig</button>'
            : '<button class="btn btn--liten btn--ghost" data-jobb="' + j.id + '" data-til="venter">Gjenåpne</button>';
        return '<article class="jobb' + (j.status === "ferdig" ? " jobb--ferdig" : "") + '">' +
          '<div class="jobb__topp"><span class="jobb__id">' + j.id + "</span>" + stempel(j.status) + "</div>" +
          "<h3>" + j.jobb + "</h3>" +
          '<div class="jobb__meta"><b>' + j.bil + "</b><span>" + j.kunde + "</span><span>Frist: " + j.frist + "</span><span>" + j.mekaniker + "</span></div>" +
          '<div class="jobb__handlinger">' + knapp + '<button class="btn btn--liten btn--ghost" data-detalj="' + j.id + '">Detaljer</button></div>' +
          "</article>";
      }).join("");
    }
    function logg(tekst) {
      var ul = document.getElementById("logg-liste");
      if (!ul) return;
      var li = document.createElement("li");
      var naa = new Date();
      li.innerHTML = "<time>" + naa.toTimeString().slice(0, 5) + "</time><span>" + tekst + "</span>";
      ul.insertBefore(li, ul.firstChild);
      while (ul.children.length > 14) ul.removeChild(ul.lastChild);
    }
    liste.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-jobb]");
      if (b) {
        var j = jobber.find(function (x) { return x.id === b.getAttribute("data-jobb"); });
        if (!j) return;
        j.status = b.getAttribute("data-til");
        kpi(); tegnListe();
        logg(j.id + " · " + j.jobb + " → " + statNavn[j.status]);
        return;
      }
      var d = e.target.closest("button[data-detalj]");
      if (d) {
        var jj = jobber.find(function (x) { return x.id === d.getAttribute("data-detalj"); });
        if (jj) logg(jj.id + " åpnet: " + jj.bil + ", " + jj.kunde + ", frist " + jj.frist);
      }
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) {
          o.setAttribute("aria-pressed", o === kn ? "true" : "false");
        });
        tegnListe();
      });
    });
    var sokFelt = document.getElementById("jobb-sok");
    if (sokFelt) sokFelt.addEventListener("input", function () { sok = sokFelt.value.trim().toLowerCase(); tegnListe(); });
    kpi(); tegnListe();
    logg("Vakt åpnet. 9 jobber i systemet.");
  }

  /* ------------------------------------------------------------- datoer */
  document.querySelectorAll("[data-dato]").forEach(function (el) {
    var d = new Date();
    el.textContent = d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
