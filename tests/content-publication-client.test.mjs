import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../public/content-schedule.js', import.meta.url), 'utf8');
const defaults = JSON.parse(readFileSync(new URL('../public/data/cta-schedule.json', import.meta.url), 'utf8'));
function setup({ local = false, response = structuredClone(defaults) } = {}) {
  let now = Date.parse('2026-09-27T12:00:00Z');
  let answer = response;
  const requests = [], timers = new Map(), listeners = {}, article = { dataset: { publicationArticle: 'drones' }, hidden: true };
  let timerId = 0;
  const empty = { hidden: true, textContent: '' };
  const dialog = { dataset: { ctaNotice: 'pricing' }, open: false, close() { this.open = false; } };
  const document = {
    hidden: false, addEventListener() {}, querySelector() { return null; },
    querySelectorAll(selector) { return selector === '[data-publication-article]' ? [article] : selector === '[data-publication-empty]' ? [empty] : dialog.open ? [dialog] : []; }
  };
  const window = { addEventListener(name, fn) { (listeners[name] ||= []).push(fn); }, dispatchEvent(event) { (listeners[event.type] || []).forEach(fn => fn(event)); } };
  class Clock extends Date { static now() { return now; } }
  vm.runInNewContext(source, { window, document, location: { hostname: local ? 'localhost' : 'publication.test' }, Date: Clock, AbortSignal,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    setInterval() {}, clearTimeout(id) { timers.delete(id); }, setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, at: now + delay }); return id; },
    fetch: async url => { requests.push(url); const body = url.endsWith('.json') ? defaults : answer; return body instanceof Error ? { ok: false } : { ok: true, json: async () => structuredClone(body) }; }
  });
  return { window, article, empty, dialog, requests, setResponse: value => { answer = value; }, advance(ms) { now += ms; const due = [...timers].filter(([,timer]) => timer.at <= now); due.forEach(([id,timer]) => { timers.delete(id); timer.fn(); }); } };
}

test('public schedules use server time and activate/expire without a reload', async () => {
  const config = structuredClone(defaults);
  config.serverNow = '2026-09-28T12:00:00Z';
  config.articles.drones.startsAt = '2026-09-28T12:00:01Z';
  config.articles.drones.endsAt = '2026-09-28T12:00:02Z';
  const env = setup({ response: config });
  await env.window.VFPublication.refresh();
  assert.equal(env.article.hidden, true);
  env.advance(1000);
  assert.equal(env.article.hidden, false);
  env.advance(1000);
  assert.equal(env.article.hidden, true);
});

test('production failures hide entries and close notices without enabling bundled defaults', async () => {
  const env = setup();
  await env.window.VFPublication.refresh();
  env.dialog.open = true;
  env.setResponse(new Error('storage unavailable'));
  await env.window.VFPublication.refresh();
  assert.equal(env.article.hidden, true);
  assert.equal(env.dialog.open, false);
  assert.equal(env.empty.hidden, false);
  assert.match(env.empty.textContent, /could not be loaded/);
  assert.equal(env.requests.includes('/data/cta-schedule.json'), false);
  env.setResponse(defaults);
  await env.window.VFPublication.refresh();
  assert.equal(env.article.hidden, false);
});

test('static localhost preview alone can use bundled publication settings', async () => {
  const env = setup({ local: true, response: new Error('no functions') });
  await env.window.VFPublication.refresh();
  assert.equal(env.article.hidden, false);
  assert.equal(env.requests.includes('/data/cta-schedule.json'), true);
});

test('disabled CTA cannot reopen from a delayed carousel event', async () => {
  const config = structuredClone(defaults); config.notices.pricing.enabled = false;
  const env = setup({ response: config });
  await env.window.VFPublication.refresh();
  let prevented = false;
  env.window.dispatchEvent({ type: 'vf:cta-open', detail: { target: 'pricing' }, stopImmediatePropagation() { prevented = true; } });
  assert.equal(prevented, true);
});
