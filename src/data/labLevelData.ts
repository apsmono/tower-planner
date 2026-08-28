import { MASTER_LAB_CATALOG, type LabDefinition } from './labCatalog';

export interface LabLevelInfo {
  labId: string;
  level: number;
  baseTimeSeconds: number;
  coinCost: number;
}

export interface LabResearchCalculationParams {
  labId: string;
  startLevel: number;
  targetLevel: number;
  labSpeedLevel?: number;        // e.g. 89 (gives +178% = 2.78x)
  labSpeedRelicMult?: number;    // e.g. 1.02 (artifact / relic multiplier)
  cellBoost?: number;            // e.g. 1.0, 1.5, 2.0, 3.0, 4.0, 5.0
  labCoinDiscountLevel?: number; // e.g. 30 (gives -15% cost discount)
  relicDiscountMult?: number;    // e.g. 0.98 (-2% from relics/themes)
}

export interface SingleLevelBreakdown {
  level: number;
  baseTimeSeconds: number;
  effectiveTimeSeconds: number;
  baseCoinCost: number;
  effectiveCoinCost: number;
}

export interface LabResearchSummary {
  labId: string;
  labName: string;
  startLevel: number;
  targetLevel: number;
  totalBaseTimeSeconds: number;
  totalEffectiveTimeSeconds: number;
  totalBaseCoinCost: number;
  totalEffectiveCoinCost: number;
  labSpeedMultiplier: number;
  effectiveSpeedup: number;
  coinDiscountPercent: number;
  levels: SingleLevelBreakdown[];
}

/**
 * Archetypes for continuous curve estimation when explicit lookup isn't defined.
 */
interface LabArchetype {
  baseTimeSec: number;     // Level 1 base duration in seconds
  timeScale: number;       // Per-level multiplier
  baseCoins: number;       // Level 1 base coin cost
  costScale: number;       // Per-level cost multiplier
}

const ARCHETYPES: Record<string, LabArchetype> = {
  // Ultra-short starter labs (Game Speed, More Round Stats, etc.)
  quick_starter: {
    baseTimeSec: 1800,       // 30 mins
    timeScale: 2.2,
    baseCoins: 10000,
    costScale: 2.5,
  },
  // Standard 99-level labs (Damage, Attack Speed, Health, Health Regen, Lab Speed, Lab Coin Discount)
  standard_99: {
    baseTimeSec: 3600,       // 1 hour
    timeScale: 1.072,        // ~1.072x per level
    baseCoins: 25000,
    costScale: 1.15,
  },
  // Elite/UW labs (GT Bonus, DW Coin, BH Coin, SL Coin, CF Duration)
  uw_perk: {
    baseTimeSec: 86400 * 1.5, // 1.5 days
    timeScale: 1.12,
    baseCoins: 5000000,
    costScale: 1.35,
  },
  // Wall / Defense special labs (Garlic Thorns, Wall Health, Wall Rebuild, Wall Thorns)
  wall_defense: {
    baseTimeSec: 86400 * 1.0, // 1 day
    timeScale: 1.15,
    baseCoins: 1000000,
    costScale: 1.4,
  },
  // Module labs (Reroll Shards, Rare Drop Chance, Daily Mission Shards)
  modules: {
    baseTimeSec: 3600 * 8,   // 8 hours
    timeScale: 1.14,
    baseCoins: 5000000,
    costScale: 1.35,
  },
  // Perk labs (Ban Perks, Standard Perk Bonus, Improve Trade-off Perks)
  perks: {
    baseTimeSec: 86400 * 1.2, // 1.2 days
    timeScale: 1.18,
    baseCoins: 20000000,
    costScale: 1.45,
  },
  // Major milestone / single-level / unlock labs
  milestone_unlock: {
    baseTimeSec: 86400 * 5,  // 5 days
    timeScale: 1.5,
    baseCoins: 1000000000,
    costScale: 2.0,
  }
};

