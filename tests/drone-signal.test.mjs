import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateDroneSignal, DRONE_SIGNAL_LABELS, DRONE_RANGES} from '../public/drone-signal.mjs';

const state = options => evaluateDroneSignal(options).state;

test('Direct RF degrades by the printed range bands, not an invented distance percentage', () => {
  assert.deepEqual(DRONE_RANGES.map(range => state({range})), ['stable', 'stable', 'stable', 'stable', 'unstable', 'lost']);
  assert.equal(evaluateDroneSignal({range:'very-far'}).bars, 1);
  assert.equal(evaluateDroneSignal({range:'beyond'}).bars, 0);
});

test('active jamming worsens the existing signal by one step', () => {
  assert.equal(state({range:'far', obstruction:'jamming'}), 'unstable');
  assert.equal(state({range:'very-far', obstruction:'jamming'}), 'lost');
  assert.equal(state({range:'beyond', obstruction:'jamming'}), 'lost');
});

test('ordinary structure interrupts a nearby drone and does not restore an already lost connection', () => {
  assert.equal(state({range:'close', obstruction:'structure'}), 'unstable');
  assert.equal(state({range:'beyond', obstruction:'structure'}), 'lost');
  assert.equal(state({range:'close', obstruction:'structure', extendedLink:true}), 'stable');
});

test('a close drone in a hard Lost zone stays unreachable despite range equipment', () => {
  for (const range of DRONE_RANGES) {
    assert.equal(state({range, obstruction:'vault', extendedLink:true, relay:true, clearRoute:true}), 'lost');
  }
  assert.equal(state({range:'close', obstruction:'shielded', shieldedState:'lost', relay:true}), 'lost');
});

test('shielded compartments use their declared state instead of inventing a universal result', () => {
  assert.equal(state({range:'close', obstruction:'shielded', shieldedState:'unstable'}), 'unstable');
  assert.equal(state({range:'close', obstruction:'shielded', shieldedState:'lost'}), 'lost');
});

test('bypassing protection preserves any independent distance degradation', () => {
  assert.equal(state({range:'far', obstruction:'vault', protectionCountered:true}), 'stable');
  assert.equal(state({range:'very-far', obstruction:'vault', protectionCountered:true}), 'unstable');
  assert.equal(state({range:'beyond', obstruction:'jamming', protectionCountered:true}), 'lost');
});

test('Extended Link improves distance but cannot cancel military jamming itself', () => {
  assert.equal(state({range:'very-far', extendedLink:true}), 'stable');
  assert.equal(state({range:'close', obstruction:'jamming', extendedLink:true}), 'unstable');
  assert.equal(state({range:'very-far', obstruction:'jamming', extendedLink:true}), 'unstable');
});

test('a routed surviving relay improves one step; losing it removes that support', () => {
  assert.equal(state({range:'very-far', obstruction:'jamming', relay:true}), 'unstable');
  assert.equal(state({range:'very-far', obstruction:'jamming', relay:false}), 'lost');
  assert.equal(state({range:'very-far', relay:true}), 'stable');
});

test('Local Mesh keeps Very Far stable and logged but still applies protected-space restrictions', () => {
  assert.equal(state({range:'very-far', mode:'mesh'}), 'stable');
  assert.equal(evaluateDroneSignal({range:'very-far', mode:'mesh'}).logged, true);
  assert.equal(state({range:'very-far', mode:'mesh', obstruction:'jamming'}), 'unstable');
  assert.equal(state({range:'close', mode:'mesh', obstruction:'vault'}), 'lost');
  assert.equal(state({range:'beyond', mode:'mesh'}), 'lost');
});

test('clear-route support applies at Very Far and cannot bypass protection', () => {
  assert.equal(state({range:'very-far', clearRoute:true}), 'stable');
  assert.equal(state({range:'beyond', clearRoute:true}), 'lost');
  assert.equal(state({range:'very-far', clearRoute:true, obstruction:'vault'}), 'lost');
});

test('the state distinguishes complex-command Disadvantage from lost-link fallback in both languages', () => {
  assert.equal(evaluateDroneSignal({range:'very-far'}).complexDisadvantage, true);
  assert.equal(evaluateDroneSignal({range:'very-far'}).followsProtocol, false);
  assert.equal(evaluateDroneSignal({range:'beyond'}).complexDisadvantage, false);
  assert.equal(evaluateDroneSignal({range:'beyond'}).followsProtocol, true);
  for (const language of ['en', 'es']) {
    for (const range of DRONE_RANGES) assert.ok(DRONE_SIGNAL_LABELS[language].range[range]);
    for (const signal of ['stable', 'unstable', 'lost']) assert.ok(DRONE_SIGNAL_LABELS[language].effect[signal]);
  }
});
