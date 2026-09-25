(() => {
  const inbox = document.querySelector('[data-cta-inbox]');
  if (!(inbox instanceof HTMLButtonElement)) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  for (const modal of document.querySelectorAll('[data-announcement-modal]')) {
    if (!(modal instanceof HTMLDialogElement)) continue;
    const id = modal.dataset.ctaNotice;
    const closeButton = modal.querySelector('[data-announcement-close]');
    const deleteButton = modal.querySelector('[data-announcement-delete]');
    const shelvedKey = `vf-${id}-notice-shelved-v1`;
    const deletedKey = `vf-${id}-notice-deleted-v1`;
    let closing = false;
    let closeMode = 'shelve';
    let switchTarget = '';
    let timer = 0;

    const read = (storage, key) => { try { return window[storage].getItem(key) === '1'; } catch { return false; } };
    const write = (storage, key) => { try { window[storage].setItem(key, '1'); } catch {} };
    const deleted = () => read('localStorage', deletedKey);
    const shelved = () => read('sessionStorage', shelvedKey);
    function report(active, animate = false) {
      window.dispatchEvent(new CustomEvent('vf:cta-inbox-update', { detail: {
        target: id, active: active && !deleted(), deleted: deleted(), open: modal.open,
        animate, auto: !shelved() && !deleted()
      } }));
    }
    function finishClose() {
      clearTimeout(timer);
      modal.classList.remove('is-closing');
      if (modal.open) modal.close();
      const switching = closeMode === 'switch';
      const saved = closeMode !== 'delete' && !deleted();
      report(saved, saved);
      closing = false;
      if (saved && !switching) inbox.focus({ preventScroll: true });
      if (switching && switchTarget) {
        const target = switchTarget; switchTarget = '';
        setTimeout(() => window.dispatchEvent(new CustomEvent('vf:cta-open', { detail: { target } })), 80);
      }
    }
    function close(mode = 'shelve', target = '') {
      if (closing || !modal.open) return;
      closing = true; closeMode = mode; switchTarget = target;
      if (mode === 'delete') { write('localStorage', deletedKey); try { sessionStorage.removeItem(shelvedKey); } catch {} }
      else write('sessionStorage', shelvedKey);
      if (reducedMotion.matches) return finishClose();
      modal.classList.add('is-closing');
      timer = setTimeout(finishClose, 700);
    }
    function open() {
      if (deleted() || modal.open || closing || document.querySelector('dialog[open]')) return;
      try { modal.showModal(); } catch { return; }
      report(false);
      closeButton?.focus({ preventScroll: true });
    }
    closeButton?.addEventListener('click', () => close('shelve'));
    deleteButton?.addEventListener('click', () => close('delete'));
    modal.addEventListener('cancel', event => { event.preventDefault(); close('shelve'); });
    modal.addEventListener('click', event => { if (event.target === modal) close('shelve'); });
    window.addEventListener('vf:cta-switch-request', event => {
      const { from, to } = event.detail || {};
      if (from === id && to) close('switch', to);
    });
    window.addEventListener('vf:cta-open', event => { if (event.detail?.target === id) open(); });
    window.addEventListener('vf:cta-state-request', () => report(!modal.open));
    report(!deleted());
  }
})();
