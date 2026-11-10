/* pbt-no-demo — snø over bygningsrekke, skjema og driftspanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tegnKanvas() {
    var l = document.getElementById("kanvas");
    if (!l) return;
    var ctx = l.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, snofnugg = [];
    function bygg() {
      snofnugg = [];
      for (var i = 0; i < 90; i++) snofnugg.push({ x: Math.random() * w, y: Math.random() * h, r: 0.8 + Math.random() * 2.2, f: 8 + Math.random() * 26, d: Math.random() * 6.28, o: 0.15 + Math.random() * 0.45 });
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
      // bygningssilhuetter
      ctx.fillStyle = "rgba(42, 58, 54, 0.85)";
      var grunn = h * 0.78;
      var bredder = [w * 0.14, w * 0.1, w * 0.16, w * 0.12];
      var hoyder = [h * 0.3, h * 0.2, h * 0.36, h * 0.24];
      var x = w * 0.42;
      for (var i = 0; i < 4; i++) {
        ctx.fillRect(x, grunn - hoyder[i], bredder[i], hoyder[i]);
        ctx.fillStyle = "rgba(127, 176, 105, 0.5)";
        for (var vy = grunn - hoyder[i] + 10; vy < grunn - 12; vy += 18) {
          for (var vx = x + 8; vx < x + bredder[i] - 8; vx += 16) ctx.fillRect(vx, vy, 6, 7);
        }
        ctx.fillStyle = "rgba(42, 58, 54, 0.85)";
        x += bredder[i] + 6;
      }
      // snø
      for (var k = 0; k < snofnugg.length; k++) {
        var s = snofnugg[k];
        s.y += s.f * dt;
        s.x += Math.sin(t * 0.6 + s.d) * 10 * dt;
        if (s.y > h + 3) { s.y = -3; s.x = Math.random() * w; }
        ctx.fillStyle = "rgba(245, 246, 242, " + s.o.toFixed(3) + ")";
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
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til info@bravida.no.";
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
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Merk ferdig";
        si("Startet: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Ferdig"; }
        knapp.disabled = true; knapp.textContent = "Ferdig"; tell();
        si("Ferdig: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }
  function start() { rot.classList.add("js"); tegnKanvas(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
