/* Dag Aasbø Travel — kompass, reisedagbok i 3D og panel. Ingen biblioteker. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Kompassrose: radial meny ---------- */
  function kompass() {
    var rot = document.querySelector("[data-kompass]");
    if (!rot) return;
    var knapp = rot.querySelector(".kompass__knapp");
    var lenker = Array.prototype.slice.call(rot.querySelectorAll(".kompass__ring a"));
    var bakgrunn = rot.querySelector(".kompass__bakgrunn");
    if (!knapp || !lenker.length) return;

    function plasser() {
      var liten = window.innerWidth < 620;
      var r1 = liten ? 112 : 168;
      var r2 = liten ? 148 : 208;
      var start = 190, slutt = 310;   /* vifte oppover; alle punkter ligger over knappen */
      var br = knapp.getBoundingClientRect();
      var px = br.left + br.width / 2;
      var py = br.top + br.height / 2;
      var vw = window.innerWidth;
      lenker.forEach(function (a, i) {
        var andel = lenker.length > 1 ? i / (lenker.length - 1) : 0;
        var vinkel = (start + (slutt - start) * andel) * Math.PI / 180;
        var rad = i % 2 === 0 ? r1 : r2;  /* forskjøvet radius, så etikettene ikke kolliderer */
        var x = Math.cos(vinkel) * rad;
        var y = Math.sin(vinkel) * rad;
        var halv = Math.max(34, (a.offsetWidth || 70) / 2);
        if (x > -8) x = -8;
        if (px + x - halv < 10) x = 10 - px + halv;
        if (px + x + halv > vw - 10) x = vw - 10 - halv - px;
        if (py + y < 70) y = 70 - py;
        a.style.setProperty("--x", x.toFixed(1) + "px");
        a.style.setProperty("--y", y.toFixed(1) + "px");
        a.style.setProperty("--d", (i * 24) + "ms");
      });
    }

    function sett(aapen) {
      rot.setAttribute("data-aapen", aapen ? "true" : "false");
      knapp.setAttribute("aria-expanded", aapen ? "true" : "false");
      if (aapen) {
        plasser();
        var naa = lenker.filter(function (a) { return a.getAttribute("aria-current") === "page"; })[0] || lenker[0];
        setTimeout(function () { naa.focus(); }, 60);
      }
    }

    knapp.addEventListener("click", function () {
      sett(rot.getAttribute("data-aapen") !== "true");
    });
    if (bakgrunn) bakgrunn.addEventListener("click", function () { sett(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && rot.getAttribute("data-aapen") === "true") {
        sett(false);
        knapp.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (rot.getAttribute("data-aapen") !== "true") return;
      if (!rot.contains(e.target)) sett(false);
    });
    window.addEventListener("resize", function () {
      if (rot.getAttribute("data-aapen") === "true") plasser();
    });
    plasser();
  }

  /* ---------- 2. Reisedagbok: sider som blas om ---------- */
  function dagbok() {
    var scene = document.querySelector("[data-bokscene]");
    if (!scene) return;
    var bok = scene.querySelector(".bok");
    var sider = Array.prototype.slice.call(scene.querySelectorAll(".bok__side"));
    var teller = document.querySelector("[data-bokside]");
    var knapp = document.querySelector("[data-bok-neste]");
    if (!bok || sider.length < 2) return;

    /* sider.length - 1 sider kan blas om; den siste ligger alltid underst */
    var maks = sider.length - 1;
    var indeks = 0;
    var manuell = false;

    function tegn() {
      sider.forEach(function (side, i) {
        var snudd = i < indeks;
        var basis = snudd ? 180 : 0;
        /* mens siden er i bevegelse, løft den litt ut av boken */
        side.style.transform = "rotateY(" + (-basis) + "deg)";
        /* sidenummer står i klassen; side 1 skal ligge øverst */
        var m = side.className.match(/bok__side--(\d+)/);
        var nr = m ? parseInt(m[1], 10) : sider.length - i;
        side.style.zIndex = snudd ? String(nr) : String(10 - nr);
        side.style.boxShadow = snudd
          ? "0 10px 24px -20px rgba(13,58,99,.4)"
          : "0 22px 50px -30px rgba(13,58,99,.6), inset 0 0 40px rgba(217,139,74,.06)";
      });
      if (teller) teller.textContent = "Side " + Math.min(indeks + 1, sider.length) + " av " + sider.length;
    }

    function neste() {
      manuell = true;
      indeks = indeks >= maks ? 0 : indeks + 1;
      tegn();
    }

    if (knapp) knapp.addEventListener("click", neste);
    scene.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      neste();
    });

    if (!rolig) {
      var sisteRull = 0;
      function paScroll() {
        if (manuell) return;
        var vindu = window.innerHeight || 800;
        /* p = 0 helt til man begynner å scrolle; da blas sidene om én for én */
        var p = window.scrollY / Math.max(320, vindu * 1.5);
        p = Math.min(1, Math.max(0, p));
        var ny = Math.min(maks, Math.floor(p * (maks + 0.001)));
        if (ny !== indeks) {
          indeks = ny;
          tegn();
        }
      }
      window.addEventListener("scroll", function () {
        var na = window.scrollY;
        if (Math.abs(na - sisteRull) < 4) return;
        sisteRull = na;
        paScroll();
      }, { passive: true });
      paScroll();
    }

    /* pekeren vipper boken litt */
    if (!rolig) {
      scene.addEventListener("pointermove", function (e) {
        var r = scene.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        bok.style.transform = "rotateX(" + (7 + y * 8).toFixed(1) + "deg) rotateY(" + (-16 + x * 16).toFixed(1) + "deg) rotateZ(-1.5deg)";
      });
      scene.addEventListener("pointerleave", function () {
        bok.style.transform = "";
      });
    }

    tegn();
  }

  /* ---------- 3. Avsløring: synlig som standard, glir på plass ---------- */
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
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(ting, function (t) { io.observe(t); });
  }

  /* ---------- 4. Skjema ---------- */
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) {
          ut.hidden = false;
          ut.textContent = "Takk! Forespørselen er registrert i demoen. I den ekte løsningen går den til post@dagaasbo.no, og du hører fra oss på hverdager 9–15.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* ---------- 5. Panel: bookinger og reiseruter ---------- */
  function panel() {
    var liste = document.querySelector("[data-bookinger]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiBekreftet = document.querySelector("[data-kpi-bekreftet]");
    var kpiVenter = document.querySelector("[data-kpi-venter]");
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
      linje.appendChild(t);
      linje.appendChild(s);
      logg.insertBefore(linje, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }

    function oppdater() {
      var bekreftet = 0, venter = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".booking"), function (rad) {
        var st = rad.getAttribute("data-status");
        if (st === "bekreftet") bekreftet++;
        if (st === "venter") venter++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiBekreftet) kpiBekreftet.textContent = bekreftet;
      if (kpiVenter) kpiVenter.textContent = venter;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".booking").length + " bookinger";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-bekreft]");
      if (!knapp) return;
      var rad = knapp.closest(".booking");
      if (!rad || rad.getAttribute("data-status") === "bekreftet") return;
      rad.setAttribute("data-status", "bekreftet");
      var st = rad.querySelector(".booking__status");
      if (st) st.textContent = "Sete bekreftet";
      knapp.disabled = true;
      knapp.textContent = "Bekreftet";
      var navn = rad.querySelector(".booking__navn");
      skrivLogg("Sete bekreftet: " + (navn ? navn.textContent : "ukjent"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".booking"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-status") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Dagens lister lastet. 8 bookinger, 3 venter på sete.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  kompass();
  dagbok();
  avslor();
  skjema();
  panel();
  ar();
})();