# VeilFarers Portal — Master Handover v59.27

**Cut-off:** 17 July 2026  
**Purpose:** preserve all editorial, strategic, product, visual, functional, technical and deployment decisions required to continue in a new chat without losing context.  
**Baseline:** complete v59.26 Box-ratio deployment.  
**Release status:** implementation complete and statically validated; Deploy Preview/manual browser QA pending.  
**Security status:** stronger public-facing baseline; private cloud campaign data remains blocked from a production-security claim until the Priority 0 controls in the security section are completed.

---

## 1. How to read this handover

- **Approved:** a decision explicitly accepted by the user and now part of the product direction.
- **Implemented in v59.27:** present in the delivered code.
- **Pending manual QA:** implemented, but must be confirmed in a real browser/Netlify Deploy Preview.
- **Security blocker:** must be resolved before making a specific security claim or enabling confidential public-user data.
- **Canon unchanged:** no book/rule/dataset change was made by this release.

This is a living master handover. Future releases must update it rather than producing an isolated delta that loses prior decisions.

---

## 2. Product identity and source of truth

### 2.1 Naming

- **VeilFarers** is the final product name and the name used by the portal and current books.
- The prior operational distinction between a VeilFarers portal layer and Voidlight rules/content is retired wherever it would imply two products. Residual technical identifiers may remain temporarily for migration compatibility, but visible product copy should use VeilFarers.
- Tagline used by the current portal: **“A game of distant stars across a broken universe.”**

### 2.2 Canon

- The latest approved VeilFarers books and user-confirmed decisions are the canonical source.
- Do not invent mechanics, states, conditions, traits, exceptions or weapon features.
- When a rule is discussed or changed, identify its source location in the books so the user can verify it.
- Do not treat a tool implementation as automatically changing editorial canon.
- Any tool/book divergence must be recorded explicitly.

### 2.3 This release

No mechanics, books, weapons, powers, classes, ancestries, communities, equipment records or downloadable PDFs were changed. `rules-data/`, `download/` and canonical `data/` files other than `data/changelog.json` match v59.26 byte-for-byte.

---

## 3. Strategic decisions

### 3.1 Unified portal — approved and retained

All digital tools are one product experience:

- shared global navigation;
- shared visual language and components;
- coherent account state;
- reduced duplicate controls and entry points;
- one release/changelog/handover process.

Player and Keeper areas may differ by role and workflow, but should not look like unrelated microsites.

### 3.2 Homepage decision — superseded in v59.27

**Previous decision:** Character Creator was the portal homepage.  
**New approved decision:** the root path is a dedicated welcome page that explains VeilFarers before presenting the tools.

Implementation:

- `/` → Welcome page.
- `/creator.html` → Character Creator.
- `/creator.html#cards` → Card Library.

The Creator remains a primary conversion route and is the main CTA on the Welcome page, but it is no longer the root document.

### 3.3 Public-launch direction

The portal is being prepared for public access in layers:

1. public product/welcome and local/offline tools;
2. role-gated Keeper/Admin surfaces;
3. private cloud campaign data only after real Firebase authorization is complete.

Never collapse these layers into a blanket “secure for public” claim.

---

## 4. Editorial direction for the Welcome page

### 4.1 Purpose

The Welcome page must answer three questions quickly:

1. What is VeilFarers?
2. What kind of play does it support?
3. Where should a new or returning user go next?

### 4.2 Current approved copy direction

The page frames VeilFarers as a science-fiction tabletop roleplaying game about:

- a crew rather than a single chosen hero;
- travelling through fractured space;
- identity and relationships under pressure;
- decisions and consequences that persist;
- Hope and Fear shaping more than binary success/failure.

It avoids a long rules explanation and presents the portal as the connected table toolkit.

### 4.3 Content hierarchy

1. Product name, tagline and one-paragraph premise.
2. Main CTA: **Create a VeilFarer**.
3. Secondary CTA: **Open Player Tool**.
4. Three play pillars/signals.
5. “What is VeilFarers?” explanatory section.
6. Tool cards.
7. Closing character-creation CTA.

### 4.4 Language

The current product UI and Welcome copy are in English. Do not introduce mixed-language labels inside the same production surface unless localization is implemented deliberately.

---

## 5. Information architecture and routes

### 5.1 Global navigation

The shared navigation currently exposes:

1. Home
2. Character Creator
3. Card Library
4. Charsheet & PDF
5. Player Tool
6. Keeper Tool
7. Weapon & Armory
8. Item Inventory
9. Downloads
10. Feedback
11. Log-in / account state
12. Admin, only when permitted

The VeilFarers wordmark links to Home but should not compete visually with the explicit Home active state.

### 5.2 Active-state rules

