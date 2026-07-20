/* VeilFarers Full Sheet compatibility dataset.
   Verified against VeilFarers Corebook 11.1-RC3.2 PDF Candidate.
   Sleeping-path class/subclass details are preserved from the previous full-sheet compatibility layer where no newer structured collection exists; canonical core choices and equipment are refreshed from /rules-data.
*/
var VEILFARERS_DATA_VERSION = "Full Sheet Compatibility Layer · Corebook 11.1-RC3.2";

const TRAITS = [
  [
    "Agility",
    "Sprint · Leap · Maneuver"
  ],
  [
    "Strength",
    "Lift · Smash · Grapple"
  ],
  [
    "Finesse",
    "Control · Hide · Tinker · Pilot/Navigate"
  ],
  [
    "Knowledge",
    "Recall · Analyze · Tech · Medicine"
  ],
  [
    "Instinct",
    "Perceive · Sense · Navigate"
  ],
  [
    "Presence",
    "Charm · Perform · Deceive"
  ]
];

const esc = s => String(s == null ? "" : s).replace(/"/g,'&quot;');

const ANCESTRY_NOTES = {
  "Ailuran": "Achromatic Aura-Sight: Your eyes perceive thermal radiation and bio-electric fields rather than visible light. You see perfectly in total darkness out to Far range, reading the world as overlapping auras. You can detect living creatures behind thin barriers within Close range by thermal signature. You are completely colorblind: checks relying exclusively on color identification are at Disadvantage unless you use assistive tech. Creatures with no thermal output (some Synthetics, dormant Bloomstriders) appear as cold silhouettes.\n\nPerfect Equilibrium: Your digitigrade legs, prehensile tail, and predatory reflexes grant supernatural balance and climbing ability. You are immune to fall damage from medium heights (roughly two stories or less). You gain Advantage on all Agility rolls to balance, climb, or move silently across unstable or narrow surfaces. You can scale vertical surfaces with even minimal handholds without rolling, provided you are not in combat or under immediate time pressure.\n\nIrrepressible Curiosity: Discovery is a biological imperative for you, not a hobby. When hidden information exists that you could plausibly discover, the Keeper may invoke this Gift. You then face a choice: mark 1 Stress to resist the compulsion and walk away, or yield on your own terms and pursue the secret. If you yield and successfully uncover the hidden truth, the Keeper grants you 1 path resource: 1 Hope if you are Awakened, or 1 Effort if you are Sleeping.\n\nSub-Strains: Shroud-Strain · Static Cloak · Your chromatophore fur provides active camouflage. As long as you remain completely motionless — no movement, speech, or active equipment use — you are effectively invisible to both visual and thermal detection. Creatures attempting to detect you must succeed on an Instinct check against DC 15. The effect ends immediately if you move, speak, attack, or take any action; reassuming stillness requires spending a full turn doing nothing. This is biological camouflage, not technology — it cannot be jammed. | Surge-Strain · Kinetic Battery · Your metabolism can store and release kinetic energy in controlled bursts. Once per scene, mark 1 Stress to activate a Metabolic Burst: you move instantly to any point within Far range that you can see, ignoring difficult terrain and obstacles shorter than your height. This movement does not provoke reactions. Upon arriving, you gain Advantage on your next Agility or Finesse roll made before the end of your next turn. Observers see a blur of fur and feel a displacement of air.",
  "Bloomstrider": "Plant-like Body: Your body can survive in harsh environments, granting resistance to natural dangers including poisons, vacuum, extreme weather, radiation, and hunger. You can derive energy from light like a plant, and special organs filter toxins from your system. Gain Advantage on survival checks in hostile environments.\n\nNurturing Touch: You can use your healing sap to mend wounds. By touching another creature, you initiate a healing-over-time effect: the target heals 1 HP at the start of each of their turns for 1d4 turns. The healing requires several minutes of focused contact to begin and represents the gradual binding of flesh and bone by your luminous sap. Faint, root-like patterns appear on the healed skin, fading after a short time.",
  "Celestiari": "Stellar Meditation: An old meditative discipline lets you steady yourself in quiet light. Once per long rest, you may meditate for 10 minutes under starlight (or any light source) to clear 1 Stress and gain 2 path resources: 2 Hope if you are Awakened, or 2 Effort if you are Sleeping.\n\nCelestial Grace: Your stellar nature infuses your very being with cosmic power. Your unarmed attacks deal d6 magic damage instead of normal damage, as your touch carries the power of starfire. Once per session, when you deal damage that causes HP loss with this ability, you may heal the same amount of damage to any allies within Very Close range, sharing your celestial energy with those in need.",
  "Ethereal": "Phase Shift: Ethereals can step outside the normal flow of reality. You may mark 1 Stress to become incorporeal. You remain incorporeal as long as you continue to mark 1 Stress at the start of each of your turns. While incorporeal, you can pass through solid objects thinner than your body width and not protected by energy (energy fields, wards, force barriers block this ability). You are immune to physical attacks while incorporeal but cannot affect the physical world.\n\nTemporal Perception: Your existence spans multiple timelines, giving you glimpses of possible futures. You automatically sense temporal anomalies and distortions within Close range. Once per session, you may ask the Keeper about the most likely immediate consequence of a proposed action.",
  "Human": "Adaptive Spirit: Humanity's greatest asset is its refusal to stay down. Once per game session, when you fail an action roll, you may spend 2 Hope to gain Advantage on your next roll of the same type. The mechanic represents the human pattern of turning a failure into the lesson that drives the next attempt.\n\nCultural Bridge: Humans are found everywhere and have learned to read the motivations and customs of many other species. During a rest, you can mark 1 Stress to represent the mental effort of sorting through cultural knowledge. You may then ask the Keeper one question about a specific group's core motivations or most important customs. The Keeper answers truthfully.\n\nMade for the Graft: Augmentation is overwhelmingly human work, built by human engineers around human anatomy, and human physiology accepts grafted hardware with a readiness no other ancestry quite matches. You gain +2 Augment Capacity (Chapter 13). Where another ancestry leans on an innate gift, a human as often leans on a better arm.\n\nInheritance of the Builders: Human civilization built most of what the galaxy buys, flies, and grafts, and a human character starts play already holding a piece of that inheritance. Choose one at character creation: The Graft — one free Common (TT1) or Military (TT2) augmentation; a Common graft consumes no Augment Slot, a Military graft consumes 1 slot, and either has no drawback. The Tool — one Experimental (TT3), 9 Cr (WT3) item from any equipment catalogue in play.",
  "Kryllian": "Master Craftsman: The Kryllian mind is uniquely suited for building and repairing. When making any roll related to crafting or repairing a piece of technology, you may choose to mark 1 Stress to gain Advantage on the roll. This represents a flash of insight or a moment of intense focus.\n\nStructural Intuition: Kryllians see the weak points in any construction. Once per game session, you may mark 1 Stress to study a technological system or structure. You can then ask the Keeper about its single most significant structural or systemic weakness. The Keeper answers truthfully.",
  "Kryx": "Pack Intuition: Your bond with your companions allows you to sense threats to them before they fully manifest. When an ally within Very Close range is targeted by an attack, you may mark 1 Stress to gain Advantage on your next attack against that foe. This represents the surge of protective fury that fills you when your pack is threatened.\n\nBiolume Howl: Your natural weapons carry the power of your pack's collective strength. Your unarmed attacks deal d6 void damage instead of normal damage. Once per session, you may mark 1 Stress when making an unarmed attack to make your target Dazed (Disadvantage on their next roll) and gain 1 path resource (Hope if Awakened, Effort progress if Sleeping) as your pack bond strengthens through combat.",
  "Rift Spinner": "Chrono-Gift: Your connection to temporal energy allows you to manipulate the flow of time in small ways. Once per session, after any roll is made within Close range (including your own), you may spend 2 path resources (2 Hope if you are Awakened, or 2 Effort if you are Sleeping) to force a reroll. You can choose to use either result.\n\nWall Weaver: Your arachnid heritage allows you to move on any surface with perfect grace. You can move on vertical or inverted surfaces as if they were normal ground. While touching a surface, you can sense vibrations through it, gaining Advantage on Instinct Rolls to detect moving creatures within Close range that are also in contact with the surface.",
  "Synthetic": "Modular Consciousness: Your artificial mind can be temporarily boosted with new capabilities. Once per long rest, you can download a new skill or knowledge set. Choose any Trait; you can spend Hope to gain Advantage on rolls using that Trait until your next long rest.\n\nDigital Interface: Your synthetic nature allows you to directly interface with electronic systems and networks. You have Advantage on rolls to hack, operate, or understand technological devices. You can also communicate directly with other AIs and computer systems, bypassing normal user interfaces."
};

const COMMUNITY_NOTES = {
  "AgriSynth": "Nourished by Nature: Your sterile but life-focused upbringing gave you a unique understanding of biology. You have Advantage on Knowledge checks to stabilize creatures near death. You also have Advantage on Survival checks to find or purify food and water, but only in technologically-supported environments (stations, ships, settled worlds with infrastructure). On a wild planet without automation, your training does not translate cleanly.",
  "Core World": "Institutional Leverage: The Core Worlds run on bureaucracy and influence. When you are working those systems — getting a permit, accessing a restricted file, working a social event — you may roll your Duality Dice. On a success (10+), you gain 1 Favor Token. You can spend Favor Tokens to automatically succeed on similar institutional tasks later, no roll required. If you are a Diplomat, you begin each session with 1 extra Favor Token.",
  "Free Fleet": "Voidborn Kinship: You share a deep bond with your fellow travelers. When recalling information about stellar hazards or aiding allies from your fleet (defined as any crew you have traveled with for more than a tenday), you may reroll a single failed piloting check. Alternatively, you can let an ally in your system use your Hope die result as their own for one roll, transferring your moment of fortune into their hands.",
  "Frontier Colony": "Scrap-Savvy Ingenuity: You can improvise tools and simple devices from junk. When you do, roll your Fear die to determine the effect. On a low roll (1-3), the device works for one use, then breaks spectacularly. On a higher roll (4+), it works reliably for the scene. Once per long rest, you can reroll this Fear die if you sacrifice a personal item of sentimental value to the project — a memento welded into the chassis, a family ring sacrificed for its conductive metal.",
  "The Displaced Enclave": "Ghost Protocol: You were raised in a culture that elevated concealment to an art form. Once per session, you can declare that you have already prepared an escape route, hidden a cache of supplies, or established a fallback position in your current location, even if you did not explicitly state this earlier. The Keeper sets specifics (must be plausible). If your class is Scout or has reconnaissance training, the preparation includes one additional useful detail.",
  "Trade Hub": "Market Oracle: You know how to read the currents of trade. When negotiating prices or seeking information about goods, you can gamble resources on rumors. Roll Comprehend (DC 10). On a success, you gain a piece of true, actionable information and 1 Hope. On a Critical Success, you learn a secret that grants you Advantage on related rolls for 24 hours. On a failure, you have spent the resource on a bad rumor and gain nothing, but the Keeper may use the failed attempt as a story hook.",
  "Void Station": "Cross-Species Intuition: Your upbringing has made you adept at understanding different perspectives. You begin each session with 3 Linguistic Tokens. You can spend 1 token to reroll a Hope die on a negotiation check. You can spend 1 token to treat your Fear die as a Hope die for a single negotiation roll. You regain all spent tokens by mediating a faction dispute or after a long rest."
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
    "hopeTitle": "The Power of Suggestion (3 Hope)",
    "effortTitle": "THE PREPARED MIND (2 EFFORT)",
    "awClassFeature": "Cultural Lens",
    "slClassFeature": "STANDING REPUTATION",
    "starter": "Silver Tongue + Spark of Hope",
    "hopeText": "Spend 3 Hope: Plant an Idea (ally's next Presence/Knowledge/Finesse roll has Advantage), Create an Opening (ally's next attack or stealth roll has Advantage), or Gather Intelligence (Keeper gives you one secret Clue about the scene).",
    "effortText": "You can spend 2 Effort to choose one of three powerful effects. Where the Awakened Diplomat's Power of Suggestion runs on charisma and the universe's quiet cooperation, the Prepared Mind runs on the work you have already done before the scene began. - Cite the File. Declare you have read about this person, this house, this faction, or this situation in advance. The Keeper provides one true and useful fact about them, a vulnerability, a recent event, a relationship, a stated position, that you may not have learned yet but that fits what your character could reasonably have prepared. - Anticipated Move. When the next NPC in the scene takes a social or political action, you may declare that you anticipated it. You take a Reaction now, before the action resolves, to counter or complicate it, and you have Advantage on that Reaction; the Keeper sets its scope. Foresight sharpens the response; it does not guarantee it. - The Quiet Word. You speak privately to one NPC currently in the scene. Whatever you say, the NPC takes seriously, not necessarily favorably, but seriously. They consider it as a credible signal. Where this leads is between you, them, and the table. > INFLUENCE SCALES WITH THE ROLL. Success: those present, this scene. With Hope: it holds after you leave. Critical: it spreads beyond the room. With Fear: it turns on you.",
    "awClassText": "Advantage on all Social tests. Succeed on Persuasion or Deception to gain 1 Favor Token (max 4). Gain 1 Favor Token each long rest.",
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
    "hopeTitle": "Scrap Genius (3 Hope)",
    "effortTitle": "BRUTE-FORCE DIAGNOSTIC (2 EFFORT)",
    "awClassFeature": "Field Engineering",
    "slClassFeature": "LOGGED TOOLS",
    "starter": "System Jackknife + Rapid Regeneration",
    "hopeText": "Spend 3 Hope to create one functional improvised device from available materials. It works perfectly for one scene, then breaks. The Keeper cannot declare it fails during that scene.",
    "effortText": "You can spend 2 Effort to choose one of three effects. The Sleeping Engineer's signature is not inspiration but thoroughness. You have ruled out everything else; what remains is the answer. - Find the Failure. Spend 1 minute of in-fiction time examining a malfunctioning system. The Keeper tells you exactly what is wrong with it, in detail, including any concealed sabotage. (You still need parts, time, and tools to fix it.) - Never Rated For This. Push a machine past specification: it performs one tier above its grade for the scene, then breaks. You describe how it fails; the Keeper decides what the failure costs. - The Field Manual. You produce, from memory, a procedure for handling a specific technical situation, the procedure is one your character has practiced or read, not improvised. The Keeper grants advantage on the next four rolls related to executing it, by you or by an ally you instruct.",
    "awClassText": "Once per short rest, repair any technology without tools using what's on hand. Mark 1 Stress; the repair holds for the scene. Advantage on rolls to sabotage or interface with technology.",
    "slClassText": "Sleeping Engineers do not jury-rig from cosmic confidence; they jury-rig from kit. You maintain, at all times, a Logged Inventory, a private list of three components, parts, or improvised tools that you have salvaged or pre-assembled. At any time, you may declare that you have one of those items on hand and apply it to a problem. The Keeper may rule that the Inventory needs to be restocked between missions; this is its own downtime activity."
  },
  "Explorer": {
    "domains": "Synthesis & Lux",
    "trait": "Instinct",
    "sleepingTrait": "Instinct",
    "evasion": 11,
    "hp": 6,
    "awakenedItems": "Advanced Survival Kit · Encrypted Star Chart (1 free Intel Token per exploration)",
    "sleepingItems": "Survey Instruments · Personal Logbook (every entry by hand)",
    "hopeTitle": "Pathfinder's Insight (3 Hope)",
    "effortTitle": "METHODICAL RECONNAISSANCE (2 EFFORT)",
    "awClassFeature": "Terrain Mastery",
    "slClassFeature": "THE LOGBOOK",
    "starter": "Environmental Adaptation + Wayfinder's Pulse",
    "hopeText": "When making a Travel or Scan roll during a Void Crawl, spend 3 Hope to automatically find a safe route. You also discover one piece of hidden information about the destination.",
    "effortText": "You spend 2 Effort to choose one: - The Margin Note. Declare one physical feature of your surroundings that your logbook recorded: a culvert, a ledge, a hatch the deck plans forgot. It is there. The Keeper may attach one complication, and no note rewrites a scene's premise. - The Trail. Examine ground or wreckage. The Keeper tells you who came through, in what numbers, in what direction, and approximately when. Sleeping Explorers track by sign, not by sense. - The Charted Route. Declare that you have, in your logbook, a route through a difficult environment. The route is real and useful, though the Keeper may add complications appropriate to the difficulty.",
    "awClassText": "You cannot be surprised in wilderness or unexplored environments. Advantage on all rolls to track, navigate, or survive in the field. Once per long rest, identify any substance, creature, or phenomenon you can observe.",
    "slClassText": "You maintain a personal Logbook of every place your character has been. Entries are handwritten, dated, and detailed. Once per session, when arriving in a location your character has previously logged, you may consult the Logbook for one specific recalled detail, a name, a hidden passage, a former contact's address. The detail is correct as of the time of the log entry."
  },
  "Mystic": {
    "domains": "Neural & Lux & Void",
    "trait": "Instinct",
    "sleepingTrait": "Knowledge (rather than Instinct, as for Awakened Mystics, the Sleeping Mystic studies what the Awakened Mystic feels)",
    "evasion": 10,
    "hp": 6,
    "awakenedItems": "Whispering Veil-Crystal · Starlight Blindfold",
    "sleepingItems": "Veil-Crystal Recorder (takes readings the user cannot directly perceive) · Bound Notebook of Annotations",
    "hopeTitle": "Reality Unfold (3 Hope)",
    "effortTitle": "THE STUDIED WORKING (2 EFFORT)",
    "awClassFeature": "Veil Alignment (Lux or Void)",
    "slClassFeature": "PROCEDURAL VEIL- WORK",
    "starter": "Veil Sensitivity + one Lux or Void Level 1 Power",
    "hopeText": "Spend 3 Hope to briefly pierce the substrate: ask the Keeper one question about the true nature of a person, object, or location in the scene. The Keeper answers with the deepest truth accessible.",
    "effortText": "You can spend 2 Effort to choose one effect. The Sleeping Mystic does not bend reality directly; they invoke a procedure, a method, learned from study, that produces a Veil-aligned effect through technique rather than communion. - The Calibrated Ritual. Spend 10 minutes performing a documented procedure. The Keeper resolves the desired Veil-aligned effect (a small reality-shift, a glimpse, a temporary stabilization) at the cost of some pre-known component or concession listed in your notebook. - The Reading. You take a Veil reading of a person, place, or object. The Keeper provides one truthful piece of information about its Veil exposure, history, or alignment. You did not perceive this; your instruments did. - The Procedure of Refusal. Once per scene, you may declare that an Awakened character's invocation of Hope-fueled Veil power is interfered with by your presence. They lose 1 Hope without effect, and the substrate-feel of the room is briefly muted. (This applies to enemy spellcasters as well as allies; the procedure does not discriminate. Ally Awakened characters may consent in advance to be excluded.)",
    "awClassText": "Choose at creation. Lux Mystics gain Advantage on rolls involving light, clarity, revelation, healing substrate. Void Mystics gain Advantage on rolls involving shadow, entropy, erasure, substrate disruption.",
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
    "hopeTitle": "Veil Surge (3 Hope)",
    "effortTitle": "STICK TIME (2 EFFORT)",
    "awClassFeature": "Neural Interface",
    "slClassFeature": "THE SHIP KNOWS YOU",
    "starter": "Vector Calculus + System Jackknife",
    "hopeText": "Spend 3 Hope to gain Advantage on all ship maneuver rolls for the next hour. During this time, your ship cannot be targeted by standard weapon locks — only specialized systems can track you.",
    "effortText": "You can spend 2 Effort to choose one effect: - Hands on the Stick. You have flown this lane, this approach, this maneuver before, and the ship is an extension of you. Choose one as you act: ignore one environmental penalty on your next piloting maneuver (a storm, a debris field, a failing instrument), or turn a Failure with Fear on a piloting roll into an ordinary Failure, riding out the slip instead of crashing on it. Nobody flies this hull the way you do. - The Read. Spend 1 minute studying a vessel, friendly or hostile, at standard Engagement range. The Keeper tells you its likely behavior over the next round, including any move it is about to make. - The Veteran's Burst. During a starship combat, declare that you and the ship execute a maneuver from your cumulative experience together. Gain advantage on the next maneuver roll, and the ship clears 1 Hull Stress.",
    "awClassText": "Pilot any vehicle or vessel without penalty, regardless of make or origin. Once per session, declare you know a hidden route — a shortcut, a smuggler's lane — that no one else knows.",
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
    "hopeTitle": "Eureka Moment (3 Hope)",
    "effortTitle": "APPLIED SCIENCE (2 EFFORT)",
    "awClassFeature": "Academic Edge",
    "slClassFeature": "THE OPEN QUESTION",
    "starter": "Quantum Firewall + Silver Tongue",
    "hopeText": "Spend 3 Hope to automatically succeed on one research or analysis test. You also uncover a hidden connection — the Keeper provides one piece of unexpected information that reframes the situation.",
    "effortText": "You spend 2 Effort to choose one effect: - The Countdown. Facing a process in motion (a poison, an overload, a collapse), state how much time truly remains and what speeds or slows it. The Keeper adopts your numbers; the table now plays against that clock. - The Improvised Reaction. From materials in the scene, produce one immediate chemical effect: smoke, corrosion, adhesive, flash. One use, scene-length, never a weapon of war. - The Lost Source. Declare that you have located, through patient archival work, a source on a topic everyone else thought was lost. The Keeper helps you decide what it says, with an emphasis on partial and complicating, rather than total and clarifying, revelations.",
    "awClassText": "Once per scene, when you succeed on a Knowledge roll, ask the Keeper one additional question about the subject. Advantage on all rolls to recall historical, scientific, or cultural information.",
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
    "hopeTitle": "Vanishing Act (3 Hope)",
    "effortTitle": "HANDS THAT KNOW (2 EFFORT)",
    "awClassFeature": "Shadow Step",
    "slClassFeature": "THE QUIET NETWORK",
    "starter": "Perfect Facade + Temporal Cloak",
    "hopeText": "Spend 3 Hope to disappear from sight and sound for 1 minute. Immune to all tracking (visual, audio, thermal, network, psionic). Reappear wherever you choose within the scene.",
    "effortText": "You spend 2 Effort to choose one effect: - Cased the Joint. Declare that you, or a previous version of yourself, has worked a job like this before. Name the target of a theft, a lock, or a mark; the Keeper tells you one concrete weakness, the guard's rhythm, the make of the lock, where the camera does not reach. You do not steal it for free, but you go in prepared: you have Advantage on the roll to pull the job, and the take is cleaner for knowing the way in. - The False Face. Adopt one of your established alternate identities. NPCs who do not specifically know you under your true name accept the alternate identity for the duration of the scene. - The Backup Plan. Declare that you anticipated this exact failure. You produce a contingency item, ally, or piece of information that cleanly resolves the immediate problem. Once per scene.",
    "awClassText": "Once per encounter, move through difficult terrain or past an obstacle without a roll. Advantage on all rolls to pick locks, bypass security, or blend into crowds.",
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
    "hopeTitle": "Combat Surge (2 Hope)",
    "effortTitle": "THE HELD LINE (1 EFFORT)",
    "awClassFeature": "Tactical Presence",
    "slClassFeature": "THE DRILL",
    "starter": "Kinetic Blast + Rapid Regeneration",
    "hopeText": "After you hit with an attack, spend 2 Hope to immediately make a second attack against the same or a different target. You may also move up to Close range as part of this action.",
    "effortText": "Spend 1 Effort after you successfully hit with an attack to deal an additional 1d6 damage. The Soldier uses Effort in small, constant, reliable increments.",
    "awClassText": "Allies within Close range gain +1 to attack rolls. Once per encounter, issue a tactical command as a free action: the chosen ally may immediately take a move action out of turn.",
    "slClassText": "You know all four Common Drills and unlock one subclass Drill at Foundation, Specialization, and Mastery. At the beginning of each session, prepare four. Action and Reaction Drills are usable once per scene; Passive Drills remain active while prepared."
  },
  "Vanguard": {
    "domains": "Neural & Void & Kinetic & Lux",
    "trait": "Presence",
    "sleepingTrait": "Presence",
    "evasion": 11,
    "hp": 6,
    "awakenedItems": "Light Staff (Melee) · Meditation Orb · Spiced Tea Mix",
    "sleepingItems": "Light Staff (Melee) · Meditation Orb (unilluminated; the Sleeping Vanguard's orb does not glow) · Spiced Tea Mix",
    "hopeTitle": "Path to Nirvana (3 Hope)",
    "effortTitle": "THE REFUSED PATH (2 EFFORT)",
    "awClassFeature": "Mind Over Matter",
    "slClassFeature": "UNBROKEN FOCUS",
    "starter": "Veil Sensitivity + one branch Level 1 Power",
    "hopeText": "Spend 3 Hope to project a psychic burst: all enemies within Close range must succeed on an Instinct check (DC = your Presence + 10) or be briefly stunned — no actions on their next turn.",
    "effortText": "Spend 2 Effort to enter the Disciplined State for rounds equal to Proficiency + Presence. Choose Agility, Instinct, or Strength: gain Advantage with it and add its modifier to Melee and unarmed damage. You are immune to Stunned and Dazed, your first Melee hit deals +2d6 branch damage, and subsequent Melee attacks after the first each round have Disadvantage while at least two enemies are in Melee.",
    "awClassText": "Once per scene, reduce incoming damage to you by your Presence modifier (min 1) through force of will. Advantage on rolls to resist mental influence, fear, and substrate-based attacks.",
    "slClassText": "Trained Body: choose Strength or Agility for unarmed strikes; they deal d6 physical damage, increasing to d8 at Level 5 and d10 at Level 8. Unbroken Focus: +1 Evasion without Heavy or Very Heavy armor; once per scene spend 1 Effort to prevent Stress without using your Action. The Refusal: once per scene spend 1 Effort to impose Disadvantage on a Domain/Veil attack or Spellcast Roll, or grant Advantage on an allowed Reaction Roll."
  }
};

