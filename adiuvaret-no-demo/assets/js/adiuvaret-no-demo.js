/* ==========================================================================
   Adiuvaret — adiuvaret-no-demo
   CSS 3D dokumentbunke som legger seg på plass ved scroll.
   Saksmappe-faner, skjema og saks-panel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ dokumentbunke */
  var bunke = document.querySelector(".bunke");
  if (bunke) {
    var ark = [].slice.call(bunke.querySelectorAll(".bunke__ark"));
    var basis = [
      { r: -9, y: 12, x: 9 },
      { r: -4, y: 6, x: 7 },
      { r: 2, y: 0, x: 5 },
      { r: 7, y: -4, x: 3 }
    ];
    var naa = 0, maal = 0, ko = null;

    function tegn() {
      ko = null;
      naa += (maal - naa) * 0.08;
      if (Math.abs(maal - naa) < 0.002) naa = maal;
      for (var i = 0; i < ark.length; i++) {
        var b = basis[i] || basis[0];
        var spredning = 1 - naa * 0.6;
        var rot = b.r * spredning + (i - 1.5) * 2 * naa;
        var y = b.y * spredning - i * 3 * naa;
        var z = (i - 1.5) * 24 * naa;
        ark[i].style.transform = "rotate(" + rot.toFixed(2) + "deg) translateY(" + y.toFixed(1) + "px) translateZ(" + z.toFixed(1) + "px) rotateX(" + (b.x - naa * 3).toFixed(1) + "deg)";
      }
      if (maal !== naa && !redusert) ko = requestAnimationFrame(tegn);
    }
    function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
    function oppdater() {
      var r = bunke.getBoundingClientRect();
      var vh = window.innerHeight || 800;
      var p = 1 - Math.min(1, Math.max(0, (r.top + r.height * 0.4) / (vh * 0.9)));
      maal = p;
      if (redusert) { naa = maal = 1; tegn(); } else onsk();
    }
    oppdater();
    window.addEventListener("scroll", oppdater, { passive: true });
    window.addEventListener("resize", oppdater);
    if (redusert) { naa = maal = 1; tegn(); }
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 90 40 02 69 eller skriv til morten@adiuvaret.no, så tar vi kontakt.";
        svar.classList.add("vis");
        svar.setAttribute("tabindex", "-1");
        svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  /* ------------------------------------------------ panel: saker */
  var liste = document.getElementById("saker");
  if (liste) {
    var saker = [
      { nr: "AD-118", oppdrag: "Konkursbo – varelager", sted: "Bergen", kunde: "Bostyrer", status: "aapnet", fase: "Registrering" },
      { nr: "AD-119", oppdrag: "Dødsbo – registrering", sted: "Haugesund", kunde: "Advokat", status: "salg", fase: "Salg pågår" },
      { nr: "AD-120", oppdrag: "Konkursbo – driftstilbehør", sted: "Bergen", kunde: "Bank", status: "ny", fase: "Venter befaring" },
      { nr: "AD-121", oppdrag: "Rådgivning – restrukturering", sted: "Stavanger", kunde: "Styret", status: "aapnet", fase: "Kartlegging" },
      { nr: "AD-122", oppdrag: "Dødsbo – opprydning", sted: "Bergen", kunde: "Etterlatte", status: "ny", fase: "Venter befaring" },
      { nr: "AD-123", oppdrag: "Konkursbo – kjøretøy", sted: "Haugalandet", kunde: "Bostyrer", status: "avsluttet", fase: "Levert" },
      { nr: "AD-124", oppdrag: "Konkursbo – maskinpark", sted: "Bergen", kunde: "Bank", status: "salg", fase: "Bud innhentet" },
      { nr: "AD-125", oppdrag: "Dødsbo – løsøre", sted: "Os", kunde: "Advokat", status: "avsluttet", fase: "Levert" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", aapnet: "Åpnet", salg: "Salg", avsluttet: "Avsluttet" };
    var rekkefolge = ["ny", "aapnet", "salg", "avsluttet"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", saker.length);
      sett("kpi-ny", saker.filter(function (s) { return s.status === "ny"; }).length);
      sett("kpi-salg", saker.filter(function (s) { return s.status === "salg"; }).length);
      sett("kpi-avsluttet", saker.filter(function (s) { return s.status === "avsluttet"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = saker.filter(function (s) { return filter === "alle" || s.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen saker i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (s) {
        var i = rekkefolge.indexOf(s.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = s.status === "ny" ? "Åpne sak" : s.status === "aapnet" ? "Start salg" : "Avslutt";
        var knapp = s.status === "avsluttet"
          ? '<button class="knapp knapp--mork knapp--liten" data-sak="' + s.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-sak="' + s.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="sak' + (s.status === "avsluttet" ? " sak--avsluttet" : "") + '">' +
          '<div class="sak__topp"><span class="sak__nr">' + s.nr + "</span>" + stempel(s.status) + "</div>" +
          "<h3>" + s.oppdrag + "</h3>" +
          '<div class="sak__meta"><span>' + s.sted + "</span><span>" + s.kunde + "</span><span>" + s.fase + "</span></div>" +
          '<div class="sak__knapper">' + knapp + "</div>" +
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
      var b = e.target.closest("button[data-sak]");
      if (!b) return;
      var s = saker.find(function (x) { return x.nr === b.getAttribute("data-sak"); });
      if (!s) return;
      s.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(s.nr + " " + s.oppdrag + " → " + statNavn[s.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 saker i systemet.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
