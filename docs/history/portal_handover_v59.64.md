# VeilFarers Portal — Complete Handover v59.64

**Date:** 20 July 2026  
**Baseline:** v59.63  
**Release:** v59.64  
**Package version:** 59.64.0

## 1. Release objective

v59.64 combines three live-test corrections:

- scale the Massive weapon property correctly when Proficiency or critical damage increases the final number of damage dice;
- make the 3D dice HUD safely dismissible without permanently locking future rolls;
- restore Keeper Notes delivery from the secured server subcollection and keep its controls consistently visible in Keeper Console.

The release preserves all previous portal, Character Creator, Character Vault, table-security, CSP and 3D asset fixes.

## 2. Massive damage decision

### Canonical application behavior for the tool

For a weapon with Massive:

1. Calculate the final normal damage-die count after Proficiency.
2. Apply the critical multiplier when relevant.
3. Roll one additional candidate die for every die that would normally be kept.
4. Keep exactly the normal final number of dice.
5. Select the highest results.
6. Apply the static weapon modifier and other valid bonuses once.

Equivalent algorithm:

```text
normalCount = baseDamageDice × proficiency
keptCount   = normalCount × criticalMultiplier
rolledCount = keptCount × 2 when Massive
```

### Required examples

Normal final damage:

```text
2d8+3 → roll 4d8 → keep highest 2 → +3
```

Critical final damage:

```text
4d8+3 → roll 8d8 → keep highest 4 → +3
```

The extra candidates always use the weapon’s damage die size. They are not globally forced to d8 for weapons that use another die.

### Implementation

`weaponDamagePlan()` now returns:

- `keptCount`: the final normal count;
- `rolledCount`: `keptCount × 2` for Massive;
- `initialRolledCount`: `normalCount × 2` for the initial attack roll before critical status is known.

`rollWeaponDamage()` ranks all post-Brutal results by value, keeps the highest `keptCount`, and records every other physical die as discarded for HUD cues and logging.

Brutal rerolls are resolved before Massive selects the highest dice.

## 3. 3D dice permanent-lock diagnosis

### Previous failure

The close button called `hide()`, and `hide()` always called:

```text
box.clear()
```

If DiceBox/Ammo physics was still resolving, clearing the world could prevent its Promise from settling. `rollVisualDice()` remained inside its `await`, so `rollInFlightRef.current` never returned to false. Every later click threw:

```text
A dice roll is already resolving.
```

### v59.64 lifecycle

- `rollInFlightRef` now stores the active queued Promise rather than a raw boolean.
- New visual requests are serialized instead of throwing an uncaught Promise error.
- DiceBox `roll()` and `add()` have a 14-second external safety timeout.
- `vf-dice3d.js` tracks `rollPending` and `userDismissed`.
- Manual close hides the stage but does not clear the Babylon world while `rollPending` is true.
- The numerical result and log operation can finish even when the player closes the visual box.
- Additional critical/Brutal dice do not reopen a manually dismissed HUD.
- The next independent roll clears the old hidden world before starting.

### Babylon warning

The custom cue code wrote `visibility` on instanced meshes. Babylon reports that this has no effect. v59.64 removes those writes and retains visual state through:

- overlay color/alpha;
- outline color/width;
- per-instance custom color when available.

The warning was cosmetic and not the cause of the roll lock, but it is now removed.

## 4. Keeper Notes diagnosis

### Data architecture

Since v59.55, notes are stored securely as individual documents:

```text
artifacts/default-app-id/public/data/sessions/{tableId}/handouts/{noteId}
```

`table-api` returns only notes the authenticated user is allowed to receive.

### Previous Player Tool bug

Player Tool continued to read:

```text
session.handouts
```

from its direct Firestore snapshot. New secure notes were no longer written into that legacy parent array. Therefore:

- the Keeper could receive a successful send response;
- the note existed in the secured subcollection;
- Player Tool never received it.

### v59.64 delivery path

While connected, Player Tool now polls authenticated:

```text
POST /api/table-api
{ action: "readSession", tableId }
```

at a controlled 1.25-second interval and takes `session.handouts` from the server response. The server has already merged current subcollection notes with any legacy records and applied recipient filtering.

The direct Firestore snapshot remains responsible for rapid character, Fear, Spotlight and roll-history synchronization. Its legacy `data.handouts` field is accepted only when non-empty and can no longer overwrite a valid secured note list with an empty array.

### Auto-open behavior

- New notes sent after connection auto-open once.
- Previously seen note IDs remain stored per table in local storage.
- Historical notes remain available but are not repeatedly reopened.
- `all` notes are delivered to every authenticated table member.
- Private notes rely on server-side recipient filtering and local identity/character matching.

