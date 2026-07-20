# VeilFarers Portal v59.52 — Full Technical and Product Handover

**Date:** 2026-07-19  
**Baseline:** v59.51  
**Canon:** VeilFarers Corebook 11.1-RC3.2 for advancement; current normalized RC3 portal datasets for equipment and implemented player rules.  
**Purpose:** preserve every editorial, strategic, UX, data, security, deployment and implementation decision required to continue in a new chat without context loss.

## 1. Current project decision

VeilFarers remains the active product, interface and codebase name. `Sileris` and `Sileris Chronicles` remain possible future alternatives under legal review only. No visible brand, route, package, Firestore path, local-storage key, asset or internal identifier has been renamed in v59.52.

## 2. Release objective

v59.52 is a table-scope, character-selection and visual-convergence release on top of v59.51. It responds to live Deploy Preview feedback without reopening the protected dice renderer or changing the VeilFarers brand.

The release objectives are:

1. keep every completed character in an account-owned Character Vault while maintaining exactly one shared active Character ID;
2. synchronize the active selection between Account, Charsheet, Player Tool and Level Up;
3. ensure a Keeper note is addressed either to all players in the connected table or to exactly one selected player in that table;
4. prevent notes from appearing on unrelated characters, accounts or tables;
5. let the Keeper decide per roll whether it remains private or is broadcast to the current table;
6. make hidden Keeper rolls local-only and public Keeper rolls table-scoped;
7. align Keeper Tool with Player Tool through the same navy/cyan/amber visual hierarchy, compact controls and persistent console model;
8. retain every v59.51 correction: invitations, historical passwords, Proficiency damage scaling, legacy JSON upgrade, Player deduplication, Keeper live state, closable/resettable Log and catalogue filters.

All earlier architecture remains in force: permanent `VF-######` identity, build/runtime separation, authenticated Netlify/Firebase identity bridge, owner/member tables, equipment Mods, drone synchronization, guided RC3.2 Level Up, Power Vault, Shake to Roll, 3D initialization fallback and navigation-owned Character ID.

## 3. v59.52 implementation details

### Multi-character Vault with one active selection

Character Vault remains a collection: one authenticated account may own many completed `VF-######` records. v59.52 adds a separate server-only profile document:

```text
characterVaultProfiles/{netlifyUid}
```

The profile stores only `ownerId`, `activeCharacterId` and `updatedAt`. `/api/character-vault` now supports `setActive`, and every `list` response returns the verified account's active ID. The server accepts an active ID only when that character belongs to the caller and is not in Trash.

The first completed character becomes active automatically. Adding another character does not replace the active selection. Trashing the active character selects one remaining non-trashed character; an empty Vault has no active ID. Account shows every character and marks exactly one with `ACTIVE`; `Set Active`, Charsheet, Player Tool and Level Up all update the shared selection before opening.

The local key remains `veilfarers.character.currentId.v1` for offline continuity. Cloud selection is authoritative after a successful Vault refresh. Cross-tab selection changes emit `veilfarers:active-character-changed`, and the Character ID chip in navigation follows the active record.

### Exact Keeper note recipients

The note composer offers exactly two modes:

- **All players in this table**;
- **One player only**, selected from players currently represented in the connected session.

Player Tool stamps non-drone table characters with the authenticated Netlify member UID. The Keeper recipient list deduplicates multiple character tabs belonging to the same account. For historical session records without a UID, the permanent Character ID remains a compatibility target.

`sendHandout` is owner-only. `/api/table-api` ignores client table identity fields and writes the current verified `tableId`, `senderUid`, normalized target and send time. A private target is rejected unless its member UID or compatible character identifier exists among non-drone characters in that same session. The note cannot be written to another table through a forged client payload.

Player Tool applies two defensive filters before opening a note:

1. its `tableId` must match the currently connected table;
2. its target must be `all` or match the signed-in member UID/active character identity.

Sent-note history displays the resolved player name when available. Removing a note is also owner-only and affects only the current session document.

### Keeper roll privacy and broadcast

Keeper Console has a persistent two-state control:

- **Keeper Only** — the roll is stored only in that Keeper browser and never calls the table API;
- **Broadcast** — the roll is normalized with `visibility: public`, `tableId` and `senderUid`, then appended only to the connected table's roll history.

