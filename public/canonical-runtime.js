(function(global){
  'use strict';
  const api = global.VeilFarersData;
  if(!api){
    throw new Error('shared-data.js must be loaded before canonical-runtime.js');
  }

  function hopeCost(value){
    const match = String(value || '').match(/(\d+)\s*Hope/i);
    return match ? Number(match[1]) : 0;
  }

  function readJSON(path){return fetch(path,{cache:'no-store'}).then(function(response){if(!response.ok)throw new Error('Failed to load '+path);return response.json();});}

  function domainCards(powers){
    const groups = {};
    powers.forEach(power => {
      const domain = power.domain || 'Unknown';
      if(!groups[domain]) groups[domain] = [];
      groups[domain].push({
        id: power.id,
        canonicalId: power.id,
        domain,
        level: Number(power.level || 1),
        name: power.name,
        cost: hopeCost(power.cost),
        costText: power.cost || '—',
        type: power.powerType || 'Ability',
        text: power.text || '',
        recallCost: power.recallCost || '—',
        tier: power.tier || ''
      });
    });
    Object.keys(groups).forEach(domain => groups[domain].sort((a,b) => a.level-b.level || a.name.localeCompare(b.name)));
    return groups;
  }

  const ready = Promise.all([
    api.manifest(),
    api.loadCollection('powers'),
    api.loadCollection('weapons'),
    api.loadCollection('armor'),
    api.loadCollection('gear'),
    api.loadCollection('augments'),
    api.loadCollection('features'),
    api.loadCollection('featureRegistry'),
    api.loadCollection('classes'),
    api.loadCollection('subclasses'),
    api.loadCollection('resolveMoves'),
    api.loadCollection('drills'),
    api.loadCollection('ancestries'),
    api.loadCollection('communities'),
    api.loadCollection('traits'),
    api.loadCollection('droneGrades'),
    api.loadCollection('droneModules'),
    readJSON('/data/classes.json')
  ]).then(([manifest,powers,weapons,armor,gear,augments,features,featureRegistry,classes,subclasses,resolveMoves,drills,ancestries,communities,traits,droneGrades,droneModules,classCompat]) => {
    const data = {
      manifest,powers,weapons,armor,gear,augments,features,featureRegistry,classes,subclasses,resolveMoves,drills,ancestries,communities,traits,droneGrades,droneModules,classCompat,
      domainCards: domainCards(powers)
    };
    global.VF_CANONICAL_DATA = data;
    global.DOMAIN_CARDS = data.domainCards;
    global.VEILFARERS_DATA_VERSION = manifest.release || manifest.canonicalVersion || manifest.version || '11.1 RC3';
    return data;
  });

  global.VeilFarersCanonical = Object.freeze({ ready, domainCards });
})(window);
