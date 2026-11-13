/* Cookie banner: shown on the first visit only. The choice lives in localStorage ("plantin-cookies": necessary | all). */
(function () {
  var KEY = 'plantin-cookies';
  var banner = document.querySelector('[data-cookie]');
  var dialog = document.querySelector('[data-cookie-dialog]');
  if (!banner || !dialog) return;

  var read = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var save = function (value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode: the banner will just show again next visit */ }
    document.documentElement.dataset.cookies = value;
    document.dispatchEvent(new CustomEvent('plantin:cookies', { detail: value }));
  };

  var choose = function (value) { save(value); banner.hidden = true; dialog.hidden = true; };

  if (!read()) banner.hidden = false; else document.documentElement.dataset.cookies = read();

  banner.querySelector('[data-cookie-accept]').addEventListener('click', function () { choose('all'); });
  banner.querySelector('[data-cookie-necessary]').addEventListener('click', function () { choose('necessary'); });

  // Settings dialog
  var analytics = dialog.querySelector('[data-cookie-analytics]');
  var opener = null;
  var openDialog = function () {
    opener = document.activeElement;
    analytics.checked = read() === 'all';
    dialog.hidden = false;
    analytics.focus();
  };
  var closeDialog = function () {
    dialog.hidden = true;
    if (opener && !banner.hidden) opener.focus();
  };
  banner.querySelector('[data-cookie-settings]').addEventListener('click', openDialog);
  dialog.querySelector('[data-cookie-save]').addEventListener('click', function () { choose(analytics.checked ? 'all' : 'necessary'); });
  dialog.querySelector('[data-cookie-cancel]').addEventListener('click', closeDialog);
  dialog.addEventListener('click', function (e) { if (e.target === dialog) closeDialog(); });
  dialog.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDialog(); return; }
    if (e.key !== 'Tab') return;
    var els = dialog.querySelectorAll('input, button');
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
