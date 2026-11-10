/* argon-no-demo — oscilloskop-signal, skjema og servicepanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function signal() {
    var lerret = document.getElementById("signal");
    if (!lerret) return;
    var ctx = lerret.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, t0 = 0, pulser = [];

    function storrelse() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = lerret.clientWidth || 1;
      h = lerret.clientHeight || 1;
      lerret.width = Math.round(w * dpr);
      lerret.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pulser = [];
      for (var i = 0; i < 3; i++) pulser.push({ x: Math.random() * w, fart: 0.12 + Math.random() * 0.2 });
    }

    var sist = 0;
    function tegn(nu) {
      var dt = sist ? Math.min(0.05, (nu - sist) / 1000) : 0.016;
      sist = nu;
      t0 += dt;
      ctx.clearRect(0, 0, w, h);
      // rutenett
      ctx.strokeStyle = "rgba(183, 196, 255, 0.10)";
      ctx.lineWidth = 1;
      var rutenett = 46;
      for (var x = 0; x < w; x += rutenett) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (var y = 0; y < h; y += rutenett) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      // midtlinje
      ctx.strokeStyle = "rgba(183, 196, 255, 0.22)";
      ctx.beginPath(); ctx.moveTo(0, h * 0.55); ctx.lineTo(w, h * 0.55); ctx.stroke();
      // spenningstrace
      ctx.beginPath();
      for (var px = 0; px <= w; px += 2) {
        var v = Math.sin(px * 0.014 + t0 * 1.6) * 0.16 + Math.sin(px * 0.041 - t0 * 2.3) * 0.05;
        // spisse pulser
        for (var p = 0; p < pulser.length; p++) {
          var avstand = (px - pulser[p].x) / 30;
          v += Math.exp(-avstand * avstand) * 0.22;
        }
        var py = h * 0.55 - v * h;
        if (px === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = "rgba(224, 108, 79, 0.85)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // pulsmarkører
      for (var p2 = 0; p2 < pulser.length; p2++) {
        var pu = pulser[p2];
        pu.x += pu.fart * 60 * dt * 10;
        if (pu.x > w + 40) pu.x = -40;
        var lys = ctx.createRadialGradient(pu.x, h * 0.55, 0, pu.x, h * 0.55, 22);
        lys.addColorStop(0, "rgba(183, 196, 255, 0.55)");
        lys.addColorStop(1, "rgba(183, 196, 255, 0)");
        ctx.fillStyle = lys;
        ctx.beginPath(); ctx.arc(pu.x, h * 0.55, 22, 0, Math.PI * 2); ctx.fill();
      }
      if (!rolig) window.requestAnimationFrame(tegn);
    }

    storrelse();
    window.addEventListener("resize", storrelse);
    if (rolig) { tegn(0); return; }
    window.requestAnimationFrame(tegn);
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
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til kundeservice@argon.no.";
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
        si("Tatt: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Ferdig"; }
        knapp.disabled = true;
        knapp.textContent = "Ferdig";
        tell();
        si("Ferdig: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    signal();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
