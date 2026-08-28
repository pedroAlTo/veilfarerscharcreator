import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('Character Vault controls are unavailable until friend access is confirmed', () => {
  const page = read('../public/login.html')
  const account = read('../public/account.js')
  assert.match(page, /id="vault-controls"[^>]*\bhidden\b[^>]*aria-hidden="true"/)
  assert.match(page, /id="new-character"[^>]*\bdisabled\b/)
  assert.match(page, /id="vault-panel"[^>]*\bhidden\b[^>]*aria-hidden="true"/)
  assert.match(account, /userRoles\(user\)\.has\('friend'\)/)
  assert.match(account, /new-character'\)\.addEventListener\('click',\(\)=>\{if\(requireFriendAccess\(\)\)/)
  assert.match(account, /Local test mode does not bypass friend authorization/)
})

test('legacy navigation is a separate deny-by-default friend pane', () => {
  const navigation = read('../public/friend-navigation.js')
  const portal = read('../public/portal.js')
  assert.match(navigation, /navigation\.hidden = true/)
  assert.match(navigation, /roles\.has\('friend'\)/)
  assert.doesNotMatch(navigation, /has\('admin'\)/)
  assert.match(navigation, /Character Creator/)
  assert.match(navigation, /Stellar Encyclopedia/)
  assert.doesNotMatch(portal, /data-vf-private="1"/)
})

test('public navigation keeps the cinematic wordmark and complete link sequence', () => {
  const home = read('../public/index.html')
  const portal = read('../public/portal.js')
  const core = read('../public/books/corebook.html')
  const keeper = read('../public/books/keepers-companion.html')
  const rust = read('../public/books/rust-and-steel.html')
  const hearts = read('../public/books/hearts-in-the-void.html')
  const labels = ['Home', 'Setting', 'Core', 'Keeper', 'Rust &amp; Steel', 'Hearts in the Void', 'Alien Archives', 'Downloads', 'Features', 'Feedback']
  for (const source of [home, portal, core, keeper, rust, hearts]) {
    assert.match(source, /vf-wordmark-mark/)
    const publicMarker = source.indexOf('Public navigation')
    const portalMarker = source.indexOf('<div class="vf-portal-nav-track">')
    const navigation = source.slice(publicMarker >= 0 ? publicMarker : portalMarker)
    let previous = -1
    for (const label of labels) {
      assert.ok(navigation.includes(label), `missing ${label}`)
      const current = navigation.indexOf(label)
      assert.ok(current > previous, `${label} is out of order`)
      previous = current
    }
    assert.ok(!navigation.includes('>Gallery<'), 'obsolete Gallery navigation item remains')
  }
})
