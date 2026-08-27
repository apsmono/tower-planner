// Suffix multiplier values
const SUFFIXES: Record<string, number> = {
  'K': 1e3,
  'M': 1e6,
  'B': 1e9,
  'T': 1e12,
  'q': 1e15,
  'Q': 1e18,
  's': 1e21,
  'S': 1e24,
  'O': 1e27,
  'N': 1e30,
  'D': 1e33,
  'aa': 1e36,
  'ab': 1e39,
  'ac': 1e42,
  'ad': 1e45,
  'ae': 1e48,
  'af': 1e51,
  'ag': 1e54,
  'ah': 1e57,
  'ai': 1e60,
  'aj': 1e63
};

// Map normalized keys to standard field keys
const KEY_ALIASES: Record<string, string> = {
  battledate: 'battleDate',
  gametime: 'gameTime',
  realtime: 'realTime',
  tier: 'tier',
  wave: 'wave',
  killedby: 'killedBy',
  coinsearned: 'coinsEarned',
  coinsperhour: 'coinsPerHour',
  cashearned: 'cashEarned',
  interestearned: 'interestEarned',
  gemblockstapped: 'gemBlocksTapped',
  cellsearned: 'cellsEarned',
  rerollshardsearned: 'rerollShardsEarned',
  damagetaken: 'damageTaken',
  damagetakenwall: 'damageTakenWall',
  damagetakenwhileberserked: 'damageTakenWhileBerserked',
  damagegainfromberserk: 'damageGainFromBerserk',
  deathdefy: 'deathDefy',
  damagedealt: 'damageDealt',
  projectilesdamage: 'projectilesDamage',
  rendarmordamage: 'rendArmorDamage',
  projectilescount: 'projectilesCount',
  lifesteal: 'lifesteal',
  thorndamage: 'thornDamage',
  orbdamage: 'orbDamage',
  orbhits: 'orbHits',
  enemieshitbyorbs: 'orbHits',
  landminedamage: 'landMineDamage',
  landminesspawned: 'landMinesSpawned',
  deathraydamage: 'deathRayDamage',
  smartmissiledamage: 'smartMissileDamage',
  innerlandminedamage: 'innerLandMineDamage',
  chainlightningdamage: 'chainLightningDamage',
  deathwavedamage: 'deathWaveDamage',
  swampdamage: 'swampDamage',
  blackholedamage: 'blackHoleDamage',
  electronsdamage: 'electronsDamage',
  flamebotdamage: 'flameBotDamage',
  wavesskipped: 'wavesSkipped',
  recoverypackages: 'recoveryPackages',
  freeattackupgrade: 'freeAttackUpgrade',
  freedefenseupgrade: 'freeDefenseUpgrade',
  freeutilityupgrade: 'freeUtilityUpgrade',
  hpfromdeathwave: 'hpFromDeathWave',
  thunderbotstuns: 'thunderBotStuns',
  guardiancatches: 'guardianCatches',
  totalenemies: 'totalEnemies',
  basic: 'basic',
  fast: 'fast',
  tank: 'tank',
  ranged: 'ranged',
  boss: 'boss',
  protector: 'protector',
  totalelites: 'totalElites',
  vampires: 'vampires',
  rays: 'rays',
  scatters: 'scatters',
  saboteurs: 'saboteurs',
  commanders: 'commanders',
  overcharges: 'overcharges',
  destroyedbyorbs: 'destroyedByOrbs',
  destroyedbythorns: 'destroyedByThorns',
  destroyedbydeathray: 'destroyedByRay',
  destroyedbydeathraytemp: 'destroyedByRay',
  destroyedbylandmine: 'destroyedByLandMine',
  gems: 'gems',
  medals: 'medals',
  rerollshards: 'rerollShards',
  cannonshards: 'cannonShards',
  armorshards: 'armorShards',
  generatorshards: 'generatorShards',
  coreshards: 'coreShards',
  commonmodules: 'commonModules',
  raremodules: 'rareModules',
  coinsfromgoldentower: 'coinsFromGoldenTower',
  coinsfromblackhole: 'coinsFromBlackhole',
  coinsfromblackholebonus: 'coinsFromBlackhole',
  coinsfromdeathwave: 'coinsFromDeathWave',
  coinsfromspotlight: 'coinsFromSpotlight',
  coinsfromorbs: 'coinsFromOrbs',
  coinsfromcoinupgrade: 'coinsFromCoinUpgrade',
  coinsfromcoinbonuses: 'coinsFromCoinBonuses',
  cashfromgoldentower: 'cashFromGoldenTower',
  goldenbotcoinsearned: 'goldenBotCoinsEarned',
  coinsstolen: 'coinsStolen',
  coinsfetched: 'coinsFetched',
  cellsfromdeathwave: 'cellsFromDeathWave',
  cellsfromglobal: 'cellsFromGlobal'
};

export interface ParsedRun {
  battleDate: string | null;
  gameTimeSec: number;
  realTimeSec: number;
  tier: number;
  tierSuffix: '+' | null;
  wave: number;
  killedBy: string;
  fields: Record<string, number>;
  raw: Record<string, string>;
}

// Normalize key by lowercasing and stripping non-alphanumeric chars
export function normalizeKey(label: string): string {
  const clean = label.toLowerCase().replace(/[^a-z0-9]/g, '');
  return KEY_ALIASES[clean] || clean;
}

