// Checkout page logic, ported from datacentertraining.us js/checkout.js so orders
// land in the hazwoper-osha.com LMS the same way:
//   1. Stripe.js creates a card PaymentMethod
//   2. POST {API_BASE_URL}/add_new_user  -> customer id
//   3. POST {API_BASE_URL}/add_order     -> order (+ clientSecret to confirm, if the API asks)
// Courses without an LMS id (assets/config.js, from data/lms-ids.json) go by
// enrollment-request email instead.
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('stripeCheckoutForm');
  if (!form) return;

  var stripe = null;
  var cardElement = null;

  var submitPaymentBtn = document.getElementById('submitPaymentBtn');
  var paymentErrorAlert = document.getElementById('payment-error');
  var successView = document.getElementById('checkoutSuccessView');
  var requestError = document.getElementById('request-error');

  var getErrorMessage = function (err) {
    if (!err) return 'Payment failed. Please check your card details and try again.';
    if (typeof err === 'string') return err;
    if (err.message && typeof err.message === 'string') return err.message;
    if (err.error && typeof err.error === 'string') return err.error;
    if (err.error && err.error.message && typeof err.error.message === 'string') return err.error.message;
    try { return JSON.stringify(err); } catch (e) { return 'An unexpected error occurred during payment processing.'; }
  };

  var params = new URLSearchParams(window.location.search);
  var itemSlug = params.get('item') || 'osha-40-hour-hazwoper-training';
  var selected = findHzItem(itemSlug) || findHzItem((itemSlug = 'osha-40-hour-hazwoper-training'));
  var courseIds = [selected.courseId];

  // Card checkout needs an LMS course id; a course not mapped yet is sent as an
  // enrollment request.
  var requestMode = CHECKOUT_DISABLED || !activeStripeKey() ||
    courseIds.some(function (id) { return !id; });

  var seatInput = document.getElementById('seatCount');
  var seatParam = parseInt(params.get('seats'), 10);
  if (seatInput && seatParam > 0) seatInput.value = String(seatParam);
  var getSeats = function () {
    var n = seatInput ? parseInt(seatInput.value, 10) : 1;
    return n > 0 ? n : 1;
  };

  var priceFor = function (seats) {
    var tier = tierForSeats(seats);
    var subtotal = Math.round(selected.price * seats * 100) / 100;
    var total = Math.round(tierPrice(selected.price, tier) * seats * 100) / 100;
    return { tier: tier, subtotal: subtotal, total: total, discount: Math.round((subtotal - total) * 100) / 100 };
  };

  var set = function (id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
  var updateSummary = function () {
    var seats = getSeats();
    var p = priceFor(seats);
    set('summaryCourseQty', seats + (seats === 1 ? ' seat' : ' seats') + ' × $' + formatMoney(selected.price));
    set('summaryCourseAmount', '$' + formatMoney(p.subtotal));
    set('summarySubtotal', '$' + formatMoney(p.subtotal));
    set('summaryTotal', '$' + formatMoney(p.total));
    var discountRow = document.getElementById('summaryDiscountRow');
    if (discountRow) discountRow.hidden = !(p.discount > 0);
    set('summaryDiscountLabel', 'Volume discount (' + Math.round((p.tier.discount || 0) * 100) + '%)');
    set('summaryDiscount', '-$' + formatMoney(p.discount));
    return p;
  };

  var fieldValue = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };

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
    if (!window.Stripe) return;
    stripe = window.Stripe(activeStripeKey());
    cardElement = stripe.elements().create('card', {
      style: { base: { fontSize: '16px', color: '#171717', '::placeholder': { color: '#a1a1aa' } } },
      hidePostalCode: true
    });
    cardElement.mount('#payment-element');
  };

  // ---- page setup ----
  set('summaryCourseName', selected.name);
  updateSummary();
  if (seatInput) seatInput.addEventListener('input', updateSummary);

  var requestSection = document.getElementById('requestSection');
  var paymentSection = document.getElementById('paymentSection');
  var addressFields = document.getElementById('billingAddressFields');
  if (requestMode) {
    requestSection.hidden = false;
    paymentSection.hidden = true;
    addressFields.hidden = true;
    Array.prototype.forEach.call(addressFields.querySelectorAll('[required]'), function (el) { el.required = false; });
  } else {
    requestSection.hidden = true;
    paymentSection.hidden = false;
    var note = document.getElementById('enrollModeNote');
    if (note) note.innerHTML = 'Pay securely by card below. For purchase-order billing, call <a href="tel:' + PHONE_HREF + '">' + PHONE + '</a> or email <a href="mailto:' + ENROLL_EMAIL + '">' + ENROLL_EMAIL + '</a>.';
    loadStripeJs(mountCard);
  }

  // ---- enrollment request (email) ----
  var sendEnrollmentRequest = function () {
    if (requestError) requestError.hidden = true;
    var seats = getSeats();
    var p = updateSummary();
    var msg = [
      'Enrollment request from ' + ORDER_FROM,
      '',
      'Course: ' + selected.name + ' (' + itemSlug + ')',
      'Seats: ' + seats,
      'List price: $' + formatMoney(selected.price) + ' per seat',
      'Estimated total: $' + formatMoney(p.total) + (p.discount > 0 ? ' after ' + Math.round(p.tier.discount * 100) + '% volume discount' : ''),
      'LMS course ID: ' + (courseIds.filter(Boolean).join(', ') || 'not mapped yet'),
      '',
      'Name: ' + fieldValue('billingFirstName') + ' ' + fieldValue('billingLastName'),
      'Company: ' + (fieldValue('billingCompany') || '-'),
      'Email: ' + fieldValue('billingEmail'),
      'Phone: ' + fieldValue('billingPhone')
    ];
    var notes = fieldValue('requestNotes');
    if (notes) msg.push('', 'Notes: ' + notes);
    var body = msg.join('\n');
    var subject = 'Enrollment request: ' + selected.name + ' (' + seats + (seats === 1 ? ' seat)' : ' seats)');
    var href = 'mailto:' + ENROLL_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    document.getElementById('requestSummaryText').textContent = 'To: ' + ENROLL_EMAIL + '\nSubject: ' + subject + '\n\n' + body;
    document.getElementById('reopenEmailLink').href = href;
    form.hidden = true;
    document.querySelector('.checkout-header').hidden = true;
    var sentView = document.getElementById('requestSentView');
    sentView.hidden = false;
    sentView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { currency: 'USD', value: p.total, items: [{ item_id: itemSlug, item_name: selected.name, price: selected.price, quantity: seats }] });
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

    // STEP 3: order
    var orderId = 'HZ-' + Math.floor(100000 + Math.random() * 900000);
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
          courses: courseIds.map(function (cid) {
            return { course_id: cid, quantity: getSeats(), users: [{ first_name: firstName, last_name: lastName, email: email, user_name: '' }] };
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

    form.hidden = true;
    document.querySelector('.checkout-header').hidden = true;
    set('successOrderId', orderId.charAt(0) === '#' ? orderId : '#' + orderId);
    set('successUserEmail', email || 'your email');
    successView.hidden = false;
    successView.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', { transaction_id: orderId, currency: 'USD', value: priceFor(getSeats()).total });
    }
    setButtonLoading(false);
  });
});
