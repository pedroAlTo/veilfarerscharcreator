# VeilFarers Portal — Complete Handover v59.65

**Date:** 20 July 2026  
**Baseline:** v59.64  
**Release:** v59.65  
**Package version:** 59.65.0

## 1. Release objective

v59.65 resolves the remaining 3D dice lifecycle defect reported during live Player Tool testing:

> Start a 3D roll, close the visual box before the dice finish, and the active roll waits until the 14-second safety timeout before falling back.

The required behavior is now:

- closing the visual box immediately dismisses and cancels the visual simulation;
- the game roll still receives valid numerical values and completes normally;
- the roll queue is released immediately;
- the next roll can use the 3D renderer without reload or delay.

This release is built directly on v59.64 and retains its Massive damage and Keeper Notes fixes.

## 2. Diagnosis of the v59.64 behavior

### What v59.64 fixed

Before v59.64, closing the 3D box called `box.clear()` while DiceBox/Ammo was resolving. DiceBox did not complete its roll Promise, leaving Player Tool permanently locked with:

```text
A dice roll is already resolving.
```

v59.64 replaced the boolean lock with a serialized Promise queue and avoided clearing Babylon while `rollPending` was true. That eliminated the permanent lock.

### What remained broken

The visual renderer Promise could still remain unresolved after the stage was manually hidden. Player Tool's external safety timeout then fired after 14 seconds:

```text
3D dice unavailable; using the standard roller.
Error: The 3D dice roll did not finish and was safely released.
```

This proved the timeout was only preventing a permanent application lock. It was not actually cancelling the in-progress DiceBox operation.

### DiceBox behavior involved

DiceBox maintains public roll registries including:

```text
rollCollectionData
rollGroupData
rollDiceData
```

Each roll collection owns a Promise resolver. `clear()` resets the world and registries, but does not guarantee that an already-returned collection Promise settles.

Therefore a reliable manual-close path must do both:

1. settle the pending collection Promise;
2. clear the physical world.

## 3. v59.65 cancellation architecture

### Active controller

`assets/3d-dice/vf-dice3d.js` now tracks:

```text
activeRollController
rollSequence
rollPending
userDismissed
```

Each visual `roll()` or `add()` creates a controller containing:

```text
token
prepared dice groups
cancelled flag
fallback result
cancellation resolver
```

### Promise race

Every visual operation races:

```text
rendererPromise
vs.
cancellationPromise
```

Normal completion returns physical DiceBox results.

A manual close resolves the cancellation side of the race immediately.

### Settling DiceBox collections

Before clearing the physical world, `settlePendingDiceBoxPromises()` iterates the current DiceBox `rollCollectionData` and resolves outstanding collection Promises.

This prevents abandoned Promise chains and avoids accumulating unresolved operations after repeated closes.

### Numerical fallback for a dismissed visual roll

`createFallbackResult()` generates one standard numerical value for every die in the prepared visual groups, preserving:

- dice quantity;
- die sides;
- group order;
- theme metadata required by the caller.

The result is returned as:

```text
cancelled: true
reason: user-dismissed
values: [...]
```

This is not treated as a 3D renderer error. It is an intentional visual cancellation with a valid hidden game result.

### Queue release

`endCancellableRoll(token)` removes the matching active controller and updates `rollPending` in a `finally` block.

Consequences:

- a close cannot strand the queue;
- the next click does not wait for the 14-second timeout;
- subsequent 3D rolls reuse the initialized renderer normally;
- a page reload is not required.

## 4. Exact manual-close sequence

When the close button is pressed while physics is active:

1. `userDismissed` becomes true.
2. `cancelActiveRoll('user-dismissed')` is called.
3. A fallback result is generated for the active dice groups.
4. Pending DiceBox collection Promises are settled.
5. `box.clear()` stops and removes the active physical world.
6. The wrapper cancellation Promise resolves.
7. The stage and tactical HUD are hidden.
8. Player Tool continues the original game action using the returned numerical values.
9. Outcome processing and logging complete without reopening the dismissed HUD.
10. The active controller is released in `finally`.

The next independent roll calls `show(..., {newRoll:true})`, resets the dismissal state and starts a new DiceBox world.

## 5. Error-boundary decision

The 14-second timeout remains in `player-tool.jsx` and `player-tool.bundle.js` for genuine failures such as:

- unavailable WebGL;
- blocked WebAssembly;
- Ammo initialization failure;
- worker failure;
- missing renderer/theme assets;
- a real DiceBox operation that hangs without user dismissal.

A user closing the visual box is no longer classified as one of those failures.

Expected console behavior after manual dismissal:

```text
No "3D dice unavailable" warning caused by the close.
No "did not finish and was safely released" error caused by the close.
```

## 6. Massive behavior retained from v59.64

Massive operates on the final damage-die count after Proficiency and critical multiplication:

```text
candidate dice = final kept dice × 2
kept dice      = final normal damage-die count
```

Examples:

```text
Final 2d8+3 → roll 4d8 → keep highest 2 → add +3 once
Final critical 4d8+3 → roll 8d8 → keep highest 4 → add +3 once
```

The additional candidates use the weapon's actual damage die, not a hard-coded d8 for every weapon.

No Massive calculation code changed in v59.65.

## 7. Keeper Notes behavior retained from v59.64

Keeper Notes remain stored and filtered through authenticated server APIs.

Player Tool reads notes through:

```text
POST /api/table-api
{ action: "readSession", tableId }
```

Keeper Tool sends through:

```text
POST /api/table-api
{ action: "sendHandout", ... }
```

