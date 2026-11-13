/* Scroll reveal: blocks of every section except the first rise in as they enter the screen
   and fade out as they leave through the top. Styles live in css/motion.css (section 4). */
const main = document.querySelector('main');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (main && !reduce && 'IntersectionObserver' in window) {
  const sections = [...main.children].filter((el, i) => i > 0 && el.tagName === 'SECTION');
  const items = [];

  const isGridLike = (el) => {
    if (el.matches('[data-carousel], details, ul[role], [role="tablist"]')) return false;
    const cs = getComputedStyle(el);
    return (cs.display === 'grid' || cs.display === 'flex') && cs.overflowX === 'visible' && el.children.length >= 2;
  };

  sections.forEach((section) => {
    let units = [...(section.querySelector(':scope > .container') || section).children];
    units = units.flatMap((u) => {
      // single wrapper -> look one level deeper; grid / flex row -> stagger its children
      if (units.length === 1 && u.children.length > 1) return [...u.children];
      return [u];
    }).flatMap((u) => (isGridLike(u) && u.children.length <= 8 ? [...u.children] : [u]));
    units.filter((u) => !u.hidden && u.tagName !== 'SCRIPT').forEach((u) => items.push(u));
  });

  document.documentElement.classList.add('js-reveal');
  items.forEach((el) => el.classList.add('reveal'));

  // blocks that appear together get a small stagger
  const enterIO = new IntersectionObserver((entries) => {
    const batch = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
    batch.forEach((e, i) => {
      e.target.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 0.12}s`);
      e.target.classList.add('is-in');
      enterIO.unobserve(e.target);
      shown.add(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  // fade out once a block is entirely above the upper ~15% of the screen (checked on scroll, so fast jumps never leave stale states)
  const shown = new Set();
  let ticking = false;
  const updatePast = () => {
    ticking = false;
    const line = innerHeight * 0.15;
    shown.forEach((el) => el.classList.toggle('is-past', el.getBoundingClientRect().bottom < line));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updatePast); } }, { passive: true });
  addEventListener('resize', updatePast);

  // blocks already above the viewport on load (e.g. jumped to #contact) are shown at once, without animation
  items.forEach((el) => {
    if (el.getBoundingClientRect().bottom < 0) {
      el.classList.add('is-in', 'is-instant');
      shown.add(el);
    } else {
      enterIO.observe(el);
    }
  });
}
