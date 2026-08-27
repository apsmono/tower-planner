import type { EffectChannel } from '../domain/store';

export type LabCategory = 
  | 'all'
  | 'main'
  | 'attack'
  | 'defense'
  | 'utility'
  | 'perks'
  | 'ultimate_weapons'
  | 'modules';

export interface LabDefinition {
  id: string;
  name: string;
  category: 'main' | 'attack' | 'defense' | 'utility' | 'perks' | 'ultimate_weapons' | 'modules';
  maxLevel: number;
  description: string;
  wikiUrl: string;
  defaultChannel?: EffectChannel;
  defaultEffectKind?: 'multiplier' | 'percent' | 'flat' | 'unlock';
  defaultReason?: string;
}

export const LAB_CATEGORIES: { id: LabCategory; label: string; icon: string; count?: number }[] = [
  { id: 'all', label: 'All Labs', icon: '🔬' },
  { id: 'main', label: 'Main & Speed', icon: '⚡' },
  { id: 'attack', label: 'Attack & Damage', icon: '⚔️' },
  { id: 'defense', label: 'Defense & Wall', icon: '🛡️' },
  { id: 'utility', label: 'Economy & Utility', icon: '💰' },
  { id: 'perks', label: 'Perks & Cards', icon: '🃏' },
  { id: 'ultimate_weapons', label: 'Ultimate Weapons', icon: '✨' },
  { id: 'modules', label: 'Modules & Shards', icon: '💎' },
];