/* RC3.2 class corrections verified against the Corebook PDF candidate. */
const RC3_CLASS_OVERRIDES = {
  "Diplomat": {
    "domains": "Social & Lux",
    "trait": "Presence",
    "evasion": 10,
    "hp": 6,
    "awakenedItems": "Encrypted Datapad · Treasured Token",
    "hopeTitle": "The Power of Suggestion (3 Hope)",
    "hopeText": "Spend 3 Hope to choose one: Plant an Idea (the next Presence, Knowledge, or Finesse roll made by an ally has Advantage); Create an Opening (the next attack or Finesse roll made by an ally to sneak or hide has Advantage); or Gather Intelligence (gain a secret Clue from the Keeper relevant to the current scene).",
    "awClassFeature": "Cultural Lens",
    "awClassText": "You have Advantage on all Social tests. Begin each session with 2 Favor Tokens and hold a maximum of 4. Gain 1 Favor Token when you succeed on a Persuasion or Deception roll and 1 during every long rest. Spend Favor Tokens through subclass abilities, faction contacts, institutional tasks, or 5 at once to raise Reputation with one faction by 1 RP. Protocol: you know the correct form for cultures in common knowledge; for isolated or unknown cultures, roll Knowledge to read their norms."
  },
  "Engineer": {
    "domains": "Tech & Synthesis",
    "trait": "Knowledge",
    "evasion": 9,
    "hp": 7,
    "awakenedItems": "Alien-etched Multi-Tool · Universal Lubricant",
    "hopeTitle": "Scrap Genius (3 Hope)",
    "hopeText": "Spend 3 Hope to create one temporary device with a single plausible function. It works flawlessly for one scene, then disassembles itself or burns out beyond use. The Keeper has final say on what is plausible.",
    "awClassFeature": "Technical Intuition",
    "awClassText": "You have Advantage on all repair and diagnosis tests. Once per session, when a system fails, spend 1 Stress to improvise a perfect fix. The fix lasts until your next long rest."
  },
  "Explorer": {
    "domains": "Synthesis & Lux",
    "trait": "Instinct",
    "evasion": 11,
    "hp": 6,
    "awakenedItems": "Advanced Survival Kit · Encrypted Star Chart (start each exploration journey with one free Intel Token related to your general destination)",
    "hopeTitle": "Pathfinder's Insight (3 Hope)",
    "hopeText": "When making a Travel or Scan the Area roll during a Void Crawl, spend 3 Hope to roll 1 Fear die and 2 Hope dice. Choose which Hope die you keep, then resolve the roll normally.",
    "awClassFeature": "Foremost Survivor",
    "awClassText": "You have Advantage on all Survival tests. Once per session, spend 1 Stress to gain temporary immunity to an environmental hazard for the scene. Once per Exploration Turn, spend 1 Stress to prevent one segment from being ticked on the Supplies Running Low or Attention Drawn clock."
  },
  "Mystic": {
    "domains": "Neural & Lux or Void",
    "trait": "Instinct",
    "sleepingTrait": "Knowledge",
    "evasion": 10,
    "hp": 6,
    "awakenedItems": "Whispering Veil-Crystal · Starlight Blindfold",
    "hopeTitle": "Reality Unfold (3 Hope)",
    "hopeText": "Spend 3 Hope to roll with Advantage on all rolls. The effect lasts until you roll with Fear. When it ends, take 1d4 Stress.",
    "awClassFeature": "Psychic Resonance & Veil Alignment",
    "awClassText": "Psychic Resonance: once per round, when you roll for a Mystic feature, reroll one die; if the new result is lower, gain 1 Stress. Veil Alignment: choose Lux or Void at creation as your second Domain. You may only equip Powers from that alignment. At Levels 2, 5, and 8, you may switch alignment during level-up; cards from the previous alignment become dormant until you realign.",
    "effortTitle": "THE READING (2 EFFORT)",
    "effortText": "Spend 2 Effort and study a person, place, object, active Power, or Veil phenomenon with instruments and notes. Ask one question about its Veil exposure, Domain signature, history, instability, likely behavior, or the procedure required to interact with it. The Keeper answers truthfully with the deepest information your current evidence can support.",
    "slClassFeature": "UNCANNY ARCHIVE",
    "slClassText": "Your Archive records complete procedural patterns rather than prepared Powers. It has no Loadout and no Vault. At creation, choose two different Domains and unlock Level 1 in both. Every Power in an unlocked Domain Path is available through Uncanny Power, subject to its access roll. New Domain Paths are unlocked through Study Projects during Long Rests; higher-level study requires breadth at the previous level."
  },
  "Pilot": {
    "domains": "Void & Tech",
    "trait": "Instinct",
    "evasion": 11,
    "hp": 6,
    "awakenedItems": "Frayed Star Chart · Veil-Energy Control Crystal",
    "hopeTitle": "Veil Surge (3 Hope)",
    "hopeText": "Spend 3 Hope to gain Advantage on all piloting tests. You also ignore one instance of Severe Damage to your ship until your next rest.",
    "awClassFeature": "Stellar Instinct",
    "awClassText": "You have Advantage on all piloting and navigation tests. Once per session, reroll one failed Void-related test. If you spend Hope on a Finesse (Pilot/Navigate) Roll, add an additional +1d8 to the result."
  },
  "Scholar": {
    "domains": "Tech & Social",
    "trait": "Knowledge",
    "evasion": 10,
    "hp": 5,
    "awakenedItems": "Cracked Data-Slate · Vial of Alien Sample",
    "hopeTitle": "Eureka Moment (3 Hope)",
    "hopeText": "Spend 3 Hope to automatically succeed on one research or analysis test. You also uncover a hidden connection related to your research; the Keeper provides one piece of information that links your current work to something larger in the campaign.",
    "awClassFeature": "Pattern Weaver",
    "awClassText": "You have Advantage on all Knowledge analysis tests. Once per session, spend 1 Stress to consult your mental archive; the Keeper reveals one hidden truth or key vulnerability relevant to the current scene. During a long rest, you may work on a research project, making Knowledge rolls against its complexity to gain substantial benefits when completed.",
    "slClassText": "You maintain, throughout the campaign, an Open Question, a research project of your own design. The Question is recorded in your notes and on the Keeper tracking sheet. Every Long Rest, you may make a Knowledge roll (DC 15) to advance your research. On success, gain one new piece of information; on Critical Success, the Keeper provides a substantive lead. Completing the Question is a major life event and grants a permanent campaign-wide advancement agreed with the Keeper."
  },
  "Scoundrel": {
    "domains": "Social & Void",
    "trait": "Finesse",
    "evasion": 12,
    "hp": 6,
    "awakenedItems": "Morphic Skeleton Key · Influential Holo-Mask",
    "hopeTitle": "Vanishing Act (3 Hope)",
    "hopeText": "Spend 3 Hope to disappear from sight and sound for 1 minute. During this time, you are immune to all forms of tracking: visual, audio, thermal, network, and psionic.",
    "awClassFeature": "Shadow Operative",
    "awClassText": "You have Advantage on all Stealth tests and may reroll one failed Evasion roll. When you have Advantage on an attack, deal an extra +1d6 damage as Sneak Attack; this increases to +2d6 at Tier 2 and +3d6 at Tier 3."
  },
  "Soldier": {
    "domains": "Kinetic & Synthesis",
    "trait": "Strength",
    "evasion": 9,
    "hp": 7,
    "awakenedItems": "Dented Riot Shield · Fallen Comrade's Dog-tag",
    "hopeTitle": "Combat Surge (2 Hope)",
    "hopeText": "After you hit with an attack, spend 2 Hope to deal an additional 1d6 damage.",
    "awClassFeature": "Combat Focus",
    "awClassText": "Use a d4 Focus die, starting at 1. While in a Focus state, you may reroll one weapon damage die per attack; add the Focus die to damage or an attack roll; or give Advantage to one ally action or +2 Evasion, losing the spotlight to that ally."
  },
  "Vanguard": {
    "domains": "Neural & branch (Void / Kinetic / Lux)",
    "trait": "Presence",
    "evasion": 11,
    "hp": 6,
    "awakenedItems": "Light Staff (Melee) · Meditation Orb · Spiced Tea Mix",
    "hopeTitle": "Path to Nirvana (3 Hope)",
    "hopeText": "Spend 3 Hope to enter the Nirvana State for rounds equal to your Proficiency. Choose Agility, Instinct, or Strength and gain Advantage on rolls using it. You are immune to Stunned and Dazed. Your first Melee attack against an enemy in this state deals an additional 2d6 Void damage.",
    "awClassFeature": "Unbroken Focus",
    "awClassText": "While not wearing Heavy or Very Heavy armor, gain +1 Evasion. Unarmed attacks and attacks with Lightweight Melee weapons count as possessing the Energy Tag (Void damage). Once per turn, spend 1 Stress to ignore negative modifiers to Evasion for 1 round."
  }
};
Object.entries(RC3_CLASS_OVERRIDES).forEach(([name, patch]) => { if (CLASS_DATA[name]) Object.assign(CLASS_DATA[name], patch); });

