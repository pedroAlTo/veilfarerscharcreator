# VeilFarers Portal v59.57 - Full Technical and Product Handover

**Date:** 2026-07-19  
**Baseline:** v59.56  
**Brand:** VeilFarers remains active; no Sileris rename has been applied.  
**Canon:** Current normalized Corebook RC3 portal datasets and the user-revised Downloads package remain the source of truth.  
**Purpose:** preserve every editorial, strategic, UX, visual, technical, application, security, deployment and validation decision required to continue the project in a new chat without context loss.

## v59.57 release delta

v59.57 is a full visual reconstruction of the Character Creator built on v59.56. It implements the approved dark navy, gold and heraldic Affiliate-screen direction across every creation step without changing the underlying creation rules or persistence workflow.

### Product and design decision

The approved Affiliate mockup is now the visual baseline for the Character Creator. The objective is not to reproduce a static illustration literally; it is to translate its hierarchy and atmosphere into a functional responsive application. The Creator now uses:

- a persistent desktop Creation Progress rail;
- a synchronized horizontal step rail above the active panel;
- dark navy application surfaces rather than white browser-like cards;
- restrained gold borders, ornamental corners and selected-state illumination;
- centered editorial headings and explanatory copy;
- a full-width guided action footer in the Creator workspace;
- a mobile layout that replaces the desktop rail with a scrollable horizontal step navigator;
- one coherent visual language across Ancestry, Community, Class, Traits, Experiences, Affiliation, Powers, Equipment and Review.

This is a Character Creator-only visual release. Level Up, Card Library, Charsheet, Player Tool and Keeper Tool retain their existing visual and functional implementations.

### Functional architecture preserved

The redesign deliberately reuses the existing DOM IDs, state object, rendering functions, validation gates and event handlers. It does not duplicate the creation engine or create a parallel wizard. Existing functions including `goStep`, `isStepReady`, `validateStep`, dependent-choice overlays, canonical data loading, import normalization, `finishCreatorToSheet`, Character Registry allocation and Vault synchronization remain authoritative.

The new files are:

```text
creator-redesign.css
creator-redesign.js
```

Release metadata is aligned at v59.57 in `package.json`, `package-lock.json` and `data/changelog.json`; the changelog includes the Character Creator reconstruction as the current entry.

`creator-redesign.css` contains the responsive visual system. `creator-redesign.js` synchronizes the secondary top step rail and the route-specific layout state. It does not persist character data and does not interact with authentication, Firebase or Netlify Functions.

### Desktop information architecture

At desktop widths the Creator uses a two-column application frame:

1. **Left progress rail**
   - VeilFarers Character Creator identity;
   - all nine creation steps plus Character Sheet state;
   - active, completed and pending visual states;
   - persistent project quote;
   - fixed-height viewport behavior with internal scrolling when required.

2. **Main workspace**
   - existing portal/header actions;
   - Character Creator / Level Up mode control;
   - synchronized horizontal step rail;
   - active creation panel;
   - guided Back/Next footer with existing readiness gates.

The global portal navigation remains visible. It was not removed because portal-wide navigation consistency remains an established product requirement.

### Mobile information architecture

Below approximately 820 px:

- the desktop progress rail is hidden;
- the horizontal step rail becomes sticky below the application header;
- card grids become single-column;
- the action footer spans the mobile viewport;
- Save and Load remain available;
- the Send to Charsheet header action is hidden at the narrowest width because the final guided action remains available in the footer;
- no native browser-looking modal or navigation control was introduced.

### Card and input system

All existing selection cards are visually rebuilt in place. The redesign preserves their text and click targets while changing presentation to:

- dark raised panels;
- gold corner geometry;
- consistent selected-state outlines and checkmarks;
- dark card bodies instead of white bodies;
- improved domain, stat, feature and rules-chip contrast;
- responsive art areas and text hierarchy.

The same treatment extends to:

- Path selection;
- Sub-Strain and Subclass overlays;
- Trait assignment;
- Experience and personal-detail fields;
- Domain Power cards;
- Equipment cards and filters;
- validation messages;
- feature tooltips;
- Review fields.

### Complete canonical Affiliation crest set

v59.56 integrated 11 canonical crest mappings and retained fallback monograms for House Amaranth and Independent. v59.57 completes the set:

- `house-amaranth` -> `img/affiliation/house-amaranth.webp`
- `independent` -> `img/affiliation/independent.webp`

