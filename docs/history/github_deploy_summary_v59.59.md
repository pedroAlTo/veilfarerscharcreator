# VeilFarers Portal v59.59 — Portal Themes and Absolute Path/Class Gate

## Scope

Portal-wide visual convergence on top of v59.58. This release introduces two persistent interface themes across all portal pages, removes the cursor-following card illumination, increases selected-card particles, and replaces the previous visual-only Class lock with an absolute state and DOM gate.

## Changes

### Absolute Path/Class gate

- Class no longer exists as a selectable catalogue before the player chooses **Awakened** or **Sleeping**.
- The locked Class deck is empty, hidden, `inert`, `aria-disabled`, and removed from keyboard order.
- No Class `data-pick` target is present while locked.
- A capture-phase event guard blocks any click inside the contracted Class shell before Path.
- Imported, restored or manually stale Class/Subclass state is cleared when no canonical Path exists.
- Autosave re-applies the gate before persistence.
- Clicking the contracted area produces no validation error.
- Choosing a Path reveals the nine canonical Class cards and restores normal selection.

### Selection feedback

- Removed the cursor-position light hotspot from cards and powers.
- Retained the restrained dimensional card tilt.
- Increased the effective selected-state golden particle density by approximately 20% through an additional edge mote and calibrated layer opacity.
- Retained the smooth metallic-gold border orbit and short arrival confirmation.
- `prefers-reduced-motion` continues to disable animated movement.

### Portal-wide theme system

- Added **VeilFarers Blue**, the default dark stellar navy and gold presentation.
- Added **White Stone**, a light mineral/stone texture with charcoal typography and restrained gold.
- Added a custom in-app Theme control to the shared portal navigation; no native select or browser-looking dialog is used.
- Theme choice is stored in `localStorage` under `veilfarers.ui.theme.v1` and applied on every portal page.
- Added common styling for navigation, panels, cards, forms, buttons and modal surfaces.
- Added specific White Stone convergence rules for Character Creator, Player Tool and Keeper Tool surfaces.
- Added theme assets to all eleven portal HTML entry points.

## Files changed

- `creator.html`
- `creator-redesign.css`
- `veilfarers-theme.css` (new)
- `veilfarers-theme.js` (new)
- all eleven root HTML entry points, to load the shared theme layer
- `package.json`
- `package-lock.json`
- `data/changelog.json`

## Explicitly unchanged

- Canonical Path, Class, Subclass, Domain, equipment and advancement rules.
- Character IDs, Character Vault, import normalization and Charsheet synchronization.
- Player Tool and Keeper Tool behavior beyond theme presentation.
- Netlify Functions, Firebase data contracts and Firestore Rules.
- Downloads and all five bundled PDFs.
- Protected 3D dice renderer behavior and all 87 files.

## Deploy Preview acceptance

1. Open Creator Step 3 without choosing Path: the Class catalogue must be contracted, empty and non-interactive.
2. Click and keyboard-navigate inside the Class section: no Class can be selected and no validation error appears.
3. Choose Awakened or Sleeping: exactly nine Class cards appear and become selectable.
4. Reload after switching themes: the chosen theme should persist.
5. Review both themes on all portal pages, especially Player Tool and Keeper Tool.
6. Confirm no light hotspot follows the cursor over Creator cards.
7. Select cards and verify the smooth gold border and slightly denser particles.
8. Test reduced-motion, mobile and tablet layouts.
9. Complete a full Creator → Vault → Charsheet workflow and a historical JSON import.
