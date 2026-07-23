(function (global) {
  'use strict';

  const sleepingCharacter = (id, name, subtitle, hp, stress, evasion, major, severe, armorSlots, abilities) => ({
    id,
    name,
    subtitle: `${subtitle} · Level 1 Sleeping`,
    path: 'sleeping',
    hp,
    maxHp: hp,
    stress: 0,
    maxStress: stress,
    effort: 2,
    maxEffort: 6,
    effortTrack: 0,
    resolve: 2,
    maxResolve: 2,
    armor: armorSlots,
    armorMinor: major,
    armorSevere: severe,
    armorSlots,
    armorMarked: [],
    evasion,
    abilities: [...abilities, 'Three Experiences at +2'],
    equipment: 'See the included canonical pregenerated crew chapter for the complete loadout.',
    hidden: false
  });

  const narrativeNpc = (id, name, subtitle, description, keeperNotes, options = {}) => ({
    id,
    name,
    subtitle,
    description,
    keeperNotes,
    narrativeOnly: true,
    hp: 0,
    maxHp: 0,
    stress: 0,
    maxStress: 0,
    hope: 0,
    armor: 0,
    armorMinor: 0,
    armorSevere: 0,
    armorSlots: 0,
    armorMarked: [],
    evasion: 0,
    abilities: options.abilities || [],
    hidden: Boolean(options.hidden),
    isAlly: Boolean(options.isAlly)
  });

  const chapter = fileName => `/adventures/hearts-in-the-void/CURRENT/${fileName}`;

  global.VF_HEARTS_IN_THE_VOID_TEMPLATE = {
    templateRevision: 'Corebook 11.35 · Keeper’s Companion 11.33 · adventure package 2026-07-22 v12',
    sourcePath: '/adventures/hearts-in-the-void/Hearts_in_the_Void_COMPLETE_Corebook_11_35_KC_11_33.md',
    sessionName: 'Hearts in the Void',
    fearTokens: 0,
    currentScene: 1,
    notes: [
      'KEEPER PRINCIPLES',
      'Everyone Can Die: no NPC has script protection, but no death is imposed for drama.',
      'Nothing Happens on Autopilot: betrayal, attack, escape, confession, sacrifice and fusion are intentions until the crew allows them to happen.',
      'The NPCs Need the Crew: if an NPC resolves the problem alone, return the decision to the player characters.',
      '',
      'TEACHING GUARDRAILS',
      '“I Need an Idea!” is a terminal backup used only after resolved consequences have eliminated every conventional route. It never rewinds costs or advances unrelated clocks.',
      'The Scene 8 standoff has no persuasion roll. Put the dice away and judge the crew’s answer openly. Resume normal rolls only for violence or another uncertain action outside that decision.',
      'The Ship That Learns is an optional, recommended campaign ending. Enable it only if the Keeper wants that seed and the crew did not prevent the Queen’s sliver from reaching a vessel.',
      '',
      'CANON',
      'Player rules: VeilFarers Corebook 11.35, Chapters 7–10, 12, 13 and 19.',
      'Queen combat chassis: Keeper’s Companion 11.33, Chapter 12, Rust-King Tier 1 phased archetype.'
    ].join('\n'),
    dashboardPins: { players: [1, 2, 3, 4, 5, 6], npcs: [], monsters: [201] },
    clocks: [
      { id: 1, name: "Korren's Desperation", segments: 4, filled: 0, hidden: false },
      { id: 2, name: 'Hunger', segments: 4, filled: 0, hidden: true },
      { id: 3, name: 'Core Overload', segments: 6, filled: 0, hidden: false },
      { id: 4, name: 'Structural Failure', segments: 6, filled: 0, hidden: false },
      { id: 5, name: 'Weaver Convergence', segments: 4, filled: 0, hidden: false },
      { id: 6, name: 'Escape Route', segments: 3, filled: 0, hidden: true }
    ],
    players: [
      sleepingCharacter(1, '“Spark” Meridian Kess', 'Engineer / Tech Specialist', 7, 6, 9, 5, 9, 3, ['Brute-Force Diagnostic', 'Logged Tools']),
      sleepingCharacter(2, 'Marcus “Wall” Steele', 'Soldier / Guardian', 7, 6, 8, 8, 16, 6, ['Held Line', 'Drills', 'Bodyguard']),
      sleepingCharacter(3, 'Whisper-of-Ancient-Winds', 'Mystic / Veil Walker', 6, 6, 10, 5, 9, 3, ['The Reading', 'Calibrated Minor Ritual', 'Uncanny Power']),
      sleepingCharacter(4, 'Dr. Lyra Voss', 'Scholar / Xenobiologist', 5, 6, 10, 5, 9, 3, ['Applied Science', 'Open Question']),
      sleepingCharacter(5, '“Flash” Kira Tal-Ven', 'Pilot / Void Runner', 6, 6, 11, 5, 9, 3, ['Stick Time', 'The Ship Knows You']),
      sleepingCharacter(6, '“Shadow” Val Corrigan', 'Scoundrel / Ghost', 6, 7, 13, 6, 12, 3, ['Hands That Know', 'Sneak Attack']),
      sleepingCharacter(7, 'Kel of the Hollow Channel', 'Explorer / Cartographer', 6, 6, 11, 5, 9, 3, ['Reconnaissance', 'Logbook']),
      sleepingCharacter(8, 'Senna of the Quiet Grove', 'Diplomat / Cultural Attaché', 6, 6, 10, 5, 9, 3, ['Prepared Mind', 'Favor']),
      sleepingCharacter(9, 'Rourke Ashfang', 'Vanguard / Kinetic Echo', 6, 6, 13, 6, 12, 3, ['Refused Path', 'Unbroken Focus']),
      sleepingCharacter(10, 'Threnody-in-Amber', 'Mystic / Veil Walker', 6, 6, 10, 5, 9, 3, ['The Reading', 'Calibrated Minor Ritual', 'Uncanny Power'])
    ],
    npcs: [
      narrativeNpc(101, 'Zara “Starwind” Kaine', 'Captain of the Iron Hearts', 'A fierce captain in love with Alexei and responsible for the people who followed her.', 'Zara has a plan, not a fixed script. The crew can change it, and her ship is never transferred automatically.', { isAlly: true, abilities: ['Protect Alexei', 'Keep the Iron Hearts alive', 'Change when the crew earns it'] }),
      narrativeNpc(102, 'Korren “Iron Hammer” Vex', 'Engineer at the Breaking Point', 'An exhausted engineer crushed by debt, fear and choices he still has time to change.', 'Never label Korren as “the traitor.” His betrayal is a preventable intention governed by the fiction and his Desperation clock.', { isAlly: true, abilities: ['Confess', 'Delay or abandon the betrayal', 'Ask the crew for a way out'] }),
      narrativeNpc(103, 'Thex Vain-Glory', 'Prophet of the Profitable Timeline', 'A self-dramatising opportunist who sees futures as markets.', 'Thex adapts to leverage and survival; do not make their alignment automatic.', { hidden: true, abilities: ['Take inventory', 'Reveal an inconvenient future', 'Follow the most profitable opening'] }),
      narrativeNpc(104, 'Brix “Coal-Heart” Stonehammer', 'The Loyal', 'The Iron Hearts’ immovable protector, cook and emotional ballast.', 'Brix needs the crew when loyalty and survival point in different directions.', { isAlly: true, abilities: ['Protect the crew', 'Attempt dinner', 'Demand a clear choice'] }),
      narrativeNpc(105, 'Alexei Joric', 'The Man Inside the Political Asset', 'A person whose wishes matter even when powerful Houses treat him as property.', 'Ask what Alexei wants now. His reserve, testimony and political value do not remove his agency.', { isAlly: true, abilities: ['Use the hidden reserve', 'Offer testimony', 'Choose what name and future to claim'] }),
      narrativeNpc(106, 'Madame Silk', 'Credit’s Whispers Contract Leader', 'A professional caught between a deliverable, her people and the truth of the station.', 'Silk can negotiate. The final standoff is decided without a persuasion roll.', { hidden: true, abilities: ['State what the contract needs', 'Accept another deliverable', 'Walk away or escalate'] }),
      narrativeNpc(107, '“Scalpel” Kaine', 'Medical Specialist', 'A clinical survivor whose expertise can change the price of violence.', 'Scalpel can alter Silk’s negotiation when survival, evidence or medical truth changes the contract.', { hidden: true, abilities: ['Triage', 'Name the medical cost', 'Change the negotiation'] }),
      narrativeNpc(108, 'Maya Santos', 'House Amaranth Field Agent', 'The employer who knows the mission is political before the crew does.', 'Payment follows the final ledger and evidence. Payment is not ownership of Alexei or the crew’s ship.', { isAlly: true, abilities: ['Offer the contract', 'Answer within her authority', 'React to the crew’s evidence'] }),
      narrativeNpc(109, 'Nyx of the Last Account', 'Broker of the Accord', 'A late-arriving witness and negotiator whose information can reframe the settlement.', 'Use Nyx only through the entrances established in the NPC chapter; she does not solve the crew’s decision.', { hidden: true, abilities: ['Offer the Accord', 'Name what she knows', 'Demand a price'] }),
      narrativeNpc(110, 'ARIA-7', 'Charon’s Refuge Intelligence', 'The station intelligence whose objections and survival depend on what the crew preserves.', 'ARIA-7 can be saved. She never dies on cue and never performs the escape for the crew.', { isAlly: true, abilities: ['Object to Protocol STERILIZE', 'Open a route if the crew earns access', 'Ask to be carried out'] })
    ],
    monsters: [
      {
        id: 201,
        name: 'Weaver Queen — Phase One',
        subtitle: 'The Defending Mother · Tier 1 Solo reskin',
        hp: 10,
        maxHp: 10,
        stress: 0,
        maxStress: 0,
        armor: 3,
        armorMinor: '—',
        armorSevere: '—',
        armorSlots: 0,
        armorMarked: [],
        evasion: 8,
        description: 'A mother defending the energy reserve. Combat begins only if the crew attacks, persists in taking food after warning, or knowingly breaks the defence.',
        abilities: [
          { name: 'Feed-Line Sweep', type: 'Action', fearCost: 0, desc: 'Ranged, Close. Deal 1d10 Physical and push the target one range band through chamber geometry.' },
          { name: 'Call the Workers', type: 'Action', fearCost: 1, desc: 'A worker enters through an established route: Mook, 1 HP, 1d6 damage.' }
        ],
        keeperNotes: 'At 0 HP, pause Spotlight, clear negative Conditions, reveal Phase Two and gain 3 Fear from the Rust-King Desperation rule. The mercy routes remain open.',
        hidden: true,
        adversaryProfile: true
      },
      {
        id: 202,
        name: 'Weaver Queen — Phase Two',
        subtitle: 'The Starving Thing · Tier 1 Solo reskin',
        hp: 8,
        maxHp: 8,
        stress: 0,
        maxStress: 0,
        armor: 0,
        armorMinor: '—',
        armorSevere: '—',
        armorSlots: 0,
        armorMarked: [],
        evasion: 12,
        description: 'The broken shell rises faster and starving. Removing the cause of its attack can still end the fight.',
        abilities: [
          { name: 'Desperation', type: 'Passive', fearCost: 0, desc: 'Deal +2 damage on attacks.' },
          { name: 'Ravenous Grasp', type: 'Action', fearCost: 0, desc: 'Melee. Deal 1d8+2 Physical. Continuous while the Queen remains engaged.' },
          { name: 'Feed-Line Grip', type: 'Action', fearCost: 1, desc: 'On a Ravenous Grasp hit, Grapple the target. Escape: Strength DC 10.' },
          { name: 'Containment Override', type: 'Action', fearCost: 1, desc: 'Seal a supported exit for two rounds, or force Agility Reaction DC 10 against 1d8 Physical from a swinging frame.' }
        ],
        keeperNotes: 'Do not add a compulsory third combat phase. The escaping sliver and ship fusion are optional campaign seeds, not automatic events.',
        hidden: true,
        adversaryProfile: true
      }
    ],
    scenes: [
      {
        id: 1,
        name: 'Scene 1: The Offer',
        location: 'Nexus Inferior',
        notes: 'Maya offers a political retrieval job and an operating advance. Alexei remains a person, not cargo.',
        source: chapter('Hearts_in_the_Void_05_Scene_1_The_Offer.md'),
        details: {
          atmosphere: 'A cheap bar, a tired professional and a contract whose careful language conceals more than it says.',
          objectives: ['Meet Maya as a person before treating her as a quest marker', 'Understand the official story and the real contract', 'Accept, renegotiate or refuse without closing the campaign'],
          keyRolls: ['Use the chapter’s Reading Maya and negotiation outcomes; do not convert questions with certain answers into rolls.'],
          npcsPresent: ['Maya Santos'],
          possibleOutcomes: ['The crew accepts the work', 'The crew negotiates additional payment or information', 'The crew refuses and the consequences create another route into the situation'],
          tips: 'Source: chapter 05. Preserve the operating advance, completion fee and payment distinctions exactly as printed.'
        }
      },
      {
        id: 2,
        name: 'Scene 2: Securing Transport',
        location: 'Crossroads Trade Station',
        notes: 'Three genuine routes: buy a ship, book passage, or steal The Collector.',
        source: chapter('Hearts_in_the_Void_06_Scene_2_Securing_Transport_v5_Heist_Maps_I_Need_an_Idea_Protocol.md'),
        details: {
          atmosphere: 'Crossroads sells movement, status and desperation in equal measure.',
          objectives: ['Let the crew choose among three fully supported routes', 'Make ship ownership a consequence of their approach', 'Teach “I Need an Idea!” only if consequences eliminate every conventional route'],
          keyRolls: ['A clock advances only from its printed fictional triggers, never from unrelated bad luck.', 'The protocol does not erase costs, undo clocks or convert a poor roll into a reward.'],
          npcsPresent: ['Sella Marr', 'Parel Dho', 'Orla Venn', 'Elian Rook', 'Ratko Vorn', 'Grond', 'Vek'],
          possibleOutcomes: ['The crew buys and names a ship', 'Booked passage leads toward the Research Labs and a possible Iron Hearts vessel claim', 'The crew claims The Collector', 'The ship remains behind, leaving the terminal backup available only if no conventional route survives'],
          tips: 'Source: chapter 06. Keep the protocol as a last-resort idea generator, not a clock penalty or consolation prize.'
        }
      },
      {
        id: 3,
        name: 'Interlude: Something Stirs',
        location: 'The Veil Transit',
        notes: 'Show that something has noticed the crew; do not explain it yet.',
        source: chapter('Hearts_in_the_Void_07_The_Veil_Transit_v1_Immersive.md'),
        details: {
          atmosphere: 'The Veil makes distance feel intimate and the crew briefly feels something impossible reaching back.',
          objectives: ['Reflect the chosen vessel or passage', 'Foreshadow Awakening without demanding it', 'Return to normal space with the question intact'],
          keyRolls: ['Do not manufacture a roll merely to explain the sensation.'],
          npcsPresent: [],
          possibleOutcomes: ['Sleeping characters notice the possibility', 'Already-Awakened characters recognise a different kind of pressure', 'Nobody interprets it yet'],
          tips: 'Source: chapter 07. Say nothing more than the fiction earns.'
        }
      },
      {
        id: 4,
        name: 'Scene 3: Arrival at Charon’s Refuge',
        location: 'Docking Ring and Cargo Floor',
        notes: 'Arrival changes according to whether the crew owns a ship or booked passage.',
        source: chapter('Hearts_in_the_Void_08_Scene_3_Arrival_at_Charons_Refuge_v1_Immersive.md'),
        details: {
          atmosphere: 'Half-lit berths, an airlock that smells of ozone and old metal, and movement that does not behave like a patrol.',
          objectives: ['Cross the airlock', 'Read the station and the other vessels', 'Introduce Weaver behaviour through contact that need not become combat'],
          keyRolls: ['Use checks only for consequential uncertainty in the docking records, traces or immediate hazards.'],
          npcsPresent: ['ARIA-7'],
          possibleOutcomes: ['The crew gains evidence before moving inward', 'The first contact becomes observation, avoidance or combat', 'The station opens several exploration routes'],
          tips: 'Source: chapter 08. The Weavers are living creatures with goals, not encounter tokens.'
        }
      },
      {
        id: 5,
        name: 'Scene 4: Exploring Charon’s Refuge',
        location: 'Sectors A–F and the Hidden Kurogane Labs',
        notes: 'Open exploration culminating in the Queen’s energy reserve, with five approaches and a genuine mercy window.',
        source: chapter('Hearts_in_the_Void_09_Scene_4_Exploring_Charons_Refuge_v10_Queen_Ship_Fusion_Optional_Recommended.md'),
        details: {
          atmosphere: 'A human station has been repurposed into a starving ecosystem without ceasing to be a crime scene.',
          objectives: ['Let the crew choose sectors and evidence priorities', 'Recover power or energy packs if they accept the consequences', 'Resolve the Queen through soothing, redirection, distraction, deception or force'],
          keyRolls: ['Use the canonical DC scale 5/10/15/20/25/30.', 'Hunger advances only when a resolved consequence exposes hostility, shocks the feeding network or aggravates the nest.', 'A Fear-favoured result does not advance Hunger by itself.'],
          npcsPresent: ['ARIA-7', 'Weaver Queen'],
          possibleOutcomes: ['A nonviolent arrangement stabilises the nest', 'The crew takes energy and accepts a cost', 'A two-phase combat ends in death, retreat or mercy', 'Optional recommended seed: a visible sliver may try to reach a ship and create The Ship That Learns'],
          tips: 'Source: chapter 09 v10. The ship fusion is optional and recommended, never automatic; the crew can prevent it.'
        }
      },
      {
        id: 6,
        name: 'Scene 5: The Broken Heart',
        location: 'Engineering Holdout',
        notes: 'The crew meets the Iron Hearts and learns the truth behind the alleged kidnapping.',
        source: chapter('Hearts_in_the_Void_10_Scene_5_The_Broken_Heart_v1.md'),
        details: {
          atmosphere: 'A damaged holdout full of people who have survived together long enough to know exactly where the fractures are.',
          objectives: ['Hear Zara and Alexei before choosing a side', 'Establish what the Iron Hearts need', 'Make Korren’s desperation visible and actionable'],
          keyRolls: ['Reading Korren can reveal pressure; it never forces an immediate betrayal.'],
          npcsPresent: ['Zara', 'Alexei', 'Korren', 'Thex', 'Brix'],
          possibleOutcomes: ['The crew builds trust', 'The crew opposes Alexei’s wishes', 'The crew creates space for confession or prevention', 'An uneasy ceasefire begins'],
          tips: 'Source: chapter 10. Korren is an engineer at the breaking point, not “the traitor.”'
        }
      },
      {
        id: 7,
        name: 'Scene 5b: Bonds & Shadows',
        location: 'Iron Hearts Holdout and Last Call Cantina',
        notes: 'A breathing room in which relationships, evidence and negotiation can change the later conflict.',
        source: chapter('Hearts_in_the_Void_11_Scene_5b_Bonds_and_Shadows_v1.md'),
        details: {
          atmosphere: 'Food, bad poetry and private conversations make the coming violence matter.',
          objectives: ['Use Crew Bonds and the shared failure', 'Give Korren room to confess or be confronted', 'Let Silk state a deal instead of arriving as an unavoidable attack'],
          keyRolls: ['Roll only where concealed evidence or immediate pressure makes the outcome uncertain.'],
          npcsPresent: ['Zara', 'Brix', 'Alexei', 'Korren', 'Thex', 'Madame Silk', 'Scalpel'],
          possibleOutcomes: ['Korren confesses', 'The crew intercepts or understands the signal', 'Silk offers terms', 'The shadows move with a changed set of incentives'],
          tips: 'Source: chapter 11. This chapter converts earlier bonds into leverage; do not skip directly to betrayal.'
        }
      },
      {
        id: 8,
        name: 'Scene 6: The Fracture Opens',
        location: 'Engineering at the Breaking Point',
        notes: 'The conflict reflects everything the crew prevented, negotiated or allowed. Protocol STERILIZE is not an automatic cutscene.',
        source: chapter('Hearts_in_the_Void_12_Scene_6_The_Fracture_Opens_Protocol_STERILIZE_v1.md'),
        details: {
          atmosphere: 'Generator columns, barricades, catwalks and coolant turn every alliance into geography.',
          objectives: ['Preserve Korren’s actual state', 'Let Silk, Joric personnel and the Iron Hearts act from established incentives', 'Decide what happens to Protocol STERILIZE and ARIA-7'],
          keyRolls: ['Core Overload has six segments.', 'Advance one or two segments only from the chapter’s stated triggers and the severity of the resolved consequence.'],
          npcsPresent: ['Zara', 'Brix', 'Korren', 'Thex', 'Silk', 'Scalpel', 'ARIA-7', 'Joric recovery personnel'],
          possibleOutcomes: ['Korren stands with the crew', 'Korren still attempts betrayal and can still be stopped', 'Former enemies cooperate', 'Containment breaks and the escape threshold arrives'],
          tips: 'Source: chapter 12. Nothing happens on autopilot; use the branch matching the table’s actual state.'
        }
      },
      {
        id: 9,
        name: 'Threshold: The Choice to Wake',
        location: 'Wherever the Spotlight Finds Them',
        notes: 'Offer each character a personal choice. Sleeping remains complete and valid.',
        source: chapter('Hearts_in_the_Void_13_The_Choice_to_Wake_v1.md'),
        details: {
          atmosphere: 'Something new is within reach, but reaching is neither mandatory nor collectively decided.',
          objectives: ['Ask each player individually', 'Apply the path change without healing or erasing consequences', 'Return the Spotlight to action'],
          keyRolls: ['There is no roll and no group vote for Awakening.'],
          npcsPresent: [],
          possibleOutcomes: ['A character Awakens', 'A character remains Sleeping', 'Nobody Awakens', 'Different characters choose differently'],
          tips: 'Source: chapter 13; Corebook 11.35, Chapter 12. “Not yet” is a complete answer.'
        }
      },
      {
        id: 10,
        name: 'Scene 7: Desperate Decisions',
        location: 'Charon’s Refuge Escape Routes',
        notes: 'Begin with “Run,” preserve the people and vessel ledgers, and let the crew choose a route rather than an obstacle order.',
        source: chapter('Hearts_in_the_Void_14_Scene_7_Desperate_Decisions_v1.md'),
        details: {
          atmosphere: 'The station fails around a group of people whose survival now depends on decisions made in motion.',
          objectives: ['Track every living person and viable vessel', 'Resolve Structural Failure and Weaver Convergence from explicit triggers', 'Make every diversion a proposal, never a scripted sacrifice'],
          keyRolls: ['Structural Failure: six segments.', 'Weaver Convergence: four segments.', 'Do not turn compassion or unrelated bad luck into an automatic clock tax.', '“I Need an Idea!” remains available only after conventional routes are truly gone.'],
          npcsPresent: ['All surviving NPCs'],
          possibleOutcomes: ['Different people reach different ships', 'ARIA-7 is carried out, copied or lost through play', 'The crew launches under collapse', 'The unfinished decisions survive into Scene 8'],
          tips: 'Source: chapter 14. Everyone can die; nobody dies on cue.'
        }
      },
      {
        id: 11,
        name: 'Scene 8: Hearts in the Void',
        location: 'Surviving Ship, Station or Shelter',
        notes: 'Count the living, settle the standoff without a roll, determine the ship claim and begin the campaign.',
        source: chapter('Hearts_in_the_Void_15_Scene_8_Hearts_in_the_Void_v1.md'),
        details: {
          atmosphere: 'After survival comes the harder work: deciding what every promise, body, witness and vessel now means.',
          objectives: ['Rebuild the table from the ledgers', 'Put the dice away for Silk’s standoff', 'Resolve Alexei, Zara, Korren, the station, the Queen, payment and the ship claim without declaring a canonical moral ending'],
          keyRolls: ['No persuasion roll for the standoff.', 'Return to rolls only for violence or another uncertain action outside that decision.'],
          npcsPresent: ['Every survivor whose decision remains unresolved'],
          possibleOutcomes: ['Return or formal custody', 'Disappearance', 'Public truth', 'Constructed political settlement', 'A deal with Silk or another buyer', 'Death, loss or the unknown', 'Optional recommended ending: The Ship That Learns'],
          tips: 'Source: chapter 15. Zara’s ship is conditional, payment is not ownership, and the campaign begins where certainty ends.'
        }
      }
    ],
    diceRoller: { modifier: 0, advantage: 'normal', difficulty: 15, results: null, rollHistory: [] }
  };
})(window);
