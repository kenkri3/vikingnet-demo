/* ==========================================================================
   INNVI Home — innvihome-no-demo
   CSS 3D rom-parallax: scene med perspektiv, lag i ulikt dyp som skyves
   ulikt ved scroll. Nummerert innholdsfortegnelse markerer aktiv side.
   Panel: ordrer og leveranse.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ 3D-rom ved scroll */
  var rom = document.querySelector(".rom");
  if (rom && !redusert) {
    var scene = rom.querySelector(".rom__scene");
    var ko = null;
    function tegn() {
      ko = null;
      var y = window.scrollY || window.pageYOffset || 0;
      var h = rom.offsetHeight || 1;
      var p = Math.min(Math.max(y / h, 0), 1.4);
      rom.style.setProperty("--dy", String(Math.round(p * 320)));
      if (scene) {
        scene.style.transform = "rotateX(" + (p * 2.4).toFixed(2) + "deg) translate3d(0," + (p * -18).toFixed(1) + "px,0)";
        scene.style.opacity = String(Math.max(0.35, 1 - p * 0.5));
      }
    }
    function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
    tegn();
    window.addEventListener("scroll", onsk, { passive: true });
    window.addEventListener("resize", onsk);
  }

  /* ------------------------------------------------ avsløring */
  var avslor = document.querySelectorAll(".avslor");
  if (avslor.length && "IntersectionObserver" in window && !redusert) {
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("er-inne"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.05 });
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til post@innvihome.no, så tar vi kontakt.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: ordrer */
  var liste = document.getElementById("ordreliste");
  if (liste) {
    var ordrer = [
      { nr: "IN-2451", kunde: "Grethe Johansen", sted: "Porsgrunn", produkt: "AP1 luftrenser", antall: 1, verdi: 8990, status: "bestilt", lev: "Torsdag" },
      { nr: "IN-2452", kunde: "Kari Lunde", sted: "Skien", produkt: "AP2 Mini luftrenser", antall: 2, verdi: 4990, status: "bestilt", lev: "Fredag" },
      { nr: "IN-2453", kunde: "Bjørn Johansen", sted: "Porsgrunn", produkt: "AP4 luftrenser/fukter", antall: 1, verdi: 14990, status: "pakket", lev: "Torsdag" },
      { nr: "IN-2454", kunde: "Lillian Sunde", sted: "Larvik", produkt: "HEYM Frame", antall: 1, verdi: 6990, status: "sendt", lev: "I dag" },
      { nr: "IN-2455", kunde: "Thora Nilsen", sted: "Sandefjord", produkt: "S115 Premium støvsuger", antall: 1, verdi: 5990, status: "levert", lev: "Levert" },
      { nr: "IN-2456", kunde: "Anne Bjørk", sted: "Tønsberg", produkt: "Evomax", antall: 1, verdi: 7490, status: "pakket", lev: "Fredag" },
      { nr: "IN-2457", kunde: "Ole Rusten", sted: "Porsgrunn", produkt: "AP4 luftrenser/fukter", antall: 1, verdi: 14990, status: "sendt", lev: "I morgen" },
      { nr: "IN-2458", kunde: "Ida Solberg", sted: "Skien", produkt: "AP2 Mini luftrenser", antall: 3, verdi: 4990, status: "bestilt", lev: "Neste uke" }
    ];
    var filter = "alle";
    var steg = ["bestilt", "pakket", "sendt", "levert"];
    var navnStat = { bestilt: "Bestilt", pakket: "Pakket", sendt: "Sendt", levert: "Levert" };

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-ordre", ordrer.length);
      sett("kpi-pakke", ordrer.filter(function (o) { return o.status === "bestilt"; }).length);
      sett("kpi-ute", ordrer.filter(function (o) { return o.status === "sendt"; }).length);
      sett("kpi-levert", ordrer.filter(function (o) { return o.status === "levert"; }).length);
      var sum = ordrer.reduce(function (a, o) { return a + o.verdi * o.antall; }, 0);
      sett("kpi-verdi", sum.toLocaleString("nb-NO") + " kr");
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + navnStat[s] + "</span>"; }
    function tegn() {
      var vis = ordrer.filter(function (o) { return filter === "alle" || o.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen ordrer i dette utvalget akkurat nå.</div>'; return; }
      liste.innerHTML = vis.map(function (o) {
        var neste = steg[Math.min(steg.indexOf(o.status) + 1, steg.length - 1)];
        var knapp = o.status === "levert"
          ? '<button class="knapp knapp--lys knapp--liten" data-ordre="' + o.nr + '" data-til="bestilt">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-ordre="' + o.nr + '" data-til="' + neste + '">Oppdater status</button>';
        return '<article class="ordre' + (o.status === "levert" ? " ordre--levert" : "") + '">' +
          '<div class="ordre__topp"><span class="ordre__nr">' + o.nr + "</span>" + stempel(o.status) + "</div>" +
          "<h3>" + o.produkt + "</h3>" +
          '<div class="ordre__meta"><span>' + o.kunde + "</span><span>" + o.sted + "</span><span>" + o.antall + " stk</span><span>Levering: " + o.lev + "</span></div>" +
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
      var til = b.getAttribute("data-til");
      o.status = til;
      if (til === "levert") o.lev = "Levert";
      kpi(); tegn();
      noter(o.nr + " " + o.kunde + " → " + navnStat[til]);
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

  /* ------------------------------------------------ dato */
  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
