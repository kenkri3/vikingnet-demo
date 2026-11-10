/* kbull-no-demo — kran som svinger og løfter, skjema og oppdragspanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function kran() {
    var l = document.getElementById("kran");
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
      var baseX = w * 0.74, baseY = h * 0.88;
      var mastH = Math.min(h * 0.62, 330);
      var bomL = Math.min(w * 0.44, 420);
      // mast og utrigger
      ctx.strokeStyle = "rgba(244, 180, 26, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(baseX, baseY - mastH); ctx.stroke();
      var sving = Math.sin(t * 0.5) * 0.28;
      ctx.beginPath(); ctx.moveTo(baseX, baseY - mastH);
      ctx.lineTo(baseX - Math.cos(sving) * bomL, baseY - mastH + Math.sin(sving) * 24);
      ctx.stroke();
      // vaier og last
      var lastX = baseX - Math.cos(sving) * bomL * 0.92;
      var lastY = baseY - mastH + Math.sin(sving) * 24;
      var svaier = 60 + Math.sin(t * 0.9) * 16;
      ctx.strokeStyle = "rgba(242, 243, 244, 0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(lastX, lastY + svaier); ctx.stroke();
      ctx.fillStyle = "rgba(244, 180, 26, 0.9)";
      ctx.fillRect(lastX - 26, lastY + svaier, 52, 24);
      ctx.strokeStyle = "rgba(244, 180, 26, 0.5)";
      ctx.strokeRect(lastX - 26, lastY + svaier, 52, 24);
      // bakken
      ctx.strokeStyle = "rgba(107, 127, 146, 0.35)";
      ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(w, baseY); ctx.stroke();
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
      if (feil.length) { melding.textContent = "Fyll ut " + feil.join(", ") + " før du sender."; return; }
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til kran@kbull.no.";
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
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Merk utført";
        si("Startet: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Utført"; }
        knapp.disabled = true; knapp.textContent = "Utført"; tell();
        si("Utført: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }
  function start() { rot.classList.add("js"); kran(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
