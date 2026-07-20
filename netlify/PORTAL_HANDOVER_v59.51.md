# VeilFarers Portal v59.51 — Full Technical and Product Handover

**Date:** 2026-07-19  
**Baseline:** v59.50  
**Canon:** VeilFarers Corebook 11.1-RC3.2 for advancement; current normalized RC3 portal datasets for equipment and implemented player rules.  
**Purpose:** preserve every editorial, strategic, UX, data, security, deployment and implementation decision required to continue in a new chat without context loss.

## 1. Current project decision

VeilFarers remains the active product, interface and codebase name. `Sileris` and `Sileris Chronicles` remain possible future alternatives under legal review only. No visible brand, route, package, Firestore path, local-storage key, asset or internal identifier has been renamed in v59.51.

## 2. Release objective

v59.51 is a corrective integration release on top of v59.50. It addresses the defects found during live Deploy Preview use while preserving the authenticated architecture and frozen dice renderer:

1. keep the latest player invitation passkey visible until it is replaced or deleted;
2. expose invitation metadata and owner controls to edit, revoke/reactivate and delete invitations;
3. show Proficiency in Player Tool and apply it to weapon damage dice;
4. route Keeper live state, notes, handouts and roll broadcasts through the authenticated table API;
5. recognize and migrate historical table-password formats;
6. suppress transient Character Vault warnings when a local fallback is usable;
7. import old Creator, Charsheet and Player Tool JSON into one permanent Vault record;
8. prevent Player Tool duplicates during repeated open/import operations;
9. restore a closable/resettable Player Log and remove the stray React-rendered `0`;
10. expand every equipment catalogue with category, mechanical-property, ownership and cost filters.

All v59.50 decisions remain in force: permanent `VF-######` identity, account-owned Vault, build/runtime separation, guided RC3.2 Level Up, Power Vault, authenticated Keeper Tool, owner/member tables, equipment Mods, drone synchronization, compact rules, Shake to Roll, 3D initialization fallback and navigation-owned Character ID.

## 3. v59.51 implementation details

### Invitation lifecycle and owner administration

The owner modal no longer destroys the newly generated passkey by immediately rerendering. The latest raw passkey and invitation URL are stored only on the owner device in a table-scoped local-storage record. They remain visible until a replacement invitation is created or that invitation is deleted.

Firestore continues to store only `sha256(token)` as the invitation document ID. Older raw passkeys therefore cannot be recovered from the server. The owner can inspect every invitation's label, email binding, creation/expiry/use state and status, then edit label/email/expiry/max uses, revoke/reactivate it, or perform a two-step permanent deletion. Creating a new token replaces the locally displayed raw token; editing an invitation does not rotate its token.

### Proficiency in Player Tool

Player Tool now normalizes and displays Proficiency from 1 to 6. Weapon cards show both the printed base damage and the resulting Proficiency-scaled dice expression. Proficiency multiplies weapon damage dice before critical multiplication. Example: `1d8+2` at Proficiency 3 becomes `3d8+2`; a critical becomes `6d8+2`. Massive rolls one additional damage die and drops the lowest as before.

Proficiency is not added to the Duality attack total. Attack rolls continue to use the weapon Trait and explicit weapon/armor feature bonuses. This follows the current advancement rule that Proficiency scales weapon damage dice rather than attack accuracy.

### Keeper live-state server path

Keeper no longer relies on direct browser writes for ordinary live mutations. Authenticated `/api/table-api` actions now support:

- whitelisted session patches for characters, Fear, Spotlight, Keeper notes and session name;
- roll broadcast and complete roll-history clearing;
- handout replacement;
- owner-only invitation and password administration.

Keeper notes use a debounced write. Session name, Fear, Spotlight, character tracks and drone signals use the same shared session record. The Firestore listener remains the real-time reader so Player and Keeper receive one canonical table state. Firebase initialization remains singleton and the erroneous settings/host override is removed.

### Historical table-password migration

New passwords use PBKDF2-SHA256 with 150,000 iterations and a random 16-byte salt stored as Base64. Verification accepts and migrates:

- correct browser-created PBKDF2 records using decoded salt bytes;
- the temporary v59.47-v59.50 server record that incorrectly used Base64 salt text as PBKDF2 salt;
- legacy SHA-256 of `veilfarers:<password>`;
- legacy SHA-256 of the raw password;
- the oldest plain legacy field, only as a one-time migration path.

