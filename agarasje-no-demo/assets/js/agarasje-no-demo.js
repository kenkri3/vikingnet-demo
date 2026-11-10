/* agarasje-no-demo — 3D-port som åpner ved scroll, og tilbudspanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function port() {
    var scene = document.querySelector(".garasje");
    if (!scene) return;
    var hero = scene.closest(".hero") || scene;
    var venter = false;
    function mal() {
      venter = false;
      var r = hero.getBoundingClientRect();
      var h = window.innerHeight;
      var framdrift = Math.min(1, Math.max(0, (0 - r.top) / (r.height * 0.75) + 0.12));
      var p = 0.55 + framdrift * 0.45;
      scene.style.setProperty("--p", p.toFixed(3));
    }
    if (rolig) { scene.style.setProperty("--p", "0.9"); return; }
    window.addEventListener("scroll", function () {
      if (!venter) { venter = true; window.requestAnimationFrame(mal); }
    }, { passive: true });
    window.addEventListener("resize", mal);
    mal();
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
      melding.textContent = "Takk. Forespørselen er registrert i demoen – i en ekte side ville den gått til post@agarasje.no.";
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
      var rad = knapp.closest(".ordre");
      if (!rad) return;
      var handling = knapp.getAttribute("data-handling");
      var status = rad.querySelector(".status");
      if (handling === "befaring") {
        rad.setAttribute("data-status", "befaring");
        if (status) { status.setAttribute("data-status", "befaring"); status.textContent = "Befaring"; }
        knapp.setAttribute("data-handling", "tilbud");
        knapp.textContent = "Send tilbud";
        si("Befaring satt opp: " + (rad.getAttribute("data-navn") || ""));
      } else if (handling === "tilbud") {
        rad.setAttribute("data-status", "tilbud");
        if (status) { status.setAttribute("data-status", "tilbud"); status.textContent = "Tilbud sendt"; }
        knapp.setAttribute("data-handling", "ferdig");
        knapp.textContent = "Merk solgt";
        si("Tilbud sendt: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Solgt"; }
        knapp.disabled = true;
        knapp.textContent = "Solgt";
        tell();
        si("Solgt: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    port();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