The Independent option uses the approved broken-chains crest. The supplied checkerboard backgrounds were converted to real alpha transparency and optimized to `720 x 1080` lossless WebP assets, matching the runtime dimensions of the existing crest set.

All 13 canonical Affiliation choices now resolve to approved crest artwork. The canonical IDs, names, equipment access, benefits, Calls and obligations remain unchanged.

Starborn Collective and Spire of Verita art remains packaged as future-ready artwork only. They are not added as Affiliation choices because they are absent from the current canonical Affiliation dataset. This follows the standing rule not to invent or expose unsupported rules/options.

### Explicitly unchanged

v59.57 does not change:

- canonical creation rules;
- Affiliation data or IDs;
- Ailuran Sub-Strain rules and migration aliases;
- Character ID allocation;
- multi-character Vault behavior;
- active-character semantics;
- historical JSON import normalization;
- Level Up rules or screens;
- Charsheet or Player Tool synchronization;
- Keeper Tool, table ownership, invitations, passwords, rolls or notes;
- Netlify Functions or environment variables;
- Firebase configuration or Firestore data structures;
- Firestore Rules;
- Downloads manifest or bundled PDFs;
- protected 3D dice behavior or assets.

### Validation completed

The release was checked using both static and controlled-browser fixtures:

- HTML parse and DOM count checks;
- CSS parser validation;
- external and inline JavaScript syntax checks;
- canonical `rules-data` loading in a browser fixture;
- desktop renders at 1600 x 1000 for Ancestry, Path/Class/Subclass, Traits, Affiliation, Domain Powers, Equipment and Review;
- mobile renders at 390 x 844 for Ancestry and Affiliation;
- all 13 Affiliation images loaded successfully with intrinsic `720 x 1080` dimensions;
- House Amaranth and Independent alpha assets verified;
- Downloads and all five bundled PDFs compared byte-for-byte with v59.56;
- all 87 protected 3D dice assets compared byte-for-byte with v59.56.

A live Deploy Preview is still required for the complete nine-step flow, authenticated completion, Vault registration, historical import, Charsheet transfer and real-device browser behavior.

## v59.56 inherited release delta

v59.56 is the Affiliation crest integration release on top of v59.55. Its decisions remain valid except where v59.57 explicitly replaces the House Amaranth and Independent fallbacks.

### v59.56 implementation

- Added a dedicated crest header to every Character Creator Affiliation card.
- Converted supplied opaque checkerboard PNGs into transparent optimized WebP runtime assets.
- Mapped approved artwork to Church of the Eternal Veil, Explorers' Guild, Free Fleet, House Joric, House Kurogane, House Solari, House Valerius, House Volkov, Solara Compact, Stellar Commerce Guild and House Kaelen.
- Added responsive sizing, `object-fit: contain`, alternative text, broken-image fallback and local-only assets.
- Preserved canonical Affiliation rules and IDs.
- Included Starborn Collective and Spire of Verita as future-ready assets without exposing unsupported choices.

House Amaranth and Independent no longer use fallback monograms in v59.57; their approved artwork is now mapped.

## Inherited v59.55 full handover

The complete v59.55 handover follows. Where a prior statement conflicts with a v59.56 or v59.57 release delta, the newest delta takes precedence.

## v59.55 release delta

v59.55 is a focused Keeper-note delivery and privacy hotfix built on v59.54. It preserves the user-revised Downloads manifest, bundled PDFs, Character Vault behavior, Player Tool bundle, Keeper visual redesign and protected dice assets.

### Confirmed implementation defect

The note composer supports pasted comma- or tab-separated tables. The browser represented those rows as `string[][]`, while the server attempted to persist that shape directly. Firestore rejects arrays whose direct elements are arrays. This caused `sendHandout` to fail inside `/api/table-api` and surface as a generic HTTP 500.

### Firestore-safe note tables

The server now stores note rows as map records:

```json
{"rows":[{"cells":["Gate","Locked"]}]}
```

API responses convert them back to the existing browser shape, so Player Tool rendering remains `rows: string[][]` and no Player Tool UI rewrite is required.

### Table-scoped note documents

New notes are stored under the current session's `handouts` subcollection instead of rewriting one shared `session.handouts` array. This removes concurrent-send overwrite risk, prevents note history from inflating the live session document and makes deletion address one note document. Legacy array notes remain readable and removable during migration.

### Recipient isolation

