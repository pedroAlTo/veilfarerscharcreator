// Fictional station telemetry: environmental readings only, with no story reveals.
export const HUD_SECTORS = Object.freeze({
  docking: { name: 'A / Docking ring', box: [180, 118, 490, 310], values: [20.4, 21.6, 3, 67.2, 58.4, 98.6] },
  commercial: { name: 'B / Commercial', box: [786, 82, 670, 377], values: [20.6, 18.8, 2, 65.3, 61.8, 99.1] },
  residential: { name: 'C / Residential', box: [25, 432, 633, 490], values: [20.7, 23.1, 3, 71.6, 64.2, 100.3] },
  engineering: { name: 'D / Engineering', box: [794, 523, 424, 373], values: [20.1, 17.4, 2, 62.8, 46.5, 97.8] },
  research: { name: 'E / Research access', box: [604, 10, 295, 936], values: [20.3, 19.2, 2, 66.1, 52.7, 98.9] },
});

export function stationReadings(sector, time = 0) {
  if (!Object.hasOwn(HUD_SECTORS, sector)) return null;
  const profile = HUD_SECTORS[sector];
  if (!profile) return null;
  return profile.values.map((value, index) => index === 2 ? value :
    +(value + Math.sin(time * .19 + index * 2) * (index === 0 ? .05 : .24)).toFixed(1));
}

export function setupStationHUD(element) {
  const hud = element.querySelector('[data-station-hud]');
  const art = element.querySelector('.hv-station-art');
  const target = element.querySelector('[data-hud-target]');
  const name = element.querySelector('[data-station-name]');
  if (!hud || !art || !target || !name) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fullName = "CHARON'S REFUGE";
  const fields = [...hud.querySelectorAll('[data-hud-value]')];
  const bars = [...hud.querySelectorAll('[data-hud-meter]')];
  const stream = [...hud.querySelectorAll('[data-hud-stream]')];
  let sector = 'docking', visible = false, imageReady = art.querySelector('img').complete;
  let clock = 0, previous = 0, frame = 0, lastSample = -2, lastPacket = -1, sequence = 0, titleFinished = false;

  function paintReadings() {
    const values = stationReadings(sector, clock);
    fields.forEach((field, i) => { field.textContent = i === 2 ? `${values[i]}/6` : values[i].toFixed(1); });
    bars.forEach((bar, i) => { bar.style.setProperty('--level', `${i === 2 ? values[i] / 6 * 100 : i === 0 ? values[i] / 21 * 100 : i === 5 ? values[i] / 105 * 100 : values[i]}%`); });
  }
  function paintPacket() {
    sequence++;
    const channels = ['ATM', 'PWR', 'COM', 'LSS', 'H2O', 'PRS'];
    stream.forEach((line, i) => {
      const word = () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0').toUpperCase();
      line.textContent = `${channels[(sequence + i) % 6]} / ${String(sequence * 4 + i).padStart(6, '0')}   ${word()} ${word()} ${word()}   RX ${String(12 + Math.floor(Math.random() * 29)).padStart(2, '0')}.0 ms`;
    });
  }
  function choose(id) {
    if (!Object.hasOwn(HUD_SECTORS, id)) return;
    sector = id;
    const profile = HUD_SECTORS[id];
    const [x, y, w, h] = profile.box;
    target.style.left = `${x / 1536 * 100}%`; target.style.top = `${y / 1024 * 100}%`;
    target.style.width = `${w / 1536 * 100}%`; target.style.height = `${h / 1024 * 100}%`;
    element.querySelectorAll('[data-hud-sector-name]').forEach(label => { label.textContent = profile.name; });
    hud.dataset.telemetrySector = id;
    paintReadings(); paintPacket();
  }
  function title() {
    if (titleFinished) return;
    const count = motion.matches ? fullName.length : Math.floor(Math.max(0, clock - .25) / .12);
    name.textContent = fullName.slice(0, count);
    if (count >= fullName.length) { titleFinished = true; name.dataset.typed = 'true'; }
  }
  function tick(now) {
    frame = 0;
    if (!visible || !imageReady || document.hidden || motion.matches) return;
    if (previous) clock += Math.min((now - previous) / 1000, .1);
    previous = now;
    title();
    if (clock - lastSample >= 1.2) { paintReadings(); lastSample = clock; }
    if (clock - lastPacket >= .085) { paintPacket(); lastPacket = clock; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    const active = visible && imageReady && !document.hidden;
    element.classList.toggle('hv-hud-paused', !active);
    if (motion.matches) { title(); paintReadings(); }
    if (active && !motion.matches) frame = requestAnimationFrame(tick);
  }
  if (!motion.matches) name.textContent = '';
  element.classList.add('has-station-hud');
  element.addEventListener('vf:station-sector', event => choose(event.detail));
  art.querySelector('img').addEventListener('load', () => { imageReady = true; sync(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .15 }).observe(art);
  else visible = true;
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener('pageshow', sync);
  choose(sector); sync();
}
