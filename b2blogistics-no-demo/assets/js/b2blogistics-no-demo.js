/* B2B Logistics — containerstabel som lastes, steg-nav og forsendelser. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Containerstabel: boksene lastes på plass når seksjonen kommer i syne */
  function havn() {
    var dekk = document.querySelector("[data-dekk]");
    if (!dekk) return;

    var farger = [
      ["#c85a2c", "#a8441d"],
      ["#2f6f8f", "#24566f"],
      ["#3d7a52", "#2d5c3d"],
      ["#b8452a", "#8f3319"],
      ["#5c6d7a", "#44525c"],
      ["#c98a2c", "#a26a1c"],
      ["#2f5f7a", "#22475c"],
      ["#4a6b3d", "#38522d"]
    ];
    /* plassering på dekket: to rader med containere */
    var plan = [
      [10, 30], [100, 30], [190, 30], [10, 96],
      [100, 96], [190, 96], [55, 62], [145, 62]
    ];
    var boksene = [];

    plan.forEach(function (p, i) {
      var b = document.createElement("div");
      b.className = "kont";
      b.style.setProperty("--x", p[0] + "px");
      b.style.setProperty("--y", p[1] + "px");
      b.style.setProperty("--z", (i % 2 === 0 ? 0 : 28));
      b.style.setProperty("--f1", farger[i][0]);
      b.style.setProperty("--f2", farger[i][1]);

      var front = document.createElement("div");
      front.className = "kont__side kont__side--front";
      front.style.cssText = "inset:0";
      var topp = document.createElement("div");
      topp.className = "kont__side kont__side--topp";
      topp.style.cssText = "inset:0;width:84px;height:38px";
      b.appendChild(front);
      b.appendChild(topp);
      dekk.appendChild(b);
      boksene.push(b);
    });

    var antall = 0;
    function tegn() {
      var r = dekk.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      var p = (vindu * 0.92 - r.top) / (r.height + vindu * 0.5);
      p = Math.min(1, Math.max(0, p));
      /* minst halve stabelen står lastet fra start, så signaturen synes med en gang */
      var nytt = Math.max(4, Math.round(p * boksene.length));
      if (nytt !== antall) {
        antall = nytt;
        boksene.forEach(function (b, i) {
          b.classList.toggle("er-lastet", i < antall);
        });
      }
    }

    if (rolig) {
      boksene.forEach(function (b) { b.classList.add("er-lastet"); });
      return;
    }
    window.addEventListener("scroll", tegn, { passive: true });
    window.addEventListener("resize", tegn);
    tegn();
  }

  /* 2. Steg-navigasjon: marker aktivt steg */
  function stegnav() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".stegnav__lenke"), function (a) {
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
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til bergen@b2blogistics.no.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* 5. Panel: forsendelser */
  function panel() {
    var liste = document.querySelector("[data-forsendelser]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiTransitt = document.querySelector("[data-kpi-transitt]");
    var kpiLevert = document.querySelector("[data-kpi-levert]");
    var teller = document.querySelector("[data-antall]");

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
      var transitt = 0, levert = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".fs"), function (rad) {
        var st = rad.getAttribute("data-status");
        if (st === "i-transitt") transitt++;
        if (st === "levert") levert++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiTransitt) kpiTransitt.textContent = transitt;
      if (kpiLevert) kpiLevert.textContent = levert;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".fs").length + " forsendelser";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste-status]");
      if (!knapp) return;
      var rad = knapp.closest(".fs");
      if (!rad) return;
      var st = rad.getAttribute("data-status");
      if (st === "levert") return;
      var neste = st === "booket" ? "i-transitt" : "levert";
      rad.setAttribute("data-status", neste);
      var merke = rad.querySelector(".fs__status");
      if (merke) merke.textContent = neste === "i-transitt" ? "I transitt" : "Levert";
      knapp.textContent = neste === "i-transitt" ? "Merk levert" : "Levert";
      if (neste === "levert") knapp.disabled = true;
      var navn = rad.querySelector(".fs__navn");
      skrivLogg((neste === "i-transitt" ? "Sendt: " : "Levert: ") + (navn ? navn.textContent : "forsendelse"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".fs"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-status") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Forsendelseslisten er lastet.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  havn();
  stegnav();
  avslor();
  skjema();
  panel();
  ar();
})();