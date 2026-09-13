import { cues } from './theme-lyrics.mjs?v=20260914-1';

export const themeSong = Object.freeze({
  id: '843a7766-508c-41a8-b483-3b1353cded84',
  src: '/assets/audio/veilfarers-theme-843a7766.mp3',
  duration: 294.792,
  cues,
});

export function readPlayerState(raw) {
  const defaults = { time: 0, volume: .35, muted: false, lyrics: false, playing: false, engaged: false };
  try {
    const state = JSON.parse(raw);
    if (!state || state.track !== themeSong.id) return defaults;
    return {
      time: typeof state.time === 'number' && Number.isFinite(state.time) ? Math.max(0, Math.min(themeSong.duration, state.time)) : 0,
      volume: typeof state.volume === 'number' && Number.isFinite(state.volume) ? Math.max(0, Math.min(1, state.volume)) : .35,
      muted: state.muted === true,
      lyrics: state.lyrics === true,
      playing: state.playing === true && state.engaged === true,
      engaged: state.engaged === true,
    };
  } catch { return defaults; }
}

export function visibleCues(all, time, reduced = false) {
  if (!Number.isFinite(time)) return [];
  return all.filter(cue => time >= cue.start - .35 && time < cue.end + (reduced ? 1.2 : 5.5)).slice(reduced ? -1 : -3);
}

export function lyricMotion(cue, time, reduced = false) {
  const age = time - cue.start, after = Math.max(0, time - cue.end);
  const duration = Math.max(.1, cue.end - cue.start);
  const opacity = Math.min(1, Math.max(0, (age + .35) / .65)) * Math.max(0, 1 - after / (reduced ? 1.2 : 5.5));
  if (reduced) return { opacity, x: 0, y: 0 };
  return { opacity, x: -Math.min(14, after * 2), y: -Math.max(0, Math.min(1, age / duration)) * 45 - after * 35 };
}
