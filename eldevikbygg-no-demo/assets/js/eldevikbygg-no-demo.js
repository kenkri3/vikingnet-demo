/* Eldevik Bygg — parallakse, husrekke som glir og boligstatus. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function parallakse() {
    var bilde = document.querySelector(".hero__bilde");
    if (!bilde || rolig) return;
    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0;
      if (y > 900) return;
      bilde.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0)";
    }, { passive: true });
  }

  function rekke() {
    if (true) return; /* rutenett, ikke stripe */
    var boks = document.querySelector("[data-rekke]");
    if (!boks) return;
    var spor = boks.querySelector(".rekke__spor");
    if (!spor) return;
    function rull() {
      var r = boks.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      var p = (vindu - r.top) / (r.height + vindu);
      p = Math.min(1, Math.max(0, p));
      var maks = Math.max(0, spor.scrollWidth - boks.clientWidth);
      var forskyvning = rolig ? 0 : -maks * Math.min(1, p * 1.15);
      spor.style.transform = "translateX(" + forskyvning.toFixed(1) + "px)";
    }
    window.addEventListener("scroll", rull, { passive: true });
    window.addEventListener("resize", rull);
    rull();
  }

  function meny() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".stripe a"), function (a) {
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
          ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til Eldevik Bygg.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  function panel() {
    var liste = document.querySelector("[data-boliger]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiBygging = document.querySelector("[data-kpi-bygging]");
    var kpiFerdig = document.querySelector("[data-kpi-ferdig]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["planlegging", "bygging", "ferdig", "solgt"];
    var navn = { planlegging: "Planlegging", bygging: "Bygging", ferdig: "Ferdig", solgt: "Solgt" };

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
      var bygg = 0, ferdig = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".bolig"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "bygging") bygg++;
        if (st === "ferdig") ferdig++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiBygging) kpiBygging.textContent = bygg;
      if (kpiFerdig) kpiFerdig.textContent = ferdig;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".bolig").length + " boliger";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".bolig");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".bolig__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "solgt") { knapp.disabled = true; knapp.textContent = "Solgt"; }
      var navnEl = rad.querySelector(".bolig__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "bolig"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".bolig"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Boliglisten er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  parallakse(); rekke(); meny(); avslor(); skjema(); panel(); ar();
})();