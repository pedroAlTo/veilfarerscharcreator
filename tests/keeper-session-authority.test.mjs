import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const api = readFileSync(new URL('../netlify/functions/table-api.mts', import.meta.url), 'utf8')
const keeper = readFileSync(new URL('../public/keeper-tool.html', import.meta.url), 'utf8')

// --- server: the Keeper owns the roster -------------------------------------
// A member could previously patch `characters` wholesale. Because the player
// tool has never known about per-character keeperNotes, that write replaced the
// array with entries that had no notes at all.
assert.match(api, /const keeperOwnedPatchKeys\s*=\s*new Set\(\[[^\]]*'characters'[^\]]*\]\)/,
  'characters must be listed as a Keeper-owned patch key')
for (const key of ['keeperNotes', 'sessionName']) {
  assert.match(api, new RegExp(`keeperOwnedPatchKeys=new Set\\(\\[[^\\]]*'${key}'`),
    `${key} must be Keeper-owned`)
}

const patchAction = api.indexOf("if (action === 'patchSession')")
const patchGuard = api.indexOf('keeperOwnedPatchKeys.has(key) && !isOwner', patchAction)
const charBranch = api.indexOf("if (key === 'characters')", patchAction)
assert.ok(patchAction > 0, 'patchSession handler must exist')
assert.ok(patchGuard > patchAction, 'patchSession must check Keeper ownership')
assert.ok(patchGuard < charBranch, 'the ownership check must run before characters is accepted')

// --- server: members never receive Keeper-only material ----------------------
const readAction = api.indexOf("if (action === 'readSession')")
const readSlice = api.slice(readAction, api.indexOf("if (action === 'patchSession')"))
assert.match(readSlice, /const visibleCharacters = isOwner \? rawCharacters : rawCharacters/,
  'non-owners must get a filtered roster')
assert.match(readSlice, /\.filter\(\(item: any\) => !\(item && item\.hidden\)\)/,
  'hidden entities must be dropped for non-owners')
assert.match(readSlice, /const \{ keeperNotes, \.\.\.rest \} = item \|\| \{\}/,
  'per-character keeperNotes must be stripped for non-owners')
assert.match(readSlice, /keeperNotes: isOwner \?/,
  'session-level keeperNotes must not be sent to members')

// --- client: no stale snapshot may rebuild the write payload -----------------
// __sessionCharsRaw is what every characters write is rebuilt from. Refreshing
// it outside the barrier is the regression this file exists to catch.
assert.match(keeper, /window\.__keeperSnapshotIsStale = function/,
  'the keeper tool must expose a staleness barrier')
assert.match(keeper, /keeperWritesInFlight > 0/, 'in-flight writes must suppress incoming snapshots')
assert.match(keeper, /keeperAckedUpdatedAt\s*=\s*Math\.max\(/,
  'patchLive must record the updatedAt the server confirmed')

const rawAssign = keeper.indexOf('window.__sessionCharsRaw=JSON.parse')
const barrier = keeper.lastIndexOf('__keeperSnapshotIsStale(data)', rawAssign)
assert.ok(rawAssign > 0, '__sessionCharsRaw assignment must exist')
assert.ok(barrier > 0 && barrier < rawAssign,
  '__sessionCharsRaw must only be refreshed behind the staleness barrier')

console.log('keeper session authority: roster ownership, read filtering and write barrier passed')
