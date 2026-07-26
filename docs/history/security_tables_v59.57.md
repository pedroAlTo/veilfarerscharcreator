# VeilFarers Portal v59.57 — Security and Data Boundary

v59.57 is a Character Creator presentation release. It does not change authentication, authorization, Firebase data shapes, Netlify Functions, table membership, invitation handling, Keeper notes, Character Vault ownership, or Firestore Rules.

## Security-relevant implementation facts

- The new Creator assets are static local CSS, JavaScript, and WebP files.
- No new external runtime dependency, CDN, iframe, analytics endpoint, or third-party script was introduced.
- `creator-redesign.js` only synchronizes visual route and step state. It does not read or write credentials, tokens, Firebase records, or table data.
- The Affiliation crest mapping is a static ID-to-file map. It does not alter canonical Affiliation IDs or values persisted in character records.
- House Amaranth remains canonical ID `house-amaranth`.
- Independent remains canonical ID `independent`.
- Future-ready Starborn Collective and Spire of Verita artwork remains unexposed because those options are absent from the current canonical Affiliation dataset.

## Firestore Rules

`firestore_v59.57.rules` is copied from the v59.56 baseline without functional change. Do not deploy it merely to test the visual redesign.

## Required live regression checks

- Logged-in and logged-out Creator access behaves as before.
- Completing a character uses the existing authenticated Character Registry/Vault path.
- Importing a character does not overwrite a different active Vault character.
- Creator styling does not hide authentication or cloud-sync errors.
- Level Up, Player Tool, and Keeper Tool retain their existing authorization boundaries.
