/* giset-no-demo — synstavle, skjema og timepanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tegnKanvas() {
    var l = document.getElementById("kanvas");
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
    var rader = ["E", "F P", "T O Z", "L P E D", "P E C F D", "E D F C Z P"];
    var t = 0, sist = 0;
    function tegn(nu) {
      var dt = sist ? Math.min(0.05, (nu - sist) / 1000) : 0.016; sist = nu; t += dt;
      ctx.clearRect(0, 0, w, h);
      var hoyre = w * 0.62, topp = h * 0.2, steg = (h * 0.55) / rader.length;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (var i = 0; i < rader.length; i++) {
        var p = Math.min(1, Math.max(0, t * 0.7 - i * 0.18));
        var ease = 1 - Math.pow(1 - p, 3);
        var str = Math.round(rader[i].length * ease) || 0;
        if (!str) continue;
        var storrelseTekst = 30 - i * 4;
        ctx.font = "600 " + storrelseTekst + "px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = i === 2 ? "rgba(143, 182, 201, 0.95)" : "rgba(247, 248, 249, " + (0.75 - i * 0.08).toFixed(3) + ")";
        ctx.fillText(rader[i].slice(0, str), hoyre, topp + i * steg);
      }
      if (t > 6 && !rolig) { t = 0; window.setTimeout(function () { window.requestAnimationFrame(tegn); }, 2600); return; }
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
