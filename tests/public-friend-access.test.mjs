import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

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
  const labels = ['Home', 'Setting', 'Core', 'Keeper', 'Rust &amp; Steel', 'Hearts in the Void', 'Alien Species', 'Downloads', 'Features', 'Feedback']
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

test('Alien Species presents the book features, nine peoples and a reduced-motion-safe DNA backdrop', () => {
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
  assert.match(home, /public-navigation\.css\?v=20260829-8/)
  assert.match(portal, /vf-site-header vf-portal-nav/)
  assert.match(portal, /public-navigation\.css\?v=20260829-8/)
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

test('home book shelf keeps the cover artwork unobstructed', () => {
  const home = read('../public/index.html')
  const styles = read('../public/home-cinematic.css')
  assert.doesNotMatch(home, /Recommended for starting players|vf-book-recommendation/)
  assert.doesNotMatch(styles, /vf-book-recommendation/)
})

test('home explains the recommended starting routes without covering book art', () => {
  const home = read('../public/index.html')
  assert.match(home, /Where to start/)
  assert.match(home, /Recommended for every new group/)
  assert.match(home, /Recommended for the Keeper/)
  assert.match(home, /Recommended first adventure/)
  for (const href of ['corebook.html', 'keepers-companion.html', 'hearts-in-the-void.html']) assert.match(home, new RegExp(href))
})

test('home launch invitation is an accessible dismissible beta popup', () => {
  const home = read('../public/index.html')
  const popup = read('../public/beta-recruitment.js')
  const styles = read('../public/home-cinematic.css')
  assert.match(home, /<dialog class="vf-beta-modal"/)
  assert.match(home, /VeilFarers wants you/)
  assert.match(home, /as a beta tester!/)
  assert.match(home, /veilfarers\.com\/feedback/)
  assert.match(home, /ethereal-beta-recruitment-v2\.webp/)
  assert.match(home, /data-beta-inbox aria-label="Open beta tester invitation"/)
  assert.match(home, /data-beta-close aria-label="Save beta tester invitation for later"/)
  assert.match(home, /data-beta-delete aria-label="Permanently dismiss beta tester invitation"/)
  assert.match(home, /data-beta-eye-smoke/)
  assert.match(popup, /writeStorage\(sessionStorage, shelvedKey\)/)
  assert.match(popup, /writeStorage\(localStorage, deletedKey\)/)
  assert.match(popup, /inbox\.addEventListener\('click', openInvitation\)/)
  assert.match(popup, /inbox\.disabled = deleted/)
  assert.match(popup, /function drawEyeSmoke\(time, animate = true\)/)
  assert.match(popup, /createRadialGradient\(eye\.x, eye\.y/)
  assert.match(popup, /globalCompositeOperation = 'lighter'/)
  assert.match(popup, /requestAnimationFrame\(eyeSmokeLoop\)/)
  assert.match(popup, /event\.preventDefault\(\)/)
  assert.match(styles, /\.vf-beta-inbox\.is-active/)
  assert.match(styles, /\.vf-beta-eye-smoke/)
  assert.match(styles, /\.vf-beta-inbox\{top:74px;right:26px;width:22px;height:16px;padding:0;border:0;background:transparent/)
  assert.match(styles, /\.vf-beta-delete/)
  assert.match(styles, /@keyframes vf-beta-card-flip-out/)
  assert.match(styles, /rotateY\(92deg\)/)
})

test('mobile navigation stays in the viewport and cinematic visuals select themselves', () => {
  const home = read('../public/index.html')
  const journey = read('../public/space-journey.js')
  const navigation = read('../public/public-navigation.css')
  const navigationScript = read('../public/public-navigation.js')
  const portal = read('../public/portal.js')

  assert.doesNotMatch(home, /data-visual-choice|vf-visual-control/)
  assert.doesNotMatch(journey, /vf-home-visuals|storedChoice|saveChoice/)
  assert.match(journey, /function supportsWebGL\(\)/)
  assert.match(journey, /failIfMajorPerformanceCaveat: true/)
  assert.match(journey, /sustained-low-fps/)
  assert.match(journey, /prefers-reduced-motion: reduce/)
  assert.match(navigation, /overflow-x:clip/)
  assert.match(navigation, /\.vf-site-header\.is-open,.book-nav\.is-open,.vf-portal-nav\.is-open\{clip-path:none!important\}/)
  assert.match(navigation, /min-width:44px!important;min-height:44px!important/)
  assert.match(home, /public-navigation\.js\?v=20260829-2/)
  assert.match(navigationScript, /toggle\.setAttribute\('aria-controls', menu\.id\)/)
  assert.match(navigationScript, /event\.key === 'Escape'/)
  assert.doesNotMatch(journey, /data-nav-toggle|is-open/)
  assert.match(portal, /event\.key==='Escape'/)
  assert.match(navigation, /@media\(max-width:680px\)/)
  assert.match(navigation, /\.vf-public-nav a\[aria-current\]::after.*transform:scaleY\(1\)!important/)
})

test('public background changes use a reduced-motion-safe FTL transition', () => {
  const home = read('../public/index.html')
  const core = read('../public/books/corebook.html')
  const downloads = read('../public/downloads.html')
  const transition = read('../public/public-transition.js')
  const transitionInit = read('../public/public-transition-init.js')
  const navigation = read('../public/public-navigation.css')

  for (const source of [home, core, downloads]) assert.match(source, /public-transition\.js\?v=20260829-2/)
  for (const source of [home, core, downloads]) assert.match(source, /public-transition-init\.js\?v=20260829-1/)
  assert.match(transition, /prefers-reduced-motion: reduce/)
  assert.match(transition, /sessionStorage\.setItem\(STORAGE_KEY, '1'\)/)
  assert.match(transition, /sameDocument/)
  assert.match(transition, /createTransition\('exiting'\)/)
  assert.match(transition, /document\.createElement\('canvas'\)/)
  assert.match(transition, /globalCompositeOperation = 'lighter'/)
  assert.match(transition, /const starCount = compact \? 360 : 720/)
  assert.doesNotMatch(transition, /vf-ftl-flare/)
  assert.match(transitionInit, /document\.documentElement\.classList\.add\('vf-ftl-arriving'\)/)
  assert.match(navigation, /\.vf-ftl-canvas/)
  assert.match(navigation, /html\.vf-ftl-arriving body>\*:not\(\.vf-ftl-transition\):not\(\.vf-space\):not\(\.book-atmosphere\)/)
  assert.match(navigation, /\.vf-ftl-transition\{display:none!important\}/)
})

test('cinematic backgrounds render once without first-scroll reframing', () => {
  const home = read('../public/home-cinematic.css')
  const bookStyles = read('../public/book-detail.css')
  const bookScript = read('../public/book-background.js')
  const detail = read('../public/book-detail.js')

  assert.match(home, /\.vf-space\{[^}]*height:100lvh/)
  assert.doesNotMatch(home, /\.vf-space-static\{[^}]*scale\(1\.015\)/)
  assert.match(bookStyles, /\.book-atmosphere\.is-ready\{opacity:1\}/)
  assert.match(bookStyles, /book-cinematic-ready\[data-book-theme="core"\]::before[^}]*opacity:0/)
  assert.match(bookScript, /canvas\.clientHeight \|\| innerHeight/)
  assert.match(bookScript, /canvas\.classList\.add\('is-ready'\)/)
  assert.match(detail, /book-background\.js\?v=20260829-3/)
})

test('Hearts background emits a denser twinkling particle field from the heart core', () => {
  const background = read('../public/book-background.js')
  assert.match(background, /selectedTheme === 'hearts' \? \(width < 720 \? 96 : 180\)/)
  assert.match(background, /const sourceX = width \* \.247/)
  assert.match(background, /const sourceY = height \* \.605/)
  assert.match(background, /particle\.twinkle/)
})

test('public editorial pages publish the complete VeilFarers favicon set', () => {
  const pages = [
    '../public/index.html',
    '../public/downloads.html',
    '../public/feedback.html',
    '../public/login.html',
    '../public/legal.html',
    '../public/books/corebook.html',
    '../public/books/keepers-companion.html',
    '../public/books/rust-and-steel.html',
    '../public/books/hearts-in-the-void.html',
    '../public/books/alien-archives.html'
  ]

  for (const page of pages) {
    const source = read(page)
    assert.match(source, /rel="icon" href="\/favicon\.ico"/)
    assert.match(source, /rel="icon" href="\/favicon\.svg" type="image\/svg\+xml"/)
    assert.match(source, /rel="apple-touch-icon" href="\/apple-touch-icon\.png"/)
    assert.match(source, /rel="manifest" href="\/site\.webmanifest"/)
  }

  for (const asset of ['favicon.ico', 'favicon.svg', 'favicon-96x96.png', 'apple-touch-icon.png', 'web-app-manifest-192x192.png', 'web-app-manifest-512x512.png']) {
    assert.equal(existsSync(new URL(`../public/${asset}`, import.meta.url)), true)
  }

  const manifest = JSON.parse(read('../public/site.webmanifest'))
  assert.equal(manifest.name, 'VeilFarers')
  assert.equal(manifest.theme_color, '#03060a')
})
