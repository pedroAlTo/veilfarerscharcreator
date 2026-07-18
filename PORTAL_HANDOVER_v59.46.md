# VeilFarers Portal v59.46 — Technical Handover

## Identity architecture
`character-registry.js` maintains canonical records keyed by visible, read-only `characterId`.

- Final format: `VF-######`
- Offline fallback: `PENDING-*`
- Local registry: `veilfarers.characters.registry.v1`
- Current selection: `veilfarers.character.currentId.v1`
- Cross-tab channel: `veilfarers-character-sync-v1`
- Firestore documents: `characters/{characterId}`
- Counter: `systemCounters/characters`

`netlify/functions/allocate-character-id.mts` atomically increments the counter and reserves the character document. Configure `FIREBASE_SERVICE_ACCOUNT_JSON` in Netlify.

## Level Up
Route: `/creator.html#level-up`

The implementation follows Chapter 12:
- Levels 1–10; Tiers 1–3.
- Two Advancement Slots per level.
- Tier Achievements at Levels 2, 5, and 8.
- Proficiency cap 6.
- Trait increase once per Trait per Tier.
- Multiclass from Tier 2, once.
- Subclass Specialization then Mastery.
- Tempered Resolve at Tier 3 for Sleeping characters.
- Resolve baseline 2/4/6 and hard ceiling 10.

## Synchronization
Level Up updates Creator state and converts it through `sheet-bridge.js`. `character-sync-adapter.js` writes the same Charsheet payload to Charsheet storage and Player Tool storage, then refreshes Player/Keeper surfaces when an external update arrives.

## Frozen behavior
The exact v59.25 Player Tool dice renderer and protected roll functions remain untouched.
