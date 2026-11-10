/* dampbakeriet-no-demo — damp som stig, skjema og bestillingspanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function damp() {
    var lerret = document.getElementById("damp");
    if (!lerret) return;
    var ctx = lerret.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, skyer = [];
    function bygg() {
      skyer = [];
      var ant = Math.max(14, Math.round(w / 34));
      for (var i = 0; i < ant; i++) {
        skyer.push({ x: Math.random() * w, y: h * (0.35 + Math.random() * 0.65), r: 22 + Math.random() * 46, f: 0.2 + Math.random() * 0.5, o: 0.03 + Math.random() * 0.06 });
      }
    }
    function storrelse() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = lerret.clientWidth || 1; h = lerret.clientHeight || 1;
      lerret.width = Math.round(w * dpr); lerret.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bygg();
    }
    var sist = 0;
    function tegn(nu) {
      var dt = sist ? Math.min(0.05, (nu - sist) / 1000) : 0.016; sist = nu;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < skyer.length; i++) {
        var s = skyer[i];
        s.y -= (12 + 22 * s.f) * dt;
        s.x += Math.sin((nu / 2600) + i) * 6 * dt;
        if (s.y + s.r < 0) { s.y = h + s.r; s.x = Math.random() * w; }
        var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        g.addColorStop(0, "rgba(248, 242, 230, " + s.o + ")");
        g.addColorStop(1, "rgba(248, 242, 230, 0)");
        ctx.fillStyle = g;
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
      if (navn && navn.value.trim().length < 2) feil.push("namn");
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
      melding.textContent = "Takk! Meldinga er registrert i demoen – i ei ekte side ville ho gått til bakeriet.";
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
    function tell() {
      var åpne = rader.filter(function (r) { return r.getAttribute("data-status") !== "ferdig"; }).length;
      var kpi = document.getElementById("kpi-apne");
      if (kpi) kpi.textContent = String(åpne);
    }
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
      var rad = knapp.closest(".ordre");
      if (!rad) return;
      var handling = knapp.getAttribute("data-handling");
      var status = rad.querySelector(".status");
      if (handling === "baker") {
        rad.setAttribute("data-status", "baker");
        if (status) { status.setAttribute("data-status", "baker"); status.textContent = "Bakar"; }
        knapp.setAttribute("data-handling", "klar"); knapp.textContent = "Merk klar";
        si("Sett i produksjon: " + (rad.getAttribute("data-navn") || ""));
      } else if (handling === "klar") {
        rad.setAttribute("data-status", "klar");
        if (status) { status.setAttribute("data-status", "klar"); status.textContent = "Klar"; }
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Henta";
        si("Klar for henting: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Henta"; }
        knapp.disabled = true; knapp.textContent = "Henta"; tell();
        si("Henta: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }

  function start() { rot.classList.add("js"); damp(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
