import assert from 'node:assert/strict'
import { makePassword, tokenHash } from '../netlify/functions/_firebase-admin.mts'
import { SERVER_LOCK_MARKER, tablePasswordGate } from '../netlify/functions/_table-security.mts'

const password = 'Correct-Horse-79'
const wrong = 'Wrong-Password'
const serverAuth = makePassword(password)

assert.deepEqual(tablePasswordGate({ isOpen: true }, null, ''), {
  allowed: true,
  locked: false,
  migrate: false,
  source: 'open',
})

for (const supplied of ['', wrong]) {
  const result = tablePasswordGate({ passHash: SERVER_LOCK_MARKER, isOpen: false }, serverAuth, supplied)
  assert.equal(result.allowed, false, `server password must reject ${supplied ? 'wrong' : 'empty'} input`)
  assert.equal(result.status, 403)
}

const serverSuccess = tablePasswordGate({ passHash: SERVER_LOCK_MARKER, isOpen: false }, serverAuth, password)
assert.equal(serverSuccess.allowed, true)
assert.equal(serverSuccess.locked, true)
assert.equal(serverSuccess.migrate, false)
assert.equal(serverSuccess.source, 'server')

const legacyPbkdf2 = tablePasswordGate({ passAuth: serverAuth, isOpen: false }, null, password)
assert.equal(legacyPbkdf2.allowed, true)
assert.equal(legacyPbkdf2.migrate, true)
assert.equal(legacyPbkdf2.source, 'legacy-pbkdf2')

for (const passHash of [tokenHash(`veilfarers:${password}`), tokenHash(password), password]) {
  const legacyHash = tablePasswordGate({ passHash, isOpen: false }, null, password)
  assert.equal(legacyHash.allowed, true)
  assert.equal(legacyHash.migrate, true)
  assert.equal(legacyHash.source, 'legacy-hash')
}

const legacyPlain = tablePasswordGate({ tablePassword: password, isOpen: false }, null, password)
assert.equal(legacyPlain.allowed, true)
assert.equal(legacyPlain.migrate, true)
assert.equal(legacyPlain.source, 'legacy-plain')

for (const broken of [
  { passHash: SERVER_LOCK_MARKER, isOpen: false },
  { isOpen: false },
]) {
  const result = tablePasswordGate(broken, null, '')
  assert.equal(result.allowed, false)
  assert.equal(result.locked, true)
  assert.equal(result.status, 409)
  assert.equal(result.source, 'missing')
}

console.log('table password gate: 15 assertions passed')
