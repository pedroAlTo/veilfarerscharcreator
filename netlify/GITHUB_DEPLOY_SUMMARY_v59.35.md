# VeilFarers Portal v59.35 — Augmentation Crash Fix + Clean Welcome Cards

## PR title

`Deploy VeilFarers Portal v59.35`

## Suggested branch

`release/portal-v59.35-augmentation-render-fix`

## Base

Built from v59.34.

## Fixed

### Player Tool blank-screen crash

Adding or activating an augmentation could blank the Player Tool and produce React error #31:

```text
Objects are not valid as a React child: {name, rank, code}
```

The canonical `tier` field is an object. One secondary augmentation summary attempted to render that object directly.

This release:

- converts canonical tier objects to safe text labels before rendering;
- uses the same safe formatter for weapon, armor, augmentation, gear and drone metadata;
- preserves the full canonical object in stored data while only converting the visible label;
- keeps augmentation inventory and active/inactive state behavior unchanged.

### Welcome page

- removed all character images from the individual portal cards;
- retained the existing full-page background image;
- retained the side LED activity particles;
- retained the portal-card layout, borders and hover behavior.

## Warnings seen in console

The Tailwind CDN and in-browser Babel messages are production warnings, not the cause of this crash. The crash was the React object-rendering error described above.

A later build-system pass should replace the Tailwind CDN and precompile JSX, but that work is intentionally separate from this corrective release.

## Files intentionally changed

- `player-tool.html`
- `welcome.css`
- `index.html`
- `data/changelog.json`
- `START_HERE.txt`
- `GITHUB_DEPLOY_SUMMARY_v59.35.md`
- `PORTAL_HANDOVER_v59.35.md`
- `VALIDATION_v59.35.txt`

## Manual QA

1. Open Player Tool.
2. Open **Manage Augmentations**.
3. Add an augmentation from the canonical list.
4. Confirm the Player Tool remains visible.
5. Activate and deactivate the augmentation.
6. Reload and confirm inventory and active state persist.
7. Open the welcome page and confirm tool cards contain no character images.
8. Confirm the main page background remains present.

## Rollback

Redeploy v59.34.
