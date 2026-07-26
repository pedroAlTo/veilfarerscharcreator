# VeilFarers Portal v59.71 — Player Tool Restoration and Creator Card Feedback

## Summary

v59.71 restores the **Player Tool visual language of v59.56** while retaining the functional stabilization introduced in v59.70. It also applies schematic class-feature copy across every class/path combination and adds stronger, spatial feedback to Character Creator cards.

This release is intentionally **VeilFarers Blue only**. White Stone remains disabled.

No canonical rule, class definition, character schema, editorial PDF, download manifest, table permission rule, 3D renderer asset, or damage implementation is changed.

## Player Tool visual restoration

- Restores the compact v59.56 proportions for:
  - Evasion and Armor;
  - Armour Thresholds;
  - Traits and numeric fields;
  - Experiences;
  - Health, Stress, Hope/Effort, Resolve and Fear tracks.
- Restores discreet custom up/down chevrons instead of native browser spinners.
- Keeps direct keyboard entry as the equivalent editing path.
- Returns resource tokens to small metallic marks rather than the oversized block treatment introduced later.
- Keeps semantic resource metadata and accessible state names:
  - `data-token-kind`;
  - `data-token-state`;
  - `aria-label`;
  - `aria-pressed`.
- Scopes the restoration to `body.vf-page-player-tool`; the Player page no longer imports the portal-wide accessibility stylesheet that had been inflating compact controls and breaking the HUD.
- Rebuilds Experience rows as a stable 30 px three-column grid. The bonus field, text field and roll action no longer overlap.

## Schematic class-feature presentation

Player Tool now treats a class card as an operational HUD, not an editorial page.

- All **36** Awakened/Sleeping Class and Hope/Effort feature titles have explicit compact display summaries.
- Feature titles are resolved from the selected Class and Path, rather than inferred from the opening words of long prose.
- The collapsed card shows only the first useful mechanical instruction.
- Expanded cards show short actionable bullets and relevant execution controls.
- Flavor, design commentary, repeated titles and non-operational explanation are removed from the Player Tool presentation.
- Canonical source JSON and book copy remain unchanged.

Examples:

- `The Drill` → `Session start · Prepare 4 Drills.`
- `The Held Line` → `After a successful attack · 1 Effort: deal +1d6 damage.`
- `Technical Intuition` → repair/diagnosis Advantage and its once-per-session fix.
- `The Prepared Mind` → its three selectable effects and result scale.

## Character Creator card feedback

### Selected-card lift

The selected card now rises above the deck for:

- Ancestry;
- Community;
- Class;
- Affiliation.

The lift is preserved while the card receives cursor tilt and returns correctly after movement.

### Complete reverse side

Cards whose visible text is intentionally shortened or actually clipped receive a small gold `[+]` control in the lower-right corner.

- Pressing `[+]` brings the card forward and rotates it.
- The reverse removes artwork and uses the full card surface for complete, uncut information.
- `[−]` returns to the front.
- Opening another card automatically returns the previous card to its neutral state.
- Card selection is not triggered accidentally by the information controls.
- Ancestry, Community, Class and Subclass cards use explicit canonical reverse templates.
- Affiliation, Power and Equipment cards receive a reverse when their visible content is clipped.

## Recommendations

Recommendations are now visibly distinguishable from ordinary options:

- the Spellcast Trait displays `Recommended +2`;
- the recommended-array action receives stronger treatment;
- recommended Equipment cards receive a visible badge and highlighted frame;
- weapon recommendations consider eligibility, affordability and the character's strongest assigned trait;
- armor recommendations favor eligible, affordable protection;
- the interface states that recommendations are guidance, not additional canon or a restriction.

## Human ancestry workflow

The v59.70 decision remains authoritative:

- choosing Human in Ancestry does not interrupt the ancestry step;
- **The Graft** or **The Tool** is chosen in Equipment;
- the exact inherited augmentation/item is also chosen in Equipment;
- Equipment remains the completion gate;
- the inheritance remains free and does not consume normal weapon or armor credits;
- existing Charsheet and portable JSON transfer fields are preserved.

## Stability preserved from v59.70

The following files are byte-identical to v59.70:

- `table-access.js` — refreshed-token retry, `AUTH_EXPIRED`, polling stop and re-login recovery;
- `assets/3d-dice/vf-dice3d.js` — cancellable 3D roll lifecycle and post-resolution overlay dismissal;
- all 88 bundled DiceBox/Babylon/Ammo/theme files;
- all five downloadable editorial PDFs.

## Files changed

### Functional/UI

- `player-tool.jsx`
- `player-tool.bundle.js`
- `player-tool.html`
- `creator.html`

### Active release markers

- `_headers`
- `netlify.toml`
- `package.json`
- `package-lock.json`
- `data/deploy-version.json`
- `data/changelog.json`
- active root HTML version markers
- `START_HERE.txt`

### Release documentation

- `GITHUB_DEPLOY_SUMMARY_v59.71.md`
- `PORTAL_HANDOVER_v59.71.md`
- `VALIDATION_v59.71.txt`
- `START_HERE_v59.71.txt`
- `UI_REVIEW_FIXTURE_v59.71.png`

## Validation performed

- 35 JavaScript files passed `node --check`.
- 86 JSON files parsed successfully.
- 11 root HTML pages contain no duplicate IDs.
- 10 inline scripts passed syntax validation.
- `player-tool.bundle.js` regenerates deterministically from `player-tool.jsx`.
- Compact class-summary coverage is 36/36.
- Controlled Chromium Player Tool fixture:
  - three 30 px Experience rows with no overlap;
  - 32 compact 11 × 9 chevron buttons;
  - 49 semantic resource tokens with distinct states;
  - no horizontal overflow;
  - correct `The Drill` and `The Held Line` titles;
  - non-mechanical Soldier commentary absent.
- Creator lift, flip, single-open-card, recommendation and Human Equipment flow received static assertions plus a controlled component visual fixture.
- 88 protected 3D renderer files and five editorial PDFs are byte-identical to v59.70.

## Deploy Preview acceptance

Before promotion:

1. Confirm `/data/deploy-version.json` reports `v59.71`.
2. Confirm the HTML response includes `X-VeilFarers-Release: v59.71`.
3. Hard-refresh or use a private window.
4. Confirm no White Stone selector is present.
5. Compare Player Tool against the v59.56 reference at 100%, 125% and 200% zoom.
6. Confirm Experiences never overlap and numeric chevrons remain contained.
7. Load at least one Awakened and one Sleeping character from every class; verify feature cards remain schematic and mechanically complete.
8. In Creator, test selected-card lift and `[+]` reverse behavior for Ancestry, Community, Affiliation, Class, Subclass, Powers and Equipment.
9. Create a Human and confirm both inheritance decisions occur in Equipment.
10. Confirm recommendation badges update after trait/class/equipment changes.
11. Run and interrupt 3D rolls, then verify the next roll works.
12. Sign in with Netlify Identity, connect Keeper and Player to the same table, and verify changes/notes propagate in both directions.

## Known limitations

- White Stone is intentionally unavailable.
- The complete Creator navigation and cloud-table acceptance cannot be proven in the isolated local harness; they require a served Netlify Deploy Preview.
- An expired/revoked Identity session still requires a real re-login when Netlify cannot refresh it. The client now stops polling rather than weakening authorization.
- The restored compact chevrons are a visual reference to v59.56. Direct numeric entry remains available as the equivalent editing method.
