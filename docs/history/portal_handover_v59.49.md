# VeilFarers Portal v59.49 — Full Technical and Product Handover

**Date:** 2026-07-18  
**Baseline:** v59.48  
**Canon:** VeilFarers Corebook 11.1-RC3.2 for advancement; existing current portal datasets for all other implemented rules.  
**Purpose:** preserve all editorial, strategic, UX, data, security, deployment and implementation decisions needed to continue in a new chat without context loss.

## 1. Current project decision

VeilFarers remains the active product, interface and codebase name. `Sileris` and `Sileris Chronicles` are only possible future alternatives under legal review. No text, route, package, database field, asset, domain configuration or internal identifier has been renamed in v59.49.

## 2. Release objective

v59.49 is a focused reliability and authentication hotfix on top of the complete v59.48 account/character lifecycle. It resolves the observed Deploy Preview failures without changing approved product behavior:

1. permit the current Netlify Identity login frame under the portal CSP;
2. wait for the Identity session and send its bearer token to every authenticated Netlify Function request;
3. move Character Vault reads/writes behind an authenticated server-side endpoint so branch testing does not depend on project-wide Firestore Rules;
4. guarantee that the 3D dice preparation modal times out or can be dismissed/fallback to 2D;
5. render Player Tool connection alerts as opaque cards immediately below the shared navigation;
6. lock npm dependency resolution to the public npm registry.

All v59.48 functionality remains: permanent Character IDs, account Vault, guided RC3.2 Level Up, build/runtime separation, Power Vault, Shake to Roll, authenticated Keeper Tool, table ownership/invitations, equipment Mods, drone synchronization and compact live-play rules.

## 3. Frozen and protected behavior

- The exact v59.25 dice result calculation, roll resolution and protected `assets/3d-dice` renderer/assets remain frozen.
- Shake to Roll only invokes the existing roll entry points.
- The 3D loading modal wraps initialization but does not change result generation.
- Automated validation confirms no Git diff under `assets/3d-dice`.

## 4. Identity architecture

### General account

Netlify Identity remains the general user account authority. Firebase remains database and real-time synchronization.

### Member role

`netlify/functions/identity.mts` subscribes to typed `userSignup` and `userLogin` events. It adds `member` to `appMetadata.roles` while retaining existing roles.

Role meaning:

- `member`: ordinary logged-in VeilFarers user; may use Keeper Tool and own/join tables;
- `keeper`: retained compatibility/special designation; also permitted to Keeper Tool;
- `admin`: permitted to Keeper Tool and Admin.

`netlify.toml` applies role-conditioned edge routing to Keeper Tool. Admin remains admin-only.

Existing accounts need a new login or token refresh before the new role is represented in the JWT.

### Firebase UID bridge

`/api/firebase-auth-token` creates a Firebase custom token whose UID is the Netlify user ID. Character owner IDs and table member IDs therefore use one identity value.

### Identity transport hotfix

The browser now waits briefly for `netlifyIdentity.currentUser()` before issuing cloud calls. It obtains the current Identity JWT and sends it as `Authorization: Bearer <token>` to:

- `/api/firebase-auth-token`;
- `/api/allocate-character-id`;
- `/api/character-vault`;
- `/api/table-api`.

This prevents login/session races and allows `@netlify/identity` `getUser()` to verify the caller inside Netlify Functions. The CSP `frame-src` list now permits `https://app.netlify.com`, which the current legacy Identity widget uses for its modal frame. `https://www.gstatic.com` is also allowed in `connect-src` so browser developer tools can retrieve Firebase source maps; these source maps are diagnostic only.

## 5. Character identity and Vault

### Permanent identity

- Final format: `VF-######`.
- Offline/deferred fallback: `PENDING-*`.
- Firestore: `characters/{characterId}`.
- Counter: `systemCounters/characters`.
- Local registry: `veilfarers.characters.registry.v1`.
- Current selection: `veilfarers.character.currentId.v1`.
- Cross-tab channel: `veilfarers-character-sync-v1`.

