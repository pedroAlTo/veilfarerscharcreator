// Seek the actual CSS animations to verify beam/echo alignment in both engines.
const { chromium, webkit } = require(process.env.VF_PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { join } = require('node:path');

(async () => {
  const root = process.env.VF_PREVIEW_URL || 'http://127.0.0.1:8890';
  const output = process.env.VF_QA_OUTPUT || 'output/mini-survey-qa';
  mkdirSync(output, { recursive: true });
  for (const [name, engine, options] of [
    ['Edge', chromium, { channel: process.env.VF_BROWSER_CHANNEL || 'msedge' }],
    ['WebKit', webkit, {}]
  ]) {
    const browser = await engine.launch({ headless: true, ...options });
    try {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await page.route('**/*', route => new URL(route.request().url()).origin === root ? route.continue() : route.abort());
      await page.goto(root + '/#minis');
      await page.locator('#mini-invitation[open]').waitFor();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.vf-mini-card')).opacity === '1');
      const initial = await page.locator('.vf-mini-receiver').evaluate(receiver => {
        const animations = receiver.getAnimations({ subtree: true });
        const scan = animations.find(animation => animation.animationName === 'vf-mini-scan');
        const echoes = [...receiver.querySelectorAll('i')].map(signal => signal.getAnimations()[0]);
        return { duration: scan.effect.getTiming().duration, start: scan.startTime, delays: echoes.map(echo => echo.effect.getTiming().delay), starts: echoes.map(echo => echo.startTime) };
      });
      assert.equal(initial.duration, 16000);
      assert.equal(initial.delays.length, 9);
      initial.delays.forEach((delay, index) => assert.ok(Math.abs(delay - index * 16000 / 9) < 1));
      initial.starts.forEach(start => assert.ok(Math.abs(start - initial.start) < 20, 'Sweep and echoes must start within one display frame: ' + JSON.stringify(initial)));
      const sample = time => page.locator('.vf-mini-receiver').evaluate(async (receiver, time) => {
        for (const animation of receiver.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = time; }
        await new Promise(requestAnimationFrame);
        const matrix = new DOMMatrix(getComputedStyle(receiver, '::before').transform);
        return { angle: (Math.atan2(matrix.b, matrix.a) * 180 / Math.PI + 360) % 360, opacities: [...receiver.querySelectorAll('i')].map(signal => Number(getComputedStyle(signal).opacity)) };
      }, time);
      const first = await sample(0);
      assert.equal(first.opacities[0], 1);
      assert.ok(first.opacities.slice(1).every(opacity => opacity === 0), 'No signals visible before first contact');
      for (const turn of [0, 1]) {
        for (let index = 0; index < 9; index++) {
          const contact = turn * 16000 + index * 16000 / 9;
          if (contact > 0) assert.equal((await sample(contact - 20)).opacities[index], 0, 'Signal must be dark before contact');
          const hit = await sample(contact + 20);
          assert.ok(Math.abs(hit.angle - (index * 40 + .45)) < .05, 'Beam must cross the signal');
          assert.ok(hit.opacities[index] > .98, 'Signal lights up at contact');
          const fading = await sample(contact + 2100);
          assert.ok(fading.opacities[index] > .2 && fading.opacities[index] < .5, 'Echo fades gradually');
          assert.equal((await sample(contact + 4100)).opacities[index], 0, 'Echo disappears after passage');
        }
      }
      await sample(7000);
      await page.screenshot({ path: join(output, 'minis-radar-' + name.toLowerCase() + '.png') });
      // Reload to discard the deliberately paused/seeked Web Animations objects.
      // Reduced-motion checks must exercise normal CSS, not test-owned timelines.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      await page.locator('#mini-invitation[open]').waitFor();
      const reduced = await page.locator('.vf-mini-receiver').evaluate(receiver => ({
        scan: getComputedStyle(receiver, '::before').animationName,
        signals: [...receiver.querySelectorAll('i')].map(signal => ({ animation: getComputedStyle(signal).animationName, opacity: Number(getComputedStyle(signal).opacity) }))
      }));
      assert.equal(reduced.scan, 'none');
      assert.ok(reduced.signals.every(signal => signal.animation === 'none' && Math.abs(signal.opacity - .65) < .001), JSON.stringify(reduced));
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.vf-mini-receiver'), '::before').animationName === 'vf-mini-scan');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => [...document.querySelectorAll('.vf-mini-receiver i')].every(signal => Math.abs(Number(getComputedStyle(signal).opacity) - .65) < .001));
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.locator('[data-mini-close]').click();
      await page.locator('#mini-invitation[open]').waitFor({ state: 'hidden' });
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('vf:cta-open', { detail: { target: 'minis', explicit: true } })));
      await page.locator('#mini-invitation[open]').waitFor();
      const reopened = await sample(0);
      assert.equal(reopened.opacities[0], 1);
      assert.ok(reopened.opacities.slice(1).every(opacity => opacity === 0));
      console.log('PASS ' + name + ': nine echoes aligned over two rotations, fade, reduced motion and reopening');
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
