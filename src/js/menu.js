/* Header: Treatments dropdown (desktop ≥1320) and full-screen mobile menu (below 1320). */
(function () {
  var desktop = window.matchMedia('(min-width: 1320px)');

  /* ---------- Treatments dropdown: hover / click / Enter; Esc closes and returns focus ---------- */
  var item = document.querySelector('.site-nav__item--dropdown');
  if (item) {
    var trigger = item.querySelector('.site-nav__link');
    var panel = item.querySelector('.dropdown');
    var hoverTimer;

    var setOpen = function (open) {
      trigger.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    };

    trigger.addEventListener('click', function () {
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });
    item.addEventListener('mouseenter', function () {
      if (!desktop.matches) return;
      clearTimeout(hoverTimer);
      setOpen(true);
    });
    item.addEventListener('mouseleave', function () {
      if (!desktop.matches) return;
      hoverTimer = setTimeout(function () { setOpen(false); }, 150);
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        trigger.focus();
      }
    });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!item.contains(e.target)) setOpen(false);
    });
  }

  /* ---------- Mobile menu: dialog, focus trapped, Esc / ✕ closes, body scroll locked ---------- */
  var menu = document.getElementById('mobile-menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');
  if (!menu || !openBtn || !closeBtn) return;

  var focusable = 'a[href], button:not([disabled])';

  var openMenu = function () {
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    openBtn.setAttribute('aria-label', 'Close menu');
    document.documentElement.classList.add('is-menu-open');
    closeBtn.focus();
  };
  var closeMenu = function (returnFocus) {
    menu.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.setAttribute('aria-label', 'Open menu');
    document.documentElement.classList.remove('is-menu-open');
    if (returnFocus) openBtn.focus();
  };

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', function () { closeMenu(true); });

  menu.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(true); return; }
    if (e.key !== 'Tab') return;
    var els = menu.querySelectorAll(focusable);
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* Any link inside the menu closes it. Same-page anchors (e.g. index.html#about while on the home page)
     don't reload the page, so the menu would otherwise stay open and cover the target. */
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (a && a.getAttribute('href') !== '#') closeMenu(false);
  });

  desktop.addEventListener('change', function () { if (desktop.matches && !menu.hidden) closeMenu(false); });
})();
