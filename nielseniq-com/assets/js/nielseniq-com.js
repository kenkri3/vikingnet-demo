/* NIQ — meny, skjema og studiestatus. */
(function () {
  "use strict";
  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".meny a"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) { ut.hidden = false; ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til NIQ."; ut.setAttribute("tabindex","-1"); ut.focus(); }
        skj.reset();
      });
    });
  }
  function panel() {
    var liste = document.querySelector("[data-studier]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiFelt = document.querySelector("[data-kpi-felt]");
    var kpiAnalyse = document.querySelector("[data-kpi-analyse]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "felt", "analyse", "levert"];
    var navn = { mottatt: "Mottatt", felt: "Felt", analyse: "Analyse", levert: "Levert" };
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
      var fe = 0, an = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".studie"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "felt") fe++;
        if (st === "analyse") an++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiFelt) kpiFelt.textContent = fe;
      if (kpiAnalyse) kpiAnalyse.textContent = an;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".studie").length + " studier";
    }
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]"); if (!knapp) return;
      var rad = knapp.closest(".studie"); if (!rad) return;
      var steg = rad.getAttribute("data-steg"); var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".studie__steg"); if (merke) merke.textContent = navn[nytt];
      if (nytt === "levert") { knapp.disabled = true; knapp.textContent = "Levert"; }
      var navnEl = rad.querySelector(".studie__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "studie"));
      oppdater();
    });
    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".studie"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });
    oppdater(); skrivLogg("Studielisten er lastet.");
  }
  function ar() { var el = document.querySelector("[data-ar]"); if (el) el.textContent = new Date().getFullYear(); }
  meny(); skjema(); panel(); ar();
})();
