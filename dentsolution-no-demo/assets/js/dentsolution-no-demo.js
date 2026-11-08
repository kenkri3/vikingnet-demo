/* ============================================================
   Dent Solution AS — eget skript
   WebGL: zirkonia-krystall med refraksjon og dispersjon.
   Kapittelindeks, produksjonskø i panelet. Ingen biblioteker.
   ============================================================ */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Krystallen ---------- */
  var VS = 'attribute vec2 pos;void main(){gl_Position=vec4(pos,0.0,1.0);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 u_res;uniform float u_t;',
    'float sdOcta(vec3 p,float s){p=abs(p);return (p.x+p.y+p.z-s)*0.57735027;}',
    'float map(vec3 p){',
    '  float a=u_t*0.13;float c=cos(a),s=sin(a);',
    '  vec3 q=p; q.xz=mat2(c,-s,s,c)*q.xz;',
    '  q.yz=mat2(cos(a*0.7),-sin(a*0.7),sin(a*0.7),cos(a*0.7))*q.yz;',
    '  return sdOcta(q,0.80)-0.015;',
    '}',
    'vec3 nor(vec3 p){vec2 e=vec2(0.0015,0.0);return normalize(vec3(',
    '  map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));}',
    'vec3 env(vec3 d){',
    '  float sky=smoothstep(-0.35,0.95,d.y);',
    '  vec3 col=mix(vec3(0.020,0.032,0.038),vec3(0.075,0.115,0.135),sky);',
    '  float l1=pow(max(0.0,dot(d,normalize(vec3(0.55,0.72,0.42)))),20.0);',
    '  float l2=pow(max(0.0,dot(d,normalize(vec3(-0.72,0.18,0.62)))),70.0);',
    '  col+=vec3(1.0,0.94,0.83)*l1*1.8;',
    '  col+=vec3(0.55,0.80,0.92)*l2*1.4;',
    '  float strip=smoothstep(0.40,0.5,abs(sin(d.y*7.0+d.x*2.4)));',
    '  col+=vec3(0.045,0.075,0.085)*strip;',
    '  return col;',
    '}',
    'vec3 bryt(vec3 rd,vec3 n,float ior){',
    '  vec3 a=refract(rd,n,1.0/ior);',
    '  vec3 b=refract(a,-n,ior);',
    '  return env(b);',
    '}',
    'void main(){',
    '  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;',
    '  if(u_res.x/u_res.y>1.15){uv.x-=0.17;}else if(u_res.x/u_res.y<0.95){uv.y+=0.30;uv.x+=0.02;}',
    '  vec3 ro=vec3(0.0,0.0,3.15);',
    '  vec3 rd=normalize(vec3(uv,-1.75));',
    '  float t=0.0;bool hit=false;',
    '  for(int i=0;i<84;i++){',
    '    vec3 p=ro+rd*t;float d=map(p);',
    '    if(d<0.0018){hit=true;break;}',
    '    t+=max(d*0.85,0.004);',
    '    if(t>4.6)break;',
    '  }',
    '  vec3 col=env(rd)*0.55;',
    '  if(hit){',
    '    vec3 p=ro+rd*t;vec3 n=nor(p);',
    '    vec3 r=bryt(rd,n,1.50);',
    '    vec3 g=bryt(rd,n,1.63);',
    '    vec3 b=bryt(rd,n,1.80);',
    '    vec3 disp=vec3(r.r,g.g,b.b);',
    '    vec3 refl=env(reflect(rd,n));',
    '    float fr=pow(1.0-max(0.0,dot(-rd,n)),3.0);',
    '    col=mix(disp*1.35,refl,0.14+fr*0.5);',
    '    float spec=pow(max(0.0,dot(reflect(rd,n),normalize(vec3(0.55,0.72,0.42)))),48.0);',
    '    col+=vec3(1.0,0.96,0.88)*spec*1.4;',
    '    col+=vec3(0.35,0.62,0.72)*pow(1.0-abs(dot(n,-rd)),2.5)*0.35;',
    '  }',
    '  col+=vec3(0.10,0.20,0.24)*pow(max(0.0,1.0-length(uv*1.6)),3.0)*1.1;',
    '  col*=1.0-0.42*length(uv*0.92);',
    '  col=pow(col,vec3(0.92));',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  var holder = document.querySelector('[data-krystall]');
  var kjorer = true;
  function startKrystall() {
    if (!holder) return;
    if (redusert) { holder.classList.add('uten-webgl'); return; }
    var canvas = document.createElement('canvas');
    holder.appendChild(canvas);
    var gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!gl) { canvas.remove(); holder.classList.add('uten-webgl'); return; }
    function k(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = k(gl.VERTEX_SHADER, VS), fs = k(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { canvas.remove(); holder.classList.add('uten-webgl'); return; }
    var p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { canvas.remove(); holder.classList.add('uten-webgl'); return; }
    gl.useProgram(p);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(p, 'pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(p, 'u_res');
    var uT = gl.getUniformLocation(p, 'u_t');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    var w = 0, h = 0;
    function tilpass() {
      var r = holder.getBoundingClientRect();
      w = Math.max(280, Math.round(r.width * dpr));
      h = Math.max(280, Math.round(r.height * dpr));
      canvas.width = w; canvas.height = h;
      canvas.style.width = '100%'; canvas.style.height = '100%';
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
    tilpass();
    window.addEventListener('resize', function () { setTimeout(tilpass, 120); });
    var t0 = performance.now();
    var raf = 0;
    var lite = (w * h) < 700000;
    function tegn() {
      if (!kjorer) return;
      raf = requestAnimationFrame(tegn);
      gl.uniform1f(uT, (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    tegn();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { kjorer = false; cancelAnimationFrame(raf); }
      else { kjorer = true; tegn(); }
    });
  }
  startKrystall();

  /* ---------- 2. Kapittelindeksen ---------- */
  var indeks = document.getElementById('indeks');
  var apne = document.querySelector('[data-indeks-apne]');
  var lukk = document.querySelector('[data-indeks-lukk]');
  var apen = false;
  function apneIndeks() {
    if (!indeks || apen) return;
    apen = true;
    indeks.classList.add('apen');
    indeks.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (apne) apne.setAttribute('aria-expanded', 'true');
    if (lukk) setTimeout(function () { lukk.focus(); }, 80);
  }
  function lukkIndeks() {
    if (!indeks || !apen) return;
    apen = false;
    indeks.classList.remove('apen');
    indeks.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (apne) { apne.setAttribute('aria-expanded', 'false'); apne.focus(); }
  }
  if (apne) apne.addEventListener('click', apneIndeks);
  if (lukk) lukk.addEventListener('click', lukkIndeks);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && apen) { e.preventDefault(); lukkIndeks(); }
  });
  if (indeks) {
    indeks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setTimeout(lukkIndeks, 40); });
    });
  }

  /* ---------- 3. Avsløring ved scroll ---------- */
  var avslor = document.querySelectorAll('.avslor');
  if ('IntersectionObserver' in window && !redusert && avslor.length) {
    var io = new IntersectionObserver(function (rader) {
      rader.forEach(function (r) {
        if (r.isIntersecting) { r.target.classList.add('inn'); io.unobserve(r.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    avslor.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
      io.observe(el);
    });
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
      var hei = navn && navn.value ? navn.value.trim().split(' ')[0] : '';
      m.textContent = (hei ? 'Takk, ' + hei + '. ' : 'Takk. ') + 'Henvendelsen er registrert i demoen. I en ekte løsning går den til OrdreOnline og produksjonskøen.';
      m.classList.add('vis');
      form.querySelectorAll('input,textarea').forEach(function (f) { f.value = ''; });
    });
  });

  /* ---------- 5. Produksjonskøen ---------- */
  var ko = document.querySelector('[data-ko]');
  if (ko) {
    var faner = document.querySelectorAll('[data-filter]');
    var logg = document.querySelector('[data-logg]');
    var kpiKo = document.querySelector('[data-kpi-ko]');
    var kpiProd = document.querySelector('[data-kpi-prod]');
    var kpiKlar = document.querySelector('[data-kpi-klar]');

    function skrivLogg(tekst) {
      if (!logg) return;
      var t = new Date();
      var kl = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
      var rad = document.createElement('div');
      rad.innerHTML = '<b>' + kl + '</b> ';
      rad.appendChild(document.createTextNode(tekst));
      logg.insertBefore(rad, logg.firstChild);
      while (logg.children.length > 7) logg.removeChild(logg.lastChild);
    }
    function tell() {
      var alle = ko.querySelectorAll('.sak');
      var modell = 0, prod = 0, ferdig = 0;
      alle.forEach(function (s) {
        var st = s.getAttribute('data-status');
        if (st === 'ferdig') ferdig++;
        else if (st === 'produksjon') prod++;
        else modell++;
      });
      if (kpiKo) kpiKo.textContent = String(modell + prod);
      if (kpiProd) kpiProd.textContent = String(prod);
      if (kpiKlar) kpiKlar.textContent = String(ferdig);
      faner.forEach(function (f) {
        var n = f.querySelector('.antall');
        if (!n) return;
        var k = f.getAttribute('data-filter');
        n.textContent = String(k === 'alle' ? alle.length : k === 'modell' ? modell : k === 'produksjon' ? prod : ferdig);
      });
    }
    faner.forEach(function (f) {
      f.addEventListener('click', function () {
        var k = f.getAttribute('data-filter');
        faner.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        f.setAttribute('aria-pressed', 'true');
        ko.querySelectorAll('.sak').forEach(function (s) {
          var st = s.getAttribute('data-status');
          s.style.display = (k === 'alle' || st === k) ? '' : 'none';
        });
      });
    });
    ko.addEventListener('click', function (e) {
      var knapp = e.target.closest('[data-handling]');
      if (!knapp) return;
      var sak = knapp.closest('.sak');
      if (!sak) return;
      var id = sak.getAttribute('data-id') || '';
      var h = knapp.getAttribute('data-handling');
      var st = sak.querySelector('.status');
      if (h === 'start') {
        sak.setAttribute('data-status', 'produksjon');
        if (st) { st.textContent = 'I produksjon'; st.setAttribute('data-status', 'produksjon'); }
        knapp.disabled = true;
        knapp.textContent = 'Startet';
        skrivLogg('produksjon startet på ' + id);
        visToast('Produksjon startet på ' + id + '. Skanneren får jobben i køen.');
        tell();
      } else if (h === 'ferdig') {
        sak.setAttribute('data-status', 'ferdig');
        sak.classList.add('sak--ferdig');
        if (st) { st.textContent = 'Ferdig · klar for bud'; st.setAttribute('data-status', 'ferdig'); }
        sak.querySelectorAll('[data-handling]').forEach(function (b) { b.disabled = true; });
        skrivLogg('sak ' + id + ' ferdig og klar for levering');
        visToast('Sak ' + id + ' er ferdig. Budet henter i Oslo/Follo innen kl. 16.');
        tell();
      } else if (h === 'bud') {
        skrivLogg('bud bestilt for ' + id);
        visToast('Bud bestilt for ' + id + '. Elektrisk bil er på vei.');
      }
    });
    tell();
  }

  var toastTid = null;
  function visToast(tekst) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = tekst;
    t.classList.add('vis');
    clearTimeout(toastTid);
    toastTid = setTimeout(function () { t.classList.remove('vis'); }, 3600);
  }
})();
