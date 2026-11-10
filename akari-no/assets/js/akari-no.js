/* Felles panel-/menylogikk for demo-v3 (Borg, Birkelund, A-B Renhold, Agder OPS, Alfa Varme). */
(function () {
  "use strict";
  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".navigasjon a"), function (a) {
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
          ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til firmaet.";
          ut.setAttribute("tabindex", "-1"); ut.focus();
        }
        skj.reset();
      });
    });
  }
  function panel() {
    var liste = document.querySelector("[data-liste]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiA = document.querySelector("[data-kpi-a]");
    var kpiB = document.querySelector("[data-kpi-b]");
    var teller = document.querySelector("[data-antall]");
    var steg = ["mottatt", "paagaar", "klar", "avsluttet"];
    var navn = { mottatt: "Mottatt", paagaar: "Pågår", klar: "Klar", avsluttet: "Avsluttet" };
    Array.prototype.forEach.call(liste.querySelectorAll(".jobb"), function (rad) {
      var s = rad.getAttribute("data-steg");
      if (navn[s]) {
        var m = rad.querySelector(".jobb__steg");
        if (m) m.textContent = navn[s];
      }
      var k = rad.querySelector(".jobb__knapp");
      if (k && s === "avsluttet") { k.disabled = true; k.textContent = "Avsluttet"; }
    });
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
      var a = 0, b = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".jobb"), function (rad) {
        var s = rad.getAttribute("data-steg");
        if (s === "paagaar") a++;
        if (s === "klar") b++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiA) kpiA.textContent = a;
      if (kpiB) kpiB.textContent = b;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".jobb").length + " saker";
    }
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]"); if (!knapp) return;
      var rad = knapp.closest(".jobb"); if (!rad) return;
      var s = rad.getAttribute("data-steg"); var i = steg.indexOf(s);
      if (i < 0 || i >= steg.length - 1) return;
      var nytt = steg[i + 1];
      rad.setAttribute("data-steg", nytt);
      var m = rad.querySelector(".jobb__steg"); if (m) m.textContent = navn[nytt];
      if (nytt === "avsluttet") { knapp.disabled = true; knapp.textContent = "Avsluttet"; }
      var navnEl = rad.querySelector(".jobb__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "sak"));
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
    oppdater(); skrivLogg("Listen er lastet.");
  }
  function ar() { var el = document.querySelector("[data-ar]"); if (el) el.textContent = new Date().getFullYear(); }
  meny(); skjema(); panel(); ar();
})();
