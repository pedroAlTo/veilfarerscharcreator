# VeilFarers Portal v59.48 — Deploy / PR Summary

## Objective

Turn the system Character ID introduced in v59.46 into one account-owned Character Vault and complete the end-to-end advancement workflow without changing the protected v59.25 dice result logic or renderer assets.

## Scope

### Account Character Vault

- Firebase-backed Vault keyed by the permanent `VF-######` Character ID.
- Vault queries are restricted to the logged-in Netlify/Firebase UID.
- Only completed active characters appear in normal selectors; incomplete reservations and other users’ local records are hidden.
- Creator automatically saves a completed character to Vault before opening Charsheet.
- Account page supports refresh, open in Charsheet/Player Tool/Level Up, export, Trash and restore.
- Offline allocation/sync continues to use `PENDING-*` and deferred synchronization.

### Shared character selection

- Account, Level Up and Player Tool consume the same Vault records.
- Opening an existing `characterId` updates the same Player Tool entry instead of creating a duplicate.
- Player Tool offers `From Character Vault`, manual creation and Drone creation.
- A current saved character can jump directly to Level Up.

### Guided Corebook RC3.2 Level Up

- Rebuilt as a Creator-style sequence: select character, review automatic growth, choose advancements, configure selections, review before/after, apply.
- Shows all eleven Chapter 12 options with slot costs and explicit lock reasons.
- Configures Tier Achievements at Levels 2, 5 and 8.
- Enforces Trait once per Tier, Proficiency cap, Multiclass once from Tier 2, sequential Subclass Specialization/Mastery and Sleeping-only Tempered Resolve.
- Awakened Power options are filtered by accessible Domain, effective Domain level and ownership.
- Sleeping Resolve Moves are selected from the exact canonical class/subclass catalogue.
- Multiclass is guided through second Class, valid new Domain, Class Feature and Background Question.
- Writes `advancementHistory`, regenerates Charsheet and synchronizes the same Vault/Player record.
- Level Up modifies character build while preserving current Player runtime HP, Stress, Hope/Effort, Resolve, Armor, Conditions and table notes.

**Canon source:** `VeilFarers_Corebook_11.1-RC3.2-PDF-Candidate.pdf`, Chapter 12: *The Long Climb*, PDF pages 125–128; canonical RC3.2 class, subclass, Power and Resolve Move JSON collections.

### Charsheet and Player representation

- Charsheet `features` now includes every acquired Subclass rank and Multiclass Class Feature, not Foundation only.
- Learned Resolve Moves, Resolve die, Subclass rank, Multiclass details, Vault Powers and advancement history survive bridge/import.
- Player Tool displays the raised level from the same record.
- New Awakened Powers remain in `Power Vault` until recalled; returning an active card places it back in Vault.

### Mobile Shake to Roll

- Optional and disabled by default.
- Handles iOS motion permission when required.
- Requires the roller to be open, visible and idle.
- Two-peak motion detection and cooldown reduce accidental/double rolls.
- Calls the existing roll actions; result generation and protected renderer behavior are unchanged.

### 3D dice initialization

- Idle preloading begins after Player Tool opens.
- A milestone-based modal appears when a roll waits for the renderer.
- The queued roll continues automatically when ready.
- Failure offers Retry or Use 2D; the mathematical result is not dependent on 3D rendering.

### Player Tool error visibility

- Connection errors render through a body portal with `z-index: 2147483647` and assertive live-region semantics.
- Errors stay above the shared navigation, modals, character controls and 3D dice layer.

### Keeper Tool authentication and navigation

- Restored the shared portal navigation above Keeper Tool.
- Keeper Tool is unavailable while signed out.
- Every general authenticated user receives the `member` role through typed `userSignup` and `userLogin` Identity event handlers.
- Netlify edge redirects permit `member`, `keeper` and `admin`; Admin remains `admin` only.
- Keeper identity is the same user identity used for table ownership, invitations and membership.

### Branding

- VeilFarers remains the active project name.
- No Sileris or Sileris Chronicles renaming is included.

## Files changed

- `character-registry.js`, `account.js`, `login.html`
- `level-up.js`, `creator.html`, `sheet-bridge.js`, `veilfarers-import.js`
- `character-sync-adapter.js`, `player-tool.html`
- `keeper-tool.html`, `portal.js`, `portal.css`, `netlify.toml`
- `canonical-runtime.js`, `data/changelog.json`
- `netlify/functions/identity.mts`
- `package.json`, `package-lock.json`

## Dependencies

- `@netlify/identity` resolved to 1.2.0.
- `@netlify/functions` resolved to 5.3.0 for typed Identity event handlers.
- No `node_modules` directory is shipped in the ZIP; Netlify installs from the lockfile.

## Environment

No new variable names. Retain all Firebase variables from v59.47 and `FIREBASE_PUBLIC_TABLE_DIRECTORY=false`.

## Deployment notes

1. Deploy v59.48 to the existing test branch.
2. Inspect Function bundling for `identity`, `firebase-auth-token`, `allocate-character-id` and table functions.
3. Existing users should log out and sign back in once so the `member` role is included in the persisted user/JWT.
4. Complete the validation matrix in `VALIDATION_v59.48.txt`.
5. Coordinate production code and authenticated Firestore Rules deployment as one cutover when those Rules are not already active.

## Security boundary

- Vault ownership and table membership depend on Firebase custom-token UID parity with Netlify Identity.
- Browser gates are UX; Netlify role redirects and Firestore Rules are the authorization controls.
- Rules are project-wide and cannot be safely previewed independently when branch and production share one Firebase project.
- App Check and dedicated abuse/rate limiting remain launch-hardening work.

## Validation

Automated syntax, JSON, JSX, TypeScript parse, Vault ownership, stable-ID, Level Up, exact RC3.2 subclass, sheet bridge/import, runtime-preservation, drone, mods and dice-asset-integrity tests passed. Real Netlify, Firebase, mobile sensors and visual QA remain mandatory before production.

## Rollback

Preserve the v59.47 ZIP and current Firestore Rules. After authenticated Rules are active, code-only rollback to an anonymous client is not a neutral rollback and may fail authorization.