// Map specific lab IDs to archetype models
const LAB_ARCHETYPE_MAP: Record<string, string> = {
  game_speed: 'quick_starter',
  target_priority: 'quick_starter',
  more_round_stats: 'quick_starter',
  lab_speed: 'standard_99',
  lab_coin_discount: 'standard_99',
  damage: 'standard_99',
  attack_speed: 'standard_99',
  critical_factor: 'standard_99',
  range: 'standard_99',
  damage_per_meter: 'standard_99',
  super_crit_chance: 'standard_99',
  super_crit_mult: 'standard_99',
  health: 'standard_99',
  health_regen: 'standard_99',
  defense_percent: 'standard_99',
  defense_absolute: 'standard_99',
  garlic_thorns: 'wall_defense',
  wall_health: 'wall_defense',
  wall_rebuild: 'wall_defense',
  wall_regen: 'wall_defense',
  wall_thorns: 'wall_defense',
  wall_fortification: 'wall_defense',
  coins_per_kill: 'standard_99',
  cash_bonus: 'standard_99',
  free_attack_upgrade: 'standard_99',
  free_defense_upgrade: 'standard_99',
  free_utility_upgrade: 'standard_99',
  standard_perks: 'perks',
  tradeoff_perks: 'perks',
  ban_perks: 'perks',
  waves_required: 'perks',
  auto_pick_perks: 'perks',
  first_perk_choice: 'milestone_unlock',
  reroll_shards: 'modules',
  rare_drop: 'modules',
  daily_mission_shards: 'modules',
  common_drop: 'modules',
  bh_coin: 'uw_perk',
  gt_bonus: 'uw_perk',
  gt_duration: 'uw_perk',
  dw_coin: 'uw_perk',
  dw_health: 'uw_perk',
  dw_cell_bonus: 'uw_perk',
  spotlight_coin: 'uw_perk',
  spotlight_missiles: 'uw_perk',
  cf_duration: 'uw_perk',
  cf_reduction: 'uw_perk',
  cf_range: 'uw_perk',
  sl_coins: 'uw_perk',
  sm_cooldown: 'uw_perk',
  sm_amplifier: 'uw_perk',
  sm_radius: 'uw_perk',
  cl_shock_chance: 'uw_perk',
  cl_shock_mult: 'uw_perk',
  il_rotation_speed: 'uw_perk',
  ps_stun_chance: 'uw_perk',
  bh_disable_ranged: 'milestone_unlock',
  second_black_hole: 'milestone_unlock',
};

