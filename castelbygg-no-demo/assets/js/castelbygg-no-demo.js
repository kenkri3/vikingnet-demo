/* ==========================================================================
   Castel Bygg — castelbygg-no-demo
   Canvas stillas: reiser seg lag for lag ved scroll.
   Stigemeny, skjema og prosjektpanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var lerret = document.getElementById("stillas");
  if (lerret) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, naa = 0, maal = 0, ko = null;

      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 80 || H < 80) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }

      function tegn() {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        var marg = W * 0.08;
        var bredde = W - marg * 2;
        var hoyde = H - 30;
        var plan = 5;
        // stolper
        ctx.strokeStyle = "rgba(244,241,233,0.5)";
        ctx.lineWidth = 1.6;
        var antStolper = 4;
        for (var s = 0; s <= antStolper; s++) {
          var x = marg + (bredde / antStolper) * s;
          ctx.beginPath(); ctx.moveTo(x, 16); ctx.lineTo(x, 16 + hoyde * naa); ctx.stroke();
        }
        // horisontale plan som vokser
        for (var p = 0; p <= plan; p++) {
          var f = p / plan;
          var y = 16 + hoyde * f;
          var syn = Math.max(0, Math.min(1, naa * (plan + 1) - p));
          if (syn <= 0) continue;
          ctx.strokeStyle = "rgba(182,196,140," + (0.35 + 0.5 * syn).toFixed(2) + ")";
          ctx.lineWidth = p % 2 === 0 ? 2 : 1.2;
          ctx.beginPath();
          ctx.moveTo(marg, y);
          ctx.lineTo(marg + bredde * syn, y);
          ctx.stroke();
          // knutepunkt
          for (var k = 0; k <= antStolper; k++) {
            var kx = marg + (bredde / antStolper) * k;
            if (kx > marg + bredde * syn) continue;
            ctx.fillStyle = "rgba(182,196,140,0.9)";
            ctx.fillRect(kx - 1.5, y - 1.5, 3, 3);
          }
        }
        // diagonal avstiving
        ctx.strokeStyle = "rgba(244,241,233,0.18)";
        ctx.lineWidth = 1;
        for (var d = 0; d < 3; d++) {
          var y0 = 16 + hoyde * (d / plan), y1 = 16 + hoyde * ((d + 1) / plan);
          if (y1 > 16 + hoyde * naa) break;
          var x0 = marg + (bredde / 3) * (d % 2 === 0 ? 0 : 1);
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + bredde / 3, y1); ctx.stroke();
        }

        naa += (maal - naa) * 0.07;
        if (Math.abs(maal - naa) < 0.002) naa = maal;
        ko = null;
        if (naa !== maal && !redusert) ko = requestAnimationFrame(tegn);
      }
      function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
      function oppdater() {
        var r = lerret.getBoundingClientRect();
        var vh = window.innerHeight || 800;
        maal = Math.min(1, Math.max(0, 1 - (r.top + r.height * 0.15) / (vh * 0.85)));
        if (redusert) { naa = maal = 1; tegn(); } else onsk();
      }
      if (storrelse()) {
        oppdater();
        window.addEventListener("scroll", oppdater, { passive: true });
        window.addEventListener("resize", function () { if (storrelse()) tegn(); });
        if (redusert) { naa = maal = 1; tegn(); }
      }
    }
  }

  document.querySelectorAll("[data-mobil]").forEach(function (kn) {
    var liste = document.getElementById(kn.getAttribute("aria-controls"));
    if (!liste) return;
    kn.addEventListener("click", function () {
      var aapen = kn.getAttribute("aria-expanded") === "true";
      kn.setAttribute("aria-expanded", aapen ? "false" : "true");
      liste.setAttribute("data-aapen", aapen ? "false" : "true");
    });
    liste.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        liste.setAttribute("data-aapen", "false");
        kn.setAttribute("aria-expanded", "false");
      });
    });
  });

  var avslor = document.querySelectorAll(".avslor");
  if (avslor.length && "IntersectionObserver" in window && !redusert) {
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("er-inne"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    avslor.forEach(function (el) { io.observe(el); });
  } else { avslor.forEach(function (el) { el.classList.add("er-inne"); }); }

  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var svar = form.querySelector(".skjema__svar");
      var navn = form.querySelector("#navn");
      if (svar) {
        svar.innerHTML = "<b>Takk" + (navn && navn.value ? ", " + navn.value.split(" ")[0] : "") + "!</b>" +
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 934 90 848 eller skriv til post@castelbygg.no.";
        svar.classList.add("vis"); svar.setAttribute("tabindex", "-1"); svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  var liste = document.getElementById("prosjekter");
  if (liste) {
    var prosjekter = [
      { nr: "CA-701", oppdrag: "Påbygg enebolig", sted: "Asker", type: "Påbygg", status: "paagaar", fase: "Reisverk" },
      { nr: "CA-702", oppdrag: "Totalrenovering", sted: "Bærum", type: "Renovering", status: "tilbud", fase: "Tilbud sendt" },
      { nr: "CA-703", oppdrag: "Rehabilitering av våtrom", sted: "Oslo", type: "Rehab", status: "paagaar", fase: "Flis" },
      { nr: "CA-704", oppdrag: "Entreprise nybygg", sted: "Lillestrøm", type: "Entreprise", status: "ny", fase: "Befaring" },
      { nr: "CA-705", oppdrag: "Eiendomsutvikling tomt", sted: "Asker", type: "Utvikling", status: "ny", fase: "Kartlegging" },
      { nr: "CA-706", oppdrag: "Tilbygg garasje", sted: "Bærum", type: "Tilbygg", status: "levert", fase: "Ferdig" },
      { nr: "CA-707", oppdrag: "Oppgradering av kjeller", sted: "Oslo", type: "Renovering", status: "levert", fase: "Ferdig" },
      { nr: "CA-708", oppdrag: "Rehabilitering av fasade", sted: "Drammen", type: "Rehab", status: "paagaar", fase: "Kledning" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", tilbud: "Tilbud", paagaar: "Pågår", levert: "Levert" };
    var rekkefolge = ["ny", "tilbud", "paagaar", "levert"];
    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", prosjekter.length);
      sett("kpi-tilbud", prosjekter.filter(function (p) { return p.status === "tilbud"; }).length);
      sett("kpi-paagaar", prosjekter.filter(function (p) { return p.status === "paagaar"; }).length);
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
          '<div class="prosjekt__meta"><span>' + p.sted + "</span><span>" + p.type + "</span><span>" + p.fase + "</span></div>" +
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
