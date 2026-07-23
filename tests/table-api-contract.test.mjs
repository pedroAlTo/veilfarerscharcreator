import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const api = readFileSync(new URL('../netlify/functions/table-api.mts', import.meta.url), 'utf8')
const access = readFileSync(new URL('../table-access.js', import.meta.url), 'utf8')
const player = readFileSync(new URL('../player-tool.jsx', import.meta.url), 'utf8')
const keeper = readFileSync(new URL('../keeper-tool.html', import.meta.url), 'utf8')

const gate = api.indexOf('const passwordGate = tablePasswordGate')
const memberWrite = api.indexOf('if (!memberIds.includes(user.id))')
assert.ok(gate > 0 && memberWrite > gate, 'password gate must run before membership is admitted/refreshed')
assert.match(api, /if \(!passwordGate\.allowed\) return json/)
assert.doesNotMatch(api, /if \(needsAdmission \|\| claimLegacy\)\s*\{\s*const passwordGate/)

const ownerGuard = api.indexOf("if (!isOwner) return json({ error: 'Only the table owner can perform this action.' }")
const deleteAction = api.indexOf("if (action === 'deleteTable')")
assert.ok(ownerGuard > 0 && deleteAction > ownerGuard, 'deleteTable must remain behind the owner guard')
for (const target of ['secretPath', 'directoryPath', 'path']) {
  assert.match(api.slice(deleteAction), new RegExp(`deleteDoc\\(${target}`))
}
assert.match(api.slice(deleteAction), /queryDocsAt\(base, 'tableInvites', 'tableId', tableId/)
assert.match(api.slice(deleteAction), /listDocs\(`\$\{path\}\/handouts`/)

for (const legacyField of ['passwordHash', 'tablePasswordHash', 'password', 'tablePassword']) {
  assert.match(api, new RegExp(`${legacyField}: null`), `${legacyField} must be cleared when the owner changes/removes a password`)
}

assert.match(access, /data-ta-delete-table-name/)
assert.match(access, /data-ta-delete-table/)
assert.match(access, /confirmTableId/)
assert.match(access, /veilfarers:table-deleted/)
assert.match(player, /window\.addEventListener\('veilfarers:table-deleted'/)
assert.match(keeper, /window\.addEventListener\('veilfarers:table-deleted'/)
assert.match(player, /if\(isConnected\)disconnectFromCloud\(\)/)
assert.match(keeper, /if\(currentSessionId\)disconnectLiveTable/)

console.log('table API contract: password, owner deletion and client reset checks passed')
