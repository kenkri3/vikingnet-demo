/* ============================================================
   accelerate — aztek-no-demo
   All bevegelse, shader, kommandopalett og panellogikk.
   Ingen biblioteker. Skrevet for hånd.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. WebGL: konturlandskap i bakgrunnen ---------- */
  var VS = 'attribute vec2 pos;void main(){gl_Position=vec4(pos,0.0,1.0);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 u_res;uniform float u_t;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);',
    ' float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));',
    ' return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}',
    'float fbm(vec2 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(3.1,1.7);a*=0.5;}return s;}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/u_res;',
    '  vec2 p=(uv-vec2(0.5))*vec2(u_res.x/u_res.y,1.0);',
    '  float t=u_t*0.035;',
    '  vec2 q=vec2(fbm(p*1.5+vec2(0.0,t)),fbm(p*1.5+vec2(5.2,-t)));',
    '  float n=fbm(p*2.1+q*1.9+vec2(t*0.5,0.0));',
    '  float lines=abs(fract(n*9.0+t*1.2)-0.5);',
    '  float line=1.0-smoothstep(0.0,0.06,lines);',
    '  float glow=pow(max(0.0,1.0-abs(n-0.55)*1.9),4.0);',
    '  vec3 ink=vec3(0.027,0.035,0.047);',
    '  vec3 mint=vec3(0.302,0.910,0.690);',
    '  vec3 col=mix(ink,vec3(0.031,0.090,0.078),n*0.95);',
    '  col+=mint*line*0.30;',
    '  col+=mint*glow*0.09;',
    '  float v=smoothstep(1.30,0.20,length(p*vec2(0.78,1.0)));',
    '  col*=mix(0.42,1.0,v);',
    '  col+=0.010*sin(gl_FragCoord.y*1.7);',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  function startShader() {
    var holder = document.querySelector('[data-shader]');
    if (!holder || redusert) return;
    var canvas = document.createElement('canvas');
    holder.appendChild(canvas);
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }) || canvas.getContext('experimental-webgl');
    if (!gl) { canvas.remove(); return; }
    // programvare-renderer gir hvitt/feil bilde: bruk CSS-fallbacken i stedet
    try {
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      var rend = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
      if (/swiftshader|software|llvmpipe|softpipe/i.test(rend)) { canvas.remove(); return; }
    } catch (e) { /* uten debug-info fortsetter vi */ }
    function kompiler(type, kilde) {
      var s = gl.createShader(type);
      gl.shaderSource(s, kilde); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
      return s;
    }
    var vs = kompiler(gl.VERTEX_SHADER, VS);
    var fs = kompiler(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { canvas.remove(); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var pos = gl.getAttribLocation(prog, 'pos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, 'u_res');
    var uT = gl.getUniformLocation(prog, 'u_t');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.4);
    var bredde = 0, hoyde = 0;
    function tilpass() {
      var r = holder.getBoundingClientRect();
      bredde = Math.max(320, Math.round(r.width * dpr));
      hoyde = Math.max(240, Math.round(r.height * dpr));
      canvas.width = bredde; canvas.height = hoyde;
      gl.viewport(0, 0, bredde, hoyde);
      gl.uniform2f(uRes, bredde, hoyde);
    }
    tilpass();
    window.addEventListener('resize', function () { setTimeout(tilpass, 120); });
    var start = performance.now();
    var kjorer = true;
    var bilde = 0;
    function tegn() {
      if (!kjorer) return;
      bilde = requestAnimationFrame(tegn);
      gl.uniform1f(uT, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { kjorer = false; cancelAnimationFrame(bilde); }
      else if (!redusert) { kjorer = true; tegn(); }
    });
    tegn();
    // sanity: noen hodelose miljoer rendrer shaderen som hvitt. Da skjuler vi lerretet
    // og lar CSS-fallbacken ta over, slik at heroen aldri blir hvit.
    try {
      var px = new Uint8Array(4);
      gl.readPixels(Math.floor(bredde / 2), Math.floor(hoyde / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      var lum = (px[0] * 0.2126 + px[1] * 0.7152 + px[2] * 0.0722) / 255;
      if (lum > 0.6) { kjorer = false; cancelAnimationFrame(bilde); canvas.remove(); }
    } catch (e) { /* readPixels blokkert – beholder lerretet */ }
  }
  startShader();

  /* ---------- 2. Kommandopalett ---------- */
  var sider = [
    { t: 'Forside', h: 'index.html', g: 'Side' },
    { t: 'Tjenester', h: 'tjenester.html', g: 'Side' },
    { t: 'Plattform', h: 'plattform.html', g: 'Side' },
    { t: 'Kundehistorier', h: 'case.html', g: 'Side' },
    { t: 'Om oss', h: 'om.html', g: 'Side' },
    { t: 'Kontakt', h: 'kontakt.html', g: 'Side' },
    { t: 'Kundeportal', h: 'panel.html', g: 'System' },
    { t: 'Moderne systemutvikling', h: 'tjenester.html#systemutvikling', g: 'Tjeneste' },
    { t: 'Data- og analyseplattform', h: 'tjenester.html#data', g: 'Tjeneste' },
    { t: 'Kunstig intelligens', h: 'tjenester.html#ai', g: 'Tjeneste' },
    { t: 'Sikkerhet og infrastruktur', h: 'tjenester.html#sikkerhet', g: 'Tjeneste' },
    { t: 'Automatisert hybrid infrastruktur', h: 'tjenester.html#hybrid', g: 'Tjeneste' },
    { t: 'Integrasjon', h: 'tjenester.html#integrasjon', g: 'Tjeneste' },
    { t: '250 spesialister · to land', h: 'om.html#tall', g: 'Fakta' },
    { t: 'Iver-gruppen og Cleura', h: 'om.html#gruppe', g: 'Fakta' },
    { t: 'Ledige stillinger', h: 'om.html#jobb', g: 'Karriere' },
    { t: 'Åpningstider og kontor', h: 'kontakt.html#kontor', g: 'Kontakt' },
    { t: 'Send en henvendelse', h: 'kontakt.html#skjema', g: 'Kontakt' },
    { t: 'Personvern', h: 'kontakt.html#personvern', g: 'Kontakt' }
  ];
  var palett = document.getElementById('palett');
  var palettFelt = document.getElementById('palett-felt');
  var palettListe = document.getElementById('palett-liste');
  var palettApen = false;
  var valgt = 0;
  var treff = sider.slice();

  function normaliser(s) {
    return s.toLowerCase().replace(/æ/g, 'a').replace(/ø/g, 'o').replace(/å/g, 'a');
  }

  function tegnListe() {
    if (!palettListe) return;
    palettListe.innerHTML = '';
    if (!treff.length) {
      var tom = document.createElement('li');
      tom.className = 'palett-tom';
      tom.textContent = 'Ingen treff. Prøv «data», «case» eller «kontakt».';
      palettListe.appendChild(tom);
      return;
    }
    treff.forEach(function (s, i) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = s.h;
      a.setAttribute('role', 'option');
      a.setAttribute('aria-selected', i === valgt ? 'true' : 'false');
      a.innerHTML = '<span class="nr">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="tt"></span><span class="kg">' + s.g + '</span>';
      a.querySelector('.tt').textContent = s.t;
      a.addEventListener('click', function () { lukkPalett(); });
      li.appendChild(a);
      palettListe.appendChild(li);
    });
  }

  function filtrer(q) {
    var n = normaliser(q.trim());
    treff = !n ? sider.slice() : sider.filter(function (s) {
      return normaliser(s.t).indexOf(n) > -1 || normaliser(s.g).indexOf(n) > -1;
    });
    valgt = 0;
    tegnListe();
  }

  function apnePalett() {
    if (!palett || palettApen) return;
    palettApen = true;
    palett.hidden = false;
    document.body.style.overflow = 'hidden';
    filtrer('');
    if (palettFelt) { palettFelt.value = ''; palettFelt.focus(); }
    document.documentElement.setAttribute('data-palett', 'apen');
  }
  function lukkPalett() {
    if (!palett || !palettApen) return;
    palettApen = false;
    palett.hidden = true;
    document.body.style.overflow = '';
    document.documentElement.removeAttribute('data-palett');
    var apner = document.querySelector('[data-palett-apne]');
    if (apner) apner.focus();
  }
  function flytt(retning) {
    if (!treff.length) return;
    valgt = (valgt + retning + treff.length) % treff.length;
    var lenker = palettListe.querySelectorAll('a');
    for (var i = 0; i < lenker.length; i++) {
      lenker[i].setAttribute('aria-selected', i === valgt ? 'true' : 'false');
    }
    if (lenker[valgt]) {
      lenker[valgt].scrollIntoView({ block: 'nearest' });
    }
  }

  document.querySelectorAll('[data-palett-apne]').forEach(function (b) {
    b.addEventListener('click', apnePalett);
  });
  if (palett) {
    palett.addEventListener('click', function (e) { if (e.target === palett) lukkPalett(); });
  }
  if (palettFelt) {
    palettFelt.addEventListener('input', function () { filtrer(palettFelt.value); });
  }
  document.addEventListener('keydown', function (e) {
    var m = e.metaKey || e.ctrlKey;
    if (m && e.key.toLowerCase() === 'k') { e.preventDefault(); apnePalett(); return; }
    if (e.key === '/' && !palettApen) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') { e.preventDefault(); apnePalett(); }
      return;
    }
    if (!palettApen) return;
    if (e.key === 'Escape') { e.preventDefault(); lukkPalett(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); flytt(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); flytt(-1); }
    else if (e.key === 'Enter') {
      if (treff[valgt]) { e.preventDefault(); window.location.href = treff[valgt].h; }
    }
  });

  /* ---------- 3. Leselinje i toppen ---------- */
  var topp = document.querySelector('.topp');
  if (topp) {
    var oppdater = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0;
      topp.style.setProperty('--lastet', p.toFixed(1) + '%');
    };
    oppdater();
    window.addEventListener('scroll', oppdater, { passive: true });
    window.addEventListener('resize', oppdater);
  }

  /* ---------- 4. Avsløring ved scroll ---------- */
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (oppforinger) {
      oppforinger.forEach(function (o) {
        if (o.isIntersecting) { o.target.classList.add('inn'); io.unobserve(o.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    avslor.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 45 + 'ms';
      io.observe(el);
    });
  } else {
    avslor.forEach(function (el) { el.classList.add('inn'); });
  }

  /* ---------- 5. Skjema ---------- */
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var melding = form.querySelector('.skjema-melding');
      if (!melding) return;
      var navn = form.querySelector('[name="navn"]');
      melding.textContent = 'Takk, ' + (navn && navn.value ? navn.value.split(' ')[0] : 'vi har') +
        '. Henvendelsen er registrert i demoen. I en ekte løsning går den rett til køen i kundeportalen.';
      melding.classList.add('vis');
      form.querySelectorAll('input,textarea,select').forEach(function (f) { if (f.type !== 'submit') f.value = ''; });
    });
  });

  /* ---------- 6. Panel ---------- */
  var sakslister = document.querySelector('[data-saker]');
  if (sakslister) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var aapneKpi = document.querySelector('[data-kpi-aapne]');
    var lostKpi = document.querySelector('[data-kpi-lost]');
    var telling = 0;

    function skrivLogg(tekst) {
      if (!logg) return;
      var tid = new Date();
      var kl = String(tid.getHours()).padStart(2, '0') + ':' + String(tid.getMinutes()).padStart(2, '0') + ':' + String(tid.getSeconds()).padStart(2, '0');
      var rad = document.createElement('div');
      rad.innerHTML = '<span>' + kl + '</span> <b>OK</b> ';
      rad.appendChild(document.createTextNode(tekst));
      logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 8) { logg.removeChild(logg.lastChild); }
    }

    function tellOpp() {
      var alle = sakslister.querySelectorAll('.sak');
      var aapne = 0, lost = 0;
      alle.forEach(function (s) {
        if (s.getAttribute('data-status') === 'lost') lost++; else aapne++;
      });
      if (aapneKpi) aapneKpi.textContent = String(aapne);
      if (lostKpi) lostKpi.textContent = String(lost);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall');
        if (!n) return;
        var k = f.getAttribute('data-filter');
        if (k === 'alle') n.textContent = String(alle.length);
        else if (k === 'aapne') n.textContent = String(aapne);
        else if (k === 'lost') n.textContent = String(lost);
      });
    }

    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        f.setAttribute('aria-pressed', 'true');
        sakslister.querySelectorAll('.sak').forEach(function (s) {
          var st = s.getAttribute('data-status');
          var vis = k === 'alle' || (k === 'aapne' && st !== 'lost') || (k === 'lost' && st === 'lost');
          s.style.display = vis ? '' : 'none';
        });
        skrivLogg('filter satt til ' + f.textContent.replace(/[0-9]+/g, '').trim().toLowerCase());
      });
    });

    sakslister.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var sak = knapp.closest('.sak');
      if (!sak) return;
      var id = sak.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      if (h === 'svar') {
        var st = sak.querySelector('.sak-status');
        if (st) st.textContent = 'Besvart · venter på kunde';
        sak.setAttribute('data-status', 'besvart');
        knapp.disabled = true;
        knapp.textContent = 'Svar sendt';
        skrivLogg('svar sendt på sak ' + id);
        visToast('Svar sendt på sak ' + id + ' — kunden får e-post med en gang.');
      } else if (h === 'lost') {
        sak.setAttribute('data-status', 'lost');
        sak.classList.add('sak--lost');
        var st2 = sak.querySelector('.sak-status');
        if (st2) st2.textContent = 'Løst';
        var alle = sak.querySelectorAll('[data-handling]');
        alle.forEach(function (b) { b.disabled = true; });
        tellOpp();
        skrivLogg('sak ' + id + ' merket løst');
        visToast('Sak ' + id + ' er merket løst og arkivert i køen.');
      } else if (h === 'tilordne') {
        var st3 = sak.querySelector('.sak-status');
        if (st3) st3.textContent = 'Tilordnet · ' + (sak.getAttribute('data-eier') || 'vaktlaget');
        knapp.textContent = 'Tilordnet';
        knapp.disabled = true;
        skrivLogg('sak ' + id + ' tilordnet vaktlaget');
        visToast('Sak ' + id + ' er tilordnet. Vaktlaget får varsel i Teams.');
      }
    });
    tellOpp();
  }

  var toastTimer = null;
  function visToast(tekst) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = tekst;
    t.classList.add('vis');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('vis'); }, 3600);
  }
  window.visToast = visToast;

  /* ---------- 7. Oppetidslinjer ---------- */
  document.querySelectorAll('[data-oppetid]').forEach(function (rad) {
    var p = rad.getAttribute('data-oppetid');
    var i = rad.querySelector('i');
    if (i) { i.style.width = '0%'; requestAnimationFrame(function () { i.style.width = p + '%'; }); }
  });

  /* ---------- 8. Aktiv side i toppmeny ---------- */
  var her = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.topp-nav a, .bunn a').forEach(function (a) {
    var h = a.getAttribute('href') || '';
    if (h && h.split('#')[0] === her) a.setAttribute('aria-current', 'page');
  });
})();
