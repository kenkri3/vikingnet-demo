/* ==========================================================================
   Billink — billink-no-demo
   Canvas salgsflyt: kjøretøy flytter seg gjennom salgsstegene.
   Programfaner, skjema og avtale-panel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var lerret = document.getElementById("flyt");
  var boks = lerret ? lerret.parentElement : null;
  if (lerret && boks) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, t = 0, ko = null;
      var steg = ["ANNONSE", "HENVENDELSE", "TILBUD", "SIGNERT"];
      var bobler = [];
      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 100 || H < 60) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }
      function nyBoble(i) {
        return { x: (i + 0.5) / steg.length, y: 0.3 + Math.random() * 0.4, f: 0.00018 + Math.random() * 0.00022, r: 2.4 + Math.random() * 1.8, i: 0 };
      }
      function tegn() {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        var kol = W / steg.length;
        // kolonner
        for (var i = 0; i < steg.length; i++) {
          ctx.fillStyle = "rgba(244,246,250,0.035)";
          ctx.fillRect(i * kol + 1, 8, kol - 2, H - 16);
          ctx.strokeStyle = "rgba(244,246,250,0.1)";
          ctx.strokeRect(i * kol + 1.5, 8.5, kol - 3, H - 17);
          ctx.font = "600 7px ui-monospace, monospace";
          ctx.fillStyle = "rgba(244,246,250,0.5)";
          ctx.fillText(steg[i], i * kol + 7, H - 9);
          // antall prikker
          for (var k = 0; k < 4; k++) {
            ctx.fillStyle = k < 3 - i ? "rgba(164,141,255,0.5)" : "rgba(244,246,250,0.14)";
            ctx.fillRect(i * kol + 7 + k * 6, 14, 4, 3);
          }
        }
        // bobler som beveger seg høyre
        for (var b = 0; b < bobler.length; b++) {
          var bb = bobler[b];
          bb.x += bb.f * 16;
          if (bb.x > 1) { bb.x = 0.02; bb.y = 0.28 + Math.random() * 0.42; }
          var cx = bb.x * W, cy = bb.y * H;
          var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, bb.r * 5);
          g.addColorStop(0, "rgba(164,141,255,0.95)");
          g.addColorStop(1, "rgba(124,92,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(cx, cy, bb.r * 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.beginPath(); ctx.arc(cx, cy, bb.r * 0.5, 0, Math.PI * 2); ctx.fill();
        }
        t += 0.01;
        ko = requestAnimationFrame(tegn);
      }
      function start() { if (!ko && !redusert) ko = requestAnimationFrame(tegn); }
      function stopp() { if (ko) { cancelAnimationFrame(ko); ko = null; } }
      if (storrelse()) {
        for (var i = 0; i < 9; i++) bobler.push(nyBoble(i));
        if (redusert) {
          for (var b2 = 0; b2 < bobler.length; b2++) bobler[b2].x = Math.random();
          tegn(); if (ko) { cancelAnimationFrame(ko); ko = null; }
        } else if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (o) { if (o[0].isIntersecting) start(); else stopp(); }, { threshold: 0.01 }).observe(lerret);
        } else start();
        window.addEventListener("resize", function () { if (storrelse()) { if (redusert) tegn(); } });
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Skriv til support@billink.no, så tar vi kontakt.";
        svar.classList.add("vis"); svar.setAttribute("tabindex", "-1"); svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  var liste = document.getElementById("avtaler");
  if (liste) {
    var avtaler = [
      { nr: "BI-901", kunde: "Nesttun Bil", bil: "VW Golf 2019", selger: "Kari H.", status: "signert", sum: "189 000" },
      { nr: "BI-902", kunde: "Fana Auto", bil: "Toyota RAV4 2020", selger: "Ola N.", status: "tilbud", sum: "312 000" },
      { nr: "BI-903", kunde: "Bilhuset Syd", bil: "Ford Focus 2018", selger: "Ida P.", status: "ny", sum: "124 000" },
      { nr: "BI-904", kunde: "Nord Bil AS", bil: "Audi A4 2021", selger: "Kari H.", status: "signert", sum: "389 000" },
      { nr: "BI-905", kunde: "Vest Camping", bil: "Bobil 2017", selger: "Ola N.", status: "ny", sum: "—" },
      { nr: "BI-906", kunde: "MC Senteret", bil: "Yamaha 2022", selger: "Ida P.", status: "levert", sum: "149 000" },
      { nr: "BI-907", kunde: "Sjøbiler AS", bil: "Båt 2020", selger: "Kari H.", status: "levert", sum: "620 000" },
      { nr: "BI-908", kunde: "Eika Bil", bil: "Skoda Octavia 2019", selger: "Ola N.", status: "tilbud", sum: "198 000" }
    ];
    var filter = "alle";
    var statNavn = { ny: "Ny", tilbud: "Tilbud", signert: "Signert", levert: "Levert" };
    var rekkefolge = ["ny", "tilbud", "signert", "levert"];
    function kpi() {
      var sett = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
      sett("kpi-total", avtaler.length);
      sett("kpi-tilbud", avtaler.filter(function (a) { return a.status === "tilbud"; }).length);
      sett("kpi-signert", avtaler.filter(function (a) { return a.status === "signert"; }).length);
      sett("kpi-levert", avtaler.filter(function (a) { return a.status === "levert"; }).length);
    }
    function stempel(s) { return '<span class="stempel stempel--' + s + '">' + statNavn[s] + "</span>"; }
    function tegn() {
      var vis = avtaler.filter(function (a) { return filter === "alle" || a.status === filter; });
      if (!vis.length) { liste.innerHTML = '<div class="tom">Ingen avtaler i dette utvalget.</div>'; return; }
      liste.innerHTML = vis.map(function (a) {
        var i = rekkefolge.indexOf(a.status);
        var neste = rekkefolge[Math.min(i + 1, rekkefolge.length - 1)];
        var tekst = a.status === "ny" ? "Lag tilbud" : a.status === "tilbud" ? "Merk signert" : "Merk levert";
        var knapp = a.status === "levert"
          ? '<button class="knapp knapp--mork knapp--liten" data-avtale="' + a.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-avtale="' + a.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="avtale' + (a.status === "levert" ? " avtale--levert" : "") + '">' +
          '<div class="avtale__topp"><span class="avtale__nr">' + a.nr + "</span>" + stempel(a.status) + "</div>" +
          "<h3>" + a.bil + "</h3>" +
          '<div class="avtale__meta"><span>' + a.kunde + "</span><span>" + a.selger + "</span><span>Pris: " + a.sum + "</span></div>" +
          '<div class="avtale__knapper">' + knapp + "</div>" +
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
      var b = e.target.closest("button[data-avtale]");
      if (!b) return;
      var a = avtaler.find(function (x) { return x.nr === b.getAttribute("data-avtale"); });
      if (!a) return;
      a.status = b.getAttribute("data-til");
      kpi(); tegn();
      noter(a.nr + " " + a.bil + " → " + statNavn[a.status]);
    });
    document.querySelectorAll("[data-filter]").forEach(function (kn) {
      kn.addEventListener("click", function () {
        filter = kn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (o) { o.setAttribute("aria-pressed", o === kn ? "true" : "false"); });
        tegn();
      });
    });
    kpi(); tegn();
    noter("Dagen åpnet. 8 avtaler i systemet.");
  }

  document.querySelectorAll("[data-dato]").forEach(function (el) {
    el.textContent = new Date().toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  });
})();
