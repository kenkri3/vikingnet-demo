/* Asker Oppmåling — roterende 3D-kube, akkordeon-kapitler og oppdragsstatus. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Kuben dreier med scroll (og sakte av seg selv) */
  function kube() {
    var scene = document.querySelector(".kube__scene");
    if (!scene || rolig) return;
    var basis = { x: -18, y: -28 };
    var siste = null;
    var auto = 0;
    function sett(x, y) {
      scene.style.transform = "rotateX(" + x.toFixed(2) + "deg) rotateY(" + y.toFixed(2) + "deg)";
    }
    function rull() {
      var r = scene.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      var p = (vindu * 0.9 - r.top) / (r.height + vindu * 0.6);
      p = Math.min(1, Math.max(0, p));
      if (siste !== null && Math.abs(p - siste) < 0.004) return;
      siste = p;
      sett(basis.x + p * 16, basis.y + p * 96);
    }
    window.addEventListener("scroll", rull, { passive: true });
    window.addEventListener("resize", rull);
    rull();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(function () {
        auto += 0.25;
        if (siste !== null && Math.abs(siste - 0.5) > 0.02) return;
        sett(basis.x + 8, basis.y + 40 + auto);
      }, 90);
    }
  }

  /* 2. Kapitler: lukk andre når en åpnes, og marker aktiv side */
  function kapitler() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    var alle = document.querySelectorAll("details.kap");
    Array.prototype.forEach.call(alle, function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        Array.prototype.forEach.call(alle, function (annen) { if (annen !== d) annen.open = false; });
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll(".kap a"), function (a) {
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
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til Asker Oppmåling.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* 5. Panel: oppdrag mottatt → felt → bearbeiding → levert */
  function panel() {
    var liste = document.querySelector("[data-oppdrag]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiFelt = document.querySelector("[data-kpi-felt]");
    var kpiBear = document.querySelector("[data-kpi-bearbeiding]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "felt", "bearbeiding", "levert"];
    var navn = { mottatt: "Mottatt", felt: "Felt", bearbeiding: "Bearbeiding", levert: "Levert" };

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
      var felt = 0, bear = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".opp"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "felt") felt++;
        if (st === "bearbeiding") bear++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiFelt) kpiFelt.textContent = felt;
      if (kpiBear) kpiBear.textContent = bear;
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

  kube();
  kapitler();
  avslor();
  skjema();
  panel();
  ar();
})();
