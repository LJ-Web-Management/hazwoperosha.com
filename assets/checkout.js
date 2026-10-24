// Checkout page logic, ported from datacentertraining.us js/checkout.js so orders
// land in the hazwoper-osha.com LMS the same way:
//   1. Stripe.js creates a card PaymentMethod
//   2. POST {API_BASE_URL}/add_new_user  -> customer id
//   3. POST {API_BASE_URL}/add_order     -> one order carrying every course id in the cart
//                                           (+ clientSecret to confirm, if the API asks)
// The cart (assets/cart.js) can hold any number of courses; every seat is full list price.
// If any course lacks an LMS id (assets/config.js, from data/lms-ids.json) the whole
// order goes by enrollment-request email instead.
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('stripeCheckoutForm');
  if (!form) return;

  var stripe = null;
  var cardElement = null;

  var submitPaymentBtn = document.getElementById('submitPaymentBtn');
  var paymentErrorAlert = document.getElementById('payment-error');
  var successView = document.getElementById('checkoutSuccessView');
  var requestError = document.getElementById('request-error');
  var emptyView = document.getElementById('cartEmpty');
  var header = document.querySelector('.checkout-header');

  var getErrorMessage = function (err) {
    if (!err) return 'Payment failed. Please check your card details and try again.';
    if (typeof err === 'string') return err;
    if (err.message && typeof err.message === 'string') return err.message;
    if (err.error && typeof err.error === 'string') return err.error;
    if (err.error && err.error.message && typeof err.error.message === 'string') return err.error.message;
    try { return JSON.stringify(err); } catch (e) { return 'An unexpected error occurred during payment processing.'; }
  };

  // ?item=<slug>[&seats=n] (Enroll Now buttons, no-JS add-to-cart links) adds that course to the cart.
  var params = new URLSearchParams(window.location.search);
  var itemParam = params.get('item');
  if (itemParam && findHzItem(itemParam)) {
    var seatParam = parseInt(params.get('seats'), 10);
    HZCart.add(itemParam, 1);
    if (seatParam > 0) HZCart.setQty(itemParam, seatParam);
  }
  if (itemParam && window.history.replaceState) window.history.replaceState(null, '', window.location.pathname);

  // Cart lines with catalog data; unknown slugs (stale carts) are dropped.
  var getLines = function () {
    return HZCart.items().map(function (l) {
      var item = findHzItem(l.slug);
      return item ? { slug: l.slug, qty: l.qty, item: item, amount: Math.round(item.price * l.qty * 100) / 100 } : null;
    }).filter(Boolean);
  };
  var getTotal = function (lines) {
    return Math.round(lines.reduce(function (n, l) { return n + l.amount; }, 0) * 100) / 100;
  };
  var isRequestMode = function (lines) {
    return CHECKOUT_DISABLED || !activeStripeKey() || lines.some(function (l) { return !l.item.courseId; });
  };

  var set = function (id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  var renderCart = function () {
    var lines = getLines();
    var empty = lines.length === 0;
    form.hidden = empty;
    emptyView.hidden = !empty;

    var list = document.getElementById('cartLines');
    var summary = document.getElementById('summaryLines');
    list.textContent = '';
    summary.textContent = '';
    lines.forEach(function (l) {
      var li = el('li', 'cart-line');
      var info = el('div', 'cart-info');
      info.appendChild(el('strong', null, l.item.name));
      info.appendChild(el('span', 'muted small', '$' + formatMoney(l.item.price) + ' per seat'));
      var qtyWrap = el('label', 'cart-qty');
      qtyWrap.appendChild(el('span', 'sr', 'Seats for ' + l.item.name));
      var qty = el('input', 'form-control');
      qty.type = 'number'; qty.min = '1'; qty.max = '10000'; qty.step = '1'; qty.inputMode = 'numeric';
      qty.value = String(l.qty);
      qty.setAttribute('data-slug', l.slug);
      qtyWrap.appendChild(qty);
      qtyWrap.appendChild(el('span', 'small', 'seats'));
      var amount = el('span', 'cart-amount', '$' + formatMoney(l.amount));
      var remove = el('button', 'link-btn', 'Remove');
      remove.type = 'button';
      remove.setAttribute('data-remove', l.slug);
      remove.setAttribute('aria-label', 'Remove ' + l.item.name);
      li.appendChild(info); li.appendChild(qtyWrap); li.appendChild(amount); li.appendChild(remove);
      list.appendChild(li);

      var row = el('div', 'sum-line');
      var left = el('div');
      left.appendChild(el('strong', null, l.item.name));
      left.appendChild(el('span', null, l.qty + (l.qty === 1 ? ' seat' : ' seats') + ' × $' + formatMoney(l.item.price)));
      row.appendChild(left);
      row.appendChild(el('span', null, '$' + formatMoney(l.amount)));
      summary.appendChild(row);
    });
    set('summaryTotal', '$' + formatMoney(getTotal(lines)));
    applyMode(lines);
    return lines;
  };

  var cartLines = document.getElementById('cartLines');
  cartLines.addEventListener('change', function (e) {
    var slug = e.target.getAttribute('data-slug');
    if (!slug) return;
    var n = parseInt(e.target.value, 10);
    HZCart.setQty(slug, n > 0 ? n : 1);
  });
  cartLines.addEventListener('click', function (e) {
    var slug = e.target.getAttribute('data-remove');
    if (slug) HZCart.remove(slug);
  });
  document.addEventListener('hz:cart', renderCart);
  window.addEventListener('storage', renderCart);

  var fieldValue = function (id) { var f = document.getElementById(id); return f ? f.value.trim() : ''; };

  var setButtonLoading = function (isLoading) {
    if (!submitPaymentBtn) return;
    submitPaymentBtn.disabled = isLoading;
    submitPaymentBtn.querySelector('.btn-text').hidden = isLoading;
    submitPaymentBtn.querySelector('.btn-spinner').hidden = !isLoading;
  };

  var showError = function (msg) {
    paymentErrorAlert.textContent = msg;
    paymentErrorAlert.hidden = false;
    setButtonLoading(false);
  };

  var loadStripeJs = function (done) {
    if (window.Stripe) { done(); return; }
    var tag = document.createElement('script');
    tag.src = 'https://js.stripe.com/v3/';
    tag.onload = done;
    tag.onerror = function () { console.error('Stripe.js failed to load'); };
    document.head.appendChild(tag);
  };

  var mountCard = function () {
    if (!window.Stripe || cardElement) return;
    stripe = window.Stripe(activeStripeKey());
    cardElement = stripe.elements().create('card', {
      style: { base: { fontSize: '16px', color: '#171717', '::placeholder': { color: '#a1a1aa' } } },
      hidePostalCode: true
    });
    cardElement.mount('#payment-element');
  };

  // ---- request vs card mode ----
  var requestSection = document.getElementById('requestSection');
  var paymentSection = document.getElementById('paymentSection');
  var addressFields = document.getElementById('billingAddressFields');
  var addressRequired = Array.prototype.slice.call(addressFields.querySelectorAll('[required]'));
  var note = document.getElementById('enrollModeNote');
  var requestNote = note ? note.innerHTML : '';
  var requestMode = true;
  var applyMode = function (lines) {
    requestMode = isRequestMode(lines);
    requestSection.hidden = !requestMode;
    paymentSection.hidden = requestMode;
    addressFields.hidden = requestMode;
    addressRequired.forEach(function (f) { f.required = !requestMode; });
    if (note) {
      note.innerHTML = requestMode ? requestNote :
        'Pay once by card for every course in your cart. For purchase-order billing, call <a href="tel:' + PHONE_HREF + '">' + PHONE + '</a> or email <a href="mailto:' + ENROLL_EMAIL + '">' + ENROLL_EMAIL + '</a>.';
    }
    if (!requestMode && lines.length) loadStripeJs(mountCard);
  };

  renderCart();

  var gaItems = function (lines) {
    return lines.map(function (l) { return { item_id: l.slug, item_name: l.item.name, price: l.item.price, quantity: l.qty }; });
  };

  // ---- enrollment request (email) ----
  var sendEnrollmentRequest = function () {
    if (requestError) requestError.hidden = true;
    var lines = getLines();
    if (!lines.length) return;
    var total = getTotal(lines);
    var seats = lines.reduce(function (n, l) { return n + l.qty; }, 0);
    var msg = ['Enrollment request from ' + ORDER_FROM, '', 'Courses:'];
    lines.forEach(function (l) {
      msg.push('- ' + l.item.name + ' (' + l.slug + '): ' + l.qty + (l.qty === 1 ? ' seat' : ' seats') + ' × $' + formatMoney(l.item.price) +
        ' = $' + formatMoney(l.amount) + ' | LMS course ID: ' + (l.item.courseId || 'not mapped yet'));
    });
    msg.push(
      '',
      'Total: $' + formatMoney(total),
      'All LMS course IDs: ' + (lines.map(function (l) { return l.item.courseId; }).filter(Boolean).join(', ') || 'none mapped yet'),
      '',
      'Name: ' + fieldValue('billingFirstName') + ' ' + fieldValue('billingLastName'),
      'Company: ' + (fieldValue('billingCompany') || '-'),
      'Email: ' + fieldValue('billingEmail'),
      'Phone: ' + fieldValue('billingPhone')
    );
    var notes = fieldValue('requestNotes');
    if (notes) msg.push('', 'Notes: ' + notes);
    var body = msg.join('\n');
    var subject = 'Enrollment request: ' + (lines.length === 1 ? lines[0].item.name : lines.length + ' courses') +
      ' (' + seats + (seats === 1 ? ' seat)' : ' seats)');
    var href = 'mailto:' + ENROLL_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    document.getElementById('requestSummaryText').textContent = 'To: ' + ENROLL_EMAIL + '\nSubject: ' + subject + '\n\n' + body;
    document.getElementById('reopenEmailLink').href = href;
    form.hidden = true;
    header.hidden = true;
    var sentView = document.getElementById('requestSentView');
    sentView.hidden = false;
    sentView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { currency: 'USD', value: total, items: gaItems(lines) });
    }
    window.location.href = href;
  };

  var copyBtn = document.getElementById('copyRequestBtn');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var text = document.getElementById('requestSummaryText').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { copyBtn.textContent = 'Copied'; }, function () {});
  });

  // ---- card checkout ----
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var lines = getLines();
    if (!lines.length) { renderCart(); return; }
    if (requestMode) { sendEnrollmentRequest(); return; }

    setButtonLoading(true);
    paymentErrorAlert.hidden = true;

    var firstName = fieldValue('billingFirstName');
    var lastName = fieldValue('billingLastName');
    var company = fieldValue('billingCompany');
    var phone = fieldValue('billingPhone');
    var email = fieldValue('billingEmail');
    var addr = {
      line1: fieldValue('billingAddress'), line2: fieldValue('billingAddress2'), city: fieldValue('billingCity'),
      state: fieldValue('billingState'), postal_code: fieldValue('billingZip'), country: fieldValue('billingCountry') || 'US'
    };

    if (!stripe || !cardElement) { showError('Stripe payment SDK is not initialized. Please refresh the page.'); return; }

    // STEP 1: card -> PaymentMethod
    var pmResult = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name: firstName + ' ' + lastName, email: email, phone: phone, address: addr }
    });
    if (pmResult.error) { showError(getErrorMessage(pmResult.error)); return; }
    var paymentMethodId = pmResult.paymentMethod ? pmResult.paymentMethod.id : '';

    // STEP 2: learner account
    var customerId = 0;
    try {
      var userRes = await fetch(API_BASE_URL + '/add_new_user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email: email, user_name: firstName + ' ' + lastName, user_role_id: 2, phone: phone })
      });
      if (userRes.ok) {
        var u = await userRes.json();
        if (u) {
          customerId = u.user_id || (u.data && u.data.user_id) || (u.success && u.success.user_id) ||
            (u.user && u.user.user_id) || (u.is_duplicate && Number(u.existing_email)) || 0;
        }
      }
    } catch (userErr) {
      console.warn('add_new_user API call notice:', userErr);
    }

    // STEP 3: one order with every course id in the cart, each at full price per seat
    var orderId = 'HZ-' + Math.floor(100000 + Math.random() * 900000);
    var total = getTotal(lines);
    try {
      var orderRes = await fetch(API_BASE_URL + '/add_order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          payment_method: 'stripe',
          payment_method_id: paymentMethodId,
          order_type: 'normal',
          order_status: 'pending',
          order_from: ORDER_FROM,
          billing_first_name: firstName,
          billing_last_name: lastName,
          billing_name: firstName + ' ' + lastName,
          billing_email: email,
          billing_phone: phone,
          billing_company: company,
          reg_company: company,
          billing_address_1: addr.line1, billing_address_2: addr.line2, billing_city: addr.city,
          billing_state: addr.state, billing_postcode: addr.postal_code, billing_country: addr.country,
          shipping_address_1: addr.line1, shipping_address_2: addr.line2, shipping_city: addr.city,
          shipping_state: addr.state, shipping_postcode: addr.postal_code, shipping_country: addr.country,
          courses: lines.map(function (l) {
            return { course_id: l.item.courseId, quantity: l.qty, users: [{ first_name: firstName, last_name: lastName, email: email, user_name: '' }] };
          })
        })
      });
      var orderData = await orderRes.json();
      if (!orderRes.ok || (orderData && (orderData.success === false || orderData.error))) {
        showError(getErrorMessage(orderData && orderData.error ? orderData.error : orderData));
        return;
      }
      if (orderData && (orderData.order_id || orderData.id)) orderId = '#' + (orderData.order_id || orderData.id);
      if (orderData && orderData.clientSecret) {
        var confirmRes = await stripe.confirmCardPayment(orderData.clientSecret, { payment_method: paymentMethodId });
        if (confirmRes && confirmRes.error) { showError(getErrorMessage(confirmRes.error)); return; }
      }
    } catch (orderErr) {
      console.warn('Error executing add_order API:', orderErr);
      showError(getErrorMessage(orderErr));
      return;
    }

    document.removeEventListener('hz:cart', renderCart);
    HZCart.clear();
    form.hidden = true;
    header.hidden = true;
    set('successOrderId', orderId.charAt(0) === '#' ? orderId : '#' + orderId);
    set('successUserEmail', email || 'your email');
    successView.hidden = false;
    successView.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', { transaction_id: orderId, currency: 'USD', value: total, items: gaItems(lines) });
    }
    setButtonLoading(false);
  });
});
