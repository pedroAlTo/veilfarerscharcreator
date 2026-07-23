# VeilFarers Portal v59.79 — Character Picker incremental patch

## Summary

This patch replaces the permanent character ID shown beside Log-in with the
active character's name and turns it into a custom character selector.

It is an overlay for the complete v59.79 portal, not a full release package.

## Runtime files

- `portal.js`
- `portal.css`
- `character-registry.js`

## Changes

- Display the active character name in shared navigation.
- Open a custom VeilFarers dropdown when the name is clicked.
- List all selectable non-trashed Registry/Vault characters.
- Include Player Tool local characters not yet present in the Registry.
- Show character ID, level and class/path inside each option.
- Update the canonical active-character selection immediately.
- Retain background cloud synchronization for registered characters.
- Refresh from active-character, character, Vault and cross-tab storage events.
- Keep the menu outside the horizontally scrolling navigation viewport.
- Add click-away, Escape, keyboard entry, focus and mobile behavior.
- Prevent Character Registry refreshes from reverting the label to `VF-######`.

## Deployment

Extract `VeilFarers_Portal_v59.79_Character_Picker_PATCH.zip` over a complete
v59.79 portal and replace the three runtime files listed above.

No other production files need to be changed for this patch.

## Validation performed

- JavaScript syntax checks passed for `portal.js` and
  `character-registry.js`.
- A DOM interaction test passed for name rendering, three-character listing,
  trashed-character exclusion, selection persistence and menu closure.
- The three existing table security/contract test suites passed.
- The picker uses the existing Character Registry storage keys and event
  contract.
- No native browser select or dialog was introduced.
- The patch does not modify rules, Keeper Tool content, Hearts in the Void,
  table security, audio or dice behavior.

## Deploy Preview acceptance

- Verify the current character's name appears beside Log-in.
- Verify the list contains all expected selectable characters.
- Select another character and confirm Inventory targets it.
- Verify persistence after refresh and synchronization across another tab.
- Verify desktop and mobile positioning.
