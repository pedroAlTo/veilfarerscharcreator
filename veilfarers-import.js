/* Veilfarers - shared importer: Character Creator export JSON -> Game Tool character model.
   Exposes window.veilfarersImportCreator(json) -> character object (or null if not a creator export). */
(function () {
  function num(v, d) { var n = parseInt(v, 10); return isNaN(n) ? (d || 0) : n; }
  function S(v) { return (v == null) ? '' : String(v); }
  function safeJSON(value, fallback) { try { var parsed = typeof value === 'string' ? JSON.parse(value) : value; return parsed == null ? fallback : parsed; } catch (_) { return fallback; } }
  function rankValue(value) { var key=S(value).trim().toLowerCase(); return key==='mastery'?3:key==='specialization'?2:1; }
  function pathSubclassRules(item, path) { if(!item)return {}; return path==='sleeping' && item.sleepingRules ? item.sleepingRules : (item.rules || item); }
  function featureObject(feature, label) { if(!feature || !feature.name)return null; return { name:[label,feature.name,feature.type].filter(Boolean).join(' · '), text:S(feature.desc || feature.text) }; }
  function acquiredSubclassMoves(rules, rank) { var steps=[['Foundation',rules.foundation],['Specialization',rules.specialization],['Mastery',rules.mastery]]; return steps.slice(0,rankValue(rank)).map(function(step){return featureObject(step[1],step[0]);}).filter(Boolean); }
  function sameText(a,b){return S(a).trim().toLowerCase()===S(b).trim().toLowerCase();}
  function identityKey(value){ var raw=value&&typeof value==='object'?(value.id||value.slug||value.name||value.canonicalId):value; return S(raw).trim().toLowerCase().replace(/^vf\.core\.(?:ancestry|community|class|affiliation)\./,'').replace(/ailurean/g,'ailuran').replace(/[\s_]+/g,'-'); }
  function sameIdentity(a,b){ var left=identityKey(a),right=identityKey(b); return !!left&&left===right; }
  function addUniqueMove(list,move){if(!move||!move.name)return;if(!(list||[]).some(function(item){return sameText(item.name,move.name)||sameText(item.name,S(move.name).replace(/^[^·]+·\s*/,''));}))list.push(move);}
  function classCompatFor(canonical, rawClass, className){ return findBy(canonical.classCompat,function(item){return item.id===rawClass||item.slug===rawClass||item.name===rawClass||item.name===className;})||{}; }
  function classRulesForPath(compat, canonicalClass, path){ if(path==='sleeping')return compat.sleepingRules||compat; return compat&&Object.keys(compat).length?compat:((canonicalClass&&canonicalClass.rules)||canonicalClass||{}); }
  function subclassFor(canonical, rawSubclass, className){return findBy(canonical.subclasses,function(item){var same=item.name===rawSubclass||item.slug===rawSubclass||item.id===rawSubclass;return same&&(!className||!item.className||item.className===className);});}
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
      baseDamage: S(source.baseDamage || source.damage || base.damage),
      damage: S(source.damage || base.damage),
      features: featureList,
      feature: featureList.join(', '),
      featureRefs: (found && found.featureRefs) ? found.featureRefs : (source.featureRefs || []),
      tier: (found && found.tier) ? found.tier : (source.tier || null),
      pack: S((found && found.pack) || source.pack),
      burden: found && found.burden != null ? found.burden : (source.burden == null ? null : source.burden),
      weaponFamily: S((found && found.weaponFamily) || source.weaponFamily),
      proficiencyDie: S((found && found.proficiencyDie) || source.proficiencyDie),
      installedMods: Array.isArray(source.installedMods) ? source.installedMods.slice() : []
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
    var currentT = (tracks.current || {});

    // Prefer the explicit Charsheet path. Both path faces can contain cached
    // autofill fields, so detecting the path from s_*/a_* content alone is unsafe.
    var explicitPath = S(f.chosen_path || f.path).trim().toLowerCase();
    var hasSleeper = !!(f.s_featname || f.s_move_0_n || f.s_exp_0);
    var hasAwakened = !!(f.a_featname || (f.a_domain_ref && f.a_domain_ref.indexOf('do not use') === -1));
    var path = explicitPath.indexOf('sleep') !== -1 ? 'sleeping' : (explicitPath.indexOf('awaken') !== -1 ? 'awakened' : (hasSleeper && !hasAwakened ? 'sleeping' : 'awakened'));

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
    var learnedMoveValues = safeJSON(f.s_learned_moves, []);
    if (!Array.isArray(learnedMoveValues)) learnedMoveValues = [];
    learnedMoveValues.forEach(function(value){
      var wanted = typeof value === 'object' ? S(value.id || value.name) : S(value);
      var found = findBy(canonical.resolveMoves,function(move){ return move.id===wanted || move.name===wanted; });
      addUniqueMove(moves, found ? { name:found.name, text:[found.cost,found.text].filter(Boolean).join(' · '), canonicalId:found.id } : { name:wanted, text:'' });
    });

    // weapons
    var modApi = (typeof window !== 'undefined' && window.VFEquipmentMods) || null;
    var weapons = [
      hydrateWeapon({ name: S(f.wpri_name), trait: S(f.wpri_trait), damage: S(f.wpri_dmg_final || f.wpri_dmg), baseDamage:S(f.wpri_dmg), feature: S(f.wpri_feat), tier:S(f.wpri_tier), installedMods:modApi?modApi.normalize(f.wpri_mods,'weapon'):[] }, canonical),
      hydrateWeapon({ name: S(f.wsec_name), trait: S(f.wsec_trait), damage: S(f.wsec_dmg_final || f.wsec_dmg), baseDamage:S(f.wsec_dmg), feature: S(f.wsec_feat), tier:S(f.wsec_tier), installedMods:modApi?modApi.normalize(f.wsec_mods,'weapon'):[] }, canonical)
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
        for (var mm = 0; mm < 4; mm++) {
          var md = S(f['drone_' + dr + '_mod_' + mm]);
          if (md) mods.push({ name:md, info:S(f['drone_' + dr + '_mod_' + mm + '_info']), status:S(f['drone_' + dr + '_mod_' + mm + '_status']) });
        }
        drones.push({
          slotIndex:dr, name:dn, grade:S(f['drone_' + dr + '_grade']), tier:S(f['drone_' + dr + '_tier']),
          hp:S(f['drone_' + dr + '_hp']), evasion:S(f['drone_' + dr + '_eva']), thresholds:S(f['drone_' + dr + '_thr']),
          armor:S(f['drone_' + dr + '_armor']), slots:S(f['drone_' + dr + '_slots']), access:S(f['drone_' + dr + '_access']),
          modules:mods, notes:S(f['drone_' + dr + '_notes'])
        });
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

    var vaultValues = S(f.a_vault).split(/\n+/).map(function(value){return value.trim();}).filter(Boolean);
    var powerVault = vaultValues.map(function(value){
      var bits=value.split('::');var name=bits.pop();var domain=bits.join('::');
      var found=findBy(canonical.powers,function(power){return power.name===name&&(!domain||power.domain===domain);});
      return found ? {id:found.id,canonicalId:found.id,name:found.name,domain:found.domain,level:num(found.level,1),costText:found.cost||'—',text:found.text||''} : {id:'vault:'+value,name:name,domain:domain,level:1,costText:'—',text:''};
    });
    var importedCharacterId = S(json.characterId || f.character_id || f.characterId).trim().toUpperCase();
    return {
      id: importedCharacterId || '', characterId: importedCharacterId || '',
      name: S(f.name), playerName: '', pronouns: S(f.pron),
      heritage: S(f.ancestry) + (f.ailuran_variant ? (' (' + f.ailuran_variant + ')') : ''),
      background: S(f.community), class: S(f.class), subclass: S(f.subclass),
      level: num(f.level, 1),
      path: path,
      stats: {
        agility: num(f.tr_agility), strength: num(f.tr_strength), finesse: num(f.tr_finesse),
        instinct: num(f.tr_instinct), presence: num(f.tr_presence), knowledge: num(f.tr_knowledge)
      },
      proficiency: num(f.prof, 1), affiliation: S(f.affiliation), standing: S(f.aff_standing), reputation: S(f.aff_reputation),
      hp: { current: num(currentT.hp, num(maxT.hp, num(f.base_hp_max, 6))), max: num(maxT.hp, num(f.base_hp_max, 6)) },
      stress: { current: num(currentT.stress, 0), max: num(maxT.stress, num(f.base_stress_max, 6)) },
      hope: { current: num(currentT.a_hope, path === 'awakened' ? 2 : 0), max: num(maxT.a_hope, 6) },
      resolve: { current: num(currentT.s_resolve, num(maxT.s_resolve, num(f.auto_resolve_floor, 2))), max: num(maxT.s_resolve, num(f.auto_resolve_floor, 2)) },
      effort: { current: num(currentT.s_effort, path === 'sleeping' ? 2 : 0), max: num(maxT.s_effort, 6) },
      thresholds: { major: thrMajor, severe: thrSevere },
      evasion: num(f.evasion, 10), shields: num(currentT.armor_slots, num(maxT.armor_slots, num(f.armor_score, 0))), armorMax: num(maxT.armor_slots, num(f.armor_score, 0)),
      wealth: num(f.wealth, 1), credits: num(f.credits, 0),
      experiences: exps,
      moves: moves,
      features: (path === 'sleeping'
        ? (S(f.s_featname) + (f.s_feattext ? ': ' + f.s_feattext : ''))
        : (S(f.a_featname) + (f.a_feattext ? ': ' + f.a_feattext : ''))),
      classFeature: S(f.features),
      playerNotes: [f.seed_motive, f.seed_afraid, f.seed_loss, f.seed_crew, f.a_quick_notes, f.s_anchor, f.aff_notes, f.equipment_notes].filter(Boolean).join('\n\n'),
      domains: S(f.a_domain_ref),
      ancestryGift: S(f.ancestry_gift), communityGift: S(f.community_gift), humanInheritance:S(f.human_inheritance_kind), humanInheritanceItem:S(f.human_inheritance_item_id),
      armor: { name: S(f.armor_name), thresholds: S(f.armor_thr), feature: S(f.armor_feat), tier: S(f.armor_tier), installedMods:modApi?modApi.normalize(f.armor_mods,'armor'):[] },
      modInventory: {
        weapon: modApi?modApi.normalize(f.mod_inventory_weapon,'weapon'):[],
        armor: modApi?modApi.normalize(f.mod_inventory_armor,'armor'):[]
      },
      augments: augments,
      drones: drones,
      inventory: inv,
      weapons: weapons,
      weaponInventory: weapons.map(function(w){ return w.canonicalId || w.id; }).filter(Boolean),
      weaponArsenal: weapons.slice(),
      activeWeaponId: weapons[0] ? (weapons[0].canonicalId || weapons[0].id || weapons[0].name) : '',
      domainCards: oldDomainCards, powerVault: powerVault,
      subclassRank:S(f.subclass_rank||'Foundation'), resolveDie:S(f.s_resolve_die||'d4'),
      multiclass:S(f.multiclass), multiclassDetails:safeJSON(f.multiclass_details,null),
      advancementHistory:Array.isArray(json.advancementHistory)?json.advancementHistory:[]
    };
  }


  function findBy(items, predicate) {
    return (items || []).find(predicate) || null;
  }

  function importCreatorState(raw, canonical) {
    if (!raw || typeof raw !== 'object' || raw.fields) return null;
    if (!raw.ancestry && !raw.cls && !raw.name) return null;
    canonical = canonical || (typeof window !== 'undefined' ? window.VF_CANONICAL_DATA : null) || {};

    var ancestry = findBy(canonical.ancestries, function (x) { return sameIdentity(x.slug,raw.ancestry) || sameIdentity(x.id,raw.ancestry) || sameIdentity(x.name,raw.ancestry) || sameIdentity(x.canonicalId,raw.ancestry); });
    var community = findBy(canonical.communities, function (x) { return x.slug === raw.community || x.id === raw.community || x.name === raw.community; });
    var cls = findBy(canonical.classes, function (x) { return x.slug === raw.cls || x.id === raw.cls || x.name === raw.cls; });
    var subclass = subclassFor(canonical, raw.subclass, cls && cls.name);
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
    var pathLower = String(raw.path || '').toLowerCase() === 'sleeping' ? 'sleeping' : 'awakened';
    var compat = classCompatFor(canonical, raw.cls, cls && cls.name);
    var classRules = classRulesForPath(compat, cls, pathLower);
    var hp = num(classRules.hp, cls && cls.statistics ? cls.statistics.hitPoints : 6) + num(raw.hpMaxBonus,0);
    var evasion = num(classRules.evasion, cls && cls.statistics ? cls.statistics.evasion : 10) + num(raw.evasionBonus,0);
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
    var classRulesFull = classRules;
    var subclassRules = pathSubclassRules(subclass,pathLower);
    var gifts = (ancestryRules.gifts || []).map(function(g){ return [g.name,g.text].filter(Boolean).join(': '); });
    if(ancestryRules.extra) gifts.push([ancestryRules.extra.name,ancestryRules.extra.text].filter(Boolean).join(': '));
    var strain = (ancestryRules.subStrains || []).find(function(x){ return x.id === raw.subStrain || x.name === raw.subStrain; });
    if(strain) gifts.push([strain.name, strain.featName, strain.featText].filter(Boolean).join(' · '));
    var inheritedAugment = raw.humanInheritance==='graft' ? findBy(canonical.augments,function(x){return sameIdentity(x.id,raw.humanInheritanceItem)||sameIdentity(x.name,raw.humanInheritanceItem);}) : null;
    var inheritedTool = raw.humanInheritance==='tool'
      ? (findBy(canonical.weapons,function(x){return sameIdentity(x.id,raw.humanInheritanceItem)||sameIdentity(x.name,raw.humanInheritanceItem);})
        ||findBy(canonical.armor,function(x){return sameIdentity(x.id,raw.humanInheritanceItem)||sameIdentity(x.name,raw.humanInheritanceItem);})
        ||findBy(canonical.gear,function(x){return sameIdentity(x.id,raw.humanInheritanceItem)||sameIdentity(x.name,raw.humanInheritanceItem);}))
      : null;
    if(inheritedAugment) gifts.push('Inheritance Selected — The Graft: '+inheritedAugment.name+' · no drawback');
    if(inheritedTool) { gifts.push('Inheritance Selected — The Tool: '+inheritedTool.name+' · Experimental (TT3) · 9 Cr'); inventory[0]=inheritedTool.name; }

    var communityFeature = communityRules.feature ? [communityRules.feature.name, communityRules.feature.text].filter(Boolean).join(': ') : '';
    var classFeature = classRulesFull.classFeature ? [classRulesFull.classFeature.name, classRulesFull.classFeature.text].filter(Boolean).join(': ') : '';
    var hopeFeature = (pathLower==='sleeping' ? classRulesFull.effortFeature : classRulesFull.hopeFeature) ? [(pathLower==='sleeping'?classRulesFull.effortFeature:classRulesFull.hopeFeature).name, (pathLower==='sleeping'?classRulesFull.effortFeature:classRulesFull.hopeFeature).text].filter(Boolean).join(': ') : '';
    var subclassMoves=acquiredSubclassMoves(subclassRules,raw.subclassRank||'Foundation');
    var learnedMoves=(raw.resolveMoves||[]).map(function(value){var wanted=typeof value==='object'?S(value.id||value.name):S(value);var found=findBy(canonical.resolveMoves,function(move){return move.id===wanted||move.name===wanted;});return found?{name:found.name,text:[found.cost,found.text].filter(Boolean).join(' · '),canonicalId:found.id}:{name:wanted,text:''};}).filter(function(move){return move.name;});
    learnedMoves.forEach(function(move){addUniqueMove(subclassMoves,move);});
    var subclassFeatureText=subclassMoves.map(function(move){return [move.name,move.text].filter(Boolean).join(': ');}).join('\n\n');
    var multiclassText=raw.multiclass&&raw.multiclass.className?['Multiclass — '+raw.multiclass.className,raw.multiclass.domain&&('Domain — '+raw.multiclass.domain),raw.multiclass.classFeature&&[raw.multiclass.classFeature.name,raw.multiclass.classFeature.text].filter(Boolean).join(': ')].filter(Boolean).join(' · '):'';
    var combinedClassFeature=[classFeature,subclassFeatureText,multiclassText].filter(Boolean).join('\n\n');

    var creatorCharacterId = S(raw.characterId || raw.character_id).trim().toUpperCase();
    return {
      id: creatorCharacterId || '', characterId: creatorCharacterId || '',
      name: S(raw.name), playerName: '', pronouns: S(raw.pronouns),
      heritage: ancestry ? ancestry.name : S(raw.ancestry),
      background: community ? community.name : S(raw.community),
      class: cls ? cls.name : S(raw.cls), subclass: subclass ? subclass.name : S(raw.subclass),
      level: num(raw.level, 1), path: pathLower,
      stats: stats,
      hp: { current: num(hp, 6), max: num(hp, 6) },
      stress: { current: 0, max: 6+num(raw.stressMaxBonus,0) }, hope: { current: pathLower==='awakened'?2:0, max: 6 }, effort: { current: pathLower==='sleeping'?2:0, max: 6 },
      resolve: { current: pathLower==='sleeping'?Math.min(10,(num(raw.level,1)>=8?6:num(raw.level,1)>=5?4:2)+num(raw.resolveMaxBonus,0)):0, max: pathLower==='sleeping'?Math.min(10,(num(raw.level,1)>=8?6:num(raw.level,1)>=5?4:2)+num(raw.resolveMaxBonus,0)):0 },
      thresholds: { major: num(thresholds.major, 4), severe: num(thresholds.severe, 8) },
      evasion: num(evasion, 10), shields: selectedArmor ? num(selectedArmor.armorSlots, 0) : 0,
      wealth: 1, credits: 0,
      experiences: ensureThreeExperiences((raw.experiences || []).map(function (text,index) { return { description: S(text), bonus: num((raw.experienceBonuses||[])[index],2) }; })),
      playerNotes: [raw.appearance, raw.voice, raw.bgAnswer, raw.anchor, raw.wound].filter(Boolean).join('\n'),
      inventory: inventory,
      humanInheritance:S(raw.humanInheritance), humanInheritanceItem:S(raw.humanInheritanceItem),
      augments: inheritedAugment ? [{id:inheritedAugment.id,canonicalId:inheritedAugment.id,name:inheritedAugment.name,tier:inheritedAugment.tier,benefit:inheritedAugment.benefit||'',drawback:'',humanInheritance:true}] : [],
      weapons: selectedWeapons.map(function (weapon) { return hydrateWeapon(weapon, canonical); }),
      weaponInventory: selectedWeapons.map(function(weapon){ return weapon.id; }),
      weaponArsenal: selectedWeapons.map(function (weapon) { return hydrateWeapon(weapon, canonical); }),
      activeWeaponId: selectedWeapons[0] ? selectedWeapons[0].id : '',
      armor: selectedArmor ? { id:selectedArmor.id, canonicalId:selectedArmor.id, name:selectedArmor.name, thresholds:selectedArmor.thresholds && selectedArmor.thresholds.raw || '', feature:(selectedArmor.features || []).join(', '), tier:selectedArmor.tier && selectedArmor.tier.name || '' } : null,
      ancestryGift: gifts.join('\n\n'), communityGift: communityFeature, classFeature: combinedClassFeature, features: hopeFeature,
      moves: subclassMoves, domainCards: domainCards,
      powerVault:(raw.vaultPowers||[]).map(function(value){var bits=S(value).split('::');var name=bits.pop();var domain=bits.join('::');var found=findBy(canonical.powers,function(power){return power.name===name&&(!domain||power.domain===domain);});return found?{id:found.id,canonicalId:found.id,name:found.name,domain:found.domain,level:num(found.level,1),costText:found.cost||'—',text:found.text||''}:{id:'vault:'+value,name:name,domain:domain,level:1,costText:'—',text:''};}),
      subclassRank:S(raw.subclassRank||'Foundation'),resolveDie:S(raw.resolveDie||'d4'),multiclass:raw.multiclass&&raw.multiclass.className||'',multiclassDetails:raw.multiclass||null,
      advancementHistory:Array.isArray(raw.advancementHistory)?raw.advancementHistory:[],
      creatorSource: { schema: 'veilfarers.creator-state/1', importedAt: new Date().toISOString() }
    };
  }

  if (typeof window !== 'undefined') { window.veilfarersImportCreator = importCreator; window.veilfarersImportSheet = importCreator; window.veilfarersImportCreatorState = importCreatorState; }
  if (typeof module !== 'undefined' && module.exports) module.exports = { importCreator: importCreator, importSheet: importCreator, importCreatorState: importCreatorState };
})();
