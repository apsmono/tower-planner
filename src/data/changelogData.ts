export interface PatchNote {
  version: string;
  releaseDate: string;
  title: string;
  summary: string;
  highlights: string[];
  balanceChanges?: string[];
  newFeatures?: string[];
}

export const GAME_CHANGELOG: PatchNote[] = [
  {
    version: 'v25.0',
    releaseDate: '2026-07-15',
    title: 'Tier 23 & Ultimate Enhancement Expansion',
    summary: 'Unlocked Tier 23 milestone levels, added new Super Tower enhancement scaling, and expanded module substat thresholds.',
    highlights: [
      'Added T21–T23 Milestone rewards with Relic Keys & Stone bundles',
      'Super Tower Enhancement: Lab damage cap increased',
      'Module Shards reforge efficiency adjustment',
      'Tournament Battle Conditions balancing',
    ],
    newFeatures: [
      'New Milestone Tiers T21, T22, and T23',
      'Advanced Tournament League Rewards expansion',
    ],
    balanceChanges: [
      'Adjusted Elite enemy cell drop rates at high wave counts (>4500)',
      'Black Hole size lab cap interaction refined',
    ],
  },
  {
    version: 'v24.0',
    releaseDate: '2026-03-20',
    title: 'Cell Speedup & Elite Enemies System',
    summary: 'Introduced Elite enemies (Vampires, Scatters, Rays) that drop Elite Cells (Doritos), enabling 1.5x to 5.0x Lab Research Speedups.',
    highlights: [
      'Elite Enemies spawn during standard and tournament runs',
      'Elite Cells resource added with 1h to 24h booster timers',
      'Lab boost multipliers: 1.5x, 2.0x, 3.0x, 4.0x, 5.0x',
      'Theme and skin coin bonus compounding upgrades',
    ],
    newFeatures: [
      'Cell Speedup Lab Queue Accelerator',
      'Elite enemy codex and spawn rate statistics',
    ],
    balanceChanges: [
      'Standardized baseline research times across utility labs',
      'Increased milestone coin and power stone rewards across T12-T18',
    ],
  },
  {
    version: 'v23.0',
    releaseDate: '2025-11-10',
    title: 'Modules & Substat Rerolling Overhaul',
    summary: 'Added 16 Unique Epic Modules across 4 slots (Cannon, Armor, Generator, Core) with rerollable substat tiers up to Ancestral ★★★★★.',
    highlights: [
      'Equippable Modules system with Reroll Shards & Module Shards',
      '4 Module Types: Cannon (Attack), Armor (Defense), Generator (Utility), Core (Ultimate Weapons)',
      'Substat roll tiers: Common, Rare, Epic, Legendary, Mythic, Ancestral',
      'Unique module effects (Death Penalty, Harmony Conductor, Galaxy Compressor, Wormhole Redirector)',
    ],
    newFeatures: [
      'Module inventory, merging, and restore mechanics',
      'Substat locking and bulk reroll simulator',
    ],
  },
  {
    version: 'v22.0',
    releaseDate: '2025-06-05',
    title: 'Tournaments & Guild Relic System',
    summary: 'Rebuilt tournament matchmaking with Battle Conditions, Heat brackets, and seasonal relic passives.',
    highlights: [
      'Tournament Battle Conditions (BC) rotation',
      'Relic Room with permanent % stat bonuses',
      'Event shop medal exchange improvements',
    ],
  },
];
