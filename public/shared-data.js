(function(global){
  'use strict';
  const ROOT = '/rules-data/';
  const collectionPaths = Object.freeze({
    weapons: ['core/weapons.json', 'rust-and-steel/weapons.json'],
    armor: ['core/armor.json', 'rust-and-steel/armor.json'],
    gear: ['core/gear.json', 'rust-and-steel/gear.json'],
    augments: ['core/augments.json', 'rust-and-steel/augments.json'],
    classes: ['core/classes.json'],
    subclasses: ['core/subclasses.json'],
    resolveMoves: ['core/resolve-moves.json'],
    drills: ['core/drills.json'],
    ancestries: ['core/ancestries.json'],
    communities: ['core/communities.json'],
    affiliations: ['core/affiliations.json'],
    domains: ['core/domains.json'],
    powers: ['core/powers.json'],
    techTiers: ['core/tech-tiers.json'],
    traits: ['core/traits.json'],
    features: ['core/features.json'],
    featureRegistry: ['features-registry.json'],
    droneGrades: ['core/drone-grades.json', 'rust-and-steel/drone-grades.json'],
    droneModules: ['core/drone-modules.json', 'rust-and-steel/drone-modules.json']
  });
  const cache = new Map();

  async function fetchJson(path){
    const response = await fetch(ROOT + path, { cache: 'no-store' });
    if(!response.ok) throw new Error(`Could not load ${path} (${response.status}).`);
    return response.json();
  }

  function dedupe(items){
    const seen = new Set();
    return items.filter(item => {
      const key = item && (item.id || `${item.pack || ''}:${item.slug || item.name}`);
      if(!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function loadCollection(name){
    if(cache.has(name)) return cache.get(name);
    const paths = collectionPaths[name];
    if(!paths) throw new Error(`Unknown canonical collection: ${name}`);
    const promise = Promise.all(paths.map(fetchJson))
      .then(groups => dedupe(groups.flat()).sort((a,b) => String(a.name || '').localeCompare(String(b.name || ''))));
    cache.set(name, promise);
    return promise;
  }

  async function manifest(){
    if(!cache.has('manifest')) cache.set('manifest', fetchJson('manifest.json'));
    return cache.get('manifest');
  }

  function tierName(item){ return item?.tier?.name || item?.raw?.tier || 'Unrated'; }
  function tierRank(item){ return Number(item?.tier?.rank || 99); }
  function creditValue(item){
    const raw = item?.cost?.credits;
    const value = Number(String(raw ?? '').replace(/[^0-9.\-]/g,''));
    return Number.isFinite(value) ? value : null;
  }
  function wealthTierForCredits(value){
    const n = Number(value);
    if(!Number.isFinite(n) || n < 0) return null;
    const ladder = [1,4,9,16,25];
    const exact = ladder.indexOf(n);
    if(exact >= 0) return { tier: exact + 1, exact: true, ceiling: ladder[exact], fraction: '1' };
    if(n === 0) return { tier: 0, exact: true, ceiling: 0, fraction: '0' };
    const idx = ladder.findIndex(v => n < v);
    const tier = idx < 0 ? 5 : idx + 1;
    const ceiling = idx < 0 ? ladder[4] : ladder[idx];
    const gcd = (a,b) => b ? gcd(b,a%b) : a;
    const divisor = gcd(Math.round(n),ceiling) || 1;
    return { tier, exact:false, ceiling, fraction:`${Math.round(n)/divisor}/${ceiling/divisor}` };
  }
  function costLabel(item){
    const value = creditValue(item);
    if(value === null) return '—';
    const wt = wealthTierForCredits(value);
    if(!wt || wt.tier === 0) return `${value} Cr`;
    return wt.exact ? `${value} Cr (WT${wt.tier})` : `${value} Cr (${wt.fraction} WT${wt.tier})`;
  }
  function credits(item){ return costLabel(item); }
  function packLabel(pack){
    if(pack === 'core') return 'Core';
    if(pack === 'rust-and-steel') return 'Rust & Steel';
    if(pack === 'alien-species') return 'Alien Species';
    return pack || 'Unknown';
  }
  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }
  function findById(groups, id){
    for(const group of groups){
      const found = group.find(item => item.id === id);
      if(found) return found;
    }
    return null;
  }

  global.VeilFarersData = Object.freeze({
    root: ROOT,
    collectionPaths,
    loadCollection,
    manifest,
    tierName,
    tierRank,
    credits, creditValue, wealthTierForCredits, costLabel,
    packLabel,
    escapeHtml,
    findById
  });
})(window);
