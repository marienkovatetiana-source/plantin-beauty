/* Carousels (mobile): prev / next buttons + counter. Swipe is native scroll.
   Markup: [data-carousel] holds the slides; counter and buttons are found inside the same <section>. */
(function () {
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var root = carousel.closest('section');
    var slides = carousel.children;
    var counter = root.querySelector('[data-carousel-counter]');
    var prev = root.querySelector('[data-carousel-prev]');
    var next = root.querySelector('[data-carousel-next]');
    if (!slides.length || !counter || !prev || !next) return;

    var step = function () {
      var cs = getComputedStyle(carousel);
      return slides[0].getBoundingClientRect().width + (parseFloat(cs.columnGap) || 0);
    };

    function update() {
      var max = slides.length - 1;
      var i = Math.min(Math.max(Math.round(carousel.scrollLeft / step()), 0), max);
      if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2) i = max;
      if (counter.dataset.pos !== String(i)) {   // only rewrite when the slide changes (keeps the live region quiet)
        counter.dataset.pos = String(i);
        counter.textContent = '';
        var current = document.createElement('span');
        current.className = 'slider-controls__current';
        current.textContent = i + 1;
        counter.appendChild(current);
        counter.appendChild(document.createTextNode(' / ' + slides.length));
      }
      prev.disabled = i === 0;
      next.disabled = i === max;
    }
    prev.addEventListener('click', function () { carousel.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { carousel.scrollBy({ left: step(), behavior: 'smooth' }); });
    carousel.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