export const MASTER_LAB_CATALOG: LabDefinition[] = [
  // --- 1. MAIN / LAB GENERAL ---
  {
    id: 'game_speed',
    name: 'Game Speed',
    category: 'main',
    maxLevel: 7,
    description: 'Increases game playback speed up to 5.0x / 6.25x.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Game_Speed',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'lab_speed',
    name: 'Lab Speed',
    category: 'main',
    maxLevel: 99,
    description: 'Permanent passive research multiplier applied across all 5 lab lanes.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Lab_Upgrades#Lab_Speed',
    defaultChannel: 'utility.labSpeed',
    defaultEffectKind: 'percent'
  },
  {
    id: 'lab_coin_discount',
    name: 'Lab Coin Discount',
    category: 'main',
    maxLevel: 99,
    description: 'Reduces coin cost of all laboratory research upgrades.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Lab_Coin_Discount',
    defaultEffectKind: 'percent'
  },
  {
    id: 'target_priority',
    name: 'Target Priority',
    category: 'main',
    maxLevel: 2,
    description: 'Unlocks target priority menu to prioritize Protectors, Elites, Bosses, Fast, or Closest enemies.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Target_Priority',
    defaultEffectKind: 'unlock'
  },
  {
    id: 'more_round_stats',
    name: 'More Round Stats',
    category: 'main',
    maxLevel: 1,
    description: 'Enables advanced post-battle report metrics including enemy spawn breakdowns and damage logs.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/More_Round_Stats',
    defaultEffectKind: 'unlock'
  },

  // --- 2. ATTACK ---
  {
    id: 'damage',
    name: 'Damage',
    category: 'attack',
    maxLevel: 99,
    description: 'Increases baseline Tower projectile damage.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Lab_Upgrades#Damage',
    defaultChannel: 'damage.projectiles',
    defaultEffectKind: 'percent'
  },
  {
    id: 'attack_speed',
    name: 'Attack Speed',
    category: 'attack',
    maxLevel: 99,
    description: 'Increases Tower projectile fire rate per second. Critical for crowd control and knockback.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Attack_Speed',
    defaultChannel: 'damage.projectiles',
    defaultEffectKind: 'percent'
  },
  {
    id: 'critical_factor',
    name: 'Critical Factor',
    category: 'attack',
    maxLevel: 99,
    description: 'Increases damage multiplier applied on critical hits.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Critical_Factor',
    defaultChannel: 'damage.projectiles',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'range',
    name: 'Range',
    category: 'attack',
    maxLevel: 99,
    description: 'Expands Tower firing radius and firing distance.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Range',
    defaultEffectKind: 'flat'
  },
  {
    id: 'damage_per_meter',
    name: 'Damage / Meter',
    category: 'attack',
    maxLevel: 99,
    description: 'Multiplies damage based on distance between target and tower.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Damage_/_Meter',
    defaultChannel: 'damage.projectiles',
    defaultEffectKind: 'percent'
  },
  {
    id: 'super_crit_chance',
    name: 'Super Crit Chance',
    category: 'attack',
    maxLevel: 99,
    description: 'Chance for a Critical Hit to trigger as a Super Critical hit.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Super_Crit',
    defaultEffectKind: 'percent'
  },
  {
    id: 'super_crit_mult',
    name: 'Super Crit Mult',
    category: 'attack',
    maxLevel: 99,
    description: 'Multiplier applied when a Super Critical hit procs.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Super_Crit',
    defaultChannel: 'damage.projectiles',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'rend_armor_chance',
    name: 'Rend Armor Chance',
    category: 'attack',
    maxLevel: 30,
    description: 'Chance on hit to rend enemy armor and increase subsequent damage received.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Rend_Armor',
    defaultEffectKind: 'percent'
  },
  {
    id: 'rend_armor_mult',
    name: 'Rend Armor Mult',
    category: 'attack',
    maxLevel: 30,
    description: 'Maximum damage amplification multiplier achievable via Rend Armor.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Rend_Armor',
    defaultEffectKind: 'multiplier'
  },

  // --- 3. DEFENSE ---
  {
    id: 'health',
    name: 'Health',
    category: 'defense',
    maxLevel: 99,
    description: 'Increases Tower maximum Health pool.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Health',
    defaultChannel: 'defense.health',
    defaultEffectKind: 'percent'
  },
  {
    id: 'health_regen',
    name: 'Health Regen',
    category: 'defense',
    maxLevel: 99,
    description: 'Increases Tower health recovered per second.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Health_Regen',
    defaultEffectKind: 'percent'
  },
  {
    id: 'defense_percent',
    name: 'Defense %',
    category: 'defense',
    maxLevel: 30,
    description: 'Percentage damage mitigation on all incoming attacks.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Defense_%25',
    defaultEffectKind: 'percent'
  },
  {
    id: 'defense_absolute',
    name: 'Defense Absolute',
    category: 'defense',
    maxLevel: 99,
    description: 'Flat damage subtracted from each enemy attack.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Defense_Absolute',
    defaultEffectKind: 'flat'
  },
  {
    id: 'garlic_thorns',
    name: 'Garlic Thorns',
    category: 'defense',
    maxLevel: 15,
    description: 'Applies thorn damage against Vampires and Elites. Baseline Lv.13–15 prevents heat-up fatal drain.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Garlic_Thorns',
    defaultChannel: 'defense.wall',
    defaultEffectKind: 'percent',
    defaultReason: 'heat-up footgun is live below baseline'
  },
  {
    id: 'wall_health',
    name: 'Wall Health',
    category: 'defense',
    maxLevel: 50,
    description: 'Increases Wall maximum health percentage relative to Tower health.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/The_Wall',
    defaultChannel: 'defense.wall',
    defaultEffectKind: 'percent'
  },
  {
    id: 'wall_rebuild',
    name: 'Wall Rebuild',
    category: 'defense',
    maxLevel: 20,
    description: 'Reduces the cooldown time required for destroyed Wall to rebuild.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/The_Wall',
    defaultEffectKind: 'flat'
  },
  {
    id: 'wall_regen',
    name: 'Wall Regen',
    category: 'defense',
    maxLevel: 20,
    description: 'Applies Tower health regen to continuously repair the active Wall.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/The_Wall',
    defaultEffectKind: 'percent'
  },
  {
    id: 'wall_thorns',
    name: 'Wall Thorns',
    category: 'defense',
    maxLevel: 20,
    description: 'Inflicts thorn damage onto enemies attacking the Wall. Must reach Lv.13+ for safe tanking.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/The_Wall',
    defaultChannel: 'defense.wall',
    defaultEffectKind: 'percent'
  },
  {
    id: 'wall_fortification',
    name: 'Wall Fortification',
    category: 'defense',
    maxLevel: 50,
    description: 'Multiplies total Wall HP using unused Tower recovery packs.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/The_Wall',
    defaultEffectKind: 'percent'
  },
  {
    id: 'wall_invincibility',
    name: 'Wall Invincibility',
    category: 'defense',
    maxLevel: 10,
    description: 'Grants temporary invulnerability to the Wall right after rebuilding.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/The_Wall',
    defaultEffectKind: 'flat'
  },
  {
    id: 'orb_speed',
    name: 'Orb Speed',
    category: 'defense',
    maxLevel: 20,
    description: 'Increases revolution velocity of inner defense Orbs.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Orbs',
    defaultChannel: 'coins.orbs',
    defaultEffectKind: 'percent'
  },
  {
    id: 'extra_orbs',
    name: 'Extra Orbs',
    category: 'defense',
    maxLevel: 3,
    description: 'Adds up to 3 extra outer defense Orbs via the Extra Orb card.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Extra_Orb',
    defaultEffectKind: 'flat'
  },
  {
    id: 'extra_orb_adjuster',
    name: 'Extra Orb Adjuster',
    category: 'defense',
    maxLevel: 1,
    description: 'Unlocks manual orbit range adjustment for Extra Orbs to slice through Black Hole centers.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Extra_Orb_Adjuster',
    defaultEffectKind: 'unlock'
  },
  {
    id: 'shockwave_size',
    name: 'Shockwave Size',
    category: 'defense',
    maxLevel: 15,
    description: 'Expands the pushback radius of Tower Shockwave pulses.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Shockwave',
    defaultEffectKind: 'flat'
  },
  {
    id: 'shockwave_frequency',
    name: 'Shockwave Frequency',
    category: 'defense',
    maxLevel: 30,
    description: 'Reduces interval between Shockwave pulses.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Shockwave',
    defaultEffectKind: 'flat'
  },

  // --- 4. UTILITY & ECONOMY ---
  {
    id: 'cash_bonus',
    name: 'Cash Bonus',
    category: 'utility',
    maxLevel: 99,
    description: 'Multiplies Cash earned per kill during battle runs.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Cash_Bonus',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'coins_per_kill',
    name: 'Coins / Kill Bonus',
    category: 'utility',
    maxLevel: 99,
    description: 'Multiplies base Coin yield rewarded from defeating enemies.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Coins_/_Kill_Bonus',
    defaultChannel: 'coins.global',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'coins_per_wave',
    name: 'Coins / Wave',
    category: 'utility',
    maxLevel: 99,
    description: 'Flat coins awarded at the end of each wave completed.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Coins_/_Wave',
    defaultEffectKind: 'flat'
  },
  {
    id: 'free_attack_upgrade',
    name: 'Free Attack Upgrade',
    category: 'utility',
    maxLevel: 99,
    description: 'Chance per wave to grant a free Attack Workshop level.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Free_Attack_Upgrade',
    defaultEffectKind: 'percent'
  },
  {
    id: 'free_defense_upgrade',
    name: 'Free Defense Upgrade',
    category: 'utility',
    maxLevel: 99,
    description: 'Chance per wave to grant a free Defense Workshop level.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Free_Defense_Upgrade',
    defaultEffectKind: 'percent'
  },
  {
    id: 'free_utility_upgrade',
    name: 'Free Utility Upgrade',
    category: 'utility',
    maxLevel: 99,
    description: 'Chance per wave to grant a free Utility Workshop level.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Free_Utility_Upgrade',
    defaultEffectKind: 'percent'
  },
  {
    id: 'interest',
    name: 'Interest',
    category: 'utility',
    maxLevel: 99,
    description: 'Earn interest on unspent Cash at end of each wave.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Interest',
    defaultEffectKind: 'percent'
  },
  {
    id: 'max_interest',
    name: 'Max Interest',
    category: 'utility',
    maxLevel: 15,
    description: 'Increases the cash interest payout cap per wave.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Max_Interest',
    defaultEffectKind: 'flat'
  },
  {
    id: 'package_chance',
    name: 'Recovery Package Chance',
    category: 'utility',
    maxLevel: 50,
    description: 'Chance to receive a Health Recovery Package on wave completion.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Recovery_Packages',
    defaultEffectKind: 'percent'
  },
  {
    id: 'max_recovery',
    name: 'Max Recovery',
    category: 'utility',
    maxLevel: 50,
    description: 'Increases maximum overheal multiplier capacity from Recovery Packages.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Recovery_Packages',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'package_after_boss',
    name: 'Package After Boss',
    category: 'utility',
    maxLevel: 1,
    description: 'Guarantees a Recovery Package spawn immediately after defeating boss waves.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Recovery_Packages',
    defaultEffectKind: 'unlock'
  },
  {
    id: 'enemy_level_skip',
    name: 'Enemy Level Skip',
    category: 'utility',
    maxLevel: 20,
    description: 'Increases free Enemy Attack & Health level skip chances.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Enemy_Level_Skip',
    defaultEffectKind: 'percent'
  },

  // --- 5. PERKS & CARDS ---
  {
    id: 'standard_perks',
    name: 'Standard Perks Bonus',
    category: 'perks',
    maxLevel: 25,
    description: 'Boosts effectiveness of all standard White perks by +1% per level.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Standard_Perks_Bonus',
    defaultChannel: 'coins.global',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'tradeoff_perks',
    name: 'Improve Trade-off Perks',
    category: 'perks',
    maxLevel: 10,
    description: 'Increases positive effects and coin multipliers on Purple Trade-off perks.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Improve_Trade-off_Perks',
    defaultChannel: 'coins.global',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'ban_perks',
    name: 'Ban Perks',
    category: 'perks',
    maxLevel: 5,
    description: 'Permanently bans undesirable perks from appearing in in-game perk choices.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Ban_Perks',
    defaultChannel: 'utility.perks',
    defaultEffectKind: 'flat'
  },
  {
    id: 'first_perk_choice',
    name: 'First Perk Choice',
    category: 'perks',
    maxLevel: 1,
    description: 'Allows choosing your preferred first perk (e.g. 50/50 Coin bonus or Wave Req).',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/First_Perk_Choice',
    defaultEffectKind: 'unlock'
  },
  {
    id: 'auto_pick_ranking',
    name: 'Auto Pick Perks Ranking',
    category: 'perks',
    maxLevel: 1,
    description: 'Enables custom automated priority ranking for overnight AFK perk selection.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Auto_Pick_Perks',
    defaultEffectKind: 'unlock'
  },
  {
    id: 'waves_required',
    name: 'Waves Required',
    category: 'perks',
    maxLevel: 25,
    description: 'Decreases the number of waves required between perk reward selections.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Waves_Required',
    defaultChannel: 'utility.waveSkip',
    defaultEffectKind: 'flat'
  },
  {
    id: 'card_presets',
    name: 'Card Presets',
    category: 'perks',
    maxLevel: 5,
    description: 'Unlocks switchable preset loadouts for farming, tournament, and milestone builds.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Card_Presets',
    defaultEffectKind: 'flat'
  },

  // --- 6. ULTIMATE WEAPONS ---
  {
    id: 'gt_bonus',
    name: 'Golden Tower Bonus',
    category: 'ultimate_weapons',
    maxLevel: 25,
    description: 'Permanently adds +0.15x to Golden Tower active Coin and Cash bonus multiplier.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Golden_Tower',
    defaultChannel: 'coins.goldenTower',
    defaultEffectKind: 'flat'
  },
  {
    id: 'gt_duration',
    name: 'Golden Tower Duration',
    category: 'ultimate_weapons',
    maxLevel: 20,
    description: 'Extends Golden Tower activation duration by +1.0s per level.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Golden_Tower',
    defaultChannel: 'coins.goldenTower',
    defaultEffectKind: 'flat'
  },
  {
    id: 'bh_coin',
    name: 'Black Hole Coin Bonus',
    category: 'ultimate_weapons',
    maxLevel: 20,
    description: 'Multiplies coins dropped by enemies trapped inside Black Hole vortices (up to 11.0x cap).',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Black_Hole',
    defaultChannel: 'coins.blackHole',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'bh_damage',
    name: 'Black Hole Damage',
    category: 'ultimate_weapons',
    maxLevel: 10,
    description: 'Deals % max HP damage per second to trapped enemies. Essential for killing Protectors.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Black_Hole',
    defaultEffectKind: 'percent'
  },
  {
    id: 'bh_disable_ranged',
    name: 'BH disable Ranged Enemies',
    category: 'ultimate_weapons',
    maxLevel: 1,
    description: 'Stops ranged enemies from shooting while trapped inside the Black Hole vortex.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Black_Hole',
    defaultChannel: 'utility.ranged',
    defaultEffectKind: 'unlock'
  },
  {
    id: 'extra_black_hole',
    name: 'Extra Black Hole',
    category: 'ultimate_weapons',
    maxLevel: 1,
    description: 'Spawns a second permanent Black Hole vortex opposite the primary one.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Black_Hole',
    defaultChannel: 'coins.blackHole',
    defaultEffectKind: 'unlock'
  },
  {
    id: 'dw_health',
    name: 'Death Wave Health',
    category: 'ultimate_weapons',
    maxLevel: 25,
    description: 'Multiplies max Tower Health based on enemies killed by or tagged with Death Wave.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Death_Wave',
    defaultChannel: 'defense.health',
    defaultEffectKind: 'percent'
  },
  {
    id: 'dw_coin',
    name: 'Death Wave Coin Bonus',
    category: 'ultimate_weapons',
    maxLevel: 20,
    description: 'Multiplies coin yield from enemies hit by Death Wave rings.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Death_Wave',
    defaultChannel: 'coins.deathWave',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'dw_cell',
    name: 'Death Wave Cell Bonus',
    category: 'ultimate_weapons',
    maxLevel: 20,
    description: 'Increases cell drops rewarded from Elites hit by Death Wave.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Death_Wave',
    defaultChannel: 'cells.deathWave',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'dw_armor_strip',
    name: 'Death Wave Armor Strip',
    category: 'ultimate_weapons',
    maxLevel: 10,
    description: 'Strips armored enemy shields when touched by Death Wave.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Death_Wave',
    defaultEffectKind: 'flat'
  },
  {
    id: 'spotlight_coin',
    name: 'Spotlight Coin Bonus',
    category: 'ultimate_weapons',
    maxLevel: 20,
    description: 'Multiplies coins dropped by enemies killed inside Spotlight beams (up to 3.0x).',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Spotlight',
    defaultChannel: 'coins.spotlight',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'spotlight_missiles',
    name: 'Spotlight Missiles',
    category: 'ultimate_weapons',
    maxLevel: 20,
    description: 'Fires periodic homing Smart Missiles directly from Spotlight beams.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Spotlight',
    defaultEffectKind: 'flat'
  },
  {
    id: 'chrono_field_duration',
    name: 'Chrono Field Duration',
    category: 'ultimate_weapons',
    maxLevel: 30,
    description: 'Adds +1.0s duration per level to Chrono Field (critical for achieving 100% permanent uptime).',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Chrono_Field',
    defaultEffectKind: 'flat'
  },
  {
    id: 'chrono_field_reduction',
    name: 'Chrono Field Damage Reduction',
    category: 'ultimate_weapons',
    maxLevel: 10,
    description: 'Reduces damage received by tower while Chrono Field is active.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Chrono_Field',
    defaultEffectKind: 'percent'
  },
  {
    id: 'chain_lightning_shock',
    name: 'Chain Lightning Shock',
    category: 'ultimate_weapons',
    maxLevel: 20,
    description: 'Inflicts Shock debuff increasing all incoming damage taken by shocked enemies.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Chain_Lightning',
    defaultEffectKind: 'percent'
  },
  {
    id: 'poison_swamp_stun',
    name: 'Poison Swamp Stun',
    category: 'ultimate_weapons',
    maxLevel: 20,
    description: 'Grants Poison Swamp a chance to stun trapped enemies.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Poison_Swamp',
    defaultEffectKind: 'percent'
  },
  {
    id: 'smart_missile_amp',
    name: 'Smart Missile Amplifier',
    category: 'ultimate_weapons',
    maxLevel: 25,
    description: 'Consecutive missiles hitting the same target deal compounding damage.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Smart_Missiles',
    defaultEffectKind: 'multiplier'
  },
  {
    id: 'inner_land_mine_stun',
    name: 'Inner Land Mine Stun',
    category: 'ultimate_weapons',
    maxLevel: 15,
    description: 'Inner Land Mines stun bosses and enemies on detonation.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Inner_Land_Mines',
    defaultEffectKind: 'flat'
  },

  // --- 7. MODULES & SHARDS ---
  {
    id: 'reroll_shards',
    name: 'Reroll Shards',
    category: 'modules',
    maxLevel: 100,
    description: 'Increases Reroll Shard drops per boss kill to roll top-tier Ancestral module sub-effects.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Reroll_Shards',
    defaultChannel: 'utility.shards',
    defaultEffectKind: 'flat'
  },
  {
    id: 'rare_drop',
    name: 'Rare Drop Chance',
    category: 'modules',
    maxLevel: 10,
    description: 'Increases drop rate of Rare modules from boss waves.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Modules',
    defaultChannel: 'utility.shards',
    defaultEffectKind: 'flat'
  },
  {
    id: 'daily_mission_shards',
    name: 'Daily Mission Shards',
    category: 'modules',
    maxLevel: 50,
    description: 'Increases module shard payouts earned from completing daily missions.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Daily_Missions',
    defaultEffectKind: 'flat'
  },
  {
    id: 'module_shard_cost',
    name: 'Module Shard Cost',
    category: 'modules',
    maxLevel: 50,
    description: 'Reduces module shard upgrade costs across all four module slots.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Modules',
    defaultEffectKind: 'percent'
  }
];
