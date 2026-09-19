import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { themeSong, visibleCues, lyricMotion, readPlayerState } from '../public/theme-song.mjs';

test('timed lyrics match the supplied track and stay within its duration', () => {
  assert.ok(themeSong.cues.length > 40);
  let start = 0;
  for (const cue of themeSong.cues) {
    assert.ok(cue.start >= start && cue.end > cue.start && cue.end < themeSong.duration, cue.text);
    assert.equal(cue.words.map(word => word.text).join(' '), cue.text);
    let wordStart = cue.start;
    for (const word of cue.words) {
      assert.ok(word.start >= wordStart && word.end > word.start && word.end <= cue.end, JSON.stringify(word));
      wordStart = word.start;
    }
    start = cue.start;
  }
});
test('lyrics appear with the voice, float upwards, fade out and do not fill instrumental gaps', () => {
  const cue = themeSong.cues[0];
  assert.deepEqual(visibleCues(themeSong.cues, 0), []);
  assert.ok(visibleCues(themeSong.cues, cue.start).includes(cue));
  assert.ok(lyricMotion(cue, cue.end + .6).y < lyricMotion(cue, cue.start + 1).y);
  assert.ok(lyricMotion(cue, cue.end + .6).opacity < lyricMotion(cue, cue.end).opacity);
  assert.ok(!visibleCues(themeSong.cues, cue.end + 1.3).includes(cue));
  assert.ok(lyricMotion(cue, cue.end + 1.2).y >= -38, 'Short, bounded rise remains near the player');
  assert.deepEqual(visibleCues(themeSong.cues, 103), []);
  assert.ok(visibleCues(themeSong.cues, 155).length <= 2);
});
test('seeking backwards derives lyrics from media time, reduced motion shows one stationary line', () => {
  assert.equal(visibleCues(themeSong.cues, 271, true).at(-1).text, 'Until the stars come together.');
  assert.equal(visibleCues(themeSong.cues, 3, true).at(-1).text, 'In the dark, no one hears you.');
  const reduced = lyricMotion(themeSong.cues[0], 4, true);
  assert.equal(reduced.x, 0); assert.equal(reduced.y, 0);
  assert.ok(visibleCues(themeSong.cues, 150, true).length <= 1);
});
test('new visitors never autoplay, saved opt-in and valid preferences restore safely', () => {
  for (const raw of [null, 'broken', '[]', '{}', '{"playing":true}']) assert.equal(readPlayerState(raw).playing, false);
  const saved = readPlayerState(JSON.stringify({ track:themeSong.id, time:89.4,volume:.6,lyrics:true,playing:true,engaged:true }));
  assert.equal(saved.time,89.4); assert.equal(saved.volume,.6); assert.equal(saved.lyrics,true); assert.equal(saved.playing,true);
  const invalid = readPlayerState(JSON.stringify({ track:themeSong.id,time:-999,volume:4,playing:true,engaged:false }));
  assert.equal(invalid.time,0); assert.equal(invalid.volume,1); assert.equal(invalid.playing,false);
});
test('all first-party HTML pages load exactly one common player', () => {
  const pages = ['public','public/books','public/behind-the-veil'].flatMap(dir => readdirSync(dir).filter(f=>f.endsWith('.html')).map(f=>`${dir}/${f}`));
  assert.equal(pages.length,20);
  for (const page of pages) assert.equal((readFileSync(page,'utf8').match(/src="\/theme-player\.mjs\?/g)||[]).length,1,page);
});
