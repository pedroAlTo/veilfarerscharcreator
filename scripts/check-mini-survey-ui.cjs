// Local browser QA. Requests to external services are blocked; votes are simulated.
const { chromium, webkit } = require(process.env.VF_PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { join } = require('node:path');

(async () => {
  const root = process.env.VF_PREVIEW_URL || 'http://127.0.0.1:8890';
  const output = process.env.VF_QA_OUTPUT || 'output/mini-survey-qa';
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.VF_BROWSER_CHANNEL || 'msedge' });
  const failures = [];
  async function context(options = {}) {
    const ctx = await browser.newContext(options);
    ctx.setDefaultTimeout(10000);
    await ctx.route('**/*', route => new URL(route.request().url()).origin === root ? route.continue() : route.abort());
    return ctx;
  }
  async function run(name, fn) {
    try { await fn(); console.log('PASS ' + name); }
    catch (error) { failures.push(name + ': ' + error.message); console.error('FAIL ' + name + ': ' + error.message); }
  }
  await run('desktop draft, selection, navigation, saving, deleting and direct reopening', async () => {
    const ctx = await context({ viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(root + '/#minis');
    await page.locator('#mini-invitation[open]').waitFor();
    assert.equal(await page.locator('[data-mini-choices] input').count(), 9);
    assert.equal(await page.locator('[data-mini-submit]').isDisabled(), true);
    await page.getByRole('radio', { name: /Kryllian/ }).check();
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(output, 'minis-desktop.png') });
    await page.locator('[data-mini-close]').click();
    await page.waitForTimeout(1700);
    assert.equal(await page.locator('dialog[open]').count(), 0);
    await page.locator('[data-cta-inbox]').click();
    await page.locator('#rust-download-correction[open]').waitFor();
    await page.locator('[data-cta-owner="release"] [data-cta-target="minis"]').click();
    await page.locator('#mini-invitation[open]').waitFor();
    await page.locator('[data-cta-owner="minis"] [data-cta-target="beta"]').click();
    await page.locator('#beta-invitation[open]').waitFor();
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('dialog[open]').count(), 1);
    await page.locator('[data-cta-owner="beta"] [data-cta-target="minis"]').click();
    await page.locator('#mini-invitation[open]').waitFor();
    await page.locator('[data-mini-delete]').click();
    await page.waitForTimeout(850);
    await page.locator('[data-cta-inbox]').click();
    await page.locator('#rust-download-correction[open]').waitFor();
    assert.equal(await page.locator('[data-cta-owner="release"] [data-cta-target="minis"]').isDisabled(), true);
    await page.locator('[data-release-delete]').click();
    await page.waitForTimeout(1000);
    await page.locator('[data-cta-inbox]').click();
    await page.locator('#beta-invitation[open]').waitFor();
    await page.locator('[data-beta-delete]').click();
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('[data-cta-inbox]').isDisabled(), true);
    await page.reload();
    await page.locator('#mini-invitation[open]').waitFor();
    assert.equal(await page.locator('dialog[open]').count(), 1);
    assert.deepEqual(errors, []);
    await ctx.close();
  });
  for (const width of [320, 390, 768]) await run('mobile ' + width + 'px, no sideways scroll, accessible controls', async () => {
    const ctx = await context({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(root + '/#minis');
    await page.locator('#mini-invitation[open]').waitFor();
    const sizes = await page.evaluate(() => {
      const card = document.querySelector('.vf-mini-card');
      return { viewport: innerWidth, document: document.documentElement.scrollWidth, card: card.clientWidth, content: card.scrollWidth };
    });
    assert.ok(sizes.document <= sizes.viewport + 1, JSON.stringify(sizes));
    assert.ok(sizes.content <= sizes.card + 1, JSON.stringify(sizes));
    assert.equal(await page.locator('.vf-mini-receiver').evaluate(el => getComputedStyle(el, '::before').animationName), 'none');
    await page.screenshot({ path: join(output, 'minis-mobile-' + width + '.png') });
    await page.getByRole('radio', { name: /Synthetic/ }).check();
    await page.screenshot({ path: join(output, 'minis-mobile-vote-' + width + '.png') });
    await page.locator('[data-mini-close]').click();
    assert.equal(await page.locator('dialog[open]').count(), 0);
    await ctx.close();
  });
  await run('open survey transmits only chosen ancestry and prevents accidental double submit', async () => {
    const ctx = await context();
    const page = await ctx.newPage();
    let posts = 0;
    await page.route('**/mini-campaign.mjs*', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('opensAt: null', "opensAt: '2026-09-09T00:00:00Z'") });
    });
    await page.route('**/api/ancestry-vote', async route => {
      if (route.request().method() === 'POST') {
        posts++;
        assert.deepEqual(route.request().postDataJSON(), { campaignId: 'ancestry-minis-01', ancestry: 'ethereal' });
        await new Promise(resolve => setTimeout(resolve, 200));
        await route.fulfill({ json: { accepted: true, campaignId: 'ancestry-minis-01' } });
      } else await route.fulfill({ json: { campaignId: 'ancestry-minis-01', state: 'open', opensAt: '2026-09-09T00:00:00Z', closesAt: '2026-09-16T00:00:00Z', serverNow: '2026-09-09T12:00:00Z' } });
    });
    await page.goto(root + '/#minis');
    await page.locator('#mini-invitation[open]').waitFor();
    await page.getByRole('radio', { name: /Ethereal/ }).check();
    const storedBefore = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
    await page.locator('[data-mini-submit]').click();
    await page.getByRole('button', { name: 'Signal received' }).waitFor();
    assert.equal(posts, 1);
    assert.equal(await page.locator('[data-mini-submit]').isDisabled(), true);
    assert.equal(await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)])), storedBefore);
    await ctx.close();
  });
  await run('Alien Species links to the campaign', async () => {
    const ctx = await context(); const page = await ctx.newPage();
    await page.goto(root + '/books/alien-archives.html#mini-expansions');
    await page.locator('#mini-expansions a').click();
    await page.locator('#mini-invitation[open]').waitFor();
    await ctx.close();
  });
  await run('keyboard focus stays in the dialog; Escape saves it even with storage blocked', async () => {
    const ctx = await context({ reducedMotion: 'reduce' });
    await ctx.addInitScript(() => {
      for (const key of ['localStorage', 'sessionStorage']) Object.defineProperty(window, key, { get() { throw new DOMException('Storage disabled', 'SecurityError'); } });
    });
    const page = await ctx.newPage();
    await page.goto(root + '/#minis');
    await page.locator('#mini-invitation[open]').waitFor();
    for (let index = 0; index < 16; index++) {
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.querySelector('#mini-invitation').contains(document.activeElement)), true, 'Focus left dialog at tab ' + index + ': ' + await page.evaluate(() => document.activeElement.outerHTML.slice(0, 180)));
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.equal(await page.locator('[data-cta-inbox]').evaluate(el => el === document.activeElement), true);
    await ctx.close();
  });
  await run('failed submission never becomes a success confirmation', async () => {
    const ctx = await context(); const page = await ctx.newPage();
    await page.route('**/mini-campaign.mjs*', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('opensAt: null', "opensAt: '2026-09-09T00:00:00Z'") });
    });
    await page.route('**/api/ancestry-vote', route => route.request().method() === 'POST'
      ? route.fulfill({ status: 503, json: { error: 'We could not confirm your vote. Please try again later.' } })
      : route.fulfill({ json: { campaignId: 'ancestry-minis-01', state: 'open', opensAt: '2026-09-09T00:00:00Z', closesAt: '2026-09-16T00:00:00Z' } }));
    await page.goto(root + '/#minis');
    await page.locator('#mini-invitation[open]').waitFor();
    await page.getByRole('radio', { name: /Human/ }).check();
    await page.locator('[data-mini-submit]').click();
    await page.locator('[data-mini-message].is-error').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Signal received' }).count(), 0);
    assert.equal(await page.locator('[data-mini-submit]').isDisabled(), false);
    await ctx.close();
  });
  await browser.close();
  try {
    const safari = await webkit.launch({ headless: true });
    const page = await safari.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.route('**/*', route => new URL(route.request().url()).origin === root ? route.continue() : route.abort());
    await page.goto(root + '/#minis');
    await page.locator('#mini-invitation[open]').waitFor();
    assert.equal(await page.locator('[data-mini-choices] input').count(), 9);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.vf-mini-card')).opacity === '1');
    await page.screenshot({ path: join(output, 'minis-webkit.png') });
    await safari.close();
    console.log('PASS WebKit mobile rendering');
  } catch (error) { failures.push('WebKit: ' + error.message); }
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
})().catch(error => { console.error(error); process.exitCode = 1; });