`allocate-character-id.mts` requires an authenticated Netlify user and reserves the character with `ownerId` and `ownerEmail`.

### Vault behavior

`character-registry.js` remains the local/cloud Vault adapter, but v59.49 no longer performs direct browser Firestore reads/writes for Character Vault. It calls `/api/character-vault`, which uses Firebase Admin credentials server-side and enforces the authenticated Netlify user as `ownerId`. This removes the observed `Missing or insufficient permissions` failure in a Deploy Preview whose Firestore Rules have not yet been cut over.

The adapter:

- waits for the Identity session before cloud access;
- sends the Identity bearer token to the server function;
- lists/gets/upserts only records belonging to the verified user;
- filters local records by current owner, preventing stale characters from another account on a shared browser appearing in selectors;
- distinguishes incomplete reservations from completed characters;
- supports `active` and `trashed` states;
- retains deferred/offline sync;
- exposes one summary model to Account, Level Up and Player Tool.

`netlify/functions/character-vault.mts` supports `list`, `get` and `upsert`. The server forces `characterId`, `ownerId`, `ownerEmail`, schema, timestamps and allowed status values; a record owned by another account cannot be overwritten.

Normal selectors use `completedOnly: true`, exclude Trash and do not list unowned records while a user is logged in.

### Account page

`account.js` no longer uses legacy Identity user metadata as a pseudo-Vault. It uses the Firebase-backed Registry and provides:

- Active and Trash views;
- cloud refresh;
- open Charsheet, Player Tool or Level Up;
- export;
- custom in-app two-step Trash and restore flow;
- current-record synchronization.

## 6. Creator completion

When Character Creator finishes:

1. allocate/confirm the permanent Character ID;
2. save the complete Creator state;
3. generate the Charsheet payload;
4. mark the Vault record completed;
5. attempt cloud synchronization;
6. report saved/pending state;
7. open Charsheet.

Incomplete drafts remain local and do not clutter the normal account Vault. The user may later Trash a completed character.

## 7. Shared Vault selection

### Level Up

`/creator.html#level-up` lists completed characters belonging to the current user from local/cloud Vault.

### Player Tool

The Add flow provides:

- From Character Vault;
- Create manually;
- Create Drone.

Opening a Vault character compares the permanent Character ID:

- same ID: update existing Player record;
- new ID: add one Player record;
- trashed record: remove from active Player storage.

The current saved character also has a direct Level Up action.

## 8. Guided Level Up

### Canon source

`VeilFarers_Corebook_11.1-RC3.2-PDF-Candidate.pdf`, Chapter 12: **The Long Climb**, PDF pages 125–128. The workflow also loads canonical:

- `rules-data/core/classes.json`;
- `rules-data/core/subclasses.json`;
- `rules-data/core/powers.json`;
- `rules-data/core/resolve-moves.json`;
- path-compatible class data from `data/classes.json`.

### Workflow

1. Select Character from Vault.
2. Review target Level/Tier and automatic Tier Achievement.
3. See all eleven advancement options.
4. Select options while a two-slot meter validates cost.
5. Configure exact choices.
6. Review before/after.
7. Apply once to the same Character ID.

### Eleven options

1. +1 Hit Point Slot — 1 slot.
2. +1 Stress Slot — 1 slot.
3. +1 to two Experiences / new Experience alternative — 1 slot.
4. +1 Trait — 1 slot, once per Trait per Tier.
5. +1 Evasion — 1 slot.
6. +1 Proficiency — 2 slots, cap 6.
7. +1 Technology Access — 1 slot.
8. New Power — Awakened Domain Power or Sleeping Resolve maximum/Move — 1 slot.
9. Multiclass — 2 slots, Level 5+, once.
10. Upgraded Subclass — 2 slots, Level 5+, sequential Specialization then Mastery.
11. Tempered Resolve — 2 slots, Tier 3 Sleeping only, once.

All options remain visible. An unavailable option is disabled with its reason rather than removed.

### Tier Achievements

