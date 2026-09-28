import test from 'node:test';
import assert from 'node:assert/strict';
import {createNeuralPuzzle, chooseNeuralRole, advanceNeuralPuzzle, NEURAL_PUZZLE_ROLES} from '../public/drone-neural-puzzle.mjs';

const finish = (state, role) => {
  const selected = chooseNeuralRole(state, role);
  return advanceNeuralPuzzle(selected, selected.pending?.duration ?? 0);
};
const reach = (step, first = 'scoundrel') => [first, 'pilot', 'engineer', 'engineer', 'diplomat', 'engineer'].slice(0, step + (step >= 3 ? 1 : 0)).reduce(finish, createNeuralPuzzle());

for (const [first, method] of [['scoundrel', 'stealth'], ['engineer', 'hack']]) {
  test(`the ${method} camera route completes through one deliberate action per milestone`, () => {
    let state = createNeuralPuzzle();
    const original = structuredClone(state);
    const roles = [first, 'pilot', 'engineer', 'engineer', 'diplomat', 'engineer'];
    const stages = ['shutters', 'radio', 'radio', 'dismiss', 'door', 'done'];
    const steps = [1, 2, 2, 3, 4, 5];
    roles.forEach((role, index) => {
      const previous = structuredClone(state);
      const selected = chooseNeuralRole(state, role);
      assert.equal(selected.step, previous.step, 'selecting a role cannot finish its action');
      const almost = advanceNeuralPuzzle(selected, selected.pending.duration - 1);
      assert.equal(almost.step, previous.step, 'the visual action finishes before progress is committed');
      state = advanceNeuralPuzzle(almost, 1);
      assert.equal(state.stage, stages[index]);
      assert.equal(state.step, steps[index]);
      assert.equal(state.doorTried, index >= 2);
      assert.equal(state.cameraMethod, method);
      assert.equal(state.pending, null);
      assert.equal(state.lastAction.elapsed, state.lastAction.duration);
      assert.deepEqual(selected, {...previous, role, pending: {...state.lastAction, elapsed: 0}, lastAction: null});
    });
    assert.deepEqual(original, createNeuralPuzzle(), 'the initial state is never mutated');
    for (const role of NEURAL_PUZZLE_ROLES) {
      state = chooseNeuralRole(state, role);
      assert.equal(state.stage, 'done');
      assert.equal(state.step, 5);
      assert.equal(state.pending, null, 'a completed puzzle does not restart when selecting a role');
    }
  });
}

test('wrong roles give the matching thought without erasing prior milestones', () => {
  const cases = [
    [0, ['pilot', 'diplomat'], 'wrong-camera'],
    [1, ['scoundrel', 'engineer', 'diplomat'], 'wrong-timing'],
    [2, ['scoundrel', 'pilot', 'diplomat'], 'wrong-radio'],
    [3, ['scoundrel', 'pilot'], 'wrong-dismiss'],
    [4, ['scoundrel', 'pilot', 'diplomat'], 'wrong-door'],
  ];
  for (const [step, roles, kind] of cases) {
    for (const first of ['scoundrel', 'engineer']) {
      const state = reach(step, first);
      for (const role of roles) {
        const selected = chooseNeuralRole(state, role);
        assert.equal(selected.pending.kind, kind);
        const result = advanceNeuralPuzzle(selected, selected.pending.duration);
        assert.equal(result.step, step);
        assert.equal(result.stage, state.stage);
        assert.equal(result.cameraMethod, state.cameraMethod);
        assert.equal(result.lastAction.kind, kind, 'thought remains available after the animation');
        assert.equal(result.pending, null);
      }
    }
  }
});

test('prematurely opening the door lets the guard close it without undoing the hacked radio', () => {
  const radioHacked = reach(3);
  const selected = chooseNeuralRole(radioHacked, 'engineer');
  assert.equal(selected.pending.kind, 'door-guard');
  assert.equal(selected.pending.duration, 8000);
  const halfway = advanceNeuralPuzzle(selected, 4000);
  assert.equal(halfway.stage, 'dismiss');
  const closed = advanceNeuralPuzzle(halfway, 4000);
  assert.equal(closed.stage, 'dismiss');
  assert.equal(closed.step, 3);
  assert.equal(closed.cameraMethod, 'stealth');
  assert.equal(closed.lastAction.kind, 'door-guard');
  const dismissed = finish(closed, 'diplomat');
  assert.equal(dismissed.stage, 'door');
  assert.equal(finish(dismissed, 'engineer').stage, 'done');
});

