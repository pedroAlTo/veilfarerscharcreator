import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveOverkill, ARMOR_PROFILE } from '../public/overkill-demo.mjs';
import { bassEnergy } from '../public/theme-heart.mjs';

test('Overkill begins at a complete interval beyond Severe, never at Major plus ten', () => {
  for (const [damage, expected] of [[1,1],[11,1],[12,2],[21,2],[22,3],[31,3],[32,4],[41,4],[42,5],[1022,103]]) {
    assert.equal(resolveOverkill(damage).hp, expected, `${damage} damage`);
  }
});
test('Deadly uses five-point steps; each spent armor slot removes exactly one HP', () => {
  assert.equal(resolveOverkill(26,{deadly:true}).hp,3);
  assert.equal(resolveOverkill(27,{deadly:true}).hp,4);
  assert.equal(resolveOverkill(32,{deadly:true}).hp,5);
  for (const [damage,hp] of [[1,0],[12,1],[22,2],[32,3],[42,4],[1022,102]]) assert.equal(resolveOverkill(damage,{armorSlots:1}).hp,hp);
  for (let armorSlots=0;armorSlots<=ARMOR_PROFILE.slots;armorSlots++) {
    assert.equal(resolveOverkill(42,{deadly:true,armorSlots}).hp,7-armorSlots);
    assert.equal(resolveOverkill(1,{armorSlots}).hp,Math.max(0,1-armorSlots));
  }
  assert.equal(resolveOverkill(42,{deadly:true,armorSlots:20}).spent,ARMOR_PROFILE.slots);
  assert.equal(resolveOverkill(42,{armorSlots:-2}).spent,0);
  assert.equal(resolveOverkill(42,{armorSlots:NaN}).spent,0);
});
test('Bass analysis responds to low frequencies, ignores isolated treble, and reports silence', () => {
  const bins=new Uint8Array(1024), rate=48000, fft=2048;
  assert.equal(bassEnergy(bins,rate,fft),0);
  bins[Math.round(90*fft/rate)]=220;
  assert.ok(bassEnergy(bins,rate,fft)>.2);
  bins.fill(0); bins[Math.round(4000*fft/rate)]=255;
  assert.equal(bassEnergy(bins,rate,fft),0);
});

test('Tactical Armor uses five slots and adds wearer level to both base thresholds', () => {
  assert.equal(ARMOR_PROFILE.slots, 5);
  assert.equal(ARMOR_PROFILE.baseMajor + ARMOR_PROFILE.level, 12);
  assert.equal(ARMOR_PROFILE.baseSevere + ARMOR_PROFILE.level, 22);
  assert.equal(resolveOverkill(42, { deadly:true, armorSlots:5 }).hp, 2);
  assert.equal(resolveOverkill(32).hp, 4, 'available armor does not automatically soak a hit');
});
