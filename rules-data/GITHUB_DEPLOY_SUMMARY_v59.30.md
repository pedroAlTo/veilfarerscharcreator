# VeilFarers Portal v59.30 — Corrected restore target (v59.27 behavior + v59.28 loading screen)

## PR title

`Replace current deploy with VeilFarers Portal v59.30`

## Suggested branch

`release/portal-v59.30-corrected-v59.27-restore`

## Base

Built from the original v59.27 portal build, then re-applied only the Player Tool loading-screen upgrade introduced in v59.28.

## Reason for this release

The previous follow-up targeted the wrong historical behavior. The requested reference was **v59.27**, not v59.24.

This build corrects that mistake.

## Main changes

- Restored the **Player Tool dice behavior to the original v59.27 implementation**.
- Restored the **v59.27 3D dice lock-on / tracking presentation**.
- Restored the **v59.27 attack flow** exactly as that build handled it.
- Removed the mistaken v59.29 v59.24-style restoration attempt.
- Kept the **v59.28 loading-screen upgrade** in the Player Tool:
  - branded loading panel
  - progress bar
  - staged loading messages
  - rotating lore/system tips
  - Aria-7 quote

## Intentionally unchanged

- welcome page and portal structure
- security baseline from v59.27
- keeper-tool under construction state
- lock-in toggle in options
- canonical data
- downloads and admin baseline

## Files changed relative to original v59.27

- `player-tool.html` (only for the v59.28 loading experience)
- `data/changelog.json`
- `START_HERE.txt`
- `GITHUB_DEPLOY_SUMMARY_v59.30.md`
- `PORTAL_HANDOVER_v59.30.md`
- `VALIDATION_v59.30.txt`

## QA checklist

1. Open Player Tool with a cold cache.
2. Confirm the branded loading screen appears and the progress bar advances.
3. Confirm the Player Tool loads normally afterward.
4. Confirm the 3D dice behavior now matches the original v59.27 behavior.
5. Confirm attack rolls also behave as in v59.27.
6. Confirm no v59.29-specific v59.24-style behavior remains.

## Rollback

Redeploy the original v59.27 package if needed.