- `/` activates Home.
- `/creator.html` activates Character Creator.
- `/creator.html#cards` activates Card Library.
- Other modules activate by exact normalized path.
- Creator/Card state must update on hash navigation and browser history.

### 5.3 Navigation behavior

- The nav uses custom in-product scrolling controls when links overflow.
- Do not use browser-native-looking navigation widgets when a VeilFarers component exists.
- Admin is hidden by default.
- Mobile and narrow layouts must remain usable without silently losing routes.

---

## 6. Visual and interaction system

### 6.1 Permanent interface rule

Avoid native-browser-looking UI controls, scrollbars, dropdowns and dialogs whenever a usable VeilFarers component can replace them. Custom components must still preserve keyboard access, focus state, labels and equivalent accessibility.

### 6.2 Welcome visual direction

Implemented direction:

- dark deep-space/station atmosphere;
- restrained gold/ivory typography and cyan technical accents inherited from the portal;
- large editorial hero rather than a dashboard-first homepage;
- technical signal panel for play pillars;
- modular tool cards with clear CTA hierarchy;
- responsive layout without browser-looking boxes.

### 6.3 Existing dice HUD direction

The approved v59.25/v59.26 quantum-targeting presentation remains:

- rotating acquisition rings;
- micro-telemetry;
- aperture lock;
- higher-die winner identification;
- discarded-die power-down;
- Box mode 3:2 desktop/landscape and 4:3 portrait;
- Overlay full viewport.

These are presentation effects only. They do not alter or reroll physical dice.

---

## 7. Functional decisions and implementation

### 7.1 Dice tracking and lock-in option — approved, implemented

User requirement: the tracking/lock-in effect is valuable but must be optional.

Implementation:

- New Settings switch: **Dice tracking & lock-in**.
- Stored in localStorage under `veilfarers_dice_tracking`.
- Default: enabled unless explicitly saved as disabled.
- Disabling clears active tracking HUD/cues and prevents future tracking/lock-in/result cues.
- 2D/3D dice mode remains a separate setting.
- Physical dice generation, results, formulas and state are unchanged.

Invariant:

- Exactly one `roller.roll(prepared)` call.
- No `add`, `remove` or `reroll` call after settlement.

### 7.2 Player Tool mobile return control — approved, implemented

Previous large “Back to Player Tool” footer action was excessive.

New behavior:

- only visible below the `sm` breakpoint;
- compact button;
- left arrow plus short **Back** label;
- accessible name remains **Back to Player Tool**;
- desktop uses the existing close control and does not show the extra footer action.

### 7.3 Keeper Tool status — approved, implemented

The Keeper Tool currently needs deeper navigation/workflow reconstruction. It now displays:

- **Keeper Tool · Under construction**;
- explanatory text that navigation and campaign workflows are being rebuilt inside the unified portal.

The existing functional content is retained rather than removed. Future Keeper work must first audit the current workflows and backlog; do not invent a replacement scope.

### 7.4 Character sheet figures — approved, implemented

Reported problem: compact numeric values could appear displaced or overlap.

Corrections:

- header statistics use a collision-resistant three-column grid;
- inputs have bounded width and explicit line-height/padding;
- compact trait/power numeric controls suppress the portal select arrow/background that could intrude into small fields;
- value text is centered/clipped correctly rather than overflowing;
- Level uses a single horizontal `− / value / +` control.

### 7.5 Character sheet toolbar — approved, implemented

Reported problem: controls were split into several visual rows/groups after that separation stopped being useful.

New behavior:

- one horizontal visual rail;
- groups remain semantic in markup but lose separate card backgrounds/labels;
- no wrapping into multiple control rows on desktop;
- horizontal scrolling on constrained widths;
- mobile retains brand separation, followed by one scrollable action rail.

### 7.6 Player/Keeper table discovery — security-driven implementation

- Public listing is disabled by default.
- Exact table entry remains available.
- `FIREBASE_PUBLIC_TABLE_DIRECTORY=true` explicitly re-enables discovery.
- Production recommendation: keep false.

This is privacy reduction, not complete authorization.

---

## 8. Module status

### Welcome

- New and implemented.
- Manual responsive/a11y QA pending.

### Character Creator

- Existing v59.26 homepage preserved as `creator.html`.
- Portal links updated.
- No character options or datasets changed.

### Card Library

- Remains a Creator mode at `creator.html#cards`.
- No duplicated dataset introduced.

### Charsheet & PDF

- Layout/control corrections implemented.
- Existing persistence/export/print behavior retained.
- Manual checks required at zoom levels, breakpoints and print/PDF output.

### Player Tool

- Optional lock-in/tracking implemented.
- Mobile return control reduced.
- Table directory disabled by default.
- Existing 3D dice, session and tool logic retained.

