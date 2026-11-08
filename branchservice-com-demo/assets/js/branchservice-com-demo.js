/* BRANCH — ikon-rail, WebGL linjenett og panel */
(function () {
  'use strict';
  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- WebGL linjenett i hero ---------- */
  var boks = document.querySelector('.helt');
  var lerret = boks ? boks.querySelector('canvas') : null;
  try {
    var gl = lerret && (lerret.getContext('webgl') || lerret.getContext('experimental-webgl'));
    if (gl) {
      var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
      var fs = 'precision highp float;uniform vec2 u_res;uniform float u_t;' +
        'float linje(float y,float x,float f,float o){float d=abs(fract(y*f+o+sin(x*1.9+u_t*0.5)*0.05)-0.5);return smoothstep(0.035,0.0,d);}' +
        'void main(){vec2 uv=gl_FragCoord.xy/u_res.xy;float t=u_t*0.06;vec3 col=vec3(0.059,0.231,0.212);' +
        'float g=0.0;g+=linje(uv.y+sin(uv.x*3.1+t)*0.10,uv.x,9.0,t)*0.85;' +
        'g+=linje(uv.y+sin(uv.x*2.2-t*1.3)*0.14,uv.x,6.0,t*1.6)*0.6;' +
        'g+=linje(uv.y+sin(uv.x*4.3+t*0.8)*0.07,uv.x,13.0,t*0.7)*0.4;' +
        'col+=vec3(0.851,0.376,0.247)*g*0.75;' +
        'float v=1.0-smoothstep(0.0,1.0,length(uv-vec2(0.15,0.85)));col+=vec3(0.09,0.3,0.27)*v*0.5;' +
        'gl_FragColor=vec4(col,1.0);}';
      function lagShader(type, kjelde) {
        var s = gl.createShader(type);
        gl.shaderSource(s, kjelde); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader');
        return s;
      }
      var prog = gl.createProgram();
      gl.attachShader(prog, lagShader(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, lagShader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('program');
      gl.useProgram(prog);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      var pos = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      var uRes = gl.getUniformLocation(prog, 'u_res');
      var uT = gl.getUniformLocation(prog, 'u_t');
      var start = performance.now();
      var skala = 1, sto = false;
      function storleik() {
        var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        var b = lerret.clientWidth || boks.clientWidth;
        var h = lerret.clientHeight || boks.clientHeight;
        lerret.width = Math.max(1, Math.round(b * dpr));
        lerret.height = Math.max(1, Math.round(h * dpr));
        gl.viewport(0, 0, lerret.width, lerret.height);
        skala = dpr;
      }
      storleik();
      window.addEventListener('resize', storleik);
      function teikn() {
        if (sto) return;
        gl.uniform2f(uRes, lerret.width, lerret.height);
        gl.uniform1f(uT, redusert.matches ? 3.2 : (performance.now() - start) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!redusert.matches) window.requestAnimationFrame(teikn);
      }
      teikn();
      boks.classList.add('webgl-klar');
    }
  } catch (e) {
    if (boks) boks.classList.remove('webgl-klar');
  }

  /* ---------- marker gjeldande side ---------- */
  var her = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('.rail__lenke'), function (a) {
    if (a.getAttribute('href') === her) a.setAttribute('aria-current', 'page');
  });

  /* ---------- panel ---------- */
  var faner = document.querySelectorAll('.fane');
  if (faner.length) {
    Array.prototype.forEach.call(faner, function (fane) {
      fane.addEventListener('click', function () {
        Array.prototype.forEach.call(faner, function (f) {
          var vald = f === fane;
          f.setAttribute('aria-selected', vald ? 'true' : 'false');
          var mal = document.getElementById(f.getAttribute('aria-controls'));
          if (mal) mal.hidden = !vald;
        });
      });
    });
  }
  function telOpp() {
    var ventar = document.querySelectorAll('.rad[data-status="ventar"]').length;
    var ferdige = document.querySelectorAll('.rad[data-status="ferdig"]').length;
    var kV = document.querySelector('[data-kpi="ventar"] .kpi__tal');
    var kF = document.querySelector('[data-kpi="ferdig"] .kpi__tal');
    if (kV) kV.textContent = ventar;
    if (kF) kF.textContent = ferdige;
    var fram = document.querySelector('[data-framdrift]');
    if (fram) fram.textContent = ferdige + ' av ' + document.querySelectorAll('.rad').length + ' oppdrag avslutta';
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-ferdig]'), function (b) {
    b.addEventListener('click', function () {
      var rad = b.closest('.rad');
      if (!rad) return;
      rad.setAttribute('data-status', 'ferdig');
      rad.classList.add('ferdig');
      var st = rad.querySelector('.status');
      if (st) { st.textContent = 'Ferdig'; st.className = 'status status--ferdig'; }
      b.disabled = true; b.textContent = 'Ferdig';
      var meld = document.querySelector('[data-panelmelding]');
      if (meld) meld.textContent = 'Oppdraget er merket ferdig.';
      telOpp();
    });
  });
  telOpp();

  /* ---------- skjema ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-skjema]'), function (skjema) {
    var kvit = skjema.parentNode.querySelector('.skjema__kvittering');
    var feil = skjema.querySelector('.skjema__feil');
    skjema.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var navn = skjema.querySelector('[name="navn"]');
      var epost = skjema.querySelector('[name="epost"]');
      var melding = '';
      if (navn && !navn.value.trim()) melding = 'Fyll inn namnet ditt.';
      else if (epost && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost.value.trim())) melding = 'Fyll inn ei gyldig e-postadresse.';
      if (feil) feil.textContent = melding;
      if (melding) { (navn && !navn.value.trim() ? navn : epost).focus(); return; }
      if (kvit) {
        var t = kvit.querySelector('[data-kvittering-namn]');
        if (t) t.textContent = navn && navn.value.trim() ? 'Takk, ' + navn.value.trim().split(' ')[0] + '!' : 'Takk!';
        skjema.hidden = true; kvit.classList.add('vis'); kvit.focus();
      }
    });
  });
})();
