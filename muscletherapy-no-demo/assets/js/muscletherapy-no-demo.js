/* muscletherapy-no-demo — massasjebølger over hestens overlinje, skjema og ordrepanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function puls() {
    var l = document.getElementById("puls");
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
      // hestens overlinje som rolig kurve
      var baseY = h * 0.62;
      ctx.strokeStyle = "rgba(185, 201, 168, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var x = 0; x <= w; x += 10) {
        var y = baseY - Math.sin((x / w) * Math.PI) * h * 0.1;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // massasjebølger fra 22 motorer
      for (var i = 0; i < 22; i++) {
        var px = w * (0.12 + (i / 21) * 0.76);
        var py = baseY - Math.sin((px / w) * Math.PI) * h * 0.1;
        var fase = Math.sin(t * 2.4 - i * 0.55);
        var r = 8 + 10 * (0.5 + 0.5 * fase);
        ctx.strokeStyle = "rgba(143, 107, 214, " + (0.14 + 0.2 * (0.5 + 0.5 * fase)).toFixed(3) + ")";
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "rgba(247, 244, 251, 0.5)";
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      }
      // pulslinje nederst
      ctx.strokeStyle = "rgba(247, 244, 251, 0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x2 = 0; x2 <= w; x2 += 4) {
        var v = Math.sin(x2 * 0.03 + t * 2.2) * 5;
        if (x2 === 0) ctx.moveTo(x2, h * 0.85 - v); else ctx.lineTo(x2, h * 0.85 - v);
      }
      ctx.stroke();
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
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til info@muscletherapy.no.";
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
        if (status) { status.setAttribute("data-status", "pagaar"); status.textContent = "Pakkes"; }
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Merk sendt";
        si("Pakkes: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Sendt"; }
        knapp.disabled = true; knapp.textContent = "Sendt"; tell();
        si("Sendt: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }
  function start() { rot.classList.add("js"); puls(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
