import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ParsedRun, parseDuration } from './parser';

export interface Run extends ParsedRun {
  id: string;
  importedAt: string; // ISO string
  runType: 'farm' | 'tournament' | 'milestone';
  tournament: {
    bracket: string;
    rank: number | null;
  } | null;
  dissonanceMultiplier: number; // default 1.0
  excluded: boolean;
  notes: string;
  gameVersion: string | null;
}

export type EffectChannel =
  | 'coins.goldenTower' | 'coins.blackHole' | 'coins.deathWave'
  | 'coins.spotlight'   | 'coins.orbs'      | 'coins.coinUpgrade'
  | 'coins.coinBonuses' | 'coins.global'
  | 'cells.deathWave'   | 'cells.global'
  | 'damage.projectiles' | 'damage.smartMissile' | 'damage.chainLightning' | 'damage.deathWave'
  | 'defense.wall'      | 'defense.health'  | 'utility.waveSkip'
  | 'utility.shards'    | 'utility.perks'   | 'utility.ranged' | 'utility.labSpeed';

export interface ResearchEffect {
  channel: EffectChannel;
  from: number;
  to: number;
  kind: 'multiplier' | 'percent' | 'flat' | 'unlock';
}

export interface ResearchEntry {
  id: string;
  name: string;
  level: number;
  change: string;
  coinCost: number;
  baseTimeSeconds: number; // pre-boost seconds
  effect?: ResearchEffect;
  targetLevel?: number;
  reason?: string;
  estimatedImpact?: number; // User-supplied estimate for flat/unlock effects
}

export interface LabSlot {
  researchId: string | null;
  level: number;
  boost: number; // e.g. 1.0, 1.5, 2.0, 3.0
  startedAt: string | null; // ISO string
}

export interface UWStatLevel {
  level: number;
  value: number;
  label?: string;
}

export interface UWUpgradeStatConfig {
  label: string;
  unit: string;
  defaultVal: number;
  step?: number;
  min?: number;
  max?: number;
  levels?: UWStatLevel[];
}

export function getStatLevels(statConfig: UWUpgradeStatConfig): UWStatLevel[] {
  if (statConfig.levels && statConfig.levels.length > 0) {
    return statConfig.levels;
  }
  const min = statConfig.min ?? 0;
  const max = statConfig.max ?? statConfig.defaultVal * 2;
  const step = statConfig.step ?? 1;
  const levels: UWStatLevel[] = [];
  
  if (step > 0 && max >= min) {
    let lvl = 1;
    for (let v = min; v <= max + 0.0001; v += step) {
      const rounded = Math.round(v * 100) / 100;
      levels.push({ level: lvl++, value: rounded });
    }
  } else if (step < 0 && min <= max) {
    // decreasing stat like cooldown (e.g. 300 down to 100)
    let lvl = 1;
    for (let v = max; v >= min - 0.0001; v += step) {
      const rounded = Math.round(v * 100) / 100;
      levels.push({ level: lvl++, value: rounded });
    }
  } else {
    levels.push({ level: 1, value: statConfig.defaultVal });
  }
  return levels;
}

export interface UWConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  wikiUrl: string;
  themeColor: string;
  stat1: UWUpgradeStatConfig;
  stat2: UWUpgradeStatConfig;
  stat3: UWUpgradeStatConfig;
}

