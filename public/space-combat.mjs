import { ARCS, SHIP_PROFILES, PLAYER_SHIELD_PATHS, createShipState, findShieldImpact, regenerateArcs, resolveNavalHit, rollWeaponDamage } from './space-combat-model.mjs?v=20261007-2';
import { createDamageDice } from './space-combat-dice.mjs?v=20261007-2';

const canvas = document.querySelector('[data-space-canvas]');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const root = canvas.closest('.space-cabinet');
  const page = document.documentElement.lang === 'es' ? 'es' : 'en';
  const text = page === 'es' ? {
    ready: 'LISTOS PARA DESPEGAR', launch: 'DESPEGAR', next: 'OLEADA SIGUIENTE', win: '¡BUEN VUELO, TRIPULACIÓN!', lost: 'INTEGRIDAD AGOTADA // NAVE PERDIDA', fire: 'DISPARAR CÁÑÓN DE PULSO',
    wave: 'OLEADA', hull: 'Integridad del casco', shields: 'Escudos', hit: 'impacto en', damaged: 'Hull dañado', destroyed: 'Nave neutralizada', regen: 'La ronda termina: 2 Armor Slots recuperados por arco.', heat: 'Heat', overheat: '¡Heat sobre el Cap! Los sistemas han sufrido daños.', cooling: 'Sistemas enfriados: −3 Heat.', reinforced: 'Energía redirigida al arco seleccionado.', warning: 'Arco agotado: el impacto llega al Hull.', pause: 'Reanudar animaciones', paused: 'Pausar animaciones', restart: 'Jugar otra vez', medal: 'MEDALLA DE LA TRIPULACIÓN',
  } : {
    ready: 'READY FOR LAUNCH', launch: 'LAUNCH', next: 'NEXT WAVE', win: 'GOOD FLIGHT, CREW!', lost: 'HULL DEPLETED // SHIP LOST', fire: 'FIRE PULSE CANNON',
    wave: 'WAVE', hull: 'Hull integrity', shields: 'Shields', hit: 'impact on', damaged: 'Hull damaged', destroyed: 'Vessel disabled', regen: 'Round ends: 2 Armor Slots restored per arc.', heat: 'Heat', overheat: 'Heat is over Cap! Ship systems have taken damage.', cooling: 'Systems cooled: −3 Heat.', reinforced: 'Power rerouted to the selected arc.', warning: 'Arc depleted: the hit reached Hull.', pause: 'Resume animations', paused: 'Pause animations', restart: 'Play again', medal: 'CREW COMMENDATION',
  };
  const profileForWave = [SHIP_PROFILES[0], SHIP_PROFILES[1], SHIP_PROFILES[2], SHIP_PROFILES[3], SHIP_PROFILES[4]];
  const shipAssets = '/assets/behind-the-veil/space-combat/ships/';
  const ships = [2, 4, 7, 10, 13, 16, 18, 20].map((id) => {
    const image = new Image();
    image.src = `${shipAssets}ship-${String(id).padStart(2, '0')}.png`;
    return image;
  });
  const pulseSprite = new Image();
  pulseSprite.src = '/assets/behind-the-veil/overkill/weapons/laser-bullet-tight.png';
  const missileSprite = new Image();
  missileSprite.src = '/assets/behind-the-veil/overkill/fx/Homing-Missile_1.png';
  const stars = Array.from({ length: 90 }, () => ({ x: Math.random() * 960, y: Math.random() * 540, size: Math.random() < .84 ? 1 : 2, speed: 12 + Math.random() * 54, alpha: .2 + Math.random() * .75 }));
  const keys = new Set();
  const input = { up: false, down: false, left: false, right: false, fire: false };
  const playerProfile = SHIP_PROFILES[1]; // Tier 2 Corvette, MR ×2: permits a listed Light weapon.
  const state = { mode: 'ready', wave: 0, player: createShipState(playerProfile), systems: { drive: 3, weapons: 3, shields: 3 }, enemies: [], shots: [], hostileShots: [], bursts: [], playerX: 118, playerY: 270, lastShot: 0, fireHeld: false, lastFrame: 0, pause: false, log: '', frame: 0, waveFired: false };
  const $ = (selector) => root.querySelector(selector);
  state.displayShields = { ...state.player.shields };
  state.roundElapsed = 0;
  state.roundFired = false;
  state.pointerTarget = null;
  state.pointerHeld = false;
  const arcs = Object.fromEntries(ARCS.map((arc) => [arc, $(`[data-arc="${arc}"]`)]));
  const pauseButton = canvas.closest('.space-sim-section').querySelector('[data-space-pause]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const damageDice = createDamageDice($('[data-space-dice]'), { lang: page });
  state.damageLabels = [];

  function announce(message) {
    state.log = message;
    const log = $('[data-space-log]');
    if (log) log.textContent = message;
  }
  function setMessage(message) {
    const box = $('[data-space-message]');
    if (box) box.textContent = message;
  }
  function profileName(profile) {
    const names = page === 'es'
      ? ['Caza ligero', 'Corbeta', 'Fragata', 'Crucero pesado', 'Dreadnought · Boss']
      : ['Light fighter', 'Corvette', 'Frigate', 'Heavy Cruiser', 'Dreadnought · Boss'];
    return names[profileForWave.indexOf(profile)];
  }
  function stageSizes(wave) { return [56, 82, 114, 168, 240][wave]; }
  function resetShip() {
    state.pause = false;
    root.classList.remove('is-paused');
    document.body.classList.remove('space-motion-paused');
    if (pauseButton) pauseButton.textContent = text.paused;
    state.player = createShipState(playerProfile);
    state.displayShields = { ...state.player.shields };
    state.roundElapsed = 0;
    state.roundFired = false;
    state.pointerTarget = null;
    state.pointerHeld = false;
    state.systems = { drive: 3, weapons: 3, shields: 3 };
    state.wave = 0;
    state.playerX = 118;
    state.playerY = 270;
    state.shots = [];
    state.hostileShots = [];
    state.bursts = [];
    state.damageLabels = [];
    damageDice.reset();
    state.mode = 'playing';
    state.log = '';
    spawnWave();
    setMessage('');
    updateHud();
  }
  function spawnWave() {
    const profile = profileForWave[state.wave];
    state.waveStartedFrame = state.frame;
    const count = state.wave === 4 ? 1 : state.wave < 2 ? 4 : state.wave === 2 ? 3 : 2;
    const size = stageSizes(state.wave);
    state.enemies = Array.from({ length: count }, (_, index) => {
      const ship = createShipState(profile);
      const sprite = ships[(state.wave * 2 + index) % ships.length];
      return {
        profile, ship, image: sprite,
        x: 984 + index * 92, y: (540 / (count + 1)) * (index + 1),
        homeX: 790 + (index % 2) * 78, w: size * (count === 1 ? 1.12 : 1), h: size * (count === 1 ? 1.12 : 1),
        phase: Math.random() * Math.PI * 2, lastShot: performance.now() + 600 + index * 480, hp: profile.hull,
      };
    });
    const countNode = $('[data-stage-count]');
    if (countNode) countNode.textContent = `0${state.wave + 1} / 05`;
    const nameNode = $('[data-stage-name]');
    if (nameNode) nameNode.textContent = profileName(profile);
    state.shots = [];
    state.hostileShots = [];
    state.bursts = [];
    announce(`${text.wave} ${state.wave + 1}: ${profileName(profile)} · MR ×${profile.mountRating} · ${profile.weapon} ${profile.damage[0]}d${profile.damage[1]}${profile.damage[2] ? `+${profile.damage[2]}` : ''}.`);
    if (!reduced) setMessage('');
    updateHud();
  }
  function updateHud() {
    const hull = $('[data-player-hull]');
    const heat = $('[data-player-heat]');
    if (hull) hull.textContent = `${state.player.hull} / ${playerProfile.hull}`;
    if (heat) heat.textContent = `${state.player.heat} / ${playerProfile.heatCap}`;
    for (const arc of ARCS) {
      const current = state.player.shields[arc];
      const node = arcs[arc];
      if (!node) continue;
      node.querySelector('[data-arc-value]').textContent = `${current} / ${playerProfile.arcSlots}`;
      node.querySelector('[data-arc-fill]').style.setProperty('--slots', current / playerProfile.arcSlots);
      const reinforceLabel = node.dataset.reinforceLabel || node.querySelector('span').textContent;
      node.setAttribute('aria-label', `${reinforceLabel}: ${current} / ${playerProfile.arcSlots}`);
      node.setAttribute('aria-disabled', String(state.mode !== 'playing' || state.pause || state.systems.shields === 0 || current >= playerProfile.arcSlots));
      node.classList.toggle('is-depleted', current === 0);
    }
    root.classList.toggle('is-overheated', state.player.heat > playerProfile.heatCap);
    root.classList.toggle('has-breach', Object.values(state.systems).some((integrity) => integrity === 0));
  }
  function addHeat(amount) {
    const wasBelowCap = state.player.heat <= playerProfile.heatCap;
    state.player.heat = Math.max(0, state.player.heat + amount);
    if (wasBelowCap && state.player.heat > playerProfile.heatCap) {
      for (const system of Object.keys(state.systems)) state.systems[system] = Math.max(0, state.systems[system] - 1);
      announce(text.overheat);
      if (Object.values(state.systems).every((integrity) => integrity === 0)) finish(false);
    }
  }
  function attackHit(target, arc, incomingProfile, contact) {
    const rolled = rollWeaponDamage(incomingProfile.damage, incomingProfile.mountRating);
    const result = resolveNavalHit(target === state.player ? target : target.ship, rolled.damage, arc);
    const onPlayer = target === state.player;
    damageDice.roll(onPlayer ? 'keeper' : 'player', { ...rolled, faces: incomingProfile.damage[1], modifier: incomingProfile.damage[2], mountRating: incomingProfile.mountRating, weapon: incomingProfile.weapon });
    const x = contact?.x ?? (onPlayer ? state.playerX : target.x);
    const y = contact?.y ?? (onPlayer ? state.playerY : target.y);
    const labels = [];
    if (result.shieldLoss) labels.push({ text: `−${result.shieldLoss} ${page === 'es' ? 'ESCUDO' : 'SHIELD'}`, color: '#87e8ff' });
    if (result.hullLoss) labels.push({ text: `−${result.hullLoss} ${page === 'es' ? 'CASCO' : 'HULL'}`, color: '#ffad7b' });
    for (const [index, label] of labels.entries()) state.damageLabels.push({ ...label, x, y, row: index, age: 0 });
    const attackName = `${incomingProfile.weapon} ${incomingProfile.damage[0]}d${incomingProfile.damage[1]}${incomingProfile.damage[2] ? `+${incomingProfile.damage[2]}` : ''} × MR ${incomingProfile.mountRating} = ${rolled.roll} × ${incomingProfile.mountRating} = ${rolled.damage}`;
    updateHud();
    if (target === state.player) {
      announce(`${attackName} · ${text.hit} ${arc}. ${text.shields}: −${result.shieldLoss}${result.hullLoss ? ` · ${text.damaged}: −${result.hullLoss}` : ''}.`);
      if (result.destroyed) finish(false);
    } else {
      announce(`${attackName} · ${text.hit} ${arc}. ${text.shields}: −${result.shieldLoss}${result.hullLoss ? ` · ${text.damaged}: −${result.hullLoss}` : ''}.`);
      if (result.destroyed) {
        state.bursts.push({ x: target.x, y: target.y, started: performance.now(), color: '#ffbc72' });
        announce(`${profileName(target.profile)} · ${text.destroyed}. ${attackName}`);
        state.enemies = state.enemies.filter((enemy) => enemy !== target);
        if (!state.enemies.length) completeWave();
      }
    }
  }
  function completeWave() {
    updateHud();
    if (state.wave >= 4) { finish(true); return; }
    state.mode = 'intermission';
    announce(`${text.destroyed}. ${text.next}`);
    setMessage(text.next);
    state.nextWaveIn = 1.65;
  }
  function finish(won) {
    state.mode = won ? 'won' : 'lost';
    state.shots = [];
    state.hostileShots = [];
    if (!won) state.bursts.push({ x: state.playerX, y: state.playerY, started: performance.now(), color: '#ffbc72' });
    setMessage(won ? text.win : text.lost);
    const button = $('[data-space-start]');
    button.hidden = false;
    button.textContent = text.restart;
    button.classList.add('is-restart');
    if (won) root.classList.add('is-victory');
  }
  function launch() {
    if (state.mode === 'won' || state.mode === 'lost' || state.mode === 'ready') {
      root.classList.remove('is-victory');
      const button = $('[data-space-start]');
      button.hidden = true;
      button.classList.remove('is-restart');
      resetShip();
      canvas.focus({ preventScroll: true });
    }
  }
  function drawShip(image, x, y, width, height, turn = 0, glow = '#66e8ff') {
    if (!image?.complete || !image.naturalWidth) return;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(turn);
    ctx.shadowColor = glow;
    ctx.shadowBlur = 0;
    ctx.imageSmoothingEnabled = false;
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const w = Math.round(image.naturalWidth * scale), h = Math.round(image.naturalHeight * scale);
    ctx.drawImage(image, -Math.round(w / 2), -Math.round(h / 2), w, h);
    ctx.restore();
  }
  function fire() {
    if (state.mode !== 'playing' || state.pause || state.systems.weapons === 0 || performance.now() - state.lastShot < 260) return;
    state.lastShot = performance.now();
    state.roundFired = true;
    state.shots.push({ x: state.playerX + 36, y: state.playerY, speed: 630, size: 14 });
    addHeat(1);
    updateHud();
  }
  function enemyFire(enemy, now) {
    const interval = Math.max(690, 1560 - state.wave * 130);
    if (now - enemy.lastShot < interval || enemy.x < 0 || enemy.x > 960) return;
    enemy.lastShot = now;
    const boss = enemy.profile.id === 'dreadnought';
    const speed = boss ? 165 : 210 + state.wave * 13;
    const shotX = enemy.x + (state.playerX >= enemy.x ? 1 : -1) * enemy.w * .34;
    const dx = state.playerX - shotX, dy = state.playerY - enemy.y;
    const distance = Math.hypot(dx, dy) || 1;
    const vx = dx / distance * speed, vy = dy / distance * speed;
    state.hostileShots.push({ x: shotX, y: enemy.y, vx, vy, size: boss ? 12 : 7, profile: enemy.profile });
    if (enemy.profile.tags.includes('Energy')) state.hostileShots.push({ x: shotX, y: enemy.y + enemy.h * .2, vx: vx * .85, vy: vy * .85, size: 6, profile: enemy.profile });
  }
  function drawBackground(dt) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 540);
    gradient.addColorStop(0, '#101d30'); gradient.addColorStop(.56, '#071521'); gradient.addColorStop(1, '#031018');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 960, 540);
    ctx.strokeStyle = 'rgba(80, 169, 204, .08)'; ctx.lineWidth = 1;
    for (let x = 0; x < 960; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 540); ctx.stroke(); }
    for (let y = 0; y < 540; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke(); }
    for (const star of stars) {
      if (state.mode === 'playing' && !state.pause && !reduced) star.x -= star.speed * dt;
      if (star.x < 0) { star.x = 960; star.y = Math.random() * 540; }
      ctx.fillStyle = `rgba(181,232,255,${star.alpha})`; ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }
  function shieldColor(strength) {
    const colours = [[255, 100, 100], [255, 225, 107], [174, 131, 255], [89, 183, 255], [244, 251, 255]];
    const value = Math.max(0, Math.min(1, strength)) * (colours.length - 1);
    const from = Math.floor(value), to = Math.min(colours.length - 1, from + 1), mix = value - from;
    return `rgb(${colours[from].map((channel, i) => Math.round(channel + (colours[to][i] - channel) * mix)).join(',')})`;
  }
  function drawSlotArc(dt) {
    ctx.save();
    ctx.translate(state.playerX, state.playerY);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [arc, path] of Object.entries(PLAYER_SHIELD_PATHS)) {
      const target = state.player.shields[arc];
      if (!state.pause) state.displayShields[arc] += (target - state.displayShields[arc]) * Math.min(1, dt * 7);
      if (Math.abs(state.displayShields[arc] - target) < .02) state.displayShields[arc] = target;
      const strength = state.displayShields[arc] / playerProfile.arcSlots;
      if (strength <= 0) continue;
      ctx.globalAlpha = Math.min(.88, strength * 6);
      ctx.strokeStyle = shieldColor(strength);
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 4;
      // The same sprite-fitted outline is used by collision detection.
      ctx.beginPath();
      const start = path[0], next = path[1], end = path.at(-1), beforeEnd = path.at(-2);
      const startLength = Math.hypot(next.x - start.x, next.y - start.y);
      const endLength = Math.hypot(end.x - beforeEnd.x, end.y - beforeEnd.y);
      ctx.moveTo(start.x + (next.x - start.x) / startLength, start.y + (next.y - start.y) / startLength);
      for (const point of path.slice(1, -1)) ctx.lineTo(point.x, point.y);
      ctx.lineTo(end.x - (end.x - beforeEnd.x) / endLength, end.y - (end.y - beforeEnd.y) / endLength);
      ctx.stroke();
    }
    ctx.restore();
  }
  function update(dt, now) {
    if (state.pause) return;
    for (const label of state.damageLabels) label.age += dt;
    state.damageLabels = state.damageLabels.filter(label => label.age < 1.3);
    if (state.mode === 'playing' || state.mode === 'intermission') {
      // Six seconds represent one round in this arcade illustration.
      state.roundElapsed += dt;
      if (state.roundElapsed >= 6) {
        state.roundElapsed -= 6;
        regenerateArcs(state.player.shields, playerProfile.arcSlots);
        if (!state.roundFired) state.player.heat = Math.max(0, state.player.heat - 1);
        state.roundFired = false;
        announce(text.regen);
        updateHud();
      }
    }
    if (state.mode === 'intermission') {
      state.nextWaveIn -= dt;
      if (state.nextWaveIn <= 0) { state.wave += 1; state.mode = 'playing'; spawnWave(); }
      return;
    }
    if (state.mode !== 'playing') return;
    const previousPlayer = { x: state.playerX, y: state.playerY };
    const speed = state.systems.drive === 0 ? 145 : 250;
    let mx = Number(input.right || keys.has('ArrowRight') || keys.has('d')) - Number(input.left || keys.has('ArrowLeft') || keys.has('a'));
    let my = Number(input.down || keys.has('ArrowDown') || keys.has('s')) - Number(input.up || keys.has('ArrowUp') || keys.has('w'));
    const length = Math.hypot(mx, my) || 1; mx /= length; my /= length;
    if (state.pointerTarget && !mx && !my) {
      const dx = state.pointerTarget.x - state.playerX, dy = state.pointerTarget.y - state.playerY;
      const distance = Math.hypot(dx, dy);
      const step = Math.min(distance, (state.systems.drive === 0 ? 250 : 900) * dt);
      if (distance) { state.playerX += dx / distance * step; state.playerY += dy / distance * step; }
    } else {
      state.playerX += mx * speed * dt;
      state.playerY += my * speed * dt;
    }
    state.playerX = Math.max(54, Math.min(906, state.playerX));
    state.playerY = Math.max(54, Math.min(486, state.playerY));
    if (input.fire || keys.has('Space') || state.pointerHeld) fire();
    for (const enemy of state.enemies) {
      enemy.x = Math.max(enemy.homeX, enemy.x - (enemy.profile.id === 'dreadnought' ? 34 : 72) * dt);
      enemy.y += Math.sin(now / (enemy.profile.id === 'dreadnought' ? 1350 : 760) + enemy.phase) * (enemy.profile.id === 'dreadnought' ? 22 : 58) * dt;
      enemy.y = Math.max(enemy.h / 2 + 20, Math.min(540 - enemy.h / 2 - 20, enemy.y));
      enemyFire(enemy, now);
    }
    for (const shot of state.shots) shot.x += shot.speed * dt;
    for (const shot of state.hostileShots) { shot.previousX = shot.x; shot.previousY = shot.y; shot.x += shot.vx * dt; shot.y += shot.vy * dt; }
    state.shots = state.shots.filter((shot) => shot.x < 992);
    for (let index = state.shots.length - 1; index >= 0; index -= 1) {
      const shot = state.shots[index];
      const enemy = state.enemies.find((candidate) => shot.x > candidate.x - candidate.w * .36 && shot.x < candidate.x + candidate.w * .36 && shot.y > candidate.y - candidate.h * .36 && shot.y < candidate.y + candidate.h * .36);
      if (enemy) {
        state.shots.splice(index, 1);
        attackHit(enemy, 'fore', playerProfile);
        if (state.mode !== 'playing') return;
      }
    }
    for (let index = state.hostileShots.length - 1; index >= 0; index -= 1) {
      const shot = state.hostileShots[index];
      const impact = findShieldImpact(
        { x: shot.previousX - previousPlayer.x, y: shot.previousY - previousPlayer.y },
        { x: shot.x - state.playerX, y: shot.y - state.playerY },
      );
      if (impact) {
        state.hostileShots.splice(index, 1);
        attackHit(state.player, impact.arc, shot.profile, { x: previousPlayer.x + (state.playerX - previousPlayer.x) * impact.t + impact.x, y: previousPlayer.y + (state.playerY - previousPlayer.y) * impact.t + impact.y });
        if (state.mode !== 'playing') return;
      }
    }
    state.hostileShots = state.hostileShots.filter((shot) => shot.x > -32 && shot.x < 992 && shot.y > -32 && shot.y < 572);
  }
  function render(dt, now) {
    drawBackground(dt);
    ctx.save();
    for (const enemy of state.enemies) {
      const size = stageSizes(state.wave);
      drawShip(enemy.image, enemy.x, enemy.y, enemy.w, enemy.h, (state.playerX >= enemy.x ? 1 : -1) * Math.PI / 2, '#ff9b59');
      ctx.fillStyle = 'rgba(4,11,18,.8)'; ctx.fillRect(enemy.x - size * .72, enemy.y - enemy.h * .62, size * 1.44, 5);
      ctx.fillStyle = '#ed8351'; ctx.fillRect(enemy.x - size * .72, enemy.y - enemy.h * .62, Math.max(0, (size * 1.44) * enemy.ship.hull / enemy.profile.hull), 5);
    }
    for (const shot of state.shots) {
      drawShip(pulseSprite, shot.x, shot.y, 36, 12);
    }
    for (const shot of state.hostileShots) {
      const guided = shot.profile.tags.includes('Guided');
      drawShip(guided ? missileSprite : pulseSprite, shot.x, shot.y, guided ? shot.size * 4 : 34, guided ? 18 : 12, Math.atan2(shot.vy, shot.vx));
    }
    state.bursts = state.bursts.filter((burst) => now - burst.started < 580);
    for (const burst of state.bursts) {
      const progress = (now - burst.started) / 580;
      ctx.save(); ctx.globalAlpha = 1 - progress; ctx.strokeStyle = burst.color; ctx.lineWidth = 3 + progress * 4; ctx.shadowColor = burst.color; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(burst.x, burst.y, 10 + progress * 72, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#fff0bd'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(burst.x, burst.y, 4 + progress * 32, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    if (state.mode !== 'ready' && state.mode !== 'lost') {
      drawSlotArc(dt);
      drawShip(ships[7], state.playerX, state.playerY, 60, 60, Math.PI / 2, '#65e7ff');
      if (state.mode === 'playing' && performance.now() - state.lastShot < 85) {
        ctx.fillStyle = '#ffb35f'; ctx.shadowColor = '#ff784d'; ctx.shadowBlur = 18; ctx.fillRect(state.playerX + 30, state.playerY - 3, 12, 6);
      }
    } else if (state.mode === 'ready') {
      drawShip(ships[7], 118, 270, 60, 60, Math.PI / 2, '#65e7ff');
      drawShip(ships[0], 770, 154, 38, 38, -Math.PI / 2, '#ff9b59');
      drawShip(ships[3], 818, 374, 49, 49, -Math.PI / 2, '#ff9b59');
    }
    const damageFont = 15 * Math.max(1, Math.min(2, 960 / (canvas.clientWidth || 960)));
    ctx.font = `bold ${damageFont}px monospace`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    for (const label of state.damageLabels) {
      ctx.globalAlpha = Math.min(1, (1.3 - label.age) * 2);
      const x = Math.max(65, Math.min(895, label.x));
      const y = Math.max(damageFont, label.y - 22 - label.row * (damageFont + 3) - label.age * 26);
      ctx.strokeStyle = '#031018'; ctx.strokeText(label.text, x, y);
      ctx.fillStyle = label.color; ctx.fillText(label.text, x, y);
    }
    ctx.restore();
    if (!state.pause) update(dt, now);
  }
  function loop(now) {
    if (!canvas.isConnected) return;
    const elapsed = Math.min(.045, (now - state.lastFrame) / 1000 || 0);
    state.lastFrame = now;
    state.frame += 1;
    render(elapsed, now);
    requestAnimationFrame(loop);
  }
  function bindHold(button, action) {
    const press = (event) => { event.preventDefault(); state.pointerTarget = null; canvas.focus({ preventScroll: true }); action(true); };
    const release = () => action(false);
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointerleave', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  }
  function reinforce(arc) {
    if (!ARCS.includes(arc) || state.mode !== 'playing' || state.pause || state.systems.shields === 0 || state.player.shields[arc] >= playerProfile.arcSlots) return;
    $('[data-power-arc]').value = arc;
    state.player.shields[arc] = Math.min(playerProfile.arcSlots, state.player.shields[arc] + 2);
    addHeat(2);
    announce(`${text.reinforced} ${arcs[arc].querySelector('span').textContent}.`);
    updateHud();
    canvas.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', (event) => {
    const reinforcementKey = /^(?:Digit|Numpad)([1-4])$/.exec(event.code);
    const inGame = event.target === canvas || event.target.closest?.('.space-cabinet') === root;
    const editingControl = ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName);
    if (reinforcementKey && inGame && !editingControl && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (!event.repeat) reinforce(ARCS[Number(reinforcementKey[1]) - 1]);
      return;
    }
    if (event.target !== canvas) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    keys.add(event.code === 'Space' ? 'Space' : event.key.length === 1 ? event.key.toLowerCase() : event.key);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) state.pointerTarget = null;
    if (event.code === 'Space') {
      if (state.mode === 'ready') launch();
      fire();
    }
  });
  document.addEventListener('keyup', (event) => keys.delete(event.code === 'Space' ? 'Space' : event.key.length === 1 ? event.key.toLowerCase() : event.key));
  function clearInput() {
    keys.clear();
    for (const key of Object.keys(input)) input[key] = false;
    state.pointerHeld = false;
    state.pointerTarget = null;
    state.activePointer = null;
  }
  window.addEventListener('blur', clearInput);
  function pointShip(event) {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    state.pointerTarget = {
      x: Math.max(54, Math.min(906, (event.clientX - bounds.left) / bounds.width * canvas.width)),
      y: Math.max(54, Math.min(486, (event.clientY - bounds.top) / bounds.height * canvas.height - (event.pointerType === 'touch' ? 36 : 0))),
    };
  }
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    if (state.mode !== 'playing') launch();
    if (state.pause) return;
    canvas.focus({ preventScroll: true });
    state.activePointer = event.pointerId;
    state.pointerHeld = true;
    canvas.setPointerCapture?.(event.pointerId);
    pointShip(event);
    fire();
  });
  canvas.addEventListener('pointermove', event => {
    if (state.mode !== 'playing' || state.pause) return;
    if (event.pointerType !== 'mouse' && event.pointerId !== state.activePointer) return;
    pointShip(event);
    if (state.pointerHeld) event.preventDefault();
  });
  const releasePointer = event => {
    if (event.pointerId !== state.activePointer) return;
    state.pointerHeld = false;
    state.activePointer = null;
    if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', event => { releasePointer(event); state.pointerTarget = null; });
  canvas.addEventListener('lostpointercapture', releasePointer);
  canvas.addEventListener('pointerleave', () => { if (!state.pointerHeld) state.pointerTarget = null; });
  canvas.addEventListener('contextmenu', event => event.preventDefault());
  for (const button of root.querySelectorAll('[data-move]')) bindHold(button, (on) => { input[button.dataset.move] = on; });
  const fireButton = $('[data-space-fire]');
  fireButton.addEventListener('pointerdown', (event) => { event.preventDefault(); if (state.mode === 'ready') launch(); canvas.focus({ preventScroll: true }); input.fire = true; });
  fireButton.addEventListener('click', () => { if (state.mode === 'ready') launch(); canvas.focus({ preventScroll: true }); fire(); });
  for (const type of ['pointerup', 'pointerleave', 'pointercancel']) fireButton.addEventListener(type, () => { input.fire = false; });
  $('[data-space-start]').addEventListener('click', launch);
  $('[data-engineer-cool]').addEventListener('click', () => {
    if (state.mode !== 'playing' || state.pause) return;
    state.player.heat = Math.max(0, state.player.heat - 3);
    announce(text.cooling); updateHud(); canvas.focus({ preventScroll: true });
  });
  for (const arc of ARCS) arcs[arc].addEventListener('click', () => reinforce(arc));
  $('[data-engineer-shield]').addEventListener('click', () => reinforce($('[data-power-arc]').value));
  pauseButton?.addEventListener('click', (event) => {
    state.pause = !state.pause;
    event.currentTarget.textContent = state.pause ? text.pause : text.paused;
    root.classList.toggle('is-paused', state.pause);
    document.body.classList.toggle('space-motion-paused', state.pause);
    damageDice.setPaused(state.pause);
    clearInput();
    updateHud();
    if (!state.pause) canvas.focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearInput(); });
  if (reduced) root.classList.add('prefers-reduced');
  const launchButton = $('[data-space-start]');
  launchButton.textContent = text.launch;
  launchButton.hidden = false;
  setMessage(text.ready);
  drawShip(ships[7], 118, 270, 60, 60, Math.PI / 2, '#65e7ff');
  requestAnimationFrame(loop);
}

export { SHIP_PROFILES };
