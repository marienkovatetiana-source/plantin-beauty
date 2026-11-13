/* Course application: 4 steps (Course → Start → Details → Sent). Opens from any [data-apply-open].
   After valid details the application is kept in sessionStorage and step 4 is shown. */
(function () {
  var root = document.querySelector('[data-apply]');
  if (!root) return;

  var form = root.querySelector('[data-apply-form]');
  var steps = [].slice.call(root.querySelectorAll('[data-step]'));
  var dots = [].slice.call(root.querySelectorAll('[data-step-dot]'));
  var lines = [].slice.call(root.querySelectorAll('.stepper__line'));
  var bar = root.querySelector('[data-apply-bar]');
  var backBtn = root.querySelector('[data-apply-back]');
  var nextBtn = root.querySelector('[data-apply-next]');
  var nextLabel = root.querySelector('[data-apply-next-label]');
  var summaryEl = root.querySelector('[data-apply-summary]');
  var priceEl = root.querySelector('[data-apply-price]');
  var status = root.querySelector('[data-apply-status]');
  var content = root.querySelector('.apply__content');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var KEY = 'plantin-application';
  var current = 1, opener = null;

  var checked = function (name) { return form.querySelector('input[name="' + name + '"]:checked'); };
  var f = form.elements;

  /* ---------- validation (step 3) ---------- */
  var nameOk = function () { return f.name.value.trim().length > 1; };
  var phoneOk = function () { return f.phone.value.replace(/\D/g, '').length >= 8; };
  var emailOk = function () { return EMAIL.test(f.email.value.trim()); };
  var detailsOk = function () { return nameOk() && phoneOk() && emailOk() && f.policy.checked; };
  var fields = [[f.name, nameOk], [f.phone, phoneOk], [f.email, emailOk]];
  var mark = function (input, ok) {
    input.closest('[data-field]').classList.toggle('is-invalid', !ok);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
  };

  /* ---------- rendering ---------- */
  var render = function () {
    steps.forEach(function (s) { s.hidden = Number(s.dataset.step) !== current; });
    dots.forEach(function (d, i) {
      var n = i + 1;
      d.classList.toggle('is-done', n < current || current === 4 && n === 4 ? n < current : false);
      d.classList.toggle('is-current', n === current);
      if (n === current) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    });
    lines.forEach(function (l, i) { l.classList.toggle('is-done', i + 1 < current); });

    var course = checked('course'), format = checked('format'), start = checked('start');
    var label = course.dataset.label;
    var price = format.value === 'private' ? 'On request' : course.dataset.price;
    var text = current === 1 ? label + ' · ' + format.dataset.label
             : current === 2 ? label + ' · ' + course.dataset.duration
             : label + ' · ' + start.dataset.label;
    summaryEl.textContent = text;
    priceEl.textContent = price;

    bar.hidden = current === 4;
    backBtn.hidden = current === 1;
    nextLabel.textContent = current === 3 ? 'Send application' : 'Continue';
    nextBtn.disabled = current === 3 && !detailsOk();

    var names = ['Course', 'Start', 'Details', 'Sent'];
    status.textContent = 'Step ' + current + ' of 4: ' + names[current - 1];
    content.scrollTop = 0;
  };

  var go = function (n, focusFirst) {
    current = n;
    render();
    if (focusFirst === false) return;
    var target = steps[n - 1].querySelector(n === 4 ? '.apply__sent-title' : 'input:checked, input:not([type=radio]):not([type=checkbox])') || steps[n - 1];
    if (n === 3) target = f.name;
    if (target) target.focus({ preventScroll: true });
  };

  /* ---------- open / close ---------- */
  var anyFilled = function () {
    return current < 4 && (f.name.value || f.phone.value || f.email.value || f.message.value);
  };
  var open = function (courseValue) {
    opener = document.activeElement;
    var radio = courseValue && form.querySelector('input[name="course"][value="' + courseValue + '"]');
    if (radio) radio.checked = true;
    root.hidden = false;
    document.documentElement.classList.add('is-apply-open');
    go(current === 4 ? 1 : current, false);
    (checked('course') || nextBtn).focus();
  };
  var close = function (force) {
    if (!force && anyFilled() && !window.confirm('Close the application? What you entered will be lost.')) return;
    root.hidden = true;
    document.documentElement.classList.remove('is-apply-open');
    if (current === 4) { form.reset(); current = 1; }
    if (opener && document.contains(opener)) opener.focus();
  };

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-apply-open]');
    if (trigger) { e.preventDefault(); open(trigger.dataset.course || document.body.dataset.course); return; }
    if (e.target.closest('[data-apply-close]')) close(false);
  });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(false); return; }
    if (e.key !== 'Tab') return;
    var els = [].slice.call(form.querySelectorAll('a[href], button:not([disabled]):not([hidden]), input:not([disabled]), textarea')).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
    // radios of one group count once (the browser moves between them with arrows)
    var seen = {};
    els = els.filter(function (el) {
      if (el.type !== 'radio') return true;
      if (seen[el.name]) return false;
      seen[el.name] = true; return true;
    });
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- navigation ---------- */
  backBtn.addEventListener('click', function () { if (current > 1) go(current - 1); });

  fields.forEach(function (pair) {
    var input = pair[0], ok = pair[1];
    input.addEventListener('blur', function () { if (input.value) mark(input, ok()); });
    input.addEventListener('input', function () {
      if (input.closest('[data-field]').classList.contains('is-invalid') && ok()) mark(input, true);
      render();
    });
  });
  f.policy.addEventListener('change', render);
  form.addEventListener('change', function (e) { if (e.target.type === 'radio') render(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (current < 3) { go(current + 1); return; }
    if (current === 3) {
      fields.forEach(function (p) { mark(p[0], p[1]()); });
      if (!detailsOk()) { (!nameOk() ? f.name : !phoneOk() ? f.phone : !emailOk() ? f.email : f.policy).focus(); return; }
      var course = checked('course');
      var data = {
        course: course.value, format: checked('format').value, start: checked('start').value,
        name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(),
        experience: checked('experience').value, message: f.message.value.trim()
      };
      try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch (err) { /* ignore */ }
      root.querySelector('[data-apply-name]').textContent = ', ' + data.name.split(/\s+/)[0];
      go(4);
    }
  });
})();
