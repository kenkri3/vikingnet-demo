/* elfokus-no-demo — nordlys over Finnsnes, skjema og servicepanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function nordlys() {
    var lerret = document.getElementById("nordlys");
    if (!lerret) return;
    var ctx = lerret.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, band = [];
    function bygg() {
      band = [];
      for (var i = 0; i < 4; i++) {
        band.push({ y: h * (0.12 + i * 0.13), amp: 26 + i * 12, f: 0.004 + i * 0.0016, p: Math.random() * 6.28, a: 0.10 - i * 0.018, fart: 0.25 + i * 0.12 });
      }
    }
    function storrelse() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = lerret.clientWidth || 1; h = lerret.clientHeight || 1;
      lerret.width = Math.round(w * dpr); lerret.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bygg();
    }
    var t = 0, sist = 0;
    function tegn(nu) {
      var dt = sist ? Math.min(0.05, (nu - sist) / 1000) : 0.016; sist = nu; t += dt;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < band.length; i++) {
        var b = band[i];
        var g = ctx.createLinearGradient(0, b.y - 90, 0, b.y + 120);
        g.addColorStop(0, "rgba(127, 209, 192, 0)");
        g.addColorStop(0.45, "rgba(127, 209, 192, " + b.a + ")");
        g.addColorStop(0.75, "rgba(127, 209, 192, " + (b.a * 0.5) + ")");
        g.addColorStop(1, "rgba(90, 125, 140, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, b.y + 90);
        for (var x = 0; x <= w; x += 10) {
          var y = b.y + Math.sin(x * b.f + b.p + t * b.fart) * b.amp + Math.sin(x * b.f * 2.7 + t * 0.6) * b.amp * 0.35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, b.y - 90);
        ctx.closePath();
        ctx.fill();
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
      if (feil.length) {
        melding.textContent = "Fyll ut " + feil.join(", ") + " før du sender.";
        var første = skj.querySelector(feil[0] === "e-post" ? "#epost" : feil[0] === "melding" ? "#melding" : "#navn");
        if (første) første.focus();
        return;
      }
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til El Fokus AS.";
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
      if (handling === "ta") {
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

  function start() { rot.classList.add("js"); nordlys(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
