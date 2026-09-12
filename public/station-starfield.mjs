// Short, isolated glints; time is accumulated only while the canvas is visible.
export function starGlint(seconds, phase, period) {
  const t = ((seconds + phase) % period + period) % period;
  return t < 1.35 ? Math.sin(Math.PI * t / 1.35) ** 4 : 0;
}
// A short blue discharge on selection, then once per 67 visible active seconds.
export function engineeringSpark(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  const t = seconds % 67;
  if (t >= .7) return 0;
  const pulse = t < .09 ? 1 : t < .16 ? .12 : t < .32 ? .9 : t < .39 ? .18 : .65;
  return (1 - t / .7) ** 1.4 * pulse;
}

// Sample the dark background with a padded hull mask; stars stay outside the station.
export function setupStationStarfield(element) {
  const canvas = element.querySelector('[data-station-stars]');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!context) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, previous = 0, time = 0, visible = false;
  let engineeringActive = false, engineeringTime = 0;
  element.addEventListener('vf:station-sector', event => {
    engineeringActive = event.detail === 'engineering';
    if (engineeringActive) engineeringTime = 0;
    paint();
  });
  const artwork = element.querySelector('.hv-station-art > img');
  let background = null;
  const maskWidth = 384, maskHeight = 256;
  function buildBackgroundMask() {
    const sample = document.createElement('canvas');
    sample.width = maskWidth; sample.height = maskHeight;
    const sampler = sample.getContext('2d', { willReadFrequently: true });
    if (!sampler || !artwork?.naturalWidth) return;
    sampler.drawImage(artwork, 0, 0, maskWidth, maskHeight);
    const pixels = sampler.getImageData(0, 0, maskWidth, maskHeight).data;
    background = new Uint8Array(maskWidth * maskHeight).fill(1);
    // Twelve source pixels of clearance protect dark panes and fine antennas.
    for (let y = 0; y < maskHeight; y++) for (let x = 0; x < maskWidth; x++) {
      const i = (y * maskWidth + x) * 4;
      if (pixels[i] + pixels[i + 1] + pixels[i + 2] < 62) continue;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const px = x + dx, py = y + dy;
        if (px >= 0 && px < maskWidth && py >= 0 && py < maskHeight) background[py * maskWidth + px] = 0;
      }
    }
    paint();
  }
  let seed = 8731;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const stars = Array.from({ length: 240 }, (_, index) => ({
    glints: index % 19 === 0, glintPhase: random() * 43, glintPeriod: 28 + random() * 35,
    x: random(), y: random(), radius: .35 + random() ** 3 * 1.05,
    brightness: .2 + random() * .6, phase: random() * Math.PI * 2,
    speed: .08 + random() * .14, depth: .25 + random() * .75,
    color: random() < .17 ? '219,194,145' : random() < .3 ? '155,188,225' : '215,227,241'
  }));
  function paint() {
    context.clearRect(0, 0, width, height);
    if (!background || !width || !height) return;
    for (const star of stars) {
      const x = ((star.x * width + time * star.speed * star.depth) % (width + 4)) - 2;
      const y = star.y * height + Math.sin(time * .015 + star.phase) * 1.5;
      const mx = Math.max(0, Math.min(maskWidth - 1, Math.floor(x / width * maskWidth)));
      const my = Math.max(0, Math.min(maskHeight - 1, Math.floor(y / height * maskHeight)));
      if (!background[my * maskWidth + mx]) continue;
      const glint = !motion.matches && star.glints ? starGlint(time, star.glintPhase, star.glintPeriod) : 0;
      const alpha = Math.min(1, glint * .55 + star.brightness * (motion.matches ? .8 : .72 + .22 * Math.sin(time * .6 + star.phase)));
      context.fillStyle = `rgba(${star.color},${alpha.toFixed(3)})`;
      context.beginPath(); context.arc(x, y, star.radius, 0, Math.PI * 2); context.fill();
      if (glint > .01) {
        const reach = 1.5 + glint * 3;
        context.strokeStyle = `rgba(${star.color},${glint * .65})`; context.lineWidth = .65;
        context.beginPath();context.moveTo(x-reach,y);context.lineTo(x+reach,y);
        context.moveTo(x,y-reach);context.lineTo(x,y+reach);context.stroke();
      }
      if (star.radius > 1.2) {
        const glow = context.createRadialGradient(x, y, 0, x, y, 5);
        glow.addColorStop(0, `rgba(${star.color},${alpha * .22})`); glow.addColorStop(1, `rgba(${star.color},0)`);
        context.fillStyle = glow; context.fillRect(x - 5, y - 5, 10, 10);
      }
    }
    paintSpark();
  }
  function paintSpark() {
    if (!engineeringActive || motion.matches) return;
    const intensity = engineeringSpark(engineeringTime);
    if (!intensity) return;
    // Source-art coordinates: the upper array's small hinge on the connecting truss.
    const x = 1215 / 1536 * width, y = 709 / 1024 * height;
    // Preserve a readable spark on narrow screens while keeping it at the same hinge.
    const scale = Math.max(width / 1536, .45);
    context.save();context.translate(x,y);context.scale(scale,scale);
    context.globalCompositeOperation='lighter';
    const glow = context.createRadialGradient(0,0,0,0,0,16);
    glow.addColorStop(0,`rgba(118,209,255,${intensity*.95})`);
    glow.addColorStop(.22,`rgba(56,155,255,${intensity*.65})`);
    glow.addColorStop(1,'rgba(35,105,255,0)');
    context.fillStyle=glow;context.fillRect(-16,-16,32,32);
    context.strokeStyle=`rgba(199,240,255,${intensity})`;context.lineWidth=1.4;
    context.shadowColor='#5fbdff';context.shadowBlur=4;
    context.beginPath();context.moveTo(-5,3);context.lineTo(-1,-2);context.lineTo(1.5,1);context.lineTo(5.5,-4);
    context.moveTo(-1,-2);context.lineTo(-3,-5);context.stroke();
    context.fillStyle=`rgba(236,250,255,${intensity})`;
    context.beginPath();context.arc(0,0,1.4,0,Math.PI*2);context.fill();
    context.restore();
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || motion.matches) return;
    if (previous) {
      const delta = Math.min((now - previous) / 1000, .1);
      time += delta;if (engineeringActive) engineeringTime += delta;
    }
    previous = now; paint(); frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0; paint();
    if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0); paint();
  }
  new ResizeObserver(resize).observe(canvas);
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(canvas);
  else { visible = true; sync(); }
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
  window.addEventListener('pageshow', sync);
  if (artwork?.complete) buildBackgroundMask();
  else artwork?.addEventListener('load', buildBackgroundMask, { once: true });
  resize();
}
