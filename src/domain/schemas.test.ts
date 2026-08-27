import { describe, it, expect } from 'vitest';
import { RunSchema, BuildStateSchema, PlannerTaskSchema } from './schemas';

describe('Zod Boundary Validation Schemas', () => {
  it('validates a valid Run object', () => {
    const validRun = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      importedAt: new Date().toISOString(),
      battleDate: 'Oct 14, 2025 13:14',
      gameTimeSec: 86400,
      realTimeSec: 36000,
      tier: 10,
      tierSuffix: null,
      wave: 4500,
      killedBy: 'Ranged',
      fields: { 'Coins::coinsEarned': 1000000000 },
      raw: { 'Coins::Coins Earned': '1.00B' },
      rawText: 'Battle Report\nTier 10',
      parserVersion: 1,
      contentHash: 'abcdef123456',
      runType: 'farm' as const,
      tournament: null,
      dissonanceMultiplier: 1.0,
      excluded: false,
      notes: '',
      gameVersion: '0.24.4'
    };

    const parsed = RunSchema.safeParse(validRun);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid non-UUID run id', () => {
    const invalidRun = {
      id: 'not-a-uuid-1234',
      importedAt: new Date().toISOString(),
      battleDate: null,
      gameTimeSec: 100,
      realTimeSec: 100,
      tier: 1,
      tierSuffix: null,
      wave: 10,
      killedBy: '',
      fields: {},
      raw: {},
      rawText: '',
      parserVersion: 1,
      contentHash: 'hash',
      runType: 'farm' as const,
      tournament: null
    };

    const parsed = RunSchema.safeParse(invalidRun);
    expect(parsed.success).toBe(false);
  });

  it('validates a BuildState schema correctly', () => {
    const sampleBuild = {
      resources: { coins: 1000, cells: 50, gems: 10, stones: 5, shards: 20 },
      labs: [
        { researchId: 'lab_speed', level: 10, boost: 1.5, startedAt: new Date().toISOString() },
        { researchId: null, level: 0, boost: 1.0, startedAt: null },
        { researchId: null, level: 0, boost: 1.0, startedAt: null },
        { researchId: null, level: 0, boost: 1.0, startedAt: null },
        { researchId: null, level: 0, boost: 1.0, startedAt: null }
      ],
      labSpeedMultiplier: 1.5,
      researchCatalog: [],
      ultimateWeapons: [],
      modules: [],
      cards: { slots: 5, levels: {} },
      verificationFlags: []
    };

    const parsed = BuildStateSchema.safeParse(sampleBuild);
    expect(parsed.success).toBe(true);
  });

  it('validates a PlannerTask schema correctly', () => {
    const validTask = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'research' as const,
      name: 'Garlic Thorns',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      targetResearchId: 'garlic_thorns',
      targetLevel: 13
    };

    const parsed = PlannerTaskSchema.safeParse(validTask);
    expect(parsed.success).toBe(true);
  });
});
