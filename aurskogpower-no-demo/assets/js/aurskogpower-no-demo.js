/* ==========================================================================
   Aurskog Power AS — aurskogpower-no-demo
   Canvas lastkurve: effektbehov tegnes opp ved scroll.
   Batteristripe, skjema og anleggspanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ lastkurve */
  var lerret = document.getElementById("last");
  var boks = lerret ? lerret.parentElement : null;
  if (lerret && boks) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, naa = 0, maal = 0, ko = null;
      // effektkurve: normaldrift, topp, utfall, reservekraft
      var punkter = [0.32, 0.3, 0.34, 0.31, 0.5, 0.62, 0.55, 0.36, 0.12, 0.08, 0.18, 0.34, 0.4, 0.36, 0.33, 0.31];

      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 80 || H < 60) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }
      function yFor(v) { return H - 18 - v * (H - 40); }

      function tegn() {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        // rutenett
        ctx.strokeStyle = "rgba(241,243,242,0.08)";
        ctx.lineWidth = 1;
        for (var i = 0; i <= 4; i++) {
          var y = 14 + (H - 36) * (i / 4);
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        for (var j = 0; j <= 8; j++) {
          var x = (W - 4) * (j / 8) + 2;
          ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, H - 16); ctx.stroke();
        }
        // kurve opp til naa
        var n = punkter.length;
        var synlig = naa * (n - 1);
        var steg = W / (n - 1);
        ctx.beginPath();
        ctx.moveTo(0, yFor(punkter[0]));
        for (var k = 1; k < n; k++) {
          var t = Math.min(1, Math.max(0, synlig - k + 1));
          if (t <= 0) break;
          var x0 = (k - 1) * steg, x1 = k * steg;
          var y0 = yFor(punkter[k - 1]), y1 = yFor(punkter[k]);
          ctx.lineTo(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
        }
        ctx.strokeStyle = "#f2c200";
        ctx.lineWidth = 2;
        ctx.stroke();
        // områdefyll
        ctx.lineTo(Math.min(W, synlig * steg), H - 16);
        ctx.lineTo(0, H - 16);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(242,194,0,0.22)");
        g.addColorStop(1, "rgba(242,194,0,0.01)");
        ctx.fillStyle = g;
        ctx.fill();
        // utfallsone
        var ux = 8 * steg, ux2 = 10 * steg;
        ctx.fillStyle = "rgba(224,90,60,0.12)";
        ctx.fillRect(ux, 10, ux2 - ux, H - 26);
        ctx.font = "500 7.5px ui-monospace, monospace";
        ctx.fillStyle = "rgba(241,243,242,0.55)";
        ctx.fillText("RESERVEKRAFT", ux + 4, 20);
        // markør
        var mx = Math.min(W, synlig * steg), my = yFor(punkter[Math.min(n - 1, Math.round(synlig))] || punkter[0]);
        ctx.fillStyle = "#f2c200";
        ctx.beginPath(); ctx.arc(mx, my, 3.4, 0, Math.PI * 2); ctx.fill();

        naa += (maal - naa) * 0.05;
        if (Math.abs(maal - naa) < 0.002) naa = maal;
        ko = null;
        if (naa !== maal && !redusert) ko = requestAnimationFrame(tegn);
      }
      function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
      function oppdater() {
        var r = boks.getBoundingClientRect();
        var vh = window.innerHeight || 800;
        maal = Math.min(1, Math.max(0, 1 - (r.top + r.height * 0.2) / (vh * 0.9)));
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 93 08 38 32 eller skriv til tcm@aurskogpower.no.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: anlegg */
  var liste = document.getElementById("anlegg");
  if (liste) {
    var anlegg = [
      { nr: "AP-501", kunde: "Datasenter Øst", sted: "Lillestrøm", type: "UPS 80 kVA", status: "paagaar", fase: "Installasjon" },
      { nr: "AP-502", kunde: "Industri Vest", sted: "Drammen", type: "Likeretter", status: "kontroll", fase: "Årskontroll" },
      { nr: "AP-503", kunde: "Nettstasjon", sted: "Aurskog", type: "Batterianlegg", status: "paagaar", fase: "Idriftsettelse" },
      { nr: "AP-504", kunde: "Brannstasjon", sted: "Fetsund", type: "Nødstrøm", status: "ny", fase: "Befaring" },
      { nr: "AP-505", kunde: "Sykehus", sted: "Oslo", type: "UPS 200 kVA", status: "kontroll", fase: "Service" },
      { nr: "AP-506", kunde: "Garasjeanlegg", sted: "Lørenskog", type: "Strømaggregat", status: "levert", fase: "Overtatt" },
      { nr: "AP-507", kunde: "Bryggeri", sted: "Ski", type: "Batteriretur", status: "levert", fase: "Hentet" },
      { nr: "AP-508", kunde: "Kommunal bygg", sted: "Aurskog", type: "UPS 20 kVA", status: "ny", fase: "Tilbud" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", kontroll: "Kontroll", paagaar: "Pågår", levert: "Levert" };
    var rekkefolge = ["ny", "kontroll", "paagaar", "levert"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", anlegg.length);
      sett("kpi-kontroll", anlegg.filter(function (a) { return a.status === "kontroll"; }).length);
      sett("kpi-paagaar", anlegg.filter(function (a) { return a.status === "paagaar"; }).length);
      sett("kpi-levert", anlegg.filter(function (a) { return a.status === "levert"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = anlegg.filter(function (a) { return filter === "alle" || a.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen anlegg i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (a) {
        var i = rekkefolge.indexOf(a.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = a.status === "ny" ? "Send tilbud" : a.status === "kontroll" ? "Start service" : "Merk levert";
        var knapp = a.status === "levert"
          ? '<button class="knapp knapp--mork knapp--liten" data-anlegg="' + a.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-anlegg="' + a.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="anlegg__kort' + (a.status === "levert" ? " anlegg__kort--levert" : "") + '">' +
          '<div class="anlegg__topp"><span class="anlegg__nr">' + a.nr + "</span>" + stempel(a.status) + "</div>" +
          "<h3>" + a.kunde + "</h3>" +
          '<div class="anlegg__meta"><span>' + a.sted + "</span><span>" + a.type + "</span><span>" + a.fase + "</span></div>" +
          '<div class="anlegg__knapper">' + knapp + "</div>" +
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
      var b = e.target.closest("button[data-anlegg]");
      if (!b) return;
      var a = anlegg.find(function (x) { return x.nr === b.getAttribute("data-anlegg"); });
      if (!a) return;
      a.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(a.nr + " " + a.kunde + " → " + statNavn[a.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 anlegg i systemet.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
