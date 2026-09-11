> Current release: the survey is preserved but hidden behind Coming soon in notice 05. Enable it using `docs/CTA_LAUNCH.md`. The historical preparation notes below describe the dormant survey itself.

# Ancestry mini-expansion campaign

Prepared 9 September 2026 from local main `a0fd39c`, in an isolated working copy on `feature/ancestry-mini-survey`. The GitHub remote required unavailable credentials, so its current head could not be compared. The original OneDrive repository and earlier cinematic working copy were not edited.

## Preview and current state

- Home `/#minis` opens the campaign directly.
- The same envelope contains Rust & Steel, beta recruitment and the minis. Normal initial opening now puts Books 12.06 first. Closing saves a notice without automatically opening another. Arrows skip deleted notices.
- Alien Species has a campaign introduction at `/books/alien-archives.html#mini-expansions` linking back to the survey.
- All nine existing ancestries are included as text-only cards. No raster artwork was created or reused for the campaign; its receiver is CSS. The copy makes no commitment to hand-drawn covers or interior artwork.
- The radar's nine signals light up only when the sweep reaches their position, then fade to darkness. Sweep and echoes share a 16-second cycle; reduced-motion mode shows static signals.
- **Draft only:** the opening date is intentionally unset. Visitors can explore choices, but submission is disabled and the server rejects votes.
- No new poll is published, scheduled or activated by preparing this package.

## Activate after confirming the start

The only campaign configuration is `public/mini-campaign.mjs`. Set `campaign.opensAt` to the approved ISO timestamp with an explicit timezone, preferably UTC. The server calculates exactly seven days from that timestamp. Keep it null until the launch is agreed. Bump the query version for this module in `mini-survey.mjs`, and the script query in `index.html`, when changing it for launch.

The UI requests the authoritative status from `/api/ancestry-vote` for scheduled/live campaigns. The server checks its own time on each submission, including after reading the request. A missing or invalid configuration fails closed. There are no timers or scheduler jobs to create for closing the vote.

Netlify must deploy the repository with `public/` as its publish directory and `netlify/functions/` as its functions directory, as it already does. Uploading only `public/` to a static host cannot run the vote API.

The function reuses the existing Functions-only `FIREBASE_SERVICE_ACCOUNT_JSON` and project configuration. No secret is included in this package. Existing deny-by-default Firestore rules already prevent direct public access to the new collection; no public write permissions should be added.

Before opening the real campaign, test a disposable campaign ID and a confirmed future/open window in a deploy preview. Verify one actual increment with the site's server credentials, and the same request being rejected once the test window closes. This live integration cannot be verified from this local copy without those deployment credentials. Do not send preview test votes into the production campaign ID.

## Counting and privacy

Only aggregate `votes` counters are written to:

`miniPolls/<campaign-id>/totals/<ancestry-id>`

The Firestore commit uses a write with an empty update mask and an atomic increment, creating the first counter without overwriting existing counts. The operation follows the [Firestore Write API](https://firebase.google.com/docs/firestore/reference/rest/v1/Write). There are no individual ballot documents, names, emails, cookies, user IDs, fingerprints or IP-based deduplication. Request origin and content format are checked, and unknown options or extra fields are rejected. Ordinary hosting logs still apply. No survey analytics events are sent.

Accidental double clicks are blocked while a submission is in progress; a successful vote is remembered only in the current page's memory. Refreshing can allow another vote, deliberately consistent with the community honour-system approach. There are no automatic POST retries. A timeout explicitly warns that the vote might have reached the server.

Separate local/session preferences store dismissal of the notice, not voting activity. Deleting a notice hides it on that browser; explicitly reopening `/#minis` opts back in. Controls remain usable when browser storage is blocked.

## After the week

Read the aggregate documents in the private Firebase console and order the nine candidates by votes. An ancestry without a document has zero votes. The public API never returns counts or the ranking.

Reveal only the first three, with agreed release dates one week apart. Upload the finished PDFs when ready, then prepare the Alien Species release cards with text-based covers and the Decoding animation. Artwork is not required for the current presentation. The next batch is revealed after those three are available. The release cards, file publishing and automated batch reveal are a subsequent content stage, not implemented or falsely populated here. Ties and release dates need an editorial decision before the first reveal.

## Checks and known baseline issue

- Node suite: 53 tests pass, including server-side window boundaries, allowed options, privacy of the store inputs, invalid requests and failure reporting.
- Browser QA: desktop and 320/390/768px layouts; single-selection submission with a mocked API; saving/deleting/reopening; carousel navigation; reduced motion; keyboard focus; blocked storage; failure feedback; Alien Species entry link; WebKit mobile rendering. No production votes are sent by QA.
- Browser captures are kept outside the repository. WebKit on Windows exercises Safari's engine, not a physical iPhone.
- `scripts/check-mini-radar-ui.cjs` checks all nine radar contacts over two rotations, echo fading, reduced motion and reopening in Edge and WebKit.
- `verify-deploy.mjs` has one pre-existing error: it interprets the relative CSS URL `assets/themes/vfDiscarded/diffuse-light.png` in `public/assets/3d-dice/vf-dice3d.css` as root-relative. The actual file exists at `public/assets/3d-dice/assets/themes/vfDiscarded/diffuse-light.png`. This is a verifier path-resolution issue in the starting commit, unrelated to this CTA; neither the dice CSS nor verifier was changed.

Run `node --test "tests/*.mjs" "tests/*.mts"` with Node 24. For browser checks, install Playwright outside the shipped assets, set `VF_PLAYWRIGHT_PATH` if needed, run a local HTTP server on port 8890, then `node scripts/check-mini-survey-ui.cjs`. Tests use installed Edge by default and a Playwright WebKit runtime. `VF_PREVIEW_URL`, `VF_BROWSER_CHANNEL` and `VF_QA_OUTPUT` override the defaults.

## Applying the ZIP

The ZIP is an update package, not a standalone site. Overlay its folders onto a copy of the repository based on `a0fd39c`, retaining all existing files. If GitHub has newer changes to the same files, merge the edits rather than overwrite those files. The package includes every new/modified file needed for this campaign, tests and this handover. It contains no `.git`, browser binaries, credentials or existing book PDFs.

Suggested commit title: `Prepare the nine-ancestry mini-expansion survey CTA`