Private note privacy is enforced server-side on `readSession`. The table owner may review all notes. A player receives only broadcasts or notes whose target matches their authenticated UID or a character owned by that UID. Client filtering remains as defense-in-depth.

### Keeper send UX and diagnostics

The note Send button is disabled while the request is in flight, preventing repeated submissions. Each request carries a non-secret reference such as `vf-...`; safe errors expose that reference, and Netlify Function logs record it with the action, table and status for diagnosis.

### Acceptance boundary

Static validation covers the storage transform, browser conversion, recipient visibility fixtures, JavaScript syntax, package integrity and preserved asset hashes. A Deploy Preview with the table owner and at least two players remains required to validate Identity, Firebase Admin, private delivery, pasted-table delivery and deletion end to end.

## Inherited v59.54 release delta

The v59.54 release delta below remains fully applicable. Where it conflicts with v59.55, the v59.55 delta takes precedence.

## v59.54 release delta

v59.54 is a focused runtime and migration hotfix built directly from the user-revised `59_53.zip`. That uploaded package is the source of truth for this release, including its manually updated Downloads section, `download/downloads.json`, and the five bundled PDF documents. Those download assets were preserved byte-for-byte.

### Player Tool startup crash

The production bundle failed during `CharacterSheet` render with:

```text
ReferenceError: Cannot access 'character' before initialization
```

The incoming Keeper-handout effect evaluated `character` in its dependency array before the local `const character` declaration had initialized. v59.54 removes that temporal-dead-zone access in both `player-tool.jsx` and `player-tool.bundle.js`. The effect now depends on `handouts`, `activeTab`, and `sessionId`; its callback still resolves the normalized active character after render.

### Multiple Vault characters without replacement

The registry previously used the active Character ID as a fallback when `ensureId()` received a new build without an ID. That made a new Creator build or legacy JSON import overwrite the currently active Vault character.

v59.54 changes the identity rule:

- a valid ID supplied by the build updates that exact record;
- a missing or legacy/non-final ID receives a new allocation;
- the active character is never used as the identity of a different build;
- `reuseCurrentId` exists only as an explicit opt-in for a future caller and is not used by current creation/import flows;
- sync of a pending record passes its own pending ID into allocation, preventing accidental reassignment.

A local fixture proved that an existing `VF-000111` remains in the registry while a new ID-less build is added as `VF-000222`.

### Ailuran completion and Sub-Strain migration

Creator import now preserves Ailuran Sub-Strain from:

- canonical Creator state (`subStrain`);
- Player Tool and legacy records (`subStrain`, `substrain`, `sub_strain`, `ancestrySubStrain`, `ancestryVariant`);
- Charsheet fields, including the actual bridge field `ailuran_variant`;
- legacy values such as `shroud`, `surge`, `still hunters`, and `kinetic predators`.

These values normalize to the canonical IDs `ANC-AILURAN-SHROUD` and `ANC-AILURAN-SURGE`. Registered imports open directly on Creator Step 9 using a migration-review navigation path that does not re-run every earlier forward-step gate. The canonical Ailuran choice itself remains required for newly built characters.

### Creator and Vault import behavior

Account/Vault import continues to route JSON through Creator as the canonical migration surface. Direct Creator import and Vault import now share the corrected ID allocation and Sub-Strain normalization. A legacy JSON without a permanent ID becomes a new Vault character; a JSON carrying an existing `VF-######` updates that record.

### Revised Downloads retained

The following uploaded files and manifest are preserved exactly:

- `download/downloads.json` — release `11.31-RC3.2`;
- `VeilFarers_Corebook_11.31-PDF-Candidate.pdf`;
- `VeilFarers_Keepers_Companion_11.3-PDF-Candidate.pdf`;
- `VeilFarers_Rust_and_Steel_11.3-PDF-Candidate.pdf`;
- `VeilFarers_Alien_Species_11.3-PDF-Candidate.pdf`;
- `veilfarers_charsheet_fillable.pdf`.

No code-generation step rewrote, renamed, recompressed, or replaced those files.

### Validation and acceptance boundary

Static/local validation covers syntax, JSON, clean npm installation, deterministic registry allocation fixtures, Ailuran import fixtures, and byte comparison of the Downloads directory. Live Netlify/Firebase acceptance remains required for cloud ID allocation, multi-character Vault persistence, historical JSON samples, and Downloads links.

## Inherited v59.53 handover

