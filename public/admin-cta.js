(() => {
  'use strict';
  const root = document.querySelector('[data-cta-admin]');
  if (!(root instanceof HTMLElement)) return;
  const form = document.querySelector('#cta-admin-form');
  const controls = document.querySelector('#cta-admin-controls');
  const lists = { notices: document.querySelector('#cta-admin-list'), articles: document.querySelector('#article-admin-list') };
  const status = document.querySelector('#cta-admin-status');
  const saveButton = document.querySelector('#cta-admin-save');
  const reloadButton = document.querySelector('#cta-admin-reload');
  const names = {
    notices: { pricing: 'Important pricing update', behind: 'Behind the Veil', books: 'Books 12.06', crossing: 'First Crossing 1.1', release: 'Rust & Steel correction', beta: 'Beta tester invitation', minis: 'Ancestry mini-expansions' },
    articles: { overkill: 'Overkill', drones: 'Drones · English & Español' }
  };
  let config = null, authorized = false, busy = false, dirty = false, generation = 0;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const localValue = value => {
    if (!value) return '';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const isoValue = (value, stored) => {
    // datetime-local displays minutes; leave an untouched server timestamp exact.
    if (value === localValue(stored)) return stored ?? null;
    if (!value) return null;
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) throw Error('Enter a valid publication date.');
    return date.toISOString();
  };
  function itemState(item) {
    if (!item.enabled) return 'Paused';
    const now = Date.now();
    if (item.startsAt && Date.parse(item.startsAt) > now) return 'Scheduled';
    if (item.endsAt && Date.parse(item.endsAt) <= now) return 'Ended';
    return 'Live now';
  }
  function validConfig(value) {
    if (!value || value.version !== 2 || !value.notices || !value.articles) return false;
    return Object.entries(names).every(([group, entries]) => Object.keys(entries).every(id => {
      const item = value[group][id];
      return item && typeof item.enabled === 'boolean' && Number.isFinite(item.priority) && ['startsAt', 'endsAt'].every(field => item[field] === null || (typeof item[field] === 'string' && Number.isFinite(Date.parse(item[field]))));
    }));
  }
  function setStatus(message, type = '') { status.textContent = message; status.className = 'vf-status' + (type ? ' ' + type : ''); }
  function syncControls() {
    controls.disabled = busy || !authorized;
    saveButton.disabled = busy || !authorized || !dirty;
    reloadButton.textContent = dirty ? 'Discard changes and reload' : 'Reload saved settings';
    form.setAttribute('aria-busy', String(busy));
  }
  function render() {
    for (const [group, list] of Object.entries(lists)) {
      list.innerHTML = Object.entries(config[group]).sort((a, b) => a[1].priority - b[1].priority).map(([id, item]) => {
        const prefix = `${group}-${id}`;
        return `<article class="vf-sheet-block" data-publication-id="${escape(id)}" data-publication-group="${group}">
          <div class="vf-section-heading"><div><div class="vf-eyebrow" data-publication-state>${itemState(item)}</div><h4>${escape(names[group][id] || id)}</h4></div><label class="vf-cta-enabled"><input type="checkbox" data-field="enabled" ${item.enabled ? 'checked' : ''}> Enabled</label></div>
          <div class="vf-cta-fields"><label for="${prefix}-start">Starts <input id="${prefix}-start" class="vf-input" type="datetime-local" data-field="startsAt" value="${escape(localValue(item.startsAt))}"></label><label for="${prefix}-end">Ends <input id="${prefix}-end" class="vf-input" type="datetime-local" data-field="endsAt" value="${escape(localValue(item.endsAt))}"></label><label for="${prefix}-order">Order <input id="${prefix}-order" class="vf-input" type="number" min="1" max="99" step="1" required data-field="priority" value="${escape(item.priority)}"></label></div>
          <div class="vf-actions"><button class="vf-button" type="button" data-action="start">Start now</button><button class="vf-button" type="button" data-action="pause">Pause</button></div>
        </article>`;
      }).join('');
    }
    dirty = false;
    document.querySelector('#cta-admin-updated').textContent = config.updatedAt ? `Last saved ${new Date(config.updatedAt).toLocaleString()}` : 'Bundled publication defaults';
    syncControls();
  }
  function collect() {
    const result = { version: 2, notices: {}, articles: {}, updatedAt: config.updatedAt ?? null };
    for (const card of form.querySelectorAll('[data-publication-id]')) {
      const startInput = card.querySelector('[data-field="startsAt"]');
      const endInput = card.querySelector('[data-field="endsAt"]');
      const previous = config[card.dataset.publicationGroup][card.dataset.publicationId];
      const startsAt = isoValue(startInput.value, previous.startsAt), endsAt = isoValue(endInput.value, previous.endsAt);
      endInput.setCustomValidity('');
      if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
        endInput.setCustomValidity('The end must be after the start.');
        endInput.reportValidity();
        throw Error(`${names[card.dataset.publicationGroup][card.dataset.publicationId]}: the end must be after the start.`);
      }
      result[card.dataset.publicationGroup][card.dataset.publicationId] = {
        enabled: card.querySelector('[data-field="enabled"]').checked,
        startsAt, endsAt,
        priority: Number(card.querySelector('[data-field="priority"]').value)
      };
    }
    return result;
  }
  async function headers() {
    const user = window.netlifyIdentity?.currentUser?.();
    if (!user || !authorized) throw Error('Administrator sign-in required.');
    return { 'content-type': 'application/json', authorization: `Bearer ${await user.jwt(true)}` };
  }
  async function readResponse(response, fallback) {
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const error = Error(body?.error || fallback);
      error.status = response.status;
      throw error;
    }
    if (!body || typeof body !== 'object') throw Error('The publication service returned an invalid response. Your edits have not been confirmed as saved.');
    return body;
  }
  async function save(message = 'CTA and article schedules saved.') {
    if (busy || !authorized) return;
    let draft;
    try {
      draft = collect();
      if (!form.reportValidity()) return;
    } catch (error) { setStatus(error.message, 'bad'); return; }
    const currentGeneration = generation;
    busy = true; syncControls(); setStatus('Saving publication settings…');
    try {
      const response = await fetch('/api/cta-config', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: await headers(), body: JSON.stringify(draft) });
      const body = await readResponse(response, 'Publication settings could not be saved.');
      if (currentGeneration !== generation) return;
      if (!validConfig(body)) throw Error('The publication service returned an invalid schedule. Your edits have not been confirmed as saved.');
      config = body; render(); setStatus(message, 'ok');
    } catch (error) {
      if (currentGeneration !== generation) return;
      if (error.status === 409) setStatus('Another administrator changed these settings. Your edits remain below and have not been saved. Use “Discard changes and reload” to get the latest schedule before editing again.', 'bad');
      else setStatus((error.message || String(error)) + ' Your edits remain unsaved.', 'bad');
      if (error.status === 401 || error.status === 403) authorized = false;
    } finally { if (currentGeneration === generation) { busy = false; syncControls(); } }
  }
  async function reload() {
    if (busy || !authorized) return;
    const currentGeneration = generation;
    busy = true; syncControls(); setStatus('Loading saved publication settings…');
    try {
      const response = await fetch('/api/content-admin', { credentials: 'same-origin', cache: 'no-store', headers: await headers() });
      const body = await readResponse(response, 'Saved publication settings could not be loaded.');
      if (currentGeneration !== generation) return;
      if (body.authorized !== true || !validConfig(body.config)) throw Error('The publication service returned an invalid schedule.');
      config = body.config; render(); setStatus('Saved CTA and article schedules loaded.', 'ok');
    } catch (error) {
      if (currentGeneration === generation) {
        setStatus(error.message || String(error), 'bad');
        if (error.status === 401 || error.status === 403) authorized = false;
      }
    } finally { if (currentGeneration === generation) { busy = false; syncControls(); } }
  }
  function markDirty(event) {
    if (!authorized || busy || !event.target.matches('input')) return;
    form.querySelectorAll('[data-field="endsAt"]').forEach(input => input.setCustomValidity(''));
    dirty = true; syncControls(); setStatus('Unsaved changes. Save all schedules to apply them.');
    const card = event.target.closest('[data-publication-id]');
    if (card) card.querySelector('[data-publication-state]').textContent = 'Unsaved changes';
  }
  form.addEventListener('input', markDirty);
  form.addEventListener('change', markDirty);
  form.addEventListener('submit', event => { event.preventDefault(); save(); });
  reloadButton.addEventListener('click', reload);
  form.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    const card = event.target.closest('[data-publication-id]');
    if (!button || !card || busy || !authorized) return;
    card.querySelector('[data-field="enabled"]').checked = button.dataset.action === 'start';
    if (button.dataset.action === 'start') {
      card.querySelector('[data-field="startsAt"]').value = '';
      card.querySelector('[data-field="endsAt"]').value = '';
    }
    dirty = true; syncControls();
    save(button.dataset.action === 'pause' ? 'Entry paused. All current schedule edits were saved.' : 'Entry is live now. All current schedule edits were saved.');
  });
  async function applyAccess(state) {
    const currentGeneration = ++generation;
    authorized = state?.authorized === true; busy = false; config = null; dirty = false;
    Object.values(lists).forEach(list => { list.innerHTML = ''; });
    document.querySelector('#cta-admin-updated').textContent = '';
    syncControls();
    if (authorized) {
      if (!validConfig(state.config)) { authorized = false; syncControls(); setStatus('The publication service returned an invalid schedule. Reload or check access again.', 'bad'); return; }
      config = state.config; render(); setStatus('CTA and article schedules loaded.', 'ok');
    } else if (state?.readOnly) {
      try {
        const response = await fetch('/data/cta-schedule.json', { cache: 'no-store' });
        const body = await readResponse(response, 'The bundled schedule could not be loaded.');
        if (currentGeneration !== generation) return;
        if (!validConfig(body)) throw Error('The bundled publication schedule is invalid.');
        config = body; render(); setStatus('Static preview of bundled defaults · sign in on the Netlify site to manage the saved schedule. Changes cannot be saved here.');
      } catch (error) { if (currentGeneration === generation) setStatus(error.message, 'bad'); }
    } else setStatus('Waiting for administrator verification…');
  }
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'browser local time';
  document.querySelector('#cta-admin-timezone').textContent = `Dates are shown in ${zone} and stored in UTC. Your local daylight-saving offset is applied for each chosen date. Start now clears the date window; Pause keeps it for later.`;
  window.addEventListener('vf:content-admin', event => applyAccess(event.detail));
  applyAccess(window.VF_CONTENT_ADMIN_STATE || {});
  window.addEventListener('beforeunload', event => { if (dirty && authorized) { event.preventDefault(); event.returnValue = ''; } });
})();
