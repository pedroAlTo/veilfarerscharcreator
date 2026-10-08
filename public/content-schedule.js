(() => {
  'use strict';
  const local = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(location.hostname);
  const ids = { notices: ['pricing', 'behind', 'books', 'crossing', 'release', 'beta', 'minis'], articles: ['overkill', 'drones', 'space-combat'] };
  let config = null, ready = false, error = false, offset = 0, boundaryTimer = 0, pending = null;
  function valid(value) {
    return value && value.version === 2 && Object.entries(ids).every(([group, keys]) => keys.every(id => {
      const item = value[group]?.[id];
      return item && typeof item.enabled === 'boolean' && Number.isFinite(item.priority) && ['startsAt', 'endsAt'].every(field => item[field] === null || (typeof item[field] === 'string' && Number.isFinite(Date.parse(item[field]))));
    }));
  }
  function isLive(group, id) {
    const item = config?.[group]?.[id], now = Date.now() + offset;
    return Boolean(item?.enabled && (!item.startsAt || now >= Date.parse(item.startsAt)) && (!item.endsAt || now < Date.parse(item.endsAt)));
  }
  function update() {
    clearTimeout(boundaryTimer);
    document.querySelectorAll('[data-publication-article]').forEach(node => { node.hidden = !isLive('articles', node.dataset.publicationArticle); });
    const list = document.querySelector('[data-publication-list]');
    if (list && config) {
      [...list.querySelectorAll('[data-publication-article]')].sort((a, b) => config.articles[a.dataset.publicationArticle].priority - config.articles[b.dataset.publicationArticle].priority).forEach(node => list.append(node));
    }
    document.querySelectorAll('[data-publication-empty]').forEach(node => {
      node.hidden = !ready || ids.articles.some(id => isLive('articles', id));
      node.textContent = error ? 'The entries could not be loaded. Please try again shortly.' : 'No entries are available right now. Please check back soon.';
    });
    for (const dialog of document.querySelectorAll('dialog[data-cta-notice][open]')) {
      if (!isLive('notices', dialog.dataset.ctaNotice)) dialog.close();
    }
    window.dispatchEvent(new CustomEvent('vf:publication-update', { detail: { ready, error } }));
    window.dispatchEvent(new CustomEvent('vf:cta-state-request'));
    const now = Date.now() + offset;
    const boundaries = Object.values(config?.notices || {}).concat(Object.values(config?.articles || {})).flatMap(item => [Date.parse(item.startsAt), Date.parse(item.endsAt)]).filter(time => time > now);
    if (boundaries.length) boundaryTimer = setTimeout(update, Math.min(2147483647, Math.max(1, Math.min(...boundaries) - now)));
  }
  async function fetchConfig(url) {
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw Error('Publication service unavailable');
    const value = await response.json();
    if (!valid(value)) throw Error('Invalid publication configuration');
    return value;
  }
  async function load() {
    try {
      let value;
      try { value = await fetchConfig('/api/cta-config'); }
      catch (cause) { if (!local) throw cause; value = await fetchConfig('/data/cta-schedule.json'); }
      config = value;
      const serverTime = Date.parse(value.serverNow);
      offset = Number.isFinite(serverTime) ? serverTime - Date.now() : 0;
      error = false;
    } catch { config = null; error = true; }
    ready = true;
    update();
  }
  function refresh() { return pending || (pending = load().finally(() => { pending = null; })); }
  window.VFPublication = { isLive, refresh, get config() { return config; }, get ready() { return ready; }, get now() { return Date.now() + offset; } };
  // Gate delayed transitions too, including events queued before a notice expired.
  window.addEventListener('vf:cta-open', event => { if (!isLive('notices', event.detail?.target)) event.stopImmediatePropagation(); }, { capture: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { update(); refresh(); } });
  window.addEventListener('pageshow', event => { if (event.persisted) { update(); refresh(); } });
  window.addEventListener('online', refresh);
  setInterval(() => { if (!document.hidden) refresh(); }, 30000);
  refresh();
})();
