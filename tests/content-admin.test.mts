import test from 'node:test'
import assert from 'node:assert/strict'
import {createContentConfigHandler} from '../netlify/functions/_content-handlers.mts'
import {createContentWriter,contentSnapshot} from '../netlify/functions/_content-store.mts'
import {normalizeCtaConfig,mergeCtaConfig,defaultCtaConfig} from '../netlify/functions/_cta-config.mts'
import {requireContentAdmin,requirePortalAdmin} from '../netlify/functions/_role-access.mts'

const admin:any={id:'editor',email:'different-editor@example.com',appMetadata:{roles:['admin']}}
const now=Date.parse('2026-09-28T12:00:00Z')
const stored={data:{...normalizeCtaConfig(defaultCtaConfig),updatedAt:'2026-09-27T09:00:00.000Z'},updateTime:'2026-09-27T09:00:00.123456Z'}
const request=(body:any,origin='https://veilfarers.com')=>new Request('https://veilfarers.com/api/cta-config',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)})
const setup=(overrides:any={})=>createContentConfigHandler({getUser:async()=>admin,read:async()=>structuredClone(stored),now:()=>now,...overrides})

test('content admins need the admin role, without changing owner-only account management',()=>{
  const before=process.env.VF_ADMIN_EMAIL
  try{
    process.env.VF_ADMIN_EMAIL='owner@example.com'
    assert.deepEqual(requireContentAdmin(admin).roles,['admin'])
    assert.throws(()=>requirePortalAdmin(admin),{status:403,code:'ADMIN_EMAIL_MISMATCH'})
    for(const user of [{roles:['player']},{roles:['keeper']},{user_metadata:{roles:['admin']}}])assert.throws(()=>requireContentAdmin(user),{status:403})
    assert.throws(()=>requireContentAdmin(null),{status:401})
  }finally{if(before===undefined)delete process.env.VF_ADMIN_EMAIL;else process.env.VF_ADMIN_EMAIL=before}
})

test('public GET is unauthenticated, while admin GET authorizes before reading any settings',async()=>{
  let reads=0
  const publicHandler=setup({getUser:async()=>null,read:async()=>{reads++;return stored}})
  const publicResponse=await publicHandler(new Request('https://veilfarers.com/api/cta-config'))
  assert.equal(publicResponse.status,200)
  assert.equal((await publicResponse.json()).version,2)
  assert.equal(reads,1)
  const denied=await publicHandler(new Request('https://veilfarers.com/api/content-admin'),true)
  assert.equal(denied.status,401)
  assert.equal(reads,1)
  const allowed=await setup()(new Request('https://veilfarers.com/api/content-admin'),true)
  assert.equal(allowed.status,200)
  const body=await allowed.json()
  assert.equal(body.authorized,true)
  assert.equal(body.config.updatedAt,stored.data.updatedAt)
})

test('missing storage document initializes defaults but read failures never revive disabled content',async()=>{
  const fresh=await setup({read:async()=>null})(new Request('https://veilfarers.com/api/cta-config'))
  assert.equal(fresh.status,200)
  assert.equal((await fresh.json()).updatedAt,null)
  const broken=await setup({read:async()=>{throw new Error('database unavailable')}})(new Request('https://veilfarers.com/api/cta-config'))
  assert.equal(broken.status,503)
  const body=await broken.json()
  assert.equal(body.notices,undefined)
  assert.match(broken.headers.get('cache-control')||'',/no-store/)
})

test('POST rejects unauthenticated, non-admin and cross-origin writes before storage',async()=>{
  let writes=0
  const write=async()=>{writes++;throw new Error('should not write')}
  const patch={articles:{drones:{enabled:false}}}
  for(const [user,expected] of [[null,401],[{id:'player',roles:['player']},403]] as const){
    const response=await setup({getUser:async()=>user,write})(request(patch))
    assert.equal(response.status,expected)
  }
  const crossOrigin=await setup({write})(request(patch,'https://unrelated.example'))
  assert.equal(crossOrigin.status,403)
  assert.equal(writes,0)
})

test('POST saves a validated partial patch and preserves unrelated schedules',async()=>{
  let saved:any
  const handler=setup({write:async(config:any,id:string,prior:any,timestamp:number)=>{
    saved={config,id,prior,timestamp};return {...config,updatedAt:new Date(timestamp).toISOString(),serverNow:new Date(timestamp).toISOString()}
  }})
  const response=await handler(request({articles:{drones:{enabled:false}},updatedAt:stored.data.updatedAt}))
  assert.equal(response.status,200)
  assert.equal(saved.id,'editor')
  assert.equal(saved.config.articles.drones.enabled,false)
  assert.deepEqual(saved.config.notices,stored.data.notices)
  assert.equal(saved.prior.updateTime,stored.updateTime)
  assert.equal((await response.json()).updatedAt,'2026-09-28T12:00:00.000Z')
})

test('invalid JSON, invalid settings and stale edits never reach the writer',async()=>{
  let writes=0
  const handler=setup({write:async()=>{writes++;throw new Error('should not write')}})
  const badJson=new Request('https://veilfarers.com/api/cta-config',{method:'POST',headers:{origin:'https://veilfarers.com'},body:'{broken'})
  assert.equal((await handler(badJson)).status,400)
  assert.equal((await handler(request({articles:{drones:{enabled:'false'}}}))).status,400)
  assert.equal((await handler(request({notices:{books:{enabled:false}},updatedAt:null}))).status,409)
  assert.equal(writes,0)
})

test('atomic storage writes create only when absent and update only the read revision',async()=>{
  const calls:any[]=[]
  const write=createContentWriter({getAccessToken:async()=>'test-token',base:()=> 'https://firestore.example/documents',fetch:async(url,options)=>{
    calls.push({url:String(url),options});return Response.json({updateTime:'new-revision'})
  }})
  await write(normalizeCtaConfig(defaultCtaConfig),'editor',null,now)
  await write(normalizeCtaConfig(defaultCtaConfig),'editor',stored,now)
  assert.equal(new URL(calls[0].url).searchParams.get('currentDocument.exists'),'false')
  assert.equal(new URL(calls[1].url).searchParams.get('currentDocument.updateTime'),stored.updateTime)
  assert.equal(JSON.parse(calls[1].options.body).fields.updatedBy.stringValue,'editor')
  const conflict=createContentWriter({getAccessToken:async()=>'test-token',base:()=> 'https://firestore.example/documents',fetch:async()=>Response.json({error:{status:'FAILED_PRECONDITION'}},{status:400})})
  await assert.rejects(()=>conflict(normalizeCtaConfig(defaultCtaConfig),'editor',stored,now),{status:409,code:'CONTENT_CONFIG_CONFLICT'})
})

test('response metadata never exposes the editing administrator identity',()=>{
  const snapshot=contentSnapshot({data:{...stored.data,updatedBy:'private-user-id'}},now)
  assert.equal(Object.hasOwn(snapshot,'updatedBy'),false)
  assert.equal(snapshot.serverNow,'2026-09-28T12:00:00.000Z')
})
