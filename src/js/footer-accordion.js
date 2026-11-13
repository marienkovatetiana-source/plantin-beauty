/* Footer accordions (mobile): Visit us / Contact. All closed by default.
   From 768px the panels are always visible (CSS), so the buttons are plain labels there. */
(function () {
  var wide = window.matchMedia('(min-width: 768px)');
  document.querySelectorAll('.footer-col__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });
  });
  function sync() {
    document.querySelectorAll('.footer-col__toggle').forEach(function (btn) {
      btn.tabIndex = wide.matches ? -1 : 0;
      if (wide.matches) btn.removeAttribute('aria-expanded'); else if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
    });
  }
  wide.addEventListener('change', sync);
  sync();
})();
