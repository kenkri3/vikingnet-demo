/* A/STAB — aksometrisk bygg som reiser seg, mappefaner og saksbehandling. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Bygningsmodellen: etasjene reiser seg når seksjonen kommer i syne */
  function modell() {
    var scene = document.querySelector("[data-modell]");
    if (!scene) return;
    var etasjer = Array.prototype.slice.call(scene.querySelectorAll(".etasje"));
    if (!etasjer.length) return;

    function vis(antall) {
      etasjer.forEach(function (e, i) {
        var oppe = i < antall;
        e.classList.toggle("er-oppe", oppe);
        if (oppe) e.style.setProperty("--z", String(18 + i * 30));
        else e.style.setProperty("--z", "-40");
      });
    }

    if (rolig) { vis(etasjer.length); return; }

    var antatt = 0;
    function tegn() {
      var r = scene.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      var p = (vindu * 0.95 - r.top) / (r.height + vindu * 0.55);
      p = Math.min(1, Math.max(0, p));
      var nytt = Math.max(2, Math.round(p * etasjer.length));
      if (nytt !== antatt) { antatt = nytt; vis(nytt); }
    }
    window.addEventListener("scroll", tegn, { passive: true });
    window.addEventListener("resize", tegn);
    tegn();
  }

  /* 2. Mappefanene: marker aktiv side */
  function faner() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".fane"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }

  /* 3. Innhold er synlig som standard; JS legger på .js-reveal for glidende inngang */
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
          ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til A/STAB, og du får svar på telefon.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* 5. Panel: saker gjennom mottatt → avklaring → tilbud → utførelse */
  function panel() {
    var liste = document.querySelector("[data-saker]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiAvklaring = document.querySelector("[data-kpi-avklaring]");
    var kpiTilbud = document.querySelector("[data-kpi-tilbud]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "avklaring", "tilbud", "utforelse"];
    var navn = { mottatt: "Mottatt", avklaring: "Avklaring", tilbud: "Tilbud", utforelse: "Utførelse" };

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
      var avklaring = 0, tilbud = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".sak"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "avklaring") avklaring++;
        if (st === "tilbud") tilbud++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiAvklaring) kpiAvklaring.textContent = avklaring;
      if (kpiTilbud) kpiTilbud.textContent = tilbud;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".sak").length + " saker";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".sak");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".sak__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "utforelse") { knapp.disabled = true; knapp.textContent = "I utførelse"; }
      var navnEl = rad.querySelector(".sak__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "sak"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".sak"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Sakslisten er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  modell();
  faner();
  avslor();
  skjema();
  panel();
  ar();
})();