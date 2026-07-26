import test from 'node:test'
import assert from 'node:assert/strict'
import { isPlayerEntity, isHiddenAdversary, stripKeeperFields, sessionCharactersFor } from '../netlify/functions/_table-visibility.mts'

// A session as it might sit in Firestore: two player characters, one visible
// adversary and one hidden adversary. Keeper notes live on several of them.
const playerA = { id: 'pc-a', memberUid: 'user-a', name: 'Vex', keeperNotes: 'secretly the traitor' }
const playerB = { id: 'pc-b', ownerUid: 'user-b', name: 'Rell', keeperNotes: 'owes the cartel' }
const visibleFoe = { id: 'foe-1', name: 'Dock Enforcer', hidden: false, keeperNotes: 'flees below 5 HP' }
const hiddenFoe = { id: 'foe-2', name: 'The Collector', hidden: true, keeperNotes: 'true villain' }
const hiddenByType = { id: 'foe-3', name: 'Sleeper Agent', entityType: 'hidden' }
const characters = [playerA, playerB, visibleFoe, hiddenFoe, hiddenByType]

test('a player character is never treated as a hidden adversary, even if flagged',()=>{
  assert.equal(isPlayerEntity(playerA), true)
  // a player whose own sheet somehow carries hidden must still not be dropped
  assert.equal(isHiddenAdversary({ ...playerA, hidden: true }), false)
})

test('adversaries are recognised as hidden by flag or by entityType',()=>{
  assert.equal(isHiddenAdversary(hiddenFoe), true)
  assert.equal(isHiddenAdversary(hiddenByType), true)
  assert.equal(isHiddenAdversary(visibleFoe), false)
})

test('stripKeeperFields removes only keeperNotes and preserves the rest',()=>{
  const stripped = stripKeeperFields(visibleFoe)
  assert.equal('keeperNotes' in stripped, false)
  assert.equal(stripped.name, 'Dock Enforcer')
  assert.equal(stripped.id, 'foe-1')
})

test('the owner receives the character list unmodified',()=>{
  const forOwner = sessionCharactersFor(characters, true)
  assert.equal(forOwner, characters) // same reference: no copy, no stripping
  assert.equal(forOwner.length, 5)
  assert.equal(forOwner.find(c => c.id === 'foe-2')?.keeperNotes, 'true villain')
})

test('a non-owner never receives any keeperNotes field, on any entity',()=>{
  const forPlayer = sessionCharactersFor(characters, false)
  const leaked = JSON.stringify(forPlayer)
  assert.doesNotMatch(leaked, /keeperNotes/)
  assert.doesNotMatch(leaked, /secretly the traitor|owes the cartel|flees below 5 HP|true villain/)
})

test('a non-owner never receives a hidden adversary, by flag or by type',()=>{
  const forPlayer = sessionCharactersFor(characters, false)
  const ids = forPlayer.map(c => c.id)
  assert.deepEqual(ids, ['pc-a', 'pc-b', 'foe-1']) // both hidden foes gone
  const leaked = JSON.stringify(forPlayer)
  assert.doesNotMatch(leaked, /Collector|Sleeper Agent/) // not even the name leaks
})

test('players keep their own visible sheets and the visible adversary',()=>{
  const forPlayer = sessionCharactersFor(characters, false)
  assert.equal(forPlayer.find(c => c.id === 'pc-a')?.name, 'Vex')
  assert.equal(forPlayer.find(c => c.id === 'foe-1')?.name, 'Dock Enforcer')
})

test('empty or malformed character lists are handled without throwing',()=>{
  assert.deepEqual(sessionCharactersFor([], false), [])
  const junk = sessionCharactersFor([null, undefined, 42, { id: 'ok' }] as any, false)
  assert.equal(junk.length, 4) // non-objects pass through stripKeeperFields untouched
})