export const UW_CONFIGS: Record<string, UWConfig> = {
  gt: {
    id: 'gt',
    name: 'Golden Tower',
    shortName: 'GT',
    description: 'Multiplies Cash and Coins earned while active. Top priority economic engine.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Golden_Tower',
    themeColor: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-400',
    stat1: { label: 'Bonus Multiplier', unit: 'x', defaultVal: 15.4, step: 0.8, min: 5.0, max: 20.2 },
    stat2: { label: 'Duration', unit: 's', defaultVal: 38, step: 1, min: 15, max: 53 },
    stat3: { label: 'Cooldown', unit: 's', defaultVal: 200, step: -10, min: 110, max: 300 },
  },
  bh: {
    id: 'bh',
    name: 'Black Hole',
    shortName: 'BH',
    description: 'Pulls enemies into a vortex and multiplies coin value of trapped enemies killed.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Black_Hole',
    themeColor: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400',
    stat1: { label: 'Hole Size', unit: 'm', defaultVal: 44, step: 2, min: 30, max: 70 },
    stat2: { label: 'Duration', unit: 's', defaultVal: 25, step: 1, min: 15, max: 38 },
    stat3: { label: 'Cooldown', unit: 's', defaultVal: 200, step: -10, min: 50, max: 200 },
  },
  dw: {
    id: 'dw',
    name: 'Death Wave',
    shortName: 'DW',
    description: 'Emits expanding damage rings that grant Max HP multiplier and coin bonuses.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Death_Wave',
    themeColor: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400',
    stat1: { label: 'Wave Damage', unit: '%', defaultVal: 350, step: 25, min: 100, max: 500 },
    stat2: { label: 'Wave Quantity', unit: 'waves', defaultVal: 2, step: 1, min: 1, max: 5 },
    stat3: { label: 'Cooldown', unit: 's', defaultVal: 200, step: -10, min: 100, max: 300 },
  },
  sl: {
    id: 'sl',
    name: 'Spotlight',
    shortName: 'SL',
    description: 'Casts permanent rotating spotlights amplifying damage and coin rewards.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Spotlight',
    themeColor: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40 text-yellow-300',
    stat1: { label: 'Bonus Damage', unit: 'x', defaultVal: 15.0, step: 1.0, min: 1.0, max: 25.0 },
    stat2: { label: 'Beam Angle', unit: '°', defaultVal: 40, step: 2, min: 10, max: 60 },
    stat3: { label: 'Beam Quantity', unit: 'beams', defaultVal: 3, step: 1, min: 1, max: 3 },
  },
  cf: {
    id: 'cf',
    name: 'Chrono Field',
    shortName: 'CF',
    description: 'Creates a temporal field dramatically reducing enemy movement speed.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Chrono_Field',
    themeColor: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/40 text-cyan-400',
    stat1: { label: 'Duration', unit: 's', defaultVal: 30, step: 1, min: 5, max: 30 },
    stat2: { label: 'Speed Reduction', unit: '%', defaultVal: 60, step: 5, min: 10, max: 60 },
    stat3: { label: 'Cooldown', unit: 's', defaultVal: 60, step: -10, min: 60, max: 120 },
  },
  cl: {
    id: 'cl',
    name: 'Chain Lightning',
    shortName: 'CL',
    description: 'Shocks attacking enemies and arcs bolts between multiple adjacent targets.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Chain_Lightning',
    themeColor: 'from-blue-500/20 to-sky-500/10 border-blue-500/40 text-blue-400',
    stat1: { label: 'Shock Damage', unit: '%', defaultVal: 150, step: 10, min: 50, max: 500 },
    stat2: { label: 'Bolt Quantity', unit: 'bolts', defaultVal: 3, step: 1, min: 1, max: 5 },
    stat3: { label: 'Proc Chance', unit: '%', defaultVal: 15, step: 1, min: 5, max: 30 },
  },
  ps: {
    id: 'ps',
    name: 'Poison Swamp',
    shortName: 'PS',
    description: 'Spawns toxic swamps on enemy death that damage and crowd-control invaders.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Poison_Swamp',
    themeColor: 'from-emerald-500/20 to-green-500/10 border-emerald-500/40 text-emerald-400',
    stat1: { label: 'Swamp Damage', unit: '%', defaultVal: 250, step: 20, min: 50, max: 510 },
    stat2: { label: 'Swamp Duration', unit: 's', defaultVal: 5.0, step: 0.5, min: 2.0, max: 10.0 },
    stat3: { label: 'Spawn Chance', unit: '%', defaultVal: 25, step: 2, min: 5, max: 51 },
  },
  sm: {
    id: 'sm',
    name: 'Smart Missiles',
    shortName: 'SM',
    description: 'Fires high-impact homing missiles at high-threat and boss enemies.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Smart_Missiles',
    themeColor: 'from-orange-500/20 to-amber-500/10 border-orange-500/40 text-orange-400',
    stat1: { label: 'Missile Damage', unit: 'x', defaultVal: 45, step: 2, min: 1, max: 99 },
    stat2: { label: 'Missile Quantity', unit: 'missiles', defaultVal: 4, step: 1, min: 4, max: 17 },
    stat3: { label: 'Cooldown', unit: 's', defaultVal: 150, step: -10, min: 30, max: 150 },
  },
  ilm: {
    id: 'ilm',
    name: 'Inner Land Mines',
    shortName: 'ILM',
    description: 'Deploys explosive contact mines inside the tower defense perimeter.',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Inner_Land_Mines',
    themeColor: 'from-amber-600/20 to-rose-600/10 border-amber-600/40 text-amber-500',
    stat1: { label: 'Mine Damage', unit: '%', defaultVal: 350, step: 25, min: 100, max: 1000 },
    stat2: { label: 'Mine Quantity', unit: 'mines', defaultVal: 5, step: 1, min: 3, max: 8 },
    stat3: { label: 'Cooldown', unit: 's', defaultVal: 120, step: -10, min: 30, max: 180 },
  },
};

