/* Move — megameny, skjema og oppdragsstatus. */
(function () {
  "use strict";
  function mega() {
    var knapp = document.querySelector("[data-mega]");
    var panel = document.querySelector("[data-megapanel]");
    if (!knapp || !panel) return;
    knapp.addEventListener("click", function () {
      var aapen = panel.classList.toggle("aapen");
      knapp.setAttribute("aria-expanded", String(aapen));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("aapen")) {
        panel.classList.remove("aapen");
        knapp.setAttribute("aria-expanded", "false");
        knapp.focus();
      }
    });
  }
  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".meny a, .mega a"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) { ut.hidden = false; ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til post@move.no."; ut.setAttribute("tabindex","-1"); ut.focus(); }
        skj.reset();
      });
    });
  }
  function panel() {
    var liste = document.querySelector("[data-oppdrag]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiLev = document.querySelector("[data-kpi-leveranse]");
    var kpiDrift = document.querySelector("[data-kpi-drift]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "leveranse", "drift", "avsluttet"];
    var navn = { mottatt: "Mottatt", leveranse: "Leveranse", drift: "Drift", avsluttet: "Avsluttet" };
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
      var lev = 0, dri = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".opp"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "leveranse") lev++;
        if (st === "drift") dri++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiLev) kpiLev.textContent = lev;
      if (kpiDrift) kpiDrift.textContent = dri;
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
  mega(); meny(); skjema(); panel(); ar();
})();
