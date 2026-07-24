# VeilFarers Portal v59.69 — Editorial Line Integration and Human Inheritance

## Summary

v59.69 installs the supplied editorial PDF line in Downloads and implements the newly approved Human ancestry gifts in Character Creator.

The release intentionally uses the supplied Corebook 11.35 wording for Massive. No new Corebook version is generated for the portal's later Massive implementation; that difference remains a tracked editorial clarification.

## Changes

### Human ancestry

- Added **Made for the Graft**:
  - Human characters gain +2 Augment Capacity.
- Added **Inheritance of the Builders** as a required Character Creator choice:
  - **The Graft:** one free Common (TT1) or Military (TT2) augmentation.
  - Common grafts consume 0 Augment Slots.
  - Military grafts consume 1 Augment Slot.
  - The inherited graft has no drawback.
  - **The Tool:** one Experimental (TT3), 9 Cr item from an equipment catalogue in play.
- Character Creator now asks for the Graft/Tool branch during Ancestry.
- The exact inherited item is selected during Equipment.
- Added a searchable, source-filtered inheritance catalogue:
  - 53 eligible Graft options.
  - 65 eligible Tool options.
- The selected inheritance is included in Creator preview, portable JSON and Charsheet transfer.
- Grafts populate the Charsheet augmentation area.
- Tools populate the Charsheet equipment inventory.
- Historical Human characters remain importable; they are prompted to complete the new required choice.

### Editorial Downloads

Installed byte-identical files from `VeilFarers_11.35_Editorial_Package.zip`:

- `VeilFarers_Corebook_11.35-PDF-Candidate.pdf`
- `VeilFarers_Keepers_Companion_11.33-PDF-Candidate.pdf`
- `VeilFarers_Rust_and_Steel_11.33-PDF-Candidate.pdf`
- `VeilFarers_Alien_Species_11.33-PDF-Candidate.pdf`

The fillable character sheet remains available.

Downloads manifests now contain the real filenames, byte sizes and SHA-256 hashes.

### Product assessment

Added `PRODUCT_REVIEW_v59.69.md`, a pre-release product and audience assessment covering:

- player appeal;
- strongest product propositions;
- onboarding and navigation friction;
- editorial presentation;
- Creator, Charsheet, Player Tool and Keeper Tool;
- release-readiness priorities.

## Explicitly unchanged

- The supplied editorial PDFs.
- Editorial Massive wording.
- Portal Massive implementation.
- Player Tool and Keeper Tool behavior.
- 3D dice renderer and all protected assets.
- Firebase, Netlify Identity, table APIs and Firestore contracts.
- Canonical class, Domain, equipment and advancement behavior outside the Human addition.
- White Stone, VeilFarers Blue and v59.68 token-state corrections.

## Important source-of-truth note

The portal JSON corpus remains the established normalized portal baseline plus the approved Human 11.35 addition. The historical `data/` folder bundled inside the editorial package was not copied over the portal because it predates multiple approved portal/system changes.

The editorial PDFs are the current downloadable books. A broader book-to-JSON regeneration should be performed only as a controlled migration, not by replacing the portal data folder wholesale.

## Deploy

1. Replace the repository contents with the contents of `VeilFarers_Portal_v59.69.zip`.
2. Commit and push to a test branch.
3. Let Netlify create a Deploy Preview.
4. Open `/data/deploy-version.json` and confirm `v59.69`.
5. Verify Downloads.
6. Complete both Human inheritance paths in Creator.
7. Transfer each test character to Charsheet and Player Tool.

No environment-variable, Firebase or Firestore Rules change is required.

## Priority acceptance tests

### Human — The Graft

1. Choose Human.
2. Choose The Graft.
3. In Equipment, select a Common graft.
4. Confirm it reports 0 Augment Slots and no drawback.
5. Transfer to Charsheet.
6. Confirm the augmentation appears and Human capacity includes +2.

Repeat with a Military graft and confirm 1 Augment Slot.

### Human — The Tool

1. Choose Human.
2. Choose The Tool.
3. Filter by weapon, armor and gear.
4. Select an Experimental TT3 item worth 9 Cr.
5. Confirm it does not consume the starting weapon or armor budget.
6. Transfer to Charsheet and confirm it appears in equipment inventory.

### Downloads

Confirm all five download cards resolve and the four editorial PDFs match their manifest hashes.

## Rollback

Redeploy `VeilFarers_Portal_v59.68.zip`.

Rollback removes the Human inheritance workflow and restores the previous PDF download line. No database rollback is required.
