# VeilFarers Portal v59.67 — Portal-wide WCAG and White Stone Accessibility Remediation

## Summary

This release performs a portal-wide accessibility and theme-coherence pass, with specific remediation for the White Stone theme and the Level Up route.

The previous White Stone implementation changed the page background but left several legacy dark application surfaces in place. This produced black filter controls, dark Creator cards, unreadable muted text, low-contrast metadata, and inconsistent component states. Level Up also allowed the saved-draft banner to retain its old second-column grid placement after the route collapsed to one column, creating an implicit column and pushing the entire Level Up interface to the left.

v59.67 introduces a shared accessibility layer loaded after every page stylesheet and targets WCAG 2.2 Level AA behavior across the portal. It is a product remediation release, not a claim of independent third-party accessibility certification.

## Primary fixes

### White Stone convergence

- Replaced residual black and near-black application surfaces with light mineral/paper surfaces on:
  - Character Creator;
  - Level Up;
  - Card Library;
  - Weapon & Armory;
  - Item Inventory;
  - Feedback;
  - Downloads, account and shared module pages;
  - shared modal, status, card and form surfaces.
- Reworked custom catalogue filter triggers and menus so they no longer appear as black native-looking controls.
- Reworked metadata chips, badges, ownership controls, quantity buttons and Feedback categories for readable light-theme states.
- Preserved dark artwork bands where they are part of card illustration, while converting all reading surfaces beneath the artwork to paper/light mineral surfaces.
- Preserved the VeilFarers title/display face while using Aller-first local typography for application/editorial copy without redistributing font binaries.

### Level Up flow

- Fixed the saved-draft banner so it explicitly occupies the only route column.
- Removed the implicit second grid column that narrowed and left-aligned Level Up.
- Restored full-width Level Up content with a bounded centered working area.
- Converted Level Up vault cards, advancement cards, choice controls, configuration fields, milestones, badges, errors and success states to accessible White Stone surfaces.
- Increased active control and explanatory text contrast.
- Added mobile containment for the banner and action buttons.

### Portal-wide accessibility layer

Added `veilfarers-accessibility.css` and `veilfarers-accessibility.js`, loaded after the theme layer on all eleven HTML entry points.

The shared layer adds:

- a keyboard-visible “Skip to main content” link;
- high-contrast `:focus-visible` indicators in both themes;
- minimum 44px control targets for primary custom controls;
- keyboard operation for Creator cards and legacy non-native navigation/tab elements;
- `aria-pressed`, `aria-disabled`, `aria-selected` and `aria-current` state synchronization;
- accessible names for custom catalogue filter triggers;
- live-region semantics for errors, validation and status messages;
- reduced-motion handling;
- forced-colors support;
- 320 CSS-pixel reflow safeguards;
- responsive single-column behavior for complex grids and action groups.

## Contrast tokens

The primary tested combinations are:

| Combination | Ratio |
|---|---:|
| White Stone body text `#24323b` on `#fffdf8` | 12.96:1 |
| White Stone muted text `#4f5d66` on `#fffdf8` | 6.69:1 |
| White Stone heading `#684617` on `#fffdf8` | 8.34:1 |
| White Stone gold text `#8a5a0a` on `#fffdf8` | 5.82:1 |
| White Stone control boundary `#8f7446` on `#fffdf8` | 4.34:1 |
| White Stone focus `#005fcc` on `#fffdf8` | 5.89:1 |
| Active control text `#1b160b` on `#d6b15a` | 8.83:1 |
| VeilFarers Blue body text `#efe3c1` on `#0a1523` | 14.35:1 |
| VeilFarers Blue muted text `#a8a18f` on `#0a1523` | 7.13:1 |

## Files added

- `veilfarers-accessibility.css`
- `veilfarers-accessibility.js`
- `GITHUB_DEPLOY_SUMMARY_v59.67.md`
- `PORTAL_HANDOVER_v59.67.md`
- `VALIDATION_v59.67.txt`
- `START_HERE_v59.67.txt`
- `SHA256_v59.67.txt`

## Files changed

- all eleven root HTML entry points, to load the accessibility layer last;
- `creator.html`, including current visible release labels;
- `feedback.html`, replacing the stale displayed v59.20 build label;
- `index.html`, replacing the stale displayed v59.36 release label;
- `package.json` and `package-lock.json`;
- `data/changelog.json`;
- `data/deploy-version.json`;
- `_headers` and `netlify.toml` release markers;
- `assets/3d-dice/vf-dice3d.js` release diagnostics only.

## Explicitly unchanged

- Canonical rules, classes, paths, subclasses, domains, powers and advancement rules.
- Character Creator state and `data-pick` contracts.
- Character IDs, Character Vault and historical import normalization.
- Charsheet bindings, Awakened gold and Sleeping silver path treatment.
- Massive damage pools.
- Keeper Notes server authorization and polling.
- 3D dice cancellation, Ammo physics, exact-case `Dice.min.js`, themes and numerical outcomes.
- Firebase, Firestore, Netlify Identity and table data contracts.
- Bundled PDFs and protected 3D dice binary/theme assets.

## Validation

- 233 automated/static/controlled-browser checks passed with zero failures.
- All eleven entry points load the accessibility CSS and JS after the theme layer.
- HTML duplicate-ID checks passed.
- Referenced local assets resolve inside the package.
- CSS and JavaScript syntax checks passed.
- Controlled Chromium confirmed that the saved-draft banner does not narrow Level Up.
- Controlled Chromium confirmed full-width Level Up and light Level Up cards.
- Controlled Chromium confirmed White Stone catalogue filters and metadata are no longer black.
- Controlled Chromium confirmed primary controls resolve to a 44px minimum target height.
- A 320 CSS-pixel fixture produced no horizontal overflow.

## Deploy Preview acceptance

1. Open every portal page in White Stone and confirm no black application panels remain except intentional artwork/media.
2. Open Creator Traits, Path/Class and Equipment steps and verify body copy, instructions, disabled states and metadata are readable.
3. Open `creator.html#level-up` with a saved draft present:
   - the banner spans the route width;
   - the Level Up content remains centered and full-width;
   - no implicit right-side column is created.
4. Test Weapon & Armory, Item Inventory and Feedback custom controls with keyboard only.
5. Verify every interactive element has a visible focus indicator.
6. Test at 200% text zoom and 400% page zoom.
7. Test a 320 CSS-pixel viewport without two-dimensional scrolling except where a genuinely two-dimensional component requires it.
8. Enable reduced motion and verify selection/status meaning remains available.
9. Test VeilFarers Blue to confirm this release did not regress the dark theme.
10. Re-run the existing Creator → Vault → Charsheet → Player Tool workflow.

## Deployment

1. Extract `VeilFarers_Portal_v59.67.zip`.
2. Publish the contents of the extracted directory as the Netlify publish root.
3. Confirm `/data/deploy-version.json` reports `v59.67`.
4. Confirm the HTML response includes `X-VeilFarers-Release: v59.67`.
5. Use a Deploy Preview before promoting to production.

## Rollback

Redeploy `VeilFarers_Portal_v59.66.zip`.

No database, Firebase, Firestore, Vault or local-storage rollback is required. Rolling back will restore the White Stone contrast and Level Up flow defects addressed by this release.
