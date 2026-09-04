export type ModuleSlot = 'cannon' | 'armor' | 'generator' | 'core';

export type ModuleRarity = 
  | 'rare' 
  | 'epic' 
  | 'epic_plus' 
  | 'legendary' 
  | 'legendary_plus' 
  | 'mythic' 
  | 'mythic_plus' 
  | 'ancestral' 
  | 'ancestral_5_star';

export interface ModuleDefinition {
  id: string;
  name: string;
  slot: ModuleSlot;
  uniqueEffectName: string;
  uniqueEffectDescription: string;
  themeColor: string;
  maxLevel: number;
}

export interface SubstatDefinition {
  id: string;
  name: string;
  slot: ModuleSlot;
  unit: string;
  values: {
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
    ancestral: number;
  };
}

export const MODULE_RARITIES: { id: ModuleRarity; name: string; stars: number; color: string; maxSubstats: number }[] = [
  { id: 'rare', name: 'Rare', stars: 0, color: 'text-blue-400 border-blue-500/30 bg-blue-950/20', maxSubstats: 1 },
  { id: 'epic', name: 'Epic', stars: 0, color: 'text-purple-400 border-purple-500/30 bg-purple-950/20', maxSubstats: 2 },
  { id: 'epic_plus', name: 'Epic+', stars: 0, color: 'text-purple-300 border-purple-500/40 bg-purple-950/30', maxSubstats: 2 },
  { id: 'legendary', name: 'Legendary', stars: 0, color: 'text-amber-400 border-amber-500/30 bg-amber-950/20', maxSubstats: 3 },
  { id: 'legendary_plus', name: 'Legendary+', stars: 0, color: 'text-amber-300 border-amber-500/40 bg-amber-950/30', maxSubstats: 3 },
  { id: 'mythic', name: 'Mythic', stars: 0, color: 'text-rose-400 border-rose-500/30 bg-rose-950/20', maxSubstats: 4 },
  { id: 'mythic_plus', name: 'Mythic+', stars: 0, color: 'text-rose-300 border-rose-500/40 bg-rose-950/30', maxSubstats: 4 },
  { id: 'ancestral', name: 'Ancestral', stars: 0, color: 'text-teal-300 border-teal-400/40 bg-teal-950/30', maxSubstats: 5 },
  { id: 'ancestral_5_star', name: 'Ancestral ★★★★★', stars: 5, color: 'text-cyan-300 border-cyan-400/50 bg-cyan-950/40', maxSubstats: 5 },
];

