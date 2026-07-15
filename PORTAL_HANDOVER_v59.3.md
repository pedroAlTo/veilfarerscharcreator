# VeilFarers Portal — v59.3 handover

## Canonical baseline

- Character Creator and integrated Card Library: root `index.html` plus `/data` from the RC2 `creator` folder.
- Shared normalized rules data: `/rules-data`, release `11.1-RC2-draft6`.
- Shared browser adapter: `shared-data.js` and `canonical-runtime.js`.
- Current PDFs: the four `11.1 RC2 PDF Candidate` files under `/download`.

## Implemented in v59.3

1. Player Tool no longer loads `veilfarers-data.js` or its Corebook 10.x embedded rules.
2. Domain cards are generated from `/rules-data/core/powers.json` after the canonical runtime resolves.
3. Player Tool imports the current `veilfarers-character` Creator draft directly and persists its own local roster under `veilfarers-player-tool-characters`.
4. Creator selections are mapped to canonical IDs for weapons, armor and powers when imported into Player Tool.
5. Keeper Tool equipment reference now uses the canonical 211 weapons, 42 armor entries, 80 augmentations and 56 feature definitions.
6. The old embedded `EQUIPMENT_DATA` catalogue was removed from `app.js`.
7. Keeper access now uses Netlify Identity roles: `keeper` or `admin`. The former hardcoded browser password was removed.
8. `veilfarers-data.js` was removed because no deployed page references it.

## Service boundaries

- Netlify hosts the static portal and Functions.
- Netlify Identity handles accounts, roles, account-backed character vault metadata and the Keeper UI gate.
- Firebase Anonymous Authentication and Firestore remain dedicated to live table sessions.
- Firebase configuration is requested from `/api/firebase-config`; environment values are not written into static files.

## Validation completed

- JavaScript syntax check passed for `shared-data.js`, `canonical-runtime.js`, `veilfarers-import.js` and `app.js`.
- Canonical runtime test loaded release `11.1-RC2-draft6` with 147 powers, 211 weapons, 42 armor entries, 116 gear entries, 80 augmentations and 56 feature definitions.
- Creator-state import test resolved canonical Human, Engineer, Assault Rifle, Environmental Suit and two selected powers.
- Static HTML dependency audit found no missing local scripts, styles, images or linked pages.
- Search found no remaining deployed references to `veilfarers-data.js`, Corebook 10.9, Creator v2.79 or the old `EQUIPMENT_DATA`.

## Required deployment configuration

- Keep `FIREBASE_API_KEY` in Netlify environment variables.
- Enable Netlify Identity.
- Assign `admin` to administrator accounts.
- Assign `keeper` or `admin` to Keeper Tool accounts.
- Keep Firebase Anonymous Authentication enabled for live sessions.

## Remaining work

1. Define the canonical level-up matrix before enabling automatic advancement.
2. Replace Keeper Tool example campaign statistics and bestiary content only after comparing them against the Keeper's Companion RC2 source.
3. Decide whether the account vault should remain in Identity user metadata or move to a dedicated server-side store.
4. Add server-side JWT validation before any privileged write operation; the current role gates protect UI access but are not a substitute for server authorization.
5. Run deployed-Netlify acceptance tests for Identity callbacks, Forms, Firebase session synchronization and responsive behavior.
6. Consolidate the Player Tool character model and the Creator state into one versioned canonical character schema.
