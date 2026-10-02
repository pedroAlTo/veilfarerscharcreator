import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { renderDownloads, syncDownloads } from '../scripts/sync-downloads.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const config = read('netlify.toml');
const headers = read('public/_headers').replace(/\r\n/g, '\n');
const manifest = JSON.parse(read('public/download/downloads.json'));
const page = read('public/downloads.html');

test('canonical host redirects precede access gates and do not target previews', () => {
  const redirects = config.split('[[redirects]]').slice(1).map(block => block.split(/\[\[(?:headers|redirects)\]\]|\[build\]/)[0]);
  const origins = ['https://veilfarers.netlify.app', 'http://veilfarers.netlify.app', 'https://www.veilfarers.com', 'http://www.veilfarers.com', 'http://veilfarers.com'];
  for (const [index, origin] of origins.entries()) {
    assert.ok(redirects[index].includes(`from = "${origin}/*"`));
    assert.ok(redirects[index].includes('to = "https://veilfarers.com/:splat"'));
    assert.match(redirects[index], /status = 301\s+force = true/);
  }
  assert.match(redirects[5], /from = "\/index.html"\s+to = "\/"\s+status = 301\s+force = true/);
  assert.match(redirects[6], /from = "\/player-tool"/);
  assert.doesNotMatch(config, /from\s*=\s*"https?:\/\/\*[^"\n]*netlify\.app/);
});

test('robots permits public pages and downloads while retaining private exclusions', () => {
  const robots = read('public/robots.txt').replace(/\r\n/g, '\n');
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Allow: \/download\/$/m);
  assert.match(robots, /^Sitemap: https:\/\/veilfarers\.com\/sitemap.xml$/m);
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m);
  for (const path of ['/api/', '/reference-data/', '/adventures/', '/admin', '/creator']) {
    assert.ok(robots.split('\n').includes(`Disallow: ${path}`));
  }
  for (const path of ['/', '/downloads.html', '/books/', '/download/', '/behind-the-veil/']) {
    const blocked = [...robots.matchAll(/^Disallow:\s*(\S+)$/gm)].some(match => path.startsWith(match[1]));
    assert.equal(blocked, false, path);
  }
});

test('public sitemap entries exist, declare the canonical domain, and allow indexing', () => {
  const sitemap = read('public/sitemap.xml');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.ok(locations.length >= 12);
  assert.equal(new Set(locations).size, locations.length);
  for (const location of locations) {
    const url = new URL(location);
    assert.equal(url.origin, 'https://veilfarers.com');
    const path = `public${url.pathname}${url.pathname.endsWith('/') ? 'index.html' : ''}`;
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
    const html = read(path);
    assert.ok(html.includes(`<link rel="canonical" href="${location}">`), path);
    assert.doesNotMatch(html, /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i);
  }
});

