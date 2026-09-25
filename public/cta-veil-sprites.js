(() => {
  const scene = document.querySelector('[data-veil-sprites]');
  const modal = scene?.closest('dialog');
  if (!(scene instanceof HTMLElement) || !(modal instanceof HTMLDialogElement)) return;

  const base = '/assets/behind-the-veil/overkill/';
  const tracks = [
    { name: 'hero', image: scene.querySelector('[data-veil-sprite="hero"]'), frames: Array.from({ length: 4 }, (_, i) => `${base}hero/Hero2-Idle_0${i + 1}.png`), pace: 230 },
    { name: 'robot', image: scene.querySelector('[data-veil-sprite="robot"]'), frames: Array.from({ length: 4 }, (_, i) => `${base}robot-a/RobotA_Idle_0${i + 1}.png`), pace: 260 },
    { name: 'boss', image: scene.querySelector('[data-veil-sprite="boss"]'), frames: Array.from({ length: 5 }, (_, i) => `${base}boss/Boss_Idle_0${i + 1}.png`), pace: 310 },
    { name: 'drone', image: scene.querySelector('[data-veil-sprite="drone"]'), frames: Array.from({ length: 8 }, (_, i) => `${base}recovery-drone/DronePod-Movement_${i + 1}.png`), pace: 150 }
  ].filter(track => track.image instanceof HTMLImageElement);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer = 0;
  let started = 0;
  let cached = false;
  const cache = [];

  function firstFrame() {
    for (const track of tracks) {
      track.image.src = track.frames[0];
      track.index = 0;
    }
  }
  function preload() {
    if (cached) return;
    cached = true;
    for (const track of tracks) {
      for (const url of track.frames.slice(1)) {
        const frame = new Image();
        frame.decoding = 'async';
        frame.src = url;
        cache.push(frame);
      }
    }
  }
  function draw() {
    const elapsed = performance.now() - started;
    for (const track of tracks) {
      const index = Math.floor(elapsed / track.pace) % track.frames.length;
      if (track.index === index) continue;
      track.image.src = track.frames[index];
      track.index = index;
    }
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = 0;
    delete scene.dataset.animated;
  }
  function sync() {
    const shouldPlay = modal.open && !document.hidden && !reducedMotion.matches;
    if (!shouldPlay) {
      stop();
      if (reducedMotion.matches) firstFrame();
      return;
    }
    if (timer) return;
    preload();
    firstFrame();
    started = performance.now();
    scene.dataset.animated = 'true';
    timer = window.setInterval(draw, 70);
  }

  new MutationObserver(sync).observe(modal, { attributes: true, attributeFilter: ['open'] });
  modal.addEventListener('close', stop);
  document.addEventListener('visibilitychange', sync);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', sync);
  else reducedMotion.addListener(sync);
  window.addEventListener('pagehide', stop);
  sync();
})();