The remainder of this document preserves the full v59.53 product, architecture, security, editorial, UI and deployment state. Where a v59.53 statement conflicts with the release delta above, the v59.54 delta takes precedence.

## 1. Current project decision

VeilFarers remains the active product, interface and codebase name. `Sileris` and `Sileris Chronicles` remain possible future alternatives under legal review only. No visible brand, route, package, Firestore path, local-storage key, asset or internal identifier has been renamed in v59.53.

## 2. Release objective

v59.53 is a production-runtime, import, table-connectivity and global-controls release on top of v59.52. It responds to Deploy Preview feedback without reopening the protected v59.25 dice result/renderer behavior or changing the VeilFarers brand.

The release objectives are:

1. allow a Keeper who has already authenticated and joined a table to read the current session without depending on browser Firestore Rules that may still be on the production baseline;
2. make imported historical JSON files pass through the canonical Creator normalizer, obtain a permanent `VF-######` when authenticated, become completed Vault records and open at the final Creator step;
3. expose JSON import directly from Character Vault while retaining Creator and Level Up import compatibility;
4. make every catalogue filter a true multi-select control with OR semantics inside one filter group and AND semantics between groups;
5. make Shake to Roll open the Duality roller and execute the existing Hope/Fear roll, including the selected 3D presentation mode;
6. make Spectrum of Fate enabled by default and treat it as one Player Tool setting shared by all characters/tabs on the current browser/device;
7. reorganize Player Tool Options into clear Appearance, Rules, Dice, Audio and Spotlight sections;
8. remove Tailwind CDN and in-browser Babel from production, precompile the Player Tool bundle and CSS, and vendor React/ReactDOM locally;
9. prevent repeated Player Tool Firebase initialization and duplicate authentication/connection logs;
10. retain all v59.52 behavior: many Vault characters with one active, exact note recipients, Keeper-only/current-table-public rolls and the Player-style Keeper UI.

All earlier architecture remains in force: permanent `VF-######` identity, build/runtime separation, authenticated Netlify/Firebase identity bridge, owner/member tables, equipment Mods, drone synchronization, guided RC3.2 Level Up, Power Vault, 3D initialization fallback, navigation-owned Character ID, invitation administration and legacy password migration.

## 3. v59.53 implementation details

### Keeper connection through authenticated server reads

The Keeper no longer requires a direct browser `onSnapshot()` merely to connect to and read a session. After `VFTableAccess.authorize()` confirms owner/member access, Keeper Tool stores the selected table ID and calls:

```text
/api/table-api  action: readSession
```

The server verifies the Netlify Identity bearer token and current table membership, then returns a safe live-session projection containing characters, Fear, Spotlight, Keeper notes, session name, current-table handouts and public current-table roll history. Keeper Tool refreshes that state on a controlled 1250 ms poll with a single-flight guard. Writes continue through whitelisted authenticated actions such as `patchSession`, `broadcastRoll` and `sendHandout`.

This specifically avoids the Deploy Preview failure in which a valid Keeper account saw `permission-denied` because the preview client and production Firebase project shared a Rules version that did not yet authorize the new browser listener. It does not weaken table authorization: the server still rejects callers who are neither owner nor member.

### Canonical historical JSON import and Vault entry

Account/Character Vault now includes a custom **Import Character** action. A selected JSON file is stored briefly under:

```text
veilfarers.character.pendingImport.v1
```

and routed to Creator. Creator consumes the payload, runs the existing canonical compatibility normalizer, registers the result, awaits the registry/cloud synchronization result and opens the final review/completion step. When the user is authenticated and Firebase Admin is available, an old file without a permanent ID is allocated a `VF-######`, marked completed and added to the account-owned Vault. Offline/deferred imports retain a `PENDING-*` identity until a later authenticated sync.

The same registration helper remains available to Level Up and direct Creator imports. Re-importing a character that already has a permanent ID updates the matching record instead of creating an unrelated copy.

### Creator import destination

A successful registered import now opens step 9, the final Creator review/finish surface, rather than restarting at ancestry. This allows the user to inspect the normalized character, correct any missing historical fields and continue to Charsheet without repeating the creation wizard.

### Multi-select catalogue filters

`catalog-page.js` stores pack/source, Tier, category, property, ownership and cost filters as arrays. Users may keep several values selected at once. Matching rules are:

- selected values inside one group are OR alternatives;
- separate groups remain AND constraints;
- an empty group means no restriction;
- filter menus remain open while selections are changed;
- the control label shows the single selected value or a selected-count summary.