export interface UW {
  id: string;
  name: string;
  unlocked: boolean; // Acquired
  active: boolean;   // Active in run
  level: number;
  upgrades: {
    stat1: number;
    stat2: number;
    stat3: number;
  };
}

export interface SubEffect {
  id: string;
  name: string;
  tier: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Ancestral';
  locked: boolean;
}

export interface Module {
  id: string;
  name: string; // e.g. "Core", "Cannon", "Armor", "Generator"
  tier: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Ancestral';
  subEffects: SubEffect[];
}

export interface CardState {
  slots: number;
  levels: Record<string, number>;
}

export interface BuildState {
  resources: {
    coins: number;
    cells: number;
    gems: number;
    stones: number;
    shards: number;
  };
  labs: LabSlot[]; // length 5
  labSpeedMultiplier: number;
  researchCatalog: ResearchEntry[];
  ultimateWeapons: UW[];
  modules: Module[];
  cards: CardState;
  verificationFlags: string[];
}

export type TaskType = 'research' | 'resource' | 'experiment';
export type TaskStatus = 'active' | 'completed';

export interface PlannerTask {
  id: string;
  type: TaskType;
  name: string;
  status: TaskStatus;
  createdAt: string; // ISO string
  targetResearchId?: string;
  targetLevel?: number;
  targetResource?: 'coins' | 'cells' | 'gems' | 'stones' | 'shards';
  targetAmount?: number;
  experimentTier?: number;
  experimentRequiredRuns?: number;
  experimentCompletedRunIds?: string[];
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
  lastSyncedAt: string | null;
}

interface StoreState {
  runs: Run[];
  build: BuildState;
  tasks: PlannerTask[];
  user: UserProfile | null;
  isBannerDismissed: boolean;

  // Auth & Cloud Sync actions
  setUser: (user: UserProfile | null) => void;
  setBannerDismissed: (dismissed: boolean) => void;
  syncCloudData: () => void;
  
  // Runs actions
  addRun: (run: Run) => void;
  addRuns: (runs: Run[]) => void;
  deleteRun: (id: string) => void;
  updateRun: (id: string, updates: Partial<Run>) => void;
  clearRuns: () => void;
  importFullState: (runs: Run[], build: BuildState) => void;
  
  // Build state actions
  updateResources: (resources: Partial<BuildState['resources']>) => void;
  updateLabSlot: (index: number, updates: Partial<LabSlot>) => void;
  updateLabSpeedMultiplier: (val: number) => void;
  updateResearchCatalog: (id: string, updates: Partial<ResearchEntry>) => void;
  addResearchCatalogItem: (item: ResearchEntry) => void;
  removeResearchCatalogItem: (id: string) => void;
  updateUW: (id: string, updates: Partial<UW>) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
  updateCards: (updates: Partial<CardState>) => void;
  