After a successful legacy admission, a new server-only verifier is written to `tableSecrets`, client-readable legacy password fields are cleared and the session retains only the non-secret `SERVER_MANAGED` lock marker.

### Vault resilience and old JSON upgrade

Vault refreshes now coalesce concurrent requests, retry once, and return completed local records when the cloud call is temporarily unavailable. A warning event is still emitted for diagnostics, but UI flows do not show a blocking cloud error when usable local records are already loaded.

Creator, Level Up and Player Tool accept legacy Creator state, Charsheet envelopes/fields, Player Tool objects and Player Tool arrays. Import normalizes the build, requests a permanent ID when required, writes the same record to the local registry, attempts server Vault synchronization and opens/updates the corresponding representation. Existing final IDs are preserved. Exact legacy no-ID fingerprints can match an already identified local character before allocation, preventing a second permanent record.

### Player Tool deduplication and log

Deduplication first uses normalized permanent Character ID. Pending/no-ID records may also match an exact build fingerprint. Charsheet transfers, Vault opens and JSON imports all use the same add-or-update path and preserve current HP, Stress, Hope/Effort, Resolve, Armor, Conditions and notes.

The Player Log is rendered through a body-level portal with an opaque backdrop and explicit Close control. Reset invokes the authenticated server history action. Empty Augments/Drones sections now use explicit boolean comparisons so React does not render numeric `0` between panels.

### Equipment catalogue filters

Weapon & Armory and Item Inventory use custom in-app dropdowns rather than browser-native select menus. Available filters are generated from the active canonical collection:

- source and Tech Tier;
- equipment category;
- mechanical property (Trait, range, feature, armor slots, activation, capacity and effect groups as applicable);
- owned/not-owned state;
- cost band;
- name, Tier, cost or owned-quantity sorting.

Categories and properties cover weapons, armor, gear and augments. A Reset All control returns the catalogue to its default state.

## 4. Frozen and protected behavior

- The exact v59.25 dice result calculation, roll resolution and protected `assets/3d-dice` renderer/assets remain frozen.
- Shake to Roll only invokes the existing roll entry points.
- The 3D loading modal wraps initialization but does not change result generation.
- Automated validation confirms no Git diff under `assets/3d-dice`.

## 5. Identity architecture

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

## 6. Character identity and Vault

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

`character-registry.js` remains the local/cloud Vault adapter, but v59.49 onward no longer performs direct browser Firestore reads/writes for Character Vault. It calls `/api/character-vault`, which uses Firebase Admin credentials server-side and enforces the authenticated Netlify user as `ownerId`. This removes the observed `Missing or insufficient permissions` failure in a Deploy Preview whose Firestore Rules have not yet been cut over.

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

## 7. Creator completion

When Character Creator finishes:

1. allocate/confirm the permanent Character ID;
2. save the complete Creator state;
3. generate the Charsheet payload;
4. mark the Vault record completed;
5. attempt cloud synchronization;
6. report saved/pending state;
7. open Charsheet.

Incomplete drafts remain local and do not clutter the normal account Vault. The user may later Trash a completed character.

## 8. Shared Vault selection

### Level Up

`/creator.html#level-up` lists completed characters belonging to the current user from local/cloud Vault.

### Player Tool

The Add flow provides:

- From Character Vault;
- Create manually;
- Create Drone.

Opening a Vault character compares normalized permanent Character IDs:

- same final ID: update the existing Player record;
- pending/final version of the same build: migrate the pending record in place;
- genuinely new final ID: add one Player record;
- trashed record: remove the active Player record and owned drones.

Exact duplicates already left in local storage are collapsed on startup. Runtime tracks are preserved during build refreshes.

The current saved character also has a direct Level Up action.

## 9. Guided Level Up

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

## 10. Charsheet and Player synchronization

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

## 11. Mobile Shake to Roll

- Opt-in setting; default off.
- Handles `DeviceMotionEvent.requestPermission()` where required.
- Only listens while the page is visible and the roller is open, not minimized and not already resolving.
- Requires a two-peak movement pattern and applies a cooldown.
- Invokes the currently selected normal roll action.
- Normal roll button always remains available.
- `Permissions-Policy` permits accelerometer/gyroscope only for same-origin content.

Real-device tuning remains mandatory, particularly iOS permission flow and Android sensitivity.

## 12. 3D dice initialization progress

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