This applies consistently to weapons, armor, equipment, augments and the shared inventory catalogue.

### Shake executes Duality

The motion listener remains opt-in and retains permission, two-peak detection, visibility, in-flight and cooldown guards. Once a valid shake is detected it now:

1. opens and restores the Player Roller;
2. switches the roller to Duality;
3. invokes the same `rollDuality()` entry point used by the normal Hope/Fear button;
4. uses the currently selected 2D or 3D display mode;
5. preserves the existing Hope/Fear result, resource, damage and broadcast logic.

No separate random result path was added.

### Spectrum of Fate and structured Options

Spectrum of Fate is enabled when no prior preference exists. Its key is:

```text
veilfarers.spectrumOfFate.global.v1
```

The setting applies across Player Tool characters and synchronizes between open tabs through the browser storage event. It is not tied to one character record. Options are grouped as:

- Appearance;
- Rules - including Spectrum of Fate;
- Dice - 2D/3D, style, textures, tracking and Shake to Roll;
- Audio;
- Spotlight.

### Production Player Tool build

Production no longer loads `cdn.tailwindcss.com` or `@babel/standalone` and no longer uses a `text/babel` script. The release contains:

```text
assets/player-tool-tailwind.css
player-tool.bundle.js
assets/vendor/react.production.min.js
assets/vendor/react-dom.production.min.js
```

Tailwind and Babel are build-time tools only. React and ReactDOM 18.3.1 are served locally. The CSP no longer needs `unsafe-eval`, the Tailwind CDN or unpkg for Player Tool. This removes the production console warnings and source-map connection errors caused by the browser transformer/CDN path.

### Single-flight Player Firebase initialization

`window.initFirebase` now returns one shared initialization promise. Concurrent components/callbacks await the same authentication and configuration work instead of starting duplicate Firebase setup sequences. The promise resets only after a genuine failure so a later retry remains possible.

### v59.52 systems retained

v59.53 retains the account-owned multi-character Vault with one active selection, exact one-player/all-current-table Keeper notes, Keeper Only/Broadcast roll modes, table-scoped communication, Player-style Keeper UI, invitations, historical password migration, Proficiency-scaled weapon damage, Player deduplication/runtime preservation, closable/resettable Log and the protected dice renderer/assets.

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

`allocate-character-id.mts` requires an authenticated Netlify user and reserves the character with forced `ownerId` and `ownerEmail`.

### Vault behavior

`character-registry.js` is the local/cloud Vault adapter. Account-owned CRUD goes through `/api/character-vault`, which verifies the Identity bearer token and uses Firebase Admin server-side.

The adapter:

- retains multiple completed characters for one account;
- exposes exactly one active Character ID, or none when no active records exist;
- synchronizes the active ID through the server-only profile document;
- lists/gets/upserts only records belonging to the verified user;
- distinguishes incomplete reservations from completed characters;
- supports active/non-trashed records and Trash/restore;
- retains deferred/offline sync and JSON portability;
- exposes one summary model to Account, Level Up and Player Tool;
- emits active-selection and registry-update events without reloading application pages;
- deduplicates permanent IDs and migrates matching `PENDING-*` records when a permanent ID is allocated;
- preserves Player runtime when a build record is updated.

### Account page and import

Account provides:

- all completed characters plus a separate Trash view;
- exactly one `ACTIVE` badge;
- `Set Active` for every other character;
- cloud refresh and current-record synchronization;
- open Charsheet, Player Tool or Level Up after selecting that record;
- export;
- custom two-step Trash and restore flow;
- **Import Character** for historical or current VeilFarers JSON.

Account import routes through Creator's compatibility normalizer. A successful authenticated import receives/retains its permanent ID, becomes a completed Vault record and opens the final Creator step. Creating or importing another character never deletes unrelated Vault characters.

## 7. Creator completion and import

When Character Creator finishes:

1. allocate or confirm the permanent Character ID;
2. save the complete Creator state;
3. generate the Charsheet payload;
4. mark the Vault record completed;
5. await local registration and attempt cloud synchronization;
6. report saved, cloud-pending or deferred state;
7. open Charsheet.

Incomplete drafts remain local and do not clutter the normal account Vault.