  // Verification actions
  addVerificationFlag: (flag: string) => void;
  removeVerificationFlag: (flag: string) => void;
  setVerificationFlags: (flags: string[]) => void;

  // Tasks actions
  addTask: (task: Omit<PlannerTask, 'id' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<PlannerTask>) => void;
  deleteTask: (id: string) => void;
  checkTaskCompletions: () => void;
}

// Initial catalog seeded from DOMAIN.md §5
const INITIAL_RESEARCH_CATALOG: ResearchEntry[] = [
  { id: 'garlic_thorns', name: 'Garlic Thorns', level: 9, change: '4.00% → 4.50%', coinCost: 302140, baseTimeSeconds: parseDuration('1d 8h'), effect: { channel: 'defense.wall', from: 4.00, to: 4.50, kind: 'percent' }, targetLevel: 13, reason: 'heat-up footgun is live below baseline' },
  { id: 'reroll_shards', name: 'Reroll Shards', level: 3, change: '+2 → +3', coinCost: 12850000, baseTimeSeconds: parseDuration('11h 19m'), effect: { channel: 'utility.shards', from: 2, to: 3, kind: 'flat' } },
  { id: 'spotlight_coin', name: 'Spotlight Coin Bonus', level: 2, change: '×1.10 → ×1.20', coinCost: 19740000, baseTimeSeconds: parseDuration('12h 56m'), effect: { channel: 'coins.spotlight', from: 1.10, to: 1.20, kind: 'multiplier' } },
  { id: 'dw_health', name: 'Death Wave Health', level: 12, change: '775% → 800%', coinCost: 320340000, baseTimeSeconds: parseDuration('2d 11h'), effect: { channel: 'defense.health', from: 775, to: 800, kind: 'percent' } },
  { id: 'tradeoff_perks', name: 'Improve Trade-off Perks', level: 6, change: '5% → 6%', coinCost: 1150000000, baseTimeSeconds: parseDuration('1d 8h'), effect: { channel: 'coins.global', from: 1.05, to: 1.06, kind: 'multiplier' } },
  { id: 'dw_coin', name: 'Death Wave Coin Bonus', level: 14, change: '×2.15 → ×2.20', coinCost: 1400000000, baseTimeSeconds: parseDuration('1d 4h'), effect: { channel: 'coins.deathWave', from: 2.15, to: 2.20, kind: 'multiplier' } },
  { id: 'gt_duration', name: 'Golden Tower Duration', level: 16, change: '+15.0s → +16.0s', coinCost: 2720000000, baseTimeSeconds: parseDuration('5d 15h'), effect: { channel: 'coins.goldenTower', from: 15, to: 16, kind: 'flat' } },
  { id: 'waves_required', name: 'Waves Required', level: 12, change: '−11 → −12', coinCost: 2970000000, baseTimeSeconds: parseDuration('1d 16h'), effect: { channel: 'utility.waveSkip', from: 11, to: 12, kind: 'flat' } },
  { id: 'gt_bonus', name: 'Golden Tower Bonus', level: 18, change: '+2.55 → +2.70', coinCost: 4860000000, baseTimeSeconds: parseDuration('7d 17h'), effect: { channel: 'coins.goldenTower', from: 2.55, to: 2.70, kind: 'flat' } },
  { id: 'standard_perks', name: 'Standard Perks Bonus', level: 14, change: '13% → 14%', coinCost: 10270000000, baseTimeSeconds: parseDuration('2d 18h'), effect: { channel: 'coins.global', from: 1.13, to: 1.14, kind: 'multiplier' } },
  { id: 'bh_coin', name: 'Black Hole Coin Bonus', level: 18, change: '×9.50 → ×10.00 (cap)', coinCost: 13130000000, baseTimeSeconds: parseDuration('4d 20h'), effect: { channel: 'coins.blackHole', from: 9.50, to: 10.00, kind: 'multiplier' } },
  { id: 'ban_perks', name: 'Ban Perks', level: 4, change: '3 → 4', coinCost: 13830000000, baseTimeSeconds: parseDuration('5d 16h'), effect: { channel: 'utility.perks', from: 3, to: 4, kind: 'flat' } },
  { id: 'rare_drop', name: 'Rare Drop Chance', level: 2, change: '+0.10% → +0.20%', coinCost: 70070000000, baseTimeSeconds: parseDuration('2d 22h'), effect: { channel: 'utility.shards', from: 0.10, to: 0.20, kind: 'flat' } },
  { id: 'bh_disable_ranged', name: 'BH disable Ranged Enemies', level: 1, change: 'unlock', coinCost: 507100000000, baseTimeSeconds: parseDuration('9d 8h'), effect: { channel: 'utility.ranged', from: 0, to: 1, kind: 'unlock' } }
];

