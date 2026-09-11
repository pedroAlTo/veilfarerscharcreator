import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'

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

test('home feature cards link their full surface to the matching section', () => {
  const home = read('../public/index.html')
  const styles = read('../public/home-cinematic.css')
  const destinations = [
    ['New Ancestries', '#explore'],
    ['Naval Combat', '#stars'],
    ['Augmentations', '#character'],
    ['Economy System', '#character'],
    ['New Powers', '#character'],
    ['Reputation &amp; Factions', '#explore'],
    ['Expanded Lore', '#explore'],
    ['Adventures', '#books']
  ]

  for (const [title, destination] of destinations) {
    assert.match(home, new RegExp(`<a class="vf-feature-card" href="${destination}">[\\s\\S]*?<h2>${title}</h2>`))
  }

  assert.equal((home.match(/<a class="vf-feature-card"/g) || []).length, 8)
  assert.doesNotMatch(home, /<article class="vf-feature-card"/)
  for (const id of ['explore', 'stars', 'character', 'books']) assert.match(home, new RegExp(`id="${id}"`))
  assert.match(styles, /\.vf-feature-card:focus-visible/)
  assert.match(styles, /cursor:pointer/)
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
  assert.match(home, /data-cta-inbox aria-label="Open saved notifications"/)
  assert.match(home, /data-beta-close aria-label="Save beta tester invitation for later"/)
  assert.match(home, /data-beta-delete aria-label="Permanently dismiss beta tester invitation"/)
  assert.match(home, /data-beta-eye-smoke/)
  assert.match(popup, /writeStorage\('sessionStorage', shelvedKey\)/)
  assert.match(popup, /writeStorage\('localStorage', deletedKey\)/)
  assert.match(popup, /vf:cta-inbox-update/)
  assert.match(popup, /target: 'beta'/)
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

test('Repair notice remains independent while the new books have their own notice', () => {
  const home = read('../public/index.html')
  const notice = read('../public/release-notice.js')
  const popup = read('../public/beta-recruitment.js')
  const styles = read('../public/home-cinematic.css')
  const manifest = JSON.parse(read('../public/download/downloads.json'))
  const rust = manifest.items.find(item => item.id === 'rust-and-steel')
  const pdf = readFileSync(new URL('../public/download/VeilFarers_Rust_and_Steel_12.06.pdf', import.meta.url))

  assert.ok(home.indexOf('id="rust-download-correction"') < home.indexOf('id="beta-invitation"'))
  assert.match(home, /Rust &amp; Steel is back in the forge/)
  assert.match(home, /The correct book is available/)
  assert.match(home, /Your feedback keeps this universe running/)
  assert.doesNotMatch(home, /You know who you are/)
  assert.match(home, /kryllian-rust-repair-notice\.png/)
  assert.match(home, /data-release-sparks/)
  assert.match(home, /data-release-minimize aria-label="Minimize Rust and Steel correction"/)
  assert.match(home, /data-release-delete aria-label="Permanently dismiss Rust and Steel correction"/)
  assert.match(notice, /vf-rust-download-fix-shelved-v1/)
  assert.match(notice, /vf-rust-download-fix-deleted-v1/)
  assert.match(notice, /vf:cta-inbox-update/)
  assert.match(notice, /function emitSparkBurst/)
  assert.match(notice, /\{ x: 1001, y: 1149 \}/)
  assert.match(notice, /\{ x: 837, y: 1243 \}/)
  assert.match(notice, /\{ x: 611, y: 1335 \}/)
  assert.match(notice, /rgba\(105,239,255/)
  assert.doesNotMatch(notice, /255,205,96|#ffc753/)
  assert.match(notice, /function drawCableEnergy/)
  assert.match(notice, /emitCableSpark\(\)/)
  assert.match(notice, /\{ x: 676, y: 1092 \}/)
  assert.match(notice, /context\.lineWidth = 15/)
  assert.match(notice, /context\.lineWidth = 8/)
  assert.match(notice, /function drawKryllianEyes/)
  assert.match(notice, /const cycleDuration = 8800/)
  assert.match(notice, /const downGaze = \[\{ x: 489, y: 402 \}, \{ x: 600, y: 395 \}\]/)
  assert.match(notice, /const viewerGaze = \[\{ x: 453, y: 358 \}, \{ x: 615, y: 347 \}\]/)
  assert.match(notice, /const pupilRadii = \[5, 3\.5\]/)
  assert.match(notice, /rgba\(255,211,30,\.99\)/)
  assert.match(notice, /shadowColor = '#ffb814'/)
  assert.match(notice, /pupilRadii\[index\] \+ 1\.15/)
  assert.match(notice, /const workLookX = animate \? Math\.sin\(phase \/ 920\) \* 1\.8/)
  assert.match(notice, /const workInfluence = 1 - viewerWeight/)
  assert.match(notice, /createLinearGradient\(tail\.x, tail\.y, head\.x, head\.y\)/)
  assert.match(notice, /requestAnimationFrame\(sparkLoop\)/)
  assert.match(notice, /reducedMotion\.matches/)
  assert.doesNotMatch(popup, /vfReleaseNoticeBlocking/)
  assert.match(home, /class="vf-beta-inbox vf-cta-inbox"/)
  assert.match(styles, /\.vf-release-modal\.is-closing \.vf-release-card/)
  assert.equal(pdf.length, rust.bytes)
  assert.equal(createHash('sha256').update(pdf).digest('hex'), rust.sha256)
})

test('homepage notices share numbered manual navigation without sharing dismissal state', () => {
  const home = read('../public/index.html')
  const carousel = read('../public/cta-carousel.js')
  const release = read('../public/release-notice.js')
  const beta = read('../public/beta-recruitment.js')
  const styles = read('../public/home-cinematic.css')

  assert.match(home, /data-cta-owner="release"/)
  assert.match(home, /data-cta-owner="beta"/)
  assert.match(home, />01<\/button>/)
  assert.match(home, />02<\/button>/)
  assert.match(home, /aria-label="Previous notice"/)
  assert.match(home, /aria-label="Next notice"/)
  assert.match(home, /cta-carousel\.js\?v=20260911-2/)
  assert.match(home, /kryllian-rust-repair-notice\.png\?v=20260901-1/)
  assert.match(home, /Colour sketch of Xirith's four-armed mechanic/)
  assert.match(carousel, /\['books', 'crossing', 'release', 'beta', 'minis'\]/)
  assert.match(home, /data-cta-owner="minis"/)
  assert.match(carousel, /vf:cta-switch-request/)
  assert.match(carousel, /data-cta-inbox/)
  assert.match(carousel, /Open saved notifications/)
  assert.doesNotMatch(carousel, /lastActiveTarget/)
  assert.match(styles, /\.vf-release-portrait img\{width:100%;height:100%;object-fit:cover;object-position:50% 44%/)
  assert.match(release, /closeNotice\('switch', to\)/)
  assert.match(release, /vf:cta-open/)
  assert.match(beta, /closeInvitation\('switch', to\)/)
  assert.match(beta, /vf:cta-open/)
  assert.match(styles, /\.vf-cta-pagination/)
  assert.match(styles, /\.vf-cta-index\.is-current/)
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
  assert.match(journey, /failIfMajorPerformanceCaveat: false/)
  assert.match(journey, /powerPreference: this\.compactMode \? 'default' : 'high-performance'/)
  assert.doesNotMatch(journey, /hardwareConcurrency/)
  assert.match(journey, /reduceMotion\.addListener\(handleMotionPreference\)/)
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
  assert.match(detail, /book-background\.js\?v=20260831-1/)
})

test('cinematic renderers use an iPhone and Safari compatible WebGL profile', () => {
  const home = read('../public/index.html')
  const journey = read('../public/space-journey.js')
  const background = read('../public/book-background.js')
  const books = [
    '../public/books/corebook.html',
    '../public/books/keepers-companion.html',
    '../public/books/rust-and-steel.html',
    '../public/books/hearts-in-the-void.html',
    '../public/books/alien-archives.html'
  ].map(read)

  assert.match(home, /space-journey\.js\?v=20260902-2/)
  assert.match(journey, /pointer: coarse/)
  assert.match(journey, /this\.compactMode \? 1 : 1\.5/)
  assert.doesNotMatch(journey, /WEBGL_lose_context/)
  assert.match(background, /failIfMajorPerformanceCaveat: false/)
  assert.match(background, /compactMode \? 'default' : 'high-performance'/)
  assert.match(background, /webglcontextlost/)
  assert.match(background, /if \(!context\)/)
  for (const book of books) assert.match(book, /book-detail\.js\?v=\d{8}-\d+/)
})

test('home journey rotates lore destinations without trapping vertical scroll', () => {
  const home = read('../public/index.html')
  const styles = read('../public/home-cinematic.css')
  const journey = read('../public/space-journey.js')

  assert.match(home, /data-scene="destination" data-journey-destination>02 FIRST GARDEN/)
  assert.doesNotMatch(home, />02 PLANET</)
  assert.match(styles, /\.vf-hero\{[^}]*height:106svh/)
  assert.match(styles, /@media\(max-width:1020px\)[\s\S]*?\.vf-hero\{height:104svh/)
  assert.doesNotMatch(styles, /height:3(?:10|00)svh|height:285svh/)
  assert.match(journey, /Math\.max\(0\.72, progress\)/)
  assert.match(journey, /hyperspace\.material\.opacity = hyperspaceWeight \* 0\.28/)
  assert.match(journey, /id: 'first-garden'/)
  assert.match(journey, /id: 'kryxia'/)
  assert.match(journey, /sessionStorage\.getItem\('vf-journey-destination-index'\)/)
  assert.match(journey, /vf-destination/)
  assert.match(journey, /this\.createPlanetTexture\(destination\)/)
  assert.match(journey, /this\.createCityLights\(destination\)/)
  assert.match(journey, /cityCount: 260/)
  assert.match(journey, /cityCount: 72/)
  assert.match(journey, /vNight=1\.0-smoothstep/)
  assert.match(journey, /\.vf-journey-readout \[data-journey-destination\]/)
  assert.match(journey, /\['destination', planetWeight\]/)
  assert.match(styles, /data-journey-destination="first-garden"/)
  assert.match(styles, /data-journey-destination="kryxia"/)
})

test('public discovery pages expose canonical, social and structured metadata', () => {
  const canonicalPages = [
    ['../public/index.html', 'https://veilfarers.com/'],
    ['../public/books/corebook.html', 'https://veilfarers.com/books/corebook.html'],
    ['../public/books/keepers-companion.html', 'https://veilfarers.com/books/keepers-companion.html'],
    ['../public/books/rust-and-steel.html', 'https://veilfarers.com/books/rust-and-steel.html'],
    ['../public/books/hearts-in-the-void.html', 'https://veilfarers.com/books/hearts-in-the-void.html'],
    ['../public/books/alien-archives.html', 'https://veilfarers.com/books/alien-archives.html'],
    ['../public/downloads.html', 'https://veilfarers.com/downloads.html'],
    ['../public/feedback.html', 'https://veilfarers.com/feedback.html']
  ]

  for (const [file, canonical] of canonicalPages) {
    const page = read(file)
    assert.match(page, /<meta name="description" content="[^"]+">/)
    assert.equal(page.includes(`<link rel="canonical" href="${canonical}">`), true)
  }

  for (const [file] of canonicalPages.slice(0, 7)) {
    const page = read(file)
    assert.match(page, /property="og:image" content="https:\/\/veilfarers\.com\//)
    assert.match(page, /name="twitter:card" content="summary_large_image"/)
    const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    assert.ok(blocks.length > 0)
    for (const block of blocks) assert.doesNotThrow(() => JSON.parse(block[1]))
  }

  const robots = read('../public/robots.txt')
  const sitemap = read('../public/sitemap.xml')
  assert.match(robots, /Sitemap: https:\/\/veilfarers\.com\/sitemap\.xml/)
  for (const [, canonical] of canonicalPages) assert.equal(sitemap.includes(`<loc>${canonical}</loc>`), true)
  assert.doesNotMatch(sitemap, /login|creator|charsheet|keeper-tool|player-tool|admin/)
  assert.match(read('../public/login.html'), /<meta name="robots" content="noindex,follow">/)
})

test('every book page offers its own tracked direct PDF download', () => {
  const books = [
    ['corebook.html', '/download/VeilFarers_Corebook_12.06.pdf', 'VeilFarers Corebook', '12.06'],
    ['keepers-companion.html', '/download/VeilFarers_Keepers_Companion_12.06.pdf', "VeilFarers Keeper's Companion", '12.06'],
    ['rust-and-steel.html', '/download/VeilFarers_Rust_and_Steel_12.06.pdf', 'VeilFarers: Rust &amp; Steel', '12.06'],
    ['hearts-in-the-void.html', '/download/VeilFarers_Hearts_in_the_Void_12.06.pdf', 'Hearts in the Void', '12.06'],
    ['alien-archives.html', '/download/VeilFarers_Alien_Species_12.06.pdf', 'VeilFarers: Alien Species', '12.06']
  ]

  for (const [file, href, title, version] of books) {
    const page = read(`../public/books/${file}`)
    assert.equal(page.includes(`href="${href}" download data-vf-download`), true)
    assert.equal(page.includes(`data-vf-download-title="${title}"`), true)
    assert.equal(page.includes(`data-vf-download-version="${version}"`), true)
    assert.equal((page.match(/ data-vf-download(?=[ >])/g) || []).length, file === 'hearts-in-the-void.html' ? 5 : 2)
    assert.match(page, /simple-analytics\.js/)
    assert.match(page, /book-detail\.js\?v=\d{8}-\d+/)
    assert.equal(existsSync(new URL(`../public${href}`, import.meta.url)), true)
  }

  const detail = read('../public/book-detail.js')
  const styles = read('../public/book-detail.css')
  assert.match(detail, /sa_event\('download_pdf'/)
  assert.match(detail, /source: 'book_detail'/)
  assert.match(styles, /\.book-actions \.book-download-action/)
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

test('high-bandwidth transparent artwork uses AVIF with original fallbacks', () => {
  const home = read('../public/index.html')
  const core = read('../public/books/corebook.html')
  const alien = read('../public/books/alien-archives.html')

  assert.match(home, /<source srcset="\/assets\/homepage\/art\/solara-compact-transparent\.avif" type="image\/avif">/)
  assert.match(home, /<img src="\/assets\/homepage\/art\/solara-compact-transparent\.png"/)
  assert.match(core, /<source srcset="\/assets\/optimized\/affiliation\/house-amaranth\.avif" type="image\/avif">/)
  for (let index = 1; index <= 9; index += 1) {
    const name = String(index).padStart(2, '0')
    assert.match(alien, new RegExp(`<source srcset="/assets/optimized/ancestry/${name}\\.avif" type="image/avif">`))
    assert.match(alien, new RegExp(`<img src="/img/ancestry/${name}\\.png"`))
  }

  const pairs = [
    ['../public/assets/homepage/art/solara-compact-transparent.png', '../public/assets/homepage/art/solara-compact-transparent.avif'],
    ['../public/img/affiliation/house-amaranth.webp', '../public/assets/optimized/affiliation/house-amaranth.avif'],
    ...Array.from({ length: 9 }, (_, offset) => {
      const name = String(offset + 1).padStart(2, '0')
      return [`../public/img/ancestry/${name}.png`, `../public/assets/optimized/ancestry/${name}.avif`]
    })
  ]
  const totals = pairs.reduce((result, [fallback, optimized]) => {
    const fallbackUrl = new URL(fallback, import.meta.url)
    const optimizedUrl = new URL(optimized, import.meta.url)
    assert.equal(existsSync(optimizedUrl), true)
    result.fallback += statSync(fallbackUrl).size
    result.optimized += statSync(optimizedUrl).size
    return result
  }, { fallback: 0, optimized: 0 })

  assert.ok(totals.optimized < totals.fallback * 0.25)
})
