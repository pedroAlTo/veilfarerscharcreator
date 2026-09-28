import test from 'node:test';
import assert from 'node:assert/strict';
import {createNeuralPuzzle, chooseNeuralRole, advanceNeuralPuzzle} from '../public/drone-neural-puzzle.mjs';
import {neuralSceneFrame} from '../public/drone-shared.mjs';

const finish = (state, role) => {
  const selected = chooseNeuralRole(state, role);
  return advanceNeuralPuzzle(selected, selected.pending.duration);
};
const reach = step => ['scoundrel', 'pilot', 'engineer', 'engineer', 'diplomat', 'engineer'].slice(0, step + (step >= 3 ? 1 : 0)).reduce(finish, createNeuralPuzzle());
const actionAt = (step, role, elapsed) => advanceNeuralPuzzle(chooseNeuralRole(reach(step), role), elapsed);
const frameAt = (step, role, elapsed) => neuralSceneFrame(actionAt(step, role, elapsed), elapsed);

// Timelines describe what a visitor can actually see before a milestone is committed.
for (const stage of [2, 3]) test(`the guard reacts and returns before speaking about wind for ${stage === 2 ? 'the first door attempt' : 'a repeated door attempt'}`, () => {
  const alarm = frameAt(stage, 'engineer', 2000);
  assert.equal(alarm.alert, true);
  assert.equal(alarm.speech, 'alarm');
  assert.equal(alarm.guardX, 75);
  assert.equal(alarm.guardWalking, false);
  assert.equal(alarm.door, 7);

  const approach = frameAt(stage, 'engineer', 3850);
  assert.equal(approach.alert, false);
  assert.equal(approach.speech, null);
  assert.equal(approach.guardWalking, true);
  assert.ok(approach.guardX > 75 && approach.guardX < 84);
  assert.equal(approach.guardFlip, false);
  const panel = frameAt(stage, 'engineer', 4700);
  assert.equal(panel.guardX, 84);
  assert.equal(panel.guardWalking, false);
  assert.ok(panel.door > 0 && panel.door < 7);
  const returning = frameAt(stage, 'engineer', 5800);
  assert.equal(returning.door, 0);
  assert.equal(returning.guardWalking, true);
  assert.equal(returning.guardFlip, true);
  assert.ok(returning.guardX > 75 && returning.guardX < 84);

  for (let elapsed = 0; elapsed < 6600; elapsed += 50) {
    assert.notEqual(frameAt(stage, 'engineer', elapsed).speech, 'wind', `No early wind dialogue at ${elapsed} ms`);
  }
  for (const elapsed of [6600, 7200, 8000]) {
    const state = actionAt(stage, 'engineer', elapsed);
    const returned = neuralSceneFrame(state, elapsed);
    assert.equal(returned.speech, 'wind');
    assert.equal(returned.guardX, 75);
    assert.equal(returned.guardWalking, false);
    assert.equal(returned.door, 0);
    assert.equal(state.stage, stage === 2 ? 'radio' : 'dismiss');
  }
});

test('the pilot crosses every shutter while it is fully open', () => {
  const shutters = [46, 59, 72];
  const crossings = new Set();
  let previous = frameAt(1, 'pilot', 0);
  for (let elapsed = 10; elapsed <= 3600; elapsed += 10) {
    const current = frameAt(1, 'pilot', elapsed);
    shutters.forEach((x, index) => {
      if (previous.x < x && current.x >= x) {
        crossings.add(index);
        assert.ok(previous.gates[index] >= .99, `Shutter ${index + 1} open on approach`);
        assert.ok(current.gates[index] >= .99, `Shutter ${index + 1} open on crossing`);
      }
    });
    assert.ok(current.x >= previous.x, 'The pilot moves forward through the passage');
    previous = current;
  }
  assert.equal(crossings.size, 3);
  assert.equal(previous.x, 81);
  assert.equal(actionAt(1, 'pilot', 3600).stage, 'shutters', 'Crossing does not commit before the animation finishes');
  assert.equal(actionAt(1, 'pilot', 4000).stage, 'radio');
});

test('a wrong camera choice probes the detection area then retreats without clearing it', () => {
  for (const role of ['pilot', 'diplomat']) {
    const start = frameAt(0, role, 0);
    const probe = frameAt(0, role, 950);
    const retreat = frameAt(0, role, 1400);
    const returned = frameAt(0, role, 2200);
    assert.equal(start.x, 17);
    assert.ok(probe.x > start.x);
    assert.ok(retreat.x < probe.x && retreat.x > start.x);
    assert.equal(retreat.flip, true);
    assert.ok(Math.abs(returned.x - start.x) < .001);
    const result = actionAt(0, role, 2500);
    assert.equal(result.stage, 'camera');
    assert.equal(result.cameraMethod, null);
    assert.equal(neuralSceneFrame(result, 2500).cameraOff, false);
  }
});

test('the hacked radio order precedes the guard answer and departure while the door stays closed', () => {
  const order = frameAt(3, 'diplomat', 1000);
  assert.equal(order.speech, 'order');
  assert.equal(order.guardWalking, false);
  assert.equal(order.guardX, 75);
  const answer = frameAt(3, 'diplomat', 7000);
  assert.equal(answer.speech, 'answer');
  assert.equal(answer.guardWalking, false);
  assert.equal(answer.guardVisible, true);
  const leaving = frameAt(3, 'diplomat', 10500);
  assert.equal(leaving.speech, 'departure');
  assert.equal(leaving.guardWalking, true);
  assert.ok(leaving.guardX > 75);
  for (let elapsed = 0; elapsed <= 14500; elapsed += 100) {
    const frame = frameAt(3, 'diplomat', elapsed);
    assert.equal(frame.door, 0, 'Dismissal never opens the door for the engineer');
    if (elapsed < 9000) assert.equal(frame.guardX, 75, 'Guard hears the whole exchange before leaving');
  }
  const gone = actionAt(3, 'diplomat', 14500);
  assert.equal(gone.stage, 'door');
  assert.equal(neuralSceneFrame(gone, 14500).guardVisible, false);
});
