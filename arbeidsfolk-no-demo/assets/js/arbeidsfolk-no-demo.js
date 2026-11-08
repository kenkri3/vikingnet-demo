/* ==========================================================================
   Arbeidsfolk — arbeidsfolk-no-demo
   Canvas-folkemengde: folk står spredt og samler seg i rekker når du scroller.
   Prikk-rail på desktop, prikk-knapp med ark på mobil. Panel: ordrer og lager.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ folkemengde */
  var lerret = document.getElementById("folk");
  var hero = document.querySelector(".hero");
  if (lerret && hero) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, folk = [], p = 0, maalP = 0, ko = null;

      function bygg() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 60 || H < 60) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var antall = Math.min(190, Math.max(60, Math.round((W * H) / 5200)));
        folk = [];
        for (var i = 0; i < antall; i++) {
          // spredt tilstand: over hele flaten
          var sx = Math.random() * W;
          var sy = Math.random() * H;
          // samlet tilstand: rekker nederst, med litt variasjon
          var rekke = i % 7;
          var kol = Math.floor(i / 7);
          var antKol = Math.ceil(antall / 7);
          var bx = (kol + 0.5) * (W / antKol) + (Math.random() - 0.5) * (W / antKol) * 0.5;
          var by = H - 26 - rekke * (H * 0.048) - Math.random() * 8;
          folk.push({
            sx: sx, sy: sy, bx: bx, by: by,
            r: 2.4 + Math.random() * 1.8,
            hoy: 9 + Math.random() * 7,
            rust: Math.random() < 0.22,
            fart: 0.6 + Math.random() * 0.8,
            fase: Math.random() * Math.PI * 2
          });
        }
        return true;
      }

      function tegn(t) {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        var e = p * p * (3 - 2 * p); // smoothstep
        for (var i = 0; i < folk.length; i++) {
          var f = folk[i];
          var x = f.sx + (f.bx - f.sx) * e;
          var y = f.sy + (f.by - f.sy) * e;
          var dupp = Math.sin(t * 0.0012 * f.fart + f.fase) * (2 + 3 * e);
          var farge = f.rust ? "180,85,42" : "235,233,221";
          var alfa = 0.32 + 0.5 * e;
          ctx.strokeStyle = "rgba(" + farge + "," + alfa + ")";
          ctx.fillStyle = "rgba(" + farge + "," + alfa + ")";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(x, y + dupp);
          ctx.lineTo(x, y + dupp - f.hoy);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y + dupp - f.hoy - f.r, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ko = null;
        if (p !== maalP) {
          p += (maalP - p) * 0.08;
          if (Math.abs(maalP - p) < 0.002) p = maalP;
        }
        if (!redusert) ko = requestAnimationFrame(tegn);
      }

      function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
      function oppdater() {
        var y = window.scrollY || window.pageYOffset || 0;
        var h = hero.offsetHeight || 1;
        maalP = Math.min(1, Math.max(0, y / (h * 0.75)));
        if (!redusert) onsk();
      }

      function start() {
        if (!bygg()) return false;
        p = maalP = 0;
        oppdater();
        if (redusert) { p = maalP = 1; tegn(performance.now()); }
        return true;
      }

      if (start()) {
        window.addEventListener("scroll", oppdater, { passive: true });
        window.addEventListener("resize", function () { if (start()) tegn(performance.now()); });
        if ("ResizeObserver" in window && !redusert) {
          new ResizeObserver(function () { if (start()) onsk(); }).observe(lerret);
        }
      }
    }
  }

  /* ------------------------------------------------ prikk-knapp (mobil) */
  var pk = document.getElementById("prikk-knapp");
  var ark = document.getElementById("prikk-ark");
  if (pk && ark) {
    pk.addEventListener("click", function () {
      var aapen = pk.getAttribute("aria-expanded") === "true";
      pk.setAttribute("aria-expanded", aapen ? "false" : "true");
      ark.hidden = aapen;
      if (!aapen) { var f = ark.querySelector("a"); if (f) f.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (!pk.contains(e.target) && !ark.contains(e.target)) {
        pk.setAttribute("aria-expanded", "false"); ark.hidden = true;
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !ark.hidden) { ark.hidden = true; pk.setAttribute("aria-expanded", "false"); pk.focus(); }
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 959 77 539 eller skriv til post@arbeidsfolk.no, så hjelper vi deg.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: ordrer og lager */
  var liste = document.getElementById("ordreliste");
  if (liste) {
    var ordrer = [
      { nr: "AF-9012", kunde: "Byggmester Solberg AS", sted: "Bergen", vare: "Håndverkerbukse, 6 stk", status: "mottatt", tid: "I dag 08:40", lager: "På lager" },
      { nr: "AF-9013", kunde: "Kari Nes", sted: "Oslo", vare: "Vernesko, str 39", status: "plukket", tid: "I dag 09:10", lager: "På lager" },
      { nr: "AF-9014", kunde: "Nordvik Elektro", sted: "Trondheim", vare: "Flammehemmende jakke, 4 stk", status: "sendt", tid: "I går", lager: "Bestilt" },
      { nr: "AF-9015", kunde: "Anlegg Sør AS", sted: "Kristiansand", vare: "Hjelmlykt, 10 stk", status: "sendt", tid: "I går", lager: "På lager" },
      { nr: "AF-9016", kunde: "Tone Bakken", sted: "Bergen", vare: "Arbeidsbukse dame", status: "mottatt", tid: "I dag 11:05", lager: "På lager" },
      { nr: "AF-9017", kunde: "Maritim Service AS", sted: "Haugesund", vare: "Regntøy, 8 sett", status: "plukket", tid: "I dag 12:20", lager: "Delvis" },
      { nr: "AF-9018", kunde: "Snekker Hansen", sted: "Stavanger", vare: "Logo på 12 plagg", status: "levert", tid: "Levert", lager: "—" },
      { nr: "AF-9019", kunde: "Renhold Midt", sted: "Trondheim", vare: "Servicebukse, 5 stk", status: "levert", tid: "Levert", lager: "—" }
    ];
    var filter = "alle";
    var statNavn = { mottatt: "Mottatt", plukket: "Plukket", sendt: "Sendt", levert: "Levert" };
    var rekkefolge = ["mottatt", "plukket", "sendt", "levert"];

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
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen ordrer i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (o) {
        var i = rekkefolge.indexOf(o.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = o.status === "mottatt" ? "Plukk" : o.status === "plukket" ? "Merk sendt" : "Merk levert";
        var knapp = o.status === "levert"
          ? '<button class="knapp knapp--mork knapp--liten" data-ordre="' + o.nr + '" data-til="mottatt">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-ordre="' + o.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="ordre' + (o.status === "levert" ? " ordre--levert" : "") + '">' +
          '<div class="ordre__topp"><span class="ordre__nr">' + o.nr + "</span>" + stempel(o.status) + "</div>" +
          "<h3>" + o.vare + "</h3>" +
          '<div class="ordre__meta"><span>' + o.kunde + "</span><span>" + o.sted + "</span><span>" + o.tid + "</span><span>Lager: " + o.lager + "</span></div>" +
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
      noter(o.nr + " " + o.vare + " → " + statNavn[o.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 ordrer i kø.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
