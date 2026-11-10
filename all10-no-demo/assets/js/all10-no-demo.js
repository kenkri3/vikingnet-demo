/* ==========================================================================
   ALL10 Bemanning AS — all10-no-demo
   Canvas bemanningsplan: oppdragslinjer som fyller seg ved scroll.
   Tidslinje-meny, skjema og vaktpanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ bemanningsplan */
  var lerret = document.getElementById("plan");
  var boks = lerret ? lerret.parentElement : null;
  if (lerret && boks) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, naa = 0, maal = 0, ko = null;
      var rader = [
        { navn: "ELEKTRO", start: 0.04, lengde: 0.42, farge: "rgba(168,212,0,0.9)" },
        { navn: "BYGG", start: 0.22, lengde: 0.34, farge: "rgba(244,242,234,0.72)" },
        { navn: "INDUSTRI", start: 0.38, lengde: 0.46, farge: "rgba(168,212,0,0.62)" },
        { navn: "ELEKTRO", start: 0.52, lengde: 0.28, farge: "rgba(244,242,234,0.5)" },
        { navn: "BYGG", start: 0.66, lengde: 0.3, farge: "rgba(168,212,0,0.42)" },
        { navn: "INDUSTRI", start: 0.78, lengde: 0.18, farge: "rgba(244,242,234,0.34)" }
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
        var venstre = 0, hoyre = W;
        var radH = H / rader.length;
        var stolpe = radH * 0.5;
        // rutenett (uker)
        ctx.strokeStyle = "rgba(244,242,234,0.1)";
        ctx.lineWidth = 1;
        for (var u = 0; u <= 12; u++) {
          var x = venstre + (hoyre - venstre) * (u / 12);
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        // linjer
        for (var i = 0; i < rader.length; i++) {
          var r = rader[i];
          var y = i * radH + radH * 0.25;
          var x0 = venstre + (hoyre - venstre) * r.start;
          var w = (hoyre - venstre) * r.lengde * naa;
          ctx.fillStyle = "rgba(244,242,234,0.06)";
          ctx.fillRect(x0, y, (hoyre - venstre) * r.lengde, stolpe);
          ctx.fillStyle = r.farge;
          ctx.fillRect(x0, y, w, stolpe);
          // startmarkør
          ctx.fillStyle = "rgba(244,242,234,0.9)";
          ctx.fillRect(x0 - 1, y - 3, 2, stolpe + 6);
        }
        naa += (maal - naa) * 0.07;
        if (Math.abs(maal - naa) < 0.002) naa = maal;
        ko = null;
        if (naa !== maal && !redusert) ko = requestAnimationFrame(tegn);
      }
      function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
      function oppdater() {
        var r = boks.getBoundingClientRect();
        var vh = window.innerHeight || 800;
        maal = Math.min(1, Math.max(0, 1 - (r.top + r.height * 0.25) / (vh * 0.95)));
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 51 73 27 00 eller skriv til post@all10.no.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: vakter */
  var liste = document.getElementById("vakter");
  if (liste) {
    var vakter = [
      { nr: "AL-401", rolle: "Elektriker", sted: "Oslo", kunde: "Bygg", status: "aktiv", fra: "13.11", til: "20.12" },
      { nr: "AL-402", rolle: "Stillasbygger", sted: "Stavanger", kunde: "Industri", status: "tilbud", fra: "20.11", til: "15.01" },
      { nr: "AL-403", rolle: "Industrimekaniker", sted: "Haugesund", kunde: "Industri", status: "aktiv", fra: "10.11", til: "18.02" },
      { nr: "AL-404", rolle: "Elektriker", sted: "Bergen", kunde: "Bygg", status: "ny", fra: "01.12", til: "20.03" },
      { nr: "AL-405", rolle: "Hjelpearbeider", sted: "Karmsund", kunde: "Bygg", status: "ny", fra: "18.11", til: "22.12" },
      { nr: "AL-406", rolle: "Lærling elektro", sted: "Stavanger", kunde: "Service", status: "avsluttet", fra: "01.09", til: "01.11" },
      { nr: "AL-407", rolle: "Automasjonstekniker", sted: "Oslo", kunde: "Industri", status: "aktiv", fra: "04.11", til: "28.02" },
      { nr: "AL-408", rolle: "Tømrer", sted: "Haugesund", kunde: "Bygg", status: "avsluttet", fra: "15.08", til: "30.10" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", tilbud: "Tilbud", aktiv: "Aktiv", avsluttet: "Avsluttet" };
    var rekkefolge = ["ny", "tilbud", "aktiv", "avsluttet"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", vakter.length);
      sett("kpi-ny", vakter.filter(function (v) { return v.status === "ny"; }).length);
      sett("kpi-aktiv", vakter.filter(function (v) { return v.status === "aktiv"; }).length);
      sett("kpi-avsluttet", vakter.filter(function (v) { return v.status === "avsluttet"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = vakter.filter(function (v) { return filter === "alle" || v.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen vakter i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (v) {
        var i = rekkefolge.indexOf(v.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = v.status === "ny" ? "Send tilbud" : v.status === "tilbud" ? "Start vakt" : "Avslutt";
        var knapp = v.status === "avsluttet"
          ? '<button class="knapp knapp--mork knapp--liten" data-vakt="' + v.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-vakt="' + v.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="vakt__kort' + (v.status === "avsluttet" ? " vakt__kort--avsluttet" : "") + '">' +
          '<div class="vakt__topp"><span class="vakt__nr">' + v.nr + "</span>" + stempel(v.status) + "</div>" +
          "<h3>" + v.rolle + "</h3>" +
          '<div class="vakt__meta"><span>' + v.sted + "</span><span>" + v.kunde + "</span><span>" + v.fra + "–" + v.til + "</span></div>" +
          '<div class="vakt__knapper">' + knapp + "</div>" +
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
      var b = e.target.closest("button[data-vakt]");
      if (!b) return;
      var v = vakter.find(function (x) { return x.nr === b.getAttribute("data-vakt"); });
      if (!v) return;
      v.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(v.nr + " " + v.rolle + " → " + statNavn[v.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 vakter i systemet.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
