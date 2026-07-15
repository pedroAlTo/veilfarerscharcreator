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
    api.loadCollection('classes'),
    api.loadCollection('subclasses'),
    api.loadCollection('ancestries'),
    api.loadCollection('communities'),
    api.loadCollection('traits'),
    api.loadCollection('droneGrades'),
    api.loadCollection('droneModules')
  ]).then(([manifest,powers,weapons,armor,gear,augments,features,classes,subclasses,ancestries,communities,traits,droneGrades,droneModules]) => {
    const data = {
      manifest,powers,weapons,armor,gear,augments,features,classes,subclasses,ancestries,communities,traits,droneGrades,droneModules,
      domainCards: domainCards(powers)
    };
    global.VF_CANONICAL_DATA = data;
    global.DOMAIN_CARDS = data.domainCards;
    global.VEILFARERS_DATA_VERSION = manifest.release || manifest.canonicalVersion || manifest.version || '11.1 RC2';
    return data;
  });

  global.VeilFarersCanonical = Object.freeze({ ready, domainCards });
})(window);
