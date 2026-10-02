import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { SECTORS, selectSector, heartOrigin, heartPulse } from '../public/hearts-briefing.mjs';

const html = readFileSync(new URL('../public/books/hearts-in-the-void.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/hearts-briefing.css', import.meta.url), 'utf8');

test('Hearts retains its canonical, shared navigation, analytics and both direct downloads', () => {
  assert.match(html, /rel="canonical" href="https:\/\/veilfarers.com\/books\/hearts-in-the-void.html"/);
  assert.match(html, /data-site-header/);
  assert.match(html, /public-navigation\.css\?v=20260829-8/);
  assert.match(html, /analytics-consent\.js/);
  assert.equal([...html.matchAll(/data-vf-download-title="Hearts in the Void"/g)].length, 2);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.match(html, /id="adventure"/);
  assert.match(html, /data-book-background="custom"/);
});

test('all five sectors have native fallback links and readable, unhidden HTML content', () => {
  for (const sector of SECTORS) {
    assert.match(html, new RegExp(`href="#sector-${sector}"`));
    assert.match(html, new RegExp(`<article id="sector-${sector}" data-sector-panel="${sector}">`));
    assert.match(html, new RegExp(`data-map-sector="${sector}"`));
  }
  assert.match(html, /not a floor plan/);
  assert.doesNotMatch(html, /Hidden Kurogane|Queen.s Lair|STERILIZE/);
  assert.doesNotMatch(html, /<article[^>]*hidden/);
});

test('sector selection updates text visibility, navigation and map together; rejects unknown sectors', () => {
  const panels = SECTORS.map(sector => ({ dataset: { sectorPanel: sector }, hidden: false }));
  const links = SECTORS.map(sector => ({ dataset: { sector }, attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, removeAttribute(key) { delete this.attributes[key]; } }));
  const groups = SECTORS.map(sector => ({ dataset: { mapSector: sector }, classList: { active: false, toggle(_name, value) { this.active = value; } } }));
  const fakeConsole = { querySelectorAll(selector) { return ({ '[data-sector-panel]': panels, '[data-sector]': links, '[data-map-sector]': groups })[selector]; } };
  for (const sector of SECTORS) {
    assert.equal(selectSector(fakeConsole, sector), true);
    assert.deepEqual(panels.filter(panel => !panel.hidden).map(panel => panel.dataset.sectorPanel), [sector]);
    assert.deepEqual(links.filter(link => link.attributes['aria-current'] === 'true').map(link => link.dataset.sector), [sector]);
    assert.deepEqual(groups.filter(group => group.classList.active).map(group => group.dataset.mapSector), [sector]);
  }
  assert.equal(selectSector(fakeConsole, '__proto__'), false);
  assert.equal(selectSector(fakeConsole, 'unknown'), false);
  assert.equal(panels.filter(panel => !panel.hidden)[0].dataset.sectorPanel, 'research');
});

test('heart emitter matches source image and responsive object-fit cover cropping', () => {
  assert.deepEqual(heartOrigin(1920, 1080, 1920, 1080), { x: 482, y: 675, scale: 1 });
  assert.deepEqual(heartOrigin(960, 540, 1920, 1080), { x: 241, y: 337.5, scale: .5 });
  const mobile = heartOrigin(390, 540, 1920, 1080, .2, .5);
  assert.equal(mobile.x, 127);
  assert.equal(mobile.y, 337.5);
  const desktop = heartOrigin(1440, 900, 1920, 1080);
  assert.ok(Math.abs(desktop.x - 321.6666667) < .001);
  assert.equal(desktop.y, 562.5);
});

test('heart pulse is gentle and periodic, with a long resting interval', () => {
  assert.ok(heartPulse(.55) > 1);
  assert.ok(heartPulse(1.15) > .5);
  assert.ok(heartPulse(3) < .001);
  for (let time = 0; time < 5.4; time += .05) {
    assert.ok(heartPulse(time) >= 0 && heartPulse(time) < 1.1);
    assert.ok(Math.abs(heartPulse(time) - heartPulse(time + 5.4)) < .00001);
  }
});

test('pilot assets exist, motion can be disabled and background is not fixed to scrolling', () => {
  const resources = [...html.matchAll(/(?:href|src)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)].map(match => match[1]);
  for (const resource of resources.filter(resource => /\.(?:mjs|js|css|webp|pdf|png|svg|ico|webmanifest)$/.test(resource))) {
    assert.ok(existsSync(new URL('../public' + resource, import.meta.url)), resource);
  }
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /\.hv-scene\{position:absolute/);
  assert.doesNotMatch(css, /scroll-snap|animation-timeline|overflow-y:hidden/);
  const script = readFileSync(new URL('../public/hearts-briefing.mjs', import.meta.url), 'utf8');
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /document\.hidden/);
  assert.match(script, /if \(!context\) return/);
  assert.doesNotMatch(script, /fetch\(|localStorage|sessionStorage|WebGL/);
});