At Levels 2, 5 and 8, in addition to the two slots:

- +1 Proficiency, cap 6;
- +1 to two Experiences, including the book’s new-Experience alternative;
- Levels 5 and 8 clear marked Traits when that optional rule is used.

### Exact selectable content

- Awakened Powers filter by accessible Domains, effective Domain level and current ownership.
- New Powers enter the character’s Vault by default.
- Sleeping Moves come from the exact canonical class/subclass Resolve Move collection.
- Multiclass guides Class, valid genuinely new Domain, exact Class Feature and Background Question.
- Subclass displays and writes the exact path-specific RC3.2 Specialization or Mastery.

### Advancement data

State includes:

```text
level
proficiency
hpMaxBonus
stressMaxBonus
evasionBonus
technologyAccessLevel
experienceBonuses
traitAdvances
vaultPowers
resolveMoves
resolveMaxBonus
resolveDie
subclassRank
multiclass
temperedResolve
advancementHistory
```

Each application records a timestamped history entry with level, Tier, selected options and before/after values.

## 9. Charsheet and Player synchronization

### Bridge

`sheet-bridge.js` now includes:

- every acquired Subclass rank through current `subclassRank`;
- exact path-specific Sleeping/Awakened subclass rules;
- Multiclass Class, Domain, Class Feature and answered Background Question;
- learned Resolve Moves;
- Resolve die;
- Power Vault;
- advancement history;
- all level-derived HP/Stress/Evasion/Resolve/Experience/Proficiency values.

### Importer

`veilfarers-import.js` restores these values from either Creator state or Charsheet payload. It loads path-compatible class data through `canonical-runtime.js` and prevents duplicate learned moves.

### Build versus runtime

Level Up changes build data. `character-sync-adapter.js` preserves live Player runtime:

- current HP;
- current Stress;
- current Hope or Effort;
- current Resolve;
- current Armor/shields;
- Conditions;
- table notes/signal and other live fields.

This prevents a level-up from healing, refreshing or clearing a character unintentionally.

### Power Vault in Player Tool

- New acquired Powers are owned but inactive.
- Player Tool shows a `Power Vault` beneath active cards.
- `Recall` moves an owned card into the active Loadout.
- Returning an active card places it back in Vault.
- Active Loadout remains capped at five.

## 10. Mobile Shake to Roll

- Opt-in setting; default off.
- Handles `DeviceMotionEvent.requestPermission()` where required.
- Only listens while the page is visible and the roller is open, not minimized and not already resolving.
- Requires a two-peak movement pattern and applies a cooldown.
- Invokes the currently selected normal roll action.
- Normal roll button always remains available.
- `Permissions-Policy` permits accelerometer/gyroscope only for same-origin content.

Real-device tuning remains mandatory, particularly iOS permission flow and Android sensitivity.

## 11. 3D dice initialization progress

The Player Tool starts an idle preload. When a user rolls before initialization completes, a modal displays actual milestones:

- renderer;
- physics;
- themes/assets;
- scene preparation;
- ready.

The bar is milestone-based rather than a fake elapsed-time percentage. The pending roll continues automatically at Ready. v59.49 adds:

- a 20-second hard initialization timeout;
- a readiness ref that closes the modal even when preload and first-roll initialization overlap;
- `Use 2D dice` and `Close` controls while loading, not only after failure;
- `Retry` after an actual failure;
- automatic standard random-result fallback when the 3D renderer fails.

The numerical result does not depend on 3D success, and the protected renderer/assets remain untouched.

## 12. Player Tool connection errors

All connection errors use `ReactDOM.createPortal(..., document.body)`, `role="alert"` and `aria-live="assertive"`. Product placement was refined after real preview feedback:

- the alert begins immediately below `--vf-portal-height`;
- the navigation remains visually above it;
- the alert has an explicit opaque `#450a0a` background and strong shadow, independent of Tailwind opacity-class generation;
- it remains above Player Tool content and controls;
- it can be dismissed.

Messages must never echo secrets or password verifiers.

