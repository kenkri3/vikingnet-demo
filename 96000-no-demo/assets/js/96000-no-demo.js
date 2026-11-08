/* ==========================================================================
   VVS Eksperten · Brekke Sanitær AS — 96000-no-demo
   WebGL «vann i rør»-shader i hero. Uten WebGL: CSS-gradient (fallback).
   Fast bunn-dock med «Mer»-ark. Panel for serviceordrer.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ vann i rør (WebGL) */
  var lerret = document.getElementById("ror");
  if (lerret) {
    var gl = null;
    try { gl = lerret.getContext("webgl", { alpha: false, antialias: false }); } catch (e) { gl = null; }
    if (gl) {
      var VS = "attribute vec2 aPos; void main(){ gl_Position = vec4(aPos,0.0,1.0); }";
      var FS = [
        "precision mediump float;",
        "uniform vec2 uRes;",
        "uniform float uTid;",
        "void main(){",
        "  vec2 uv = gl_FragCoord.xy / uRes;",
        "  float c1 = 0.44;",
        "  float h1 = 0.17;",
        "  float d = abs(uv.y - c1);",
        "  float iRor = smoothstep(h1, h1 - 0.008, d);",
        "  vec3 bak = mix(vec3(0.027,0.106,0.176), vec3(0.043,0.153,0.251), uv.y);",
        "  bak += vec3(0.0,0.06,0.07) * smoothstep(0.7,0.0,length(uv - vec2(0.72,0.30)));",
        "  float flow = uv.x * 13.0 - uTid * 1.35 + sin(uv.y * 24.0) * 0.55;",
        "  float caust = (sin(flow) * 0.5 + 0.5) * (sin(flow * 0.37 + 1.7) * 0.5 + 0.5);",
        "  vec3 vann = mix(vec3(0.043,0.30,0.345), vec3(0.133,0.776,0.84), caust);",
        "  float krum = 1.0 - pow(min(d / h1, 1.0), 2.0) * 0.72;",
        "  vann *= 0.42 + 0.78 * krum;",
        "  float kant = smoothstep(h1 * 0.86, h1, d) * iRor;",
        "  vann += vec3(0.55,0.95,1.0) * kant * 0.55;",
        "  float bob = fract(uv.x * 2.4 + uTid * 0.11 + sin(uv.y * 9.0) * 0.35);",
        "  float bob2 = smoothstep(0.022, 0.0, length(vec2(bob - 0.5, (uv.y - c1) * 3.4)));",
        "  float bob3 = smoothstep(0.014, 0.0, length(vec2(fract(uv.x * 3.7 + uTid * 0.07) - 0.35, (uv.y - c1 + 0.05) * 4.1)));",
        "  vann += vec3(0.65,0.98,1.0) * (bob2 + bob3) * 0.28 * iRor;",
        "  vec3 farge = mix(bak, vann, iRor);",
        "  float vig = smoothstep(1.15, 0.25, length(uv - vec2(0.5, 0.5)));",
        "  farge *= 0.82 + 0.26 * vig;",
        "  gl_FragColor = vec4(farge, 1.0);",
        "}"
      ].join("\n");

      function shader(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      }
      var vs = shader(gl.VERTEX_SHADER, VS), fs = shader(gl.FRAGMENT_SHADER, FS);
      var prog = null;
      if (vs && fs) {
        prog = gl.createProgram();
        gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
      }
      if (prog) {
        gl.useProgram(prog);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(prog, "aPos");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        var uRes = gl.getUniformLocation(prog, "uRes");
        var uTid = gl.getUniformLocation(prog, "uTid");
        var raf = null, t0 = performance.now();

        var forste = true;
        function tegn(t) {
          var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
          var w = lerret.clientWidth, h = lerret.clientHeight;
          // ikke tegn før lerretet faktisk har en størrelse (ellers strekkes 1 px ut)
          if (!w || !h || w < 40 || h < 40) {
            if (!redusert && !raf) raf = requestAnimationFrame(tegn);
            return;
          }
          if (lerret.width !== Math.round(w * dpr) || lerret.height !== Math.round(h * dpr)) {
            lerret.width = Math.round(w * dpr); lerret.height = Math.round(h * dpr);
          }
          gl.viewport(0, 0, lerret.width, lerret.height);
          gl.uniform2f(uRes, lerret.width, lerret.height);
          gl.uniform1f(uTid, (t - t0) * 0.001);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          if (forste) { forste = false; html.classList.add("gl-klar"); }
          if (!redusert) raf = requestAnimationFrame(tegn);
        }
        function start() { if (!raf) raf = requestAnimationFrame(tegn); }
        function stopp() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
        window.addEventListener("resize", function () { if (redusert) tegn(performance.now()); });
        document.addEventListener("visibilitychange", function () {
          if (document.hidden) stopp(); else if (!redusert) start();
        });
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (e) { if (e[0].isIntersecting) { if (!redusert) start(); } else stopp(); }, { threshold: 0 }).observe(lerret);
        }
        // første tegning etter at layout er ferdig, så lerretet har riktig størrelse
        requestAnimationFrame(function (t) { tegn(t); });
        setTimeout(function () { if (forste) tegn(performance.now()); }, 180);
        setTimeout(function () { if (forste) tegn(performance.now()); }, 600);
        if ("ResizeObserver" in window) {
          new ResizeObserver(function () { if (forste || redusert) tegn(performance.now()); }).observe(lerret);
        }
        window.addEventListener("load", function () { if (forste) tegn(performance.now()); });
      }
    }
  }

  /* ------------------------------------------------ bunn-dock: «Mer»-ark */
  var merKnapp = document.getElementById("dock-mer");
  var arket = document.getElementById("dock-ark");
  if (merKnapp && arket) {
    function lukk() {
      merKnapp.setAttribute("aria-expanded", "false");
      arket.hidden = true;
    }
    merKnapp.addEventListener("click", function () {
      var aapen = merKnapp.getAttribute("aria-expanded") === "true";
      merKnapp.setAttribute("aria-expanded", aapen ? "false" : "true");
      arket.hidden = aapen;
      if (!aapen) {
        var forste = arket.querySelector("a");
        if (forste) forste.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!merKnapp.contains(e.target) && !arket.contains(e.target)) lukk();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !arket.hidden) { lukk(); merKnapp.focus(); }
    });
  }

  /* ------------------------------------------------ avsløring */
  var avslor = document.querySelectorAll(".avslor");
  if (avslor.length && "IntersectionObserver" in window && !redusert) {
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("er-inne"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    avslor.forEach(function (el) { io.observe(el); });
  } else {
    avslor.forEach(function (el) { el.classList.add("er-inne"); });
  }

  /* ------------------------------------------------ skjema */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var svar = form.querySelector(".skjema__svar");
      var navn = form.querySelector("#navn");
      if (svar) {
        svar.innerHTML = "<b>Takk" + (navn && navn.value ? ", " + navn.value.split(" ")[0] : "") + "</b>" +
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 330 96 000 i åpningstiden (man–fre 09–16), så hjelper vi deg.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: serviceordrer */
  var liste = document.getElementById("ordreliste");
  if (liste) {
    var ordrer = [
      { nr: "SO-3181", kunde: "Grethe Nes", adresse: "Gullhaugveien 14, Holmestrand", jobb: "Lekkasje under vask", status: "mottatt", tid: "I dag 09:15", montor: "Kim" },
      { nr: "SO-3182", kunde: "Borettslaget Fjellheim", adresse: "Hvittingfossveien 88", jobb: "Service varmeanlegg", status: "planlagt", tid: "I dag 11:00", montor: "Arild" },
      { nr: "SO-3183", kunde: "Terje Vold", adresse: "Holtungveien 7", jobb: "Varmepumpe: årlig service", status: "paagar", tid: "I dag 10:30", montor: "Kim" },
      { nr: "SO-3184", kunde: "Anne Kari Berg", adresse: "Søndre Kollen 22", jobb: "Baderomsrenovering", status: "paagar", tid: "Uke 46–49", montor: "Team bad" },
      { nr: "SO-3185", kunde: "Marius Skeie", adresse: "Bekkestua 3", jobb: "Tett toalett", status: "planlagt", tid: "I morgen 08:00", montor: "Ola" },
      { nr: "SO-3186", kunde: "Bjørn Johansen", adresse: "Nedre Gaten 31", jobb: "Utskifting av blandejeg", status: "mottatt", tid: "I dag 13:45", montor: "Ola" },
      { nr: "SO-3187", kunde: "Hanne Moe", adresse: "Kjegleveien 2", jobb: "Varmekabel på bad", status: "ferdig", tid: "I dag 08:00", montor: "Kim" },
      { nr: "SO-3188", kunde: "Sentralgodkjent Bygg AS", adresse: "Havnegata 5", jobb: "Rørinspeksjon og spyling", status: "ferdig", tid: "I går", montor: "Arild" }
    ];
    var filter = "alle";
    var statNavn = { mottatt: "Mottatt", planlagt: "Planlagt", paagar: "Pågår", ferdig: "Ferdig" };
    var rekkefolge = ["mottatt", "planlagt", "paagar", "ferdig"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", ordrer.length);
      sett("kpi-mottatt", ordrer.filter(function (o) { return o.status === "mottatt"; }).length);
      sett("kpi-paagar", ordrer.filter(function (o) { return o.status === "paagar"; }).length);
      sett("kpi-ferdig", ordrer.filter(function (o) { return o.status === "ferdig"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = ordrer.filter(function (o) { return filter === "alle" || o.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen ordrer i dette utvalget akkurat nå.</div>'; return; }
      liste.innerHTML = vis.map(function (o) {
        var i = rekkefolge.indexOf(o.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var knapp = o.status === "ferdig"
          ? '<button class="knapp knapp--mork knapp--liten" data-ordre="' + o.nr + '" data-til="mottatt">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-ordre="' + o.nr + '" data-til="' + neste + '">' + (o.status === "mottatt" ? "Planlegg" : o.status === "planlagt" ? "Start jobben" : "Merk ferdig") + "</button>";
        return '<article class="ordre' + (o.status === "ferdig" ? " ordre--ferdig" : "") + '">' +
          '<div class="ordre__topp"><span class="ordre__nr">' + o.nr + "</span>" + stempel(o.status) + "</div>" +
          "<h3>" + o.jobb + "</h3>" +
          '<div class="ordre__meta"><span>' + o.kunde + "</span><span>" + o.adresse + "</span><span>" + o.tid + "</span><span>" + o.montor + "</span></div>" +
          '<div class="ordre__knapper">' + knapp + "</div>" +
          "</article>";
      }).join("");
    }
    function noter(tekst) {
      var ul = document.getElementById("hendelser");
      if (!ul) return;
      var li = document.createElement("li");
      li.innerHTML = "<time>" + new Date().toTimeString().slice(0, 5) + "</time><span>" + tekst + "</span>";
      ul.insertBefore(li, ul.firstChild);
      while (ul.children.length > 12) ul.removeChild(ul.lastChild);
    }
    liste.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-ordre]");
      if (!b) return;
      var o = ordrer.find(function (x) { return x.nr === b.getAttribute("data-ordre"); });
      if (!o) return;
      o.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(o.nr + " " + o.jobb + " → " + statNavn[o.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 serviceordrer i kø.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
