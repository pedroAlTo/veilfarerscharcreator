# VeilFarers Portal v59.57 — Character Creator Visual Rebuild

## Scope

Full visual reconstruction of the Character Creator using the approved Affiliate-screen direction while preserving the existing nine-step creation workflow, canonical rules, import behavior, Vault registration, Charsheet transfer, Level Up route, and portal navigation.

## Changes

- Rebuilt the Creator as an immersive dark navy and gold in-app interface.
- Added a persistent left Creation Progress rail for desktop with active, completed, pending, and Character Sheet states.
- Added a synchronized horizontal step rail above the active panel.
- Restyled every creation surface: Ancestry, Community, Path/Class/Subclass, Traits, Experiences, Affiliation, Domain Powers, Equipment, and Review.
- Reworked selection cards into dark heraldic panels with consistent gold corner geometry, selected-state illumination, and responsive spacing.
- Restyled Powers, Equipment, traits, paths, fields, overlays, filters, and navigation controls to use the same visual system.
- Replaced the small floating action cluster with a full-width guided footer inside the main Creator area while retaining the existing readiness gates.
- Added responsive behavior: desktop progress rail, mobile horizontal step navigation, single-column cards, and a mobile-safe action footer.
- Added approved House Amaranth and Independent crest assets.
- Mapped all 13 canonical Affiliation choices to approved crest artwork.
- Independent uses the approved broken-chains crest.
- Converted the new opaque checkerboard artwork into real-alpha, optimized `720 × 1080` WebP assets.
- Affiliation crests load eagerly because the complete canonical set is small and visually central.
- Added `creator-redesign.css` and `creator-redesign.js`; no new runtime package or CDN dependency was introduced.

## Explicitly unchanged

- Canonical Affiliation options, names, IDs, equipment access, benefits, Calls, and obligations.
- Character creation validation and dependent-choice behavior.
- Ailuran Sub-Strain requirements and historical import normalization.
- Character Vault identity allocation and multi-character behavior.
- Charsheet and Player Tool synchronization.
- Level Up rules and route.
- Keeper Tool, table access, notes, and Firebase/Netlify Functions.
- Firestore Rules.
- Downloads manifest and bundled PDF documents.
- Protected 3D dice renderer and all 87 protected dice files.

## Files added or changed

- `creator.html`
- `creator-redesign.css`
- `creator-redesign.js`
- `img/affiliation/house-amaranth.webp`
- `img/affiliation/independent.webp`
- `img/affiliation/README.md`
- `package.json`

## Deploy Preview acceptance

1. Open Character Creator at desktop width and verify the persistent left progress rail and synchronized upper step rail.
2. Navigate all nine steps using both the rails and the guided footer.
3. Confirm forward navigation remains disabled until each existing validation gate is complete.
4. Confirm dependent Ailuran and Class/Subclass overlays remain usable and closable.
5. Confirm all 13 canonical Affiliation cards display their matching crest, including House Amaranth and Independent.
6. Confirm the Independent card uses the broken-chains crest.
7. Test widths near 1600 px, 1024 px, 820 px, 390 px, and landscape mobile.
8. Confirm cards, filters, fields, Powers, and Equipment remain readable and selectable.
9. Import a historical JSON, confirm it reaches Review, and transfer it to Charsheet.
10. Create a new character, finish it, and verify automatic Vault registration remains unchanged.
