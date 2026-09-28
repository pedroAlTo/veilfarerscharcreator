/** Ordered shared-control puzzle. Only completed actions advance its milestones. */
export const NEURAL_PUZZLE_STAGES = Object.freeze(['camera', 'shutters', 'radio', 'dismiss', 'door', 'done']);
export const NEURAL_PUZZLE_ROLES = Object.freeze(['scoundrel', 'pilot', 'engineer', 'diplomat']);
export const NEURAL_PUZZLE_DURATIONS = Object.freeze({
  'camera-stealth': 2500,
  'camera-hack': 2500,
  shutters: 4000,
  'radio-hack': 2500,
  dismiss: 14500,
  'door-hack': 2500,
  'door-guard': 8000,
  'door-first': 8000,
  'wrong-camera': 2500,
  'wrong-timing': 2500,
  'wrong-radio': 2500,
  'wrong-dismiss': 2500,
  'wrong-door': 2500,
});

export function createNeuralPuzzle() {
  return {stage: 'camera', step: 0, role: null, cameraMethod: null, doorTried: false, pending: null, lastAction: null};
}

function actionFor(state, role) {
  const {stage, doorTried} = state;
  if (stage === 'camera') {
    if (role === 'scoundrel') return 'camera-stealth';
    if (role === 'engineer') return 'camera-hack';
    return 'wrong-camera';
  }
  if (stage === 'shutters') return role === 'pilot' ? 'shutters' : 'wrong-timing';
  if (stage === 'radio') return role === 'engineer' ? (doorTried ? 'radio-hack' : 'door-first') : 'wrong-radio';
  if (stage === 'dismiss') {
    if (role === 'diplomat') return 'dismiss';
    // An unlocked radio is not an absent guard: he can still close the door.
    return role === 'engineer' ? 'door-guard' : 'wrong-dismiss';
  }
  if (stage === 'door') return role === 'engineer' ? 'door-hack' : 'wrong-door';
  return null;
}

export function chooseNeuralRole(state, role) {
  if (!NEURAL_PUZZLE_ROLES.includes(role) || state.pending) return state;
  const kind = actionFor(state, role);
  if (!kind) return state.role === role ? state : {...state, role};
  return {...state, role, pending: {kind, role, duration: NEURAL_PUZZLE_DURATIONS[kind], elapsed: 0}, lastAction: null};
}

export function advanceNeuralPuzzle(state, deltaMs) {
  if (!state.pending || !Number.isFinite(deltaMs) || deltaMs <= 0) return state;
  const action = {...state.pending, elapsed: Math.min(state.pending.duration, state.pending.elapsed + deltaMs)};
  if (action.elapsed < action.duration) return {...state, pending: action};

  const success = action.kind === 'camera-stealth' || action.kind === 'camera-hack' ||
    action.kind === 'shutters' || action.kind === 'radio-hack' || action.kind === 'dismiss' || action.kind === 'door-hack';
  const step = success ? Math.min(NEURAL_PUZZLE_STAGES.length - 1, state.step + 1) : state.step;
  const cameraMethod = action.kind === 'camera-stealth' ? 'stealth' : action.kind === 'camera-hack' ? 'hack' : state.cameraMethod;
  const doorTried = state.doorTried || action.kind === 'door-first';
  // Excess time is deliberately discarded; choosing a role is required for each action.
  return {...state, step, stage: NEURAL_PUZZLE_STAGES[step], cameraMethod, doorTried, pending: null, lastAction: action};
}
