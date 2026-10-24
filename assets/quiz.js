// Practice quiz: scores the radio answers, marks each question and reveals the explanations.
(function () {
  var form = document.getElementById('quiz');
  if (!form) return;
  var result = document.getElementById('quizResult');
  var reset = document.getElementById('quizReset');
  var qs = Array.prototype.slice.call(form.querySelectorAll('.q'));

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var right = 0;
    qs.forEach(function (q) {
      var answer = q.getAttribute('data-answer');
      var picked = q.querySelector('input:checked');
      var ok = !!picked && picked.value === answer;
      if (ok) right++;
      q.classList.remove('is-right', 'is-wrong');
      q.classList.add(ok ? 'is-right' : 'is-wrong');
      Array.prototype.forEach.call(q.querySelectorAll('.opt'), function (opt) {
        opt.classList.toggle('opt-correct', opt.querySelector('input').value === answer);
      });
    });
    var pct = Math.round(right / qs.length * 100);
    form.classList.add('done');
    document.getElementById('quizScore').textContent = 'You scored ' + right + ' / ' + qs.length + ' (' + pct + '%)';
    document.getElementById('quizMsg').textContent = pct >= 80
      ? 'Nice work. Review the explanations below for anything you missed.'
      : pct >= 60 ? 'Close. Read the explanations below and try again.'
      : 'Keep studying. The explanations below show the right answer for each question.';
    result.hidden = false;
    reset.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof window.gtag === 'function') window.gtag('event', 'quiz_complete', { score: pct });
  });

  reset.addEventListener('click', function () {
    form.reset();
    form.classList.remove('done');
    qs.forEach(function (q) { q.classList.remove('is-right', 'is-wrong'); });
    Array.prototype.forEach.call(form.querySelectorAll('.opt-correct'), function (o) { o.classList.remove('opt-correct'); });
    result.hidden = true;
    reset.hidden = true;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
