# VeilFarers Portal v59.43 — Armor, Augments, Drones and Protected Tables

## PR title

`Deploy VeilFarers Portal v59.43`

## Suggested branch

`release/portal-v59.43-drones-signal-protected-tables`

## Intent

This release extends the live Player/Keeper workflow without changing the v59.25 lock-on presentation. It makes armor and augmentation state mechanically useful, enables drones as first-class Player Tool tabs, synchronizes drone signal with Keeper Tool, and upgrades shared-table password handling.

## Main changes

### Player Tool — active armor

- Activating armor applies its canonical Major/Severe thresholds.
- Armor Slots refill when a suit becomes active and use the suit's real slot count rather than a fixed six-slot display.
- Supported armor features now affect the Player Tool profile:
  - Flexible, Heavy, Very Heavy and Massive adjust effective Evasion.
  - Assault adds its Automatic-weapon attack modifier.
  - Servo-Assisted, Low-Profile, Silent, Tactical and Intimidating are surfaced as contextual Trait modifiers.
- Removing active armor clears its active slot pool.

### Player Tool — augmentation resources

- Augmentations with Activation Stress mark the correct amount of Stress when activated.
- Text-defined Hope, Effort, Resolve or Stress costs are parsed and paid automatically.
- A Hope activation cost becomes Effort for a Sleeping character.
- Activation is blocked when the relevant track cannot pay the cost.
- The activation button displays the resource cost before use.

### Character and drone starting state

- Newly created/imported characters begin with full HP, 2 Hope/Effort and full Resolve.
- Newly created drones begin with full frame HP and full Armor Slots.
- Drones have no Hope, Effort, Resolve or Stress tracks.

### Drone tabs

- The `+` menu now creates either a Character or Drone tab.
- Drone frames and installation options read from the shared canonical drone-grade and drone-module collections.
- The drone sheet includes:
  - frame/grade selector;
  - operator assignment;
  - HP, Armor, Evasion and thresholds;
  - module slot accounting;
  - compatible module installation/removal;
  - operator-paid module actions;
  - loaded protocol for Lost signal;
  - notes/cargo.
- A drone does not receive its own Spotlight. Its sheet shows the current character Spotlight and uses the existing lantern component to change it.

### Signal strength

- Drone Signal uses the canonical states Stable, Unstable and Lost.
- Players can modify Signal manually in the drone sheet.
- Range selection supplies a rules-aligned default state but remains manually overridable.
- Keeper Tool lists connected drones and can change their Signal state in the shared table data.

### Shared tables and passwords

- Public table discovery is enabled unless `FIREBASE_PUBLIC_TABLE_DIRECTORY=false` is set.
- Player and Keeper table directories label each session as OPEN or CLOSED.
- Player Tool warns before creating an open table without a password.
- New passwords are stored as salted PBKDF2-SHA256 records with 150,000 iterations.
- Existing legacy SHA-256 table records remain readable.
- Adding/changing a password is available only after successfully connecting to the table.

## Files intentionally changed

- `player-tool.html`
- `keeper-tool.html`
- `veilfarers-import.js`
- `netlify/functions/firebase-config.mts`
- `local/start-local.mjs`
- `local/.env.local.example`
- `LOCAL_TESTING.md`
- `data/changelog.json`
- `START_HERE.txt`
- `SECURITY_TABLES_v59.43.md`

## Review checklist

1. Create a Character tab and confirm full HP, 2 Hope/Effort and full Resolve.
2. Activate Mesh Armor and confirm thresholds 5/10 and four Armor Slots.
3. Activate a Stress-cost augmentation and confirm Stress increases.
4. On a Sleeping character, activate a custom Hope-cost augmentation and confirm Effort is spent.
5. Create a Drone tab and confirm Common Drone defaults, full HP, no character resource tracks and two module slots.
6. Assign an operator, install Compliance Taser, use it and confirm the operator marks 1 Stress.
7. Change Stable/Unstable/Lost in Player Tool and Keeper Tool and confirm synchronization.
8. Confirm drone tabs do not display or own a Spotlight lantern; the drone sheet controls the current character Spotlight.
9. Confirm table directories show OPEN/CLOSED states.
10. Join a closed table, then add/change its password from the connected-table controls.

## Security note

The client-side password hash prevents plaintext password storage and provides a practical entry gate. It does not create server-enforced membership. Production privacy still requires Firestore Security Rules, authenticated membership and preferably App Check.

## Rollback

Redeploy v59.42. Existing character records remain compatible. Drone and PBKDF2 fields are additive; legacy password records continue to work after rollback.
