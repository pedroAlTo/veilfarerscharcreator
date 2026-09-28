import test from 'node:test';
import assert from 'node:assert/strict';
import {createNeuralPuzzle, chooseNeuralRole, advanceNeuralPuzzle} from '../public/drone-neural-puzzle.mjs';
import {neuralSceneFrame,neuralEpilogueFrame,NEURAL_AWARD_HOLD_MS} from '../public/drone-shared.mjs';
import {NEURAL_COPY} from '../public/drone-neural-copy.mjs';

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

test('victory holds for seventeen seconds before the doorway conversation',()=>{
 assert.equal(neuralEpilogueFrame(0).phase,'award');
 assert.equal(neuralEpilogueFrame(NEURAL_AWARD_HOLD_MS-1).phase,'award');
 assert.deepEqual(neuralEpilogueFrame(NEURAL_AWARD_HOLD_MS).lineIndex,0);
 const lines=new Set();
 for(let ms=NEURAL_AWARD_HOLD_MS;ms<50000;ms+=100)if(neuralEpilogueFrame(ms).phase==='dialogue')lines.add(neuralEpilogueFrame(ms).lineIndex);
 assert.deepEqual([...lines],[0,1,2,3,4,5,6,7]);
});

test('the crew mourns K3nn1, the base alarms, and only then does the door close',()=>{
 const times={};
 for(let ms=0;ms<60000;ms+=20){const frame=neuralEpilogueFrame(ms);times[frame.phase]??=ms;}
 assert.ok(times.dialogue<times.volley&&times.volley<times.crash&&times.crash<times.aftermath&&times.aftermath<times.lockdown&&times.lockdown<times.closing&&times.closing<times.curse);
 const volley=neuralEpilogueFrame(times.volley+1000);
 assert.equal(volley.door,7);
 assert.equal(volley.shots.filter(s=>s.kind==='missile').length,3);
 assert.equal(volley.shots.filter(s=>s.kind==='laser').length,3);
 assert.ok(volley.shots.some(s=>s.active&&s.kind==='missile'));
 assert.ok(volley.shots.some(s=>s.active&&s.kind==='laser'));
 assert.ok(times.crash-times.volley<2000,'The faster volley ends before two seconds');
 const arc=neuralEpilogueFrame(times.crash+700);
 assert.ok(arc.crashProgress>0&&arc.crashProgress<1);
 assert.equal(arc.broken,false);
 const broken=neuralEpilogueFrame(times.crash+1900);
 assert.equal(broken.broken,true);
 assert.equal(broken.deathFrame,3,'The crash reuses the eleven-frames-per-second Fragility sequence');
 assert.ok(neuralEpilogueFrame(times.crash+3300).deathFrame>broken.deathFrame);
 assert.equal(neuralEpilogueFrame(times.aftermath).lineIndex,0);
 assert.equal(neuralEpilogueFrame(times.aftermath+2700).lineIndex,1);
 assert.equal(neuralEpilogueFrame(times.aftermath+4800).door,7);
 assert.equal(neuralEpilogueFrame(times.lockdown).door,7);
 assert.ok(times.closing-times.lockdown>=3000,'The red lockdown warning holds before the door closes');
 assert.equal(neuralEpilogueFrame(times.curse).door,0);
 assert.deepEqual(NEURAL_COPY.es.aftermath,[['engineer','¡Han matado a K3nn1!'],['diplomat','¡Cabrones!']]);
 assert.deepEqual(NEURAL_COPY.en.aftermath,[['engineer','They killed K3nn1!'],['diplomat','Bastards!']]);
});
