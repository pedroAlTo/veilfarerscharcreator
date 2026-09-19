import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveOverkill } from '../public/overkill-demo.mjs';
import { bassEnergy } from '../public/theme-heart.mjs';

test('Overkill begins at a complete interval beyond Severe, never at Major plus ten', () => {
  for (const [damage, expected] of [[1,1],[11,1],[12,2],[21,2],[22,3],[31,3],[32,4],[41,4],[42,5],[1022,103]]) {
    assert.equal(resolveOverkill(damage).hp, expected, `${damage} damage`);
  }
});
test('Deadly uses five-point steps and Armor lowers the category, including large Overkill', () => {
  assert.equal(resolveOverkill(26,{deadly:true}).hp,3);
  assert.equal(resolveOverkill(27,{deadly:true}).hp,4);
  assert.equal(resolveOverkill(32,{deadly:true}).hp,5);
  for (const [damage,hp] of [[1,0],[12,1],[22,2],[32,3],[1022,3]]) assert.equal(resolveOverkill(damage,{armor:true}).hp,hp);
});
test('Bass analysis responds to low frequencies, ignores isolated treble, and reports silence', () => {
  const bins=new Uint8Array(1024), rate=48000, fft=2048;
  assert.equal(bassEnergy(bins,rate,fft),0);
  bins[Math.round(90*fft/rate)]=220;
  assert.ok(bassEnergy(bins,rate,fft)>.2);
  bins.fill(0); bins[Math.round(4000*fft/rate)]=255;
  assert.equal(bassEnergy(bins,rate,fft),0);
});
