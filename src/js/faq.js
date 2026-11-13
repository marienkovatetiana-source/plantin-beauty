/* FAQ: on desktop the "cancel" answer starts open (as in the design); on smaller screens everything is closed.
   Only one item is open at a time: the `name` attribute on <details> handles that natively. */
(function () {
  if (window.matchMedia('(min-width: 1320px)').matches && !document.querySelector('.faq-item[open]') && !document.querySelector('[data-faq-closed]')) {
    var first = document.querySelector('.faq-item:nth-child(5)');
    if (first) first.open = true;
  }

  /* When one answer opens, the previous one (above it) closes, and the question under the finger would slide up.
     For the length of the animation, scroll by the same amount so the clicked question stays where it was. */
  var KEEP_MS = 400;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var frame = null;
  var stop = function () { if (frame) { cancelAnimationFrame(frame); frame = null; } };

  document.addEventListener('click', function (e) {
    var summary = e.target.closest && e.target.closest('.faq-item > summary');
    if (!summary || reduce.matches) return;
    stop();
    var top = summary.getBoundingClientRect().top;
    var until = performance.now() + KEEP_MS;
    var tick = function (now) {
      var delta = summary.getBoundingClientRect().top - top;
      if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
      frame = now < until ? requestAnimationFrame(tick) : null;
    };
    frame = requestAnimationFrame(tick);
  });
  // the person scrolls by themselves: stop holding the position
  ['wheel', 'touchstart', 'keydown'].forEach(function (type) { window.addEventListener(type, stop, { passive: true }); });
})();
