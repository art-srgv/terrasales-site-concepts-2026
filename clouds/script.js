/* TerraSales — Clouds: the nav, the hero's depth on scroll, and section 2 one problem at a time.
   The journey in the hero runs on journey.js. Vanilla JS, no dependencies.
   Without this script the page is static and complete: section 2 shows all three problems stacked. */
(() => {
  'use strict';

  const raf = (fn) => window.requestAnimationFrame(fn);
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqWide = window.matchMedia('(min-width: 1181px)');
  const onMQ = (mq, fn) => (mq.addEventListener ? mq.addEventListener('change', fn) : mq.addListener(fn));
  const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hc');

  /* ------------------------------------------------------------------
     NAV — white over the sky, glass once the hero is behind; hover thumb; compact menu
     ------------------------------------------------------------------ */
  if (nav) {
    const group = nav.querySelector('.nav__links');
    const thumb = group && group.querySelector('.nav__thumb');
    if (group && thumb) {
      group.classList.add('has-thumb');
      const place = (link) => {
        const g = group.getBoundingClientRect();
        const r = link.getBoundingClientRect();
        const x = r.left - g.left - group.clientLeft;
        if (!thumb.classList.contains('is-on')) {
          thumb.style.transition = 'opacity .2s';
          thumb.style.transform = `translateX(${x}px)`;
          thumb.style.width = `${r.width}px`;
          void thumb.offsetWidth;
          thumb.style.transition = '';
        } else {
          thumb.style.transform = `translateX(${x}px)`;
          thumb.style.width = `${r.width}px`;
        }
        thumb.classList.add('is-on');
      };
      group.querySelectorAll('.nav__link').forEach((link) => {
        link.addEventListener('pointerenter', () => place(link));
        link.addEventListener('focus', () => place(link));
      });
      group.addEventListener('pointerleave', () => thumb.classList.remove('is-on'));
      group.addEventListener('focusout', (e) => { if (!group.contains(e.relatedTarget)) thumb.classList.remove('is-on'); });
    }

    const menuBtn = nav.querySelector('.nav__burger');
    const sheet = document.getElementById('mnav');
    if (menuBtn && sheet) {
      const setMenu = (open) => {
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        sheet.hidden = !open;
        nav.classList.toggle('is-menu', open);
      };
      menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
      sheet.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); menuBtn.focus(); }
      });
      onMQ(window.matchMedia('(min-width: 1000px)'), (e) => { if (e.matches) setMenu(false); });
    }
  }
  const mist = hero && hero.querySelector('.hc__mist');
  function navState() {
    if (!nav || !hero) return;
    /* light nav once the light half of the mist (or the paper) is under it */
    const past = hero.getBoundingClientRect().bottom - nav.offsetHeight < (mist ? mist.offsetHeight * 0.55 : 1);
    nav.classList.toggle('is-solid', past);
    nav.classList.toggle('is-over', !past && window.scrollY > 8);
  }

  /* ------------------------------------------------------------------
     HERO — depth. The sky drifts slowest, the copy lifts away, the workflow holds,
     and the near clouds rise over it: the page sinks through the clouds into section 2.
     Desktop only; reduced motion keeps every layer still.
     ------------------------------------------------------------------ */
  const layers = hero ? [].slice.call(hero.querySelectorAll('[data-depth]')).map((el) => ({
    el, k: parseFloat(el.getAttribute('data-depth')) || 0,
    copy: el.classList.contains('hc__copy'), journey: el.classList.contains('jr') || el.hasAttribute('data-fade'), near: el.classList.contains('hc__front')
  })) : [];
  let applied = false, past = false;
  function depth() {
    if (!hero || !layers.length) return;
    if (mqReduce.matches || !mqWide.matches) {
      if (applied) { layers.forEach((l) => { l.el.style.transform = ''; l.el.style.opacity = ''; }); applied = false; past = false; }
      return;
    }
    const h = hero.offsetHeight;
    const y = Math.min(Math.max(window.scrollY, 0), h);
    if (y >= h && past) return;                 /* the hero is behind: nothing left to move */
    const p = y / h;
    layers.forEach((l) => {
      if (l.near) {
        l.el.style.transform = `translate3d(0, ${(y * l.k).toFixed(1)}px, 0) scale(${(1 + p * 0.14).toFixed(4)})`;
      } else {
        l.el.style.transform = `translate3d(0, ${(y * l.k).toFixed(1)}px, 0)`;
      }
      if (l.copy) l.el.style.opacity = clamp(1 - y / (window.innerHeight * 0.42)).toFixed(3);
      if (l.journey) l.el.style.opacity = clamp(1 - (p - 0.36) / 0.3).toFixed(3);   /* gone once the clouds have it */
    });
    applied = true;
    past = y >= h;
  }

  /* ------------------------------------------------------------------
     SECTION 2 — one problem at a time. Above 1180px the stage is sticky inside a taller
     track; each third of the track's scroll is one problem. Below, all three stack and
     each product block rises in when it comes into view.
     ------------------------------------------------------------------ */
  const cs = document.querySelector('[data-cs]');
  const track = cs && cs.querySelector('[data-cs-track]');
  const items = cs ? [].slice.call(cs.querySelectorAll('[data-cs-item]')) : [];
  const parts = items.map((it) => ({
    it,
    btn: it.querySelector('.cs__btn'),
    card: it.querySelector('.cs__card'),
    viz: it.querySelector('.s2__viz'),
    bar: it.querySelector('.cs__bar')
  }));
  let active = -1, mode = '';
  let io = null;

  function setActive(i) {
    if (i === active) return;
    active = i;
    parts.forEach((x, k) => {
      const on = k === i;
      x.it.classList.toggle('is-active', on);
      if (on) x.btn.setAttribute('aria-current', 'true'); else x.btn.removeAttribute('aria-current');
      x.viz.classList.toggle('is-on', on);
    });
  }
  function trackProgress() {
    const r = track.getBoundingClientRect();
    const run = r.height - window.innerHeight;
    return run > 0 ? clamp(-r.top / run) : 0;
  }
  function stepScroll() {
    if (mode !== 'pin') return;
    const p = trackProgress();
    const i = Math.min(parts.length - 1, Math.floor(p * parts.length));
    setActive(i);
    const local = clamp(p * parts.length - i);
    parts.forEach((x, k) => x.bar && x.bar.style.setProperty('--p', (k < i ? 1 : k === i ? local : 0).toFixed(3)));
  }
  function setMode() {
    if (!cs || !track) return;
    const next = mqWide.matches ? 'pin' : 'stack';
    if (next === mode) return;
    mode = next;
    if (io) { io.disconnect(); io = null; }
    if (mode === 'pin') {
      active = -1;
      parts.forEach((x) => x.btn.removeAttribute('tabindex'));
      stepScroll();
    } else {
      active = -1;
      parts.forEach((x) => {
        x.it.classList.add('is-active');
        x.btn.removeAttribute('aria-current');
        x.btn.setAttribute('tabindex', '-1');      /* stacked: every problem is open, the titles have nothing to do */
        x.viz.classList.remove('is-on');
      });
      if ('IntersectionObserver' in window && !mqReduce.matches) {
        io = new IntersectionObserver((es) => {
          es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-on'); io.unobserve(e.target); } });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.25 });
        parts.forEach((x) => io.observe(x.viz));
      } else {
        parts.forEach((x) => x.viz.classList.add('is-on'));
      }
    }
  }
  parts.forEach((x, k) => x.btn.addEventListener('click', () => {
    if (mode !== 'pin') return;
    const r = track.getBoundingClientRect();
    const run = r.height - window.innerHeight;
    const top = window.scrollY + r.top + run * (k / parts.length) + (k ? 4 : 0);
    window.scrollTo({ top, behavior: mqReduce.matches ? 'auto' : 'smooth' });
  }));

  /* ------------------------------------------------------------------
     one scroll loop for everything
     ------------------------------------------------------------------ */
  let ticking = false;
  function frame() { ticking = false; navState(); depth(); stepScroll(); }
  function request() { if (!ticking) { ticking = true; raf(frame); } }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  onMQ(mqWide, () => { setMode(); request(); });
  onMQ(mqReduce, () => { mode = ''; setMode(); request(); });

  setMode();
  frame();
})();
