# VeilFarers Portal v59.32 — Exact v59.25 Lock-On Restoration

## PR title

`Replace current deploy with VeilFarers Portal v59.32`

## Suggested branch

`release/portal-v59.32-exact-v59.25-lock-on`

## Source of truth

The lock-on implementation in this release comes directly from the user-supplied `59_25.zip` package. It was not recreated from screenshots or approximated from later builds.

## Main changes

### Exact v59.25 3D dice package

The complete `assets/3d-dice/` directory was copied from the supplied v59.25 package. The copied directory is byte-identical to the reference.

This restores exactly:

- the v59.25 quantum lock-on appearance
- tracking-ring geometry and telemetry
- aperture/lock transitions
- selected Hope/Fear winner treatment
- shutdown of the non-selected probability branch
- Tactical Solution panel
- damage-vector presentation
- cue timing and close timing
- v59.25 renderer add/append behavior

### Exact v59.25 Player Tool roll integration

The following Player Tool blocks were copied exactly from the supplied v59.25 source:

- `rollVisualDice`
- `showResolvedDice`
- `weaponDamagePlan`
- `rollWeaponDamage`
- `rollDuality`

This restores the original flow in which:

- base weapon-damage dice launch together with Hope/Fear
- the non-selected Duality branch is rejected/deactivated
- critical-only extra damage dice are appended afterward
- the original base dice remain physically present
- Massive and Brutal logic use the v59.25 implementation

## Preserved later work

This restoration does not remove:

- welcome portal
- Player Tool loading screen and lore feed
- security baseline
- Keeper Tool under-construction state
- Charsheet/PDF spacing and header fixes from v59.31
- persistent lock-on option in Player Tool settings

When the lock-on option is enabled, the visual implementation is the exact v59.25 implementation. The option disables the visual layers externally, without modifying the reference lock-on module.

## Files intentionally changed

- complete `assets/3d-dice/` directory
- `player-tool.html`
- `data/changelog.json`
- `START_HERE.txt`
- `GITHUB_DEPLOY_SUMMARY_v59.32.md`
- `PORTAL_HANDOVER_v59.32.md`
- `VALIDATION_v59.32.txt`

## QA checklist

1. Enable 3D dice and lock-on in Player Tool options.
2. Perform a normal Duality roll.
3. Confirm the lock-on matches the supplied v59.25 build exactly.
4. Confirm the non-selected Hope/Fear probability branch powers down.
5. Perform a weapon attack and confirm base damage dice launch with Hope/Fear.
6. Trigger a critical and confirm only additional damage dice are appended.
7. Confirm the original dice remain visible and are not replaced.
8. Confirm Massive and Brutal behavior.
9. Disable lock-on in options and confirm the lock visual layers disappear.
10. Confirm the v59.31 Charsheet/PDF fixes remain present.

## Rollback

Redeploy v59.31 if needed. No persistent data migration is introduced.
