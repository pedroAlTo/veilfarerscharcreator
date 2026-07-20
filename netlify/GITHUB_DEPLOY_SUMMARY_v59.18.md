# Replace current deploy with VeilFarers Portal v59.18

## Summary

This branch replaces the current VeilFarers deployment with **Portal v59.18** and updates the Corebook layout candidate to **11.1 RC3.2**.

The release builds directly on the v59.17 table/3D hotfix. It adds selectable Tech and Biolum 3D dice materials, a full-interface transparent 3D overlay, restored simulated dice motion in callouts, smooth gray discard cues, dynamic per-player callouts, Roll History controls, and an editorial Corebook hotfix restoring every class banner.

The rules canon remains **11.1 RC3**. RC3.2 is an editorial/layout revision rather than a new rules pass.

## Player Tool changes

### 3D presentation modes

Setup now provides three practical roller presentations:

- Standard 2D.
- 3D boxed stage.
- 3D overlay stage covering the interface with a transparent surface.

The 3D stage is fixed to the highest application layer so navigation, banners, modals, and callouts cannot cover the physical dice. Its label and result panels use a 20% opaque background, leaving them 80% transparent so dice remain visible when they pass behind those panels.

### Selectable dice materials

Setup now offers two 3D material families:

- **Tech** — the existing technological panel treatment.
- **Biolum** — the new bioluminescent crystal treatment.

Biolum roles:

- Hope: golden crystal with black numerals.
- Fear: violet crystal with black numerals.
- Damage: crimson crystal with white numerals.
- Discarded: switched-off gray crystal visual language.

All 3D assets are bundled locally and continue to use the MIT-licensed `@3d-dice/dice-box` renderer and `DisplayResults` integration.

### Callout animation and discarded dice

Callouts once again simulate rolling independently of the physical 3D renderer:

1. Dice enter and visibly roll/change face.
2. Final values settle.
3. For keep-highest/drop-lowest mechanics, the discarded die then fades smoothly to gray, dims, shrinks slightly, and receives a `DROP` label.
4. Retained dice remain highlighted and receive a `KEEP` label.

This animation works in 2D, 3D boxed, and 3D overlay modes because it is part of the shared callout UI.

### Dynamic per-player callouts

- Removed the previous six-callout cap.
- The tool keeps one current callout for every rolling player or character.
- A new roll replaces only that actor's previous callout.
- The responsive callout grid expands and wraps for the active table population.

### Roll History controls

Roll History now has explicit VeilFarers UI controls:

- **Reset** — clears the shared roll log, current callouts, callout timers, and local Time Travel snapshots after an in-app confirmation.
- **Close** — closes the history panel without changing data.

No native browser confirmation, disclosure, or range UI was introduced.

### Existing Player Tool behavior preserved

- `normalizeSessionKey` table-connection fix.
- Firestore undefined-value sanitization.
- Weapon Trait modifier added to attacks.
- Reliable, Accurate, Heavy, Massive, Brutal, and Paired processing.
- Structured damage dice with KEEP/DROP states.
- Tool-only Railgun playtest override: `d8+3 physical`, Massive.
- Generated dice sound, volume, and mute controls.
- Local Time Travel snapshots.
- Firebase runtime configuration through `/api/firebase-config`.

The Railgun override remains confined to Player Tool and does not modify canonical weapon data or the books.

## Corebook 11.1 RC3.2

The Corebook was rebuilt from the approved RC3.1 editorial source and now restores the complete emblem-and-ribbon class banner on all 18 class opening pages:

- Nine Awakened classes.
- Nine Sleeping classes.

The rebuild preserves the editorial decisions already approved:

- Player/general, Awakened, and Sleeping page backgrounds.
- One-point-smaller typography.
- Two-column class layouts.
- Decorative frame language.
- Correct contents page numbers.
- Searchable/selectable text.
- Full 797-entry PDF bookmark tree.
- Complete DOCX and Markdown sources.

No new rules changes were introduced in RC3.2.

## Infrastructure

Unchanged:

- Netlify hosting and Functions.
- Netlify Identity accounts and roles.
- Firebase anonymous authentication and Firestore real-time tables.
- Firebase configuration loaded at runtime from Netlify environment variables.
- No Firebase API keys committed to the repository.

## Required Netlify checks

Before production promotion, verify:

- [ ] Netlify Identity login/logout and roles.
- [ ] `/api/firebase-config` returns the configured Firebase project.
- [ ] Two browsers can join the same table.
- [ ] 3D boxed and overlay modes initialize with WebGL on target devices.
- [ ] Tech and Biolum texture switching works after reload.
- [ ] Multiple players can roll concurrently and retain separate callouts.
- [ ] Massive/Railgun displays both results and fades the discarded result to gray.
- [ ] Roll History Reset clears remote history and local Time Travel snapshots.
- [ ] Dice remain above navigation and banners at all viewport sizes.
- [ ] Direct Feedback and questionnaires still submit/open correctly.
- [ ] Corebook download resolves to RC3.2.

## Validation

Automated and structural validation result:

```text
Passed: 117
Failed: 0
```

Validation includes JSON integrity, local dependencies, JavaScript and TSX parsing, 3D theme assets/configuration, overlay and z-index rules, callout animation, dynamic callout ownership, history controls, weapon mechanics, secret scanning, Corebook page count, all 18 class anchors, TOC accuracy, 797 bookmarks, DOCX banner drawings, preserved typography styles, Markdown class-emblem directives, and byte-for-byte preservation of the other four PDFs.

The bundled 3D module loaded and returned structured mixed-theme results in headless Chromium. The container did not expose a WebGL context, so physical GPU rendering still requires a Deploy Preview/device test.

## Known limitation

The stable Dice Box API does not provide a reliable per-die material swap after a physical roll has settled. The discarded state therefore fades to gray in the callout and DisplayResults UI. The physical 3D die remains in its original material for that completed roll.

## Suggested branch

```text
release/portal-v59.18-biolum-overlay-callouts-corebook-rc3.2
```
