# VeilFarers Portal v59.10 — Technical Handover

## Scope

v59.10 corrects the Player Tool resource model for executable abilities. Any action whose canonical text specifies a Hope cost can now be paid with the same amount of Effort instead.

The release is based on v59.9 and preserves the operational weapon system, RC2 canonical data, Netlify Identity integration, and Firebase table synchronization.

## Implemented behavior

### Character features

The Player Tool cost parser continues to read explicit costs from Ancestry Gifts, Class Features, Community Features, and Hope/Effort Features.

For a Hope-cost action, `featurePaymentOptions()` now generates two payment objects:

```js
{ resource: "hope", amount: N }
{ resource: "effort", amount: N, alternativeFor: "hope" }
```

Each action is rendered once per valid payment option. The Hope and Effort buttons are disabled independently according to the current resource tracks.

Example:

```text
Chrono-Gift — Spend 2 Hope

Use · 2 Hope
Use · 2 Effort
```

### Domain Cards

Domain Cards no longer activate by clicking the entire card with a hardcoded Hope payment.

Each card now provides explicit controls:

```text
Use Hope
Use Effort
```

The numeric cost remains unchanged. Zero-cost powers show a single `Roll` action.

### Resource deduction

`executeFeatureAction()` accepts the selected payment object and uses that object for:

- affordability checks;
- resource deduction;
- Duality rolls;
- standalone dice actions;
- non-roll feature activations;
- logging and real-time broadcast metadata.

### Roll history and Firebase callouts

Duality results now retain the selected payment in `resourceCost`.

The local Roll History and table-wide callout show:

```text
Spent 2 Hope
```

or:

```text
Spent 2 Effort
```

The Firestore document schema remains compatible. `resourceCost` is an optional field inside existing `lastRoll` and `rollHistory` objects; no migration is required.

## Files changed

- `player-tool.html`
- `data/changelog.json`
- `feedback.html`
- `START_HERE.txt`
- `VALIDATION_v59.10.txt`
- `GITHUB_DEPLOY_SUMMARY_v59.10.md`
- `PORTAL_HANDOVER_v59.10.md`

## Compatibility

- Existing saved characters require no migration.
- Existing Firestore session documents remain valid.
- Old history entries without `resourceCost` continue to render.
- Non-Hope costs remain unchanged:
  - Effort costs use Effort only.
  - Resolve costs use Resolve only.
  - Stress costs mark Stress.
- Experience rolls retain their existing behavior; this change targets abilities and Domain powers with explicit Hope costs.

## Netlify and Firebase

No infrastructure change is required.

- Netlify Identity remains responsible for accounts and roles.
- Firebase Authentication and Firestore remain responsible for real-time sessions.
- Firebase configuration continues to load from `/api/firebase-config`.
- No environment values or Firebase keys are embedded in the deployment package.

## Deploy Preview checks

1. Import a character with a Hope-cost Ancestry Gift, such as Chrono-Gift.
2. Confirm that both Hope and Effort activation buttons appear.
3. Spend Hope and verify only Hope decreases.
4. Spend Effort and verify only Effort decreases.
5. Reduce one resource below the cost and verify only its corresponding button is disabled.
6. Repeat the test with a Hope-cost Class, Community, or path feature.
7. Open a Domain Card and test both payment buttons.
8. Confirm the chosen payment appears in local Roll History.
9. Connect a second Player Tool to the same table and confirm the chosen payment appears in the real-time callout.
10. Confirm older roll-history entries still display normally.

## Automated validation

See `VALIDATION_v59.10.txt`.

Result:

```text
Passed: 25
Failed: 0
```
