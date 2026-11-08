/* industristillas-no-demo — 3D-montering, fremdrift og panelmekanikk.
   Skrevet for hånd. Ingen biblioteker. */
(function () {
  "use strict";

  var rot = document.documentElement;
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Fremdriftslinjen i sideindeksen ---------- */
  function fremdrift() {
    var linje = document.querySelector(".indeks-linje span");
    var venter = false;
    function mal() {
      venter = false;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 40 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      if (linje) linje.style.height = (p * 100).toFixed(2) + "%";
    }
    window.addEventListener("scroll", function () {
      if (!venter) { venter = true; window.requestAnimationFrame(mal); }
    }, { passive: true });
    window.addEventListener("resize", mal);
    mal();
  }

  /* ---------- 2. Stillas som monteres ---------- */
  function stillas() {
    var scene = document.querySelector(".stillas");
    if (!scene) return;
    var hjerte = scene.closest(".hero") || scene;
    var lavere = null;

    function parallakse() {
      var r = hjerte.getBoundingClientRect();
      var p = 1 - Math.min(1, Math.max(0, (r.bottom) / (r.height + window.innerHeight)));
      scene.style.setProperty("--p", p.toFixed(3));
    }

    if (!rolig) {
      window.addEventListener("scroll", function () {
        if (lavere) return;
        lavere = window.requestAnimationFrame(function () { lavere = null; parallakse(); });
      }, { passive: true });
      parallakse();
      window.setTimeout(function () { scene.classList.add("montert"); }, 180);
    } else {
      scene.classList.add("montert");
    }
  }

  /* ---------- 3. Avsløring ved scroll ---------- */
  function avslor() {
    var ting = Array.prototype.slice.call(document.querySelectorAll(".avslor"));
    if (!ting.length) return;
    if (rolig || !("IntersectionObserver" in window)) {
      ting.forEach(function (el) { el.classList.add("synlig"); });
      return;
    }
    ting.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.7) el.classList.add("synlig");
    });
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("synlig"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px 12% 0px", threshold: 0.05 });
    ting.forEach(function (el) { if (!el.classList.contains("synlig")) io.observe(el); });
    window.setTimeout(function () {
      ting.forEach(function (el) { el.classList.add("synlig"); });
    }, 1600);
  }

  /* ---------- 4. Skjema ---------- */
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
      if (melding) {
        melding.setAttribute("data-vis", "ja");
        if (feil.length) {
          melding.textContent = "Fyll ut " + feil.join(", ") + " før du sender.";
          var første = skj.querySelector(feil[0] === "e-post" ? "#epost" : feil[0] === "melding" ? "#melding" : "#navn");
          if (første) første.focus();
          return;
        }
        melding.textContent = "Takk. Forespørselen er registrert i demoen – i en ekte side ville den gått til post@industristillas.no.";
      }
      skj.reset();
    });
  }

  /* ---------- 5. Panel ---------- */
  function panel() {
    var liste = document.getElementById("prosjekt-liste");
    if (!liste) return;

    var rader = Array.prototype.slice.call(liste.querySelectorAll(".prosjekt-rad"));
    var teller = document.getElementById("prosjekt-antall");
    var varsel = document.getElementById("varsel");
    var varselTid = null;

    function si(tekst) {
      if (!varsel) return;
      varsel.textContent = tekst;
      varsel.setAttribute("data-vis", "ja");
      window.clearTimeout(varselTid);
      varselTid = window.setTimeout(function () { varsel.removeAttribute("data-vis"); }, 3400);
    }

    function tell() {
      var n = rader.filter(function (r) { return !r.hidden; }).length;
      if (teller) teller.textContent = n + " prosjekter";
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (k) {
          k.setAttribute("aria-pressed", k === knapp ? "true" : "false");
        });
        rader.forEach(function (r) { r.hidden = valg !== "alle" && r.getAttribute("data-type") !== valg; });
        tell();
        si("Filtrert: " + knapp.textContent.trim());
      });
    });
    tell();

    /* lukk avvik */
    function oppdaterAvvik() {
      var apne = document.querySelectorAll('.avvik[data-lukket="nei"]').length;
      var kpi = document.getElementById("kpi-avvik");
      if (kpi) kpi.textContent = String(apne);
      var merke = document.getElementById("avvik-antall");
      if (merke) merke.textContent = apne + " åpne avvik";
    }

    var avvikListe = document.getElementById("avvik-liste");
    if (avvikListe) {
      avvikListe.addEventListener("click", function (e) {
        var knapp = e.target.closest("[data-lukk-avvik]");
        if (!knapp) return;
        var rad = knapp.closest(".avvik");
        if (!rad) return;
        rad.setAttribute("data-lukket", "ja");
        var kvittering = rad.querySelector("[data-avvik-status]");
        if (kvittering) kvittering.textContent = "Lukket · kvittert av vakt";
        oppdaterAvvik();
        si("Avviket er lukket og loggført");
      });
      oppdaterAvvik();
    }

    /* meld avvik */
    var dialog = document.getElementById("avvik-dialog");
    var apneKnapp = document.getElementById("meld-avvik");
    if (apneKnapp && dialog) {
      apneKnapp.addEventListener("click", function () {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "open");
        var felt = document.getElementById("avvik-tekst");
        if (felt) window.setTimeout(function () { felt.focus(); }, 60);
      });
      var lukk = dialog.querySelector("[data-lukk]");
      if (lukk) lukk.addEventListener("click", function () {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      });
      dialog.addEventListener("submit", function (e) {
        e.preventDefault();
        var tekst = document.getElementById("avvik-tekst");
        var sted = document.getElementById("avvik-sted");
        var alvor = document.getElementById("avvik-alvor");
        var verdi = tekst && tekst.value.trim();
        if (!verdi) { if (tekst) tekst.focus(); return; }
        var nivaa = alvor ? alvor.value : "middels";
        var navn = { hoy: "Høy", middels: "Middels", lav: "Lav" }[nivaa] || "Middels";
        var li = document.createElement("li");
        li.className = "avvik";
        li.setAttribute("data-lukket", "nei");
        var trygt = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };
        li.innerHTML = '<div class="avvik-topp"><span class="alvor" data-alvor="' + nivaa + '">' + navn + '</span>' +
          '<span class="avvik-tittel">' + trygt(verdi) + '</span></div>' +
          '<p class="avvik-meta">' + trygt((sted && sted.value) || "Uten sted") + ' · meldt nå · <span data-avvik-status>Åpent</span></p>' +
          '<div><button class="liten-knapp" type="button" data-lukk-avvik>Lukk avvik</button></div>';
        avvikListe.insertBefore(li, avvikListe.firstChild);
        oppdaterAvvik();
        si("Nytt avvik registrert");
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
        if (tekst) tekst.value = "";
      });
    }

    /* last ned prosjektliste */
    var eksport = document.getElementById("eksporter");
    if (eksport) eksport.addEventListener("click", function () {
      var linjer = ["Prosjekt;Kunde;Sted;Type;Status;Stillasere"];
      rader.filter(function (r) { return !r.hidden; }).forEach(function (r) {
        linjer.push([
          r.getAttribute("data-navn") || "",
          r.getAttribute("data-kunde") || "",
          r.getAttribute("data-sted") || "",
          r.getAttribute("data-type-navn") || "",
          (r.querySelector(".status") || {}).textContent || "",
          r.getAttribute("data-folk") || ""
        ].join(";"));
      });
      var blob = new Blob([linjer.join("\n")], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "industristillas-prosjekter.csv";
      document.body.appendChild(a);
      a.click();
      window.setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
      si("Prosjektlisten er lastet ned som CSV");
    });
  }

  function start() {
    fremdrift();
    stillas();
    avslor();
    skjema();
    panel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
