import { useState, useEffect } from 'react';
import { useStore, type Run } from '../domain/store';
import { parseBulkBattleReports } from '../domain/parser';
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
  X
} from 'lucide-react';

export function ImportRuns() {
  const storeRuns = useStore((state) => state.runs);
  const addRuns = useStore((state) => state.addRuns);
  const deleteRun = useStore((state) => state.deleteRun);
  const updateRun = useStore((state) => state.updateRun);
  
  const [pasteText, setPasteText] = useState('');
  const [previews, setPreviews] = useState<(Omit<Run, 'id' | 'importedAt'> & { key: string })[]>([]);
  const [localeOverride, setLocaleOverride] = useState<'auto' | 'us' | 'eu'>('auto');

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
        const hours = r.realTimeSec / 3600;
        return hours > 0 ? (r.fields.coinsEarned / r.dissonanceMultiplier) / hours : 0;
      };
      
      const getCellsHr = (r: Run) => {
        const hours = r.realTimeSec / 3600;
        return hours > 0 ? r.fields.cellsEarned / hours : 0;
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

    try {
      const parsedList = parseBulkBattleReports(pasteText);
      const mapped = parsedList.map((parsed, idx) => {
        // Auto classify runType
        let runType: 'farm' | 'tournament' | 'milestone' = 'farm';
        if (parsed.tierSuffix === '+') {
          runType = 'tournament';
        } else if (parsed.wave >= 4500) {
          // just a heuristic, user can edit
          runType = 'farm';
        }
        
        // Auto exclude if wave < 50
        const excluded = parsed.wave < 50;
        
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
          
          runType,
          tournament: runType === 'tournament' ? { bracket: 'Champion', rank: null } : null,
          dissonanceMultiplier: 1.0,
          excluded,
          notes: parsed.wave < 50 ? 'Suspected crash run (wave < 50)' : '',
          gameVersion: null
        };
      });
      setPreviews(mapped);
    } catch (err) {
      console.error(err);
    }
  }, [pasteText, localeOverride]);

  const handleImport = () => {
    const runsToSave: Run[] = previews.map((p, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
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
              ? { bracket: 'Champion', rank: null } 
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
      'projectilescount', 'lifesteal', 'thorndamage', 'orbdamage', 'orbhits',
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
      'coinsfetched', 'cellsfromdeathwave', 'cellsfromglobal'
    ];
    
    return Object.keys(raw).filter(key => {
      const clean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
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
              <span className="text-[10px] text-zinc-500 font-mono uppercase block">Dissonance Explanation</span>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Dissonance is a random bonus coin multiplier. For example, a T7 run with <strong>x1.44</strong> bonus should set the dissonance multiplier to 1.44 to normalise rate calculations correctly.
              </p>
            </div>
            {previews.length > 0 && (
              <button
                onClick={handleImport}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2 animate-pulse-glow"
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
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">Coins</span>
                        <span className="text-sm font-semibold text-amber-500">{formatCompact(preview.fields.coinsEarned || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">Cells</span>
                        <span className="text-sm font-semibold text-purple-400">{formatCompact(preview.fields.cellsEarned || 0)}</span>
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
                        <option value="farm">Farm Run</option>
                        <option value="tournament">Tournament</option>
                        <option value="milestone">Milestone</option>
                      </select>
                    </div>

                    {/* Dissonance multiplier */}
                    <div>
                      <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Dissonance Mult</label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={preview.dissonanceMultiplier}
                        onChange={(e) => updatePreview(preview.key, { dissonanceMultiplier: parseFloat(e.target.value) || 1.0 })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-200"
                      />
                    </div>

                    {/* Excluded Checkbox */}
                    <div>
                      <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-2">Exclude from aggregates?</label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preview.excluded}
                          onChange={(e) => updatePreview(preview.key, { excluded: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="relative w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                        <span className="ms-2.5 text-xs text-zinc-400 font-medium">
                          {preview.excluded ? 'Excluded' : 'Included'}
                        </span>
                      </label>
                    </div>

                    {/* Game Version */}
                    <div>
                      <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Game Version</label>
                      <input
                        type="text"
                        placeholder="e.g. 0.24.4"
                        value={preview.gameVersion || ''}
                        onChange={(e) => updatePreview(preview.key, { gameVersion: e.target.value || null })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-200"
                      />
                    </div>

                    {/* If Tournament, show Bracket and Rank */}
                    {preview.runType === 'tournament' && (
                      <>
                        <div>
                          <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Bracket</label>
                          <select
                            value={preview.tournament?.bracket || 'Champion'}
                            onChange={(e) => updatePreview(preview.key, { 
                              tournament: { bracket: e.target.value, rank: preview.tournament?.rank || null }
                            })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs focus:outline-none focus:border-indigo-500 text-zinc-200"
                          >
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
                                bracket: preview.tournament?.bracket || 'Champion', 
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
              className="text-[10px] font-mono text-zinc-400 hover:text-indigo-400 border border-zinc-800 hover:border-indigo-500/30 rounded px-2 py-1 transition-all self-start md:self-auto"
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
                  <th className="p-3">Run Date / Imported</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Wave</th>
                  <th className="p-3">Real Length</th>
                  <th className="p-3">Coins / Hr</th>
                  <th className="p-3">Cells / Hr</th>
                  <th className="p-3">Dissonance</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/20">
                {processedRuns.map((run) => {
                  const hours = run.realTimeSec / 3600;
                  const coinsHr = hours > 0 ? (run.fields.coinsEarned / run.dissonanceMultiplier) / hours : 0;
                  const cellsHr = hours > 0 ? run.fields.cellsEarned / hours : 0;
                  
                  return (
                    <tr key={run.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="p-3 font-medium text-white">
                        {run.battleDate || new Date(run.importedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          run.runType === 'tournament' 
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/30' 
                            : run.runType === 'milestone' 
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/30'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-700/50'
                        }`}>
                          {run.runType === 'tournament' 
                            ? `Tourney (${run.tournament?.bracket})` 
                            : run.runType}
                        </span>
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
                      <td className="p-3 text-amber-500 font-semibold font-mono">
                        {formatCompact(coinsHr)}
                      </td>
                      <td className="p-3 text-purple-400 font-semibold font-mono">
                        {formatCompact(cellsHr)}
                      </td>
                      <td className="p-3 font-mono text-zinc-400">
                        x{run.dissonanceMultiplier.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => updateRun(run.id, { excluded: !run.excluded })}
                          className="focus:outline-none"
                          title={run.excluded ? 'Include in analysis' : 'Exclude from analysis'}
                        >
                          {run.excluded ? (
                            <ToggleRight className="w-8 h-8 text-rose-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-zinc-600" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteRun(run.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                          title="Delete run"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
