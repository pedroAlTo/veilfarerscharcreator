// Personal-scale thresholds, Corebook 12.06 pp. 94–95. Armor follows the author’s clarification: one HP per spent slot.
// Tactical Armor: Corebook 12.06 p. 125. Add wearer level to base thresholds (p. 123).
export const ARMOR_PROFILE = Object.freeze({ name: 'Tactical Armor', baseMajor: 10, baseSevere: 20, level: 2, slots: 5 });
export function resolveOverkill(damage, { major = ARMOR_PROFILE.baseMajor + ARMOR_PROFILE.level, severe = ARMOR_PROFILE.baseSevere + ARMOR_PROFILE.level, deadly = false, armorSlots = 0 } = {}) {
  const step = deadly ? 5 : 10;
  const extra = Math.max(0, Math.floor((damage - severe) / step));
  const rawHP = damage <= 0 ? 0 : damage < major ? 1 : damage < severe ? 2 : 3 + extra;
  const spent = Number.isFinite(armorSlots) ? Math.max(0, Math.min(ARMOR_PROFILE.slots, Math.floor(armorSlots))) : 0;
  const hp = Math.max(0, rawHP - spent);
  const tier = ['No damage', 'Minor', 'Major', 'Severe'][rawHP] || 'Overkill';
  return { rawHP, hp, tier, extra, spent, next: damage < major ? major : damage < severe ? severe : severe + (extra + 1) * step };
}

if (typeof document !== 'undefined') {
  const lab = document.querySelector('[data-overkill-lab]');
  if (lab) {
    const range = lab.querySelector('.damage-range'), mode = lab.querySelector('select');
    const markers = [...lab.querySelectorAll('[data-armor-marker]')];
    const update = () => {
      const damage = +range.value, deadly = mode.value === 'deadly';
      const armorSlots = markers.filter(marker => marker.getAttribute('aria-pressed') === 'false').length;
      const result = resolveOverkill(damage, { deadly, armorSlots });
      lab.querySelector('[data-armor-count]').textContent = `${ARMOR_PROFILE.slots - result.spent} / ${ARMOR_PROFILE.slots} ready`;
      lab.querySelector('[data-damage]').value = damage;
      lab.querySelector('[data-severity]').textContent = result.tier;
      lab.querySelector('[data-hp]').textContent = `${result.hp} HP`;
      range.setAttribute('aria-valuetext', `${damage} damage, ${result.tier}, mark ${result.hp} HP`);
      const step = deadly ? 5 : 10, boundaries = [1, 12, 22, 22 + step, 22 + step * 2];
      lab.querySelector('.damage-ladder').style.gridTemplateColumns = `11fr 10fr ${step}fr ${step}fr ${39 - step * 2}fr`;
      lab.querySelectorAll('.damage-ladder i').forEach((bar, i) => bar.classList.toggle('is-reached', damage >= boundaries[i]));
      lab.querySelector('[data-first-overkill]').textContent = `Overkill ${22 + step}+`;
      lab.querySelector('[data-explanation]').textContent = result.spent
        ? `${result.rawHP} HP before armor. ${result.spent} spent Armor Slot${result.spent === 1 ? '' : 's'} reduce${result.spent === 1 ? 's' : ''} this by ${result.spent} HP: mark ${result.hp} HP.${result.spent > result.rawHP ? ' HP loss cannot fall below zero.' : ''}`
        : `${result.extra ? `${result.extra} full ${step}-point increment${result.extra === 1 ? '' : 's'} beyond Severe: 3 + ${result.extra} HP.` : `${result.tier} damage marks ${result.rawHP} HP.`} The next increase begins at ${result.next} damage.`;
    };
    lab.querySelectorAll('input,select').forEach(control => control.addEventListener('input', update));
    for (const marker of markers) marker.addEventListener('click', () => {
      const ready = marker.getAttribute('aria-pressed') !== 'true';
      marker.setAttribute('aria-pressed', String(ready));
      marker.setAttribute('aria-label', `Armor slot ${marker.dataset.armorMarker} — ${ready ? 'ready. Spend slot.' : 'spent. Restore slot.'}`);
      update();
    });
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
