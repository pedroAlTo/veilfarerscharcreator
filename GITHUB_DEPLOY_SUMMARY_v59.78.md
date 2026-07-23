# VeilFarers Portal v59.78 — GitHub deploy summary

Release date: 2026-07-23  
Base: v59.77

## Summary

- Replaced the Keeper Tool runtime *Hearts in the Void* template with the consolidated Corebook 11.35 / Keeper's Companion 11.33 revision.
- Added 11 linked playable stages, ten canonical Sleeping pregenerates, narrative-only major NPCs, corrected clocks and the current two-phase Weaver Queen.
- Bundled the complete Markdown adventure and all 17 active source blocks.
- Ensured both Keeper Tool campaign-save paths preserve the current scene collection and its edits.
- Renamed Keeper section exports to `veilfarers_*` while retaining read-only compatibility with historical `voidlight_*` imports.
- Preserved “I Need an Idea!” as a terminal backup, the Scene 8 standoff without a roll and “The Ship That Learns” as an optional recommended ending.
- Removed roughly 1.38 seconds of leading near-silence from `assets/dados_1.mp3` without changing its playback lifecycle; the Player Tool adds `?v=59.78` to bypass the immutable cache of the older audio.
- Added a prominent Inventory active-character panel and blocked transfers that could target the wrong Player Tool or Charsheet character.

## Deploy authority

- Package version: `59.78.0`
- Release header: `X-VeilFarers-Release: v59.78`
- CSP profile: `wasm-3d-dice-v2`
- Required script source: `'wasm-unsafe-eval'`
- Deploy the ZIP contents directly at the site root.

## Key review points

1. `keeper-tool.html` loads `hearts-in-the-void-template.js` before `app.js`.
2. Keeper Tool Hearts scenes open the matching Markdown chapters under `/adventures/hearts-in-the-void/`.
3. `Core Overload` is six segments and Korren is not labelled as an automatic traitor in the active template.
4. Inventory displays the active name/ID and never falls back to the first Player Tool character.
5. The trimmed MP3 begins with the audible roll while existing interruption cleanup remains unchanged.

## Deploy Preview checklist

1. Verify `/data/deploy-version.json` and headers report v59.78.
2. Load Hearts in the Void and inspect its 11 stages, ten pregenerates, NPCs and Queen phases.
3. Confirm Full adventure and chapter links resolve.
4. Roll with a Sleeping pregen in Spotlight and verify Effort Track behavior.
5. Test active-character changes and all three Inventory transfer destinations.
6. Test die audio start/cancellation and mobile 3D Shake to Roll.
7. Re-test authenticated Keeper ↔ Player synchronization.

Live Netlify/Firebase behavior, physical motion sensors and final audio feel remain Deploy Preview acceptance items.
