# VeilFarers Portal v59.33 — Creator / Level-Up / Player Inventory Fix Pack

## PR title

`Deploy VeilFarers Portal v59.33`

## Suggested branch

`release/portal-v59.33-creator-levelup-player-inventory`

## Intent

This release addresses the specific usability issues reported in the current portal build while keeping the workflow aligned with the current VeilFarers system baseline.

## Main changes

### 1) Character Creator subclass selection restored

Step 3 now renders subclass choices directly inside the creator instead of relying on the broken selection flow.

What changed:

- class selection now reveals the subclass deck inline
- subclass cards can be selected directly from Step 3
- the creator keeps the selected subclass visible and persistent when loading a saved draft

### 2) Card Library button replaced with Level Up in Character Creator

The secondary Creator mode no longer opens the old Card Library surface.

It now opens a dedicated **Level Up** workspace that:

- stores character level in the creator draft
- stores current proficiency
- enforces the automatic Tier Achievement proficiency floor
- previews Sleeping Honed Edge from level
- provides advancement notes for later sheet updates
- links back to the Charsheet for the full level-up / printable workflow

This keeps progression tracking in the creator while avoiding non-canonical new mechanics.

### 3) Player Tool inventory now includes augmentations

The Player Tool inventory panel now supports augmentation tracking directly.

What changed:

- augmentation list is now embedded inside the Inventory block
- augmentations can be added, edited and removed locally per character
- each augmentation records name, tier and benefit
- the existing imported augmentation data remains visible in Player Tool

### 4) `+` tab action now offers Character / Drone choice

The top `+` action in Player Tool is now a chooser.

What changed:

- selecting **Character** creates a normal character tab
- **Drone** is intentionally present only as a disabled “Soon” option
- no drone implementation is introduced in this release

### 5) Welcome page visual cleanup

The landing page received the requested presentation cleanup.

What changed:

- removed / softened the unwanted grey hero line
- added side LED activity particles to suggest station-light activity
- swapped the obsolete **Card Library** homepage card for **Level Up**
- reused creator artwork on key portal cards for stronger visual continuity

## Files intentionally changed

- `creator.html`
- `player-tool.html`
- `index.html`
- `welcome.css`
- `data/changelog.json`
- `GITHUB_DEPLOY_SUMMARY_v59.33.md`
- `PORTAL_HANDOVER_v59.33.md`
- `VALIDATION_v59.33.txt`

## QA checklist

1. Open Character Creator and confirm Step 3 allows direct subclass selection.
2. Save and reload a creator draft and confirm subclass persists.
3. Open the Creator secondary mode and confirm it now shows Level Up instead of Card Library.
4. Change level in Creator and confirm proficiency cannot drop below the correct floor.
5. Open Player Tool and confirm the `+` button opens Character / Drone choices.
6. Confirm Character creates a new tab and Drone remains disabled / coming soon.
7. Open Inventory in Player Tool and add, edit and remove augmentations.
8. Confirm legacy inventory slots still work normally.
9. Open the welcome page and confirm the grey line is gone or visually neutralized.
10. Confirm the welcome page shows animated side activity particles and the Level Up card.

## Rollback

Redeploy v59.32 if needed. No data migration is required beyond additional optional creator/player fields.
