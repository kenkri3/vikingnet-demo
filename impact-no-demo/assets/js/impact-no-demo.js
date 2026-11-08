/* ==========================================================================
   Impact AS — impact-no-demo
   Canvas flowfield: partikkelstrøm som bøyer av mot pekeren.
   Horisontal scroll-stripe (ren CSS), panel for pipeline og tilbud.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------- flowfield */
  var lerret = document.getElementById("felt");
  var hero = document.querySelector(".hero");
  if (lerret && hero) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var dpr = 1, W = 0, H = 0, partikler = [], peker = { x: -999, y: -999, aktiv: false };
      var ROD = "226,64,31", LYS = "243,240,234";

      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth || hero.clientWidth;
        H = lerret.clientHeight || hero.clientHeight;
        lerret.width = Math.round(W * dpr);
        lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bygg();
      }

      function bygg() {
        var antall = Math.min(900, Math.max(220, Math.round((W * H) / 1900)));
        partikler = [];
        for (var i = 0; i < antall; i++) {
          partikler.push({
            x: Math.random() * W,
            y: Math.random() * H,
            alder: Math.random() * 200,
            fart: 0.5 + Math.random() * 1.1,
            farge: Math.random() < 0.24 ? ROD : LYS
          });
        }
      }

      function retning(x, y, t) {
        var a = Math.sin(x * 0.0042 + t * 0.00013) * 1.5 +
                Math.cos(y * 0.0055 - t * 0.00009) * 1.4 +
                Math.sin((x + y) * 0.0016) * 0.9;
        if (peker.aktiv) {
          var dx = peker.x - x, dy = peker.y - y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 62000 && d2 > 1) {
            var d = Math.sqrt(d2);
            var tyngde = (1 - d / 249) * 1.9;
            a += Math.atan2(dy, dx) * tyngde * 0.5;
          }
        }
        return a;
      }

      function tegn(t) {
        ctx.fillStyle = "rgba(16,16,16,0.058)";
        ctx.fillRect(0, 0, W, H);
        ctx.lineWidth = 1;
        for (var i = 0; i < partikler.length; i++) {
          var p = partikler[i];
          var a = retning(p.x, p.y, t);
          var nx = p.x + Math.cos(a) * p.fart;
          var ny = p.y + Math.sin(a) * p.fart;
          ctx.strokeStyle = "rgba(" + p.farge + ",0.72)";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          p.x = nx; p.y = ny;
          p.alder++;
          if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20 || p.alder > 620) {
            p.x = Math.random() * W; p.y = Math.random() * H; p.alder = 0;
          }
        }
        if (!redusert) raf = requestAnimationFrame(tegn);
      }

      var raf = null;
      function start() { if (!raf) raf = requestAnimationFrame(tegn); }
      function stopp() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

      storrelse();
      window.addEventListener("resize", function () { ctx.clearRect(0, 0, W, H); storrelse(); if (redusert) { tegn(0); } });
      hero.addEventListener("pointermove", function (e) {
        var r = lerret.getBoundingClientRect();
        peker.x = e.clientX - r.left; peker.y = e.clientY - r.top; peker.aktiv = true;
      }, { passive: true });
      hero.addEventListener("pointerleave", function () { peker.aktiv = false; peker.x = -999; peker.y = -999; });

      if (redusert) {
        ctx.fillStyle = "#101010"; ctx.fillRect(0, 0, W, H);
        for (var k = 0; k < 40; k++) tegn(k * 40);
      } else {
        start();
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (e) {
            if (e[0].isIntersecting) start(); else stopp();
          }, { threshold: 0 }).observe(hero);
        }
        document.addEventListener("visibilitychange", function () {
          if (document.hidden) stopp(); else start();
        });
      }
    }
  }

  /* -------------------------------------------------- avsløring */
  var avslor = document.querySelectorAll(".avslor");
  if (avslor.length && "IntersectionObserver" in window && !redusert) {
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("er-inne"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.05 });
    avslor.forEach(function (el) { io.observe(el); });
  } else {
    avslor.forEach(function (el) { el.classList.add("er-inne"); });
  }

  /* -------------------------------------------------- skjema */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var svar = form.querySelector(".skjema__svar");
      var navn = form.querySelector("#navn");
      if (svar) {
        svar.innerHTML = "<b>Takk" + (navn && navn.value ? ", " + navn.value.split(" ")[0] : "") + "!</b>" +
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 23 06 70 50 eller skriv til firmapost@impact.no, så tar vi kontakt.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* -------------------------------------------------- panel: pipeline */
  var liste = document.getElementById("pipeline");
  if (liste) {
    var saker = [
      { id: "IMP-118", stilling: "Kjededirektør bademiljø", kunde: "Bademiljø AS", kandidat: "Kandidat A", fase: "tilbud", verdi: 185000, neste: "Sluttintervju torsdag" },
      { id: "IMP-121", stilling: "General manager", kunde: "Optronics Technology AS", kandidat: "Kandidat B", fase: "samtale", verdi: 210000, neste: "Førsteintervju i dag 13:00" },
      { id: "IMP-119", stilling: "Produktsjef bygg", kunde: "Würth Norge AS", kandidat: "Kandidat C", fase: "samtale", verdi: 165000, neste: "Referansesjekk" },
      { id: "IMP-122", stilling: "Rekrutteringsrådgiver / partner", kunde: "IMPACT AS", kandidat: "Kandidat D", fase: "ny", verdi: 150000, neste: "Screening av 12 søknader" },
      { id: "IMP-116", stilling: "Økonomisjef", kunde: "Nordvika AS", kandidat: "Kandidat E", fase: "tilbud", verdi: 140000, neste: "Tilbud sendt i går" },
      { id: "IMP-113", stilling: "HR-sjef", kunde: "Fjordkraft konsern", kandidat: "Kandidat F", fase: "ansatt", verdi: 120000, neste: "Tiltrådt 1. november" },
      { id: "IMP-123", stilling: "Salgssjef", kunde: "Tangen Gruppen", kandidat: "Kandidat G", fase: "ny", verdi: 155000, neste: "Kartlegging av behov" },
      { id: "IMP-120", stilling: "Daglig leder", kunde: "Sørlandet Marina", kandidat: "Kandidat H", fase: "tilbud", verdi: 175000, neste: "Kontrakt til gjennomlesing" }
    ];
    var filter = "alle";
    var faser = ["ny", "samtale", "tilbud", "ansatt"];
    var navnFase = { ny: "Ny", samtale: "Samtale", tilbud: "Tilbud", ansatt: "Ansatt" };

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-saker", saker.length);
      sett("kpi-samtale", saker.filter(function (s) { return s.fase === "samtale"; }).length);
      sett("kpi-tilbud", saker.filter(function (s) { return s.fase === "tilbud"; }).length);
      sett("kpi-ansatt", saker.filter(function (s) { return s.fase === "ansatt"; }).length);
      var sum = saker.filter(function (s) { return s.fase !== "ansatt"; }).reduce(function (a, s) { return a + s.verdi; }, 0);
      sett("kpi-verdi", sum.toLocaleString("nb-NO") + " kr");
    }
    function tegn() {
      var vis = saker.filter(function (s) { return filter === "alle" || s.fase === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen saker i denne fasen.</div>'; return; }
      liste.innerHTML = vis.map(function (s) {
        var i = faser.indexOf(s.fase);
        var neste = faser[Math.min(i + 1, faser.length - 1)];
        var knapp = s.fase === "ansatt"
          ? '<button class="knapp knapp--mork knapp--liten" data-sak="' + s.id + '" data-til="ny">Start på nytt</button>'
          : '<button class="knapp knapp--liten" data-sak="' + s.id + '" data-til="' + neste + '">Flytt til neste steg</button>';
        return '<article class="sak' + (s.fase === "ansatt" ? " sak--ansatt" : "") + '">' +
          '<div class="sak__topp"><span class="sak__tid">' + s.id + '</span><span class="stempel stempel--' + s.fase + '">' + navnFase[s.fase] + "</span></div>" +
          "<h3>" + s.stilling + "</h3>" +
          '<div class="sak__meta"><span>' + s.kunde + "</span><span>" + s.kandidat + "</span><span>" + s.neste + "</span></div>" +
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
      var s = saker.find(function (x) { return x.id === b.getAttribute("data-sak"); });
      if (!s) return;
      s.fase = b.getAttribute("data-til");
      kpi(); tegn();
      noter(s.id + " " + s.stilling + " → " + navnFase[s.fase]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 saker i pipeline.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
