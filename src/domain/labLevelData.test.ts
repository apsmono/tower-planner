import { describe, it, expect } from 'vitest';
import { 
  calculateLabSpeedMultiplier, 
  calculateLabCoinDiscount, 
  calculateWorkshopDiscount,
  calculateLabResearchSummary,
  getBaseLabTime,
  getLabCoinCost,
  formatLabDuration
} from '../data/labLevelData';

describe('Lab Level Data & Calculation Engine', () => {
  it('calculates lab speed multiplier correctly with relics/artifacts', () => {
    // Level 0 without relic
    expect(calculateLabSpeedMultiplier(0, 1.0)).toBe(1.0);

    // User scenario: Lab speed Lv 89 (1 + 89 * 0.02 = 2.78) with artifact/relic 1.02
    const speed = calculateLabSpeedMultiplier(89, 1.02);
    expect(speed).toBeCloseTo(2.78 * 1.02, 4); // 2.8356
  });

  it('calculates lab coin discount correctly', () => {
    // Level 0 gives 0% discount, 1.0x cost
    const d0 = calculateLabCoinDiscount(0);
    expect(d0.discountPercent).toBe(0);
    expect(d0.costMultiplier).toBe(1.0);

    // Level 30 gives 15% discount (cost multiplier = 0.85)
    const d30 = calculateLabCoinDiscount(30);
    expect(d30.discountPercent).toBe(15);
    expect(d30.costMultiplier).toBe(0.85);

    // Level 50 gives 25% discount (cost multiplier = 0.75)
    const d50 = calculateLabCoinDiscount(50);
    expect(d50.discountPercent).toBe(25);
    expect(d50.costMultiplier).toBe(0.75);
  });

  it('calculates workshop coin discount correctly', () => {
    const wd = calculateWorkshopDiscount(30);
    expect(wd.discountPercent).toBeCloseTo(9.0, 1);
    expect(wd.costMultiplier).toBeCloseTo(0.91, 2);
  });

  it('answers user inquiry: Wall Thorns Lv 13 with Lab Speed 89, Relic 1.02, Cell Boost 1.0x & 2.0x', () => {
    const baseTime = getBaseLabTime('wall_thorns', 13);
    const baseCost = getLabCoinCost('wall_thorns', 13);

    expect(baseTime).toBeGreaterThan(0);
    expect(baseCost).toBeGreaterThan(0);

    // Single step Lv 12 -> 13
    const summary1x = calculateLabResearchSummary({
      labId: 'wall_thorns',
      startLevel: 12,
      targetLevel: 13,
      labSpeedLevel: 89,
      labSpeedRelicMult: 1.02,
      cellBoost: 1.0,
      labCoinDiscountLevel: 30
    });

    expect(summary1x.levels.length).toBe(1);
    expect(summary1x.labSpeedMultiplier).toBeCloseTo(2.8356, 4);
    expect(summary1x.effectiveSpeedup).toBeCloseTo(2.8356, 4);
    expect(summary1x.totalBaseTimeSeconds).toBe(baseTime);
    expect(summary1x.totalEffectiveTimeSeconds).toBe(Math.round(baseTime / 2.8356));
    expect(summary1x.totalEffectiveCoinCost).toBe(Math.round(baseCost * 0.85));

    // With 2.0x cell speedup
    const summary2x = calculateLabResearchSummary({
      labId: 'wall_thorns',
      startLevel: 12,
      targetLevel: 13,
      labSpeedLevel: 89,
      labSpeedRelicMult: 1.02,
      cellBoost: 2.0,
      labCoinDiscountLevel: 30
    });

    expect(summary2x.effectiveSpeedup).toBeCloseTo(2.8356 * 2.0, 4);
    expect(summary2x.totalEffectiveTimeSeconds).toBe(Math.round(baseTime / (2.8356 * 2.0)));
  });

  it('calculates multi-level cumulative range progression (e.g. Wall Thorns Lv 0 -> Lv 13)', () => {
    const rangeSummary = calculateLabResearchSummary({
      labId: 'wall_thorns',
      startLevel: 0,
      targetLevel: 13,
      labSpeedLevel: 89,
      labSpeedRelicMult: 1.02,
      cellBoost: 2.0,
      labCoinDiscountLevel: 30
    });

    expect(rangeSummary.levels.length).toBe(13);
    expect(rangeSummary.totalBaseTimeSeconds).toBeGreaterThan(0);
    expect(rangeSummary.totalEffectiveTimeSeconds).toBeLessThan(rangeSummary.totalBaseTimeSeconds);
    expect(rangeSummary.totalEffectiveCoinCost).toBeLessThan(rangeSummary.totalBaseCoinCost);
  });

  it('formats durations correctly into human-readable strings', () => {
    expect(formatLabDuration(3600)).toBe('1h');
    expect(formatLabDuration(86400 * 2 + 3600 * 4)).toBe('2d 4h');
  });
});
