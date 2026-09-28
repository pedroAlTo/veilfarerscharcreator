(() => {
  const banner = document.querySelector('[data-pricing-special]');
  const countdown = document.querySelector('[data-pricing-countdown]');
  if (!(banner instanceof HTMLElement) || !(countdown instanceof HTMLElement)) return;
  let timer = 0;
  function render() {
    const schedule = window.VFPublication;
    const pricing = schedule?.config?.notices?.pricing;
    banner.hidden = !schedule?.isLive('notices', 'pricing');
    countdown.hidden = !pricing?.endsAt;
    if (banner.hidden || countdown.hidden) return;
    const remaining = Math.max(0, Date.parse(pricing.endsAt) - schedule.now);
    if (!remaining) { banner.hidden = true; return; }
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor(remaining / 3600000) % 24;
    const minutes = Math.floor(remaining / 60000) % 60;
    const seconds = Math.floor(remaining / 1000) % 60;
    countdown.innerHTML = [['Days', days], ['Hours', hours], ['Minutes', minutes], ['Seconds', seconds]].map(([label, value]) => `<span><strong>${String(value).padStart(2, '0')}</strong><small>${label}</small></span>`).join('');
    countdown.setAttribute('aria-label', `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds remaining`);
  }
  function start() { clearInterval(timer); render(); timer = setInterval(render, 1000); }
  window.addEventListener('vf:publication-update', render);
  window.addEventListener('pagehide', () => clearInterval(timer));
  window.addEventListener('pageshow', start);
  start();
})();
