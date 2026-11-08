/* Drammen Elektro — WebGL-elv, sidefaner og panel. Ingen biblioteker. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. WebGL: elv som renner ---------- */
  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}";

  var FRAG = [
    "precision highp float;",
    "uniform float u_t;",
    "uniform vec2 u_res;",
    "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
    "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);",
    "return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}",
    "float fbm(vec2 p){float v=0.0;float a=0.5;",
    "for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=0.5;}return v;}",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/u_res.xy;",
    "  uv.x*=u_res.x/max(1.0,u_res.y);",
    "  vec2 q=uv*2.1;",
    "  float f=fbm(vec2(q.x*1.3-u_t*0.055,q.y*1.7+u_t*0.022));",
    "  float g=fbm(q*2.3+vec2(f*1.15,-u_t*0.045));",
    "  vec3 c1=vec3(0.047,0.173,0.231);",
    "  vec3 c2=vec3(0.078,0.369,0.451);",
    "  vec3 c3=vec3(0.184,0.616,0.722);",
    "  vec3 c4=vec3(0.498,0.816,0.878);",
    "  float t=smoothstep(0.12,0.95,f*0.72+g*0.5);",
    "  vec3 col=mix(c1,c2,t);",
    "  col=mix(col,c3,smoothstep(0.38,0.95,g));",
    "  col=mix(col,c4,pow(smoothstep(0.6,1.0,g),1.7)*0.7);",
    "  float bane=uv.y*7.0+f*3.2+u_t*0.12;",
    "  float streak=smoothstep(0.055,0.0,abs(sin(bane)));",
    "  col+=streak*0.055;",
    "  float vig=1.0-0.35*length(uv-vec2(0.5,0.42));",
    "  gl_FragColor=vec4(col*vig,1.0);",
    "}"
  ].join("\n");

  function elv() {
    var canvas = document.querySelector("[data-elv]");
    var fallback = document.querySelector("[data-elv-fallback]");
    if (!canvas) return;

    function visFallback() {
      canvas.style.display = "none";
      if (fallback) fallback.style.display = "block";
    }
    if (rolig) { visFallback(); return; }

    var gl = null;
    try { gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); } catch (e) { gl = null; }
    if (!gl) { visFallback(); return; }
    if (fallback) fallback.style.display = "none";

    function lag(type, kilde) {
      var s = gl.createShader(type);
      gl.shaderSource(s, kilde);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }
    var vs = lag(gl.VERTEX_SHADER, VERT);
    var fs = lag(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { visFallback(); return; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { visFallback(); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var pos = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    var uT = gl.getUniformLocation(prog, "u_t");
    var uRes = gl.getUniformLocation(prog, "u_res");

    var w = 0, h = 0;
    function storrelse() {
      var dpr = Math.min(1.6, window.devicePixelRatio || 1);
      var r = canvas.parentNode.getBoundingClientRect();
      w = Math.max(320, Math.round(r.width * dpr));
      h = Math.max(280, Math.round(r.height * dpr));
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      gl.viewport(0, 0, w, h);
    }
    storrelse();

    var start = performance.now();
    var kjorer = true;
    function tegn(naa) {
      if (!kjorer) return;
      gl.uniform1f(uT, (naa - start) / 1000);
      gl.uniform2f(uRes, w, h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(tegn);
    }
    requestAnimationFrame(tegn);

    /* stopp shaderen når hero er ute av syne – spar batteri */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (o) {
        o.forEach(function (x) {
          if (x.isIntersecting && !kjorer) {
            kjorer = true;
            start = performance.now() - 1000;
            requestAnimationFrame(tegn);
          } else if (!x.isIntersecting) {
            kjorer = false;
          }
        });
      }, { threshold: 0.02 });
      io.observe(canvas);
    }

    var t = null;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(storrelse, 200);
    });
  }

  /* ---------- 2. Sidefaner: marker aktiv side i railen ---------- */
  function sidefaner() {
    var faner = document.querySelectorAll(".side__fane");
    if (!faner.length) return;
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(faner, function (f) {
      var h = f.getAttribute("href");
      if (h === sti) f.setAttribute("aria-current", "page");
    });
  }

  /* ---------- 3. Avsløring ---------- */
  function avslor() {
    if (rolig || !("IntersectionObserver" in window)) return;
    var ting = document.querySelectorAll(".avslor");
    if (!ting.length) {
      /* sett ikke klasse på seksjonene før vi vet at IO virker – da er de synlige */
      Array.prototype.forEach.call(document.querySelectorAll(".seksjon > .skal"), function (s) { s.classList.add("avslor"); });
      ting = document.querySelectorAll(".avslor");
    }
    if (!ting.length) return;
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("er-inne"); io.unobserve(x.target); }
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.07 });
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
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til post@drammenel.no.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* ---------- 5. Panel: installasjoner og avvik ---------- */
  function panel() {
    var liste = document.querySelector("[data-installasjoner]");
    var avvik = document.querySelector("[data-avvik]");
    if (!liste && !avvik) return;

    var logg = document.querySelector("[data-logg]");
    var kpiFerdig = document.querySelector("[data-kpi-ferdig]");
    var kpiAapne = document.querySelector("[data-kpi-avvik]");
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
      linje.appendChild(t);
      linje.appendChild(s);
      logg.insertBefore(linje, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }

    function oppdater() {
      var ferdig = 0, synlig = 0;
      if (liste) {
        Array.prototype.forEach.call(liste.querySelectorAll(".installasjon"), function (rad) {
          if (rad.getAttribute("data-status") === "ferdig") ferdig++;
          if (rad.style.display !== "none") synlig++;
        });
      }
      var aapne = 0;
      if (avvik) {
        Array.prototype.forEach.call(avvik.querySelectorAll(".avvik__rad"), function (rad) {
          if (rad.getAttribute("data-lukket") !== "true") aapne++;
        });
      }
      if (kpiFerdig) kpiFerdig.textContent = ferdig;
      if (kpiAapne) kpiAapne.textContent = aapne;
      if (teller && liste) teller.textContent = synlig + " av " + liste.querySelectorAll(".installasjon").length + " installasjoner";
    }

    if (liste) {
      liste.addEventListener("click", function (e) {
        var knapp = e.target.closest("[data-ferdig]");
        if (!knapp) return;
        var rad = knapp.closest(".installasjon");
        if (!rad) return;
        rad.setAttribute("data-status", "ferdig");
        var st = rad.querySelector(".installasjon__status");
        if (st) st.textContent = "Ferdig";
        knapp.disabled = true;
        knapp.textContent = "Ferdig";
        var navn = rad.querySelector(".installasjon__tittel");
        skrivLogg("Installasjon ferdigmeldt: " + (navn ? navn.textContent : "ukjent"));
        oppdater();
      });

      var knapper = document.querySelectorAll("[data-filter]");
      Array.prototype.forEach.call(knapper, function (knapp) {
        knapp.addEventListener("click", function () {
          var valg = knapp.getAttribute("data-filter");
          Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
          Array.prototype.forEach.call(liste.querySelectorAll(".installasjon"), function (rad) {
            rad.style.display = (valg === "alle" || rad.getAttribute("data-status") === valg) ? "" : "none";
          });
          oppdater();
        });
      });
    }

    if (avvik) {
      avvik.addEventListener("click", function (e) {
        var knapp = e.target.closest("[data-lukk]");
        if (!knapp) return;
        var rad = knapp.closest(".avvik__rad");
        if (!rad || rad.getAttribute("data-lukket") === "true") return;
        rad.setAttribute("data-lukket", "true");
        knapp.disabled = true;
        knapp.textContent = "Lukket";
        var navn = rad.querySelector(".avvik__navn");
        skrivLogg("Avvik lukket: " + (navn ? navn.textContent : "ukjent"));
        oppdater();
      });
    }

    oppdater();
    skrivLogg("Dagsplan lastet. 8 installasjoner, 2 avvik.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  elv();
  sidefaner();
  avslor();
  skjema();
  panel();
  ar();
})();