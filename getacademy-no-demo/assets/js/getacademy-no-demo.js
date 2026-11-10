/* getacademy-no-demo — kodelinjer som skrives, skjema og klassestatus. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function kode() {
    var l = document.getElementById("kode");
    if (!l) return;
    var ctx = l.getContext("2d");
    if (!ctx) return;
    var linjer = ["const student = await GET.start();", "function tenke(logisk) { return losning; }", "if (interesse) { sok('frontend'); }", "class Klasse { discord() { return 'sammen'; } }", "// 30 studiepoeng pa et halvt ar", "export function jobb() { return 'IT'; }"];
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
      ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textBaseline = "middle";
      var startY = h * 0.24, radH = 30;
      var total = linjer.length;
      for (var i = 0; i < total; i++) {
        var forsink = i * 0.9;
        var tegnTegn = Math.max(0, Math.min(1, (t - forsink) / 1.4));
        var tekst = linjer[i].slice(0, Math.round(linjer[i].length * tegnTegn));
        var y = startY + i * radH;
        ctx.fillStyle = "rgba(143, 138, 179, 0.45)";
        ctx.fillText(("0" + (i + 1)).slice(-2), w * 0.52, y);
        ctx.fillStyle = i % 3 === 0 ? "rgba(245, 196, 81, 0.75)" : "rgba(247, 245, 255, 0.55)";
        ctx.fillText(tekst, w * 0.58, y);
        if (tegnTegn > 0 && tegnTegn < 1) {
          ctx.fillStyle = "rgba(245, 196, 81, 0.9)";
          ctx.fillRect(w * 0.58 + ctx.measureText(tekst).width + 3, y - 7, 7, 14);
        }
      }
      if (t > total * 0.9 + 3 && !rolig) { t = 0; window.setTimeout(function () { window.requestAnimationFrame(tegn); }, 2400); return; }
      if (!rolig) window.requestAnimationFrame(tegn);
    }
    storrelse();
    window.addEventListener("resize", storrelse);
    if (rolig) { t = 999; tegn(0); return; }
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
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til GET Academy.";
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
        if (status) { status.setAttribute("data-status", "pagaar"); status.textContent = "Følges opp"; }
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Merk fullført";
        si("Tatt: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Fullført"; }
        knapp.disabled = true; knapp.textContent = "Fullført"; tell();
        si("Fullført: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }
  function start() { rot.classList.add("js"); kode(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
