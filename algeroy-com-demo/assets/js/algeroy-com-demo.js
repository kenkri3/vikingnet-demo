/* algeroy-com-demo — bevegelse og panelmekanikk.
   Alt er skrevet for hånd. Ingen biblioteker. */
(function () {
  "use strict";

  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Kapittelmeny (mobil) ---------- */
  function meny() {
    var knapp = document.querySelector("[data-meny-knapp]");
    var panel = document.querySelector(".kapittel");
    var slor = document.querySelector(".slør");
    if (!knapp || !panel) return;

    function sett(aapen) {
      document.body.setAttribute("data-meny", aapen ? "aapen" : "lukket");
      knapp.setAttribute("aria-expanded", aapen ? "true" : "false");
      if (aapen) {
        var første = panel.querySelector("a");
        if (første) første.focus({ preventScroll: true });
      }
    }

    knapp.addEventListener("click", function () {
      sett(document.body.getAttribute("data-meny") !== "aapen");
    });
    if (slor) slor.addEventListener("click", function () { sett(false); knapp.focus(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.getAttribute("data-meny") === "aapen") {
        sett(false);
        knapp.focus();
      }
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.innerWidth < 961) sett(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) document.body.removeAttribute("data-meny");
    });
  }

  /* ---------- 2. Stilles-linjen i railen ---------- */
  function fremdrift() {
    var linje = document.querySelector(".stilles span");
    if (!linje) return;
    var venter = false;
    function mal() {
      venter = false;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 40 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      linje.style.height = (p * 100).toFixed(2) + "%";
    }
    window.addEventListener("scroll", function () {
      if (!venter) { venter = true; window.requestAnimationFrame(mal); }
    }, { passive: true });
    window.addEventListener("resize", mal);
    mal();
  }

  /* ---------- 3. Avsløring ved scroll ---------- */
  function avslor() {
    var ting = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!ting.length) return;
    if (rolig || !("IntersectionObserver" in window)) {
      ting.forEach(function (el) { el.classList.add("synlig"); });
      return;
    }
    ting.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.8) el.classList.add("synlig");
      else el.setAttribute("data-skjul", "ja");
    });
    var io = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (o) {
        if (o.isIntersecting) {
          o.target.classList.add("synlig");
          o.target.removeAttribute("data-skjul");
          io.unobserve(o.target);
        }
      });
    }, { rootMargin: "0px 0px 12% 0px", threshold: 0.05 });
    ting.forEach(function (el) { if (!el.classList.contains("synlig")) io.observe(el); });
    // sikkerhetsnett: ingenting skal bli stående usynlig
    window.setTimeout(function () {
      ting.forEach(function (el) {
        if (!el.classList.contains("synlig")) {
          el.classList.add("synlig");
          el.removeAttribute("data-skjul");
        }
      });
    }, 1500);
  }

  /* ---------- 4. Blekk i vann (WebGL) ---------- */
  var VERT = [
    "attribute vec2 aPosisjon;",
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = aPosisjon * 0.5 + 0.5;",
    "  gl_Position = vec4(aPosisjon, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "varying vec2 vUv;",
    "uniform float uTid;",
    "uniform vec2 uStorrelse;",
    "uniform vec2 uPeker;",
    "",
    "float hash(vec2 p) {",
    "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);",
    "}",
    "",
    "float stoy(vec2 p) {",
    "  vec2 i = floor(p);",
    "  vec2 f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  float a = hash(i);",
    "  float b = hash(i + vec2(1.0, 0.0));",
    "  float c = hash(i + vec2(0.0, 1.0));",
    "  float d = hash(i + vec2(1.0, 1.0));",
    "  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);",
    "}",
    "",
    "float fbm(vec2 p) {",
    "  float v = 0.0;",
    "  float a = 0.5;",
    "  mat2 rot = mat2(0.86, 0.51, -0.51, 0.86);",
    "  for (int i = 0; i < 5; i++) {",
    "    v += a * stoy(p);",
    "    p = rot * p * 2.03 + vec2(1.7, 9.2);",
    "    a *= 0.5;",
    "  }",
    "  return v;",
    "}",
    "",
    "void main() {",
    "  vec2 uv = vUv;",
    "  float ar = uStorrelse.x / max(uStorrelse.y, 1.0);",
    "  vec2 p = (uv - 0.5) * vec2(ar, 1.0);",
    "  float t = uTid * 0.030;",
    "",
    "  // pekeren gir blekket et lite puff der musepekeren er",
    "  vec2 peker = (uPeker - 0.5) * vec2(ar, 1.0);",
    "  float avstand = length(p - peker);",
    "  float puff = 0.11 * exp(-avstand * avstand * 3.0);",
    "",
    "  vec2 q = vec2(",
    "    fbm(p * 1.35 + vec2(0.0, t) + puff),",
    "    fbm(p * 1.35 + vec2(4.7, -t))",
    "  );",
    "  vec2 r = vec2(",
    "    fbm(p * 2.2 + q * 2.0 + vec2(1.7, 9.2) + t * 0.55),",
    "    fbm(p * 2.2 + q * 2.0 + vec2(8.3, 2.8) - t * 0.45)",
    "  );",
    "  float d = fbm(p * 3.0 + r * 1.9 + vec2(0.0, -t * 0.35));",
    "  float fin = fbm(p * 7.5 + r * 1.2 + vec2(t * 0.2, 0.0));",
    "  float filament = fbm(p * 5.5 + r * 2.8 + vec2(0.0, -t * 0.7));",
    "",
    "  // blekket driver inn fra hoyre og legger seg i papiret",
    "  float side = smoothstep(-0.05, 1.02, p.x + 0.06 * sin(p.y * 2.1 + t * 1.6));",
    "  float kjerne = smoothstep(0.46, 0.88, d + 0.11 * fin + 0.09 * filament + 0.02);",
    "  float tymm = (smoothstep(0.40, 0.55, d) - smoothstep(0.55, 0.72, d)) * 0.5;",
    "  float tetthet = kjerne * 0.95 + tymm * 0.36;",
    "  tetthet *= side;",
    "  tetthet *= smoothstep(0.0, 0.24, 1.0 - uv.y);",
    "  tetthet += puff * 0.5 * side;",
    "  tetthet = clamp(tetthet, 0.0, 1.0);",
    "",
    "  vec3 papir = vec3(0.953, 0.929, 0.882);",
    "  vec3 blekk = vec3(0.059, 0.106, 0.165);",
    "  vec3 karmin = vec3(0.541, 0.227, 0.180);",
    "",
    "  float fiber = stoy(uv * vec2(320.0, 180.0)) * 0.012;",
    "  papir -= fiber;",
    "",
    "  vec3 farge = mix(papir, blekk, tetthet * 0.97);",
    "  farge = mix(farge, karmin, 0.06 * kjerne * side);",
    "  farge += (hash(gl_FragCoord.xy + uTid) - 0.5) * 0.014;",
    "",
    "  gl_FragColor = vec4(farge, 1.0);",
    "}"
  ].join("\n");

  function lagShader(gl, type, kilde) {
    var s = gl.createShader(type);
    gl.shaderSource(s, kilde);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function blekk() {
    var lerret = document.getElementById("blekk");
    if (!lerret) return;
    var gl = null;
    try {
      gl = lerret.getContext("webgl", { antialias: false, alpha: false }) ||
           lerret.getContext("experimental-webgl");
    } catch (e) { gl = null; }
    if (!gl) { rot.classList.add("uten-webgl"); return; }

    var vs = lagShader(gl, gl.VERTEX_SHADER, VERT);
    var fs = lagShader(gl, gl.FRAGMENT_SHADER, FRAG);
    var prog = gl.createProgram();
    if (!vs || !fs) { rot.classList.add("uten-webgl"); return; }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { rot.classList.add("uten-webgl"); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var pos = gl.getAttribLocation(prog, "aPosisjon");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    var uTid = gl.getUniformLocation(prog, "uTid");
    var uStor = gl.getUniformLocation(prog, "uStorrelse");
    var uPeker = gl.getUniformLocation(prog, "uPeker");
    var peker = { x: 0.72, y: 0.55 };
    var malPeker = { x: 0.72, y: 0.55 };
    var start = performance.now();
    var synleg = true;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function storrelse() {
      var b = lerret.clientWidth || lerret.parentNode.clientWidth || 1;
      var h = lerret.clientHeight || lerret.parentNode.clientHeight || 1;
      lerret.width = Math.max(1, Math.round(b * dpr));
      lerret.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, lerret.width, lerret.height);
      gl.uniform2f(uStor, lerret.width, lerret.height);
    }

    function tegn(nu) {
      if (!synleg) return;
      var tid = (nu - start) / 1000;
      peker.x += (malPeker.x - peker.x) * 0.045;
      peker.y += (malPeker.y - peker.y) * 0.045;
      gl.uniform1f(uTid, tid);
      gl.uniform2f(uPeker, peker.x, peker.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!rolig) window.requestAnimationFrame(tegn);
    }

    storrelse();
    window.addEventListener("resize", function () {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      storrelse();
      if (rolig) tegn(performance.now());
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) return;
      start = performance.now();
      if (!rolig) window.requestAnimationFrame(tegn);
    });

    var hero = lerret.closest(".hero") || lerret;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (o) {
        synleg = o[0].isIntersecting;
        if (synleg && !rolig) window.requestAnimationFrame(tegn);
      }, { threshold: 0 }).observe(hero);
    }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      malPeker.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      malPeker.y = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    });

    if (rolig) {
      gl.uniform1f(uTid, 12.0);
      gl.uniform2f(uPeker, peker.x, peker.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }
    window.requestAnimationFrame(tegn);
  }

  /* ---------- 5. Skjema ---------- */
  function skjema() {
    var skj = document.querySelector("form[data-skjema]");
    if (!skj) return;
    var melding = skj.querySelector(".skjema-melding");
    skj.addEventListener("submit", function (e) {
      e.preventDefault();
      var navn = skj.querySelector("#navn");
      var epost = skj.querySelector("#epost");
      var tekst = skj.querySelector("#melding");
      var feil = [];
      if (navn && navn.value.trim().length < 2) feil.push("navn");
      if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost.value.trim())) feil.push("e-post");
      if (tekst && tekst.value.trim().length < 8) feil.push("melding");
      if (feil.length) {
        if (melding) {
          melding.setAttribute("data-vis", "ja");
          melding.textContent = "Fyll ut " + feil.join(", ") + " før du sender.";
        }
        var første = skj.querySelector("#" + (feil[0] === "e-post" ? "epost" : feil[0] === "melding" ? "melding" : "navn"));
        if (første) første.focus();
        return;
      }
      if (melding) {
        melding.setAttribute("data-vis", "ja");
        melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til pa@algeroy.com, og du får svar innen én virkedag.";
      }
      skj.reset();
    });
  }

  /* ---------- 6. Panel: saker, frister, notater ---------- */
  function panel() {
    var saksliste = document.getElementById("sak-liste");
    if (!saksliste) return;

    var saker = Array.prototype.slice.call(saksliste.querySelectorAll(".sak"));
    var teller = document.getElementById("sak-antall");
    var varsel = document.getElementById("varsel");
    var varselTid = null;
    var notatDialog = document.getElementById("notat-dialog");
    var notatSak = null;

    function si(melding) {
      if (!varsel) return;
      varsel.textContent = melding;
      varsel.setAttribute("data-vis", "ja");
      window.clearTimeout(varselTid);
      varselTid = window.setTimeout(function () { varsel.removeAttribute("data-vis"); }, 3600);
    }

    function tell() {
      var synlege = saker.filter(function (s) { return !s.hidden; }).length;
      if (teller) teller.textContent = String(synlege) + " saker";
    }

    /* filtre */
    var filtre = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    filtre.forEach(function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        filtre.forEach(function (k) { k.setAttribute("aria-pressed", k === knapp ? "true" : "false"); });
        saker.forEach(function (s) {
          s.hidden = valg !== "alle" && s.getAttribute("data-type") !== valg;
        });
        tell();
        si(valg === "alle" ? "Viser alle saker" : "Filtrert: " + knapp.textContent.trim());
      });
    });
    tell();

    /* notat */
    function opneNotat(sak) {
      notatSak = sak;
      if (!notatDialog) return;
      var navn = sak.getAttribute("data-tittel") || "saken";
      var felt = document.getElementById("notat-tekst");
      var tittel = document.getElementById("notat-sak");
      if (tittel) tittel.textContent = navn;
      if (felt) felt.value = "";
      if (typeof notatDialog.showModal === "function") notatDialog.showModal();
      else notatDialog.setAttribute("open", "open");
      if (felt) window.setTimeout(function () { felt.focus(); }, 60);
    }

    saksliste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-notat]");
      if (knapp) {
        var rad = knapp.closest(".sak");
        if (rad) opneNotat(rad);
        return;
      }
      var rad2 = e.target.closest(".sak");
      if (rad2) {
        saker.forEach(function (s) { s.removeAttribute("data-merket"); });
        rad2.setAttribute("data-merket", "ja");
      }
    });

    if (notatDialog) {
      var lukk = notatDialog.querySelector("[data-lukk]");
      if (lukk) lukk.addEventListener("click", function () {
        if (typeof notatDialog.close === "function") notatDialog.close();
        else notatDialog.removeAttribute("open");
      });
      notatDialog.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!notatSak) return;
        var felt = document.getElementById("notat-tekst");
        var tekst = felt && felt.value.trim();
        if (!tekst) { if (felt) felt.focus(); return; }
        var antall = notatSak.querySelector("[data-notater]");
        if (antall) {
          var n = parseInt(antall.getAttribute("data-notater"), 10) || 0;
          antall.setAttribute("data-notater", String(n + 1));
          antall.textContent = (n + 1) + " notat" + (n + 1 === 1 ? "" : "er");
        }
        var kpi = document.getElementById("kpi-notater");
        if (kpi) kpi.textContent = String((parseInt(kpi.textContent, 10) || 0) + 1);
        si("Notat lagt til på " + (notatSak.getAttribute("data-tittel") || "saken"));
        if (typeof notatDialog.close === "function") notatDialog.close();
        else notatDialog.removeAttribute("open");
      });
    }

    /* frister markerer saken de hører til */
    Array.prototype.forEach.call(document.querySelectorAll("[data-frist-sak]"), function (knapp) {
      knapp.addEventListener("click", function () {
        var id = knapp.getAttribute("data-frist-sak");
        var rad = saksliste.querySelector('[data-sak="' + id + '"]');
        if (!rad) return;
        saker.forEach(function (s) { s.removeAttribute("data-merket"); });
        rad.removeAttribute("data-merket");
        void rad.offsetWidth;
        rad.setAttribute("data-merket", "ja");
        rad.scrollIntoView({ behavior: rolig ? "auto" : "smooth", block: "center" });
        si("Fristen gjelder " + (rad.getAttribute("data-tittel") || "saken"));
      });
    });

    /* last ned saksliste som CSV */
    var eksport = document.getElementById("eksporter");
    if (eksport) eksport.addEventListener("click", function () {
      var linjer = ["Sak;Klient;Type;Status;Frist;Notater"];
      saker.filter(function (s) { return !s.hidden; }).forEach(function (s) {
        var notat = s.querySelector("[data-notater]");
        linjer.push([
          s.getAttribute("data-tittel") || "",
          s.getAttribute("data-klient") || "",
          s.getAttribute("data-type-navn") || "",
          (s.querySelector(".status") || {}).textContent || "",
          s.getAttribute("data-frist") || "",
          notat ? notat.getAttribute("data-notater") : "0"
        ].join(";"));
      });
      var blob = new Blob([linjer.join("\n")], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "algeroy-saksliste.csv";
      document.body.appendChild(a);
      a.click();
      window.setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
      si("Sakslisten er lastet ned som CSV");
    });
  }

  /* ---------- start ---------- */
  function start() {
    document.documentElement.classList.add("js");
    meny();
    fremdrift();
    avslor();
    blekk();
    skjema();
    panel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
