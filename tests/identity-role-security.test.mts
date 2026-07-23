import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasToolRole, requireAnyToolAccess, requirePortalAdmin, requireToolAccess, userRoles } from '../netlify/functions/_role-access.mts'

test('member alone has no protected-tool access',()=>{
  const user={id:'member-1',email:'member@example.com',roles:['member']}
  assert.equal(hasToolRole(user,'player'),false)
  assert.equal(hasToolRole(user,'keeper'),false)
  assert.throws(()=>requireAnyToolAccess(user),(error:any)=>error.status===403&&error.code==='TOOL_ROLE_REQUIRED')
})

test('player and keeper remain separate, while admin receives both',()=>{
  const player={roles:['member','player']}
  const keeper={appMetadata:{roles:['member','keeper']}}
  const admin={app_metadata:{roles:['admin']}}
  assert.equal(requireToolAccess(player,'player').tool,'player')
  assert.throws(()=>requireToolAccess(player,'keeper'),(error:any)=>error.status===403)
  assert.equal(requireToolAccess(keeper,'keeper').tool,'keeper')
  assert.throws(()=>requireToolAccess(keeper,'player'),(error:any)=>error.status===403)
  assert.equal(hasToolRole(admin,'player'),true)
  assert.equal(hasToolRole(admin,'keeper'),true)
})

test('roles are normalized from every supported Identity representation',()=>{
  const roles=userRoles({roles:['PLAYER'],appMetadata:{roles:['keeper']},app_metadata:{roles:['admin']}})
  assert.deepEqual([...roles].sort(),['admin','keeper','player'])
})

test('administrator requires both role and configured email',()=>{
  const previous=process.env.VF_ADMIN_EMAIL
  process.env.VF_ADMIN_EMAIL='owner@example.com'
  try{
    assert.equal(requirePortalAdmin({email:'OWNER@example.com',roles:['admin']}).email,'owner@example.com')
    assert.throws(()=>requirePortalAdmin({email:'other@example.com',roles:['admin']}),(error:any)=>error.code==='ADMIN_EMAIL_MISMATCH')
    assert.throws(()=>requirePortalAdmin({email:'owner@example.com',roles:['member']}),(error:any)=>error.code==='ADMIN_ROLE_REQUIRED')
  }finally{
    if(previous===undefined)delete process.env.VF_ADMIN_EMAIL
    else process.env.VF_ADMIN_EMAIL=previous
  }
})

test('Netlify redirects do not grant protected tools to member',()=>{
  const source=readFileSync(new URL('../netlify.toml',import.meta.url),'utf8')
  assert.doesNotMatch(source,/Role\s*=\s*\[[^\]]*"member"[^\]]*\]/)
  assert.match(source,/Role\s*=\s*\["player",\s*"admin"\]/)
  assert.match(source,/Role\s*=\s*\["keeper",\s*"admin"\]/)
})

test('browser gate no longer accepts or stores custom invitation tokens',()=>{
  const source=readFileSync(new URL('../wip-access.js',import.meta.url),'utf8')
  assert.doesNotMatch(source,/VF-WIP-[A-Za-z0-9]/)
  assert.doesNotMatch(source,/vf_wip_access|invitation token|action\s*[:=]\s*['"]redeem/i)
  assert.match(source,/\/api\/tool-access/)
})
