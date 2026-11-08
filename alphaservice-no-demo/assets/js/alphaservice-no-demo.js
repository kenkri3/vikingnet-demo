/* ==========================================================================
   Alpha Service AS — alphaservice-no-demo
   Fullskjerm grid-overlay som meny (Escape, fokus, scroll-lås).
   CSS 3D-karusellen roterer i CSS; her pauses den ved redusert bevegelse.
   Panel: vaktmesteroppdrag med status.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ meny-overlay */
  var knapp = document.getElementById("menyknapp");
  var overlay = document.getElementById("overlay");
  if (knapp && overlay) {
    var sisteFokus = null;
    function apne() {
      sisteFokus = document.activeElement;
      knapp.setAttribute("aria-expanded", "true");
      overlay.setAttribute("data-aapen", "true");
      overlay.removeAttribute("aria-hidden");
      document.body.style.overflow = "hidden";
      var forste = overlay.querySelector("a, button");
      if (forste) forste.focus();
    }
    function lukk() {
      knapp.setAttribute("aria-expanded", "false");
      overlay.setAttribute("data-aapen", "false");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (sisteFokus && sisteFokus.focus) sisteFokus.focus();
    }
    knapp.addEventListener("click", function () {
      if (knapp.getAttribute("aria-expanded") === "true") lukk(); else apne();
    });
    var lukkeknapp = overlay.querySelector(".overlay__lukk");
    if (lukkeknapp) lukkeknapp.addEventListener("click", lukk);
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.style.overflow = ""; });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && knapp.getAttribute("aria-expanded") === "true") lukk();
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
        svar.innerHTML = "<b>Takk" + (navn && navn.value ? ", " + navn.value.split(" ")[0] : "") + "!</b>" +
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 463 44 222 eller skriv til post@alphaservice.no, så tar vi kontakt.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: oppdrag */
  var liste = document.getElementById("oppdrag");
  if (liste) {
    var oppdrag = [
      { nr: "AO-842", kunde: "Borettslaget Bjørnefjord", sted: "Os", jobb: "Daglig tilsyn og vaktmester", status: "paagaar", tid: "Fast, hver uke", folk: "Knut" },
      { nr: "AO-845", kunde: "Haldor Nes", sted: "Osøyro", jobb: "Brøyting og strøing", status: "planlagt", tid: "Etter vær", folk: "Team ute" },
      { nr: "AO-846", kunde: "Fjordgården AS", sted: "Os", jobb: "Innvendig maling, 2 etasjer", status: "paagaar", tid: "Uke 46–47", folk: "Marius" },
      { nr: "AO-847", kunde: "Kari Lund", sted: "Søfteland", jobb: "Skifting av lysrør", status: "meldt", tid: "I dag 14:00", folk: "Knut" },
      { nr: "AO-848", kunde: "Os Båtforening", sted: "Os", jobb: "Kosting og spyling", status: "meldt", tid: "Neste uke", folk: "Team ute" },
      { nr: "AO-849", kunde: "Strømsgård Borettslag", sted: "Strøno", jobb: "Utvendig fasadevask", status: "planlagt", tid: "Uke 47", folk: "Marius" },
      { nr: "AO-850", kunde: "Terje Haugland", sted: "Os", jobb: "Mur- og flisarbeid, bad", status: "ferdig", tid: "Levert", folk: "Marius" },
      { nr: "AO-851", kunde: "Bjørnafjorden kommune", sted: "Os", jobb: "Gressklipping, uteområde", status: "ferdig", tid: "Levert", folk: "Team ute" }
    ];
    var filter = "alle";
    var statNavn = { meldt: "Meldt", planlagt: "Planlagt", paagaar: "Pågår", ferdig: "Ferdig" };
    var rekkefolge = ["meldt", "planlagt", "paagaar", "ferdig"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", oppdrag.length);
      sett("kpi-meldt", oppdrag.filter(function (o) { return o.status === "meldt"; }).length);
      sett("kpi-paagaar", oppdrag.filter(function (o) { return o.status === "paagaar"; }).length);
      sett("kpi-ferdig", oppdrag.filter(function (o) { return o.status === "ferdig"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = oppdrag.filter(function (o) { return filter === "alle" || o.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen oppdrag i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (o) {
        var i = rekkefolge.indexOf(o.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = o.status === "meldt" ? "Planlegg" : o.status === "planlagt" ? "Start oppdrag" : "Merk ferdig";
        var knapp = o.status === "ferdig"
          ? '<button class="knapp knapp--mork knapp--liten" data-oppdrag="' + o.nr + '" data-til="meldt">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-oppdrag="' + o.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="oppdrag__kort' + (o.status === "ferdig" ? " oppdrag__kort--ferdig" : "") + '">' +
          '<div class="oppdrag__topp"><span class="oppdrag__nr">' + o.nr + "</span>" + stempel(o.status) + "</div>" +
          "<h3>" + o.jobb + "</h3>" +
          '<div class="oppdrag__meta"><span>' + o.kunde + "</span><span>" + o.sted + "</span><span>" + o.tid + "</span><span>" + o.folk + "</span></div>" +
          '<div class="oppdrag__knapper">' + knapp + "</div>" +
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
      var b = e.target.closest("button[data-oppdrag]");
      if (!b) return;
      var o = oppdrag.find(function (x) { return x.nr === b.getAttribute("data-oppdrag"); });
      if (!o) return;
      o.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(o.nr + " " + o.jobb + " → " + statNavn[o.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 oppdrag i kø.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
