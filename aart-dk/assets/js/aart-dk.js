/* aart-dk — bygningstegning som tegnes ved scroll, skjema og prosjektpanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tegning() {
    var svg = document.querySelector(".tegning svg");
    if (!svg) return;
    var streker = Array.prototype.slice.call(svg.querySelectorAll(".linje"));
    if (!streker.length) return;
    var lengder = streker.map(function (s) { try { return s.getTotalLength(); } catch (e) { return 0; } });
    streker.forEach(function (s, i) { s.style.strokeDasharray = lengder[i] + " " + lengder[i]; s.style.strokeDashoffset = rolig ? 0 : lengder[i]; });
    if (rolig) return;
    var boks = svg.closest(".tegning") || svg;
    var hero = svg.closest(".hero") || boks;
    var venter = false;
    function mal() {
      venter = false;
      var r = boks.getBoundingClientRect();
      var h = window.innerHeight;
      var p = Math.min(1, Math.max(0, (h * 0.95 - r.top) / (h * 0.55)));
      streker.forEach(function (s, i) {
        var f = Math.min(1, Math.max(0, (p - i * 0.05) / 0.8));
        s.style.strokeDashoffset = (lengder[i] * (1 - f)).toFixed(1);
      });
      var hr = hero.getBoundingClientRect();
      boks.style.setProperty("--p", Math.min(1, Math.max(0, -hr.top / (hr.height || 1))).toFixed(3));
    }
    window.addEventListener("scroll", function () { if (!venter) { venter = true; window.requestAnimationFrame(mal); } }, { passive: true });
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
      if (feil.length) { melding.textContent = "Fyll ut " + feil.join(", ") + " før du sender."; return; }
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til AART.";
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
        knapp.setAttribute("data-handling", "ferdig"); knapp.textContent = "Merk levert";
        si("Startet: " + (rad.getAttribute("data-navn") || ""));
      } else {
        rad.setAttribute("data-status", "ferdig");
        if (status) { status.setAttribute("data-status", "ferdig"); status.textContent = "Levert"; }
        knapp.disabled = true; knapp.textContent = "Levert"; tell();
        si("Levert: " + (rad.getAttribute("data-navn") || ""));
      }
    });
    tell();
  }
  function start() { rot.classList.add("js"); tegning(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
