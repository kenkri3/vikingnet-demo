/* BackerSkeie — talentkart med strektegning, pill-dock og kandidatløp. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Talentkartet: strekene tegnes når kartet kommer i syne */
  function talentkart() {
    var kart = document.querySelector("[data-kart]");
    if (!kart) return;
    var linjer = kart.querySelectorAll(".kart__linje");
    Array.prototype.forEach.call(linjer, function (l) {
      var len = 0;
      try { len = l.getTotalLength(); } catch (e) { len = 0; }
      if (len) {
        l.style.setProperty("--l", len);
        l.style.strokeDasharray = len;
        l.style.strokeDashoffset = rolig ? 0 : len;
      }
    });
    if (rolig || !("IntersectionObserver" in window)) {
      kart.classList.add("er-trukket");
      return;
    }
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) {
        if (x.isIntersecting) {
          /* strekene tegnes i rekkefølge, som et kart som legges ut */
          Array.prototype.forEach.call(linjer, function (l, i) {
            setTimeout(function () {
              l.style.strokeDashoffset = 0;
              l.style.stroke = "";
            }, i * 90);
          });
          setTimeout(function () { kart.classList.add("er-trukket"); }, linjer.length * 90 + 400);
          io.unobserve(x.target);
        }
      });
    }, { threshold: 0.2 });
    io.observe(kart);
  }

  /* 2. Dock: marker aktiv side */
  function dock() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".dock__list a"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }

  /* 3. Avsløring */
  function avslor() {
    if (rolig || !("IntersectionObserver" in window)) return;
    var ting = document.querySelectorAll(".seksjon > .skal");
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
          ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til mail@backerskeie.com.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* 5. Panel: kandidatløp */
  function panel() {
    var liste = document.querySelector("[data-kandidater]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiIntervju = document.querySelector("[data-kpi-intervju]");
    var kpiTilbud = document.querySelector("[data-kpi-tilbud]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["kartlagt", "intervju", "tilbud", "ansatt"];
    var navn = { kartlagt: "Kartlagt", intervju: "Intervju", tilbud: "Tilbud", ansatt: "Ansatt" };

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
      var intervju = 0, tilbud = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".kand"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "intervju") intervju++;
        if (st === "tilbud") tilbud++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiIntervju) kpiIntervju.textContent = intervju;
      if (kpiTilbud) kpiTilbud.textContent = tilbud;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".kand").length + " kandidater";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-steg]");
      if (!knapp) return;
      var rad = knapp.closest(".kand");
      if (!rad) return;
      var steg = rad.getAttribute("data-steg");
      var i = rekkefolge.indexOf(steg);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nytt = rekkefolge[i + 1];
      rad.setAttribute("data-steg", nytt);
      var merke = rad.querySelector(".kand__steg");
      if (merke) merke.textContent = navn[nytt];
      if (nytt === "ansatt") { knapp.disabled = true; knapp.textContent = "Ansatt"; }
      var navnEl = rad.querySelector(".kand__navn");
      skrivLogg("Flyttet til " + navn[nytt] + ": " + (navnEl ? navnEl.textContent : "kandidat"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".kand"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-steg") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Kandidatløpet er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  talentkart();
  dock();
  avslor();
  skjema();
  panel();
  ar();
})();
