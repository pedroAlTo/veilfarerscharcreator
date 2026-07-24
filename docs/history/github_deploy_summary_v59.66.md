# VeilFarers Portal v59.66 — Character Sheet Visual Reconstruction

## Summary

This release reconstructs the digital Character Sheet presentation so it matches the current VeilFarers portal design language instead of the earlier standalone-sheet UI.

The underlying character data, fields, persistence keys, printable/PDF workflow and game mechanics are preserved. The change is a visual and interaction-system convergence focused on hierarchy, field readability, Path identity, White Stone coherence and removal of inherited browser/legacy styling.

## Primary changes

### Awakened and Sleeping visual identity

- **Awakened sheets use gold metallic framing and gold section accents.**
- **Sleeping sheets use silver metallic framing and silver section accents.**
- Sleeping no longer uses blue as its primary sheet border language.
- Path identity now affects:
  - the outer sheet frame;
  - header and statistic accents;
  - section titles and divider rules;
  - track outlines;
  - trait modifier rims;
  - active engine emphasis;
  - footer/path status treatment;
  - the toolbar Path switch state.
- Shared Equipment and Ship sheets use a neutral mineral/bronze presentation rather than impersonating either character Path.

### Character Sheet reconstruction

- Added `charsheet-redesign.css` as a dedicated final Charsheet presentation layer.
- Rebuilt the on-screen sheet shell, header, identity fields, statistic badges, section cards, traits, tracks, thresholds, equipment rows and text areas.
- Replaced inherited black portal-theme form fields inside the light paper sheet with contained editorial controls.
- Improved the identity strip with responsive `auto-fit` sizing so Ancestry, Community, Affiliation, Class, Subclass and Wealth values no longer collapse into narrow black boxes.
- Added consistent focus rings, readonly treatment and full-value tooltips for fields that may still truncate at high zoom.
- Replaced native-looking select arrows with a restrained in-app chevron treatment.
- Reworked long feature fields and internal scrollbars to match the sheet rather than the browser default.
- Preserved the existing digital-page flow and print/PDF architecture.

### Toolbar and application chrome

- Rebuilt the Charsheet toolbar as a coherent VeilFarers control dock.
- Removed the visual impression of multiple unrelated legacy rails.
- Unified JSON, table transfer, PDF, zoom and Path controls.
- Added consistent button dimensions, states, grouping and hover/focus behavior.
- The Path switch is silver in Sleeping state and gold in Awakened state.
- Responsive toolbar containment remains available for tablet and mobile widths.

### Typography

- Added an **Aller-first editorial font stack** for the sheet and its controls.
- Uses CSS `local()` lookup for Aller when it is installed on the device.
- Falls back to Trebuchet MS, Segoe UI and Arial when Aller is unavailable.
- No Aller font binary is bundled or redistributed.
- The **VeilFarers masthead retains the established title typeface**.
- Character names, section titles, labels, rules text and controls now use the editorial stack rather than the former mixture of Inter, Oswald, JetBrains Mono and Cinzel.

### White Stone coherence

- Added a dedicated White Stone Charsheet treatment for:
  - page background and stage;
  - toolbar and control groups;
  - buttons and status indicators;
  - overlays and modal cards;
  - form controls;
  - shadows, lines and typography.
- Corrected the portal-wide generic input selector that was forcing dark inputs into the light Character Sheet paper.
- White Stone now remains a light mineral application theme while Awakened/Sleeping sheet identity is preserved through gold/silver metal.

### Runtime helper

Added `charsheet-redesign.js` to:

- maintain a reliable `data-vf-sheet-path` state on the body;
- synchronize visual Path state after flips and Path-field changes;
- add full-value titles to sheet fields so long values remain inspectable;
- keep the presentation state aligned after theme changes.

## Files changed