### Keeper Tool

- Under-construction banner implemented.
- Global navigation retained.
- Edge role gate added.
- Detailed UX rebuild remains future work.

### Weapon & Armory / Item Inventory

- Routes retained.
- No data or functional changes in this release.

### Downloads

- No files changed in this release.
- Existing requirement remains: downloads should be current, versioned, dated and include the fillable character sheet.

### Feedback

- Existing route retained.
- No functional change.

### Login / Account

- Shared global entry retained.
- Account state appears across the portal.
- Netlify Identity roles drive Keeper/Admin edge access.

### Admin / Changelog

- Admin navigation hidden unless the user has `admin` or is in the explicit local-test runtime.
- Netlify edge access requires `admin` in production.
- Changelog current version is v59.27.

---

## 9. Security architecture and limitations

### 9.1 Implemented in v59.27

- Netlify CDN role redirects for Keeper/Admin.
- Admin nav visibility restricted by Identity role.
- Browser security headers.
- `no-store` Firebase config endpoint.
- No secrets-scanner allow-list/suppression.
- Private-by-default session directory.
- Clear 503 when Firebase config is absent.
- No high-confidence credentials found in package scan.

### 9.2 Critical security truth

The Firebase browser API key is configuration, not an authorization secret. Restrict it for abuse/quota control, but do not rely on hiding it.

The existing client-side table password/hash is not authoritative security. A modified client can bypass UI decisions. Private campaign data cannot be considered protected until Firestore Security Rules enforce authenticated membership independently.

### 9.3 Priority 0 blockers before private cloud launch

1. Deny-by-default Firestore Rules for every used path.
2. Authenticated UID-to-table membership enforced by Rules.
3. Keeper/admin mutations derived from trusted membership, not client fields.
4. Replace browser password authorization with server-established membership or one-time invitations.
5. Establish a trusted mapping between Netlify Identity roles and Firebase access, or unify identity.
6. Test allowed and denied behavior in Firebase Emulator Suite.

### 9.4 Priority 1 hardening

- App Check with monitoring then enforcement.
- API/referrer restrictions, quotas and alerts.
- Bundle JSX/Tailwind/React/dice dependencies at build time.
- Remove `unsafe-eval` and ultimately `unsafe-inline` from CSP.
- Rate-limit join/invitation/privileged endpoints.
- Structured security logging and alerting.

### 9.5 Operational requirements

- staging and production separation;
- backup/restore testing;
- retention/deletion policy;
- account/campaign ownership policy;
- incident response and rotation procedure;
- recurring dependency/vulnerability review.

The detailed checklist lives in `SECURITY_PUBLIC_LAUNCH_v59.27.md`.

---

## 10. Technical implementation map

### New files

- `index.html`
- `welcome.css`
- `creator.html` (relocated previous root application)
- `SECURITY_PUBLIC_LAUNCH_v59.27.md`
- `GITHUB_DEPLOY_SUMMARY_v59.27.md`
- `PORTAL_HANDOVER_v59.27.md`
- `VALIDATION_v59.27.txt`

### Materially modified files

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
- `data/changelog.json`
- `START_HERE.txt`
- root HTML pages to load the local-runtime flag consistently where required

### Local storage addition

```text
veilfarers_dice_tracking = "1" | "0"
```

No migration is needed. Missing value means enabled.

### Environment addition

```text
FIREBASE_PUBLIC_TABLE_DIRECTORY=false
```

Default behavior is false even when the variable is absent.

---

## 11. Validation completed

Automated/static release validation:

- 64 checks passed, 0 failed.
- Required production files present.
- 81 JSON files parsed.
- 11 root HTML files have document structure and valid local targets.
- 5 CSS files parsed without top-level errors.
- 21 standalone JavaScript files passed `node --check`.
- Player Tool inline JSX parsed with `@babel/parser` 7.29.0.
- Local HTTP routes for Welcome, Creator, Charsheet, Player and Keeper returned 200.
- Firebase config endpoint returned the expected 503 without credentials.
- One-roll/no-reroll invariants passed.
- Canonical data/download comparisons against v59.26 passed.
- Credential-pattern scan passed.

Automated visual screenshots could not be generated because the managed Chromium runtime in the work environment blocks all URLs. This limitation is environmental, not a portal error. A real Deploy Preview visual pass is mandatory.

---

## 12. Manual QA required before production replacement

### Welcome and navigation

- desktop, tablet, phone;
- Home/Creator/Card active states;
- browser back/forward between Creator and Cards;
- navigation overflow controls and keyboard focus;
- content hierarchy and readability.

### Player Tool

