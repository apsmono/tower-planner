import { describe, it, expect } from 'vitest';
import { parseBattleReport, parseBulkBattleReports, getField, computeContentHash } from './parser';
import { getModelCells } from './cellModel';

const farmingRunFixture = `
Game Time        1d 13h 24m 51s
Real Time        7h 46m 6s
Tier        10
Wave        5881
Killed By        Ranged
Coins Earned        1.13T
Cash Earned        $44.65B
Interest Earned        $11.76M
Gem Blocks Tapped        9
Cells Earned        47.89K
Reroll Shards Earned        6.36K
Damage Taken        468.82T
Damage Taken Wall        94.90q
Damage Taken While Berserked        1.59Q
Damage Gain From Berserk        x8.00
Death Defy        1
Damage Dealt        3.31O
Projectiles Damage        4.57s
Rend Armor Damage        3.46s
Projectiles Count        12.64M
Lifesteal        112.96B
Thorn Damage        502.83S
Orb Damage        2.63O
Orb Hits        522.99K
Land Mine Damage        460.43Q
Land Mines Spawned        239757
Death Ray Damage        0
Smart Missile Damage        7.13Q
Inner Land Mine Damage        0
Chain Lightning Damage        23.74s
Death Wave Damage        353.64q
`;

const regionalRunFixture = `
Battle Report
Battle Date	nov. 20, 2025 22:28
Game Time	2d 9h 35m 20s
Real Time	11h 35m 9s
Tier	12
Wave	9135
Killed By	Scatter
Coins earned	43,91T
Coins per hour	3,79T
Cash earned	$3,74B
Interest earned	$5,02M
Gem Blocks Tapped	10
Cells Earned	248,55K
Reroll Shards Earned	21,49K
Combat
Damage dealt	4,96aa
Damage Taken	35,38q
Damage Taken Wall	1,76Q
Damage Taken While Berserked	0
Damage Gain From Berserk	x0,00
Death Defy	0
Lifesteal	3,06T
Projectiles Damage	24,42D
Projectiles Count	48,84M
Thorn damage	81,15D
Orb Damage	4,24aa
Enemies Hit by Orbs	1,40M
Land Mine Damage	63,84s
Land Mines Spawned	549317
Rend Armor Damage	24,60s
Death Ray Damage	1,49O
Smart Missile Damage	0
Inner Land Mine Damage	43,49Q
Chain Lightning Damage	0
Death Wave Damage	33,35Q
HP From Death Wave	9,98T
`;

const tournamentRunFixture = `
Game Time        7h 21m 26s
Real Time        1h 50m 21s
Tier        8+
Wave        871
Killed By        Ranged
Coins Earned        6.09B
Cells Earned        573
`;

// Colliding fixture across multiple v2 sections
const collidingSectionsFixture = `
Battle Report
Tier	11
Wave	4500
Damage
Black Hole	3.36s
Orbs	128.45s
Death Wave	6.03q
Thorns	31.39s
Enemies Hit By
Black Hole	11.19K
Orbs	48.74K
Death Wave	10.30K
Thorns	6.61K
Coins
Black Hole	1.37B
Orbs	0
Death Wave	305.70M
Golden Tower	1.57B
Cash
Golden Tower	$254.55M
Enemies Destroyed By
Black Hole	135
Orbs	48706
Thorns	4139
`;

