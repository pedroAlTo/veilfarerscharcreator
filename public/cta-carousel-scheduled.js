(() => {
  const inbox = document.querySelector('[data-cta-inbox]');
  if (!(inbox instanceof HTMLButtonElement)) return;
  let order = ['pricing', 'behind', 'books', 'crossing', 'release', 'beta', 'minis'].filter(id => document.querySelector('[data-cta-notice="' + id + '"]'));
  const states = Object.fromEntries(order.map(id => [id, { active: false, deleted: false, open: false, ready: false, auto: false }]));
  const titles = Object.fromEntries(order.map(id => [id, document.querySelector('[data-cta-notice="' + id + '"]').dataset.ctaTitle]));
  let schedule = {};
  const boundNavigation = new WeakSet();
  let scheduleReady = false;
  let initialOpenHandled = false;
  let paginationOrder = null;

  function isLive(id) { return window.VFPublication?.isLive('notices', id) === true; }
  function availableNotices() {
    return order.filter(id => states[id]?.ready && isLive(id) && !states[id].deleted);
  }
  function buildPagination(available) {
    for (const nav of document.querySelectorAll('[data-cta-owner]')) {
      nav.replaceChildren();
      const owner = nav.dataset.ctaOwner;
      nav.hidden = !available.includes(owner);
      if (nav.hidden) continue;
      const addButton = (text, label, className) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = className;
        button.textContent = text; button.setAttribute('aria-label', label);
        nav.append(button);
        return button;
      };
      addButton('‹', 'Previous notice', 'vf-cta-arrow').dataset.ctaStep = '-1';
      available.forEach((id, index) => {
        const button = addButton(String(index + 1).padStart(2, '0'), 'Notice ' + (index + 1) + ': ' + titles[id], 'vf-cta-index');
        button.dataset.ctaTarget = id;
        if (id === owner) { button.setAttribute('aria-current', 'page'); button.classList.add('is-current'); }
      });
      addButton('›', 'Next notice', 'vf-cta-arrow').dataset.ctaStep = '1';
      if (boundNavigation.has(nav)) continue;
      boundNavigation.add(nav);
      nav.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button || button.disabled) return;
        let target = button.dataset.ctaTarget;
        if (button.dataset.ctaStep) {
          const current = availableNotices();
          const position = current.indexOf(owner);
          if (position < 0 || current.length < 2) return;
          target = current[(position + Number(button.dataset.ctaStep) + current.length) % current.length];
        }
        if (target && target !== owner) requestOpen(target);
      });
    }
  }
  function syncInterface(animate = false) {
    const available = availableNotices();
    const nextOrder = available.join(',');
    if (nextOrder !== paginationOrder) {
      const focused = document.activeElement;
      const focusOwner = focused?.closest('[data-cta-owner]')?.dataset.ctaOwner;
      const focusTarget = focused?.dataset.ctaTarget;
      const focusStep = focused?.dataset.ctaStep;
      buildPagination(available);
      paginationOrder = nextOrder;
      if (focusOwner && (focusTarget || focusStep)) {
        const target = focusTarget && available.includes(focusTarget) ? focusTarget : available.includes(focusOwner) ? focusOwner : null;
        const selector = target ? '[data-cta-target="' + target + '"]' : '[data-cta-step="' + focusStep + '"]';
        document.querySelector('[data-cta-owner="' + focusOwner + '"] ' + selector)?.focus({ preventScroll: true });
      }
    }
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
    const direct = location.hash === '#minis' && availableNotices().includes('minis');
    const target = direct ? 'minis' : order.find(id => states[id].ready && states[id].auto && isLive(id) && !states[id].deleted);
    if (!target) return;
    initialOpenHandled = true;
    setTimeout(() => {
      if (!order.some(id => states[id].open)) requestOpen(target, Boolean(direct));
    }, direct ? 0 : 650);
  }
  function applySchedule() {
    schedule = window.VFPublication?.config?.notices || {};
    scheduleReady = Boolean(window.VFPublication?.config);
    order.sort((a, b) => (Number(schedule[a]?.priority) || 99) - (Number(schedule[b]?.priority) || 99));
    for (const id of order) states[id].open = Boolean(document.querySelector('[data-cta-notice="' + id + '"]')?.open);
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
  window.addEventListener('vf:publication-update', applySchedule);
  applySchedule();
})();
