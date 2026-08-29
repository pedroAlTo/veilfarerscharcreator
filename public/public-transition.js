(() => {
  'use strict';

  const STORAGE_KEY = 'vf-ftl-arrival';
  const EXIT_DURATION = 960;
  const ARRIVAL_DURATION = 1040;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let transitioning = false;

  const easeInCubic = (value) => value * value * value;
  const easeOutCubic = (value) => 1 - ((1 - value) ** 3);

  const createHyperspace = (canvas, mode) => {
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return () => {};

    const compact = window.innerWidth < 720;
    const starCount = compact ? 360 : 720;
    const duration = mode === 'exiting' ? EXIT_DURATION : ARRIVAL_DURATION;
    const stars = [];
    let width = 1;
    let height = 1;
    let scale = 1;
    let previousFrame = 0;
    let startedAt = 0;

    const randomStar = (star, initial = false) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.08 + Math.sqrt(Math.random()) * 1.18;
      star.x = Math.cos(angle) * radius;
      star.y = Math.sin(angle) * radius * 0.72;
      star.z = initial ? 0.14 + Math.random() * 1.2 : 1.15 + Math.random() * 0.28;
      star.warm = Math.random() < 0.17;
      star.energy = 0.42 + Math.random() * 0.58;
    };

    for (let index = 0; index < starCount; index += 1) {
      const star = {};
      randomStar(star, true);
      stars.push(star);
    }

    const resize = () => {
      scale = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const draw = (now) => {
      if (!canvas.isConnected) return;
      if (!startedAt) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / duration);
      const curve = mode === 'exiting' ? easeInCubic(progress) : 1 - easeOutCubic(progress);
      const speed = mode === 'exiting' ? 0.26 + curve * 3.45 : 0.34 + curve * 3.25;
      const focal = Math.min(width, height) * 0.42;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const delta = previousFrame ? Math.min(0.034, (now - previousFrame) / 1000) : 0.016;
      previousFrame = now;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';
      context.lineCap = 'round';

      stars.forEach((star) => {
        star.z -= speed * delta;
        if (star.z < 0.055) randomStar(star);

        const headX = centerX + (star.x / star.z) * focal;
        const headY = centerY + (star.y / star.z) * focal;
        const trailDepth = 0.035 + speed * (0.105 + star.energy * 0.022);
        const tailZ = star.z + trailDepth;
        const tailX = centerX + (star.x / tailZ) * focal;
        const tailY = centerY + (star.y / tailZ) * focal;

        if (headX < -180 || headX > width + 180 || headY < -180 || headY > height + 180) {
          randomStar(star);
          return;
        }

        const proximity = Math.max(0, Math.min(1, 1.08 - star.z));
        const alpha = (0.2 + proximity * 0.72) * star.energy;
        const gradient = context.createLinearGradient(tailX, tailY, headX, headY);
        gradient.addColorStop(0, 'rgba(115, 175, 222, 0)');
        gradient.addColorStop(0.32, star.warm ? `rgba(211, 166, 91, ${alpha * 0.48})` : `rgba(118, 188, 236, ${alpha * 0.52})`);
        gradient.addColorStop(1, star.warm ? `rgba(255, 223, 162, ${alpha})` : `rgba(228, 247, 255, ${alpha})`);

        context.strokeStyle = gradient;
        context.lineWidth = 0.45 + proximity * 1.7 * star.energy;
        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(headX, headY);
        context.stroke();

        if (star.energy > 0.84 && proximity > 0.28) {
          context.fillStyle = star.warm ? `rgba(255, 235, 194, ${alpha * 0.78})` : `rgba(244, 252, 255, ${alpha * 0.82})`;
          context.beginPath();
          context.arc(headX, headY, 0.45 + proximity * 0.9, 0, Math.PI * 2);
          context.fill();
        }
      });

      context.globalCompositeOperation = 'source-over';
      if (progress < 1) window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.requestAnimationFrame(draw);
    return () => window.removeEventListener('resize', resize);
  };

  const createTransition = (mode) => {
    const overlay = document.createElement('div');
    overlay.className = `vf-ftl-transition is-${mode}`;
    overlay.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.className = 'vf-ftl-canvas';
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    const cleanup = createHyperspace(canvas, mode);
    overlay.addEventListener('animationend', () => {
      cleanup();
      if (mode === 'arriving') {
        document.documentElement.classList.remove('vf-ftl-arriving');
        overlay.remove();
      }
    }, { once: true });
    return overlay;
  };

  const readArrival = () => {
    try {
      const active = sessionStorage.getItem(STORAGE_KEY) === '1';
      if (active) sessionStorage.removeItem(STORAGE_KEY);
      return active;
    } catch (_) {
      return false;
    }
  };

  const markArrival = () => {
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (_) { /* navigation still works */ }
  };

  if (!reducedMotion.matches && readArrival()) createTransition('arriving');

  document.addEventListener('click', (event) => {
    if (transitioning || reducedMotion.matches || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || link.target === '_blank') return;

    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin) return;
    const sameDocument = destination.pathname === location.pathname;
    if (sameDocument) return;

    event.preventDefault();
    transitioning = true;
    markArrival();
    createTransition('exiting');
    window.setTimeout(() => location.assign(destination.href), EXIT_DURATION - 30);
  });
})();