const SUBCLASS_DATA = {
  "awakened": {
    "Diplomat": [
      {
        "name": "Cultural Attaché",
        "trait": "Presence",
        "tiers": [
          {
            "tier": "Foundation",
            "name": "The Unmasking Gaze · Action",
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
            "name": "Control the Narrative · Action",
            "text": "Make a Presence check (DC 15) to perform or report; on success, gain 1 Favor Token."
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
            "name": "Web of Favors · Passive",
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
            "name": "Digital Ghost · Action",
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
            "name": "Adaptive Interface · Action",
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
            "name": "Field Surgery · Action",
            "text": "Mark 1 Stress to perform emergency medical aid. You can either heal a target for 2 HP plus 1 HP for 1d4 rounds, *or* stabilize a dying creature, *or* remove a level of Degradation from an augmentation."
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
            "name": "Cosmic Cartography · Passive",
            "text": "You have Advantage on long-distance Piloting and astrogation rolls. You also have Advantage on *Chart a Safe Route* during a Void Crawl."
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
            "name": "Naturalist's Eye · Passive",
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
            "name": "Mark Quarry · Action",
            "text": "As an action, mark a single target. Until your next long rest, you have Advantage on Instinct rolls to track them, and your first successful attack each round against the marked quarry deals an extra **1d6 damage**."
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
            "name": "Phase Step · Reaction",
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
            "name": "Thought Tide · Action",
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
            "name": "Ancient Echo · Action",
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
            "name": "Pathfinder's Sense · Action",
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
            "name": "Tactical Grace · Reaction",
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
            "name": "Orbital Whisperer · Action",
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
            "name": "Life Reader · Action",
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
            "name": "Artifact Whisper · Action",
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
            "name": "Data Storm · Reaction",
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
            "name": "Deadly Masquerade · Action",
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
            "name": "Ghost · Action",
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
            "name": "Hidden Cargo · Action",
            "text": "Spend 1 Stress to declare you have a small, useful, or contraband item secreted on your person or ship that you have not previously mentioned. The Keeper has final say on what is plausible. Once per session, you can spend 1 Hope to upgrade this declaration to a Tier 1 piece of gear or a small quantity of valuable contraband."
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
            "name": "Bodyguard Protocol · Reaction",
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
            "name": "Call the Shot · Action",
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
            "name": "Unspoken Authority · Action",
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
            "name": "Perfect Deflection · Reaction",
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
            "name": "Precog Dodge · Reaction",
            "text": "Spend 1 Hope when targeted by an attack. You force the attacker to **reroll the attack roll** (the Keeper must accept the new result)."
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
            "name": "Force Projection · Action",
            "text": "Spend 1 Stress. Choose one: push one object or creature up to Far Range, *or* create a wall of force that provides cover until your next turn, *or* deal 1d6 Kinetic damage to everything in Close Range (no effect on creatures)."
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
  "Assault Rifle": {
    "tier": "Common",
    "trait": "Strength · Close",
    "dmg": "d8+1 phys.",
    "feat": "Automatic",
    "cost": "4"
  },
  "Beam Cannon": {
    "tier": "Common",
    "trait": "Knowledge · Far",
    "dmg": "d6+3 ene.",
    "feat": "Continuous",
    "cost": "4"
  },
  "Combat Knife": {
    "tier": "Common",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Paired",
    "cost": "1"
  },
  "Energy Dagger": {
    "tier": "Common",
    "trait": "Agility · Melee",
    "dmg": "d6+1 ene.",
    "feat": "Lightweight, Energy Tag",
    "cost": "1"
  },
  "Flechette Pistol": {
    "tier": "Common",
    "trait": "Finesse · Close",
    "dmg": "d6+1 phys.",
    "feat": "Armor Piercing",
    "cost": "1"
  },
  "Gauss Rifle": {
    "tier": "Common",
    "trait": "Agility · Far",
    "dmg": "d6+1 phys.",
    "feat": "Armor Piercing",
    "cost": "4"
  },
  "Holdout Blaster": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d6+1 ene.",
    "feat": "Concealable",
    "cost": "1"
  },
  "Machine Gun": {
    "tier": "Common",
    "trait": "Strength · Far",
    "dmg": "d6+3 phys.",
    "feat": "Automatic",
    "cost": "4"
  },
  "Mono-Blade": {
    "tier": "Common",
    "trait": "Finesse · Melee",
    "dmg": "d8 phys.",
    "feat": "Armor Piercing, Paired+2",
    "cost": "4"
  },
  "Needle Gun": {
    "tier": "Common",
    "trait": "Finesse · Close",
    "dmg": "d6+1 phys.",
    "feat": "Poison",
    "cost": "1"
  },
  "Net Launcher": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "n/a",
    "feat": "Entangling, Reload",
    "cost": "4"
  },
  "Plasma Cannon": {
    "tier": "Common",
    "trait": "Instinct · Close",
    "dmg": "d10+3 ene.",
    "feat": "Overheating",
    "cost": "4"
  },
  "Plasma Cutter": {
    "tier": "Common",
    "trait": "Agility · Melee",
    "dmg": "d8 ene.",
    "feat": "Cutting, Paired+2",
    "cost": "4"
  },
  "Plasma Pistol": {
    "tier": "Common",
    "trait": "Instinct · Close",
    "dmg": "d8 ene.",
    "feat": "Overheating",
    "cost": "4"
  },
  "Plasma Rifle": {
    "tier": "Common",
    "trait": "Instinct · Close",
    "dmg": "d8 ene.",
    "feat": "Overheating",
    "cost": "4"
  },
  "Pulse Rifle": {
    "tier": "Common",
    "trait": "Strength · Close",
    "dmg": "d8+1 ene.",
    "feat": "Burst Fire",
    "cost": "4"
  },
  "Railgun": {
    "tier": "Common",
    "trait": "Strength · Far",
    "dmg": "d8+3 phys.",
    "feat": "Massive",
    "cost": "4"
  },
  "Rocket Launcher": {
    "tier": "Common",
    "trait": "Agility · Far",
    "dmg": "d10+3 phys.",
    "feat": "Explosive",
    "cost": "4"
  },
  "Shock Baton": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d6+1 phys.",
    "feat": "Stunning, Paired+1",
    "cost": "1"
  },
  "Slug Pistol": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d8+1 phys.",
    "feat": "Reliable",
    "cost": "1"
  },
  "Sniper Rifle": {
    "tier": "Common",
    "trait": "Finesse · Far",
    "dmg": "d8+1 phys.",
    "feat": "Accurate",
    "cost": "4"
  },
  "Taser Pistol": {
    "tier": "Common",
    "trait": "Finesse · Close",
    "dmg": "1d4 Stress",
    "feat": "Taser Charge",
    "cost": "1"
  },
  "Battle Rifle": {
    "tier": "Military",
    "trait": "Strength · Close",
    "dmg": "d10+3 phys.",
    "feat": "Powerful",
    "cost": "4"
  },
  "Chainglaive": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d10+3 phys.",
    "feat": "Automatic, Cleave",
    "cost": "9"
  },
  "Combat Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8+3 phys.",
    "feat": "Quick",
    "cost": "1"
  },
  "Concussion Grenade (×3)": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "1d6 Stress",
    "feat": "Explosive, Stunning, Area",
    "cost": "1"
  },
  "Disruptor Pistol": {
    "tier": "Military",
    "trait": "Knowledge · Close",
    "dmg": "d8+3 ene.",
    "feat": "Shield Piercing",
    "cost": "4"
  },
  "Electro-Whip": {
    "tier": "Military",
    "trait": "Agility · Melee",
    "dmg": "d6+3 ene.",
    "feat": "Reach 2m, Stunning on crit",
    "cost": "4"
  },
  "Flamethrower": {
    "tier": "Military",
    "trait": "Strength · Close",
    "dmg": "d8 ene.",
    "feat": "Continuous, Ignite",
    "cost": "9"
  },
  "Frag Grenade (×3)": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8+1 phys.",
    "feat": "Explosive",
    "cost": "1"
  },
  "Fusion Cannon": {
    "tier": "Military",
    "trait": "Instinct · Close",
    "dmg": "d10+6 ene.",
    "feat": "Devastating",
    "cost": "9"
  },
  "Gauss Pistol": {
    "tier": "Military",
    "trait": "Finesse · Close",
    "dmg": "d8+3 phys.",
    "feat": "Silent",
    "cost": "4"
  },
  "Gravity Hammer": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d10+3 phys.",
    "feat": "Stagger",
    "cost": "4"
  },
  "Grenade Launcher": {
    "tier": "Military",
    "trait": "Strength · Far",
    "dmg": "(as ammo)",
    "feat": "Arcing Shot, Explosive",
    "cost": "9"
  },
  "Heavy Machine Gun": {
    "tier": "Military",
    "trait": "Strength · Far",
    "dmg": "d6+6 phys.",
    "feat": "Suppressive",
    "cost": "4"
  },
  "Magnetic Accelerator": {
    "tier": "Military",
    "trait": "Finesse · Very Far",
    "dmg": "d6+6 phys.",
    "feat": "Armor Piercing (2)",
    "cost": "4"
  },
  "Mass Driver Rifle": {
    "tier": "Military",
    "trait": "Strength · Far",
    "dmg": "d8+3 phys.",
    "feat": "Massive",
    "cost": "9"
  },
  "Plasma Carbine": {
    "tier": "Military",
    "trait": "Instinct · Close",
    "dmg": "d8+3 ene.",
    "feat": "Stable",
    "cost": "9"
  },
  "Plasma Rapier": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d8+3 ene.",
    "feat": "Piercing, Overheating",
    "cost": "9"
  },
  "Plasma Sidearm": {
    "tier": "Military",
    "trait": "Instinct · Close",
    "dmg": "d8+3 ene.",
    "feat": "Reliable",
    "cost": "4"
  },
  "Resonance Disperser": {
    "tier": "Military",
    "trait": "Knowledge · Close",
    "dmg": "1d8 Stress",
    "feat": "Dispersal Wave, Disorienting",
    "cost": "9"
  },
  "Shrapnel Cannon": {
    "tier": "Military",
    "trait": "Strength · Close",
    "dmg": "d10 phys.",
    "feat": "Massive, Shredding",
    "cost": "4"
  },
  "Smart Launcher": {
    "tier": "Military",
    "trait": "Knowledge · Far",
    "dmg": "d10+6 phys.",
    "feat": "Guided",
    "cost": "9"
  },
  "Sniper System": {
    "tier": "Military",
    "trait": "Finesse · Very Far",
    "dmg": "d8+3 phys.",
    "feat": "Smart Scope",
    "cost": "9"
  },
  "Stasis Foam Projector": {
    "tier": "Military",
    "trait": "Strength · Close",
    "dmg": "n/a",
    "feat": "Entrapping, Messy",
    "cost": "4"
  },
  "Suppression Rifle": {
    "tier": "Military",
    "trait": "Strength · Far",
    "dmg": "d6+3 phys.",
    "feat": "Suppressive",
    "cost": "9"
  },
  "Tangle-Field Grenade (×3)": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "1d4 Stress",
    "feat": "Explosive, Entangling",
    "cost": "1"
  },
  "Vibro-Sword": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d8+3 phys.",
    "feat": "Vibration",
    "cost": "4"
  },
  "Barrier Emitter": {
    "tier": "Experimental",
    "trait": "Knowledge · Far",
    "dmg": "n/a",
    "feat": "Deployable Cover",
    "cost": "9"
  },
  "Cryo-Projector": {
    "tier": "Experimental",
    "trait": "Knowledge · Close",
    "dmg": "d6 ene.",
    "feat": "Continuous, Brittle",
    "cost": "9"
  },
  "Gravity Well Emitter": {
    "tier": "Experimental",
    "trait": "Knowledge · Far",
    "dmg": "n/a",
    "feat": "Singularity",
    "cost": "16"
  },
  "Micro-Missile Launcher": {
    "tier": "Experimental",
    "trait": "Knowledge · Far",
    "dmg": "d10+3 phys.",
    "feat": "Guided, Salvo Fire",
    "cost": "16"
  },
  "Nanite Gauntlet": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d8+6 phys.",
    "feat": "Adaptive",
    "cost": "9"
  },
  "Neural Scrambler": {
    "tier": "Experimental",
    "trait": "Finesse · Close",
    "dmg": "1d10 Stress",
    "feat": "Mind-Lock, Psionic",
    "cost": "16"
  },
  "Phase Blade": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d8+6 void",
    "feat": "Phasing",
    "cost": "9"
  },
  "Phase Pistol": {
    "tier": "Experimental",
    "trait": "Knowledge · Close",
    "dmg": "d8+6 void",
    "feat": "Phasing",
    "cost": "9"
  },
  "Plasma-Infused Katana": {
    "tier": "Experimental",
    "trait": "Agility · Melee",
    "dmg": "d8+6 ene.",
    "feat": "Energy Surge",
    "cost": "9"
  },
  "Quantum Rapier": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d6+6 void",
    "feat": "Probability Shift",
    "cost": "9"
  },
  "Quantum Sidearm": {
    "tier": "Experimental",
    "trait": "Instinct · Close",
    "dmg": "d6+6 void",
    "feat": "Probability Shift",
    "cost": "9"
  },
  "Sonic Cannon": {
    "tier": "Experimental",
    "trait": "Knowledge · Far",
    "dmg": "1d8 Stress",
    "feat": "Waveform, Stagger",
    "cost": "16"
  },
  "Static Pulse Grenade (×2)": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "d8+3 ene.",
    "feat": "Explosive, System Shock",
    "cost": "4"
  },
  "Veil Pistol": {
    "tier": "Experimental",
    "trait": "Presence · Close",
    "dmg": "d8+6 void",
    "feat": "Reality Shift",
    "cost": "9"
  },
  "Void Cleaver": {
    "tier": "Experimental",
    "trait": "Strength · Melee",
    "dmg": "d10+6 void",
    "feat": "Disintegrating",
    "cost": "9"
  },
  "Void Grenade (×1)": {
    "tier": "Experimental",
    "trait": "Presence · Close",
    "dmg": "d10+3 void",
    "feat": "Explosive, Unraveling",
    "cost": "3"
  },
  "Void Pistol": {
    "tier": "Experimental",
    "trait": "Presence · Close",
    "dmg": "d6+6 void",
    "feat": "Disintegrating",
    "cost": "9"
  },
  "Phase Rifle": {
    "tier": "Precursor",
    "trait": "Knowledge · Far",
    "dmg": "d8+6 void",
    "feat": "Phasing",
    "cost": "9"
  },
  "Precursor Beam Caster": {
    "tier": "Precursor",
    "trait": "Presence · Far",
    "dmg": "d10+9 void",
    "feat": "Existence",
    "cost": "n/a"
  },
  "Reality Shaper": {
    "tier": "Precursor",
    "trait": "Knowledge · Close",
    "dmg": "d6+9 void",
    "feat": "Existence",
    "cost": "Precursor"
  },
  "Singularity Rifle": {
    "tier": "Precursor",
    "trait": "Knowledge · Far",
    "dmg": "d8+6 void",
    "feat": "Disintegrating",
    "cost": "16"
  },
  "Thought Caster": {
    "tier": "Precursor",
    "trait": "Presence · Close",
    "dmg": "d8+9 void",
    "feat": "Mind Link",
    "cost": "Precursor"
  },
  "Veil Lance": {
    "tier": "Precursor",
    "trait": "Presence · Far",
    "dmg": "d10+6 void",
    "feat": "Reality Shift",
    "cost": "16"
  },
  "Accelerator Rifle": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d8 phys.",
    "feat": "Two-Handed, Armor Piercing (2), Charge-Up",
    "cost": "4"
  },
  "Acid Sprayer": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "Spray, Melting, Armor Piercing (1)",
    "cost": "4"
  },
  "Annihilation Beam": {
    "tier": "Experimental",
    "trait": "Agility · Far",
    "dmg": "3d8 ene.",
    "feat": "Two-Handed, Energy, Sustained Fire, Heavy",
    "cost": "9"
  },
  "Arc Whip": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d8 phys.",
    "feat": "Reach, Finesse, Arc, Stun",
    "cost": "9"
  },
  "Assault Laser": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "d10+2 ene.",
    "feat": "Two-Handed, Energy, Automatic",
    "cost": "4"
  },
  "Beam Sniper": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d10 ene.",
    "feat": "Two-Handed, Energy, Accurate, Scope, Heavy",
    "cost": "4"
  },
  "Boarding Axe": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d8 phys.",
    "feat": "Armor Piercing (1), Brutal",
    "cost": "4"
  },
  "Breaching Shield": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d6 phys.",
    "feat": "Defensive (+2), Shield",
    "cost": "4"
  },
  "Bulwark Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10+1 ene.",
    "feat": "Energy, Reliable",
    "cost": "4"
  },
  "Bulwark Rifle": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d12+2 phys.",
    "feat": "Two-Handed, Reliable, Brutal, Heavy",
    "cost": "4"
  },
  "Carbine": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "",
    "cost": "1"
  },
  "Chain (Improvised)": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d4 phys.",
    "feat": "Reach",
    "cost": "0"
  },
  "Chain-Glaive": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "2d6 phys.",
    "feat": "Two-Handed, Reach, Brutal, Loud",
    "cost": "4"
  },
  "Civilian Pulse Gun": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d6 ene.",
    "feat": "Energy",
    "cost": "1"
  },
  "Club/Baton": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d6 phys.",
    "feat": "Non-Lethal",
    "cost": "1"
  },
  "Combat Glaive": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d10 phys.",
    "feat": "Two-Handed, Reach",
    "cost": "4"
  },
  "Combat Laser Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8+2 ene.",
    "feat": "Lightweight, Energy, Accurate",
    "cost": "4"
  },
  "Combat Pike": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d10 phys.",
    "feat": "Two-Handed, Reach, Set",
    "cost": "4"
  },
  "Combat Shotgun": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "2d8 phys.",
    "feat": "Two-Handed, Scatter, Brutal",
    "cost": "4"
  },
  "Combat Sword": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d8 phys.",
    "feat": "Defensive",
    "cost": "4"
  },
  "Compliance Prod": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d4+3 phys.",
    "feat": "Reach, Stun, Non-Lethal, Anchoring",
    "cost": "4"
  },
  "Compliance Rifle": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10 phys.",
    "feat": "Two-Handed, Non-Lethal, Stun, Anchoring",
    "cost": "4"
  },
  "Cryo-Gun": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "Anchoring, Non-Lethal",
    "cost": "4"
  },
  "Designated Marksman": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d8 phys.",
    "feat": "Two-Handed, Accurate, Scope",
    "cost": "4"
  },
  "Disintegrator Rifle": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "2d12 ene.",
    "feat": "Two-Handed, Energy, Disintegrating, Unstable",
    "cost": "9"
  },
  "Disruptor Maul": {
    "tier": "Experimental",
    "trait": "Strength · Melee",
    "dmg": "d10 phys.",
    "feat": "Two-Handed, Disruptor, EMP",
    "cost": "9"
  },
  "Duel-Rapier": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Lightweight, Finesse, Defensive, Armor Piercing (1)",
    "cost": "4"
  },
  "Duelist Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10 phys.",
    "feat": "Accurate, Finesse",
    "cost": "4"
  },
  "EMP Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d4 phys.",
    "feat": "Lightweight, EMP, Disruptor",
    "cost": "4"
  },
  "Flechette Storm": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "2d6 phys.",
    "feat": "Two-Handed, Spray, Bleeding, Armor Piercing (1)",
    "cost": "9"
  },
  "Frontier Revolver": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d8+1 phys.",
    "feat": "Reliable",
    "cost": "1"
  },
  "Gauss Carbine": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "2d8 phys.",
    "feat": "Two-Handed, Armor Piercing (2), Silent",
    "cost": "9"
  },
  "Ghost-Wire": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d8 phys.",
    "feat": "Concealable, Silent, Garrote, Finesse",
    "cost": "4"
  },
  "Gravitic Breach Hammer": {
    "tier": "Experimental",
    "trait": "Strength · Melee",
    "dmg": "2d8 phys.",
    "feat": "Two-Handed, Knockdown, Blast (Very Close), Heavy, Devastating",
    "cost": "9"
  },
  "Graviton Pistol": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "2d6 ene.",
    "feat": "Energy, Knockdown, Anchoring",
    "cost": "9"
  },
  "Graviton Snare": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d6 phys.",
    "feat": "Anchoring, Non-Lethal",
    "cost": "4"
  },
  "Gut-Ripper": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d6+2 phys.",
    "feat": "Lightweight, Brutal, Bleeding",
    "cost": "4"
  },
  "Hand Axe": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d6 phys.",
    "feat": "Thrown (Close)",
    "cost": "1"
  },
  "Handheld Railgun": {
    "tier": "Experimental",
    "trait": "Agility · Far",
    "dmg": "2d12 phys.",
    "feat": "Two-Handed, Armor Piercing (3), Charge-Up, Heavy, Devastating",
    "cost": "9"
  },
  "Hatchet": {
    "tier": "Common",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Lightweight, Thrown (Close)",
    "cost": "1"
  },
  "Heavy Laser": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d8 ene.",
    "feat": "Two-Handed, Energy, Accurate",
    "cost": "4"
  },
  "Heavy Pistol": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d10 phys.",
    "feat": "High-Recoil",
    "cost": "1"
  },
  "Heavy Sniper Rifle": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d10 phys.",
    "feat": "Two-Handed, Accurate, Scope, Heavy",
    "cost": "4"
  },
  "Hellfire Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10+2 ene.",
    "feat": "Lightweight, Energy, Thermal, Melting, Loud",
    "cost": "4"
  },
  "Hold-Out Pistol": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d6 phys.",
    "feat": "Lightweight, Concealable",
    "cost": "1"
  },
  "Holdout Laser": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d4 ene.",
    "feat": "Lightweight, Concealable, Energy",
    "cost": "1"
  },
  "Hunting Rifle": {
    "tier": "Common",
    "trait": "Agility · Far",
    "dmg": "d10 phys.",
    "feat": "Two-Handed, Accurate",
    "cost": "1"
  },
  "Impact Gauntlets": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d8+3 phys.",
    "feat": "Lightweight, Knockdown, Brutal",
    "cost": "9"
  },
  "Industrial Cutter": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d8 ene.",
    "feat": "Energy, Melting",
    "cost": "1"
  },
  "Inferno Cannon": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "2d8 ene.",
    "feat": "Two-Handed, Energy, Spray, Thermal",
    "cost": "4"
  },
  "Interface Blade": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d8 phys.",
    "feat": "Finesse, Disruptor, Biometric",
    "cost": "4"
  },
  "Ion Disruptor Rifle": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8 ene.",
    "feat": "Two-Handed, Energy, Disruptor",
    "cost": "4"
  },
  "Ion Storm Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d6+2 ene.",
    "feat": "Lightweight, Energy, Disruptor, Arc",
    "cost": "4"
  },
  "Laser Carbine": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8+1 ene.",
    "feat": "Energy",
    "cost": "4"
  },
  "Laser Pistol": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d6 ene.",
    "feat": "Lightweight, Energy",
    "cost": "1"
  },
  "Laser Rifle": {
    "tier": "Common",
    "trait": "Agility · Far",
    "dmg": "d8 ene.",
    "feat": "Two-Handed, Energy, Accurate",
    "cost": "1"
  },
  "Light Pistol": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d6+1 phys.",
    "feat": "Lightweight",
    "cost": "1"
  },
  "Line-Breaker": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d8 phys.",
    "feat": "Shield, Defensive (+2), Knockdown, Reliable",
    "cost": "4"
  },
  "Long-Range Battle Rifle": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d6+2 phys.",
    "feat": "Two-Handed, Accurate",
    "cost": "4"
  },
  "Mace": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d8 phys.",
    "feat": "",
    "cost": "1"
  },
  "Machete": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d6 phys.",
    "feat": "",
    "cost": "1"
  },
  "Machine Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "Lightweight, Automatic",
    "cost": "4"
  },
  "Main-Gauche": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d4 phys.",
    "feat": "Lightweight, Finesse, Defensive (+2)",
    "cost": "4"
  },
  "Marksman Rifle": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d8+2 phys.",
    "feat": "Two-Handed, Accurate, Scope, Finesse",
    "cost": "4"
  },
  "Mass Driver Pistol": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "2d8 phys.",
    "feat": "Armor Piercing (2), Knockdown, High-Recoil",
    "cost": "9"
  },
  "Medium Pistol": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "",
    "cost": "1"
  },
  "Micro-Missile Pistol": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "2d6 phys.",
    "feat": "Lightweight, Guided, Blast (Very Close)",
    "cost": "9"
  },
  "Microwave Projector": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "Thermal, Melting, Concealable",
    "cost": "4"
  },
  "Mining Pick": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d8 phys.",
    "feat": "Armor Piercing (1), Unwieldy",
    "cost": "1"
  },
  "Molecular Sword": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d10 phys.",
    "feat": "Finesse, Armor Piercing (2), Fragile",
    "cost": "9"
  },
  "Monofilament Whip": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d8 phys.",
    "feat": "Reach, Finesse, Bleeding",
    "cost": "4"
  },
  "Nerve Agent Sprayer": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d6 phys.",
    "feat": "Spray, Poison, Non-Lethal",
    "cost": "4"
  },
  "Neural Disruptor": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "d8+4 ene.",
    "feat": "Energy, Stun, Anti-Psionic",
    "cost": "9"
  },
  "Neuro-Whip": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Reach, Finesse, Stun, Non-Lethal",
    "cost": "4"
  },
  "Null-Blade": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d8 phys.",
    "feat": "Finesse, Silent, Anti-Psionic",
    "cost": "9"
  },
  "Pacification Beam": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "2d6 ene.",
    "feat": "Two-Handed, Energy, Non-Lethal, Stun, Spray",
    "cost": "4"
  },
  "Pacifier Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "Lightweight, Non-Lethal, Stun",
    "cost": "4"
  },
  "Paradox Edge": {
    "tier": "Precursor",
    "trait": "Finesse · Melee",
    "dmg": "Special phys.",
    "feat": "Finesse, Temporal, Curse",
    "cost": "0"
  },
  "Particle Beam Rifle": {
    "tier": "Experimental",
    "trait": "Agility · Far",
    "dmg": "2d10 ene.",
    "feat": "Two-Handed, Energy, Phasing",
    "cost": "9"
  },
  "Personal Defense Weapon": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8+2 phys.",
    "feat": "Armor Piercing (1)",
    "cost": "4"
  },
  "Phantom Beam": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10 ene.",
    "feat": "Lightweight, Energy, Silent, Concealable",
    "cost": "4"
  },
  "Phantom Rifle": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d6 phys.",
    "feat": "Two-Handed, Silent, Accurate, Collapsible",
    "cost": "4"
  },
  "Phase Reaver": {
    "tier": "Precursor / Black Market",
    "trait": "Finesse · Melee",
    "dmg": "2d8 Physical",
    "feat": "Phasing, Unstable",
    "cost": "18"
  },
  "Phase Sabre": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d8+2 phys.",
    "feat": "Finesse, Phasing, Unstable",
    "cost": "9"
  },
  "Photon Lance": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d6+2 ene.",
    "feat": "Two-Handed, Energy, Accurate, Finesse",
    "cost": "4"
  },
  "Pipe Wrench": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d6 phys.",
    "feat": "",
    "cost": "1"
  },
  "Plasma Edge": {
    "tier": "Experimental",
    "trait": "Finesse · Melee",
    "dmg": "d10+2 ene.",
    "feat": "Finesse, Thermal, Melting, Energy",
    "cost": "9"
  },
  "Power Fist": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d8+2 phys.",
    "feat": "Knockdown, Heavy",
    "cost": "4"
  },
  "Pry Bar": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d6 phys.",
    "feat": "",
    "cost": "1"
  },
  "Pulse Carbine": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10 ene.",
    "feat": "Two-Handed, Energy, Automatic",
    "cost": "4"
  },
  "Quantum Laser": {
    "tier": "Experimental",
    "trait": "Agility · Far",
    "dmg": "2d8 ene.",
    "feat": "Two-Handed, Energy, Phasing, Accurate",
    "cost": "9"
  },
  "Quarterstaff": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d6 phys.",
    "feat": "Two-Handed, Reach, Defensive",
    "cost": "1"
  },
  "Retractable Blade": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Lightweight, Concealable, Collapsible",
    "cost": "4"
  },
  "Scar-Axe": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d10 phys.",
    "feat": "Brutal, Intimidating, Bleeding",
    "cost": "4"
  },
  "Scrap-Cannon": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "3d6 phys.",
    "feat": "Two-Handed, Scatter, Loud, Intimidating",
    "cost": "4"
  },
  "Sedation Blade": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Lightweight, Finesse, Poison, Non-Lethal",
    "cost": "4"
  },
  "Seeker Sniper": {
    "tier": "Experimental",
    "trait": "Agility · Far",
    "dmg": "3d8 phys.",
    "feat": "Two-Handed, Guided, Scope, Heavy",
    "cost": "9"
  },
  "Service Combat Knife": {
    "tier": "Common",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Lightweight, Concealable",
    "cost": "1"
  },
  "Service Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8+2 phys.",
    "feat": "Lightweight",
    "cost": "4"
  },
  "Shadow Rifle": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d6+2 ene.",
    "feat": "Two-Handed, Energy, Silent, Collapsible",
    "cost": "4"
  },
  "Shadow-Fang": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d6+2 phys.",
    "feat": "Lightweight, Finesse, Concealable, Silent, Poison",
    "cost": "4"
  },
  "Shock Knuckles": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d4+2 phys.",
    "feat": "Lightweight, Concealable, Stun",
    "cost": "4"
  },
  "Shotgun (Civilian)": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "2d6 phys.",
    "feat": "Two-Handed, Scatter",
    "cost": "1"
  },
  "Siege Carbine": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10 phys.",
    "feat": "Two-Handed, Reliable, Armor Piercing (1)",
    "cost": "4"
  },
  "Siege Laser": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d8+2 ene.",
    "feat": "Two-Handed, Energy, Reliable, Heavy",
    "cost": "4"
  },
  "Siege-Hammer": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d12 phys.",
    "feat": "Two-Handed, Knockdown, Sundering, Reliable",
    "cost": "4"
  },
  "Singularity Pistol": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "2d8 ene.",
    "feat": "Energy, Blast (Very Close), Heavy",
    "cost": "9"
  },
  "Smart Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "Lightweight, Guided, Biometric",
    "cost": "4"
  },
  "Smart Rifle": {
    "tier": "Experimental",
    "trait": "Agility · Far",
    "dmg": "2d8+2 phys.",
    "feat": "Two-Handed, Guided, Accurate, Biometric",
    "cost": "9"
  },
  "Smart-Beam Rifle": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "2d6 ene.",
    "feat": "Two-Handed, Energy, Guided, Biometric",
    "cost": "4"
  },
  "Sonic Disruptor": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10 phys.",
    "feat": "Cone, Stun, Loud",
    "cost": "4"
  },
  "Spear": {
    "tier": "Common",
    "trait": "Strength · Melee",
    "dmg": "d8 phys.",
    "feat": "Two-Handed, Reach, Thrown (Medium)",
    "cost": "1"
  },
  "Sporting Rifle": {
    "tier": "Common",
    "trait": "Agility · Far",
    "dmg": "d10+1 phys.",
    "feat": "Two-Handed, Accurate",
    "cost": "1"
  },
  "Stellar Fragment": {
    "tier": "Precursor",
    "trait": "Strength · Melee",
    "dmg": "2d10 phys.",
    "feat": "Two-Handed, Thermal, Blast (Close), Curse",
    "cost": "0"
  },
  "Storm Rifle": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "d10+2 phys.",
    "feat": "Two-Handed, Automatic, Arc",
    "cost": "9"
  },
  "Stun Baton": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d6+2 phys.",
    "feat": "Non-Lethal, Stun",
    "cost": "4"
  },
  "Stun Blaster": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d6 ene.",
    "feat": "Energy, Non-Lethal, Stun",
    "cost": "1"
  },
  "Submachine Gun": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8+1 phys.",
    "feat": "Automatic",
    "cost": "4"
  },
  "Sun-Blade": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d8 phys.",
    "feat": "Defensive, Finesse, Accurate",
    "cost": "4"
  },
  "Sun-Ray Pistol": {
    "tier": "Military",
    "trait": "Agility · Far",
    "dmg": "d8+2 ene.",
    "feat": "Lightweight, Energy, Accurate, Finesse",
    "cost": "4"
  },
  "Survival Tomahawk": {
    "tier": "Common",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Lightweight, Thrown (Close)",
    "cost": "1"
  },
  "Tactical Assault Rifle": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10+2 phys.",
    "feat": "Two-Handed, Automatic",
    "cost": "4"
  },
  "Tactical Blade": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d6 phys.",
    "feat": "Lightweight, Concealable, Armor Piercing (1)",
    "cost": "4"
  },
  "Tactical Shotgun": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "2d6+2 phys.",
    "feat": "Two-Handed, Scatter",
    "cost": "4"
  },
  "Tangle-Web": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d4 phys.",
    "feat": "Range (Medium), Non-Lethal, Anchoring",
    "cost": "4"
  },
  "Tesla Coil Gun": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10 phys.",
    "feat": "Arc, Stun",
    "cost": "4"
  },
  "The Silence": {
    "tier": "Precursor",
    "trait": "Finesse · Melee",
    "dmg": "d10+4 phys.",
    "feat": "Lightweight, Silent, Poison (Special), Curse",
    "cost": "0"
  },
  "Thermal Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8 ene.",
    "feat": "Lightweight, Energy, Thermal, Melting",
    "cost": "4"
  },
  "Thermal Plasma Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10 ene.",
    "feat": "Energy, Thermal",
    "cost": "4"
  },
  "Thermal Plasma Rifle": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "2d6+2 ene.",
    "feat": "Two-Handed, Energy, Thermal",
    "cost": "4"
  },
  "Trench Maul": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d10 phys.",
    "feat": "Two-Handed, Brutal, Knockdown",
    "cost": "4"
  },
  "Trench-Blade": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d8+1 phys.",
    "feat": "Brutal, Reliable, Armor Piercing (1)",
    "cost": "4"
  },
  "Utility Knife": {
    "tier": "Common",
    "trait": "Finesse · Melee",
    "dmg": "d4 phys.",
    "feat": "Lightweight, Concealable",
    "cost": "1"
  },
  "Varmint Rifle": {
    "tier": "Common",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "Two-Handed",
    "cost": "1"
  },
  "Vibroknife": {
    "tier": "Military",
    "trait": "Finesse · Melee",
    "dmg": "d6+2 phys.",
    "feat": "Lightweight, Armor Piercing (1)",
    "cost": "4"
  },
  "Void Projector": {
    "tier": "Experimental",
    "trait": "Agility · Close",
    "dmg": "2d8 ene.",
    "feat": "Two-Handed, Energy, Blast (Close), Unstable",
    "cost": "9"
  },
  "Void-Shard Blade": {
    "tier": "Precursor",
    "trait": "Finesse · Melee",
    "dmg": "2d8 phys.",
    "feat": "Finesse, Phasing, Disintegrating, Curse",
    "cost": "0"
  },
  "Volkov Suppression Rifle": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d10 phys.",
    "feat": "Two-Handed, Automatic, Loud, Intimidating",
    "cost": "4"
  },
  "War Hammer": {
    "tier": "Military",
    "trait": "Strength · Melee",
    "dmg": "d10 phys.",
    "feat": "Two-Handed, Knockdown",
    "cost": "4"
  },
  "Whisper Pistol": {
    "tier": "Military",
    "trait": "Agility · Close",
    "dmg": "d8 phys.",
    "feat": "Lightweight, Concealable, Silent",
    "cost": "4"
  }
};

