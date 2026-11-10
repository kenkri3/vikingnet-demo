/* Christensen Bakeri — delt meny, mobilmeny og bestillingsstatus. */
(function () {
  "use strict";

  function meny() {
    var knapp = document.querySelector("[data-meny-apne]");
    var meny = document.querySelector("[data-meny]");
    if (!knapp || !meny) return;
    var lukk = meny.querySelector("[data-meny-lukk]");
    var siste = null;
    function apne() {
      siste = document.activeElement;
      meny.classList.add("aapen");
      meny.removeAttribute("aria-hidden");
      knapp.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var forste = meny.querySelector("a");
      if (forste) forste.focus();
    }
    function lukke() {
      meny.classList.remove("aapen");
      meny.setAttribute("aria-hidden", "true");
      knapp.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (siste && siste.focus) siste.focus();
    }
    knapp.addEventListener("click", apne);
    if (lukk) lukk.addEventListener("click", lukke);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && meny.classList.contains("aapen")) lukke();
    });
    Array.prototype.forEach.call(meny.querySelectorAll("a"), function (a) { a.addEventListener("click", lukke); });
  }

  function aktiv() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".meny__lenke, .delt__gruppe a"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }

  function avslor() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
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
          ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til post@christensen-bakeri.no.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  function panel() {
    var liste = document.querySelector("[data-bestillinger]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiBaking = document.querySelector("[data-kpi-baking]");
    var kpiKlar = document.querySelector("[data-kpi-klar]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "baking", "klar", "hentet"];
    var navn = { mottatt: "Mottatt", baking: "Baking", klar: "Klar", hentet: "Hentet" };

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
      var bak = 0, klar = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".best"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "baking") bak++;
        if (st === "klar") klar++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiBaking) kpiBaking.textContent = bak;
      if (kpiKlar) kpiKlar.textContent = klar;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".best").length + " bestillinger";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".best");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".best__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "hentet") { knapp.disabled = true; knapp.textContent = "Hentet"; }
      var navnEl = rad.querySelector(".best__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "bestilling"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".best"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Bestillingslisten er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  meny(); aktiv(); avslor(); skjema(); panel(); ar();
})();
