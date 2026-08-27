VEILFARERS PRIVATE-MODE / DOWNLOAD FIX

1. Make sure GitHub Desktop is on branch: private
2. Close any editor that has these files open.
3. Extract this ZIP directly into the repository root:
   C:\Users\iomis\OneDrive\StarVeil\GIT\veilfarerscharcreator
4. When Windows asks, choose Replace the files in the destination / Yes to all.
5. Double-click APPLY_CLEANUP.bat once.
6. Open GitHub Desktop and review the changes.

Expected changes:
- public/portal.js: friend/admin private navigation becomes visible again; no-FOUT behavior retained.
- public/download/downloads.json: Rust & Steel points to 12.05 with correct file metadata.
- public/rules-data/downloads.json: removes stale 12.00 download references.
- public/download/VeilFarers_Rust_and_Steel_12.05-Editorial-Release.pdf: current R&S 12.05 PDF.
- obsolete old/candidate PDFs are deleted by APPLY_CLEANUP.bat.

DO NOT delete these current 12.04 releases:
- VeilFarers_Keepers_Companion_12.04-Editorial-Release.pdf
- VeilFarers_Alien_Species_12.04-Editorial-Release.pdf
