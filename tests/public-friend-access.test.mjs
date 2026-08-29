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
  const alien = read('../public/books/alien-archives.html')
  const labels = ['Home', 'Setting', 'Core', 'Keeper', 'Rust &amp; Steel', 'Hearts in the Void', 'Alien Archives', 'Downloads', 'Features', 'Feedback']
  for (const source of [home, portal, core, keeper, rust, hearts, alien]) {
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

test('each public book declares its cinematic theme without relying on the deployed URL shape', () => {
  const books = [
    ['../public/books/corebook.html', 'core'],
    ['../public/books/keepers-companion.html', 'keeper'],
    ['../public/books/rust-and-steel.html', 'rust'],
    ['../public/books/hearts-in-the-void.html', 'hearts'],
    ['../public/books/alien-archives.html', 'alien']
  ]
  for (const [path, theme] of books) {
    assert.match(read(path), new RegExp(`data-book-theme="${theme}"`))
  }
  const detail = read('../public/book-detail.js')
  assert.match(detail, /document\.body\.dataset\.bookTheme \|\| bookThemes\[routeName\] \|\| ''/)
  assert.doesNotMatch(detail, /\|\| 'core'/)
})

test('Alien Archives presents the book features, nine peoples and a reduced-motion-safe DNA backdrop', () => {
  const page = read('../public/books/alien-archives.html')
  const styles = read('../public/book-detail.css')
  const background = read('../public/book-background.js')
  assert.match(page, /alien-archives-lab-v1\.webp/)
  assert.equal((page.match(/class="species-card"/g) || []).length, 9)
  assert.equal((page.match(/class="feature-panel"/g) || []).length, 9)
  assert.match(styles, /data-book-theme="alien"/)
  assert.match(background, /theme === 'alien'/)
  assert.match(background, /drawAlienDNA/)
  assert.match(background, /prefers-reduced-motion: reduce/)
})

test('all public surfaces use the same fixed navigation contract without revealing role links', () => {
  const home = read('../public/index.html')
  const portal = read('../public/portal.js')
  const friendNavigation = read('../public/friend-navigation.js')
  const navigation = read('../public/public-navigation.css')
  assert.match(home, /public-navigation\.css\?v=20260829-2/)
  assert.match(portal, /vf-site-header vf-portal-nav/)
  assert.match(portal, /public-navigation\.css\?v=20260829-2/)
  assert.match(navigation, /position:fixed!important/)
  assert.match(navigation, /\.vf-portal-nav-track>\[hidden\]\{display:none!important;visibility:hidden!important\}/)
  assert.match(navigation, /\.vf-portal-nav-track>a:hover::after/)
  const publicNavigationEnd = portal.indexOf('</nav>', portal.indexOf('vf-public-nav vf-portal-nav-track'))
  assert.ok(portal.indexOf('id="vf-nav-character-id"') > publicNavigationEnd, 'character picker must stay outside the public navigation row')
  assert.match(portal, /friendNavigation\.appendChild\(characterBadge\)/)
  assert.match(friendNavigation, /vf:friend-navigation-ready/)
  assert.doesNotMatch(portal, /accountLabel\.textContent=signedIn\?'Logged in'/)
  assert.match(navigation, /\.vf-portal-nav \.vf-nav-account\{width:76px!important/)
})
