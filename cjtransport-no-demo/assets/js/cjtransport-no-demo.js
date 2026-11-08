/* CJ Transport og Flyttebyrå AS — bevegelse og 3D. Ingen biblioteker. */
(function () {
  "use strict";

  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Rutelinjen tegnes når man scroller ---------- */
  function rutetegning() {
    var svg = document.querySelector("[data-rute-svg]");
    if (!svg) return;
    var linje = svg.querySelector(".rutelinje--tegn");
    var last = svg.querySelector(".rutelast");
    var punkter = Array.prototype.slice.call(svg.querySelectorAll(".rutepunkt"));
    if (!linje || !last) return;

    var lengde = 0;
    try { lengde = linje.getTotalLength(); } catch (e) { lengde = 0; }
    if (!lengde) return;

    linje.style.strokeDasharray = lengde + " " + lengde;
    linje.style.strokeDashoffset = rolig ? 0 : lengde;

    var siste = -1;
    function tegn() {
      var ramme = svg.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      var synlig = (vindu - ramme.top) / (ramme.height + vindu * 0.62);
      var framgang = Math.min(1, Math.max(0, synlig));
      if (rolig) framgang = 1;
      if (Math.abs(framgang - siste) < 0.004) return;
      siste = framgang;

      linje.style.strokeDashoffset = lengde * (1 - framgang);

      var p = linje.getPointAtLength(lengde * framgang);
      last.setAttribute("cx", p.x);
      last.setAttribute("cy", p.y);

      var naAdd = Math.round(framgang * punkter.length);
      punkter.forEach(function (punkt, i) {
        punkt.classList.toggle("aktiv", i < naAdd);
      });
    }

    tegn();
    window.addEventListener("scroll", tegn, { passive: true });
    window.addEventListener("resize", tegn);
  }

  /* ---------- 2. 3D-stabel av flyttekasser ---------- */
  function byggKasser() {
    var stabel = document.querySelector("[data-kasser]");
    if (!stabel) return;

    var maal = { w: 150, h: 120, d: 118 };
    var plan = [
      { x: -56, y: 66, z: 10, rot: -7 },
      { x: 56, y: 62, z: -8, rot: 6 },
      { x: -6, y: -56, z: 0, rot: -3 },
      { x: 8, y: -176, z: 2, rot: 5 }
    ];

    function flate(klasse, w, h, transform) {
      var d = document.createElement("div");
      d.className = "kasse__flate " + klasse;
      d.style.width = w + "px";
      d.style.height = h + "px";
      d.style.transform = transform;
      return d;
    }

    plan.forEach(function (k, i) {
      var kasse = document.createElement("div");
      kasse.className = "kasse";
      kasse.style.transform =
        "translate3d(" + k.x + "px," + k.y + "px," + k.z + "px) rotate(" + k.rot + "deg)";

      var w = maal.w, h = maal.h, d = maal.d;
      kasse.appendChild(flate("kasse__flate--front", w, h, "translateZ(" + d / 2 + "px)"));
      kasse.appendChild(flate("kasse__flate--bak", w, h, "rotateY(180deg) translateZ(" + d / 2 + "px)"));
      kasse.appendChild(flate("kasse__flate--side", d, h, "rotateY(-90deg) translateZ(" + w / 2 + "px)"));
      kasse.appendChild(flate("kasse__flate--side", d, h, "rotateY(90deg) translateZ(" + w / 2 + "px)"));
      kasse.appendChild(flate("kasse__flate--topp", w, d, "rotateX(90deg) translateZ(" + h / 2 + "px)"));
      kasse.appendChild(flate("kasse__flate--bunn", w, d, "rotateX(-90deg) translateZ(" + h / 2 + "px)"));

      if (i % 2 === 0) {
        var tape = document.createElement("div");
        tape.className = "kasse__tape";
        tape.style.cssText = "left:48%;top:0;width:9px;height:100%;opacity:.75";
        kasse.appendChild(tape);
      }
      if (i > 0) {
        var merke = document.createElement("div");
        merke.className = "kasse__merke";
        merke.textContent = i === 1 ? "KJØKKEN" : i === 2 ? "BØKER" : "SKJØRT";
        merke.style.cssText = "left:12px;top:14px";
        kasse.appendChild(merke);
      }
      stabel.appendChild(kasse);
    });

    var skygge = document.createElement("div");
    skygge.className = "kasseskygge";
    stabel.parentNode.insertBefore(skygge, stabel);

    if (rolig) return;

    var na = { x: 0, y: 0 }, maalV = { x: 0, y: 0 }, sisteScroll = 0;

    function oppdater() {
      na.x += (maalV.x - na.x) * 0.08;
      na.y += (maalV.y - na.y) * 0.08;
      var rull = Math.min(1, Math.max(-1, (window.scrollY - stabel.getBoundingClientRect().top) / 900));
      stabel.style.transform =
        "rotateX(" + (-22 + na.y * 12 - rull * 7).toFixed(2) + "deg) " +
        "rotateY(" + (-34 + na.x * 24).toFixed(2) + "deg)";
      requestAnimationFrame(oppdater);
    }
    requestAnimationFrame(oppdater);

    var sone = stabel.closest(".kassescene") || stabel;
    sone.addEventListener("pointermove", function (e) {
      var r = sone.getBoundingClientRect();
      maalV.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      maalV.y = ((e.clientY - r.top) / r.height - 0.5) * -2;
    });
    sone.addEventListener("pointerleave", function () { maalV.x = 0; maalV.y = 0; });
  }

  /* ---------- 3. Avsløring ved scroll ---------- */
  function avslor() {
    var ting = document.querySelectorAll(".avslor");
    if (!ting.length) return;
    if (rolig || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(ting, function (t) { t.classList.add("er-inne"); });
      return;
    }
    var io = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (o) {
        if (o.isIntersecting) {
          o.target.classList.add("er-inne");
          io.unobserve(o.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(ting, function (t) { io.observe(t); });
  }

  /* ---------- 4. Skjema: ærlig kvittering, ingen falsk innsending ---------- */
  function skjema() {
    var skjemaer = document.querySelectorAll("[data-skjema]");
    Array.prototype.forEach.call(skjemaer, function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var melding = skj.querySelector("[data-skjemamelding]");
        var navn = skj.querySelector("#navn");
        if (melding) {
          melding.hidden = false;
          melding.textContent = (navn && navn.value ? "Takk, " + navn.value.split(" ")[0] + ". " : "Takk. ") +
            "Forespørselen er registrert i demoen – i den ekte løsningen går den rett til post@cjtransport.no. Vi svarer innen neste virkedag.";
        }
        skj.reset();
        if (melding) melding.setAttribute("tabindex", "-1"), melding.focus();
      });
    });
  }

  /* ---------- 5. Panel: oppdrag, filter, KPI og runder ---------- */
  function panel() {
    var liste = document.querySelector("[data-oppdrag]");
    if (!liste) return;

    var knapper = document.querySelectorAll("[data-filter]");
    var teller = document.querySelector("[data-antall]");
    var kpiLevert = document.querySelector("[data-kpi-levert]");
    var kpiAktive = document.querySelector("[data-kpi-aktive]");
    var kpiBelop = document.querySelector("[data-kpi-belop]");
    var logg = document.querySelector("[data-logg]");

    function skrivLogg(tekst) {
      if (!logg) return;
      var na = new Date();
      var tid = ("0" + na.getHours()).slice(-2) + ":" + ("0" + na.getMinutes()).slice(-2);
      var linje = document.createElement("div");
      linje.className = "logglinje";
      var t = document.createElement("time");
      t.textContent = tid;
      var s = document.createElement("span");
      s.textContent = tekst;
      linje.appendChild(t);
      linje.appendChild(s);
      logg.insertBefore(linje, logg.firstChild);
      while (logg.children.length > 6) logg.removeChild(logg.lastChild);
    }

    function oppdater() {
      var rader = liste.querySelectorAll(".oppdrag__rad");
      var vist = 0, levert = 0, aktive = 0;
      Array.prototype.forEach.call(rader, function (rad) {
        var status = rad.getAttribute("data-status");
        if (status === "levert") levert++;
        if (status === "underveis") aktive++;
        var skjult = rad.hasAttribute("data-skjult");
        if (!skjult) vist++;
      });
      if (teller) teller.textContent = vist + " av " + rader.length + " oppdrag";
      if (kpiLevert) kpiLevert.textContent = levert;
      if (kpiAktive) kpiAktive.textContent = aktive;
      if (kpiBelop) {
        var sum = 0;
        Array.prototype.forEach.call(rader, function (rad) {
          if (rad.getAttribute("data-status") !== "levert") return;
          var knapp = rad.querySelector("[data-pris]");
          if (knapp) sum += parseInt(knapp.getAttribute("data-pris"), 10) || 0;
        });
        kpiBelop.textContent = sum.toLocaleString("nb-NO");
      }
    }

    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".oppdrag__rad"), function (rad) {
          var status = rad.getAttribute("data-status");
          var synlig = valg === "alle" || status === valg;
          if (synlig) rad.removeAttribute("data-skjult");
          else rad.setAttribute("data-skjult", "");
          rad.style.display = synlig ? "" : "none";
        });
        oppdater();
      });
    });

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-lever]");
      if (!knapp) return;
      var rad = knapp.closest(".oppdrag__rad");
      if (!rad || rad.getAttribute("data-status") === "levert") return;
      rad.setAttribute("data-status", "levert");
      rad.classList.add("er-levert");
      var status = rad.querySelector(".oppdrag__status");
      if (status) status.textContent = "Levert";
      knapp.disabled = true;
      knapp.textContent = "Levert";
      var navn = rad.querySelector(".oppdrag__tittel");
      skrivLogg("Oppdrag merket levert: " + (navn ? navn.textContent.replace(/\s+/g, " ") : "ukjent"));
      oppdater();
    });

    var rundeKnapp = document.querySelector("[data-runde-fram]");
    if (rundeKnapp) {
      rundeKnapp.addEventListener("click", function () {
        var rader = document.querySelectorAll("[data-runde]");
        Array.prototype.forEach.call(rader, function (rad) {
          var spor = rad.querySelector(".runde__spor i");
          if (!spor) return;
          var naa = parseInt(spor.style.width || spor.getAttribute("data-fra") || "40", 10);
          var ny = Math.min(100, naa + 20);
          spor.style.width = ny + "%";
        });
        skrivLogg("Runder oppdatert – status hentet fra bilene.");
      });
    }

    oppdater();
    skrivLogg("Panel åpnet. 7 oppdrag i dag, 3 biler ute.");
  }

  /* ---------- 6. Sticky-topp som markerer at man har scrollet ---------- */
  function toppmarkering() {
    var topp = document.querySelector("[data-topp]");
    if (!topp) return;
    var siste = false;
    window.addEventListener("scroll", function () {
      var na = window.scrollY > 24;
      if (na === siste) return;
      siste = na;
      topp.style.boxShadow = na ? "0 10px 24px -22px rgba(6,20,55,.7)" : "none";
    }, { passive: true });
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  rutetegning();
  byggKasser();
  avslor();
  skjema();
  panel();
  toppmarkering();
  ar();
})();