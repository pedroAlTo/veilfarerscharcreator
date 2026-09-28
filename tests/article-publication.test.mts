import test from 'node:test'
import assert from 'node:assert/strict'
import {createArticleHandler,articleForPath} from '../netlify/functions/_article-publication.mts'
import {normalizeCtaConfig,mergeCtaConfig,defaultCtaConfig} from '../netlify/functions/_cta-config.mts'
import {config as routeConfig} from '../netlify/functions/behind-veil-article.mts'

const now=Date.parse('2026-10-01T12:00:00Z')
const url=(path:string)=>new Request(`https://veilfarers.com${path}`)
const setup=(config:any=defaultCtaConfig,overrides:any={})=>createArticleHandler({read:async()=>({data:normalizeCtaConfig(config)}),readHtml:async(file)=>`<!doctype html><main>${file}</main>`,now:()=>now,...overrides})

test('all canonical, extensionless and trailing-slash article variants use the server gate',async()=>{
  assert.equal(routeConfig.preferStatic,false)
  assert.equal((routeConfig.path as string[]).length,9)
  for(const path of routeConfig.path as string[]){
    assert.ok(articleForPath(path))
    const response=await setup()(url(path))
    assert.equal(response.status,200,path)
    assert.match(response.headers.get('cache-control')||'',/no-store/)
    assert.equal(response.headers.get('netlify-cdn-cache-control'),'no-store')
  }
  assert.equal(articleForPath('/behind-the-veil/../../admin.html'),null)
})

test('disabling Drones blocks English, Spanish and no-JavaScript direct visits',async()=>{
  let htmlReads=0
  const config=mergeCtaConfig(defaultCtaConfig,{articles:{drones:{enabled:false}}})
  const handler=setup(config,{readHtml:async()=>{htmlReads++;return 'private article'}})
  for(const path of ['/behind-the-veil/drones.html','/behind-the-veil/drones','/behind-the-veil/drones-es.html']){
    const response=await handler(url(path))
    assert.equal(response.status,404)
    assert.equal(response.headers.get('x-robots-tag'),'noindex')
    assert.doesNotMatch(await response.text(),/private article/)
  }
  assert.equal(htmlReads,0)
  assert.equal((await handler(url('/behind-the-veil/overkill.html'))).status,200)
})

test('article publication starts at the exact start and ends at the exact end server time',async()=>{
  const config=mergeCtaConfig(defaultCtaConfig,{articles:{drones:{startsAt:'2026-10-01T12:00:00Z',endsAt:'2026-10-02T12:00:00Z'}}})
  for(const [at,status] of [[now-1,404],[now,200],[now+86400000-1,200],[now+86400000,404]]){
    assert.equal((await setup(config,{now:()=>at})(url('/behind-the-veil/drones-es.html'))).status,status)
  }
})

test('storage failures return 503 rather than serving an article from fallback defaults',async()=>{
  const response=await setup(defaultCtaConfig,{read:async()=>{throw new Error('offline')}})(url('/behind-the-veil/drones-es.html'))
  assert.equal(response.status,503)
  assert.equal(response.headers.get('retry-after'),'60')
  assert.match(await response.text(),/temporalmente/)
})

test('HEAD has no body, unknown routes return 404 and mutations are rejected',async()=>{
  const handler=setup()
  const head=await handler(new Request('https://veilfarers.com/behind-the-veil/drones.html',{method:'HEAD'}))
  assert.equal(head.status,200)
  assert.equal(await head.text(),'')
  assert.equal((await handler(url('/behind-the-veil/unknown.html'))).status,404)
  assert.equal((await handler(new Request('https://veilfarers.com/behind-the-veil/drones.html',{method:'POST'}))).status,405)
})
