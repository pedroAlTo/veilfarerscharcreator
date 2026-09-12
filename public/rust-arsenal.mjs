// Progressive artwork inspection and a local, illustrative Heat track.
const dialog = document.querySelector('[data-rust-dialog]');
if (dialog && typeof dialog.showModal === 'function') {
  const image = dialog.querySelector('img');
  document.querySelectorAll('[data-rust-art]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const thumbnail = link.querySelector('img');
      image.src = link.href;
      image.alt = thumbnail.alt;
      dialog.querySelector('h2').textContent = link.dataset.rustArt;
      dialog.querySelector('[data-rust-original]').href = link.href;
      dialog.showModal();
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}

// Rust & Steel 12.06, chapter 2.3; summary table on PDF page 227.
export const HEAT_BANDS = [
  {max:2, name:'Cold', note:'Standard procedures. No active pursuit.'},
  {max:4, name:'Warm', note:'Higher port costs. Your record starts closing doors.'},
  {max:6, name:'Hot', note:'An active investigation. Your name on wanted notices.'},
  {max:8, name:'Burning', note:'An active hunter is following your trail.'},
  {max:9, name:'Inferno', note:'A dedicated task force. Military interdiction.'},
  {max:10, name:'Burned', note:'Maximum response. No ordinary safe harbor.'}
];

const tile = document.querySelector('[data-rust-heat]');
if (tile) {
  const display = tile.querySelector('.rust-heat-display');
  const slider = tile.querySelector('input');
  const segments = [...tile.querySelectorAll('.rust-heat-track i')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false, elapsed = 0, last = 0, frame = 0, automatic = !motion.matches;
  const duration = 11200;

  function paint(value) {
    const level = Math.max(0, Math.min(10, Math.floor(value)));
    const band = HEAT_BANDS.find(b => level <= b.max);
    const warmth = Math.max(0, Math.min(1, (value - 2) / 5));
    const red = Math.max(0, Math.min(1, (value - 6) / 4));
    const cool = [145,181,197], gold = [223,168,81], hot = [244,73,61];
    const rgb = cool.map((v,i) => Math.round((v+(gold[i]-v)*warmth)*(1-red)+hot[i]*red));
    display.style.setProperty('--heat-color', `rgb(${rgb.join(',')})`);
    display.style.setProperty('--heat-glow', red.toFixed(3));
    display.dataset.heatLevel = String(level);
    segments.forEach((segment,i) => segment.style.setProperty('--lit', Math.max(0,Math.min(1,value-i)).toFixed(3)));
    tile.querySelector('[data-heat-number]').textContent = String(level).padStart(2,'0');
    tile.querySelector('[data-heat-band]').textContent = band.name;
    tile.querySelector('[data-heat-note]').textContent = band.note;
    slider.value = String(level);
    slider.setAttribute('aria-valuetext', `${level} of 10, ${band.name}`);
  }

  function tick(time) {
    if (last) elapsed += Math.min(time-last,100);
    last = time;
    paint(Math.min(10,Math.max(0,(elapsed-700)/850)));
    if (elapsed < duration) frame = requestAnimationFrame(tick);
    else { frame = 0; automatic = false; }
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (automatic && visible && !document.hidden && !motion.matches && !dialog?.open) frame = requestAnimationFrame(tick);
  }
  function stopDemo() { automatic = false; sync(); }
  slider.addEventListener('pointerdown', stopDemo);
  slider.addEventListener('keydown', stopDemo);
  slider.addEventListener('input', () => { stopDemo(); paint(Number(slider.value)); });
  tile.querySelector('[data-heat-replay]').addEventListener('click', () => {
    if (motion.matches) return;
    elapsed = 0; automatic = true; paint(0); sync();
  });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold:.25}).observe(display);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => { if (motion.matches) stopDemo(); else sync(); });
  // A modal should not let an obscured demo run to completion behind it.
  if (dialog) new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
  paint(0);
  document.body.classList.add('has-rust-arsenal');
}