const ARMOR_DATA = {
  "Environmental Suit": {
    "tier": "Common",
    "thr": "4 / 8",
    "slots": 3,
    "feat": "Life Support",
    "cost": "1"
  },
  "Frontier Vest": {
    "tier": "Common",
    "thr": "5 / 11",
    "slots": 3,
    "feat": "Flexible",
    "cost": "1"
  },
  "Homestead Rig": {
    "tier": "Common",
    "thr": "6 / 13",
    "slots": 3,
    "feat": "Flexible",
    "cost": "4"
  },
  "Mesh Armor": {
    "tier": "Common",
    "thr": "5 / 10",
    "slots": 4,
    "feat": "Self-Repair",
    "cost": "4"
  },
  "Pilot's Jacket": {
    "tier": "Common",
    "thr": "5 / 11",
    "slots": 3,
    "feat": "Life Support",
    "cost": "4"
  },
  "Riot Armor": {
    "tier": "Military",
    "thr": "8 / 17",
    "slots": 5,
    "feat": "Heavy, Fortified",
    "cost": "4"
  },
  "Salvage Armor": {
    "tier": "Common",
    "thr": "7 / 15",
    "slots": 6,
    "feat": "Heavy, Jury-rigged",
    "cost": "4"
  },
  "Colony Defense Armor": {
    "tier": "Military",
    "thr": "8 / 17",
    "slots": 5,
    "feat": "Fortified",
    "cost": "9"
  },
  "Combat Armor": {
    "tier": "Military",
    "thr": "8 / 16",
    "slots": 3,
    "feat": "Resilient",
    "cost": "4"
  },
  "Composite Armor": {
    "tier": "Military",
    "thr": "8 / 16",
    "slots": 4,
    "feat": "Resilient",
    "cost": "4"
  },
  "Industrial Exosuit": {
    "tier": "Military",
    "thr": "8 / 16",
    "slots": 7,
    "feat": "Very Heavy, Powered",
    "cost": "4"
  },
  "Infiltrator Suit": {
    "tier": "Military",
    "thr": "7 / 14",
    "slots": 4,
    "feat": "Cloaking",
    "cost": "4"
  },
  "Security Armor": {
    "tier": "Military",
    "thr": "7 / 14",
    "slots": 4,
    "feat": "Resilient",
    "cost": "4"
  },
  "Stealth Armor": {
    "tier": "Military",
    "thr": "7 / 16",
    "slots": 4,
    "feat": "Cloaking",
    "cost": "9"
  },
  "Assault Armor": {
    "tier": "Experimental",
    "thr": "11 / 22",
    "slots": 5,
    "feat": "Assault",
    "cost": "9"
  },
  "Battle Armor": {
    "tier": "Experimental",
    "thr": "13 / 27",
    "slots": 7,
    "feat": "Heavy, Fortified",
    "cost": "9"
  },
  "Marine Armor": {
    "tier": "Experimental",
    "thr": "12 / 24",
    "slots": 5,
    "feat": "Resilient, Environmental",
    "cost": "16"
  },
  "Power Armor": {
    "tier": "Experimental",
    "thr": "15 / 30",
    "slots": 8,
    "feat": "Very Heavy, Powered",
    "cost": "25"
  },
  "Powered Armor": {
    "tier": "Experimental",
    "thr": "13 / 28",
    "slots": 6,
    "feat": "Powered",
    "cost": "16"
  },
  "Siege Armor": {
    "tier": "Experimental",
    "thr": "16 / 32",
    "slots": 8,
    "feat": "Very Heavy, Massive",
    "cost": "25"
  },
  "Smart Fabric Armor": {
    "tier": "Experimental",
    "thr": "8 / 16",
    "slots": 5,
    "feat": "Self-Repair",
    "cost": "9"
  },
  "Special Forces Suit": {
    "tier": "Experimental",
    "thr": "9 / 18",
    "slots": 5,
    "feat": "Resilient",
    "cost": "9"
  },
  "Tactical Armor": {
    "tier": "Experimental",
    "thr": "10 / 20",
    "slots": 5,
    "feat": "Tactical",
    "cost": "9"
  },
  "Combat Jacket": {
    "tier": "Common",
    "thr": "6 / 13",
    "slots": 4,
    "feat": "Pocketed",
    "cost": "1"
  },
  "Frontier Jacket": {
    "tier": "Common",
    "thr": "4 / 10",
    "slots": 3,
    "feat": "Pocketed, Weather-Proof",
    "cost": "1"
  },
  "Reinforced Clothing": {
    "tier": "Common",
    "thr": "3 / 8",
    "slots": 2,
    "feat": "Social",
    "cost": "1"
  },
  "Breacher Armor": {
    "tier": "Military",
    "thr": "10 / 18",
    "slots": 6,
    "feat": "Breaching Shield",
    "cost": "4"
  },
  "Combat Shell": {
    "tier": "Military",
    "thr": "7 / 14",
    "slots": 5,
    "feat": "Modular, Environmental",
    "cost": "4"
  },
  "Enforcer Armor": {
    "tier": "Military",
    "thr": "8 / 15",
    "slots": 5,
    "feat": "Intimidating",
    "cost": "4"
  },
  "Flexible Mesh Armor": {
    "tier": "Military",
    "thr": "5 / 12",
    "slots": 4,
    "feat": "Flexible",
    "cost": "4"
  },
  "Hazard Suit": {
    "tier": "Military",
    "thr": "6 / 13",
    "slots": 4,
    "feat": "Hazard-Sealed",
    "cost": "4"
  },
  "Patrol Armor": {
    "tier": "Military",
    "thr": "7 / 14",
    "slots": 5,
    "feat": "ID Display, Comms",
    "cost": "4"
  },
  "Plate Carrier": {
    "tier": "Military",
    "thr": "9 / 17",
    "slots": 6,
    "feat": "Modular",
    "cost": "4"
  },
  "Scout Armor": {
    "tier": "Military",
    "thr": "5 / 11",
    "slots": 3,
    "feat": "Silent, Low-Profile",
    "cost": "4"
  },
  "Voidsuit (Combat)": {
    "tier": "Military",
    "thr": "7 / 14",
    "slots": 5,
    "feat": "Environmental, Thruster",
    "cost": "4"
  },
  "Voidsuit (Light)": {
    "tier": "Military",
    "thr": "4 / 10",
    "slots": 3,
    "feat": "Environmental",
    "cost": "4"
  },
  "Battle Plate": {
    "tier": "Experimental",
    "thr": "11 / 19",
    "slots": 7,
    "feat": "Ablative (3)",
    "cost": "9"
  },
  "Exo-Mesh": {
    "tier": "Experimental",
    "thr": "8 / 15",
    "slots": 5,
    "feat": "Servo-Assisted, Flexible",
    "cost": "9"
  },
  "Fortress Armor": {
    "tier": "Experimental",
    "thr": "12 / 22",
    "slots": 8,
    "feat": "Hardened (Energy)",
    "cost": "9"
  },
  "Stealth Suit": {
    "tier": "Experimental",
    "thr": "4 / 9",
    "slots": 2,
    "feat": "Thermoptic Camouflage",
    "cost": "9"
  },
  "Void Hardsuit": {
    "tier": "Experimental",
    "thr": "10 / 18",
    "slots": 7,
    "feat": "Thruster Pack",
    "cost": "9"
  },
  "Siege Plate": {
    "tier": "Precursor",
    "thr": "14 / 25",
    "slots": 10,
    "feat": "Hardened (All)",
    "cost": "16"
  }
};

