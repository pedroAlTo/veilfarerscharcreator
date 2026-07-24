import { createHash, randomBytes } from 'node:crypto'
const email=String(process.argv[2]||'').trim().toLowerCase()
const tools=String(process.argv[3]||'player,keeper').split(',').map(v=>v.trim()).filter(v=>v==='player'||v==='keeper')
const days=Math.max(1,Math.min(90,Number(process.argv[4])||14))
if(!email||!email.includes('@')||!tools.length){
  console.error('Usage: node scripts/create-wip-invite.mjs email@example.com player,keeper [days]')
  process.exit(1)
}
const token=`VF-WIP-${randomBytes(24).toString('base64url')}`
const record={hash:createHash('sha256').update(token).digest('hex'),email,tools,expiresAt:new Date(Date.now()+days*86400000).toISOString(),revoked:false}
console.log(JSON.stringify({token,record},null,2))
