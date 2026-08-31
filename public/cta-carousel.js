(() => {
  const buttons = [...document.querySelectorAll('[data-cta-target]')];
  const inbox = document.querySelector('[data-cta-inbox]');
  const states = {
    release: { active: false, deleted: false, open: false },
    beta: { active: false, deleted: false, open: false }
  };
  if (!buttons.length || !(inbox instanceof HTMLButtonElement)) return;

  function syncInterface(animate = false) {
    const available = Object.entries(states).filter(([, state]) => !state.deleted);
    const active = available.filter(([, state]) => state.active);
    const open = available.some(([, state]) => state.open);
    const count = active.length;
    inbox.classList.toggle('is-active', count > 0);
    inbox.disabled = available.length === 0;
    inbox.setAttribute('aria-disabled', inbox.disabled ? 'true' : 'false');
    inbox.setAttribute('aria-expanded', open ? 'true' : 'false');
    inbox.setAttribute('aria-label', inbox.disabled
      ? 'All notifications permanently dismissed'
      : count ? `Open saved notifications (${count})` : open ? 'Notifications are open' : 'No saved notifications');
    if (animate && count) {
      inbox.classList.remove('is-arriving');
      requestAnimationFrame(() => inbox.classList.add('is-arriving'));
    }
    for (const button of buttons) {
      const target = button.dataset.ctaTarget;
      const current = button.getAttribute('aria-current') === 'page';
      const unavailable = !current && states[target]?.deleted === true;
      button.disabled = unavailable;
      button.setAttribute('aria-disabled', unavailable ? 'true' : 'false');
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const navigation = button.closest('[data-cta-owner]');
      const from = navigation?.dataset.ctaOwner;
      const to = button.dataset.ctaTarget;
      if (!from || !to || from === to || button.disabled) return;
      window.dispatchEvent(new CustomEvent('vf:cta-switch-request', { detail: { from, to } }));
    });
  }

  inbox.addEventListener('click', () => {
    const activeTargets = Object.keys(states).filter(target => states[target].active && !states[target].deleted);
    const target = ['release', 'beta'].find(item => activeTargets.includes(item));
    if (target) window.dispatchEvent(new CustomEvent('vf:cta-open', { detail: { target } }));
  });
  inbox.addEventListener('animationend', () => inbox.classList.remove('is-arriving'));
  window.addEventListener('vf:cta-inbox-update', event => {
    const detail = event.detail || {};
    if (!states[detail.target]) return;
    states[detail.target] = {
      active: Boolean(detail.active), deleted: Boolean(detail.deleted), open: Boolean(detail.open)
    };
    syncInterface(Boolean(detail.animate));
  });

  syncInterface();
  window.dispatchEvent(new CustomEvent('vf:cta-state-request'));
})();
