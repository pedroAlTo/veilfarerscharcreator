# VeilFarers Portal v59.75 — Deploy Summary / PR Description

## Summary

Finalizes the Character Creator card-selection particle effect after the temporary v59.74 tuning pass.

## Changes

- Fixes the card particle field at **48 particles** and **100% density**.
- Removes the temporary particle-count and density sliders from the Creator header.
- Moves every generated particle inside the card perimeter.
- Clips the field to the card's own rounded border, so particles cannot render outside the selected or flipped card.
- Keeps particles limited to the currently selected or expanded card; neutral cards do not retain particle nodes.
- Preserves the v59.74 full-overlay dice interruption and automatic 2D fallback unchanged.

## Technical implementation

- `creator.html`
  - Replaces persisted tuning state with fixed constants:
    - `VF_CARD_PARTICLE_COUNT = 48`
    - `VF_CARD_PARTICLE_DENSITY = 1`
  - Removes all tuner markup, local-storage keys, event listeners, reset logic and output updates.
  - Generates particles on the inner perimeter using positions constrained to the card bounds.
- `creator-redesign.css`
  - Uses `inset: 1px`, `overflow: hidden` and `border-radius: inherit` on `.vf-card-particle-field`.
  - Removes all temporary tuner component styles.

## Preserved behavior

- VeilFarers Blue remains the only exposed theme.
- Human inheritance selection remains in Equipment.
- Card selection, lift, glow, `[+]` flip and outside-click reset remain unchanged.
- Player/Keeper authentication recovery and polling lockout remain unchanged.
- 3D-dice interruption behavior remains unchanged from v59.74.
- Editorial PDFs and protected DiceBox/Babylon/Ammo assets are byte-identical to v59.74.

## Validation

- 35 JavaScript files pass `node --check`.
- 86 JSON files parse successfully.
- 11 root HTML pages contain no duplicate IDs.
- 10 inline scripts pass JavaScript syntax validation.
- Particle tuner controls and persistence code are absent.
- Fixed particle count and density assertions pass.
- Particle coordinates are generated within the card bounds and the field is independently clipped.
- 84 protected PDF/3D-renderer assets are byte-identical to v59.74.
- Release archive passes full CRC extraction testing.

## Deploy acceptance

Verify in the Netlify Deploy Preview:

1. Select cards in Ancestry, Community, Class and Affiliation.
2. Confirm 48 particles appear inside the selected card only.
3. Confirm no particle is visible outside the card border during lift, tilt or flip.
4. Open and close a card reverse with `[+]`, `[−]` and outside click.
5. Confirm the Creator header no longer shows tuning sliders.
6. Re-test unresolved 3D roll interruption and automatic 2D fallback.
