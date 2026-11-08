/* datelco-no-demo — signalpulser på canvas, kortstokk og saksliste.
   Skrevet for hånd. Ingen biblioteker. */
(function () {
  "use strict";

  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Signalpulser ---------- */
  function signal() {
    var lerret = document.getElementById("signal");
    if (!lerret) return;
    var ctx = lerret.getContext("2d");
    if (!ctx) return;

    var froe = 7;
    function tilfeldig() {
      froe = (froe * 16807) % 2147483647;
      return (froe - 1) / 2147483646;
    }

    var noder = [];
    var kanter = [];
    var pulser = [];
    var bredde = 0, hoyde = 0, dpr = 1;

    function bygg() {
      noder = [];
      kanter = [];
      pulser = [];
      var antall = bredde < 700 ? 14 : 24;
      for (var i = 0; i < antall; i++) {
        noder.push({ x: tilfeldig(), y: tilfeldig() });
      }
      for (var j = 0; j < noder.length; j++) {
        var n = noder[j];
        var nærmest = [];
        for (var k = 0; k < noder.length; k++) {
          if (k === j) continue;
          var d = Math.hypot(noder[k].x - n.x, noder[k].y - n.y);
          nærmest.push({ i: k, d: d });
        }
        nærmest.sort(function (a, b) { return a.d - b.d; });
        for (var m = 0; m < Math.min(2, nærmest.length); m++) {
          var par = [j, nærmest[m].i].sort(function (a, b) { return a - b; });
          var finnes = kanter.some(function (k) { return k[0] === par[0] && k[1] === par[1]; });
          if (!finnes) kanter.push(par);
        }
      }
      for (var p = 0; p < Math.min(9, kanter.length); p++) {
        pulser.push({ kant: Math.floor(tilfeldig() * kanter.length), t: tilfeldig(), fart: 0.18 + tilfeldig() * 0.22, ring: 0 });
      }
    }

    function storrelse() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      bredde = lerret.clientWidth || lerret.parentNode.clientWidth || 1;
      hoyde = lerret.clientHeight || lerret.parentNode.clientHeight || 1;
      lerret.width = Math.round(bredde * dpr);
      lerret.height = Math.round(hoyde * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bygg();
    }

    var sist = 0;
    function tegn(nu) {
      var dt = sist ? Math.min(0.05, (nu - sist) / 1000) : 0.016;
      sist = nu;
      ctx.clearRect(0, 0, bredde, hoyde);

      // kanter
      ctx.lineWidth = 1;
      for (var i = 0; i < kanter.length; i++) {
        var a = noder[kanter[i][0]], b = noder[kanter[i][1]];
        ctx.strokeStyle = "rgba(47, 224, 168, 0.10)";
        ctx.beginPath();
        ctx.moveTo(a.x * bredde, a.y * hoyde);
        ctx.lineTo(b.x * bredde, b.y * hoyde);
        ctx.stroke();
      }

      // pulser
      for (var p = 0; p < pulser.length; p++) {
        var pu = pulser[p];
        pu.t += pu.fart * dt;
        if (pu.t > 1) { pu.t = 0; pu.kant = Math.floor(Math.random() * kanter.length); }
        var ka = noder[kanter[pu.kant][0]], kb = noder[kanter[pu.kant][1]];
        var x = (ka.x + (kb.x - ka.x) * pu.t) * bredde;
        var y = (ka.y + (kb.y - ka.y) * pu.t) * hoyde;
        var lys = ctx.createRadialGradient(x, y, 0, x, y, 16);
        lys.addColorStop(0, "rgba(47, 224, 168, 0.95)");
        lys.addColorStop(0.4, "rgba(47, 224, 168, 0.28)");
        lys.addColorStop(1, "rgba(47, 224, 168, 0)");
        ctx.fillStyle = lys;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#eafff7";
        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // noder
      for (var n = 0; n < noder.length; n++) {
        var nd = noder[n];
        ctx.fillStyle = "rgba(47, 224, 168, 0.55)";
        ctx.beginPath();
        ctx.arc(nd.x * bredde, nd.y * hoyde, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!rolig) window.requestAnimationFrame(tegn);
    }

    storrelse();
    window.addEventListener("resize", storrelse);
    if (rolig) {
      // tegn én rolig ramme
      ctx.clearRect(0, 0, bredde, hoyde);
      tegn(0);
      return;
    }
    window.requestAnimationFrame(tegn);
  }

  /* ---------- 2. Avsløring ---------- */
  function avslor() {
    var ting = Array.prototype.slice.call(document.querySelectorAll(".avslor"));
    if (!ting.length) return;
    if (rolig || !("IntersectionObserver" in window)) {
      ting.forEach(function (el) { el.classList.add("synlig"); });
      return;
    }
    ting.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.8) el.classList.add("synlig");
    });
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("synlig"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px 12% 0px", threshold: 0.05 });
    ting.forEach(function (el) { if (!el.classList.contains("synlig")) io.observe(el); });
    window.setTimeout(function () { ting.forEach(function (el) { el.classList.add("synlig"); }); }, 550);
  }

  /* ---------- 3. Skjema ---------- */
  function skjema() {
    var skj = document.querySelector("form[data-skjema]");
    if (!skj) return;
    var melding = skj.querySelector(".skjema-melding");
    skj.addEventListener("submit", function (e) {
      e.preventDefault();
      var navn = skj.querySelector("#navn"), epost = skj.querySelector("#epost"), tekst = skj.querySelector("#melding");
      var feil = [];
      if (navn && navn.value.trim().length < 2) feil.push("navn");
      if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(epost.value.trim())) feil.push("e-post");
      if (tekst && tekst.value.trim().length < 8) feil.push("melding");
      if (!melding) { skj.reset(); return; }
      melding.setAttribute("data-vis", "ja");
      if (feil.length) {
        melding.textContent = "Fyll ut " + feil.join(", ") + " før du sender.";
        var første = skj.querySelector(feil[0] === "e-post" ? "#epost" : feil[0] === "melding" ? "#melding" : "#navn");
        if (første) første.focus();
        return;
      }
      melding.textContent = "Takk. Forespørselen er registrert i demoen – i en ekte side ville den gått til firmapost@datelco.no.";
      skj.reset();
    });
  }

  /* ---------- 4. Saksliste ---------- */
  function panel() {
    var liste = document.getElementById("sak-liste");
    if (!liste) return;
    var rader = Array.prototype.slice.call(liste.querySelectorAll(".sak"));
    var varsel = document.getElementById("varsel");
    var tid = null;
    function si(t) {
      if (!varsel) return;
      varsel.textContent = t;
      varsel.setAttribute("data-vis", "ja");
      window.clearTimeout(tid);
      tid = window.setTimeout(function () { varsel.removeAttribute("data-vis"); }, 3200);
    }
    function tell() {
      var åpne = rader.filter(function (r) { return r.getAttribute("data-status") !== "ferdig"; }).length;
      var kpi = document.getElementById("kpi-apne");
      if (kpi) kpi.textContent = String(åpne);
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (k) {
          k.setAttribute("aria-pressed", k === knapp ? "true" : "false");
        });
        rader.forEach(function (r) { r.hidden = valg !== "alle" && r.getAttribute("data-status") !== valg; });
        si("Filtrert: " + knapp.textContent.trim());
      });
    });
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-handling]");
      if (!knapp) return;
      var rad = knapp.closest(".sak");
      if (!rad) return;
      var handling = knapp.getAttribute("data-handling");
      var status = rad.querySelector(".status");
      if (handling === "ta") {
        rad.setAttribute("data-status", "pagaar");
        if (status) { status.setAttribute("data-status", "pagaar"); status.textContent = "Pågår"; }
        knapp.setAttribute("data-handling", "løs");
        knapp.textContent = "Merk løst";
        si("Sak tatt: " + (rad.getAttribute("data-navn") || "saken"));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Løst"; }
        knapp.disabled = true;
        knapp.textContent = "Løst";
        tell();
        si("Sak løst: " + (rad.getAttribute("data-navn") || "saken"));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    signal();
    avslor();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