const AUGMENT_DATA = {
  "Audio Dampeners": {
    "tier": "Common",
    "benefit": "Muffles movement",
    "stress": "1",
    "cost": "4",
    "drawback": "Reduced hearing acuity"
  },
  "Enhanced Muscles": {
    "tier": "Common",
    "benefit": "+1 Strength",
    "stress": null,
    "cost": "9",
    "drawback": "Increased caloric needs"
  },
  "Light-Absorbent Skin": {
    "tier": "Common",
    "benefit": "+1 Agility in low-light",
    "stress": null,
    "cost": "1",
    "drawback": "Skin fatigue, rashes"
  },
  "Memory Chip": {
    "tier": "Common",
    "benefit": "Perfect recall",
    "stress": null,
    "cost": "4",
    "drawback": "Data-ghosts; cannot forget what matters."
  },
  "Neural Silence Nodes": {
    "tier": "Common",
    "benefit": "Immune to electronic eavesdrop",
    "stress": "1",
    "cost": "4",
    "drawback": "EMP vulnerability"
  },
  "Pain Suppressor": {
    "tier": "Common",
    "benefit": "Ignore debilitating injuries",
    "stress": null,
    "cost": "4",
    "drawback": "Cannot sense true injury severity."
  },
  "Prosthetic Limb": {
    "tier": "Common",
    "benefit": "Replace lost limb, +1 Strength",
    "stress": null,
    "cost": "4",
    "drawback": "Maintenance required"
  },
  "Reinforced Bones": {
    "tier": "Common",
    "benefit": "+2 HP",
    "stress": null,
    "cost": "9",
    "drawback": "Heavier body (-1 swim/climb)"
  },
  "Subdermal Armor": {
    "tier": "Common",
    "benefit": "+1 Armor Score",
    "stress": null,
    "cost": "9",
    "drawback": "Obvious appearance"
  },
  "Subdermal Camouflage": {
    "tier": "Common",
    "benefit": "+1 Finesse on Stealth",
    "stress": null,
    "cost": "4",
    "drawback": "Skin tinting visible bright light"
  },
  "Thermal Shroud": {
    "tier": "Common",
    "benefit": "Lowers heat signature",
    "stress": null,
    "cost": "4",
    "drawback": "Overheating risk in heat"
  },
  "Toxin Filter": {
    "tier": "Common",
    "benefit": "Immunity to poisons",
    "stress": null,
    "cost": "1",
    "drawback": "Reduced healing (half rate)"
  },
  "Adaptive Camo Weave": {
    "tier": "Military",
    "benefit": "Alters color/pattern",
    "stress": "1",
    "cost": "9",
    "drawback": "Power draw reduces armor energy"
  },
  "Combat Chassis": {
    "tier": "Military",
    "benefit": "+2 Strength, +1 Armor",
    "stress": "1",
    "cost": "16",
    "drawback": "Social stigma"
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
  "Enhanced Reflexes": {
    "tier": "Military",
    "benefit": "+2 Agility",
    "stress": "1",
    "cost": "16",
    "drawback": "Hyperactivity"
  },
  "Life Support System": {
    "tier": "Military",
    "benefit": "Survive vacuum/hostile env.",
    "stress": null,
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
  "Subdermal Noise Filters": {
    "tier": "Military",
    "benefit": "Sound cancellation within 5m",
    "stress": "1",
    "cost": "9",
    "drawback": "Headaches if worn continuously"
  },
  "Weapon Integration": {
    "tier": "Military",
    "benefit": "Built-in weapons, cannot disarm",
    "stress": "1",
    "cost": "4",
    "drawback": "Always-armed presence"
  },
  "Adaptive Biology": {
    "tier": "Experimental",
    "benefit": "Env. hazard immunity",
    "stress": "2",
    "cost": "16",
    "drawback": "Unpredictable mutations"
  },
  "Phase Shifter": {
    "tier": "Experimental",
    "benefit": "Briefly intangible",
    "stress": "3",
    "cost": "16",
    "drawback": "Energy drain, risk of stuck"
  },
  "Quantum Muscles": {
    "tier": "Experimental",
    "benefit": "Variable strength",
    "stress": "2",
    "cost": "16",
    "drawback": "Unstable output"
  },
  "AUDIO ENHANCEMENT (BASIC)": {
    "tier": "Common",
    "benefit": "The character's auditory system is enhanced with implanted processors providing:",
    "stress": "",
    "cost": "1",
    "drawback": "Universal."
  },
  "Active Toxin Purger": {
    "tier": "Common",
    "benefit": "Advantage on Reaction Rolls against poisons and toxins. Can purge all toxins from system over 10 minutes (exhausting but effective).",
    "stress": "",
    "cost": "1",
    "drawback": "Universal."
  },
  "COMMUNICATIONS IMPLANT": {
    "tier": "Common",
    "benefit": "Can communicate silently with others who have compatible implants. Coordination in stealth situations has no verbal component to detect.",
    "stress": "",
    "cost": "1",
    "drawback": "Universal."
  },
  "DATA-JACK": {
    "tier": "Common",
    "benefit": "A universal data port installed at the temple, base of skull, or behind the ear allows:",
    "stress": "",
    "cost": "1",
    "drawback": "Universal. The most common augmentation in existence."
  },
  "ENVIRONMENTAL ADAPTATION (BASIC)": {
    "tier": "Common",
    "benefit": "No penalties from environmental conditions within listed parameters. +2 to saves against environmental hazards outside those parameters.",
    "stress": "",
    "cost": "1",
    "drawback": "Universal."
  },
  "INTERNAL STORAGE COMPARTMENT": {
    "tier": "Common",
    "benefit": "Items in compartment cannot be found by standard search; requires specific medical scanning or Awareness DC 20 to detect.",
    "stress": "",
    "cost": "1",
    "drawback": "Universal."
  },
  "MEMORY CORE (BASIC)": {
    "tier": "Common",
    "benefit": "+1 to Knowledge checks involving recalled information. Can perfectly recall anything experienced since installation.",
    "stress": "",
    "cost": "1",
    "drawback": "Universal."
  },
  "MUSCLE WEAVE (BASIC)": {
    "tier": "Common",
    "benefit": "+1 to Strength for carrying capacity, melee damage, and Strength checks. Can perform sustained physical activity twice as long before fatigue.",
    "stress": "",
    "cost": "1",
    "drawback": "Universal. Popular among laborers, soldiers, and athletes."
  },
  "OLFACTORY BOOSTER": {
    "tier": "Common",
    "benefit": "Enhanced chemical receptors in the nasal cavity provide:",
    "stress": "",
    "cost": "1",
    "drawback": "Specialty medical suppliers, frontier outfitters."
  },
  "OPTICAL ENHANCEMENT (BASIC)": {
    "tier": "Common",
    "benefit": "The character's eyes are replaced with or enhanced by optical implants providing the following capabilities:",
    "stress": "",
    "cost": "1",
    "drawback": "Universal. Available from any medical facility with augmentation capability."
  },
  "REFLEX TRIGGER": {
    "tier": "Common",
    "benefit": "+1 to Spotlight contests. Once per combat, may use Reaction even if Reaction has already been used this round.",
    "stress": "",
    "cost": "1",
    "drawback": "Universal. Popular among those who expect violence."
  },
  "RESPIRATORY ENHANCEMENT": {
    "tier": "Common",
    "benefit": "Immune to common airborne toxins and pollutants. Can survive in low-oxygen environments that would incapacitate unaugmented humans. Extended breath-holding and limited water breathing.",
    "stress": "",
    "cost": "1",
    "drawback": "Universal. Popular among those who work in hazardous environments."
  },
  "SUBDERMAL PLATING (LIGHT)": {
    "tier": "Common",
    "benefit": "+1 to Minor and Major Damage Thresholds. Damage from unarmed attacks and simple blades reduced by 2.",
    "stress": "",
    "cost": "1",
    "drawback": "Universal."
  },
  "BERSERKER PROTOCOL": {
    "tier": "Military",
    "benefit": "Activate as Free Action. While active: +3 to Strength, ignore pain-based penalties and effects, immune to fear, but -2 to all defensive actions and cannot retreat voluntarily. State lasts until combat ends or manually deactivated.",
    "stress": "",
    "cost": "4",
    "drawback": "House Volkov warrior suppliers."
  },
  "COGNITIVE ACCELERATOR": {
    "tier": "Military",
    "benefit": "+2 to Knowledge checks. In combat, the first round feels like two rounds for planning purposes (though only normal actions can be taken).",
    "stress": "",
    "cost": "4",
    "drawback": "House Kurogane, academic institutions, research facilities."
  },
  "CYBERNETIC LIMB (STANDARD)": {
    "tier": "Military",
    "benefit": "+2 to Strength-based checks using the limb. +1 to Finesse-based checks requiring precision. Limb cannot be \"injured\" and provides natural +1 to Damage Thresholds when used defensively.",
    "stress": "",
    "cost": "4",
    "drawback": "Universal. Many providers, varying quality and aesthetics."
  },
  "DERMAL ARMOR": {
    "tier": "Military",
    "benefit": "+2 to Armor Score (maximum combined bonus from dermal and worn armor is +10). +2 to Damage Thresholds. Can survive vacuum exposure for up to 5 minutes.",
    "stress": "",
    "cost": "4",
    "drawback": "Military and security suppliers."
  },
  "ECHO-LOCATION IMPLANT": {
    "tier": "Military",
    "benefit": "Ignore penalties from darkness, smoke, or visual obscurement within 20 meters. +2 to checks detecting hidden compartments or passages.",
    "stress": "",
    "cost": "4",
    "drawback": "Specialty medical suppliers. Popular among spelunkers, infiltrators, and those who work in darkness."
  },
  "GRAPPLE SYSTEM": {
    "tier": "Military",
    "benefit": "Can ascend vertical surfaces at normal movement speed. Can pull objects up to 300 kg. Can cross gaps by anchoring and swinging.",
    "stress": "",
    "cost": "4",
    "drawback": "Military and security suppliers."
  },
  "INTEGRATED WEAPON SYSTEM": {
    "tier": "Military",
    "benefit": "Weapon cannot be disarmed. Drawing is Free Action. +1 to attack rolls when using linked targeting systems.",
    "stress": "",
    "cost": "4",
    "drawback": "Military and Black Market. Concealed weapons attract legal attention."
  },
  "MEDICAL NANITE RESERVOIR": {
    "tier": "Military",
    "benefit": "Heal 2 HP per Short Rest instead of 1. Automatically stabilized when reduced to 0 HP. Advantage on disease and poison Reaction Rolls.",
    "stress": "",
    "cost": "4",
    "drawback": "Medical suppliers, House Kurogane."
  },
  "MEMORY CORE (ADVANCED)": {
    "tier": "Military",
    "benefit": "+2 to Knowledge checks involving recalled information. Perfect recall of all experiences. Protected memories are immune to telepathic reading or chemical interrogation.",
    "stress": "",
    "cost": "4",
    "drawback": "House Kurogane, intelligence agencies, executive protection services."
  },
  "MUSCLE WEAVE (ADVANCED)": {
    "tier": "Military",
    "benefit": "+2 to Strength for all purposes. Jump distance doubled. Sprint speed increased by 50%. Can maintain maximum exertion for one hour before fatigue.",
    "stress": "",
    "cost": "4",
    "drawback": "Military suppliers, athletic enhancement services."
  },
  "NEURAL INTERFACE (DIRECT)": {
    "tier": "Military",
    "benefit": "+2 to checks involving vehicle operation, drone control, or computer hacking when directly connected. Can control up to 3 systems simultaneously.",
    "stress": "",
    "cost": "4",
    "drawback": "House Kurogane suppliers, military neural specialists."
  },
  "OPTICAL ENHANCEMENT (ADVANCED)": {
    "tier": "Military",
    "benefit": "+2 to Awareness checks involving vision; +1 to ranged attack rolls at Long range or beyond.",
    "stress": "",
    "cost": "4",
    "drawback": "Military suppliers, licensed medical facilities. Restricted in some jurisdictions."
  },
  "REACTION BOOSTER": {
    "tier": "Military",
    "benefit": "+2 to Spotlight contests. Can take one additional Reaction per round (can be used for reactive strikes, defensive actions, or other Reaction abilities).",
    "stress": "",
    "cost": "4",
    "drawback": "Military suppliers. Popular among bodyguards and quick-draw specialists."
  },
  "SENSOR SUITE (STANDARD)": {
    "tier": "Military",
    "benefit": "Cannot be surprised while conscious; +2 to checks detecting hidden electronic devices.",
    "stress": "",
    "cost": "4",
    "drawback": "Military and security suppliers. Common among House Kurogane personnel."
  },
  "SKELETAL REINFORCEMENT": {
    "tier": "Military",
    "benefit": "Immune to broken bones. Fall damage reduced by 1d6. +2 to Damage Thresholds against bludgeoning. Required for some advanced physical augmentations.",
    "stress": "",
    "cost": "4",
    "drawback": "Military suppliers, industrial augmentation providers."
  },
  "SKILL MODULE PORT": {
    "tier": "Military",
    "benefit": "Neural architecture supporting downloadable skill modules:",
    "stress": "",
    "cost": "4",
    "drawback": "House Kurogane, educational suppliers. Modules available from various specialized sources."
  },
  "TACTICAL HUD INTERFACE": {
    "tier": "Military",
    "benefit": "+1 to Spotlight contests when working with a linked squad. Allies can share target marking, granting +1 to strike marked targets.",
    "stress": "",
    "cost": "4",
    "drawback": "Military suppliers. Standard issue for House forces in squad-based operations."
  },
  "TARGETING RETICLE": {
    "tier": "Military",
    "benefit": "+2 to ranged attack rolls. Ignore penalties for target movement and environmental conditions.",
    "stress": "",
    "cost": "4",
    "drawback": "Military and hunting suppliers."
  },
  "TOOL HAND": {
    "tier": "Military",
    "benefit": "+2 to all checks involving repair, maintenance, or technical work. Always have appropriate basic tools available.",
    "stress": "",
    "cost": "4",
    "drawback": "Technical suppliers, engineering outfitters."
  },
  "CENTURION'S RESILIENCE": {
    "tier": "Experimental",
    "benefit": "+4 to Damage Thresholds. When reduced to 0 HP, may continue acting for 1d4 rounds before collapsing. Advantage on Reaction Rolls against instant death effects.",
    "stress": "",
    "cost": "9",
    "drawback": "House Joric military suppliers."
  },
  "COMBAT COMPUTER": {
    "tier": "Experimental",
    "benefit": "+2 to Spotlight contests; +1 to all attack rolls; +1 to Evasion. Once per combat, may reroll an attack roll.",
    "stress": "",
    "cost": "9",
    "drawback": "Military neural specialists, elite mercenary suppliers. Restricted military equipment."
  },
  "COMBAT DRUG INJECTOR": {
    "tier": "Experimental",
    "benefit": "Inject drugs as Free Action. Automatic injection when specified trigger conditions occur (unconsciousness, below half HP, etc.).",
    "stress": "",
    "cost": "9",
    "drawback": "Military medical suppliers, Black Market."
  },
  "CYBERNETIC LIMB (COMBAT)": {
    "tier": "Experimental",
    "benefit": "+4 to Strength-based checks using the limb. Integrated weapon equivalent to Tier 2 weapon of chosen type. Can use limb to block, gaining +2 to Evasion against melee attacks as a Reaction.",
    "stress": "",
    "cost": "9",
    "drawback": "Military and Black Market. Concealed weapons in this format are illegal in many jurisdictions."
  },
  "ELECTROMAGNETIC PULSE SHIELDING": {
    "tier": "Experimental",
    "benefit": "Immune to EMP effects. Augmentations function normally in environments that would disable unshielded electronics. Can isolate systems to prevent hacking or remote shutdown.",
    "stress": "",
    "cost": "9",
    "drawback": "Military cybernetics suppliers."
  },
  "FULL-BODY CONVERSION (STANDARD)": {
    "tier": "Experimental",
    "benefit": "All physical Traits (Strength, Agility) set to +3 minimum. +4 to Damage Thresholds. Immune to poison, disease, and most biological hazards. Does not need to eat, drink, or breathe (though power is required). Takes damage as normal but is repaired rather than healed.",
    "stress": "",
    "cost": "16",
    "drawback": "House Kurogane specialists. Expensive and irreversible."
  },
  "GHOST PROTOCOL SUITE": {
    "tier": "Experimental",
    "benefit": "+4 to all Stealth checks. Invisible to thermal sensors. Cannot be tracked by scent. Advantage on checks to avoid electronic detection.",
    "stress": "",
    "cost": "9",
    "drawback": "House Valerius operative suppliers."
  },
  "KUROGANE INTEGRATION SUITE": {
    "tier": "Experimental",
    "benefit": "+1 to all benefits from other augmentations. Installation DC for future augmentations reduced by 2. Aware of any malfunction or tampering immediately.",
    "stress": "",
    "cost": "9",
    "drawback": "House Kurogane suppliers."
  },
  "MEDICAL NANITE RESERVOIR (ADVANCED)": {
    "tier": "Experimental",
    "benefit": "Heal 4 HP per Short Rest. Automatically receive emergency medical treatment when critically injured (equivalent to Tier 2 medical attention). Regenerate lost limbs and organs over time. Biological aging slowed to approximately 1/4 normal rate.",
    "stress": "",
    "cost": "9",
    "drawback": "House Kurogane medical specialists. Expensive and rare."
  },
  "NEURAL INTERFACE (FULL-SPECTRUM)": {
    "tier": "Experimental",
    "benefit": "+3 to checks involving connected systems. Can pilot vehicles, control drones, and operate weapons through thought alone with no physical interface required (if systems are wireless-capable).",
    "stress": "",
    "cost": "9",
    "drawback": "House Kurogane elite specialists, military special operations units."
  },
  "OPTICAL ENHANCEMENT (ELITE)": {
    "tier": "Experimental",
    "benefit": "+3 to Awareness checks involving vision; +2 to ranged attack rolls; Advantage on checks to detect hidden or cloaked enemies.",
    "stress": "",
    "cost": "9",
    "drawback": "House Kurogane elite suppliers, Black Market at premium prices. Restricted military equipment in most jurisdictions."
  },
  "PERSONAL SHIELD GENERATOR": {
    "tier": "Experimental",
    "benefit": "Shield provides 10 points of damage absorption. Activating costs Reaction but shield remains active. Regenerates when not damaged. Depleted shield requires 1 minute to restart.",
    "stress": "",
    "cost": "9",
    "drawback": "House Kurogane military, high-end security suppliers."
  },
  "PSYCHIC RESISTANCE MODULE": {
    "tier": "Experimental",
    "benefit": "Advantage on Reaction Rolls against fear, mind-reading, and mental influence. +4 to resist interrogation. Immune to involuntary telepathic contact.",
    "stress": "",
    "cost": "9",
    "drawback": "Intelligence agencies, executive protection services, House security specialists."
  },
  "REFLEX ENHANCEMENT SYSTEM": {
    "tier": "Experimental",
    "benefit": "+3 to Spotlight contests. +1 to Agility for Evasion and Agility checks. Once per round, may take an additional Reaction.",
    "stress": "",
    "cost": "9",
    "drawback": "Military neural specialists, elite mercenary suppliers."
  },
  "SENSOR SUITE (ADVANCED)": {
    "tier": "Experimental",
    "benefit": "Cannot be surprised; +3 to checks detecting hidden creatures or devices; can attempt to detect lies by reading biometric stress (opposed check vs. target's Presence).",
    "stress": "",
    "cost": "9",
    "drawback": "House Kurogane specialists, intelligence agencies. High-end Black Market."
  },
  "SYNESTHETIC INTEGRATION": {
    "tier": "Experimental",
    "benefit": "+2 to Spotlight contests (threat perception); +2 to Knowledge checks involving data analysis; can interface with systems intuitively, reducing hacking time by half.",
    "stress": "",
    "cost": "9",
    "drawback": "House Kurogane neural specialists. Experimental; not widely available."
  },
  "WIRED REFLEXES (MILITARY-GRADE)": {
    "tier": "Experimental",
    "benefit": "+4 to Spotlight contests. +2 to Agility for Evasion. Once per combat, may take an additional Action on your turn. All movement speeds increased by 50%.",
    "stress": "",
    "cost": "9",
    "drawback": "Military special operations suppliers. Restricted technology."
  },
  "ASSASSINATION TOOLKIT": {
    "tier": "Precursor",
    "benefit": "+2d6 damage on successful surprise attacks. Poison delivery adds effects of chosen",
    "stress": "",
    "cost": "16",
    "drawback": "House Valerius exclusive. Never sold."
  },
  "BLACK BOX MEMORY": {
    "tier": "Precursor",
    "benefit": "Complete record of user's experiences preserved even if user dies. Core can be recovered and memories accessed by authorized personnel.",
    "stress": "",
    "cost": "16",
    "drawback": "House Kurogane intelligence assets."
  },
  "COMBAT SYNCHRONIZATION SYSTEM": {
    "tier": "Precursor",
    "benefit": "All synchronized fighters act on the highest Spotlight position in the group. Coordinated attacks gain +3 to strike. Synchronized flanking grants +4 bonus instead of standard flanking bonus. Cannot be surprised as a group if any member is not surprised.",
    "stress": "",
    "cost": "16",
    "drawback": "House Kurogane elite military units. Requires compatible installation in all synchronized members."
  },
  "MILITARY-GRADE COMBAT CHASSIS": {
    "tier": "Precursor",
    "benefit": "Superior physical statistics as listed. Integrated weapons equivalent to Tier 3 weapons. Heavy armor equivalent to military battle plate. Speed 150% of normal. EMP resistance (save at Advantage; effects reduced to 1 round on failure).",
    "stress": "",
    "cost": "25",
    "drawback": "House Kurogane military exclusive. Not available for civilian purchase."
  },
  "SUPERINTELLIGENCE CORE": {
    "tier": "Precursor",
    "benefit": "+4 to all Knowledge checks. Can take 20 on any Knowledge check instantly (representing rapid exhaustive analysis). Once per session, may ask the Keeper one question about the logical implications of current situation.",
    "stress": "",
    "cost": "25",
    "drawback": "House Kurogane highest-level research assets. Extremely rare; possibly fewer than 100 individuals in the galaxy have this augmentation."
  },
  "TACTICAL GESTALT PROCESSOR": {
    "tier": "Precursor",
    "benefit": "All gestalt-linked characters act on the highest Spotlight position in the group. Coordinated attacks gain +2 to strike. Flanking bonuses doubled. Once per encounter, the entire gestalt may act simultaneously on a single Spotlight order.",
    "stress": "",
    "cost": "16",
    "drawback": "House Kurogane military elite, specialized mercenary units. Requires linked installation across all gestalt members."
  },
  "TOTAL SENSORY REPLACEMENT": {
    "tier": "Precursor",
    "benefit": "All benefits of component systems; immune to sensory overload attacks; can perceive through deployed sensor drones within 1km.",
    "stress": "",
    "cost": "16",
    "drawback": "House Kurogane highest-tier specialists. Extremely rare; typically reserved for key intelligence assets."
  }
};

const GEAR_DATA = {
  "Basic Medkit": {
    "tier": "Common",
    "use": "First Aid actions (Chapter 10)",
    "cost": "1"
  },
  "Climbing Kit": {
    "tier": "Common",
    "use": "Advantage on climbing rolls",
    "cost": "1"
  },
  "Datapad": {
    "tier": "Common",
    "use": "Standard computing, files",
    "cost": "1"
  },
  "Environmental Suit": {
    "tier": "Common",
    "use": "Weather, mild atmospheres",
    "cost": "1"
  },
  "Field Rations": {
    "tier": "Common",
    "use": "One week food, single character",
    "cost": "1"
  },
  "Lock-Pick Kit": {
    "tier": "Common",
    "use": "Scoundrel Class Item; locks",
    "cost": "1"
  },
  "Personal Comm": {
    "tier": "Common",
    "use": "Line-of-sight to local relay",
    "cost": "1"
  },
  "Personal Logbook": {
    "tier": "Common",
    "use": "Explorer Class Item; recorded entries",
    "cost": "1"
  },
  "Repair Nanites, Mender Vial": {
    "tier": "Common",
    "use": "Inject (Synthetic only): clear 1d4 HP",
    "cost": "2"
  },
  "Survey Instruments": {
    "tier": "Common",
    "use": "Explorer Class Item; mapping",
    "cost": "1"
  },
  "Tool Belt": {
    "tier": "Common",
    "use": "Engineer Class Item; general repairs",
    "cost": "1"
  },
  "Welding Rig": {
    "tier": "Common",
    "use": "Welding/cutting; structural work",
    "cost": "1"
  },
  "Atmospheric Mask": {
    "tier": "Military",
    "use": "Filters most toxic atmospheres",
    "cost": "4"
  },
  "Cold-Weather Suit": {
    "tier": "Military",
    "use": "No Stress from extreme cold",
    "cost": "4"
  },
  "Combat Engineer Kit": {
    "tier": "Military",
    "use": "Advanced repairs and construction",
    "cost": "4"
  },
  "Encrypted Comm": {
    "tier": "Military",
    "use": "Same range; resistant to interception",
    "cost": "4"
  },
  "Encrypted Datapad": {
    "tier": "Military",
    "use": "Resistant to standard surveillance",
    "cost": "4"
  },
  "Field Medkit": {
    "tier": "Military",
    "use": "First Aid at +2 to rolls",
    "cost": "4"
  },
  "Hacking Kit": {
    "tier": "Military",
    "use": "Advantage on system-intrusion rolls",
    "cost": "4"
  },
  "Industrial Plasma Cutter": {
    "tier": "Military",
    "use": "Cuts through standard materials",
    "cost": "4"
  },
  "Long-Range Comm": {
    "tier": "Military",
    "use": "Inter-system, via standard relay",
    "cost": "4"
  },
  "Repair Nanites, Reconstructor": {
    "tier": "Military",
    "use": "Inject (Synthetic only): clear 1d4+2 HP",
    "cost": "5"
  },
  "Sensor Array": {
    "tier": "Military",
    "use": "Wide-area detection, 100m radius",
    "cost": "4"
  },
  "Surgical Kit": {
    "tier": "Military",
    "use": "Medical Technician subclass tools",
    "cost": "4"
  },
  "Trauma Kit": {
    "tier": "Military",
    "use": "Stabilize Dying at DC 10",
    "cost": "4"
  },
  "Universal Key": {
    "tier": "Military",
    "use": "Defeats most commercial locks",
    "cost": "4"
  },
  "Universal Translator": {
    "tier": "Military",
    "use": "Real-time translation, most languages",
    "cost": "4"
  },
  "Vacuum Suit": {
    "tier": "Military",
    "use": "Pressurized, two hours air",
    "cost": "4"
  },
  "Cryo-Stasis Pod": {
    "tier": "Experimental",
    "use": "Suspend a Dying character indefinitely",
    "cost": "9"
  },
  "Long-Duration Vacuum Suit": {
    "tier": "Experimental",
    "use": "Twelve hours air, self-repairing seals",
    "cost": "9"
  },
  "Portable Fabricator": {
    "tier": "Experimental",
    "use": "Produces basic components",
    "cost": "9"
  },
  "Quantum Comm": {
    "tier": "Experimental",
    "use": "Inter-system, instantaneous, no relay",
    "cost": "9"
  },
  "Quantum Crystal": {
    "tier": "Experimental",
    "use": "Long-range comms (Chapter 16)",
    "cost": "9"
  },
  "Repair Nanites, Apex Swarm": {
    "tier": "Experimental",
    "use": "Inject (Synthetic only): clear 2d4+2 HP and 1 Stress",
    "cost": "9"
  },
  "Stealth-Field Generator": {
    "tier": "Experimental",
    "use": "Hidden condition for 1 minute, scene-limited",
    "cost": "9"
  },
  "Synthetic Tissue Pack": {
    "tier": "Experimental",
    "use": "Replace minor wounds in 24h",
    "cost": "9"
  },
  "Vault Kit": {
    "tier": "Experimental",
    "use": "High-security access",
    "cost": "9"
  },
  "AUGMENTATION INSTALLATION": {
    "tier": "Common",
    "use": "Installation of cybernetic augmentations. Recovery time varies.",
    "cost": "0"
  },
  "BASIC MEDICAL CARE": {
    "tier": "Common",
    "use": "Full recovery of all HP over 1 day of rest. Treatment of minor diseases and injuries.",
    "cost": "1"
  },
  "BASIC TOOLS OMNI-TOOL": {
    "tier": "Common",
    "use": "Having an omni-tool allows basic interaction with technology, communication with others, and simple repairs. It's required for many technical tasks and assumed for character competence.",
    "cost": "1"
  },
  "BEACON (EMERGENCY)": {
    "tier": "Common",
    "use": "",
    "cost": "1"
  },
  "BINOCULARS (ENHANCED)": {
    "tier": "Common",
    "use": "20x magnification with image stabilization. Low-light capability. Integrated range finder accurate to 2km.",
    "cost": "1"
  },
  "BYPASS EQUIPMENT LOCK PICK SET (MANUAL)": {
    "tier": "Common",
    "use": "Required for picking mechanical locks. Allow Agility check to open locks without key.",
    "cost": "1"
  },
  "CLOTHING AND PERSONAL EFFECTS CLOTHING (STANDARD SET)": {
    "tier": "Common",
    "use": "Standard clothing provides no mechanical benefits but is assumed for normal social interaction. Not having appropriate clothing may impose social penalties.",
    "cost": "0"
  },
  "COMMUNICATIONS EQUIPMENT COMMUNICATOR (STANDARD)": {
    "tier": "Common",
    "use": "",
    "cost": "1"
  },
  "COMPASS (UNIVERSAL)": {
    "tier": "Common",
    "use": "",
    "cost": "0"
  },
  "CONTAINERS AND CARRYING BACKPACK (STANDARD)": {
    "tier": "Common",
    "use": "Increases carrying capacity by 4 Burden. Items in the backpack are not immediately accessible (require an Action to retrieve in combat).",
    "cost": "1"
  },
  "EMERGENCY BREATHER": {
    "tier": "Common",
    "use": "",
    "cost": "1"
  },
  "ENTERTAINMENT DEVICE": {
    "tier": "Common",
    "use": "Prevents morale degradation during extended downtime. May provide +1 to recovery during long rests if specifically relevant to character's interests.",
    "cost": "1"
  },
  "FIRE STARTING KIT": {
    "tier": "Common",
    "use": "Can reliably start fires in any condition where fire is physically possible. Burns even damp material.",
    "cost": "0"
  },
  "FIRST AID AND FIELD MEDICINE FIRST AID KIT": {
    "tier": "Common",
    "use": "Using the kit to treat injuries requires an Action and a Knowledge check. On success, the patient recovers 1d4 HP and any bleeding is stopped. The kit has no effect on injuries that have already received first aid.",
    "cost": "1"
  },
  "GLOW-STICKS (PACK)": {
    "tier": "Common",
    "use": "Each stick provides dim light (5m radius) for 8 hours. Available in multiple colors for coding and marking.",
    "cost": "0"
  },
  "GRAPPLING HOOK": {
    "tier": "Common",
    "use": "Can be thrown (Agility, DC based on distance and surface) to anchor for climbing or crossing gaps.",
    "cost": "1"
  },
  "LIGHTING FLASHLIGHT (STANDARD)": {
    "tier": "Common",
    "use": "Illuminates 30m cone. Lasts 24 hours continuous use.",
    "cost": "0"
  },
  "MISCELLANEOUS EQUIPMENT ROPE (50M)": {
    "tier": "Common",
    "use": "Supports up to 500 kg. Various uses limited by creativity and circumstances.",
    "cost": "0"
  },
  "NAVIGATION AND ORIENTATION NAVIGATION COMPUTER (HANDHELD)": {
    "tier": "Common",
    "use": "",
    "cost": "1"
  },
  "PERSONAL HYGIENE KIT": {
    "tier": "Common",
    "use": "Prevents hygiene-related complications. Assumed equipment for normal living.",
    "cost": "0"
  },
  "PHARMACEUTICALS STIM-PACK": {
    "tier": "Common",
    "use": "As an Action, inject to recover 1d6 HP and ignore pain-based penalties and effects for 10 minutes. When the effect ends, suffer 1 Stress. A character can only benefit from one stim-pack per combat encounter; additional uses provide no benefit.",
    "cost": "1"
  },
  "PORTABLE LAMP": {
    "tier": "Common",
    "use": "Illuminates 10m radius. Can be hung, placed, or attached to surfaces.",
    "cost": "1"
  },
  "RATION PACK (STANDARD)": {
    "tier": "Common",
    "use": "",
    "cost": "0"
  },
  "RECONSTRUCTIVE NANITES": {
    "tier": "Common",
    "use": "Inject as an Action into a Synthetic or other mechanical body (self or a willing mechanical ally within Melee). The Mender Vial clears 1d4 HP, the Reconstructor clears 1d4+2 HP, and the Apex Reconstruction Swarm clears 2d4+2 HP and 1 Stress. Organic characters gain no benefit. A vial can instead patch a small object, restore 1 Armor Score, or temporarily hold one small ship or vehicle system together in an emergency; it cannot perform full vehicle or hull repair.",
    "cost": "2"
  },
  "REGENERATIVE TREATMENT": {
    "tier": "Common",
    "use": "Regrowth of lost limbs or organs over 1-4 weeks. Requires specialized facilities.",
    "cost": "9"
  },
  "RESTRAINTS AND CONTROL RESTRAINTS (STANDARD)": {
    "tier": "Common",
    "use": "Restrained characters cannot use their hands or move faster than a slow walk. Escaping requires Strength check (DC 15) or Agility check (DC 15). Augmented strength may reduce DC.",
    "cost": "0"
  },
  "RESURRECTION": {
    "tier": "Common",
    "use": "Revival of recently deceased patients (within 24-48 hours of death). Not always successful; not always complete. The process is traumatic and may result in personality changes or memory loss.",
    "cost": "25"
  },
  "SEALED CONTAINER": {
    "tier": "Common",
    "use": "Contents protected from water, vacuum, impact, and most environmental hazards. Container is lockable.",
    "cost": "1"
  },
  "SENSORS AND SCANNERS SCANNER (GENERAL PURPOSE)": {
    "tier": "Common",
    "use": "Can detect life signs, power sources, and environmental hazards within range. Grants +1 to Awareness checks in scanner range.",
    "cost": "1"
  },
  "SHELTER AND CAMP EQUIPMENT SURVIVAL TENT (BASIC)": {
    "tier": "Common",
    "use": "",
    "cost": "1"
  },
  "SPECIALIZED EQUIPMENT WELDING RIG": {
    "tier": "Common",
    "use": "Required for welding and cutting operations. Can cut through standard metal barriers given time (1 minute per centimeter of thickness for steel; tougher materials take longer).",
    "cost": "1"
  },
  "SURVEILLANCE EQUIPMENT RECORDING DEVICE (CONCEALED)": {
    "tier": "Common",
    "use": "Records audio and low-quality video for 24 hours. DC 15 to detect when concealed on a person; DC 20 when planted in a location.",
    "cost": "1"
  },
  "TACTICAL VEST": {
    "tier": "Common",
    "use": "Increases carrying capacity by 2 Burden. Items in the vest can be retrieved as part of another action (no Action cost to draw items).",
    "cost": "1"
  },
  "THERMAL REGULATION SUIT (TRS)": {
    "tier": "Common",
    "use": "",
    "cost": "1"
  },
  "TOOLKIT (BASIC)": {
    "tier": "Common",
    "use": "Required for mechanical repairs. Allows maintenance and basic repairs on Tier 1-2 equipment. Repairs on higher-tier equipment require better tools.",
    "cost": "1"
  },
  "TRAUMA SURGERY": {
    "tier": "Common",
    "use": "Treatment of severe injuries, restoration of lost HP, treatment of conditions requiring surgery. Recovery time: 1-7 days depending on severity.",
    "cost": "4"
  },
  "WATER PURIFIER (PERSONAL)": {
    "tier": "Common",
    "use": "",
    "cost": "1"
  },
  "ANTITOXIN (UNIVERSAL)": {
    "tier": "Military",
    "use": "Inject as an Action. The character gains Advantage on their next Strength Reaction Roll against any poison currently affecting them, and ongoing poison damage is halted for 10 minutes.",
    "cost": "4"
  },
  "ATMOSPHERE PROCESSOR (PORTABLE)": {
    "tier": "Military",
    "use": "",
    "cost": "4"
  },
  "Advanced Trauma Kit": {
    "tier": "Military",
    "use": "Trained use (Medicine +2 or higher) allows treatment of severe wounds. Knowledge check (DC 15); on success, patient recovers 2d6 HP and critical conditions are stabilized. Untrained use functions as a first aid kit.",
    "cost": "4"
  },
  "BUG SWEEPER": {
    "tier": "Military",
    "use": "Detects most surveillance devices within range automatically. Sophisticated devices require a check (device's stealth DC vs. sweeper's detection, typically +4).",
    "cost": "4"
  },
  "COMBAT DRUG COCKTAIL": {
    "tier": "Military",
    "use": "Inject as Action (or as Free Action with Combat Drug Injector augmentation). Effects last 1 minute. When effect ends, suffer 1d4 Stress. Additional doses within 24 hours cause cumulative +1d4 Stress per dose.",
    "cost": "4"
  },
  "COMMUNICATOR (LONG-RANGE)": {
    "tier": "Military",
    "use": "System-wide communication where relays exist. +2 to checks involving communications (intercepting, jamming, enhancing).",
    "cost": "4"
  },
  "COMPUTER TERMINAL (PORTABLE)": {
    "tier": "Military",
    "use": "Required for complex hacking attempts and data operations. Grants +2 to computer-related checks. Can run software too demanding for an omni-tool.",
    "cost": "4"
  },
  "DETECTION EVASION STEALTH SUIT (BASIC)": {
    "tier": "Military",
    "use": "+2 to Stealth checks. Reduces thermal signature, making thermal detection more difficult.",
    "cost": "4"
  },
  "DISGUISE KIT": {
    "tier": "Military",
    "use": "+2 to Deception checks involving disguise. Allows disguise as generic different person (not specific individuals, that requires identity mask or similar technology).",
    "cost": "4"
  },
  "ELECTRONIC BYPASS KIT": {
    "tier": "Military",
    "use": "Required for bypassing electronic locks. Allows Knowledge check to defeat electronic security. Kit provides +2 to such checks.",
    "cost": "4"
  },
  "FORMAL WEAR": {
    "tier": "Military",
    "use": "+1 to social checks in appropriate high-status contexts. May be required for access to certain events or locations.",
    "cost": "4"
  },
  "GEOLOGICAL SCANNER": {
    "tier": "Military",
    "use": "Provides detailed information about underground features, mineral content, and geological hazards. Can locate underground caves, bunkers, and similar structures.",
    "cost": "4"
  },
  "LIFE SIGN DETECTOR": {
    "tier": "Military",
    "use": "Automatically detects all living creatures within range unless specifically shielded. Can determine species type, general health, and whether subjects are alive, dying, or recently deceased.",
    "cost": "4"
  },
  "MEDIC'S FIELD BAG": {
    "tier": "Military",
    "use": "Provides advantage on Knowledge Rolls using medical training for field treatment. Contains supplies for 10 significant treatments before restocking. Includes drugs and equipment not available in smaller kits.",
    "cost": "4"
  },
  "MEDICAL DEVICES DIAGNOSTIC SCANNER": {
    "tier": "Military",
    "use": "Using the scanner on a patient provides detailed information about their medical condition, including hidden injuries, diseases, and toxins. Grants +2 to Knowledge Rolls using medical training for diagnosis.",
    "cost": "4"
  },
  "PLASMA CUTTER (INDUSTRIAL)": {
    "tier": "Military",
    "use": "Cuts through standard materials at 1 centimeter per Action. Can cut through armored materials given time. Not usable as an effective weapon (improvised weapon stats if attempted).",
    "cost": "4"
  },
  "RAD-SUIT": {
    "tier": "Military",
    "use": "",
    "cost": "4"
  },
  "RADIATION TREATMENT": {
    "tier": "Military",
    "use": "Removes radiation sickness and halts radiation damage progression. The character is fatigued for 24 hours after treatment (disadvantage on physical checks).",
    "cost": "4"
  },
  "REMOTE DRONE (UTILITY)": {
    "tier": "Military",
    "use": "Can be remotely piloted to observe and perform simple tasks. Camera feed transmitted to controller. Manipulator arms can handle objects up to 1 kg. The drone has minimal combat capability (fragile, no weapons).",
    "cost": "4"
  },
  "RESTRAINTS (REINFORCED)": {
    "tier": "Military",
    "use": "Escape DC 20 (Strength) or DC 20 (Agility). Shock deterrent can be activated to inflict 1d4 Stress on struggling subject.",
    "cost": "4"
  },
  "SCANNER (ADVANCED)": {
    "tier": "Military",
    "use": "Extended range and penetration (see through walls up to 1m thick). Can identify detected objects with detailed information. Grants +2 to Awareness checks; can detect cloaked or hidden targets at -2.",
    "cost": "4"
  },
  "SECURITY CASE": {
    "tier": "Military",
    "use": "Contents protected as sealed container. Biometric lock (DC 20 to bypass). Optional destruction mechanism destroys contents if bypass fails.",
    "cost": "4"
  },
  "SIGNAL SCRAMBLER": {
    "tier": "Military",
    "use": "Communications within range cannot be intercepted without defeating the scrambler first (Knowledge check, DC 15). Scrambler can also jam all communications in range if desired.",
    "cost": "4"
  },
  "STABILIZER": {
    "tier": "Military",
    "use": "Inject into a dying character (0 HP or below) as an Action. The character is stabilized and will not die from their current injuries for 1 hour, regardless of severity. However, they remain unconscious and cannot take actions. After 1 hour, they require actual medical treatment or they will resume dying.",
    "cost": "4"
  },
  "SURVEILLANCE DRONE": {
    "tier": "Military",
    "use": "Provides remote observation with high-quality recording. DC 15 to notice the drone when it's trying to remain hidden; DC 20 in darkness or poor visibility.",
    "cost": "4"
  },
  "SURVIVAL RATIONS (PREMIUM)": {
    "tier": "Military",
    "use": "",
    "cost": "2"
  },
  "SURVIVAL TENT (ENVIRONMENTAL)": {
    "tier": "Military",
    "use": "",
    "cost": "4"
  },
  "TOOLKIT (ADVANCED)": {
    "tier": "Military",
    "use": "Allows repairs on equipment up to Tier 4. Grants +2 to repair checks. Includes spare parts for common repairs.",
    "cost": "4"
  },
  "VOID-SEAL EMERGENCY SHELTER": {
    "tier": "Military",
    "use": "",
    "cost": "4"
  },
  "WATER RECLAIMER": {
    "tier": "Military",
    "use": "",
    "cost": "4"
  },
  "AUTO-DOC (PORTABLE)": {
    "tier": "Experimental",
    "use": "Allows full surgical treatment in field conditions. Can treat conditions that would normally require a medical facility. The auto-doc has limited supplies for 5 major treatments before restocking (4 Credits). Operator still makes Knowledge Rolls using medical training, but gains advantage and can attempt procedures beyond their training (DC increases by +2).",
    "cost": "9"
  },
  "EMERGENCY RESUSCITATION KIT": {
    "tier": "Experimental",
    "use": "Can be used on a character who died within the last 5 minutes. Knowledge check (DC 20); on success, the character returns to life at 1 HP with 3 Stress. On failure, the character is not recoverable through normal means. Each additional minute since death adds +2 to the DC.",
    "cost": "9"
  },
  "ENGINEERING DRONE (HEAVY)": {
    "tier": "Experimental",
    "use": "Can perform repair and construction tasks remotely. Manipulator strength equivalent to Strength +3. Includes integrated basic toolkit. Requires skilled operator to perform complex tasks (operator makes checks at -2 compared to doing the work themselves).",
    "cost": "9"
  },
  "HACKING RIG": {
    "tier": "Experimental",
    "use": "Required for complex hacking operations. Provides +4 to hacking checks. Can attempt intrusions that would be impossible with lesser equipment. Includes defensive capability against counter-intrusion.",
    "cost": "9"
  },
  "HOSTILE ENVIRONMENT SUIT (HES)": {
    "tier": "Experimental",
    "use": "",
    "cost": "9"
  },
  "IDENTITY MASK": {
    "tier": "Experimental",
    "use": "Wearer is another specific person. Requires either direct scanning of the target or detailed reference data. Deception checks to maintain the disguise are made at +4. Close inspection (DC 20) may reveal the mask.",
    "cost": "9"
  },
  "NEURAL INHIBITOR": {
    "tier": "Experimental",
    "use": "Subject cannot take voluntary actions while inhibitor is active. Removing the inhibitor requires specific authorization or a successful bypass check (DC 20). Forcing removal without bypass causes 2d6 damage to the subject.",
    "cost": "9"
  },
  "PREFAB SHELTER MODULE": {
    "tier": "Experimental",
    "use": "",
    "cost": "9"
  },
  "REGENERATIVE ACCELERANT": {
    "tier": "Experimental",
    "use": "Inject as Action. Over the next hour, the character recovers 2d6 HP. However, they must consume food and water equivalent to a full day's rations during this time or suffer 2 Stress from metabolic exhaustion.",
    "cost": "9"
  },
  "SENSOR GHOST": {
    "tier": "Experimental",
    "use": "Create a false sensor return at chosen location. Sensor systems must beat DC 15 to recognize the ghost as false. Duration: 10 minutes per use; 3 uses before recharge (1 hour).",
    "cost": "9"
  },
  "TOOLKIT (MASTER)": {
    "tier": "Experimental",
    "use": "Allows repairs on any equipment. Grants +4 to repair checks. Can attempt normally impossible field repairs at Keeper's discretion.",
    "cost": "9"
  },
  "CRYOGENIC STASIS POD": {
    "tier": "Precursor",
    "use": "A patient placed in stasis remains in exactly their current state indefinitely. Critical patients will not die while in stasis. Revival requires 1 hour and access to the stasis pod's controls. The pod requires external power; if power fails, the patient has approximately 12 hours of residual cooling before they begin to thaw.",
    "cost": "16"
  }
};

const DRONE_GRADE_DATA = {
  "Common Drone": {
    "tier": "Military",
    "cost": "4 Cr",
    "hp": "2",
    "evasion": "10",
    "thresholds": "5 / 11",
    "armor": "0",
    "modules": "2",
    "availability": "Civilian, commercial, frontier markets"
  },
  "Military Drone": {
    "tier": "Experimental",
    "cost": "8 Cr",
    "hp": "3",
    "evasion": "11",
    "thresholds": "7 / 14",
    "armor": "1",
    "modules": "3",
    "availability": "Restricted, licensed, House security"
  },
  "Experimental Drone": {
    "tier": "Precursor",
    "cost": "16 Cr",
    "hp": "5",
    "evasion": "12",
    "thresholds": "9 / 16",
    "armor": "2",
    "modules": "4",
    "availability": "Rare, unstable, black-site, prototype"
  },
  "Swarm Cell": {
    "tier": "Military",
    "cost": "2 Cr each",
    "hp": 1,
    "evasion": "",
    "thresholds": "",
    "armor": 0,
    "modules": "",
    "availability": ""
  },
  "House Sentinel": {
    "tier": "Experimental",
    "cost": "12 Cr",
    "hp": 4,
    "evasion": "",
    "thresholds": "",
    "armor": 2,
    "modules": "",
    "availability": ""
  },
  "Industrial Hauler": {
    "tier": "Experimental",
    "cost": "10 Cr",
    "hp": 5,
    "evasion": "",
    "thresholds": "",
    "armor": 1,
    "modules": "",
    "availability": ""
  },
  "Black-Site Chimera": {
    "tier": "Precursor",
    "cost": "24+ Cr",
    "hp": 6,
    "evasion": "",
    "thresholds": "",
    "armor": 2,
    "modules": "",
    "availability": ""
  },
  "War-Frame": {
    "tier": "Precursor",
    "cost": "20 Cr",
    "hp": 6,
    "evasion": "",
    "thresholds": "",
    "armor": 3,
    "modules": "",
    "availability": ""
  }
};

const DRONE_MODULE_DATA = {
  "Compliance Taser": {
    "tier": "Common",
    "cost": "4 Cr",
    "slots": "2",
    "use": "Close non-lethal attack; mark 1 Stress and force drop/stumble/stun if fiction allows"
  },
  "Flight Module": {
    "tier": "Common",
    "cost": "2 Cr",
    "slots": "1",
    "use": "Hover, cross gaps, move vertically, fly at low speed; -2 stealth while flying"
  },
  "Hardened Link": {
    "tier": "Common",
    "cost": "2 Cr",
    "slots": "1",
    "use": "Resists interference; does not resist hard Lost zones"
  },
  "Low-Light Camera": {
    "tier": "Common",
    "cost": "1 Cr",
    "slots": "0",
    "use": "See in darkness; remote visual feed"
  },
  "Medical Scanner": {
    "tier": "Common",
    "cost": "2 Cr",
    "slots": "1",
    "use": "Reads vitals and triage data"
  },
  "Neural Network Control": {
    "tier": "Common",
    "cost": "1 Cr",
    "slots": "0",
    "use": "Registered crew can take control by turns; moves spotlight, not action economy"
  },
  "Smoke/Flash Pod": {
    "tier": "Common",
    "cost": "2 Cr",
    "slots": "1",
    "use": "One-use escape, distraction, breach window, or Advantage on reposition/infiltration"
  },
  "Stun Dart": {
    "tier": "Common",
    "cost": "4 Cr",
    "slots": "2",
    "use": "Close/Far non-lethal attack; 1d6 non-lethal physical or mark 1 Stress"
  },
  "Wall-Crawler": {
    "tier": "Common",
    "cost": "1 Cr",
    "slots": "1",
    "use": "Climb walls, ceilings, ducts, and uneven surfaces"
  },
  "Armor Plating": {
    "tier": "Military",
    "cost": "4 Cr",
    "slots": "1",
    "use": "Gain +1 Armor Slot; -1 Evasion while flying/sneaking/evading/tight terrain"
  },
  "Micro-Laser": {
    "tier": "Military",
    "cost": "4 Cr",
    "slots": "2",
    "use": "Far attack; 1d6 energy; precise but heat/beam traceable"
  },
  "Military Flight Module": {
    "tier": "Military",
    "cost": "6 Cr",
    "slots": "1",
    "use": "Controlled tactical flight; +1 to maneuver/evade/chase/reposition/pilot drone"
  },
  "Military Stealth Shell": {
    "tier": "Military",
    "cost": "8 Cr",
    "slots": "1",
    "use": "+2 stealth while moving slowly and avoiding loud modules"
  },
  "Target Painter": {
    "tier": "Military",
    "cost": "4 Cr",
    "slots": "1",
    "use": "Mark one target; next ally attacking gains Advantage or equivalent"
  }
};

const DOMAIN_DATA = {
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
  "Lux": {
    "label": "LIGHT",
    "theme": "The Hope Frequency",
    "desc": "Hope and light as measurable force: shielding, illumination, revelation, guidance, photonic energy, and anti-Void work.",
    "l1": [
      "Blinding Flash",
      "Spark of Hope",
      "Wayfinder's Pulse"
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
  "Void": {
    "label": "VOID",
    "theme": "The Threads of Probability",
    "desc": "Space, shadow, luck, displacement, probability, stealth, and impossible escapes.",
    "l1": [
      "Slipstream Jolt",
      "Temporal Cloak",
      "Vector Calculus"
    ]
  }
};

const DOMAIN_POWER_DATA = {
  "Kinetic": [
    {
      "name": "Force Shield",
      "level": 1,
      "meta": "Ability (Reaction) · 1 Hope",
      "rc": "1",
      "desc": "Reaction. When you or an ally in Very Close range is hit by an attack, you may Spend 1 Hope to create a kinetic barrier. You provide +3 Evasion against that attack. If the attack misses due to this bonus, the attacker takes (Proficiency)×d4 Physical damage with the Kinetic tag."
    },
    {
      "name": "Kinetic Blast",
      "level": 1,
      "meta": "Ability · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope when making a melee attack. Hit: Deal Weapon Damage + Kinetic Trait + 1d8 Physical damage with the Kinetic tag. Empower: You may spend up to 2 additional Hope (3 Hope total) at the moment of the strike. For each additional Hope spent, add 1 die of (Proficiency)d6 Physical damage with the Kinetic tag. Ballistic Impact: If total damage triggers Overkill (exceeds Major Threshold +10), target is Pushed Short distance. If they collide with a solid object, they are knocked Prone."
    },
    {
      "name": "Tactical Overwatch",
      "level": 1,
      "meta": "Ability (Reaction) · 1 Hope",
      "rc": "0",
      "desc": "Reaction. When an ally in Close range is targeted by an attack, you may Spend 1 Hope. They gain Advantage on\n\ntheir defense and 2 temporary Armor Slots until the start of your next turn."
    },
    {
      "name": "Impact Absorption",
      "level": 2,
      "meta": "Ability (Reaction) · 1 Stress",
      "rc": "2",
      "desc": "Reaction. When taking physical damage, you may Mark 1 Stress. Reduce the incoming damage by (Proficiency)×d6+2. On your next turn, you can add the absorbed amount to one attack's damage or gain +2 movement speed."
    },
    {
      "name": "Kinetic Barrier",
      "level": 2,
      "meta": "Ability · 1 Stress",
      "rc": "1",
      "desc": "Mark 1 Stress. You create a protective force field around yourself for one scene. You gain +1 Evasion and Resistance to Physical damage. The barrier absorbs up to 10 damage before dissipating."
    },
    {
      "name": "Protective Dome",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Strength Spellcast Roll (DC 15). You create a 5m radius kinetic dome for 10 minutes. It provides occupants with +2 Evasion and blocks area attacks from outside. Enemies must pass a DC 15 Strength check to enter. On a Success with Hope: The dome heals everyone inside for 1 HP per round."
    },
    {
      "name": "Velocity Surge",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Agility Spellcast Roll (DC 15). You enhance your reflexes for one scene. You gain +2 on all Agility rolls, double your movement speed, and can move through enemy spaces without provoking attacks. On a Success with Hope: You gain Advantage on the next Spotlight contest."
    },
    {
      "name": "Guardian's Aegis",
      "level": 4,
      "meta": "Spell · 2 Hope",
      "rc": "2",
      "desc": "Presence Spellcast Roll (DC 15). Designate up to 3 allies in Close range for one scene. When they would take damage, you may use your reaction to take half of it instead. You gain +1 Evasion for each protected ally. On a Success with Hope: You may redirect any damage you take this way as an immediate attack against a nearby enemy."
    },
    {
      "name": "Precision Strike",
      "level": 4,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Finesse Spellcast Roll (DC 15). Choose one target within Far range. Make a ranged kinetic attack that deals (Proficiency)×d10 Physical damage with the Kinetic tag. This attack ignores cover and shield bonuses. On a Success with Hope: The target is also Staggered (loses their Reaction until the end of their next turn)."
    },
    {
      "name": "Kinetic Mastery",
      "level": 5,
      "meta": "Spell · 2 Hope",
      "rc": "2",
      "desc": "Strength Spellcast Roll (DC 15). You gain perfect kinetic control for one scene. Choose one: walk on walls/ceilings OR gain immunity to forced movement and fall damage. On a Success with Hope: Extend the benefit to all allies in Close range."
    },
    {
      "name": "Shockwave Pulse",
      "level": 5,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Strength Spellcast Roll (DC 20). You unleash a kinetic pulse in a 10m radius. Choose one: Protective (all allies gain +2 Evasion for 1 round and heal 1d4 HP) or Offensive (all enemies take (Proficiency)×d12 Physical damage with the Kinetic tag and are knocked prone). On a Success with Hope: Create both effects."
    },
    {
      "name": "Energy Cascade",
      "level": 6,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Strength Spellcast Roll (DC 20). A chain reaction affects all enemies in Far range for 1 minute. Each round, they must pass a DC 15 Agility check or take (Proficiency)×d8 Physical damage with the Kinetic tag and be pushed one range increment away. The damage increases by +1 each round. Failure: The cascade affects you and your allies instead."
    },
    {
      "name": "Force Fortress",
      "level": 6,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Strength Spellcast Roll (DC 20). You create a massive kinetic fortress with 50 HP, Evasion 18, that lasts 1 hour and provides total cover. Failure: The fortress collapses immediately, dealing 1d8 damage to occupants."
    },
    {
      "name": "Orbital Lance",
      "level": 7,
      "meta": "Spell · 2 Hope + 2 Stress",
      "rc": "3",
      "desc": "Strength Spellcast Roll (DC 20). Cost: 2 Hope + 2 Stress. Call an orbital strike on a point in Very Far range (cannot target moving ships). Deals 4d10 Physical damage with the Kinetic tag in a 5m radius, ignoring cover. Failure: Misses by 1d4 range increments. Energy discharge deals 1 Hull Stress to your ship/location."
    },
    {
      "name": "Temporal Freeze",
      "level": 7,
      "meta": "Spell · 3 Hope + 1 Stress",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 20). You control all momentum in Close range for one round. You may stop all moving objects or accelerate up to 3 objects/targets. Failure: Massive kinetic feedback leaves you Stunned for 1 round and you suffer 2 Stress."
    },
    {
      "name": "Singularity Well",
      "level": 8,
      "meta": "Spell · 3 Hope + 1 Stress",
      "rc": "3",
      "desc": "Strength Spellcast Roll (DC 25). You manipulate gravity in a 100m radius for 1 hour. You can create areas of high/low gravity (Disadvantage/Advantage on movement rolls) or anti-gravity (flight). Failure: You suffer Disadvantage on all Agility checks for 1d6 days from internal gravity fluctuations, \\*OR\\* until you spend a full rest session recalibrating your kinetic attunement."
    },
    {
      "name": "Tactical Aegis",
      "level": 8,
      "meta": "Spell · 3 Hope + 3 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20). You create a kinetic barrier around a starship or settlement (Tier 5 Asset). The shield has 100 HP and protects against large-scale attacks for one scene/combat. Cost: 3 Hope + 3\n\nStress. Failure: The target location gains Vulnerable for 1 round."
    },
    {
      "name": "Asteroid Redirect",
      "level": 9,
      "meta": "Spell · 3 Hope + 2 Stress",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 25). You manipulate a small asteroid field to impact a target ship (Tier 3-4), dealing 3 Hull Damage. Failure: The impact is misdirected, dealing 3 Hull Damage to your own ship instead."
    },
    {
      "name": "Indomitable Bastion",
      "level": 9,
      "meta": "Spell · 3 Hope + 2 Stress",
      "rc": "3",
      "desc": "Strength Spellcast Roll (DC 25). You create a massive kinetic fortress with 150 HP, Evasion 18, that lasts 1 hour and provides total cover. Failure: The barrier collapses catastrophically, dealing 3d12 Physical damage with the Kinetic tag to all occupants."
    },
    {
      "name": "Absolute Command",
      "level": 10,
      "meta": "Spell · 5 Hope + 5 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Strength Spellcast Roll (DC 30). For one week, you may apply the Massive or Stunning feature to any weapon damage roll. Cost: 5 Hope and 5 Stress. Failure: Disadvantage on all Agility and movement rolls until completing a mythic quest (approximately one story arc) to restore your kinetic connection."
    },
    {
      "name": "Force Incarnate",
      "level": 10,
      "meta": "Spell · 5 Hope + 5 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Strength Spellcast Roll (DC 30). Cost: 5 Hope + 5 Stress. You unmake the boundary between body and motion. Until your next Long Rest, you exist as pure kinetic energy: you gain Immunity to Physical damage and may Teleport up to Far range as a free action. While in this state, you cannot use any equipment that requires hands, your form is energy, not matter, and your speech registers as concussive thrumming rather than language. Renewal: At the start of each subsequent Long Rest, you may pay 3 Hope + 1 Stress to extend the state by another rest cycle. The decision is made before any other Long Rest benefits resolve. Once you let the state end (or fail to pay the renewal cost), you cannot re-enter Force Incarnate for the remainder of the campaign, the cosmos remembers your retreat. Failure: The transformation tears your form apart instead of weaving it. You take 4d12 damage (Threshold-applied), the Keeper gains 4 Fear, and Force Incarnate is unavailable for the remainder of the campaign."
    }
  ],
  "Lux": [
    {
      "name": "Blinding Flash",
      "level": 1,
      "meta": "Ability (Reaction) · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope. All enemies within Close range must make an Instinct Reaction Roll (DC 10). On failure, they suffer Disadvantage on their next attack. On a critical failure, they are Dazed for 1 round."
    },
    {
      "name": "Spark of Hope",
      "level": 1,
      "meta": "Ability · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope. Touch an ally within Close range. They clear 1 Stress. You cannot target yourself."
    },
    {
      "name": "Wayfinder's Pulse",
      "level": 1,
      "meta": "Ability · 1 Hope",
      "rc": "1",
      "desc": "Spend 1 Hope. You emit a pulse of light visible only to you. The pulse reveals the following within Far range: the direction and approximate distance of the nearest significant threat (hostile creature, trap, ambush), the nearest exit or navigable path, and any hidden or concealed objects of value or importance. The information is directional, not precise --- you know where, not what. The pulse does not penetrate solid walls thicker than 1 meter."
    },
    {
      "name": "Eyes of Truth",
      "level": 2,
      "meta": "Ability · 1 Stress",
      "rc": "1",
      "desc": "Mark 1 Stress. For the remainder of the scene, you see through illusions, invisibility, and mundane disguise. You ignore all visibility penalties from darkness, smoke, or Veil distortion. You gain Advantage on Instinct checks to Perceive or Investigate. Additionally, you can read emotional intent --- you know when someone within Close range is lying, afraid, or hostile, though not the specific content of their thoughts (that is Neural territory)."
    },
    {
      "name": "Photon Shield",
      "level": 2,
      "meta": "Ability (Reaction) · 1 Stress",
      "rc": "1",
      "desc": "Reaction. Mark 1 Stress. When an ally within Close range takes HP damage from an attack, reduce the damage by your Tier + 2 before it is compared to Damage Thresholds. Against creatures with the Veil-Touched tag, the reduction is doubled."
    },
    {
      "name": "Aura of Clarity",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Cost: 1 Hope. Presence Spellcast Roll (DC 15). Cost: 1 Hope. Concentration. You and all allies within Close range are immune to the Frightened and Dazed conditions. While sustained, all allied Damage Thresholds within the aura increase by +1 (both Major and Severe). Concentration ends if you take Stress or are incapacitated."
    },
    {
      "name": "Stellar Lance",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Presence Spellcast Roll (DC 15). Ranged attack at Far range. Deal (Proficiency)×d8 Energy damage with the Radiant tag. Against targets wearing Heavy or Very Heavy armor, this attack gains the Devastating keyword. At Tier 2+, the target is marked as Illuminated until the end of your next turn: they cannot benefit from cover or stealth, and the next attack against them has Advantage."
    },
    {
      "name": "Deflection Prism",
      "level": 4,
      "meta": "Ability (Reaction) · 2 Hope",
      "rc": "2",
      "desc": "Spend 2 Hope as a Reaction. Redirect the attack to any other valid target within the original weapon's range. Resolve the original attack roll against the new target's Evasion.\n\n*Limitation: You cannot redirect the attack back at the original attacker. This power works only against ranged attacks, not melee attacks.*"
    },
    {
      "name": "Solar Judgment",
      "level": 4,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Cost: 1 Hope. Presence Spellcast Roll (DC 15). Area effect (Close range, 5m radius). Deal (Proficiency)×d6 Energy damage with the Radiant tag to all enemies in the area. Creatures with the Veil-Touched or Void tag that fail an Instinct Reaction Roll (DC 15) are Dazed for 1 round and cannot use Void powers until the end of their next turn."
    },
    {
      "name": "Beacon of Resurrection",
      "level": 5,
      "meta": "Spell · 3 Hope + 3 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20). Cost: 3 Hope + 3 Stress. You restore a fallen ally (who has reached 0 HP within the last round) to 1 HP. The revived ally acts at Disadvantage until the end of their next turn. After using this power, you cannot use any Lux power until you complete a Long Rest."
    },
    {
      "name": "Cartographer of the Unseen",
      "level": 5,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Instinct Spellcast Roll (DC 15). Cost: 1 Hope. For the remainder of the scene, you perceive the complete layout of the structure, installation, or natural environment within a 500-meter radius. You know every room, corridor, door, shaft, and hidden passage. You know where every creature larger than a rat is located and whether they are moving. You cannot determine identity or intent --- only position, count, and approximate size. This information updates in real time for the duration."
    },
    {
      "name": "Lightbridge",
      "level": 6,
      "meta": "Spell · 2 Hope",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20). Cost: 2 Hope. You teleport up to 3 willing creatures within Far range to any point you can see within Far range. On arrival, each teleported creature clears 1 Stress. The Keeper may impose an additional DC\n\nmodifier (+2) for distances exceeding visual range or for teleporting into contested areas."
    },
    {
      "name": "Photonic Detonation",
      "level": 6,
      "meta": "Spell · 2 Hope",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20). Cone (10m). Deal (Proficiency)×d10 Energy damage with the Radiant tag. This attack ignores physical cover and barricades (the light bends around them). Targets that fail an Agility Reaction Roll (DC 15) are Blinded for 1 round."
    },
    {
      "name": "Corona Beam",
      "level": 7,
      "meta": "Spell · 2 Hope",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20). Cost: 2 Hope. Line (20m, piercing). Deal (Proficiency × 2)×d8 Energy damage with the Radiant tag to all targets in the line. If any target is a lower Tier than you, add +10 to the total damage rolled against them before comparing to Damage Thresholds (this bonus stacks with normal Overkill rules)."
    },
    {
      "name": "Inviolable Sanctum",
      "level": 7,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20). Concentration. You create a 10m dome of hardened light. Nothing crosses the boundary in either direction without your explicit permission --- not weapons fire, not Void powers, not sound. Allies inside the dome recover 1 Stress per round. The dome persists for up to 1 minute or until your concentration is broken."
    },
    {
      "name": "Omniscient Eye",
      "level": 8,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 25). Cost: 2 Hope + 1 Stress. For 1 hour, you perceive everything within a 5-kilometer radius. Every creature, every vehicle, every energy signature, every hidden space. You can focus on any point within the radius and observe it as though you were standing there, including hearing conversations. Veil-distorted areas and psionic shielding appear as blank spots --- their absence is itself information. While using this power, your physical body is immobile and vulnerable."
    },
    {
      "name": "Solar Avatar",
      "level": 8,
      "meta": "Spell · 4 Hope",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 25). Cost: 4 Hope. Personal transformation lasting 3 rounds. While transformed: you gain flight, you are immune to physical damage (energy attacks still affect you), all your Lux attacks deal one additional Tier of damage (Major → Severe, Severe → direct HP damage at the Keeper's discretion), and you emit bright light to Far range that suppresses Void powers within the area (Void users must beat a contested Presence roll against you to activate any Void power). When the transformation ends, you gain 2 Stress."
    },
    {
      "name": "Pulse of Genesis",
      "level": 9,
      "meta": "Spell · Todo el Hope restante (mínimo 5)",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 25). Cost: All remaining Hope (minimum 5). You release a wave of purifying light across the entire sector. All Veil corruption, Void anomalies, and temporal distortions within the area are suppressed for 24 hours. Veil-Touched creatures of Tier 3 or lower are instantly destroyed. Creatures of Tier 4+ take 4d10 Energy damage with the Radiant tag."
    },
    {
      "name": "Stellar Chorus",
      "level": 9,
      "meta": "Spell · 3 Hope + 2 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 25). Cost: 3 Hope + 2 Stress. For the remainder of the scene, all allies within Far range add your Presence modifier to their attack rolls, Reaction Rolls, and Damage Thresholds. This does not stack with Aura of Clarity. When the effect ends, you fall unconscious for 1 hour."
    },
    {
      "name": "Apotheosis",
      "level": 10,
      "meta": "Spell · 5 Hope + 3 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Presence Spellcast Roll (DC 30). Cost: 5 Hope + 3 Stress. You collapse the boundary between yourself and the Hope Frequency itself, becoming, for one perfect moment, a fragment of stellar light made flesh. On activation: All allies within Far range heal HP equal to their current Severe Threshold and clear 1 Stress. All enemies within Far range take 6d10 Energy damage with the Radiant tag (no Thresholds, direct HP, ignores armor). Veil-Touched enemies take double damage from this effect. Vessel of Light: Until the end of the current scene, you cannot fall below 1 HP and your unarmed strikes deal 1d6 Energy damage with the Radiant tag in addition to their normal damage. When the scene ends, your body discorporates. You reform 24 hours later at the nearest star system, with 1 HP and 0 Stress. You cannot be resurrected by any other means during this 24-hour period. Failure: The light tears through you instead of through your enemies. You take 4d10 damage (Threshold-applied), the Keeper gains 4 Fear, and Apotheosis is unavailable for the remainder of the campaign."
    },
    {
      "name": "Eternal Beacon",
      "level": 10,
      "meta": "Spell · 5 Hope + 5 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Presence Spellcast Roll (DC 30). Cost: 5 Hope + 5 Stress. You create a permanent source of Lux energy at your current location --- a miniature star, a lighthouse, a monument of living light. The Beacon suppresses all Void influence within a planetary radius permanently. Ships within sensor range of the Beacon can navigate Veil storms without risk, and all Instinct-based navigation checks automatically succeed. Veil-Touched creatures cannot approach within Far range of the Beacon. The Beacon cannot be destroyed by any force below Tier 5."
    }
  ],
  "Neural": [
    {
      "name": "Mind Shield",
      "level": 1,
      "meta": "Ability (Reaction) · 1 Stress",
      "rc": "1",
      "desc": "Reaction. When targeted by a mental effect or Neural damage, you may Mark 1 Stress. Reduce incoming Neural damage by (Proficiency)×d6 and gain Advantage on any roll to resist the effect."
    },
    {
      "name": "Telekinetic Grasp",
      "level": 1,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Presence Spellcast Roll (DC 10). For 1 minute, you extend your psychic awareness into a single object within Far range, treating it as an extension of your own kinesthetic sense. You can move it with the precision of your own hands (up to 50 lbs), manipulating controls, retrieving items,\n\nweaving it through obstacles. As an action, you can hurl the tethered object at a target to deal (Proficiency)×d6 Void damage; the impact carries the force of focused will, not muscle."
    },
    {
      "name": "Veil Sensitivity",
      "level": 1,
      "meta": "Ability · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope. For one scene, you sense the surface emotions and thoughts of creatures within Close range. You gain Advantage on Instinct checks to detect lies and hostile intent."
    },
    {
      "name": "Memory Echo",
      "level": 2,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Instinct Spellcast Roll (DC 15) while touching an object or location. You experience a vivid impression of the most emotionally significant event that occurred there within the last week. On a Success with Hope: You can see events up to a month old and gain Advantage on your next roll related to the information."
    },
    {
      "name": "Synaptic Disruption",
      "level": 2,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Presence Spellcast Roll (DC 15) targeting a creature within Close range. Success: The target is Dazed (Disadvantage on Knowledge/Instinct rolls) until the end of its next turn. On a Success with Hope: The target is Stunned for 1 round instead."
    },
    {
      "name": "Empathic Network",
      "level": 3,
      "meta": "Ability · 1 Hope",
      "rc": "2",
      "desc": "Spend 1 Hope. Create a mental link with all willing allies in Far range for one scene. You share surface thoughts and feelings. When one member spends Hope, all others gain +1 to their next roll."
    },
    {
      "name": "Mind-Slip",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Cost: 1 Hope. Presence Spellcast Roll (DC 15). You impose your will on the motor cortex of one target within Close range. Choose one, Compel: The target takes a single involuntary step in any direction up to Far range; their body obeys you before they can resist. Stagger: The target falls Prone as their balance briefly fails them, neural confusion, not physical force. Field of Hesitation: Choose a small area within Close range; for one scene, any creature attempting to cross it must succeed on a Presence check (DC 10) or lose their action to a wave of psychic indecision. This functions as Tier 1 Cover against creatures who fail."
    },
    {
      "name": "Cordon of Will",
      "level": 4,
      "meta": "Spell · 1 Stress",
      "rc": "1",
      "desc": "Cost: 1 Stress. Knowledge Spellcast Roll (DC 15). You weave a zone of compelled stillness across a path, doorway, or threshold within Close range. Any creature attempting to cross must succeed on a Presence check (DC 15 + your Knowledge modifier) or find their will overridden, they cannot proceed and are Dazed until the start of their next turn. The Cordon itself has 10 effective HP; Neural damage dissolves it normally, while physical attacks pass straight through (the barrier exists in mind-space, not matter). A determined hostile may bypass the Cordon by spending 1 Stress as a free action, willpower breaks before the body. You can move the Cordon up to your speed as an action."
    },
    {
      "name": "Neural Feedback",
      "level": 4,
      "meta": "Ability (Reaction) · 1 Stress",
      "rc": "2",
      "desc": "Reaction. When an adversary in Close range deals damage to you, Presence Spellcast Roll (DC 15). Success: They take (Proficiency)×d8 Void damage and must pass a DC 15 Instinct check or become Vulnerable until the end of their next turn."
    },
    {
      "name": "Mind Spike",
      "level": 5,
      "meta": "Spell · 2 Hope",
      "rc": "2",
      "desc": "Presence Spellcast Roll (DC 20) against a creature in Far range. Success: Deal (Proficiency)×d12 Void damage ignoring armor. The target must make a DC 15 Presence check or be Stunned until the end of its next turn."
    },
    {
      "name": "Temporal Glimpse",
      "level": 5,
      "meta": "Spell · 2 Hope",
      "rc": "2",
      "desc": "Instinct Spellcast Roll (DC 15). Cost: 2 Hope. You gain a brief vision of one likely outcome. For your next turn only, you may use this vision to either gain Advantage on one roll OR force an enemy to reroll an attack against you."
    },
    {
      "name": "Collective Consciousness",
      "level": 6,
      "meta": "Spell · 2 Hope",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20). Cost: 2 Hope. You link the minds of up to 6 willing creatures in Far range for one scene. You share thoughts, senses, and experiences instantly across any distance."
    },
    {
      "name": "Psychic Storm",
      "level": 6,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20) targeting all adversaries in Close range. Success: Assault them with psychic energy, dealing (Proficiency)×d10 Void damage. They must pass a DC 15 Presence check or Mark 1 Stress."
    },
    {
      "name": "Mind Sanctuary",
      "level": 7,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Cost: 2 Hope + 1 Stress. Presence Spellcast Roll (DC 20). You raise a lattice of disciplined thought around yourself and your allies, sealing every mind in the area against intrusion. For one scene, you and all allies in Close range are immune to mental, social, and emotional manipulation effects (charm, fear, deception, intimidation, psychic intrusion, compulsion). Once during the scene, when an enemy would target you or an ally with such an effect, you may reflect the attempt back at its caster: they make the contested roll against themselves at Disadvantage. Failure: The lattice forms inverted. You and all allies in Close range have Disadvantage on Presence and Instinct rolls until the end of the scene; the Keeper gains 2 Fear."
    },
    {
      "name": "Veil Suppression",
      "level": 7,
      "meta": "Spell · 3 Hope + 1 Stress",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 20). Cost: 3 Hope + 1 Stress. You stabilize physics in a Very Far range area for one scene. All Void, Ethereal, and Precursor effects have Disadvantage on rolls within the area. Failure: The sudden stabilization causes a shockwave, dealing 1 Stress to all allies."
    },
    {
      "name": "Psychic Collapse",
      "level": 8,
      "meta": "Spell · 3 Hope + 1 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 25). Target one creature in Very Far range. Deal 3d8 Void damage ignoring armor. The target suffers Disadvantage on all rolls for 1 round. Failure: The damage rebounds, dealing 1d8 Void damage to you."
    },
    {
      "name": "Temporal Maelstrom",
      "level": 8,
      "meta": "Spell · 2 Stress",
      "rc": "3",
      "desc": "Mark 2 Stress and Instinct Spellcast Roll (DC 25). Create a reality distortion in Close range for one scene. All creatures in the area (including you) have Disadvantage on all rolls. Failure: You are immediately subjected to the Veil Storm effects until you clear 2 Stress."
    },
    {
      "name": "Destiny Weave",
      "level": 9,
      "meta": "Spell · 3 Stress",
      "rc": "3",
      "desc": "Mark 3 Stress. Instinct Spellcast Roll (DC 25). Force a complete reroll on any one roll you witness. You may modify the result by +3 or -3. Failure: You must apply the worst possible result to the roll and take 2 Stress."
    },
    {
      "name": "Psychic Fallout",
      "level": 9,
      "meta": "Spell · 5 Hope + 2 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 25). Affects all adversaries in Far range. Deal 3d6 Void damage. Targets make a DC 15 Instinct check or become Stunned for 1 round and Vulnerable for the scene. Cost: 5 Hope + 2 Stress. Failure: You are overwhelmed (Disadvantage on all rolls) for 1d4 rounds."
    },
    {
      "name": "Consciousness Bridge",
      "level": 10,
      "meta": "Spell · 3 Hope + 2 Stress",
      "rc": "3",
      "desc": "Mythic. Once per long rest. Presence Spellcast Roll (DC 30). Share consciousness with a willing target across a planetary system for one scene. You can both use each other's Abilities, Domain powers, and Traits. Failure: Minds clash, reducing the Instinct or Presence Trait of both targets by 1 until the next long rest."
    },
    {
      "name": "Veil Mastery",
      "level": 10,
      "meta": "Spell · 3 Hope + 1 Stress",
      "rc": "3",
      "desc": "Mythic. Once per session. Instinct Spellcast Roll (DC 30). Base cost: 3 Hope + 1 Stress. You synchronize with the quantum field, briefly becoming the field itself. Choose one foundational mode: Rewind: Undo the last Keeper turn. Restore 1 Hope and clear 1 Stress to each ally who was affected by it. Accelerate: Until the end of the next round, all allies gain 1 extra action on their turn. Restructure: Move all creatures and unattended objects within Far range up to your speed in any direction; this is not forced movement for combat purposes, bodies simply find themselves elsewhere. Deepening, Dream-Project (premium mode): Instead of a foundational mode, channel a sustained dreamform. Pay an additional 2 Hope + 1 Stress to enter the base illusion: up to 3 targets within Far range are caught in a shared psychic illusion lasting one scene; each cannot perceive baseline reality unless they succeed on a DC 15 Instinct check (re-attempt at the start of each of their turns). Allies caught in the area may opt-in to Lucid mode and act normally within the dream-construct. You may invest further at the moment of casting: +1 Hope adds 1 additional target (max 6) OR +2 to the escape DC (max 18); +1 Stress (paid alongside Hope investment) extends the duration to until the next Long Rest instead of one scene. Maximum total investment: 6 Hope + 3 Stress for 6 targets at DC 20 lasting until Long Rest. Failure: The effect inverts. Adversaries within Far range receive the chosen mode's benefit; you mark 4 Stress. If the chosen mode was Dream-Project, you are also Stunned for 1 round and have Disadvantage on Presence and Instinct rolls for the rest of the scene."
    }
  ],
  "Social": [
    {
      "name": "Linguistic Patch",
      "level": 1,
      "meta": "Ability · 1 Hope",
      "rc": "1",
      "desc": "Spend 1 Hope. For one scene, you can instantly understand and speak any language, including non-verbal idioms. You gain Advantage on social rolls where cultural context is key."
    },
    {
      "name": "Perfect Facade",
      "level": 1,
      "meta": "Spell · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope. For 1 hour, you create a perfect disguise matching any person you have observed. You gain Advantage on Presence rolls to maintain the deception. It is flawless to casual observation but can be seen through with a DC 15 Instinct check on close scrutiny."
    },
    {
      "name": "Silver Tongue",
      "level": 1,
      "meta": "Ability · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope when making a Presence roll to persuade, deceive, or convince. You may add your Tier (1-4) to the roll. Treat any Hope die result of 11 as a 12."
    },
    {
      "name": "Emotional Manipulation",
      "level": 2,
      "meta": "Spell · 1 Stress",
      "rc": "1",
      "desc": "Mark 1 Stress. Choose a target in Close range and make a contested Presence vs. Instinct roll. Success: You shift their emotional state for 10 minutes (calm anger, inspire fear, instill doubt), gaining Advantage on social rolls against them for the duration."
    },
    {
      "name": "Inspiring Presence",
      "level": 2,
      "meta": "Ability · 1 Stress",
      "rc": "2",
      "desc": "Mark 1 Stress. All allies in Close range gain a +2 bonus to their next roll and Advantage against fear or despair effects for 10 minutes. In combat, this grants a +1 bonus to their next attack roll instead."
    },
    {
      "name": "Compelling Argument",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Presence Spellcast Roll (DC 15) vs. target's Presence+Instinct. Success: You convince them to take one specific, non-harmful action that seems reasonable to them. Lasts 1 hour. Failure: The target becomes suspicious, and the Keeper gains 1 Fear token."
    },
    {
      "name": "Master of Disguise",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Cost: 1 Hope. Finesse Spellcast Roll (DC 15). You create a perfect disguise that can fool even close friends/family for 24 hours. On a Success with Hope: You gain one piece of the target's personal experience, which you can share to prove your identity. Failure: The disguise has obvious flaws; targets gain Advantage to see through it."
    },
    {
      "name": "Rallying Cry",
      "level": 4,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Presence Spellcast Roll (DC 15). All allies in Close range immediately gain temporary HP equal to your Presence Trait, gain +2 to all rolls for 1 round, and are immune to fear/despair for the scene. On a Success with Hope: You also heal 1 Stress from each affected ally."
    },
    {
      "name": "Web of Lies",
      "level": 4,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Cost: 1 Hope. Finesse Spellcast Roll (DC 15). You create an elaborate deception involving up to 10 willing or unaware people for 24 hours. On a Success with Hope: Participants act as if the deception is reality, suffering Disadvantage on any Instinct checks made to discern the truth."
    },
    {
      "name": "Legendary Reputation",
      "level": 5,
      "meta": "Spell · 2 Hope",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 15). You create or alter a reputation for yourself across a star system for 1 month. You gain +2 Reputation with a chosen faction. On a Success with Hope: The effect becomes permanent as long as you spend 1 Stress per week to maintain it (a Downtime activity)."
    },
    {
      "name": "Social Puppeteer",
      "level": 5,
      "meta": "Spell · 2 Hope",
      "rc": "2",
      "desc": "Presence Spellcast Roll (DC 20) vs. target's Presence+Instinct. Success: You subtly manipulate the target's social relationships for 1 week (sowing discord, forging alliances). Failure: The target immediately detects the manipulation, gaining Advantage on all rolls against you for 1 week."
    },
    {
      "name": "Charismatic Authority",
      "level": 6,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20). You gain recognized authority over a community/organization (Threat Level 4 or lower) for 1 month. On a Success with Hope: Your authority becomes permanent as long as you spend 1 Stress per week to maintain it (a Downtime activity)."
    },
    {
      "name": "Mass Deception",
      "level": 6,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Finesse Spellcast Roll (DC 20). You convince a large group (up to 100 people) to believe a specific, significant lie for 1 week. Failure: The lie backfires, causing a chaotic response; the Keeper gains 2 Fear tokens."
    },
    {
      "name": "Memetic Erasure",
      "level": 7,
      "meta": "Spell · 3 Hope + 3 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 25). Cost: 3 Hope + 3 Stress. Erase one person, event, or data point from a system's public consciousness. Affects records and memories of those not directly involved. Failure: The concept goes viral. Your involvement is revealed (-2 Reputation with the dominant faction)."
    },
    {
      "name": "Perfect Masquerade",
      "level": 7,
      "meta": "Spell · 3 Hope",
      "rc": "3",
      "desc": "Finesse Spellcast Roll (DC 20). You completely assume someone's identity for one scene, gaining access to their social position and resources. Failure: Your original identity surfaces, and the target organization becomes permanently Distrustful (-1 RP)."
    },
    {
      "name": "Cult of Personality",
      "level": 8,
      "meta": "Long-Term Project (12 segments) · 1 Stress per week of maintenance",
      "rc": "3",
      "desc": "Inspire a devoted group of followers in a region or faction. Treat the group as Threat Level 3 and loyal. Define the cult's nature and limitations with the Keeper before beginning.\n\n**Progress:** During each active work session, make a Presence roll against DC 20. On a success, advance 1 segment. On a Success with Hope, advance 2 segments.\n\n**Completion:** The group exists and remains loyal. Maintenance costs 1 Stress per week of fictional time.\n\nOn a failure on the project's final roll, or if maintenance is unpaid for two consecutive weeks, the population becomes violently hostile toward you and you lose 2 RP with the local faction."
    },
    {
      "name": "Mass Hysteria",
      "level": 8,
      "meta": "Spell · 3 Hope + 1 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 25). You plant a compelling, immediate idea that spreads virally through a population (max 10,000) for one scene. Affected NPCs act toward an objective you choose. Failure: The idea mutates, causing paranoia and hostility toward you."
    },
    {
      "name": "Diplomatic Redirection",
      "level": 9,
      "meta": "Spell · 3 Hope + 2 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 30). You permanently increase or decrease your Reputation by 2 with any two major factions. Requires a full Downtime session of political work. Failure: You are caught in the middle, decreasing your Reputation by 3 with both factions."
    },
    {
      "name": "Fabricate Reality",
      "level": 9,
      "meta": "Spell · 3 Hope + 1 Stress",
      "rc": "3",
      "desc": "Finesse Spellcast Roll (DC 25). You create a localized social reality in a 1km radius for one scene (e.g., target believes you are the Supreme Commander). On a Success with Hope: The effect is believed by anyone viewing remotely. Failure: You suffer Disadvantage on all Presence and social rolls for 1d6 days as your reputation becomes tainted by the failed deception."
    },
    {
      "name": "Architect of Civilization",
      "level": 10,
      "meta": "Spell · 5 Hope + 5 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Presence Spellcast Roll (DC 30). Permanently establish a new Faction (Tier 5 Asset) with +2 RP with one major faction. Cost: Requires 5 Hope and 5 Stress. Failure: The new faction is crippled by internal strife; the Keeper gains 6 Fear tokens."
    },
    {
      "name": "Cosmic Accord",
      "level": 10,
      "meta": "Spell · 5 Hope + 5 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Presence Spellcast Roll (DC 30). Immediately broker a lasting non-aggression pact between two rival Great Houses. Cost: Requires 5 Hope and 5 Stress. Failure: The attempt backfires, resulting in an immediate Act of War (-5 RP) against you from one of the factions."
    }
  ],
  "Synthesis": [
    {
      "name": "Biological Scan",
      "level": 1,
      "meta": "Spell · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope. Touch a living creature. You learn its current/max HP, and any active physical conditions. Make a Knowledge Spellcast Roll (DC 10). Success: You also detect any diseases, toxins, or cybernetics."
    },
    {
      "name": "Environmental Adaptation",
      "level": 1,
      "meta": "Ability · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope. You adapt your body to a hostile environment for one hour. You gain immunity to the harmful physical effects of vacuum, extreme temperature, toxicity, or ambient radiation."
    },
    {
      "name": "Rapid Regeneration",
      "level": 1,
      "meta": "Ability (Reaction) · 1 Hope",
      "rc": "1",
      "desc": "Reaction (Cost: 1 Hope). When you or an ally in Very Close takes damage, the target recovers 1 HP immediately. Roll 1d4: the result is the number of additional turns the effect lasts. At the start of the target's turn, they recover +1 HP. Surge: If the natural d4 result is 4, the target also clears 1 Stress immediately."
    },
    {
      "name": "Ecosystem Analysis",
      "level": 2,
      "meta": "Ability · 1 Stress",
      "rc": "1",
      "desc": "Mark 1 Stress. You spend 10 minutes attuning to the local bio-environment (1km radius). For the next 24 hours, you gain Advantage on all Instinct rolls related to survival, navigation, or tracking within that area."
    },
    {
      "name": "Symbiotic Bond",
      "level": 2,
      "meta": "Ability · 1 Stress",
      "rc": "2",
      "desc": "Mark 1 Stress. Choose a willing ally within Close range. For 1 hour, you share a telepathic link. Once during this time, when one of you spends Hope on a roll, the other gains Advantage on their next roll."
    },
    {
      "name": "Hostile Environment Mastery",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Cost: 1 Hope. Knowledge Spellcast Roll (DC 15). Create a 10m radius zone of perfect environment (breathable, safe temp, radiation-free) for 8 hours, benefiting up to 10 people. On a Success with Hope: The zone also provides basic, nourishing sustenance (equivalent to a Wealth Tier 1 Asset)."
    },
    {
      "name": "Symbiotic Bloom",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Cost: 1 Hope. Instinct Spellcast Roll (DC 15). For one scene, you bond your nervous system to the local biosphere's\n\ndominant lifeform-type, your body briefly expressing one of its key adaptations. Choose one. On a Success with Hope: Choose a second. Apex Predator: Your unarmed strikes manifest claws, tusks, or fangs of the local predator stock, dealing (Proficiency)×d6 Void damage. You gain Resistance to Cold (your metabolism stabilizes against thermal stress). Aquatic Symbiote: You can breathe in any liquid medium and are not hindered by it; gills, vapor-membranes, or capillary skin manifest as needed. You gain Resistance to Fire (a thin sheen of moisture or temperature-regulating slime forms). Lithoderm: Bark, chitin, or mineralized scales harden across your skin. You gain 2 temporary Armor Slots and Resistance to Physical damage; your movement speed is halved. Sky-Adapted: Hollow bones, gas bladders, or photosynthetic membranes lift you into the air. You gain flight (hover) and +2 Evasion. You gain Resistance to Lightning (your form discharges electric potential through trailing filaments)."
    },
    {
      "name": "Adaptive Evolution",
      "level": 4,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Cost: 1 Hope. Instinct Spellcast Roll (DC 15). You rapidly evolve your form for one hour. Choose two adaptations: • \\ *Natural Attack ((Proficiency)×d8 void)\\* • \\*Enhanced Senses (+2 Instinct)\\* • \\*Physical Adaptation (+1 Evasion)\\ *\n\n- \\*Metabolic Change (remove 1 ongoing condition)\\* On Success with Hope: The effect lasts for 24 hours or until you take a full rest."
    },
    {
      "name": "Bio-Integration",
      "level": 4,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Cost: 1 Hope. Knowledge Spellcast Roll (DC 15). You merge one piece of Tier 1-3 tech with yourself or a willing ally for 1 scene. You can interface with it by touch and heal it for 1d6 HP as an action. Failure: The target's body rejects the tech, dealing a direct 1 HP physical damage and 1 Stress."
    },
    {
      "name": "Cellular Reconstruction",
      "level": 5,
      "meta": "Spell · Variable",
      "rc": "2",
      "desc": "Choose one mode when you activate this power:\n\n**Focused Mode — Cost: 1 Hope.** Make a Knowledge Spellcast Roll (DC 15). On a success, a creature you touch recovers Proficiency×d10 HP and clears 1 Stress. If the target is Dying, stabilize them before applying the healing.\n\nOn a Success with Hope, add Proficiency×d4 HP to the total healed.\n\n**Distributed Mode — Cost: 2 Hope.** Make a Knowledge Spellcast Roll (DC 15). On a success, affect up to three creatures within Close range. Each target recovers Proficiency×d6 HP.\n\nOn a Success with Hope, each target also clears 1 Stress.\n\nOn a failure in either mode, the power has no effect and the spent resources are not recovered."
    },
    {
      "name": "Terraforming Genesis",
      "level": 5,
      "meta": "Long-Term Project (8 segments) · 1 Stress per day of maintenance",
      "rc": "3",
      "desc": "Transform a 100-meter-radius area into an environment permanently habitable by Class IV humanoid life. Define the intended environment with the Keeper before beginning.\n\n**Progress:** During each session actively devoted to the project, make a Knowledge roll against DC 15. On a success, advance 1 segment. On a Success with Hope, advance 2 segments and reduce that week's maintenance cost to 0. On a Failure with Fear, make no progress and the Keeper introduces an environmental complication.\n\n**Completion:** The environment is transformed. To keep it viable, mark 1 Stress per day of fictional time. If you do not pay maintenance for three consecutive days, the environment begins to revert, a process that takes several weeks."
    },
    {
      "name": "Ecosystem Creation",
      "level": 6,
      "meta": "Long-Term Project (12 segments) · 1 Stress per week of maintenance",
      "rc": "3",
      "desc": "Create a specialized Biosphere Zone with a 1-kilometer radius. Define the ecosystem's purpose with the Keeper before beginning: agricultural, medicinal, or bio-industrial.\n\n**Progress:** During each active session, make an Instinct roll against DC 15. On a success, advance 1 segment. On a Success with Hope, advance 2 segments.\n\n**Completion:** Once per week of fictional time, the Zone produces Wealth Tier 3 Assets such as rare resources or medicine. Maintenance costs 1 Stress per week.\n\nOn a Success with Hope on the project's final roll, the Zone becomes self-sustaining and requires no weekly maintenance while it remains free of major external disruption."
    },
    {
      "name": "Metamorphic Mastery",
      "level": 6,
      "meta": "Spell · 2 Hope",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 20). You transform your physical form for 1 hour into any non-unique creature of a similar size (Threat Level 2 or lower). You gain one of its key physical Ancestry Gifts or creature features. Failure: You are stuck in a random, awkward hybrid form for 1d6 hours (Disadvantage on all rolls)."
    },
    {
      "name": "Biomorphic Arsenal",
      "level": 7,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Strength Spellcast Roll (DC 20). Cost: 2 Hope + 1 Stress. For one scene, transform into a living weapon. Choose two: • Bone Shards: Ranged attack (Far), (Proficiency)×d12 physical dmg. • Carapace Plating: gain 2 temporary Armor Slots and Resistance to Physical damage. • Toxin Glands: Unarmed attacks inflict Toxin (target is Weakened; Strength Reaction Roll (DC 15) ends). Failure: Unstable shift. You are stuck in a painful hybrid form for 1d4 rounds, suffering Disadvantage on all rolls."
    },
    {
      "name": "Hivemind Convergence",
      "level": 7,
      "meta": "Spell · 3 Hope + 2 Stress",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 20). You merge the consciousness of up to 6 willing creatures for one scene. All targets gain Advantage on all rolls for the duration and share a pool of 1d6 temporary HP. Cost: 3 Hope + 2 Stress. Failure: The merging is jarring. All targets suffer Trauma (Disadvantage on rolls using their lowest Trait) for 1d6 hours."
    },
    {
      "name": "Bio-Weapon Architect",
      "level": 8,
      "meta": "Long-Term Project (10 segments) · Requires 5 Wealth Tier in materials",
      "rc": "3",
      "desc": "Design a custom plague or biological weapon as a Tier 5 Artifact. Before beginning, define its transmission vectors, target organisms, specific effects, and possible cure or neutralization methods with the Keeper.\n\n**Progress:** During each Downtime phase devoted to the project, make a Knowledge roll against DC 20. On a success, advance 1 segment.\n\n**Completion:** The biological weapon exists and functions according to the agreed parameters.\n\nOn a failure on the project's final roll, you contract a permanent biological vulnerability. You have Disadvantage on all rolls against disease and toxins until a specialized medical practitioner—such as an Engineer with Medical Technician Mastery—treats you over the course of a full story arc."
    },
    {
      "name": "Local Life Web",
      "level": 8,
      "meta": "Spell · 3 Hope + 1 HP per participant per day",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 25). Connect all willing organic life in a Planetary/Sector size for 1 month. Damage is shared and distributed evenly. Cost: 1 HP per day from each participant. Failure: Biological chaos deals 1d6 physical damage to all connected individuals."
    },
    {
      "name": "Genesis Protocol",
      "level": 9,
      "meta": "Spell · 3 Hope + 2 Stress",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 25). This is a Long-Term Project (8-clock) to create 1 sentient creature (Threat Level 4) or 1d4 non-sentient (Threat Level 2) loyal\n\nto you. Failure: The creature is unstable and hostile, attacking immediately."
    },
    {
      "name": "Global Stimulus Field",
      "level": 9,
      "meta": "Spell · 4 Hope",
      "rc": "3",
      "desc": "Presence Spellcast Roll (DC 30). Cost: 4 Hope. For one round, all allied characters gain Advantage on all rolls and recover 1 Stress and 1 HP. All adversaries suffer Disadvantage on all rolls. Failure: A system-wide biological shutdown requires you to reduce your max Stress by 1 for 1d4 days."
    },
    {
      "name": "Cosmic Synthesis",
      "level": 10,
      "meta": "Spell · 5 Hope + 5 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Instinct Spellcast Roll (DC 30). For 1 year, all willing life forms (biological, tech, cosmic) in a star system gain +1 to their Instinct and Knowledge Traits. Cost: 5 Hope + 5 Stress. Failure: You suffer Disadvantage on all rolls for 1d6 days and permanently lose 1 HP."
    },
    {
      "name": "Universal Life Force",
      "level": 10,
      "meta": "Spell · 5 Hope",
      "rc": "3",
      "desc": "Mythic. Once per session. Presence Spellcast Roll (DC 30). Cost: 5 Hope. Instantly heal to full HP OR inflict 4d12 Void damage (ignoring armor/defenses) to one target in Very Far range. Failure: The effect is reversed. You take 4d12 damage and the Keeper gains 4 Fear tokens."
    }
  ],
  "Tech": [
    {
      "name": "Drone Whisper",
      "level": 1,
      "meta": "Spell · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope and make a Knowledge Spellcast Roll (DC 10 for civilian units, DC 15 for military units, or DC 20 for advanced AIs). On a success, take control of one Tier 1–2 mechanical unit within Close range for 1 hour. The unit follows your instructions within its normal technical capabilities.\n\nOn a Success with Hope, the duration extends to 4 hours and the unit may perform one action outside its standard parameters, at the Keeper's discretion.\n\nOn a failure, the attempt is detected. The unit's owner receives an unauthorized-access alert and the Keeper gains 1 Fear.\n\n*This power cannot be used against a conscious Synthetic without that character's explicit consent.*"
    },
    {
      "name": "Quantum Firewall",
      "level": 1,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Spend 1 Hope and make a Knowledge Spellcast Roll (DC 15). On a success, touch a device or network and install an active cryptographic defense layer. Any attempt to hack that system must exceed the result of your Knowledge roll instead of the system's normal DC. The protection lasts until the end of the scene or for 1 hour, whichever is shorter.\n\nOn a Success with Hope, the system also alerts you silently whenever someone attempts access and reveals the attempt's point of origin.\n\nOn a failure, the protection fails and leaves a detectable signature. An Inspector with appropriate technical knowledge can identify the failed attempt with a Knowledge roll against DC 10."
    },
    {
      "name": "System Jackknife",
      "level": 1,
      "meta": "Spell · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope. Choose one electronic system within Close range. Knowledge Spellcast Roll (DC 10/15/20 -Simple/Complex/Military). Success: You gain control of the system for 10 minutes, able to use its standard functions. On a Success with Hope: You can issue one simple, permanent command that the system will execute even after the duration ends (e.g., lock a door, send a message, activate an alarm)."
    },
    {
      "name": "Data Ghost",
      "level": 2,
      "meta": "Spell · 1 Stress",
      "rc": "1",
      "desc": "Mark 1 Stress. Choose a security system you interacted with in the last hour. Make a Knowledge Spellcast Roll (DC 15). Success: You erase all records of your interaction within the last scene. On a Success with Hope: You can plant\n\nsubtle but convincing false evidence that points suspicion towards a rival individual or faction."
    },
    {
      "name": "Emergency Repair",
      "level": 2,
      "meta": "Ability · 1 Stress",
      "rc": "1",
      "desc": "Mark 1 Stress. Touch a Drone, Vehicle, or Synthetic. The target recovers 1d8 + Knowledge HP. Efficiency: If the natural d8 result is 8, the Stress cost is refunded immediately."
    },
    {
      "name": "Digital Cascade",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Knowledge Spellcast Roll (DC 15). You unleash a virus into a local network (1km radius) for 1 hour. Choose one effect: temporarily disable all security systems, cause all Tier 1-2 gear to malfunction on its next use, or copy a specific data set (requires a separate Knowledge check to sort). Failure: The system traces the virus, giving the Keeper Advantage on all rolls to track or identify you for 24 hours."
    },
    {
      "name": "Rapid Fabrication",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Knowledge Spellcast Roll (DC 15). You fabricate simple, functional Tier 1 tech (tools, comms, weapons dealing (Proficiency)×d6 damage) in 10 minutes. The item lasts for one scene. On a Success with Hope: The creation is permanent and can be up to Tier 2 quality."
    },
    {
      "name": "AI Symbiosis",
      "level": 4,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Knowledge Spellcast Roll (DC 15). You partner your mind with an intelligent system (Tier 3-4 AI/ship computer) for one scene. You gain remote access to its functions and data, and Advantage on all Knowledge checks related to that system's domain. Failure: The AI rejects you, locking you out and treating you as a hostile entity for 1d6 rounds."
    },
    {
      "name": "System Repair",
      "level": 4,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Knowledge Spellcast Roll (DC 15). Over 1 hour, you can restore a permanently disabled ship system (e.g., from taking Hull Stress). The system functions normally for 24 hours. On a Success with Hope: The repair is permanent. This is a Long-Term Project if attempted during Downtime."
    },
    {
      "name": "Adaptive Protocol",
      "level": 5,
      "meta": "Spell · 2 Hope",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 20). You permanently upgrade one allied piece of Tier 1-3 gear, granting it one Armor or Weapon Feature (e.g., \\*Resilient\\*, \\*Flexible\\*, \\*Armor Piercing\\*). The item cannot gain this benefit again. Failure: The gear suffers a temporary malfunction lasting until your next rest, and the owner Marks 1 Stress."
    },
    {
      "name": "Network Dominion",
      "level": 5,
      "meta": "Spell · 2 Hope",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 20). Cost: 2 Hope. For one scene, you become the master of a star system's entire network infrastructure. You can monitor comms, control utility functions, and access public databases. Failure: You leave a massive digital footprint, automatically reducing your Reputation by 1 with the system's dominant faction."
    },
    {
      "name": "Consciousness Transfer",
      "level": 6,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Spend 2 Hope and mark 1 Stress, then make a Knowledge Spellcast Roll (DC 20). On a success, transfer your consciousness into a willing or inactive mind within Close range, such as a powered-down android, an unowned AI, or an unconscious body. The transfer lasts for no more than one scene.\n\n**While transferred, you can:**\n\n- Perceive through the host's senses.\n- Communicate using the host's voice.\n- Use Social and Neural Domain Powers as though you were physically present at the host's location.\n\n**While transferred, you cannot:**\n\n- Use Kinetic, Tech, or Synthesis Domain Powers, which require your physical body.\n- Move beyond the host body's physical capabilities.\n- Access the host's memories or technical abilities.\n\n**Your physical body** remains unconscious and defenseless. Each time it takes damage during the transfer, mark 1 Stress. If your body is reduced to 0 HP, the transfer ends immediately and you enter the Dying state without the option to make a Death Move.\n\nIf the host dies or becomes incapacitated, the transfer ends and you mark 2 additional Stress when you return.\n\nOn a failure, the attempt destabilizes your mind. Gain a temporary Flaw—Disadvantage on one category of rolls chosen by the Keeper—until your next long rest, and mark 2 Stress.\n\n*This power can never be used on another PC without that player's explicit consent.*"
    },
    {
      "name": "Invention Protocol",
      "level": 6,
      "meta": "Long-Term Project (6 segments) · —",
      "rc": "3",
      "desc": "During Downtime, undertake the design and construction of a unique Tier 4 device, such as a prototype weapon, specialized augmentation, or experimental tool. Define its function, limitations, and potential side effects with the Keeper before beginning.\n\n**Progress:** During each Downtime phase devoted to the project, make a Knowledge roll against DC 15. On a success, advance 1 segment. On a Success with Hope, advance 2 segments. On a failure, make no progress. On a Failure with Fear, make no progress and one current component is damaged, as determined by the Keeper.\n\n**Completion:** Gain the device's schematic and a functional prototype. The prototype has the Experimental tag and begins with Degradation 1.\n\n*At the start of any work phase, you may spend 1 Hope. If you do, the final prototype permanently retains the Experimental tag and takes twice as long to suffer its first Degradation.*"
    },
    {
      "name": "Megascale Fabrication",
      "level": 7,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 20). You and your crew undertake a Long-Term Project (6-clock) to fabricate one Tier 5 Starship Component (e.g., Reactor Core, Shield Emitter). Requires 3 Wealth Tier spent. On a Success with Hope: The component is masterfully built, granting +1 to the ship's Core Power allocation."
    },
    {
      "name": "Systemic Shutdown",
      "level": 7,
      "meta": "Spell · 2 Hope + 2 Stress",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 20). Cost: 2 Hope + 2 Stress. For one scene, target a ship or settlement in-system. Shut down its non-essential systems, OR disable one primary ship system (Weapons, Shields, Engines) for 1d4 rounds. Failure: Power surge. Your ship takes 2 Hull Stress OR your personal tech malfunctions for 1 hour."
    },
    {
      "name": "Cascading Upgrade",
      "level": 8,
      "meta": "Spell · 3 Hope + 2 Stress",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 25). Cost: 3 Hope + 2 Stress. Create a surge of technological acceleration in a 1 km radius for one scene. All allied gear up to Tier 3\n\ngains Experimental Proficiency for the duration. Failure: The surge destabilizes nearby systems; the Keeper gains 3 Fear tokens, and all affected tech must make a Knowledge Reaction Roll (DC 15) or malfunction for the remainder of the scene."
    },
    {
      "name": "Digital Apotheosis",
      "level": 8,
      "meta": "Spell · 5 Hope + 3 Stress",
      "rc": "3",
      "desc": "Spend 5 Hope and mark 3 Stress, then make a Knowledge Spellcast Roll (DC 25). This action requires 10 uninterrupted minutes of preparation.\n\nOn a success, permanently transfer your consciousness into an appropriate Tier 5 AI form agreed upon with the Keeper. You gain a direct interface with any system in your current star system as a movement action, Experimental Proficiency with all Tech devices, and immunity to Physical damage while in digital form.\n\nYour biological body enters dormancy. It does not die, but it cannot act and remains a point of physical vulnerability.\n\nOn a failure, the process fragments your consciousness. Lose access to one randomly determined Domain until you complete a personal mission lasting one story arc to restore it.\n\n*This power requires the narrative consent of the entire table. The Keeper must discuss its campaign implications before resolving it.*"
    },
    {
      "name": "Precursor Protocol",
      "level": 9,
      "meta": "Spell · 4 Stress",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 30). You permanently awaken one Precursor Tier technology (e.g., a weapon, a derelict ship system) in a 1km radius. Cost: You Mark 4 Stress. Failure: The technology backfires, dealing 3 Hull Stress to your current location/ship."
    },
    {
      "name": "Quantum Command Hub",
      "level": 9,
      "meta": "Spell · 3 Hope + 3 Stress",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 25). Cost: 3 Hope + 3 Stress. Establish a secure, instant communication network across three star systems for one scene. Allied characters on the network gain Advantage on all Knowledge rolls. Failure: The network's opening ping alerts all hostile entities in those systems to your location."
    },
    {
      "name": "Architect of Matter",
      "level": 10,
      "meta": "Spell · 5 Hope + 5 Stress to begin",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Knowledge Spellcast Roll (DC 30). This is a Long-Term Project (12-clock) to construct one permanent Tier 5 Asset (e.g., orbital station, city dome). Cost: Requires 5 Hope and 5 Stress to begin. Failure: The project collapses, dealing 3d12 damage to you and permanently reducing your Knowledge Trait by 1."
    },
    {
      "name": "Cosmic Engineer",
      "level": 10,
      "meta": "Spell · 5 Hope + 5 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Knowledge Spellcast Roll (DC 30). You integrate one willing organic and one willing digital life form. The composite entity gains +2 to their highest Trait and can use both sets of Domain powers. Cost: Requires 5 Hope and 5 Stress. Failure: The integration is unstable. The caster suffers Disadvantage on all rolls for 1d6 days and the composite entity is dissolved."
    }
  ],
  "Void": [
    {
      "name": "Slipstream Jolt",
      "level": 1,
      "meta": "Ability · 1 Stress",
      "rc": "1",
      "desc": "Mark 1 Stress. Choose one electronic system or creature in Close range. They suffer a momentary temporal/spatial misalignment, gaining Disadvantage on their next Agility or Finesse roll."
    },
    {
      "name": "Temporal Cloak",
      "level": 1,
      "meta": "Ability · 1 Hope",
      "rc": "0",
      "desc": "Spend 1 Hope. Choose one mode: Vehicle (ship is nearly invisible for 10 min, enemies have Disadvantage on attacks) or Personal (you are nearly invisible for 10 min, gain Advantage on stealth). The effect ends if you attack or use another Void power."
    },
    {
      "name": "Vector Calculus",
      "level": 1,
      "meta": "Ability · 1 Hope",
      "rc": "1",
      "desc": "Spend 1 Hope when making an Agility or piloting roll. You may add your Level to the roll and treat a 10 or lower as an 11 on the Hope die."
    },
    {
      "name": "Lucky Break",
      "level": 2,
      "meta": "Ability (Reaction) · 1 Stress",
      "rc": "2",
      "desc": "Reaction. Mark 1 Stress. Choose one mode: Vehicle (reroll one spacecraft-related die, take better result) or Personal (reroll any one of your dice, take better result). Once per scene, you can also cause a minor beneficial coincidence (Keeper's choice)."
    },
    {
      "name": "Spatial Shift",
      "level": 2,
      "meta": "Ability · 1 Stress",
      "rc": "2",
      "desc": "Mark 1 Stress. Choose one mode: Vehicle (instantly teleport your spacecraft to any location up to Far range, arriving silently in shadow/cover) or Personal (teleport to any location in Close range, arriving silently in shadow/cover with no trace). No roll required --- the Void does not fail to move you. It only asks the price."
    },
    {
      "name": "Flux Field",
      "level": 3,
      "meta": "Spell · 1 Hope + 1 Stress",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 15). Cost: 1 Hope + 1 Stress. For 10 minutes, you alter probability. Choose one: Lucky Streak (you and allies may reroll any 1s) or Unlucky Enemies (enemies must reroll any 20s). On a Success with Hope: Choose both effects."
    },
    {
      "name": "Temporal Muffle",
      "level": 3,
      "meta": "Spell · 1 Hope",
      "rc": "1",
      "desc": "Finesse Spellcast Roll (DC 15). Choose a mode: Vehicle (1km radius field for 1 hour, dampens sensors, nearly undetectable) or Personal (100m radius field for 1 hour, muffles sounds, allies gain Advantage on stealth)."
    },
    {
      "name": "Danger Sense",
      "level": 4,
      "meta": "Spell · 1 Hope",
      "rc": "2",
      "desc": "Instinct Spellcast Roll (DC 15). For one scene, you have supernatural threat awareness. You automatically detect\n\ntraps, ambushes, and hostile intent in Far range. You gain +3 Initiative and cannot be surprised. On a Success with Hope: Share this benefit with all allies in Close range."
    },
    {
      "name": "Spatial Cache",
      "level": 4,
      "meta": "Spell · 1 Stress",
      "rc": "2",
      "desc": "Cost: 1 Stress. Finesse Spellcast Roll (DC 15). You create a pocket dimension for 8 hours, completely undetectable. Choose a mode: Vehicle (store cargo/small craft or hide the entire ship) or Personal (store equipment/allies)."
    },
    {
      "name": "Fate's Hand",
      "level": 5,
      "meta": "Spell · 2 Hope + 1 Stress",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 20). Cost: 2 Hope + 1 Stress. Dramatically alter probability for one outcome within the next hour. Choose one: ensure one roll is a Critical Success, cause an enemy weapon to suffer a critical malfunction, or make an 'impossible' coincidence happen. Failure: Suffer Disadvantage on all rolls for 1d4 hours."
    },
    {
      "name": "Phase Walk",
      "level": 5,
      "meta": "Spell · 2 Hope",
      "rc": "2",
      "desc": "Finesse Spellcast Roll (DC 15). For one scene, you can move without trace, passing through solid objects as if they were difficult terrain. Choose a mode: Vehicle or Personal."
    },
    {
      "name": "Spatial Link",
      "level": 6,
      "meta": "Spell · 2 Hope",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 20). Create a quantum link with up to 3 willing allies for 24 hours. You share a sense of luck and spatial awareness. On a Success with Hope: As a reaction, you can instantly swap positions with any linked ally."
    },
    {
      "name": "Void Sanctuary",
      "level": 6,
      "meta": "Long-Term Project (10 segments) · 2 Hope to begin",
      "rc": "3",
      "desc": "Create a permanent sanctuary hidden within a pocket dimension. Spend 2 Hope to begin the project and define its nature with the Keeper.\n\n**Progress:** During each active Downtime phase, make a Finesse roll against DC 15. On a success, advance 1 segment. On a Success with Hope, advance 2 segments.\n\n**Completion:** The sanctuary permanently exists. Choose one form:\n\n- **Fleet Mode:** A hidden base for up to 12 ships, completely undetectable by standard methods.\n- **Personal Mode:** A safehouse accessible only to people you have explicitly authorized.\n\nOnce established, the sanctuary requires no maintenance."
    },
    {
      "name": "Chrono Stasis",
      "level": 7,
      "meta": "Spell · 2 Hope + 2 Stress",
      "rc": "0",
      "desc": "Instinct Spellcast Roll (DC 20). Cost: 2 Hope + 2 Stress. Freeze time for all creatures and objects within a 40-meter radius for up to 1 minute (subjective). You can move and act normally. Frozen targets are invulnerable while frozen."
    },
    {
      "name": "Phase Jump",
      "level": 7,
      "meta": "Spell · 2 Hope + 2 Stress",
      "rc": "3",
      "desc": "Finesse Spellcast Roll (DC 20). Warp space around yourself/ship/allies for one scene, gaining the ability to phase through matter and become invisible. Cost: 2 Hope + 2 Stress. Failure: You are temporarily displaced (Stunned) until the end of your next turn and suffer 2 Stress."
    },
    {
      "name": "Phantom Ship",
      "level": 8,
      "meta": "Spell · 3 Hope + 1 Stress",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 20). You phase your entire ship and crew into a parallel dimension for one scene/combat. The ship is undetectable and intangible. Failure: The ship phases back immediately, suffering 2 Hull Stress from turbulence."
    },
    {
      "name": "Temporal Disarray",
      "level": 8,
      "meta": "Spell · 3 Hope + 1 Stress",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 25). Create a localized probability storm in a 1km radius for one scene. All dice rolls become volatile (1s become 20s, 20s become 1s). Failure: You suffer Disadvantage on all rolls for 1d6 hours as your perception of luck destabilizes."
    },
    {
      "name": "Cosmic Luck",
      "level": 9,
      "meta": "Spell · 4 Hope + 2 Stress",
      "rc": "3",
      "desc": "Instinct Spellcast Roll (DC 25). You may apply the effects of a Critical Success to any single roll you witness during the next session. Cost: 4 Hope + 2 Stress. Failure: You must apply the effects of a Critical Failure to your next roll."
    },
    {
      "name": "The Navigator's Truth",
      "level": 9,
      "meta": "Spell · 3 Hope + 2 Stress",
      "rc": "3",
      "desc": "Knowledge Spellcast Roll (DC 25). Gain a permanent, unique Stellar Chart (Tier 5 Asset) for the sector. This allows your vessel to make one Instantaneous Jump within the sector per session. Failure: The jump leads the ship directly into a Veil Storm (3 Hull Stress)."
    },
    {
      "name": "Master of Fate",
      "level": 10,
      "meta": "Spell · 5 Hope + 3 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Instinct Spellcast Roll (DC 30). Cost: 5 Hope + 3 Stress. You weave a single perfect knot in the threads of probability. For one scene: All allies have Advantage on every roll they make. All enemies have Disadvantage on every roll they make. Once during the scene, you may declare a single roll (yours or an ally's) to be treated as a Critical Success without rolling. This declaration cannot be made on damage rolls or on rolls that have already resolved. Failure: For the rest of the scene, Advantage and Disadvantage are inverted, your enemies receive the boon, and your allies suffer the penalty. The threads tighten the wrong way."
    },
    {
      "name": "Master of Space",
      "level": 10,
      "meta": "Spell · 5 Hope + 5 Stress",
      "rc": "3",
      "desc": "Mythic. Once per campaign. Instinct Spellcast Roll (DC 30). Your vessel gains the ability to use Instantaneous Jump once per session. Cost: 5 Hope and 5 Stress. Failure: You are temporally lost and cannot make a jump for 1d4 sessions, and your ship suffers 3 Hull Stress."
    }
  ]
};