test('both header sources keep public indexing open and configure downloads consistently', () => {
  const tomlBlock = path => config.split('[[headers]]').slice(1).find(block => block.includes(`for = "${path}"`));
  const staticBlock = path => headers.split('\n\n').find(block => block.split('\n')[0] === path);
  for (const path of ['/*', '/*.html', '/', '/robots.txt', '/sitemap.xml', '/download/*.pdf', '/download/downloads.json', '/rules-data/downloads.json']) {
    assert.ok(tomlBlock(path), path);
    assert.ok(staticBlock(path), path);
    assert.doesNotMatch(tomlBlock(path), /X-Robots-Tag.*noindex/i);
    assert.doesNotMatch(staticBlock(path), /X-Robots-Tag.*noindex/i);
  }
  for (const source of [tomlBlock('/download/*.pdf'), staticBlock('/download/*.pdf')]) {
    assert.match(source, /Content-Type[: =]+"?application\/pdf/);
    assert.match(source, /Content-Disposition[: =]+"?attachment/);
    assert.match(source, /public, max-age=86400, must-revalidate/);
    assert.doesNotMatch(source, /immutable/);
  }
  for (const path of ['/robots.txt', '/sitemap.xml', '/download/downloads.json', '/rules-data/downloads.json']) {
    for (const source of [tomlBlock(path), staticBlock(path)]) assert.match(source, /public, max-age=0, must-revalidate/);
  }
  assert.match(tomlBlock('/admin.html'), /X-Robots-Tag = "noindex/);
});

test('published download cards and all PDF checksums match the current catalogue', () => {
  assert.equal(syncDownloads(page, manifest), page, 'Run npm run sync:downloads after updating the catalogue');
  assert.ok(page.includes(renderDownloads(manifest)));
  assert.equal((page.match(/data-vf-download-group="books"/g) || []).length, 6);
  assert.equal((page.match(/data-vf-download-group="accessories"/g) || []).length, 6);
  assert.ok(page.includes(`<strong id="canonical-release">${manifest.release}</strong>`));
  const links = [...page.matchAll(/href="(\/download\/[^"\s]+\.pdf)" download/g)].map(match => match[1]);
  assert.deepEqual(links, manifest.items.map(item => item.file));
  for (const item of manifest.items) {
    const file = readFileSync(new URL(`../public${item.file}`, import.meta.url));
    assert.equal(file.subarray(0, 5).toString(), '%PDF-');
    assert.equal(file.length, item.bytes, item.id);
    assert.equal(createHash('sha256').update(file).digest('hex'), item.sha256, item.id);
  }
});

test('static rendering escapes catalogue content and excludes withdrawn downloads', () => {
  const rendered = renderDownloads({items: [
    {file: '/download/example.pdf', title: '<script>"&', version: '1.0'},
    {file: '/download/old.pdf', current: false},
    {file: '/download/withdrawn.pdf', lifecycle: 'withdrawn'}
  ]});
  assert.match(rendered, /&lt;script&gt;&quot;&amp;/);
  assert.doesNotMatch(rendered, /<script>|old\.pdf|withdrawn\.pdf/);
  assert.throws(() => renderDownloads({items: [{file: 'javascript:alert(1)'}]}), /Invalid PDF link/);
});

async function runDownloads(fetch) {
  const elements = {
    '#downloads-list': { innerHTML: renderDownloads(manifest), addEventListener() {} },
    '#canonical-release': {textContent: manifest.release},
    '#downloads-status': {textContent: manifest.pdfCandidateStatus}
  };
  runInNewContext(read('public/downloads.js'), {window: {}, document: {querySelector: selector => elements[selector]}, fetch});
  await new Promise(resolve => setImmediate(resolve));
  return elements;
}

test('downloads refresh without the shared runtime or another manifest request', async () => {
  let requests = 0;
  const elements = await runDownloads(async (url, options) => {
    requests++;
    assert.equal(url, '/download/downloads.json');
    assert.equal(options.cache, 'no-cache');
    return {ok: true, json: async () => manifest};
  });
  assert.equal(requests, 1);
  assert.equal(elements['#canonical-release'].textContent, manifest.release);
  assert.equal(elements['#downloads-status'].textContent, manifest.pdfCandidateStatus);
  assert.equal((elements['#downloads-list'].innerHTML.match(/data-vf-download-title=/g) || []).length, manifest.items.length);
});

test('failed or invalid catalogue refreshes never erase working static downloads', async () => {
  const fetches = [
    async () => {throw new Error('Network unavailable');},
    async () => ({ok: false, status: 503}),
    async () => ({ok: true, json: async () => {throw new SyntaxError('Invalid JSON');}}),
    ...[null, {}, {items: []}, {items: [{file: 'https://example.com/book.pdf'}]}].map(payload => async () => ({ok: true, json: async () => payload}))
  ];
  for (const fetch of fetches) {
    const elements = await runDownloads(fetch);
    assert.equal(elements['#downloads-list'].innerHTML, renderDownloads(manifest));
    assert.match(elements['#downloads-status'].textContent, /published PDFs below are still available/);
  }
});
