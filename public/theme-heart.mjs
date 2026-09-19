// Sparse anatomical landmarks, projected in 3D. The quiet pulse comes from the playing track.
export function bassEnergy(bins, sampleRate, fftSize) {
  const low = Math.max(1, Math.ceil(30 * fftSize / sampleRate));
  const high = Math.min(bins.length - 1, Math.floor(160 * fftSize / sampleRate));
  let energy = 0;
  for (let i = low; i <= high; i++) energy += (bins[i] / 255) ** 2;
  return high >= low ? Math.sqrt(energy / (high - low + 1)) : 0;
}

export function createParticleHeart(canvas, audio) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { activate() {}, draw() {}, destroy() {} };
  let audioContext, source, analyser, bins, disposed = false;
  let envelope = 0, average = 0, pulse = 0, lastTime = 0, width = 300, height = 178;
  let seed = 97;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  // A single oblique ventricular volume tapers toward an off-centre apex.
  // Sparse atrial and great-vessel landmarks replace the symmetric heart icon.
  // Only about half of these 29 points are visible at any moment; no outline is drawn.
  const landmarks = Array.from({ length: 21 }, (_, i) => {
    const v = .06 + .90 * (i + .5) / 21, angle = i * 2.399963;
    const taper = Math.sin(Math.PI * (.1 + .9 * v));
    return {
      x: -.13 + .42 * v + .43 * taper ** .7 * Math.cos(angle),
      y: -.48 + 1.26 * v,
      z: .28 * taper ** .8 * Math.sin(angle),
    };
  });
  landmarks.push(
    { x: -.37, y: -.39, z: -.03 }, { x: -.39, y: -.58, z: -.08 },
    // Interrupted aortic arch and the forward, lateral pulmonary trunk.
    { x: -.03, y: -.59, z: -.02 }, { x: -.07, y: -.86, z: -.04 },
    { x: .13, y: -.97, z: -.09 }, { x: .30, y: -.81, z: -.15 },
    { x: .10, y: -.52, z: .27 }, { x: .40, y: -.65, z: .19 },
  );
  const points = landmarks.map(p => ({
    ...p, brightness: .65 + random() * .35, size: .65 + random() * .35,
    phase: random() * Math.PI * 2, speed: .45 + random() * .18,
  }));
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || 300; height = rect.height || 178;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas); resize();
  const activate = () => {
    if (disposed || audioContext?.state === 'running') return;
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    try {
      audioContext ||= new AudioEngine();
      // Do not reroute the HTML audio until Web Audio is allowed to run.
      // A blocked automatic resume must never silence native playback.
      audioContext.resume().then(() => {
        if (disposed || audioContext.state !== 'running' || source) return;
        analyser = audioContext.createAnalyser(); analyser.fftSize = 2048; analyser.smoothingTimeConstant = .55;
        bins = new Uint8Array(analyser.frequencyBinCount);
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser); analyser.connect(audioContext.destination);
      }).catch(() => { /* Native playback remains available without a visualizer. */ });
    } catch { /* Web Audio is optional; the music player stays usable. */ }
  };
  const draw = (stamp, reduced = false) => {
    if (disposed) return;
    const dt = lastTime ? Math.min(.1, Math.max(0, (stamp - lastTime) / 1000)) : .033;
    lastTime = stamp;
    const audible = !audio.paused && !audio.ended && !audio.muted && audio.volume > 0;
    if (analyser && audible) analyser.getByteFrequencyData(bins);
    else bins?.fill(0);
    const energy = bins && audible ? bassEnergy(bins, audioContext.sampleRate, analyser.fftSize) : 0;
    average += (energy - average) * (1 - Math.exp(-dt * 2));
    envelope += (energy - envelope) * (1 - Math.exp(-dt * (energy > envelope ? 22 : 7)));
    const attack = Math.max(0, energy - average - .015) * 6;
    pulse = Math.max(attack, pulse * Math.exp(-dt * 5.5));
    const beat = reduced ? 0 : Math.min(1, envelope * .4 + pulse);
    const glow = reduced ? 0 : Math.min(1, pulse);
    const t = reduced ? 0 : audio.currentTime;
    const yaw = .20 + (reduced ? 0 : Math.sin(t * .12) * .07), c = Math.cos(yaw), s = Math.sin(yaw);
    const scale = Math.min(width * .24, height * .41) * (1 + beat * .025);
    ctx.clearRect(0, 0, width, height);
    // No spectral bars, connecting lines, accumulated trails or glow shells.
    // Slow local drift and staggered fades suggest an organ without tracing it.
    const projected = points.map(p => {
      const drift = reduced ? 0 : Math.sin(t * .32 + p.phase) * .018;
      const z = p.z * c - p.x * s, x = p.x * c + p.z * s;
      const perspective = 3.8 / (3.8 - z);
      const presence = Math.max(0, Math.sin(t * p.speed + p.phase));
      return {
        x: width / 2 + (x + drift) * scale * perspective,
        y: height * .53 + (p.y + z * .12 + drift * .6) * scale * perspective,
        z, p, perspective, presence,
      };
    }).filter(point => point.presence > .08).sort((a, b) => a.z - b.z);
    for (const { x, y, z, p, perspective, presence } of projected) {
      const alpha = Math.min(.78, (.19 + (z + .4) * .10 + glow * .58) * p.brightness * presence);
      ctx.fillStyle = z < -.06 ? `rgba(${125 + glow * 55},${160 + glow * 45},${167 + glow * 45},${alpha * .8})` : `rgba(${208 + glow * 47},${181 + glow * 43},${126 + glow * 31},${alpha})`;
      const size = p.size * perspective * (1 + beat * .08);
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
    }
  };
  return { activate, draw, destroy() { disposed = true; resizeObserver.disconnect(); source?.disconnect(); analyser?.disconnect(); audioContext?.close().catch(() => {}); ctx.clearRect(0,0,width,height); } };
}
