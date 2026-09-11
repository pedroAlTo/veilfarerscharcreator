(() => {
  const inbox = document.querySelector('[data-cta-inbox]');
  if (!(inbox instanceof HTMLButtonElement)) return;
  const order = ['books', 'crossing', 'release', 'beta', 'minis'].filter(id => document.querySelector('[data-cta-notice="' + id + '"]'));
  const states = Object.fromEntries(order.map(id => [id, { active: false, deleted: false, open: false, ready: false, auto: false }]));
  const titles = Object.fromEntries(order.map(id => [id, document.querySelector('[data-cta-notice="' + id + '"]').dataset.ctaTitle]));
  let initialOpenHandled = false;

  // One source for the pagination, including skipping independently deleted notices.
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
        const available = order.filter(id => !states[id].deleted);
        target = available[(available.indexOf(owner) + Number(button.dataset.ctaStep) + available.length) % available.length];
      }
      if (target && target !== owner) window.dispatchEvent(new CustomEvent('vf:cta-switch-request', { detail: { from: owner, to: target } }));
    });
  }

  function syncInterface(animate = false) {
    const available = order.filter(id => !states[id].deleted);
    const count = available.filter(id => states[id].active).length;
    const open = available.some(id => states[id].open);
    inbox.classList.toggle('is-active', count > 0);
    inbox.disabled = !available.length;
    inbox.setAttribute('aria-disabled', String(inbox.disabled));
    inbox.setAttribute('aria-expanded', String(open));
    inbox.setAttribute('aria-label', inbox.disabled ? 'All notifications dismissed' : open ? 'Notifications are open' : 'Open saved notifications (' + count + ')');
    if (animate && count) {
      inbox.classList.remove('is-arriving');
      requestAnimationFrame(() => inbox.classList.add('is-arriving'));
    }
    document.querySelectorAll('[data-cta-target]').forEach(button => {
      button.disabled = !states[button.dataset.ctaTarget]?.ready || states[button.dataset.ctaTarget]?.deleted === true;
      button.setAttribute('aria-disabled', String(button.disabled));
    });
    document.querySelectorAll('[data-cta-step]').forEach(button => { button.disabled = available.length < 2; });
  }

  function requestOpen(target, explicit = false) {
    const current = order.find(id => states[id].open);
    if (current && current !== target) {
      window.dispatchEvent(new CustomEvent('vf:cta-switch-request', { detail: { from: current, to: target } }));
    } else window.dispatchEvent(new CustomEvent('vf:cta-open', { detail: { target, explicit } }));
  }

  function openInitial() {
    if (initialOpenHandled || document.readyState !== 'complete') return;
    initialOpenHandled = true;
    const direct = location.hash === '#minis' && states.minis?.ready;
    const target = direct ? 'minis' : order.find(id => states[id].ready && states[id].auto && !states[id].deleted);
    if (target) setTimeout(() => {
      if (!order.some(id => states[id].open)) requestOpen(target, Boolean(direct));
    }, direct ? 0 : 650);
  }

  inbox.addEventListener('click', () => {
    const target = order.find(id => states[id].active && !states[id].deleted);
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
  window.addEventListener('hashchange', () => { if (location.hash === '#minis' && states.minis?.ready) requestOpen('minis', true); });
  window.addEventListener('load', openInitial, { once: true });
  syncInterface();
  window.dispatchEvent(new CustomEvent('vf:cta-state-request'));
})();
