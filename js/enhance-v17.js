/* Ahmed Quality Ops — V17 Enhancement JS
   1. Scroll progress bar
   2. Animated stat counters (IntersectionObserver)
   3. Nav active state
*/

(function () {
  'use strict';

  /* ── 1. SCROLL PROGRESS BAR ─────────────────────────────── */
  const bar = document.querySelector('.progress');
  if (bar) {
    const updateBar = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? (scrolled / max * 100) + '%' : '0%';
    };
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  }

  /* ── 2. ANIMATED STAT COUNTERS ──────────────────────────── */
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCounter(el, target, duration) {
    const start = performance.now();
    const isDecimal = target % 1 !== 0;
    const suffix = el.dataset.suffix || '';

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = easeOut(progress) * target;
      el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.counted) return;
      el.dataset.counted = '1';

      const raw = el.textContent.replace(/,/g, '').trim();
      const match = raw.match(/^([\d.]+)(.*)?$/);
      if (!match) return;

      const num = parseFloat(match[1]);
      const suffix = (match[2] || '').replace(/\s+/, '');
      el.dataset.suffix = suffix;
      animateCounter(el, num, 1200);
      statsObserver.unobserve(el);
    });
  }, { threshold: 0.4 });

  /* Observe .stats strong and db-stats strong */
  document.querySelectorAll('.stats strong, .db-stats strong').forEach(el => {
    statsObserver.observe(el);
  });

  /* ── 3. SCROLL-REVEAL: stagger child cards ──────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.cards > .card, .v14-path-card, .ins-lib-card, .ins-path-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.animation = `rise .45s ease ${i * 0.06}s both`;
    el.style.animationPlayState = 'paused';
    revealObserver.observe(el);
  });

  /* ── 4. NAV: mark current page ──────────────────────────── */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.style.color = '#fff';
      a.style.background = 'rgba(255,255,255,.1)';
    }
  });

})();
