/* Back-to-top buttons: appear after the page has been scrolled a little, scroll smoothly to the top. */
(function () {
  var buttons = document.querySelectorAll('[data-to-top]');
  if (!buttons.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var visible = false;

  function update() {
    var show = window.scrollY > 600;
    if (show !== visible) {
      visible = show;
      buttons.forEach(function (b) { b.classList.toggle('is-visible', show); b.tabIndex = show ? 0 : -1; });
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; update(); });
  }
  buttons.forEach(function (b) {
    b.tabIndex = -1;
    b.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
