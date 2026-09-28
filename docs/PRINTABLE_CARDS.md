# Printable domain power cards

Downloads offers two editions of the same 147 English powers from Corebook 12.06:

- `public/download/VeilFarers_Power_Cards_12.06_Duplex_A4.pdf`: color fronts and illustrated backs; 141 illustrated backs and 6 rules continuations.
- `public/download/VeilFarers_Power_Cards_12.06_Print_Friendly_A4.pdf`: low-ink fronts retaining domain symbols and banner colors, with 145 VeilFarers logo backs and 2 rules continuations.

Both files have 52 pages: one bilingual instruction page, its blank reverse, and 25 front/back sheet pairs. The final pair contains three cards. Differences in continuation counts are inherited from the original editions; no power was shortened or removed.

## Printing and cutting

Print pages **3-52**, A4 portrait, **actual size / 100%**, double-sided with **flip on the long edge**. Disable fit-to-page and extra pages per sheet. Print one front/back pair first and check alignment and the 50 mm scale on the instruction page.

Each sheet holds six cards in a 2 x 3 grid. The finished trim remains **63 x 88 mm**. Each card has **3 mm bleed** on every side, with **8 mm gutters** between trim boundaries. Exterior crop marks identify the cutting grid; registration crosses and card IDs sit outside the cards. Cut along the crop marks, not along the outside of the bleed. A power continued on its reverse remains one Loadout card.

The original card faces remain vector text, shapes and embedded images at their original size. Only the outer 0.1 mm edge is extrapolated into the disposable 3 mm bleed area. This leaves the inset gold frames, symbols and text untouched. White original edges intentionally have white bleed. Back columns are mirrored for long-edge duplex alignment.

## Source files and regeneration

The original PDFs are read-only inputs, preserved at:

```text
C:/Users/iomis/OneDrive/StarVeil/V12/12.06/VeilFarers_Power_Cards_12.06_Duplex_A4.pdf
C:/Users/iomis/OneDrive/StarVeil/V12/12.06/VeilFarers_Power_Cards_12.06_Print_Friendly_A4.pdf
```

Run from `site/`, with Python packages `pypdf`, `pdfplumber` and `reportlab` available:

```powershell
python scripts/prepare-card-print-bleed.py --source-dir 'C:/Users/iomis/OneDrive/StarVeil/V12/12.06'
```

The command writes the two downloadable PDFs, records the placement/source-hash report in `output/pdf/card-print-imposition.json`, and updates sizes and SHA-256 checksums in both download indexes:

- `public/download/downloads.json`
- `public/rules-data/downloads.json`

Existing book entries are preserved. The two card editions use the normal Downloads renderer, native download links and existing download analytics. Preview images are page 3 of each finished edition:

```powershell
pdftoppm -f 3 -l 3 -singlefile -scale-to-x 600 -scale-to-y -1 -jpeg -jpegopt quality=85 public/download/VeilFarers_Power_Cards_12.06_Duplex_A4.pdf public/img/covers/power-cards-color
pdftoppm -f 3 -l 3 -singlefile -scale-to-x 600 -scale-to-y -1 -jpeg -jpegopt quality=85 public/download/VeilFarers_Power_Cards_12.06_Print_Friendly_A4.pdf public/img/covers/power-cards-print-friendly
```

## Verification completed

- Identified 147 unique original card IDs in each source; verified each rules continuation against its matching front before reimposition.
- Verified every front/back placement, mirrored back column, unchanged 63 x 88 mm trim, 3 mm bleed inside A4 bounds, and the three-card final sheet.
- Reopened both generated PDFs and confirmed 52 A4 pages each.
- Checked that both original source file hashes remain unchanged, and the two download indexes match the generated files' sizes and checksums.
- Rendered all 52 pages of both final PDFs. Representative instruction, front, illustrated-back and print-friendly logo-back pages were visually inspected.
- An exact-resolution pixel comparison passed for the first color front. The illustrated-back comparison was visually consistent but differed at pixel level after reimposition, so no claim of pixel-identical raster rendering is made. The original embedded artwork and vector operations are retained; the decoded illustrated-back image was verified byte-identical to its source.
- Existing download-index consistency and release-checksum tests passed before the bleed rebuild; the final catalogue's checksums were separately rechecked after regeneration.

These checks verify the file layout and pairing. Printer registration is checked with the initial test pair described above.
