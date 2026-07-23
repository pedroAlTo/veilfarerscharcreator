import assert from 'node:assert/strict'
import { queryDocsAt } from '../netlify/functions/_firebase-admin.mts'

process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
  project_id: 'veilfarers-test',
  client_email: 'test@example.invalid',
  private_key: 'not-used-by-this-test',
})

let requestedUrl = ''
let requestedBody: any = null
globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  requestedUrl = String(url)
  requestedBody = JSON.parse(String(init?.body || '{}'))
  return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
}) as typeof fetch

const parent = 'artifacts/default-app-id/public/data'
const result = await queryDocsAt(parent, 'tableInvites', 'tableId', 'Legacy Table', 'test-token', 500)

assert.deepEqual(result, [])
assert.ok(requestedUrl.endsWith(`/documents/${parent}:runQuery`))
assert.equal(requestedBody.structuredQuery.from[0].collectionId, 'tableInvites')
assert.equal(requestedBody.structuredQuery.where.fieldFilter.field.fieldPath, 'tableId')
assert.equal(requestedBody.structuredQuery.where.fieldFilter.value.stringValue, 'Legacy Table')
assert.equal(requestedBody.structuredQuery.limit, 500)

console.log('scoped Firestore invitation query: parent path and filter checks passed')