For JSON import, Creator accepts historical layouts through the shared normalizer, registers the imported state and opens the final review step. Missing historical fields remain editable before completion. When import originated from Account/Vault, the transient local payload is deleted after consumption so a refresh does not import it again.

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
- Listens only while the page is visible and no roll is already resolving.
- Requires a two-peak movement pattern and applies a cooldown.
- Opens/restores the Player Roller and selects Duality.
- Invokes the existing `rollDuality()` Hope/Fear action after the UI opens.
- Uses the selected 2D or 3D display mode and the same result/resource/broadcast path as the button.
- The normal roll button always remains available.
- `Permissions-Policy` permits accelerometer/gyroscope only for same-origin content.

Real-device tuning remains mandatory, particularly iOS permission flow, Android sensitivity and 3D initialization on a first mobile roll.

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
- `keeper-player.css` aligns the interface with Player Tool while retaining Keeper campaign modules.
- A fixed/right responsive Keeper Console groups table connection, Spotlight, drones, private/public rolls and targeted notes.
- Notes are owner-only and table/recipient scoped by the server.
- Keeper rolls can be local-private or current-table public.
- Table listing and authorization use authenticated server APIs.
- Connected session reads use `readSession` polling rather than a direct browser Firestore listener.
- The polling path is single-flight and stops/restarts when the Keeper changes tables.

This fixes preview `permission-denied` connection failures while retaining owner/member authorization. Visual convergence does not merge permissions: account authentication, table membership and table ownership remain separate boundaries.

## 15. Table architecture and v59.53 communication API

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

- `readSession`: owner/member-only safe projection used by Keeper Tool;
- `patchSession`: whitelisted live state;
- `broadcastRoll`: public roll normalized server-side with current `tableId`, `senderUid` and `visibility: public`;
- `clearRollHistory`: authenticated table roll reset;
- `sendHandout`: owner-only targeted note with current-table recipient validation;
- `deleteHandout`: owner-only deletion in the current table;
- legacy-compatible `setHandouts`: owner-only, normalized to the current table;
- invitation/member/password owner administration retained.

`readSession` returns only live fields required by Keeper Tool and filters handouts/rolls to the requested table; roll history returns public or legacy-public entries only. It is not a general Firestore proxy.

Non-drone session characters may carry `memberUid` to identify the authenticated Player account. Historical records may use Character ID compatibility targeting. Hidden Keeper rolls never call `/api/table-api`; they remain local to the Keeper browser.

Player Tool still uses real-time Firebase table listeners where immediate player broadcasts are required. Those browser paths remain subject to active Firestore membership Rules.

## 16. Equipment, drones and compact rules retained from v59.47

- Charsheet → Player Tool drone module `info`/`status` updates the same stable drone record.
- Corebook weapon/armor Mods and Tier Hardpoints remain available in Charsheet and Player Tool.
- Printable inventory lists `[Equipment] Mod — Effect` and overflows to General Notes.
- Charsheet uses labeled schematic summaries; Player Tool uses maximum practical compression.
- Costs, triggers, frequency, ranges, duration, dice, DC, Advantage/Disadvantage and restrictions remain visible.

## 17. Navigation and Player Options

Shared navigation includes Level Up and is present in Keeper Tool. The active Character ID is displayed in the navigation rather than repeated in roll callouts.

Player Tool Options are divided into Appearance, Rules, Dice, Audio and Spotlight sections. Spectrum of Fate is a Rules setting enabled by default; Shake to Roll is a Dice setting. Native browser-looking controls should continue to be replaced with VeilFarers custom components where practical and accessible.

## 18. Dependencies and production assets

Runtime/build dependencies pinned by `package-lock.json`:

```text
@netlify/identity 1.2.x
@netlify/functions 5.3.x
```

Browser assets bundled locally:

```text
React 18.3.1
ReactDOM 18.3.1
assets/player-tool-tailwind.css
player-tool.bundle.js
```

Tailwind CSS and Babel are release-build tools only and are not loaded at runtime. Every npm `resolved` URL uses `https://registry.npmjs.org/`; `.npmrc` pins the same public registry. `node_modules` and temporary build tooling are excluded from the deploy artifact. Third-party notices are retained in `THIRD_PARTY_NOTICES.md`.

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

`firestore_v59.53.rules` retains the authenticated ownership/membership baseline; this release does not require a new project-wide Rules deployment merely to test Keeper session reads because Keeper now uses the authenticated server API.

Character Vault CRUD also runs through an authenticated server function. Player Tool real-time table listeners and any remaining browser Firestore paths still depend on Firebase custom authentication and active membership Rules.

