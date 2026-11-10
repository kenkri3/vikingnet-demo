/* berngaard-no-demo — boka som åpner seg ved scroll, skjema og saks panelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function bok() {
    var b = document.querySelector(".bok");
    if (!b) return;
    var hero = b.closest(".hero") || b;
    var venter = false;
    function mal() {
      venter = false;
      var r = hero.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (0 - r.top) / (r.height * 0.85) + 0.52));
      b.style.setProperty("--p", p.toFixed(3));
    }
    if (rolig) { b.style.setProperty("--p", "0.9"); return; }
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
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til post@berngaard.no.";
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
      if (handling === "ta") {
        rad.setAttribute("data-status", "pagaar");
        if (status) { status.setAttribute("data-status", "pagaar"); status.textContent = "Pågår"; }
        knapp.setAttribute("data-handling", "ferdig");
        knapp.textContent = "Merk avsluttet";
        si("Tatt: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Avsluttet"; }
        knapp.disabled = true;
        knapp.textContent = "Avsluttet";
        tell();
        si("Avsluttet: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    bok();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
