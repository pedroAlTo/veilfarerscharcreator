# VeilFarers Portal v59.34 — Handover Notes

## Release focus

This release is a UX and loadout-management refinement pass.

It resolves:

- abrupt image cut-offs on the portal homepage
- hero art not blending properly into the dark background
- augmentation management being too primitive compared with weapons
- missing armor tracking in Player Tool
- missing canonical item loadout support in inventory
- subclass selection in Character Creator still failing for some flows

## Canon / rules note

No new rules or mechanics were invented.

The new Player Tool sections only expose and manage canonical data already present in:

- `/rules-data/core/armor.json`
- `/rules-data/core/augments.json`
- `/rules-data/core/gear.json`

## Changed behaviors

### Character Creator

- Step 3 now includes a subclass quick-select fallback beneath the subclass card deck
- this prevents the creator from getting blocked if the card-only selection path fails to render as expected

### Welcome page

- hero image transition is softer and better integrated with the page background
- tool-card character art now fills the visual area more cleanly
- artwork fades into the panel instead of ending with a harsh visible crop

### Player Tool

- **Weapons** keep the existing loadout manager
- **Armor** now has its own loadout manager and active state
- **Augmentations** now have inventory state and active state
- **Item Loadout** now reads from the canonical gear dataset
- **Free-text inventory lines** remain available for notes / custom objects

## Compatibility

- previous Player Tool saves still load
- old `augments` arrays are normalized into the new augmentation inventory structure
- no destructive migration is introduced
- old free-text inventory notes are preserved

## Recommended post-deploy smoke test

- Character Creator: choose a class and confirm subclass selection remains visible and progression works
- Welcome page: inspect hero blend and card image fades
- Player Tool: add 2 armor pieces, set one active, reload
- Player Tool: add 2 augmentations, activate one or more, reload
- Player Tool: add 2 gear items from catalog, confirm they appear in Item Loadout
- Player Tool: confirm free-text inventory lines are still editable
