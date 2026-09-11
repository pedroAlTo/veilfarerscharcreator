(() => {
  const modal = document.querySelector('[data-beta-modal]');
  const inbox = document.querySelector('[data-cta-inbox]');
  if (!(modal instanceof HTMLDialogElement) || !(inbox instanceof HTMLButtonElement)) return;

  const closeButton = modal.querySelector('[data-beta-close]');
  const deleteButton = modal.querySelector('[data-beta-delete]');
  const card = modal.querySelector('.vf-beta-card');
  const action = modal.querySelector('.vf-beta-action');
  const smokeCanvas = modal.querySelector('[data-beta-eye-smoke]');
  const portraitImage = modal.querySelector('.vf-beta-portrait img');
  const shelvedKey = 'vf-beta-recruitment-shelved';
  const deletedKey = 'vf-beta-recruitment-deleted';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let closing = false;
  let closeTimer = 0;
  let closeMode = 'shelve';
  let switchTarget = '';
  let smokeFrame = 0;
  let smokeWidth = 0;
  let smokeHeight = 0;
  let smokeRatio = 1;
  let smokeParticles = [];

  function readStorage(storage, key) {
    try { return window[storage].getItem(key) === '1'; }
    catch { return false; }
  }

  function writeStorage(storage, key, value = '1') {
    try { window[storage].setItem(key, value); }
    catch { /* Controls remain usable when browser storage is unavailable. */ }
  }

  function isDeleted() { return readStorage('localStorage', deletedKey); }
  function isShelved() { return readStorage('sessionStorage', shelvedKey); }

  function reportInbox(active, animate = false) {
    const deleted = isDeleted();
    window.dispatchEvent(new CustomEvent('vf:cta-inbox-update', { detail: {
      target: 'beta', active: active && !deleted, deleted, open: modal.open, animate, auto: !isShelved() && !deleted
    } }));
  }

  function rememberShelved() { writeStorage('sessionStorage', shelvedKey); }

  function rememberDeleted() {
    writeStorage('localStorage', deletedKey);
    try { sessionStorage.removeItem(shelvedKey); }
    catch { /* Nothing else is required. */ }
    reportInbox(false);
  }

  function eyeAnchors() {
    if (!(smokeCanvas instanceof HTMLCanvasElement) || !(portraitImage instanceof HTMLImageElement)) return [];
    const sourceWidth = portraitImage.naturalWidth || 1122;
    const sourceHeight = portraitImage.naturalHeight || 1402;
    const scale = Math.max(smokeWidth / sourceWidth, smokeHeight / sourceHeight);
    const drawnWidth = sourceWidth * scale;
    const drawnHeight = sourceHeight * scale;
    const offsetX = (smokeWidth - drawnWidth) * .5;
    const offsetY = (smokeHeight - drawnHeight) * .35;
    return [
      { x: offsetX + 463 * scale, y: offsetY + 535 * scale, direction: -1 },
      { x: offsetX + 661 * scale, y: offsetY + 535 * scale, direction: 1 }
    ];
  }

  function makeSmokeParticle(initial = false) {
    const anchors = eyeAnchors();
    const eye = anchors[Math.random() < .5 ? 0 : 1] || { x: smokeWidth * .5, y: smokeHeight * .38, direction: 1 };
    const age = initial ? Math.random() : 0;
    const velocity = .32 + Math.random() * .72;
    const distance = age * (35 + Math.random() * 90);
    return {
      x: eye.x + eye.direction * distance,
      y: eye.y + (Math.random() - .5) * (8 + age * 28),
      vx: eye.direction * velocity,
      vy: (Math.random() - .5) * .32 - .045,
      direction: eye.direction,
      age,
      size: .45 + Math.random() * 1.25,
      phase: Math.random() * Math.PI * 2,
      warmth: Math.random() < .08
    };
  }

  function sizeEyeSmoke() {
    if (!(smokeCanvas instanceof HTMLCanvasElement)) return false;
    const width = smokeCanvas.clientWidth;
    const height = smokeCanvas.clientHeight;
    if (!width || !height) return false;
    if (width === smokeWidth && height === smokeHeight) return true;
    smokeWidth = width;
    smokeHeight = height;
    smokeRatio = Math.min(devicePixelRatio || 1, 1.5);
    smokeCanvas.width = Math.round(width * smokeRatio);
    smokeCanvas.height = Math.round(height * smokeRatio);
    const context = smokeCanvas.getContext('2d');
    context?.setTransform(smokeRatio, 0, 0, smokeRatio, 0, 0);
    const count = width < 420 ? 70 : 120;
    smokeParticles = Array.from({ length: count }, () => makeSmokeParticle(true));
    return true;
  }

  function drawEyeSmoke(time, animate = true) {
    if (!(smokeCanvas instanceof HTMLCanvasElement) || !sizeEyeSmoke()) return;
    const context = smokeCanvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, smokeWidth, smokeHeight);
    context.globalCompositeOperation = 'lighter';
    const anchors = eyeAnchors();
    for (const eye of anchors) {
      const pulse = .88 + Math.sin(time * .003 + eye.direction) * .1;
      const radius = (smokeWidth < 420 ? 19 : 25) * pulse;
      const glow = context.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, radius);
      glow.addColorStop(0, 'rgba(255,251,239,.68)');
      glow.addColorStop(.2, 'rgba(225,207,255,.42)');
      glow.addColorStop(.58, 'rgba(155,112,235,.16)');
      glow.addColorStop(1, 'rgba(118,78,205,0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(eye.x, eye.y, radius, 0, Math.PI * 2);
      context.fill();
    }
    for (const particle of smokeParticles) {
      if (animate) {
        particle.age += .0062;
        particle.vx += particle.direction * .0012;
        particle.x += particle.vx;
        particle.y += particle.vy + Math.sin(time * .0025 + particle.phase + particle.age * 5) * .14;
        particle.vy *= .999;
        if (particle.age > 1 || particle.x < -25 || particle.x > smokeWidth + 25) Object.assign(particle, makeSmokeParticle(false));
      }
      const alpha = Math.sin(Math.min(1, particle.age) * Math.PI) * .42;
      const size = particle.size * (1 + particle.age * 1.2);
      context.shadowBlur = 9 + size * 4;
      context.shadowColor = particle.warmth ? 'rgba(255,229,177,.75)' : 'rgba(167,119,255,.9)';
      context.fillStyle = particle.warmth ? `rgba(255,235,197,${alpha * .72})` : `rgba(205,183,255,${alpha})`;
      context.beginPath();
      context.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      context.fill();
      if (particle.size < 1.25) {
        context.strokeStyle = `rgba(228,216,255,${alpha * .5})`;
        context.lineWidth = .45;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 4);
        context.stroke();
      }
    }
    context.shadowBlur = 0;
    context.globalCompositeOperation = 'source-over';
  }

  function eyeSmokeLoop(time) {
    if (!modal.open || modal.classList.contains('is-closing')) {
      smokeFrame = 0;
      return;
    }
    drawEyeSmoke(time, !reducedMotion.matches);
    if (!reducedMotion.matches) smokeFrame = requestAnimationFrame(eyeSmokeLoop);
  }

  function startEyeSmoke() {
    cancelAnimationFrame(smokeFrame);
    smokeFrame = requestAnimationFrame(eyeSmokeLoop);
  }

  function stopEyeSmoke() {
    cancelAnimationFrame(smokeFrame);
    smokeFrame = 0;
  }

  function finishClose() {
    clearTimeout(closeTimer);
    stopEyeSmoke();
    modal.classList.remove('is-closing');
    if (modal.open) modal.close();
    const switching = closeMode === 'switch';
    const shelved = (closeMode === 'shelve' || switching) && !isDeleted();
    reportInbox(shelved, shelved);
    if (shelved && !switching) inbox.focus({ preventScroll: true });
    closing = false;
    if (switching && switchTarget) {
      const target = switchTarget;
      switchTarget = '';
      window.setTimeout(() => window.dispatchEvent(new CustomEvent('vf:cta-open', { detail: { target } })), 80);
    }
  }

  function closeInvitation(mode = 'shelve', target = '') {
    if (closing || !modal.open) return;
    closing = true;
    closeMode = mode;
    switchTarget = target;
    if (mode === 'delete') rememberDeleted();
    else rememberShelved();
    if (reducedMotion.matches) {
      finishClose();
      return;
    }
    modal.classList.add('is-closing');
    closeTimer = window.setTimeout(finishClose, 850);
  }

  function openInvitation() {
    if (isDeleted() || modal.open || closing || document.querySelector('dialog[open]')) return;
    try { modal.showModal(); }
    catch { return; }
    reportInbox(false);
    closeButton?.focus({ preventScroll: true });
    if (portraitImage?.complete) startEyeSmoke();
    else portraitImage?.addEventListener('load', startEyeSmoke, { once: true });
  }

  closeButton?.addEventListener('click', () => closeInvitation('shelve'));
  deleteButton?.addEventListener('click', () => closeInvitation('delete'));
  window.addEventListener('vf:cta-switch-request', event => {
    const { from, to } = event.detail || {};
    if (from === 'beta' && to) closeInvitation('switch', to);
  });
  window.addEventListener('vf:cta-open', event => {
    if (event.detail?.target === 'beta') openInvitation();
  });
  window.addEventListener('vf:cta-state-request', () => reportInbox(!modal.open));
  modal.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeInvitation('shelve');
  });
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeInvitation('shelve');
  });
  action?.addEventListener('click', rememberShelved);

  // The shared carousel controls initial opening; no competing modal timers.
  reportInbox(!isDeleted());
})();
