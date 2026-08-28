import { describe, it, expect } from 'vitest';
import { parseAccountStatsText, parseSuffixedNumber } from './statsParser';

describe('statsParser', () => {
  it('parses suffixed numbers accurately', () => {
    expect(parseSuffixedNumber('1.25M')).toBe(1250000);
    expect(parseSuffixedNumber('45.2B')).toBe(45200000000);
    expect(parseSuffixedNumber('3.8T')).toBe(3800000000000);
    expect(parseSuffixedNumber('250K')).toBe(250000);
    expect(parseSuffixedNumber('100')).toBe(100);
  });

  it('parses multi-tier highest wave numbers and career totals', () => {
    const rawText = `
      Total Coins: 12.5T
      Power Stones: 4,500
      Gems Earned: 25,000
      Elite Cells: 120,400
      Total Rounds: 840
      Tier 1 Highest Wave: 6,500
      Tier 2 Highest Wave: 4,800
      Tier 10 Highest Wave: 4,520
      Tier 11 Highest Wave: 3,900
    `;

    const parsed = parseAccountStatsText(rawText);
    expect(parsed.totalCoins).toBe(12500000000000);
    expect(parsed.totalStones).toBe(4500);
    expect(parsed.totalGems).toBe(25000);
    expect(parsed.totalCells).toBe(120400);
    expect(parsed.totalRounds).toBe(840);
    expect(parsed.tierMaxWaves[1]).toBe(6500);
    expect(parsed.tierMaxWaves[2]).toBe(4800);
    expect(parsed.tierMaxWaves[10]).toBe(4520);
    expect(parsed.tierMaxWaves[11]).toBe(3900);
  });
});
