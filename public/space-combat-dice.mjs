const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const sub = (a, b) => a.map((value, i) => value - b[i]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = a => { const length = Math.hypot(...a); return a.map(value => value / length); };
const centre = points => [0, 1, 2].map(axis => points.reduce((sum, point) => sum + point[axis], 0) / points.length);

function hull(vertices) {
  const faces = new Map();
  for (let i = 0; i < vertices.length - 2; i++) for (let j = i + 1; j < vertices.length - 1; j++) for (let k = j + 1; k < vertices.length; k++) {
    const raw = cross(sub(vertices[j], vertices[i]), sub(vertices[k], vertices[i]));
    if (Math.hypot(...raw) < 1e-7) continue;
    let normal = unit(raw), distance = dot(normal, vertices[i]);
    const sides = vertices.map(vertex => dot(normal, vertex) - distance);
    if (sides.some(side => side > 1e-6) && sides.some(side => side < -1e-6)) continue;
    if (distance < 0) { normal = normal.map(value => -value); distance = -distance; }
    const indices = vertices.map((vertex, index) => Math.abs(dot(normal, vertex) - distance) < 1e-6 ? index : -1).filter(index => index >= 0);
    const key = indices.join(',');
    if (faces.has(key)) continue;
    const mid = centre(indices.map(index => vertices[index]));
    const axis = unit(sub(vertices[indices[0]], mid)), other = cross(normal, axis);
    indices.sort((a, b) => Math.atan2(dot(sub(vertices[a], mid), other), dot(sub(vertices[a], mid), axis)) - Math.atan2(dot(sub(vertices[b], mid), other), dot(sub(vertices[b], mid), axis)));
    faces.set(key, { indices, normal, distance });
  }
  return [...faces.values()];
}

const meshes = new Map();
export function diceMesh(sides) {
  if (meshes.has(sides)) return meshes.get(sides);
  let vertices = [];
  if (sides === 6) {
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) vertices.push([x, y, z]);
  } else if (sides === 8) {
    vertices = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  } else if (sides === 10) {
    const antiprism = Array.from({ length: 10 }, (_, i) => [Math.cos(i * Math.PI / 5), Math.sin(i * Math.PI / 5), i % 2 ? .6 : -.6]);
    vertices = hull(antiprism).map(face => face.normal.map(value => value / face.distance));
  } else {
    const phi = (1 + Math.sqrt(5)) / 2;
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) vertices.push([x, y, z]);
    for (const a of [-1, 1]) for (const b of [-1, 1]) vertices.push([0, a / phi, b * phi], [a / phi, b * phi, 0], [a * phi, 0, b / phi]);
  }
  const max = Math.max(...vertices.map(vertex => Math.hypot(...vertex)));
  vertices = vertices.map(vertex => vertex.map(value => value / max));
  const mesh = { vertices, faces: hull(vertices).map(face => face.indices) };
  meshes.set(sides, mesh);
  return mesh;
}