The choice applies to manual Keeper rolls, damage rolls and Keeper ability broadcasts. It is remembered locally but can be changed before every roll. Keeper history labels entries `KEEPER ONLY` or `BROADCAST`. Private history is filtered by table when the Keeper changes sessions. Player Tool ignores any roll not explicitly public/legacy-public and ignores table-mismatched handouts.

Player-generated rolls continue to use the existing member broadcast path. Hidden Keeper rolls never enter Firestore, so no Rule or client query can accidentally expose them.

### Keeper Tool visual convergence

`keeper-player.css` rebuilds the Keeper presentation around the Player Tool visual language:

- deep navy application background with restrained grid/space texture;
- cyan section/state accents and amber primary actions;
- compact uppercase labels, tabs and buttons;
- dark translucent panels with the same border/radius hierarchy;
- Player-like authenticated account and live-state treatment;
- a persistent right-side **Keeper Console** containing table access, Spotlight, drone signal, roll privacy and targeted communication;
- responsive collapse to a bottom floating console on narrower screens;
- custom in-app recipient and visibility controls rather than browser-native interaction patterns.

The note modal is explicitly above navigation and the fixed console. Radio/checkbox controls retain accessible native semantics while all surrounding UI follows VeilFarers styling.

### v59.51 systems retained

v59.52 retains the v59.51 invitation lifecycle, Proficiency-scaled weapon damage, authenticated Keeper state writes, historical password migration, resilient Vault fallback, old JSON upgrade, Player deduplication/runtime preservation, Player Log controls and expanded catalogue filtering without changing their canon or data contracts.

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
- Firestore records: `characters/{characterId}`.
- Server-only active selection: `characterVaultProfiles/{netlifyUid}`.
- Counter: `systemCounters/characters`.
- Local registry: `veilfarers.characters.registry.v1`.
- Local active-selection mirror: `veilfarers.character.currentId.v1`.
- Cross-tab channel: `veilfarers-character-sync-v1`.

`allocate-character-id.mts` requires an authenticated Netlify user and reserves the character with `ownerId` and `ownerEmail`.

### Vault behavior

`character-registry.js` is the local/cloud Vault adapter. Account-owned CRUD goes through `/api/character-vault`, which verifies the Netlify Identity bearer token and uses Firebase Admin server-side.

The adapter:

- retains multiple completed characters for one account;
- exposes exactly one active Character ID, or none when no active records exist;
- synchronizes the active ID through the server-only profile document;
- waits for Identity before cloud access and sends the current bearer token;
- lists/gets/upserts only records belonging to the verified user;
- filters stale records from other accounts on shared browsers;
- distinguishes incomplete reservations from completed characters;
- supports active/non-trashed records and Trash/restore;
- retains deferred/offline sync and local JSON portability;
- exposes one summary model to Account, Level Up and Player Tool;
- emits an explicit active-selection event without reloading application pages.

`/api/character-vault` supports `list`, `get`, `upsert` and `setActive`. The server forces owner fields, schema, timestamps and valid status. `setActive` rejects another user's character and any trashed record.

Normal selectors use completed records, exclude Trash and mark the shared active record. The active designation is selection state, not a limitation on how many characters may exist.

### Account page

Account provides:

- all completed characters plus a separate Trash view;
- exactly one `ACTIVE` badge;
- `Set Active` for every other character;
- cloud refresh and current-record synchronization;
- open Charsheet, Player Tool or Level Up after selecting that record;
- export;
- custom two-step Trash and restore flow.

Creating or importing another character adds a Vault record; it does not delete or overwrite unrelated characters.

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

### One active character across tools

Account is the primary Vault management surface. Charsheet, Player Tool and Level Up treat `activeCharacterId` as the default record, while still allowing a deliberate selection from the full Vault.

Selecting a Player Tool tab with a permanent ID updates the shared active ID. Opening a different Vault character changes the active selection before importing/updating its Player representation. Opening Charsheet or Level Up from Account does the same.

### Level Up

`/creator.html#level-up` lists all completed characters belonging to the current user and marks the current active character. Selecting one does not create a copy; the existing permanent record is updated after advancement.

### Player Tool

The Add flow provides:

- From Character Vault;
- Create manually;
- Create Drone.

Opening a Vault character compares normalized permanent Character IDs:

