import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const portal=readFileSync(new URL('../public/portal.js',import.meta.url),'utf8')
const legal=readFileSync(new URL('../public/legal.html',import.meta.url),'utf8')
const feedback=readFileSync(new URL('../public/feedback.html',import.meta.url),'utf8')
const downloadsPage=readFileSync(new URL('../public/downloads.html',import.meta.url),'utf8')
const downloadsRuntime=readFileSync(new URL('../public/downloads.js',import.meta.url),'utf8')
const analyticsRuntime=readFileSync(new URL('../public/analytics-consent.js',import.meta.url),'utf8')
const headers=readFileSync(new URL('../public/_headers',import.meta.url),'utf8')
const netlify=readFileSync(new URL('../netlify.toml',import.meta.url),'utf8')
const articlePublisher=readFileSync(new URL('../netlify/functions/_article-publication.mts',import.meta.url),'utf8')

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

test('legal notice inventories essential storage and discloses limited public analytics',()=>{
  assert.match(legal,/first-party local storage/)
  assert.match(legal,/Netlify Identity · technical session storage\/cookies/)
  assert.match(legal,/Firebase · technical authentication persistence/)
  assert.match(legal,/Google Analytics 4 · optional public-site measurement/)
  assert.match(legal,/limited cookieless page-view signals/)
  assert.match(legal,/180 days/)
  assert.match(legal,/Cookie settings/)
  assert.match(legal,/No account, character, email or private-tool data is sent/)
  assert.match(legal,/UODO/)
  assert.match(legal,/Google Cloud Data Processing Addendum/)
})

test('feedback is collected in-house, with no external form processor',()=>{
  assert.doesNotMatch(feedback,/docs\.google\.com\/forms|Google Forms|typeform|jotform|surveymonkey/i)
  assert.match(feedback,/data-netlify="true"/)
  assert.match(feedback,/netlify-honeypot="bot-field"/)
  assert.match(feedback,/\/legal\.html#privacy/)
})

test('no behavioural advertising or invasive tracking runtime is present',()=>{
  const runtime=[portal,legal,feedback].join('\n')
  assert.doesNotMatch(runtime,/hotjar|clarity\s*\(|posthog|mixpanel/i)
  assert.match(analyticsRuntime,/analytics_storage: analytics \? 'granted' : 'denied'/)
  assert.match(analyticsRuntime,/ad_personalization: 'denied'/)
  assert.match(analyticsRuntime,/loadGoogleTag\(\);\s*if \(choice\)/)
  assert.match(analyticsRuntime,/analytics_storage: choice\?\.analytics \? 'granted' : 'denied'/)
  assert.match(analyticsRuntime,/limited, cookieless page-view signal/)
})

test('downloads use consent-gated events without changing native link behaviour',()=>{
  assert.match(downloadsPage,/src="\/analytics-consent\.js\?v=\d+-\d+"/)
  assert.match(analyticsRuntime,/https:\/\/www\.googletagmanager\.com\/gtag\/js/)
  assert.match(analyticsRuntime,/vfTrackEvent/)
  assert.match(analyticsRuntime,/if \(!choice\?\.analytics \|\| typeof window\.gtag/)
  assert.match(downloadsRuntime,/data-vf-download/)
  assert.match(downloadsRuntime,/vfTrackEvent\('download_pdf'/)
  assert.match(downloadsRuntime,/title: link\.dataset\.vfDownloadTitle/)
  assert.match(downloadsRuntime,/version: link\.dataset\.vfDownloadVersion/)
  assert.doesNotMatch(downloadsRuntime,/preventDefault\s*\(/)
})

test('deployment CSP permits Google Analytics endpoints including published articles without its advertising network',()=>{
  for (const policy of [headers,netlify,articlePublisher]) {
    assert.match(policy,/script-src[^\n"]*https:\/\/www\.googletagmanager\.com/)
    assert.match(policy,/connect-src[^\n"]*https:\/\/\*\.google-analytics\.com/)
    assert.match(policy,/img-src[^\n"]*https:\/\/\*\.google-analytics\.com/)
    assert.doesNotMatch(policy,/simpleanalyticscdn|doubleclick\.net/)
  }
})
