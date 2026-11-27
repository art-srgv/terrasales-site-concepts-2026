/* TerraSales — Clouds: the workflow as one moment that changes (grown from the Frame concept's journey).
   Three stations on one line: Buyer Truth → Revenue Context → CRM Accuracy. One capsule rides under the
   line: at station 1 it is what the buyer said; it travels to station 2 and becomes what Terra Agent makes
   of it; it travels on to station 3 and becomes the Salesforce update, which syncs. The light on the line
   follows the capsule, each station lights as the capsule arrives, and the story starts over after a pause.
   The capsule is built from the three notes in the markup (one per station), so without the script, with
   reduced motion, in the stacked layout (≤1180px) and with ?journey=end the three notes simply stand under
   their stations. Pause / Play button (WCAG 2.2.2); runs only on screen and in a visible tab;
   ?journey=NNNN freezes that moment (review). Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var root = document.querySelector('[data-journey]');
  var jr = root && root.querySelector('.jr');
  if (!jr) return;
  var manual = root.hasAttribute('data-journey-manual');

  /* ---------------- glyphs: 24-unit thin-line icons, one accent stroke in the station tone ---------------- */
  var GLYPHS = {
    capture: [   /* a speech bubble carrying a voice wave: what the buyer actually said */
      ['path', 'M9 18H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-3l-3 3z', 'ln'],
      ['path', 'M8.25 10v2M10.75 8.5v5M13.25 9.25v3.5M15.75 10v2', 'ac']
    ],
    understand: [   /* sparkles: the Terra Agent reading the context around every answer */
      ['path', 'M9 18a6 6 0 0 1 6-6a6 6 0 0 1-6-6a6 6 0 0 1-6 6a6 6 0 0 1 6 6z', 'ln'],
      ['path', 'M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2zM16 6a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2z', 'ac']
    ],
    act: [   /* the CRM cloud, checked: the record is right */
      ['path', 'M6.66 18.5C4.08 18.5 2 16.49 2 14.02c0-2.48 2.08-4.49 4.66-4.49.39-1.76 1.79-3.2 3.67-3.77 1.88-.57 3.96-.19 5.45 1 1.49 1.19 2.16 3.01 1.77 4.77h.99c1.91 0 3.46 1.56 3.46 3.49S20.45 18.5 18.54 18.5Z', 'ln'],
      ['path', 'M9.5 14l2 2 3.5-3.5', 'ac']
    ]
  };
  function glyph(name, live) {
    var g = GLYPHS[name] || [], out = [];
    for (var i = 0; i < g.length; i++) {
      var e = g[i], cls = live ? ' class="' + e[2] + '" style="--k:' + i + '"' : '';
      var len = live ? ' pathLength="1"' : '';
      out.push('<path d="' + e[1] + '"' + cls + len + '/>');
    }
    return '<svg class="' + (live ? 'g-live' : 'g-ghost') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + out.join('') + '</svg>';
  }
  [].forEach.call(jr.querySelectorAll('.jr__icon[data-icon]'), function (el) {
    var name = el.getAttribute('data-icon');
    el.innerHTML = '<span class="jr__pulse"></span><span class="jr__disc"></span><span class="jr__glyph">' + glyph(name, false) + glyph(name, true) + '</span>';
  });

  var steps = [].slice.call(jr.querySelectorAll('.jr__step'));
  var chans = [].slice.call(jr.querySelectorAll('.jr__ch'));
  chans.forEach(function (ch) { ch.innerHTML = '<i class="jr__fill"></i><i class="jr__head"></i>'; });
  var toggle = jr.querySelector('.jr__toggle');
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqStack = window.matchMedia('(max-width: 1180px)');

  /* ---------------- the capsule: the three station notes, stacked as its three states ---------------- */
  var pod = document.createElement('div');
  pod.className = 'jr__pod';
  pod.setAttribute('aria-hidden', 'true');
  var body = document.createElement('div');
  body.className = 'pod pod--travel';
  steps.forEach(function (s, i) {
    var note = s.querySelector('.jr__note');
    var st = document.createElement('span');
    st.className = 'pod__state pod__state--' + (i + 1);
    st.innerHTML = note ? note.innerHTML : '';
    [].forEach.call(st.querySelectorAll('img[alt]'), function (img) { img.alt = ''; });
    body.appendChild(st);
  });
  pod.appendChild(body);
  jr.appendChild(pod);
  var X = [320, 800, 1280];   /* station centres in frame units — the same numbers as style.css */
  var CH = [[370, 380], [850, 380]];   /* each line segment's left edge and width (frame units, style.css) */
  jr.classList.add('is-ready');

  /* ---------------- timeline (ms): arrive, hold, travel, arrive … then hold the end and start over ---------------- */
  var T = {
    lit1: 250, pod1: 500,
    a0: 2400, a1: 3800,      /* station 1 → 2 */
    b0: 6000, b1: 7400,      /* station 2 → 3 */
    synced: 8400, done: 8800,
    out: 12200, loop: 12800  /* the capsule fades, the story starts over */
  };
  function ease(x) { return x <= 0 ? 0 : x >= 1 ? 1 : .5 - Math.cos(Math.PI * x) / 2; }
  function set(el, cls, on) { if (el) el.classList.toggle(cls, !!on); }
  function line(ch, p, running) {
    if (!ch) return;
    ch.style.setProperty('--p', p.toFixed(4));
    set(ch, 'is-running', running);
  }
  function stage(t) {
    var pa = ease((t - T.a0) / (T.a1 - T.a0)), pb = ease((t - T.b0) / (T.b1 - T.b0));
    set(steps[0], 'is-lit', t >= T.lit1);
    set(steps[1], 'is-lit', t >= T.a1);
    set(steps[2], 'is-lit', t >= T.b1);
    steps.forEach(function (s) { set(s, 'is-shown', true); });
    set(steps[2], 'is-synced', t >= T.synced);
    set(jr, 'is-fading', t >= T.out);
    var x = t < T.b0 ? X[0] + (X[1] - X[0]) * pa : X[1] + (X[2] - X[1]) * pb;
    /* the light follows the capsule: the head of each segment's fill sits exactly where the capsule hangs */
    chans.forEach(function (ch, i) {
      var p = Math.max(0, Math.min(1, (x - CH[i][0]) / CH[i][1]));
      line(ch, p, p > 0 && p < 1);
    });
    var s = t < T.a1 ? 1 : t < T.b1 ? 2 : 3;
    pod.style.setProperty('--px', x.toFixed(2));
    pod.className = 'jr__pod is-s' + s +
      (t >= T.pod1 && t < T.out ? ' is-on' : '') +
      ((pa > 0 && pa < 1) || (pb > 0 && pb < 1) ? ' is-moving' : '') +
      (t >= T.synced ? ' is-synced' : '');
  }

  /* ---------------- play / pause ---------------- */
  var t = 0, last = 0, frame = 0, started = false;
  var userPaused = false, inView = !('IntersectionObserver' in window), wanted = !manual;
  var hoverAt = -1, scrubTimer = 0;   /* the station under the pointer, if any: the story waits there */
  var forceEnd = /[?&]journey=end\b/.test(location.search);
  function staticMode() { return mqReduce.matches || mqStack.matches || forceEnd; }
  function running() { return started && !userPaused && hoverAt < 0 && inView && !document.hidden && !staticMode(); }

  function tick(now) {
    frame = 0;
    var dt = last ? Math.min(50, now - last) : 16;
    last = now; t += dt;
    if (t >= T.loop) t = 0;
    stage(t);
    if (running()) frame = requestAnimationFrame(tick); else { last = 0; label(); }
  }
  function label() {
    var stat = staticMode();
    jr.classList.toggle('is-static', stat);
    jr.classList.toggle('is-paused', userPaused && started && !stat);
    jr.classList.toggle('is-idle', !started && !stat);
    if (toggle) toggle.setAttribute('aria-label', (userPaused || !started) ? 'Play the workflow animation' : 'Pause the workflow animation');
  }
  function sync() {
    if (staticMode()) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; t = T.done; started = true;
      stage(t); label();
      return;
    }
    if (!started && wanted && inView) started = true;
    if (!started) { stage(0); label(); return; }
    if (running() && !frame) { last = 0; frame = requestAnimationFrame(tick); }
    label();
  }

  if (toggle) toggle.addEventListener('click', function () {
    if (!started) { wanted = true; started = true; userPaused = false; }
    else userPaused = !userPaused;
    sync();
  });
  /* hover a station: the capsule glides to it and shows that moment, and the story waits; move the pointer
     off and the story goes on from that station (a pause set with the button stays a pause) */
  var MOMENT = [700, T.a1 + 400, T.synced + 200];
  function scrub() {
    jr.classList.add('is-scrub');
    clearTimeout(scrubTimer);
    scrubTimer = setTimeout(function () { jr.classList.remove('is-scrub'); }, 700);
  }
  steps.forEach(function (s, i) {
    s.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'touch' || staticMode()) return;
      hoverAt = i;
      s.classList.add('is-hover');
      if (!started) { started = true; wanted = true; }
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      last = 0; t = MOMENT[i];
      scrub(); stage(t); label();
    });
    s.addEventListener('pointerleave', function () {
      s.classList.remove('is-hover');
      if (hoverAt !== i) return;
      hoverAt = -1;
      sync();
    });
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { var e = es[es.length - 1]; inView = e.isIntersecting && e.intersectionRatio >= 0.35; sync(); }, { threshold: [0, 0.35] }).observe(root);
  }
  document.addEventListener('visibilitychange', sync);
  [mqReduce, mqStack].forEach(function (mq) {
    var on = function () {
      if (!staticMode() && t >= T.done) { t = 0; started = false; stage(0); }
      sync();
    };
    if (mq.addEventListener) mq.addEventListener('change', on); else mq.addListener(on);
  });

  window.TerraJourney = {
    play: function () { wanted = true; inView = true; sync(); },
    finish: function () { if (frame) cancelAnimationFrame(frame); frame = 0; t = T.done; started = true; stage(t); label(); },
    reset: function () { if (frame) cancelAnimationFrame(frame); frame = 0; t = 0; started = false; userPaused = false; wanted = !manual; stage(0); sync(); }
  };

  /* review helper: ?journey=NNNN freezes that moment */
  var q = /[?&]journey=(\d+)\b/.exec(location.search);
  if (q && !staticMode()) {
    started = true; inView = true; userPaused = true;
    t = Math.min(T.loop - 1, Number(q[1]));
    stage(t); label();
    return;
  }
  stage(0);
  sync();
})();
