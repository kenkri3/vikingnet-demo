/* ==========================================================================
   Agenda Kaupang AS — agendakaupang-no-demo
   Canvas indeksmatrise: søyler som vokser når seksjonen kommer i view.
   Tre-indeks (desktop), mobilmeny, skjema og oppdragspanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ indeksmatrise */
  var lerret = document.getElementById("indeks");
  var boks = lerret ? lerret.parentElement : null;
  if (lerret && boks) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, naa = 0, maal = 0, ko = null, t0 = performance.now();
      var verdier = [0.42, 0.66, 0.31, 0.86, 0.54, 0.73, 0.38, 0.92, 0.61, 0.47, 0.79, 0.28];

      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 60 || H < 60) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }

      function tegn(t) {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        var n = verdier.length;
        var luke = W / (n + 2);
        var bredde = Math.max(6, luke * 0.52);
        var base = H * 0.92;
        var maksH = H * 0.72;
        for (var i = 0; i < n; i++) {
          var hoy = verdier[i] * maksH * naa;
          var x = luke * 0.75 + i * luke;
          var topp = base - hoy;
          // søyle
          var grad = ctx.createLinearGradient(0, topp, 0, base);
          grad.addColorStop(0, "rgba(240,168,119,0.95)");
          grad.addColorStop(1, "rgba(224,122,63,0.35)");
          ctx.fillStyle = grad;
          ctx.fillRect(x, topp, bredde, hoy);
          // toppunkt
          ctx.fillStyle = "rgba(247,245,239,0.9)";
          ctx.fillRect(x, topp - 2, bredde, 2);
          // verdi-streker
          ctx.strokeStyle = "rgba(247,245,239,0.16)";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x, base + 4); ctx.lineTo(x + bredde, base + 4); ctx.stroke();
        }
        // grunnlinje
        ctx.strokeStyle = "rgba(247,245,239,0.3)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(0, base + 1); ctx.lineTo(W, base + 1); ctx.stroke();

        naa += (maal - naa) * 0.06;
        if (Math.abs(maal - naa) < 0.003) naa = maal;
        ko = null;
        if (naa !== maal && !redusert) ko = requestAnimationFrame(tegn);
      }
      function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
      function oppdater() {
        var r = boks.getBoundingClientRect();
        var vh = window.innerHeight || 800;
        maal = Math.min(1, Math.max(0, 1 - (r.top + r.height * 0.2) / (vh * 0.95)));
        if (redusert) { naa = maal = 1; tegn(performance.now()); } else onsk();
      }
      if (storrelse()) {
        oppdater();
        window.addEventListener("scroll", oppdater, { passive: true });
        window.addEventListener("resize", function () { if (storrelse()) tegn(performance.now()); });
        if (redusert) { naa = maal = 1; tegn(performance.now()); }
      }
    }
  }

  /* ------------------------------------------------ tre: tjenester-gruppe */
  document.querySelectorAll("[data-tre]").forEach(function (kn) {
    var under = document.getElementById(kn.getAttribute("aria-controls"));
    if (!under) return;
    kn.addEventListener("click", function () {
      var aapen = kn.getAttribute("aria-expanded") === "true";
      kn.setAttribute("aria-expanded", aapen ? "false" : "true");
      under.hidden = aapen;
    });
  });

  /* ------------------------------------------------ mobilmeny */
  var mk = document.getElementById("mobilknapp");
  var ml = document.getElementById("mobilliste");
  if (mk && ml) {
    mk.addEventListener("click", function () {
      var aapen = ml.getAttribute("data-aapen") === "true";
      ml.setAttribute("data-aapen", aapen ? "false" : "true");
      mk.setAttribute("aria-expanded", aapen ? "false" : "true");
    });
    ml.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        ml.setAttribute("data-aapen", "false");
        mk.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------ avsløring */
  var avslor = document.querySelectorAll(".avslor");
  if (avslor.length && "IntersectionObserver" in window && !redusert) {
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("er-inne"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    avslor.forEach(function (el) { io.observe(el); });
  } else {
    avslor.forEach(function (el) { el.classList.add("er-inne"); });
  }

  /* ------------------------------------------------ skjema */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var svar = form.querySelector(".skjema__svar");
      var navn = form.querySelector("#navn");
      if (svar) {
        svar.innerHTML = "<b>Takk" + (navn && navn.value ? ", " + navn.value.split(" ")[0] : "") + "!</b>" +
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til post@agendakaupang.no, så tar vi kontakt.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: oppdrag */
  var liste = document.getElementById("oppdrag");
  if (liste) {
    var oppdrag = [
      { nr: "AK-312", oppdrag: "Evaluering av tilskuddsordning", kunde: "Statsforvalteren", status: "paagaar", fase: "Datainnsamling", frist: "Uke 46" },
      { nr: "AK-313", oppdrag: "Kommuneindeksen 2026", kunde: "Egen publikasjon", status: "paagaar", fase: "Analyse", frist: "Uke 48" },
      { nr: "AK-314", oppdrag: "Organisering av hjelpemiddelformidling", kunde: "Oslo kommune", status: "levert", fase: "Rapport levert", frist: "Levert" },
      { nr: "AK-315", oppdrag: "Lederutvikling – mellomlederprogram", kunde: "Kommune", status: "ny", fase: "Tilbud", frist: "Uke 47" },
      { nr: "AK-316", oppdrag: "Utredning av barnevernledelse", kunde: "Kommunal etat", status: "tilbud", fase: "Tilbud sendt", frist: "Uke 45" },
      { nr: "AK-317", oppdrag: "Gevinstrealisering i digitalisering", kunde: "Direktorat", status: "ny", fase: "Venter svar", frist: "Uke 49" },
      { nr: "AK-318", oppdrag: "Evaluering av Havtils oppfølging", kunde: "Havtil / Proactima", status: "levert", fase: "Rapport levert", frist: "Levert" },
      { nr: "AK-319", oppdrag: "Strategi- og styringsstøtte", kunde: "Fylkeskommune", status: "paagaar", fase: "Workshop", frist: "Uke 47" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", tilbud: "Tilbud", paagaar: "Pågår", levert: "Levert" };
    var rekkefolge = ["ny", "tilbud", "paagaar", "levert"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", oppdrag.length);
      sett("kpi-ny", oppdrag.filter(function (o) { return o.status === "ny"; }).length);
      sett("kpi-paagaar", oppdrag.filter(function (o) { return o.status === "paagaar"; }).length);
      sett("kpi-levert", oppdrag.filter(function (o) { return o.status === "levert"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = oppdrag.filter(function (o) { return filter === "alle" || o.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen oppdrag i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (o) {
        var i = rekkefolge.indexOf(o.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = o.status === "ny" ? "Send tilbud" : o.status === "tilbud" ? "Start oppdrag" : "Merk levert";
        var knapp = o.status === "levert"
          ? '<button class="knapp knapp--mork knapp--liten" data-opp="' + o.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-opp="' + o.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="oppdrag__kort' + (o.status === "levert" ? " oppdrag__kort--levert" : "") + '">' +
          '<div class="oppdrag__topp"><span class="oppdrag__nr">' + o.nr + "</span>" + stempel(o.status) + "</div>" +
          "<h3>" + o.oppdrag + "</h3>" +
          '<div class="oppdrag__meta"><span>' + o.kunde + "</span><span>" + o.fase + "</span><span>" + o.frist + "</span></div>" +
          '<div class="oppdrag__knapper">' + knapp + "</div>" +
          "</article>";
      }).join("");
    }
    function noter(tekst) {
      var ul = document.getElementById("hendelser");
      if (!ul) return;
      var li = document.createElement("li");
      li.innerHTML = "<time>" + new Date().toTimeString().slice(0, 5) + "</time><span>" + tekst + "</span>";
      ul.insertBefore(li, ul.firstChild);
      while (ul.children.length > 12) ul.removeChild(ul.lastChild);
    }
    liste.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-opp]");
      if (!b) return;
      var o = oppdrag.find(function (x) { return x.nr === b.getAttribute("data-opp"); });
      if (!o) return;
      o.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(o.nr + " " + o.oppdrag + " → " + statNavn[o.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 oppdrag i systemet.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
