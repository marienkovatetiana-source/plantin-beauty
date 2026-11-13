/* Mobile sticky bar: hidden while the hero is on screen, shown once it has scrolled out. */
(function () {
  var bar = document.querySelector('[data-sticky-bar]');
  var hero = document.querySelector('.hero, .cat-hero');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;

  bar.classList.add('is-hidden');
  new IntersectionObserver(function (entries) {
    bar.classList.toggle('is-hidden', entries[0].isIntersecting);
  }).observe(hero);
})();