// Known explicit data points from wiki / starter dataset to anchor curves
const EXPLICIT_LAB_LEVELS: Record<string, Record<number, { baseTimeSeconds: number; coinCost: number }>> = {
  wall_thorns: {
    1: { baseTimeSeconds: 86400 * 1, coinCost: 100000000 },
    5: { baseTimeSeconds: 86400 * 2 + 3600 * 4, coinCost: 550000000 },
    10: { baseTimeSeconds: 86400 * 4 + 3600 * 18, coinCost: 4200000000 },
    13: { baseTimeSeconds: 86400 * 7 + 3600 * 12, coinCost: 18500000000 }, // ~7d 12h base, 18.5B coins
    15: { baseTimeSeconds: 86400 * 10 + 3600 * 6, coinCost: 45000000000 },
    20: { baseTimeSeconds: 86400 * 21 + 3600 * 8, coinCost: 280000000000 }
  },
  garlic_thorns: {
    1: { baseTimeSeconds: 3600 * 8, coinCost: 5000 },
    9: { baseTimeSeconds: 86400 * 1 + 3600 * 8, coinCost: 302140 },
    10: { baseTimeSeconds: 86400 * 1 + 3600 * 18, coinCost: 580000 },
    13: { baseTimeSeconds: 86400 * 3 + 3600 * 14, coinCost: 2400000 },
    15: { baseTimeSeconds: 86400 * 5 + 3600 * 12, coinCost: 5800000 }
  },
  lab_speed: {
    1: { baseTimeSeconds: 3600 * 1, coinCost: 100 },
    10: { baseTimeSeconds: 3600 * 7, coinCost: 50000 },
    50: { baseTimeSeconds: 86400 * 4 + 3600 * 12, coinCost: 120000000 },
    89: { baseTimeSeconds: 86400 * 28 + 3600 * 6, coinCost: 85000000000 },
    99: { baseTimeSeconds: 86400 * 52 + 3600 * 10, coinCost: 450000000000 }
  },
  lab_coin_discount: {
    1: { baseTimeSeconds: 3600 * 1, coinCost: 100 },
    10: { baseTimeSeconds: 3600 * 6, coinCost: 40000 },
    50: { baseTimeSeconds: 86400 * 3 + 3600 * 18, coinCost: 95000000 },
    99: { baseTimeSeconds: 86400 * 42, coinCost: 320000000000 }
  },
  reroll_shards: {
    1: { baseTimeSeconds: 3600 * 4, coinCost: 1000000 },
    3: { baseTimeSeconds: 3600 * 11 + 60 * 19, coinCost: 12850000 },
  },
  spotlight_coin: {
    1: { baseTimeSeconds: 3600 * 6, coinCost: 5000000 },
    2: { baseTimeSeconds: 3600 * 12 + 60 * 56, coinCost: 19740000 },
  },
  dw_health: {
    1: { baseTimeSeconds: 3600 * 12, coinCost: 2000000 },
    12: { baseTimeSeconds: 86400 * 2 + 3600 * 11, coinCost: 320340000 },
  },
  tradeoff_perks: {
    1: { baseTimeSeconds: 3600 * 14, coinCost: 10000000 },
    6: { baseTimeSeconds: 86400 * 1 + 3600 * 8, coinCost: 1150000000 },
  },
  dw_coin: {
    1: { baseTimeSeconds: 3600 * 12, coinCost: 5000000 },
    14: { baseTimeSeconds: 86400 * 1 + 3600 * 4, coinCost: 1400000000 },
  },
  gt_duration: {
    1: { baseTimeSeconds: 86400 * 1, coinCost: 8000000 },
    16: { baseTimeSeconds: 86400 * 5 + 3600 * 15, coinCost: 2720000000 },
  },
  waves_required: {
    1: { baseTimeSeconds: 3600 * 10, coinCost: 15000000 },
    12: { baseTimeSeconds: 86400 * 1 + 3600 * 16, coinCost: 2970000000 },
  },
  gt_bonus: {
    1: { baseTimeSeconds: 86400 * 1.5, coinCost: 12000000 },
    18: { baseTimeSeconds: 86400 * 7 + 3600 * 17, coinCost: 4860000000 },
  },
  standard_perks: {
    1: { baseTimeSeconds: 3600 * 12, coinCost: 20000000 },
    14: { baseTimeSeconds: 86400 * 2 + 3600 * 18, coinCost: 10270000000 },
  },
  bh_coin: {
    1: { baseTimeSeconds: 86400 * 1, coinCost: 15000000 },
    18: { baseTimeSeconds: 86400 * 4 + 3600 * 20, coinCost: 13130000000 },
  },
  ban_perks: {
    1: { baseTimeSeconds: 86400 * 2, coinCost: 100000000 },
    4: { baseTimeSeconds: 86400 * 5 + 3600 * 16, coinCost: 13830000000 },
  },
  rare_drop: {
    1: { baseTimeSeconds: 86400 * 1, coinCost: 5000000000 },
    2: { baseTimeSeconds: 86400 * 2 + 3600 * 22, coinCost: 70070000000 },
  },
  bh_disable_ranged: {
    1: { baseTimeSeconds: 86400 * 9 + 3600 * 8, coinCost: 507100000000 }
  }
};

/**
 * Calculates total Lab Speed Multiplier from Lab Speed level and relic/artifact multipliers.
 * In The Tower: Each level of Lab Speed adds +2% (0.02) to base speed (1.0).
 * E.g., Lv 89 = 1 + (89 * 0.02) = 2.78x.
 * Factoring artifact/relic 1.02 = 2.78 * 1.02 = 2.8356x.
 */
export function calculateLabSpeedMultiplier(
  labSpeedLevel: number = 0,
  relicMultiplier: number = 1.0
): number {
  const safeLevel = Math.max(0, Math.min(99, labSpeedLevel));
  const safeRelic = Math.max(0.5, relicMultiplier);
  const labBonus = 1.0 + safeLevel * 0.02;
  return labBonus * safeRelic;
}

/**
 * Calculates Lab Coin Discount percentage and cost multiplier.
 * In The Tower: Each level of Lab Coin Discount reduces research coin cost by -0.5% (0.005) up to -49.5%.
 * E.g., Lv 50 gives a 25% discount (cost multiplier = 0.75).
 */
export function calculateLabCoinDiscount(
  discountLevel: number = 0,
  relicDiscountMult: number = 1.0
): { discountPercent: number; costMultiplier: number } {
  const safeLevel = Math.max(0, Math.min(99, discountLevel));
  const safeRelic = Math.max(0.5, Math.min(1.0, relicDiscountMult));
  const discountFromLab = safeLevel * 0.005; // 0.5% per level
  const baseCostFactor = 1.0 - discountFromLab;
  const finalCostMultiplier = Number(Math.max(0.1, baseCostFactor * safeRelic).toFixed(6));
  const discountPercent = Number(((1.0 - finalCostMultiplier) * 100).toFixed(4));
  return {
    discountPercent,
    costMultiplier: finalCostMultiplier
  };
}

