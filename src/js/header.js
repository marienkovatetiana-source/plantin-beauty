/* Header is sticky everywhere. Below 1320 it is "smart": hides while scrolling down, comes back on any scroll up.
   On desktop (≥1320) it always stays. It never hides while the menu or the Treatments dropdown is open, or near the top. */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var desktop = window.matchMedia('(min-width: 1320px)');
  var lastY = window.scrollY, ticking = false;
  var THRESHOLD = 8; // ignore tiny jitters

  var update = function () {
    ticking = false;
    var y = window.scrollY;
    if (desktop.matches || y <= header.offsetHeight || document.documentElement.classList.contains('is-menu-open') || header.contains(document.activeElement)) {
      header.classList.remove('is-hidden');
    } else if (Math.abs(y - lastY) > THRESHOLD) {
      header.classList.toggle('is-hidden', y > lastY);
    }
    lastY = y;
  };

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  // keyboard focus inside the header must never leave it hidden
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
  desktop.addEventListener('change', update);
})();