function rotate([x, y, z], a, b, c) {
  [y, z] = [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
  [x, z] = [x * Math.cos(b) + z * Math.sin(b), -x * Math.sin(b) + z * Math.cos(b)];
  return [x * Math.cos(c) - y * Math.sin(c), x * Math.sin(c) + y * Math.cos(c), z];
}

export function createDamageDice(container, { lang = 'en' } = {}) {
  if (!container) return { roll() {}, reset() {}, setPaused() {} };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panels = {};
  let request = 0, paused = false, last = 0;
  for (const side of ['player', 'keeper']) {
    const panel = document.createElement('section');
    panel.className = `space-dice-panel is-${side}`;
    panel.setAttribute('aria-label', `${side === 'player' ? (lang === 'es' ? 'Jugador' : 'Player') : 'Keeper'}: ${lang === 'es' ? 'dados de daño' : 'damage dice'}`);
    const heading = document.createElement('div'); heading.className = 'space-dice-heading';
    const name = document.createElement('b'); name.textContent = side === 'player' ? (lang === 'es' ? 'JUGADOR' : 'PLAYER') : 'KEEPER';
    const expression = document.createElement('span'); expression.textContent = '—';
    heading.append(name, expression);
    const canvas = document.createElement('canvas'); canvas.width = 420; canvas.height = 64; canvas.setAttribute('aria-hidden', 'true');
    const total = document.createElement('div'); total.className = 'space-dice-total'; total.textContent = '—';
    panel.append(heading, canvas, total); container.append(panel);
    panels[side] = { panel, canvas, ctx: canvas.getContext('2d'), expression, total, result: null, age: 1 };
  }
  function draw(panel, side) {
    const { ctx, canvas, result } = panel;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!result) return;
    const mesh = diceMesh(result.faces);
    const progress = Math.min(1, panel.age / .65), spin = reduced ? 0 : (1 - progress) ** 3 * 8;
    const gap = Math.min(60, 380 / result.values.length);
    result.values.forEach((value, index) => {
      const points = mesh.vertices.map(vertex => rotate(vertex, .35 + spin, .45 + spin * .8, .08 + (index % 2) * .2 + spin * .6));
      const cx = 210 + (index - (result.values.length - 1) / 2) * gap, cy = 31;
      const projected = points.map(([x, y, z]) => [cx + x * 25 * 4 / (4 - z), cy + y * 25 * 4 / (4 - z)]);
      const faces = mesh.faces.map(indices => ({ indices, mid: centre(indices.map(i => points[i])) })).sort((a, b) => a.mid[2] - b.mid[2]);
      for (const face of faces) {
        const light = Math.round(22 + (face.mid[2] + 1) * 21);
        ctx.fillStyle = `hsl(${side === 'player' ? 190 : 27} 55% ${light}%)`;
        ctx.strokeStyle = side === 'player' ? '#b6f4ff' : '#ffdbb8'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        face.indices.forEach((vertex, i) => { const [x, y] = projected[vertex]; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // The settled front face always carries the actual outcome used for damage.
      const front = faces.at(-1), mid = centre(front.indices.map(i => points[i]));
      const x = cx + mid[0] * 25 * 4 / (4 - mid[2]), y = cy + mid[1] * 25 * 4 / (4 - mid[2]);
      ctx.font = 'bold 19px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#071521'; ctx.lineWidth = 3; ctx.strokeText(String(value), x, y);
      ctx.fillStyle = '#fff'; ctx.fillText(String(value), x, y);
    });
  }
  function frame(now) {
    request = 0;
    if (paused) return;
    const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
    let moving = false;
    for (const [side, panel] of Object.entries(panels)) {
      if (panel.age < .65) { panel.age += dt; draw(panel, side); moving ||= panel.age < .65; }
    }
    if (moving) request = requestAnimationFrame(frame);
  }
  function animate() { if (!paused && !request) { last = 0; request = requestAnimationFrame(frame); } }
  return {
    roll(side, result) {
      const panel = panels[side]; if (!panel) return;
      panel.result = { ...result, values: [...result.values] }; panel.age = reduced ? 1 : 0;
      panel.expression.textContent = `${result.values.length}d${result.faces}${result.modifier ? `+${result.modifier}` : ''}`;
      panel.total.textContent = `${result.roll} × MR ${result.mountRating} = ${result.damage}`;
      panel.panel.title = `${result.weapon}: (${result.values.join('+')}${result.modifier ? `+${result.modifier}` : ''}) × ${result.mountRating} = ${result.damage}`;
      draw(panel, side); animate();
    },
    reset() {
      if (request) cancelAnimationFrame(request); request = 0; paused = false;
      for (const [side, panel] of Object.entries(panels)) { panel.result = null; panel.age = 1; panel.expression.textContent = '—'; panel.total.textContent = '—'; draw(panel, side); }
    },
    setPaused(value) { paused = value; if (paused && request) { cancelAnimationFrame(request); request = 0; } else if (!paused) animate(); },
  };
}
