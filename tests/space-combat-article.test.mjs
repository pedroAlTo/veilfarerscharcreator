import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('English and Spanish space-combat pages expose their own canonical and rules/art credits', () => {
  for (const [path, lang, slug, phrases] of [
    ['public/behind-the-veil/space-combat.html', 'en', 'space-combat', ['Space combat', 'I need an idea!', 'FORE · FRONT', 'PORT · ABOVE']],
    ['public/behind-the-veil/space-combat-es.html', 'es', 'space-combat-es', ['Combate espacial', '¡I need an idea!', 'FORE · DELANTE', 'PORT · ARRIBA']],
  ]) {
    const html = read(path);
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.ok(html.includes(`https://veilfarers.com/behind-the-veil/${slug}.html`));
    assert.ok(html.includes('Corebook 12.06'));
    assert.ok(html.includes('Raphael Gonçalves'));
    assert.ok(html.includes('data-space-canvas'));
    assert.match(html, /overkill-pixel\.css/);
    assert.doesNotMatch(html, /core-schematics|naval-combat\.webp/);
    for (const [, src] of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      assert.ok(src.startsWith('/assets/behind-the-veil/'), `The article uses an existing sprite: ${src}`);
      assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `Missing illustration sprite: ${src}`);
    }
    for (const phrase of phrases) assert.ok(html.includes(phrase), `${path} is missing ${phrase}`);
  }
});

test('the arcade references the eight supplied single-ship sprites and the article index exposes it', () => {
  const game = read('public/space-combat.mjs');
  for (const id of [2, 4, 7, 10, 13, 16, 18, 20]) {
    const name = `public/assets/behind-the-veil/space-combat/ships/ship-${String(id).padStart(2, '0')}.png`;
    assert.ok(existsSync(new URL(`../${name}`, import.meta.url)), `${name} is missing`);
  }
  assert.match(game, /\[2, 4, 7, 10, 13, 16, 18, 20\]/);
  assert.match(read('public/behind-the-veil/index.html'), /data-publication-article="space-combat"/);
  assert.match(read('public/sitemap.xml'), /space-combat-es\.html/);
});
