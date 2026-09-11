# VeilFarers v59.82 — 11 September 2026

This release installs the five supplied 12.06 book PDFs and First Crossing 1.1 session, Table Kit and Color Maps. The supplied Markdown and raw maps remain reference material. PDF sizes and SHA-256 hashes are recorded in `public/download/downloads.json`; existing character and starship sheets retain their original versions.

## Homepage notices

1. Books 12.06
2. New! First Crossing Lite
3. Rust & Steel download correction
4. Beta invitation
5. Nine Signals — Coming soon

The new notices reuse the original gold, clipped-corner minimize and dismiss icons. Each notice remembers its own dismissal. A new session opens the first eligible notice. The Lite dice reuse the existing gold Hope and violet Fear d12 assets, reduced slightly and confined to the foreground below the centered book collection. A character sheet and pencil sit behind the books. Both art panels have a central flare and slowly expanding golden ribbons. The Lite CTA displays the three illustrated First Crossing covers as bound books, with Maya at the front.

## Charon’s Refuge

The station artwork derives from the first supplied visual reference. It has an unlit base image and 84 individual SVG window polygons traced against its 1536 × 1024 coordinate system. Selecting a sector starts an uneven ignition, then a subtle pulse with occasional short failures; the previous sector fades to darkness. The starfield is a separate canvas, sampled against a padded hull mask so particles remain in the background. A beveled HUD selector tracks the active sector with a 10% orange fill, animated static and a scanning sweep. Fast numerical readouts sit just below its bottom-right corner, aligned with the frame edge. Six quiet environmental readings and fast microtext packets accompany a first-view typewriter title with a blinking cursor. Power values stay between 17% and 24% without alert language; the fictional readings reveal no infestation details.

Animations stop offscreen or in a hidden tab. Reduced motion keeps the stars and selected windows steady; the Lite dice stay hidden, with no 2D substitute.

## Generated artwork

Created using the built-in imagegen tool. Final project assets:

- `public/assets/books/charons-refuge-original-dark.png`
- `public/assets/books/editions/first-crossing-maya.webp`
- `public/assets/books/editions/first-crossing-table-kit.webp`
- `public/assets/books/editions/first-crossing-color-maps.webp`

The three First Crossing images appear in the Lite CTA, on Downloads and in the Hearts in the Void starter section. They are promotional illustrations; the supplied PDF documents are unchanged. Full generated source renders and QA screenshots remain in local `output/`, excluded from Git.

Final prompt specifications:

- **Station:** preserve the exact station arrangement, perspective and intricate metal structure from the original Charon’s Refuge mockup; remove all interface labels and callouts; turn off emissive windows; keep the small rectangular panes readable. Final background-only edit replaces the checkerboard with solid blue-black `#02080f`, keeping the station geometry and 1536 × 1024 framing.
- **First Crossing:** premium cinematic, realistic painterly science-fiction cover. Maya Santos, a tired middle-aged woman with prematurely grey hair and a discreet dark suit, sits in the Nexus Inferior booth with black coffee and activates a three-dimensional cyan hologram of 23-year-old Alexei Joric in ceremonial military uniform. Navy, charcoal, violet, pale gold and amber; aged-gold clipped-corner border; VeilFarers / Chronicles of the Silence / First Crossing / Lite Starter 1.1 typography.
- **Table Kit:** a substantial physical three-panel Keeper screen with panoramic station and nebula art, character folios, reference cards, a pencil and gold/violet d12s on a worn table. Warm desk light, cool starship ambience and tactile paper. Matching premium VeilFarers border, palette and Table Kit 1.1 typography.
- **Color Maps:** a composed arrangement of four physical color map sheets: Charon’s Refuge overview, circular docking ring, industrial acquisition yard and central-starship hangar. Architectural detail, grids, restrained symbols, paper depth and aged-gold outlines. Matching cinematic palette, border and Color Maps 1.1 typography.

## Rust & Steel equipment archive

Four matching blueprint plates illustrate armories, powered armor, field equipment and utility drones. The black-market tile features a digital rogue mask. Every illustration has responsive WebP sizes and opens in a keyboard-accessible larger view; native image links still work without JavaScript. Prompt specifications and asset locations are recorded in `RUST_SCHEMATICS.md`.

The Heat tile uses the book's 0–10 track and canonical bands: Cold (0–2), Warm (3–4), Hot (5–6), Burning (7–8), Inferno (9), Burned (10). Its segments fill as the color shifts from steel blue to amber and then red. The automatic demonstration starts in view, pauses offscreen or behind an artwork dialog, and runs once. A range control allows direct exploration and a replay button restarts it. Reduced motion uses manual control only. No campaign data is stored or changed.

## Dormant survey

The full survey markup, controller and server-side counting code are retained. `VF_MINI_SURVEY_ENABLED` remains false and `campaign.opensAt` remains null. See `CTA_LAUNCH.md` for activation. No live votes were submitted during validation.

## Validation

- Deployment verifier: asset references, release markers and existing source checks.
- Node test suite: PDF hashes, public navigation, sector behavior, light transitions and retained survey logic.
- Browser checks: desktop/mobile rendering, notice order and controls, d12 loading, all five sectors, download portraits, starfield and dormant survey.

The Windows asset verifier now normalizes path separators before applying its existing vendored-dice exclusion, avoiding a false missing-texture error without changing the dice engine or textures.
