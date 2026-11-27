/* TerraSales — hero concept "one picture": the call goes into TerraSales, TerraSales branches into
   Buyer Truth / Revenue Context / CRM Accuracy, and each brings its result. Plays once when in view and
   holds the whole picture (replay button). Reduced motion and ≤1180px: the whole picture at once.
   Steps are classes on .hb, kept as it goes: is-1 call · is-2 wire to the hub · is-3 hub lights ·
   is-4 branches draw (sparks run) · is-5 names light · is-6 arrows · is-7 results · is-done synced. */
(function () {
  'use strict';
  var hb = document.querySelector('[data-hub]');
  if (!hb) return;
  var replay = hb.querySelector('.hb__replay');
  var sparks = [].slice.call(hb.querySelectorAll('.hb__spark animateMotion'));
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqStack = window.matchMedia('(max-width: 1180px)');
  var STEPS = [['is-1', 250], ['is-2', 900], ['is-3', 1300], ['is-4', 1500], ['is-5', 2550], ['is-6', 2700], ['is-7', 3050], ['is-done', 4300]];
  var timers = [], played = false;

  function clear() { timers.forEach(clearTimeout); timers = []; }
  function all() {
    clear();
    STEPS.forEach(function (s) { hb.classList.add(s[0]); });
    if (replay) replay.hidden = true;
  }
  function reset() {
    clear();
    STEPS.forEach(function (s) { hb.classList.remove(s[0]); });
  }
  function play() {
    if (mqReduce.matches || mqStack.matches) { all(); return; }
    reset();
    void hb.offsetWidth;                         /* start from a clean frame */
    if (replay) replay.hidden = true;
    STEPS.forEach(function (s) {
      timers.push(setTimeout(function () {
        hb.classList.add(s[0]);
        if (s[0] === 'is-4') sparks.forEach(function (a) { try { a.beginElement(); } catch (e) { /* no SMIL: the wires still draw */ } });
        if (s[0] === 'is-done' && replay) replay.hidden = false;
      }, s[1]));
    });
  }

  if (replay) replay.addEventListener('click', play);
  [mqReduce, mqStack].forEach(function (mq) {
    var on = function () { if (mq.matches) all(); };
    if (mq.addEventListener) mq.addEventListener('change', on); else mq.addListener(on);
  });

  /* review helper: ?hub=end shows the whole picture at once */
  if (/[?&]hub=end\b/.test(location.search) || mqReduce.matches || mqStack.matches) { all(); return; }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (!played && es[es.length - 1].isIntersecting) { played = true; play(); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(hb);
  } else { all(); }
})();
