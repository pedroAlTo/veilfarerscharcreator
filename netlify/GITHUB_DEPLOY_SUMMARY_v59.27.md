# VeilFarers Portal v59.27 — Welcome, Responsive Controls & Public-Launch Hardening

## PR title

`Replace current deploy with VeilFarers Portal v59.27`

## Suggested branch

`release/portal-v59.27-welcome-security-ui`

## Base

Built directly from the complete v59.26 Box-ratio refinement deployment. The approved quantum-targeting HUD, 3:2 desktop/landscape Box, 4:3 portrait Box and full-viewport Overlay behavior remain intact.

## Scope

This release establishes a dedicated product welcome page, resolves the requested Player/Keeper/sheet usability issues, and adds the first public-launch security layer. It does not change books, rules, weapons, powers, canonical datasets or physical dice calculations.

## Main changes

### Portal and welcome

- Added a new `/` welcome page explaining what VeilFarers is and directing users to the connected tools.
- Moved the existing Character Creator to `/creator.html`.
- Moved Card Library deep linking to `/creator.html#cards`.
- Added a canonical Home entry to shared portal navigation.
- Kept the global navigation active across all portal modules.

### Player Tool

- Added a persisted **Dice tracking & lock-in** switch under Options.
- Disabling it removes quantum tracking rings, aperture lock and settled winner/discard cues.
- Physical dice, results, probabilities and the one-roll/no-reroll invariant are unchanged.
- Replaced the large persistent **Back to Player Tool** action with a compact phone-only arrow/back control.

### Keeper Tool

- Added a visible **Keeper Tool · Under construction** status banner.
- Retained the unified portal navigation and existing current functionality.
- Disabled public table enumeration by default unless explicitly enabled through environment configuration.

### Digital character sheet

- Rebuilt the top control area as one horizontal rail rather than several visual rows/groups.
- Added horizontal overflow behavior for narrower screens instead of wrapping controls into multiple rows.
- Converted Level to a single `minus / value / plus` row.
- Reworked header statistic geometry and compact numeric controls to prevent values overlapping or inheriting oversized portal select decoration.

### Security hardening

- Added Netlify CDN role gates for Keeper (`keeper`/`admin`) and Admin (`admin`).
- Hid Admin navigation unless the signed-in user has the role.
- Added baseline CSP, HSTS, nosniff, frame, referrer, permissions and opener headers.
- Added no-store handling to the Firebase runtime-config response.
- Added `FIREBASE_PUBLIC_TABLE_DIRECTORY`, defaulting to `false`.
- Removed `SECRETS_SCAN_OMIT_KEYS`.
- Added a dedicated public-launch security document that identifies the remaining Firestore Rules, membership, App Check, CSP and operational work.

## Important security disclosure

v59.27 is a stronger public static/deploy-preview baseline. It must **not** yet be treated as secure storage for private campaign data. The existing browser-side table password/hash is a UX gate, not authoritative access control. Firestore Security Rules and server-established authenticated membership are required before confidential tables are opened to the public.

## Environment

Existing Firebase variables remain supported. New optional flag:

```text
FIREBASE_PUBLIC_TABLE_DIRECTORY=false
```

Keep this false for public launch.

## Files added

- `index.html` — new welcome homepage
- `welcome.css`
- `creator.html` — previous homepage/Creator relocated here
- `SECURITY_PUBLIC_LAUNCH_v59.27.md`
- `GITHUB_DEPLOY_SUMMARY_v59.27.md`
- `PORTAL_HANDOVER_v59.27.md`
- `VALIDATION_v59.27.txt`

## Files materially changed

- `portal.js`
- `portal.css`
- `player-tool.html`
- `keeper-tool.html`
- `charsheet.html`
- `assets/3d-dice/vf-dice3d.js`
- `netlify.toml`
- `netlify/functions/firebase-config.mts`
- `local/start-local.mjs`
- `local/.env.local.example`
- `local-runtime.js` inclusion across portal pages
- `data/changelog.json`
- `START_HERE.txt`

## Production invariants

- Exactly one physical `roller.roll(prepared)` invocation remains.
- No post-settle add/remove/reroll lifecycle calls were introduced.
- Dice formulas and probability logic are unchanged.
- Firebase project identifiers and online data shape are unchanged.
- `rules-data/`, downloadable books/resources and canonical `data/` files other than changelog match v59.26 byte-for-byte.
- No credentials are embedded.

## Automated validation

- 64 checks passed; 0 failed.
- All 81 JSON files parsed.
- All 11 root HTML documents contain valid document structure and resolve local script/style/page targets.
- All 5 CSS files parsed without top-level errors.
- All 21 standalone JavaScript files passed `node --check`.
- Player Tool inline JSX parsed with `@babel/parser` 7.29.0.
- Local HTTP smoke tests returned 200 for Welcome, Creator, Charsheet, Player and Keeper routes.
- The Firebase config endpoint returned the expected 503 without local credentials.
- Canonical content comparison against v59.26 passed.
- High-confidence credential scan passed.

## Manual Deploy Preview checks

1. Validate the Welcome page on desktop, tablet and phone.
2. Confirm navigation Home/Creator/Card Library active states and browser back/forward behavior.
3. Roll 3D dice with tracking on, turn it off, and confirm the physical result remains identical while HUD lock/tracking disappears.
4. Confirm the compact Back action appears on phone only.
5. Inspect the Charsheet header numbers at common zoom levels and confirm no overlap.
6. Confirm the sheet control rail remains one line and scrolls horizontally when necessary.
7. Verify Keeper/Admin role redirects with signed-out, ordinary, keeper and admin accounts.
8. Confirm table discovery is absent with `FIREBASE_PUBLIC_TABLE_DIRECTORY=false`.
9. Re-test Box 3:2 desktop/landscape, 4:3 portrait and full-screen Overlay.
10. Review `SECURITY_PUBLIC_LAUNCH_v59.27.md` before enabling private cloud data.

## Rollback

Redeploy the complete v59.26 ZIP. No canonical data migration is introduced by v59.27. Users who changed the lock-in preference only retain the harmless localStorage key `veilfarers_dice_tracking`.
