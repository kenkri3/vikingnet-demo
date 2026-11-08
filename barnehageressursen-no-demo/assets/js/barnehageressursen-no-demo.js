/* barnehageressursen-no-demo — pop-up-bok, boblemeny og vikarpanelet.
   Skrevet for hånd. Ingen biblioteker. */
(function () {
  "use strict";

  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Pop-up-boken ---------- */
  function bok() {
    var b = document.querySelector("[data-bok]");
    if (!b) return;
    var knapp = b.querySelector("[data-bla]");
    var aapen = false;

    function apne() {
      if (aapen) return;
      aapen = true;
      b.setAttribute("data-aapen", "ja");
      if (knapp) knapp.textContent = "Lukk boken";
    }
    function lukk() {
      aapen = false;
      b.setAttribute("data-aapen", "nei");
      if (knapp) knapp.textContent = "Bla i boken";
    }
    if (knapp) knapp.addEventListener("click", function () {
      if (aapen) lukk(); else apne();
    });

    if (rolig) { apne(); return; }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (o) {
        if (o[0].isIntersecting) { window.setTimeout(apne, 500); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(b);
    } else {
      apne();
    }
  }

  /* ---------- 1b. Fanene i leksikonet ---------- */
  function leksikon() {
    var lek = document.querySelector("[data-leksikon]");
    if (!lek) return;
    var faner = Array.prototype.slice.call(lek.querySelectorAll("[data-fane]"));
    var inn = Array.prototype.slice.call(lek.querySelectorAll("[data-innhold]"));
    var hoyre = lek.querySelector("[data-bla-inn]");
    faner.forEach(function (f) {
      f.addEventListener("click", function () {
        var n = f.getAttribute("data-fane");
        faner.forEach(function (x) { x.setAttribute("aria-selected", x === f ? "true" : "false"); });
        inn.forEach(function (p) { p.hidden = p.getAttribute("data-innhold") !== n; });
        if (hoyre) {
          hoyre.classList.remove("blar");
          void hoyre.offsetWidth;
          hoyre.classList.add("blar");
        }
      });
    });
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
    window.setTimeout(function () { ting.forEach(function (el) { el.classList.add("synlig"); }); }, 1600);
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
      melding.textContent = "Takk! Forespørselen er registrert i demoen – i en ekte side ville den gått til Barnehageressursen, og du får svar innen en time i arbeidstiden.";
      skj.reset();
    });
  }

  /* ---------- 4. Vikarpanelet ---------- */
  function panel() {
    var liste = document.getElementById("oppdrag-liste");
    if (!liste) return;

    var rader = Array.prototype.slice.call(liste.querySelectorAll(".oppdrag"));
    var varsel = document.getElementById("varsel");
    var varselTid = null;

    function si(tekst) {
      if (!varsel) return;
      varsel.textContent = tekst;
      varsel.setAttribute("data-vis", "ja");
      window.clearTimeout(varselTid);
      varselTid = window.setTimeout(function () { varsel.removeAttribute("data-vis"); }, 3600);
    }

    function tell() {
      var alle = rader.filter(function (r) { return r.getAttribute("data-status") !== "tildelt"; }).length;
      var kpi = document.getElementById("kpi-venter");
      if (kpi) kpi.textContent = String(rader.filter(function (r) { return r.getAttribute("data-status") === "venter"; }).length);
      var merke = document.getElementById("oppdrag-antall");
      if (merke) merke.textContent = rader.length + " oppdrag · " + alle + " uten vikar";
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (k) {
          k.setAttribute("aria-pressed", k === knapp ? "true" : "false");
        });
        rader.forEach(function (r) {
          r.hidden = valg !== "alle" && r.getAttribute("data-status") !== valg;
        });
        si("Filtrert: " + knapp.textContent.trim());
      });
    });
    tell();

    /* tildel vikar */
    var dialog = document.getElementById("tildel-dialog");
    var aktivRad = null;
    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-tildel]");
      if (!knapp) return;
      var rad = knapp.closest(".oppdrag");
      if (!rad) return;
      aktivRad = rad;
      if (dialog) {
        var tittel = document.getElementById("tildel-oppdrag");
        if (tittel) tittel.textContent = rad.getAttribute("data-navn") || "oppdraget";
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "open");
        var valg2 = document.getElementById("tildel-vikar");
        if (valg2) window.setTimeout(function () { valg2.focus(); }, 60);
      }
    });

    if (dialog) {
      var lukk = dialog.querySelector("[data-lukk]");
      if (lukk) lukk.addEventListener("click", function () {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      });
      dialog.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!aktivRad) return;
        var velger = document.getElementById("tildel-vikar");
        var navn = velger && velger.value ? velger.options[velger.selectedIndex].text : "Vikar";
        aktivRad.setAttribute("data-status", "tildelt");
        var status = aktivRad.querySelector(".status");
        if (status) { status.setAttribute("data-status", "tildelt"); status.textContent = "Tildelt"; }
        var person = aktivRad.querySelector(".oppdrag-vikar");
        if (person) person.textContent = navn;
        var knapp = aktivRad.querySelector("[data-tildel]");
        if (knapp) { knapp.setAttribute("disabled", "disabled"); knapp.textContent = "Tildelt"; }
        tell();
        si(navn + " er tildelt " + (aktivRad.getAttribute("data-navn") || "oppdraget"));
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      });
    }

    /* avdelinger: klikk markerer behov */
    var avdelinger = document.getElementById("avdeling-liste");
    if (avdelinger) {
      avdelinger.addEventListener("click", function (e) {
        var rad = e.target.closest(".avdeling");
        if (!rad) return;
        Array.prototype.forEach.call(avdelinger.querySelectorAll(".avdeling"), function (a) {
          a.style.background = "";
        });
        rad.style.background = "var(--krem-2)";
        si(rad.getAttribute("data-navn") + " · " + rad.getAttribute("data-behov"));
      });
    }
  }

  function start() {
    bok();
    leksikon();
    avslor();
    skjema();
    panel();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
