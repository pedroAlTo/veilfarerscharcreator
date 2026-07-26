# Replace current deploy with VeilFarers Portal v59.20

## Summary

This branch replaces the current deployment with **VeilFarers Portal v59.20**.

It is a focused Player Tool mobile hotfix built directly on v59.19. The Options panel can no longer trap users on a smartphone: it now behaves as a full-height application dialog with permanent exit controls and an independently scrollable body.

The Corebook RC3.2, other PDFs, rules data, dice themes, weapon processing, callouts, Firestore safeguards and the rest of the portal remain unchanged.

## Changes

### Mobile-safe Options panel

- Rebuilt Options as a full-height mobile dialog using the dynamic viewport height.
- Added an always-visible **Close** button in the header.
- Added a persistent **Back to Player Tool** button in the footer.
- Moved long settings content into its own touch-scrollable region.
- Added safe-area padding for devices with notches and home indicators.
- Raised Options above the canonical navigation and other Player Tool layers.
- Added `Escape` support on keyboard-equipped devices.
- Kept tap-outside-to-close behavior on layouts where the backdrop remains visible.
- Locked page scrolling and overscroll while the dialog is open, restoring the previous body state when it closes.

## Preserved behavior

- Plain, Tech and Crystal dice themes.
- 2D and 3D dice modes and Box/Overlay presentation.
- Multiple per-player callouts.
- Critical glow and discarded-die cues.
- Weapon Trait and feature processing.
- Player Tool Railgun playtest override.
- Roll History Reset, Close and Time Travel.
- Firebase `undefined` sanitization and table connection hotfixes.
- Netlify Identity and portal navigation.
- Corebook 11.1 RC3.2 and all other downloads.

## Deployment requirements

No new environment variables, Firebase migrations, Firestore migrations or Netlify configuration changes are required.

## Validation

- Player Tool JSX parsed successfully.
- Standalone JavaScript syntax passed.
- All JSON files parsed successfully.
- Mobile dialog structure and permanent exit controls were verified.
- Safe-area and dynamic-viewport declarations were verified.
- Escape handling and body scroll restoration were verified.
- All PDF downloads are byte-identical to v59.19.
- All non-release application files except `player-tool.html`, `feedback.html` and the changelog are byte-identical to v59.19.

See `VALIDATION_v59.20.txt` for the full report.

## Post-deployment checklist

- [ ] Open Options on iPhone Safari or an equivalent narrow viewport.
- [ ] Confirm the header Close button is always visible.
- [ ] Scroll to the final option and confirm the footer remains visible.
- [ ] Close with **Back to Player Tool**.
- [ ] Reopen and close with the header `×`.
- [ ] Rotate the device while Options is open.
- [ ] Confirm page scrolling resumes after closing.
- [ ] Confirm desktop click-outside and Escape closing still work.

## Suggested branch

```text
release/portal-v59.20-mobile-options-escape-hotfix
```
