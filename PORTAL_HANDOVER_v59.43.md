# VeilFarers Portal v59.43 — Technical Handover

## Release scope

v59.43 implements four connected systems:

1. armor-derived Player Tool settings and modifiers;
2. resource-aware augmentation/module activation;
3. first-class drone tabs and synchronized signal;
4. OPEN/CLOSED shared-table discovery with non-plaintext password records.

## Canonical data sources

The implementation uses existing deployed collections:

- `/rules-data/core/armor.json`
- `/rules-data/rust-and-steel/armor.json`
- `/rules-data/core/augments.json`
- `/rules-data/rust-and-steel/augments.json`
- `/rules-data/core/drone-grades.json`
- `/rules-data/rust-and-steel/drone-grades.json`
- `/rules-data/core/drone-modules.json`
- `/rules-data/features-registry.json`

No new drone grades, modules, signal states or armor features were invented.

## Player Tool state model

### Character defaults

```js
hp: { current: 6, max: 6 }
hope: { current: 2, max: 5 }
effort: { current: 2, max: 6 }
resolve: { current: 2, max: 2 }
```

Imported creator/fillable data also initializes HP at maximum, Hope/Effort at 2 and Resolve at maximum.

### Drone defaults

`EMPTY_DRONE` resolves the canonical Common Drone frame and initializes:

- `entityType: "drone"`
- full `hp.current`
- full `shields` from frame Armor
- `armorMax`
- `thresholds`
- `evasion`
- `moduleSlots`
- `signalState: "stable"`
- `signalRange: "Close"`
- `linkMode: "Direct RF Link"`

The normalized drone record explicitly omits Hope, Effort, Resolve, Stress and augment collections.

## Armor implementation

`armorProfile()` resolves supported feature rules and returns:

- `evasionModifier`
- `attackBonus`
- contextual `traitModifiers`
- feature entries

`setActiveArmor()` synchronizes:

- active armor identity;
- thresholds;
- Armor Slot maximum;
- current Armor Slots, refilled to maximum.

`weaponAttackProfile()` includes the active armor Assault modifier when the selected weapon has Automatic.

Context-dependent Trait modifiers are displayed with their qualifying context rather than being added to every roll indiscriminately.

## Augmentation activation

`augmentActivationCost()` prioritizes structured `activationStress`. If absent, it parses resource language from the item text.

Supported resources:

- Stress — marked;
- Hope — spent;
- Effort — spent;
- Resolve — spent.

For Sleeping characters, a parsed Hope cost is converted to Effort. Activation is blocked when payment is impossible. Deactivation is free unless a future canonical record explicitly states otherwise.

## Drone installations and operator costs

Drone module access follows the frame access matrix already encoded by the project:

- Common Drone / Industrial Hauler / Swarm Cell: Common modules;
- Military Drone / House Sentinel / War-Frame: Common and Military modules;
- Experimental Drone / Black-Site Chimera: Common, Military and Experimental modules.

Module slots are enforced. A module action that marks/spends a resource charges the assigned operator because drones have no character resource tracks.

## Spotlight

Drone tabs deliberately do not render a tab lantern and cannot be assigned Spotlight.

The drone sheet reuses the existing `Lantern` component to:

- display the current character Spotlight;
- select another connected local character;
- clear Spotlight.

Keeper Tool filters drone entities out of Party Status/Spotlight candidates while retaining their original shared-array indexes for stat synchronization.

## Signal synchronization

Drone records contain:

- `signalState`: `stable`, `unstable` or `lost`;
- `signalRange`;
- `linkMode`;
- `loadedProtocol`.

Player changes use the ordinary character-state synchronization. Keeper Tool updates the same drone entry inside the shared `characters` array.

Range supplies a default:

- Melee through Far: Stable;
- Very Far: Unstable;
- Beyond Very Far: Lost.

The state remains manually editable because interference, relays and the fiction can override range alone.

## Table directory and password schema

Table discovery is returned as enabled when:

```text
FIREBASE_PUBLIC_TABLE_DIRECTORY is unset or not equal to false
```

Set `FIREBASE_PUBLIC_TABLE_DIRECTORY=false` to disable discovery while retaining exact-name joins.

New password record:

```json
{
  "algorithm": "PBKDF2-SHA256",
  "iterations": 150000,
  "salt": "base64 random 16-byte salt",
  "hash": "base64 256-bit derived value"
}
```

The record is stored under `passAuth`; `passHash` is set to `null` when upgraded. Both Player and Keeper use the same base64 schema and remain compatible with legacy `passHash` values.

Password controls are rendered only after successful table connection. An open table can therefore be protected later, but an unauthenticated visitor cannot remotely replace a closed table's password through the UI.

## Security boundary

The session document and its password verifier currently live in a public Firestore collection. A determined attacker who can read that document can attempt offline password guesses. PBKDF2 substantially increases the cost and avoids plaintext storage, but this is not equivalent to server-side authorization.

Before describing cloud tables as private, implement:

- authenticated table membership;
- Firestore Security Rules enforcing membership;
- role checks for Keeper mutations;
- App Check;
- optional server-side password verification or invitation tokens.

## Compatibility and migration

- Existing character saves normalize without destructive migration.
- Existing `passHash` tables remain joinable.
- Changing a legacy password upgrades that table to `passAuth`.
- Existing tables without passwords remain OPEN.
- Drone fields are additive and ignored by older releases.

## Frozen area

The exact v59.25 lock-on renderer remains frozen. The complete `assets/3d-dice/` tree and the five protected roll/damage functions are byte/source-identical to v59.42.
