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
  | 'utility.shards'    | 'utility.perks'   | 'utility.ranged';

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

export interface UW {
  id: string;
  name: string;
  unlocked: boolean;
  level: number;
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

interface StoreState {
  runs: Run[];
  build: BuildState;
  
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
  updateUW: (id: string, updates: Partial<UW>) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
  updateCards: (updates: Partial<CardState>) => void;
  
  // Verification actions
  addVerificationFlag: (flag: string) => void;
  removeVerificationFlag: (flag: string) => void;
  setVerificationFlags: (flags: string[]) => void;
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
  { id: 'gt', name: 'Golden Tower', unlocked: true, level: 15 },
  { id: 'bh', name: 'Black Hole', unlocked: true, level: 10 },
  { id: 'dw', name: 'Death Wave', unlocked: true, level: 10 },
  { id: 'sl', name: 'Spotlight', unlocked: true, level: 5 },
  { id: 'cf', name: 'Chrono Field', unlocked: false, level: 0 },
  { id: 'ps', name: 'Poison Swamp', unlocked: false, level: 0 },
  { id: 'sm', name: 'Smart Missiles', unlocked: false, level: 0 },
  { id: 'ilm', name: 'Inner Land Mines', unlocked: false, level: 0 },
  { id: 'cl', name: 'Chain Lightning', unlocked: false, level: 0 }
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

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      runs: [],
      build: INITIAL_BUILD,
      
      // Runs actions
      addRun: (run) => set((state) => ({ runs: [...state.runs, run] })),
      addRuns: (newRuns) => set((state) => ({ runs: [...state.runs, ...newRuns] })),
      deleteRun: (id) => set((state) => ({ runs: state.runs.filter((r) => r.id !== id) })),
      updateRun: (id, updates) => set((state) => ({
        runs: state.runs.map((r) => (r.id === id ? { ...r, ...updates } : r))
      })),
      clearRuns: () => set({ runs: [] }),
      importFullState: (runs, build) => set({ runs, build }),
      
      // Build state actions
      updateResources: (resources) => set((state) => ({
        build: {
          ...state.build,
          resources: { ...state.build.resources, ...resources }
        }
      })),
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
      updateResearchCatalog: (id, updates) => set((state) => ({
        build: {
          ...state.build,
          researchCatalog: state.build.researchCatalog.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          )
        }
      })),
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
      }))
    }),
    {
      name: 'tower-planner-store'
    }
  )
);
