# VeilFarers Portal v59.55 — Keeper Note Delivery and Privacy Hotfix

## Scope

Focused hotfix built from v59.54. The revised Downloads manifest and all five bundled PDF files remain byte-for-byte unchanged.

## Changes

- Fixed `/api/table-api` 500 failures when Keeper notes include pasted tables.
- Converted note table rows from nested arrays into Firestore-safe row maps before persistence; browser responses convert them back to the existing Player Tool table shape.
- Moved Keeper handouts from the shared session document into the table's `handouts` subcollection, avoiding whole-array rewrite races and session-document growth.
- Preserved read compatibility with legacy `session.handouts` records while new notes use subcollection documents.
- Filtered private notes server-side: table owners can review all sent notes, while players receive only broadcasts or notes addressed to their authenticated UID/owned character.
- Added request references to table API errors and structured Function logs for diagnosis without exposing secrets.
- Prevented repeated note submissions while a send is already in progress; the Send button shows `Sending…` and remains disabled until completion.
- Kept note deletion compatible with both new subcollection notes and legacy session-array notes.

## Downloads retained

Unchanged from the user-revised package:

- `download/downloads.json`
- `VeilFarers_Corebook_11.31-PDF-Candidate.pdf`
- `VeilFarers_Keepers_Companion_11.3-PDF-Candidate.pdf`
- `VeilFarers_Rust_and_Steel_11.3-PDF-Candidate.pdf`
- `VeilFarers_Alien_Species_11.3-PDF-Candidate.pdf`
- `veilfarers_charsheet_fillable.pdf`

## Validation

- Native Node import/syntax validation of the TypeScript Function module.
- Firestore-shape fixture proving pasted table rows are stored as `{ cells: [...] }`, not arrays inside arrays.
- Client conversion fixture proving Player Tool still receives `rows: string[][]`.
- Recipient fixture proving a private note is visible to its target and Keeper, but not to another table member.
- Broadcast visibility fixture.
- JavaScript syntax checks for `table-access.js` and Keeper inline scripts.
- JSON validation and clean npm installation from `registry.npmjs.org`.
- Byte-for-byte comparison of Downloads and protected 3D dice assets.

## Deploy Preview acceptance

1. Connect Keeper Tool as the table owner.
2. Send a plain text note to all players.
3. Send a private note to one player and verify another logged-in player does not receive it.
4. Send a note containing a comma- or tab-separated table.
5. Delete a sent note.
6. Confirm `/api/table-api` returns 200 for `sendHandout`, `readSession`, and `deleteHandout`.
7. If an API failure occurs, use the visible `Reference vf-...` value to find the matching Netlify Function log entry.
