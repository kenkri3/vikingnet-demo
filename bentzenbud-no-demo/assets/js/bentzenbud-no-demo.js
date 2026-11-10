/* Bentzen Bud — fullskjermmeny, rutetape og status på sendinger. */
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
    Array.prototype.forEach.call(meny.querySelectorAll("a"), function (a) {
      a.addEventListener("click", lukke);
    });
  }

  function aktiv() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".meny__lenke"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }

  function tape() {
    var spor = document.querySelector(".tape__spor");
    if (!spor) return;
    var barn = Array.prototype.slice.call(spor.children);
    barn.forEach(function (b) {
      var kopi = b.cloneNode(true);
      kopi.setAttribute("aria-hidden", "true");
      spor.appendChild(kopi);
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
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til ordre@bentzenbud.no.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  function panel() {
    var liste = document.querySelector("[data-sendinger]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiUnderveis = document.querySelector("[data-kpi-underveis]");
    var kpiHentet = document.querySelector("[data-kpi-hentet]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "hentet", "underveis", "levert"];
    var navn = { mottatt: "Mottatt", hentet: "Hentet", underveis: "Underveis", levert: "Levert" };

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
      var under = 0, hentet = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".sending"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "underveis") under++;
        if (st === "hentet") hentet++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiUnderveis) kpiUnderveis.textContent = under;
      if (kpiHentet) kpiHentet.textContent = hentet;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".sending").length + " sendinger";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".sending");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".sending__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "levert") { knapp.disabled = true; knapp.textContent = "Levert"; }
      var navnEl = rad.querySelector(".sending__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "sending"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".sending"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Sendingene er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  meny(); aktiv(); tape(); avslor(); skjema(); panel(); ar();
})();