const INITIAL_UWS: UW[] = [
  { 
    id: 'gt', 
    name: 'Golden Tower', 
    unlocked: true, 
    active: true, 
    level: 15, 
    upgrades: { stat1: 15.4, stat2: 38, stat3: 200 } 
  },
  { 
    id: 'bh', 
    name: 'Black Hole', 
    unlocked: true, 
    active: true, 
    level: 10, 
    upgrades: { stat1: 44, stat2: 25, stat3: 200 } 
  },
  { 
    id: 'dw', 
    name: 'Death Wave', 
    unlocked: true, 
    active: true, 
    level: 10, 
    upgrades: { stat1: 350, stat2: 2, stat3: 200 } 
  },
  { 
    id: 'sl', 
    name: 'Spotlight', 
    unlocked: true, 
    active: true, 
    level: 5, 
    upgrades: { stat1: 15.0, stat2: 40, stat3: 3 } 
  },
  { 
    id: 'cf', 
    name: 'Chrono Field', 
    unlocked: false, 
    active: false, 
    level: 0, 
    upgrades: { stat1: 30, stat2: 60, stat3: 60 } 
  },
  { 
    id: 'ps', 
    name: 'Poison Swamp', 
    unlocked: false, 
    active: false, 
    level: 0, 
    upgrades: { stat1: 250, stat2: 5.0, stat3: 25 } 
  },
  { 
    id: 'sm', 
    name: 'Smart Missiles', 
    unlocked: false, 
    active: false, 
    level: 0, 
    upgrades: { stat1: 45, stat2: 4, stat3: 150 } 
  },
  { 
    id: 'ilm', 
    name: 'Inner Land Mines', 
    unlocked: false, 
    active: false, 
    level: 0, 
    upgrades: { stat1: 350, stat2: 5, stat3: 120 } 
  },
  { 
    id: 'cl', 
    name: 'Chain Lightning', 
    unlocked: false, 
    active: false, 
    level: 0, 
    upgrades: { stat1: 150, stat2: 3, stat3: 15 } 
  }
];

const INITIAL_MODULES: Module[] = [
  { id: 'core', name: 'Core', tier: 'Epic', subEffects: [] },
  { id: 'cannon', name: 'Cannon', tier: 'Epic', subEffects: [] },
  { id: 'armor', name: 'Armor', tier: 'Epic', subEffects: [] },
  { id: 'generator', name: 'Generator', tier: 'Epic', subEffects: [] }
];

const INITIAL_BUILD: BuildState = {
  resources: {
    coins: 284000000000, // 284B starting coins from spec
    cells: 5000,
    gems: 120,
    stones: 606, // from spec: 606 stones toward 6th UW
    shards: 1500
  },
  labs: [
    { researchId: 'labs_speed', level: 88, boost: 2.0, startedAt: new Date().toISOString() },
    { researchId: 'auto_pick', level: 9, boost: 1.5, startedAt: new Date().toISOString() },
    { researchId: 'wall_regen', level: 7, boost: 2.0, startedAt: new Date().toISOString() },
    { researchId: 'dw_cells', level: 9, boost: 2.0, startedAt: new Date().toISOString() },
    { researchId: 'wall_thorns', level: 7, boost: 2.0, startedAt: new Date().toISOString() }
  ],
  labSpeedMultiplier: 3.12, // example default
  researchCatalog: INITIAL_RESEARCH_CATALOG,
  ultimateWeapons: INITIAL_UWS,
  modules: INITIAL_MODULES,
  cards: {
    slots: 15,
    levels: {}
  },
  verificationFlags: ['golden_tower_bonus', 'wall_health_level', 'wall_unlock_cost'] // from DOMAIN.md §7
};