describe('Battle Report Parser', () => {
  it('should parse farming run values and durations correctly', () => {
    const run = parseBattleReport(farmingRunFixture);
    
    expect(run.gameTimeSec).toBe(1 * 86400 + 13 * 3600 + 24 * 60 + 51);
    expect(run.realTimeSec).toBe(7 * 3600 + 46 * 60 + 6);
    expect(run.tier).toBe(10);
    expect(run.tierSuffix).toBeNull();
    expect(run.wave).toBe(5881);
    expect(run.killedBy).toBe('Ranged');
    expect(run.rawText).toBe(farmingRunFixture);
    expect(run.parserVersion).toBeGreaterThanOrEqual(1);
    
    // Normalised fields via getField
    expect(getField(run.fields, 'coinsEarned')).toBe(1.13 * 1e12);
    expect(getField(run.fields, 'cellsEarned')).toBe(47.89 * 1000);
    expect(getField(run.fields, 'rerollShardsEarned')).toBe(6.36 * 1000);
    expect(getField(run.fields, 'damageGainFromBerserk')).toBe(8.0);
    expect(getField(run.fields, 'damageDealt')).toBe(3.31 * 1e27);
    expect(getField(run.fields, 'chainLightningDamage')).toBe(23.74 * 1e21);
    expect(getField(run.fields, 'deathWaveDamage')).toBe(353.64 * 1e15);
  });

  it('should handle regional localisations (EU comma separator)', () => {
    const run = parseBattleReport(regionalRunFixture);
    
    expect(run.battleDate).toBe('nov. 20, 2025 22:28');
    expect(run.tier).toBe(12);
    expect(run.wave).toBe(9135);
    
    // Check regional decimals parsed as standard numbers
    expect(getField(run.fields, 'coinsEarned')).toBe(43.91 * 1e12);
    expect(getField(run.fields, 'coinsPerHour')).toBe(3.79 * 1e12);
    expect(getField(run.fields, 'cellsEarned')).toBe(248.55 * 1000);
    expect(getField(run.fields, 'Combat', 'damageDealt')).toBe(4.96 * 1e36); // aa
    expect(getField(run.fields, 'Combat', 'damageGainFromBerserk')).toBe(0);
    expect(getField(run.fields, 'Combat', 'hpFromDeathWave')).toBe(9.98 * 1e12);
  });

  it('should parse tournament run suffix', () => {
    const run = parseBattleReport(tournamentRunFixture);
    
    expect(run.tier).toBe(8);
    expect(run.tierSuffix).toBe('+');
    expect(run.wave).toBe(871);
    expect(getField(run.fields, 'coinsEarned')).toBe(6.09 * 1e9);
    expect(getField(run.fields, 'cellsEarned')).toBe(573);
  });

  it('should distinguish section-scoped colliding labels without overwrite', () => {
    const run = parseBattleReport(collidingSectionsFixture);
    
    // Black Hole across Damage, Enemies Hit By, Coins, Enemies Destroyed By
    expect(getField(run.fields, 'Damage', 'blackHole')).toBe(3.36 * 1e21); // 3.36s
    expect(getField(run.fields, 'Enemies Hit By', 'blackHole')).toBe(11.19 * 1000); // 11.19K
    expect(getField(run.fields, 'Coins', 'blackHole')).toBe(1.37 * 1e9); // 1.37B
    expect(getField(run.fields, 'Enemies Destroyed By', 'blackHole')).toBe(135);

    // Golden Tower across Coins and Cash
    expect(getField(run.fields, 'Coins', 'goldenTower')).toBe(1.57 * 1e9);
    expect(getField(run.fields, 'Cash', 'goldenTower')).toBe(254.55 * 1e6);

    // Orbs across Damage and Enemies Destroyed By
    expect(getField(run.fields, 'Damage', 'orbs')).toBe(128.45 * 1e21);
    expect(getField(run.fields, 'Enemies Destroyed By', 'orbs')).toBe(48706);
  });

  it('should split and parse bulk reports retaining raw text', () => {
    const bulkInput = `
Battle Report
Tier	10
Wave	1000
Battle Report
Tier	11
Wave	2000
`;
    const runs = parseBulkBattleReports(bulkInput);
    expect(runs).toHaveLength(2);
    expect(runs[0].tier).toBe(10);
    expect(runs[0].wave).toBe(1000);
    expect(runs[0].rawText).toContain('Tier\t10');
    expect(runs[1].tier).toBe(11);
    expect(runs[1].wave).toBe(2000);
    expect(runs[1].rawText).toContain('Tier\t11');
  });

  it('should compute deterministic SHA-256 content hashes', async () => {
    const text1 = 'Battle Report\nTier 10\nWave 1000';
    const text2 = '  Battle Report\r\nTier  10\r\nWave 1000  ';
    const hash1 = await computeContentHash(text1);
    const hash2 = await computeContentHash(text2);
    expect(hash1).toBeTruthy();
    expect(hash1).toBe(hash2);
  });
});

describe('Cell Calculator Model', () => {
  it('should calculate cells correctly for T9 w3242 (validate +-1%)', () => {
    const calculated = getModelCells(9, 3242);
    // Target is 6966
    const errorPercent = Math.abs(calculated - 6966) / 6966;
    expect(errorPercent).toBeLessThan(0.01);
  });

  it('should resolve T9 w3046 to match T8 w3385 within 1% (documented break-even)', () => {
    const cellsT9 = getModelCells(9, 3046);
    const cellsT8 = getModelCells(8, 3385);
    const difference = Math.abs(cellsT9 - cellsT8) / cellsT8;
    expect(difference).toBeLessThan(0.01);
  });
});
