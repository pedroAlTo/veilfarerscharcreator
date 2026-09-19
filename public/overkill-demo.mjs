// Personal-scale damage, Corebook 12.06 pp. 94–95. The example fixes Major 12 / Severe 22.
export function resolveOverkill(damage, { major = 12, severe = 22, deadly = false, armor = false } = {}) {
  const step = deadly ? 5 : 10;
  const extra = Math.max(0, Math.floor((damage - severe) / step));
  const rawHP = damage <= 0 ? 0 : damage < major ? 1 : damage < severe ? 2 : 3 + extra;
  // An Armor Slot lowers the severity category; any Overkill becomes Severe.
  const hp = armor ? rawHP > 3 ? 3 : Math.max(0, rawHP - 1) : rawHP;
  const tier = ['No damage', 'Minor', 'Major', 'Severe'][rawHP] || 'Overkill';
  return { rawHP, hp, tier, extra, next: damage < major ? major : damage < severe ? severe : severe + (extra + 1) * step };
}

if (typeof document !== 'undefined') {
  const lab = document.querySelector('[data-overkill-lab]');
  if (lab) {
    const range = lab.querySelector('.damage-range'), mode = lab.querySelector('select'), armor = lab.querySelector('[type="checkbox"]');
    const update = () => {
      const damage = +range.value, deadly = mode.value === 'deadly';
      const result = resolveOverkill(damage, { deadly, armor: armor.checked });
      lab.querySelector('[data-damage]').value = damage;
      lab.querySelector('[data-severity]').textContent = result.tier;
      lab.querySelector('[data-hp]').textContent = `${result.hp} HP`;
      range.setAttribute('aria-valuetext', `${damage} damage, ${result.tier}, mark ${result.hp} HP`);
      const step = deadly ? 5 : 10, boundaries = [1, 12, 22, 22 + step, 22 + step * 2];
      lab.querySelector('.damage-ladder').style.gridTemplateColumns = `11fr 10fr ${step}fr ${step}fr ${39 - step * 2}fr`;
      lab.querySelectorAll('.damage-ladder i').forEach((bar, i) => bar.classList.toggle('is-reached', damage >= boundaries[i]));
      lab.querySelector('[data-first-overkill]').textContent = `Overkill ${22 + step}+`;
      lab.querySelector('[data-explanation]').textContent = armor.checked
        ? `${result.rawHP} HP before armor. One Armor Slot lowers ${result.tier} to ${['no HP', 'Minor', 'Major', 'Severe'][result.hp]}. The damage roll stays ${damage}.`
        : `${result.extra ? `${result.extra} full ${step}-point increment${result.extra === 1 ? '' : 's'} beyond Severe: 3 + ${result.extra} HP.` : `${result.tier} damage marks ${result.rawHP} HP.`} The next increase begins at ${result.next} damage.`;
    };
    lab.querySelectorAll('input,select').forEach(control => control.addEventListener('input', update));
    update();
  }
  const share = document.querySelector('[data-share-article]');
  share?.addEventListener('click', async () => {
    const status = document.querySelector('[data-share-status]');
    // Keep preview shares on the preview until the article is released to production.
    const url = new URL(location.pathname, location.origin).href;
    try { await navigator.clipboard.writeText(url); status.textContent = 'Article link copied.'; }
    catch { status.textContent = `Article link: ${url}`; }
  });
}
