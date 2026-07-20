# VeilFarers Portal v59.70 — Blue UI and Live Table Stabilization

## Summary

v59.70 is a release-candidate stabilization pass based directly on live Player Tool and Keeper Tool feedback.

It temporarily disables White Stone, restores compact/elegant resource controls, removes broken number chevrons, moves the complete Human inheritance decision into Equipment, hardens interrupted 3D rolls, and prevents expired Netlify Identity sessions from producing endless `401` polling loops.

No canonical combat rule, damage rule, PDF, downloadable editorial book, character schema, or table permission rule is changed.

## Release blockers resolved

### Blue-only presentation

- VeilFarers Blue is now the only selectable and persisted portal theme.
- The White Stone selector and panel are removed at runtime and hidden by CSS.
- Existing White Stone code remains in the repository for future redesign, but users cannot activate it in this release.
- A previously stored White Stone preference is overwritten with Blue on load.

### Player Tool numeric and Experience controls

- Removed the custom `▲/▼` number buttons from every Player Tool `NumField`.
- Native browser number spinners remain hidden.
- Trait, Wealth, Credits, Experience bonus, threshold and other compact numeric fields now use direct text entry without overlapping controls.
- Rebuilt Experience rows as a stable three-column grid:
  - compact bonus field;
  - flexible Experience name field;
  - contained roll action.
- Removed the fixed 24 px row height that allowed global target sizing to overlap adjacent Experience rows.

### Resource-token visual rollback

- Replaced v59.68's large filled blocks with compact metallic marks closer to the earlier Player Tool visual language.
- State remains semantic and accessible:
  - filled;
  - empty;
  - unavailable;
  - spent where applicable.
- Player token visuals are small, while their controls retain a 24 × 24 CSS-pixel interaction target.
- Keeper Armor uses a compact shield silhouette instead of a solid rectangular block.
- Blue palettes are explicit and no longer depend on dynamically generated Tailwind classes.

### Feature-card cleanup

- Expanded feature cards no longer repeat the same first sentence shown in their collapsed summary.
- Compact Player Tool display removes non-mechanical Soldier commentary such as design rationale about frequent Effort use.
- Canonical source data is preserved; this is a display-only cleanup.

### Human Inheritance of the Builders

- Human selection no longer opens an ancestry-stage inheritance overlay.
- The Ancestry step is complete once Human itself is selected.
- Equipment now presents the full two-stage Gift workflow:
  1. choose **The Graft** or **The Tool**;
  2. choose the exact inherited augmentation or item.
- Changing branch and item occurs in Equipment without returning to Ancestry.
- Equipment remains the completion gate for Human characters.
- Inherited items remain free and do not consume normal weapon or armor budgets.
- Existing Charsheet transfer and portable JSON behavior is preserved.

### 3D dice interruption and overlay dismissal

- The explicit close button continues to use the v59.65 cancellable-roll controller and numeric fallback.
- Clicking the full-screen overlay during an active roll no longer interrupts the renderer.
- Once the roll has settled, clicking anywhere in the overlay dismisses it.
- The Player Roller close action explicitly requests safe 3D cancellation before closing its React window.
- `showResults()` continues to respect manual dismissal and cannot reopen a cancelled HUD.

### Keeper ↔ Player authentication and polling

- Removed the silent `authHeaders()` fallback that sent unauthenticated table requests.
- Every table request now requires a readable bearer token before network access.
- On a `401`, the client retries exactly once with `currentUser.jwt(true)`.
- If refresh fails or the retry remains unauthorized:
  - an `AUTH_EXPIRED` error is emitted;
  - `veilfarers:auth-expired` is dispatched;
  - further requests are blocked locally until a new Identity login;
  - Keeper polling stops;
  - Player handout/session polling stops;
  - the interface asks the user to sign in and reconnect.
- This eliminates the repeated `/api/table-api 401` requests and `keeper live update` console flood.
- Server-side table authorization and ownership checks are unchanged.

## Validation performed

- JavaScript syntax validation for every active JS file.
- Inline-script syntax validation for Creator, Charsheet, Player Tool and Keeper Tool.
- JSON parse validation across the portal data tree.
- Duplicate-ID scan across all 11 root HTML pages.
- Deterministic mocked Identity tests:
  - first `401` retries with a forced token refresh and succeeds;
  - failed refresh makes zero table API requests;
  - subsequent calls remain locally blocked;
  - an auth-expired event is emitted.
- Isolated controlled-Chromium UI fixture:
  - three Experience rows remain separate at 32 px each;
  - Experience bonus and roll controls render at 30 px;
  - semantic resource controls retain 24 × 24 targets with compact 16 × 18 visuals.
- Protected DiceBox/Babylon/Ammo/theme assets are byte-identical to v59.69; only the VeilFarers wrapper changed.
- Editorial PDFs and Downloads remain unchanged from v59.69.

## Deploy acceptance

Before promoting the Deploy Preview:

1. Confirm `/data/deploy-version.json` reports `v59.70`.
2. Confirm the HTML response includes `X-VeilFarers-Release: v59.70`.
3. Confirm no theme selector is visible and all pages load in VeilFarers Blue.
4. Create a Human and verify both inheritance branch and exact item are selected in Equipment.
5. Verify Experience rows and Player numeric fields show no arrows or overlap at 100%, 125% and 200% zoom.
6. Verify Player and Keeper resource tracks distinguish filled, empty and unavailable/spent states.
7. Run a 3D roll, click during motion, then click after settlement:
   - during motion: no interruption;
   - after settlement: overlay closes;
   - next 3D roll works.
8. Expire or clear the Identity session and confirm polling stops after one refresh attempt instead of generating repeated `401` requests.
9. Sign in again, reconnect the table and verify Keeper changes reach Player Tool and Keeper Notes reach the connected player.

## Files changed

- `veilfarers-theme.js`
- `veilfarers-accessibility.css`
- `creator.html`
- `creator-redesign.css`
- `player-tool.jsx`
- `player-tool.bundle.js`
- `player-tool.html`
- `keeper-tool.html`
- `table-access.js`
- `assets/3d-dice/vf-dice3d.js`
- active release/version metadata and HTML release markers

## Known limitations

- White Stone is intentionally unavailable rather than represented as fixed.
- A failed or revoked Netlify Identity refresh still requires the user to sign in again; the portal cannot manufacture a valid session.
- Final cloud synchronization acceptance requires a real Netlify Deploy Preview with valid Identity and Firebase configuration.
- The controlled Chromium layout test is a component fixture; it is not a substitute for visual inspection of a populated live Player Tool.
