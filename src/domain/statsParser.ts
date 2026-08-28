export interface ParsedLifetimeStats {
  totalCoins?: number;
  totalGems?: number;
  totalStones?: number;
  totalCells?: number;
  totalRounds?: number;
  totalWaves?: number;
  enemiesKilled?: number;
  elitesKilled?: number;
  bossesKilled?: number;
  tierMaxWaves: Record<number, number>; // Tier number -> highest wave
  rawText: string;
}

// Suffix multiplier parser (e.g. 1.25M, 45.2B, 3.8T, 250q)
export function parseSuffixedNumber(valStr: string): number {
  const clean = valStr.trim().replace(/,/g, '');
  const match = clean.match(/^([\d.]+)\s*([a-zA-Z]*)$/);
  if (!match) return parseFloat(clean) || 0;

  const num = parseFloat(match[1]);
  const suffix = match[2].toLowerCase();

  switch (suffix) {
    case 'k': return num * 1e3;
    case 'm': return num * 1e6;
    case 'b': return num * 1e9;
    case 't': return num * 1e12;
    case 'q': return num * 1e15;
    case 's': return num * 1e18;
    default: return num;
  }
}

export function parseAccountStatsText(rawText: string): ParsedLifetimeStats {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  const stats: ParsedLifetimeStats = {
    tierMaxWaves: {},
    rawText,
  };

  lines.forEach(line => {
    // Check Tier Highest Wave: "Tier 1 Highest Wave: 4,500" or "Tier 1: 4500"
    const tierMatch = line.match(/Tier\s*(\d+)[\s\w:]*?(\d[\d,]*)/i);
    if (tierMatch) {
      const tierNum = parseInt(tierMatch[1], 10);
      const wave = parseInt(tierMatch[2].replace(/,/g, ''), 10);
      if (!isNaN(tierNum) && !isNaN(wave)) {
        stats.tierMaxWaves[tierNum] = wave;
      }
      return;
    }

    // Coins Earned / Total Coins
    if (/total coins|coins earned/i.test(line)) {
      const parts = line.split(/[:\t-]/);
      if (parts.length >= 2) stats.totalCoins = parseSuffixedNumber(parts[parts.length - 1]);
    }

    // Power Stones / Stones Earned
    if (/total stones|power stones/i.test(line)) {
      const parts = line.split(/[:\t-]/);
      if (parts.length >= 2) stats.totalStones = parseSuffixedNumber(parts[parts.length - 1]);
    }

    // Gems / Diamonds
    if (/total gems|gems earned/i.test(line)) {
      const parts = line.split(/[:\t-]/);
      if (parts.length >= 2) stats.totalGems = parseSuffixedNumber(parts[parts.length - 1]);
    }

    // Elite Cells
    if (/total cells|elite cells/i.test(line)) {
      const parts = line.split(/[:\t-]/);
      if (parts.length >= 2) stats.totalCells = parseSuffixedNumber(parts[parts.length - 1]);
    }

    // Total Rounds Played
    if (/rounds played|total rounds/i.test(line)) {
      const parts = line.split(/[:\t-]/);
      if (parts.length >= 2) stats.totalRounds = parseInt(parts[parts.length - 1].replace(/,/g, ''), 10) || 0;
    }

    // Total Waves
    if (/waves completed|total waves/i.test(line)) {
      const parts = line.split(/[:\t-]/);
      if (parts.length >= 2) stats.totalWaves = parseInt(parts[parts.length - 1].replace(/,/g, ''), 10) || 0;
    }

    // Enemies Killed
    if (/enemies killed/i.test(line)) {
      const parts = line.split(/[:\t-]/);
      if (parts.length >= 2) stats.enemiesKilled = parseSuffixedNumber(parts[parts.length - 1]);
    }
  });

  return stats;
}
