/* dialogeiendom-no-demo — vipping av eiendomskort, faner og oppdragsliste.
   Skrevet for hånd. Ingen biblioteker. */
(function () {
  "use strict";

  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Eiendomskort som vippes ---------- */
  function kort() {
    if (rolig) return;
    var kortene = Array.prototype.slice.call(document.querySelectorAll(".eiendomskort"));
    if (!kortene.length) return;
    kortene.forEach(function (k) {
      var venter = false;
      k.addEventListener("pointermove", function (e) {
        if (venter) return;
        venter = true;
        window.requestAnimationFrame(function () {
          venter = false;
          var r = k.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          k.style.transform = "rotateX(" + (-y * 9).toFixed(2) + "deg) rotateY(" + (x * 11).toFixed(2) + "deg) translateZ(12px)";
        });
      });
      k.addEventListener("pointerleave", function () {
        k.style.transform = "";
      });
    });
  }

  /* ---------- 2. Faner: skygge når de fester seg ---------- */
  function faner() {
    var bjelke = document.querySelector(".faner");
    if (!bjelke) return;
    function sjekk() {
      var r = bjelke.getBoundingClientRect();
      bjelke.style.boxShadow = r.top <= 1 ? "0 10px 22px -22px rgba(29,43,38,.7)" : "none";
    }
    window.addEventListener("scroll", sjekk, { passive: true });
    sjekk();
  }

  /* ---------- 3. Avsløring ---------- */
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

  /* ---------- 4. Skjema ---------- */
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
      melding.textContent = "Takk. Henvendelsen er registrert i demoen – i en ekte side ville den gått til Dialog Eiendomsmegling, og du får svar fra en megler.";
      skj.reset();
    });
  }

  /* ---------- 5. Oppdragsliste ---------- */
  function panel() {
    var liste = document.getElementById("oppdrag-liste");
    if (!liste) return;
    var rader = Array.prototype.slice.call(liste.querySelectorAll(".oppdrag"));
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
      var aktive = rader.filter(function (r) { return r.getAttribute("data-status") !== "solgt"; }).length;
      var kpi = document.getElementById("kpi-aktive");
      if (kpi) kpi.textContent = String(aktive);
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
      var rad = knapp.closest(".oppdrag");
      if (!rad) return;
      var handling = knapp.getAttribute("data-handling");
      var status = rad.querySelector(".status");
      if (handling === "visning") {
        rad.setAttribute("data-status", "visning");
        if (status) { status.setAttribute("data-status", "visning"); status.textContent = "Visning"; }
        knapp.setAttribute("data-handling", "solgt");
        knapp.textContent = "Merk solgt";
        si("Visning planlagt: " + (rad.getAttribute("data-navn") || "oppdraget"));
      } else {
        rad.setAttribute("data-status", "solgt");
        if (status) { status.setAttribute("data-status", "solgt"); status.textContent = "Solgt"; }
        knapp.disabled = true;
        knapp.textContent = "Solgt";
        tell();
        si("Solgt: " + (rad.getAttribute("data-navn") || "oppdraget"));
      }
    });
    tell();
  }

  function start() {
    rot.classList.add("js");
    kort();
    faner();
    avslor();
    skjema();
    panel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