/**
 * Calculates Workshop Coin Discount percentage and cost multiplier.
 * In The Tower: Workshop Discount labs reduce coin upgrade costs in the workshop by -0.3% per level.
 */
export function calculateWorkshopDiscount(
  discountLevel: number = 0,
  relicDiscountMult: number = 1.0
): { discountPercent: number; costMultiplier: number } {
  const safeLevel = Math.max(0, Math.min(99, discountLevel));
  const safeRelic = Math.max(0.5, Math.min(1.0, relicDiscountMult));
  const discountFromLab = safeLevel * 0.003; // 0.3% per level
  const baseCostFactor = 1.0 - discountFromLab;
  const finalCostMultiplier = Number(Math.max(0.1, baseCostFactor * safeRelic).toFixed(6));
  const discountPercent = Number(((1.0 - finalCostMultiplier) * 100).toFixed(4));
  return {
    discountPercent,
    costMultiplier: finalCostMultiplier
  };
}

/**
 * Calculates baseline research time in seconds for a lab at a specified level.
 */
export function getBaseLabTime(labId: string, level: number): number {
  if (level <= 0) return 0;

  // 1. Check explicit data points
  if (EXPLICIT_LAB_LEVELS[labId]?.[level]?.baseTimeSeconds) {
    return EXPLICIT_LAB_LEVELS[labId][level].baseTimeSeconds;
  }

  // 2. Check if between explicit anchors, interpolate or scale
  const explicitKeys = Object.keys(EXPLICIT_LAB_LEVELS[labId] || {})
    .map(Number)
    .sort((a, b) => a - b);

  if (explicitKeys.length > 0) {
    const minKey = explicitKeys[0];

    if (level < minKey) {
      const minData = EXPLICIT_LAB_LEVELS[labId][minKey];
      return Math.max(60, Math.round(minData.baseTimeSeconds * Math.pow(0.9, minKey - level)));
    }
    
    // Find closest anchor lower than level
    let lowerKey = minKey;
    for (const k of explicitKeys) {
      if (k <= level) lowerKey = k;
      else break;
    }
    const baseData = EXPLICIT_LAB_LEVELS[labId][lowerKey];
    const arch = ARCHETYPES[LAB_ARCHETYPE_MAP[labId] || 'standard_99'];
    return Math.round(baseData.baseTimeSeconds * Math.pow(arch.timeScale, level - lowerKey));
  }

  // 3. Resolve archetype continuous curve
  const archetypeKey = LAB_ARCHETYPE_MAP[labId] || 'standard_99';
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.standard_99;
  const exponent = level - 1;
  const time = Math.round(arch.baseTimeSec * Math.pow(arch.timeScale, exponent));
  return Math.max(60, time);
}

/**
 * Calculates base coin cost for a lab at a specified level.
 */
export function getLabCoinCost(labId: string, level: number): number {
  if (level <= 0) return 0;

  if (EXPLICIT_LAB_LEVELS[labId]?.[level]?.coinCost) {
    return EXPLICIT_LAB_LEVELS[labId][level].coinCost;
  }

  const explicitKeys = Object.keys(EXPLICIT_LAB_LEVELS[labId] || {})
    .map(Number)
    .sort((a, b) => a - b);

  if (explicitKeys.length > 0) {
    let lowerKey = explicitKeys[0];
    for (const k of explicitKeys) {
      if (k <= level) lowerKey = k;
      else break;
    }
    const baseData = EXPLICIT_LAB_LEVELS[labId][lowerKey];
    const arch = ARCHETYPES[LAB_ARCHETYPE_MAP[labId] || 'standard_99'];
    return Math.round(baseData.coinCost * Math.pow(arch.costScale, level - lowerKey));
  }

  const archetypeKey = LAB_ARCHETYPE_MAP[labId] || 'standard_99';
  const arch = ARCHETYPES[archetypeKey] || ARCHETYPES.standard_99;
  const exponent = level - 1;
  const cost = Math.round(arch.baseCoins * Math.pow(arch.costScale, exponent));
  return cost;
}

/**
 * Calculates effective lab time in seconds factoring in user lab speed and cell boosts.
 */