// Parse duration like "2d 1h 49m 3s" or "7h 46m 6s" to seconds
export function parseDuration(val: string): number {
  const clean = val.trim();
  const dayMatch = clean.match(/(\d+)\s*d/);
  const hourMatch = clean.match(/(\d+)\s*h/);
  const minMatch = clean.match(/(\d+)\s*m/);
  const secMatch = clean.match(/(\d+)\s*s/);
  
  let total = 0;
  if (dayMatch) total += parseInt(dayMatch[1], 10) * 86400;
  if (hourMatch) total += parseInt(hourMatch[1], 10) * 3600;
  if (minMatch) total += parseInt(minMatch[1], 10) * 60;
  if (secMatch) total += parseInt(secMatch[1], 10);
  
  // Fallback if it's just raw seconds
  if (total === 0 && /^\d+$/.test(clean)) {
    total = parseInt(clean, 10);
  }
  
  return total;
}

// Robust multi-locale number parser
export function cleanAndParseFloat(valStr: string): number {
  let s = valStr.trim();
  
  // Strip starting $ or x symbols and potential leading/trailing space
  s = s.replace(/^[\$x\s]+/, '');
  
  // Detect if there's any text suffix representing multiplier (e.g. K, M, T, aa)
  let suffix = '';
  const suffixMatch = s.match(/[a-zA-Z]+$/);
  if (suffixMatch) {
    suffix = suffixMatch[0];
    s = s.substring(0, s.length - suffix.length).trim();
  }
  
  // Parse clean separator numbers
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  
  let decimalSep = '.';
  let thousandsSep = '';
  
  if (hasDot && hasComma) {
    if (s.lastIndexOf('.') > s.lastIndexOf(',')) {
      decimalSep = '.';
      thousandsSep = ',';
    } else {
      decimalSep = ',';
      thousandsSep = '.';
    }
  } else if (hasDot || hasComma) {
    const sep = hasDot ? '.' : ',';
    const parts = s.split(sep);
    if (parts.length > 2) {
      thousandsSep = sep;
      decimalSep = sep === '.' ? ',' : '.';
    } else {
      // Single separator: check if followed by exactly 3 digits at end
      const lastPart = parts[1];
      if (lastPart && /^\d{3}$/.test(lastPart)) {
        thousandsSep = sep;
        decimalSep = sep === '.' ? ',' : '.';
      } else {
        decimalSep = sep;
        thousandsSep = '';
      }
    }
  }
  
  if (thousandsSep) {
    s = s.replaceAll(thousandsSep, '');
  }
  if (decimalSep && decimalSep !== '.') {
    s = s.replaceAll(decimalSep, '.');
  }
  
  let num = parseFloat(s);
  if (isNaN(num)) return 0;
  
  if (suffix && SUFFIXES[suffix]) {
    num *= SUFFIXES[suffix];
  }
  
  return num;
}

// Parser for single Battle Report block
export function parseBattleReport(text: string): ParsedRun {
  const lines = text.split(/\r?\n/);
  
  let battleDate: string | null = null;
  let gameTimeSec = 0;
  let realTimeSec = 0;
  let tier = 1;
  let tierSuffix: '+' | null = null;
  let wave = 0;
  let killedBy = '';
  
  const fields: Record<string, number> = {};
  const raw: Record<string, string> = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Split on tabs or at least two spaces
    const parts = trimmed.split(/\t+| {2,}/);
    if (parts.length < 2) {
      // Section header, skip or keep as raw if needed, but not data key-value
      continue;
    }
    
    const label = parts[0].trim();
    const val = parts.slice(1).join(' ').trim();
    
    // Store in raw
    raw[label] = val;
    
    const normKey = normalizeKey(label);
    
    // Handle core known fields with specific structures
    if (normKey === 'battleDate') {
      battleDate = val;
    } else if (normKey === 'gameTime') {
      gameTimeSec = parseDuration(val);
    } else if (normKey === 'realTime') {
      realTimeSec = parseDuration(val);
    } else if (normKey === 'tier') {
      const match = val.match(/(\d+)(\+)?/);
      if (match) {
        tier = parseInt(match[1], 10);
        tierSuffix = match[2] === '+' ? '+' : null;
      } else {
        tier = parseInt(val, 10) || 1;
      }
    } else if (normKey === 'wave') {
      wave = parseInt(val, 10) || 0;
    } else if (normKey === 'killedBy') {
      killedBy = val;
    } else {
      // Parse as numeric and store in fields
      fields[normKey] = cleanAndParseFloat(val);
    }
  }
  
  return {
    battleDate,
    gameTimeSec,
    realTimeSec,
    tier,
    tierSuffix,
    wave,
    killedBy,
    fields,
    raw
  };
}

// Split multiple Battle Reports pasted together
export function parseBulkBattleReports(text: string): ParsedRun[] {
  // Split the paste on the header line "Battle Report"
  const blocks = text.split(/(?=Battle Report)/i);
  const runs: ParsedRun[] = [];
  
  for (const block of blocks) {
    const cleanBlock = block.trim();
    if (!cleanBlock) continue;
    runs.push(parseBattleReport(cleanBlock));
  }
  
  return runs;
}
