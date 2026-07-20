# VeilFarers Portal v59.31 — Restore v59.25 roll behavior + Full Sheet layout repair

## PR title

`Replace current deploy with VeilFarers Portal v59.31`

## Suggested branch

`release/portal-v59.31-rollflow-and-fullsheet-fixes`

## Base

Built from v59.30.

## Requested corrections addressed

This release addresses the remaining items reported after the earlier follow-ups:

- roll behavior should return to the **v59.25 feel**
- the **non-selected lock deactivates**
- **damage dice launch together with Hope/Fear**
- on criticals, **extra damage dice are added without removing the existing ones**
- the **Full Character Sheet / PDF layout issues** still needed correction

## Main changes

### Player Tool / rolls
- Restored the attack-roll flow so **base damage dice launch together with Hope/Fear**.
- Criticals now **add only the extra required damage dice afterward**, keeping the original base damage dice.
- Massive still discards the lowest damage die correctly.
- Brutal rerolls still apply correctly.
- Existing 3D lock presentation remains intact, including the deactivation of the non-selected result track.

### Full Character Sheet / PDF-facing layout
- Added a **minimum 50px+ gap** between stacked sheet faces on screen.
- Reworked stacked page positioning so sheets no longer overlap vertically.
- Reduced header bulk and tightened the top stat badges so **Level / Evasion no longer dominate the header**.
- Reduced text collision risk in the header, footer and ID strip.
- Improved footer wrapping so bottom labels no longer print over each other.
- Reduced clipped labels and tighter overprinting in the character sheet presentation.

## Files changed

- `player-tool.html`
- `charsheet.html`
- `data/changelog.json`
- `START_HERE.txt`
- `GITHUB_DEPLOY_SUMMARY_v59.31.md`
- `PORTAL_HANDOVER_v59.31.md`
- `VALIDATION_v59.31.txt`

## QA checklist

1. In Player Tool, roll a normal attack with 3D dice.
2. Confirm Hope/Fear and the base damage dice launch together.
3. Confirm the non-selected lock deactivates.
4. Confirm a critical attack keeps the original damage dice and adds only the extra critical dice.
5. Confirm Massive and Brutal still behave correctly.
6. Open the Full Character Sheet.
7. Confirm the stacked sheets no longer overlap and there is visible vertical spacing between them.
8. Confirm the header is more compact and Level/Evasion are no longer oversized.
9. Confirm footer text and bottom labels no longer overprint each other.
10. Confirm PDF / print-facing presentation remains usable.

## Rollback

Redeploy v59.30 if needed.
