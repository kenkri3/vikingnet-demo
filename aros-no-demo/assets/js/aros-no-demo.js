/* AROS arkitekter — plantegning som åpner lag. Ingen biblioteker. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Lagene i plantegningen åpner seg når seksjonen kommer i syne */
  function plantegning() {
    var plan = document.querySelector("[data-plan]");
    if (!plan) return;
    var lag = plan.querySelectorAll(".plan__lag");
    var rammeTegn = null;

    function tegn() {
      rammeTegn = null;
      var r = plan.getBoundingClientRect();
      var vindu = window.innerHeight || 800;
      /* 0 når planet er under folden, 1 når det er midt i vinduet */
      var p = (vindu - r.top - r.height * 0.15) / (r.height + vindu * 0.55);
      p = Math.min(1, Math.max(0, p));
      /* lagene er alltid minst 55 % åpne, så tegningen leses som lag også uten scroll */
      var maal = 0.55 + 0.45 * p;
      var naa = parseFloat(plan.style.getPropertyValue("--aapning")) || 0.55;
      naa += (maal - naa) * 0.18;
      plan.style.setProperty("--aapning", naa.toFixed(3));
      Array.prototype.forEach.call(lag, function (l, i) {
        var z = (-i * 56 * naa).toFixed(1);
        /* ingen horisontal forskyvning – lagene løftes bare i dybden, så ingenting går utenfor kanten */
        l.style.transform = "translate3d(0, " + (-i * 6 * naa).toFixed(1) + "px, " + z + "px)";
      });
      if (Math.abs(maal - naa) > 0.002) rammeTegn = requestAnimationFrame(tegn);
    }

    function start() {
      if (rammeTegn) return;
      rammeTegn = requestAnimationFrame(tegn);
    }

    if (rolig) {
      plan.style.setProperty("--aapning", "1");
      Array.prototype.forEach.call(lag, function (l, i) {
        l.style.transform = "translate3d(0, " + (-i * 6) + "px, " + (-i * 56) + "px)";
      });
      return;
    }

    window.addEventListener("scroll", start, { passive: true });
    window.addEventListener("resize", start);
    start();
  }

  /* 2. Fanene: markerer aktiv side hvis HTML ikke gjør det */
  function faner() {
    var sti = (location.pathname.split("/").pop() || "index.html");
    Array.prototype.forEach.call(document.querySelectorAll(".fane"), function (a) {
      if (a.getAttribute("href") === sti) a.setAttribute("aria-current", "page");
    });
  }

  /* 3. Avsløring: innhold er synlig som standard, glir på plass med JS */
  function avslor() {
    if (rolig || !("IntersectionObserver" in window)) return;
    var ting = document.querySelectorAll(".seksjon > .skal");
    if (!ting.length) return;
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("er-inne"); io.unobserve(x.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    Array.prototype.forEach.call(ting, function (t) { io.observe(t); });
  }

  /* 4. Skjema */
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) {
          ut.hidden = false;
          ut.textContent = "Takk. Forespørselen er registrert i demoen – i den ekte løsningen går den til post@aros.no.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* 5. Panel: prosjektfaser */
  function panel() {
    var liste = document.querySelector("[data-prosjekter]");
    if (!liste) return;
    var logg = document.querySelector("[data-logg]");
    var kpiBygg = document.querySelector("[data-kpi-bygg]");
    var kpiFerdig = document.querySelector("[data-kpi-ferdig]");
    var teller = document.querySelector("[data-antall]");
    var rekkefolge = ["ide", "skisse", "forprosjekt", "soknad", "byggefase", "ferdig"];
    var navn = { ide: "Idéutvikling", skisse: "Skisseprosjekt", forprosjekt: "Forprosjekt", soknad: "Søknad", byggefase: "Byggefase", ferdig: "Ferdigstilt" };

    function skrivLogg(tekst) {
      if (!logg) return;
      var na = new Date();
      var linje = document.createElement("div");
      linje.className = "logglinje";
      var t = document.createElement("time");
      t.textContent = ("0" + na.getHours()).slice(-2) + ":" + ("0" + na.getMinutes()).slice(-2);
      var s = document.createElement("span");
      s.textContent = tekst;
      linje.appendChild(t);
      linje.appendChild(s);
      logg.insertBefore(linje, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }

    function oppdater() {
      var bygg = 0, ferdig = 0, synlig = 0;
      Array.prototype.forEach.call(liste.querySelectorAll(".prad"), function (rad) {
        var fase = rad.getAttribute("data-fase");
        if (fase === "byggefase") bygg++;
        if (fase === "ferdig") ferdig++;
        if (rad.style.display !== "none") synlig++;
      });
      if (kpiBygg) kpiBygg.textContent = bygg;
      if (kpiFerdig) kpiFerdig.textContent = ferdig;
      if (teller) teller.textContent = synlig + " av " + liste.querySelectorAll(".prad").length + " prosjekter";
    }

    liste.addEventListener("click", function (e) {
      var knapp = e.target.closest("[data-neste]");
      if (!knapp) return;
      var rad = knapp.closest(".prad");
      if (!rad) return;
      var fase = rad.getAttribute("data-fase");
      var i = rekkefolge.indexOf(fase);
      if (i < 0 || i >= rekkefolge.length - 1) return;
      var nyFase = rekkefolge[i + 1];
      rad.setAttribute("data-fase", nyFase);
      var merke = rad.querySelector(".prad__fase");
      if (merke) merke.textContent = navn[nyFase];
      var frem = rad.querySelector(".fremdrift i");
      if (frem) frem.style.width = Math.round(((i + 2) / rekkefolge.length) * 100) + "%";
      if (nyFase === "ferdig") {
        knapp.disabled = true;
        knapp.textContent = "Ferdigstilt";
      }
      var prosjektnavn = rad.querySelector(".prad__navn");
      skrivLogg("Fase endret til " + navn[nyFase] + ": " + (prosjektnavn ? prosjektnavn.textContent : "prosjekt"));
      oppdater();
    });

    var knapper = document.querySelectorAll("[data-filter]");
    Array.prototype.forEach.call(knapper, function (knapp) {
      knapp.addEventListener("click", function () {
        var valg = knapp.getAttribute("data-filter");
        Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
        Array.prototype.forEach.call(liste.querySelectorAll(".prad"), function (rad) {
          rad.style.display = (valg === "alle" || rad.getAttribute("data-fase") === valg) ? "" : "none";
        });
        oppdater();
      });
    });

    oppdater();
    skrivLogg("Prosjektlisten er lastet. 8 aktive prosjekter.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  plantegning();
  faner();
  avslor();
  skjema();
  panel();
  ar();
})();