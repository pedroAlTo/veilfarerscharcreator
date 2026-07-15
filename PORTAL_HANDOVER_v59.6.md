# VeilFarers Portal v59.6 — Application UI and feedback restoration

## Scope

This build is based on v59.5 and preserves the real-time roll fixes. It addresses visible browser chrome in the Player Tool, restores the original playtest questionnaires, and documents administration-role setup.

## UI policy

VeilFarers must not expose browser-native-looking chrome where an application component can represent the same interaction. This build introduces:

- a custom global scrollbar skin for content areas;
- hidden native scrollbars for compact navigation rails;
- custom previous/next buttons for overflow in the portal navigation;
- wrapping Player Tool character tabs and tool controls instead of a horizontal browser scrollbar;
- custom category choice cards instead of a native Feedback select;
- custom closed-state styling for semantic select controls.

The semantic HTML controls remain for accessibility and keyboard support, but their visible chrome follows the VeilFarers interface.

## Player Tool

The character-tab and tool-button area no longer uses `overflow-x-auto` at desktop breakpoints. Both rails wrap inside the application header, so opening Settings cannot reveal a native horizontal scrollbar under the buttons.

## Portal navigation

The global portal menu uses a scrollbar-free internal track. When its contents exceed the available width, VeilFarers previous/next controls appear. The buttons scroll the track and disable themselves at the corresponding edge.

## Feedback

The direct `veilfarers-feedback` Netlify Form remains available. The following original questionnaires are restored on the same page:

### Keeper

- Arc / Campaign Review
- Hearts in the Void
- The Derelict’s Secret
- The Hephaestus Drop
- The Titan’s Gambit
- Session Debrief

### Player

- Player Feedback

The links are copied from the original complete character-sheet feedback modal.

## Assigning the Netlify Identity admin role

1. Open the VeilFarers project in Netlify.
2. Navigate to **Project configuration → Identity → Users**.
3. Select the relevant Identity user.
4. Choose **Edit settings**.
5. Add `admin` in **Roles** and save.
6. The user must log out and log in again, or otherwise refresh the Identity token, before `app_metadata.roles` in the JWT is updated.

This is an application role under Netlify Identity. It is separate from Netlify team roles such as Owner or Developer.

## Deploy-preview checks

- Open Player Tool with enough characters or a narrow viewport to wrap the top controls. No native horizontal scrollbar should appear before or after opening Settings.
- Resize the global portal menu until it overflows. VeilFarers navigation arrows should appear and work with mouse and keyboard.
- Submit the direct feedback form on a Netlify Deploy Preview where Forms detection is enabled.
- Open every questionnaire card and verify that the expected Google Form loads.
- Assign `admin`, sign out, sign in again, and verify access to `/admin.html`.
