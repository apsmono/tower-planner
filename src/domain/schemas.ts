import { z } from 'zod';

export const EffectChannelEnum = z.enum([
  'coins.goldenTower', 'coins.blackHole', 'coins.deathWave',
  'coins.spotlight',   'coins.orbs',      'coins.coinUpgrade',
  'coins.coinBonuses', 'coins.global',
  'cells.deathWave',   'cells.global',
  'damage.projectiles', 'damage.smartMissile', 'damage.chainLightning', 'damage.deathWave',
  'defense.wall',      'defense.health',  'utility.waveSkip',
  'utility.shards',    'utility.perks',   'utility.ranged', 'utility.labSpeed'
]);

export const ResearchEffectKindEnum = z.enum(['multiplier', 'percent', 'flat', 'unlock']);

export const ResearchEffectSchema = z.object({
  channel: EffectChannelEnum,
  from: z.number(),
  to: z.number(),
  kind: ResearchEffectKindEnum
});

export const ResearchEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().int().nonnegative(),
  change: z.string(),
  coinCost: z.number().nonnegative(),
  baseTimeSeconds: z.number().int().nonnegative(),
  effect: ResearchEffectSchema.optional(),
  targetLevel: z.number().int().nonnegative().optional(),
  reason: z.string().optional(),
  estimatedImpact: z.number().optional()
}).refine(
  (entry) => entry.targetLevel === undefined || entry.targetLevel >= entry.level,
  { message: 'Target level must be greater than or equal to current level' }
);

export const LabSlotSchema = z.object({
  researchId: z.string().nullable(),
  level: z.number().int().nonnegative(),
  boost: z.number().positive(),
  startedAt: z.string().nullable()
}).refine(
  (slot) => slot.startedAt === null || slot.researchId !== null,
  { message: 'An empty slot cannot be running' }
);

export const UWSchema = z.object({
  id: z.string(),
  name: z.string(),
  unlocked: z.boolean(),
  active: z.boolean(),
  level: z.number().int().nonnegative(),
  upgrades: z.object({
    stat1: z.number(),
    stat2: z.number(),
    stat3: z.number()
  })
}).refine(
  (uw) => !uw.active || uw.unlocked,
  { message: 'Ultimate weapon must be unlocked to be active' }
);

export const ModuleTierEnum = z.enum(['Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Ancestral']);

export const SubEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: ModuleTierEnum,
  locked: z.boolean()
});

export const ModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: ModuleTierEnum,
  subEffects: z.array(SubEffectSchema)
});

export const CardStateSchema = z.object({
  slots: z.number().int().nonnegative(),
  levels: z.record(z.string(), z.number())
});

export const BuildStateSchema = z.object({
  resources: z.object({
    coins: z.number().nonnegative(),
    cells: z.number().nonnegative(),
    gems: z.number().nonnegative(),
    stones: z.number().nonnegative(),
    shards: z.number().nonnegative()
  }),
  labs: z.array(LabSlotSchema).length(5, 'Build must contain exactly 5 lab slots'),
  labSpeedMultiplier: z.number().positive(),
  researchCatalog: z.array(ResearchEntrySchema),
  ultimateWeapons: z.array(UWSchema),
  modules: z.array(ModuleSchema),
  cards: CardStateSchema,
  verificationFlags: z.array(z.string())
});

export const ParsedRunSchema = z.object({
  battleDate: z.string().nullable(),
  gameTimeSec: z.number().int().nonnegative(),
  realTimeSec: z.number().int().nonnegative(),
  tier: z.number().int().positive(),
  tierSuffix: z.enum(['+']).nullable(),
  wave: z.number().int().nonnegative(),
  killedBy: z.string(),
  fields: z.record(z.string(), z.number()),
  raw: z.record(z.string(), z.string()),
  rawText: z.string(),
  parserVersion: z.number().int().nonnegative()
});

export const TournamentResultSchema = z.object({
  bracket: z.string().nullable(),
  rank: z.number().int().min(1).max(30).nullable()
});

export const RunSchema = ParsedRunSchema.extend({
  id: z.string().uuid({ message: 'Run ID must be a valid UUID' }),
  importedAt: z.string(),
  runType: z.enum(['farm', 'tournament', 'milestone', 'event']),
  tournament: TournamentResultSchema.nullable(),
  dissonanceMultiplier: z.number().positive().default(1.0),
  excluded: z.boolean().default(false),
  notes: z.string().default(''),
  gameVersion: z.string().nullable().default(null),
  contentHash: z.string()
}).refine(
  (run) => run.tournament === null || run.runType === 'tournament',
  { message: 'Only tournament runs can have a tournament result attached' }
);

export const PlannerTaskSchema = z.object({
  id: z.string(),
  type: z.enum(['research', 'resource', 'experiment']),
  name: z.string().min(1),
  status: z.enum(['active', 'completed']),
  createdAt: z.string(),
  targetResearchId: z.string().optional(),
  targetLevel: z.number().int().nonnegative().optional(),
  targetResource: z.enum(['coins', 'cells', 'gems', 'stones', 'shards']).optional(),
  targetAmount: z.number().nonnegative().optional(),
  experimentTier: z.number().int().positive().optional(),
  experimentRequiredRuns: z.number().int().positive().optional(),
  experimentCompletedRunIds: z.array(z.string().uuid()).optional(),
  notes: z.string().optional()
}).refine(
  (task) => {
    if (task.type === 'research') return Boolean(task.targetResearchId);
    if (task.type === 'resource') return Boolean(task.targetResource && task.targetAmount !== undefined);
    if (task.type === 'experiment') return Boolean(task.experimentTier && task.experimentRequiredRuns);
    return true;
  },
  { message: 'Task is missing required parameters for its type' }
);

export const ExportedStateSchema = z.object({
  runs: z.array(RunSchema),
  build: BuildStateSchema,
  tasks: z.array(PlannerTaskSchema).optional()
});

export type ValidatedExportedState = z.infer<typeof ExportedStateSchema>;