## 13. Player Tool connection errors

All connection errors use `ReactDOM.createPortal(..., document.body)`, `role="alert"` and `aria-live="assertive"`. Product placement was refined after real preview feedback:

- the alert begins immediately below `--vf-portal-height`;
- the navigation remains visually above it;
- the alert has an explicit opaque `#450a0a` background and strong shadow, independent of Tailwind opacity-class generation;
- it remains above Player Tool content and controls;
- it can be dismissed.

Messages must never echo secrets or password verifiers.

## 14. Keeper Tool

- Shared `portal.js` navigation is loaded immediately after `<body>`.
- Layout offsets account for the portal navigation height.
- Keeper Tool requires Netlify Identity.
- Signed-out users see the gate/redirect to Account.
- Any authenticated `member`, `keeper` or `admin` can use it.
- `window.VF_KEEPER_USER` exposes only ID, email and display name for UI/data ownership.
- Local test bypass remains explicitly limited to the local runtime flag/private hostname.

This matches the product decision that creating/managing tables and using Keeper Tool require a general account.

## 15. Table architecture and v59.51 live API

Collections:

```text
artifacts/default-app-id/public/data/sessions/{tableId}
artifacts/default-app-id/public/data/tableDirectory/{tableId}
artifacts/default-app-id/public/data/tableInvites/{sha256(token)}
artifacts/default-app-id/public/data/tableSecrets/{tableId}
```

Authorization remains:

- authenticated safe directory;
- creator is owner and first member;
- owner manages members, password and invitations;
- a new non-member requires an invitation; a protected table additionally requires its password;
- member IDs are Netlify/Firebase UIDs;
- password verifiers and raw invitation tokens are never client-readable.

v59.51 extends `/api/table-api` with whitelisted member live actions (`patchSession`, `broadcastRoll`, `clearRollHistory`, `setHandouts`) and owner invitation actions (`createInvite`, `updateInvite`, `deleteInvite`). These actions do not broaden the client Firestore Rules. Real-time readers still require authenticated membership.

## 16. Equipment, drones and compact rules retained from v59.47

- Charsheet → Player Tool drone module `info`/`status` updates the same stable drone record.
- Corebook weapon/armor Mods and Tier Hardpoints remain available in Charsheet and Player Tool.
- Printable inventory lists `[Equipment] Mod — Effect` and overflows to General Notes.
- Charsheet uses labeled schematic summaries; Player Tool uses maximum practical compression.
- Costs, triggers, frequency, ranges, duration, dice, DC, Advantage/Disadvantage and restrictions remain visible.

## 17. Navigation

Shared navigation now includes an explicit Level Up route and is present in Keeper Tool. Native browser-looking controls should continue to be replaced with VeilFarers custom components where practical and accessible.

## 18. Dependencies

```text
@netlify/identity 1.2.0
@netlify/functions 5.3.0
```

They are pinned by `package-lock.json`. v59.49-v59.51 retain every `resolved` URL against `https://registry.npmjs.org/` and include `.npmrc` with the same registry, preventing Netlify from attempting to reach the inaccessible internal build registry previously captured in the lockfile. `node_modules` is excluded from deploy artifacts.

## 19. Environment variables

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

## 20. Firestore Rules and deployment boundary

`firestore_v59.51.rules` retains the authenticated ownership/membership baseline.

Character Vault CRUD now runs through the authenticated server function and therefore no longer requires the branch client to have direct `characters/*` permission. The existing character Rules remain as defense-in-depth/compatibility. Real-time table sessions still depend on Firebase custom authentication and the active membership Rules.

Rules are project-wide. A branch deploy sharing production Firebase cannot safely test a different Rules version independently. Before the coordinated cutover:

- Character Vault may be tested through `/api/character-vault`;
- test tables only with disposable new names;
- do not claim/modify a real legacy production table;
- do not describe table membership security as fully accepted until denial tests pass under active Rules.

## 21. Validation completed

