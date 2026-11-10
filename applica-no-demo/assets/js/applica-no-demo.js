/* ==========================================================================
   Applica Group — applica-no-demo
   Canvas maskinsyn: skannelinje og deteksjonsrammer med etiketter.
   Stripe-akkordeon, skjema og prosjektpanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ maskinsyn */
  var lerret = document.getElementById("syn");
  if (lerret) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, t = 0, ko = null, synlig = false;
      var objekter = [
        { x: 0.16, y: 0.42, w: 0.2, h: 0.26, navn: "KOMPONENT", tillit: 0.97 },
        { x: 0.46, y: 0.3, w: 0.15, h: 0.34, navn: "ENHET", tillit: 0.94 },
        { x: 0.68, y: 0.52, w: 0.18, h: 0.2, navn: "DEL", tillit: 0.88 }
      ];

      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 80 || H < 60) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }

      function tegn() {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        // bakgrunnsrutenett
        ctx.strokeStyle = "rgba(61,123,253,0.1)";
        ctx.lineWidth = 1;
        for (var gx = 0; gx <= W; gx += 28) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
        for (var gy = 0; gy <= H; gy += 28) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

        // skannelinje
        var sy = (t * 0.55) % 1 * H;
        var g = ctx.createLinearGradient(0, sy - 26, 0, sy + 26);
        g.addColorStop(0, "rgba(61,123,253,0)");
        g.addColorStop(0.5, "rgba(61,123,253,0.28)");
        g.addColorStop(1, "rgba(61,123,253,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, sy - 26, W, 52);
        ctx.strokeStyle = "rgba(126,166,255,0.75)";
        ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();

        // objekter + deteksjon
        for (var i = 0; i < objekter.length; i++) {
          var o = objekter[i];
          var x = o.x * W, y = o.y * H, w = o.w * W, h = o.h * H;
          var avslor = Math.min(1, Math.max(0, (t * 0.35 + i * 0.14) % 1.6));
          var syn = Math.min(1, avslor * 1.6);
          // form
          ctx.fillStyle = "rgba(232,238,242," + (0.06 + syn * 0.05) + ")";
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = "rgba(232,238,242," + (0.14 + syn * 0.16) + ")";
          ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
          if (syn > 0.35) {
            // ramme
            ctx.strokeStyle = "rgba(61,123,253," + Math.min(1, syn) + ")";
            ctx.lineWidth = 1.4;
            var l = 9;
            // hjørner
            ctx.beginPath();
            ctx.moveTo(x, y + l); ctx.lineTo(x, y); ctx.lineTo(x + l, y);
            ctx.moveTo(x + w - l, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + l);
            ctx.moveTo(x + w, y + h - l); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - l, y + h);
            ctx.moveTo(x + l, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - l);
            ctx.stroke();
            // etikett
            var tekst = o.navn + " " + o.tillit.toFixed(2);
            ctx.font = "600 9px ui-monospace, monospace";
            var tw = ctx.measureText(tekst).width;
            ctx.fillStyle = "rgba(61,123,253," + Math.min(0.95, syn) + ")";
            ctx.fillRect(x, y - 14, tw + 10, 14);
            ctx.fillStyle = "#fff";
            ctx.fillText(tekst, x + 5, y - 4);
          }
        }

        // live-markør
        if (Math.floor(t * 1.4) % 2 === 0) {
          ctx.fillStyle = "rgba(61,123,253,0.95)";
          ctx.beginPath(); ctx.arc(W - 18, 16, 4, 0, Math.PI * 2); ctx.fill();
        }
        t += 0.006;
        ko = requestAnimationFrame(tegn);
      }

      function start() { if (!ko && !redusert) ko = requestAnimationFrame(tegn); }
      function stopp() { if (ko) { cancelAnimationFrame(ko); ko = null; } }

      if (storrelse()) {
        if (redusert) {
          t = 2.4;
          tegn();
          if (ko) { cancelAnimationFrame(ko); ko = null; }
        } else if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (o) {
            synlig = o[0].isIntersecting;
            if (synlig) start(); else stopp();
          }, { threshold: 0.01 }).observe(lerret);
        } else start();
        window.addEventListener("resize", function () { if (storrelse() && redusert) { t = 2.4; tegn(); } });
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 38 25 87 77 eller skriv til info@applica.no.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: prosjekter */
  var liste = document.getElementById("prosjekter");
  if (liste) {
    var prosjekter = [
      { nr: "AP-071", oppdrag: "Maskinsynscelle for sortering", selskap: "Robot Integration", sted: "Lindesnes", status: "aktiv", fase: "Testing" },
      { nr: "AP-072", oppdrag: "EMC-test av styreenhet", selskap: "Test & Certification", sted: "Mandal", status: "aktiv", fase: "Måling" },
      { nr: "AP-073", oppdrag: "Programvare for produksjonslinje", selskap: "Consulting", sted: "Stavanger", status: "tilbud", fase: "Tilbud sendt" },
      { nr: "AP-074", oppdrag: "Sertifisering av alarmsystem", selskap: "Test & Certification", sted: "Mandal", status: "levert", fase: "Sertifikat utstedt" },
      { nr: "AP-075", oppdrag: "Rekruttering av utviklerteam", selskap: "Consulting", sted: "Oslo", status: "ny", fase: "Venter krav" },
      { nr: "AP-076", oppdrag: "Infra-kartlegging", selskap: "Infra", sted: "Kristiansand", status: "ny", fase: "Venter befaring" },
      { nr: "AP-077", oppdrag: "Robotcelle for pallhåndtering", selskap: "Robot Integration", sted: "Lindesnes", status: "aktiv", fase: "Idriftsettelse" },
      { nr: "AP-078", oppdrag: " Luftmålinger i produksjonslokale", selskap: "Test & Certification", sted: "Mandal", status: "levert", fase: "Rapport levert" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", tilbud: "Tilbud", aktiv: "Aktiv", levert: "Levert" };
    var rekkefolge = ["ny", "tilbud", "aktiv", "levert"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", prosjekter.length);
      sett("kpi-ny", prosjekter.filter(function (p) { return p.status === "ny"; }).length);
      sett("kpi-aktiv", prosjekter.filter(function (p) { return p.status === "aktiv"; }).length);
      sett("kpi-levert", prosjekter.filter(function (p) { return p.status === "levert"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = prosjekter.filter(function (p) { return filter === "alle" || p.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen prosjekter i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (p) {
        var i = rekkefolge.indexOf(p.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = p.status === "ny" ? "Send tilbud" : p.status === "tilbud" ? "Start prosjekt" : "Merk levert";
        var knapp = p.status === "levert"
          ? '<button class="knapp knapp--mork knapp--liten" data-pro="' + p.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-pro="' + p.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="prosjekt__kort' + (p.status === "levert" ? " prosjekt__kort--levert" : "") + '">' +
          '<div class="prosjekt__topp"><span class="prosjekt__nr">' + p.nr + "</span>" + stempel(p.status) + "</div>" +
          "<h3>" + p.oppdrag + "</h3>" +
          '<div class="prosjekt__meta"><span>' + p.selskap + "</span><span>" + p.sted + "</span><span>" + p.fase + "</span></div>" +
          '<div class="prosjekt__knapper">' + knapp + "</div>" +
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
      var b = e.target.closest("button[data-pro]");
      if (!b) return;
      var p = prosjekter.find(function (x) { return x.nr === b.getAttribute("data-pro"); });
      if (!p) return;
      p.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(p.nr + " " + p.oppdrag + " → " + statNavn[p.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 prosjekter i systemet.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
