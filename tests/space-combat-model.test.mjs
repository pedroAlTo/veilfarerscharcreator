import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCS, SHIP_PROFILES, createShipState, findShieldImpact, hullLossFromOverflow, regenerateArcs, resolveNavalHit, rollWeaponDamage } from '../public/space-combat-model.mjs';

test('the five encounter hulls use the published tier and Mount Rating scale', () => {
  assert.deepEqual(SHIP_PROFILES.map(({ tier, mountRating }) => [tier, mountRating]), [[1, 1], [2, 2], [3, 2], [4, 3], [4, 3]]);
  assert.deepEqual(SHIP_PROFILES.map(({ hull, arcSlots }) => [hull, arcSlots]), [[10, 3], [22, 6], [30, 9], [40, 12], [52, 13]]);
});

test('a ship weapon multiplies its full rolled dice and flat modifier by Mount Rating', () => {
  const result = rollWeaponDamage([3, 6, 1], 2, () => 0.5);
  assert.deepEqual(result, { values: [4, 4, 4], roll: 13, damage: 26 });
});

test('naval damage consumes the impacted shield arc before converting overflow to hull loss', () => {
  const state = createShipState(SHIP_PROFILES[1]);
  const hit = resolveNavalHit(state, 10, 'fore');
  assert.deepEqual(hit, { shieldLoss: 6, overflow: 4, hullLoss: 1, hull: 21, destroyed: false });
  assert.equal(state.shields.aft, 6);
});

test('the hull damage bands preserve the published breakpoints and Overkill interval', () => {
  assert.deepEqual([0, 1, 5, 6, 12, 13, 20, 21, 30, 31, 40, 41].map(hullLossFromOverflow), [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6]);
});

test('each shield arc regenerates independently up to its hull maximum', () => {
  const shields = { fore: 0, aft: 1, port: 6, starboard: 4 };
  assert.strictEqual(regenerateArcs(shields, 6), shields);
  assert.deepEqual(shields, { fore: 2, aft: 3, port: 6, starboard: 6 });
  assert.deepEqual(ARCS, ['fore', 'aft', 'port', 'starboard']);
});

test('shield contacts select the actual front, rear, upper and lower side of a right-facing ship', () => {
  const cases = [
    [{ x: 104, y: 0 }, { x: 0, y: 0 }, 'fore', 34, 0],
    [{ x: -104, y: 0 }, { x: 0, y: 0 }, 'aft', -33, 0],
    [{ x: 0, y: -104 }, { x: 0, y: 0 }, 'port', 0, -31.2],
    [{ x: 0, y: 104 }, { x: 0, y: 0 }, 'starboard', 0, 31.2],
  ];
  for (const [start, end, arc, x, y] of cases) {
    const hit = findShieldImpact(start, end);
    assert.equal(hit.arc, arc);
    assert.ok(Math.abs(hit.x - x) < 1e-6 && Math.abs(hit.y - y) < 1e-6);
    const state = createShipState(SHIP_PROFILES[1]);
    resolveNavalHit(state, 2, arc);
    for (const side of ARCS) assert.equal(state.shields[side], side === arc ? 4 : 6);
  }
});

test('a fast shot crossing the entire shield uses its first contact, not its final position', () => {
  assert.deepEqual(findShieldImpact({ x: -104, y: 0 }, { x: 104, y: 0 }), {
    arc: 'aft', t: 71 / 208, x: -33, y: 0,
  });
});

test('shield tracing detects tangency and the exact end point but ignores misses and outbound shots', () => {
  assert.deepEqual(findShieldImpact({ x: -100, y: -34 }, { x: 100, y: -34 }), {
    arc: 'port', t: 93 / 200, x: -7, y: -34,
  });
  assert.deepEqual(findShieldImpact({ x: 100, y: 0 }, { x: 34, y: 0 }), {
    arc: 'fore', t: 1, x: 34, y: 0,
  });
  assert.equal(findShieldImpact({ x: -100, y: 35 }, { x: 100, y: 35 }), null);
  assert.equal(findShieldImpact({ x: 100, y: 0 }, { x: 35, y: 0 }), null);
  assert.equal(findShieldImpact({ x: 100, y: 0 }, { x: 200, y: 0 }), null);
  assert.equal(findShieldImpact({ x: 100, y: 0 }, { x: 100, y: 0 }), null);
});

test('shots already inside use their position, or their arrival direction at the centre', () => {
  assert.deepEqual(findShieldImpact({ x: 0, y: -20 }, { x: 80, y: 0 }), {
    arc: 'port', t: 0, x: 0, y: -20,
  });
  assert.deepEqual(findShieldImpact({ x: 0, y: 0 }, { x: 0, y: -20 }), {
    arc: 'starboard', t: 0, x: 0, y: 0,
  });
  assert.deepEqual(findShieldImpact({ x: 0, y: 0 }, { x: 0, y: 0 }), {
    arc: 'fore', t: 0, x: 0, y: 0,
  });
});

test('relative start and end positions detect a ship moving into a projectile', () => {
  const projectile = { x: 100, y: 120 };
  const shipStart = { x: 100, y: 60 };
  const shipEnd = { x: 100, y: 100 };
  const start = { x: projectile.x - shipStart.x, y: projectile.y - shipStart.y };
  const end = { x: projectile.x - shipEnd.x, y: projectile.y - shipEnd.y };
  const hit = findShieldImpact(start, end);
  assert.equal(hit.arc, 'starboard');
  assert.ok(Math.abs(hit.t - .72) < 1e-6);
  assert.ok(Math.abs(hit.y - 31.2) < 1e-6);
});

test('shield tracing accepts a custom convex outline and resolves diagonal ties consistently', () => {
  const square = [{ x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }, { x: -10, y: -10 }];
  assert.deepEqual(findShieldImpact({ x: 20, y: 0 }, { x: 0, y: 0 }, square), {
    arc: 'fore', t: 0.5, x: 10, y: 0,
  });
  assert.equal(findShieldImpact({ x: 10, y: 10 }, { x: 0, y: 0 }).arc, 'fore');
  assert.equal(findShieldImpact({ x: -10, y: -10 }, { x: 0, y: 0 }).arc, 'aft');
});
