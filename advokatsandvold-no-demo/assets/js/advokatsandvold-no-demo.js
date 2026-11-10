/* Advokat Sandvold — blekkskrift på canvas, masthead-kapitler og saksstatus. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Signatur: teksten skrives med blekk på canvas når den kommer i syne */
  function blekk() {
    var ramme = document.querySelector("[data-blekk]");
    if (!ramme) return;
    var canvas = ramme.querySelector("canvas");
    var tekst = ramme.querySelector(".blekk__tekst");
    if (!canvas || !tekst) return;

    var ctx = null;
    try { ctx = canvas.getContext("2d"); } catch (e) { ctx = null; }
    if (!ctx || rolig) { canvas.style.display = "none"; return; }

    var setning = "Jeg er ekspert i saker der NAV har blitt en motpart.";
    var sti = null;
    var skrevet = 0;

    function storrelse() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var r = ramme.getBoundingClientRect();
      var w = Math.max(280, Math.round(r.width));
      var linjer = [];
      var ord = setning.split(" ");
      var fs = Math.max(19, Math.min(30, Math.round(w / 22)));
      var skrift = "italic 600 " + fs + "px Spectral, Georgia, serif";
      ctx.font = skrift;
      var linje = "";
      ord.forEach(function (o) {
        var test = linje ? linje + " " + o : o;
        if (ctx.measureText(test).width > w - 12 && linje) { linjer.push(linje); linje = o; }
        else linje = test;
      });
      if (linje) linjer.push(linje);
      var lh = Math.round(fs * 1.45);
      var h = linjer.length * lh + 14;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = skrift;
      sti = { w: w, fs: fs, lh: lh, linjer: linjer, skrift: skrift };
      skriv(skrevet);
    }

    function skriv(antall) {
      if (!sti) return;
      ctx.clearRect(0, 0, sti.w, sti.linjer.length * sti.lh + 14);
      ctx.font = sti.skrift;
      ctx.fillStyle = "#6d2632";
      var igjen = antall;
      sti.linjer.forEach(function (l, i) {
        if (igjen <= 0) return;
        var del = l.slice(0, igjen);
        igjen -= l.length;
        ctx.fillText(del, 6, 6 + sti.fs + i * sti.lh);
      });
    }

    var total = 0;
    function tell() {
      total = sti.linjer.reduce(function (a, l) { return a + l.length; }, 0);
    }

    function animer() {
      skrevet += 2;
      skriv(skrevet);
      if (skrevet < total) requestAnimationFrame(animer);
    }

    storrelse();
    tell();
    skriv(0);
    tekst.classList.add("skjul");

    /* Teksten står ferdig skrevet som standard (så den alltid er lesbar og
       skjermbilder blir riktige). Animasjonen starter bare når seksjonen
       scrolles inn nedenfra. */
    skriv(total);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (o) {
        o.forEach(function (x) {
          if (x.isIntersecting && window.scrollY > 40) {
            skrevet = 0;
            animer();
            io.disconnect();
          }
        });
      }, { threshold: 0.35 });
      io.observe(ramme);
    }

    var t = null;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { storrelse(); tell(); skriv(total); }, 220);
    });
  }

  /* 2. Kapitler: marker aktiv side */
  function kapitler() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".kap"), function (a) {
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
          ut.textContent = "Takk. Henvendelsen er registrert i demoen – i den ekte løsningen går den til gs@advokatsandvold.no.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* 5. Panel: saker mottatt → avklaring → klage → behandles → avsluttet */
  function panel() {
    var liste = document.querySelector("[data-saker]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiKlage = document.querySelector("[data-kpi-klage]");
    var kpiBehandles = document.querySelector("[data-kpi-behandles]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["mottatt", "avklaring", "klage", "behandles", "avsluttet"];
    var navn = { mottatt: "Mottatt", avklaring: "Avklaring", klage: "Klage sendt", behandles: "Behandles", avsluttet: "Avsluttet" };

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
      var klage = 0, behandles = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".sak"), function (rad) {
        var st = rad.getAttribute("data-steg");
        if (st === "klage") klage++;
        if (st === "behandles") behandles++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiKlage) kpiKlage.textContent = klage;
      if (kpiBehandles) kpiBehandles.textContent = behandles;
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
      if (nytt === "avsluttet") { knapp.disabled = true; knapp.textContent = "Avsluttet"; }
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

  blekk();
  kapitler();
  avslor();
  skjema();
  panel();
  ar();
})();