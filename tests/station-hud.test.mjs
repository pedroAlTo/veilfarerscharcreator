import test from 'node:test';
import assert from 'node:assert/strict';
import { HUD_SECTORS, stationReadings } from '../public/station-hud.mjs';

test('station telemetry stays within plausible display ranges and keeps power subdued', () => {
  for (const sector of Object.keys(HUD_SECTORS)) {
    for (let t = 0; t < 1800; t += 7) {
      const [oxygen, power, relays, support, water, pressure] = stationReadings(sector, t);
      assert.ok(oxygen >= 20 && oxygen <= 21);
      assert.ok(power > 15 && power < 25);
      assert.ok(Number.isInteger(relays) && relays > 0 && relays <= 6);
      assert.ok(support > 50 && support < 80);
      assert.ok(water > 40 && water < 70);
      assert.ok(pressure > 95 && pressure < 102);
    }
  }
  assert.equal(stationReadings('__proto__'), null);
  assert.equal(stationReadings('unknown'), null);
});

test('HUD selection frames remain inside the station coordinate system', () => {
  for (const { box: [x, y, width, height] } of Object.values(HUD_SECTORS)) {
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0);
    assert.ok(x + width <= 1536 && y + height <= 1024);
  }
});
