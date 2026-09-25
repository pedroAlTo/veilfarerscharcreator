(() => {
  const banner = document.querySelector('[data-pricing-special]');
  const countdown = document.querySelector('[data-pricing-countdown]');
  if (!(banner instanceof HTMLElement) || !(countdown instanceof HTMLElement)) return;
  let timer = 0;

  const live = (item, now = Date.now()) => {
    if (!item?.enabled) return false;
    const starts = item.startsAt ? Date.parse(item.startsAt) : NaN;
    const ends = item.endsAt ? Date.parse(item.endsAt) : NaN;
    return (!Number.isFinite(starts) || now >= starts) && (!Number.isFinite(ends) || now < ends);
  };
  const render = endsAt => {
    const remaining = Math.max(0, Date.parse(endsAt) - Date.now());
    if (!remaining) { banner.hidden = true; clearInterval(timer); return; }
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor(remaining / 3600000) % 24;
    const minutes = Math.floor(remaining / 60000) % 60;
    const seconds = Math.floor(remaining / 1000) % 60;
    countdown.innerHTML = [
      ['Days', days], ['Hours', hours], ['Minutes', minutes], ['Seconds', seconds]
    ].map(([label, value]) => `<span><strong>${String(value).padStart(2, '0')}</strong><small>${label}</small></span>`).join('');
    countdown.setAttribute('aria-label', `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds remaining`);
  };
  (async () => {
    let data;
    try {
      const response = await fetch('/api/cta-config', { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      data = await response.json();
    } catch {
      try { data = await fetch('/data/cta-schedule.json', { cache: 'no-store' }).then(response => response.json()); }
      catch { return; }
    }
    const pricing = data.notices?.pricing;
    if (!live(pricing) || !pricing.endsAt) return;
    banner.hidden = false;
    render(pricing.endsAt);
    timer = window.setInterval(() => render(pricing.endsAt), 1000);
    window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
  })();
})();
