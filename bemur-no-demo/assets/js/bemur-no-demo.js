/* ==========================================================================
   Bakke Mur og Varme AS — bemur-no-demo
   Canvas glør: gnister som stiger fra ildstedet i hero.
   Mursteinsbånd, skjema og oppdragspanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ glør */
  var lerret = document.getElementById("glor");
  if (lerret) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, ko = null, glor = [], siste = 0;

      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 60 || H < 60) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }
      function ny() {
        return {
          x: W * (0.55 + Math.random() * 0.42),
          y: H * (0.72 + Math.random() * 0.3),
          r: 0.8 + Math.random() * 2.1,
          v: 0.14 + Math.random() * 0.42,
          drift: (Math.random() - 0.5) * 0.22,
          liv: 0.5 + Math.random() * 0.5,
          varme: Math.random()
        };
      }
      function tegn(t) {
        if (!W || !H) return;
        var dt = siste ? Math.min(48, t - siste) : 16;
        siste = t;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < glor.length; i++) {
          var g = glor[i];
          g.y -= g.v * dt * 0.06;
          g.x += g.drift * dt * 0.02;
          g.liv -= 0.0006 * dt;
          if (g.liv <= 0 || g.y < -10) { glor[i] = ny(); glor[i].y = H + 6; continue; }
          var farge = g.varme > 0.6 ? "232,165,120" : "200,96,40";
          var r = g.r * (0.6 + g.liv * 0.55);
          var gr = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r * 4);
          gr.addColorStop(0, "rgba(" + farge + "," + (0.85 * g.liv).toFixed(2) + ")");
          gr.addColorStop(1, "rgba(" + farge + ",0)");
          ctx.fillStyle = gr;
          ctx.beginPath(); ctx.arc(g.x, g.y, r * 4, 0, Math.PI * 2); ctx.fill();
        }
        ko = requestAnimationFrame(tegn);
      }
      function start() { if (!ko && !redusert) ko = requestAnimationFrame(tegn); }
      function stopp() { if (ko) { cancelAnimationFrame(ko); ko = null; } }

      if (storrelse()) {
        var antall = redusert ? 18 : Math.round(Math.min(46, Math.max(18, W / 40)));
        for (var i = 0; i < antall; i++) glor.push(ny());
        if (redusert) {
          // statisk bilde av glør
          for (var j = 0; j < glor.length; j++) {
            var g = glor[j], f = g.varme > 0.6 ? "232,165,120" : "200,96,40";
            var gr2 = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r * 4);
            gr2.addColorStop(0, "rgba(" + f + "," + (0.7 * g.liv).toFixed(2) + ")");
            gr2.addColorStop(1, "rgba(" + f + ",0)");
            ctx.fillStyle = gr2;
            ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 4, 0, Math.PI * 2); ctx.fill();
          }
        } else if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (o) {
            if (o[0].isIntersecting) start(); else stopp();
          }, { threshold: 0.01 }).observe(lerret);
        } else start();
        window.addEventListener("resize", function () { if (storrelse() && redusert) { glor = []; var n2 = 18; for (var k = 0; k < n2; k++) glor.push(ny()); } });
      }
    }
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til post@bemur.no eller ring 934 34 225.";
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
      { nr: "BM-201", kunde: "Familie Rød", sted: "Nøtterøy", type: "Våtrom · flis", status: "paagaar", fase: "Fuging" },
      { nr: "BM-202", kunde: "Hansen", sted: "Tønsberg", type: "Pipe · ildsted", status: "befaring", fase: "Befaring booket" },
      { nr: "BM-203", kunde: "Borettslag Sjølyst", sted: "Nøtterøy", type: "Mur og puss", status: "paagaar", fase: "Pussing" },
      { nr: "BM-204", kunde: "Larsen", sted: "Sandefjord", type: "Peis", status: "ny", fase: "Forespørsel" },
      { nr: "BM-205", kunde: "Familie Vik", sted: "Tjøme", type: "Flis · kjøkken", status: "ny", fase: "Forespørsel" },
      { nr: "BM-206", kunde: "Johansen", sted: "Sem", type: "Ildsted", status: "levert", fase: "Ferdig" },
      { nr: "BM-207", kunde: "Grepet AS", sted: "Tønsberg", type: "Mur · tilbygg", status: "paagaar", fase: "Muring" },
      { nr: "BM-208", kunde: "Familie Berg", sted: "Nøtterøy", type: "Våtrom", status: "levert", fase: "Ferdig" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", befaring: "Befaring", paagaar: "Pågår", levert: "Levert" };
    var rekkefolge = ["ny", "befaring", "paagaar", "levert"];

    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", oppdrag.length);
      sett("kpi-befaring", oppdrag.filter(function (o) { return o.status === "befaring"; }).length);
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
        var tekst = o.status === "ny" ? "Book befaring" : o.status === "befaring" ? "Start arbeid" : "Merk levert";
        var knapp = o.status === "levert"
          ? '<button class="knapp knapp--mork knapp--liten" data-opp="' + o.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-opp="' + o.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="oppdrag__kort' + (o.status === "levert" ? " oppdrag__kort--levert" : "") + '">' +
          '<div class="oppdrag__topp"><span class="oppdrag__nr">' + o.nr + "</span>" + stempel(o.status) + "</div>" +
          "<h3>" + o.kunde + "</h3>" +
          '<div class="oppdrag__meta"><span>' + o.sted + "</span><span>" + o.type + "</span><span>" + o.fase + "</span></div>" +
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
      noter(o.nr + " " + o.kunde + " → " + statNavn[o.status]);
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
