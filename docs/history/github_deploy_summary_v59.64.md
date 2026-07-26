# VeilFarers Portal v59.64 — Massive Pools, Recoverable 3D Rolls and Reliable Keeper Notes

## Summary

This release fixes three connected Player/Keeper Tool issues found during live Netlify testing:

1. **Massive damage did not scale its extra candidate dice with Proficiency or critical damage.**
2. **Closing the 3D dice box during resolution could leave the roller permanently locked as “already resolving”.**
3. **Keeper Notes were stored correctly by the server but Player Tool still watched the obsolete parent-session handout array, so secured notes could fail to reach players. The note composer could also scroll out of view in Keeper Console.**

v59.64 retains the Netlify case-sensitivity and WebAssembly CSP fixes from v59.60–v59.63.

## Changes

### Massive damage pools

Massive now operates on the **final normal damage-die count**, after Proficiency and critical multiplication:

```text
candidate dice = final normal damage dice × 2
kept dice      = final normal damage dice
```

The highest dice are kept; every other candidate die is marked as discarded. The weapon/static modifier is applied once after summing the kept dice.

Examples:

- Final `2d8+3` damage → roll `4d8`, keep the highest `2`, then add `+3`.
- Final critical `4d8+3` damage → roll `8d8`, keep the highest `4`, then add `+3`.

The implementation is generic: a Massive d10 weapon adds d10 candidates, a Massive d12 weapon adds d12 candidates, and so on.

### Recoverable 3D dice lifecycle

- Replaced the hard error thrown when another visual roll is resolving with a serialized Promise queue.
- Added a 14-second safety timeout around each DiceBox roll/add operation.
- Manual close now hides the 3D HUD without calling `box.clear()` while physics is still resolving.
- The current numerical roll is allowed to finish safely in the background.
- If the player dismissed the box, critical/additional dice do not unexpectedly reopen it.
- The next new roll clears the dismissed previous world before showing new dice.
- Removed unsupported Babylon `visibility` writes on instanced meshes; winner/discard cues continue through overlay, outline and custom-color effects.

This prevents the permanent:

```text
Error: A dice roll is already resolving.
```

state after closing the 3D box.

### Keeper Notes delivery and visibility

- Player Tool now retrieves Keeper Notes through authenticated `table-api` `readSession` polling.
- This matches the secured `sessions/{tableId}/handouts/{noteId}` subcollection introduced in v59.55.
- The obsolete parent `session.handouts` array is retained only as a non-empty legacy compatibility source and can no longer wipe the server-delivered note list.
- New notes continue to auto-open once for the intended player or all table players.
- Keeper Console now has a sticky **Player Notes** dock that remains visible while the console scrolls.
- The dock shows send readiness and the latest sent handouts.
- A short mutation guard prevents an already-running stale poll from temporarily erasing a just-sent note.
- The server-side owner-only boundary is unchanged; non-owners now receive a clear disabled state instead of a misleading composer.

## Files changed

- `player-tool.jsx`
- `player-tool.bundle.js`
- `keeper-tool.html`
- `keeper-player.css`
- `assets/3d-dice/vf-dice3d.js`
- `assets/3d-dice/world.onscreen.min.js`
- `_headers`
- `netlify.toml`
- portal HTML release markers
- `package.json`
- `package-lock.json`
- `data/changelog.json`
- `data/deploy-version.json`
- release documentation

## Explicitly unchanged

- Canonical weapon statistics and book text.
- Proficiency and critical multipliers outside the requested Massive selection behavior.
- Hope/Fear Duality resolution.
- Damage modifiers, Honed and Paired calculations.
- Firebase collection paths and Firestore Rules.
- Table membership and table-owner authorization boundaries.
- Netlify Identity behavior.
- WebAssembly CSP profile from v59.63.
- `Dice.min.js` case-sensitive compatibility file.
- Ammo WASM and all dice theme textures.

## Deployment

1. Replace the repository root with the contents of `VeilFarers_Portal_v59.64.zip`.
2. Confirm `_headers`, `netlify.toml`, `player-tool.html` and `assets/` are at the published root.
3. Commit and push to a test branch.
4. Let Netlify create a Deploy Preview.
5. Perform a hard refresh before testing Player Tool.

No Firebase migration, Firestore Rules deployment or environment-variable change is required for this release.

## Acceptance tests

### Massive

1. Equip a Massive weapon whose final normal damage is `2d8+3`.
2. Roll damage.
3. Confirm four d8s are physically rolled.
4. Confirm the two highest are marked KEEP and the other two DROP.
5. Confirm total = highest two dice + 3.
6. Trigger a critical and confirm eight d8s are rolled, with the highest four kept.

### 3D close/reopen

1. Start a 3D Duality roll.
2. Close the 3D box before or immediately after settlement.
3. Roll again.
4. Confirm the new roll starts normally.
5. Repeat several times and confirm no `A dice roll is already resolving` exception appears.
6. Confirm the previous result still reaches the roll log when the HUD was closed during physics.
7. Confirm the Babylon instanced-mesh visibility warning no longer appears.

### Keeper Notes

1. Connect Keeper Tool as the table owner.
2. Confirm the Player Notes dock remains visible while scrolling Keeper Console.
3. Send a note to all players.
4. Confirm the note appears in the Keeper sent list and opens on each connected Player Tool within the polling interval.
5. Send a private note and confirm only the intended authenticated player receives it.
6. Reload Player Tool and confirm historical notes remain available without reopening as new notes.
7. Join Keeper Tool as a non-owner and confirm the composer clearly indicates owner-only access.

### Preservation

- Confirm `/data/deploy-version.json` reports `v59.64`.
- Confirm `X-VeilFarers-Release: v59.64` is present on deployed HTML responses.
- Confirm CSP still contains `'wasm-unsafe-eval'`.
- Confirm `Dice.min.js` and `ammo.wasm.wasm` return HTTP 200.

## Risk assessment

**Risk level: Medium-low.**

The release changes asynchronous dice lifecycle handling and note delivery polling but does not migrate stored data or alter server authorization. The numerical fallback remains available if the 3D renderer fails.

## Rollback

Redeploy `VeilFarers_Portal_v59.63_Deploy_CSP_3D_Dice_Hotfix.zip`.

No database, Firebase or Firestore rollback is required. Rolling back will restore the old Massive behavior, the close-induced roll lock and the obsolete Player Tool note source.
