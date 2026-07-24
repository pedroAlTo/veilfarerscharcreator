# VeilFarers Portal v59.68 — Player and Keeper Token-State Release Candidate Fix

## Summary

This release corrects the final state-visibility defect affecting compact resource tokens in **White Stone**, and verifies the equivalent controls in **VeilFarers Blue** across both Player Tool and Keeper Tool.

The defect was caused by a broad White Stone rule that applied a paper-white background to every Player Tool `<button>`. Resource tracks are implemented as compact buttons, so filled, empty and unavailable tokens were flattened into the same visual state. Some Blue resource colors also depended on dynamically constructed Tailwind class names that were not guaranteed to exist in the compiled stylesheet.

v59.68 replaces that implicit styling with explicit semantic token states and stable theme palettes.

## Changes

### Player Tool

- Added semantic token metadata to every compact resource control:
  - `data-token-kind`;
  - `data-token-state`;
  - `aria-pressed`;
  - descriptive `aria-label` text.
- Covered Health, Stress, Hope, Effort, Resolve, Fear, character Armor and drone Shields.
- Filled, empty and unavailable states no longer depend on generic button styles.
- White Stone now renders:
  - empty tokens as hollow paper controls with a dark outline;
  - filled tokens with a resource-specific solid fill;
  - unavailable capacity as a dashed, reduced-emphasis outline.
- VeilFarers Blue now has explicit semantic colors and no longer depends on dynamically generated Tailwind class names.
- Pending particle animations continue to show the destination token as empty until the particle arrives.
- Compact token targets are normalized to `24 × 24 CSS px`, matching the WCAG 2.2 AA minimum target-size baseline without expanding resource tracks to the general 44px primary-control size.

### Keeper Tool

- Added semantic available/spent states and accessible labels to regular and dashboard Armor slots.
- White Stone Armor slots now use a filled teal state and a dashed paper spent state.
- VeilFarers Blue Armor slots now use an explicit cyan filled state and a dashed slate spent state.
- Keeper Fear controls now have readable White Stone empty, active and maximum states.
- Added clear accessible labels to the Fear increase/decrease controls and a polite live status for the Fear pool.
- Normalized compact Keeper token/control targets without changing campaign data or cloud synchronization.

### Theme isolation

- The White Stone generic Player Tool button rule now excludes `[data-token]` controls.
- Stateful token styles use explicit semantic selectors with sufficient specificity to survive the shared accessibility layer.
- Non-token buttons retain the White Stone paper treatment.

## Explicitly unchanged

- Character resource values and maximums.
- Resource gain/spend rules.
- Particle arrival and shield repair/shatter behavior.
- Massive damage pools.
- 3D dice cancellation and recovery.
- Keeper Notes delivery and authorization.
- Player/Keeper table synchronization.
- Character Vault and permanent Character IDs.
- Canonical rules data, PDFs and Firestore contracts.
- Character Sheet Awakened/Sleeping metal differentiation.

## Files changed

- `player-tool.jsx`
- `player-tool.bundle.js`
- `app.js`
- `keeper-tool.html`
- `veilfarers-theme.css`
- `veilfarers-accessibility.css`
- release/version metadata and documentation

## Deployment

1. Replace the repository contents with the contents of `VeilFarers_Portal_v59.68.zip`.
2. Commit and push to a test branch.
3. Allow Netlify to create a Deploy Preview.
4. Open `/data/deploy-version.json` and confirm `v59.68`.
5. Hard-refresh Player Tool and Keeper Tool before acceptance testing.

No Firebase migration, Firestore Rules deployment or environment-variable change is required.

## Priority acceptance tests

### Player Tool — White Stone

1. Load an Awakened character.
2. Verify Health, Stress and Hope tracks show visibly different filled and empty tokens.
3. Load a Sleeping character.
4. Verify Effort and Resolve states are distinct.
5. Verify capacity beyond the character maximum is dashed and unavailable.
6. Gain a resource and confirm the destination remains visually empty until the particle arrives.
7. Verify Fear and Armor use their intended shapes and states.
8. Test a drone with Shields.

### Player Tool — VeilFarers Blue

Repeat the same checks and confirm Hope/Effort, Stress, Resolve/Armor and Fear use stable explicit colors.

### Keeper Tool — both themes

1. Open a character with several Armor slots.
2. Spend and restore slots in the character card and Dashboard.
3. Confirm available and spent slots remain visually distinct.
4. Increase Fear from 0 to an intermediate value and then to 12.
5. Confirm empty, active and maximum Fear states remain legible.
6. Keyboard-focus the compact controls and verify the focus indicator remains visible.

## Validation result

- JavaScript syntax checks pass for the production bundle, Keeper application and 3D loader.
- All JSON manifests parse successfully.
- All token render paths in source and production bundle include semantic kind/state metadata.
- Controlled Chromium fixtures confirmed different computed backgrounds and borders for every tested state in both themes.
- Compact targets compute to `24 × 24 CSS px`; Keeper Fear controls compute to at least `32 × 32 CSS px`.
- White Stone filled, empty and unavailable states remain distinct despite the shared `[aria-pressed]` accessibility rule.
- VeilFarers Blue Hope and Stress no longer depend on absent dynamic Tailwind classes.

## Risk assessment

**Risk level: Low.**

The release changes rendering metadata and CSS only. It does not modify resource arithmetic, saved data or cloud APIs.

## Rollback

Redeploy `VeilFarers_Portal_v59.67.zip`. No data rollback is required. Rolling back restores the White Stone token-state defect.