Rules are project-wide. A branch deploy sharing production Firebase cannot safely test a different Rules version independently. Before the coordinated cutover:

- Character Vault and Keeper `readSession` may be tested through server APIs;
- use disposable table names for preview acceptance;
- do not claim/modify a real production legacy table without a backup;
- do not describe all browser table access as fully security-accepted until denial tests pass under the deployed Rules.

## 21. Validation completed

- package and lockfile versions are `59.53.0` and all dependency URLs use `registry.npmjs.org`;
- portal JSON parses and changelog current version is v59.53;
- first-party standalone JavaScript and generated `player-tool.bundle.js` pass `node --check`;
- every non-data inline HTML script parses;
- all Netlify Function `.mts` files compile under TypeScript with Node types and the project's non-strict compatibility settings;
- Player Tool production HTML references local React/ReactDOM, compiled CSS and compiled JavaScript;
- no production reference remains to Tailwind CDN, Babel standalone, `text/babel`, the internal package gateway or unpkg Player runtime;
- static assertions confirm Keeper `readSession`, removal of Keeper `onSnapshot`, Vault import, awaited Creator registration, final-step import, Spectrum default, direct Shake Duality and multi-select filters;
- protected `assets/3d-dice` contains 87 files identical to v59.52 byte-for-byte;
- npm installation from the public registry completed with zero reported vulnerabilities at build time;
- ZIP structure, dependency exclusion, credential scan and internal-registry scan pass;
- the full DOCX handover was rendered and every page visually inspected before release.

Full details are in `VALIDATION_v59.53.txt`. Static/build checks do not replace live Netlify/Firebase acceptance or real-device motion QA.

## 22. Manual QA still required

- deploy to a branch/Deploy Preview, hard-refresh and sign out/in before testing;
- connect as the owner to an open table, a protected table and a joined-member table; verify Keeper loads live state and no `permission-denied` loop occurs;
- verify Keeper state polling stops/restarts cleanly when switching tables and does not create duplicate requests/listeners;
- import representative old JSON files from Account/Vault, Creator and Level Up; confirm normalization, final Creator step, permanent ID allocation and Vault insertion;
- import the same permanent-ID JSON twice and confirm one record is updated rather than duplicated;
- test import while offline/signed out and confirm a `PENDING-*` record can later synchronize;
- select multiple values in every catalogue filter group and verify OR-within/AND-between behavior on weapons, armor, equipment and augments;
- on real iOS and Android devices, enable Shake to Roll, shake from a closed/minimized roller and confirm one Hope/Fear roll occurs in both 2D and 3D modes;
- confirm Spectrum of Fate starts on for a fresh browser profile and one toggle affects all Player Tool tabs/characters on that device;
- inspect Player Tool console: no Tailwind CDN warning, no in-browser Babel warning, no unpkg Babel source-map CSP message and no duplicate Firebase initialization sequence;
- regress v59.52 active-character, note-recipient, roll-visibility and Keeper UI scenarios;
- regress invitations, historical passwords, Proficiency, Player runtime preservation, Log controls, Level Up, Mods, drones and Charsheet print/PDF.

No live acceptance claim is made until these checks pass in a real Deploy Preview.

## 23. Known limitations

- the active Character ID is selection metadata, not a second character copy; an offline device can briefly show its last local selection before a successful Vault refresh;
- an unauthenticated/offline old JSON import cannot obtain a final server ID immediately and remains `PENDING-*` until sync;
- historical table characters without `memberUid` use Character ID compatibility targeting until next authenticated save;
- private Keeper rolls are intentionally device-local and do not synchronize to another Keeper browser;
- Keeper `readSession` uses 1250 ms polling rather than a push channel; this is deliberate to avoid preview Rule coupling and should be revisited only with a coordinated real-time server design;
- only the latest raw invitation passkey retained on an owner device can be displayed; older raw tokens are irrecoverable because the server stores hashes only;
- Vault permanent deletion/recovery policy and ownership transfer are not implemented;
- invitation email is not sent automatically;
- App Check and dedicated rate limiting remain pending;
- Shake support depends on browser/hardware permission and physical-device sensitivity;
- Spectrum global scope is the current browser/device, not a table-wide server policy;
- remaining `unsafe-inline` CSP allowances are technical debt for legacy inline scripts, although Player Tool no longer requires runtime Babel/Tailwind or `unsafe-eval`.

