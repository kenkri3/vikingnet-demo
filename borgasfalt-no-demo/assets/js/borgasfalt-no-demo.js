/* ==========================================================================
   Borg Asfalt AS — borgasfalt-no-demo
   Canvas vei: asfalt som legges utover, med midtstriper som ruller.
   Veistripe-meny, skjema og oppdragspanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var lerret = document.getElementById("vei");
  if (lerret) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, t = 0, ko = null, p = 0;

      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 80 || H < 80) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }

      function tegn() {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        // horisont
        var hy = H * 0.16;
        // asfaltflate (trapes)
        var toppB = W * 0.1, bunnB = W * 1.25;
        var g = ctx.createLinearGradient(0, hy, 0, H);
        g.addColorStop(0, "rgba(60,62,66,0.35)");
        g.addColorStop(1, "rgba(26,27,29,0.92)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(W / 2 - toppB / 2, hy);
        ctx.lineTo(W / 2 + toppB / 2, hy);
        ctx.lineTo(W / 2 + bunnB / 2, H);
        ctx.lineTo(W / 2 - bunnB / 2, H);
        ctx.closePath();
        ctx.fill();
        // kantlinjer
        ctx.strokeStyle = "rgba(239,236,227,0.35)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(W / 2 - toppB / 2, hy); ctx.lineTo(W / 2 - bunnB / 2, H);
        ctx.moveTo(W / 2 + toppB / 2, hy); ctx.lineTo(W / 2 + bunnB / 2, H);
        ctx.stroke();
        // midtstriper som ruller
        var ant = 9;
        var fart = redusert ? 0 : t;
        for (var i = 0; i < ant; i++) {
          var f0 = ((i / ant) + fart) % 1;
          var f1 = f0 + 0.055;
          if (f1 > 1) continue;
          var y0 = hy + (H - hy) * Math.pow(f0, 1.9);
          var y1 = hy + (H - hy) * Math.pow(Math.min(1, f1), 1.9);
          var b0 = toppB + (bunnB - toppB) * Math.pow(f0, 1.9);
          var b1 = toppB + (bunnB - toppB) * Math.pow(Math.min(1, f1), 1.9);
          ctx.beginPath();
          ctx.moveTo(W / 2 - b0 * 0.012, y0);
          ctx.lineTo(W / 2 + b0 * 0.012, y0);
          ctx.lineTo(W / 2 + b1 * 0.012, y1);
          ctx.lineTo(W / 2 - b1 * 0.012, y1);
          ctx.closePath();
          ctx.fillStyle = "rgba(239,236,227," + (0.16 + f0 * 0.5).toFixed(2) + ")";
          ctx.fill();
        }
        // asfaltkorn
        ctx.fillStyle = "rgba(239,236,227,0.14)";
        for (var k = 0; k < 26; k++) {
          var fx = (k * 0.618) % 1, fy = (k * 0.377 + (redusert ? 0 : t * 0.5)) % 1;
          var yy = hy + (H - hy) * fy;
          var bb = toppB + (bunnB - toppB) * fy;
          ctx.fillRect(W / 2 + (fx - 0.5) * bb, yy, 1.5 + fy * 2, 1.5 + fy * 2);
        }
        t += 0.0028;
        ko = requestAnimationFrame(tegn);
      }
      function start() { if (!ko && !redusert) ko = requestAnimationFrame(tegn); }
      function stopp() { if (ko) { cancelAnimationFrame(ko); ko = null; } }
      if (storrelse()) {
        if (redusert) { tegn(); if (ko) { cancelAnimationFrame(ko); ko = null; } }
        else if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (o) { if (o[0].isIntersecting) start(); else stopp(); }, { threshold: 0.01 }).observe(lerret);
        } else start();
        window.addEventListener("resize", function () { if (storrelse() && redusert) { tegn(); if (ko) { cancelAnimationFrame(ko); ko = null; } } });
      }
    }
  }

  var avslor = document.querySelectorAll(".avslor");
  if (avslor.length && "IntersectionObserver" in window && !redusert) {
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("er-inne"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    avslor.forEach(function (el) { io.observe(el); });
  } else { avslor.forEach(function (el) { el.classList.add("er-inne"); }); }

  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var svar = form.querySelector(".skjema__svar");
      var navn = form.querySelector("#navn");
      if (svar) {
        svar.innerHTML = "<b>Takk" + (navn && navn.value ? ", " + navn.value.split(" ")[0] : "") + "!</b>" +
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 994 35 933 eller skriv til Post@borgasfalt.no.";
        svar.classList.add("vis"); svar.setAttribute("tabindex", "-1"); svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  var liste = document.getElementById("oppdrag");
  if (liste) {
    var oppdrag = [
      { nr: "BA-601", kunde: "Grålum borettslag", sted: "Grålum", type: "Asfaltering", status: "paagaar", fase: "Utlegging" },
      { nr: "BA-602", kunde: "Private Hansen", sted: "Tune", type: "Innkjøring", status: "tilbud", fase: "Tilbud sendt" },
      { nr: "BA-603", kunde: "Østfold Entreprenør", sted: "Sarpsborg", type: "Maskinpark", status: "paagaar", fase: "Utleie" },
      { nr: "BA-604", kunde: "Kommunal vei", sted: "Råde", type: "Vedlikehold", status: "ny", fase: "Befaring" },
      { nr: "BA-605", kunde: "Næringspark", sted: "Grålum", type: "Parkeringsplass", status: "ny", fase: "Befaring" },
      { nr: "BA-606", kunde: "Familie Lie", sted: "Moss", type: "Innkjøring", status: "levert", fase: "Ferdig" },
      { nr: "BA-607", kunde: "Borettslag Sør", sted: "Fredrikstad", type: "Asfaltering", status: "levert", fase: "Ferdig" },
      { nr: "BA-608", kunde: "Anlegg Øst", sted: "Halden", type: "Fresing", status: "paagaar", fase: "Fresing" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", tilbud: "Tilbud", paagaar: "Pågår", levert: "Levert" };
    var rekkefolge = ["ny", "tilbud", "paagaar", "levert"];
    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", oppdrag.length);
      sett("kpi-tilbud", oppdrag.filter(function (o) { return o.status === "tilbud"; }).length);
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
        var tekst = o.status === "ny" ? "Send tilbud" : o.status === "tilbud" ? "Start arbeid" : "Merk levert";
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
