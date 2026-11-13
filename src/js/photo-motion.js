/* Photos drift a little after the pointer (the hero photo follows the pointer over the whole hero; every other photo follows it over its card).
   The script only sets --mx / --my on the photo frame; css/photo-motion.css does the moving (the photo is slightly enlarged so no edge shows).
   Not used on touch screens or under prefers-reduced-motion. The big photo on the 404 page stays still, and so does the map. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var frames = [].slice.call(document.querySelectorAll(
    '.hero__photo, .cat-hero__photo, .card-category__photo, .card-work__photo, .co-summary__photo, .team-photo__frame'
  )).filter(function (f) { return !f.closest('.visit__map') && f.querySelector('img'); });
  if (!frames.length) return;

  var items = frames.map(function (frame) {
    // what the pointer is tracked over: the whole hero for the hero photo, the card for the others
    var area = frame.closest('.hero') || frame.closest('.cat-hero, .card-category, .card-work, .team-photo, .co-summary') || frame;
    return { frame: frame, area: area, tx: 0, ty: 0, x: 0, y: 0, active: false };
  });
  var running = false;

  function loop() {
    var busy = false;
    items.forEach(function (it) {
      if (!it.active) return;
      it.x += (it.tx - it.x) * 0.08;
      it.y += (it.ty - it.y) * 0.08;
      it.frame.style.setProperty('--mx', it.x.toFixed(2) + 'px');
      it.frame.style.setProperty('--my', it.y.toFixed(2) + 'px');
      if (Math.abs(it.tx - it.x) > 0.05 || Math.abs(it.ty - it.y) > 0.05) busy = true; else it.active = false;
    });
    if (busy) requestAnimationFrame(loop); else running = false;
  }
  function kick(it) { it.active = true; if (!running) { running = true; requestAnimationFrame(loop); } }

  items.forEach(function (it) {
    it.frame.classList.add('has-motion');
    it.area.addEventListener('pointermove', function (e) {
      var r = it.area.getBoundingClientRect();
      var f = it.frame.getBoundingClientRect();
      var maxX = Math.min(14, f.width * 0.028), maxY = Math.min(14, f.height * 0.028);   // stays inside the 3% overscan
      var nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      var ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      it.tx = -nx * maxX; it.ty = -ny * maxY;
      kick(it);
    });
    it.area.addEventListener('pointerleave', function () { it.tx = 0; it.ty = 0; kick(it); });
  });
})();
