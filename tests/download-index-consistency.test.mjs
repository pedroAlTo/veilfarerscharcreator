import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('legacy download index serves the current PDF catalogue without stale links', () => {
  const current = JSON.parse(readFileSync(new URL('../public/download/downloads.json', import.meta.url)));
  const legacy = JSON.parse(readFileSync(new URL('../public/rules-data/downloads.json', import.meta.url)));
  assert.deepEqual(legacy, current);
});
