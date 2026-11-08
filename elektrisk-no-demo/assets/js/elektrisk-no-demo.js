/* AS Elektrisk — terminal, kretskort og panel. Ingen biblioteker. */
(function () {
  "use strict";
  var rolig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Terminal-linjen som navigasjon ---------- */
  function terminal() {
    var felt = document.querySelector("[data-term-input]");
    var svar = document.querySelector("[data-term-svar]");
    if (!felt) return;

    var ruter = {
      "hjem": "index.html",
      "hjemme": "index.html",
      "start": "index.html",
      "index": "index.html",
      "tjenester": "tjenester.html",
      "sikkerhet": "sikkerhet.html",
      "prosjekter": "prosjekter.html",
      "om": "om.html",
      "kontakt": "kontakt.html",
      "panel": "panel.html"
    };
    var historie = [];
    var hpos = -1;

    function skriv(tekst, feil) {
      if (!svar) return;
      svar.textContent = tekst;
      svar.style.color = feil ? "#e2705f" : "#f0a35e";
    }

    function kjor(verdi) {
      var k = (verdi || "").trim().toLowerCase().replace(/^\.?\/?/, "").replace(/\.html$/, "");
      if (!k) return;
      historie.unshift(k);
      hpos = -1;
      if (k === "hjelp" || k === "help" || k === "?" || k === "man") {
        skriv("kommandoer: hjem · tjenester · sikkerhet · prosjekter · om · kontakt · panel · clear");
        return;
      }
      if (k === "clear" || k === "cls") {
        skriv("");
        felt.value = "";
        return;
      }
      if (k === "ring" || k === "telefon") {
        skriv("ringer 22 87 16 00 …");
        window.location.href = "tel:+4722871600";
        return;
      }
      if (ruter[k]) {
        skriv("> cd /" + k);
        window.location.href = ruter[k];
        return;
      }
      skriv("ukjent kommando: «" + k + "». Skriv «hjelp» for listen.", true);
    }

    felt.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        kjor(felt.value);
        felt.value = "";
      } else if (e.key === "ArrowUp") {
        if (!historie.length) return;
        e.preventDefault();
        hpos = Math.min(historie.length - 1, hpos + 1);
        felt.value = historie[hpos];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        hpos = Math.max(-1, hpos - 1);
        felt.value = hpos === -1 ? "" : historie[hpos];
      } else if (e.key === "Tab") {
        var del = felt.value.trim().toLowerCase();
        if (!del) return;
        var treff = Object.keys(ruter).filter(function (n) { return n.indexOf(del) === 0; });
        if (treff.length === 1) {
          e.preventDefault();
          felt.value = treff[0];
        } else if (treff.length > 1) {
          e.preventDefault();
          skriv("treff: " + treff.join(" · "));
        }
      }
    });

    /* klikk på de synlige kommandoene fyller feltet i stedet for å hoppe */
    var kommandoknapper = document.querySelectorAll("[data-term-fyll]");
    Array.prototype.forEach.call(kommandoknapper, function (knapp) {
      knapp.addEventListener("click", function () {
        felt.focus();
        felt.value = knapp.getAttribute("data-term-fyll");
      });
    });

    /* fokus i feltet når man trykker / eller "k" utenfor et felt */
    document.addEventListener("keydown", function (e) {
      var aktiv = document.activeElement;
      var iFelt = aktiv && (aktiv.tagName === "INPUT" || aktiv.tagName === "TEXTAREA" || aktiv.tagName === "SELECT");
      if (iFelt || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        felt.focus();
      }
    });
  }

  /* ---------- 2. Kretskort med pulser på canvas ---------- */
  function kretskort() {
    var canvas = document.querySelector("[data-krets]");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var fallback = document.querySelector(".hero__fallback");
    if (!ctx || rolig) {
      if (fallback) fallback.style.display = "block";
      canvas.style.display = "none";
      return;
    }
    if (fallback) fallback.style.display = "none";

    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = 0, H = 0, baner = [], pulser = [];

    function lagBane() {
      /* ortogonal bane med 45-graders hjørner, som kobber på et kort */
      var x = Math.random() * W;
      var y = Math.random() * H;
      var p = [{ x: x, y: y }];
      var steg = 3 + Math.floor(Math.random() * 3);
      for (var i = 0; i < steg; i++) {
        var retning = Math.floor(Math.random() * 4);
        var len = 40 + Math.random() * 180;
        if (retning === 0) x += len;
        else if (retning === 1) x -= len;
        else if (retning === 2) y += len;
        else y -= len;
        if (Math.random() > 0.45) {
          var diag = (Math.random() > 0.5 ? 1 : -1) * Math.min(len, 60);
          p.push({ x: x - (retning === 0 || retning === 1 ? diag : 0), y: y - (retning === 2 || retning === 3 ? diag : 0) });
        }
        p.push({ x: x, y: y });
      }
      return p;
    }

    function lengde(p) {
      var l = 0;
      for (var i = 1; i < p.length; i++) l += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
      return l;
    }

    function punkt(p, d) {
      for (var i = 1; i < p.length; i++) {
        var seg = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
        if (d <= seg) {
          var t = seg ? d / seg : 0;
          return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * t, y: p[i - 1].y + (p[i].y - p[i - 1].y) * t };
        }
        d -= seg;
      }
      return p[p.length - 1];
    }

    function bygg() {
      var rect = canvas.parentNode.getBoundingClientRect();
      W = Math.max(320, rect.width);
      H = Math.max(300, rect.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      baner = [];
      pulser = [];
      var antall = Math.max(7, Math.round(W / 120));
      for (var i = 0; i < antall; i++) {
        var p = lagBane();
        baner.push({ p: p, l: lengde(p), lyd: 0.16 + Math.random() * 0.26 });
      }
      for (var j = 0; j < 14; j++) {
        pulser.push({
          bane: Math.floor(Math.random() * baner.length),
          d: Math.random() * 400,
          fart: 40 + Math.random() * 90,
          lys: Math.random() > 0.7
        });
      }
    }

    var siste = 0;
    function tegn(tid) {
      var dt = siste ? Math.min(0.05, (tid - siste) / 1000) : 0;
      siste = tid;
      ctx.clearRect(0, 0, W, H);

      /* kobberbaner */
      ctx.lineWidth = 1;
      for (var i = 0; i < baner.length; i++) {
        var b = baner[i];
        ctx.strokeStyle = "rgba(47, 90, 161, " + b.lyd + ")";
        ctx.beginPath();
        ctx.moveTo(b.p[0].x, b.p[0].y);
        for (var k = 1; k < b.p.length; k++) ctx.lineTo(b.p[k].x, b.p[k].y);
        ctx.stroke();

        /* loddeøyne i endene */
        ctx.fillStyle = "rgba(127, 169, 224, " + (b.lyd + 0.1) + ")";
        ctx.beginPath();
        ctx.arc(b.p[0].x, b.p[0].y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(b.p[b.p.length - 1].x, b.p[b.p.length - 1].y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      /* pulser */
      for (var j = 0; j < pulser.length; j++) {
        var pu = pulser[j];
        var bane = baner[pu.bane];
        if (!bane) continue;
        pu.d += pu.fart * dt;
        if (pu.d > bane.l) {
          pu.d = 0;
          pu.bane = Math.floor(Math.random() * baner.length);
        }
        var pt = punkt(bane.p, pu.d);
        var farge = pu.lys ? "184, 242, 77" : "127, 169, 224";
        var g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 9);
        g.addColorStop(0, "rgba(" + farge + ", .95)");
        g.addColorStop(1, "rgba(" + farge + ", 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(" + farge + ", 1)";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tegn);
    }

    bygg();
    requestAnimationFrame(tegn);
    var t = null;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(bygg, 220);
    });
  }

  /* ---------- 3. Transformator: pekeren tipper kuben ---------- */
  function trafo() {
    var scene = document.querySelector("[data-trafo]");
    if (!scene || rolig) return;
    var kube = scene.querySelector(".trafo__scene");
    if (!kube) return;
    var sone = scene.closest(".trafo") || scene;
    sone.addEventListener("pointermove", function (e) {
      var r = sone.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      kube.style.animation = "none";
      kube.style.transform = "rotateX(" + (-18 + y * 22).toFixed(1) + "deg) rotateY(" + (-34 + x * 40).toFixed(1) + "deg)";
    });
    sone.addEventListener("pointerleave", function () {
      kube.style.animation = "";
      kube.style.transform = "";
    });
  }

  /* ---------- 4. Avsløring ---------- */
  function avslor() {
    var ting = document.querySelectorAll(".avslor");
    if (!ting.length) return;
    if (rolig || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(ting, function (t) { t.classList.add("er-inne"); });
      return;
    }
    var io = new IntersectionObserver(function (o) {
      o.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("er-inne"); io.unobserve(x.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(ting, function (t) { io.observe(t); });
  }

  /* ---------- 5. Skjema ---------- */
  function skjema() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-skjema]"), function (skj) {
      skj.addEventListener("submit", function (e) {
        e.preventDefault();
        var ut = skj.querySelector("[data-skjemasvar]");
        if (ut) {
          ut.hidden = false;
          ut.textContent = "OK: forespørselen er registrert i demoen. I produksjon går den til post@elektrisk.no. Vi svarer innen neste virkedag.";
          ut.setAttribute("tabindex", "-1");
          ut.focus();
        }
        skj.reset();
      });
    });
  }

  /* ---------- 6. Panel: oppdrag og avvik ---------- */
  function panel() {
    var liste = document.querySelector("[data-oppdrag]");
    var avvik = document.querySelector("[data-avvik]");
    if (!liste && !avvik) return;

    var logg = document.querySelector("[data-logg]");
    var kpiAapne = document.querySelector("[data-kpi-avvik]");
    var kpiFerdig = document.querySelector("[data-kpi-ferdig]");
    var kpiTimer = document.querySelector("[data-kpi-timer]");
    var teller = document.querySelector("[data-antall]");

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
      var aapne = 0, lukket = 0;
      if (avvik) {
        Array.prototype.forEach.call(avvik.querySelectorAll(".avvik__rad"), function (rad) {
          if (rad.getAttribute("data-lukket") === "true") lukket++;
          else aapne++;
        });
      }
      var ferdig = 0;
      if (liste) {
        Array.prototype.forEach.call(liste.querySelectorAll(".oppdrag__rad"), function (rad) {
          if (rad.getAttribute("data-status") === "ferdig") ferdig++;
        });
        var synlige = 0;
        Array.prototype.forEach.call(liste.querySelectorAll(".oppdrag__rad"), function (rad) {
          if (rad.style.display !== "none") synlige++;
        });
        if (teller) teller.textContent = synlige + " av " + liste.querySelectorAll(".oppdrag__rad").length + " oppdrag";
      }
      if (kpiAapne) kpiAapne.textContent = aapne;
      if (kpiFerdig) kpiFerdig.textContent = ferdig;
      if (kpiTimer) kpiTimer.textContent = 148 + ferdig * 7;
    }

    if (liste) {
      liste.addEventListener("click", function (e) {
        var knapp = e.target.closest("[data-ferdig]");
        if (!knapp) return;
        var rad = knapp.closest(".oppdrag__rad");
        if (!rad) return;
        rad.setAttribute("data-status", "ferdig");
        var st = rad.querySelector(".oppdrag__status");
        if (st) st.textContent = "Ferdig";
        knapp.disabled = true;
        knapp.textContent = "Ferdig";
        var navn = rad.querySelector(".oppdrag__tittel");
        skrivLogg("Oppdrag fullført: " + (navn ? navn.textContent : "ukjent"));
        oppdater();
      });

      var knapper = document.querySelectorAll("[data-filter]");
      Array.prototype.forEach.call(knapper, function (knapp) {
        knapp.addEventListener("click", function () {
          var valg = knapp.getAttribute("data-filter");
          Array.prototype.forEach.call(knapper, function (k) { k.setAttribute("aria-pressed", String(k === knapp)); });
          Array.prototype.forEach.call(liste.querySelectorAll(".oppdrag__rad"), function (rad) {
            var synlig = valg === "alle" || rad.getAttribute("data-status") === valg;
            rad.style.display = synlig ? "" : "none";
          });
          oppdater();
        });
      });
    }

    if (avvik) {
      avvik.addEventListener("click", function (e) {
        var knapp = e.target.closest("[data-lukk-avvik]");
        if (!knapp) return;
        var rad = knapp.closest(".avvik__rad");
        if (!rad || rad.getAttribute("data-lukket") === "true") return;
        rad.setAttribute("data-lukket", "true");
        knapp.disabled = true;
        knapp.textContent = "Lukket";
        var navn = rad.querySelector(".avvik__navn");
        skrivLogg("Avvik lukket: " + (navn ? navn.textContent : "ukjent"));
        oppdater();
      });
    }

    var alle = document.querySelector("[data-lukk-alle]");
    if (alle) {
      alle.addEventListener("click", function () {
        Array.prototype.forEach.call(document.querySelectorAll('.avvik__rad[data-lukket="false"]'), function (rad) {
          rad.setAttribute("data-lukket", "true");
          var k = rad.querySelector("[data-lukk-avvik]");
          if (k) { k.disabled = true; k.textContent = "Lukket"; }
        });
        skrivLogg("Alle åpne avvik lukket etter HMS-gjennomgang.");
        oppdater();
      });
    }

    oppdater();
    skrivLogg("Vaktliste lastet. 9 oppdrag, 3 åpne avvik.");
  }

  function ar() {
    var el = document.querySelector("[data-ar]");
    if (el) el.textContent = new Date().getFullYear();
  }

  terminal();
  kretskort();
  trafo();
  avslor();
  skjema();
  panel();
  ar();
})();