/* BKS Industri — teknisk tegning som tegnes, understreksmeny og oppdragsstatus. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tegningen() {
    var boks = document.querySelector(".tegning");
    if (!boks) return;
    var linjer = boks.querySelectorAll(".strek-linje");
    Array.prototype.forEach.call(linjer, function (l) {
      try {
        var len = l.getTotalLength();
        l.style.setProperty("--lengde", String(Math.ceil(len)));
      } catch (e) { /* SVG uten getTotalLength */ }
    });
    if (rolig || !("IntersectionObserver" in window)) { boks.classList.add("tegnet"); return; }
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) {
        if (x.isIntersecting) { boks.classList.add("tegnet"); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(boks);
  }

  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".strek"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }

  function avslor() {
    if (rolig || !("IntersectionObserver" in window)) return;
    var ting = document.querySelectorAll(".avslor");
    if (!ting.length) {
      Array.prototype.forEach.call(document.querySelectorAll(".seksjon > .skal"), function (s) { s.classList.add("avslor"); });
      ting = document.querySelectorAll(".avslor");
    }
    if (!ting.length) return;
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("er-inne"); io.unobserve(x.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    Array.prototype.forEach.call(ting, function (t) { io.observe(t); });
  }

  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) {
          ut.hidden = false;
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til post@bksas.no.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  function panel() {
    var liste = document.querySelector("[data-oppdrag]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiProd = document.querySelector("[data-kpi-produksjon]");
    var kpiKontroll = document.querySelector("[data-kpi-kontroll]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "produksjon", "kontroll", "levert"];
    var navn = { mottatt: "Mottatt", produksjon: "Produksjon", kontroll: "Kontroll", levert: "Levert" };

    function skrivLogg(tekst) {
      if (!logg) return;
      var na = new Date();
      var linje = document.createElement("div");
      linje.className = "logglinje";
      var t = document.createElement("time");
      t.textContent = ("0" + na.getHours()).slice(-2) + ":" + ("0" + na.getMinutes()).slice(-2);
      var s = document.createElement("span");
      s.textContent = tekst;
      linje.appendChild(t); linje.appendChild(s);
      logg.insertBefore(linje, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }

    function oppdater() {
      var prod = 0, kontroll = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".opp"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "produksjon") prod++;
        if (st === "kontroll") kontroll++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiProd) kpiProd.textContent = prod;
      if (kpiKontroll) kpiKontroll.textContent = kontroll;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".opp").length + " oppdrag";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".opp");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".opp__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "levert") { knapp.disabled = true; knapp.textContent = "Levert"; }
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

    oppdater();
    skrivLogg("Oppdragslisten er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  tegningen(); meny(); avslor(); skjema(); panel(); ar();
})();
