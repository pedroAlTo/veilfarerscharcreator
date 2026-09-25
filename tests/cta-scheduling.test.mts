import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {CTA_IDS,defaultCtaConfig,normalizeCtaConfig,ctaIsLive} from '../netlify/functions/_cta-config.mts'

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8')

test('CTA defaults put pricing and Behind the Veil before every current notice',()=>{
  assert.deepEqual(CTA_IDS,['pricing','behind','books','crossing','release','beta','minis'])
  assert.equal(defaultCtaConfig.notices.pricing.enabled,true)
  assert.equal(defaultCtaConfig.notices.pricing.priority,1)
  assert.equal(defaultCtaConfig.notices.behind.priority,2)
  assert.equal(defaultCtaConfig.notices.books.priority,3)
  assert.ok(defaultCtaConfig.notices.pricing.endsAt)
})

test('CTA schedule supports pause, future launches and bounded ordering',()=>{
  const config=normalizeCtaConfig({notices:{
    pricing:{enabled:false,priority:-8,startsAt:null,endsAt:null},
    behind:{enabled:true,priority:140,startsAt:'2026-10-31T18:00:00Z',endsAt:'2026-11-01T06:00:00Z'}
  }})
  assert.equal(config.notices.pricing.enabled,false)
  assert.equal(config.notices.pricing.priority,1)
  assert.equal(config.notices.behind.priority,99)
  assert.equal(ctaIsLive(config.notices.pricing,Date.parse('2026-09-23T12:00:00Z')),false)
  assert.equal(ctaIsLive(config.notices.behind,Date.parse('2026-10-31T17:59:59Z')),false)
  assert.equal(ctaIsLive(config.notices.behind,Date.parse('2026-10-31T20:00:00Z')),true)
  assert.equal(ctaIsLive(config.notices.behind,Date.parse('2026-11-01T06:00:00Z')),false)
})

test('an administrator can clear the default pricing deadline',()=>{
  const config=normalizeCtaConfig({notices:{pricing:{endsAt:null}}})
  assert.equal(config.notices.pricing.endsAt,null)
})
test('CTA schedule rejects an end before its start',()=>{
  assert.throws(()=>normalizeCtaConfig({notices:{behind:{startsAt:'2026-11-02T00:00:00Z',endsAt:'2026-11-01T00:00:00Z'}}}),/later than start/)
})

test('latest portal keeps Behind the Veil while exposing scheduled campaigns',()=>{
  const home=read('../public/index.html')
  const downloads=read('../public/downloads.html')
  const admin=read('../public/admin.html')
  const carousel=read('../public/cta-carousel-scheduled.js')
  const endpoint=read('../netlify/functions/cta-config.mts')
  assert.match(home,/href="\/behind-the-veil\/"/)
  assert.match(home,/data-cta-notice="pricing"/)
  assert.match(home,/data-cta-notice="behind"/)
  assert.match(home,/Buy now before it’s too late/)
  assert.match(downloads,/data-pricing-countdown/)
  assert.match(admin,/CTA scheduling/)
  assert.match(carousel,/fetch\('\/api\/cta-config'/)
  assert.match(endpoint,/requirePortalAdmin\(user\)/)
  assert.match(endpoint,/verifyRequestOrigin\(req\)/)
})
