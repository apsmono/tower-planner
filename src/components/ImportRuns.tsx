import { useState, useEffect } from 'react';
import { useStore, type Run, calculateEffectiveDissonance } from '../domain/store';
import { parseBulkBattleReports, getField, computeContentHash, CURRENT_PARSER_VERSION } from '../domain/parser';
import { reparseLegacyRuns } from '../domain/syncEngine';
import { GAME_CHANGELOG } from '../data/changelogData';
import { 
  Check, 
  AlertCircle, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  FileText,
  HelpCircle,
  Search,
  SlidersHorizontal,
  X,
  RotateCw,
  Sparkles,
  Eye,
  Database
} from 'lucide-react';
import { CurrencyIcon } from './CurrencyIcon';
import { RunDetailsModal } from './RunDetailsModal';
import { DissonanceDatabankModal } from './DissonanceDatabankModal';

export function ImportRuns() {
  const storeRuns = useStore((state) => state.runs);
  const addRuns = useStore((state) => state.addRuns);
  const deleteRun = useStore((state) => state.deleteRun);
  const updateRun = useStore((state) => state.updateRun);
  const dissonanceDatabank = useStore((state) => state.dissonanceDatabank);
  const lastSelectedGameVersion = useStore((state) => state.lastSelectedGameVersion);
  const setLastSelectedGameVersion = useStore((state) => state.setLastSelectedGameVersion);
  
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const selectedRun = storeRuns.find((r) => r.id === selectedRunId) || null;
  const [isDissonanceModalOpen, setIsDissonanceModalOpen] = useState(false);
  
  const [pasteText, setPasteText] = useState('');
  const [previews, setPreviews] = useState<(Omit<Run, 'id' | 'importedAt'> & { key: string })[]>([]);
  const [localeOverride, setLocaleOverride] = useState<'auto' | 'us' | 'eu'>('auto');
  const [isReparsing, setIsReparsing] = useState(false);
  const [reparseNotice, setReparseNotice] = useState<string | null>(null);

  const reparsableRuns = storeRuns.filter(
    (r) => r.rawText && r.rawText.trim().length > 0 && r.parserVersion < CURRENT_PARSER_VERSION
  );

  const handleReparse = async () => {
    setIsReparsing(true);
    const { recomputedCount } = await reparseLegacyRuns();
    setIsReparsing(false);
    setReparseNotice(`Successfully re-parsed ${recomputedCount} runs with parser v${CURRENT_PARSER_VERSION}.`);
    setTimeout(() => setReparseNotice(null), 4000);
  };

  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Helpers
  const getRunTimestamp = (run: Run): number => {
    if (run.battleDate) {
      const parsed = Date.parse(run.battleDate);
      if (!isNaN(parsed)) return parsed;
    }
    return new Date(run.importedAt).getTime();
  };

  // Derive dynamic list of tiers present in the store runs
  const availableTiers = Array.from(
    new Set(storeRuns.map((r) => `T${r.tier}${r.tierSuffix || ''}`))
  ).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });

  const processedRuns = storeRuns
    .filter((run) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDate = run.battleDate?.toLowerCase().includes(query) || false;
        const matchesNotes = run.notes?.toLowerCase().includes(query) || false;
        const matchesKilledBy = run.killedBy?.toLowerCase().includes(query) || false;
        const matchesBracket = run.tournament?.bracket?.toLowerCase().includes(query) || false;
        const matchesType = run.runType.toLowerCase().includes(query);
        const matchesTier = `t${run.tier}${run.tierSuffix || ''}`.includes(query);
        
        if (!matchesDate && !matchesNotes && !matchesKilledBy && !matchesBracket && !matchesType && !matchesTier) {
          return false;
        }
      }

      // 2. Run Type
      if (filterType !== 'all' && run.runType !== filterType) {
        return false;
      }

      // 3. Tier
      if (filterTier !== 'all') {
        const tierString = `T${run.tier}${run.tierSuffix || ''}`;
        if (tierString !== filterTier) {
          return false;
        }
      }

      // 4. Status
      if (filterStatus === 'active' && run.excluded) return false;
      if (filterStatus === 'excluded' && !run.excluded) return false;

      return true;
    })
    .sort((a, b) => {
      // Helper function to get rates
      const getCoinsHr = (r: Run) => {
        const parsedCph = getField(r.fields, 'coinsPerHour');
        const hours = r.realTimeSec / 3600;
        const coins = getField(r.fields, 'coinsEarned');
        const rawCph = parsedCph > 0 ? parsedCph : (hours > 0 ? coins / hours : 0);
        return r.dissonanceMultiplier > 0 ? rawCph / r.dissonanceMultiplier : rawCph;
      };
      
      const getCellsHr = (r: Run) => {
        const parsedCeph = getField(r.fields, 'cellsPerHour');
        const hours = r.realTimeSec / 3600;
        const cells = getField(r.fields, 'cellsEarned');
        return parsedCeph > 0 ? parsedCeph : (hours > 0 ? cells / hours : 0);
      };

      switch (sortBy) {
        case 'date-asc':
          return getRunTimestamp(a) - getRunTimestamp(b);
        case 'date-desc':
          return getRunTimestamp(b) - getRunTimestamp(a);
        case 'wave-desc':
          return b.wave - a.wave;
        case 'coins-desc':
          return getCoinsHr(b) - getCoinsHr(a);
        case 'cells-desc':
          return getCellsHr(b) - getCellsHr(a);
        default:
          return getRunTimestamp(b) - getRunTimestamp(a);
      }
    });
  
  // Format helpers
  const formatCompact = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  // Run parser whenever text or override changes
  useEffect(() => {
    if (!pasteText.trim()) {
      setPreviews([]);
      return;
    }

    let isMounted = true;

    async function parseAndPrepare() {
      try {
        const parsedList = parseBulkBattleReports(pasteText);
        const defaultVersion = lastSelectedGameVersion || GAME_CHANGELOG[0]?.version || 'v25.0';

        const mapped = await Promise.all(parsedList.map(async (parsed, idx) => {
          // Auto classify runType
          let runType: 'farm' | 'tournament' | 'milestone' | 'event' = 'farm';
          if (parsed.tierSuffix === '+') {
            runType = 'tournament';
          } else if (parsed.wave >= 4500) {
            runType = 'farm';
          }
          
          // Auto exclude if wave < 50 (crash runs)
          const excluded = parsed.wave < 50;
          const hash = await computeContentHash(parsed.rawText);
          const autoDissonance = calculateEffectiveDissonance(parsed.tier, dissonanceDatabank);
          
          return {
            key: `${idx}-${Date.now()}`,
            battleDate: parsed.battleDate,
            gameTimeSec: parsed.gameTimeSec,
            realTimeSec: parsed.realTimeSec,
            tier: parsed.tier,
            tierSuffix: parsed.tierSuffix,
            wave: parsed.wave,
            killedBy: parsed.killedBy,
            fields: parsed.fields,
            raw: parsed.raw,
            rawText: parsed.rawText,
            parserVersion: parsed.parserVersion,
            contentHash: hash,
            
            runType,
            tournament: runType === 'tournament' ? { bracket: null, rank: null } : null,
            dissonanceMultiplier: autoDissonance,
            excluded,
            notes: parsed.wave < 50 ? 'Suspected crash run (wave < 50)' : '',
            gameVersion: defaultVersion
          };
        }));

        if (isMounted) {
          setPreviews(mapped);
        }
      } catch (err) {
        console.error(err);
      }
    }

    parseAndPrepare();

    return () => {
      isMounted = false;
    };
  }, [pasteText, localeOverride, dissonanceDatabank, lastSelectedGameVersion]);

  const handleImport = () => {
    const runsToSave: Run[] = previews.map((p) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-0000-0000-${Math.random().toString(16).slice(2, 14).padStart(12, '0')}`,
      importedAt: new Date().toISOString(),
      battleDate: p.battleDate,
      gameTimeSec: p.gameTimeSec,
      realTimeSec: p.realTimeSec,
      tier: p.tier,
      tierSuffix: p.tierSuffix,
      wave: p.wave,
      killedBy: p.killedBy,
      fields: p.fields,
      raw: p.raw,
      rawText: p.rawText,
      parserVersion: p.parserVersion,
      contentHash: p.contentHash,
      runType: p.runType,
      tournament: p.tournament,
      dissonanceMultiplier: p.dissonanceMultiplier,
      excluded: p.excluded,
      notes: p.notes,
      gameVersion: p.gameVersion
    }));
    
    addRuns(runsToSave);
    setPasteText('');
    setPreviews([]);
  };

  const updatePreview = (key: string, updates: Partial<typeof previews[0]>) => {
    setPreviews((prev) => 
      prev.map((item) => {
        if (item.key === key) {
          const merged = { ...item, ...updates };
          // If runType is changed, sync tournament sub-state
          if (updates.runType !== undefined) {
            merged.tournament = updates.runType === 'tournament' 
              ? { bracket: null, rank: null } 
              : null;
          }
          return merged;
        }
        return item;
      })
    );
  };

  // Find unmatched keys for display
  const getUnmatchedKeys = (raw: Record<string, string>): string[] => {
    const knownKeys = [
      'battledate', 'gametime', 'realtime', 'tier', 'wave', 'killedby',
      'coinsearned', 'coinsperhour', 'cashearned', 'interestearned',
      'gemblockstapped', 'cellsearned', 'rerollshardsearned', 'damagetaken',
      'damagetakenwall', 'damagetakenwhileberserked', 'damagegainfromberserk',
      'deathdefy', 'damagedealt', 'projectilesdamage', 'rendarmordamage',
      'projectilescount', 'lifesteal', 'thorndamage', 'thorns', 'orbdamage', 'orbhits',
      'enemieshitbyorbs', 'landminedamage', 'landminesspawned', 'deathraydamage',
      'smartmissiledamage', 'innerlandminedamage', 'chainlightningdamage',
      'deathwavedamage', 'swampdamage', 'blackholedamage', 'electronsdamage',
      'flamebotdamage', 'wavesskipped', 'recoverypackages', 'freeattackupgrade',
      'freedefenseupgrade', 'freeutilityupgrade', 'hpfromdeathwave',
      'thunderbotstuns', 'guardiancatches', 'totalenemies', 'basic', 'fast',
      'tank', 'ranged', 'boss', 'protector', 'totalelites', 'vampires', 'rays',
      'scatters', 'saboteurs', 'commanders', 'overcharges', 'destroyedbyorbs',
      'destroyedbythorns', 'destroyedbydeathray', 'destroyedbydeathraytemp',
      'destroyedbylandmine', 'gems', 'medals', 'rerollshards', 'cannonshards',
      'armorshards', 'generatorshards', 'coreshards', 'commonmodules',
      'raremodules', 'coinsfromgoldentower', 'coinsfromblackhole',
      'coinsfromblackholebonus', 'coinsfromdeathwave', 'coinsfromspotlight',
      'coinsfromorbs', 'coinsfromcoinupgrade', 'coinsfromcoinbonuses',
      'cashfromgoldentower', 'goldenbotcoinsearned', 'coinsstolen',
      'coinsfetched', 'cellsfromdeathwave', 'cellsfromglobal', 'blackhole',
      'orbs', 'deathwave', 'goldentower', 'spotlight'
    ];
    
    return Object.keys(raw).filter(key => {
      const label = key.includes('::') ? key.split('::')[1] : key;
      const clean = label.toLowerCase().replace(/[^a-z0-9]/g, '');
      return !knownKeys.includes(clean);
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Import Battle Reports</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Copy the Battle Report from the game screen and paste it below.
          </p>
        </div>
      </div>

      {/* Retroactive Parser Upgrade Banner */}
      {reparseNotice && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{reparseNotice}</span>
        </div>
      )}

      {reparsableRuns.length > 0 && !reparseNotice && (
        <div className="p-4 bg-indigo-950/30 border border-indigo-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Parser Update Available (v{CURRENT_PARSER_VERSION})</h4>
              <p className="text-[11px] text-zinc-400">
                You have {reparsableRuns.length} run(s) imported with an older parser version. Re-parse from their original report text?
              </p>
            </div>
          </div>
          <button
            onClick={handleReparse}
            disabled={isReparsing}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReparsing ? 'animate-spin' : ''}`} />
            <span>{isReparsing ? 'Re-parsing...' : `Re-parse ${reparsableRuns.length} Runs`}</span>
          </button>
        </div>
      )}

      {/* Paste Area & Import Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 glass-panel rounded-xl glow-indigo">
            <label className="text-sm font-semibold text-zinc-300 block mb-2 font-mono uppercase tracking-wider">
              Paste Report Details
            </label>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Battle Report&#10;Battle Date   Oct 14, 2025 13:14&#10;Game Time   2d 1h 49m 3s&#10;Real Time   10h 6m 23s&#10;Tier   12&#10;Wave   7639&#10;..."
              className="w-full h-64 bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500 rounded-lg p-3 text-sm font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            />
            
            {/* Locale Picker */}
            <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
              <div className="flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Detected number locale: <strong>{localeOverride === 'auto' ? 'Auto-Detect' : localeOverride.toUpperCase()}</strong></span>
              </div>
              <div className="flex space-x-1">
                {(['auto', 'us', 'eu'] as const).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocaleOverride(loc)}
                    className={`px-2 py-1 rounded transition-colors ${
                      localeOverride === loc 
                        ? 'bg-zinc-800 text-white font-semibold' 
                        : 'hover:text-zinc-200'
                    }`}
                  >
                    {loc.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wizard Panel */}
        <div className="space-y-4">
          <div className="p-5 glass-panel rounded-xl border border-zinc-800/80 bg-zinc-900/10 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">Import Helper</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Pasting a battle summary will parse it immediately. You can import multiple runs at once by stacking them.
            </p>
            <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Dissonance Databank</span>
                <button
                  onClick={() => setIsDissonanceModalOpen(true)}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Database className="w-3 h-3" />
                  <span>Configure</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Dissonance multipliers auto-fill based on your configured tier rates and lab scaling. Click Configure to edit your databank.
              </p>
            </div>
            {previews.length > 0 && (
              <button
                onClick={handleImport}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2 animate-pulse-glow cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save {previews.length} Run(s) to Store</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview List */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Parsed Preview ({previews.length})</span>
          </h3>
          
          <div className="space-y-6">
            {previews.map((preview) => {
              const unmatched = getUnmatchedKeys(preview.raw);
              const coinsVal = getField(preview.fields, 'coinsEarned');
              const cellsVal = getField(preview.fields, 'cellsEarned');

              return (
                <div key={preview.key} className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    {/* Main parsed stats */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">Tier</span>
                        <span className="text-sm font-semibold text-white">T{preview.tier}{preview.tierSuffix}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">Wave</span>
                        <span className="text-sm font-semibold text-white">{preview.wave.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase flex items-center gap-1">
                          <CurrencyIcon currency="coins" size="xs" />
                          Coins
                        </span>
                        <span className="text-sm font-semibold text-amber-500">{formatCompact(coinsVal)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase flex items-center gap-1">
                          <CurrencyIcon currency="cells" size="xs" />
                          Cells
                        </span>
                        <span className="text-sm font-semibold text-purple-400">{formatCompact(cellsVal)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">Real Duration</span>
                        <span className="text-sm font-semibold text-zinc-300">{formatDuration(preview.realTimeSec)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">Killed By</span>
                        <span className="text-sm font-semibold text-zinc-300">{preview.killedBy || 'Unknown'}</span>
                      </div>
                    </div>

                    {/* Quick validation indicator */}
                    {preview.wave < 50 && (
                      <div className="flex items-center space-x-1 px-2.5 py-1 bg-rose-950/30 border border-rose-800/40 rounded-full text-[10px] text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Crash Run Warning</span>
                      </div>
                    )}
                  </div>

                  {/* Wizard Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-zinc-950/40 border border-zinc-800 rounded-lg">
                    {/* Run Type */}
                    <div>
                      <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Run Type</label>
                      <select
                        value={preview.runType}
                        onChange={(e) => updatePreview(preview.key, { runType: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-200"
                      >
                        <option value="farm">🚜 Farm Run</option>
                        <option value="tournament">🏆 Tournament</option>
                        <option value="milestone">🎯 Milestone Push</option>
                        <option value="event">🎟️ Event / Mission</option>
                      </select>
                    </div>

                    {/* Dissonance multiplier with databank shortcut */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-zinc-500 font-mono uppercase">Dissonance Mult</label>
                        <button
                          onClick={() => setIsDissonanceModalOpen(true)}
                          className="text-[9px] font-mono text-amber-400 hover:text-amber-300 cursor-pointer"
                          title="Open Dissonance Databank"
                        >
                          Databank ↗
                        </button>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={preview.dissonanceMultiplier}
                        onChange={(e) => updatePreview(preview.key, { dissonanceMultiplier: parseFloat(e.target.value) || 1.0 })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-200"
                      />
                    </div>

                    {/* Excluded / Included Toggle (ON = Included) */}
                    <div>
                      <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-2">Include in aggregates?</label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!preview.excluded}
                          onChange={(e) => updatePreview(preview.key, { excluded: !e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="relative w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
                        <span className="ms-2.5 text-xs font-medium text-zinc-300">
                          {!preview.excluded ? 'Included' : 'Excluded'}
                        </span>
                      </label>
                    </div>

                    {/* Game Version Dropdown */}
                    <div>
                      <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Game Version</label>
                      <select
                        value={preview.gameVersion || lastSelectedGameVersion || 'v25.0'}
                        onChange={(e) => {
                          const ver = e.target.value;
                          updatePreview(preview.key, { gameVersion: ver });
                          setLastSelectedGameVersion(ver);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-200 cursor-pointer"
                      >
                        {GAME_CHANGELOG.map((p) => (
                          <option key={p.version} value={p.version}>
                            {p.version} {p.version === GAME_CHANGELOG[0].version ? '(Latest)' : ''}
                          </option>
                        ))}
                        <option value="v21.0">v21.0</option>
                        <option value="v20.0">v20.0</option>
                      </select>
                    </div>

                    {/* If Tournament, show Bracket and Rank */}
                    {preview.runType === 'tournament' && (
                      <>
                        <div>
                          <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Bracket</label>
                          <select
                            value={preview.tournament?.bracket || ''}
                            onChange={(e) => updatePreview(preview.key, { 
                              tournament: { bracket: e.target.value || null, rank: preview.tournament?.rank || null }
                            })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-200"
                          >
                            <option value="">Unknown / Select League</option>
                            <option value="Copper">Copper</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Champion">Champion</option>
                            <option value="Legend">Legend</option>
                            <option value="Mythic">Mythic</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Final Place / Rank</label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            placeholder="e.g. 12"
                            value={preview.tournament?.rank || ''}
                            onChange={(e) => updatePreview(preview.key, {
                              tournament: { 
                                bracket: preview.tournament?.bracket || null, 
                                rank: parseInt(e.target.value, 10) || null 
                              }
                            })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-200"
                          />
                        </div>
                      </>
                    )}

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Run Notes</label>
                      <input
                        type="text"
                        placeholder="Add special notes about cards used, perks etc."
                        value={preview.notes}
                        onChange={(e) => updatePreview(preview.key, { notes: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-200"
                      />
                    </div>
                  </div>

                  {/* Unmatched fields alert */}
                  {unmatched.length > 0 && (
                    <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg text-xs">
                      <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Unmatched keys found (stored as raw strings)</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {unmatched.map((key) => (
                          <span key={key} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
                            {key}: "{preview.raw[key]}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Logged Runs List */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Logged Runs ({storeRuns.length})</span>
            {processedRuns.length !== storeRuns.length && (
              <span className="text-xs font-normal text-zinc-500 bg-zinc-900 border border-zinc-800/60 px-2 py-0.5 rounded-full font-mono">
                showing {processedRuns.length} of {storeRuns.length}
              </span>
            )}
          </h3>
          
          {/* Quick reset filters button */}
          {(searchQuery || filterType !== 'all' || filterTier !== 'all' || filterStatus !== 'all' || sortBy !== 'date-desc') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterTier('all');
                setFilterStatus('all');
                setSortBy('date-desc');
              }}
              className="text-[10px] font-mono text-zinc-400 hover:text-indigo-400 border border-zinc-800 hover:border-indigo-500/30 rounded px-2 py-1 transition-all self-start md:self-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter and Sort controls bar */}
        {storeRuns.length > 0 && (
          <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
              </span>
              <input
                type="text"
                placeholder="Search date, notes, boss, bracket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg pl-9 pr-8 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-200 placeholder-zinc-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Type</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-200 transition-all cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="farm">Farm</option>
                <option value="tournament">Tournament</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>

            {/* Tier Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Tier</span>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-200 transition-all cursor-pointer"
              >
                <option value="all">All Tiers</option>
                {availableTiers.map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-zinc-500 font-mono uppercase">Status</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-200 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="excluded">Excluded Only</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-1.5 ml-auto">
              <span className="text-[10px] text-zinc-500 font-mono uppercase flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-zinc-400" />
                <span>Sort By</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-200 transition-all font-medium cursor-pointer"
              >
                <option value="date-desc">Newest Date</option>
                <option value="date-asc">Oldest Date</option>
                <option value="wave-desc">Highest Wave</option>
                <option value="coins-desc">Highest Coins / Hr</option>
                <option value="cells-desc">Highest Cells / Hr</option>
              </select>
            </div>
          </div>
        )}

        {storeRuns.length === 0 ? (
          <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
            No runs logged yet. Paste a Battle Report above to get started.
          </div>
        ) : processedRuns.length === 0 ? (
          <div className="p-12 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
            No runs match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-800/80 rounded-xl glass-panel">
            <table className="w-full text-left text-sm text-zinc-300 min-w-[700px]">
              <thead className="bg-zinc-900/60 text-zinc-400 text-xs font-mono uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-3">Run Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Wave</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Coins / hr</th>
                  <th className="p-3">Cells / hr</th>
                  <th className="p-3">Dissonance</th>
                  <th className="p-3 text-center">Include</th>
                  <th className="p-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {processedRuns.map((run) => {
                  const hours = run.realTimeSec / 3600;
                  const coins = getField(run.fields, 'coinsEarned');
                  const cells = getField(run.fields, 'cellsEarned');
                  const parsedCph = getField(run.fields, 'coinsPerHour');
                  const parsedCeph = getField(run.fields, 'cellsPerHour');

                  const rawCoinsHr = parsedCph > 0 ? parsedCph : (hours > 0 ? coins / hours : 0);
                  const coinsHr = run.dissonanceMultiplier > 0 ? (rawCoinsHr / run.dissonanceMultiplier) : rawCoinsHr;
                  const cellsHr = parsedCeph > 0 ? parsedCeph : (hours > 0 ? cells / hours : 0);

                  return (
                    <tr 
                      key={run.id} 
                      onClick={() => setSelectedRunId(run.id)}
                      className={`hover:bg-zinc-900/40 transition-colors cursor-pointer ${run.excluded ? 'opacity-50' : ''}`}
                    >
                      <td className="p-3 text-zinc-300 font-mono">
                        {run.battleDate || 'Unknown'}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={run.runType}
                          onChange={(e) => {
                            const nextType = e.target.value as 'farm' | 'tournament' | 'milestone' | 'event';
                            updateRun(run.id, {
                              runType: nextType,
                              tournament: nextType === 'tournament' ? (run.tournament || { bracket: 'Champion', rank: null }) : null
                            });
                          }}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono border transition-all cursor-pointer focus:outline-none ${
                            run.runType === 'tournament' 
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800/50' 
                              : run.runType === 'milestone' 
                              ? 'bg-amber-950 text-amber-300 border-amber-800/50'
                              : run.runType === 'event'
                              ? 'bg-rose-950 text-rose-300 border-rose-800/50'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-700/60'
                          }`}
                        >
                          <option value="farm" className="bg-zinc-900 text-zinc-200">🚜 Farm</option>
                          <option value="tournament" className="bg-zinc-900 text-cyan-300">🏆 Tourney</option>
                          <option value="milestone" className="bg-zinc-900 text-amber-300">🎯 Milestone</option>
                          <option value="event" className="bg-zinc-900 text-rose-300">🎟️ Event</option>
                        </select>
                      </td>
                      <td className="p-3 font-semibold text-zinc-100">
                        T{run.tier}{run.tierSuffix}
                      </td>
                      <td className="p-3 font-mono font-semibold">
                        {run.wave.toLocaleString()}
                      </td>
                      <td className="p-3 text-zinc-400 font-mono">
                        {formatDuration(run.realTimeSec)}
                      </td>
                      <td className="p-3 font-semibold font-mono" title={run.dissonanceMultiplier > 1.0 ? `Actual rate: ${formatCompact(rawCoinsHr)}/hr | Normalized: ${formatCompact(coinsHr)}/hr` : undefined}>
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-amber-500">
                            <CurrencyIcon currency="coins" size="xs" />
                            <span>{formatCompact(rawCoinsHr)}</span>
                          </span>
                          {run.dissonanceMultiplier > 1.0 && (
                            <span className="text-[10px] font-normal text-zinc-500">
                              {formatCompact(coinsHr)} norm
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-purple-400 font-semibold font-mono">
                        <span className="inline-flex items-center gap-1">
                          <CurrencyIcon currency="cells" size="xs" />
                          <span>{formatCompact(cellsHr)}</span>
                        </span>
                      </td>
                      <td className="p-3 font-mono text-zinc-400">
                        x{run.dissonanceMultiplier.toFixed(2)}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => updateRun(run.id, { excluded: !run.excluded })}
                          className="focus:outline-none cursor-pointer"
                          title={!run.excluded ? 'Included in aggregates (Click to exclude)' : 'Excluded from aggregates (Click to include)'}
                        >
                          {!run.excluded ? (
                            <ToggleRight className="w-8 h-8 text-emerald-500 hover:text-emerald-400 transition-colors" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-zinc-600 hover:text-zinc-500 transition-colors" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setSelectedRunId(run.id)}
                            className="text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="View Run Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRun(run.id)}
                            className="text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete run"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Run Details Modal */}
      <RunDetailsModal
        run={selectedRun}
        isOpen={!!selectedRun}
        onClose={() => setSelectedRunId(null)}
      />

      {/* Dissonance Databank Modal */}
      <DissonanceDatabankModal
        isOpen={isDissonanceModalOpen}
        onClose={() => setIsDissonanceModalOpen(false)}
      />
    </div>
  );
}
