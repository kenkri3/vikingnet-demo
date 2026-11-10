/* ETY — sidepanel, mandala og timebestillinger. */
(function () {
  "use strict";

  function panel() {
    var knapp = document.querySelector("[data-panel-apne]");
    var panel = document.querySelector("[data-panel]");
    if (!panel) return;
    var lukk = panel.querySelector("[data-panel-lukk]");
    var siste = null;
    function apne() {
      siste = document.activeElement;
      panel.classList.add("aapen");
      document.body.style.overflow = "hidden";
      if (knapp) knapp.setAttribute("aria-expanded", "true");
    }
    function lukke() {
      panel.classList.remove("aapen");
      document.body.style.overflow = "";
      if (knapp) knapp.setAttribute("aria-expanded", "false");
      if (siste && siste.focus) siste.focus();
    }
    if (knapp) knapp.addEventListener("click", apne);
    if (lukk) lukk.addEventListener("click", lukke);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("aapen")) lukke();
    });
    Array.prototype.forEach.call(panel.querySelectorAll("a"), function (a) {
      a.addEventListener("click", function () { if (window.innerWidth < 1040) lukke(); });
    });
    var kapitler = document.querySelectorAll("details.kap");
    Array.prototype.forEach.call(kapitler, function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        Array.prototype.forEach.call(kapitler, function (annen) { if (annen !== d) annen.open = false; });
      });
    });
  }

  function aktiv() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".kap a"), function (a) {
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
          ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til Einar Tyholdt.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  function demo() {
    var liste = document.querySelector("[data-timer]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiBekreftet = document.querySelector("[data-kpi-bekreftet]");
    var kpiUtfort = document.querySelector("[data-kpi-utfort]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["forespurt", "bekreftet", "utfort", "fakturert"];
    var navn = { forespurt: "Forespurt", bekreftet: "Bekreftet", utfort: "Utført", fakturert: "Fakturert" };

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
      var bek = 0, utf = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".time"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "bekreftet") bek++;
        if (st === "utfort") utf++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiBekreftet) kpiBekreftet.textContent = bek;
      if (kpiUtfort) kpiUtfort.textContent = utf;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".time").length + " timer";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".time");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".time__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "fakturert") { knapp.disabled = true; knapp.textContent = "Fakturert"; }
      var navnEl = rad.querySelector(".time__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "time"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".time"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Timeboken er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  panel(); aktiv(); avslor(); skjema(); demo(); ar();
})();