## 5. Keeper Console visibility

The Player Notes composer is now a sticky dock inside the Keeper Console scroll region.

It contains:

- a persistent **Compose Note** action;
- connection/authorization status;
- the newest sent handouts;
- a compact scrollable history.

A short local mutation guard prevents an in-flight pre-send polling result from temporarily replacing the newly returned note. An authoritative read is scheduled immediately after a successful send.

## 6. Authorization decision

Keeper Notes remain **table-owner only** on the server. This is intentionally unchanged.

v59.64 makes that boundary visible in the UI:

- table owner: composer enabled;
- member/non-owner: composer disabled with an explicit owner-only message.

Portal account roles and table ownership remain separate concepts.

## 7. CSP and 3D baseline retained

The release preserves:

- exact `Dice.min.js` casing for Netlify/Linux;
- `ammo.wasm.wasm` location;
- `_headers` and `netlify.toml` CSP containing `'wasm-unsafe-eval'`;
- release/CSP response headers;
- WebAssembly preflight;
- standard numerical fallback when 3D cannot initialize.

## 8. Changed files

Functional changes:

```text
player-tool.jsx
player-tool.bundle.js
keeper-tool.html
keeper-player.css
assets/3d-dice/vf-dice3d.js
assets/3d-dice/world.onscreen.min.js
```

Release/version changes:

```text
_headers
netlify.toml
package.json
package-lock.json
data/changelog.json
data/deploy-version.json
root HTML release metadata
START_HERE.txt
```

New release documentation:

```text
GITHUB_DEPLOY_SUMMARY_v59.64.md
PORTAL_HANDOVER_v59.64.md
START_HERE_v59.64.txt
VALIDATION_v59.64.txt
```

## 9. Explicitly unchanged

- Character Creator flow and canonical datasets.
- Character Vault allocation/import behavior.
- Keeper campaign JSON structure.
- Firestore Rules.
- Netlify Functions collection layout.
- Table password, invitation, membership and owner security.
- Duality outcome rules.
- Hope/Fear resource behavior.
- Weapon data and book text.
- 3D themes, Ammo binary and theme textures.

## 10. Deployment procedure

1. Create or switch to a test branch.
2. Extract `VeilFarers_Portal_v59.64.zip`.
3. Place the extracted contents directly at repository/publish root.
4. Confirm `_headers`, `netlify.toml`, `player-tool.html` and `assets/` are siblings.
5. Commit and push.
6. Use the Netlify Deploy Preview.
7. Hard-refresh Player Tool and Keeper Tool.
8. Run the acceptance tests below.

No Firebase variable, migration or Firestore Rules change is required.

## 11. Acceptance matrix

### Massive

- Final 2d8+3: four physical d8s, top two kept.
- Final critical 4d8+3: eight physical d8s, top four kept.
- Ties remain deterministic by original die index.
- Modifier is applied once.
- Dropped dice receive DROP cues and do not contribute to damage.

### 3D lifecycle

- Close while dice are moving; next roll succeeds.
- Close after settlement; next roll succeeds.
- Repeat close/roll sequence at least five times.
- No uncaught `already resolving` errors.
- No Babylon instanced-mesh visibility warning.
- Roll log still receives the completed result after visual dismissal.
- 2D mode remains unaffected.

### Keeper Notes

- Owner composer always visible while scrolling console.
- All-player note opens for multiple connected players.
- Private note opens only for the chosen player.
- Sent list persists after server refresh.
- A stale polling response does not erase a just-sent note.
- Non-owner composer is disabled with explicit status.
- Reload does not repeatedly auto-open old notes.

### Production headers/assets

- `/data/deploy-version.json` = v59.64.
- HTML response has `X-VeilFarers-Release: v59.64`.
- CSP includes `'wasm-unsafe-eval'`.
- `Dice.min.js` returns 200.
- `ammo.wasm.wasm` returns 200 with a WASM-compatible content type.

## 12. Console-message interpretation

The message:

```text
A listener indicated an asynchronous response by returning true, but the message channel closed...
```

is not emitted by the VeilFarers dice stack shown in this package. It is commonly associated with a browser extension message listener. Validate in a clean/incognito profile if it continues; it should not block portal rolls.

## 13. Rollback

Redeploy v59.63. No persistent data rollback is required.

Rollback consequences:

- Massive returns to one fixed extra candidate die;
- closing during a pending 3D roll can restore the permanent lock;
- Player Tool returns to the obsolete parent handout source;
- Keeper Notes may again fail to reach players.
