# VeilFarers Portal — Technical Handover v59.35

## Summary

This release fixes a runtime crash in the Player Tool augmentation workflow and removes the incorrectly positioned character art from welcome-page tool cards.

## Root cause

Canonical equipment tiers are structured objects:

```js
{ name, rank, code }
```

A legacy augmentation summary rendered `a.tier` directly as a React child. React rejects plain objects and unmounted the application.

## Implementation

### Safe metadata rendering

Added:

```js
displayScalar(value, fallback)
```

It converts structured display metadata to a string using this order:

1. `name`
2. `display`
3. `label`
4. `code`
5. `rank`

`itemTierLabel()` now uses this formatter. Direct renders of augmentation tier, weapon tier and drone grade were also updated.

Stored canonical objects are not mutated or flattened.

### Welcome page

The pseudo-elements that injected creator character art into portal cards are now disabled. The main welcome background and LED activity remain unchanged.

## Preserved from previous releases

- exact v59.25 lock-on integration;
- damage dice launch behavior from the referenced historical build;
- armor loadout manager;
- augmentation inventory and active state manager;
- canonical gear loadout;
- free-text inventory lines;
- Character Creator subclass fallback;
- Level Up workspace;
- security baseline and loading screen.

## Production note

Tailwind CDN and Babel standalone still emit warnings. They are not runtime failures, but should be replaced by a compiled production bundle in a dedicated future iteration.
