// Set a confirmed UTC start date to open this campaign. A draft accepts no votes.
export const campaign = Object.freeze({
  id: 'ancestry-minis-01',
  opensAt: null,
  durationDays: 7,
  batchSize: 3,
  releaseIntervalDays: 7
});

export const ancestries = Object.freeze([
  { id: 'ailuran', name: 'Ailuran', hint: 'Curiosity · secrets · aura-sight' },
  { id: 'bloomstrider', name: 'Bloomstrider', hint: 'Living memory · seasons · growth' },
  { id: 'celestiari', name: 'Celestiari', hint: 'Starlight · empathy · ancient lives' },
  { id: 'ethereal', name: 'Ethereal', hint: 'The Veil · identity · shifting matter' },
  { id: 'human', name: 'Human', hint: 'Adaptability · ambition · survival' },
  { id: 'kryllian', name: 'Kryllian', hint: 'Biology · ingenuity · resilience' },
  { id: 'kryx', name: 'Kryx', hint: 'Strength · duty · belonging' },
  { id: 'rift-spinner', name: 'Rift Spinner', hint: 'Space · navigation · connection' },
  { id: 'synthetic', name: 'Synthetic', hint: 'Memory · autonomy · created life' }
]);

export function campaignStatus(now = Date.now(), settings = campaign) {
  const start = settings.opensAt ? Date.parse(settings.opensAt) : NaN;
  const end = start + settings.durationDays * 86400000;
  const valid = Number.isFinite(start) && Number.isFinite(end) && end > start;
  return {
    campaignId: settings.id,
    state: !valid ? 'draft' : now < start ? 'scheduled' : now < end ? 'open' : 'closed',
    opensAt: valid ? new Date(start).toISOString() : null,
    closesAt: valid ? new Date(end).toISOString() : null,
    serverNow: new Date(now).toISOString()
  };
}
