/* dybedahl-no-demo — bølgepulser på canvas, loddrett meny og saksliste.
   Skrevet for hånd. Ingen biblioteker. */
(function () {
  "use strict";

  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Bølgepulser ---------- */
  function bolger() {
    var lerret = document.getElementById("bolger");
    if (!lerret) return;
    var ctx = lerret.getContext("2d");
    if (!ctx) return;
    var bredde = 0, hoyde = 0, dpr = 1;
    var start = performance.now();

    function storrelse() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.8);
      bredde = lerret.clientWidth || lerret.parentNode.clientWidth || 1;
      hoyde = lerret.clientHeight || 1;
      lerret.width = Math.round(bredde * dpr);
      lerret.height = Math.round(hoyde * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    var lag = [
      { amp: 0.30, frek: 0.021, fart: 0.55, farge: "168,216,232", bred: 1.4, fase: 0 },
      { amp: 0.20, frek: 0.033, fart: 0.82, farge: "201,107,66", bred: 1.1, fase: 1.7 },
      { amp: 0.13, frek: 0.052, fart: 1.15, farge: "242,245,246", bred: 0.9, fase: 3.1 }
    ];

    function tegn(nu) {
      var t = (nu - start) / 1000;
      ctx.clearRect(0, 0, bredde, hoyde);
      var midt = hoyde * 0.52;
      for (var i = 0; i < lag.length; i++) {
        var L = lag[i];
        ctx.beginPath();
        for (var x = 0; x <= bredde; x += 2) {
          // puls som vandrer gjennom bølgen
          var pos = ((t * L.fart * 0.22 + L.fase * 0.1) % 1.5) - 0.25;
          var avstand = (x / bredde) - pos;
          var puls = Math.exp(-(avstand * avstand) / 0.008);
          var amp = L.amp * hoyde * (0.45 + 1.5 * puls);
          var y = midt + Math.sin(x * L.frek + t * L.fart + L.fase) * amp * 0.5
                       + Math.sin(x * L.frek * 2.3 - t * L.fart * 0.7) * amp * 0.18;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(" + L.farge + "," + (0.35 + 0.2 * (i === 0 ? 1 : 0)) + ")";
        ctx.lineWidth = L.bred;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
      // vandrende puls-prikk
      var p = ((t * 0.22) % 1.4) - 0.2;
      var px = p * bredde;
      if (px > 0 && px < bredde) {
        var lys = ctx.createRadialGradient(px, midt, 0, px, midt, 18);
        lys.addColorStop(0, "rgba(168,216,232,.9)");
        lys.addColorStop(1, "rgba(168,216,232,0)");
        ctx.fillStyle = lys;
        ctx.beginPath();
        ctx.arc(px, midt, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!rolig) window.requestAnimationFrame(tegn);
    }

    storrelse();
    window.addEventListener("resize", storrelse);
    tegn(start);
  }

  /* ---------- 2. Avsløring ---------- */
  function avslor() {
    var ting = Array.prototype.slice.call(document.querySelectorAll(".avslor"));
    if (!ting.length) return;
    if (rolig || !("IntersectionObserver" in window)) {
      ting.forEach(function (el) { el.classList.add("synlig"); });
      return;
    }
    ting.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.8) el.classList.add("synlig");
    });
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("synlig"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px 12% 0px", threshold: 0.05 });
    ting.forEach(function (el) { if (!el.classList.contains("synlig")) io.observe(el); });
    window.setTimeout(function () { ting.forEach(function (el) { el.classList.add("synlig"); }); }, 550);
  }

  /* ---------- 3. Skjema ---------- */
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
      melding.textContent = "Takk. Forespørselen er registrert i demoen – i en ekte side ville den gått til post@dybtel.no.";
      skj.reset();
    });
  }

  /* ---------- 4. Saksliste ---------- */
  function panel() {
    var liste = document.getElementById("sak-liste");
    if (!liste) return;
    var rader = Array.prototype.slice.call(liste.querySelectorAll(".sak"));
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
      var åpne = rader.filter(function (r) { return r.getAttribute("data-status") !== "ferdig"; }).length;
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
      var rad = knapp.closest(".sak");
      if (!rad) return;
      var handling = knapp.getAttribute("data-handling");
      var status = rad.querySelector(".status");
      if (handling === "ta") {
        rad.setAttribute("data-status", "pagaar");
        if (status) { status.setAttribute("data-status", "pagaar"); status.textContent = "Pågår"; }
        knapp.setAttribute("data-handling", "løs");
        knapp.textContent = "Merk løst";
        si("Sak tatt: " + (rad.getAttribute("data-navn") || "saken"));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Løst"; }
        knapp.disabled = true;
        knapp.textContent = "Løst";
        tell();
        si("Sak løst: " + (rad.getAttribute("data-navn") || "saken"));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    bolger();
    avslor();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