- same final ID: update the existing Player record;
- pending/final version of the same build: migrate the pending record in place;
- genuinely new final ID: add one Player record;
- trashed record: exclude it from normal selection.

Exact duplicates left in local storage are collapsed on startup. Runtime tracks remain attached to the existing Player record during build refreshes. Multiple Vault characters remain available even though only one is the current active selection.

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
- Keeper Tool requires Netlify Identity; authenticated `member`, `keeper` and `admin` roles may use it.
- `window.VF_KEEPER_USER` exposes only ID, email and display name for UI/data ownership.
- Local test bypass remains explicitly limited to the local runtime flag/private hostname.
- `keeper-player.css` aligns the interface with Player Tool while retaining the Keeper campaign modules.
- A fixed/right responsive Keeper Console groups table connection, Spotlight, drones, private/public rolls and targeted notes.
- Firebase initialization remains singleton and table listing waits for the authenticated Keeper user.
- Notes are owner-only and table/recipient scoped by the server.
- Keeper rolls can be local-private or current-table public.

This matches the product decision that using Keeper Tool and creating/managing tables require a general account. Visual convergence does not merge permissions: account authentication, table membership and table ownership remain separate boundaries.

## 15. Table architecture and v59.52 communication API

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
- owner manages members, password, invitations and Keeper notes;
- a new non-member requires an invitation; a protected table additionally requires its password;
- member IDs are Netlify/Firebase UIDs;
- password verifiers and raw invitation tokens are never client-readable.

Relevant `/api/table-api` actions:

- `patchSession`: whitelisted live state;
- `broadcastRoll`: public roll for the supplied/current table; normalized server-side with `tableId`, `senderUid` and `visibility: public`;
- `clearRollHistory`: authenticated table roll reset;
- `sendHandout`: owner-only targeted note with server-validated table recipient;
- `deleteHandout`: owner-only deletion in the current table;
- legacy-compatible `setHandouts`: owner-only, normalized to the current table;
- invitation/member/password owner administration retained from v59.51.

Non-drone session characters may carry `memberUid` to identify the authenticated Player account. Historical records may use `characterId`, `id` or `syncId` as compatibility recipient IDs. The server accepts only IDs found in the current session.

Hidden Keeper rolls do not call `/api/table-api`; they exist only in the local Keeper browser. Real-time readers still require authenticated membership and read only their connected session document.

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

They are pinned by `package-lock.json`. v59.49-v59.52 retain every `resolved` URL against `https://registry.npmjs.org/` and include `.npmrc` with the same registry, preventing Netlify from attempting to reach the inaccessible internal build registry previously captured in the lockfile. `node_modules` is excluded from deploy artifacts.

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

`firestore_v59.52.rules` retains the authenticated ownership/membership baseline.

Character Vault CRUD now runs through the authenticated server function and therefore no longer requires the branch client to have direct `characters/*` permission. The existing character Rules remain as defense-in-depth/compatibility. Real-time table sessions still depend on Firebase custom authentication and the active membership Rules.

Rules are project-wide. A branch deploy sharing production Firebase cannot safely test a different Rules version independently. Before the coordinated cutover:

- Character Vault may be tested through `/api/character-vault`;
- test tables only with disposable new names;
- do not claim/modify a real legacy production table;
- do not describe table membership security as fully accepted until denial tests pass under active Rules.

## 21. Validation completed

- package and lockfile versions are `59.52.0` and all dependency URLs use `registry.npmjs.org`;
- all portal JSON parses and changelog current version is v59.52;
- all first-party standalone JavaScript passes `node --check`;
- every non-JSX inline HTML script parses;
- Player Tool JSX parses with the Babel parser;
- all seven Netlify Function `.mts` files transform as TypeScript;
- bundled `normalizeHandout` fixtures accept `all`, accept one current-table member and reject an unknown/cross-table target;
- Registry fixture retains two Vault records while exposing exactly one active Character ID;
- Player Tool table-save code stamps non-drone characters with authenticated `memberUid`;
- private Keeper rolls contain no server write path, while public rolls call `broadcastRoll` with current-table normalization;
- Player Tool filters notes by table and recipient and filters roll history by public visibility;
- static Keeper layout inspection confirms the Player-style product bar, navy/cyan/amber hierarchy and fixed Keeper Console;
- protected dice assets match v59.51 byte-for-byte;
- ZIP structure, dependency exclusion, credential scan and internal-registry scan pass.

