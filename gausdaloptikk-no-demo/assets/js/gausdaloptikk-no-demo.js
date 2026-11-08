/* ==========================================================================
   Gausdal Optikk — gausdaloptikk-no-demo
   WebGL linse-refraksjon over hero-foto. Uten WebGL vises bildet statisk.
   Toppmeny som skifter til fast, megameny, mobilmeny og optikerpanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------- linse (WebGL) */
  var hero = document.querySelector(".hero");
  var lerret = document.getElementById("linse");
  if (hero && lerret) {
    var gl = null;
    try { gl = lerret.getContext("webgl", { alpha: false, antialias: true }); } catch (e) { gl = null; }
    if (gl) {
      var VS = [
        "attribute vec2 aPos;",
        "void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }"
      ].join("\n");
      var FS = [
        "precision mediump float;",
        "uniform vec2 uOpplosn;",
        "uniform vec2 uLinsesenter;",
        "uniform float uRadius;",
        "uniform vec2 uBildetekstur;",
        "uniform float uTid;",
        "uniform sampler2D uTekstur;",
        "vec2 dekk(vec2 uv){",
        "  float ca = uOpplosn.x / uOpplosn.y;",
        "  float ia = uBildetekstur.x / uBildetekstur.y;",
        "  vec2 p = uv - 0.5;",
        "  if (ca > ia) { p.y *= ia / ca; } else { p.x *= ca / ia; }",
        "  return p + 0.5;",
        "}",
        "void main(){",
        "  vec2 uv = gl_FragCoord.xy / uOpplosn;",
        "  vec2 b = dekk(uv);",
        "  float ca = uOpplosn.x / uOpplosn.y;",
        "  vec2 p = (uv - uLinsesenter) * vec2(ca, 1.0);",
        "  float d = length(p) / uRadius;",
        "  vec3 farge = texture2D(uTekstur, b).rgb;",
        "  if (d < 1.02) {",
        "    float k = 1.0 - smoothstep(0.0, 1.0, d);",
        "    float zoom = 1.0 + 0.62 * pow(k, 1.35);",
        "    vec2 retning = (uv - uLinsesenter);",
        "    vec3 r = texture2D(uTekstur, dekk(uLinsesenter + retning / (zoom * 1.006))).rgb;",
        "    vec3 g = texture2D(uTekstur, dekk(uLinsesenter + retning / zoom)).rgb;",
        "    vec3 bl = texture2D(uTekstur, dekk(uLinsesenter + retning / (zoom * 0.994))).rgb;",
        "    vec3 linsetekstur = vec3(r.r, g.g, bl.b);",
        "    linsetekstur *= 1.0 + 0.10 * k;",
        "    float glans = smoothstep(0.86, 0.99, d) * (1.0 - smoothstep(0.99, 1.02, d));",
        "    linsetekstur += vec3(0.95, 0.87, 0.66) * glans * 0.5;",
        "    float kant = smoothstep(0.965, 1.0, d);",
        "    float myk = smoothstep(1.0, 1.02, d);",
        "    farge = mix(linsetekstur, farge, myk);",
        "    farge *= 1.0 - 0.10 * kant;",
        "  }",
        "  float vig = smoothstep(0.95, 0.28, length(uv - 0.5));",
        "  farge *= 0.82 + 0.18 * vig;",
        "  gl_FragColor = vec4(farge, 1.0);",
        "}"
      ].join("\n");

      function lagShader(type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      }
      var vs = lagShader(gl.VERTEX_SHADER, VS), fs = lagShader(gl.FRAGMENT_SHADER, FS);
      var prog = null;
      if (vs && fs) {
        prog = gl.createProgram();
        gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
      }
      var foto = hero.querySelector(".hero__foto");
      if (prog && foto) {
        gl.useProgram(prog);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(prog, "aPos");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        var uOpplosn = gl.getUniformLocation(prog, "uOpplosn");
        var uSenter = gl.getUniformLocation(prog, "uLinsesenter");
        var uRadius = gl.getUniformLocation(prog, "uRadius");
        var uTekstur = gl.getUniformLocation(prog, "uTekstur");
        var uBilde = gl.getUniformLocation(prog, "uBildetekstur");
        var uTid = gl.getUniformLocation(prog, "uTid");

        var tekstur = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tekstur);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        var klar = false, bildeForhold = 1.5;

        var bilde = new Image();
        bilde.onload = function () {
          gl.bindTexture(gl.TEXTURE_2D, tekstur);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bilde);
          bildeForhold = bilde.naturalWidth / bilde.naturalHeight;
          klar = true;
          html.classList.add("gl-klar");
          tegn(performance.now());
          if (!redusert) oppdater();
        };
        bilde.src = foto.getAttribute("src");

        var maalX = 0.62, maalY = 0.42, naaX = 0.62, naaY = 0.42, pekerAktiv = false, t0 = performance.now();

        function tegn(t) {
          var dpr = Math.min(window.devicePixelRatio || 1, 2);
          var w = lerret.clientWidth || 1, h = lerret.clientHeight || 1;
          if (lerret.width !== Math.round(w * dpr) || lerret.height !== Math.round(h * dpr)) {
            lerret.width = Math.round(w * dpr); lerret.height = Math.round(h * dpr);
          }
          gl.viewport(0, 0, lerret.width, lerret.height);
          if (!klar) { gl.clearColor(0.05, 0.14, 0.12, 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
          var drift = pekerAktiv ? 0 : Math.sin((t - t0) * 0.00042) * 0.035;
          naaX += (maalX + drift - naaX) * 0.06;
          naaY += (maalY + (pekerAktiv ? 0 : Math.cos((t - t0) * 0.00035) * 0.02) - naaY) * 0.06;
          gl.uniform2f(uOpplosn, lerret.width, lerret.height);
          gl.uniform2f(uSenter, naaX, 1.0 - naaY);
          gl.uniform1f(uRadius, Math.min(0.30, 0.62 * (h / w) + 0.06));
          gl.uniform2f(uBilde, bildeForhold, 1);
          gl.uniform1f(uTid, (t - t0) * 0.001);
          gl.uniform1i(uTekstur, 0);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        var ko = null;
        function oppdater() {
          if (ko) return;
          ko = requestAnimationFrame(function (t) { ko = null; tegn(t); if (!redusert) oppdater(); });
        }
        hero.addEventListener("pointermove", function (e) {
          var r = lerret.getBoundingClientRect();
          maalX = Math.min(0.94, Math.max(0.06, (e.clientX - r.left) / r.width));
          maalY = Math.min(0.9, Math.max(0.1, (e.clientY - r.top) / r.height));
          pekerAktiv = true;
        }, { passive: true });
        hero.addEventListener("pointerleave", function () { pekerAktiv = false; });
        window.addEventListener("resize", function () { tegn(performance.now()); });
        document.addEventListener("visibilitychange", function () { if (!document.hidden && !redusert) oppdater(); });
        tegn(performance.now());
        if (!redusert) oppdater();
      }
    }
  }

  /* ------------------------------------------------- fast toppmeny */
  var hode = document.querySelector(".hode");
  if (hode) {
    var harHero = !!document.querySelector(".hero");
    function sjekkHode() {
      var y = window.scrollY || window.pageYOffset;
      if (!harHero || y > 60) hode.classList.add("er-fast");
      else hode.classList.remove("er-fast");
    }
    sjekkHode();
    window.addEventListener("scroll", sjekkHode, { passive: true });
  }

  /* ------------------------------------------------- megameny */
  var knapper = document.querySelectorAll("[data-megameny]");
  function lukkAlle(unntatt) {
    knapper.forEach(function (k) {
      if (k === unntatt) return;
      k.setAttribute("aria-expanded", "false");
      var p = document.getElementById(k.getAttribute("aria-controls"));
      if (p) p.hidden = true;
    });
  }
  knapper.forEach(function (k) {
    var panel = document.getElementById(k.getAttribute("aria-controls"));
    if (!panel) return;
    k.addEventListener("click", function () {
      var aapen = k.getAttribute("aria-expanded") === "true";
      lukkAlle();
      k.setAttribute("aria-expanded", aapen ? "false" : "true");
      panel.hidden = aapen;
    });
    k.addEventListener("mouseenter", function () {
      if (window.matchMedia("(min-width: 820px)").matches) {
        lukkAlle(k);
        k.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
    var li = k.closest("li");
    if (li) li.addEventListener("mouseleave", function () {
      if (!redusert && window.matchMedia("(min-width: 820px)").matches) {
        k.setAttribute("aria-expanded", "false");
        panel.hidden = true;
      }
    });
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { k.setAttribute("aria-expanded", "false"); panel.hidden = true; k.focus(); }
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-megameny]") && !e.target.closest(".megameny")) lukkAlle();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") lukkAlle(); });

  /* ------------------------------------------------- mobilmeny */
  var burger = document.querySelector(".burger");
  var mobil = document.getElementById("mobilmeny");
  if (burger && mobil) {
    burger.addEventListener("click", function () {
      var aapen = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", aapen ? "false" : "true");
      mobil.hidden = aapen;
      document.body.style.overflow = aapen ? "" : "hidden";
    });
    mobil.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        mobil.hidden = true;
        document.body.style.overflow = "";
      });
    });
  }

  /* ------------------------------------------------- avsløring */
  var avslor = document.querySelectorAll(".avslor");
  if (avslor.length && "IntersectionObserver" in window && !redusert) {
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("er-inne"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    avslor.forEach(function (el) { io.observe(el); });
  } else {
    avslor.forEach(function (el) { el.classList.add("er-inne"); });
  }

  /* ------------------------------------------------- skjema */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var svar = form.querySelector(".skjema__svar");
      var navn = form.querySelector("#navn");
      if (svar) {
        svar.innerHTML = "<b>Takk" + (navn && navn.value ? ", " + navn.value.split(" ")[0] : "") + "!</b>" +
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 61 22 61 50 eller skriv til post@gausdaloptikk.no, så svarer vi så fort vi kan.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------- panel */
  var liste = document.getElementById("dagens");
  if (liste) {
    var avtaler = [
      { tid: "10:00", navn: "Anne Grete Bjørnstad", type: "Synsundersøkelse", sted: "Segalstad Bru", status: "bekreftet", notat: "Ny styrke, tar med gamle briller" },
      { tid: "10:45", navn: "Kjetil Rusten", type: "Kontaktlinsekontroll", sted: "Segalstad Bru", status: "venter", notat: "Første kontroll etter tilpasning" },
      { tid: "11:30", navn: "Marit Furuseth", type: "Brilleutlevering", sted: "Segalstad Bru", status: "bekreftet", notat: "Innfatning 3021, progressive glass" },
      { tid: "12:15", navn: "Ole Håkon Støen", type: "Synsundersøkelse", sted: "Segalstad Bru", status: "ferdig", notat: "Barn, med følge" },
      { tid: "13:00", navn: "Ingebjørg Kvåle", type: "Tørre øyne", sted: "Segalstad Bru", status: "venter", notat: "Vurdere øyedråper" },
      { tid: "13:45", navn: "Svein Olav Hovde", type: "Brillejustering", sted: "Segalstad Bru", status: "venter", notat: "Kort ærend, 15 min" },
      { tid: "14:30", navn: "Liv Marit Bøe", type: "Kontaktlinsekontroll", sted: "Valdres optikk", status: "bekreftet", notat: "Årsrullering" },
      { tid: "15:15", navn: "Trond Erik Solberg", type: "Synsundersøkelse", sted: "Segalstad Bru", status: "venter", notat: "Førerkortattest" }
    ];
    var filter = "alle";
    function tell(st) { return avtaler.filter(function (a) { return a.status === st; }).length; }
    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-timer", avtaler.length);
      sett("kpi-kontroller", avtaler.filter(function (a) { return a.type.indexOf("Kontroll") > -1 || a.type.indexOf("Synsunders") > -1 || a.type.indexOf("Tørre") > -1; }).length);
      sett("kpi-briller", avtaler.filter(function (a) { return a.type.indexOf("Brille") > -1; }).length);
      sett("kpi-ledige", avtaler.filter(function (a) { return a.status === "venter"; }).length);
    }
    var navnStat = { venter: "Venter", bekreftet: "Bekreftet", ferdig: "Ferdig" };
    function stempel(s) {
      var kl = s === "bekreftet" ? "bek" : s === "ferdig" ? "ferd" : "vent";
      return '<span class="stempel stempel--' + kl + '">' + navnStat[s] + "</span>";
    }
    function tegn() {
      var vis = avtaler.filter(function (a) { return filter === "alle" || a.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen timer i dette utvalget. Prøv et annet filter.</div>'; return; }
      liste.innerHTML = vis.map(function (a) {
        var knapp = a.status === "venter"
          ? '<button class="btn btn--liten" data-time="' + a.tid + '" data-til="bekreftet">Bekreft</button>'
          : a.status === "bekreftet"
            ? '<button class="btn btn--liten" data-time="' + a.tid + '" data-til="ferdig">Merk ferdig</button>'
            : '<button class="btn btn--liten btn--linje" data-time="' + a.tid + '" data-til="venter">Gjenåpne</button>';
        return '<article class="avtale' + (a.status === "ferdig" ? " avtale--ferd" : "") + '">' +
          '<div class="avtale__topp"><span class="avtale__tid">' + a.tid + "</span>" + stempel(a.status) + "</div>" +
          "<h3>" + a.navn + "</h3>" +
          '<div class="avtale__meta"><span>' + a.type + "</span><span>" + a.sted + "</span><span>" + a.notat + "</span></div>" +
          '<div class="avtale__knapper">' + knapp + "</div>" +
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
      var b = e.target.closest("button[data-time]");
      if (!b) return;
      var a = avtaler.find(function (x) { return x.tid === b.getAttribute("data-time"); });
      if (!a) return;
      a.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(a.tid + " " + a.navn + " → " + navnStat[a.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 timer satt opp.");
  }

  /* ------------------------------------------------- dato */
  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
