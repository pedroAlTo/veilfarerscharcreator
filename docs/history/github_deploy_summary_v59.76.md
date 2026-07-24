# VeilFarers Portal v59.76 — Deploy Summary / PR Description

## Summary

Unifies Character Creator card feedback so the approved 48-particle field and animated gold border remain visible on both the selected front and the expanded reverse.

## Changes

- Keeps the particle field at **48 particles / 100% density**.
- Moves particles, the animated frame and the selection sheen to the persistent card shell instead of either rotating face.
- Displays the same contained particles and animated frame when:
  - a card is selected on its illustrated front;
  - a card is opened on its full-text blue reverse.
- Prevents duplicate particle fields when a dynamically rendered deck is initialized more than once.
- Keeps all particles clipped inside the card border.

## Technical implementation

### `creator.html`

- `activateCardDetails()` now excludes `.frame`, `.sheen` and `.vf-card-particle-field` when moving front-face content into `.vf-card-front`.
- Existing rotors repair themselves by hoisting any legacy nested feedback layers back to the card shell.
- `buildCardParticleField()` continues to create one deterministic direct-child field only while the card is selected or flipped.

### `creator-redesign.css`

- Establishes direct-child z-index authority for frame, sheen and particles.
- Applies `vfMetalEnergyOrbit` to both `.vf-selection-active` and `.vf-card-flipped` states.
- Applies particle opacity to both states while preserving `inset: 1px`, rounded clipping and reduced-motion behavior.

## Preserved behavior

- White Stone remains disabled.
- Human inheritance remains in Equipment.
- Card size parity and the `[+]` / `[−]` two-sided rotation remain unchanged.
- The approved 48 / 100% particle tuning remains unchanged.
- The v59.74 unresolved-roll click interruption and 2D fallback remain unchanged.
- Player/Keeper authentication recovery, canonical data and editorial PDFs remain unchanged.

## Validation

- 35 JavaScript files pass `node --check`.
- 86 JSON files parse successfully.
- 11 root HTML pages contain no duplicate IDs.
- 10 inline scripts pass syntax validation.
- Static assertions confirm both selected-front and flipped-reverse particle/frame selectors.
- A controlled Chromium fixture confirms 48 particles and one frame in both states.
- 81 protected DiceBox/Babylon/Ammo/theme assets and 5 PDFs are byte-identical to v59.75.
- Release ZIP passes full CRC extraction testing.

## Deploy acceptance

1. Select an Ancestry, Community, Class or Affiliation card.
2. Confirm particles and the animated gold frame are visible on the illustrated front.
3. Press `[+]` and confirm both effects remain visible around the blue reverse.
4. Press `[−]` or click outside and confirm the card returns cleanly to neutral.
5. Confirm no particle crosses the rounded card boundary.
