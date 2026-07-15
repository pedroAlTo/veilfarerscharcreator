/* Veilfarers - shared importer: Character Creator export JSON -> Game Tool character model.
   Exposes window.veilfarersImportCreator(json) -> character object (or null if not a creator export). */
(function () {
  function num(v, d) { var n = parseInt(v, 10); return isNaN(n) ? (d || 0) : n; }
  function S(v) { return (v == null) ? '' : String(v); }

  function importCreator(json) {
    if (!json || !json.fields) return null;               // not a creator export
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
    if (!exps.length) exps = [{ description: '', bonus: 2 }, { description: '', bonus: 2 }, { description: '', bonus: 2 }];

    // moves (sleeper): s_move_0..4 (name/text)
    var moves = [];
    for (var m = 0; m < 6; m++) {
      var mn = S(f['s_move_' + m + '_n']);
      if (mn) moves.push({ name: mn, text: S(f['s_move_' + m + '_t']) });
    }

    // weapons
    var weapons = [
      { name: S(f.wpri_name), trait: S(f.wpri_trait), damage: S(f.wpri_dmg_final || f.wpri_dmg), feature: S(f.wpri_feat) },
      { name: S(f.wsec_name), trait: S(f.wsec_trait), damage: S(f.wsec_dmg_final || f.wsec_dmg), feature: S(f.wsec_feat) },
      { name: '', trait: '', damage: '', feature: '' }
    ];

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
      hp: { current: 0, max: num(maxT.hp, num(f.base_hp_max, 6)) },
      stress: { current: 0, max: num(maxT.stress, num(f.base_stress_max, 6)) },
      hope: { current: 0, max: 6 },
      resolve: { current: 0, max: num(maxT.s_resolve, num(f.auto_resolve_floor, 2)) },
      effort: { current: 0, max: 6 },
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
      domainCards: []
    };
  }

  if (typeof window !== 'undefined') window.veilfarersImportCreator = importCreator;
  if (typeof module !== 'undefined' && module.exports) module.exports = { importCreator: importCreator };
})();
