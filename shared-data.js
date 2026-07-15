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
    ancestries: ['core/ancestries.json'],
    communities: ['core/communities.json'],
    affiliations: ['core/affiliations.json'],
    domains: ['core/domains.json'],
    powers: ['core/powers.json'],
    techTiers: ['core/tech-tiers.json'],
    traits: ['core/traits.json'],
    features: ['core/features.json'],
    droneGrades: ['core/drone-grades.json', 'rust-and-steel/drone-grades.json'],
    droneModules: ['core/drone-modules.json']
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
  function credits(item){
    const value = item?.cost?.credits;
    return value === 0 || value ? String(value) : '—';
  }
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
    credits,
    packLabel,
    escapeHtml,
    findById
  });
})(window);
