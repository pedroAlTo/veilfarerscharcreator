# VeilFarers v59.54 — Identity and Character Vault Safety Notes

## Character identity rule

A new character or a legacy import without a valid permanent ID must never inherit the currently active Character ID. v59.54 removes that implicit fallback.

- Valid `VF-######` supplied by the payload: update that character.
- Missing, pending or legacy local ID: allocate a new permanent ID.
- Active Vault selection: presentation/runtime selection only; never an identity source for a different build.

This prevents one imported or newly created character from overwriting another account-owned Vault record.

## Vault model retained

- One account may own multiple character records.
- Exactly one character may be active at a time.
- Setting a character active does not delete, merge or replace other records.
- Player Tool deduplication remains keyed by permanent Character ID, with legacy fingerprint migration only for a pending copy of the same build.

## Import boundary

Creator is the canonical migration surface for old JSON. Imported payloads are normalized before registry storage. Ailuran Sub-Strain is recognized from Creator, Player and Sheet representations, including the historical `ailuran_variant` field.

## Firestore

No Firestore Rules behavior changed in this hotfix. `firestore_v59.54.rules` is a retained copy of the v59.53 baseline for coordinated deployment only. Rules remain project-wide and must not be changed merely to test this UI/runtime hotfix.
