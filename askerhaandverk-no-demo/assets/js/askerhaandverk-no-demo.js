/* ==========================================================================
   Asker Håndverk Bolig AS — askerhaandverk-no-demo
   CSS 3D-hus som settes sammen ved scroll. Trappetrinn-meny, skjema, salgspanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ 3D-hus */
  var hus = document.querySelector(".hus");
  if (hus) {
    var indre = hus.querySelector(".hus__indre");
    var grunn = hus.querySelector(".hus__lag--grunn");
    var vegg = hus.querySelector(".hus__lag--vegg");
    var tak = hus.querySelector(".hus__lag--tak");
    var naa = 0, maal = 0, ko = null;

    function tegn() {
      ko = null;
      naa += (maal - naa) * 0.09;
      if (Math.abs(maal - naa) < 0.002) naa = maal;
      var p = naa;
      if (indre) indre.style.transform = "rotateX(" + (58 - p * 8).toFixed(1) + "deg) rotateZ(" + (45 + p * 6).toFixed(1) + "deg) scale(" + (0.86 + p * 0.06).toFixed(3) + ")";
      if (grunn) grunn.style.transform = "translateZ(" + (0 + (1 - p) * 0).toFixed(1) + "px)";
      if (vegg) vegg.style.transform = "translateZ(" + (20 + (1 - p) * 40).toFixed(1) + "px)";
      if (tak) tak.style.transform = "translateZ(" + (44 + (1 - p) * 76).toFixed(1) + "px)";
      if (maal !== naa && !redusert) ko = requestAnimationFrame(tegn);
    }
    function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
    function oppdater() {
      var r = hus.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      maal = Math.min(1, Math.max(0, 1 - (r.top + r.height * 0.3) / (vh * 0.92)));
      if (redusert) { naa = maal = 1; tegn(); } else onsk();
    }
    oppdater();
    window.addEventListener("scroll", oppdater, { passive: true });
    window.addEventListener("resize", oppdater);
    if (redusert) { naa = maal = 1; tegn(); }
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 958 01 043 eller skriv til asker@boligpartner.no.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: boligsalg */
  var liste = document.getElementById("salg");
  if (liste) {
    var saker = [
      { nr: "AH-101", kunde: "Familie Berg", sted: "Asker", type: "Enebolig · Moderne", status: "bygging", fase: "Reisverk" },
      { nr: "AH-102", kunde: "Hansen", sted: "Bærum", type: "Enebolig · Funkis", status: "befaring", fase: "Tomt klar" },
      { nr: "AH-103", kunde: "Familie Lie", sted: "Lier", type: "Enebolig · Nostalgi", status: "bygging", fase: "Innvendig" },
      { nr: "AH-104", kunde: "Sørensen", sted: "Asker", type: "Tomannsbolig", status: "ny", fase: "Første samtale" },
      { nr: "AH-105", kunde: "Familie Aas", sted: "Bærum", type: "Enebolig · Herskapelig", status: "ny", fase: "Første samtale" },
      { nr: "AH-106", kunde: "Møller", sted: "Asker", type: "Enebolig · Moderne", status: "overtatt", fase: "Overtatt" },
      { nr: "AH-107", kunde: "Familie Dahl", sted: "Lier", type: "Flermannsbolig", status: "bygging", fase: "Grunnmur" },
      { nr: "AH-108", kunde: "Nilsen", sted: "Bærum", type: "Enebolig · Funkis", status: "overtatt", fase: "Overtatt" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", befaring: "Befaring", bygging: "Bygging", overtatt: "Overtatt" };
    var rekkefolge = ["ny", "befaring", "bygging", "overtatt"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", saker.length);
      sett("kpi-ny", saker.filter(function (s) { return s.status === "ny"; }).length);
      sett("kpi-bygging", saker.filter(function (s) { return s.status === "bygging"; }).length);
      sett("kpi-overtatt", saker.filter(function (s) { return s.status === "overtatt"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = saker.filter(function (s) { return filter === "alle" || s.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen saker i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (s) {
        var i = rekkefolge.indexOf(s.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = s.status === "ny" ? "Book befaring" : s.status === "befaring" ? "Start bygging" : "Merk overtatt";
        var knapp = s.status === "overtatt"
          ? '<button class="knapp knapp--mork knapp--liten" data-sak="' + s.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-sak="' + s.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="salg__kort' + (s.status === "overtatt" ? " salg__kort--overtatt" : "") + '">' +
          '<div class="salg__topp"><span class="salg__nr">' + s.nr + "</span>" + stempel(s.status) + "</div>" +
          "<h3>" + s.kunde + "</h3>" +
          '<div class="salg__meta"><span>' + s.sted + "</span><span>" + s.type + "</span><span>" + s.fase + "</span></div>" +
          '<div class="salg__knapper">' + knapp + "</div>" +
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
      noter(s.nr + " " + s.kunde + " → " + statNavn[s.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 saker i systemet.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
