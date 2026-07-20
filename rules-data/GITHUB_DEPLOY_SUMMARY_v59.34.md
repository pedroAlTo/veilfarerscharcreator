# VeilFarers Portal v59.34 — Welcome Blend + Player Tool Equipment Loadout

## PR title

`Deploy VeilFarers Portal v59.34`

## Suggested branch

`release/portal-v59.34-welcome-blend-equipment-loadout`

## Intent

This release addresses the latest feedback on the unified portal build:

- homepage images were cutting off too abruptly
- background art needed to blend into the portal color system
- augmentations needed the same level of management as weapons
- armor needed to be visible/manageable in Player Tool
- inventory needed a proper item loadout backed by the canonical database plus free-text notes
- Character Creator class step still failed to surface subclass choices consistently

## Main changes

### 1) Character Creator subclass selection hardened

What changed:

- Step 3 now includes a subclass quick-select fallback under the card deck
- if the visual card rendering path misbehaves, subclass choice is still visible and selectable
- creator progression no longer depends on the original fragile subclass-only display path

### 2) Welcome page image treatment improved

What changed:

- portal card illustrations now occupy their area more fully
- card art uses softer fade treatment instead of a harsh cut edge
- the hero background now blends into the page background more smoothly
- the overall result keeps the same mood but looks more intentional and less abruptly cropped

### 3) Armor management added to Player Tool

What changed:

- added a dedicated Armor Loadout manager
- armor options come from the canonical `/rules-data` armor collection
- players can add armor to inventory and mark one suit as active
- the active armor is summarized directly on the main Player Tool sheet

### 4) Augmentations rebuilt to behave like real inventory entities

What changed:

- augmentations now use a manager workflow similar to weapons
- augmentation options come from the canonical `/rules-data` augments collection
- players can distinguish between augmentations they own and augmentations currently active
- old local freeform augmentation entries are normalized into the new structure for compatibility

### 5) Inventory now includes a database-backed item loadout

What changed:

- added a Gear Loadout manager backed by the canonical `/rules-data` gear collection
- players can add/remove items from the standard equipment list
- free-text inventory lines remain available for open notes, custom objects or anything not worth formal cataloguing

## Files intentionally changed

- `creator.html`
- `player-tool.html`
- `welcome.css`
- `data/changelog.json`

## Notes for reviewer

Please verify specifically:

- welcome hero background blend on desktop and mobile
- portal card art fade quality on desktop and mobile
- Player Tool weapon / armor / augment / gear management flows
- active armor and active augmentation states persisting after reload
- legacy local saves still opening without data loss

## Additional review item

- Character Creator: pick a class, confirm subclass options are visible, choose one and proceed to the next step.