## 24. Production procedure

1. Preserve the v59.52 ZIP and currently deployed Firestore Rules.
2. Deploy the complete v59.53 artifact to a test branch/Deploy Preview.
3. Hard-refresh and sign out/in on Keeper and Player accounts.
4. Confirm the Netlify build installs from `registry.npmjs.org` and functions bundle successfully.
5. Run open/protected/member Keeper connection tests using disposable tables.
6. Run old JSON imports from Account/Vault, Creator and Level Up and verify permanent IDs/Vault records.
7. Test multi-select catalogue filters on all catalogue tabs.
8. Run Shake to Roll on real mobile hardware in 2D and 3D.
9. Confirm Spectrum default/global-device behavior and structured Options.
10. Inspect browser console and network for duplicate Firebase initialization or removed runtime CDN warnings.
11. Regress all v59.52 communication and active-character acceptance scenarios.
12. Complete `VALIDATION_v59.53.txt` and publish only after preview sign-off.
13. Deploy project-wide membership Rules only as part of the coordinated security cutover and run denial tests immediately.

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

Continue VeilFarers Portal from v59.53. Treat `PORTAL_HANDOVER_v59.53.md` as the complete source of project state. Keep VeilFarers branding. The immediate task is live Deploy Preview acceptance of Keeper server-read table connection, canonical historical JSON import into the Vault, multi-select equipment filters, real Shake-to-Duality behavior, Spectrum default/global-device settings and the precompiled Player Tool production runtime. Preserve all v59.52 systems: many Vault characters with one active, exact one-player/all-current-table Keeper notes, Keeper-only/current-table-public rolls and the Player-style Keeper UI. Preserve invitations, historical password migration, authenticated state writes, Proficiency-scaled damage, Player deduplication/runtime preservation, closable/resettable Log, permanent `VF-######` identity, guided RC3.2 Level Up, Mods, drones, compact rules and the protected v59.25 dice renderer. Do not reintroduce direct Keeper browser session reads, page reload loops, runtime Tailwind/Babel, global cross-table handouts, hidden-roll Firestore writes, single-select catalogue filters, duplicate Firebase initialization, recoverable raw invitation storage or internal package-registry URLs. Do not deploy project-wide Firestore Rules independently of the coordinated security cutover.

## v59.55 continuation prompt

Continue VeilFarers Portal from v59.55 using this handover as the complete project state. Preserve the user-revised Downloads manifest and bundled PDFs byte-for-byte. The immediate acceptance task is to verify Keeper notes end to end: broadcast, one-player private delivery, pasted-table content, deletion, reconnect persistence and cross-table isolation. Use the visible request reference to correlate any failure with the Netlify `table-api` Function log. Preserve v59.54 Player Tool startup, multi-character Vault, Creator import, Ailuran migration, Level Up, equipment, mods, drones, compact rules, Identity, Keeper UI and protected dice behavior.

## 27. v59.57 continuation prompt — authoritative

Continue VeilFarers Portal from v59.57. Treat `PORTAL_HANDOVER_v59.57.md` as the complete source of project state; the earlier v59.53 and v59.55 continuation prompts are retained only as historical records. Preserve VeilFarers branding and the v59.57 Character Creator visual system: dark navy and gold application shell, desktop Creation Progress rail, synchronized horizontal step rail, responsive guided footer, redesigned cards/fields/overlays and all 13 canonical Affiliation crests, including House Amaranth and the Independent broken-chains crest. Do not replace the existing creation engine, DOM IDs, validation gates, import normalization, Character Registry allocation or Vault synchronization with a parallel workflow. Keep Starborn Collective and Spire of Verita as packaged artwork only unless a future approved canon dataset adds them as selectable affiliations. Preserve the user-revised Downloads manifest and bundled PDFs byte-for-byte, the protected 3D dice renderer/assets, multi-character Vault with one active character, canonical historical JSON import, guided RC3.2 Level Up, Charsheet/Player Tool synchronization, equipment/mod/drone systems, compact mechanical text, Keeper ownership/invitation/password/note/roll boundaries and authenticated server APIs. The immediate acceptance task is a real Deploy Preview pass through all nine Creator steps on desktop and mobile, including Ailuran and every dependent Class/Subclass choice, import to Review, authenticated completion, permanent `VF-######` allocation, Vault insertion, Charsheet transfer and reload persistence. Do not deploy project-wide Firestore Rules independently of the coordinated security cutover.
