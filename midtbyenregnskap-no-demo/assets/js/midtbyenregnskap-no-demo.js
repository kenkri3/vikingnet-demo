/* midtbyenregnskap-no-demo — tellerhjul for regnskapstall, skjema og oppgavepanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function teller() {
    var l = document.getElementById("teller");
    if (!l) return;
    var ctx = l.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1;
    var tall = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
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
      var boksH = 46, boksB = 38, startX = w * 0.62, startY = h * 0.3;
      var antall = 4;
      for (var i = 0; i < antall; i++) {
        var x = startX + i * (boksB + 8);
        ctx.strokeStyle = "rgba(154, 163, 184, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x, startY, boksB, boksH);
        // rullende siffer
        var fart = 0.6 + i * 0.25;
        var indeks = Math.floor((t * fart * 3 + i * 2) % tall.length);
        ctx.save();
        ctx.beginPath(); ctx.rect(x, startY, boksB, boksH); ctx.clip();
        ctx.font = "600 22px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var offset = ((t * fart * 3 + i * 2) % 1) * boksH;
        for (var k = -1; k <= 1; k++) {
          var idx = (indeks + k + tall.length) % tall.length;
          ctx.fillStyle = k === 0 ? "rgba(247, 246, 242, 0.9)" : "rgba(154, 163, 184, 0.35)";
          ctx.fillText(tall[idx], x + boksB / 2, startY + boksH / 2 + k * boksH + offset);
        }
        ctx.restore();
      }
      // strekgulv
      ctx.strokeStyle = "rgba(111, 143, 114, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(startX, startY + boksH + 16); ctx.lineTo(startX + antall * (boksB + 8), startY + boksH + 16); ctx.stroke();
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
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til epost@midtbyenregnskap.no.";
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
        if (status) { status.setAttribute("data-status", "pagaar"); status.textContent = "Behandles"; }
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Merk levert";
        si("Tatt: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Levert"; }
        knapp.disabled = true; knapp.textContent = "Levert"; tell();
        si("Levert: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }
  function start() { rot.classList.add("js"); teller(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
