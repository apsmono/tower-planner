const CUM1_ANCHORS = [
  { w: 0, cells: 0 },
  { w: 500, cells: 5 },
  { w: 1000, cells: 25 },
  { w: 1500, cells: 70 },
  { w: 2000, cells: 150 },
  { w: 3000, cells: 400 },
  { w: 4000, cells: 760 },
  { w: 5000, cells: 1250 },
  { w: 6000, cells: 1890 },
  { w: 7000, cells: 2700 },
  { w: 8000, cells: 3710 },
  { w: 9000, cells: 4750 },
  { w: 10000, cells: 5840 },
  { w: 11000, cells: 7000 },
  { w: 12000, cells: 8250 },
  { w: 13000, cells: 9610 },
  { w: 14000, cells: 11100 },
  { w: 15000, cells: 12740 },
  { w: 16000, cells: 14550 },
  { w: 17000, cells: 16550 }
];

export function cum1(w: number): number {
  if (w <= 0) return 0;
  if (w >= 17000) {
    // Extrapolate beyond 17000 using the slope of the last segment (16000 to 17000):
    // (16550 - 14550) / (17000 - 16000) = 2.0
    return 16550 + (w - 17000) * 2.0;
  }
  
  // Find interpolation segment
  for (let i = 0; i < CUM1_ANCHORS.length - 1; i++) {
    const a1 = CUM1_ANCHORS[i];
    const a2 = CUM1_ANCHORS[i + 1];
    if (w >= a1.w && w <= a2.w) {
      const fraction = (w - a1.w) / (a2.w - a1.w);
      return a1.cells + fraction * (a2.cells - a1.cells);
    }
  }
  
  return 0;
}

// Wave axis compression multiplier
export const getWaveCompression = (T: number): number => Math.pow(0.9, T - 1);

// Average cells per drop
export const getAvgCellsPerDrop = (T: number): number => {
  return T <= 13 ? (1 + T) / 2 : (7 + T) / 2;
};

// Main cells formula: cells = cum1(w / s(T)) * a(T) * s(T)
export function getModelCells(T: number, w: number): number {
  const s = getWaveCompression(T);
  const a = getAvgCellsPerDrop(T);
  return cum1(w / s) * a * s;
}

// Helper: T9 ideal farming wave is 3444, T10 is 3099 etc.
export const IDEAL_FARMING_WAVES: Record<number, number> = {
  5: 5249,
  6: 4724,
  7: 4252,
  8: 3826,
  9: 3444,
  10: 3099,
  11: 2789,
  12: 2510,
  13: 2259
};

export const BOOST_COSTS: Record<number, number> = {
  1.0: 0,
  1.5: 360,
  2.0: 2400,
  3.0: 20160,
  4.0: 80640,
  5.0: 285600,
  6.0: 1440000,
  7.0: 6000000,
  8.0: 24000000
};

