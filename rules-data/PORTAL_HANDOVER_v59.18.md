# VeilFarers Portal v59.18 — Technical Handover

## Baseline

- Built from: `veilfarers_deploy_v59_17_table_and_3d_hotfix.zip`
- Portal version: `v59.18`
- Rules canon: `11.1 RC3`
- Corebook editorial candidate: `11.1 RC3.2`
- Hosting: Netlify
- Accounts/roles: Netlify Identity
- Real-time tables: Firebase Authentication + Firestore
- Firebase browser config: Netlify Function `/api/firebase-config`

## Main Player Tool files

- `player-tool.html`
- `assets/3d-dice/vf-dice3d.js`
- `assets/3d-dice/vf-dice3d.css`
- `assets/3d-dice/display-results.js`
- `assets/3d-dice/dice-box.es.min.js`

## 3D modes

`diceMode` selects 2D or 3D. When 3D is active, `dice3DStyle` selects:

- `box`
- `overlay`

The preference is stored in:

```text
veilfarers_dice_3d_style
```

The texture family is stored in:

```text
veilfarers_dice_texture_set
```

Supported values:

- `tech`
- `biolum`

## Theme mapping

Tech:

- `vfHope`
- `vfFear`
- `vfDamage`
- `vfNeutral`

Biolum:

- `vfBioHope`
- `vfBioFear`
- `vfBioDamage`
- `vfDiscarded`

Theme roots:

```text
assets/3d-dice/assets/themes/<theme>/
```

Every new theme includes:

- `default.json`
- `theme.config.json`
- diffuse numeral atlas
- `crystal-normal.png`
- `crystal-specular.jpg`

## 3D layer rules

The 3D stage uses:

```css
z-index: 2147483000 !important;
```

Box mode uses a framed stage. Overlay mode expands the shell to `100vw × 100vh` with no opaque stage background.

The HUD and DisplayResults panels use:

```css
background: rgba(2, 6, 23, .20);
```

This is 20% opaque / 80% transparent. Dice remain readable when passing behind the result or label panels.

## Callout animation

`AnimatedCalloutCard` owns the simulated callout roll lifecycle:

- Rolling state: approximately 760 ms.
- Final values settle.
- Discard reveal: approximately 1180 ms from callout creation.
- Gray fade duration: 480 ms.

`DamageDiceDisplay` delays the discarded state until the roll settles. `.vf-damage-die.is-discarded` applies grayscale, dimming, scale reduction, and a strike cue.

This is independent of Dice Box and therefore works in all roller presentation modes.

## Callout population

Active callouts are keyed by `actorKey`. A new roll is inserted while prior callouts from the same actor are removed:

```javascript
[{ ...roll, actorKey }, ...prev.filter(item => item.actorKey !== actorKey)]
```

There is no `.slice(0, 6)` cap. The responsive grid handles all active players/characters.

## Roll History

History header controls:

- Reset
- Close

Reset clears:

- local `rollHistory`
- `activeCallouts`
- active callout timers
- Time Travel data under `TIME_TRAVEL_KEY`
- remote Firestore `rollHistory`
- remote `lastRoll`
- remote `lastRollUpdatedAt`

The action uses the existing VeilFarers confirmation dialog.

## Weapon testing behavior

Player Tool retains the isolated override:

```javascript
'vf.core.weapon.railgun': {
  damage: 'd8+3 phys.',
  features: ['Massive'],
  feature: 'Massive'
}
```

Do not propagate this override into:

- `data/weapons.json`
- `rules-data/core/weapons.json`
- Character Creator
- Armory
- Corebook/Rust & Steel

until playtest feedback approves it.

## Book pipeline

Corebook DOCX source:

```text
VeilFarers_Corebook_11.1-RC3.2-PDF-Candidate.docx
```

The 18 banner images are inserted after each `VFANCHOR|2|CLASS||...` paragraph. The nine visual banners are reused for Awakened and Sleeping entries.

The PDF pipeline:

1. Render DOCX to PDF.
2. Read hidden `VFANCHOR` records.
3. Merge the approved alternating backgrounds behind each page:
   - Player/general
   - Awakened
   - Sleeping
4. Rebuild the 797-entry nested PDF outline.
5. Verify the contents numbers against chapter anchor pages.
6. Render contact sheets and inspect all class openings and the whole book.

RC3.2 preserves the RC3 rules content. The revision restores class banners and updates editorial/source labels only.

## Editorial deliverables

- RC3.2 PDF
- RC3.2 DOCX
- full-source Markdown
- chapter-split Markdown ZIP
- complete source package including layout assets

The full-source Markdown contains 18 `:::class-emblem` directives and page references matching the final 234-page PDF.

## Live checks still required

- WebGL Dice Box rendering on actual browsers/GPUs.
- Overlay behavior on phones/tablets.
- Multiple simultaneous Firebase callouts.
- Identity and role-gated routes.
- Firestore Reset behavior with a real table.
- Performance with a large player count.

## Known limitation

DisplayResults and the callout can transition discarded dice to the gray/off state. Dice Box does not expose a stable supported post-roll API to swap an individual physical die's material, so the settled physical 3D model is not recolored during the same roll.
