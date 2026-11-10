/* CreoNordic — glasspaneler som vrir seg, blokkmeny og leveringsstatus. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function glass() {
    var scene = document.querySelector("[data-glass]");
    if (!scene || rolig) return;
    var paneler = Array.prototype.slice.call(scene.querySelectorAll(".glass__panel"));
    var siste = null;
    function sett(p) {
      paneler.forEach(function (el, i) {
        var vinkel = -34 + p * 16 + i * 6;
        var dybde = (i + 1) * -26 + p * 12;
        el.style.transform = "rotateY(" + vinkel.toFixed(2) + "deg) translateZ(" + dybde.toFixed(1) + "px)";
      });
    }
    function rull() {
      var r = scene.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      var p = (vindu * 0.9 - r.top) / (r.height + vindu * 0.6);
      p = Math.min(1, Math.max(0, p));
      if (siste !== null && Math.abs(p - siste) < 0.004) return;
      siste = p;
      sett(p);
    }
    window.addEventListener("scroll", rull, { passive: true });
    window.addEventListener("resize", rull);
    sett(0.3);
    rull();
  }

  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".blokk a"), function (a) {
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
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til CreoNordic.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  function panel() {
    var liste = document.querySelector("[data-leveranser]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiProd = document.querySelector("[data-kpi-produksjon]");
    var kpiMont = document.querySelector("[data-kpi-montering]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "produksjon", "montering", "ferdig"];
    var navn = { mottatt: "Mottatt", produksjon: "Produksjon", montering: "Montering", ferdig: "Ferdig" };

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
      var prod = 0, mont = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".lev"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "produksjon") prod++;
        if (st === "montering") mont++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiProd) kpiProd.textContent = prod;
      if (kpiMont) kpiMont.textContent = mont;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".lev").length + " leveranser";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".lev");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".lev__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "ferdig") { knapp.disabled = true; knapp.textContent = "Ferdig"; }
      var navnEl = rad.querySelector(".lev__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "leveranse"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".lev"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Leveranselisten er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  glass(); meny(); avslor(); skjema(); panel(); ar();
})();
