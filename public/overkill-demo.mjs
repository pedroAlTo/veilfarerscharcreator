// Personal-scale thresholds from Corebook 12.06 pp. 94–95.
// Tactical Armor spends one slot to prevent one HP from a connected hit.
export const ARMOR_PROFILE = Object.freeze({ name: 'Tactical Armor', baseMajor: 10, baseSevere: 20, level: 2, slots: 5 });
export const DEMO_MAX_HP = 6;

export function resolveOverkill(damage, { major = ARMOR_PROFILE.baseMajor + ARMOR_PROFILE.level, severe = ARMOR_PROFILE.baseSevere + ARMOR_PROFILE.level, deadly = false, armorSlots = 0 } = {}) {
  const step = deadly ? 5 : 10;
  const extra = Math.max(0, Math.floor((damage - severe) / step));
  const rawHP = damage <= 0 ? 0 : damage < major ? 1 : damage < severe ? 2 : 3 + extra;
  const spent = Number.isFinite(armorSlots) ? Math.max(0, Math.min(ARMOR_PROFILE.slots, Math.floor(armorSlots))) : 0;
  const hp = Math.max(0, rawHP - spent);
  const tier = ['No damage', 'Minor', 'Major', 'Severe'][rawHP] || 'Overkill';
  return { rawHP, hp, tier, extra, spent, next: damage < major ? major : damage < severe ? severe : severe + (extra + 1) * step };
}

export function applyCombatHit({ hp, armorRemaining }, damage, { deadly = false, armorSlots = 0 } = {}) {
  const available = Math.max(0, Math.min(ARMOR_PROFILE.slots, Math.floor(armorRemaining)));
  const selected = Number.isFinite(armorSlots) ? Math.max(0, Math.min(available, Math.floor(armorSlots))) : 0;
  const result = resolveOverkill(damage, { deadly, armorSlots: selected });
  const hpBefore = Math.max(0, Math.min(DEMO_MAX_HP, Math.floor(hp)));
  const lost = Math.min(hpBefore, result.hp);
  return { ...result, hpBefore, hpAfter: hpBefore - lost, lost, armorRemaining: available - selected };
}

export const ENCOUNTERS = Object.freeze([
  { name: 'Scrap Scout', count: 1, sides: 6, bonus: 2, sprite: 'robot-a', frames: 4, weapon: 'blaster', bullet: 'laser-bullet-2.png' },
  { name: 'Signal Drone', count: 2, sides: 6, bonus: 3, sprite: 'robot-b', frames: 4, weapon: 'pulse', bullet: 'green-bullet.png' },
  { name: 'Assault Unit', count: 3, sides: 8, bonus: 4, sprite: 'robot-c', frames: 4, weapon: 'rifle', bullet: 'pink-bullet.png' },
  { name: 'Heavy Droid', count: 6, sides: 8, bonus: 5, sprite: 'robot-heavy', frames: 4, weapon: 'pulse', bullet: 'pink-bullet.png' },
  { name: 'Titan Walker', count: 10, sides: 8, bonus: 5, sprite: 'boss', frames: 5, missile: true },
]);

export function rollDamage(encounter, rng = Math.random) {
  const rolls = Array.from({ length: encounter.count }, () => 1 + Math.floor(Math.min(0.999999999, Math.max(0, rng())) * encounter.sides));
  return { rolls, damage: rolls.reduce((sum, die) => sum + die, encounter.bonus) };
}

const ASSET = '/assets/behind-the-veil/overkill';
const pad = value => String(value).padStart(2, '0');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const weaponFrames = {
  blaster: ['laser-blaster-0.png', 'laser-blaster-2.png', 'laser-blaster-3.png'],
  pulse: ['pulse-rifle-1.png', 'pulse-rifle-2.png', 'pulse-rifle-3.png'],
  rifle: ['rifle-idle.png', 'rifle-shoot-1.png', 'rifle-shoot-2.png'],
};
const heartArt = '<svg viewBox="0 0 16 15" shape-rendering="crispEdges" aria-hidden="true"><path class="heart-border" d="M2 1h4v1h2v2h1V2h2V1h4v1h1v6h-1v2h-2v2h-2v2H6v-2H4v-2H2V8H1V2h1z"/><path class="heart-fill" d="M2 3h1V2h3v1h2v2h1V3h2V2h3v1h1v5h-1v2h-2v2h-2v1H7v-1H5v-2H3V8H2z"/></svg>';

