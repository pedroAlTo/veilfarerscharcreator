import { campaign, ancestries, campaignStatus } from '../../public/mini-campaign.mjs'

const headers = {
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'"
}

// The injected store receives only the campaign and ancestry IDs, never the request.
export function createPollHandler({ increment, now = Date.now, settings = campaign }) {
  const reply = (body, status = 200) => Response.json(body, { status, headers })
  return async (request: Request) => {
    if (request.method === 'GET') return reply(campaignStatus(now(), settings))
    if (request.method !== 'POST') {
      return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET, POST' } })
    }
    if (request.headers.get('origin') !== new URL(request.url).origin) {
      return reply({ error: 'Please vote from the VeilFarers portal.' }, 403)
    }
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
      return reply({ error: 'Expected a JSON vote.' }, 415)
    }
    const reader = request.body?.getReader()
    if (!reader) return reply({ error: 'Choose an ancestry first.' }, 400)
    let bytes = 0
    let body = ''
    const decoder = new TextDecoder()
    try {
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        bytes += chunk.value.byteLength
        if (bytes > 512) {
          await reader.cancel()
          return reply({ error: 'Vote is too large.' }, 413)
        }
        body += decoder.decode(chunk.value, { stream: true })
      }
      body += decoder.decode()
      const vote = JSON.parse(body)
      if (!vote || Object.keys(vote).some(key => !['campaignId', 'ancestry'].includes(key)) ||
          vote.campaignId !== settings.id || !ancestries.some(item => item.id === vote.ancestry)) {
        return reply({ error: 'Choose one of the nine ancestries in this campaign.' }, 400)
      }
      // Recheck after reading the body: the server decides the seven-day cutoff.
      const status = campaignStatus(now(), settings)
      if (status.state !== 'open') return reply({ ...status, error: 'Voting is not open.' }, 409)
      await increment(settings.id, vote.ancestry)
      return reply({ accepted: true, campaignId: settings.id })
    } catch (error) {
      if (error instanceof SyntaxError) return reply({ error: 'Invalid vote.' }, 400)
      // Do not log the request, identifiers, or the submitted payload.
      return reply({ error: 'We could not confirm your vote. Please try again later.' }, 503)
    } finally {
      reader.releaseLock()
    }
  }
}
