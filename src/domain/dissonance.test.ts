import { describe, it, expect } from 'vitest';
import { 
  calculateEffectiveDissonance, 
  computeDissonanceFromWave,
  createInitialDissonanceDatabank,
  type DissonanceDatabank 
} from './store';

describe('computeDissonanceFromWave and calculateEffectiveDissonance', () => {
  it('computes wave boost correctly matching in-game metrics', () => {
    // Wave 0 gives 1.0 (no run)
    expect(computeDissonanceFromWave(0, 0.5)).toBe(1.0);

    // Wave 1129 with 0.5% echo gives 1 + 1129/4000 + 0.005 = 1.287 -> 1.29 / 1.30
    expect(computeDissonanceFromWave(1129, 0.5)).toBe(1.29);

    // Wave 4000 with 0.5% echo gives 2.01
    expect(computeDissonanceFromWave(4000, 0.5)).toBe(2.01);
  });

  it('correctly calculates base dissonance with lab multiplier', () => {
    const databank: DissonanceDatabank = createInitialDissonanceDatabank();
    // T4 default max wave 1129 with lab level 0
    expect(calculateEffectiveDissonance(4, databank, 0)).toBe(1.29);

    // T4 with lab level 10 (+10% scaling on base 1.29 = 1.29 * 1.10 = 1.419 -> 1.42)
    expect(calculateEffectiveDissonance(4, databank, 10)).toBe(1.42);

    // T4 with lab level 50 (+50% scaling on base 1.29 = 1.29 * 1.50 = 1.935 -> 1.94)
    expect(calculateEffectiveDissonance(4, databank, 50)).toBe(1.94);
  });

  it('honors maxWave per tier and active toggle', () => {
    const databank: DissonanceDatabank = createInitialDissonanceDatabank();
    
    // Wave 2000 on T9 (1 + 2000/4000 + 0.005 = 1.51)
    databank.tiers[9].maxWave = 2000;
    expect(calculateEffectiveDissonance(9, databank, 0)).toBe(1.51);

    // When inactive, falls back to 1.0
    databank.tiers[9].active = false;
    expect(calculateEffectiveDissonance(9, databank, 0)).toBe(1.0);
  });
});