## 13. Keeper Tool

- Shared `portal.js` navigation is loaded immediately after `<body>`.
- Layout offsets account for the portal navigation height.
- Keeper Tool requires Netlify Identity.
- Signed-out users see the gate/redirect to Account.
- Any authenticated `member`, `keeper` or `admin` can use it.
- `window.VF_KEEPER_USER` exposes only ID, email and display name for UI/data ownership.
- Local test bypass remains explicitly limited to the local runtime flag/private hostname.

This matches the product decision that creating/managing tables and using Keeper Tool require a general account.

## 14. Table architecture retained from v59.47

Collections:

```text
artifacts/default-app-id/public/data/sessions/{tableId}
artifacts/default-app-id/public/data/tableDirectory/{tableId}
artifacts/default-app-id/public/data/tableInvites/{sha256(token)}
artifacts/default-app-id/public/data/tableSecrets/{tableId}
```

- authenticated safe directory;
- creator is owner and first member;
- owner creates/revokes link/passkey invitations;
- optional email binding;
- protected joins also require password;
- PBKDF2 verifier server-only;
- owner adds/changes/removes password and removes members;
- existing legacy tables are claimed lazily after authenticated successful join.

No table schema change is introduced by v59.49.

## 15. Equipment, drones and compact rules retained from v59.47

- Charsheet → Player Tool drone module `info`/`status` updates the same stable drone record.
- Corebook weapon/armor Mods and Tier Hardpoints remain available in Charsheet and Player Tool.
- Printable inventory lists `[Equipment] Mod — Effect` and overflows to General Notes.
- Charsheet uses labeled schematic summaries; Player Tool uses maximum practical compression.
- Costs, triggers, frequency, ranges, duration, dice, DC, Advantage/Disadvantage and restrictions remain visible.

## 16. Navigation

Shared navigation now includes an explicit Level Up route and is present in Keeper Tool. Native browser-looking controls should continue to be replaced with VeilFarers custom components where practical and accessible.

## 17. Dependencies

```text
@netlify/identity 1.2.0
@netlify/functions 5.3.0
```

They are pinned by `package-lock.json`. v59.49 regenerates every `resolved` URL against `https://registry.npmjs.org/` and includes `.npmrc` with the same registry, preventing Netlify from attempting to reach the inaccessible internal build registry previously captured in the lockfile. `node_modules` is excluded from deploy artifacts.

## 18. Environment variables

No new names:

```text
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID
FIREBASE_PUBLIC_TABLE_DIRECTORY=false
FIREBASE_SERVICE_ACCOUNT_JSON
```

`FIREBASE_SERVICE_ACCOUNT_JSON` remains server-only and must never appear in static files or `/api/firebase-config`.

## 19. Firestore Rules and deployment boundary

`firestore_v59.49.rules` retains the authenticated ownership/membership baseline.

Character Vault CRUD now runs through the authenticated server function and therefore no longer requires the branch client to have direct `characters/*` permission. The existing character Rules remain as defense-in-depth/compatibility. Real-time table sessions still depend on Firebase custom authentication and the active membership Rules.

Rules are project-wide. A branch deploy sharing production Firebase cannot safely test a different Rules version independently. Before the coordinated cutover:

- Character Vault may be tested through `/api/character-vault`;
- test tables only with disposable new names;
- do not claim/modify a real legacy production table;
- do not describe table membership security as fully accepted until denial tests pass under active Rules.

## 20. Validation completed

- clean `npm ci` using only the public npm registry;
- no internal OpenAI/artifactory URL in `.npmrc` or `package-lock.json`;
- JSON and first-party JS syntax;
- Player JSX parse after loader/alert changes;
- all Netlify Function `.mts` files parse, including `character-vault.mts`;
- Character Vault server ownership enforcement fixture;
- Identity bearer-header and login-wait paths statically verified;
- CSP contains the Identity frame and gstatic diagnostic connection origins;
- 3D initialization timeout and always-visible escape controls present;
- warning placement/background present;
- all retained v59.48 regression checks;
- protected dice-asset integrity;
- ZIP extraction/root/security scan.

