/* garnesdata-no-demo — datapakker mellom lag, skjema og oppgavepanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function pakker() {
    var lerret = document.getElementById("pakker");
    if (!lerret) return;
    var ctx = lerret.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, lag = [], pakker = [];
    function bygg() {
      lag = []; pakker = [];
      var antall = Math.max(3, Math.round(h / 90));
      for (var i = 0; i < antall; i++) lag.push({ y: h * ((i + 0.6) / antall), f: 0.5 + i * 0.12 });
      for (var j = 0; j < 9; j++) pakker.push({ x: Math.random() * w, l: Math.floor(Math.random() * lag.length), fart: 26 + Math.random() * 46, st: 2 + Math.random() * 2.4 });
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
      for (var i = 0; i < lag.length; i++) {
        ctx.strokeStyle = "rgba(47, 129, 247, 0.16)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, lag[i].y + .5); ctx.lineTo(w, lag[i].y + .5); ctx.stroke();
        ctx.fillStyle = "rgba(57, 211, 83, 0.35)";
        for (var x = 0; x < w; x += 64) ctx.fillRect(x, lag[i].y - 2, 4, 1.5);
      }
      for (var j = 0; j < pakker.length; j++) {
        var p = pakker[j], l = lag[p.l] || lag[0];
        p.x += p.fart * dt * l.f;
        if (p.x > w + 20) p.x = -20;
        ctx.fillStyle = "rgba(57, 211, 83, 0.8)";
        ctx.fillRect(p.x, l.y - p.st / 2, p.st * 2.2, p.st);
        ctx.fillStyle = "rgba(57, 211, 83, 0.25)";
        ctx.fillRect(p.x - p.st * 2.6, l.y - p.st / 2, p.st * 2, p.st);
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
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til Garnes Data.";
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
    function tell() { var kpi = document.getElementById("kpi-apne"); if (kpi) kpi.textContent = String(rader.filter(function (r) { return r.getAttribute("data-status") !== "ferdig"; }).length); }
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
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Merk løst";
        si("Tatt: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Løst"; }
        knapp.disabled = true; knapp.textContent = "Løst"; tell();
        si("Løst: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }
  function start() { rot.classList.add("js"); pakker(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
