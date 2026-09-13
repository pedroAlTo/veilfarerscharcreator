# Obsidian surveillance screen

Mode: built-in ImageGen image editing, using the original six-person contact sheet as an identity reference. The output is `public/assets/books/alien-schematics/npc-surveillance.webp`; the original studio portraits remain available in the repository. These are illustrative surveillance scenes, not additional canonical events in the NPC biographies. The profile text and PDF source links are unchanged.

The terminal uses three base inks: near-black green `#070c09`, mid phosphor `#758e76` and bright phosphor `#bed7b0`. An SVG display filter maps the image to those three tones. Static raster lines and a subtle edge vignette sit over the complete terminal; a slow 11-second refresh band pauses when the terminal is offscreen or the document is hidden. Reduced motion retains the static CRT texture without the moving band. Text remains selectable and normal links/keyboard navigation remain available.

## Final prompt

Use case: identity-preserve / style-transfer.
Asset: one replacement contact sheet for the six subject photographs in a fictional confidential computer archive.
Input image 1 is the identity and species reference. Preserve all six recognizable subjects IN EXACTLY THE SAME ORDER, but completely change the polished front-facing portrait staging into candid private-investigator surveillance images.
LAYOUT MUST BE PRECISE: landscape 1536x1024, exactly three equal 512x512 square cells across and two rows. NO gutters, frames, overlap, captions, timestamps, labels, UI, numbers, targeting graphics, extra panels or montage within a cell. Each cell is a separate SINGLE camera exposure. Website crops the cells separately.
CAMERA AND QUALITY: distant telephoto surveillance, not portraits. Medium-long or three-quarter-body shots taken secretly from 10–30 meters, candid imperfect framing, off-axis angles, partially obscured surroundings, strong grain, coarse 1980s CRT still-frame dithering, slightly missed focus and slight movement blur. Subjects occupy roughly 45–65 percent of their cell height with their full heads intact. Low information and low local detail: no visible pores, no crisp individual hairs, no polished micro-textures. People are not looking at the camera. Lived-in science-fiction environments, restrained cinematic setting. Obstructions at frame edges help tell the observation story but do not hide identifying anatomy.
TOP LEFT: same older silver-haired human woman Admiral Helena Vance with one cybernetic eye, walking through a docking corridor in a dark officer coat, photographed obliquely past a blurred metal doorway.
TOP MIDDLE: same pale luminous silver-haired Celestiari woman Luminara, caught in profile crossing a distant raised concourse, seen through the slats of a ventilation screen.
TOP RIGHT: same ancient patchwork-metal Synthetic NEXUS-Prime, three-quarter side view standing near an industrial terminal in a dim service bay, photographed from a partially open maintenance hatch.
BOTTOM LEFT: same older gray wolf-like Kryx Hunt-Master Grenn, upright bipedal body in a worn jacket, moving past freight stacks, caught behind a blurry railing.
BOTTOM MIDDLE: same white crystalline ARACHNID Rift Spinner Oracle Crystallis, recognizable many-legged spider anatomy rather than a humanoid, walking through a shadowy vaulted passage at an oblique angle, observed from a side corridor. Multiple sensory eyes only small light dots, not huge jewels.
BOTTOM RIGHT: same aged bark humanoid Bloomstrider Elder Moss-Singer with branch crown, turning away along an overgrown station walkway, photographed through a foreground window reflection.
PALETTE: only THREE nominal colors like a very old monochrome green CRT: near-black green #070c09, mid phosphor #758e76, pale phosphor #bed7b0. Use coarse three-tone posterization and visible ordered dithering, not full-color photography or smooth glossy painting. Grain suggests information lost during capture. No separate red, amber, gold, blue, purple or natural skin colors. Absolutely no clean ID photos, no studio backdrops, no frontal glamour portraits. Each image should feel like an imperfect observation from a dossier, not character artwork.


## Validation

The complete archive/discovery browser check passes all 149 assertions at desktop, tablet and mobile sizes. Additional CRT checks pass at 1440 and 390 px: all six surveillance cells display, every terminal text color resolves to one of the two phosphor inks, scanlines cover the entire screen without intercepting input, the refresh band runs while visible and pauses offscreen, reduced motion retains only the static raster, and keyboard selection works. Screenshots were reviewed at both sizes. Deployment verification passes with no errors or warnings.
