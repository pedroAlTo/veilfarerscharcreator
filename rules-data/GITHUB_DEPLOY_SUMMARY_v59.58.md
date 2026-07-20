# VeilFarers Portal v59.58 — Path-Gated Classes and Gold Selection Energy

## Scope

Focused Character Creator interaction refinement on top of v59.57. Class selection now remains genuinely disabled until Awakened or Sleeping is chosen, and selected choices receive a smooth metallic-gold energy border with restrained particles.

## Changes

- Replaced the premature Class-selection error with a visibly locked Class catalogue.
- Added a compact Path-required notice inside the Class section.
- Rendered nine dark, non-interactive Class preview cards while no Path is selected.
- Removed selectable targets from locked Class previews and exposed `aria-disabled` state.
- Preserved the existing silent defensive guard against invalid Class selection.
- Unlocks and renders the canonical Path-specific Class catalogue immediately after choosing Awakened or Sleeping.
- Added a smooth masked metallic-gold line orbit to selected standard cards and Domain Power cards.
- Added matching selected-state treatment to Awakened/Sleeping Path controls.
- Added sparse golden edge particles and a short arrival glow when a selection is made.
- Disabled the new motion effects when the user requests reduced motion.
- Added no external dependency, canvas renderer, timer loop or persistent state.

## Explicitly unchanged

- Canonical Path, Class, Subclass, Domain and resource rules.
- Existing readiness gates, import normalization and completion workflow.
- Character IDs, Character Vault and Charsheet/Player Tool synchronization.
- Affiliation data and crest mappings.
- Level Up, Player Tool and Keeper Tool.
- Firebase, Netlify Functions and Firestore Rules.
- Downloads and bundled PDFs.
- Protected 3D dice renderer and its 87 files.

## Files changed

- `creator.html`
- `creator-redesign.css`
- `package.json`
- `package-lock.json`
- `data/changelog.json`

## Deploy Preview acceptance

1. Open Step 3 with no Path selected: Class must appear darkened and non-interactive.
2. Click inside the locked Class area: no persistent validation error should appear.
3. Verify Next remains disabled until the existing Path/Class/Subclass requirements are met.
4. Choose Awakened: nine canonical Class cards should unlock with Awakened rules.
5. Change to Sleeping: dependent Class/Subclass choices should reset as before and cards should refresh to Sleeping rules.
6. Select multiple card types and verify the smooth gold border, short arrival glow and sparse particles.
7. Enable operating-system reduced motion and verify the selection remains clear without movement.
8. Test desktop, tablet and mobile, particularly the compact lock notice and guided footer.
9. Complete a character, import a historical JSON and confirm Vault/Charsheet behavior is unchanged.
