# VeilFarers Portal v59.54 — Player Tool, Vault and Creator Import Hotfix

## Scope

Hotfix built directly from the user-revised v59.53 package. The revised Downloads manifest and all five included PDF files are preserved byte-for-byte.

## Changes

- Fixed Player Tool startup crash: `ReferenceError: Cannot access 'character' before initialization`.
- Removed the active Character ID as an implicit fallback during new-character ID allocation.
- New Creator builds and legacy JSON imports now receive a new `VF-######` instead of replacing the active Vault character.
- Existing imports with a valid permanent ID continue to update that exact character.
- Preserved Ailuran Sub-Strain during import from Creator state, Player Tool records and Charsheet fields, including `ailuran_variant`.
- Added compatibility aliases for Shroud/Surge legacy Sub-Strain values and the historical `Ailurean` spelling, including canonical-style ancestry references.
- Registered imports open directly on Creator Step 9 without being blocked by forward-step validation.
- Retained the v59.53 multi-character Vault with one active character and runtime-preserving Player Tool updates.

## Downloads retained

The package keeps the revised `/download/downloads.json` and these exact files:

- `VeilFarers_Corebook_11.31-PDF-Candidate.pdf`
- `VeilFarers_Keepers_Companion_11.3-PDF-Candidate.pdf`
- `VeilFarers_Rust_and_Steel_11.3-PDF-Candidate.pdf`
- `VeilFarers_Alien_Species_11.3-PDF-Candidate.pdf`
- `veilfarers_charsheet_fillable.pdf`

## Validation

- JavaScript syntax checks for modified runtime files.
- Creator inline-script syntax check.
- JSON parsing for portal, rules and download manifests.
- Clean `npm ci` through `registry.npmjs.org`.
- Registry fixture proving an active `VF-000111` remains while a new import receives `VF-000222`.
- Ailuran import fixtures proving Shroud-Strain and Surge-Strain survive legacy Sheet and Player formats.
- Identity fixtures proving `Ailurean`, `Ailuran` and canonical-style ancestry references resolve to the current Ailuran record.
- Byte-for-byte hash comparison of the revised Downloads directory before and after the hotfix.
- Protected 3D dice files were not edited.

## Live acceptance still required

Test in a Deploy Preview with an authenticated account:

1. Open Player Tool and confirm it renders without the `character` initialization error.
2. Create two new characters and confirm both remain in Vault with different IDs.
3. Import one old JSON without a permanent ID and confirm it is added as a new Vault record.
4. Reimport a JSON with an existing `VF-######` and confirm only that record is updated.
5. Import both Ailuran Sub-Strains and confirm Creator opens Step 9 with the correct variant.
6. Verify the revised Downloads page and all five PDF links.
