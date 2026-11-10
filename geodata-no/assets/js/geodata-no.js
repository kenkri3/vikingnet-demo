/* Geodata — meny, søk, skjema og oppdragsstatus. */
(function () {
  "use strict";
  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".meny a"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }
  function sok() {
    var skjema = document.querySelector("[data-sok]");
    if (!skjema) return;
    skjema.addEventListener("submit", function (e) {
      e.preventDefault();
      var felt = skjema.querySelector("input");
      var svar = document.querySelector("[data-soksvar]");
      if (svar && felt) {
        svar.hidden = false;
        svar.textContent = "Søk i demoen: «" + felt.value + "» – i den ekte løsningen gir dette treff i produkter og tjenester.";
      }
    });
  }
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) { ut.hidden = false; ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til geodata@geodata.no."; ut.setAttribute("tabindex","-1"); ut.focus(); }
        skj.reset();
      });
    });
  }
  function panel() {
    var liste = document.querySelector("[data-oppdrag]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiLev = document.querySelector("[data-kpi-leveranse]");
    var kpiSup = document.querySelector("[data-kpi-support]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "leveranse", "support", "avsluttet"];
    var navn = { mottatt: "Mottatt", leveranse: "Leveranse", support: "Support", avsluttet: "Avsluttet" };
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
      var lev = 0, sup = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".opp"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "leveranse") lev++;
        if (st === "support") sup++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiLev) kpiLev.textContent = lev;
      if (kpiSup) kpiSup.textContent = sup;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".opp").length + " oppdrag";
    }
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]"); if (!knapp) return;
      var rad = knapp.closest(".opp"); if (!rad) return;
      var steg = rad.getAttribute("data-steg"); var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".opp__steg"); if (merke) merke.textContent = navn[nytt];
      if (nytt === "avsluttet") { knapp.disabled = true; knapp.textContent = "Avsluttet"; }
      var navnEl = rad.querySelector(".opp__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "oppdrag"));
      oppdater();
    });
    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".opp"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });
    oppdater(); skrivLogg("Oppdragslisten er lastet.");
  }
  function ar() { var el = document.querySelector("[data-ar]"); if (el) el.textContent = new Date().getFullYear(); }
  meny(); sok(); skjema(); panel(); ar();
})();
