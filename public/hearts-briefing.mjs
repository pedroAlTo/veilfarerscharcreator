import { setupStationStarfield } from './station-starfield.mjs?v=20260912-3';
import { setupStationHUD } from './station-hud.mjs?v=20260911-2';
import { setupStationLights } from './station-lights.mjs?v=20260912-3';
// Small, progressive enhancements. The complete briefing remains readable without JS.
export const SECTORS = Object.freeze(['docking', 'commercial', 'residential', 'engineering', 'research']);

export function selectSector(consoleElement, sector) {
  if (!SECTORS.includes(sector)) return false;
  consoleElement.querySelectorAll('[data-sector-panel]').forEach(panel => {
    panel.hidden = panel.dataset.sectorPanel !== sector;
  });
  consoleElement.querySelectorAll('[data-sector]').forEach(link => {
    if (link.dataset.sector === sector) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  consoleElement.querySelectorAll('[data-map-sector]').forEach(group => {
    group.classList.toggle('is-active', group.dataset.mapSector === sector);
  });
  if (consoleElement.dispatchEvent) consoleElement.dispatchEvent(new CustomEvent("vf:station-sector", { detail: sector }));
  return true;
}

// Match the existing artwork's bright core, including cover cropping on mobile.
export function heartOrigin(width, height, naturalWidth, naturalHeight, positionX = .5, positionY = .5) {
  const scale = Math.max(width / naturalWidth, height / naturalHeight);
  return { x: 482 / 1920 * naturalWidth * scale + (width - naturalWidth * scale) * positionX,
    y: 675 / 1080 * naturalHeight * scale + (height - naturalHeight * scale) * positionY, scale };
}

export function heartPulse(seconds) {
  const phase = ((seconds % 5.4) + 5.4) % 5.4;
  // Two soft beats followed by a long rest. No sharp flashing or full-screen glow.
  return Math.exp(-(((phase - .55) / .3) ** 2)) + .55 * Math.exp(-(((phase - 1.15) / .34) ** 2));
}

function setupStation() {
  const consoleElement = document.querySelector('.hv-station-console');
  if (!consoleElement) return;
  setupStationHUD(consoleElement);
  setupStationLights(consoleElement);
  setupStationStarfield(consoleElement);
  const links = [...consoleElement.querySelectorAll('[data-sector]')];
  const fromHash = () => location.hash.replace('#sector-', '');
  selectSector(consoleElement, SECTORS.includes(fromHash()) ? fromHash() : 'docking');
  consoleElement.classList.add('is-interactive');
  function choose(sector) {
    if (!selectSector(consoleElement, sector)) return;
    // A real fragment remains shareable without jumping the viewport on selection.
    try { history.replaceState(history.state, '', `#sector-${sector}`); } catch { /* Reading still works. */ }
  }
  links.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); choose(link.dataset.sector);
    });
    link.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % links.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + links.length) % links.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = links.length - 1;
      if (event.key === ' ') { event.preventDefault(); choose(link.dataset.sector); return; }
      if (next === undefined) return;
      event.preventDefault(); links[next].focus({ preventScroll: true }); choose(links[next].dataset.sector);
    });
  });
  // The illustrated directory is a second pointer/touch target for the same links.
  consoleElement.querySelectorAll('[data-map-sector]').forEach(group => {
    group.addEventListener('click', () => choose(group.dataset.mapSector));
  });
  window.addEventListener('hashchange', () => {
    if (SECTORS.includes(fromHash())) selectSector(consoleElement, fromHash());
  });
}

