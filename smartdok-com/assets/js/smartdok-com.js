/* SmartDok — modulmeny, 3D-telefon, skjema og kundestatus. */
(function () {
  "use strict";
  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".modulmeny a"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }
  function telefon() {
    var kropp = document.querySelector(".telefon__kropp");
    if (!kropp || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.addEventListener("scroll", function () {
      var p = Math.min(1, Math.max(0, (window.scrollY || 0) / 700));
      kropp.style.transform = "rotateY(" + (-18 + p * 34).toFixed(1) + "deg) rotateX(" + (4 - p * 8).toFixed(1) + "deg)";
    }, { passive: true });
  }
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) { ut.hidden = false; ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til SmartDok."; ut.setAttribute("tabindex","-1"); ut.focus(); }
        skj.reset();
      });
    });
  }
  function panel() {
    var liste = document.querySelector("[data-saker]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiDemo = document.querySelector("[data-kpi-demo]");
    var kpiOnb = document.querySelector("[data-kpi-onboarding]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "demo", "onboarding", "aktiv"];
    var navn = { mottatt: "Mottatt", demo: "Demo", onboarding: "Onboarding", aktiv: "Aktiv" };
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
      var de = 0, on = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".sak"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "demo") de++;
        if (st === "onboarding") on++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiDemo) kpiDemo.textContent = de;
      if (kpiOnb) kpiOnb.textContent = on;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".sak").length + " saker";
    }
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]"); if (!knapp) return;
      var rad = knapp.closest(".sak"); if (!rad) return;
      var steg = rad.getAttribute("data-steg"); var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".sak__steg"); if (merke) merke.textContent = navn[nytt];
      if (nytt === "aktiv") { knapp.disabled = true; knapp.textContent = "Aktiv"; }
      var navnEl = rad.querySelector(".sak__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "sak"));
      oppdater();
    });
    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".sak"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });
    oppdater(); skrivLogg("Kundelisten er lastet.");
  }
  function ar() { var el = document.querySelector("[data-ar]"); if (el) el.textContent = new Date().getFullYear(); }
  meny(); telefon(); skjema(); panel(); ar();
})();
