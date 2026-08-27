# Stellar Encyclopedia - rules canon 12.05 update

Two files. Same paths as phase 1.

    public/reference-data/encyclopedia-quick.json
    public/reference-data/encyclopedia-archive.json

Nothing else changes. `encyclopedia.html`, `portal.js` and `netlify.toml` from
the private-mode drop stay as they are; both files are already gated behind
Role `friend`/`admin` and `X-Robots-Tag: noindex, nofollow, noarchive`.

## What was updated in the data

- `corebook-ship-weapons-against-personnel` - rewritten to the new cross-scale
  procedure (naval damage x5 after Mount Rating, applied through halved personal
  Damage Thresholds rounded up, HP loss continues past 0, with the 0 = Dying and
  -1 = killed distinction). The "Try It" calculator on the page was reprogrammed
  earlier for the same rule and is already correct.
- `corebook-damage-thresholds` - notes the new Natural Thresholds default:
  Major 2 / Severe 4 for anyone wearing no armor.
- Three new entries with rule cards, aliases and cross-links:
  - `corebook-chitin-plating` (Kryllian): unarmored 4 / 6.
  - `corebook-crystalline-carapace` (Rift Spinner): unarmored 4 / 6.
  - `corebook-alloy-chassis` (Synthetic): unarmored 4 / 6.
- The three ancestry entries link back to their new gift.

Everything else (aliases, sources, related terms, favorites) is preserved.

## Verification

- Sign in as friend, open `/encyclopedia.html`, search "ship weapons", "chitin",
  "crystalline", "alloy chassis": all five appear.
- The Try It calculator for "Ship Weapons Against Personnel" already implements
  the x5 procedure - re-run it with 11 dmg / MR x1 / shield 10 / armor 9-17 /
  8 HP and it should report 2 HP remaining (Severe + 3 Overkill = 6 HP).
