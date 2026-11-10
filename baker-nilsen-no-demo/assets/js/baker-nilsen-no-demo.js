/* baker-nilsen-no-demo — strektegning som tegnes ved scroll, og bestillingspanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tegn() {
    var svg = document.querySelector(".tegn svg");
    if (!svg) return;
    var streker = Array.prototype.slice.call(svg.querySelectorAll(".strek"));
    if (!streker.length) return;
    var lengder = streker.map(function (s) {
      try { return s.getTotalLength(); } catch (e) { return 0; }
    });
    streker.forEach(function (s, i) {
      s.style.strokeDasharray = lengder[i] + " " + lengder[i];
      s.style.strokeDashoffset = rolig ? 0 : lengder[i];
    });
    if (rolig) return;
    var boks = svg.closest(".tegn") || svg;
    var venter = false;
    function mal() {
      venter = false;
      var r = boks.getBoundingClientRect();
      var h = window.innerHeight;
      // 0 når elementet er like under folden, 1 når det er godt innenfor
      var p = Math.min(1, Math.max(0, (h * 0.92 - r.top) / (h * 0.5)));
      streker.forEach(function (s, i) {
        var forsink = i * 0.06;
        var egen = Math.min(1, Math.max(0, (p - forsink) / (1 - forsink)));
        s.style.strokeDashoffset = (lengder[i] * (1 - egen)).toFixed(1);
      });
    }
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
      melding.textContent = "Takk. Bestillingen er registrert i demoen – i en ekte side ville den gått til post@baker-nilsen.no.";
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
      if (handling === "baker") {
        rad.setAttribute("data-status", "baker");
        if (status) { status.setAttribute("data-status", "baker"); status.textContent = "Bakes"; }
        knapp.setAttribute("data-handling", "klar");
        knapp.textContent = "Merk klar";
        si("Satt i produksjon: " + (rad.getAttribute("data-navn") || ""));
      } else if (handling === "klar") {
        rad.setAttribute("data-status", "klar");
        if (status) { status.setAttribute("data-status", "klar"); status.textContent = "Klar"; }
        knapp.setAttribute("data-handling", "ferdig");
        knapp.textContent = "Hentet";
        si("Klar for henting: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Hentet"; }
        knapp.disabled = true;
        knapp.textContent = "Hentet";
        tell();
        si("Hentet: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    tegn();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
