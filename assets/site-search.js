// Sitewide search page: ranks entries from assets/search-index.js (HZ_SEARCH) for ?q=.
(function () {
  var input = document.getElementById('sq');
  var list = document.getElementById('searchResults');
  if (!input || !list || typeof HZ_SEARCH === 'undefined') return;
  var status = document.getElementById('searchStatus');
  var empty = document.getElementById('searchEmpty');
  var KIND_BOOST = { Course: 3, Guide: 2, Quiz: 1.5, Glossary: 1, FAQ: 0.5 };
  var ALIASES = { hr: 'hour', hrs: 'hour', hours: 'hour', hazwopper: 'hazwoper', hazwhopper: 'hazwoper', hazmat: 'hazardous', calosha: 'cal osha', refresh: 'refresher' };

  var norm = function (s) {
    return String(s || '').toLowerCase().replace(/cal\/osha/g, 'cal osha').replace(/(\d+)\s*-?\s*(hour|hr|hrs)\b/g, '$1 hour')
      .replace(/[^a-z0-9.()]+/g, ' ').trim();
  };
  var terms = function (q) {
    return norm(q).split(' ').filter(Boolean).map(function (t) { return ALIASES[t] || t; }).join(' ').split(' ');
  };
  var docs = HZ_SEARCH.map(function (d) {
    return { d: d, title: ' ' + norm(d.t) + ' ', body: ' ' + norm(d.d + ' ' + (d.x || '')) + ' ' };
  });

  var run = function (q) {
    var ts = terms(q);
    list.textContent = '';
    if (!ts.length || !ts[0]) { status.textContent = ''; empty.hidden = true; return; }
    var hits = docs.map(function (doc) {
      var score = 0;
      for (var i = 0; i < ts.length; i++) {
        var t = ts[i], inTitle = doc.title.indexOf(t) !== -1, inBody = doc.body.indexOf(t) !== -1;
        if (!inTitle && !inBody) return null;
        if (inTitle) score += doc.title.indexOf(' ' + t + ' ') !== -1 ? 4 : 2.5;
        if (inBody) score += doc.body.indexOf(' ' + t + ' ') !== -1 ? 1 : 0.5;
      }
      if (doc.title.indexOf(' ' + ts.join(' ')) !== -1) score += 3;
      return { doc: doc.d, score: score * (KIND_BOOST[doc.d.k] || 1) / Math.sqrt(doc.title.length / 40 + 1) };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 40);

    status.textContent = hits.length ? hits.length + (hits.length === 40 ? '+' : '') + ' results for "' + q + '"' : '';
    empty.hidden = hits.length > 0;
    hits.forEach(function (h) {
      var li = document.createElement('li');
      var tag = document.createElement('span');
      tag.className = 'pill pill-soft';
      tag.textContent = h.doc.k;
      var a = document.createElement('a');
      a.href = '../' + h.doc.u;
      a.textContent = h.doc.t;
      var p = document.createElement('p');
      p.textContent = h.doc.d.length > 220 ? h.doc.d.slice(0, 220).replace(/\s\S*$/, '') + '...' : h.doc.d;
      li.appendChild(tag); li.appendChild(a); li.appendChild(p);
      if (h.doc.k === 'Course' && h.doc.s) {
        var btn = document.createElement('a');
        btn.className = 'btn btn-sm';
        btn.href = '../checkout.html?item=' + h.doc.s;
        btn.setAttribute('data-add-to-cart', h.doc.s);
        btn.textContent = HZCart.has(h.doc.s) ? 'In cart · Checkout' : 'Add to cart';
        if (HZCart.has(h.doc.s)) btn.classList.add('in-cart');
        li.appendChild(btn);
      }
      list.appendChild(li);
    });
  };

  var q = new URLSearchParams(window.location.search).get('q') || '';
  input.value = q;
  var headerInput = document.getElementById('site-q');
  if (headerInput) headerInput.value = q;
  run(q);
  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      run(input.value);
      if (window.history.replaceState) window.history.replaceState(null, '', input.value ? '?q=' + encodeURIComponent(input.value) : './');
    }, 120);
  });
  input.form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); });
  if (!q) input.focus();
})();
