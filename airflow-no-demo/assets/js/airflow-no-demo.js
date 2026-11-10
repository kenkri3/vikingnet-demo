/* airflow-no-demo — luftstrøm på canvas, ventilmeny og ordrepanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function luft() {
    var lerret = document.getElementById("luftstrom");
    if (!lerret) return;
    var ctx = lerret.getContext("2d");
    if (!ctx) return;
    var w = 0, h = 0, dpr = 1, partikler = [], kanaler = [];

    function bygg() {
      partikler = []; kanaler = [];
      var antallKanaler = Math.max(2, Math.round(h / 220));
      for (var k = 0; k < antallKanaler; k++) {
        kanaler.push({ y: h * (0.2 + (k + 0.5) / antallKanaler * 0.7), amp: 14 + Math.random() * 22, fase: Math.random() * 6.28 });
      }
      var antall = Math.max(60, Math.round(w / 9));
      for (var i = 0; i < antall; i++) {
        partikler.push({
          x: Math.random() * w,
          k: Math.floor(Math.random() * kanaler.length),
          f: 0.25 + Math.random() * 0.75,
          r: 0.7 + Math.random() * 1.6,
          o: 0.18 + Math.random() * 0.5
        });
      }
    }

    function storrelse() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = lerret.clientWidth || 1;
      h = lerret.clientHeight || 1;
      lerret.width = Math.round(w * dpr);
      lerret.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bygg();
    }

    var sist = 0;
    function tegn(nu) {
      var dt = sist ? Math.min(0.05, (nu - sist) / 1000) : 0.016;
      sist = nu;
      ctx.clearRect(0, 0, w, h);
      // kanaler
      ctx.lineWidth = 1;
      for (var k = 0; k < kanaler.length; k++) {
        var ka = kanaler[k];
        ctx.strokeStyle = "rgba(138, 215, 224, 0.13)";
        ctx.beginPath();
        for (var x = 0; x <= w; x += 8) {
          var y = ka.y + Math.sin(x * 0.006 + ka.fase) * ka.amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // partikler
      for (var i = 0; i < partikler.length; i++) {
        var p = partikler[i];
        var ka2 = kanaler[p.k] || kanaler[0];
        p.x += (40 + 70 * p.f) * dt;
        if (p.x > w + 10) p.x = -10;
        var y2 = ka2.y + Math.sin(p.x * 0.006 + ka2.fase) * ka2.amp + Math.sin(p.x * 0.02 + p.o * 10) * 4;
        ctx.fillStyle = "rgba(138, 215, 224, " + p.o + ")";
        ctx.beginPath();
        ctx.arc(p.x, y2, p.r, 0, Math.PI * 2);
        ctx.fill();
        // liten hale
        ctx.fillStyle = "rgba(138, 215, 224, " + (p.o * 0.4) + ")";
        ctx.beginPath();
        ctx.arc(p.x - p.r * 3, y2, p.r * 0.7, 0, Math.PI * 2);
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
      melding.textContent = "Takk. Forespørselen er registrert i demoen – i en ekte side ville den gått til Airflow.";
      skj.reset();
    });
  }

  function panel() {
    var liste = document.getElementById("ordre-liste");
    if (!liste) return;
    var rader = Array.prototype.slice.call(liste.querySelectorAll(".ordre"));
    var varsel = document.getElementById("varsel");
    var tid = null;
    function si(t) {
      if (!varsel) return;
      varsel.textContent = t;
      varsel.setAttribute("data-vis", "ja");
      window.clearTimeout(tid);
      tid = window.setTimeout(function () { varsel.removeAttribute("data-vis"); }, 3200);
    }
    function tell() {
      var åpne = rader.filter(function (r) { return r.getAttribute("data-status") !== "sendt"; }).length;
      var kpi = document.getElementById("kpi-apne");
      if (kpi) kpi.textContent = String(åpne);
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (k) {
          k.setAttribute("aria-pressed", k === knapp ? "true" : "false");
        });
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
      if (handling === "plukk") {
        rad.setAttribute("data-status", "plukk");
        if (status) { status.setAttribute("data-status", "plukk"); status.textContent = "Plukkes"; }
        knapp.setAttribute("data-handling", "send");
        knapp.textContent = "Merk sendt";
        si("Plukker: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "sendt");
        if (status) { status.setAttribute("data-status", "sendt"); status.textContent = "Sendt"; }
        knapp.disabled = true;
        knapp.textContent = "Sendt";
        tell();
        si("Sendt: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    luft();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
