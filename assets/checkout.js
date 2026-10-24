/*
 * Checkout wiring for the HAZWOPER landing page.
 *
 * Fill in CHECKOUT below with the Stripe settings and course IDs used by the main
 * hazwoper-osha.com storefront. Until a course has an ID, its "Enroll" button keeps
 * its plain href (the main site), so nothing on the page is ever a dead link.
 *
 *   stripePublishableKey  pk_live_... publishable key (safe to expose in the browser)
 *   checkoutUrl           template for the checkout link. Tokens:
 *                           {courseId}  the ID from courseIds below
 *                           {slug}      this page's course slug
 *                           {price}     course price
 *                           {key}       stripePublishableKey
 *   courseIds             { "<course slug>": "<course ID>" } - slugs are listed in data/courses.json
 */
window.CHECKOUT = window.CHECKOUT || {
  stripePublishableKey: '',
  checkoutUrl: '',
  courseIds: {
    // 'osha-40-hour-hazwoper-training': '',
    // 'hazwoper-bundle': '',
  },
};

(function () {
  var cfg = window.CHECKOUT;

  function checkoutHref(el) {
    var slug = el.getAttribute('data-enroll');
    var id = cfg.courseIds && cfg.courseIds[slug];
    if (!cfg.checkoutUrl || !id) return null;
    return cfg.checkoutUrl
      .replace(/\{courseId\}/g, encodeURIComponent(id))
      .replace(/\{slug\}/g, encodeURIComponent(slug))
      .replace(/\{price\}/g, encodeURIComponent(el.getAttribute('data-price') || ''))
      .replace(/\{key\}/g, encodeURIComponent(cfg.stripePublishableKey || ''));
  }

  document.querySelectorAll('[data-enroll]').forEach(function (el) {
    var href = checkoutHref(el);
    if (href) el.setAttribute('href', href);
  });

  // Course search on the hub page
  var q = document.getElementById('q');
  if (!q) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('.courses .card'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.courses .group'));
  var none = document.getElementById('noresults');
  q.addEventListener('input', function () {
    var terms = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    var shown = 0;
    cards.forEach(function (c) {
      var hay = c.getAttribute('data-search');
      var ok = terms.every(function (t) { return hay.indexOf(t) !== -1; });
      c.hidden = !ok;
      if (ok) shown++;
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('.card:not([hidden])'); });
    none.hidden = shown > 0;
  });
})();
