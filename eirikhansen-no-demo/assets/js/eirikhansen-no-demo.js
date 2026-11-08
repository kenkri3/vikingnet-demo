/* eirikhansen-no-demo — steinlagenes parallakse, avsløring og befaringer.
   Skrevet for hånd. Ingen biblioteker. */
(function () {
  "use strict";

  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Parallakse i steinlagene ---------- */
  function stein() {
    var vegg = document.querySelector(".stein");
    if (!vegg) return;
    var venter = false;
    function mal() {
      venter = false;
      var r = vegg.getBoundingClientRect();
      var h = window.innerHeight;
      var p = (h - r.top) / (h + r.height);
      p = Math.min(1.3, Math.max(-0.3, p));
      vegg.style.setProperty("--p", p.toFixed(3));
    }
    if (rolig) { vegg.style.setProperty("--p", "0.5"); return; }
    window.addEventListener("scroll", function () {
      if (venter) return;
      venter = true;
      window.requestAnimationFrame(mal);
    }, { passive: true });
    window.addEventListener("resize", mal);
    mal();
  }

  /* ---------- 2. Avsløring ved scroll ---------- */
  function avslor() {
    var ting = Array.prototype.slice.call(document.querySelectorAll(".avslor"));
    if (!ting.length) return;
    if (rolig || !("IntersectionObserver" in window)) {
      ting.forEach(function (el) { el.classList.add("synlig"); });
      return;
    }
    ting.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 1.7) el.classList.add("synlig");
    });
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("synlig"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px 10% 0px", threshold: 0.05 });
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
      var navn = skj.querySelector("#navn");
      var epost = skj.querySelector("#epost");
      var tekst = skj.querySelector("#melding");
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
      melding.textContent = "Takk. Forespørselen er registrert i demoen – i en ekte side ville den gått til murmester@eirikhansen.no, og du får svar innen én virkedag.";
      skj.reset();
    });
  }

  /* ---------- 4. Panelet: prosjekter og befaringer ---------- */
  function panel() {
    var liste = document.getElementById("prosjekt-liste");
    if (!liste) return;

    var rader = Array.prototype.slice.call(liste.querySelectorAll(".prosjekt-rad"));
    var varsel = document.getElementById("varsel");
    var varselTid = null;
    function si(tekst) {
      if (!varsel) return;
      varsel.textContent = tekst;
      varsel.setAttribute("data-vis", "ja");
      window.clearTimeout(varselTid);
      varselTid = window.setTimeout(function () { varsel.removeAttribute("data-vis"); }, 3400);
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (k) {
          k.setAttribute("aria-pressed", k === knapp ? "true" : "false");
        });
        rader.forEach(function (r) { r.hidden = valg !== "alle" && r.getAttribute("data-type") !== valg; });
        var teller = document.getElementById("prosjekt-antall");
        if (teller) teller.textContent = rader.filter(function (r) { return !r.hidden; }).length + " prosjekter";
        si("Filtrert: " + knapp.textContent.trim());
      });
    });

    /* befaring -> planlegg */
    var dialog = document.getElementById("plan-dialog");
    var aktiv = null;
    var befaringer = document.getElementById("befaring-liste");

    if (befaringer) {
      befaringer.addEventListener("click", function (e) {
        var knapp = e.target.closest("[data-planlegg]");
        if (!knapp) return;
        aktiv = knapp.closest(".befaring");
        if (!dialog) return;
        var navn = document.getElementById("plan-navn");
        if (navn) navn.textContent = aktiv.getAttribute("data-navn") || "befaringen";
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "open");
        var dato = document.getElementById("plan-dato");
        if (dato) window.setTimeout(function () { dato.focus(); }, 60);
      });
    }

    if (dialog) {
      var lukk = dialog.querySelector("[data-lukk]");
      if (lukk) lukk.addEventListener("click", function () {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      });
      dialog.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!aktiv) return;
        var dato = document.getElementById("plan-dato");
        var montor = document.getElementById("plan-montor");
        var verdi = dato && dato.value ? dato.value : "";
        var navn = montor ? montor.options[montor.selectedIndex].text : "";
        aktiv.setAttribute("data-planlagt", "ja");
        var status = aktiv.querySelector(".status");
        if (status) { status.setAttribute("data-status", "planlagt"); status.textContent = "Planlagt"; }
        var meta = aktiv.querySelector("[data-plan-info]");
        if (meta) meta.textContent = (verdi ? "Planlagt " + verdi : "Planlagt") + " · " + navn;
        var knapp = aktiv.querySelector("[data-planlegg]");
        if (knapp) { knapp.setAttribute("disabled", "disabled"); knapp.textContent = "Planlagt"; }
        var kpi = document.getElementById("kpi-befaringer");
        if (kpi) kpi.textContent = String(Math.max(0, (parseInt(kpi.textContent, 10) || 0) - 1));
        si("Befaring planlagt med " + navn);
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      });
    }

    var eksport = document.getElementById("eksporter");
    if (eksport) eksport.addEventListener("click", function () {
      var linjer = ["Prosjekt;Kunde;Sted;Type;Status;Frist"];
      rader.filter(function (r) { return !r.hidden; }).forEach(function (r) {
        linjer.push([
          r.getAttribute("data-navn") || "",
          r.getAttribute("data-kunde") || "",
          r.getAttribute("data-sted") || "",
          r.getAttribute("data-type-navn") || "",
          (r.querySelector(".status") || {}).textContent || "",
          r.getAttribute("data-frist") || ""
        ].join(";"));
      });
      var blob = new Blob([linjer.join("\n")], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "eirikhansen-prosjekter.csv";
      document.body.appendChild(a);
      a.click();
      window.setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
      si("Prosjektlisten er lastet ned som CSV");
    });
  }

  function start() {
    document.documentElement.classList.add("js");
    stein();
    avslor();
    skjema();
    panel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
