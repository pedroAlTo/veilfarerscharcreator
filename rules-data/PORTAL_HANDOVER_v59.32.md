# VeilFarers Portal — Technical Handover v59.32

## Decision

The user supplied the exact `59_25.zip` package and instructed that its lock-on be used **exactly, without visual or behavioral changes**.

That uploaded package is the authority for all lock-on behavior in v59.32.

## Implementation

### Byte-identical module restoration

The complete directory below was copied from the supplied v59.25 package:

`assets/3d-dice/`

A recursive comparison reports no differences between the source reference directory and the directory included in v59.32.

The key files have the following source-matching SHA-256 hashes:

- `vf-dice3d.js`: `f20f941e13dd9bb810fc1c722bf62ebc0dff86c28157983d3d0e813ab8b5fa7e`
- `vf-dice3d.css`: `b76d85e6617d445de1698453e8e0e8e4e71be47c49321990e616c0a7e5f822a2`

### Player Tool integration copied exactly

These source blocks were copied from the uploaded v59.25 `player-tool.html` and verified by SHA-256 equality:

- `rollVisualDice` + `showResolvedDice`
- `weaponDamagePlan` + `rollWeaponDamage`
- `rollDuality`

This restores:

- the original v59.25 renderer `add()` pathway
- simultaneous base damage + Duality launch
- critical extra-dice append behavior
- `cueRolls` mapping
- rejected probability-branch state
- exact Tactical Solution data passed to the lock-on UI

## Lock-on option

The current portal still needs the previously approved on/off option.

To avoid modifying the exact v59.25 module, disabling is implemented outside the reference files by hiding the lock-on visual layers. When enabled, the v59.25 module and styling remain unmodified.

## Preserved current work

- welcome page
- loading screen
- portal routing
- security baseline
- current canonical data
- v59.31 Charsheet/PDF layout corrections

## Files changed

- `assets/3d-dice/**`
- `player-tool.html`
- `data/changelog.json`
- `START_HERE.txt`
- release documentation

## Superseded builds

The lock-on interpretations in v59.29, v59.30 and v59.31 are superseded by the supplied v59.25 source implementation.

## QA priority

The first Deploy Preview test must compare v59.32 side by side with the uploaded v59.25 package, focusing on:

- ring scale and position
- winner lock
- loser branch rejection
- damage lock
- Tactical Solution panel
- critical append behavior

## Rollback

Redeploy v59.31.
