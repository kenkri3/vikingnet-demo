/* ==========================================================================
   Arco Interpharma AS — arcointerpharma-no-demo
   WebGL oljedråpe (metaball) i hero. CSS-fallback uten WebGL.
   Accordion-sidepanel som meny. Panel: bestillinger og forhandlere.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ oljedråpe (WebGL) */
  var lerret = document.getElementById("draape");
  if (lerret) {
    var gl = null;
    try { gl = lerret.getContext("webgl", { alpha: false, antialias: false }); } catch (e) { gl = null; }
    if (gl) {
      var VS = "attribute vec2 aPos; void main(){ gl_Position = vec4(aPos,0.0,1.0); }";
      var FS = [
        "precision highp float;",
        "uniform vec2 uRes;",
        "uniform float uTid;",
        "float felt(vec2 p){",
        "  float f = 0.0;",
        "  vec2 a = p - vec2(0.02 + 0.05*sin(uTid*0.31), -0.03 + 0.05*cos(uTid*0.27));",
        "  vec2 b = p - vec2(-0.13 + 0.04*cos(uTid*0.23), 0.07 + 0.04*sin(uTid*0.19));",
        "  vec2 c = p - vec2(0.10 + 0.05*sin(uTid*0.17 + 1.2), 0.09 + 0.04*cos(uTid*0.21));",
        "  f += 0.030 / (dot(a, a) + 0.0012);",
        "  f += 0.021 / (dot(b, b) + 0.0016);",
        "  f += 0.015 / (dot(c, c) + 0.0010);",
        "  return f;",
        "}",
        "void main(){",
        "  vec2 uv = gl_FragCoord.xy / uRes;",
        "  float asp = uRes.x / uRes.y;",
        "  vec2 p = (uv - vec2(0.66, 0.56)) * vec2(asp, 1.0);",
        "  float f = felt(p);",
        "  float maske = smoothstep(0.92, 1.06, f);",
        "  vec3 bak = mix(vec3(0.082,0.141,0.125), vec3(0.114,0.192,0.161), uv.y);",
        "  bak += vec3(0.06,0.13,0.10) * clamp(f * 0.05, 0.0, 0.5);",
        "  float e = 0.004;",
        "  float fx = felt(p + vec2(e, 0.0)) - felt(p - vec2(e, 0.0));",
        "  float fy = felt(p + vec2(0.0, e)) - felt(p - vec2(0.0, e));",
        "  vec3 n = normalize(vec3(-fx * 42.0, -fy * 42.0, 0.9));",
        "  vec3 lys = normalize(vec3(-0.45, 0.62, 0.64));",
        "  float diff = clamp(dot(n, lys), 0.0, 1.0);",
        "  float spec = pow(clamp(dot(reflect(-lys, n), normalize(vec3(0.0, 0.0, 1.0))), 0.0, 1.0), 34.0);",
        "  vec3 draape = mix(vec3(0.16,0.34,0.28), vec3(0.72,0.88,0.79), diff * 0.85 + 0.14);",
        "  draape += vec3(0.80,0.68,0.32) * spec * 1.15;",
        "  float fresnel = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.2);",
        "  draape += vec3(0.35,0.55,0.46) * fresnel * 0.35;",
        "  vec3 farge = mix(bak, draape, maske);",
        "  farge *= 0.9 + 0.2 * smoothstep(1.3, 0.2, length(uv - vec2(0.5, 0.5)));",
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
        var raf = null, t0 = performance.now(), forste = true;

        function tegn(t) {
          var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
          var w = lerret.clientWidth, h = lerret.clientHeight;
          if (!w || !h || w < 40 || h < 40) { if (!redusert && !raf) raf = requestAnimationFrame(tegn); return; }
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
        requestAnimationFrame(function (t) { tegn(t); });
        setTimeout(function () { if (forste) tegn(performance.now()); }, 200);
        window.addEventListener("resize", function () { if (redusert) tegn(performance.now()); });
        document.addEventListener("visibilitychange", function () { if (document.hidden) stopp(); else if (!redusert) start(); });
        if ("IntersectionObserver" in window && !redusert) {
          new IntersectionObserver(function (e) { if (e[0].isIntersecting) start(); else stopp(); }, { threshold: 0 }).observe(lerret);
        }
        if (!redusert) start();
      }
    }
  }

  /* ------------------------------------------------ akkordeon-panel */
  var fane = document.getElementById("fane");
  var panel = document.getElementById("panel");
  var slor = document.getElementById("slor");
  if (fane && panel) {
    function apne() {
      panel.setAttribute("data-aapen", "true");
      fane.setAttribute("aria-expanded", "true");
      if (slor) slor.setAttribute("data-aapen", "true");
      document.body.style.overflow = "hidden";
      var f = panel.querySelector(".akk__knapp");
      if (f) f.focus();
    }
    function lukk() {
      panel.setAttribute("data-aapen", "false");
      fane.setAttribute("aria-expanded", "false");
      if (slor) slor.setAttribute("data-aapen", "false");
      document.body.style.overflow = "";
      fane.focus();
    }
    fane.addEventListener("click", function () {
      if (fane.getAttribute("aria-expanded") === "true") lukk(); else apne();
    });
    var lukkeknapp = panel.querySelector(".panel__lukk");
    if (lukkeknapp) lukkeknapp.addEventListener("click", lukk);
    if (slor) slor.addEventListener("click", lukk);
    panel.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { document.body.style.overflow = ""; }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && fane.getAttribute("aria-expanded") === "true") lukk();
    });

    panel.querySelectorAll(".akk__knapp").forEach(function (kn) {
      var inn = document.getElementById(kn.getAttribute("aria-controls"));
      kn.addEventListener("click", function () {
        var aapen = kn.getAttribute("aria-expanded") === "true";
        panel.querySelectorAll(".akk__knapp").forEach(function (annen) {
          annen.setAttribute("aria-expanded", "false");
          var div = document.getElementById(annen.getAttribute("aria-controls"));
          if (div) div.hidden = true;
        });
        kn.setAttribute("aria-expanded", aapen ? "false" : "true");
        if (inn) inn.hidden = aapen;
      });
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
        svar.innerHTML = "<b>Takk" + (navn && navn.value ? ", " + navn.value.split(" ")[0] : "") + "!</b>" +
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 922 58 908 eller skriv til post@arcointerpharma.no, så tar vi kontakt.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: bestillinger */
  var liste = document.getElementById("bestillinger");
  if (liste) {
    var ordrer = [
      { nr: "JH-4412", kunde: "Vitusapotek Drammen", sted: "Drammen", vare: "JHP Olje 30 ml, 12 stk", status: "mottatt", tid: "I dag 09:05", forh: "Apotek" },
      { nr: "JH-4413", kunde: "Majorstukrysset Akupunktur", sted: "Oslo", vare: "JHP Olje 30 ml, 6 stk", status: "pakket", tid: "I dag 10:20", forh: "Klinikk" },
      { nr: "JH-4414", kunde: "Siv Gunhild Aas", sted: "Tønsberg", vare: "JHP Olje reiseflaske, 2 stk", status: "sendt", tid: "I går", forh: "Privat" },
      { nr: "JH-4415", kunde: "Helsekosten AS", sted: "Bergen", vare: "JHP Olje 50 ml, 10 stk", status: "sendt", tid: "I går", forh: "Butikk" },
      { nr: "JH-4416", kunde: "Jeanette Moen", sted: "Porsgrunn", vare: "JHP Olje 30 ml", status: "levert", tid: "Levert", forh: "Privat" },
      { nr: "JH-4417", kunde: "Tønsberg Massasje", sted: "Tønsberg", vare: "JHP Olje 50 ml, 4 stk", status: "pakket", tid: "I dag 11:40", forh: "Klinikk" },
      { nr: "JH-4418", kunde: "Naturhuset Skien", sted: "Skien", vare: "JHP Olje 30 ml, 8 stk", status: "mottatt", tid: "I dag 12:15", forh: "Butikk" },
      { nr: "JH-4419", kunde: "Cecilie Berg", sted: "Oslo", vare: "JHP Olje 30 ml, 1 stk", status: "levert", tid: "Levert", forh: "Privat" }
    ];
    var filter = "alle";
    var statNavn = { mottatt: "Mottatt", pakket: "Pakket", sendt: "Sendt", levert: "Levert" };
    var rekkefolge = ["mottatt", "pakket", "sendt", "levert"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", ordrer.length);
      sett("kpi-mottatt", ordrer.filter(function (o) { return o.status === "mottatt"; }).length);
      sett("kpi-sendt", ordrer.filter(function (o) { return o.status === "sendt"; }).length);
      sett("kpi-levert", ordrer.filter(function (o) { return o.status === "levert"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = ordrer.filter(function (o) { return filter === "alle" || o.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen bestillinger i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (o) {
        var i = rekkefolge.indexOf(o.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = o.status === "mottatt" ? "Pakk" : o.status === "pakket" ? "Merk sendt" : "Merk levert";
        var knapp = o.status === "levert"
          ? '<button class="knapp knapp--mork knapp--liten" data-ordre="' + o.nr + '" data-til="mottatt">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-ordre="' + o.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="ordre' + (o.status === "levert" ? " ordre--levert" : "") + '">' +
          '<div class="ordre__topp"><span class="ordre__nr">' + o.nr + "</span>" + stempel(o.status) + "</div>" +
          "<h3>" + o.vare + "</h3>" +
          '<div class="ordre__meta"><span>' + o.kunde + "</span><span>" + o.sted + "</span><span>" + o.forh + "</span><span>" + o.tid + "</span></div>" +
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
      noter(o.nr + " " + o.kunde + " → " + statNavn[o.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 bestillinger i kø.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
