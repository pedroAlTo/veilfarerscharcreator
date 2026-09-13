# Alien archive and discovery validation

The nine Alien Species features now combine source-based illustrations, the existing ancestry artwork, a human mannerism table and a six-person confidential archive. Selection keeps the portrait, profile, source page and file readout together. Native links expose every record and table entry if JavaScript is unavailable. Animation is decorative and pauses offscreen, when the document is hidden, or under reduced motion.

First Crossing has a permanent entry before the homepage feature grid. The station telemetry sits beneath the selected sector's description; the station image and its coordinate system are unchanged.

Validated on 13 September 2026:

- All 68 Node tests pass. Existing homepage and Alien Species assertions reflect the expanded classes and the new starting route.
- Deployment verification resolves 170 asset references with no errors or warnings.
- `scripts/check-alien-discovery.cjs` passes 149 browser assertions at 1440, 900 and 390 px: six records, matching source links, selection and keyboard navigation, direct record URLs and status, plate viewer and focus restoration, non-repeating table draws, responsive layout, telemetry selection, first-viewport starter access, reduced motion, offscreen pause and no-JavaScript content. No page errors.
- Engineering's blue spark still fires on selection, fades, retriggers after another sector and stops under reduced motion on desktop and mobile.
- Desktop, tablet and mobile screenshots reviewed for the archive, terminal, station and homepage.

To run the browser check, make Playwright available via Node resolution or set `PLAYWRIGHT_MODULE` to its installed module path, then run `node scripts/check-alien-discovery.cjs`. It uses installed Microsoft Edge. The default site is `http://127.0.0.1:8892`; set `QA_BASE` to test another deployment.

Artwork sources and the final built-in ImageGen prompt set are documented in [alien-archive-art.md](alien-archive-art.md). Original PDF files are unchanged.
