# VeilFarers Portal v59.52 — Deploy / PR Summary

## Objective

Make Character Vault a true multi-character account collection with one shared active character, restrict Keeper communications to the current table and selected recipient, and visually converge Keeper Tool with Player Tool.

## Scope

### Character Vault: many characters, one active

- Added server-only `characterVaultProfiles/{netlifyUid}` selection metadata.
- `/api/character-vault` now returns `activeCharacterId` and supports authenticated `setActive`.
- The server accepts only a non-trashed character owned by the caller.
- Account lists every completed character and marks exactly one `ACTIVE`.
- `Set Active`, Charsheet, Player Tool and Level Up update the shared selection before opening.
- Player Tool tab changes for permanent characters also update the shared active ID.
- Trashing the active character selects one remaining Vault record; an empty Vault has no active ID.

### Keeper notes: one player or all players in this table

- Replaced ambiguous target handling with two explicit modes:
  - all players in the connected table;
  - exactly one selected connected player.
- Player Tool stamps non-drone session characters with the signed-in Netlify member UID.
- Keeper deduplicates multiple character tabs belonging to the same user.
- Historical records retain Character ID targeting as a compatibility fallback.
- `/api/table-api` owner-only `sendHandout` forces the current `tableId` and validates the target against non-drone players in that session.
- Player Tool filters notes by current table and by signed-in member/active-character identity.
- Owner-only deletion affects only the current table note collection.

### Keeper roll visibility

- Added `Keeper Only` and `Broadcast` controls to Keeper Console.
- Keeper-only rolls remain local to that browser and never enter Firestore.
- Broadcast rolls are normalized server-side as `visibility: public` and stored only in the connected table.
- Keeper history identifies private/public entries.
- Player Tool ignores hidden roll records and table-mismatched handouts.

### Keeper Tool UI convergence

- Added `keeper-player.css` using Player Tool's dark navy, cyan state and amber action hierarchy.
- Reworked campaign selector, header, tabs, panels, buttons and live controls.
- Added a persistent responsive Keeper Console for table access, Spotlight, drone signal, roll privacy and targeted communication.
- Note modal sits above navigation and the fixed console.
- Native radio/checkbox semantics remain accessible inside the custom interface.

## Security / data boundaries

- Character ownership remains verified through Netlify Identity and Firebase Admin.
- Active selection metadata is server-only and cannot select another account's or trashed character.
- Keeper notes are owner-only and target-validated inside the current session.
- Client-provided note `tableId`/sender fields are ignored and replaced server-side.
- Hidden Keeper rolls have no server write path.
- No service-account data or raw invitation token is included in static assets.

## Canon impact

No game rule, class, Power, equipment or advancement text changed. The protected v59.25 dice calculation and `assets/3d-dice` tree remain unchanged.

## Dependencies

No dependency names changed. `package.json` and `package-lock.json` are version `59.52.0` and resolve only through `registry.npmjs.org`.

## Automated/static validation

- JSON, standalone JavaScript, inline scripts, Player JSX and Netlify Function TypeScript parsing passed.
- Targeted note fixtures passed for all/current-player/unknown-target rejection.
- Vault fixture retained two records with exactly one active selection.
- Static checks confirmed member UID stamping, table/recipient filtering and local-only hidden roll path.
- Keeper UI static render was inspected.
- Protected 3D dice hashes match v59.51.
- ZIP extraction, dependency exclusion and secret/internal-registry scans passed.

## Manual Deploy Preview QA required

- Three Vault characters and active-selection sync across two browser sessions.
- Two Player accounts in Table A and one in Table B.
- One-player and all-Table-A notes with zero delivery to Table B.
- Keeper-only rolls absent from Player/history; broadcast rolls present only in the current table.
- Keeper UI desktop/mobile and keyboard/modal layering.
- Full regression of v59.51 invitation, password, import, dedupe, Proficiency, Log and catalogue fixes.

## Deployment boundary

`firestore_v59.52.rules` is included for the coordinated table-security cutover. Firestore Rules are project-wide; do not deploy a different ruleset merely to test this branch against the production Firebase project.
