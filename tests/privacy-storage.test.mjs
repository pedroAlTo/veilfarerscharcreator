import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const portal=readFileSync(new URL('../portal.js',import.meta.url),'utf8')
const legal=readFileSync(new URL('../legal.html',import.meta.url),'utf8')
const feedback=readFileSync(new URL('../feedback.html',import.meta.url),'utf8')

test('privacy control is global, custom and separates local from cloud deletion',()=>{
  assert.match(portal,/Privacy & device data/)
  assert.match(portal,/CLEAR THIS DEVICE/)
  assert.match(portal,/BORRAR ESTE DISPOSITIVO/)
  assert.match(portal,/localStorage\.clear\(\)/)
  assert.match(portal,/sessionStorage\.clear\(\)/)
  assert.match(portal,/indexedDB\.deleteDatabase/)
  assert.match(portal,/serviceWorker\.getRegistrations/)
  assert.match(portal,/\/login\.html#account-danger-zone/)
  assert.doesNotMatch(portal,/\b(?:alert|confirm|prompt)\s*\(/)
})

test('legal notice inventories essential storage and keeps optional tracking disabled',()=>{
  assert.match(legal,/first-party local storage/)
  assert.match(legal,/Netlify Identity · technical session storage\/cookies/)
  assert.match(legal,/Firebase · technical authentication persistence/)
  assert.match(legal,/Optional analytics, advertising or tracking/)
  assert.match(legal,/Not active/)
  assert.match(legal,/UODO/)
  assert.match(legal,/Google Cloud Data Processing Addendum/)
})

test('external questionnaires disclose Google Forms processing before navigation',()=>{
  assert.match(feedback,/External Google Forms privacy notice/)
  assert.match(feedback,/Each form must display its own Article 13 notice/)
})

test('no analytics or behavioural tracking runtime is present',()=>{
  const runtime=[portal,legal,feedback].join('\n')
  assert.doesNotMatch(runtime,/getAnalytics\s*\(|gtag\s*\(|googletagmanager|hotjar|clarity\s*\(|posthog|mixpanel/i)
})
