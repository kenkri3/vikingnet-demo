/* Austad Maskinstasjon — hjul som ruller med scroll, skrå kapitler, oppdragsstatus. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hjulet() {
    var dekk = document.querySelector(".hjul__dekk");
    if (!dekk || rolig) return;
    var grader = 0;
    function rull() {
      var r = dekk.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      if (r.top > vindu || r.bottom < 0) return;
      grader = (window.scrollY * 0.35) % 360;
      dekk.style.transform = "rotate(" + grader.toFixed(1) + "deg)";
    }
    window.addEventListener("scroll", rull, { passive: true });
    window.addEventListener("resize", rull);
    rull();
  }

  function kapitler() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".skra__lenke"), function (a) {
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
    document.documentElement.classList.add("js-reveal");
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
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til Austad Maskinstasjon.";
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
    var kpiPa = document.querySelector("[data-kpi-paagaar]");
    var kpiM = document.querySelector("[data-kpi-masser]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "paagaar", "masser", "levert"];
    var navn = { mottatt: "Mottatt", paagaar: "Pågår", masser: "Masser", levert: "Levert" };

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
      var pa = 0, m = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".opp"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "paagaar") pa++;
        if (st === "masser") m++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiPa) kpiPa.textContent = pa;
      if (kpiM) kpiM.textContent = m;
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

  hjulet(); kapitler(); avslor(); skjema(); panel(); ar();
})();