Full details are in `VALIDATION_v59.49.txt`.

## 21. Manual QA still required

- real Netlify build, Identity modal, Identity events and CDN role redirects;
- existing-user logout/login role refresh;
- Firebase custom-token for tables and cross-device Vault through `/api/character-vault`;
- two-account isolation;
- all Level Up combinations at Levels 2/5/8 and 10;
- iOS/Android Shake to Roll;
- normal, overlapping-preload, slow, timed-out and failed 3D initialization;
- opaque connection alert placement below navigation on desktop/mobile;
- Keeper signed-out/signed-in behavior and navigation;
- responsive/accessibility;
- Charsheet print/PDF;
- complete human review of compacted canon text.

The managed Chromium runtime blocked local navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; therefore no claim of real browser visual validation is made.

## 22. Known limitations

- Vault permanent deletion/recovery policy is not implemented; current deletion is Trash/restore.
- No ownership transfer for characters or tables.
- Invitation email is not sent automatically; owner copies link/passkey.
- App Check and dedicated rate limiting remain pending.
- Shake support depends on browser/hardware permission and cannot be guaranteed on every desktop/mobile browser.
- Runtime Babel/Tailwind and permissive CSP clauses remain technical debt.

## 23. Production procedure

1. Preserve v59.48 ZIP and export current Firestore Rules.
2. Deploy v59.49 to the test branch/Deploy Preview.
3. Confirm dependency installation uses `registry.npmjs.org`.
4. Confirm all Functions bundle, especially `identity.mts`, `firebase-auth-token.mts` and `character-vault.mts`.
5. Hard-refresh, sign out and sign in again.
6. Confirm the Identity modal opens without a CSP frame error.
7. Create a new test account and verify Character Vault list/save/refresh across two browsers.
8. Confirm a table connection obtains a Firebase custom token without repeated 401 responses.
9. Test 3D ready, timeout, Close and Use 2D paths.
10. Confirm the opaque connection alert sits below navigation.
11. Complete `VALIDATION_v59.49.txt` with disposable data.
12. Publish v59.49 only after preview sign-off.
13. Coordinate Firestore membership Rules separately for secure real-time tables.

## 24. Rules for future work

1. Never invent VeilFarers mechanics; source them from the latest approved books/data and identify the source.
2. Preserve one permanent Character ID across every representation.
3. Treat Vault as the source of character build; treat Player runtime as live session state.
4. Keep Charsheet and Player Tool compact, with full prose in book/reference surfaces.
5. Never expose service-account credentials or confuse browser gates with authorization.
6. Keep table directory metadata safe and authenticated.
7. Preserve the protected dice calculation/renderer unless the user explicitly reopens that decision.
8. Keep VeilFarers branding until the user explicitly approves a legally cleared replacement.
9. Every release must include deploy ZIP, SHA-256, GitHub-ready summary, validation, security notes and full updated handover.
10. Prefer authenticated server APIs for account-owned CRUD that does not need real-time listeners; reserve direct Firestore clients for real-time table state protected by Rules.
11. Update this handover after every significant editorial, strategic, visual, data, security or deployment decision.

## 25. New-chat continuation prompt

Continue VeilFarers Portal from v59.49. Treat `PORTAL_HANDOVER_v59.49.md` as the complete source of project state. Keep VeilFarers branding. The immediate task is real Deploy Preview verification of Netlify Identity, `/api/character-vault`, Firebase custom-token table access, 3D loader timeout/fallback and opaque connection alerts below navigation. Preserve permanent `VF-######` identity, account-owned Vault, build/runtime separation, guided RC3.2 Level Up, authenticated Keeper access, v59.47 table ownership/invitations, equipment Mods, drone sync, compact rules and the protected v59.25 dice renderer. Do not reintroduce direct client Vault CRUD or internal package-registry URLs. Do not deploy project-wide Firestore Rules independently of the coordinated table-security cutover.
