import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as naval from '../public/space-combat-model.mjs';

const source = readFileSync(new URL('../public/space-combat.mjs', import.meta.url), 'utf8')
  .replace(/^import .*?;\s*/gm, '')
  .replace(/^export \{[^}]+\};?\s*$/m, '')
  .replace('function announce(message)', 'globalThis.testScene = { state, update }; function announce(message)');
const html = readFileSync(new URL('../public/behind-the-veil/space-combat.html', import.meta.url), 'utf8');

class Element {
  constructor(selector = '', text = '') {
    this.selector = selector;
    this.textContent = text;
    this.children = [];
    this.listeners = new Map();
    this.attributes = new Map();
    this.hidden = false;
    this.isConnected = true;
    this.dataset = {};
    this.style = { setProperty() {} };
    const classes = new Set(selector.startsWith('.') ? [selector.slice(1)] : []);
    this.classList = {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
      toggle(name, force = !classes.has(name)) { if (force) classes.add(name); else classes.delete(name); return force; },
    };
  }
  add(node) { node.parent = this; this.children.push(node); return node; }
  matches(selector) { return this.selector === selector || (selector === '[data-move]' && this.dataset.move); }
  closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector) || null; }
  querySelectorAll(selector) {
    return this.children.flatMap(node => [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name); }
  addEventListener(name, fn) { const list = this.listeners.get(name) || []; list.push(fn); this.listeners.set(name, list); }
  dispatch(name, extra = {}) {
    const event = { target: this, currentTarget: this, preventDefault() {}, ...extra };
    for (const listener of this.listeners.get(name) || []) listener(event);
  }
  focus() { this.ownerDocument.activeElement = this; }
}

