// A projected 3D point cloud. The spectrum and pulse come from the playing track.
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
  const points = Array.from({ length: 1150 }, () => {
    const t = random() * Math.PI * 2, phi = Math.acos(2 * random() - 1);
    const shell = Math.sin(phi), depth = Math.cos(phi);
    return {
      x: 16 * Math.sin(t) ** 3 / 18 * shell,
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t) - 2) / 18 * shell,
      z: depth * .39 * (.8 + .2 * Math.sin(t) ** 2),
      brightness: .35 + random() * .65, size: .35 + random() * .65, band: Math.floor(random() * 35),
    };
  });
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
    const attack = Math.max(0, energy - average) * 2.8;
    pulse = Math.max(attack, pulse * Math.exp(-dt * 7));
    const beat = reduced ? 0 : Math.min(1, envelope * .4 + pulse);
    const t = reduced ? 0 : audio.currentTime;
    const yaw = .25 + (reduced ? 0 : Math.sin(t * .28) * .16), c = Math.cos(yaw), s = Math.sin(yaw);
    const scale = Math.min(width * .30, height * .43) * (1 + beat * .13);
    ctx.clearRect(0, 0, width, height);
    // A low, wide spectral bed anchors the heart just above the dock.
    const bands = 36, span = Math.min(220, width - 36), start = (width - span) / 2;
    for (let i = 0; i < bands; i++) {
      const hz = 45 * (8000 / 45) ** (i / (bands - 1));
      const index = analyser ? Math.min(bins.length - 1, Math.round(hz * analyser.fftSize / audioContext.sampleRate)) : 0;
      const amplitude = reduced ? .12 : (bins?.[index] || 0) / 255;
      ctx.fillStyle = `rgba(209,169,93,${.13 + amplitude * .3})`;
      ctx.fillRect(start + i * span / bands, height - 5 - amplitude * 12, 2, 1 + amplitude * 12);
    }
    // Depth sorting and perspective retain volume as the surface gently turns.
    const projected = points.map(p => {
      const z = p.z * c - p.x * s, x = p.x * c + p.z * s;
      const perspective = 3.8 / (3.8 - z);
      const local = !reduced && bins ? (bins[p.band + 1] || 0) / 255 : 0;
      const expansion = 1 + local * beat * .025;
      return { x:width / 2 + x * scale * perspective * expansion, y:height * .45 + (p.y + z * .12) * scale * perspective * expansion, z, p, perspective };
    }).sort((a,b) => a.z - b.z);
    for (const point of projected) {
      const {x,y,z,p,perspective} = point;
      const alpha = Math.min(.85, (.14 + (z + .5) * .37 + beat * .18) * p.brightness);
      ctx.fillStyle = z < -.07 ? `rgba(108,165,173,${alpha * .7})` : `rgba(240,200,126,${alpha})`;
      const size = p.size * perspective * (1 + beat * .35);
      ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fill();
      if (p.brightness > .96 && z > .05) {
        ctx.fillStyle = `rgba(246,209,142,${alpha * .12})`;
        ctx.beginPath();ctx.arc(x,y,size*3.8,0,Math.PI*2);ctx.fill();
      }
    }
  };
  return { activate, draw, destroy() { disposed = true; resizeObserver.disconnect(); source?.disconnect(); analyser?.disconnect(); audioContext?.close().catch(() => {}); ctx.clearRect(0,0,width,height); } };
}
