# VeilFarers Portal — Technical Handover v59.31

## Summary

This iteration resolves two remaining groups of issues:

1. **Player Tool roll behavior** should match the requested v59.25 feel.
2. **Full Character Sheet / PDF layout** still had unresolved overlap and sizing defects.

## Implemented

### Player Tool
- Added `parseDamageFormula()` helper.
- `rollDuality()` now includes the base weapon-damage dice in the initial roll package alongside Hope/Fear.
- `rollWeaponDamage()` now accepts optional `initialRolls`.
- If a critical needs more dice, the function rolls only the missing critical bonus dice and appends them instead of replacing the original ones.
- Massive and Brutal post-processing remain intact.

### Full Character Sheet
- Added a new CSS override block: `vf-sheet-v59-31-layout-fixes`.
- Introduced explicit stacked page geometry with fixed per-page height and a 56px inter-page gap.
- Reworked `.head`, `.stats`, `.stat-badge`, `.idstrip`, and `.foot` for a more compact and collision-resistant layout.
- Reduced the chance of truncated or vertically wrapped labels in the page headers and footers.

## Files changed

- `player-tool.html`
- `charsheet.html`
- `data/changelog.json`
- `START_HERE.txt`
- `GITHUB_DEPLOY_SUMMARY_v59.31.md`
- `PORTAL_HANDOVER_v59.31.md`
- `VALIDATION_v59.31.txt`

## Notes

- This build keeps the branded loading screen added in v59.28.
- The roll behavior now targets the requested v59.25-style sequence rather than the later mistaken restore target.
- If an even more exact historical match is needed, the next pass should compare side by side against a live v59.25 reference build.

## Rollback

Redeploy v59.30.