export const MASTER_MODULES_CATALOG: ModuleDefinition[] = [
  // --- CANNON (ATTACK) ---
  {
    id: 'death_penalty',
    name: 'Death Penalty',
    slot: 'cannon',
    uniqueEffectName: 'Instant Execution',
    uniqueEffectDescription: '5% to 15% chance to instantly kill non-boss enemies on hit and reduces boss health by 50% on spawn.',
    themeColor: '#ef4444',
    maxLevel: 160,
  },
  {
    id: 'astral_deliverance',
    name: 'Astral Deliverance',
    slot: 'cannon',
    uniqueEffectName: 'Orb Volley Bounce',
    uniqueEffectDescription: 'Every 10th projectile spawns an extra energy bounce that shatters armor.',
    themeColor: '#f97316',
    maxLevel: 160,
  },
  {
    id: 'being_annihilator',
    name: 'Being Annihilator',
    slot: 'cannon',
    uniqueEffectName: 'Super Crit Ramp',
    uniqueEffectDescription: 'Consecutive projectile hits on the same target grant escalating Super Crit Multipliers.',
    themeColor: '#eab308',
    maxLevel: 160,
  },
  {
    id: 'havoc_bringer',
    name: 'Havoc Bringer',
    slot: 'cannon',
    uniqueEffectName: 'Rend Armor Surge',
    uniqueEffectDescription: 'Rend armor stacks up to +200% faster and applies explosive blast shockwaves.',
    themeColor: '#84cc16',
    maxLevel: 160,
  },

  // --- ARMOR (DEFENSE) ---
  {
    id: 'wormhole_redirector',
    name: 'Wormhole Redirector',
    slot: 'armor',
    uniqueEffectName: 'Wall Health Shield',
    uniqueEffectDescription: 'Health Regen can overheal Tower Wall up to 100% of maximum health value.',
    themeColor: '#06b6d4',
    maxLevel: 160,
  },
  {
    id: 'anti_cube_portal',
    name: 'Anti-Cube Portal',
    slot: 'armor',
    uniqueEffectName: 'Shockwave Damage Amp',
    uniqueEffectDescription: 'Enemies hit by shockwave take +10x to +30x more damage from all sources for 7 seconds.',
    themeColor: '#3b82f6',
    maxLevel: 160,
  },
  {
    id: 'space_displacer',
    name: 'Space Displacer',
    slot: 'armor',
    uniqueEffectName: 'Land Mine Replicator',
    uniqueEffectDescription: 'Land mines replicate into surrounding cluster charges when triggered.',
    themeColor: '#6366f1',
    maxLevel: 160,
  },
  {
    id: 'negative_mass_projector',
    name: 'Negative Mass Projector',
    slot: 'armor',
    uniqueEffectName: 'Orb Slow Field',
    uniqueEffectDescription: 'Enemies passing through orb radius are slowed by 60% and have reduced damage.',
    themeColor: '#8b5cf6',
    maxLevel: 160,
  },

  // --- GENERATOR (UTILITY) ---
  {
    id: 'galaxy_compressor',
    name: 'Galaxy Compressor',
    slot: 'generator',
    uniqueEffectName: 'Recovery Package UW Rush',
    uniqueEffectDescription: 'Recovery packages reduce all active Ultimate Weapon cooldowns by 10 to 20 seconds.',
    themeColor: '#10b981',
    maxLevel: 160,
  },
  {
    id: 'pulsar_harvester',
    name: 'Pulsar Harvester',
    slot: 'generator',
    uniqueEffectName: 'Level Degrader',
    uniqueEffectDescription: 'Projectiles have a chance to permanently reduce enemy tier level and max health.',
    themeColor: '#14b8a6',
    maxLevel: 160,
  },
  {
    id: 'singularity_harness',
    name: 'Singularity Harness',
    slot: 'generator',
    uniqueEffectName: 'Bot Radius Surge',
    uniqueEffectDescription: 'Golden Bot and Amplify Bot range increased by +12m and cooldowns reduced.',
    themeColor: '#d946ef',
    maxLevel: 160,
  },
  {
    id: 'primordial_collapse',
    name: 'Primordial Collapse',
    slot: 'generator',
    uniqueEffectName: 'Cell Multiplier Harvest',
    uniqueEffectDescription: 'Elite enemies drop +1 to +3 extra Elite Cells on destruction.',
    themeColor: '#ec4899',
    maxLevel: 160,
  },

  // --- CORE (ULTIMATE WEAPONS) ---
  {
    id: 'multiverse_nexus',
    name: 'Multiverse Nexus',
    slot: 'core',
    uniqueEffectName: 'UW Cooldown Synchronizer',
    uniqueEffectDescription: 'Synchronizes Golden Tower, Black Hole, and Death Wave cooldowns to their average timer.',
    themeColor: '#f43f5e',
    maxLevel: 160,
  },
  {
    id: 'harmony_conductor',
    name: 'Harmony Conductor',
    slot: 'core',
    uniqueEffectName: 'Poison Swamp Missiles',
    uniqueEffectDescription: 'Enemies caught in Poison Swamp have a 60% chance to misfire and hit other enemies.',
    themeColor: '#a855f7',
    maxLevel: 160,
  },
  {
    id: 'diminishing_core',
    name: 'Diminishing Core',
    slot: 'core',
    uniqueEffectName: 'Chain Lightning Shock Cascade',
    uniqueEffectDescription: 'Chain Lightning shock stacks up to 5 times for massive damage amplification.',
    themeColor: '#38bdf8',
    maxLevel: 160,
  },
  {
    id: 'om_chip',
    name: 'Om Chip',
    slot: 'core',
    uniqueEffectName: 'Spotlight Boss Lock',
    uniqueEffectDescription: 'Spotlight permanently rotates to target the strongest boss or elite on the screen.',
    themeColor: '#fbbf24',
    maxLevel: 160,
  },
];

