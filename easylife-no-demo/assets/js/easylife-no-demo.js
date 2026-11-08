/* ============================================================
   EasyLife — eget skript
   WebGL gradient-blob i hero, dock med søk, medlemspanel.
   Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. WebGL gradient-blob ---------- */
  var VS = 'attribute vec2 pos;void main(){gl_Position=vec4(pos,0.0,1.0);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 u_res;uniform float u_t;',
    'void main(){',
    '  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;',
    '  float t=u_t*0.12;',
    '  vec3 krem=vec3(0.984,0.969,0.945);',
    '  vec3 gronn=vec3(0.486,0.702,0.259);',
    '  vec3 plomme=vec3(0.482,0.176,0.420);',
    '  vec3 col=krem;',
    '  for(int i=0;i<4;i++){',
    '    float fi=float(i);',
    '    vec2 c=vec2(sin(t*(1.0+fi*0.45)+fi*2.1)*0.42,cos(t*(0.8+fi*0.35)+fi*1.7)*0.30);',
    '    float r=0.22+0.06*sin(t*1.3+fi);',
    '    float d=length(uv-c);',
    '    float m=smoothstep(r,r*0.15,d);',
    '    vec3 farge=mix(plomme,gronn,fract(fi*0.37+0.2));',
    '    col=mix(col,farge,m*(0.30+0.12*sin(fi)));',
    '  }',
    '  float glod=smoothstep(0.9,0.1,length(uv*vec2(0.8,1.1)));',
    '  col=mix(krem,col,glod);',
    '  col+=0.015*sin(uv.y*220.0);',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');
  var holder = document.querySelector('[data-blob]');
  function startBlob() {
    if (!holder) return;
    if (redusert) return;
    var canvas = document.createElement('canvas');
    holder.appendChild(canvas);
    var gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) { canvas.remove(); return; }
    try {
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      var rend = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
      if (/swiftshader|software|llvmpipe|softpipe/i.test(rend)) { canvas.remove(); return; }
    } catch (e) {}
    function k(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var vs = k(gl.VERTEX_SHADER, VS), fs = k(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { canvas.remove(); return; }
    var p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(p);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(p, 'pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(p, 'u_res');
    var uT = gl.getUniformLocation(p, 'u_t');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.4), w = 0, h = 0;
    function tilpass() {
      var r = holder.getBoundingClientRect();
      w = Math.max(320, Math.round(r.width * dpr)); h = Math.max(220, Math.round(r.height * dpr));
      canvas.width = w; canvas.height = h; canvas.style.width = '100%'; canvas.style.height = '100%';
      gl.viewport(0, 0, w, h); gl.uniform2f(uRes, w, h);
    }
    tilpass();
    window.addEventListener('resize', function () { setTimeout(tilpass, 120); });
    var t0 = performance.now(), raf = 0, aktiv = true;
    function tegn() {
      if (!aktiv) return;
      raf = requestAnimationFrame(tegn);
      gl.uniform1f(uT, (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    tegn();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { aktiv = false; cancelAnimationFrame(raf); }
      else { aktiv = true; tegn(); }
    });
  }
  startBlob();

  /* ---------- 2. Dock med søk ---------- */
  var dock = document.getElementById('dock');
  var sokApne = document.querySelector('[data-sok-apne]');
  var sokLukk = document.querySelector('[data-sok-lukk]');
  var sokFelt = document.getElementById('sok-felt');
  var treffBoks = document.getElementById('sok-treff');
  var treffListe = document.getElementById('sok-liste');

  var innhold = [
    { t: 'Forside', u: 'index.html', g: 'Side' },
    { t: 'Programmet', u: 'program.html', g: 'Side' },
    { t: 'Fordeler', u: 'fordeler.html', g: 'Side' },
    { t: 'Referanser', u: 'referanser.html', g: 'Side' },
    { t: 'Om EasyLife', u: 'om.html', g: 'Side' },
    { t: 'Kontakt og påmelding', u: 'kontakt.html', g: 'Side' },
    { t: 'Medlemmer og oppfølging (demo)', u: 'panel.html', g: 'System' },
    { t: 'Slik fungerer programmet', u: 'program.html#slik', g: 'Program' },
    { t: 'Trening, kosthold og motivasjon', u: 'program.html#trening', g: 'Program' },
    { t: 'EasyLife UTE', u: 'program.html#ute', g: 'Program' },
    { t: 'EasyLife online', u: 'program.html#online', g: 'Program' },
    { t: 'Bli distributør', u: 'fordeler.html#distributor', g: 'Fordeler' },
    { t: 'For treningssentre', u: 'fordeler.html#sentre', g: 'Fordeler' },
    { t: 'Historien siden 2004', u: 'om.html#historie', g: 'Om' },
    { t: 'Ofte stilte spørsmål', u: 'kontakt.html#faq', g: 'Kontakt' }
  ];
  function normaliser(s) { return s.toLowerCase().replace(/æ/g,'a').replace(/ø/g,'o').replace(/å/g,'a'); }

  function tegnTreff(q) {
    if (!treffListe) return;
    var n = normaliser((q || '').trim());
    var treff = !n ? innhold.slice(0, 8) : innhold.filter(function (x) { return normaliser(x.t).indexOf(n) > -1; });
    treffListe.innerHTML = '';
    if (!treff.length) {
      var li = document.createElement('li'); li.className = 'tom'; li.textContent = 'Ingen treff. Prøv «program», «fordeler» eller «kontakt».';
      treffListe.appendChild(li);
    } else {
      treff.forEach(function (x) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = x.u;
        a.innerHTML = '<span></span><span class="g"></span>';
        a.firstChild.textContent = x.t;
        a.lastChild.textContent = x.g;
        li.appendChild(a); treffListe.appendChild(li);
      });
    }
    if (treffBoks) treffBoks.classList.add('vis');
  }
  function lukkSok() {
    if (dock) dock.classList.remove('soker');
    if (treffBoks) treffBoks.classList.remove('vis');
    if (sokApne) sokApne.focus();
  }
  if (sokApne) sokApne.addEventListener('click', function () {
    if (!dock) return;
    dock.classList.add('soker');
    tegnTreff('');
    if (sokFelt) { sokFelt.value = ''; sokFelt.focus(); }
  });
  if (sokLukk) sokLukk.addEventListener('click', lukkSok);
  if (sokFelt) {
    sokFelt.addEventListener('input', function () { tegnTreff(sokFelt.value); });
    sokFelt.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); lukkSok(); }
      if (e.key === 'Enter') {
        var forste = treffListe && treffListe.querySelector('a');
        if (forste) { e.preventDefault(); window.location.href = forste.getAttribute('href'); }
      }
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dock && dock.classList.contains('soker')) lukkSok();
  });
  document.addEventListener('click', function (e) {
    if (!dock || !dock.classList.contains('soker')) return;
    if (dock.contains(e.target) || (treffBoks && treffBoks.contains(e.target))) return;
    lukkSok();
  });

  /* ---------- 3. Avsløring ved scroll ---------- */
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) { if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 5, 4) * 50 + 'ms'; io.observe(el); });
  } else {
    avslor.forEach(function (el) { el.classList.add('inn'); });
  }

  /* ---------- 4. Skjema ---------- */
  document.querySelectorAll('[data-skjema]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = form.querySelector('.skjema-melding');
      if (!m) return;
      var navn = form.querySelector('[name="navn"]');
      var fornavn = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (fornavn ? 'Takk, ' + fornavn + '! ' : 'Takk! ') + 'I demoen lagres henvendelsen bare i nettleseren. I en ekte løsning går den til nærmeste EasyLife-senter.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 5. Medlemspanelet ---------- */
  var liste = document.querySelector('[data-medlemmer]');
  if (liste) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiAktive = document.querySelector('[data-kpi-aktive]');
    var kpiNye = document.querySelector('[data-kpi-nye]');
    var kpiFerdig = document.querySelector('[data-kpi-ferdig]');
    function skrivLogg(t) {
      if (!logg) return;
      var d = new Date();
      var kl = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      var rad = document.createElement('div');
      rad.innerHTML = '<b>' + kl + '</b> ';
      rad.appendChild(document.createTextNode(t));
      logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = liste.querySelectorAll('.medlem');
      var ny = 0, aktiv = 0, ferdig = 0;
      alle.forEach(function (m) {
        var s = m.getAttribute('data-status');
        if (s === 'ny') ny++; else if (s === 'fullfort') ferdig++; else aktiv++;
      });
      if (kpiAktive) kpiAktive.textContent = String(aktiv);
      if (kpiNye) kpiNye.textContent = String(ny);
      if (kpiFerdig) kpiFerdig.textContent = String(ferdig);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall'); if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'ny' ? ny : k === 'aktiv' ? aktiv : ferdig);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed','false'); });
        f.setAttribute('aria-pressed','true');
        liste.querySelectorAll('.medlem').forEach(function (m) {
          m.style.display = (k === 'alle' || m.getAttribute('data-status') === k) ? '' : 'none';
        });
      });
    });
    liste.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var m = knapp.closest('.medlem');
      if (!m) return;
      var id = m.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      var st = m.querySelector('.status');
      if (h === 'kontakt') {
        m.setAttribute('data-status','aktiv');
        if (st) { st.textContent = 'Aktiv'; st.setAttribute('data-status','aktiv'); }
        knapp.disabled = true; knapp.textContent = 'Kontaktet';
        skrivLogg('medlem ' + id + ' kontaktet');
        visToast('Medlem ' + id + ' er merket som kontaktet. Senteret får oppgaven i dagboken.');
        tell();
      } else if (h === 'oppfolging') {
        skrivLogg('oppfølging sendt til ' + id);
        visToast('Oppfølgingsmelding sendt til medlem ' + id + ' (demo).');
      } else if (h === 'ferdig') {
        m.setAttribute('data-status','fullfort');
        m.classList.add('medlem--ferdig');
        if (st) { st.textContent = 'Fullført'; st.setAttribute('data-status','fullfort'); }
        m.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg('medlem ' + id + ' fullførte programmet');
        visToast('Gratulerer! Medlem ' + id + ' er registrert som ferdig.');
        tell();
      }
    });
    tell();
  }

  var toastTid = null;
  function visToast(t) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = t;
    el.classList.add('vis');
    clearTimeout(toastTid);
    toastTid = setTimeout(function () { el.classList.remove('vis'); }, 3600);
  }
})();