function setup({ lang = 'en', reduced = false, bounds = { left: 80, top: 120, width: 480, height: 270 } } = {}) {
  let now = 0;
  let nextId = 0;
  const frames = new Map();
  const timers = new Map();
  const draws = [];
  const strokes = [];
  const diceRolls = [];
  const document = new Element('document');
  document.documentElement = { lang };
  document.body = document.add(new Element('body'));
  document.hidden = false;
  const section = document.body.add(new Element('.space-sim-section'));
  // The pause button belongs to the section heading, outside the cabinet.
  const heading = section.add(new Element('.space-sim-heading'));
  const pause = heading.add(new Element('[data-space-pause]'));
  const cabinet = section.add(new Element('.space-cabinet'));
  const canvas = cabinet.add(new Element('[data-space-canvas]'));
  canvas.width = 960;
  canvas.height = 540;
  canvas.ownerDocument = document;
  canvas.getBoundingClientRect = () => bounds;
  const captured = new Set();
  canvas.setPointerCapture = id => captured.add(id);
  canvas.hasPointerCapture = id => captured.has(id);
  canvas.releasePointerCapture = id => captured.delete(id);
  let position = [0, 0];
  let currentArc = null;
  let path = [];
  const stack = [];
  const context = new Proxy({
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    translate(x, y) { position = [x, y]; },
    drawImage(image) { draws.push({ src: image.src, x: position[0], y: position[1], at: now }); },
    save() { stack.push({ position: [...position], strokeStyle: this.strokeStyle, globalAlpha: this.globalAlpha, lineWidth: this.lineWidth, lineCap: this.lineCap, lineDash: this.lineDash }); },
    restore() { const saved = stack.pop(); if (saved) { position = saved.position; Object.assign(this, saved); } },
    beginPath() { currentArc = null; path = []; },
    moveTo(x, y) { path.push({ x, y }); },
    lineTo(x, y) { path.push({ x, y }); },
    arc(x, y, radius, start, end) { currentArc = { x, y, radius, start, end }; },
    setLineDash(lineDash) { this.lineDash = [...lineDash]; },
    stroke() { if (currentArc || path.length) strokes.push({ ...currentArc, path: [...path], at: now, color: this.strokeStyle, opacity: this.globalAlpha, width: this.lineWidth, cap: this.lineCap, dash: this.lineDash || [] }); },
    globalAlpha: 1,
    lineDash: [],
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  canvas.getContext = () => context;
  for (const selector of ['data-player-hull', 'data-player-heat', 'data-stage-name', 'data-stage-count', 'data-space-log', 'data-space-message', 'data-space-start', 'data-space-fire', 'data-engineer-cool', 'data-engineer-shield', 'data-power-arc']) {
    cabinet.add(new Element(`[${selector}]`));
  }
  cabinet.querySelector('[data-power-arc]').value = 'fore';
  for (const direction of ['up', 'down', 'left', 'right']) {
    const button = cabinet.add(new Element(`[data-move="${direction}"]`));
    button.dataset.move = direction;
  }
  for (const arc of naval.ARCS) {
    const node = cabinet.add(new Element(`[data-arc="${arc}"]`));
    node.add(new Element('span', arc));
    node.add(new Element('[data-arc-value]'));
    node.add(new Element('[data-arc-fill]'));
  }
  const window = new Element('window');
  window.setTimeout = (fn, delay) => { const id = ++nextId; timers.set(id, { fn, at: now + delay }); return id; };
  window.clearTimeout = id => timers.delete(id);
  const math = Object.create(Math);
  math.random = () => 0.5;
  class Sprite { constructor() { this.complete = true; this.naturalWidth = 128; this.naturalHeight = 128; } }
  const runtime = {
    ...naval,
    createDamageDice: () => ({ roll: (side, result) => diceRolls.push({ side, ...result }), reset() {}, setPaused() {} }),
    rollWeaponDamage: (damage, rating) => naval.rollWeaponDamage(damage, rating, () => 0.5),
    document, window, Image: Sprite, Math: math, performance: { now: () => now },
    matchMedia: () => ({ matches: reduced }),
    requestAnimationFrame: fn => { const id = ++nextId; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => frames.delete(id),
  };
  vm.runInNewContext(source, runtime, { filename: 'space-combat.mjs' });
  const read = selector => cabinet.querySelector(`[${selector}]`);
  const count = selector => Number(read(selector).textContent.split('/')[0].trim());
  function advance(ms) {
    const end = now + ms;
    while (now < end) {
      now = Math.min(end, now + 16);
      const queued = [...frames.values()];
      frames.clear();
      queued.forEach(fn => fn(now));
      for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.fn(); }
    }
  }
  return { document, window, cabinet, canvas, pause, read, count, advance, draws, frames, strokes, bounds, diceRolls, scene: runtime.testScene, time: () => now,
    click: selector => read(selector).dispatch('click'),
    shield: arc => Number(cabinet.querySelector(`[data-arc="${arc}"]`).querySelector('[data-arc-value]').textContent.split('/')[0]),
    playerPosition() { return [...draws].reverse().find(draw => draw.src.endsWith('/ship-20.png')); },
    point(x, y, extra = {}) { return { pointerType: 'mouse', pointerId: 1, clientX: bounds.left + x / canvas.width * bounds.width, clientY: bounds.top + y / canvas.height * bounds.height, ...extra }; },
    shieldStrokes() { return strokes.filter(stroke => stroke.at === now && stroke.path.length && stroke.width === 2.4); },
  };
}

test('the real scene initializes with its pause button outside the cabinet and keeps rendering', () => {
  assert.match(html, /class="space-sim-heading"[\s\S]*?data-space-pause[\s\S]*?class="space-cabinet"/);
  const env = setup();
  assert.equal(env.cabinet.querySelector('[data-space-pause]'), null);
  assert.equal(env.read('data-space-start').hidden, false);
  assert.equal(env.read('data-space-message').textContent, 'READY FOR LAUNCH');
  assert.equal(env.frames.size, 1);
  env.advance(1000);
  assert.ok(env.draws.length > 3);
  assert.equal(env.frames.size, 1, 'a new animation frame remains scheduled');
});

test('launch, keyboard movement, firing and cooling work through the rendered controls', () => {
  const env = setup();
  env.advance(300);
  env.click('data-space-start');
  assert.equal(env.document.activeElement, env.canvas);
  assert.equal(env.read('data-space-start').hidden, true);
  assert.equal(env.count('data-player-hull'), naval.SHIP_PROFILES[1].hull);
  env.advance(16);
  const initial = env.playerPosition();
  env.document.dispatch('keydown', { target: env.canvas, key: 'ArrowDown', code: 'ArrowDown' });
  env.advance(180);
  env.document.dispatch('keyup', { target: env.canvas, key: 'ArrowDown', code: 'ArrowDown' });
  env.advance(16);
  assert.ok(env.playerPosition().y > initial.y, 'the ship moves with the focused keyboard control');
  env.click('data-space-fire');
  assert.equal(env.count('data-player-heat'), 1);
  env.advance(300);
  env.click('data-space-fire');
  assert.equal(env.count('data-player-heat'), 2);
  env.click('data-engineer-cool');
  assert.equal(env.count('data-player-heat'), 0);
  env.advance(300);
  env.document.dispatch('keydown', { target: env.canvas, key: ' ', code: 'Space' });
  env.document.dispatch('keyup', { target: env.canvas, key: ' ', code: 'Space' });
  assert.equal(env.count('data-player-heat'), 1, 'even a Space tap shorter than one render frame fires');
});

test('an incoming enemy projectile damages player shields and hull without stopping the loop', () => {
  const env = setup();
  env.click('data-space-start');
  env.advance(9500);
  assert.ok(env.shield('fore') < naval.SHIP_PROFILES[1].arcSlots, 'the arriving missiles depleted the front shield');
  assert.ok(env.count('data-player-hull') < naval.SHIP_PROFILES[1].hull, 'overflow reached the player Hull');
  assert.match(env.read('data-space-log').textContent, /Light Missile.*impact on fore/);
  assert.equal(env.frames.size, 1, 'damage did not throw and terminate requestAnimationFrame');
});

test('pause freezes the encounter, resume continues it, and destroyed ships can restart', () => {
  const env = setup();
  env.click('data-space-start');
  env.advance(5000);
  env.pause.dispatch('click');
  assert.equal(env.cabinet.classList.contains('is-paused'), true);
  const hull = env.count('data-player-hull');
  const shields = naval.ARCS.map(arc => env.shield(arc));
  env.advance(15000);
  assert.equal(env.count('data-player-hull'), hull);
  assert.deepEqual(naval.ARCS.map(arc => env.shield(arc)), shields);
  env.pause.dispatch('click');
  assert.equal(env.cabinet.classList.contains('is-paused'), false);
  env.advance(60000);
  assert.equal(env.count('data-player-hull'), 0);
  assert.equal(env.read('data-space-start').hidden, false);
  assert.match(env.read('data-space-message').textContent, /SHIP LOST/);
  assert.equal(env.frames.size, 1);
  env.click('data-space-start');
  assert.equal(env.count('data-player-hull'), naval.SHIP_PROFILES[1].hull);
  assert.ok(naval.ARCS.every(arc => env.shield(arc) === naval.SHIP_PROFILES[1].arcSlots));
  assert.equal(env.read('data-stage-count').textContent, '01 / 05');
  assert.equal(env.read('data-space-start').hidden, true);
});

test('the Spanish scene remains playable when reduced motion is preferred', () => {
  const env = setup({ lang: 'es', reduced: true });
  assert.equal(env.read('data-space-start').textContent, 'DESPEGAR');
  env.advance(300);
  env.click('data-space-fire');
  env.advance(16);
  assert.equal(env.read('data-space-start').hidden, true);
  assert.equal(env.count('data-player-heat'), 1);
  assert.equal(env.frames.size, 1);
});


test('mouse movement maps CSS coordinates to the logical canvas and clamps the ship to flight bounds', () => {
  const env = setup();
  env.click('data-space-start');
  env.canvas.dispatch('pointermove', env.point(710, 350));
  env.advance(900);
  assert.equal(env.playerPosition().x, 710);
  assert.equal(env.playerPosition().y, 350);
  assert.equal(env.count('data-player-heat'), 0, 'hover steers without firing');
  env.canvas.dispatch('pointermove', env.point(1000, -40));
  env.advance(500);
  assert.equal(env.playerPosition().x, 906);
  assert.equal(env.playerPosition().y, 54);
});

test('touch drag moves and fires while held, then pointerup or pointercancel stops held fire', () => {
  const env = setup();
  env.advance(300);
  const touch = { pointerType: 'touch', pointerId: 7 };
  env.canvas.dispatch('pointerdown', env.point(250, 400, touch));
  assert.equal(env.read('data-space-start').hidden, true, 'touch can launch the ready game');
  assert.equal(env.canvas.hasPointerCapture(7), true);
  env.advance(350);
  assert.equal(env.playerPosition().x, 250);
  assert.equal(env.playerPosition().y, 364, 'ship stays above the finger');
  assert.ok(env.count('data-player-heat') >= 2, 'held touch fires repeatedly');
  env.canvas.dispatch('pointermove', env.point(430, 210, touch));
  env.advance(350);
  assert.equal(env.playerPosition().x, 430);
  assert.equal(env.playerPosition().y, 174);
  env.canvas.dispatch('pointerup', env.point(430, 210, touch));
  assert.equal(env.canvas.hasPointerCapture(7), false);
  const releasedHeat = env.count('data-player-heat');
  env.advance(650);
  assert.equal(env.count('data-player-heat'), releasedHeat);
  env.canvas.dispatch('pointerdown', env.point(320, 340, touch));
  env.advance(350);
  const beforeCancel = env.count('data-player-heat');
  assert.ok(beforeCancel > releasedHeat);
  env.canvas.dispatch('pointercancel', env.point(320, 340, touch));
  env.advance(650);
  assert.equal(env.count('data-player-heat'), beforeCancel);
  assert.equal(env.canvas.hasPointerCapture(7), false);
});

test('shield arcs are uniform continuous strokes and recharge automatically during the same wave', () => {
  const env = setup();
  env.click('data-space-start');
  env.advance(16);
  const full = env.shieldStrokes();
  assert.equal(full.length, 4, 'one continuous stroke per direction');
  for (const arc of full) {
    assert.equal(arc.width, full[0].width);
    assert.equal(arc.cap, 'round');
    assert.ok(arc.path.length >= 4);
    assert.ok(arc.path.every(point => Math.abs(point.x) <= 34 && Math.abs(point.y) <= 34), 'compact outline stays close to the supplied sprite');
    assert.deepEqual(arc.dash, []);
    assert.equal(arc.color, 'rgb(244,251,255)');
  }
  while (env.shield('fore') === naval.SHIP_PROFILES[1].arcSlots && env.time() < 10000) env.advance(16);
  const hitAt = env.time();
  const depleted = env.shield('fore');
  assert.ok(depleted < naval.SHIP_PROFILES[1].arcSlots, 'a real incoming missile hit the front arc');
  env.canvas.dispatch('pointermove', env.point(54, 54));
  const nextRound = Math.ceil(hitAt / 6000) * 6000;
  env.advance(nextRound - hitAt + 32);
  assert.equal(env.shield('fore'), Math.min(naval.SHIP_PROFILES[1].arcSlots, depleted + 2), 'the round restores two slots without an engineering action');
  assert.equal(env.read('data-stage-count').textContent, '01 / 05', 'recharge did not require finishing a wave');
  assert.equal(env.count('data-player-heat'), 0, 'no manual reinforce or weapon action ran');
  const fore = env.strokes.filter(stroke => stroke.width === 2.4 && stroke.path.length && stroke.path.every(point => point.x > 0));
  assert.ok(fore.some(stroke => stroke.at > hitAt && stroke.color !== 'rgb(244,251,255)'), 'a weakened shield interpolates away from white');
  const beforeRecharge = fore.filter(stroke => stroke.at < nextRound).at(-1);
  env.advance(400);
  const afterRecharge = env.shieldStrokes().find(stroke => stroke.path.every(point => point.x > 0));
  assert.ok(afterRecharge, 'the recharging front arc is visible');
  assert.notEqual(afterRecharge.color, beforeRecharge.color, 'recovery changes its strength colour again');
});

test('a fully depleted shield fades away while the other three continuous arcs remain visible', () => {
  const env = setup();
  env.click('data-space-start');
  let disappeared = false;
  let sawFading = false;
  while (env.time() < 11000) {
    env.advance(32);
    const arcs = env.shieldStrokes();
    const front = arcs.find(arc => arc.path.every(point => point.x > 0));
    if (front && front.opacity < .5) sawFading = true;
    if (env.shield('fore') === 0 && arcs.length === 3 && !front) { disappeared = true; break; }
  }
  assert.ok(sawFading, 'loss of strength fades the shield before removal');
  assert.ok(disappeared, 'zero-strength front arc stops rendering without removing the other arcs');
  assert.ok(env.count('data-player-hull') > 0, 'the missing shield is not caused by the player dying');
  assert.equal(env.frames.size, 1);
});

test('actual contact damages only the impacted shield, including fast shots and moving ships', () => {
  for (const [arc, dx, dy] of [['fore', 1, 0], ['aft', -1, 0], ['port', 0, -1], ['starboard', 0, 1]]) {
    const env = setup(); env.click('data-space-start');
    const { state, update } = env.scene;
    state.enemies = [];
    state.hostileShots = [{ x: state.playerX + dx * 90, y: state.playerY + dy * 90, vx: -dx * 12000, vy: -dy * 12000, profile: naval.SHIP_PROFILES[0], arc: 'fore' }];
    update(.016, 16);
    for (const side of naval.ARCS) assert.equal(env.shield(side), side === arc ? 0 : 6, `${arc} hit must leave ${side} correct`);
    assert.equal(state.hostileShots.length, 0, 'the swept crossing is consumed once');
    assert.equal(env.diceRolls[0].side, 'keeper');
    assert.deepEqual(Array.from(env.diceRolls[0].values), [4, 4, 4]);
    assert.ok(state.damageLabels.some(label => /SHIELD/.test(label.text)));
    assert.ok(state.damageLabels.some(label => /HULL/.test(label.text)));
  }
  const env = setup(); env.click('data-space-start');
  const { state, update } = env.scene;
  state.enemies = []; state.pointerTarget = { x: state.playerX, y: state.playerY + 90 };
  state.hostileShots = [{ x: state.playerX, y: state.playerY + 50, vx: 0, vy: 0, profile: naval.SHIP_PROFILES[0] }];
  update(.04, 40);
  assert.equal(env.shield('starboard'), 0, 'moving down into a projectile hits the lower shield');
  assert.equal(env.shield('fore'), 6);
});

test('hotkeys and shield buttons reinforce their own arc without spending Heat when unavailable', () => {
  for (const [index, arc] of naval.ARCS.entries()) {
    const env = setup(); env.click('data-space-start');
    env.scene.state.player.shields[arc] = 1;
    env.document.dispatch('keydown', { target: env.canvas, key: String(index + 1), code: `Digit${index + 1}` });
    assert.equal(env.shield(arc), 3); assert.equal(env.count('data-player-heat'), 2);
    env.document.dispatch('keydown', { target: env.canvas, key: String(index + 1), code: `Digit${index + 1}`, repeat: true });
    assert.equal(env.count('data-player-heat'), 2);
    env.cabinet.querySelector(`[data-arc="${arc}"]`).dispatch('click');
    assert.equal(env.shield(arc), 5); assert.equal(env.count('data-player-heat'), 4);
    env.document.dispatch('keydown', { target: env.canvas, key: String(index + 1), code: `Numpad${index + 1}` });
    assert.equal(env.shield(arc), 6); assert.equal(env.count('data-player-heat'), 6);
    env.cabinet.querySelector(`[data-arc="${arc}"]`).dispatch('click');
    assert.equal(env.count('data-player-heat'), 6, 'full shield does not spend Heat');
    env.scene.state.player.shields[arc] = 1;
    env.pause.dispatch('click');
    env.cabinet.querySelector(`[data-arc="${arc}"]`).dispatch('click');
    assert.equal(env.scene.state.player.shields[arc], 1, 'paused scene cannot reinforce');
  }
});

test('a player hit sends its actual rolled dice and Mount Rating to the player window', () => {
  const env = setup(); env.click('data-space-start');
  const { state, update } = env.scene;
  const enemy = state.enemies[0];
  enemy.x = enemy.homeX; enemy.lastShot = 1e8;
  state.shots = [{ x: enemy.x - 1, y: enemy.y, speed: 0 }];
  update(.016, 16);
  const result = env.diceRolls[0];
  assert.equal(result.side, 'player');
  assert.deepEqual(Array.from(result.values), [5, 5]);
  assert.equal(result.roll, 11); assert.equal(result.damage, 22);
  assert.equal(result.mountRating, 2); assert.equal(result.faces, 8);
});
