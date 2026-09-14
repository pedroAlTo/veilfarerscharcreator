import { themeSong, visibleCues, lyricMotion, readPlayerState } from './theme-song.mjs?v=20260914-4';

const STORAGE = 'vf-theme-player-v1';
const svg = (body) => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;

class VeilFarersThemePlayer extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <link rel="stylesheet" href="/theme-player.css?v=20260914-4">
      <section aria-label="VeilFarers theme music">
        <div class="lyrics-sky" aria-hidden="true"></div>
        <p class="sr current-lyric" aria-live="off"></p>
        <div class="panel" id="theme-details" hidden>
          <header><div><h2>VeilFarers</h2><p>The theme · Until the stars come together</p></div><button class="close" aria-label="Close music controls">×</button></header>
          <label class="seek-label"><span class="sr">Song position</span><input class="seek" type="range" min="0" max="${themeSong.duration}" value="0" step=".1"></label>
          <div class="caption"><time class="elapsed">0:00</time><time class="duration">4:55</time></div>
          <div class="volume"><button class="mute" aria-label="Mute music" aria-pressed="false">${svg('<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>')}</button><label><span class="sr">Music volume</span><input class="volume-range" type="range" min="0" max="100" step="1" value="35"></label><output class="volume-value">35%</output></div>
          <p class="hint">Let the words rise with the music. Use the lyrics button to show or hide them.</p>
        </div>
        <p class="status" role="status" hidden></p>
        <div class="dock">
          <button class="play" aria-label="Play VeilFarers theme">${svg('<path class="play-icon" d="m8 4 13 8-13 8Z"/><path class="pause-icon" d="M6 4h4v16H6zm8 0h4v16h-4z"/>')}</button>
          <div class="identity"><button class="details-toggle" aria-label="Music controls" aria-expanded="false" aria-controls="theme-details"><span class="name">VEILFARERS</span><span class="subtitle">The theme ${svg('<path d="m6 15 6-6 6 6"/>')}</span></button></div>
          <button class="lyrics-toggle" aria-label="Show floating lyrics" aria-pressed="false" title="Show floating lyrics">${svg('<path d="M4 5h16M4 10h10M4 15h7m6 4V9l4-1v4m-4 6c-4-2-5 3-1 3 1 0 1-1 1-3Z"/>')}</button>
          <div class="track" aria-hidden="true"><span></span></div>
        </div>
        <audio preload="none"></audio>
      </section>`;

    const $ = (sel) => root.querySelector(sel);
    const audio = $('audio'), play = $('.play'), seek = $('.seek'), lyricsButton = $('.lyrics-toggle');
    const sky = $('.lyrics-sky'), panel = $('.panel'), details = $('.details-toggle'), status = $('.status');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let stored;
    try { stored = sessionStorage.getItem(STORAGE); } catch { /* Optional per-tab preferences. */ }
    const state = readPlayerState(stored);
    let position = state.time, intent = false, lyrics = state.lyrics, userActivated = false;
    let raf = 0, lastFrame = 0, lastSave = 0, destroyed = false, suspended = false;
    const nodes = new Map(), abort = new AbortController(), signal = abort.signal;
    audio.volume = state.volume;
    audio.muted = state.muted;
    const time = (n) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
    const save = () => {
      if (!userActivated && !state.engaged) return;
      try { sessionStorage.setItem(STORAGE, JSON.stringify({ track: themeSong.id, time: audio.readyState ? audio.currentTime : position, volume: audio.volume, muted: audio.muted, lyrics, playing: intent, engaged: true })); } catch { /* Playback works with storage disabled. */ }
    };
    const report = (message = '') => { status.textContent = message; status.hidden = !message; };
    const controls = () => {
      this.toggleAttribute('data-playing', !audio.paused && !audio.ended);
      play.setAttribute('aria-label', intent && audio.paused ? 'Cancel loading music' : audio.paused ? 'Play VeilFarers theme' : 'Pause VeilFarers theme');
      lyricsButton.setAttribute('aria-pressed', String(lyrics));
      lyricsButton.setAttribute('aria-label', lyrics ? 'Hide floating lyrics' : 'Show floating lyrics');
      lyricsButton.title = lyrics ? 'Hide floating lyrics' : 'Show floating lyrics';
      $('.volume-range').value = String(Math.round(audio.volume * 100));
      $('.volume-value').textContent = `${Math.round(audio.volume * 100)}%`;
      $('.mute').setAttribute('aria-pressed', String(audio.muted));
      $('.mute').setAttribute('aria-label', audio.muted ? 'Unmute music' : 'Mute music');
    };
    const clearLyrics = () => { sky.replaceChildren(); nodes.clear(); $('.current-lyric').textContent = ''; };
    const draw = () => {
      const now = audio.readyState ? audio.currentTime : position;
      this.style.setProperty('--progress', String(Math.min(1, now / themeSong.duration)));
      if (root.activeElement !== seek) seek.value = String(now);
      seek.setAttribute('aria-valuetext', `${time(now)} of ${time(themeSong.duration)}`);
      $('.elapsed').textContent = time(now);
      if (!lyrics || document.hidden || audio.ended) { clearLyrics(); return; }
      const active = visibleCues(themeSong.cues, now, motion.matches);
      const ids = new Set(active.map(cue => cue.id));
      for (const [id, node] of nodes) if (!ids.has(id)) { node.remove(); nodes.delete(id); }
      let ceiling = 0;
      for (const cue of [...active].reverse()) {
        let node = nodes.get(cue.id);
        if (!node) {
          node = document.createElement('p'); node.className = 'lyric'; node.dataset.cue = cue.id;
          cue.words.forEach((word, i) => { const span = document.createElement('span'); span.textContent = word.text; node.append(span); if (i < cue.words.length - 1) node.append(' '); });
          sky.append(node); nodes.set(cue.id, node);
        }
        const frame = lyricMotion(cue, now, motion.matches);
        node.style.opacity = String(frame.opacity);
        const y = motion.matches ? 0 : Math.min(frame.y, ceiling);
        node.style.transform = `translate3d(${frame.x}px, ${y}px, 0)`;
        ceiling = y - node.offsetHeight - 6;
        Array.from(node.children).forEach((word, i) => {
          const timing = cue.words[i]; word.classList.toggle('sung', now >= timing.start);
          word.classList.toggle('singing', now >= timing.start && now < timing.end);
        });
      }
      $('.current-lyric').textContent = active.filter(cue => now <= cue.end).map(cue => cue.text).join(' ');
    };
    const stopFrame = () => { cancelAnimationFrame(raf); raf = 0; };
    const frame = (stamp) => {
      raf = 0;
      if (destroyed || audio.paused || document.hidden) return;
      if (stamp - lastFrame > 32) { draw(); lastFrame = stamp; }
      raf = requestAnimationFrame(frame);
    };
    const startFrame = () => { if (!raf && !audio.paused && !document.hidden) raf = requestAnimationFrame(frame); };
    const prepare = () => { if (!audio.getAttribute('src')) audio.src = themeSong.src; else if (audio.error) audio.load(); };
    const start = async (resume = false) => {
      intent = true; report(); prepare(); controls();
      try {
        await audio.play();
        if (!intent || destroyed) { audio.pause(); return; }
        controls(); startFrame(); save();
      } catch (error) {
        if (!intent || destroyed) return;
        intent = false; controls(); save();
        report(error.name === 'NotAllowedError' && resume ? 'Press play to continue the theme.' : 'Unable to play the theme. Press play to retry.');
      }
    };
    const togglePanel = (open, focusBack = false) => {
      panel.hidden = !open; details.setAttribute('aria-expanded', String(open)); this.toggleAttribute('data-expanded', open);
      if (focusBack) details.focus();
    };
    play.addEventListener('click', () => {
      userActivated = true;
      if (intent || !audio.paused) { intent = false; audio.pause(); controls(); save(); }
      else { if (audio.ended) { audio.currentTime = 0; position = 0; } start(); }
    }, { signal });
    details.addEventListener('click', () => togglePanel(panel.hidden), { signal });
    $('.close').addEventListener('click', () => togglePanel(false, true), { signal });
    document.addEventListener('click', event => { if (!event.composedPath().includes(this)) togglePanel(false); }, { signal });
    root.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { event.stopPropagation(); togglePanel(false, true); } }, { signal });
    lyricsButton.addEventListener('click', () => { userActivated = true; lyrics = !lyrics; controls(); draw(); save(); }, { signal });
    seek.addEventListener('input', () => {
      userActivated = true; position = Number(seek.value); prepare();
      if (audio.readyState) audio.currentTime = position;
      clearLyrics(); draw(); save();
    }, { signal });
    $('.volume-range').addEventListener('input', event => { userActivated = true; audio.volume = Number(event.target.value) / 100; audio.muted = false; controls(); save(); }, { signal });
    $('.mute').addEventListener('click', () => { userActivated = true; audio.muted = !audio.muted; controls(); save(); }, { signal });
    audio.addEventListener('loadedmetadata', () => { audio.currentTime = Math.min(position, audio.duration - .01); draw(); }, { signal });
    audio.addEventListener('playing', () => { report(); intent = true; controls(); startFrame(); save(); }, { signal });
    audio.addEventListener('pause', () => { if (!suspended) intent = false; stopFrame(); controls(); draw(); save(); }, { signal });
    audio.addEventListener('timeupdate', () => { if (performance.now() - lastSave > 1500) { save(); lastSave = performance.now(); } if (!raf && !document.hidden) draw(); }, { signal });
    audio.addEventListener('seeked', draw, { signal });
    audio.addEventListener('ended', () => { intent = false; stopFrame(); clearLyrics(); controls(); save(); }, { signal });
    audio.addEventListener('error', () => { intent = false; stopFrame(); controls(); report('The theme could not load. Press play to retry.'); save(); }, { signal });
    document.addEventListener('visibilitychange', () => { save(); if (document.hidden) { stopFrame(); clearLyrics(); } else { draw(); startFrame(); } }, { signal });
    motion.addEventListener('change', () => { clearLyrics(); draw(); }, { signal });
    window.addEventListener('pagehide', () => { save(); suspended = true; stopFrame(); audio.pause(); }, { signal });
    window.addEventListener('pageshow', event => {
      if (!event.persisted) return;
      suspended = false;
      try {
        const fresh = readPlayerState(sessionStorage.getItem(STORAGE));
        position = fresh.time; lyrics = fresh.lyrics; audio.volume = fresh.volume; audio.muted = fresh.muted;
        if (audio.readyState) audio.currentTime = position;
        intent = false; controls(); draw();
        if (fresh.playing && fresh.engaged) start(true);
      } catch { if (intent) start(true); }
    }, { signal });

    // Coordinate tabs without forcing any tab to start playing.
    let channel;
    try {
      channel = new BroadcastChannel('vf-theme-audio');
      audio.addEventListener('playing', () => channel.postMessage('playing'), { signal });
      channel.onmessage = () => { if (!suspended && (!audio.paused || intent)) { intent = false; audio.pause(); controls(); save(); } };
    } catch { /* The player also works without BroadcastChannel. */ }
    if ('mediaSession' in navigator) {
      const media = navigator.mediaSession;
      const setupMedia = () => {
        media.metadata = new MediaMetadata({ title: 'VeilFarers — Until the stars come together', artist: 'VeilFarers', album: 'VeilFarers Theme' });
        for (const [action, handler] of [['play', () => start()], ['pause', () => { intent = false; audio.pause(); controls(); save(); }], ['seekto', event => { if (audio.readyState && Number.isFinite(event.seekTime)) audio.currentTime = event.seekTime; }]]) {
          try { media.setActionHandler(action, handler); } catch { /* Some platforms expose fewer transport actions. */ }
        }
      };
      audio.addEventListener('playing', setupMedia, { signal });
    }
    // Netlify adds a full-width, 48px review toolbar on narrow preview screens.
    // Reserve its visible height rather than covering either set of controls.
    let previewObserver, previewFinder, previewResize;
    const watchPreview = () => {
      const wrapper = document.querySelector('[data-netlify-deploy-id]');
      if (!wrapper) return;
      previewFinder?.disconnect();
      const inset = () => {
        const toolbar = wrapper.querySelector('iframe[title="Netlify Drawer"]');
        const box = toolbar?.getBoundingClientRect();
        const reserve = box && box.width > innerWidth * .8 && box.height > 0 && box.height <= 100 && box.bottom >= innerHeight - 2;
        this.style.setProperty('--preview-inset', reserve ? `${box.height + 12}px` : '0px');
      };
      previewObserver = new MutationObserver(inset);
      previewObserver.observe(wrapper, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'hidden'] });
      previewResize = new ResizeObserver(inset); previewResize.observe(wrapper);
      window.addEventListener('resize', inset, { signal }); inset();
    };
    if (document.querySelector('[data-netlify-deploy-id]')) watchPreview();
    else if (location.hostname.startsWith('deploy-preview-')) {
      previewFinder = new MutationObserver(watchPreview);
      previewFinder.observe(document.body, { childList: true });
    }
    controls(); draw();
    if (state.playing && state.engaged && position < themeSong.duration - 1) start(true);
    this.cleanup = () => { save(); destroyed = true; intent = false; stopFrame(); audio.pause(); abort.abort(); channel?.close(); previewObserver?.disconnect(); previewFinder?.disconnect(); previewResize?.disconnect(); };
  }
  disconnectedCallback() { this.cleanup?.(); }
}

if (!customElements.get('vf-theme-player')) customElements.define('vf-theme-player', VeilFarersThemePlayer);
if (!document.querySelector('vf-theme-player')) document.body.append(document.createElement('vf-theme-player'));

// Retain the compatibility link in the footer once its former floating slot is in use.
function relocateBadge(badge) {
  const footer = document.querySelector('.book-footer, .vf-site-footer, footer');
  if (!footer || !badge.classList.contains('vf-compatible-badge')) return;
  badge.classList.replace('vf-compatible-badge', 'vf-footer-compatible');
  badge.style.cssText = 'display:block;flex:0 0 115px;width:115px;max-width:115px;opacity:.8;';
  const image = badge.querySelector('img'); if (image) image.style.cssText = 'display:block;width:100%;height:auto;';
  footer.append(badge);
}
document.querySelectorAll('.vf-compatible-badge').forEach(relocateBadge);
// Book-detail is a deferred legacy script; it can finish after the module on slow connections.
const badges = new MutationObserver(() => document.querySelectorAll('.vf-compatible-badge').forEach(relocateBadge));
badges.observe(document.body, { childList: true });
window.addEventListener('load', () => { document.querySelectorAll('.vf-compatible-badge').forEach(relocateBadge); badges.disconnect(); }, { once: true });
