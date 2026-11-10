/* veni-no — roterende nodekart, skjema og rådgivningspanelet. */
(function () {
  "use strict";
  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function nett() {
    var kart = document.querySelector(".nett");
    if (!kart) return;
    var indre = kart.querySelector(".nett-indre");
    if (!indre) return;
    var punkter = [[22,32],[52,18],[74,46],[40,62],[64,74],[86,58],[14,70]];
    var kanter = [[0,1],[1,2],[0,3],[3,4],[4,5],[2,5],[0,6],[6,3]];
    punkter.forEach(function (p, i) {
      var n = document.createElement("span");
      n.className = "n" + (i === 4 ? " n--stor" : "");
      n.style.left = p[0] + "%";
      n.style.top = p[1] + "%";
      indre.appendChild(n);
    });
    kanter.forEach(function (k) {
      var a = punkter[k[0]], b = punkter[k[1]];
      var el = document.createElement("span");
      el.className = "kant";
      var x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1];
      var len = Math.hypot(x2 - x1, y2 - y1);
      var ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      el.style.left = x1 + "%";
      el.style.top = y1 + "%";
      el.style.width = len + "%";
      el.style.transform = "rotate(" + ang + "deg)";
      el.style.opacity = "0.5";
      indre.appendChild(el);
    });
    var hero = kart.closest(".hero") || kart;
    var venter = false;
    function mal() {
      venter = false;
      var r = hero.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (0 - r.top) / (r.height * 0.9) + 0.35));
      kart.style.setProperty("--p", p.toFixed(3));
    }
    if (rolig) { kart.style.setProperty("--p", "0.5"); return; }
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
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til salg@veni.no.";
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
  function start() { rot.classList.add("js"); nett(); skjema(); panel(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
