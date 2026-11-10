/* Slagen Elektriske — meny, skjema og jobbstatus. */
(function () {
  "use strict";
  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".stripe a"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) {
          ut.hidden = false;
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til Slagen Elektriske AS.";
          ut.setAttribute("tabindex", "-1"); ut.focus();
        }
        skj.reset();
      });
    });
  }
  function panel() {
    var liste = document.querySelector("[data-jobber]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiPa = document.querySelector("[data-kpi-paagaar]");
    var kpiFerdig = document.querySelector("[data-kpi-ferdig]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "paagaar", "ferdig", "fakturert"];
    var navn = { mottatt: "Mottatt", paagaar: "Pågår", ferdig: "Ferdig", fakturert: "Fakturert" };
    function skrivLogg(t) {
      if (!logg) return;
      var na = new Date(), linje = document.createElement("div");
      linje.className = "logglinje";
      var tid = document.createElement("time");
      tid.textContent = ("0" + na.getHours()).slice(-2) + ":" + ("0" + na.getMinutes()).slice(-2);
      var s = document.createElement("span"); s.textContent = t;
      linje.appendChild(tid); linje.appendChild(s);
      logg.insertBefore(linje, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function oppdater() {
      var pa = 0, fe = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".jobb"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "paagaar") pa++;
        if (st === "ferdig") fe++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiPa) kpiPa.textContent = pa;
      if (kpiFerdig) kpiFerdig.textContent = fe;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".jobb").length + " jobber";
    }
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".jobb");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".jobb__steg"); if (merke) merke.textContent = navn[nytt];
      if (nytt === "fakturert") { knapp.disabled = true; knapp.textContent = "Fakturert"; }
      var navnEl = rad.querySelector(".jobb__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "jobb"));
      oppdater();
    });
    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".jobb"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });
    oppdater(); skrivLogg("Jobblisten er lastet.");
  }
  function ar() { var el = document.querySelector("[data-ar]"); if (el) el.textContent = new Date().getFullYear(); }
  meny(); skjema(); panel(); ar();
})();
