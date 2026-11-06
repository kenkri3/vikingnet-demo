(function () {
  'use strict';
  var f = document.getElementById('skjema') || document.querySelector('form.skjema') || document.querySelector('form');
  var st = document.getElementById('status');
  if (f) {
    if (!f.id) f.id = 'skjema';
    if (!st) {
      st = document.createElement('div');
      st.id = 'status';
      st.className = 'skjema__status';
      st.setAttribute('role', 'status');
      st.setAttribute('aria-live', 'polite');
      st.style.marginTop = '0.9rem';
      st.style.fontSize = '0.95rem';
      f.appendChild(st);
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = f.elements.navn || f.elements.name;
      var ep = f.elements.epost || f.elements.email;
      var m = f.elements.melding || f.elements.message;
      var t = (f.elements.telefon || f.elements.phone) ? (f.elements.telefon || f.elements.phone).value.trim() : '';
      var mangler = false;
      [n, ep, m].forEach(function (x) {
        if (!x) return;
        var tom = x.value.trim() === '';
        x.setAttribute('aria-invalid', tom ? 'true' : 'false');
        if (tom) mangler = true;
      });
      if (ep && ep.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ep.value.trim())) {
        ep.setAttribute('aria-invalid', 'true');
        mangler = true;
      }
      if (mangler) {
        st.style.color = '#c0392b';
        st.textContent = 'Vennligst fyll ut navn, gyldig e-post og hva saken gjelder.';
        return;
      }
      var rawAction = f.getAttribute('action') || '';
      var recipient = f.getAttribute('data-epost') || rawAction.replace(/^mailto:/i, '').split('?')[0];
      var linjer = [
        'Navn: ' + (n ? n.value.trim() : ''),
        'E-post: ' + (ep ? ep.value.trim() : ''),
        t ? 'Telefon: ' + t : '',
        '',
        m ? m.value.trim() : ''
      ].filter(Boolean);

      st.style.color = '#27ae60';
      st.style.fontWeight = '600';
      st.textContent = 'Takk for henvendelsen! Meldingen din er sendt, og vi svarer så raskt vi kan.';

      if (recipient && recipient.indexOf('@') !== -1) {
        var mailtoUrl = 'mailto:' + encodeURIComponent(recipient) + '?subject=' + encodeURIComponent('Henvendelse fra nettsiden') + '&body=' + encodeURIComponent(linjer.join('\n'));
        setTimeout(function () {
          window.location.href = mailtoUrl;
        }, 600);
      }
    });
  }
  var ar = document.getElementById('ar');
  if (ar) ar.textContent = String(new Date().getFullYear());
})();
