/* Veilfarers - shared importer: Character Creator export JSON -> Game Tool character model.
   Exposes window.veilfarersImportCreator(json) -> character object (or null if not a creator export). */
(function () {
  function num(v, d) { var n = parseInt(v, 10); return isNaN(n) ? (d || 0) : n; }
  function S(v) { return (v == null) ? '' : String(v); }
  function featureNames(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(S);
    return S(value).split(/[,;]+/).map(function(x){ return x.trim(); }).filter(Boolean);
  }
  function findCanonicalWeapon(canonical, source) {
    source = source || {};
    var id = S(source.id || source.canonicalId);
    var name = S(source.name).trim().toLowerCase();
    return (canonical.weapons || []).find(function (weapon) {
      if (id && weapon.id === id) return true;
      return name && S(weapon.name).trim().toLowerCase() === name;
    }) || null;
  }
  function hydrateWeapon(source, canonical) {
    source = source || {};
    var found = findCanonicalWeapon(canonical || {}, source);
    var base = found || source;
    var traits = S(source.trait || base.trait);
    var range = S(source.range || base.range);
    if (!range && traits.indexOf('·') !== -1) range = traits.split('·').slice(1).join('·').trim();
    var featureList = featureNames(source.features && source.features.length ? source.features : (source.feature || base.features || base.feature));
    if (!featureList.length && Array.isArray(base.features)) featureList = base.features.slice();
    return {
      id: S((found && found.id) || source.id || source.canonicalId),
      canonicalId: S((found && found.id) || source.canonicalId || source.id),
      name: S(source.name || base.name),
      trait: S(source.trait || base.trait),
      range: range,
      damage: S(source.damage || base.damage),
      features: featureList,
      feature: featureList.join(', '),
      featureRefs: (found && found.featureRefs) ? found.featureRefs : (source.featureRefs || []),
      tier: (found && found.tier) ? found.tier : (source.tier || null),
      pack: S((found && found.pack) || source.pack),
      burden: found && found.burden != null ? found.burden : (source.burden == null ? null : source.burden),
      weaponFamily: S((found && found.weaponFamily) || source.weaponFamily),
      proficiencyDie: S((found && found.proficiencyDie) || source.proficiencyDie)
    };
  }
  function ensureThreeExperiences(list) {
    var out = (list || []).map(function(exp){ return { description:S(exp && exp.description), bonus:num(exp && exp.bonus,2) }; });
    while (out.length < 3) out.push({ description:'', bonus:2 });
    return out;
  }

  function importCreator(json, canonical) {
    if (!json || !json.fields) return null;
    canonical = canonical || (typeof window !== 'undefined' ? window.VF_CANONICAL_DATA : null) || {};               // not a creator export
    var f = json.fields;
    var tracks = json.tracks || {};
    var maxT = (tracks.max || {});

    // path detection: creator uses s_* fields for Sleeping, a_* for Awakened
    var hasSleeper = !!(f.s_featname || f.s_move_0_n || f.s_exp_0);
    var hasAwakened = !!(f.a_featname || f.a_domain_ref && f.a_domain_ref.indexOf('do not use') === -1);
    var path = hasSleeper ? 'sleeping' : 'awakened';

    // experiences: sleeper s_exp_*, awakened a_exp_*
    var exps = [];
    var pre = (path === 'sleeping') ? 's_exp_' : 'a_exp_';
    for (var i = 0; i < 5; i++) {
      var d = S(f[pre + i]);
      if (d) exps.push({ description: d, bonus: num(f[pre + i + '_bonus'], 2) });
    }
    exps = ensureThreeExperiences(exps);

    // moves (sleeper): s_move_0..4 (name/text)
    var moves = [];
    for (var m = 0; m < 6; m++) {
      var mn = S(f['s_move_' + m + '_n']);
      if (mn) moves.push({ name: mn, text: S(f['s_move_' + m + '_t']) });
    }

    // weapons
    var weapons = [
      hydrateWeapon({ name: S(f.wpri_name), trait: S(f.wpri_trait), damage: S(f.wpri_dmg_final || f.wpri_dmg), feature: S(f.wpri_feat) }, canonical),
      hydrateWeapon({ name: S(f.wsec_name), trait: S(f.wsec_trait), damage: S(f.wsec_dmg_final || f.wsec_dmg), feature: S(f.wsec_feat) }, canonical)
    ].filter(function(w){ return !!w.name; });

    // inventory: eq_0..7 names (+use)
    var inv = [];
    for (var e = 0; e < 8; e++) {
      var en = S(f['eq_' + e + '_name']);
      inv.push(en ? (en + (f['eq_' + e + '_use'] ? ' (' + f['eq_' + e + '_use'] + ')' : '')) : '');
    }
    while (inv.length < 8) inv.push('');

    // augmentations (aug_0..9)
    var augments = [];
    for (var a = 0; a < 10; a++) {
      var an = S(f['aug_' + a + '_name']);
      if (an) augments.push({ name: an, tier: S(f['aug_' + a + '_tier']), benefit: S(f['aug_' + a + '_benefit']), stress: S(f['aug_' + a + '_stress']) });
    }

    // drones (drone_0..2)
    var drones = [];
    for (var dr = 0; dr < 3; dr++) {
      var dn = S(f['drone_' + dr + '_name']);
      if (dn) {
        var mods = [];
        for (var mm = 0; mm < 4; mm++) { var md = S(f['drone_' + dr + '_mod_' + mm]); if (md) mods.push(md); }
        drones.push({ name: dn, grade: S(f['drone_' + dr + '_grade']), hp: S(f['drone_' + dr + '_hp']),
                      evasion: S(f['drone_' + dr + '_eva']), armor: S(f['drone_' + dr + '_armor']),
                      slots: S(f['drone_' + dr + '_slots']), modules: mods });
      }
    }

    var thrMajor = num(f.thr_major, 8), thrSevere = num(f.thr_severe, 12);

    var oldDomainCards = [];
    for (var pc = 0; pc < 8; pc++) {
      var powerName = S(f['a_pwr_' + pc + '_n']).trim();
      if (!powerName) continue;
      var domainField = S(f['a_pwr_' + pc + '_d']);
      var domainName = domainField.split(/[·|]/)[0].trim();
      var levelMatch = domainField.match(/L(?:VL)?\s*(\d+)/i);
      var power = (canonical.powers || []).find(function(x){ return x.name === powerName && (!domainName || x.domain === domainName); });
      if (power) {
        var costMatch = String(power.cost || '').match(/(\d+)\s*Hope/i);
        oldDomainCards.push({ id:power.id, canonicalId:power.id, domain:power.domain, level:num(power.level,1), name:power.name, cost:costMatch?num(costMatch[1],0):0, costText:power.cost||'—', type:power.powerType||'Ability', text:power.text||'', recallCost:power.recallCost||S(f['a_pwr_' + pc + '_rc'])||'—', tier:power.tier||'' });
      } else {
        oldDomainCards.push({ id:'legacy:'+domainName+':'+powerName, canonicalId:null, domain:domainName||'Unknown', level:levelMatch?num(levelMatch[1],1):1, name:powerName, cost:0, costText:'—', type:'Ability', text:'Imported from a previous VeilFarers character file.', recallCost:S(f['a_pwr_' + pc + '_rc'])||'—', tier:'' });
      }
    }

    return {
      name: S(f.name), playerName: '', pronouns: S(f.pron),
      heritage: S(f.ancestry) + (f.ailuran_variant ? (' (' + f.ailuran_variant + ')') : ''),
      background: S(f.community), class: S(f.class), subclass: S(f.subclass),
      level: num(f.level, 1),
      path: path,
      stats: {
        agility: num(f.tr_agility), strength: num(f.tr_strength), finesse: num(f.tr_finesse),
        instinct: num(f.tr_instinct), presence: num(f.tr_presence), knowledge: num(f.tr_knowledge)
      },
      hp: { current: num(maxT.hp, num(f.base_hp_max, 6)), max: num(maxT.hp, num(f.base_hp_max, 6)) },
      stress: { current: 0, max: num(maxT.stress, num(f.base_stress_max, 6)) },
      hope: { current: 2, max: 6 },
      resolve: { current: num(maxT.s_resolve, num(f.auto_resolve_floor, 2)), max: num(maxT.s_resolve, num(f.auto_resolve_floor, 2)) },
      effort: { current: 2, max: 6 },
      thresholds: { major: thrMajor, severe: thrSevere },
      evasion: num(f.evasion, 10), shields: num(f.armor_score, 0),
      wealth: num(f.wealth, 1), credits: num(f.credits, 0),
      experiences: exps,
      moves: moves,
      features: (path === 'sleeping'
        ? (S(f.s_featname) + (f.s_feattext ? ': ' + f.s_feattext : ''))
        : (S(f.a_featname) + (f.a_feattext ? ': ' + f.a_feattext : ''))),
      classFeature: S(f.features),
      ancestryGift: S(f.ancestry_gift), communityGift: S(f.community_gift),
      armor: { name: S(f.armor_name), thresholds: S(f.armor_thr), feature: S(f.armor_feat), tier: S(f.armor_tier) },
      augments: augments,
      drones: drones,
      inventory: inv,
      weapons: weapons,
      weaponInventory: weapons.map(function(w){ return w.canonicalId || w.id; }).filter(Boolean),
      weaponArsenal: weapons.slice(),
      activeWeaponId: weapons[0] ? (weapons[0].canonicalId || weapons[0].id || weapons[0].name) : '',
      domainCards: oldDomainCards
    };
  }


  function findBy(items, predicate) {
    return (items || []).find(predicate) || null;
  }

  function importCreatorState(raw, canonical) {
    if (!raw || typeof raw !== 'object' || raw.fields) return null;
    if (!raw.ancestry && !raw.cls && !raw.name) return null;
    canonical = canonical || (typeof window !== 'undefined' ? window.VF_CANONICAL_DATA : null) || {};

    var ancestry = findBy(canonical.ancestries, function (x) { return x.slug === raw.ancestry || x.id === raw.ancestry || x.name === raw.ancestry; });
    var community = findBy(canonical.communities, function (x) { return x.slug === raw.community || x.id === raw.community || x.name === raw.community; });
    var cls = findBy(canonical.classes, function (x) { return x.slug === raw.cls || x.id === raw.cls || x.name === raw.cls; });
    var subclass = findBy(canonical.subclasses, function (x) {
      return x.name === raw.subclass || x.slug === raw.subclass || x.id === raw.subclass;
    });
    var selectedArmor = findBy(canonical.armor, function (x) { return (raw.armors || []).indexOf(x.name) !== -1; });
    var selectedWeapons = (raw.weapons || []).map(function (name) {
      return findBy(canonical.weapons, function (x) { return x.name === name; });
    }).filter(Boolean);
    var selectedPowers = (raw.powers || []).map(function (value) {
      var bits = String(value || '').split('::');
      var domain = bits.length > 1 ? bits.shift() : '';
      var name = bits.join('::') || value;
      return findBy(canonical.powers, function (x) { return x.name === name && (!domain || x.domain === domain); });
    }).filter(Boolean);

    var stats = { agility:0, strength:0, finesse:0, instinct:0, presence:0, knowledge:0 };
    Object.keys(stats).forEach(function (key) { stats[key] = num(raw.traits && raw.traits[key], 0); });
    var classRules = cls && cls.rules || {};
    var hp = cls && cls.statistics ? cls.statistics.hitPoints : classRules.hp;
    var evasion = cls && cls.statistics ? cls.statistics.evasion : classRules.evasion;
    var thresholds = selectedArmor && selectedArmor.thresholds || { major: 4, severe: 8 };
    var domainCards = selectedPowers.map(function (power) {
      var costMatch = String(power.cost || '').match(/(\d+)\s*Hope/i);
      return {
        id: power.id, canonicalId: power.id, domain: power.domain, level: power.level || 1,
        name: power.name, cost: costMatch ? num(costMatch[1], 0) : 0,
        costText: power.cost || '—', type: power.powerType || 'Ability', text: power.text || '',
        recallCost: power.recallCost || '—', tier: power.tier || ''
      };
    });

    var inventory = [];
    if (raw.kit) inventory.push(S(raw.kit));
    while (inventory.length < 8) inventory.push('');

    var ancestryRules = ancestry && (ancestry.rules || ancestry) || {};
    var communityRules = community && (community.rules || community) || {};
    var classRulesFull = cls && (cls.rules || cls) || {};
    var subclassRules = subclass && (subclass.rules || subclass) || {};
    var gifts = (ancestryRules.gifts || []).map(function(g){ return [g.name,g.text].filter(Boolean).join(': '); });
    if(ancestryRules.extra) gifts.push([ancestryRules.extra.name,ancestryRules.extra.text].filter(Boolean).join(': '));
    var strain = (ancestryRules.subStrains || []).find(function(x){ return x.id === raw.subStrain || x.name === raw.subStrain; });
    if(strain) gifts.push([strain.name, strain.featName, strain.featText].filter(Boolean).join(' · '));
    var communityFeature = communityRules.feature ? [communityRules.feature.name, communityRules.feature.text].filter(Boolean).join(': ') : '';
    var classFeature = classRulesFull.classFeature ? [classRulesFull.classFeature.name, classRulesFull.classFeature.text].filter(Boolean).join(': ') : '';
    var pathLower = String(raw.path || '').toLowerCase();
    var hopeFeature = classRulesFull.hopeFeature ? [classRulesFull.hopeFeature.name, classRulesFull.hopeFeature.text].filter(Boolean).join(': ') : '';
    var foundation = subclassRules.foundation ? { name:[subclassRules.foundation.name,subclassRules.foundation.type].filter(Boolean).join(' · '), text:subclassRules.foundation.desc || subclassRules.foundation.text || '' } : null;

    return {
      name: S(raw.name), playerName: '', pronouns: S(raw.pronouns),
      heritage: ancestry ? ancestry.name : S(raw.ancestry),
      background: community ? community.name : S(raw.community),
      class: cls ? cls.name : S(raw.cls), subclass: subclass ? subclass.name : S(raw.subclass),
      level: num(raw.level, 1), path: pathLower === 'sleeping' ? 'sleeping' : 'awakened',
      stats: stats,
      hp: { current: num(hp, 6), max: num(hp, 6) },
      stress: { current: 0, max: 6 }, hope: { current: 2, max: 6 }, effort: { current: 2, max: 6 },
      resolve: { current: 2, max: 2 },
      thresholds: { major: num(thresholds.major, 4), severe: num(thresholds.severe, 8) },
      evasion: num(evasion, 10), shields: selectedArmor ? num(selectedArmor.armorSlots, 0) : 0,
      wealth: 1, credits: 0,
      experiences: ensureThreeExperiences((raw.experiences || []).map(function (text) { return { description: S(text), bonus: 2 }; })),
      playerNotes: [raw.appearance, raw.voice, raw.bgAnswer, raw.anchor, raw.wound].filter(Boolean).join('\n'),
      inventory: inventory,
      weapons: selectedWeapons.map(function (weapon) { return hydrateWeapon(weapon, canonical); }),
      weaponInventory: selectedWeapons.map(function(weapon){ return weapon.id; }),
      weaponArsenal: selectedWeapons.map(function (weapon) { return hydrateWeapon(weapon, canonical); }),
      activeWeaponId: selectedWeapons[0] ? selectedWeapons[0].id : '',
      armor: selectedArmor ? { id:selectedArmor.id, canonicalId:selectedArmor.id, name:selectedArmor.name, thresholds:selectedArmor.thresholds && selectedArmor.thresholds.raw || '', feature:(selectedArmor.features || []).join(', '), tier:selectedArmor.tier && selectedArmor.tier.name || '' } : null,
      ancestryGift: gifts.join('\n\n'), communityGift: communityFeature, classFeature: classFeature, features: pathLower === 'sleeping' ? '' : hopeFeature,
      moves: foundation ? [foundation] : [], domainCards: domainCards,
      creatorSource: { schema: 'veilfarers.creator-state/1', importedAt: new Date().toISOString() }
    };
  }

  if (typeof window !== 'undefined') { window.veilfarersImportCreator = importCreator; window.veilfarersImportCreatorState = importCreatorState; }
  if (typeof module !== 'undefined' && module.exports) module.exports = { importCreator: importCreator, importCreatorState: importCreatorState };
})();