export const INITIAL_TASKS: PlannerTask[] = [
  {
    id: 'task-garlic-thorns-13',
    type: 'research',
    name: 'Garlic Thorns to Lv.13',
    status: 'active',
    createdAt: new Date('2026-08-27T12:00:00.000Z').toISOString(),
    targetResearchId: 'garlic_thorns',
    targetLevel: 13,
    notes: 'Required baseline to disable heat-up footgun.'
  },
  {
    id: 'task-stones-1250',
    type: 'resource',
    name: 'Save 1,250 Stones for 6th UW',
    status: 'active',
    createdAt: new Date('2026-08-27T12:00:00.000Z').toISOString(),
    targetResource: 'stones',
    targetAmount: 1250,
    notes: 'Estimated 75% Spotlight contribution.'
  },
  {
    id: 'task-wall-regen-10',
    type: 'research',
    name: 'Wall Regen to Lv.10',
    status: 'active',
    createdAt: new Date('2026-08-27T12:00:00.000Z').toISOString(),
    targetResearchId: 'wall_regen',
    targetLevel: 10,
    notes: 'Recommended level to survive high tier runs.'
  }
];

const checkTaskCompletionsHelper = (tasks: PlannerTask[], build: BuildState): PlannerTask[] => {
  return tasks.map((task) => {
    if (task.status === 'completed') return task;

    if (task.type === 'resource' && task.targetResource) {
      const currentAmount = build.resources[task.targetResource];
      if (task.targetAmount && currentAmount >= task.targetAmount) {
        return { ...task, status: 'completed' as const };
      }
    }

    if (task.type === 'research' && task.targetResearchId) {
      const research = build.researchCatalog.find((r) => r.id === task.targetResearchId);
      if (research && task.targetLevel && research.level >= task.targetLevel) {
        return { ...task, status: 'completed' as const };
      }
    }

    return task;
  });
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      runs: [],
      build: INITIAL_BUILD,
      tasks: INITIAL_TASKS,
      user: null,
      isBannerDismissed: false,

      // Auth & Cloud Sync actions
      setUser: (user) => set({ user }),
      setBannerDismissed: (isBannerDismissed) => set({ isBannerDismissed }),
      syncCloudData: () => set((state) => ({
        user: state.user ? { ...state.user, lastSyncedAt: new Date().toISOString() } : null
      })),
      
      // Runs actions
      addRun: (run) => set((state) => ({ runs: [...state.runs, run] })),
      addRuns: (newRuns) => set((state) => ({ runs: [...state.runs, ...newRuns] })),
      deleteRun: (id) => set((state) => ({ runs: state.runs.filter((r) => r.id !== id) })),
      updateRun: (id, updates) => set((state) => ({
        runs: state.runs.map((r) => (r.id === id ? { ...r, ...updates } : r))
      })),
      clearRuns: () => set({ runs: [] }),
      importFullState: (runs, build) => set((state) => {
        const nextTasks = checkTaskCompletionsHelper(state.tasks, build);
        return { runs, build, tasks: nextTasks };
      }),
      
      // Build state actions
      updateResources: (resources) => set((state) => {
        const nextBuild = {
          ...state.build,
          resources: { ...state.build.resources, ...resources }
        };
        return {
          build: nextBuild,
          tasks: checkTaskCompletionsHelper(state.tasks, nextBuild)
        };
      }),
      updateLabSlot: (index, updates) => set((state) => {
        const newLabs = [...state.build.labs];
        newLabs[index] = { ...newLabs[index], ...updates };
        return {
          build: {
            ...state.build,
            labs: newLabs
          }
        };
      }),
      updateLabSpeedMultiplier: (val) => set((state) => ({
        build: { ...state.build, labSpeedMultiplier: val }
      })),
      updateResearchCatalog: (id, updates) => set((state) => {
        const exists = state.build.researchCatalog.some((r) => r.id === id);
        let nextCatalog: ResearchEntry[];
        if (exists) {
          nextCatalog = state.build.researchCatalog.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          );
        } else {
          const newEntry: ResearchEntry = {
            id,
            name: updates.name || id,
            level: updates.level ?? 1,
            change: updates.change || 'Lv.1 → Lv.2',
            coinCost: updates.coinCost ?? 1000000,
            baseTimeSeconds: updates.baseTimeSeconds ?? 86400,
            ...updates
          };
          nextCatalog = [...state.build.researchCatalog, newEntry];
        }
        const nextBuild = {
          ...state.build,
          researchCatalog: nextCatalog
        };
        return {
          build: nextBuild,
          tasks: checkTaskCompletionsHelper(state.tasks, nextBuild)
        };
      }),
      addResearchCatalogItem: (item) => set((state) => {
        if (state.build.researchCatalog.some((r) => r.id === item.id)) {
          return state;
        }
        const nextCatalog = [...state.build.researchCatalog, item];
        const nextBuild = {
          ...state.build,
          researchCatalog: nextCatalog
        };
        return {
          build: nextBuild,
          tasks: checkTaskCompletionsHelper(state.tasks, nextBuild)
        };
      }),
      removeResearchCatalogItem: (id) => set((state) => {
        const nextCatalog = state.build.researchCatalog.filter((r) => r.id !== id);
        const nextBuild = {
          ...state.build,
          researchCatalog: nextCatalog
        };
        return {
          build: nextBuild,
          tasks: checkTaskCompletionsHelper(state.tasks, nextBuild)
        };
      }),
      updateUW: (id, updates) => set((state) => ({
        build: {
          ...state.build,
          ultimateWeapons: state.build.ultimateWeapons.map((u) =>
            u.id === id ? { ...u, ...updates } : u
          )
        }
      })),
      updateModule: (id, updates) => set((state) => ({
        build: {
          ...state.build,
          modules: state.build.modules.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          )
        }
      })),
      updateCards: (updates) => set((state) => ({
        build: {
          ...state.build,
          cards: { ...state.build.cards, ...updates }
        }
      })),
      
      // Verification flags
      addVerificationFlag: (flag) => set((state) => ({
        build: {
          ...state.build,
          verificationFlags: state.build.verificationFlags.includes(flag)
            ? state.build.verificationFlags
            : [...state.build.verificationFlags, flag]
        }
      })),
      removeVerificationFlag: (flag) => set((state) => ({
        build: {
          ...state.build,
          verificationFlags: state.build.verificationFlags.filter((f) => f !== flag)
        }
      })),
      setVerificationFlags: (flags) => set((state) => ({
        build: {
          ...state.build,
          verificationFlags: flags
        }
      })),

      // Tasks actions
      addTask: (task) => set((state) => {
        const newTask: PlannerTask = {
          ...task,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        const nextTasks = [...state.tasks, newTask];
        return {
          tasks: checkTaskCompletionsHelper(nextTasks, state.build)
        };
      }),
      updateTask: (id, updates) => set((state) => {
        const nextTasks = state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
        return {
          tasks: checkTaskCompletionsHelper(nextTasks, state.build)
        };
      }),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      checkTaskCompletions: () => set((state) => ({
        tasks: checkTaskCompletionsHelper(state.tasks, state.build)
      }))
    }),
    {
      name: 'tower-planner-store',
      version: 2,
      // When migrating from an older version, reset UI state that shouldn't persist
      migrate: (persisted: unknown, fromVersion: number) => {
        if (fromVersion < 2) {
          const state = persisted as Partial<StoreState>;
          return {
            ...state,
            isBannerDismissed: false,
          };
        }
        return persisted as StoreState;
      },
    }
  )
);
