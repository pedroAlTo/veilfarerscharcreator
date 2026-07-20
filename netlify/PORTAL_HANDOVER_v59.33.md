# VeilFarers Portal v59.33 — Handover Notes

## Release focus

This release is a targeted correction pass on the unified portal build.

It fixes:

- broken subclass selection in Character Creator
- the obsolete Card Library action in Creator
- missing augmentation management inside Player Tool inventory
- the missing Character / Drone choice on Player Tool tab creation
- the landing-page visual artefacts reported on the hero presentation

## Canon / rules note

The new Creator Level Up view is intentionally light-touch and does **not** invent a new progression subsystem.

It only tracks and exposes:

- character level
- proficiency with automatic floor handling
- Sleeping Honed Edge preview (`level - 1`)
- freeform advancement notes

Detailed sheet handling remains delegated to the Charsheet workflow.

## Changed behaviors

### Character Creator

- Step 3 subclass selection is direct and visible.
- Creator mode bar now uses **Level Up** instead of **Card Library**.
- Creator draft JSON now also stores:
  - `level`
  - `proficiency`
  - `levelNotes`

### Player Tool

- Inventory panel now includes editable augmentations.
- New character creation now starts from a chooser menu.
- Drone creation is intentionally deferred and signposted only as future work.

### Welcome page

- Hero overlay adjusted to remove the visible mid-line artefact.
- Decorative side activity particles added.
- Portal card 05 now points to Level Up.

## Compatibility

- old Creator draft files still load
- old Player Tool local saves still load
- new optional fields are additive
- no destructive storage migration is introduced

## Recommended post-deploy smoke test

- Creator: ancestry → community → path → class → subclass → save → reload
- Creator: open Level Up mode and change level / proficiency
- Player Tool: add character tab from `+`
- Player Tool: add one augmentation and reload the page
- Welcome page: visual inspection on desktop and mobile widths