test('role changes and duplicate clicks cannot replace an unfinished action', () => {
  for (let step = 0; step < 5; step++) {
    const role = ['scoundrel', 'pilot', 'engineer', 'diplomat', 'engineer'][step];
    const selected = chooseNeuralRole(reach(step), role);
    const progress = advanceNeuralPuzzle(selected, 700);
    for (const other of NEURAL_PUZZLE_ROLES) {
      assert.equal(chooseNeuralRole(progress, other), progress);
    }
    assert.equal(progress.pending.elapsed, 700);
    assert.equal(progress.role, role);
  }
});

test('a large time jump completes only the chosen action and never chains subsequent steps', () => {
  const selected = chooseNeuralRole(createNeuralPuzzle(), 'engineer');
  const completed = advanceNeuralPuzzle(selected, 1000000);
  assert.equal(completed.stage, 'shutters');
  assert.equal(completed.step, 1);
  assert.equal(completed.lastAction.elapsed, 2500);
  assert.equal(advanceNeuralPuzzle(completed, 1000000), completed);
  assert.equal(finish(completed, 'engineer').stage, 'shutters', 'the engineer cannot skip the pilot milestone');
});

test('explicit reset restores all obstacles and clears pending actions and feedback', () => {
  const busy = chooseNeuralRole(reach(3), 'diplomat');
  assert.ok(busy.pending);
  const reset = createNeuralPuzzle();
  assert.deepEqual(reset, {stage: 'camera', step: 0, role: null, cameraMethod: null, doorTried: false, pending: null, lastAction: null});
  assert.notEqual(reset, createNeuralPuzzle());
  assert.equal(busy.stage, 'dismiss', 'reset does not mutate any previous state');
});

test('invalid roles and elapsed times do not alter puzzle progress', () => {
  const initial = createNeuralPuzzle();
  for (const role of [null, undefined, 'guard', '', 'Engineer']) assert.equal(chooseNeuralRole(initial, role), initial);
  const busy = chooseNeuralRole(initial, 'scoundrel');
  for (const elapsed of [-1, 0, NaN, Infinity, '1000']) assert.equal(advanceNeuralPuzzle(busy, elapsed), busy);
});



test('the first engineer attempt after the vents teaches why the guarded door cannot stay open', () => {
  const atGuard = reach(2);
  assert.equal(atGuard.doorTried, false);
  const first = chooseNeuralRole(atGuard, 'engineer');
  assert.equal(first.pending.kind, 'door-first');
  assert.equal(first.pending.duration, 8000);
  const almost = advanceNeuralPuzzle(first, 7999);
  assert.equal(almost.doorTried, false);
  assert.equal(almost.step, 2);
  const learned = advanceNeuralPuzzle(almost, 1);
  assert.equal(learned.doorTried, true);
  assert.equal(learned.step, 2);
  assert.equal(learned.stage, 'radio');
  assert.equal(learned.lastAction.kind, 'door-first');
  const radio = chooseNeuralRole(learned, 'engineer');
  assert.equal(radio.pending.kind, 'radio-hack');
  assert.equal(radio.pending.duration, 2500);
  const hacked = advanceNeuralPuzzle(radio, 2500);
  assert.equal(hacked.stage, 'dismiss');
  assert.equal(hacked.doorTried, true);
  for (const role of ['scoundrel', 'pilot', 'diplomat']) {
    const wrong = finish(learned, role);
    assert.equal(wrong.stage, 'radio');
    assert.equal(wrong.doorTried, true);
    assert.equal(chooseNeuralRole(wrong, 'engineer').pending.kind, 'radio-hack');
  }
  const dismiss = chooseNeuralRole(hacked, 'diplomat');
  assert.equal(dismiss.pending.duration, 14500, 'Departure has time for the guard’s additional comment');
});
