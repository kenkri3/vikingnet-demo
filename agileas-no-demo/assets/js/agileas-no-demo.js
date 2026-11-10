/* Agile Gruppen — 3D-kortvifte, kortstokk-meny og oppdragsstatus. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Kortviften spres når seksjonen kommer i syne og mere når man scroller */
  function vifte() {
    var scene = document.querySelector("[data-vifte]");
    if (!scene) return;
    var kort = Array.prototype.slice.call(scene.querySelectorAll(".vifte__kort"));
    if (!kort.length) return;

    function legg(spredning, loft) {
      var midt = (kort.length - 1) / 2;
      kort.forEach(function (k, i) {
        var vinkel = (i - midt) * spredning;
        var hoyde = Math.abs(i - midt) * loft;
        k.style.transform =
          "rotate(" + vinkel.toFixed(2) + "deg) translateY(" + hoyde.toFixed(1) + "px) translateZ(" + ((kort.length - i) * -6) + "px)";
      });
    }

    if (rolig) { legg(9, 4); return; }

    var siste = -1;
    function tegn() {
      var r = scene.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      var p = (vindu * 0.95 - r.top) / (r.height + vindu * 0.6);
      p = Math.min(1, Math.max(0, p));
      if (Math.abs(p - siste) < 0.01) return;
      siste = p;
      legg(6 + p * 9, 2 + p * 5);
    }
    window.addEventListener("scroll", tegn, { passive: true });
    window.addEventListener("resize", tegn);
    legg(9, 4);
    tegn();
  }

  /* 2. Kortstokken: marker aktiv side */
  function stokk() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".kort"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }

  /* 3. Avsløring: synlig som standard */
  function avslor() {
    if (rolig || !("IntersectionObserver" in window)) return;
    var ting = document.querySelectorAll(".avslor");
    if (!ting.length) {
      Array.prototype.forEach.call(document.querySelectorAll(".seksjon > .skal"), function (s) { s.classList.add("avslor"); });
      ting = document.querySelectorAll(".avslor");
    }
    if (!ting.length) return;
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("er-inne"); io.unobserve(x.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    Array.prototype.forEach.call(ting, function (t) { io.observe(t); });
  }

  /* 4. Skjema */
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) {
          ut.hidden = false;
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den fortrolig til Agile Gruppen.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* 5. Panel: oppdrag mottatt → kartlegging → intervju → innstilling → ansatt */
  function panel() {
    var liste = document.querySelector("[data-oppdrag]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiIntervju = document.querySelector("[data-kpi-intervju]");
    var kpiInnst = document.querySelector("[data-kpi-innstilling]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "kartlegging", "intervju", "innstilling", "ansatt"];
    var navn = { mottatt: "Mottatt", kartlegging: "Kartlegging", intervju: "Intervju", innstilling: "Innstilling", ansatt: "Ansatt" };

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
      var intervju = 0, innst = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".opp"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "intervju") intervju++;
        if (st === "innstilling") innst++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiIntervju) kpiIntervju.textContent = intervju;
      if (kpiInnst) kpiInnst.textContent = innst;
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
      if (nytt === "ansatt") { knapp.disabled = true; knapp.textContent = "Ansatt"; }
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

  vifte();
  stokk();
  avslor();
  skjema();
  panel();
  ar();
})();
