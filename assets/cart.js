// Shopping cart shared by every page. Stores [{ slug, qty }] in localStorage
// (in memory when storage is blocked) and keeps the header badge in sync.
// Add-to-cart links ([data-add-to-cart]) fall back to checkout.html?item=... without JS.
var HZCart = (function () {
  var KEY = 'hz_cart_v1';
  var memory = [];

  var clean = function (lines) {
    if (!Array.isArray(lines)) return [];
    return lines.filter(function (l) { return l && typeof l.slug === 'string'; })
      .map(function (l) { return { slug: l.slug, qty: Math.max(1, Math.min(10000, parseInt(l.qty, 10) || 1)) }; });
  };
  var read = function () {
    try { var raw = window.localStorage.getItem(KEY); return raw ? clean(JSON.parse(raw)) : []; } catch (e) { return memory.slice(); }
  };
  var write = function (lines) {
    memory = clean(lines);
    try { window.localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) {}
    updateBadges();
    document.dispatchEvent(new CustomEvent('hz:cart'));
  };
  var find = function (lines, slug) {
    for (var i = 0; i < lines.length; i++) if (lines[i].slug === slug) return i;
    return -1;
  };

  var api = {
    items: read,
    count: function () { return read().reduce(function (n, l) { return n + l.qty; }, 0); },
    has: function (slug) { return find(read(), slug) !== -1; },
    // Adds a course once; adding it again keeps the existing seat count.
    add: function (slug, qty) {
      var lines = read();
      if (find(lines, slug) === -1) lines.push({ slug: slug, qty: qty || 1 });
      write(lines);
    },
    setQty: function (slug, qty) {
      var lines = read(), i = find(lines, slug);
      if (i !== -1) { lines[i].qty = qty; write(lines); }
    },
    remove: function (slug) {
      write(read().filter(function (l) { return l.slug !== slug; }));
    },
    clear: function () { write([]); }
  };

  function updateBadges() {
    var n = api.count();
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-count]'), function (el) {
      el.textContent = String(n);
      var link = el.closest('a');
      if (link) link.setAttribute('aria-label', 'Cart, ' + n + (n === 1 ? ' item' : ' items'));
    });
  }

  document.addEventListener('DOMContentLoaded', updateBadges);
  window.addEventListener('storage', function (e) { if (e.key === KEY) updateBadges(); });
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    var slug = btn.getAttribute('data-add-to-cart');
    if (btn.classList.contains('in-cart')) return; // second click follows the link to checkout
    e.preventDefault();
    api.add(slug, 1);
    markAdded(slug);
  });
  function markAdded(slug) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-add-to-cart="' + slug + '"]'), function (b) {
      b.classList.add('in-cart');
      b.textContent = 'In cart · Checkout';
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    read().forEach(function (l) { markAdded(l.slug); });
  });

  return api;
})();