export function calculateEffectiveLabTime(
  baseTimeSeconds: number,
  labSpeedMultiplier: number = 1.0,
  cellBoost: number = 1.0
): number {
  const safeLabSpeed = Math.max(0.1, labSpeedMultiplier);
  const safeCellBoost = Math.max(1.0, cellBoost);
  const totalSpeedup = safeLabSpeed * safeCellBoost;
  return Math.round(baseTimeSeconds / totalSpeedup);
}

/**
 * Comprehensive research calculation answering exact level questions:
 * E.g. Wall Thorns Lv 13 with Lab Speed 89, Relic 1.02, Cell Boost 2.0x, Lab Coin Discount Lv 50.
 */
export function calculateLabResearchSummary(
  params: LabResearchCalculationParams
): LabResearchSummary {
  const {
    labId,
    startLevel = 0,
    targetLevel = 1,
    labSpeedLevel = 0,
    labSpeedRelicMult = 1.0,
    cellBoost = 1.0,
    labCoinDiscountLevel = 0,
    relicDiscountMult = 1.0
  } = params;

  const labDef = MASTER_LAB_CATALOG.find((l) => l.id === labId);
  const labName = labDef ? labDef.name : labId;

  const labSpeedMultiplier = calculateLabSpeedMultiplier(labSpeedLevel, labSpeedRelicMult);
  const safeCellBoost = Math.max(1.0, cellBoost);
  const effectiveSpeedup = labSpeedMultiplier * safeCellBoost;
  const { discountPercent, costMultiplier } = calculateLabCoinDiscount(labCoinDiscountLevel, relicDiscountMult);

  const fromLvl = Math.max(1, startLevel + 1);
  const toLvl = Math.max(fromLvl, Math.min(labDef?.maxLevel || 99, targetLevel));

  const levels: SingleLevelBreakdown[] = [];
  let totalBaseTimeSeconds = 0;
  let totalEffectiveTimeSeconds = 0;
  let totalBaseCoinCost = 0;
  let totalEffectiveCoinCost = 0;

  for (let lvl = fromLvl; lvl <= toLvl; lvl++) {
    const baseTimeSeconds = getBaseLabTime(labId, lvl);
    const effectiveTimeSeconds = Math.round(baseTimeSeconds / effectiveSpeedup);
    const baseCoinCost = getLabCoinCost(labId, lvl);
    const effectiveCoinCost = Math.round(baseCoinCost * costMultiplier);

    totalBaseTimeSeconds += baseTimeSeconds;
    totalEffectiveTimeSeconds += effectiveTimeSeconds;
    totalBaseCoinCost += baseCoinCost;
    totalEffectiveCoinCost += effectiveCoinCost;

    levels.push({
      level: lvl,
      baseTimeSeconds,
      effectiveTimeSeconds,
      baseCoinCost,
      effectiveCoinCost
    });
  }

  return {
    labId,
    labName,
    startLevel,
    targetLevel: toLvl,
    totalBaseTimeSeconds,
    totalEffectiveTimeSeconds,
    totalBaseCoinCost,
    totalEffectiveCoinCost,
    labSpeedMultiplier,
    effectiveSpeedup,
    coinDiscountPercent: discountPercent,
    levels
  };
}

/**
 * Formats duration in seconds into human-readable compact string.
 */
export function formatLabDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const totalSec = Math.round(seconds);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days < 7) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Formats duration with explicit full breakdown (e.g. "2 days, 14 hours, 32 minutes").
 */
export function formatLabDurationDetailed(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 seconds';
  const totalSec = Math.round(seconds);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
  if (parts.length === 0) parts.push(`${secs} ${secs === 1 ? 'sec' : 'secs'}`);

  return parts.join(', ');
}

/**
 * Generates all level entries for a given lab definition up to its maxLevel.
 */
export function generateLabLevelsForLab(lab: LabDefinition): LabLevelInfo[] {
  const levels: LabLevelInfo[] = [];
  for (let lvl = 1; lvl <= lab.maxLevel; lvl++) {
    levels.push({
      labId: lab.id,
      level: lvl,
      baseTimeSeconds: getBaseLabTime(lab.id, lvl),
      coinCost: getLabCoinCost(lab.id, lvl)
    });
  }
  return levels;
}

/**
 * Generates full level progression for the entire Master Lab Catalog.
 */
export function generateAllMasterLabLevels(): LabLevelInfo[] {
  const allLevels: LabLevelInfo[] = [];
  for (const lab of MASTER_LAB_CATALOG) {
    allLevels.push(...generateLabLevelsForLab(lab));
  }
  return allLevels;
}
