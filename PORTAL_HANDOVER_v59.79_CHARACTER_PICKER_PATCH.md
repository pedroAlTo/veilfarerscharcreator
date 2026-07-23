# VeilFarers Portal v59.79 — Character Picker patch handover

Date: 2026-07-23  
Active full baseline: v59.79  
Patch type: incremental overlay  
Patch package: `VeilFarers_Portal_v59.79_Character_Picker_PATCH.zip`

## Direct instruction for the next chat

Use the complete v59.79 portal as the active baseline and apply this patch on
top of it. Do not rebuild from an older portal release.

The patch changes only:

- `portal.js`
- `portal.css`
- `character-registry.js`

It does not replace the Keeper Tool, Player Tool, Hearts in the Void, rules
data, maps, PDFs, audio, Firebase functions or table-security implementation.

For every later portal modification, update this handover again and deliver
only the changed runtime files unless the user explicitly requests a complete
portal package.

## Character selector added by this patch

The shared navigation previously showed the active permanent character number
(`VF-######`) immediately before the Log-in control.

The badge now displays the active character's name. Clicking the name opens a
custom VeilFarers character picker containing all selectable, non-trashed
characters available from:

- the canonical local Character Registry / Character Vault;
- Player Tool local characters not yet represented in the Registry.

Each option shows:

- character name;
- permanent character ID;
- level;
- class or path when available.

Selecting a character updates the canonical active-character ID and emits the
existing `veilfarers:active-character-changed` event. Registered characters
also use the Registry's existing `setActive` path so cloud synchronization can
continue without delaying the visual selection.

The selector refreshes when:

- the active character changes;
- a character record changes;
- the Vault refreshes;
- relevant local-storage data changes in another tab.

The menu is rendered outside the horizontally scrolling navigation track so it
cannot be clipped. It supports click-away closing, Escape, Arrow Down from the
trigger, responsive positioning and visible selected-state feedback.

No browser-native `<select>` or browser-native dialog is used. The component
uses the established VeilFarers navigation styling.

## Files changed

### `portal.js`

- Replaces the permanent-ID text badge with a named active-character button.
- Builds the custom character list.
- Merges canonical Registry records with Player Tool local records.
- Changes the active character through the existing Registry contract.
- Synchronizes the component with Registry, Vault and storage events.
- Positions the menu independently of navigation overflow.

### `portal.css`

- Adds the compact name button and disclosure indicator.
- Adds the custom dropdown panel and selectable character rows.
- Adds hover, focus, selected and mobile states.
- Retains the established gold/black portal visual language.

### `character-registry.js`

- Stops later Registry refreshes from replacing the character name with the
  permanent ID.
- Delegates badge rendering to the new shared navigation picker when present.
- Keeps a name-based fallback for any page that renders the Registry badge
  without the complete picker.

## Current full-release baseline retained

The active v59.79 baseline remains responsible for:

- strict password verification on every attempt to join a closed table;
- current and legacy password verification and secure migration;
- owner-only permanent table deletion;
- removal of deleted-table sessions, directory records, secrets, invitations
  and handouts;
- the complete v59.78 Hearts in the Void Keeper Tool integration;
- Corebook 11.35 and Keeper's Companion 11.33 as the adventure's rules
  baseline;
- 11 Keeper stages and ten Level 1 Sleeping pregenerated characters;
- the Weaver Queen encounter and its current phases;
- the standoff without a roll;
- “I Need an Idea!” as a terminal backup;
- “The Ship That Learns” fusion ending as optional/recommended;
- trimmed `dados_1.mp3`;
- interrupted dice audio stopping with the animation;
- mobile Shake to Roll using the selected 3D mode;
- active-character-safe Inventory transfers;
- the current Level Up workflow, custom selectors and dice lifecycle.

## Table-security baseline retained

Every join request for a closed table passes through the server password gate,
including owners and existing members. Empty or incorrect passwords receive
HTTP 403. Closed tables without a usable verifier receive HTTP 409.

The current verifier accepts the server-only PBKDF2 format and supported legacy
formats, but legacy data is migrated only after a correct non-empty password.

Only the authenticated table owner can change its password, manage invitations
or members, or permanently delete the table. Legacy ownerless tables must be
validly joined and claimed before owner controls become available.

## Adventure baseline retained

The patch does not edit Hearts in the Void. The adventure remains:

- an introductory campaign opener for VeilFarers;
- centered on player agency rather than automatic NPC actions;
- compatible with Sleeping characters and individual Awakening decisions;
- built around multiple viable ship-acquisition routes;
- explicit that the standoff is resolved without a roll as part of the
  adventure's lesson;
- equipped with “I Need an Idea!” only as a final backup after player-led
  approaches;
- inclusive of the optional/recommended ship-fusion ending;
- supported by the corrected Crossroads and Charon's Refuge map packages.

## Editorial and implementation guardrails

- The system name is **VeilFarers**.
- Do not invent rules, Conditions or features outside the canonical books.
- When changing a canonical rule, cite its location in the current books.
- Preserve player agency and avoid automatic NPC resolutions.
- Preserve the custom VeilFarers UI; do not introduce browser-native selects,
  dialogs, scrollbars or visually inconsistent controls where a custom
  component exists.
- Keep local testing functional without weakening production authentication.
- Do not expose Firebase or Netlify secrets in client files.
- Every future modification must include an updated handover.
- Full formal releases should continue to include a GitHub-ready deployment
  summary and validation notes.

## Patch installation

Extract `VeilFarers_Portal_v59.79_Character_Picker_PATCH.zip` directly over the
root of a complete v59.79 portal and allow the three runtime files to be
replaced.

Do not delete any other portal files.

## Acceptance checks

1. Open any portal page with an active saved character.
2. Confirm the navigation shows the character's name rather than `VF-######`.
3. Click the name and confirm all non-trashed selectable characters appear.
4. Confirm every row shows its name, ID and level.
5. Select another character and confirm the name changes immediately.
6. Open Inventory and confirm transfers target the newly selected character.
7. Refresh the page and confirm the selected character remains active.
8. Confirm the dropdown is not clipped by horizontal navigation.
9. Repeat at mobile width.
10. Confirm Log-in, Admin visibility and navigation scrolling still work.

Final cross-device behavior should be checked in a Deploy Preview with real
Netlify Identity and Firebase data.
