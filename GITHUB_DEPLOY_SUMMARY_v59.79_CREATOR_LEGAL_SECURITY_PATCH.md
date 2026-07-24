# GitHub deploy summary — v59.79 Creator, legal and WIP security patch

Apply this ZIP over the existing cumulative **v59.79 + Character Picker PATCH + Character Picker MENU FIX** deployment.

## What changes

- Character Creator: every numbered step can be opened from the side rail or top rail; Back remains available; Next still validates the current step.
- Experiences: `I need an idea!` produces six contextual prompts and fills only the first empty Experience when selected.
- Community artwork is mapped to the original 01–07 order explicitly.
- Adds bilingual legal/privacy/storage/terms/accessibility information for an individual established in Poland.
- Adds the official, unmodified Daggerheart-compatible community logo and exact DPCGL attribution.
- Removes runtime Google Fonts requests; existing font stacks fall back to local/system fonts.
- Adds a persistent legal footer to portal pages.
- Protects Player Tool and Keeper Tool as WIP using authenticated, email-bound, expiring and revocable invitation tokens.
- Requires a valid WIP grant for the shared table API.
- Adds stricter no-store headers for tools and APIs.

## Netlify variables required before testing

- `VF_WIP_ACCESS_SECRET`
- `VF_WIP_INVITES_JSON`

See `SECURITY_WIP_ACCESS_v59.79.md`.

## Deployment

1. Overlay every file in the patch ZIP at repository root.
2. Configure the two Netlify variables as secret/function-scoped values.
3. Generate at least one invitation with `node scripts/create-wip-invite.mjs`.
4. Deploy to a preview.
5. Run the acceptance checks in `VALIDATION_v59.79_CREATOR_LEGAL_SECURITY_PATCH.txt`.
6. Promote only after live Netlify Identity, Functions and Firebase tests pass.
