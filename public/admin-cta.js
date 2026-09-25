(() => {
  const root = document.querySelector('[data-cta-admin]');
  if (!(root instanceof HTMLElement)) return;
  const form = document.querySelector('#cta-admin-form');
  const list = document.querySelector('#cta-admin-list');
  const status = document.querySelector('#cta-admin-status');
  const names = { pricing: 'Important pricing update', behind: 'Behind the Veil', books: 'Books 12.06', crossing: 'First Crossing 1.1', release: 'Rust & Steel correction', beta: 'Beta tester invitation', minis: 'Ancestry mini-expansions' };
  let config = null;
  let busy = false;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const localValue = value => {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };
  const isoValue = value => value ? new Date(value).toISOString() : null;
  const isLive = item => {
    const now = Date.now(), starts = item.startsAt ? Date.parse(item.startsAt) : NaN, ends = item.endsAt ? Date.parse(item.endsAt) : NaN;
    return item.enabled && (!Number.isFinite(starts) || now >= starts) && (!Number.isFinite(ends) || now < ends);
  };
  function setStatus(message, type = '') { status.textContent = message; status.className = 'vf-status' + (type ? ' ' + type : ''); }
  function render() {
    list.innerHTML = Object.entries(config.notices).sort((a, b) => a[1].priority - b[1].priority).map(([id, item]) => `<article class="vf-sheet-block" data-cta-id="${escape(id)}">
      <div class="vf-section-heading"><div><div class="vf-eyebrow">${isLive(item) ? 'Live now' : item.enabled ? 'Scheduled / elapsed' : 'Paused'}</div><h3>${escape(names[id] || id)}</h3></div><label class="vf-cta-enabled"><input type="checkbox" data-field="enabled" ${item.enabled ? 'checked' : ''}> Enabled</label></div>
      <div class="vf-cta-fields"><label>Starts <input class="vf-input" type="datetime-local" data-field="startsAt" value="${escape(localValue(item.startsAt))}"></label><label>Ends <input class="vf-input" type="datetime-local" data-field="endsAt" value="${escape(localValue(item.endsAt))}"></label><label>Order <input class="vf-input" type="number" min="1" max="99" data-field="priority" value="${escape(item.priority)}"></label></div>
      <div class="vf-actions"><button class="vf-button" type="button" data-action="start">Start now</button><button class="vf-button" type="button" data-action="pause">Pause</button></div>
    </article>`).join('');
  }
  function collect() {
    const notices = {};
    for (const card of list.querySelectorAll('[data-cta-id]')) {
      notices[card.dataset.ctaId] = {
        enabled: card.querySelector('[data-field="enabled"]').checked,
        startsAt: isoValue(card.querySelector('[data-field="startsAt"]').value),
        endsAt: isoValue(card.querySelector('[data-field="endsAt"]').value),
        priority: Number(card.querySelector('[data-field="priority"]').value) || 99
      };
    }
    return { version: 1, notices };
  }
  async function headers() {
    const user = window.netlifyIdentity?.currentUser?.();
    if (!user) throw Error('Administrator sign-in required.');
    return { 'content-type': 'application/json', authorization: `Bearer ${await user.jwt(true)}` };
  }
  async function load() {
    let response;
    try { response = await fetch('/api/cta-config', { cache: 'no-store' }); } catch {}
    if (!response?.ok) response = await fetch('/data/cta-schedule.json', { cache: 'no-store' });
    config = await response.json();
    render();
    if (window.VF_IS_LOCAL_TEST === true) {
      form.querySelectorAll('button,input').forEach(control => { control.disabled = true; });
      setStatus('Local preview · view only. Deploy Preview is required to save CTA schedules.', 'ok');
    } else setStatus('CTA schedule loaded.', 'ok');
  }
  async function save(message = 'CTA schedule saved.') {
    if (busy || window.VF_IS_LOCAL_TEST === true) return;
    busy = true; setStatus('Saving CTA schedule…');
    try {
      const response = await fetch('/api/cta-config', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: await headers(), body: JSON.stringify(collect()) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(body.error || 'CTA schedule could not be saved.');
      config = body; render(); setStatus(message, 'ok');
    } catch (error) { setStatus(error.message || String(error), 'bad'); }
    finally { busy = false; }
  }
  form.addEventListener('submit', event => { event.preventDefault(); save(); });
  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    const card = event.target.closest('[data-cta-id]');
    if (!button || !card || busy) return;
    const enabled = card.querySelector('[data-field="enabled"]');
    const starts = card.querySelector('[data-field="startsAt"]');
    const ends = card.querySelector('[data-field="endsAt"]');
    if (button.dataset.action === 'pause') enabled.checked = false;
    if (button.dataset.action === 'start') {
      enabled.checked = true;
      const now = new Date();
      starts.value = localValue(now.toISOString());
      if (card.dataset.ctaId === 'pricing') ends.value = localValue(new Date(now.getTime() + 15 * 86400000).toISOString());
      else if (ends.value && new Date(ends.value).getTime() <= now.getTime()) ends.value = '';
    }
    save(button.dataset.action === 'pause' ? 'CTA paused.' : 'CTA started.');
  });
  load().catch(error => setStatus(error.message || String(error), 'bad'));
})();
