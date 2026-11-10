/* acomelektro-no-demo — ledningsnett med strømpulser, meny og servicepanel. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function lednett() {
    var lerret = document.getElementById("lednett");
    if (!lerret) return;
    var ctx = lerret.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, spor = [], pulser = [];

    function bygg() {
      spor = []; pulser = [];
      var rader = Math.max(3, Math.round(h / 90));
      var kolonner = Math.max(4, Math.round(w / 150));
      var gy = h / rader, gx = w / kolonner;
      for (var r = 0; r < rader; r++) {
        var y = gy * (r + 0.5);
        var x = 0;
        var punkter = [[0, y]];
        while (x < w) {
          var steg = gx * (0.6 + Math.random() * 0.9);
          x = Math.min(w, x + steg);
          y = Math.min(h - 8, Math.max(8, y + (Math.random() - 0.5) * gy * 0.8));
          punkter.push([x, y]);
        }
        spor.push(punkter);
        for (var p = 0; p < 2; p++) {
          pulser.push({ spor: r, t: Math.random(), fart: 0.05 + Math.random() * 0.08 });
        }
      }
    }

    function storrelse() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = lerret.clientWidth || 1;
      h = lerret.clientHeight || 1;
      lerret.width = Math.round(w * dpr);
      lerret.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bygg();
    }

    function punkt(sporIx, t) {
      var s = spor[sporIx];
      if (!s) return [0, 0];
      var total = 0, i, lengder = [];
      for (i = 1; i < s.length; i++) {
        var d = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
        lengder.push(d); total += d;
      }
      var maal = t * total, sum = 0;
      for (i = 1; i < s.length; i++) {
        if (sum + lengder[i - 1] >= maal) {
          var f = (maal - sum) / (lengder[i - 1] || 1);
          return [s[i - 1][0] + (s[i][0] - s[i - 1][0]) * f, s[i - 1][1] + (s[i][1] - s[i - 1][1]) * f];
        }
        sum += lengder[i - 1];
      }
      return s[s.length - 1];
    }

    var sist = 0;
    function tegn(nu) {
      var dt = sist ? Math.min(0.05, (nu - sist) / 1000) : 0.016;
      sist = nu;
      ctx.clearRect(0, 0, w, h);
      // spor
      ctx.lineWidth = 1;
      for (var i = 0; i < spor.length; i++) {
        var s = spor[i];
        ctx.strokeStyle = "rgba(90, 169, 201, 0.16)";
        ctx.beginPath();
        ctx.moveTo(s[0][0], s[0][1]);
        for (var k = 1; k < s.length; k++) ctx.lineTo(s[k][0], s[k][1]);
        ctx.stroke();
        // knutepunkter
        ctx.fillStyle = "rgba(90, 169, 201, 0.30)";
        for (var n = 0; n < s.length; n += 2) {
          ctx.beginPath();
          ctx.arc(s[n][0], s[n][1], 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // pulser
      for (var p = 0; p < pulser.length; p++) {
        var pu = pulser[p];
        pu.t += pu.fart * dt * 10;
        if (pu.t > 1) pu.t = 0;
        var pos = punkt(pu.spor, pu.t);
        var lys = ctx.createRadialGradient(pos[0], pos[1], 0, pos[0], pos[1], 16);
        lys.addColorStop(0, "rgba(255, 209, 102, 0.95)");
        lys.addColorStop(0.4, "rgba(255, 209, 102, 0.28)");
        lys.addColorStop(1, "rgba(255, 209, 102, 0)");
        ctx.fillStyle = lys;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff8e3";
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!rolig) window.requestAnimationFrame(tegn);
    }

    storrelse();
    window.addEventListener("resize", storrelse);
    if (rolig) { tegn(0); return; }
    window.requestAnimationFrame(tegn);
  }

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
      melding.textContent = "Takk. Forespørselen er registrert i demoen – i en ekte side ville den gått til post@acomelektro.no.";
      skj.reset();
    });
  }

  function panel() {
    var liste = document.getElementById("ordre-liste");
    if (!liste) return;
    var rader = Array.prototype.slice.call(liste.querySelectorAll(".ordre"));
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
      var rad = knapp.closest(".ordre");
      if (!rad) return;
      var handling = knapp.getAttribute("data-handling");
      var status = rad.querySelector(".status");
      if (handling === "ta") {
        rad.setAttribute("data-status", "pagaar");
        if (status) { status.setAttribute("data-status", "pagaar"); status.textContent = "Pågår"; }
        knapp.setAttribute("data-handling", "ferdig");
        knapp.textContent = "Merk ferdig";
        si("Oppdrag startet: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Ferdig"; }
        knapp.disabled = true;
        knapp.textContent = "Ferdig";
        tell();
        si("Oppdrag fullført: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    lednett();
    avslor();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
