/* Brødr. Ringstad — skilt som svinger, sentrert meny og ordrestatus. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function skilt() {
    var kropp = document.querySelector(".skilt__kropp");
    if (!kropp || rolig) return;
    var siste = null;
    function sett(y, x) {
      kropp.style.transform = "rotateY(" + y.toFixed(2) + "deg) rotateX(" + x.toFixed(2) + "deg)";
    }
    function rull() {
      var r = kropp.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      var p = (vindu * 0.9 - r.top) / (r.height + vindu * 0.7);
      p = Math.min(1, Math.max(0, p));
      if (siste !== null && Math.abs(p - siste) < 0.004) return;
      siste = p;
      sett(-14 + p * 28, 5 - p * 10);
    }
    window.addEventListener("scroll", rull, { passive: true });
    window.addEventListener("resize", rull);
    rull();
  }

  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".meny a"), function (a) {
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
          ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til Brødr. Ringstad.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  function panel() {
    var liste = document.querySelector("[data-ordrer]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiPakking = document.querySelector("[data-kpi-pakking]");
    var kpiKlar = document.querySelector("[data-kpi-klar]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "pakking", "klar", "hentet"];
    var navn = { mottatt: "Mottatt", pakking: "Pakking", klar: "Klar", hentet: "Hentet" };

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
      var pak = 0, klar = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".ordre"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "pakking") pak++;
        if (st === "klar") klar++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiPakking) kpiPakking.textContent = pak;
      if (kpiKlar) kpiKlar.textContent = klar;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".ordre").length + " ordrer";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".ordre");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".ordre__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "hentet") { knapp.disabled = true; knapp.textContent = "Hentet"; }
      var navnEl = rad.querySelector(".ordre__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "ordre"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".ordre"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Ordrelisten er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  skilt(); meny(); avslor(); skjema(); panel(); ar();
})();
