/* Novaform — meny, Gantt som fylles, skjema og prosjektstatus. */
(function () {
  "use strict";
  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".meny a"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }
  function gantt() {
    var boks = document.querySelector(".gantt");
    if (!boks) return;
    var barer = boks.querySelectorAll(".gantt__bar");
    Array.prototype.forEach.call(barer, function (b, i) {
      b.style.setProperty("--bredde", (30 + i * 17) + "%");
      b.style.transitionDelay = (i * 0.12) + "s";
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      boks.classList.add("tegnet"); return;
    }
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) { if (x.isIntersecting) { boks.classList.add("tegnet"); io.disconnect(); } });
    }, { threshold: 0.35 });
    io.observe(boks);
  }
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) { ut.hidden = false; ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til Novaform."; ut.setAttribute("tabindex","-1"); ut.focus(); }
        skj.reset();
      });
    });
  }
  function panel() {
    var liste = document.querySelector("[data-prosjekter]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiBygg = document.querySelector("[data-kpi-bygging]");
    var kpiKontroll = document.querySelector("[data-kpi-kontroll]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "bygging", "kontroll", "avsluttet"];
    var navn = { mottatt: "Mottatt", bygging: "Bygging", kontroll: "Kontroll", avsluttet: "Avsluttet" };
    function skrivLogg(t) {
      if (!logg) return;
      var na = new Date(), linje = document.createElement("div"); linje.className = "logglinje";
      var tid = document.createElement("time"); tid.textContent = ("0"+na.getHours()).slice(-2)+":"+("0"+na.getMinutes()).slice(-2);
      var s = document.createElement("span"); s.textContent = t;
      linje.appendChild(tid); linje.appendChild(s);
      logg.insertBefore(linje, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function oppdater() {
      var by = 0, ko = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".prosjekt"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "bygging") by++;
        if (st === "kontroll") ko++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiBygg) kpiBygg.textContent = by;
      if (kpiKontroll) kpiKontroll.textContent = ko;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".prosjekt").length + " prosjekter";
    }
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]"); if (!knapp) return;
      var rad = knapp.closest(".prosjekt"); if (!rad) return;
      var steg = rad.getAttribute("data-steg"); var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".prosjekt__steg"); if (merke) merke.textContent = navn[nytt];
      if (nytt === "avsluttet") { knapp.disabled = true; knapp.textContent = "Avsluttet"; }
      var navnEl = rad.querySelector(".prosjekt__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "prosjekt"));
      oppdater();
    });
    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".prosjekt"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });
    oppdater(); skrivLogg("Prosjektlisten er lastet.");
  }
  function ar() { var el = document.querySelector("[data-ar]"); if (el) el.textContent = new Date().getFullYear(); }
  meny(); gantt(); skjema(); panel(); ar();
})();
