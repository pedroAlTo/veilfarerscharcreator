import type { Config } from '@netlify/functions'
import { googleAccessToken, projectId } from './_firebase-admin.mts'
import { createPollHandler } from './_mini-poll-service.mts'

export async function incrementVote(campaignId: string, ancestry: string) {
  const project = projectId()
  const access = await googleAccessToken()
  const document = `projects/${project}/databases/(default)/documents/miniPolls/${campaignId}/totals/${ancestry}`
  // An atomic transform avoids lost votes when several visitors submit together.
  // Only an aggregate counter is persisted, with no individual ballot records.
  const result = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:commit`, {
    method: 'POST',
    headers: { authorization: `Bearer ${access}`, 'content-type': 'application/json' },
    body: JSON.stringify({ writes: [{
      update: { name: document, fields: {} },
      updateMask: { fieldPaths: [] },
      updateTransforms: [{ fieldPath: 'votes', increment: { integerValue: '1' } }]
    }] })
  })
  if (!result.ok) throw new Error('Vote counter unavailable')
}

export default createPollHandler({ increment: incrementVote })
// No Identity requirement, visitor fingerprint, cookie, or IP-based deduplication.
export const config: Config = { path: '/api/ancestry-vote' }