Full details are in `VALIDATION_v59.52.txt`. Static checks do not replace live two-account Netlify/Firebase acceptance.

## 22. Manual QA still required

- create at least three Vault characters, change the active character from Account and from Player Tool, then confirm one active badge/ID across tabs and a second browser session;
- Trash the active character and confirm exactly one remaining record becomes active; restore it without changing the selected record unexpectedly;
- connect two Player accounts to Table A and one Player account to Table B;
- send a note to one Table A player and verify only that account receives it;
- send a note to all Table A players and verify both Table A accounts receive it while Table B receives nothing;
- change the active character on the targeted account and confirm member-UID targeting still reaches that player;
- perform Keeper Only rolls and verify no Player receives them and no public session history entry is created;
- perform Broadcast rolls and verify only players connected to the current table receive them;
- change Keeper tables and confirm private roll history is not mixed between tables;
- validate the rebuilt Keeper UI on desktop, tablet and mobile, including note modal layering, keyboard focus and responsive console placement;
- regress v59.51 invitations, password migration, Keeper state, old JSON imports, Player deduplication/runtime preservation, Proficiency damage, Log controls and catalogue filters;
- regress login, table membership denials, Level Up, Mods, drones, Shake, 2D/3D dice and Charsheet print/PDF.

No live acceptance claim is made until these checks pass in a real Deploy Preview.

## 23. Known limitations

- the active Character ID is selection metadata, not a second character copy; offline devices may briefly show their local last selection until a successful Vault refresh;
- historical table characters without `memberUid` use Character ID targeting until they are next saved by an authenticated Player Tool;
- private Keeper rolls are intentionally device-local and do not synchronize to a second Keeper browser;
- only the latest raw invitation passkey created on an owner device is displayable; older raw tokens remain irrecoverable because the server stores only hashes;
- Vault permanent deletion/recovery policy is not implemented; current deletion is Trash/restore;
- no ownership transfer for characters or tables;
- invitation email is not sent automatically;
- App Check and dedicated rate limiting remain pending;
- Shake support depends on browser/hardware permission;
- Runtime Babel/Tailwind and remaining permissive CSP clauses remain technical debt.

## 24. Production procedure

1. Preserve the v59.51 ZIP and currently deployed Firestore Rules.
2. Deploy the complete v59.52 artifact to a test branch/Deploy Preview.
3. Hard-refresh, sign out and sign in on Keeper and Player accounts.
4. Run the multi-character/one-active Vault tests across two browser sessions.
5. Create two disposable tables and use at least three distinct accounts to prove single-player, all-current-table and cross-table isolation.
6. Test Keeper Only and Broadcast rolls and inspect the current table document to confirm only public rolls are written.
7. Inspect note records for server-forced `tableId`, `senderUid` and one/all target normalization.
8. Validate Keeper UI desktop/mobile and note-modal layering.
9. Regress all v59.51 acceptance scenarios.
10. Complete `VALIDATION_v59.52.txt` and publish only after preview sign-off.
11. Deploy project-wide membership Rules only as part of the coordinated table-security cutover and run denial tests immediately.

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

Continue VeilFarers Portal from v59.52. Treat `PORTAL_HANDOVER_v59.52.md` as the complete source of project state. Keep VeilFarers branding. The immediate task is live Deploy Preview acceptance of an account-owned multi-character Vault with exactly one active Character ID, exact one-player/all-current-table Keeper notes, local-private/current-table-public Keeper rolls, and the Player-style Keeper UI. Preserve all v59.51 systems: invitations, historical password migration, authenticated Keeper live state, legacy JSON import, Player deduplication/runtime preservation, Proficiency-scaled damage, closable/resettable Log and catalogue filters. Preserve permanent `VF-######` identity, build/runtime separation, guided RC3.2 Level Up, authenticated Keeper access, owner/member authorization, Mods, drones, compact rules and the protected v59.25 dice renderer. Do not reintroduce page reload loops, direct client Vault CRUD, global handouts, cross-table broadcasts, hidden-roll Firestore writes, browser-native catalogue controls, recoverable raw invitation storage or internal package-registry URLs. Do not deploy project-wide Firestore Rules independently of the coordinated security cutover.
