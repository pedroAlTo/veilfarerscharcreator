# VeilFarers Portal v59.46 — Deploy / PR Summary

## Scope
Canonical Level Up workflow and shared system-generated Character IDs.

## Changes
- Visible, non-editable `VF-######` ID in Creator, Charsheet, Player Tool, and Keeper Tool.
- Central ID allocation through `/api/allocate-character-id` using Firestore `systemCounters/characters`.
- Character registry stored locally and synchronized through Firestore and `BroadcastChannel`.
- Level Up implements Corebook two-slot advancement and Tier Achievements at Levels 2, 5, and 8.
- Advancement options: HP, Stress, Experiences, Trait, Evasion, Proficiency, Technology Access, Domain Power / Resolve, Multiclass, Subclass upgrade, and Tempered Resolve.
- Updated Charsheet payload propagates to Player Tool and Keeper Tool using the same Character ID.
- Existing consumed resources are preserved; permanent maxima and progression data change.

## Required Netlify secret
`FIREBASE_SERVICE_ACCOUNT_JSON` — full Firebase service-account JSON. Server-only; never expose or commit it.
