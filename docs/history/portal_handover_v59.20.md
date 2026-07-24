# VeilFarers Portal v59.20 — Technical Handover

## Release identity

- Portal version: `v59.20`
- Base: `v59.19`
- Scope: Player Tool mobile Options hotfix
- Rules canon: unchanged
- Editorial PDF: Corebook `11.1 RC3.2`, unchanged

## Problem corrected

On narrow smartphone viewports, the Options content exceeded the visible height. Because the original modal was vertically centered and had no fixed header or internal scrolling contract, both the lower **Done** control and part of the panel could end outside the usable viewport. A user could become trapped in Options.

## Implementation

### Dialog shell

`player-tool.html` now renders Options as:

- a top application layer (`z-[30000]`);
- a full-height `100dvh` panel on mobile;
- a bounded centered dialog on larger screens;
- a `flex` column with non-scrolling header/footer and a dedicated scrolling body;
- an ARIA modal dialog with a labelled title.

### Exit paths

Options now provides:

1. Header **Close** button, always visible.
2. Footer **Back to Player Tool** button, always visible.
3. `Escape` keyboard handling.
4. Backdrop tap/click closing when the backdrop is exposed.

### Mobile behavior

- Uses `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- Uses `WebkitOverflowScrolling: touch` for the internal body.
- Locks `document.body` scrolling and overscroll while open.
- Restores the exact prior body values during effect cleanup.

## Files intentionally changed from v59.19

- `player-tool.html`
- `feedback.html` — release label only
- `data/changelog.json`
- `START_HERE.txt`
- release documentation files

Books, PDF downloads, rules data, 3D assets and all other application modules are unchanged.

## No migration required

This release changes no persisted character schema, localStorage keys, Firebase document shape, Firestore rules, Netlify Functions or Identity roles.

## Recommended live checks

Test at minimum:

- 320 × 568 viewport;
- 390 × 844 viewport;
- iOS Safari with a notch/home indicator;
- Android Chrome;
- landscape orientation;
- desktop keyboard Escape;
- desktop backdrop click.