- tracking on/off persistence after reload;
- 3D result unchanged when tracking is off;
- Box and Overlay modes;
- critical, Duality and Massive damage flows;
- compact Back button only on phone;
- exact-table access with directory disabled.

### Charsheet

- header numbers at browser zoom 80%, 100%, 125%, 150%;
- desktop, tablet and phone breakpoints;
- toolbar stays one visual rail;
- horizontal rail access with mouse, touch and keyboard;
- Level stepper;
- print/PDF output does not print control buttons.

### Keeper/Admin/security

- signed-out redirect;
- ordinary-user denial;
- keeper access without Admin access;
- admin access;
- role refresh behavior;
- response headers;
- table enumeration remains disabled.

---

## 13. Deployment procedure

1. Create a Netlify Deploy Preview from the v59.27 package.
2. Confirm all existing Firebase variables are present.
3. Set `FIREBASE_PUBLIC_TABLE_DIRECTORY=false` explicitly.
4. Confirm production role assignments for test keeper/admin accounts.
5. Complete the manual QA matrix.
6. Do not enable private public-user campaign data until Priority 0 Firebase authorization blockers are closed.
7. Replace production only after preview sign-off.
8. Preserve v59.26 as immediate rollback artifact.

Rollback requires redeploying the complete v59.26 ZIP. No database or canonical-data migration is introduced by v59.27.

---

## 14. Open work after v59.27

### Highest priority

- Firestore Rules and trusted table membership.
- Authentication architecture decision/bridge.
- App Check.
- Keeper Tool navigation and workflow rebuild.
- Real-device visual QA fixes found in Deploy Preview.

### Next design/engineering pass

- bundle production dependencies and remove runtime Babel/Tailwind;
- tighten CSP;
- accessibility audit for custom controls;
- unify loading/empty/error/offline states;
- formal responsive regression set;
- review whether Welcome content needs richer setting examples, imagery or a learn-to-play route.

### Existing broader portal backlog retained

- ensure all applications consume current canon;
- complete inventory centralization;
- update and version all downloads;
- centralize account behavior;
- maintain Admin change log;
- preserve export/import and offline resilience;
- eliminate duplicate navigation/actions.

---

## 15. Rules for future work

1. Never invent VeilFarers rules or features.
2. Verify rule changes against the latest book and identify the source location.
3. Distinguish approved, implemented, pending and security-blocked states.
4. Preserve a single shared portal navigation.
5. Prefer VeilFarers custom UI over browser-native-looking controls while retaining accessibility.
6. Do not claim client-side gates secure data.
7. Do not embed or allow-list active secrets.
8. Do not change books merely because a tool changed unless explicitly approved.
9. Every deploy must include:
   - deployable ZIP;
   - SHA-256 file;
   - GitHub-ready PR/deploy summary;
   - validation report;
   - security/manual steps;
   - updated full handover.
10. Update the handover after every significant strategic, editorial, visual, technical or deployment decision.

---

## 16. New-chat continuation prompt

Copy this block together with this handover:

> We are continuing the VeilFarers Portal project from release v59.27. Use `PORTAL_HANDOVER_v59.27.md` as the continuity source and do not discard earlier approved decisions that it preserves.
>
> Current route structure: `/` Welcome, `/creator.html` Character Creator, `/creator.html#cards` Card Library. A single global navigation serves all modules.
>
> Critical invariants: no invented rules; current canon wins; no book changes from tool-only work without approval; one physical 3D roll with no post-settle reroll; custom VeilFarers UI instead of browser-native-looking controls; every release includes GitHub summary, validation, security notes and a full updated handover.
>
> v59.27 added optional dice tracking/lock-in, a compact phone-only Settings back control, Keeper “Under construction”, a one-rail Charsheet toolbar, corrected compact figures, private-by-default table discovery and initial Netlify security hardening.
>
> Do not claim private campaign cloud data is production-secure. Firestore Rules, trusted authenticated table membership, an Identity/Firebase authorization model and App Check remain required Priority 0/1 work.
>
> Before implementing changes, state which handover decisions are affected. At the end, update the complete handover rather than creating only a narrow delta.

---

## 17. Permanent handover protocol

Update this master handover whenever:

- a strategic/product decision is approved or superseded;
- welcome/editorial positioning changes;
- a rule or canonical dataset changes;
- navigation or architecture changes;
- a module gains/loses functionality;
- a security control, environment variable or integration changes;
- a deploy/release is completed;
- a divergence between book, tool or download is discovered;
- enough work has accumulated that continuing in another chat could lose context.

Every update must record:

- date and version;
- new and superseded decisions;
- actual implementation state;
- affected files/routes/data;
- validation performed;
- manual steps;
- known risks and blockers;
- rollback path;
- next-chat prompt.
