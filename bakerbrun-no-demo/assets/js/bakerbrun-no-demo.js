/* bakerbrun-no-demo — melstøv i lyset, skjema og bestillingspanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function mel() {
    var l = document.getElementById("mel");
    if (!l) return;
    var ctx = l.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, stov = [];
    function bygg() {
      stov = [];
      for (var i = 0; i < 70; i++) stov.push({ x: Math.random() * w, y: Math.random() * h, r: 0.7 + Math.random() * 1.9, o: 0.1 + Math.random() * 0.4, f: 0.2 + Math.random() * 0.6, d: Math.random() * 6.28 });
    }
    function storrelse() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = l.clientWidth || 1; h = l.clientHeight || 1;
      l.width = Math.round(w * dpr); l.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bygg();
    }
    var t = 0, sist = 0;
    function tegn(nu) {
      var dt = sist ? Math.min(0.05, (nu - sist) / 1000) : 0.016; sist = nu; t += dt;
      ctx.clearRect(0, 0, w, h);
      // lysstråler
      for (var b = 0; b < 3; b++) {
        var x0 = w * (0.25 + b * 0.22);
        var g = ctx.createLinearGradient(x0, 0, x0 + w * 0.16, h);
        g.addColorStop(0, "rgba(251, 246, 239, 0.07)");
        g.addColorStop(1, "rgba(251, 246, 239, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x0, 0); ctx.lineTo(x0 + w * 0.1, 0); ctx.lineTo(x0 + w * 0.24, h); ctx.lineTo(x0 + w * 0.08, h);
        ctx.closePath(); ctx.fill();
      }
      for (var i = 0; i < stov.length; i++) {
        var s = stov[i];
        s.y += (6 + 10 * s.f) * dt;
        s.x += Math.sin(t * 0.5 + s.d) * 8 * dt;
        if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w; }
        ctx.fillStyle = "rgba(251, 246, 239, " + s.o + ")";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
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
      if (feil.length) { melding.textContent = "Fyll ut " + feil.join(", ") + " før du sender."; return; }
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til kundeservice@bakerbrun.no.";
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
      if (knapp.getAttribute("data-handling") === "baker") {
        rad.setAttribute("data-status", "baker");
        if (status) { status.setAttribute("data-status", "baker"); status.textContent = "Bakes"; }
        knapp.setAttribute("data-handling", "klar"); knapp.textContent = "Merk klar";
        si("Satt i produksjon: " + (rad.getAttribute("data-navn") || ""));
      } else if (knapp.getAttribute("data-handling") === "klar") {
        rad.setAttribute("data-status", "klar");
        if (status) { status.setAttribute("data-status", "klar"); status.textContent = "Klar"; }
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Hentet";
        si("Klar for henting: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Hentet"; }
        knapp.disabled = true; knapp.textContent = "Hentet"; tell();
        si("Hentet: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }
  function start() { rot.classList.add("js"); mel(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
