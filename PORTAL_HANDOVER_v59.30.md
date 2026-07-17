# VeilFarers Portal — Technical Handover v59.30

## Summary

This release corrects a misunderstanding in the previous follow-up.

The intended restore target was **v59.27**.
The prior attempt incorrectly targeted **v59.24**.

## What this build does

- Uses the **original v59.27 Player Tool dice behavior** as the source of truth.
- Re-applies only the **v59.28 loading-screen enhancement** on top of it.
- Discards the v59.29 v59.24-style dice restoration attempt.

## Effective result

You now get:
- the **v59.27 dice behavior / lock-on behavior / attack flow**
- plus the **improved Player Tool loading screen**

## Files changed

- `player-tool.html` — loading-screen enhancement re-applied on top of v59.27
- `data/changelog.json`
- `START_HERE.txt`
- `GITHUB_DEPLOY_SUMMARY_v59.30.md`
- `PORTAL_HANDOVER_v59.30.md`
- `VALIDATION_v59.30.txt`

## Notes

- If further tuning is needed, the next iteration should compare directly against the original deployed v59.27 behavior in-browser.
- v59.29 should be considered superseded by this corrected build.

## Rollback

Return to the original v59.27 package.
