# VeilFarers Portal v59.56 — Affiliation Crest Integration

## Scope

Visual Character Creator release built from v59.55. It adds the supplied House and faction crests to Step 6 — Affiliation while preserving every canonical rule, ID, option and application/security workflow.

## Changes

- Added a dedicated crest header to each Character Creator Affiliation card.
- Converted the supplied opaque checkerboard PNG backgrounds into real transparency and exported optimized `720 × 1080` WebP runtime assets.
- Mapped approved artwork to Church of the Eternal Veil, Explorers' Guild, Free Fleet, House Joric, House Kurogane, House Solari, House Valerius, House Volkov, Solara Compact, Stellar Commerce Guild and House Kaelen.
- Kept House Amaranth and Independent fully selectable with an in-app heraldic monogram fallback until approved artwork is supplied.
- Packaged future-ready Starborn Collective and Spire of Verita assets without adding unsupported Affiliation choices.
- Added responsive sizing, `object-fit: contain`, lazy image decoding, affiliation-specific alternative text and broken-image fallback behavior.
- Preserved all Affiliation equipment access, benefits, obligations and canonical IDs unchanged.

## Explicitly unchanged

- Character Vault, import and Level Up behavior.
- Charsheet and Player Tool synchronization.
- Keeper Tool and table-note implementation.
- Netlify Functions, Firebase integration and Firestore Rules.
- Downloads manifest and bundled PDF files.
- Protected 3D dice renderer and assets.

## Deploy Preview acceptance

1. Open Character Creator and navigate to Step 6 — Affiliation.
2. Confirm all 13 canonical Affiliation cards remain present and selectable.
3. Confirm the 11 mapped crests load without checkerboard backgrounds or distortion.
4. Confirm House Amaranth and Independent show readable monogram fallbacks.
5. Check desktop, tablet and mobile widths.
6. Select several affiliations and confirm the selection checkmark remains visible above the crest.
7. Import a character with an existing affiliation and confirm the matching card remains selected.
