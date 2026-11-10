/* ==========================================================================
   7 Fjell Bil Vest AS — 7fjellbilvest-no-demo
   Canvas-turteller: nålen følger scroll. Avsløring, skjema, salgspanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ turteller */
  var lerret = document.getElementById("turteller");
  var hero = document.querySelector(".hero");
  if (lerret && hero) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, naa = 0, maal = 0, ko = null, t0 = performance.now();

      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 60 || H < 60) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }

      function tegn(t) {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        var cx = W * 0.66, cy = H * 0.5;
        var r = Math.min(W, H) * 0.34;
        if (r < 26) return;
        var start = Math.PI * 0.75, slutt = Math.PI * 2.25;
        var vinkel = start + (slutt - start) * (naa / 100);

        // bue
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(242,239,230,0.42)";
        ctx.beginPath(); ctx.arc(cx, cy, r, start, slutt); ctx.stroke();
        // rød sone
        ctx.strokeStyle = "rgba(232,131,108,0.85)";
        ctx.beginPath(); ctx.arc(cx, cy, r, start + (slutt - start) * 0.78, slutt); ctx.stroke();
        // fyll opp til nåla
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#c1442e";
        ctx.beginPath(); ctx.arc(cx, cy, r, start, vinkel); ctx.stroke();
        // hakk
        for (var i = 0; i <= 20; i++) {
          var a = start + (slutt - start) * (i / 20);
          var lang = i % 5 === 0;
          var r1 = r - (lang ? 13 : 7), r2 = r - 2;
          ctx.strokeStyle = lang ? "rgba(242,239,230,0.9)" : "rgba(242,239,230,0.5)";
          ctx.lineWidth = lang ? 1.6 : 1;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
          ctx.stroke();
        }
        // nåla
        ctx.strokeStyle = "#f2efe6";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(vinkel) * 10, cy - Math.sin(vinkel) * 10);
        ctx.lineTo(cx + Math.cos(vinkel) * (r - 20), cy + Math.sin(vinkel) * (r - 20));
        ctx.stroke();
        ctx.fillStyle = "#c1442e";
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();

        // digital tall
        ctx.fillStyle = "rgba(242,239,230,0.95)";
        ctx.font = "600 " + Math.max(11, Math.round(W * 0.035)) + "px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(Math.round(naa)).padStart(2, "0"), cx, cy + r * 0.55);
        ctx.fillStyle = "rgba(242,239,230,0.65)";
        ctx.font = "400 " + Math.max(7, Math.round(W * 0.017)) + "px ui-monospace, monospace";
        ctx.fillText("FART · 7 FJELL", cx, cy + r * 0.55 + Math.max(10, W * 0.028));

        naa += (maal - naa) * 0.07;
        if (Math.abs(maal - naa) < 0.15) naa = maal;
        ko = null;
        if (!redusert) ko = requestAnimationFrame(tegn);
      }

      function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
      function oppdater() {
        var y = window.scrollY || 0;
        var h = hero.offsetHeight || 1;
        var p = Math.min(1, Math.max(0, y / (h * 0.9)));
        maal = Math.round(p * 100);
        if (!redusert) onsk();
      }

      if (storrelse()) {
        oppdater();
        window.addEventListener("scroll", oppdater, { passive: true });
        window.addEventListener("resize", function () { if (storrelse()) tegn(performance.now()); });
        if (redusert) { naa = maal = 42; tegn(performance.now()); }
        if ("ResizeObserver" in window && !redusert) {
          new ResizeObserver(function () { if (storrelse()) onsk(); }).observe(lerret);
        }
      }
    }
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til didrik@7fjellbil.no, så svarer vi så raskt vi kan.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: salgssaker */
  var liste = document.getElementById("salgssaker");
  if (liste) {
    var saker = [
      { nr: "7F-221", kunde: "Silje Nygård", sted: "Nesttun", bil: "VW Golf 2017", status: "vurdert", inn: "Innbytte", sum: "142 000" },
      { nr: "7F-222", kunde: "Terje Aase", sted: "Fyllingsdalen", bil: "Toyota RAV4 2019", status: "bud", inn: "Raskt oppgjør", sum: "268 000" },
      { nr: "7F-223", kunde: "Marius Fosse", sted: "Bergen", bil: "BMW 320 2018", status: "ny", inn: "Formidlingssalg", sum: "—" },
      { nr: "7F-224", kunde: "Anne K. Holm", sted: "Loddefjord", bil: "Nissan Leaf 2020", status: "ny", inn: "Raskt oppgjør", sum: "—" },
      { nr: "7F-225", kunde: "Petter Lunde", sted: "Os", bil: "Skoda Octavia 2016", status: "solgt", inn: "Formidlingssalg", sum: "119 000" },
      { nr: "7F-226", kunde: "Ingrid Vik", sted: "Nesttun", bil: "Audi A4 2019", status: "vurdert", inn: "Innbytte", sum: "235 000" },
      { nr: "7F-227", kunde: "Knut Solberg", sted: "Bergen", bil: "Ford Focus 2015", status: "bud", inn: "Raskt oppgjør", sum: "78 000" },
      { nr: "7F-228", kunde: "Hanne Brekke", sted: "Fana", bil: "Volvo V60 2018", status: "solgt", inn: "Innbytte", sum: "249 000" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", vurdert: "Vurdert", bud: "Bud", solgt: "Solgt" };
    var rekkefolge = ["ny", "vurdert", "bud", "solgt"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", saker.length);
      sett("kpi-ny", saker.filter(function (s) { return s.status === "ny"; }).length);
      sett("kpi-bud", saker.filter(function (s) { return s.status === "bud"; }).length);
      sett("kpi-solgt", saker.filter(function (s) { return s.status === "solgt"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = saker.filter(function (s) { return filter === "alle" || s.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen saker i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (s) {
        var i = rekkefolge.indexOf(s.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = s.status === "ny" ? "Vurder" : s.status === "vurdert" ? "Registrer bud" : "Merk solgt";
        var knapp = s.status === "solgt"
          ? '<button class="knapp knapp--mork knapp--liten" data-sak="' + s.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-sak="' + s.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="sak' + (s.status === "solgt" ? " sak--solgt" : "") + '">' +
          '<div class="sak__topp"><span class="sak__nr">' + s.nr + "</span>" + stempel(s.status) + "</div>" +
          "<h3>" + s.bil + "</h3>" +
          '<div class="sak__meta"><span>' + s.kunde + "</span><span>" + s.sted + "</span><span>" + s.inn + "</span><span>Pris: " + s.sum + "</span></div>" +
          '<div class="sak__knapper">' + knapp + "</div>" +
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
      var b = e.target.closest("button[data-sak]");
      if (!b) return;
      var s = saker.find(function (x) { return x.nr === b.getAttribute("data-sak"); });
      if (!s) return;
      s.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(s.nr + " " + s.bil + " → " + statNavn[s.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 saker i kø.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
