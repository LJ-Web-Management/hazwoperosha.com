// Course search on the hub page: shows/hides the server-rendered course cards.
(function () {
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
