export const SHIP_PROFILES = Object.freeze([
  { id: 'courier', name: 'Courier / small craft', tier: 1, hull: 10, arcSlots: 3, heatCap: 8, evasion: 16, mountRating: 1, weapon: 'Light Missile', damage: [3, 6, 1], tags: ['Guided'] },
  { id: 'corvette', name: 'Corvette', tier: 2, hull: 22, arcSlots: 6, heatCap: 12, evasion: 12, mountRating: 2, weapon: 'Pulse Cannon', damage: [2, 8, 1], tags: ['Energy'] },
  { id: 'frigate', name: 'Frigate / destroyer', tier: 3, hull: 30, arcSlots: 9, heatCap: 16, evasion: 12, mountRating: 2, weapon: 'Medium Slug Cannon', damage: [3, 10, 0], tags: ['Kinetic'] },
  { id: 'cruiser', name: 'Heavy Cruiser', tier: 4, hull: 40, arcSlots: 12, heatCap: 18, evasion: 8, mountRating: 3, weapon: 'Heavy Plasma Lance', damage: [4, 12, 2], tags: ['Energy', 'Plasma', 'Heavy'] },
  { id: 'dreadnought', name: 'Dreadnought · Boss', tier: 4, hull: 52, arcSlots: 13, heatCap: 22, evasion: 8, mountRating: 3, weapon: 'Capital Missile', damage: [6, 8, 4], tags: ['Guided', 'Heavy'] },
]);

export const ARCS = Object.freeze(['fore', 'aft', 'port', 'starboard']);

// Fitted to the supplied ship-20 sprite at 60px, with a small hull clearance.
export const PLAYER_SHIELD_OUTLINE = Object.freeze([
  [34, -4], [34, 4], [13, 26], [-7, 34], [-26, 15],
  [-33, 3], [-33, -3], [-26, -15], [-7, -34], [13, -26],
].map(([x, y]) => Object.freeze({ x, y })));
export const PLAYER_SHIELD_PATHS = Object.freeze(Object.fromEntries(Object.entries({
  fore: [[19.348837, -19.348837], [34, -4], [34, 4], [19.348837, 19.348837]],
  aft: [[-20.5, 20.5], [-26, 15], [-33, 3], [-33, -3], [-26, -15], [-20.5, -20.5]],
  port: [[-20.5, -20.5], [-7, -34], [13, -26], [19.348837, -19.348837]],
  starboard: [[19.348837, 19.348837], [13, 26], [-7, 34], [-20.5, 20.5]],
}).map(([arc, points]) => [arc, Object.freeze(points.map(([x, y]) => Object.freeze({ x, y })))])));

export function findShieldImpact(start, end, outline = PLAYER_SHIELD_OUTLINE) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const epsilon = 1e-9;
  let entry = 0, exit = 1;
  // Clip relative motion against every inward half-plane of the visible shield.
  for (let i = 0; i < outline.length; i += 1) {
    const a = outline[i], b = outline[(i + 1) % outline.length];
    const ex = b.x - a.x, ey = b.y - a.y;
    const distance = ex * (start.y - a.y) - ey * (start.x - a.x);
    const speed = ex * dy - ey * dx;
    if (Math.abs(speed) < epsilon) {
      if (distance < -epsilon) return null;
    } else {
      const t = -distance / speed;
      if (speed > 0) entry = Math.max(entry, t);
      else exit = Math.min(exit, t);
      if (entry > exit + epsilon) return null;
    }
  }
  if (entry > 1 + epsilon || exit < -epsilon) return null;
  const t = Math.max(0, Math.min(1, entry));
  const x = start.x + dx * t;
  const y = start.y + dy * t;
  // A projectile already at the centre still came from the opposite direction.
  const atCentre = Math.abs(x) <= epsilon && Math.abs(y) <= epsilon;
  const sideX = atCentre ? -dx : x;
  const sideY = atCentre ? -dy : y;
  const arc = Math.abs(sideX) >= Math.abs(sideY)
    ? (sideX < 0 ? 'aft' : 'fore')
    : (sideY < 0 ? 'port' : 'starboard');
  return { arc, t, x, y };
}

export function rollWeaponDamage(damage, mountRating, random = Math.random) {
  const [dice, faces, modifier] = damage;
  const values = Array.from({ length: dice }, () => 1 + Math.floor(random() * faces));
  const total = values.reduce((sum, value) => sum + value, modifier);
  return { values, roll: total, damage: total * mountRating };
}

export function hullLossFromOverflow(damage) {
  if (damage <= 0) return 0;
  if (damage <= 5) return 1;
  if (damage <= 12) return 2;
  if (damage <= 20) return 3;
  if (damage <= 30) return 4;
  return 5 + Math.floor((damage - 31) / 10);
}

export function resolveNavalHit(target, damage, arc) {
  const shield = Math.min(target.shields[arc], damage);
  target.shields[arc] -= shield;
  const overflow = damage - shield;
  const hullLoss = hullLossFromOverflow(overflow);
  target.hull = Math.max(0, target.hull - hullLoss);
  return { shieldLoss: shield, overflow, hullLoss, hull: target.hull, destroyed: target.hull === 0 };
}

export function regenerateArcs(shields, maximum, amount = 2) {
  for (const arc of ARCS) shields[arc] = Math.min(maximum, shields[arc] + amount);
  return shields;
}

export function createShipState(profile) {
  return {
    profile,
    hull: profile.hull,
    shields: Object.fromEntries(ARCS.map((arc) => [arc, profile.arcSlots])),
    heat: 0,
  };
}
