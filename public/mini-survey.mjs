import { campaign, ancestries, campaignStatus } from './mini-campaign.mjs?v=20260909-1';

const modal = document.querySelector('[data-mini-modal]');
if (modal instanceof HTMLDialogElement) setupSurvey();

function setupSurvey() {
  const inbox = document.querySelector('[data-cta-inbox]');
  const form = modal.querySelector('[data-mini-form]');
  const choices = modal.querySelector('[data-mini-choices]');
  const submit = modal.querySelector('[data-mini-submit]');
  const statusLabel = modal.querySelector('[data-mini-status]');
  const message = modal.querySelector('[data-mini-message]');
  const closeButton = modal.querySelector('[data-mini-close]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = `vf-${campaign.id}-notice`;
  let status = campaignStatus();
  let verified = !campaign.opensAt;
  let submitting = false;
  let voted = false;
  let closing = false;
  let closeTimer;
  let refreshTimer;

  async function fetchWithTimeout(url, options = {}, milliseconds = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), milliseconds);
    try { return await fetch(url, { ...options, signal: controller.signal }); }
    finally { clearTimeout(timer); }
  }

  // These preferences control the notice only. No vote is stored in the browser.
  function preference(store, action, value) {
    try { return window[store][action](storageKey, value); } catch { return null; }
  }
  const deleted = () => preference('localStorage', 'getItem') === 'deleted';
  const shelved = () => preference('sessionStorage', 'getItem') === 'saved';
  function report(animate = false) {
    window.dispatchEvent(new CustomEvent('vf:cta-inbox-update', { detail: {
      target: 'minis', active: !modal.open && !deleted(), deleted: deleted(), open: modal.open,
      auto: !shelved() && !deleted(), animate
    } }));
  }

  ancestries.forEach((ancestry, index) => {
    const label = document.createElement('label'); label.className = 'vf-mini-choice';
    const input = document.createElement('input'); input.type = 'radio'; input.name = 'ancestry'; input.value = ancestry.id; input.required = true;
    const body = document.createElement('span');
    const number = document.createElement('small'); number.textContent = `SIGNAL ${String(index + 1).padStart(2, '0')}`;
    const name = document.createElement('strong'); name.textContent = ancestry.name;
    const hint = document.createElement('em'); hint.textContent = ancestry.hint;
    body.append(number, name, hint); label.append(input, body); choices.append(label);
  });

  function setMessage(text, error = false) {
    message.textContent = text;
    message.classList.toggle('is-error', error);
  }
  const date = value => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }).format(new Date(value));
  function renderStatus() {
    submit.disabled = !verified || status.state !== 'open' || submitting || voted;
    form.querySelector('fieldset').disabled = submitting || voted;
    if (voted) { submit.textContent = 'Signal received'; return; }
    if (submitting) { submit.textContent = 'Transmitting your vote…'; return; }
    if (!verified) { statusLabel.textContent = 'Connection to the Archive unavailable'; submit.textContent = 'Voting unavailable'; return; }
    if (status.state === 'draft') {
      statusLabel.textContent = 'Incoming transmission · Opening soon';
      submit.textContent = 'Voting opens soon';
      setMessage('Explore the nine signals. Voting will open when the launch date is announced.');
    } else if (status.state === 'scheduled') {
      statusLabel.textContent = `Voting opens ${date(status.opensAt)}`;
      submit.textContent = 'Voting opens soon';
      setMessage(`The seven-day vote closes ${date(status.closesAt)}.`);
    } else if (status.state === 'closed') {
      statusLabel.textContent = 'Voting closed · Results being decoded';
      submit.textContent = 'Voting has closed';
      setMessage('The first three ancestries and their release dates will be revealed in Alien Species.');
    } else {
      statusLabel.textContent = `Voting open · Closes ${date(status.closesAt)}`;
      submit.textContent = 'Transmit my vote';
      setMessage('Choose one ancestry. Results stay sealed until voting closes.');
    }
  }
  async function refreshStatus() {
    clearTimeout(refreshTimer);
    if (!campaign.opensAt) { renderStatus(); return; }
    try {
      const response = await fetchWithTimeout('/api/ancestry-vote', { cache: 'no-store', credentials: 'omit' });
      const body = await response.json();
      if (!response.ok || body.campaignId !== campaign.id || !['draft','scheduled','open','closed'].includes(body.state)) throw Error('Status unavailable');
      status = body; verified = true; renderStatus();
    } catch {
      verified = false; renderStatus();
      if (!voted) setMessage('The Archive could not be reached. Please try again in a moment.', true);
    }
    if (modal.open && !voted && !document.hidden) refreshTimer = setTimeout(refreshStatus, 30000);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled || submitting || voted || !form.reportValidity()) return;
    // Capture before disabling the fieldset: disabled controls are excluded from FormData.
    const ancestry = new FormData(form).get('ancestry');
    submitting = true; renderStatus(); setMessage('Sending your signal…');
    try {
      const response = await fetchWithTimeout('/api/ancestry-vote', {
        method: 'POST', credentials: 'omit', cache: 'no-store', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, ancestry })
      }, 15000);
      const body = await response.json();
      if (!response.ok || body.accepted !== true) {
        if (body.state) status = body;
        throw Error(body.error || 'We could not confirm your vote.');
      }
      voted = true;
      setMessage('Thank you, VeilFarer. Your signal is in. Return to Alien Species for the first three reveals after the vote closes.');
    } catch (error) {
      setMessage(error.name === 'AbortError' ? 'Confirmation timed out. Your vote may have arrived; please wait before trying again.' : error.message || 'The connection was interrupted. Your vote may have arrived.', true);
    } finally {
      submitting = false;
      const text = message.textContent; const isError = message.classList.contains('is-error');
      renderStatus(); setMessage(text, isError);
    }
  });

  function open(explicit = false) {
    if (explicit) preference('localStorage', 'removeItem');
    if (deleted() || modal.open || closing || document.querySelector('dialog[open]')) return;
    modal.showModal(); report(); closeButton.focus({ preventScroll: true }); refreshStatus();
  }
  function close(mode = 'save', target = '') {
    if (!modal.open || closing) return;
    closing = true; clearTimeout(refreshTimer);
    if (mode === 'delete') preference('localStorage', 'setItem', 'deleted');
    else preference('sessionStorage', 'setItem', 'saved');
    const finish = () => {
      clearTimeout(closeTimer); modal.classList.remove('is-closing'); modal.close(); closing = false; report(true);
      if (target) window.dispatchEvent(new CustomEvent('vf:cta-open', { detail: { target } }));
      else inbox?.focus({ preventScroll: true });
    };
    if (reducedMotion.matches) finish();
    else { modal.classList.add('is-closing'); closeTimer = setTimeout(finish, 660); }
  }
  closeButton.addEventListener('click', () => close());
  modal.querySelector('[data-mini-delete]').addEventListener('click', () => close('delete'));
  modal.addEventListener('cancel', event => { event.preventDefault(); close(); });
  modal.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...modal.querySelectorAll('a[href],button,input,summary,[tabindex]')].filter(element => {
      if (element.matches(':disabled') || element.tabIndex < 0 || !element.getClientRects().length) return false;
      if (element.closest('details:not([open])') && !element.matches('summary')) return false;
      if (element instanceof HTMLInputElement && element.type === 'radio') {
        const group = [...form.querySelectorAll('input[type="radio"]')];
        return element === (group.find(input => input.checked) || group[0]);
      }
      return true;
    });
    const first = controls[0]; const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  modal.querySelector('a[href="#mini-privacy"]').addEventListener('click', event => {
    event.preventDefault(); const disclosure = modal.querySelector('#mini-privacy'); disclosure.open = true; disclosure.querySelector('summary').focus();
  });
  window.addEventListener('vf:cta-open', event => { if (event.detail?.target === 'minis') open(event.detail.explicit); });
  window.addEventListener('vf:cta-switch-request', event => { if (event.detail?.from === 'minis') close('switch', event.detail.to); });
  window.addEventListener('vf:cta-state-request', () => report());
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(refreshTimer); else if (modal.open) refreshStatus(); });
  renderStatus(); report();
}