export const MASTER_SUBSTATS_CATALOG: SubstatDefinition[] = [
  // Cannon Substats
  { id: 'attack_speed', name: 'Attack Speed', slot: 'cannon', unit: '', values: { rare: 1, epic: 2, legendary: 3, mythic: 4, ancestral: 5 } },
  { id: 'crit_factor', name: 'Crit Factor', slot: 'cannon', unit: 'x', values: { rare: 2, epic: 5, legendary: 10, mythic: 15, ancestral: 25 } },
  { id: 'crit_chance', name: 'Crit Chance', slot: 'cannon', unit: '%', values: { rare: 1, epic: 3, legendary: 5, mythic: 7, ancestral: 10 } },
  { id: 'super_crit_chance', name: 'Super Crit Chance', slot: 'cannon', unit: '%', values: { rare: 1, epic: 3, legendary: 5, mythic: 8, ancestral: 12 } },
  { id: 'super_crit_mult', name: 'Super Crit Multiplier', slot: 'cannon', unit: 'x', values: { rare: 1, epic: 3, legendary: 6, mythic: 10, ancestral: 18 } },
  { id: 'bounce_shot_targets', name: 'Bounce Shot Targets', slot: 'cannon', unit: '', values: { rare: 1, epic: 1, legendary: 2, mythic: 2, ancestral: 3 } },
  { id: 'bounce_shot_chance', name: 'Bounce Shot Chance', slot: 'cannon', unit: '%', values: { rare: 2, epic: 4, legendary: 6, mythic: 8, ancestral: 12 } },
  { id: 'attack_range', name: 'Attack Range', slot: 'cannon', unit: 'm', values: { rare: 2, epic: 4, legendary: 6, mythic: 8, ancestral: 12 } },
  { id: 'multishot_targets', name: 'Multishot Targets', slot: 'cannon', unit: '', values: { rare: 1, epic: 1, legendary: 2, mythic: 2, ancestral: 3 } },

  // Armor Substats
  { id: 'defense_percent', name: 'Defense %', slot: 'armor', unit: '%', values: { rare: 1.5, epic: 3.0, legendary: 5.0, mythic: 7.0, ancestral: 9.0 } },
  { id: 'health_regen', name: 'Health Regen', slot: 'armor', unit: 'x', values: { rare: 0.5, epic: 1.5, legendary: 3.0, mythic: 5.0, ancestral: 8.0 } },
  { id: 'wall_health', name: 'Wall Health', slot: 'armor', unit: '%', values: { rare: 10, epic: 25, legendary: 50, mythic: 75, ancestral: 120 } },
  { id: 'wall_rebuild_time', name: 'Wall Rebuild Time', slot: 'armor', unit: 's', values: { rare: -5, epic: -10, legendary: -15, mythic: -20, ancestral: -30 } },
  { id: 'thorns_damage', name: 'Thorns Damage', slot: 'armor', unit: '%', values: { rare: 5, epic: 10, legendary: 15, mythic: 20, ancestral: 30 } },
  { id: 'orb_count', name: 'Extra Orbs', slot: 'armor', unit: '', values: { rare: 0, epic: 1, legendary: 1, mythic: 2, ancestral: 2 } },
  { id: 'land_mine_damage', name: 'Land Mine Damage', slot: 'armor', unit: 'x', values: { rare: 2, epic: 5, legendary: 10, mythic: 20, ancestral: 35 } },
  { id: 'defense_absolute', name: 'Defense Absolute', slot: 'armor', unit: 'x', values: { rare: 1.2, epic: 2.0, legendary: 3.5, mythic: 5.0, ancestral: 8.0 } },

  // Generator Substats
  { id: 'coins_per_kill', name: 'Coins / Kill Bonus', slot: 'generator', unit: 'x', values: { rare: 0.2, epic: 0.5, legendary: 1.0, mythic: 1.5, ancestral: 2.5 } },
  { id: 'package_chance', name: 'Recovery Package Chance', slot: 'generator', unit: '%', values: { rare: 2, epic: 4, legendary: 6, mythic: 8, ancestral: 12 } },
  { id: 'package_max_recovery', name: 'Package Max Recovery', slot: 'generator', unit: 'x', values: { rare: 0.5, epic: 1.0, legendary: 2.0, mythic: 3.0, ancestral: 5.0 } },
  { id: 'free_upgrade_chance', name: 'Free Upgrade Chance', slot: 'generator', unit: '%', values: { rare: 2, epic: 4, legendary: 6, mythic: 8, ancestral: 10 } },
  { id: 'enemy_level_skip', name: 'Enemy Level Skip %', slot: 'generator', unit: '%', values: { rare: 1, epic: 2, legendary: 3, mythic: 5, ancestral: 8 } },
  { id: 'cash_bonus', name: 'Cash Bonus', slot: 'generator', unit: 'x', values: { rare: 0.5, epic: 1.0, legendary: 2.0, mythic: 3.0, ancestral: 4.5 } },
  { id: 'orb_speed', name: 'Orb Speed', slot: 'generator', unit: 'x', values: { rare: 0.2, epic: 0.4, legendary: 0.6, mythic: 0.8, ancestral: 1.2 } },

  // Core Substats
  { id: 'gt_bonus', name: 'Golden Tower Bonus', slot: 'core', unit: 'x', values: { rare: 1.0, epic: 2.0, legendary: 3.5, mythic: 5.0, ancestral: 8.0 } },
  { id: 'gt_duration', name: 'Golden Tower Duration', slot: 'core', unit: 's', values: { rare: 1, epic: 2, legendary: 3, mythic: 4, ancestral: 6 } },
  { id: 'bh_size', name: 'Black Hole Size', slot: 'core', unit: 'm', values: { rare: 2, epic: 4, legendary: 6, mythic: 8, ancestral: 12 } },
  { id: 'bh_duration', name: 'Black Hole Duration', slot: 'core', unit: 's', values: { rare: 1, epic: 2, legendary: 3, mythic: 4, ancestral: 6 } },
  { id: 'sl_angle', name: 'Spotlight Angle', slot: 'core', unit: '°', values: { rare: 2, epic: 5, legendary: 8, mythic: 12, ancestral: 18 } },
  { id: 'sl_bonus', name: 'Spotlight Bonus', slot: 'core', unit: 'x', values: { rare: 1.5, epic: 3.0, legendary: 5.0, mythic: 8.0, ancestral: 12.0 } },
  { id: 'dw_damage', name: 'Death Wave Damage', slot: 'core', unit: 'x', values: { rare: 2, epic: 5, legendary: 10, mythic: 20, ancestral: 40 } },
  { id: 'dw_quantity', name: 'Death Wave Quantity', slot: 'core', unit: '', values: { rare: 0, epic: 1, legendary: 1, mythic: 1, ancestral: 2 } },
  { id: 'cf_slow', name: 'Chrono Field Slow %', slot: 'core', unit: '%', values: { rare: 2, epic: 4, legendary: 6, mythic: 8, ancestral: 10 } },
  { id: 'cl_chance', name: 'Chain Lightning Chance', slot: 'core', unit: '%', values: { rare: 1, epic: 2, legendary: 3, mythic: 5, ancestral: 8 } },
];

export const REROLL_SHARDS_COST_PER_ROLL: Record<number, number> = {
  0: 10,    // 0 locked lines
  1: 50,    // 1 locked line
  2: 200,   // 2 locked lines
  3: 500,   // 3 locked lines
  4: 1000,  // 4 locked lines
  5: 2500,  // 5 locked lines
};
