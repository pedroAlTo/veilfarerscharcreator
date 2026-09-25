(() => {
  const inbox = document.querySelector('[data-cta-inbox]');
  if (!(inbox instanceof HTMLButtonElement)) return;
  let order = ['pricing', 'behind', 'books', 'crossing', 'release', 'beta', 'minis'].filter(id => document.querySelector('[data-cta-notice="' + id + '"]'));
  const states = Object.fromEntries(order.map(id => [id, { active: false, deleted: false, open: false, ready: false, auto: false }]));
  const titles = Object.fromEntries(order.map(id => [id, document.querySelector('[data-cta-notice="' + id + '"]').dataset.ctaTitle]));
  let schedule = Object.fromEntries(order.map((id, index) => [id, { enabled: true, startsAt: null, endsAt: null, priority: index + 1 }]));
  let scheduleReady = false;
  let initialOpenHandled = false;

  function isLive(id, now = Date.now()) {
    const item = schedule[id];
    if (!item?.enabled) return false;
    const starts = item.startsAt ? Date.parse(item.startsAt) : NaN;
    const ends = item.endsAt ? Date.parse(item.endsAt) : NaN;
    return (!Number.isFinite(starts) || now >= starts) && (!Number.isFinite(ends) || now < ends);
  }
  function availableNotices() {
    return order.filter(id => states[id]?.ready && isLive(id) && !states[id].deleted);
  }
  function buildPagination() {
    for (const nav of document.querySelectorAll('[data-cta-owner]')) {
      nav.replaceChildren();
      const owner = nav.dataset.ctaOwner;
      const addButton = (text, label, className) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = className;
        button.textContent = text; button.setAttribute('aria-label', label);
        nav.append(button);
        return button;
      };
      addButton('‹', 'Previous notice', 'vf-cta-arrow').dataset.ctaStep = '-1';
      order.forEach((id, index) => {
        const button = addButton(String(index + 1).padStart(2, '0'), 'Notice ' + (index + 1) + ': ' + titles[id], 'vf-cta-index');
        button.dataset.ctaTarget = id;
        if (id === owner) { button.setAttribute('aria-current', 'page'); button.classList.add('is-current'); }
      });
      addButton('›', 'Next notice', 'vf-cta-arrow').dataset.ctaStep = '1';
      nav.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button || button.disabled) return;
        let target = button.dataset.ctaTarget;
        if (button.dataset.ctaStep) {
          const available = availableNotices();
          target = available[(available.indexOf(owner) + Number(button.dataset.ctaStep) + available.length) % available.length];
        }
        if (target && target !== owner) window.dispatchEvent(new CustomEvent('vf:cta-switch-request', { detail: { from: owner, to: target } }));
      });
    }
  }
  function syncInterface(animate = false) {
    const available = availableNotices();
    const count = available.filter(id => states[id].active).length;
    const open = available.some(id => states[id].open);
    inbox.classList.toggle('is-active', count > 0);
    inbox.disabled = !available.length;
    inbox.setAttribute('aria-disabled', String(inbox.disabled));
    inbox.setAttribute('aria-expanded', String(open));
    inbox.setAttribute('aria-label', inbox.disabled ? 'No active notifications' : open ? 'Notifications are open' : 'Open saved notifications (' + count + ')');
    if (animate && count) {
      inbox.classList.remove('is-arriving');
      requestAnimationFrame(() => inbox.classList.add('is-arriving'));
    }
    document.querySelectorAll('[data-cta-target]').forEach(button => {
      button.disabled = !available.includes(button.dataset.ctaTarget);
      button.setAttribute('aria-disabled', String(button.disabled));
    });
    document.querySelectorAll('[data-cta-step]').forEach(button => { button.disabled = available.length < 2; });
  }
  function requestOpen(target, explicit = false) {
    if (!availableNotices().includes(target)) return;
    const current = order.find(id => states[id].open);
    if (current && current !== target) {
      window.dispatchEvent(new CustomEvent('vf:cta-switch-request', { detail: { from: current, to: target } }));
    } else window.dispatchEvent(new CustomEvent('vf:cta-open', { detail: { target, explicit } }));
  }
  function openInitial() {
    if (initialOpenHandled || !scheduleReady || document.readyState !== 'complete') return;
    initialOpenHandled = true;
    const direct = location.hash === '#minis' && availableNotices().includes('minis');
    const target = direct ? 'minis' : order.find(id => states[id].ready && states[id].auto && isLive(id) && !states[id].deleted);
    if (target) setTimeout(() => {
      if (!order.some(id => states[id].open)) requestOpen(target, Boolean(direct));
    }, direct ? 0 : 650);
  }
  async function loadSchedule() {
    let data;
    try {
      const response = await fetch('/api/cta-config', { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      data = await response.json();
    } catch {
      try { data = await fetch('/data/cta-schedule.json', { cache: 'no-store' }).then(response => response.json()); }
      catch { data = { notices: schedule }; }
    }
    schedule = { ...schedule, ...(data.notices || {}) };
    order.sort((a, b) => (Number(schedule[a]?.priority) || 99) - (Number(schedule[b]?.priority) || 99));
    scheduleReady = true;
    buildPagination();
    syncInterface();
    openInitial();
  }

  inbox.addEventListener('click', () => {
    const target = order.find(id => states[id].active && isLive(id) && !states[id].deleted);
    if (target) requestOpen(target);
  });
  inbox.addEventListener('animationend', () => inbox.classList.remove('is-arriving'));
  window.addEventListener('vf:cta-inbox-update', event => {
    const detail = event.detail || {};
    if (!states[detail.target]) return;
    states[detail.target] = { ...detail, ready: true };
    syncInterface(Boolean(detail.animate));
    openInitial();
  });
  window.addEventListener('hashchange', () => { if (location.hash === '#minis') requestOpen('minis', true); });
  window.addEventListener('load', openInitial, { once: true });
  syncInterface();
  window.dispatchEvent(new CustomEvent('vf:cta-state-request'));
  loadSchedule();
})();
