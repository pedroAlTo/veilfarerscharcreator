# VeilFarers Portal v59.58 — Security and Data Boundary

v59.58 is a Character Creator interaction and CSS-animation release. It does not change authentication, authorization, Firebase data shapes, Netlify Functions, Character Vault ownership, table membership, Keeper notes or Firestore Rules.

## Security-relevant implementation facts

- The locked Class catalogue is enforced in the existing browser rendering and event path: no selectable Class target is produced before a Path exists.
- The pre-existing state and readiness validation remains authoritative; visual locking is not treated as a replacement for validation.
- The defensive no-Path guard remains in place and silently rejects impossible Class selection attempts.
- The gold border, glow and particle feedback is CSS-only and does not add executable third-party code.
- No canvas, WebGL scene, worker, analytics endpoint, iframe, CDN or external dependency was introduced.
- The animation reads no credentials, tokens, identity data or character payload fields.
- Reduced-motion handling is implemented locally through the standard media query.

## Firestore Rules

`firestore_v59.58.rules` is copied byte-for-byte from the v59.57 baseline. Do not deploy it merely to test this Creator release.

## Required live regression checks

- Logged-in and logged-out Creator behavior remains unchanged.
- A locked Class catalogue cannot create persisted Class state before a Path is selected.
- Historical imports still normalize and reach Review without being blocked by the visual gate.
- Completing a character uses the existing authenticated Character Registry and Vault path.
- Creator styling does not hide authentication, cloud-sync or runtime errors.
- Level Up, Player Tool and Keeper Tool retain their established authorization boundaries.
