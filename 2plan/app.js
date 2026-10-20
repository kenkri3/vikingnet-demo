/* 2Plan-demo — mobilmeny og lukking etter klikk. Ingen avhengigheter. */
(function () {
  var button = document.querySelector('.menu-btn');
  var menu = document.getElementById('meny');

  if (!button || !menu) return;

  button.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  menu.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
      menu.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    }
  });
})();
