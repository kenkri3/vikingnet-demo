/* alento-no-demo — isometrisk bygg som reises, skjema og prosjektpanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function bygg() {
    var l = document.getElementById("bygg");
    if (!l) return;
    var ctx = l.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1;
    function storrelse() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = l.clientWidth || 1; h = l.clientHeight || 1;
      l.width = Math.round(w * dpr); l.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    var t = 0, sist = 0;
    function tegn(nu) {
      var dt = sist ? Math.min(0.05, (nu - sist) / 1000) : 0.016; sist = nu; t += dt;
      ctx.clearRect(0, 0, w, h);
      var cx = w * 0.74, cy = h * 0.66, enhet = Math.min(w, h) * 0.055;
      ctx.lineWidth = 1.4;
      for (var lag = 0; lag < 5; lag++) {
        var p = Math.min(1, Math.max(0, (t * 0.55 - lag * 0.28)));
        if (p <= 0) continue;
        var ease = 1 - Math.pow(1 - p, 3);
        var y = cy - lag * enhet * 1.05;
        ctx.strokeStyle = "rgba(224, 179, 76, " + (0.25 + lag * 0.09).toFixed(3) + ")";
        // isometrisk boks
        var bw = enhet * 2.4 * ease, bh = enhet * 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, y - bh); ctx.lineTo(cx + bw, y); ctx.lineTo(cx, y + bh); ctx.lineTo(cx - bw, y); ctx.closePath();
        ctx.stroke();
        if (lag % 2 === 0) {
          ctx.strokeStyle = "rgba(244, 245, 242, 0.18)";
          ctx.beginPath(); ctx.moveTo(cx - bw, y); ctx.lineTo(cx - bw, y + enhet * 0.5); ctx.lineTo(cx, y + bh + enhet * 0.5); ctx.lineTo(cx, y + bh); ctx.stroke();
        }
      }
      ctx.strokeStyle = "rgba(111, 125, 120, 0.4)";
      ctx.beginPath(); ctx.moveTo(cx - enhet * 3, cy + enhet * 1.6); ctx.lineTo(cx + enhet * 3, cy + enhet * 1.6); ctx.stroke();
      if (t > 5 && !rolig) { t = 0; window.setTimeout(function () { window.requestAnimationFrame(tegn); }, 2500); return; }
      if (!rolig) window.requestAnimationFrame(tegn);
    }
    storrelse();
    window.addEventListener("resize", storrelse);
    if (rolig) { t = 9; tegn(0); return; }
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
      if (feil.length) { melding.textContent = "Fyll ut " + feil.join(", ") + " før du sender."; return; }
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til post@alento.no.";
      skj.reset();
    });
  }
  function panel() {
    var liste = document.getElementById("ordre-liste");
    if (!liste) return;
    var rader = Array.prototype.slice.call(liste.querySelectorAll(".ordre"));
    var varsel = document.getElementById("varsel");
    var tid = null;
    function si(t) { if (!varsel) return; varsel.textContent = t; varsel.setAttribute("data-vis", "ja"); window.clearTimeout(tid); tid = window.setTimeout(function () { varsel.removeAttribute("data-vis"); }, 3200); }
    function tell() { var k = document.getElementById("kpi-apne"); if (k) k.textContent = String(rader.filter(function (r) { return r.getAttribute("data-status") !== "ferdig"; }).length); }
    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (k) { k.setAttribute("aria-pressed", k === knapp ? "true" : "false"); });
        rader.forEach(function (r) { r.hidden = valg !== "alle" && r.getAttribute("data-status") !== valg; });
        si("Filtrert: " + knapp.textContent.trim());
      });
    });
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-handling]");
      if (!knapp) return;
      var rad = knapp.closest(".ordre"); if (!rad) return;
      var status = rad.querySelector(".status");
      if (knapp.getAttribute("data-handling") === "ta") {
        rad.setAttribute("data-status", "pagaar");
        if (status) { status.setAttribute("data-status", "pagaar"); status.textContent = "Pågår"; }
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Merk overlevert";
        si("Startet: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Overlevert"; }
        knapp.disabled = true; knapp.textContent = "Overlevert"; tell();
        si("Overlevert: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }
  function start() { rot.classList.add("js"); bygg(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
