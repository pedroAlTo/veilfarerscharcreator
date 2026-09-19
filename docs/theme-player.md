# VeilFarers theme player

The author supplied `Fraggle Ensemble (6).mp3` on 14 September 2026 as the VeilFarers theme. The same compact player now appears on all 20 first-party HTML pages, including the homepage, all books, Behind the Veil, Downloads and the tools. It occupies the former bottom-right compatibility-badge position. Existing floating compatibility badges move into their page footer, retaining their link and attribution.

## Audio and lyrics

- Public audio: `public/assets/audio/veilfarers-theme-843a7766.mp3`.
- Duration: 294.792 seconds (4:55 displayed).
- Source and published bytes are identical. SHA-256: `f3a62a7cc503bbac9a8178f9cdf693c4b9d30bcfacf21b14cff94fad3ab0afab`.
- The supplied MP3 metadata, including its provenance information, is retained.
- Lyrics come from the MP3's embedded English lyric tag, which includes the bridges added after the conversation's poem. Spelling and punctuation are normalized for display. The 14 September copy review corrects “It lights bright, immense.” to “It shines bright, immense.” and adds introductory punctuation after “A light” and “I can almost hear it now”. All 49 cue boundaries and every word timestamp remain unchanged.
- The performed sequence was transcribed locally with faster-whisper small.en and checked with medium.en for the final chorus. Forced word alignment supplies approximate word timestamps. No audio was sent to a transcription service. Local transcription models and Python packages are ignored development tools, not production dependencies.
- The performance repeats “No one dances”. The chorus transcription differs from the unsynchronised tag: the tag's universe-answer phrases were not detected by either model and are not displayed as if sung. The timed performance contains 49 cues, including the concluding repeated “Together”. Timings remain editable in `public/theme-lyrics.mjs` for any future listening correction.

## Presentation and behaviour

The dock has play/pause, an expandable seek/volume/mute panel, and a dedicated floating-lyrics toggle. It uses the site's dark panels, fine gold border, serif lyrics and restrained light. Lyrics begin beside the player, illuminate word by word against `audio.currentTime`, rise and fade away. At most two verses may coexist, with a 6px gap and tighter letter, word and line spacing. A verse rises 18px while being sung and at most another 19.2px during its 1.2-second fade (previously a 5.5-second tail and roughly 237px of travel). Positions still account for actual line height so fast passages do not overlap. The overlay does not intercept clicks. Reduced motion keeps a single stationary verse with a 0.65-second fade and no heartbeat animation.

Audio does not load or play for a new visitor until requested. Per-tab session storage remembers position, volume, mute, lyric visibility and the user's playback choice. A navigation restores the saved position and attempts to resume only an already requested performance. This is a multipage site, so navigation can cause a brief interruption; browsers that require a fresh gesture present “Press play to continue the theme” and keep the saved position. Playback cannot be guaranteed uninterrupted across full document loads.

Playback errors have a retry path. Keyboard focus, native labelled sliders, mute and OS media controls are supported. Hidden tabs stop lyric rendering while music may continue. Different tabs coordinate playback to avoid two copies of the theme. Shadow DOM isolates the component from the different book and tool styles. On mobile deploy previews, the player reserves space above the visible Netlify review toolbar; production retains the original corner position. The player is omitted from printing. There is no new third-party runtime or telemetry.

## Validation

- 75 existing and new Node checks pass (52 MJS, 23 MTS).
- The music-specific browser suite checks real MP3 decoding, first-visit silence, lyric timing, rise/fade, instrumental gaps, pause, seeking, volume/mute, persistence, gesture-required resume, responsive bounds, non-overlapping verses, reduced motion and the shared component across the public routes.
- Initial player browser run: 81 assertions at 1440, 900 and 390 pixels. The compact-lyrics revision passes 90 local browser assertions, including early disappearance, shorter travel and tighter typography, plus the five music-specific Node tests.
- A range-capable local HTTP server is needed for realistic seeking. Python's basic `http.server` on port 8892 reports an empty seekable range in Chromium for this MP3; local music QA therefore uses the task's range-capable preview on port 8893. Netlify byte-range support is verified separately during publication.
- Screenshots: `output/theme-player/` (local QA artifacts, not published).
- Deploy verification reports 173 valid asset references and no errors or warnings.

Run `node scripts/check-theme-player.cjs` with `PLAYWRIGHT_MODULE` pointing to the available Playwright installation and `QA_BASE` set to the preview origin.

## Bass-reactive particle heart — 19 September 2026

When playback starts, a sparse suggestion of an anatomical heart appears above the dock. Twenty-nine spatial landmarks (24 increased by 20%, rounded to the nearest point) describe an oblique ventricular volume, its offset apex, the atrial shoulder and interrupted great vessels; approximately half are visible at a time through slow staggered fades. Subpixel-to-one-pixel muted gold and blue points drift gently without connecting lines, trails or bloom. Each bass onset raises particle opacity and lightens its color, then an exponential release lowers the intensity until the next onset. Bass-driven expansion remains limited to 2.5%, and the spectral bars have been removed. The form is deliberately incomplete. Optional lyrics overlap it and remain the foreground focus with their existing short travel and fade.

`theme-heart.mjs` uses the track's MediaElementAudioSource and an AnalyserNode (FFT 2048). Energy in 30–160 Hz and its onset envelope control the contraction/expansion; there is no independent metronome or canned heartbeat. The native audio is rerouted only after AudioContext is running, and a later user gesture can retry a pending automatic resume. One source is reused across pause/play. Web Audio unavailability leaves native playback functional.

The shared player's 30 fps loop drives the particles. Pause/end hide the heart, mute removes audio-driven motion, hidden tabs stop rendering, and element removal disconnects and closes the audio context. Reduced motion shows a stationary point cloud. The layer ignores pointer events, reserves no document space, and dims behind expanded playback controls. No microphone access, additional media, or external 3D runtime is used.

Validation: eight focused Node tests cover lyrics, page coverage, Overkill boundaries and bass-band isolation. The existing 90 music-player browser checks pass locally. The journal's browser suite passes 67 assertions at 1440/900/390 px, including static content without JavaScript. The particle-heart suite passes 34 assertions at desktop/mobile sizes, including real analyser input, single audio routing, pause/resume, mute, lyrics overlap, reduced motion and fallback without Web Audio.

The same three browser suites also pass on the deployed Netlify preview: 67 journal checks, 34 particle-heart checks and 90 player regression checks. Browser checks wait for image decoding and actual audio playback before evaluating the rendered output.

The sparse anatomical revision adds rendered-pixel coverage and peak-opacity checks to the existing desktop/mobile playback suite. The same renderer is loaded by all 20 pages through the shared player.

## Idle edge tab — 20 September 2026

When idle or paused, the common player presents only a 40px tab flush with the right edge. Activating it reveals the transport controls and moves keyboard focus to Play without fetching audio or starting playback. Playback keeps the full dock visible. Pause/end restore the tab; Escape and outside clicks also fold a manually opened idle player. Focus returns to the tab when a focused control is hidden. Floating lyrics clear on folding, and reduced motion disables drawer transitions. The mobile Netlify toolbar inset remains in effect.

The updated player suite passes 114 local assertions across desktop, tablet and mobile, including tab position, keyboard opening and focus restoration, no fetch on opening, outside dismissal, automatic folding on pause and navigation preferences. The particle suite passes 40 local assertions, including two controlled low-frequency attacks with the anatomical pose held fixed: brightness rises on each attack and decays between them. Eight focused Node tests pass. Audio, lyrics, timing, track data and opt-in playback behavior are unchanged.
