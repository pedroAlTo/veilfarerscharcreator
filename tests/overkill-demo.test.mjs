import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveOverkill, ARMOR_PROFILE, ARMOR_PROFILES, DEMO_MAX_HP, ENCOUNTERS, rollDamage, applyCombatHit } from '../public/overkill-demo.mjs';
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

test('selectable light, medium and heavy armor use Corebook 12.06 thresholds and slots',()=>{
  assert.deepEqual(ARMOR_PROFILES.map(p=>[p.name,p.weight,p.baseMajor,p.baseSevere,p.slots]),[
    ['Frontier Vest','Light',5,11,3],['Tactical Armor','Medium',10,20,5],['Power Armor','Heavy',15,30,8],
  ]);
  assert.deepEqual(ARMOR_PROFILES.map(p=>[p.baseMajor+p.level,p.baseSevere+p.level]),[[7,13],[12,22],[17,32]]);
  assert.equal(resolveOverkill(20,{profile:ARMOR_PROFILES[0]}).rawHP,3);
  assert.equal(resolveOverkill(20,{profile:ARMOR_PROFILES[2]}).rawHP,2);
  const heavy=applyCombatHit({hp:6,armorRemaining:8},42,{profile:ARMOR_PROFILES[2],armorSlots:8});
  assert.deepEqual([heavy.rawHP,heavy.spent,heavy.hpAfter,heavy.armorRemaining],[4,8,6,0]);
  assert.equal(resolveOverkill(42,{profile:ARMOR_PROFILES[0],armorSlots:8}).spent,3);
});

test('enemy threats climb in expected damage and the giant robot fires 10D8 + 5', () => {
  const averages = ENCOUNTERS.map(enemy => enemy.count * (enemy.sides + 1) / 2 + enemy.bonus);
  assert.ok(averages.every((average, index) => index === 0 || average > averages[index - 1]));
  const boss = ENCOUNTERS.at(-1);
  assert.deepEqual([boss.count, boss.sides, boss.bonus], [10, 8, 5]);
  assert.equal(rollDamage(boss, () => 0).damage, 15);
  assert.equal(rollDamage(boss, () => 0.999).damage, 85);
  assert.equal(resolveOverkill(85, { deadly: true, armorSlots: 5 }).hp, 10);
});

test('successive attacks consume armor, empty hearts, and leave the soldier down', () => {
  assert.equal(DEMO_MAX_HP, 6);
  assert.equal(ENCOUNTERS.length, 5);
  assert.equal(ENCOUNTERS[3].sprite, 'robot-heavy');
  assert.ok(ENCOUNTERS.every(enemy => enemy.sprite !== 'ship'));
  const first = applyCombatHit({ hp: 6, armorRemaining: 5 }, 42, { deadly: true, armorSlots: 2 });
  assert.deepEqual([first.rawHP, first.hp, first.lost, first.hpAfter, first.armorRemaining], [7, 5, 5, 1, 3]);
  const final = applyCombatHit({ hp: first.hpAfter, armorRemaining: first.armorRemaining }, 25);
  assert.deepEqual([final.lost, final.hpAfter, final.armorRemaining], [1, 0, 3]);
  const blocked = applyCombatHit({ hp: 6, armorRemaining: 2 }, 5, { armorSlots: 5 });
  assert.deepEqual([blocked.lost, blocked.hpAfter, blocked.armorRemaining], [0, 6, 0]);
});
