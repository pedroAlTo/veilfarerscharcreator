# VeilFarers v59.56 — Security and Data Boundary

## Change classification

v59.56 is a presentation and static-asset release. It does not change authentication, authorization, Character Vault ownership, table membership, Keeper permissions, note recipient filtering, Firebase token exchange, Netlify Functions or Firestore document paths.

## Affiliation data boundary

The Character Creator continues to load Affiliation rules from `rules-data/core/affiliations.json`. Crest mapping is keyed to the existing application IDs and affects only visual rendering. Artwork cannot create, remove, rename or modify an Affiliation option.

## Future-ready assets

Starborn Collective and Spire of Verita artwork is stored under `img/affiliation/`, but no runtime card is created for either institution because they are not part of the current canonical Affiliation dataset. This prevents artwork availability from becoming an accidental rules/data change.

## Image safety

The uploaded PNGs contained an opaque baked checkerboard. Runtime assets were processed locally into transparent WebP images. No metadata, executable content, scripts, external URLs or credentials are embedded in the mapped image files.

## Rules deployment

No Firestore Rules deployment is required for v59.56. The included Rules file is copied from the v59.55 coordinated baseline.
