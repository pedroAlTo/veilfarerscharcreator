# VeilFarers theme player

The author supplied `Fraggle Ensemble (6).mp3` on 14 September 2026 as the VeilFarers theme. The same compact player now appears on all 18 first-party HTML pages, including the homepage, all books, Downloads and the tools. It occupies the former bottom-right compatibility-badge position. Existing floating compatibility badges move into their page footer, retaining their link and attribution.

## Audio and lyrics

- Public audio: `public/assets/audio/veilfarers-theme-843a7766.mp3`.
- Duration: 294.792 seconds (4:55 displayed).
- Source and published bytes are identical. SHA-256: `f3a62a7cc503bbac9a8178f9cdf693c4b9d30bcfacf21b14cff94fad3ab0afab`.
- The supplied MP3 metadata, including its provenance information, is retained.
- Lyrics come from the MP3's embedded English lyric tag, which includes the bridges added after the conversation's poem. Spelling and punctuation are normalized for display.
- The performed sequence was transcribed locally with faster-whisper small.en and checked with medium.en for the final chorus. Forced word alignment supplies approximate word timestamps. No audio was sent to a transcription service. Local transcription models and Python packages are ignored development tools, not production dependencies.
- The performance repeats “No one dances”. The chorus transcription differs from the unsynchronised tag: the tag's universe-answer phrases were not detected by either model and are not displayed as if sung. The timed performance contains 49 cues, including the concluding repeated “Together”. Timings remain editable in `public/theme-lyrics.mjs` for any future listening correction.

## Presentation and behaviour

The dock has play/pause, an expandable seek/volume/mute panel, and a dedicated floating-lyrics toggle. It uses the site's dark panels, fine gold border, serif lyrics and restrained light. Lyrics begin beside the player, illuminate word by word against `audio.currentTime`, rise and fade away. Up to three departing verses may coexist; their positions account for actual line height so fast passages do not overlap. The overlay does not intercept clicks. Reduced motion keeps a single stationary verse with no heartbeat animation.

Audio does not load or play for a new visitor until requested. Per-tab session storage remembers position, volume, mute, lyric visibility and the user's playback choice. A navigation restores the saved position and attempts to resume only an already requested performance. This is a multipage site, so navigation can cause a brief interruption; browsers that require a fresh gesture present “Press play to continue the theme” and keep the saved position. Playback cannot be guaranteed uninterrupted across full document loads.

Playback errors have a retry path. Keyboard focus, native labelled sliders, mute and OS media controls are supported. Hidden tabs stop lyric rendering while music may continue. Different tabs coordinate playback to avoid two copies of the theme. Shadow DOM isolates the component from the different book and tool styles. On mobile deploy previews, the player reserves space above the visible Netlify review toolbar; production retains the original corner position. The player is omitted from printing. There is no new third-party runtime or telemetry.

## Validation

- 75 existing and new Node checks pass (52 MJS, 23 MTS).
- The music-specific browser suite checks real MP3 decoding, first-visit silence, lyric timing, rise/fade, instrumental gaps, pause, seeking, volume/mute, persistence, gesture-required resume, responsive bounds, non-overlapping verses, reduced motion and the shared component across the public routes.
- Local browser run: 81 assertions at 1440, 900 and 390 pixels.
- A range-capable local HTTP server is needed for realistic seeking. Python's basic `http.server` on port 8892 reports an empty seekable range in Chromium for this MP3; local music QA therefore uses the task's range-capable preview on port 8893. Netlify byte-range support is verified separately during publication.
- Screenshots: `output/theme-player/` (local QA artifacts, not published).
- Deploy verification reports 173 valid asset references and no errors or warnings.

Run `node scripts/check-theme-player.cjs` with `PLAYWRIGHT_MODULE` pointing to the available Playwright installation and `QA_BASE` set to the preview origin.