function setupHeart() {
  const scene = document.querySelector('.hv-scene');
  const canvas = scene?.querySelector('canvas');
  const art = scene?.querySelector('img');
  if (!canvas || !art) return;
  let context;
  try { context = canvas.getContext('2d', { alpha: true }); } catch { return; }
  if (!context) return; // The original artwork is already visible, with no loading swap.
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, origin = { x: 0, y: 0, scale: 1 };
  let frameId = 0, previous = 0, clock = 0, budget = 0, inView = false;
  let particles = [];
  const stars = Array.from({ length: 54 }, (_, i) => ({
    x: .11 + ((i * .618033989) % .82), y: .08 + ((i * .414213562) % .66), phase: i * 2.4,
    size: i % 6 === 0 ? 1.1 : .55
  }));
  function resize() {
    const box = scene.getBoundingClientRect();
    width = box.width; height = box.height;
    const ratio = Math.min(devicePixelRatio || 1, width < 760 ? 1.25 : 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const position = getComputedStyle(art).objectPosition.split(' ').map(value => parseFloat(value) / 100);
    origin = heartOrigin(width, height, art.naturalWidth || 1920, art.naturalHeight || 1080, position[0], position[1]);
    particles = []; // Re-seed in the new screen space so the plume is visible immediately.
    if (!motion.matches) for (let i = 0; i < (width < 760 ? 65 : 100); i++) emit(true);
  }
  function emit(populate = false) {
    const angle = -.45 - Math.random() * 1.05;
    const speed = (34 + Math.random() * 70) * Math.min(1, origin.scale);
    const spread = 9 * origin.scale;
    particles.push({ x: origin.x + (Math.random() - .5) * spread,
      y: origin.y + (Math.random() - .5) * spread, vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed, age: 0, life: 4.8 + Math.random() * 3.2,
      radius: .65 + Math.random() * 1.2, phase: Math.random() * 6.28 });
    if (populate) {
      const particle = particles.at(-1); particle.age = Math.random() * particle.life * .85;
      particle.x += particle.vx * particle.age; particle.y += particle.vy * particle.age;
    }
  }
  function draw(now) {
    frameId = 0;
    if (!inView || document.hidden || motion.matches) return;
    const delta = previous ? Math.min(.05, (now - previous) / 1000) : 0;
    previous = now; clock += delta;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    const pulse = heartPulse(clock);
    const glowRadius = Math.max(18, 65 * origin.scale);
    const glow = context.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, glowRadius);
    glow.addColorStop(0, `rgba(255,226,171,${.11 + pulse * .26})`);
    glow.addColorStop(.3, `rgba(238,191,122,${pulse * .12})`);
    glow.addColorStop(1, 'rgba(226,183,103,0)');
    context.fillStyle = glow; context.fillRect(origin.x - glowRadius, origin.y - glowRadius, glowRadius * 2, glowRadius * 2);
    budget += delta * (20 + pulse * 56);
    while (budget >= 1) { if (particles.length < (width < 760 ? 120 : 190)) emit(); budget--; }
    particles = particles.filter(particle => particle.age < particle.life);
    particles.forEach(particle => {
      particle.age += delta;
      particle.x += particle.vx * delta; particle.y += particle.vy * delta;
      const fade = Math.max(0, 1 - particle.age / particle.life);
      const alpha = Math.min(1, particle.age * 7) * fade * (.7 + .2 * Math.sin(clock * 2 + particle.phase));
      context.strokeStyle = `rgba(229,204,159,${alpha * .32})`; context.lineWidth = .65;
      context.beginPath(); context.moveTo(particle.x - particle.vx * .07, particle.y - particle.vy * .07); context.lineTo(particle.x, particle.y); context.stroke();
      context.fillStyle = `rgba(255,230,185,${alpha})`;
      context.beginPath(); context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2); context.fill();
    });
    stars.forEach(star => {
      const alpha = .12 + Math.pow((Math.sin(clock * .65 + star.phase) + 1) / 2, 3) * .5;
      context.fillStyle = `rgba(205,221,240,${alpha})`;
      context.beginPath(); context.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2); context.fill();
    });
    context.globalCompositeOperation = 'source-over';
    frameId = requestAnimationFrame(draw);
  }
  function sync() {
    cancelAnimationFrame(frameId); frameId = 0; previous = 0;
    if (motion.matches) { particles = []; budget = 0; context.clearRect(0, 0, width, height); }
    if (inView && !document.hidden && !motion.matches) frameId = requestAnimationFrame(draw);
  }
  resize();
  art.addEventListener('load', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(scene);
  else window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(scene);
  } else { inView = true; sync(); }
  if (motion.addEventListener) motion.addEventListener('change', sync);
  else motion.addListener(sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frameId));
  window.addEventListener('pageshow', sync);
}

if (typeof document !== 'undefined' && document.querySelector('.hearts-briefing')) {
  setupStation();
  setupHeart();
}