Retained decisions:

- the composer remains sticky in Keeper Console;
- only the table owner can send notes;
- all-player and private recipient filtering remains server-side;
- historical notes do not repeatedly auto-open;
- a just-sent note is protected from stale polling overwrite.

No Keeper Notes code changed in v59.65.

## 8. 3D deployment baseline retained

The release preserves all earlier production fixes:

### Case-sensitive renderer module

Both compatibility paths remain packaged:

```text
/assets/3d-dice/Dice.min.js
/assets/3d-dice/dice.min.js
```

The uppercase filename is required by imports on Netlify/Linux.

### WebAssembly CSP

Both `_headers` and `netlify.toml` retain:

```text
'wasm-unsafe-eval'
```

General JavaScript `'unsafe-eval'` remains disabled.

### Ammo path

```text
/assets/3d-dice/assets/ammo/ammo.wasm.wasm
```

remains present and unchanged.

### Release headers

Expected HTML response headers:

```text
X-VeilFarers-Release: v59.65
X-VeilFarers-CSP-Profile: wasm-3d-dice-v2
```

## 9. Changed files

### Functional

```text
assets/3d-dice/vf-dice3d.js
```

### Release/version metadata

```text
_headers
netlify.toml
package.json
package-lock.json
data/changelog.json
data/deploy-version.json
admin.html
armory.html
charsheet.html
creator.html
downloads.html
feedback.html
index.html
items.html
keeper-tool.html
login.html
player-tool.html
START_HERE.txt
```

### New release documentation

```text
GITHUB_DEPLOY_SUMMARY_v59.65.md
PORTAL_HANDOVER_v59.65.md
START_HERE_v59.65.txt
VALIDATION_v59.65.txt
SHA256_v59.65.txt
```

## 10. Explicitly unchanged

- `player-tool.jsx`.
- `player-tool.bundle.js`.
- Keeper Tool functional code.
- Keeper Notes server API.
- Netlify Functions.
- Firebase Admin configuration behavior.
- Firestore Rules.
- Character Creator and Charsheet workflows.
- Canonical rules datasets.
- Downloads and PDF files.
- DiceBox library binary.
- Babylon on-screen/off-screen worlds.
- Ammo WebAssembly binary.
- 3D themes and textures.
- Duality and damage game rules.

## 11. Deployment procedure

1. Create or switch to a test branch.
2. Extract `VeilFarers_Portal_v59.65.zip`.
3. Place the extracted contents directly at the repository and Netlify publish root.
4. Confirm these are siblings:

```text
_headers
netlify.toml
player-tool.html
assets/
data/
```

5. Commit and push.
6. Open the Netlify Deploy Preview.
7. Hard-refresh Player Tool.
8. Verify `/data/deploy-version.json` reports `v59.65`.
9. Run the acceptance matrix below.

No Firebase variable, migration or Firestore Rules deployment is required.

## 12. Acceptance matrix

### Primary regression

- Enable 3D dice.
- Start a Duality roll.
- Close the HUD before settlement.
- HUD closes immediately.
- Numerical outcome still resolves and logs.
- No 14-second wait.
- Roll again immediately.
- New 3D animation starts normally.
- Repeat ten times.

### Additional dice

- Trigger a feature that appends or adds dice.
- Close during the added-dice animation.
- The action completes numerically.
- The next independent 3D roll works.

### Massive

- Final `2d8+3`: physically roll four candidates when not dismissed, keep highest two.
- Close during that animation: numerical four-die candidate pool still resolves through fallback and selection remains valid.
- Critical final `4d8+3`: eight candidates, highest four kept.

### Keeper Notes

- Owner sends an all-player note.
- Connected Player Tools receive it.
- Owner sends a private note.
- Only intended player receives it.
- Sticky composer remains visible.

### Production assets and headers

- `Dice.min.js` HTTP 200.
- `ammo.wasm.wasm` HTTP 200.
- CSP includes `'wasm-unsafe-eval'`.
- Release header reports `v59.65`.

### Genuine failure fallback

- Simulate a true renderer failure.
- Player Tool falls back to standard numerical dice.
- Gameplay remains available.

## 13. Validation performed

- All JavaScript files passed `node --check`.
- All JSON files parsed successfully.
- All root HTML entry points were checked for duplicate IDs.
- Package, lockfile, changelog and deploy metadata align at v59.65 / 59.65.0.
- Cancellation markers and Promise-race paths are present in the production wrapper.
- A deterministic fixture executed:
  - ten pending rolls closed during motion;
  - one pending appended-dice operation closed during motion;
  - one subsequent normal 3D roll.
- Every dismissed operation resolved immediately.
- Every active controller and `rollPending` state was released.
- The subsequent normal 3D roll returned normally.
- All protected 3D binaries, Ammo and themes are byte-identical to v59.64.
- Player Tool gameplay files, Keeper Notes files, table API and Firestore Rules remain unchanged.

## 14. Known intentional behavior

Closing a visual roll before settlement means that roll can no longer use the physical orientation generated by Ammo, because the user explicitly terminated the visual simulation.

For that dismissed roll only:

- numerical values come from the existing standard random roller;
- the game action and log still complete;
- the visual HUD stays closed.

The next roll returns to normal 3D physics automatically.

## 15. Rollback

Redeploy `VeilFarers_Portal_v59.64.zip`.

No persistent-data rollback is required.

Rollback consequence: closing the HUD during an active physical roll may again leave DiceBox waiting until Player Tool's 14-second safety timeout.
