/* Checkout (online course): field checks, "Pay" enabled only when the form is valid, then the thank-you page.
   The order is kept in sessionStorage so the thank-you page can say "You're in, Sofie". */
(function () {
  var KEY = 'plantin-order';
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var form = document.querySelector('[data-checkout]');
  if (form) {
    var name = form.elements.name, email = form.elements.email, consent = form.elements.withdrawal;
    var pay = form.querySelector('button[type="submit"]');

    var nameOk = function () { return name.value.trim().length > 1; };
    var emailOk = function () { return EMAIL.test(email.value.trim()); };
    var allOk = function () { return nameOk() && emailOk() && consent.checked; };

    var mark = function (input, ok) {
      var field = input.closest('[data-field]');
      field.classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    };
    var refresh = function () { pay.disabled = !allOk(); };

    // show an error after the person leaves the field (not while typing for the first time); clear it as soon as it is fixed
    [[name, nameOk], [email, emailOk]].forEach(function (pair) {
      var input = pair[0], ok = pair[1];
      input.addEventListener('blur', function () { if (input.value) mark(input, ok()); });
      input.addEventListener('input', function () {
        if (input.closest('[data-field]').classList.contains('is-invalid') && ok()) mark(input, true);
        refresh();
      });
    });
    consent.addEventListener('change', refresh);
    refresh();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      mark(name, nameOk()); mark(email, emailOk());
      if (!allOk()) { (!nameOk() ? name : email).focus(); return; }
      var order = { name: name.value.trim(), email: email.value.trim(), id: 'PB-' + Math.floor(1000 + Math.random() * 9000) };
      try { sessionStorage.setItem(KEY, JSON.stringify(order)); } catch (err) { /* private mode: the thank-you page uses its plain text */ }
      window.location.href = 'thank-you.html';
    });
  }

  // Thank-you page: fill name, email and order number when we have them
  var nameEl = document.querySelector('[data-order-name]');
  if (nameEl) {
    var order = null;
    try { order = JSON.parse(sessionStorage.getItem(KEY)); } catch (err) { /* ignore */ }
    if (order) {
      nameEl.textContent = ', ' + order.name.split(/\s+/)[0];
      document.querySelector('[data-order-email]').textContent = order.email;
      document.querySelector('[data-order-id]').textContent = ' · Order ' + order.id;
    }
  }
})();