if (typeof document !== 'undefined') {
  const lab = document.querySelector('[data-overkill-lab]');
  if (lab) {
    const arena = lab.querySelector('[data-arena]');
    const soldier = lab.querySelector('[data-soldier-sprite]');
    const enemySprite = lab.querySelector('[data-enemy-sprite]');
    const weapon = lab.querySelector('[data-enemy-weapon]');
    const projectile = lab.querySelector('[data-projectile]');
    const projectileImage = lab.querySelector('[data-projectile-image]');
    const impact = lab.querySelector('[data-impact]');
    const muzzle = lab.querySelector('[data-muzzle]');
    const energy = lab.querySelector('[data-energy]');
    const recoveryDrone = lab.querySelector('[data-recovery-drone]');
    const combatant = soldier.closest('.arena-soldier');
    const floating = lab.querySelector('[data-floating-damage]');
    const attack = lab.querySelector('[data-attack]');
    const modeInputs = [...lab.querySelectorAll('input[name="pixel-overkill-mode"]')];
    const shields = [...lab.querySelectorAll('[data-shield]')];
    const choices = [...lab.querySelectorAll('[data-enemy]')];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let active = 0;
    let frame = 0;
    let busy = false;
    let dead = false;
    let hp = DEMO_MAX_HP;
    let armorRemaining = ARMOR_PROFILE.slots;
    let heroType = 2;
    const heroFolder = type => type === 2 ? 'hero' : type === 3 ? 'hero-alt' : `hero-${type}`;
    const heroPath = (type, state, index) => `${ASSET}/${heroFolder(type)}/Hero${type}-${state}_${type === 1 ? index : pad(index)}.png`;
    const nextHero = () => { const lineup = [2, 3, 4, 5, 6, 1]; return lineup[(lineup.indexOf(heroType) + 1) % lineup.length]; };
    const setStage = value => { arena.dataset.recoveryStage = value; };

    const enemyPath = (enemy, index) => {
      if (enemy.sprite === 'boss') return `${ASSET}/boss/Boss_Idle_${pad(index)}.png`;
      if (enemy.sprite === 'robot-heavy') return `${ASSET}/robot-heavy/RobotC2-Idle_${pad(index)}.png`;
      const letter = enemy.sprite.at(-1).toUpperCase();
      return `${ASSET}/${enemy.sprite}/Robot${letter}_Idle_${pad(index)}.png`;
    };
    const selectedShields = () => shields.filter(button => button.getAttribute('aria-pressed') === 'true');
    const deadly = () => modeInputs.find(input => input.checked)?.value === 'deadly';
    const showFrame = () => {
      frame += 1;
      if (!dead) {
        const idleFrame = (frame % 4) + 1;
        soldier.src = heroPath(heroType, 'Idle', idleFrame);
        combatant.dataset.idleFrame = String(idleFrame);
        const spriteBox = soldier.getBoundingClientRect();
        const nativeWidth = heroType <= 3 ? 40 : 54;
        const nativeHeight = heroType === 1 || heroType === 4 ? 49 : 50;
        const spriteScale = Math.min(spriteBox.width / nativeWidth, spriteBox.height / nativeHeight);
        combatant.style.setProperty('--weapon-breath', `${[0, 1, 2, 1][idleFrame - 1] * spriteScale}px`);
      }
      const enemy = ENCOUNTERS[active];
      if (!busy && enemy.frames > 1) enemySprite.src = enemyPath(enemy, (frame % enemy.frames) + 1);
    };
    const renderHealth = () => {
      lab.querySelector('[data-hearts]').innerHTML = Array.from({ length: DEMO_MAX_HP }, (_, i) => `<span class="pixel-heart${i < hp ? '' : ' is-empty'}">${heartArt}</span>`).join('');
      lab.querySelector('[data-health-count]').textContent = `${hp} / ${DEMO_MAX_HP}`;
      lab.querySelector('[data-health-hud]').setAttribute('aria-label', `Soldier health: ${hp} of ${DEMO_MAX_HP} HP; armor: ${armorRemaining} slots remaining; Major threshold ${ARMOR_PROFILE.baseMajor + ARMOR_PROFILE.level}; Severe threshold ${ARMOR_PROFILE.baseSevere + ARMOR_PROFILE.level}`);
      lab.querySelector('[data-major-threshold]').textContent = String(ARMOR_PROFILE.baseMajor + ARMOR_PROFILE.level);
      lab.querySelector('[data-severe-threshold]').textContent = String(ARMOR_PROFILE.baseSevere + ARMOR_PROFILE.level);
      lab.querySelector('[data-armor-left]').textContent = `${armorRemaining} / ${ARMOR_PROFILE.slots}`;
      lab.querySelector('[data-armor-remaining]').textContent = String(armorRemaining);
      lab.querySelector('[data-shield-count]').textContent = String(selectedShields().length);
    };
    const restoreSoldier = () => {
      hp = DEMO_MAX_HP;
      armorRemaining = ARMOR_PROFILE.slots;
      shields.forEach(button => {
        button.disabled = false;
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', `Armor Slot ${button.dataset.shield} not selected`);
      });
      renderHealth();
    };
    const selectEnemy = index => {
      if (busy) return;
      active = index;
      const enemy = ENCOUNTERS[index];
      arena.classList.toggle('is-boss', Boolean(enemy.missile));
      lab.querySelector('[data-enemy-name]').textContent = enemy.name.toUpperCase();
      enemySprite.alt = enemy.name;
      enemySprite.src = enemyPath(enemy, 1);
      if (enemy.weapon) weapon.src = `${ASSET}/weapons/${weaponFrames[enemy.weapon][0]}`; else weapon.removeAttribute('src');
      choices.forEach((button, i) => {
        const selected = i === index;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      lab.querySelector('[data-arena-message]').textContent = `${enemy.name.toUpperCase()} // ${enemy.count}D${enemy.sides} + ${enemy.bonus}`;
    };

    choices.forEach(button => button.addEventListener('click', () => selectEnemy(Number(button.dataset.enemy))));
    shields.forEach(button => button.addEventListener('click', () => {
      if (busy || dead || button.disabled) return;
      const selected = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `Armor Slot ${button.dataset.shield} ${selected ? 'selected for next hit' : 'not selected'}`);
      renderHealth();
    }));

    const fireProjectile = async enemy => {
      const arenaBox = arena.getBoundingClientRect();
      const enemyBox = enemySprite.getBoundingClientRect();
      const weaponBox = weapon.getBoundingClientRect();
      const soldierBox = soldier.getBoundingClientRect();
      // The weapon PNGs include transparent pixels after the visible barrel.
      const barrel = { blaster: .68, pulse: .94, rifle: .80 };
      const startX = enemy.missile
        ? enemyBox.left - arenaBox.left + enemyBox.width * .62
        : weaponBox.left - arenaBox.left + weaponBox.width * barrel[enemy.weapon];
      const startY = enemy.missile
        ? enemyBox.top - arenaBox.top + enemyBox.height * .48
        : weaponBox.top - arenaBox.top + weaponBox.height * .5;
      const targetX = soldierBox.left - arenaBox.left + soldierBox.width * .72;
      const targetY = enemy.missile ? soldierBox.top - arenaBox.top + soldierBox.height * .55 : startY;
      projectile.classList.toggle('is-missile', Boolean(enemy.missile));
      projectile.classList.toggle('is-bolt', enemy.bullet === 'laser-bullet-2.png');
      projectileImage.src = enemy.missile ? `${ASSET}/fx/Homing-Missile_1.png`
        : `${ASSET}/weapons/${enemy.bullet === 'laser-bullet-2.png' ? 'laser-bullet-tight.png' : enemy.bullet}`;
      projectile.classList.add('is-active');
      const shotWidth = projectile.getBoundingClientRect().width;
      const shotHeight = projectile.getBoundingClientRect().height;
      const endX = Math.max(startX + 12, targetX - shotWidth);
      projectile.style.left = `${startX}px`;
      projectile.style.top = `${startY - shotHeight / 2}px`;
      impact.style.left = `${targetX}px`;
      impact.style.top = `${targetY}px`;
      arena.dataset.shotStartY = String(Math.round(startY));
      arena.dataset.shotEndY = String(Math.round(targetY));
      if (!enemy.missile) {
        muzzle.style.left = `${startX}px`;
        muzzle.style.top = `${startY}px`;
        muzzle.classList.add('is-active');
      }
      if (reducedMotion) {
        await pause(55);
      } else {
        let missileFrame = 1;
        const missileTimer = enemy.missile ? setInterval(() => {
          missileFrame = missileFrame % 6 + 1;
          projectileImage.src = `${ASSET}/fx/Homing-Missile_${missileFrame}.png`;
        }, 55) : null;
        const flight = projectile.animate([
          { transform: 'translate(0,0)' },
          { transform: `translate(${endX - startX}px,${targetY - startY}px)` },
        ], { duration: enemy.missile ? 400 : 145, easing: 'linear', fill: 'forwards' });
        try { await flight.finished; } finally { if (missileTimer) clearInterval(missileTimer); flight.cancel(); }
      }
      projectile.classList.remove('is-active');
      muzzle.classList.remove('is-active');
      projectile.style.left = '';
      projectile.style.top = '';
    };
    const fireWeapon = async enemy => {
      arena.classList.add('is-firing');
      if (enemy.missile) {
        if (!reducedMotion) for (let i = 1; i <= 8; i++) {
          enemySprite.src = `${ASSET}/boss/Boss_Attack_${pad(i)}.png`;
          await pause(36);
        }
      } else {
        const frames = weaponFrames[enemy.weapon];
        if (!reducedMotion) for (const name of frames.slice(1)) {
          weapon.src = `${ASSET}/weapons/${name}`;
          await pause(28);
        }
      }
      await fireProjectile(enemy);
      arena.classList.remove('is-firing');
      if (enemy.missile) enemySprite.src = enemyPath(enemy, 1);
      else weapon.src = `${ASSET}/weapons/${weaponFrames[enemy.weapon][0]}`;
    };
    const animateDeath = async () => {
      dead = true;
      setStage('death');
      arena.classList.add('is-dead');
      combatant.classList.add('is-corpse');
      if (reducedMotion) { soldier.src = heroPath(heroType, 'Death', 12); await pause(100); return; }
      for (let i = 1; i <= 12; i++) {
        soldier.src = heroPath(heroType, 'Death', i);
        await pause(68);
      }
    };
    const animateEnergy = async () => {
      setStage('regeneration');
      arena.classList.add('is-regenerating');
      lab.querySelector('[data-arena-message]').textContent = 'ENERGY REGENERATION // ACTIVE';
      energy.classList.add('is-active');
      if (reducedMotion) {
        energy.src = `${ASSET}/fx/HealingFX_7.png`;
        await pause(180);
      } else {
        for (let i = 1; i <= 9; i++) {
          energy.src = `${ASSET}/fx/HealingFX_${i}.png`;
          await pause(75);
        }
      }
      energy.classList.remove('is-active');
      arena.classList.remove('is-regenerating');
    };
    const regenerateSoldier = async () => {
      attack.textContent = 'ENERGY REGENERATION';
      await animateEnergy();
      restoreSoldier();
      setStage('ready');
      lab.querySelector('[data-arena-message]').textContent = 'SOLDIER RESTORED // ENGAGE';
      lab.querySelector('[data-battle-log]').textContent += ' Energy regeneration restored the same soldier with full hearts and armor.';
    };
    const recoverSoldier = async () => {
      arena.classList.add('is-recovering');
      setStage('drone-in');
      lab.querySelector('[data-arena-message]').textContent = 'RECOVERY DRONE // INBOUND';
      attack.textContent = 'RECOVERY IN PROGRESS';
      const arenaBox = arena.getBoundingClientRect();
      const bodyBox = soldier.getBoundingClientRect();
      recoveryDrone.classList.add('is-active', 'is-inbound');
      const droneWidth = recoveryDrone.getBoundingClientRect().width;
      const startX = arenaBox.width + 10;
      const targetX = Math.min(arenaBox.width - droneWidth * .78,
        bodyBox.left - arenaBox.left + bodyBox.width * .55 - droneWidth * .5);
      const endX = arenaBox.width + droneWidth + 20;
      recoveryDrone.style.left = `${startX}px`;
      const floorTop = arena.querySelector('.arena-floor').getBoundingClientRect().top - arenaBox.top;
      recoveryDrone.style.top = `${Math.max(20, floorTop - 35 - droneWidth * .335)}px`;
      let droneFrame = 1;
      const droneTimer = reducedMotion ? null : setInterval(() => {
        droneFrame = droneFrame % 8 + 1;
        recoveryDrone.src = `${ASSET}/recovery-drone/DronePod-Movement_${droneFrame}.png`;
      }, 85);
      const move = async (element, from, to, duration) => {
        if (reducedMotion) { element.style.transform = to; await pause(100); return; }
        const animation = element.animate([{ transform: from }, { transform: to }],
          { duration, easing: 'steps(12,end)', fill: 'forwards' });
        try { await animation.finished; element.style.transform = to; } finally { animation.cancel(); }
      };
      await move(recoveryDrone, 'translateX(0) scaleX(-1)', `translateX(${targetX - startX}px) scaleX(-1)`, 600);
      recoveryDrone.style.left = `${targetX}px`;
      recoveryDrone.style.transform = '';
      await pause(reducedMotion ? 100 : 230);
      recoveryDrone.classList.replace('is-inbound', 'is-outbound');
      setStage('extraction');
      lab.querySelector('[data-arena-message]').textContent = 'BODY RECOVERED // EXTRACTING';
      const carryX = arenaBox.width - (bodyBox.left - arenaBox.left) + bodyBox.width;
      await Promise.all([
        move(recoveryDrone, 'translateX(0) scaleX(1)', `translateX(${endX - targetX}px) scaleX(1)`, 700),
        move(combatant, 'translate(0,0)', `translate(${carryX}px,-35px)`, 700),
      ]);
      arena.classList.add('is-absent');
      combatant.style.transform = '';
      recoveryDrone.classList.remove('is-active', 'is-inbound', 'is-outbound');
      recoveryDrone.style.transform = '';
      recoveryDrone.style.left = '';
      recoveryDrone.style.top = '';
      if (droneTimer) clearInterval(droneTimer);
      heroType = nextHero();
      combatant.dataset.heroType = String(heroType);
      combatant.classList.remove('is-corpse');
      soldier.src = heroPath(heroType, 'Run', 1);
      soldier.alt = 'Replacement armored soldier entering the arena';
      setStage('reinforcement');
      lab.querySelector('[data-arena-message]').textContent = 'REINFORCEMENT // ARRIVING';
      await pause(reducedMotion ? 90 : 170);
      arena.classList.remove('is-absent');
      let runFrame = 1;
      const runTimer = reducedMotion ? null : setInterval(() => {
        runFrame = runFrame % 5 + 1;
        soldier.src = heroPath(heroType, 'Run', runFrame);
      }, 95);
      await move(combatant, `translateX(${arenaBox.width * .48}px)`, 'translateX(0)', 800);
      if (runTimer) clearInterval(runTimer);
      combatant.style.transform = '';
      soldier.src = heroPath(heroType, 'Idle', 1);
      soldier.alt = 'Armored soldier facing the enemy';
      await animateEnergy();
      restoreSoldier();
      dead = false;
      arena.classList.remove('is-recovering', 'is-dead');
      setStage('ready');
      lab.querySelector('[data-arena-message]').textContent = 'REINFORCEMENT READY // ENGAGE';
      lab.querySelector('[data-battle-log]').textContent += ' Recovery drone extracted the fallen soldier; energy restored the arriving soldier with full hearts and armor.';
    };
    const animateImpact = async () => {
      arena.classList.remove('is-hit');
      floating.classList.remove('is-visible');
      void floating.offsetWidth;
      arena.classList.add('is-hit');
      floating.classList.add('is-visible');
      if (!reducedMotion) for (let i = 1; i <= 3; i++) {
        impact.src = `${ASSET}/fx/Laser-Impact_${i}.png`;
        await pause(55);
      }
      await pause(reducedMotion ? 60 : 550);
      arena.classList.remove('is-hit');
      floating.classList.remove('is-visible');
    };

    attack.addEventListener('click', async () => {
      if (busy || dead) return;
      busy = true;
      attack.disabled = true;
      modeInputs.forEach(input => { input.disabled = true; });
      attack.textContent = '● ATTACK IN PROGRESS';
      const enemy = ENCOUNTERS[active];
      const selected = selectedShields();
      const isDeadly = deadly();
      const roll = rollDamage(enemy);
      lab.querySelector('[data-arena-message]').textContent = enemy.missile ? 'MISSILE LOCK // INCOMING' : 'HOSTILE FIRE // INCOMING';
      await fireWeapon(enemy);
      const result = applyCombatHit({ hp, armorRemaining }, roll.damage, { deadly: isDeadly, armorSlots: selected.length });
      hp = result.hpAfter;
      armorRemaining = result.armorRemaining;
      selected.forEach(button => {
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', `Armor Slot ${button.dataset.shield} spent`);
        button.disabled = true;
      });
      renderHealth();
      lab.querySelector('[data-roll]').textContent = String(roll.damage);
      lab.querySelector('[data-severity]').textContent = result.tier.toUpperCase();
      lab.querySelector('[data-raw-hp]').textContent = `${result.rawHP} HP`;
      lab.querySelector('[data-hp]').textContent = `${result.lost} HP`;
      lab.querySelector('[data-floating-hp]').textContent = result.lost ? `−${result.lost} HP` : 'BLOCKED';
      lab.querySelector('[data-floating-roll]').textContent = `${roll.damage} DAMAGE`;
      const formula = `${enemy.count}D${enemy.sides} + ${enemy.bonus}`;
      lab.querySelector('[data-battle-log]').textContent = `${enemy.name} rolled ${formula} → ${roll.damage} damage. ${result.rawHP} HP before armor; ${selected.length} Armor Slots spent; ${result.lost} HP lost. ${hp} of ${DEMO_MAX_HP} hearts remain.${dead || hp === 0 ? ' Soldier down.' : ''}`;
      lab.querySelector('[data-arena-message]').textContent = hp === 0 ? 'SOLDIER DOWN // RECOVERY INBOUND' : `${roll.damage} DAMAGE // ${result.lost} HP LOST`;
      await Promise.all([animateImpact(), hp === 0 ? animateDeath() : pause(0)]);
      if (dead) await recoverSoldier();
      else await regenerateSoldier();
      busy = false;
      attack.disabled = false;
      attack.textContent = '▶ TRIGGER ENEMY ATTACK';
      modeInputs.forEach(input => { input.disabled = false; });
    });

    selectEnemy(0);
    setStage('ready');
    renderHealth();
    if (!reducedMotion) setInterval(showFrame, 210);
  }

  const share = document.querySelector('[data-share-article]');
  share?.addEventListener('click', async () => {
    const status = document.querySelector('[data-share-status]');
    const url = new URL(location.pathname, location.origin).href;
    try { await navigator.clipboard.writeText(url); status.textContent = 'Article link copied.'; }
    catch { status.textContent = `Article link: ${url}`; }
  });
}
