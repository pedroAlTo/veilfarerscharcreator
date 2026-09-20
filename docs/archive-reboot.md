# Obsidian archive access sequence

The public NPC archive displays six subjects per page. The 12.06 Alien Species gallery contains 13 complete profiles on PDF pages 48–53, so the pager reads `< 1 - 3 >`, with the current page in bold. The source profiles are Helena Vance, Marcus Chen, Maria Santos, Luminara Starwhisper, Vaelthys the Discordant, Thokk-Var-Ironhold, NEXUS-Prime, HOPE-7, Hunt-Master Grenn, Scarred-Moon, Oracle Crystallis, Flux-Dance and Elder Moss-Singer. Generation tables and archetypes are not additional profiles.

Either pager arrow starts a fictional local access-denied sequence. It does not load another page or use authentication services. The corrected warning reads: `INTRUSIVE ACCESS DETECTED!` and `Proceeding to shut down.` Red is reserved for the warning and the existing insignia accent.

The phases are warning (2.8 seconds), CRT shutdown (0.85), darkness (0.45), Kurogane Technologies BIOS (3.4), DVoss login with literal password bullets (3.4), and archive restoration (0.75). Each phase transitions within the existing monitor. No actual password, form, credential, navigation or page reload is involved. The original subject and keyboard focus are restored afterward.

The BIOS and login footer reads `for hyperboot press [ESC]`. Clicking it or pressing Escape completes the sequence. Animation pauses while the monitor is offscreen or the document is hidden. Reduced motion removes flashing and movement, with shorter static phases that retain the narrative.

## Player-facing redactions

All six records use inline phosphor-green censorship bars for sensitive motives, unusual knowledge, behavioral clues and contact objectives. Public appearances and basic identities remain readable. Bars are empty elements labeled `Classified information`; the removed prose is not retained underneath, in attributes, in script data or in the accessibility tree. The full-profile links explicitly identify their destination as the Keeper PDF. The source PDFs themselves remain unchanged.

## Validation

- 70 Node tests, including sequence boundaries and reduced-motion phases.
- 70 reboot browser assertions at 1440 and 390 px: pagination, all phases, progressive BIOS lines, masked login, replay, Escape, focus, same-record restoration, visibility pause, reduced motion, no-JavaScript fallback and empty redactions.
- 149 existing archive/discovery assertions across desktop, tablet and mobile.
- Desktop and mobile screenshots reviewed for warning, BIOS, login and Moss-Singer's inline redactions.

Run the browser check with `node scripts/check-archive-reboot.cjs`; set `PLAYWRIGHT_MODULE` to a resolvable Playwright installation if needed, and `QA_BASE` to override the default local preview URL.


The intrusion warning now uses a locally hosted Aldrich Regular font from [Google Fonts](https://fonts.google.com/specimen/Aldrich), with its SIL Open Font License retained beside the TTF. Larger red lettering remains readable throughout the pulse. The reboot overlay covers the complete terminal; the header, subject column, records and footer are hidden. During shutdown and the powered-off phase the backdrop is pure black, with both CRT overlay effects disabled. Browser checks verify font loading, full monitor coverage and zero residual interface glow.
