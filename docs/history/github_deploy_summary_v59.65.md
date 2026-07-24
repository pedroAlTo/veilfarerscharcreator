# VeilFarers Portal v59.65 — Immediate 3D Dice Dismissal Recovery

## Summary

This release fixes the remaining Player Tool failure caused by closing the 3D dice HUD while Ammo physics is still resolving.

In v59.64, the close action hid the visual stage and protected the renderer from an unsafe immediate clear. However, DiceBox could still leave its internal roll Promise pending. The Player Tool then waited until the external 14-second safety timeout and reported:

```text
3D dice unavailable; using the standard roller.
Error: The 3D dice roll did not finish and was safely released.
```

v59.65 implements an explicit cancellation transaction. A manual close now settles the active DiceBox collection, stops the visual physics world, produces valid hidden numerical values through the existing standard roller, and releases the Player Tool roll queue immediately. The next 3D roll starts normally without waiting for the timeout.

## Root cause

`@3d-dice/dice-box` stores each visual roll in an internal collection Promise. Calling `clear()` resets the physical world and collection registries, but it does not automatically resolve a roll Promise that was already in progress.

The v59.64 approach avoided clearing the renderer while `rollPending` was true, but closing the HUD could still interfere with the Babylon/Ammo completion path. Consequently, the Promise could remain unresolved until Player Tool's external timeout fired.

The timeout was a safety fuse, not a true cancellation mechanism.

## Changes

### Cancellable visual-roll transaction

`assets/3d-dice/vf-dice3d.js` now maintains one explicit active-roll controller containing:

- a unique roll token;
- the prepared dice groups;
- cancellation state;
- a cancellation Promise;
- a prepared numerical fallback result.

Every `roll()` and `add()` operation races the renderer Promise against that cancellation Promise.

### Manual-close behavior

When the user presses the 3D HUD close button while a roll is active:

1. The roll is marked as user-dismissed.
2. Pending DiceBox collection Promises are settled.
3. The active Ammo/Babylon dice world is cleared.
4. Valid numerical values are generated for the same number and type of dice.
5. The wrapper resolves with `cancelled: true` rather than throwing.
6. Player Tool completes and logs the game roll normally.
7. `rollPending` and the active controller are released immediately.
8. The next requested roll may use the 3D renderer normally.

The visual window remains closed for the dismissed roll and is not reopened by its later outcome or cue processing.

### Genuine renderer failures

The existing 14-second timeout remains in Player Tool for actual renderer failures where no explicit user dismissal occurs.

This preserves the standard fallback for WebGL, WebAssembly, worker, theme or physics failures while preventing a normal user close from being misreported as a renderer outage.

## Retained behavior from v59.64

- Massive rolls twice the final damage-die count and keeps the highest half.
- Example: final `2d8+3` rolls `4d8`, keeps the highest two and adds `+3` once.
- Critical Massive final `4d8+3` rolls `8d8` and keeps the highest four.
- Keeper Notes use authenticated `readSession` polling.
- Keeper Notes composer remains sticky and table-owner only.
- Exact `Dice.min.js` filename casing remains packaged.
- Ammo WebAssembly CSP permission remains `'wasm-unsafe-eval'`.
- Both `Dice.min.js` and `dice.min.js` compatibility files remain.
- The standard numerical roller remains available as a fallback.

## Files changed

Functional change:

```text
assets/3d-dice/vf-dice3d.js
```

Release and deployment metadata:

```text
_headers
netlify.toml
package.json
package-lock.json
data/changelog.json
data/deploy-version.json
all root HTML release meta markers
START_HERE.txt
```

New release documentation:

```text
GITHUB_DEPLOY_SUMMARY_v59.65.md
PORTAL_HANDOVER_v59.65.md
START_HERE_v59.65.txt
VALIDATION_v59.65.txt
SHA256_v59.65.txt
```

## Explicitly unchanged

- Player Tool gameplay and damage calculation code.
- Massive, Proficiency, critical and Brutal calculations introduced in v59.64.
- Duality Hope/Fear rules.
- Roll-log format.
- Keeper Notes API and authorization.
- Keeper Tool interface and console layout.
- Netlify Functions and Firebase collection paths.
- Firestore Rules.
- Canonical VeilFarers rules datasets.
- DiceBox, Babylon, worker and Ammo binaries.
- Dice themes and textures.
- CSP profile other than the release marker update.

## Deployment

1. Replace the repository/publish root with the contents of `VeilFarers_Portal_v59.65.zip`.
2. Confirm these paths are at the published root:

```text
/_headers
/netlify.toml
/player-tool.html
/assets/3d-dice/vf-dice3d.js
/data/deploy-version.json
```

3. Commit and push to a test branch.
4. Allow Netlify to create a Deploy Preview.
5. Hard-refresh Player Tool before testing.

No Firebase migration, environment-variable change or Firestore Rules deployment is required.

## Priority acceptance tests

### Close during motion

1. Enable 3D dice.
2. Start a Duality roll.
3. Close the 3D HUD while the dice are visibly moving.
4. Confirm the HUD closes immediately.
5. Confirm the roll still resolves numerically and appears in the log.
6. Immediately roll again.
7. Confirm the new 3D roll opens and animates normally.
8. Confirm no 14-second delay occurs.
9. Confirm the console does not report the dismissed roll as `3D dice unavailable`.

### Repetition

Repeat the close-and-reroll sequence at least ten times using:

- Duality rolls;
- standard dice;
- Massive damage pools;
- critical damage pools;
- additional/append dice.

Every dismissed roll must release immediately and every subsequent roll must remain available.

### Genuine failure fallback

Temporarily block the renderer asset or use an unsupported environment and confirm that a genuine renderer failure still activates the standard numerical fallback rather than blocking gameplay.

### Preservation

- `/data/deploy-version.json` reports `v59.65`.
- HTML responses include `X-VeilFarers-Release: v59.65`.
- CSP still includes `'wasm-unsafe-eval'`.
- `/assets/3d-dice/Dice.min.js` returns HTTP 200.
- `/assets/3d-dice/assets/ammo/ammo.wasm.wasm` returns HTTP 200.
- Keeper Notes and Massive behavior continue to pass their v59.64 tests.

## Validation result

- All JavaScript files pass syntax validation.
- All JSON files parse successfully.
- All root HTML files contain no duplicate IDs.
- Version metadata aligns at `v59.65` / `59.65.0`.
- A deterministic lifecycle fixture completed ten cancelled visual rolls and one cancelled append roll without timeout.
- The fixture then completed a normal subsequent 3D roll successfully.
- Protected DiceBox, Babylon, worker, Ammo and theme assets remain byte-identical to v59.64.
- Player Tool, Keeper Notes, table API and Firestore Rules behavior files remain unchanged.

## Risk assessment

**Risk level: Low to medium.**

The change is isolated to the wrapper lifecycle around a manually dismissed visual roll. A dismissed visual roll intentionally transitions to the already-supported standard numerical generator for that roll. Persistent data, game rules, cloud authorization and renderer binaries are not modified.

## Rollback

Redeploy `VeilFarers_Portal_v59.64.zip`.

No database or Firebase rollback is required. Rolling back restores the behavior where closing the HUD during motion may leave the visual Promise pending until the 14-second safety timeout.
