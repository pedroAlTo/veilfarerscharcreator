import test from 'node:test'
import assert from 'node:assert/strict'
import { createPollHandler } from '../netlify/functions/_mini-poll-service.mts'
import { campaign, ancestries, campaignStatus } from '../public/mini-campaign.mjs'

const start = Date.parse('2026-10-01T12:00:00Z')
const settings = { ...campaign, opensAt: '2026-10-01T12:00:00Z' }
const request = (body = { campaignId: campaign.id, ancestry: 'kryllian' }, extra = {}) => new Request('https://veilfarers.com/api/ancestry-vote', {
  method: 'POST', headers: { origin: 'https://veilfarers.com', 'content-type': 'application/json' }, body: JSON.stringify(body), ...extra
})

test('campaign is a closed draft until a date is supplied; exact seven-day boundaries', () => {
  assert.equal(campaignStatus(start).state, 'draft')
  assert.equal(campaignStatus(start - 1, settings).state, 'scheduled')
  assert.equal(campaignStatus(start, settings).state, 'open')
  assert.equal(campaignStatus(start + 7 * 86400000 - 1, settings).state, 'open')
  assert.equal(campaignStatus(start + 7 * 86400000, settings).state, 'closed')
  assert.equal(campaignStatus(start, { ...settings, opensAt: 'invalid' }).state, 'draft')
  assert.equal(new Set(ancestries.map(item => item.id)).size, 9)
})

test('public status never returns vote totals or reads storage', async () => {
  const handler = createPollHandler({ settings, now: () => start, increment: () => assert.fail('No write for GET') })
  const response = await handler(new Request('https://veilfarers.com/api/ancestry-vote'))
  assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0')
  assert.deepEqual(Object.keys(await response.json()).sort(), ['campaignId', 'closesAt', 'opensAt', 'serverNow', 'state'])
})

test('each valid ancestry increments only its campaign counter, with no voter records', async () => {
  const calls = []
  const handler = createPollHandler({ settings, now: () => start, increment: async (...args) => calls.push(args) })
  for (const ancestry of ancestries) {
    const response = await handler(request({ campaignId: campaign.id, ancestry: ancestry.id }))
    assert.equal(response.status, 200)
    assert.equal((await response.json()).accepted, true)
    assert.equal(response.headers.get('set-cookie'), null)
  }
  assert.deepEqual(calls, ancestries.map(item => [campaign.id, item.id]))
})

test('closed, scheduled and draft campaigns reject submissions on the server', async () => {
  for (const [clock, config] of [[start - 1, settings], [start + 7 * 86400000, settings], [start, campaign]]) {
    const handler = createPollHandler({ settings: config, now: () => clock, increment: () => assert.fail('Must not write') })
    assert.equal((await handler(request())).status, 409)
  }
})

test('rejects foreign origin, unknown options, extra personal data and oversized requests', async () => {
  const handler = createPollHandler({ settings, now: () => start, increment: () => assert.fail('Invalid vote reached storage') })
  assert.equal((await handler(request({}, { headers: { origin: 'https://example.org', 'content-type': 'application/json' } }))).status, 403)
  assert.equal((await handler(request({ campaignId: campaign.id, ancestry: '../private' }))).status, 400)
  assert.equal((await handler(request({ campaignId: 'different', ancestry: 'human' }))).status, 400)
  assert.equal((await handler(request({ campaignId: campaign.id, ancestry: 'human', email: 'unused@example.test' }))).status, 400)
  assert.equal((await handler(request({}, { body: 'x'.repeat(513) }))).status, 413)
  assert.equal((await handler(request({}, { body: '{' }))).status, 400)
  assert.equal((await handler(request({}, { headers: { origin: 'https://veilfarers.com', 'content-type': 'text/plain' } }))).status, 415)
  assert.equal((await handler(new Request('https://veilfarers.com/api/ancestry-vote', { method: 'DELETE' }))).status, 405)
})

test('database failure is not a successful vote and does not expose provider details', async () => {
  const handler = createPollHandler({ settings, now: () => start, increment: async () => { throw Error('private provider details') } })
  const response = await handler(request())
  assert.equal(response.status, 503)
  assert.doesNotMatch(await response.text(), /private provider details|accepted/)
})
