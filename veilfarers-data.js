/* Veilfarers Character Creator rules data
   Compatibility dataset retained only for the restored full-sheet UI. Canonical rules are loaded from /rules-data by the portal and Creator bridge.
   Edit this file to update classes, subclasses, powers, weapons, armor, gear, augments, drones, ancestries, or communities.
*/
var VEILFARERS_DATA_VERSION = "Full Sheet Compatibility Layer (canonical choices sync from RC2 Creator)";

const TRAITS = [
  ["Agility",   "Sprint · Leap · Maneuver"],
  ["Strength",  "Lift · Smash · Grapple"],
  ["Finesse",   "Control · Hide · Tinker"],
  ["Knowledge", "Recall · Analyze · Comprehend"],
  ["Instinct",  "Perceive · Sense · Navigate"],
  ["Presence",  "Charm · Perform · Deceive"],
];

const esc = s => String(s).replace(/"/g,'&quot;');


const ANCESTRY_NOTES = {
  "Ailuran": "Achromatic Aura-Sight: see thermal/bio-electric auras in darkness; detect living creatures behind thin barriers. Perfect Equilibrium: Advantage to balance, climb, move silently across unstable/narrow surfaces. Irrepressible Curiosity: hidden information can pull you; mark 1 Stress to resist or pursue and gain 1 Hope if you uncover it. Sub-Strain: choose Shroud-Strain or Surge-Strain.",
  "Bloomstrider": "Plant-like Body: resistance to natural dangers; Advantage on survival checks in hostile environments. Nurturing Touch: focused sap contact heals 1 HP at the start of the target's turns for 1d4 turns.",
  "Celestiari": "Stellar Meditation: once per long rest, meditate under light for 10 minutes to mark 1 Stress and gain 2 Hope. Celestial Grace: unarmed attacks deal d6 void damage. Your luminous/empathic presence shapes social and mystical scenes.",
  "Ethereal": "Phase Shift: briefly become insubstantial and pass through thin solid barriers not protected by energy. Forward perception gives brief warning of trouble, but at a cost when complications trigger.",
  "Human": "Adaptive Spirit: once per session, after failing an action roll, spend 2 Hope to gain Advantage on your next roll of the same type. Cultural Bridge: during rest, mark 1 Stress to ask about a group's core motivations/customs. Silver Linings: complications still hurt, but reveal a small actionable opening.",
  "Kryllian": "Master Craftsman: mark 1 Stress for Advantage on crafting or repairing technology. Structural Intuition: once per session, mark 1 Stress to study a structure or system and ask its most significant weakness.",
  "Kryx": "Pack Intuition: when an ally within Very Close is targeted, mark 1 Stress to gain Advantage on your next attack against that foe. Biolume Howl: unarmed attacks deal d6 void; once per session mark 1 Stress on an unarmed attack to Daze and gain path resource.",
  "Rift Spinner": "Chrono-Gift: once per session, after any roll within Close range, spend 2 Hope to force a reroll and choose either result. Wall Weaver: move on walls/ceilings and sense vibrations through surfaces, gaining Advantage to detect moving creatures in contact.",
  "Synthetic": "Modular Consciousness: once per long rest, choose a Trait; spend Hope for Advantage on rolls using it until next long rest. Digital Interface: Advantage to hack, operate, or understand technology. Built to Be Extended: +2 Augment Capacity."
};
const COMMUNITY_NOTES = {
  "Core World": "Institutional Leverage: when working an institutional system, roll 10+ to gain 1 Favor Token. Spend a Favor Token later to automatically succeed on a similar institutional task. Diplomat starts each session with 1 extra Favor Token.",
  "Trade Hub": "Market Oracle: when negotiating prices, seeking goods information, or gambling resources on rumors, roll Knowledge DC 12. On success, gain actionable information and 1 path resource; critical success grants a secret giving Advantage for 24 hours.",
  "Frontier Colony": "Scrap-Savvy Ingenuity: improvise a tool or simple device from junk. Roll Fear die: 1-3 works once then breaks; 4+ works reliably for the scene. Once per long rest, reroll by sacrificing a sentimental item to the project.",
  "Void Station": "Cross-Species Intuition: begin each session with 3 Linguistic Tokens. On negotiation rolls, spend 1 token to reroll a Hope die or treat your Fear die as Hope after the dice land but before narration. Refresh through mediation or long rest.",
  "Free Fleet": "Voidborn Kinship: when recalling stellar hazards or aiding fleet allies, reroll one failed piloting check, or let an ally in your system use your Hope die result as their own for one roll.",
  "AgriSynth": "Nourished by Nature: Advantage on Knowledge checks to stabilize creatures near death, and Advantage on Survival checks to find or purify food/water in technologically supported environments.",
  "Hidden Enclave": "Ghost Protocol: once per session, declare you already prepared an escape route, cache, or fallback position in the current location. If your class has reconnaissance training, include one additional useful detail."
};
const CLASS_DATA = {
  "Diplomat": {
    "domains": "Social & Lux",
    "trait": "Presence",
    "sleepingTrait": "Presence",
    "evasion": 10,
    "hp": 6,
    "awakenedItems": "Encrypted Datapad · Treasured Token",
    "sleepingItems": "Annotated Briefing Folio · Treasured Token (a personal anchor; an old letter, a worn coin, a scarred datapad)",
    "hopeTitle": "THE POWER OF SUGGESTION (3 HOPE)",
    "effortTitle": "THE PREPARED MIND (2 EFFORT)",
    "awClassFeature": "CULTURAL LENS",
    "slClassFeature": "STANDING REPUTATION",
    "starter": "Silver Tongue + Spark of Hope",
    "hopeText": "Spend 3 Hope to choose Plant an Idea, Create an Opening, or Gather Intelligence.",
    "effortText": "You can spend 2 Effort to choose one of three powerful effects. Where the Awakened Diplomat's Power of Suggestion runs on charisma and the universe's quiet cooperation, the Prepared Mind runs on the work you have already done before the scene began. - Cite the File. Declare you have read about this person, this house, this faction, or this situation in advance. The Keeper provides one true and useful fact about them, a vulnerability, a recent event, a relationship, a stated position, that you may not have learned yet but that fits what your character could reasonably have prepared. - Anticipated Move. When the next NPC in the scene takes a social or political action, you may declare that you anticipated it. You take a Reaction now, before the action resolves, to counter or complicate it, and you have Advantage on that Reaction; the Keeper sets its scope. Foresight sharpens the response; it does not guarantee it. - The Quiet Word. You speak privately to one NPC currently in the scene. Whatever you say, the NPC takes seriously, not necessarily favorably, but seriously. They consider it as a credible signal. Where this leads is between you, them, and the table. > INFLUENCE SCALES WITH THE ROLL. Success: those present, this scene. With Hope: it holds after you leave. Critical: it spreads beyond the room. With Fear: it turns on you.",
    "awClassText": "◆You have Advantage on all Social tests. ◆When you succeed on a Persuasion or Deception roll, you gain 1 Favor Token (maximum of 4). ◆During every long rest, you gain 1 Favor Token.",
    "slClassText": "Sleeping Diplomats build influence the slow way, by being reliable, but they spend the same currency every Diplomat does: Favor Tokens. The pool, the cap, the way they are earned, and the way they are spent are identical to the Awakened Diplomat's Cultural Lens (Chapter 6), so a character who Awakens or who came up Sleeping never has to relearn how their social capital works. The path changes how you fight and rest, through Effort and Resolve; it does not change how you trade in favors. You begin each session with 2 Favor Tokens and hold a maximum of 4 (raised cumulatively by background and subclass, so a Core World Sleeping Diplomat holds up to 6). You gain 1 when you succeed on a Persuasion or Deception roll, and 1 on every long rest. You spend them through your subclass abilities, through House and Free Fleet contacts (Chapter 5), to automatically succeed on an institutional task (1 Favor), or by spending 5 at once to raise your Reputation with one faction by 1 RP (Chapter 16), bought standing that can be lost again by how you act. What \"Standing Reputation\" names is not a separate resource but the Sleeping Diplomat's reading of the same one: every Favor is a debt of trust earned by being dependable where it was witnessed, not by performance or spectacle. Favor Tokens are not Effort. They are the slower, longer-running currency of the Diplomat's career, the same on either path. Protocol. You always know the correct form (title, gift, taboo, precedence) for any culture in common knowledge; no roll. For isolated or unknown cultures, roll Knowledge (DC set by how removed they are) to read their norms from behavior alone. Once you know the protocol, you cannot offend by accident, only by choice."
  },
  "Engineer": {
    "domains": "Tech & Synthesis",
    "trait": "Knowledge",
    "sleepingTrait": "Knowledge",
    "evasion": 9,
    "hp": 7,
    "awakenedItems": "Alien-etched Multi-Tool · Universal Lubricant",
    "sleepingItems": "Toolbelt with Logged Inventory · Personal Wrench (named, tracked)",
    "hopeTitle": "SCRAP GENIUS (3 HOPE)",
    "effortTitle": "BRUTE-FORCE DIAGNOSTIC (2 EFFORT)",
    "awClassFeature": "TECHNICAL INTUITION",
    "slClassFeature": "LOGGED TOOLS",
    "starter": "System Jackknife + Rapid Regeneration",
    "hopeText": "Spend 3 Hope to create one temporary device with a single function. It works flawlessly for one scene, then burns out or disassembles.",
    "effortText": "You can spend 2 Effort to choose one of three effects. The Sleeping Engineer's signature is not inspiration but thoroughness. You have ruled out everything else; what remains is the answer. - Find the Failure. Spend 1 minute of in-fiction time examining a malfunctioning system. The Keeper tells you exactly what is wrong with it, in detail, including any concealed sabotage. (You still need parts, time, and tools to fix it.) - Never Rated For This. Push a machine past specification: it performs one tier above its grade for the scene, then breaks. You describe how it fails; the Keeper decides what the failure costs. - The Field Manual. You produce, from memory, a procedure for handling a specific technical situation, the procedure is one your character has practiced or read, not improvised. The Keeper grants advantage on the next four rolls related to executing it, by you or by an ally you instruct.",
    "awClassText": "◆You have Advantage on all repair and diagnosis tests. ◆Once per session, when a system fails, you can spend 1 Stress to improvise a perfect fix. This fix lasts until your next long rest.",
    "slClassText": "Sleeping Engineers do not jury-rig from cosmic confidence; they jury-rig from kit. You maintain, at all times, a Logged Inventory, a private list of three components, parts, or improvised tools that you have salvaged or pre-assembled. At any time, you may declare that you have one of those items on hand and apply it to a problem. The Keeper may rule that the Inventory needs to be restocked between missions; this is its own downtime activity."
  },
  "Explorer": {
    "domains": "Synthesis & Lux",
    "trait": "Instinct",
    "sleepingTrait": "Instinct",
    "evasion": 11,
    "hp": 6,
    "awakenedItems": "Advanced Survival Kit · Encrypted Star Chart",
    "sleepingItems": "Survey Instruments · Personal Logbook (every entry by hand)",
    "hopeTitle": "PATHFINDER'S INSIGHT (3 HOPE)",
    "effortTitle": "METHODICAL RECONNAISSANCE (2 EFFORT)",
    "awClassFeature": "FOREMOST SURVIVOR",
    "slClassFeature": "THE LOGBOOK",
    "starter": "Environmental Adaptation + Wayfinder's Pulse",
    "hopeText": "During a Void Crawl Travel or Scan the Area roll, spend 3 Hope to roll 2 Hope dice and keep one while resolving normally.",
    "effortText": "You spend 2 Effort to choose one: - The Margin Note. Declare one physical feature of your surroundings that your logbook recorded: a culvert, a ledge, a hatch the deck plans forgot. It is there. The Keeper may attach one complication, and no note rewrites a scene's premise. - The Trail. Examine ground or wreckage. The Keeper tells you who came through, in what numbers, in what direction, and approximately when. Sleeping Explorers track by sign, not by sense. - The Charted Route. Declare that you have, in your logbook, a route through a difficult environment. The route is real and useful, though the Keeper may add complications appropriate to the difficulty.",
    "awClassText": "◆You have Advantage on all Survival tests. ◆Once per session, when facing an environmental hazard, you can spend 1 Stress to gain temporary immunity to its effects for the scene.",
    "slClassText": "You maintain a personal Logbook of every place your character has been. Entries are handwritten, dated, and detailed. Once per session, when arriving in a location your character has previously logged, you may consult the Logbook for one specific recalled detail, a name, a hidden passage, a former contact's address. The detail is correct as of the time of the log entry."
  },
  "Mystic": {
    "domains": "Neural & Lux or Void (Veil Alignment, chosen at character creation; for Sleeping Mystics, the Alignment represents the school of study, not a felt resonance)",
    "trait": "Instinct",
    "sleepingTrait": "Knowledge (rather than Instinct, as for Awakened Mystics, the Sleeping Mystic studies what the Awakened Mystic feels)",
    "evasion": 10,
    "hp": 6,
    "awakenedItems": "Whispering Veil-Crystal · Starlight Blindfold",
    "sleepingItems": "Veil-Crystal Recorder (takes readings the user cannot directly perceive) · Bound Notebook of Annotations",
    "hopeTitle": "REALITY UNFOLD (3 HOPE)",
    "effortTitle": "THE STUDIED WORKING (2 EFFORT)",
    "awClassFeature": "PSYCHIC RESONANCE / VEIL ALIGNMENT",
    "slClassFeature": "PROCEDURAL VEIL- WORK",
    "starter": "Veil Sensitivity + one Lux or Void Level 1 Power",
    "hopeText": "Spend 3 Hope to roll with Advantage on all rolls. This lasts until you roll with Fear; when it ends, take 1d4 Stress.",
    "effortText": "You can spend 2 Effort to choose one effect. The Sleeping Mystic does not bend reality directly; they invoke a procedure, a method, learned from study, that produces a Veil-aligned effect through technique rather than communion. - The Calibrated Ritual. Spend 10 minutes performing a documented procedure. The Keeper resolves the desired Veil-aligned effect (a small reality-shift, a glimpse, a temporary stabilization) at the cost of some pre-known component or concession listed in your notebook. - The Reading. You take a Veil reading of a person, place, or object. The Keeper provides one truthful piece of information about its Veil exposure, history, or alignment. You did not perceive this; your instruments did. - The Procedure of Refusal. Once per scene, you may declare that an Awakened character's invocation of Hope-fueled Veil power is interfered with by your presence. They lose 1 Hope without effect, and the substrate-feel of the room is briefly muted. (This applies to enemy spellcasters as well as allies; the procedure does not discriminate. Ally Awakened characters may consent in advance to be excluded.)",
    "awClassText": "Psychic Resonance. Once per round, when you roll for a Mystic feature, you can reroll one die. If the new die result is lower than the previous result, you gain 1 Stress. Veil Alignment (Lux / Void).",
    "slClassText": "Sleeping Mystics do not invoke Veil powers by feel, they invoke them by ritual. Each Veil-aligned action you take requires a specific component, gesture, or recitation. You and the Keeper maintain a list of your character's known procedures; new procedures are learned through downtime study, not through inspiration. You cannot improvise. You can, however, combine known procedures in interesting ways, and a strong Sleeping Mystic does so often."
  },
  "Pilot": {
    "domains": "Void & Tech",
    "trait": "Instinct",
    "sleepingTrait": "Instinct",
    "evasion": 11,
    "hp": 6,
    "awakenedItems": "Frayed Star Chart · Veil-Energy Control Crystal",
    "sleepingItems": "Personal Flight Chart Set · Worn Headset (the same one for fifteen years)",
    "hopeTitle": "VEIL SURGE (3 HOPE)",
    "effortTitle": "STICK TIME (2 EFFORT)",
    "awClassFeature": "STELLAR INSTINCT",
    "slClassFeature": "THE SHIP KNOWS YOU",
    "starter": "Vector Calculus + System Jackknife",
    "hopeText": "Spend 3 Hope to gain Advantage on all Piloting and Evasion rolls for one scene.",
    "effortText": "You can spend 2 Effort to choose one effect: - Hands on the Stick. You have flown this lane, this approach, this maneuver before, and the ship is an extension of you. Choose one as you act: ignore one environmental penalty on your next piloting maneuver (a storm, a debris field, a failing instrument), or turn a Failure with Fear on a piloting roll into an ordinary Failure, riding out the slip instead of crashing on it. Nobody flies this hull the way you do. - The Read. Spend 1 minute studying a vessel, friendly or hostile, at standard Engagement range. The Keeper tells you its likely behavior over the next round, including any move it is about to make. - The Veteran's Burst. During a starship combat, declare that you and the ship execute a maneuver from your cumulative experience together. Gain advantage on the next maneuver roll, and the ship clears 1 Hull Stress.",
    "awClassText": "◆You have Advantage on all piloting and navigation tests. ◆Once per session, you can reroll one failed Void- related test. ◆If you spend Hope on a navigation roll, you may add an additional +1d8 to the result.",
    "slClassText": "A Sleeping Pilot's relationship with their primary vessel is non-mystical but profound. As long as you fly the same ship for at least one full mission arc, you and the ship gain the Practiced Pair condition: any roll involving the ship gains advantage when the maneuver is one you have practiced before. The Keeper and you maintain a list of practiced maneuvers; the list grows with mission downtime."
  },
  "Scholar": {
    "domains": "Tech & Social",
    "trait": "Knowledge",
    "sleepingTrait": "Knowledge",
    "evasion": 10,
    "hp": 5,
    "awakenedItems": "Cracked Data-Slate · Vial of Alien Sample",
    "sleepingItems": "Citation Index (your personal reference) · Reading Glasses (scratched, repaired, beloved)",
    "hopeTitle": "EUREKA MOMENT (3 HOPE)",
    "effortTitle": "APPLIED SCIENCE (2 EFFORT)",
    "awClassFeature": "PATTERN WEAVER",
    "slClassFeature": "THE OPEN QUESTION",
    "starter": "Quantum Firewall + Silver Tongue",
    "hopeText": "Spend 3 Hope to ask the Keeper one question about the current mystery, system, artifact, creature, or social structure; the answer is useful and true.",
    "effortText": "You spend 2 Effort to choose one effect: - The Countdown. Facing a process in motion (a poison, an overload, a collapse), state how much time truly remains and what speeds or slows it. The Keeper adopts your numbers; the table now plays against that clock. - The Improvised Reaction. From materials in the scene, produce one immediate chemical effect: smoke, corrosion, adhesive, flash. One use, scene-length, never a weapon of war. - The Lost Source. Declare that you have located, through patient archival work, a source on a topic everyone else thought was lost. The Keeper helps you decide what it says, with an emphasis on partial and complicating, rather than total and clarifying, revelations.",
    "awClassText": "◆You have Advantage on all Knowledge analysis tests. ◆Once per session, you can spend 1 Stress to consult your mental archive. The Keeper will reveal one hidden truth or a key vulnerability relevant to the current scene.",
    "slClassText": "You maintain, throughout the campaign, an Open Question, a research project of your own design. The Question is recorded in your notes and on the Keeper's tracking sheet. Every Long Rest, you may make a Knowledge roll (DC 14) to advance your research. On success, you gain one new piece of information toward the Question; on Critical Success, the Keeper provides a substantive lead. Completing your Question is a major life event for the character; it grants a permanent campaign-wide advancement, the nature of which the Keeper helps determine."
  },
  "Scoundrel": {
    "domains": "Social & Void",
    "trait": "Finesse",
    "sleepingTrait": "Finesse",
    "evasion": 12,
    "hp": 6,
    "awakenedItems": "Morphic Skeleton Key · Influential Holo-Mask",
    "sleepingItems": "Lockpick Set · Several Identities (each with paperwork)",
    "hopeTitle": "VANISHING ACT (3 HOPE)",
    "effortTitle": "HANDS THAT KNOW (2 EFFORT)",
    "awClassFeature": "SHADOW OPERATIVE",
    "slClassFeature": "THE QUIET NETWORK",
    "starter": "Perfect Facade + Temporal Cloak",
    "hopeText": "Spend 3 Hope to vanish from attention, slip surveillance, or reposition through shadow and misdirection as your class feature allows.",
    "effortText": "You spend 2 Effort to choose one effect: - Cased the Joint. Declare that you, or a previous version of yourself, has worked a job like this before. Name the target of a theft, a lock, or a mark; the Keeper tells you one concrete weakness, the guard's rhythm, the make of the lock, where the camera does not reach. You do not steal it for free, but you go in prepared: you have Advantage on the roll to pull the job, and the take is cleaner for knowing the way in. - The False Face. Adopt one of your established alternate identities. NPCs who do not specifically know you under your true name accept the alternate identity for the duration of the scene. - The Backup Plan. Declare that you anticipated this exact failure. You produce a contingency item, ally, or piece of information that cleanly resolves the immediate problem. Once per scene.",
    "awClassText": "◆You have Advantage on all Stealth tests. You can also reroll one failed Evasion roll. ◆Sneak Attack. When you have Advantage on an attack, you deal an extra +1d6 damage. The damage increases as you advance in tier (+2d6 at Tier 2, +3d6 at Tier 3).",
    "slClassText": "Sneak Attack. When you have Advantage on an attack, you deal an extra 1d6 damage. This is the Scoundrel's stock in trade, the hit that lands because the target never saw you set for it, and it grows as you advance: +2d6 at Tier 2, +3d6 at Tier 3. (Catching a target who does not know where you are is the usual way to earn that Advantage, but any source of Advantage on the attack arms it.) The Network. You maintain, throughout the campaign, a personal network of contacts, fences, smugglers, old crewmates, bartenders, dock supervisors. Once per session, you may declare that you know someone in the current city, station, or region. The Keeper helps you describe the contact briefly and decides what they will and will not do. Contacts have memories; they remember favors and they remember betrayals."
  },
  "Soldier": {
    "domains": "Kinetic & Synthesis",
    "trait": "Strength",
    "sleepingTrait": "Strength",
    "evasion": 9,
    "hp": 7,
    "awakenedItems": "Dented Riot Shield · Fallen Comrade's Dog-tag",
    "sleepingItems": "Dented Riot Shield · Fallen Comrade's Dog-tag",
    "hopeTitle": "COMBAT SURGE (2 HOPE)",
    "effortTitle": "THE HELD LINE (1 EFFORT)",
    "awClassFeature": "COMBAT FOCUS",
    "slClassFeature": "THE DRILL",
    "starter": "Kinetic Blast + Rapid Regeneration",
    "hopeText": "Spend 2 Hope after a successful hit to deal +1d6 damage and push the fight in your favor.",
    "effortText": "Spend 1 Effort after you successfully hit with an attack to deal an additional 1d6 damage. The Soldier uses Effort in small, constant, reliable increments.",
    "awClassText": "You use a d4 for your Focus die, starting at 1. When you enter a Focus state, you gain powerful benefits. While in this state, you can: ◆Reroll one weapon damage die per attack. ◆Add the value of the Focus die to your damage or attack roll.",
    "slClassText": "You know all four Common Drills and unlock one subclass Drill at Foundation, Specialization, and Mastery. At the beginning of each session, prepare four. Action and Reaction Drills are usable once per scene; Passive Drills remain active while prepared."
  },
  "Vanguard": {
    "domains": "Neural & branch (Void / Kinetic / Lux, determined by Subclass)",
    "trait": "Presence",
    "sleepingTrait": "Presence",
    "evasion": 11,
    "hp": 6,
    "awakenedItems": "Light Staff (Melee) · Meditation Orb · Spiced Tea Mix",
    "sleepingItems": "Light Staff (Melee) · Meditation Orb (unilluminated; the Sleeping Vanguard's orb does not glow) · Spiced Tea Mix",
    "hopeTitle": "PATH TO NIRVANA (3 HOPE)",
    "effortTitle": "THE REFUSED PATH (2 EFFORT)",
    "awClassFeature": "UNBROKEN FOCUS",
    "slClassFeature": "UNBROKEN FOCUS",
    "starter": "Veil Sensitivity + one branch Level 1 Power",
    "hopeText": "Spend 3 Hope to enter a focused combat state for the scene, turning discipline into decisive action.",
    "effortText": "Spend 2 Effort to enter the Disciplined State for rounds equal to Proficiency + Presence. Choose Agility, Instinct, or Strength: gain Advantage with it and add its modifier to Melee and unarmed damage. You are immune to Stunned and Dazed, your first Melee hit deals +2d6 branch damage, and subsequent Melee attacks after the first each round have Disadvantage while at least two enemies are in Melee.",
    "awClassText": "Your mental discipline allows you to channel psionic energy into movement and combat. ◆While not wearing Heavy or Very Heavy armor, you gain +1 Evasion.",
    "slClassText": "Trained Body: choose Strength or Agility for unarmed strikes; they deal d6 physical damage, increasing to d8 at Level 5 and d10 at Level 8. Unbroken Focus: +1 Evasion without Heavy or Very Heavy armor; once per scene spend 1 Effort to prevent Stress without using your Action. The Refusal: once per scene spend 1 Effort to impose Disadvantage on a Domain/Veil attack or Spellcast Roll, or grant Advantage on an allowed Reaction Roll."
  }
};
const SUBCLASS_DATA = {
  "awakened": {
    "Diplomat": [
      {
        "name": "Cultural Attaché",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Unmasking Gaze (Action)",
            "text": "Spend 1 Hope and make a Presence check against a target's Presence or Instinct (defender chooses the higher). On a success, ask the Keeper one question about the target's true intentions, fears, or loyalties, which they must answer honestly."
          },
          {
            "tier": "Specialization",
            "name": "Social Chameleon (Passive)",
            "text": "You blend in anywhere. In a new social environment, spend 1 Hope to declare a plausible identity and contacts there; gain Advantage on your first social roll in that scene."
          },
          {
            "tier": "Mastery",
            "name": "Universal Argument (Action)",
            "text": "Once per session, spend 3 Hope to make a statement so compelling it transcends language. One target who can perceive you must comply with a single, reasonable command, regardless of whether they understand your words."
          }
        ]
      },
      {
        "name": "The Icon",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Control the Narrative (Action)",
            "text": "Make a Presence check (DC 13) to perform or report; on success, gain 1 Favor Token."
          },
          {
            "tier": "Specialization",
            "name": "The Story's Debt (Action)",
            "text": "Spend 2 Favors to declare that a target NPC now owes you a Favor. Narrate how your past work inspired them. This cannot be refused."
          },
          {
            "tier": "Mastery",
            "name": "The Address (Action)",
            "text": "Once per story arc, speak to a crowd. Roll Presence; the Keeper sets the DC by the crowd's size and hostility, and influence scales with the roll. On a critical, choose a theme (Hope, Defiance, Peace, Rebellion, Sorrow) and the Keeper describes how the new narrative reshapes the system."
          }
        ]
      },
      {
        "name": "Political Operative",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Web of Favors (Passive)",
            "text": "You start each session with 2 Favor Tokens. You can spend a Favor to introduce a helpful NPC contact or to produce a piece of common (Tier 1) gear as a \"gift\" from a contact."
          },
          {
            "tier": "Specialization",
            "name": "Call in a Debt (Action)",
            "text": "Spend 2 Favor Tokens to compel an NPC to perform a significant and risky service. They cannot refuse without serious consequences (loss of status, wealth, or physical harm). Your maximum Favor Tokens increases to 5."
          },
          {
            "tier": "Mastery",
            "name": "Checkmate (Action)",
            "text": "Once per story arc, you can spend 5 Favor Tokens to orchestrate a major political event, expose a rival's secret, trigger a vote of no confidence, start a scandal, instigate a coup. Describe the outcome you want, and the Keeper describes the repercussions. 43"
          }
        ]
      }
    ],
    "Engineer": [
      {
        "name": "Tech Specialist",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Digital Ghost (Action)",
            "text": "You have Advantage on all hacking and technology rolls. When you successfully hack a system, you leave no trace of your intrusion unless you choose to."
          },
          {
            "tier": "Specialization",
            "name": "ICE Breaker (Action)",
            "text": "When you encounter a security system, you can spend 1 Hope to obtain information about any technological system in the area, including weaknesses, access points, and access codes."
          },
          {
            "tier": "Mastery",
            "name": "Master of the Matrix (Action)",
            "text": "Once per session, you can spend 3 Hope to establish an unhackable and undetectable quantum communications network across a star system. This network allows secure and real-time communications with anyone you know in the system, and cannot be intercepted or tracked."
          }
        ]
      },
      {
        "name": "Xenotech Savant",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Adaptive Interface (Action)",
            "text": "You have become an expert in alien technology. You can operate any xenotech without penalties, and you have Advantage when trying to understand or modify its functions."
          },
          {
            "tier": "Specialization",
            "name": "Xenotech Integration (Action)",
            "text": "You can spend 1 Hope to temporarily integrate a piece of alien technology into your equipment or ship, gaining its benefits for the rest of the scene. This could be enhanced sensors, adaptive armor, or exotic weapons."
          },
          {
            "tier": "Mastery",
            "name": "Technological Symbiosis (Passive)",
            "text": "You have formed a permanent bond with an alien AI or technological entity. Once per session, you can spend 2 Hope to ask your symbiont for critical help. It might provide vital information, take control of nearby systems, or even manifest as a technological construct to assist you."
          }
        ]
      },
      {
        "name": "Medical Technician",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Field Surgery (Action)",
            "text": "Mark 1 Stress to perform emergency medical aid. You can either heal a target for 2 HP plus 1 HP for 1d4 rounds, or stabilize a dying creature, or remove a level of Degradation from an augmentation."
          },
          {
            "tier": "Specialization",
            "name": "Bio-Mechanic (Passive)",
            "text": "You are an expert in the fusion of flesh and steel. All healing you perform on augmented individuals or with technological tools (like a Medkit) heals an additional +1 HP. Additionally, you can craft cybernetic implants as a Long-Term Project."
          },
          {
            "tier": "Mastery",
            "name": "Miracle Worker (Action)",
            "text": "Once per story arc, you can spend 3 Hope to bring a character who died within the last hour back from the brink of death. They are revived with 1 HP and a new, permanent scar, narrative or mechanical, determined with the Keeper."
          }
        ]
      }
    ],
    "Explorer": [
      {
        "name": "Cartographer",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Cosmic Cartography (Passive)",
            "text": "You have Advantage on long-distance Piloting and astrogation rolls. You also have Advantage on Chart a Safe Route during a Void Crawl."
          },
          {
            "tier": "Specialization",
            "name": "Eye for the Anomaly (Action)",
            "text": "Spend 1 Hope when using Scan the Area to gain Advantage on the roll. With Success + Hope, you also gain an extra Intel question."
          },
          {
            "tier": "Mastery",
            "name": "The Unseen Path (Action)",
            "text": "Once per major session, spend 3 Hope to find a hidden route or method that bypasses an obstacle, a hazard, or a fortified position the rest of the crew thought was impassable."
          }
        ]
      },
      {
        "name": "Wilderness",
        "trait": "Synthesis",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Naturalist's Eye (Passive)",
            "text": "Gain Advantage on Knowledge rolls to identify flora and fauna, and on Instinct rolls to track creatures or find natural resources."
          },
          {
            "tier": "Specialization",
            "name": "Environmental Symbiosis (Action)",
            "text": "Spend 1 Hope. For the scene, you need no food or water, you have Advantage on Survival rolls against natural hazards, and you may temporarily gain a minor beneficial trait from a local creature (Keeper's discretion)."
          },
          {
            "tier": "Mastery",
            "name": "Primal Connection (Action)",
            "text": "Spend 3 Hope (once per session) to command local non-sentient fauna up to a Major threat for one scene. Alternatively, spend 1 Hope to instantly find a safe shelter or a vital natural resource in your current environment."
          }
        ]
      },
      {
        "name": "The Stalker",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Mark Quarry (Action)",
            "text": "As an action, mark a single target. Until your next long rest, you have Advantage on Instinct rolls to track them, and your first successful attack each round against the marked quarry deals an extra 1d6 damage."
          },
          {
            "tier": "Specialization",
            "name": "Unrelenting Pursuit (Action)",
            "text": "While pursuing your marked quarry, spend 1 Hope to flawlessly overcome one environmental obstacle without losing time or momentum."
          },
          {
            "tier": "Mastery",
            "name": "The Trap is Sprung (Action)",
            "text": "Once per session, spend 3 Hope to declare you have set a trap for your marked quarry in the current location. Describe the trap; your quarry is automatically Restrained or Cornered for the scene. 47"
          }
        ]
      }
    ],
    "Mystic": [
      {
        "name": "Veil Walker",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Phase Step (Reaction)",
            "text": "When you are the target of an attack or need to move through an obstacle, you can spend 1 Stress to \"blink\" to a location in Close range, evading the attack or obstacle. Once per short rest, you can create a pocket dimensional sanctuary that lasts 10 minutes, invisible and inaccessible."
          },
          {
            "tier": "Specialization",
            "name": "Temporal Distortion (Action)",
            "text": "Once per scene, you can spend 1 Hope to briefly manipulate time around an enemy. That enemy must reroll all dice on their next action and choose the lowest result."
          },
          {
            "tier": "Mastery",
            "name": "Causality Reverse (Action)",
            "text": "Once per session, you can spend 3 Stress to undo a single, recent event that occurred within Close range. A fatal blow is undone, a destroyed artifact is made whole, a triggered trap is reset. The narrative rewinds."
          }
        ]
      },
      {
        "name": "Mind-Touched",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Thought Tide (Action)",
            "text": "Spend 1 Hope to allow an ally to use your Presence or Instinct modifier for one roll. Once per rest, you can spend 1 Stress to grant your entire crew a mental shield, giving them Advantage on rolls to resist fear or psychic influence for one scene."
          },
          {
            "tier": "Specialization",
            "name": "Implant Suggestion (Action)",
            "text": "Make a Presence vs. Presence or Instinct (defender chooses the higher) contest. On a success, you plant a single, subtle command in a target's mind (e.g., forget my face, trust me, drop your weapon). The target believes the thought is their own."
          },
          {
            "tier": "Mastery",
            "name": "Collective Consciousness (Action)",
            "text": "Once per session, you can spend 3 Hope to merge your mind with up to 3 allies in Close range for one scene. You share senses, emotions, and thoughts, gaining Advantage on all group rolls and on Instinct rolls to detect dangers."
          }
        ]
      },
      {
        "name": "Precursor Touched",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Ancient Echo (Action)",
            "text": "Spend 1 Hope to open your mind to a Precursor artifact or site. The Keeper will give you a cryptic, dream-like vision related to its purpose or history. You gain Advantage on all rolls to interact with it for the scene."
          },
          {
            "tier": "Specialization",
            "name": "Waken the Sleepers (Action)",
            "text": "Mark 1 Stress. You can temporarily awaken a dormant Precursor device. The device will perform its most basic function for one minute. The results are often unpredictable and dangerous."
          },
          {
            "tier": "Mastery",
            "name": "Cosmic Truth (Action)",
            "text": "Spend 3 Stress to ask one specific, actionable question about the current story arc. The answer is true, but the Keeper gains 2 Fear and introduces a complication."
          }
        ]
      }
    ],
    "Pilot": [
      {
        "name": "Void Runner",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Pathfinder's Sense (Action)",
            "text": "Mark 1 Stress to sense the safest or fastest route through a dangerous area (asteroid field, nebula, contested system). You and your ship gain Advantage on all Piloting and Evasion rolls while following this route during the scene."
          },
          {
            "tier": "Specialization",
            "name": "Sensor Savant (Action)",
            "text": "When you make a sensor or navigation roll, you can spend 1 Hope to gain Advantage. If you succeed with Hope, you also discover a hidden detail, a cloaked ship, a secret passage, a valuable resource."
          },
          {
            "tier": "Mastery",
            "name": "Veil Dancer (Passive / Action)",
            "text": "You have become one with the Veil currents. You no longer suffer penalties for navigating through Veil storms."
          }
        ]
      },
      {
        "name": "Combat Ace",
        "trait": "Agility",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Tactical Grace (Reaction)",
            "text": "When you or your ship is the target of an attack, you can spend 1 Stress to add your Agility modifier to the ship's Evasion for that attack."
          },
          {
            "tier": "Specialization",
            "name": "Target Lock (Action)",
            "text": "Mark 1 Stress to analyze the weaknesses of an enemy or enemy ship. For the rest of the scene, all attacks made by you or your allies against that ship gain +1d4 damage."
          },
          {
            "tier": "Mastery",
            "name": "Ace Maneuver (Action)",
            "text": "Once per scene, you can spend 2"
          }
        ]
      },
      {
        "name": "System Jockey",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Orbital Whisperer (Action)",
            "text": "When attempting to dock, land, or navigate in tight spaces, you can spend 1 Stress to automatically succeed. You can also spend 1 Hope to obtain a complete and detailed map of all defenses and active security systems in the area."
          },
          {
            "tier": "Specialization",
            "name": "Gravity Slingshot (Action)",
            "text": "When performing a gravity assist maneuver, you can make a Finesse + Piloting roll (DC 12). On success, you reach your destination in half the time and consume no fuel for the maneuver. On failure, you reach the correct destination but the journey is rough, causing 1 Stress to all crew members."
          },
          {
            "tier": "Mastery",
            "name": "Ghost in the Machine (Action)",
            "text": "Once per session, you can spend 3 Hope to seamlessly integrate into the systems of a station or capital ship during a scene."
          }
        ]
      }
    ],
    "Scholar": [
      {
        "name": "Xenobiologist",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Life Reader (Action)",
            "text": "Spend 1 Hope to study an organism (living or dead) and learn its biology, behavior, and weaknesses. The Keeper will reveal a mechanical weakness (e.g., Vulnerable to an energy type) or a narrative weakness (e.g., afraid of light)."
          },
          {
            "tier": "Specialization",
            "name": "Ecosystem Decoder (Passive)",
            "text": "You have Advantage on all Survival and navigation rolls in alien biomes. Additionally, you can spend 1 Stress to identify a native plant or animal that can be used as a resource, poison, medicine, food."
          },
          {
            "tier": "Mastery",
            "name": "Evolutionary Forecast (Action)",
            "text": "Once per session, you can spend 3 Hope to predict a significant environmental change in a star system (a solar storm, massive creature migration, disease outbreak). The Keeper will give you vital information about this event, allowing you to prepare for or exploit it."
          }
        ]
      },
      {
        "name": "Precursor Archaeologist",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Artifact Whisper (Action)",
            "text": "Spend 1 Hope to attune to a Precursor artifact. The Keeper will reveal a fragment of its history or a clue about how to use it. You have Advantage on all rolls to activate Precursor technology for the scene."
          },
          {
            "tier": "Specialization",
            "name": "Cultural Reconstructor (Passive)",
            "text": "When interacting with a faction you have studied, you gain +2 to all social rolls. Additionally, you can spend 1 Stress to recall a key custom or taboo, avoiding a serious social mistake."
          },
          {
            "tier": "Mastery",
            "name": "Philosophy Engine (Action)",
            "text": "Once per session, you can spend 3 Hope to decipher a fundamental principle of pre-Silence wisdom. This allows you to create a single-use, relic-tier invention that can drastically alter a situation, a device that nullifies local gravity, a translator that works on any speech, a scanner that briefly …"
          }
        ]
      },
      {
        "name": "Information Theorist",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Data Storm (Reaction)",
            "text": "When you fail a decryption or hacking roll, you can spend 1 Stress to reroll the dice. If you succeed, you can also create a temporary firewall that protects that system for one scene."
          },
          {
            "tier": "Specialization",
            "name": "Social Algorithm (Passive)",
            "text": "You have Advantage on all social rolls against any organization you have previously analyzed. You can spend 1 Stress to predict an organization's next move, gaining a key clue."
          },
          {
            "tier": "Mastery",
            "name": "Quantum Network (Action)",
            "text": "Once per session, you can spend 3 Hope to establish an instant and undetectable quantum communications network across a star system for the duration of the scene. 53"
          }
        ]
      }
    ],
    "Scoundrel": [
      {
        "name": "Assassin",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Deadly Masquerade (Action)",
            "text": "Spend 1 Stress to create a flawless disguise and identity for one scene. You can spend 1 Hope to make this identity stand up to any level of scrutiny for 24 hours."
          },
          {
            "tier": "Specialization",
            "name": "Viper's Kiss (Passive)",
            "text": "When you score a Critical Success on an attack, the target is automatically Stunned. You can also choose to spend 1 Stress to apply a potent neurotoxin (Poisoned effect) to any successful attack."
          },
          {
            "tier": "Mastery",
            "name": "Perfect Kill (Action)",
            "text": "Once per combat, you can spend 2 Hope to declare your next attack against a target who is unaware of you, Surprised, or Helpless is a perfect kill. It is an automatic Critical Success and deals maximum damage."
          }
        ]
      },
      {
        "name": "Ghost",
        "trait": "Agility",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Ghost (Action)",
            "text": "Mark 1 Stress to become invisible for one round, or to remove all traces of your passage through an area. If you succeed with Hope on a Stealth roll while invisible, you remain invisible."
          },
          {
            "tier": "Specialization",
            "name": "Like a Whisper (Passive)",
            "text": "You are a ghost to machines. You cannot be detected by non-psionic sensors, cameras, or automated systems unless you choose to be."
          },
          {
            "tier": "Mastery",
            "name": "Shadow Network (Action)",
            "text": "Once per session, you can spend 2 Hope to call upon your network of spies and informants. You can either gain a key piece of information about any target in the sector, or have your network create a diversion or provide a safehouse."
          }
        ]
      },
      {
        "name": "Contrabandist",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Hidden Cargo (Action)",
            "text": "Spend 1 Stress to declare you have a small, useful, or contraband item secreted on your person or ship that you have not previously mentioned. The Keeper has final say on what is plausible."
          },
          {
            "tier": "Specialization",
            "name": "Dock Authority (Passive)",
            "text": "You have Advantage on all social rolls with port officials, dockmasters, customs agents, and the working staff of stations and waystations. You can spend 1 Hope to ensure that a routine inspection of your ship turns up nothing of interest, regardless of what you are actually carrying."
          },
          {
            "tier": "Mastery",
            "name": "The Long Con (Action)",
            "text": "Once per story arc, you can spend 3 Hope to declare that an elaborate scheme you set up months or years ago has just paid off."
          }
        ]
      }
    ],
    "Soldier": [
      {
        "name": "Guardian",
        "trait": "Strength",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Bodyguard Protocol (Reaction)",
            "text": "When an ally within Close range is hit by an attack, you can spend 1 Stress to intercept it, taking the damage yourself. When you do, you gain Advantage on your next Melee attack against that attacker."
          },
          {
            "tier": "Specialization",
            "name": "Hold the Line! (Action)",
            "text": "Mark 1 Stress. You become a point of mobile cover. Allies adjacent to you gain the benefit of cover (+2 to their Evasion) and can ignore the effects of Stagger or forced movement until your next turn."
          },
          {
            "tier": "Mastery",
            "name": "Unbreakable (Reaction)",
            "text": "Once per session, when one or more allies would take damage, you can spend 3 Hope to negate all of it. Describe how you absorb or deflect the assault. For the rest of the scene, your armor's Minor and Major thresholds are reduced by 2."
          }
        ]
      },
      {
        "name": "Military Officer",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Call the Shot (Action)",
            "text": "Mark 1 Stress to grant an ally one of the following benefits on their next action: gain Advantage, their attack ignores cover, or their action does not draw the spotlight."
          },
          {
            "tier": "Specialization",
            "name": "Exploit Weakness (Action)",
            "text": "Spend 1 Hope to analyze an enemy's tactics or equipment. For the rest of the scene, all attacks made by your allies against that enemy have the Armor Piercing quality."
          },
          {
            "tier": "Mastery",
            "name": "Battlefield Symphony (Action)",
            "text": "Once per session, spend 3 Hope. You perfectly orchestrate the flow of battle. Every other member of the crew may immediately perform one free action."
          }
        ]
      },
      {
        "name": "Peacekeeper",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Unspoken Authority (Action)",
            "text": "Spend 1 Hope to halt a conflict for a single, tense moment. No one can take hostile action until you speak or act. This gives you a key window to negotiate, intimidate, or create an escape route."
          },
          {
            "tier": "Specialization",
            "name": "Common Ground (Action)",
            "text": "Spend 1 Stress and make a Presence check. On a success, you find a point of leverage or empathy with one enemy. You can turn them into a temporary ally or remove them from the fight as they question their loyalties. If you succeed with Hope, they reveal a key secret about their leader."
          },
          {
            "tier": "Mastery",
            "name": "Sanctuary (Action)",
            "text": "Once per session, spend 3 Hope to declare a zone around you as neutral ground. For the scene, no one can willingly initiate violence within this zone, enforced by your sheer presence. 57"
          }
        ]
      }
    ],
    "Vanguard": [
      {
        "name": "Ghost Blade",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Perfect Deflection (Reaction)",
            "text": "Spend 1 Stress to gain +3 Evasion against one incoming attack. If the attack misses due to this bonus, you gain Advantage on your next Melee attack against that attacker."
          },
          {
            "tier": "Specialization",
            "name": "Unseen Movement (Action)",
            "text": "Spend 1 Hope and make a Finesse Trait Check (DC 14). On success, move up to Far Range. The attacker you move away from gains Disadvantage on its next attack roll against you."
          },
          {
            "tier": "Mastery",
            "name": "Blade Dance (Action)",
            "text": "Mark 1 Stress. Make a single Melee attack roll against up to three enemies within your reach. You make one roll and compare it to each of their Evasion scores."
          }
        ]
      },
      {
        "name": "Kinetic Echo",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Precog Dodge (Reaction)",
            "text": "Spend 1 Hope when targeted by an attack. You force the attacker to reroll the attack roll (the Keeper must accept the new result)."
          },
          {
            "tier": "Specialization",
            "name": "Kinetic Reversal (Reaction)",
            "text": "When subjected to forced movement, spend 1 Stress to negate the movement and instead move up to your speed in any direction."
          },
          {
            "tier": "Mastery",
            "name": "Echoing Strike (Passive)",
            "text": "When you succeed with Hope on a Melee attack, you create a temporal echo. The target is Dazed until the end of their next turn and suffers 1d6 Void damage at the start of their next turn."
          }
        ]
      },
      {
        "name": "Pure Conduit",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Force Projection (Action)",
            "text": "Spend 1 Stress. Choose one: push one object or creature up to Far Range, or create a wall of force that provides cover until your next turn, or deal 1d6 Kinetic damage to everything in Close Range (no effect on creatures)."
          },
          {
            "tier": "Specialization",
            "name": "Shield of Will (Reaction)",
            "text": "When an ally in Close range is targeted by a mental or social attack, spend 1 Stress to impose Disadvantage on the roll."
          },
          {
            "tier": "Mastery",
            "name": "Immovable Fortress (Action)",
            "text": "Spend 2 Hope to create a shimmering dome of kinetic force with a 5 m radius around you for one scene. The dome is immobile and has an Armor Threshold of 6 and 10 HP. It blocks all physical attacks but does not stop energy or psionic effects."
          }
        ]
      }
    ]
  },
  "sleeping": {
    "Diplomat": [
      {
        "name": "Cultural Attaché",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Mother Tongue (Passive).",
            "text": "You speak fluently any galactic language that has at least 100 living speakers. For dead languages or extremely rare tongues, you have working competence with a Knowledge roll at advantage."
          },
          {
            "tier": "Specialization",
            "name": "The Listening Posture (Action).",
            "text": "Spend 1 Effort. For the next minute of conversation, you understand not only what the NPC is saying but what they mean to say but cannot. The Keeper provides a brief paraphrase of the subtext after each significant statement."
          },
          {
            "tier": "Mastery",
            "name": "The Reconciliation (Action).",
            "text": "Once per story arc, mediate between two conflicting parties willing to sit. Roll Presence; the DC scales with the depth of the grievance. On success they agree terms; influence scales with the roll. A critical buries the grievance itself."
          }
        ]
      },
      {
        "name": "The Steward",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Standing File (Passive).",
            "text": "You maintain a private dossier on every named NPC the party has met. At the start of any scene featuring a returning NPC, you may ask the Keeper one question about that NPC's recent activities; the Keeper answers truthfully (omissions are permitted; lies are not)."
          },
          {
            "tier": "Specialization",
            "name": "Cited Precedent (Action).",
            "text": "Spend 1 Effort during a social roll. You cite a specific past event, a treaty, a debt, a kindness, a betrayal, that bears on the present moment. The Keeper grants advantage and adjusts the scene's stakes to acknowledge the citation."
          },
          {
            "tier": "Mastery",
            "name": "The Long Memory (Action).",
            "text": "Once per story arc, you may declare that you have been preparing for this exact meeting for years. You produce a document, an heirloom, a witness, or a recorded confession that decisively changes the conversation. The Keeper and you negotiate what it is. Once produced, it is spent."
          }
        ]
      },
      {
        "name": "Political Operative",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Quiet Map (Passive).",
            "text": "At the start of any new political environment (a city, a station, a fleet), you may spend a Short Rest mapping the informal power structure. The Keeper provides three significant relationships, debts, or grievances that are not common knowledge."
          },
          {
            "tier": "Specialization",
            "name": "Lever (Action).",
            "text": "Spend 1 Effort. You apply a piece of known leverage to an NPC during a social scene. The Keeper describes the NPC's resistance and what concessions, if any, are now possible. Successful application of leverage may also incur a permanent enmity, leverage is remembered."
          },
          {
            "tier": "Mastery",
            "name": "The Dossier (Action).",
            "text": "Once per story arc, you produce a sealed dossier on a named NPC. Its contents, if released, would destroy that NPC's position. You may threaten its release; you may release it; you may, most dangerously of all, use its existence as a private gift. The Keeper helps you determine the dossier's exact contents only at the moment of use."
          }
        ]
      }
    ],
    "Engineer": [
      {
        "name": "Tech Specialist",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Audit (Action).",
            "text": "Spend 1 Effort to audit any networked system you have access to. The Keeper tells you what processes are running, what data has moved in the last hour, and what anomalies, if any, are present."
          },
          {
            "tier": "Specialization",
            "name": "The Quiet Hand (Action).",
            "text": "Spend 1 Effort. You modify a system you have audited; the modification persists until discovered. The Keeper describes the realistic parameters of the modification's stealth."
          },
          {
            "tier": "Mastery",
            "name": "The Dead Drop (Passive).",
            "text": "You maintain a permanent, hidden access channel into any system you have administered for at least one week. The Keeper tracks these channels; they may be discovered, but they do not expire."
          }
        ]
      },
      {
        "name": "Xenotech Savant",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Catalog (Passive).",
            "text": "When you encounter unfamiliar technology, you may consult your catalog (a large, ugly, hand-written document the character keeps). The Keeper tells you whether your catalog has a relevant entry, and if so, what it says, including its limits."
          },
          {
            "tier": "Specialization",
            "name": "The Procedure (Action).",
            "text": "Spend 1 Effort to apply a documented procedure to an unfamiliar artifact. The Keeper resolves the interaction more safely than an untested one would resolve. (Your procedures are conservative; this is intentional.)"
          },
          {
            "tier": "Mastery",
            "name": "The New Page (Action).",
            "text": "Once per story arc, after extensive observation, you add an unfamiliar artifact's behavior to your catalog. From that point forward, you and your party have working competence with that class of artifact."
          }
        ]
      },
      {
        "name": "Medical Technician",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Triage (Action).",
            "text": "Spend 1 Effort. You assess the medical state of every conscious or unconscious creature within Close range. The Keeper tells you who is dying, who is stable, and who is faking."
          },
          {
            "tier": "Specialization",
            "name": "Stabilize (Action).",
            "text": "Spend 1 Effort. A creature that would die at the end of this turn does not die. They remain critically wounded until next encountered, at which point they are stable but still injured."
          },
          {
            "tier": "Mastery",
            "name": "The Last Rite (Action).",
            "text": "Once per story arc, when a named character has died, you may perform a six-hour procedure that returns them to life with a permanent Scar. The Scar is medically real (a missing limb, a damaged organ, a chronic condition), and it is not removable by future treatment. This is a Sleeping mastery: the body is what is, and what is restored is the body's continuation, not its perfection."
          }
        ]
      }
    ],
    "Explorer": [
      {
        "name": "Cartographer",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Dead Reckoning (Passive).",
            "text": "You can determine your position on any planet, station, or vessel without instrumentation, with at most a 5% error."
          },
          {
            "tier": "Specialization",
            "name": "The Marked Route (Action).",
            "text": "Spend 1 Effort. You leave a permanent, subtle trail along your route. Anyone in your party (or anyone you teach the marks to) can follow this trail without rolling."
          },
          {
            "tier": "Mastery",
            "name": "The Chart (Action).",
            "text": "Once per story arc, you complete a definitive chart of a region, system, or sector. The chart functions as a faction asset, sold, gifted, or referenced, and earns you standing with the Explorers' Guild and any party that uses it."
          }
        ]
      },
      {
        "name": "Wilderness",
        "trait": "Strength",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Self-Reliant (Passive).",
            "text": "You and one ally never suffer the Hungry, Thirsty, or Exhausted conditions in any environment that supports Class-IV humanoid life."
          },
          {
            "tier": "Specialization",
            "name": "The Old Craft (Action).",
            "text": "Spend 1 Effort, choose one. We Camp Here: declare a defensible camp in hostile terrain; during a rest here the environment cannot reach you, one watch suffices, and the party clears 2 additional Stress. The Weather Turns: read sky, current, or pressure; declare what the environment will do in the coming hours, and it does. Live Off This: in any living environment, produce the food, water, or remedy the scene needs."
          },
          {
            "tier": "Mastery",
            "name": "The Old Way (Passive).",
            "text": "You and any allies under your guidance can travel through hostile environments at full pace and without injury. The Keeper still adjudicates encounters, but the environment itself does not harm you."
          }
        ]
      },
      {
        "name": "The Stalker",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Mark Quarry (Action).",
            "text": "Mark a target. For the next 24 hours, you have advantage on Instinct rolls to track them and your first successful attack each round against them deals an extra 1d6 damage."
          },
          {
            "tier": "Specialization",
            "name": "Unrelenting Pursuit (Action).",
            "text": "Spend 1 Effort. While pursuing your marked quarry, you cross one significant environmental obstacle without losing time or momentum."
          },
          {
            "tier": "Mastery",
            "name": "The Trap is Sprung (Action).",
            "text": "Once per session, spend 3 Effort to declare you set a trap for your marked quarry in the current location. The trap's nature is yours to describe; the quarry, on entering, is Restrained or Cornered for the scene."
          }
        ]
      }
    ],
    "Mystic": [
      {
        "name": "Veil Walker (School of Path)",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Veil-Map (Passive).",
            "text": "You maintain a personal map of Veil density across all explored regions. Once per session, you may consult it for one Keeper-supplied truth about a region's Veil character."
          },
          {
            "tier": "Specialization",
            "name": "The Stabilizing Working",
            "text": "(Action). Spend 1 Effort and 10 minutes. A Veil phenomenon in your immediate area is quieted, not stopped, but rendered safe, for the next hour."
          },
          {
            "tier": "Mastery",
            "name": "The Dead Map (Action).",
            "text": "Once per story arc, after extensive study, you complete a definitive map of a specific Veil structure (a Vault, a stream, a Frequency node). The map is shared property of the party, the Spire, and the Guild."
          }
        ]
      },
      {
        "name": "Mind-Touched (School of Apprehension)",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Cold Read (Action).",
            "text": "Spend 1 Effort. You apply observation, training, and your notes to read an NPC. The Keeper provides one truthful surface emotion and one likely concealed motivation."
          },
          {
            "tier": "Specialization",
            "name": "Studied Mimicry (Action).",
            "text": "Spend 1 Effort. For the next minute, you produce, with technique, the appropriate emotional affect for the room. NPCs who are not specifically watching for the deception cannot detect it."
          },
          {
            "tier": "Mastery",
            "name": "The Mirror Procedure (Action).",
            "text": "Once per session, you may, for one full minute, exactly model a named NPC's mind. The Keeper plays the NPC alongside you, advising you on what the NPC would think, do, or say. This grants enormous social and tactical advantage. It is also disturbing; you mark 1 Stress on completion."
          }
        ]
      },
      {
        "name": "Precursor Touched (School of Ruins)",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Ruined Hand (Passive).",
            "text": "You read Precursor markings as natively as your home language, with the same speed and the same fluency."
          },
          {
            "tier": "Specialization",
            "name": "The Long Read (Action).",
            "text": "Spend 1 Effort and 1 hour to interrogate a Precursor artifact. The Keeper reveals one piece of true historical information about the artifact's origin and one about its function."
          },
          {
            "tier": "Mastery",
            "name": "The Third Translation (Action).",
            "text": "Once per story arc, you produce the definitive translation of a major Precursor text. The translation is published, debated, and shifts academic consensus in a direction you choose. Real political consequences follow."
          }
        ]
      }
    ],
    "Pilot": [
      {
        "name": "Void Runner",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Quiet Lane (Passive).",
            "text": "You know one route, in any reasonably familiar region, that the patrols do not watch. The route is real and useful for the duration of the campaign or until the Keeper introduces a complication."
          },
          {
            "tier": "Specialization",
            "name": "The Cold Run (Action).",
            "text": "Spend 1 Effort. Your ship is, for the next hour, untraceable to standard scanning. (Specialized scanning still finds you; assume sensor parity with hostile capability.)"
          },
          {
            "tier": "Mastery",
            "name": "The Untouched Record (Passive).",
            "text": "Your name does not appear in any standard Imperial or House record as a known smuggler. (The PEOPLE who know what you do, know. The systems do not.)"
          }
        ]
      },
      {
        "name": "Combat Ace",
        "trait": "Instinct",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Wingman (Passive).",
            "text": "When flying with at least one ally vessel, both vessels gain +1 to maneuver rolls."
          },
          {
            "tier": "Specialization",
            "name": "The Tight Turn (Reaction).",
            "text": "Spend 1 Effort. When a hostile vessel locks weapons on you, you execute a turn the lock cannot follow. The lock breaks; the hostile vessel marks 1 Heat."
          },
          {
            "tier": "Mastery",
            "name": "The Ace's Mark (Passive).",
            "text": "You may claim, by named record, every kill you have made. The Sleeping Ace does not kill anonymously, the bodies are accounted for. You gain a fearsome reputation. NPC Pilots react to you accordingly; some flee, some seek you out."
          }
        ]
      },
      {
        "name": "System Jockey",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Quick Repair (Action).",
            "text": "Spend 1 Effort during starship combat. A damaged ship system goes from failed to limited functionality for the rest of the encounter."
          },
          {
            "tier": "Specialization",
            "name": "The Modified Loadout",
            "text": "(Passive). Your ship has one custom modification, declared at character creation, that no other ship has. The Keeper helps you decide what it is, and it is mechanically modest but narratively significant."
          },
          {
            "tier": "Mastery",
            "name": "The Total Refit (Action).",
            "text": "Once per story arc, after extensive downtime, you and your ship undergo a refit that grants permanent advancement: a new system, a doubled capacity, a hidden compartment. The refit is recorded as part of your ship's character."
          }
        ]
      }
    ],
    "Scholar": [
      {
        "name": "Xenobiologist",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Catalog of Life (Passive).",
            "text": "You have working classification competence with any biological organism you study for at least one minute. The Keeper provides phylum, hazard class, and one notable behavioral trait."
          },
          {
            "tier": "Specialization",
            "name": "The Synthesis (Action).",
            "text": "Spend 1 Effort with a sample or a minute of study of an organism: neutralize its toxin or spores for the crew this scene, or produce a lure that draws it where you choose, once."
          },
          {
            "tier": "Mastery",
            "name": "The New Species (Passive).",
            "text": "Once per story arc, you formally describe a new species. The description is published; future scenes acknowledge your authority on it; the Guild credits you. (This is the academic equivalent of slaying a dragon.)"
          }
        ]
      },
      {
        "name": "Precursor Archaeologist",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Stratigraphic Eye (Passive).",
            "text": "You can date Precursor structures by visual inspection alone, with at most a 200-year error."
          },
          {
            "tier": "Specialization",
            "name": "As Built (Action).",
            "text": "Spend 1 Effort studying a Precursor structure. The Keeper describes what it was built to do and how it worked; if it has a deactivation mechanism, you now know where it is. Reaching it is your problem."
          },
          {
            "tier": "Mastery",
            "name": "The Site Report (Action).",
            "text": "Once per story arc, you complete a definitive site report. The site is, from this point forward, understood; it does not stop being dangerous, but its history is no longer mysterious. Future scenes there resolve faster."
          }
        ]
      },
      {
        "name": "Information Theorist",
        "trait": "Knowledge",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Source Critique (Passive).",
            "text": "When presented with any document, recording, or testimony, you may, after one minute of inspection, ask the Keeper one question about its provenance: who made it, when, under what conditions, and with what likely biases."
          },
          {
            "tier": "Specialization",
            "name": "The Model (Action).",
            "text": "Spend 1 Effort modeling a system: a market, a patrol, a network, a crowd. Declare its behavior for the next hour absent intervention, and the Keeper adopts it; or inject one false datum the system treats as legitimate until audited."
          },
          {
            "tier": "Mastery",
            "name": "The Settled Question (Action).",
            "text": "Once per story arc, declare a contested historical question settled by your work. The settlement reverberates in the academic community; future scenes acknowledge the consensus you produced."
          }
        ]
      }
    ],
    "Scoundrel": [
      {
        "name": "Assassin",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Quiet Approach (Passive).",
            "text": "You can move silently in any environment that has reasonable cover. NPCs at standard alert do not notice your approach."
          },
          {
            "tier": "Specialization",
            "name": "The Killing Stroke (Action).",
            "text": "Spend 1 Effort. Your first attack of an encounter, against a target unaware of your presence, deals an additional 2d6 damage and ignores the first point of armor."
          },
          {
            "tier": "Mastery",
            "name": "The Standing Contract (Passive).",
            "text": "You hold a permanent contract that no living organization currently knows you hold. Its target is a specific named individual. The contract pays out, in full, on the day they die, by your hand or by another's, the contract does not specify. You may decide, at any point, to reveal your role."
          }
        ]
      },
      {
        "name": "Ghost",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Off the Record (Passive).",
            "text": "You do not appear on any standard surveillance system. Specialized surveillance with proper procedure can find you; default systems cannot."
          },
          {
            "tier": "Specialization",
            "name": "The Vanishing (Reaction).",
            "text": "Spend 1 Effort. When you would be detected, captured, or photographed, you instead are not. The Keeper resolves how, narratively. Once per scene."
          },
          {
            "tier": "Mastery",
            "name": "The Erased Record (Action).",
            "text": "Once per story arc, declare that an existing piece of evidence about your activities, a security recording, a witness statement, a written note, has been erased. The Keeper helps you decide how it was done; it is now gone."
          }
        ]
      },
      {
        "name": "Contrabandist",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Hidden Compartment",
            "text": "(Passive). Your kit, your ship, your room, wherever you live, has at least one compartment standard searches will miss."
          },
          {
            "tier": "Specialization",
            "name": "The Established Route (Action).",
            "text": "Spend 1 Effort. You move a piece of contraband through a checkpoint or border without being challenged. The route, once used, is logged by the relevant authority but may be reused with diminishing safety."
          },
          {
            "tier": "Mastery",
            "name": "The Old Captain's Favor (Action).",
            "text": "Once per story arc, call in a major favor from a senior Free Fleet, smuggler-cartel, or House-blacklist contact. The favor is significant, a ship, a passage, a name removed from a list, and is, after this use, repaid forever."
          }
        ]
      }
    ],
    "Soldier": [
      {
        "name": "Guardian",
        "trait": "Strength",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Bodyguard (Reaction).",
            "text": "When an ally within Close range would take damage, you may step into the path. Take half the damage yourself; the ally takes none."
          },
          {
            "tier": "Specialization",
            "name": "Hold Position (Action).",
            "text": "Spend 1 Effort. Designate a position (a doorway, a corridor, a wounded ally). Until you choose otherwise or you fall, no enemy may pass that position without succeeding on a Strength contest against you."
          },
          {
            "tier": "Mastery",
            "name": "The Wall (Passive).",
            "text": "Allies who fight within Close range of you have Advantage on resistance rolls and clear 1 Stress per scene. Your presence steadies people; this is observable training, not a cosmic effect."
          }
        ]
      },
      {
        "name": "Military Officer",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Rally (Action).",
            "text": "Once per scene, allies within Close range each clear 1 Stress. You give an order; they remember why they are here."
          },
          {
            "tier": "Specialization",
            "name": "Coordinated Strike (Action).",
            "text": "Spend 1 Effort. You and one ally each take an action outside the ally's Spotlight. Both actions gain Advantage if they target the same enemy."
          },
          {
            "tier": "Mastery",
            "name": "One Way Out (Action).",
            "text": "Once per story arc, your voice organizes a group of non-combatant NPCs into coordinated action: an evacuation, a mutiny, a work stoppage. They move as one while your voice holds."
          }
        ]
      },
      {
        "name": "Peacekeeper",
        "trait": "Strength",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Show of Force (Action).",
            "text": "Display, without using, your weapon and authority. Hostile NPCs not specifically committed to violence retreat or stand down."
          },
          {
            "tier": "Specialization",
            "name": "The Disarmament (Action).",
            "text": "Spend 1 Effort during a tense scene. One armed NPC is convinced, through your demeanor, your reputation, your position, or all three, to lower their weapon for the duration of the scene. The standdown is real; betraying it has reputational cost."
          },
          {
            "tier": "Mastery",
            "name": "The Cease-Fire (Action).",
            "text": "Once per story arc, between two willing parties, you broker a cease-fire that the involved factions honor. The cease-fire's terms are negotiable; its existence is binding while you live."
          }
        ]
      }
    ],
    "Vanguard": [
      {
        "name": "Ghost Blade (+Void)",
        "trait": "Finesse",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Quiet Strike (Action).",
            "text": "Once per scene, when you make a Melee attack while Hidden, the attack ignores 1 Armor Slot."
          },
          {
            "tier": "Specialization",
            "name": "The Folded Step (Action).",
            "text": "Spend 1 Effort. Move to available cover within Close range and become Hidden. This is not phasing; you have rehearsed this movement for years."
          },
          {
            "tier": "Mastery",
            "name": "The Folded Exit (Action).",
            "text": "Once per scene, after a successful Melee attack, move from Very Close to Close range toward available cover. Until your next Spotlight, attacks against you have Disadvantage."
          }
        ]
      },
      {
        "name": "Kinetic Echo (+Kinetic)",
        "trait": "Strength",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "Body Memory (Passive).",
            "text": "Choose one kind of physical feat you have drilled to mastery (a specific climb, a specific throw, a specific landing), noted when you take this subclass. You perform that feat without rolling in routine conditions only, meaning no active opposition, no time pressure, and no real risk. The moment a feat is contested, rushed, or dangerous, you roll like anyone else."
          },
          {
            "tier": "Specialization",
            "name": "The Channeled Blow (Action).",
            "text": "Spend 1 Effort. Your next Melee attack deals an additional 1d8 Kinetic damage. On a success, move the target one range band directly away from you."
          },
          {
            "tier": "Mastery",
            "name": "The Settled Ground (Action).",
            "text": "Once per scene, after a successful Melee attack, apply Dazed to the target."
          }
        ]
      },
      {
        "name": "Pure Conduit (+Lux)",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Cleared Room (Action).",
            "text": "Spend 1 Effort. For the next minute, you and allies within Close range have Advantage on rolls made to resist or clear Frightened, Confused, and Veil-induced deception."
          },
          {
            "tier": "Specialization",
            "name": "The Held Truth (Action).",
            "text": "Spend 1 Effort during a social or interrogation scene. NPCs who knowingly lie to you mark 1 Stress. NPCs who tell you a painful truth clear 1 Stress. Your presence does this without your speaking."
          },
          {
            "tier": "Mastery",
            "name": "The Cleared Path (Passive).",
            "text": "While you remain at a location affected by deception, illusion, or Veil-induced confusion, you and allies within Close range have Advantage on rolls made against those effects."
          }
        ]
      }
    ]
  }
};
const WEAPON_DATA = {
  "Combat Knife": {
    "tier": "Common",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Paired",
    "cost": 1
  },
  "Shock Baton": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d6+1 phys.",
    "feat": "Stunning, Paired+1",
    "cost": 1
  },
  "Plasma Cutter": {
    "tier": "Common",
    "trait": "Agility · Melee",
    "dmg": "d8 ene.",
    "feat": "Cutting, Paired+2",
    "cost": 4
  },
  "Mono-Blade": {
    "tier": "Common",
    "trait": "Finesse · Melee",
    "dmg": "d8 phys.",
    "feat": "Armor Piercing, Paired+2",
    "cost": 4
  },
  "Energy Dagger": {
    "tier": "Common",
    "trait": "Agility · Melee",
    "dmg": "d6+1 ene.",
    "feat": "Lightweight, Energy Tag",
    "cost": 1
  },
  "Slug Pistol": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d8+1 phys.",
    "feat": "Reliable",
    "cost": 1
  },
  "Flechette Pistol": {
    "tier": "Common",
    "trait": "Finesse · Close",
    "dmg": "d6+1 phys.",
    "feat": "Armor Piercing",
    "cost": 1
  },
  "Plasma Pistol": {
    "tier": "Common",
    "trait": "Instinct · Close",
    "dmg": "d8 ene.",
    "feat": "Overheating",
    "cost": 4
  },
  "Needle Gun": {
    "tier": "Common",
    "trait": "Finesse · Close",
    "dmg": "d6+1 phys.",
    "feat": "Poison",
    "cost": 1
  },
  "Holdout Blaster": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d6+1 ene.",
    "feat": "Concealable",
    "cost": 1
  },
  "Combat Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8+3 phys.",
    "feat": "Quick",
    "cost": 1
  },
  "Plasma Sidearm": {
    "tier": "Military",
    "trait": "Instinct · Close",
    "dmg": "d8+3 ene.",
    "feat": "Reliable",
    "cost": 4
  },
  "Gauss Pistol": {
    "tier": "Military",
    "trait": "Finesse · Close",
    "dmg": "d8+3 phys.",
    "feat": "Silent",
    "cost": 4
  },
  "Disruptor Pistol": {
    "tier": "Military",
    "trait": "Knowledge · Close",
    "dmg": "d8+3 ene.",
    "feat": "Shield Piercing",
    "cost": 4
  },
  "Phase Pistol": {
    "tier": "Experimental",
    "trait": "Knowledge · Close",
    "dmg": "d8+6 void",
    "feat": "Phasing",
    "cost": 4
  },
  "Quantum Sidearm": {
    "tier": "Experimental",
    "trait": "Instinct · Close",
    "dmg": "d6+6 void",
    "feat": "Probability Shift",
    "cost": 9
  },
  "Veil Pistol": {
    "tier": "Experimental",
    "trait": "Presence · Close",
    "dmg": "d8+6 void",
    "feat": "Reality Shift",
    "cost": 9
  },
  "Void Pistol": {
    "tier": "Experimental",
    "trait": "Presence · Close",
    "dmg": "d6+6 void",
    "feat": "Disintegrating",
    "cost": 9
  },
  "Thought Caster": {
    "tier": "Precursor",
    "trait": "Presence · Close",
    "dmg": "d8+9 void",
    "feat": "Mind Link",
    "cost": "Precursor"
  },
  "Reality Shaper": {
    "tier": "Precursor",
    "trait": "Knowledge · Close",
    "dmg": "d6+9 void",
    "feat": "Existence",
    "cost": "Precursor"
  },
  "Assault Rifle": {
    "tier": "Common",
    "trait": "Strength · Close",
    "dmg": "d8+1 phys.",
    "feat": "Automatic",
    "cost": 4
  },
  "Sniper Rifle": {
    "tier": "Common",
    "trait": "Finesse · Far",
    "dmg": "d8+1 phys.",
    "feat": "Accurate",
    "cost": 4
  },
  "Plasma Rifle": {
    "tier": "Common",
    "trait": "Instinct · Close",
    "dmg": "d8 ene.",
    "feat": "Overheating",
    "cost": 4
  },
  "Gauss Rifle": {
    "tier": "Common",
    "trait": "Agility · Far",
    "dmg": "d6+1 phys.",
    "feat": "Armor Piercing",
    "cost": 4
  },
  "Pulse Rifle": {
    "tier": "Common",
    "trait": "Strength · Close",
    "dmg": "d8+1 ene.",
    "feat": "Burst Fire",
    "cost": 4
  },
  "Battle Rifle": {
    "tier": "Military",
    "trait": "Strength · Close",
    "dmg": "d10+3 phys.",
    "feat": "Powerful",
    "cost": 4
  },
  "Sniper System": {
    "tier": "Military",
    "trait": "Finesse · Very Far",
    "dmg": "d8+3 phys.",
    "feat": "Smart Scope",
    "cost": 9
  },
  "Plasma Carbine": {
    "tier": "Military",
    "trait": "Instinct · Close",
    "dmg": "d8+3 ene.",
    "feat": "Stable",
    "cost": 9
  },
  "Mass Driver Rifle": {
    "tier": "Military",
    "trait": "Strength · Far",
    "dmg": "d8+3 phys.",
    "feat": "Massive",
    "cost": 9
  },
  "Suppression Rifle": {
    "tier": "Military",
    "trait": "Strength · Far",
    "dmg": "d6+3 phys.",
    "feat": "Suppressive",
    "cost": 9
  },
  "Phase Rifle": {
    "tier": "Precursor",
    "trait": "Knowledge · Far",
    "dmg": "d8+6 void",
    "feat": "Phasing",
    "cost": 9
  },
  "Veil Lance": {
    "tier": "Precursor",
    "trait": "Presence · Far",
    "dmg": "d10+6 void",
    "feat": "Reality Shift",
    "cost": 16
  },
  "Singularity Rifle": {
    "tier": "Precursor",
    "trait": "Knowledge · Far",
    "dmg": "d8+6 void",
    "feat": "Disintegrating",
    "cost": 16
  },
  "Precursor Beam Caster": {
    "tier": "Precursor",
    "trait": "Presence · Far",
    "dmg": "d10+9 void",
    "feat": "Existence",
    "cost": "n/a"
  },
  "Machine Gun": {
    "tier": "Common",
    "trait": "Strength · Far",
    "dmg": "d6+3 phys.",
    "feat": "Automatic",
    "cost": 4
  },
  "Rocket Launcher": {
    "tier": "Common",
    "trait": "Agility · Far",
    "dmg": "d10+3 phys.",
    "feat": "Explosive",
    "cost": 4
  },
  "Plasma Cannon": {
    "tier": "Common",
    "trait": "Instinct · Close",
    "dmg": "d10+3 ene.",
    "feat": "Overheating",
    "cost": 4
  },
  "Railgun": {
    "tier": "Common",
    "trait": "Strength · Far",
    "dmg": "d6+3 phys.",
    "feat": "Massive",
    "cost": 4
  },
  "Beam Cannon": {
    "tier": "Common",
    "trait": "Knowledge · Far",
    "dmg": "d6+3 ene.",
    "feat": "Continuous",
    "cost": 4
  },
  "Vibro-Sword": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d8+3 phys.",
    "feat": "Vibration",
    "cost": 4
  },
  "Chainglaive": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d10+3 phys.",
    "feat": "Automatic, Cleave",
    "cost": 9
  },
  "Plasma Rapier": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d8+3 ene.",
    "feat": "Piercing, Overheating",
    "cost": 9
  },
  "Gravity Hammer": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d10+3 phys.",
    "feat": "Stagger",
    "cost": 4
  },
  "Electro-Whip": {
    "tier": "Military",
    "trait": "Agility · Melee",
    "dmg": "d6+3 ene.",
    "feat": "Reach 2m, Stunning on crit",
    "cost": 4
  },
  "Phase Blade": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d8+6 void",
    "feat": "Phasing",
    "cost": 4
  },
  "Quantum Rapier": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d6+6 void",
    "feat": "Probability Shift",
    "cost": 9
  },
  "Void Cleaver": {
    "tier": "Experimental",
    "trait": "Strength · Melee",
    "dmg": "d10+6 void",
    "feat": "Disintegrating",
    "cost": 9
  },
  "Nanite Gauntlet": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d8+6 phys.",
    "feat": "Adaptive",
    "cost": 9
  },
  "Plasma-Infused Katana": {
    "tier": "Experimental",
    "trait": "Agility · Melee",
    "dmg": "d8+6 ene.",
    "feat": "Energy Surge",
    "cost": 9
  },
  "Heavy Machine Gun": {
    "tier": "Military",
    "trait": "Strength · Far",
    "dmg": "d6+6 phys.",
    "feat": "Suppressive",
    "cost": 4
  },
  "Smart Launcher": {
    "tier": "Military",
    "trait": "Knowledge · Far",
    "dmg": "d10+6 phys.",
    "feat": "Guided",
    "cost": 9
  },
  "Fusion Cannon": {
    "tier": "Military",
    "trait": "Instinct · Close",
    "dmg": "d10+6 ene.",
    "feat": "Devastating",
    "cost": 9
  },
  "Magnetic Accelerator": {
    "tier": "Military",
    "trait": "Finesse · Very Far",
    "dmg": "d6+6 phys.",
    "feat": "Armor Piercing (2)",
    "cost": 4
  },
  "Frag Grenade (×3)": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8+1 phys.",
    "feat": "Explosive",
    "cost": 1
  },
  "Concussion Grenade (×3)": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "1d6 Stress",
    "feat": "Explosive, Stunning, Area",
    "cost": 1
  },
  "Grenade Launcher": {
    "tier": "Military",
    "trait": "Strength · Far",
    "dmg": "(as ammo)",
    "feat": "Arcing Shot, Explosive",
    "cost": 9
  },
  "Static Pulse Grenade (×2)": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "d8+3 ene.",
    "feat": "Explosive, System Shock",
    "cost": 4
  },
  "Micro-Missile Launcher": {
    "tier": "Experimental",
    "trait": "Knowledge · Far",
    "dmg": "d10+3 phys.",
    "feat": "Guided, Salvo Fire",
    "cost": 16
  },
  "Void Grenade (×1)": {
    "tier": "Experimental",
    "trait": "Presence · Close",
    "dmg": "d10+3 void",
    "feat": "Explosive, Unraveling",
    "cost": 3
  },
  "Tangle-Field Grenade (×3)": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "1d4 Stress",
    "feat": "Explosive, Entangling",
    "cost": 1
  },
  "Flamethrower": {
    "tier": "Military",
    "trait": "Strength · Close",
    "dmg": "d8 ene.",
    "feat": "Continuous, Ignite",
    "cost": 9
  },
  "Shrapnel Cannon": {
    "tier": "Military",
    "trait": "Strength · Close",
    "dmg": "d10 phys.",
    "feat": "Massive, Shredding",
    "cost": 4
  },
  "Stasis Foam Projector": {
    "tier": "Military",
    "trait": "Strength · Close",
    "dmg": "n/a",
    "feat": "Entrapping, Messy",
    "cost": 4
  },
  "Resonance Disperser": {
    "tier": "Military",
    "trait": "Knowledge · Close",
    "dmg": "1d8 Stress",
    "feat": "Dispersal Wave, Disorienting",
    "cost": 9
  },
  "Cryo-Projector": {
    "tier": "Experimental",
    "trait": "Knowledge · Close",
    "dmg": "d6 ene.",
    "feat": "Continuous, Brittle",
    "cost": 9
  },
  "Barrier Emitter": {
    "tier": "Experimental",
    "trait": "Knowledge · Far",
    "dmg": "n/a",
    "feat": "Deployable Cover",
    "cost": 9
  },
  "Sonic Cannon": {
    "tier": "Experimental",
    "trait": "Knowledge · Far",
    "dmg": "1d8 Stress",
    "feat": "Waveform, Stagger",
    "cost": 16
  },
  "Gravity Well Emitter": {
    "tier": "Experimental",
    "trait": "Knowledge · Far",
    "dmg": "n/a",
    "feat": "Singularity",
    "cost": 16
  },
  "Taser Pistol": {
    "tier": "Common",
    "trait": "Finesse · Close",
    "dmg": "1d4 Stress",
    "feat": "Taser Charge",
    "cost": 1
  },
  "Net Launcher": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "n/a",
    "feat": "Entangling, Reload",
    "cost": 4
  },
  "Neural Scrambler": {
    "tier": "Experimental",
    "trait": "Finesse · Close",
    "dmg": "1d10 Stress",
    "feat": "Mind-Lock, Psionic",
    "cost": 16
  }
};
const ARMOR_DATA = {
  "Frontier Vest": {
    "tier": "Common",
    "thr": "5 / 11",
    "slots": 3,
    "feat": "Flexible",
    "cost": 1
  },
  "Environmental Suit": {
    "tier": "Common",
    "thr": "4 / 8",
    "slots": 3,
    "feat": "Life Support",
    "cost": 1
  },
  "Mesh Armor": {
    "tier": "Military",
    "thr": "5 / 10",
    "slots": 4,
    "feat": "Self-Repair",
    "cost": 4
  },
  "Pilot's Jacket": {
    "tier": "Common",
    "thr": "5 / 11",
    "slots": 3,
    "feat": "Life Support",
    "cost": 4
  },
  "Stealth Armor": {
    "tier": "Military",
    "thr": "7 / 16",
    "slots": 4,
    "feat": "Cloaking",
    "cost": 9
  },
  "Smart Fabric Armor": {
    "tier": "Experimental",
    "thr": "8 / 16",
    "slots": 5,
    "feat": "Self-Repair",
    "cost": 9
  },
  "Infiltrator Suit": {
    "tier": "Military",
    "thr": "7 / 14",
    "slots": 4,
    "feat": "Cloaking",
    "cost": 4
  },
  "Special Forces Suit": {
    "tier": "Military",
    "thr": "9 / 18",
    "slots": 5,
    "feat": "Resilient",
    "cost": 9
  },
  "Combat Armor": {
    "tier": "Military",
    "thr": "8 / 16",
    "slots": 3,
    "feat": "Resilient",
    "cost": 4
  },
  "Composite Armor": {
    "tier": "Military",
    "thr": "8 / 16",
    "slots": 4,
    "feat": "Resilient",
    "cost": 4
  },
  "Security Armor": {
    "tier": "Military",
    "thr": "7 / 14",
    "slots": 4,
    "feat": "Resilient",
    "cost": 4
  },
  "Colony Defense Armor": {
    "tier": "Military",
    "thr": "8 / 17",
    "slots": 5,
    "feat": "Fortified",
    "cost": 9
  },
  "Tactical Armor": {
    "tier": "Military",
    "thr": "10 / 20",
    "slots": 5,
    "feat": "Tactical",
    "cost": 9
  },
  "Powered Armor": {
    "tier": "Experimental",
    "thr": "13 / 28",
    "slots": 6,
    "feat": "Powered",
    "cost": 16
  },
  "Assault Armor": {
    "tier": "Military",
    "thr": "11 / 22",
    "slots": 5,
    "feat": "Assault",
    "cost": 9
  },
  "Marine Armor": {
    "tier": "Military",
    "thr": "12 / 24",
    "slots": 5,
    "feat": "Resilient, Environmental",
    "cost": 16
  },
  "Riot Armor": {
    "tier": "Common",
    "thr": "8 / 17",
    "slots": 6,
    "feat": "Heavy, Fortified",
    "cost": 1
  },
  "Industrial Exosuit": {
    "tier": "Common",
    "thr": "8 / 16",
    "slots": 7,
    "feat": "Very Heavy, Powered",
    "cost": 4
  },
  "Salvage Armor": {
    "tier": "Common",
    "thr": "7 / 15",
    "slots": 6,
    "feat": "Heavy, Jury-rigged",
    "cost": 4
  },
  "Battle Armor": {
    "tier": "Military",
    "thr": "13 / 27",
    "slots": 7,
    "feat": "Heavy, Fortified",
    "cost": 9
  },
  "Power Armor": {
    "tier": "Experimental",
    "thr": "15 / 30",
    "slots": 8,
    "feat": "Very Heavy, Powered",
    "cost": 16
  },
  "Siege Armor": {
    "tier": "Experimental",
    "thr": "16 / 32",
    "slots": 8,
    "feat": "Very Heavy, Massive",
    "cost": 25
  }
};
const AUGMENT_DATA = {
  "Memory Chip": {
    "tier": "Common",
    "benefit": "Perfect recall",
    "stress": "-",
    "cost": "4",
    "drawback": "Data-ghosts; cannot forget what matters."
  },
  "Pain Suppressor": {
    "tier": "Common",
    "benefit": "Ignore debilitating injuries",
    "stress": "-",
    "cost": "4",
    "drawback": "Cannot sense true injury severity."
  },
  "Combat Precognition": {
    "tier": "Military",
    "benefit": "Glimpses of possible futures",
    "stress": "1",
    "cost": "9",
    "drawback": "Social/paranoia bleed from alternate outcomes."
  },
  "Combat Reflexes": {
    "tier": "Military",
    "benefit": "Reaction speed beyond normal limits",
    "stress": "1",
    "cost": "9",
    "drawback": "Hypervigilance, twitch response."
  },
  "Prosthetic Limb": {
    "tier": "Common",
    "benefit": "Replace lost limb, +1 Strength",
    "stress": "-",
    "cost": "4",
    "drawback": "Maintenance required"
  },
  "Reinforced Bones": {
    "tier": "Common",
    "benefit": "+2 HP",
    "stress": "-",
    "cost": "9",
    "drawback": "Heavier body (-1 swim/climb)"
  },
  "Subdermal Armor": {
    "tier": "Common",
    "benefit": "+1 Armor Score",
    "stress": "-",
    "cost": "9",
    "drawback": "Obvious appearance"
  },
  "Toxin Filter": {
    "tier": "Common",
    "benefit": "Immunity to poisons",
    "stress": "-",
    "cost": "1",
    "drawback": "Reduced healing (half rate)"
  },
  "Enhanced Muscles": {
    "tier": "Common",
    "benefit": "+1 Strength",
    "stress": "-",
    "cost": "9",
    "drawback": "Increased caloric needs"
  },
  "Combat Chassis": {
    "tier": "Military",
    "benefit": "+2 Strength, +1 Armor",
    "stress": "1",
    "cost": "16",
    "drawback": "Social stigma"
  },
  "Enhanced Reflexes": {
    "tier": "Military",
    "benefit": "+2 Agility",
    "stress": "1",
    "cost": "16",
    "drawback": "Hyperactivity"
  },
  "Weapon Integration": {
    "tier": "Military",
    "benefit": "Built-in weapons, cannot disarm",
    "stress": "1",
    "cost": "4",
    "drawback": "Always-armed presence"
  },
  "Life Support System": {
    "tier": "Military",
    "benefit": "Survive vacuum/hostile env.",
    "stress": "-",
    "cost": "1",
    "drawback": "Tech dependency"
  },
  "Sensory Package": {
    "tier": "Military",
    "benefit": "+2 Instinct",
    "stress": "1",
    "cost": "16",
    "drawback": "Sensory overload in crowds"
  },
  "Phase Shifter": {
    "tier": "Experimental",
    "benefit": "Briefly intangible",
    "stress": "3",
    "cost": "16",
    "drawback": "Energy drain, risk of stuck"
  },
  "Adaptive Biology": {
    "tier": "Experimental",
    "benefit": "Env. hazard immunity",
    "stress": "2",
    "cost": "16",
    "drawback": "Unpredictable mutations"
  },
  "Quantum Muscles": {
    "tier": "Experimental",
    "benefit": "Variable strength",
    "stress": "2",
    "cost": "16",
    "drawback": "Unstable output"
  },
  "Subdermal Camouflage": {
    "tier": "Common",
    "benefit": "+1 Finesse on Stealth",
    "stress": "-",
    "cost": "4",
    "drawback": "Skin tinting visible bright light"
  },
  "Audio Dampeners": {
    "tier": "Common",
    "benefit": "Muffles movement",
    "stress": "1",
    "cost": "4",
    "drawback": "Reduced hearing acuity"
  },
  "Thermal Shroud": {
    "tier": "Common",
    "benefit": "Lowers heat signature",
    "stress": "-",
    "cost": "4",
    "drawback": "Overheating risk in heat"
  },
  "Light-Absorbent Skin": {
    "tier": "Common",
    "benefit": "+1 Agility in low-light",
    "stress": "-",
    "cost": "1",
    "drawback": "Skin fatigue, rashes"
  },
  "Neural Silence Nodes": {
    "tier": "Common",
    "benefit": "Immune to electronic eavesdrop",
    "stress": "1",
    "cost": "4",
    "drawback": "EMP vulnerability"
  },
  "Adaptive Camo Weave": {
    "tier": "Military",
    "benefit": "Alters color/pattern",
    "stress": "1",
    "cost": "9",
    "drawback": "Power draw reduces armor energy"
  },
  "Subdermal Noise Filters": {
    "tier": "Military",
    "benefit": "Sound cancellation within 5m",
    "stress": "1",
    "cost": "9",
    "drawback": "Headaches if worn continuously"
  }
};
const GEAR_DATA = {
  "Basic Medkit": {
    "tier": "Common",
    "use": "First Aid actions (Chapter 10)",
    "cost": 1
  },
  "Field Medkit": {
    "tier": "Military",
    "use": "First Aid at +2 to rolls",
    "cost": 4
  },
  "Trauma Kit": {
    "tier": "Military",
    "use": "Stabilize Dying at DC 12",
    "cost": 4
  },
  "Synthetic Tissue Pack": {
    "tier": "Experimental",
    "use": "Replace minor wounds in 24h",
    "cost": 9
  },
  "Cryo-Stasis Pod": {
    "tier": "Experimental",
    "use": "Suspend a Dying character indefinitely",
    "cost": 9
  },
  "Repair Nanites, Mender Vial": {
    "tier": "Common",
    "use": "Inject (Synthetic only): clear 1d4 HP",
    "cost": 2
  },
  "Repair Nanites, Reconstructor": {
    "tier": "Military",
    "use": "Inject (Synthetic only): clear 1d4+2 HP",
    "cost": 5
  },
  "Repair Nanites, Apex Swarm": {
    "tier": "Experimental",
    "use": "Inject (Synthetic only): clear 2d4+2 HP and 1 Stress",
    "cost": 9
  },
  "Datapad": {
    "tier": "Common",
    "use": "Standard computing, files",
    "cost": 1
  },
  "Encrypted Datapad": {
    "tier": "Military",
    "use": "Resistant to standard surveillance",
    "cost": 4
  },
  "Hacking Kit": {
    "tier": "Military",
    "use": "Advantage on system-intrusion rolls",
    "cost": 4
  },
  "Universal Translator": {
    "tier": "Military",
    "use": "Real-time translation, most languages",
    "cost": 4
  },
  "Sensor Array": {
    "tier": "Military",
    "use": "Wide-area detection, 100m radius",
    "cost": 4
  },
  "Quantum Crystal": {
    "tier": "Experimental",
    "use": "Long-range comms (Chapter 16)",
    "cost": 9
  },
  "Stealth-Field Generator": {
    "tier": "Experimental",
    "use": "Hidden condition for 1 minute, scene-limited",
    "cost": 9
  },
  "Environmental Suit": {
    "tier": "Common",
    "use": "Weather, mild atmospheres",
    "cost": 1
  },
  "Field Rations": {
    "tier": "Common",
    "use": "One week food, single character",
    "cost": 1
  },
  "Climbing Kit": {
    "tier": "Common",
    "use": "Advantage on climbing rolls",
    "cost": 1
  },
  "Atmospheric Mask": {
    "tier": "Military",
    "use": "Filters most toxic atmospheres",
    "cost": 4
  },
  "Cold-Weather Suit": {
    "tier": "Military",
    "use": "No Stress from extreme cold",
    "cost": 4
  },
  "Vacuum Suit": {
    "tier": "Military",
    "use": "Pressurized, two hours air",
    "cost": 4
  },
  "Long-Duration Vacuum Suit": {
    "tier": "Experimental",
    "use": "Twelve hours air, self-repairing seals",
    "cost": 9
  },
  "Tool Belt": {
    "tier": "Common",
    "use": "Engineer Class Item; general repairs",
    "cost": 1
  },
  "Surgical Kit": {
    "tier": "Military",
    "use": "Medical Technician subclass tools",
    "cost": 4
  },
  "Lock-Pick Kit": {
    "tier": "Common",
    "use": "Scoundrel Class Item; locks",
    "cost": 1
  },
  "Universal Key": {
    "tier": "Military",
    "use": "Defeats most commercial locks",
    "cost": 4
  },
  "Vault Kit": {
    "tier": "Experimental",
    "use": "High-security access",
    "cost": 9
  },
  "Survey Instruments": {
    "tier": "Common",
    "use": "Explorer Class Item; mapping",
    "cost": 1
  },
  "Personal Logbook": {
    "tier": "Common",
    "use": "Explorer Class Item; recorded entries",
    "cost": 1
  },
  "Welding Rig": {
    "tier": "Common",
    "use": "Welding/cutting; structural work",
    "cost": 1
  },
  "Industrial Plasma Cutter": {
    "tier": "Military",
    "use": "Cuts through standard materials",
    "cost": 4
  },
  "Portable Fabricator": {
    "tier": "Experimental",
    "use": "Produces basic components",
    "cost": 9
  },
  "Combat Engineer Kit": {
    "tier": "Military",
    "use": "Advanced repairs and construction",
    "cost": 4
  },
  "Personal Comm": {
    "tier": "Common",
    "use": "Line-of-sight to local relay",
    "cost": 1
  },
  "Encrypted Comm": {
    "tier": "Military",
    "use": "Same range; resistant to interception",
    "cost": 4
  },
  "Long-Range Comm": {
    "tier": "Military",
    "use": "Inter-system, via standard relay",
    "cost": 4
  },
  "Quantum Comm": {
    "tier": "Experimental",
    "use": "Inter-system, instantaneous, no relay",
    "cost": 9
  }
};
const DRONE_GRADE_DATA = {
  "Common Drone": { tier:"T2", cost:"4 Cr", hp:"2", evasion:"10", thresholds:"5 / 11", armor:"0", modules:"2", availability:"Civilian, commercial, frontier markets" },
  "Military Drone": { tier:"T3", cost:"8 Cr", hp:"3", evasion:"11", thresholds:"7 / 14", armor:"1", modules:"3", availability:"Restricted, licensed, House security" },
  "Experimental Drone": { tier:"T4", cost:"16 Cr", hp:"5", evasion:"12", thresholds:"9 / 16", armor:"2", modules:"4", availability:"Rare, unstable, black-site, prototype" }
};
const DRONE_MODULE_DATA = {
  "Flight Module": { tier:"Common", cost:"2 Cr", slots:"1", use:"Hover, cross gaps, move vertically, fly at low speed; -2 stealth while flying" },
  "Wall-Crawler": { tier:"Common", cost:"1 Cr", slots:"1", use:"Climb walls, ceilings, ducts, and uneven surfaces" },
  "Low-Light Camera": { tier:"Common", cost:"1 Cr", slots:"0", use:"See in darkness; remote visual feed" },
  "Medical Scanner": { tier:"Common", cost:"2 Cr", slots:"1", use:"Reads vitals and triage data" },
  "Hardened Link": { tier:"Common", cost:"2 Cr", slots:"1", use:"Resists interference; does not resist hard Lost zones" },
  "Neural Network Control": { tier:"Common", cost:"1 Cr", slots:"0", use:"Registered crew can take control by turns; moves spotlight, not action economy" },
  "Smoke/Flash Pod": { tier:"Common", cost:"2 Cr", slots:"1", use:"One-use escape, distraction, breach window, or Advantage on reposition/infiltration" },
  "Compliance Taser": { tier:"Common", cost:"4 Cr", slots:"2", use:"Close non-lethal attack; mark 1 Stress and force drop/stumble/stun if fiction allows" },
  "Stun Dart": { tier:"Common", cost:"4 Cr", slots:"2", use:"Close/Far non-lethal attack; 1d6 non-lethal physical or mark 1 Stress" },
  "Military Flight Module": { tier:"Military", cost:"6 Cr", slots:"1", use:"Controlled tactical flight; +1 to maneuver/evade/chase/reposition/pilot drone" },
  "Military Stealth Shell": { tier:"Military", cost:"8 Cr", slots:"1", use:"+2 stealth while moving slowly and avoiding loud modules" },
  "Armor Plating": { tier:"Military", cost:"4 Cr", slots:"1", use:"Gain +1 Armor Slot; -1 Evasion while flying/sneaking/evading/tight terrain" },
  "Target Painter": { tier:"Military", cost:"4 Cr", slots:"1", use:"Mark one target; next ally attacking gains Advantage or equivalent" },
  "Micro-Laser": { tier:"Military", cost:"4 Cr", slots:"2", use:"Far attack; 1d6 energy; precise but heat/beam traceable" }
};
const DOMAIN_DATA = {
  "Tech": {
    "label": "TECH",
    "theme": "The Ghost in the Machine",
    "desc": "Understanding, manipulating, repairing, and breaking technology; dead machines, security systems, scrap-built wonders.",
    "l1": [
      "Drone Whisper",
      "Quantum Firewall",
      "System Jackknife"
    ]
  },
  "Synthesis": {
    "label": "SYNTHESIS",
    "theme": "The Forged and Found",
    "desc": "Biological mastery: healing, adaptation, evolution, bodies, ecosystems, and survival in hostile environments.",
    "l1": [
      "Biological Scan",
      "Environmental Adaptation",
      "Rapid Regeneration"
    ]
  },
  "Social": {
    "label": "SOCIAL",
    "theme": "The Heart and the Crowd",
    "desc": "Influence, identity, leadership, deception, languages, reputation, and the web of alliances that holds the galaxy together.",
    "l1": [
      "Linguistic Patch",
      "Perfect Facade",
      "Silver Tongue"
    ]
  },
  "Neural": {
    "label": "MIND",
    "theme": "The Mind's Unseen Ocean",
    "desc": "Psionic energy and the mind made manifest: thought shields, telekinesis, consciousness, memory, and mental pressure.",
    "l1": [
      "Mind Shield",
      "Telekinetic Grasp",
      "Veil Sensitivity"
    ]
  },
  "Kinetic": {
    "label": "KINETIC",
    "theme": "The Master of Motion",
    "desc": "Force and movement: barriers, impacts, acceleration, precision, impossible speed, and concussive power.",
    "l1": [
      "Force Shield",
      "Kinetic Blast",
      "Tactical Overwatch"
    ]
  },
  "Void": {
    "label": "VOID",
    "theme": "The Threads of Probability",
    "desc": "Space, shadow, luck, displacement, probability, stealth, and impossible escapes.",
    "l1": [
      "Slipstream Jolt",
      "Temporal Cloak",
      "Vector Calculus"
    ]
  },
  "Lux": {
    "label": "LIGHT",
    "theme": "The Hope Frequency",
    "desc": "Hope and light as measurable force: shielding, illumination, revelation, guidance, photonic energy, and anti-Void work.",
    "l1": [
      "Blinding Flash",
      "Spark of Hope",
      "Wayfinder's Pulse"
    ]
  }
};
const DOMAIN_POWER_DATA = {
  "Tech": [
    {name:"Drone Whisper", domain:"Tech", level:1, rc:0, meta:"Spell · 1 Hope · RC 0", desc:"Control a Tier 1-2 mechanical unit within Close range."},
    {name:"Quantum Firewall", domain:"Tech", level:1, rc:1, meta:"Ability · 1 Hope · RC 1", desc:"Protect a device or network from intrusion for the scene/investigation."},
    {name:"System Jackknife", domain:"Tech", level:1, rc:0, meta:"Spell · 1 Hope · DC 10 · RC 0", desc:"Take short-term control of an electronic system within Close range."}
  ],
  "Synthesis": [
    {name:"Biological Scan", domain:"Synthesis", level:1, rc:0, meta:"Spell · 1 Hope · DC 12 · RC 0", desc:"Read a creature's HP, conditions, disease, toxins, or cybernetics."},
    {name:"Environmental Adaptation", domain:"Synthesis", level:1, rc:0, meta:"Ability · 1 Hope · RC 0", desc:"Adapt your body to survive a hostile environment for one hour."},
    {name:"Rapid Regeneration", domain:"Synthesis", level:1, rc:1, meta:"Ability · Reaction + 1 Hope · RC 1", desc:"Heal 1 HP now, then continue regenerating for 1d4 turns."}
  ],
  "Social": [
    {name:"Linguistic Patch", domain:"Social", level:1, rc:1, meta:"Ability · 1 Hope · RC 1", desc:"Understand and speak any language for one scene."},
    {name:"Perfect Facade", domain:"Social", level:1, rc:0, meta:"Spell · 1 Hope · RC 0", desc:"Create a convincing disguise matching someone you have observed."},
    {name:"Silver Tongue", domain:"Social", level:1, rc:0, meta:"Ability · 1 Hope · RC 0", desc:"Boost a Presence roll to persuade, deceive, or convince."}
  ],
  "Neural": [
    {name:"Mind Shield", domain:"Neural", level:1, rc:1, meta:"Ability · Reaction + 1 Stress · RC 1", desc:"Reduce psychic damage and resist mental effects."},
    {name:"Telekinetic Grasp", domain:"Neural", level:1, rc:1, meta:"Spell · DC 11 · RC 1", desc:"Manipulate or hurl an object at Far range with psychic force."},
    {name:"Veil Sensitivity", domain:"Neural", level:1, rc:0, meta:"Ability · 1 Hope · RC 0", desc:"Sense surface emotions and thoughts within Close range for a scene."}
  ],
  "Kinetic": [
    {name:"Force Shield", domain:"Kinetic", level:1, rc:1, meta:"Ability · Reaction + 1 Hope · RC 1", desc:"Raise Evasion against an incoming attack with a kinetic barrier."},
    {name:"Kinetic Blast", domain:"Kinetic", level:1, rc:0, meta:"Ability · 1 Hope · RC 0", desc:"Add Force damage to a melee attack, with optional Hope empowerment."},
    {name:"Tactical Overwatch", domain:"Kinetic", level:1, rc:0, meta:"Ability · Reaction + 1 Hope · RC 0", desc:"Help an ally defend and gain temporary Armor."}
  ],
  "Void": [
    {name:"Slipstream Jolt", domain:"Void", level:1, rc:1, meta:"Ability · 1 Stress · RC 1", desc:"Misalign a creature or system, imposing Disadvantage on its next Agility or Finesse roll."},
    {name:"Temporal Cloak", domain:"Void", level:1, rc:0, meta:"Ability · 1 Hope · RC 0", desc:"Make yourself or your vehicle nearly invisible for 10 minutes."},
    {name:"Vector Calculus", domain:"Void", level:1, rc:1, meta:"Ability · 1 Hope · RC 1", desc:"Boost an Agility or piloting roll using level and Hope die floor."}
  ],
  "Lux": [
    {name:"Blinding Flash", domain:"Lux", level:1, rc:0, meta:"Ability · Reaction + 1 Hope · DC 12 · RC 0", desc:"Dazzle enemies within Close range and potentially Daze them."},
    {name:"Spark of Hope", domain:"Lux", level:1, rc:0, meta:"Ability · 1 Hope · RC 0", desc:"Touch an ally within Close range; they clear 1 Stress."},
    {name:"Wayfinder's Pulse", domain:"Lux", level:1, rc:1, meta:"Ability · 1 Hope · RC 1", desc:"Reveal direction and distance to threats, exits, paths, or hidden valuables."}
  ]
};