- `charsheet.html`
- `charsheet-redesign.css` — new
- `charsheet-redesign.js` — new
- `veilfarers-theme.css`
- release/version metadata in HTML/configuration files
- `package.json`
- `package-lock.json`
- `data/changelog.json`
- `data/deploy-version.json`
- `_headers`
- `netlify.toml`
- release documentation

## Explicitly unchanged

- Character field names and `data-f` bindings.
- Local-storage keys and migration chain.
- Character Creator → Charsheet transfer contract.
- Character Vault and permanent Character ID behavior.
- Player Tool and Keeper Tool transfer payloads.
- Path, Class, Subclass, Domain, equipment and advancement rules.
- HP, Stress, Hope, Effort, Resolve, armor and threshold calculations.
- PDF generation and fillable/flattened sheet data contracts.
- Massive damage behavior introduced in v59.64.
- 3D dice cancellation behavior introduced in v59.65.
- Keeper Notes communication behavior introduced in v59.64.
- Netlify Functions, Firebase contracts and Firestore Rules.
- Bundled PDFs and protected 3D dice assets.

## Deployment

1. Extract `VeilFarers_Portal_v59.66.zip`.
2. Replace the test branch contents with the extracted files at the repository/publish root.
3. Commit and push through the normal signed GitHub workflow.
4. Allow Netlify to create a Deploy Preview.
5. Hard-refresh the Charsheet after the preview deploy.
6. Verify `/data/deploy-version.json` reports `v59.66`.
7. Do not deploy new Firestore Rules; no Rules change is included.
8. No environment-variable or data migration is required.

## Priority acceptance tests

### Sleeping sheet

- Open Charsheet and select/switch to Sleeping.
- Confirm the outer frame and section accents are silver.
- Confirm form fields remain light and readable in both portal themes.
- Confirm long Ancestry, Community, Affiliation and Subclass values remain legible or expose their full value on hover.
- Confirm Effort, Resolve and Sleeping-specific controls retain their existing behavior.

### Awakened sheet

- Switch to Awakened.
- Confirm the outer frame and section accents become gold.
- Confirm Hope, Domain Powers and Awakened-specific controls retain their existing behavior.
- Confirm Path switching does not reset character data.

### White Stone

- Select White Stone in the portal navigation.
- Reload and confirm theme persistence.
- Verify the portal navigation, Charsheet toolbar, modal overlays and surrounding stage remain consistently light.
- Confirm the paper sheet does not contain black inherited input/select boxes.
- Confirm Sleeping remains silver and Awakened remains gold within White Stone.

### VeilFarers Blue

- Select VeilFarers Blue.
- Confirm the app chrome becomes deep navy while the printable sheet remains high-contrast and readable.
- Confirm the Path switch state remains silver/gold as appropriate.

### Functional regression

- Edit every identity field and trait.
- Change Level using both buttons.
- Mark/unmark tracks.
- Switch Path repeatedly.
- Export/import JSON.
- Transfer to Player Tool and Keeper Tool.
- Export visual PDF, editable PDF and print-ready PDF.
- Test keyboard focus and mobile/tablet containment.

## Validation summary

- Charsheet HTML parses with no duplicate IDs.
- New CSS parses without top-level syntax errors.
- New JavaScript passes syntax validation.
- Static Chromium fixtures render Sleeping/White Stone and Awakened/Blue without page errors.
- The generic portal theme no longer overrides Charsheet paper inputs.
- No font binary is included.
- Protected dice assets, bundled PDFs, canonical datasets and server functions are preserved.
- Release ZIP passes CRC and extraction checks.

## Risk assessment

**Risk level: Medium-low.**

The release deliberately applies a broad presentation override to a large legacy Charsheet DOM. Data and mechanics are unchanged, but real-device visual acceptance is required at desktop, tablet, mobile and PDF export sizes.

## Rollback

Redeploy `VeilFarers_Portal_v59.65.zip`.

No Firebase, Firestore, Vault or local-storage rollback is required. Character data created in v59.66 remains compatible with v59.65 because field schemas and persistence keys are unchanged.