- all portal JSON files parse and changelog current version is v59.51;
- all first-party standalone JavaScript files pass `node --check`;
- every inline HTML script parses, including Player Tool JSX;
- all seven Netlify Function `.mts` files parse as TypeScript;
- `npm ci` succeeds using only public `registry.npmjs.org` URLs;
- fresh, browser-legacy and temporary server-legacy PBKDF2 password fixtures pass;
- Proficiency 3 converts `1d8+2` to `3d8+2`; critical/Massive planning passes;
- permanent-ID dedupe and exact legacy no-ID matching fixtures pass;
- the empty optional-section numeric-zero expression is absent;
- catalogue category/property/cost fixtures pass for weapons, gear and augments;
- invitation persistence/edit/delete markers and owner API actions are present;
- Keeper notes/session/character/handout/roll actions use the authenticated table API;
- old registry-driven reloads remain absent;
- protected dice assets match v59.50 byte-for-byte;
- ZIP root, dependency exclusion and credential/internal-registry scans pass.

Full details are in `VALIDATION_v59.51.txt`.

## 22. Manual QA still required

- create an invitation, leave/reopen Table Admin and confirm the latest passkey remains; edit, revoke/reactivate and delete it;
- join from a second account with invitation plus password and test one historical password table;
- change HP/Fear/Spotlight/notes/session name in Keeper and verify Player receives each change;
- broadcast Duality, d20, damage and ability entries from Keeper; clear the log from Player;
- import representative old Creator, Charsheet and Player Tool JSON files in all three import surfaces;
- open/import the same character repeatedly and verify one Player record and one Vault ID;
- confirm Proficiency-scaled damage for normal, critical, Massive and static-modifier weapons;
- exercise every new equipment filter on desktop and mobile;
- provoke a temporary Vault failure and confirm local records remain usable without a misleading blocking error;
- regress login, role refresh, two-account isolation, table membership denials, Level Up, Mods, drones, Shake and 3D fallback;
- responsive, keyboard and accessibility pass;
- Charsheet print/PDF and complete human canon-text review.

Static and fixture validation cannot replace a real Netlify/Firebase Deploy Preview. No live acceptance claim is made until these checks pass.

## 23. Known limitations

- only the latest raw invitation passkey created on a given owner device is displayable; older raw tokens are irrecoverable by design because Firestore stores only hashes;
- Vault permanent deletion/recovery policy is not implemented; current deletion is Trash/restore;
- no ownership transfer for characters or tables;
- invitation email is not sent automatically; owner copies link/passkey;
- App Check and dedicated rate limiting remain pending;
- Shake support depends on browser/hardware permission;
- Runtime Babel/Tailwind and remaining permissive CSP clauses are technical debt;
- automatically inferred gear/augment filter categories are presentation metadata, not new game mechanics.

## 24. Production procedure

1. Preserve the v59.50 ZIP and currently deployed Firestore Rules.
2. Deploy the complete v59.51 artifact to the test branch/Deploy Preview.
3. Confirm `npm ci` resolves only against `registry.npmjs.org`.
4. Hard-refresh, sign out and sign in.
5. Run the invitation, password migration and two-account join tests.
6. Run Keeper-to-Player notes/state/handout/roll synchronization tests.
7. Import old JSON in Creator, Level Up and Player Tool, then reopen the same character repeatedly.
8. Confirm one permanent Character ID and one Player record while runtime tracks survive build refreshes.
9. Validate Proficiency-scaled damage and the Player Log close/reset flow.
10. Validate catalogue filters on desktop/mobile.
11. Regress 2D/3D rolls, Shake, Mods, drones and Charsheet print.
12. Complete `VALIDATION_v59.51.txt` and publish only after preview sign-off.
13. Deploy project-wide membership Rules only as part of the coordinated table-security cutover and run denial tests immediately.

## 25. Rules for future work

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

## 26. New-chat continuation prompt

Continue VeilFarers Portal from v59.51. Treat `PORTAL_HANDOVER_v59.51.md` as the complete source of project state. Keep VeilFarers branding. The immediate task is Deploy Preview acceptance of persistent/editable invitations, historical password migration, Keeper-to-Player live state/notes/handouts/rolls, legacy JSON import with permanent Vault allocation, Player deduplication, Proficiency-scaled weapon damage, closable/resettable Player Log and expanded equipment filters. Preserve permanent `VF-######` identity, account-owned Vault, build/runtime separation, guided RC3.2 Level Up, authenticated Keeper access, owner/member table authorization, equipment Mods, drone sync, compact rules and the protected v59.25 dice renderer. Do not reintroduce registry page reloads, direct client Vault CRUD, browser-native catalogue dropdowns, recoverable raw invitation storage or internal package-registry URLs. Do not deploy project-wide Firestore Rules independently of the coordinated security cutover.
