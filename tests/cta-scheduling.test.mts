import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {CTA_IDS,ARTICLE_IDS,defaultCtaConfig,normalizeCtaConfig,mergeCtaConfig,ctaIsLive} from '../netlify/functions/_cta-config.mts'

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8')

test('default content keeps existing campaign order and both published articles',()=>{
  assert.deepEqual(CTA_IDS,['pricing','behind','books','crossing','release','beta','minis'])
  assert.deepEqual(ARTICLE_IDS,['overkill','drones','space-combat'])
  assert.equal(defaultCtaConfig.version,2)
  assert.equal(defaultCtaConfig.notices.pricing.priority,1)
  assert.equal(defaultCtaConfig.notices.behind.priority,2)
  assert.equal(defaultCtaConfig.articles.overkill.enabled,true)
  assert.equal(defaultCtaConfig.articles.drones.enabled,true)
  assert.equal(defaultCtaConfig.articles['space-combat'].enabled,true)
})

test('v1 migration preserves disabled CTAs, cleared deadlines and bounded old ordering',()=>{
  const config=normalizeCtaConfig({version:1,notices:{
    pricing:{enabled:false,priority:-8,startsAt:null,endsAt:null},
    behind:{enabled:true,priority:140,startsAt:'2026-10-31T18:00:00Z',endsAt:'2026-11-01T06:00:00Z'}
  }})
  assert.equal(config.notices.pricing.enabled,false)
  assert.equal(config.notices.pricing.endsAt,null)
  assert.equal(config.notices.pricing.priority,1)
  assert.equal(config.notices.behind.priority,99)
  assert.equal(config.articles.drones.enabled,true)
  assert.equal(ctaIsLive(config.notices.behind,Date.parse('2026-10-31T17:59:59Z')),false)
  assert.equal(ctaIsLive(config.notices.behind,Date.parse('2026-10-31T18:00:00Z')),true)
  assert.equal(ctaIsLive(config.notices.behind,Date.parse('2026-11-01T06:00:00Z')),false)
})

test('a partial article edit preserves every existing CTA and other article setting',()=>{
  const current=mergeCtaConfig(defaultCtaConfig,{notices:{pricing:{endsAt:null,enabled:false}},articles:{overkill:{enabled:false},drones:{startsAt:'2026-11-10T10:00:00+01:00'}}})
  const edited=mergeCtaConfig(current,{articles:{drones:{priority:3}}})
  assert.deepEqual(edited.notices,current.notices)
  assert.deepEqual(edited.articles.overkill,current.articles.overkill)
  assert.equal(edited.articles.drones.startsAt,'2026-11-10T09:00:00.000Z')
  assert.equal(edited.articles.drones.priority,3)
  const ctaEdit=mergeCtaConfig(edited,{notices:{books:{enabled:false}}})
  assert.deepEqual(ctaEdit.articles,edited.articles)
})

test('admin mutations reject unknown items, coercion, invalid calendar dates and ambiguous local times',()=>{
  const bad=[
    {notices:{unknown:{enabled:true}}},{articles:{secret:{enabled:true}}},
    {notices:{books:{enabled:'false'}}},{articles:{drones:{priority:'2'}}},
    {articles:{drones:{priority:0}}},{articles:{drones:{priority:1.5}}},
    {articles:{drones:{startsAt:'2026-02-30T10:00:00Z'}}},
    {articles:{drones:{startsAt:'2026-01-01T10:00'}}},
    {articles:{drones:{startsAt:2026}}},{articles:{drones:{endsAt:false}}},
    {articles:{drones:{draft:true}}},{articles:[]},{notices:null},[],null,{},
    {notices:{books:{enabled:true}},surprise:true}
  ]
  for(const patch of bad)assert.throws(()=>mergeCtaConfig(defaultCtaConfig,patch),{status:400})
})

test('date interval validation applies to merged fields and can clear a default deadline',()=>{
  const current=mergeCtaConfig(defaultCtaConfig,{articles:{drones:{startsAt:'2026-11-02T00:00:00Z'}}})
  assert.throws(()=>mergeCtaConfig(current,{articles:{drones:{endsAt:'2026-11-01T00:00:00Z'}}}),/later than start/)
  assert.equal(mergeCtaConfig(defaultCtaConfig,{notices:{pricing:{endsAt:null}}}).notices.pricing.endsAt,null)
  assert.equal(ctaIsLive({enabled:true,startsAt:'invalid',endsAt:null,priority:1}),false)
})

test('portal retains scheduled campaign access and verifies the Identity admin role in the handler',()=>{
  assert.match(read('../public/index.html'),/data-cta-notice="pricing"/)
  assert.match(read('../public/index.html'),/data-cta-notice="behind"/)
  assert.match(read('../public/downloads.html'),/data-pricing-countdown/)
  const endpoint=read('../netlify/functions/_content-handlers.mts')
  assert.match(endpoint,/requireContentAdmin\(user\)/)
  assert.match(endpoint,/services.verifyRequestOrigin\(req\)/)
})
