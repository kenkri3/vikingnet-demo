/* ==========================================================================
   Compel — compel-no-demo
   Canvas milepæler: verdikjeden tenner steg for steg ved scroll.
   Typografisk meny, skjema og oppdragspanel.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.add("js");
  var redusert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var lerret = document.getElementById("milepael");
  var boks = lerret ? lerret.parentElement : null;
  if (lerret && boks) {
    var ctx = lerret.getContext("2d");
    if (ctx) {
      var W = 0, H = 0, dpr = 1, naa = 0, maal = 0, ko = null;
      var steg = ["IDÉ", "KONSEPT", "FINANSIERING", "PARTNER", "KOMMERSIALISERING"];

      function storrelse() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = lerret.clientWidth; H = lerret.clientHeight;
        if (!W || !H || W < 100 || H < 60) return false;
        lerret.width = Math.round(W * dpr); lerret.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }
      function tegn() {
        if (!W || !H) return;
        ctx.clearRect(0, 0, W, H);
        var venstre = 18, hoyre = W - 18, midt = H * 0.46;
        // linje
        ctx.strokeStyle = "rgba(247,244,238,0.18)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(venstre, midt); ctx.lineTo(hoyre, midt); ctx.stroke();
        // fremdrift
        var p = naa;
        var fram = venstre + (hoyre - venstre) * p;
        ctx.strokeStyle = "rgba(223,183,222,0.95)";
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(venstre, midt); ctx.lineTo(fram, midt); ctx.stroke();
        // punkter
        for (var i = 0; i < steg.length; i++) {
          var f = i / (steg.length - 1);
          var x = venstre + (hoyre - venstre) * f;
          var tent = p >= f - 0.02;
          ctx.beginPath();
          ctx.arc(x, midt, tent ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = tent ? "#dfb7de" : "rgba(247,244,238,0.22)";
          ctx.fill();
          if (tent) {
            ctx.beginPath();
            ctx.arc(x, midt, 11, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(223,183,222,0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          // etikett
          ctx.font = "500 7.5px ui-sans-serif, system-ui, sans-serif";
          ctx.fillStyle = tent ? "rgba(247,244,238,0.9)" : "rgba(247,244,238,0.38)";
          ctx.textAlign = i === 0 ? "left" : (i === steg.length - 1 ? "right" : "center");
          var ord = steg[i];
          // del etiketten over to linjer hvis lang
          if (ord.length > 12 && ord.indexOf(" ") === -1) {
            var mid = Math.ceil(ord.length / 2);
            ctx.fillText(ord.slice(0, mid), x, midt + 26);
            ctx.fillText(ord.slice(mid), x, midt + 36);
          } else {
            ctx.fillText(ord, x, midt + 28);
          }
        }
        naa += (maal - naa) * 0.05;
        if (Math.abs(maal - naa) < 0.003) naa = maal;
        ko = null;
        if (naa !== maal && !redusert) ko = requestAnimationFrame(tegn);
      }
      function onsk() { if (!ko) ko = requestAnimationFrame(tegn); }
      function oppdater() {
        var r = boks.getBoundingClientRect();
        var vh = window.innerHeight || 800;
        maal = Math.min(1, Math.max(0, 1 - (r.top + r.height * 0.2) / (vh * 0.92)));
        if (redusert) { naa = maal = 1; tegn(); } else onsk();
      }
      if (storrelse()) {
        oppdater();
        window.addEventListener("scroll", oppdater, { passive: true });
        window.addEventListener("resize", function () { if (storrelse()) tegn(); });
        if (redusert) { naa = maal = 1; tegn(); }
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
          "Dette er en demonstrasjon av nettsiden, så ingenting er sendt. Ring 22 53 55 15 eller skriv til christian@compel.no.";
        svar.classList.add("vis"); svar.setAttribute("tabindex", "-1"); svar.focus();
      }
      form.querySelectorAll("input, textarea, select").forEach(function (f) { if (f.type !== "submit") f.value = ""; });
    });
  });

  var liste = document.getElementById("oppdrag");
  if (liste) {
    var oppdrag = [
      { nr: "CO-801", kunde: "Industrikonsern", oppdrag: "Innovasjonsstrategi", status: "paagaar", fase: "Workshop" },
      { nr: "CO-802", kunde: "Teknologiselskap", oppdrag: "Finansieringsstrategi", status: "tilbud", fase: "Tilbud sendt" },
      { nr: "CO-803", kunde: "Helseaktør", oppdrag: "Konseptutvikling", status: "paagaar", fase: "Prototype" },
      { nr: "CO-804", kunde: "Næringsklynge", oppdrag: "Partnerskapsmodell", status: "ny", fase: "Første samtale" },
      { nr: "CO-805", kunde: "Handelsvirksomhet", oppdrag: "Kundeopplevelse", status: "ny", fase: "Kartlegging" },
      { nr: "CO-806", kunde: "Energiselskap", oppdrag: "Kommersialisering", status: "levert", fase: "Avsluttet" },
      { nr: "CO-807", kunde: "Offentlig aktør", oppdrag: "Innovasjonsprogram", status: "levert", fase: "Avsluttet" },
      { nr: "CO-808", kunde: "Logistikkselskap", oppdrag: "Prosessinnovasjon", status: "paagaar", fase: "Pilot" }
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
        var tekst = o.status === "ny" ? "Send tilbud" : o.status === "tilbud" ? "Start oppdrag" : "Merk levert";
        var knapp = o.status === "levert"
          ? '<button class="knapp knapp--mork knapp--liten" data-opp="' + o.nr + '" data-til="ny">Gjenåpne</button>'
          : '<button class="knapp knapp--liten" data-opp="' + o.nr + '" data-til="' + neste + '">' + tekst + "</button>";
        return '<article class="oppdrag__kort' + (o.status === "levert" ? " oppdrag__kort--levert" : "") + '">' +
          '<div class="oppdrag__topp"><span class="oppdrag__nr">' + o.nr + "</span>" + stempel(o.status) + "</div>" +
          "<h3>" + o.oppdrag + "</h3>" +
          '<div class="oppdrag__meta"><span>' + o.kunde + "</span><span>" + o.fase + "</span></div>" +
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
