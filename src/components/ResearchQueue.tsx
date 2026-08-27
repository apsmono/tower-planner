import { useState, useMemo } from 'react';
import { useStore, type Run, type ResearchEntry } from '../domain/store';
import { BOOST_COSTS } from '../domain/cellModel';
import { LAB_CATEGORIES, type LabCategory } from '../data/labCatalog';
import { LabDatabase } from '../domain/labDatabase';
import { 
  ListOrdered, 
  AlertTriangle, 
  Check, 
  Pin,
  Search,
  BookOpen,
  ExternalLink,
  Database,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

// Map effect channel to report field key
const CHANNEL_FIELDS: Record<string, string> = {
  'coins.goldenTower': 'coinsFromGoldenTower',
  'coins.blackHole': 'coinsFromBlackhole',
  'coins.deathWave': 'coinsFromDeathWave',
  'coins.spotlight': 'coinsFromSpotlight',
  'coins.orbs': 'coinsFromOrbs',
  'coins.coinUpgrade': 'coinsFromCoinUpgrade',
  'coins.coinBonuses': 'coinsFromCoinBonuses',
  'cells.deathWave': 'cellsFromDeathWave',
  'cells.global': 'cellsFromGlobal',
  'damage.projectiles': 'projectilesDamage',
  'damage.smartMissile': 'smartMissileDamage',
  'damage.chainLightning': 'chainLightningDamage',
  'damage.deathWave': 'deathWaveDamage'
};

export function ResearchQueue() {
  const runs = useStore((state) => state.runs);
  const build = useStore((state) => state.build);
  const updateResearchCatalog = useStore((state) => state.updateResearchCatalog);
  const addResearchCatalogItem = useStore((state) => state.addResearchCatalogItem);
  const removeResearchCatalogItem = useStore((state) => state.removeResearchCatalogItem);
  const tasks = useStore((state) => state.tasks);
  const addTask = useStore((state) => state.addTask);
  const deleteTask = useStore((state) => state.deleteTask);

  // States
  const [currencyMode, setCurrencyMode] = useState<'split' | 'unified'>('split');
  const [selectedRunId, setSelectedRunId] = useState<string>('latest');
  const [labBoostSelect, setLabBoostSelect] = useState<number>(2.0); // Default 2.0x boost for queue calculations
  const [activeCategory, setActiveCategory] = useState<LabCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWikiCatalog, setShowWikiCatalog] = useState<boolean>(false);
  const [wikiSearchQuery, setWikiSearchQuery] = useState<string>('');
  const [wikiCategory, setWikiCategory] = useState<LabCategory>('all');

  // Custom Unified conversion rate (coins per cell)
  const farmRuns = runs.filter((r) => r.runType === 'farm' && !r.excluded);
  let totalCoins = 0;
  let totalCells = 0;
  farmRuns.forEach((r) => {
    totalCoins += r.fields.coinsEarned;
    totalCells += r.fields.cellsEarned;
  });
  
  const defaultExchangeRate = totalCells > 0 ? totalCoins / totalCells : 23000000; // 23M coins per cell
  const [exchangeRateOverride, setExchangeRateOverride] = useState<number>(defaultExchangeRate);

  // Helper formatters
  const formatCompact = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  // Select reference run
  let referenceRun: Run | null = null;
  if (selectedRunId === 'latest' && farmRuns.length > 0) {
    referenceRun = farmRuns[farmRuns.length - 1];
  } else if (selectedRunId !== 'latest') {
    referenceRun = runs.find((r) => r.id === selectedRunId) || null;
  }

  // Calculate daily coins speed (to compute days-to-afford)
  let totalRealTimeSec = 0;
  farmRuns.forEach((r) => {
    totalRealTimeSec += r.realTimeSec;
  });
  const coinsPerSec = totalRealTimeSec > 0 ? totalCoins / totalRealTimeSec : 0;
  const coinsPerDay = coinsPerSec * 86400;

  // Calculate score for each candidate research
  const scoredCatalog = useMemo(() => {
    return build.researchCatalog.map((research) => {
      let channelDelta = 0;
      let channelShare = 0;
      let totalImpact = 0;
      let isEstimated = false;

      const effect = research.effect;
      const meta = LabDatabase.getLabById(research.id);
      
      if (effect) {
        if (effect.kind === 'multiplier') {
          channelDelta = (effect.to / effect.from) - 1;
        } else if (effect.kind === 'percent') {
          channelDelta = (effect.to - effect.from) / 100;
        } else if (effect.kind === 'flat') {
          channelDelta = (effect.to - effect.from) / (effect.from || 1);
        } else if (effect.kind === 'unlock') {
          channelDelta = 0;
        }

        const fieldName = CHANNEL_FIELDS[effect.channel];
        if (fieldName && referenceRun) {
          const isCoin = effect.channel.startsWith('coins.');
          const isDamage = effect.channel.startsWith('damage.');
          const isCell = effect.channel.startsWith('cells.');
          
          if (isCoin && referenceRun.fields.coinsEarned > 0) {
            channelShare = (referenceRun.fields[fieldName] || 0) / referenceRun.fields.coinsEarned;
          } else if (isDamage && referenceRun.fields.damageDealt > 0) {
            channelShare = (referenceRun.fields[fieldName] || 0) / referenceRun.fields.damageDealt;
          } else if (isCell && referenceRun.fields.cellsEarned > 0) {
            channelShare = (referenceRun.fields[fieldName] || 0) / referenceRun.fields.cellsEarned;
          } else {
            channelShare = 0.0;
          }
          totalImpact = channelDelta * channelShare;
        } else if (effect.channel === 'coins.global' || effect.channel === 'cells.global') {
          channelShare = 1.0;
          totalImpact = channelDelta;
        } else {
          isEstimated = true;
          totalImpact = research.estimatedImpact || 0.0;
        }
      } else {
        isEstimated = true;
        totalImpact = research.estimatedImpact || 0.0;
      }

      const labSpeedMult = build.labSpeedMultiplier || 1.0;
      const effectiveDays = (research.baseTimeSeconds / (labSpeedMult * labBoostSelect)) / 86400;
      const score = effectiveDays > 0 ? (totalImpact / effectiveDays) * 100 : 0;

      const boostCostPerDay = BOOST_COSTS[labBoostSelect] || 0;
      const boostCellCost = boostCostPerDay * effectiveDays;

      const coinBalance = build.resources.coins;
      let daysToAfford = 0;
      if (research.coinCost > coinBalance && coinsPerDay > 0) {
        daysToAfford = (research.coinCost - coinBalance) / coinsPerDay;
      }

      return {
        ...research,
        category: meta?.category || 'utility',
        wikiUrl: meta?.wikiUrl || `https://the-tower-idle-tower-defense.fandom.com/wiki/${encodeURIComponent(research.name.replace(/\s+/g, '_'))}`,
        channelDelta,
        channelShare,
        totalImpact,
        effectiveDays,
        boostCellCost,
        score,
        daysToAfford,
        isEstimated
      };
    });
  }, [build.researchCatalog, build.labSpeedMultiplier, build.resources.coins, labBoostSelect, referenceRun, coinsPerDay]);

  // Filter & Sort
  const filteredResearches = useMemo(() => {
    return scoredCatalog.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchChange = (item.change || '').toLowerCase().includes(q);
        const matchReason = (item.reason || '').toLowerCase().includes(q);
        if (!matchName && !matchChange && !matchReason) return false;
      }
      return true;
    });
  }, [scoredCatalog, activeCategory, searchQuery]);

  const sortedResearches = useMemo(() => {
    return [...filteredResearches].sort((a, b) => b.score - a.score);
  }, [filteredResearches]);

  const unifiedResearches = useMemo(() => {
    return [...filteredResearches].sort((a, b) => {
      const unifiedCostA = a.coinCost + (a.boostCellCost * exchangeRateOverride);
      const scoreA = unifiedCostA > 0 ? (a.totalImpact / (unifiedCostA / 1e9)) : 0;
      const unifiedCostB = b.coinCost + (b.boostCellCost * exchangeRateOverride);
      const scoreB = unifiedCostB > 0 ? (b.totalImpact / (unifiedCostB / 1e9)) : 0;
      return scoreB - scoreA;
    });
  }, [filteredResearches, exchangeRateOverride]);

  // Wiki catalog filtering
  const masterWikiLabs = useMemo(() => {
    return LabDatabase.queryMasterLabs({
      category: wikiCategory,
      searchQuery: wikiSearchQuery
    });
  }, [wikiCategory, wikiSearchQuery]);

  // Dead Levers Callout Finder
  const deadLevers: { name: string; share: number }[] = [];
  if (referenceRun) {
    const damageAttributions = [
      { name: 'Chain Lightning', key: 'chainLightningDamage' },
      { name: 'Poison Swamp', key: 'swampDamage' },
      { name: 'Inner Land Mines', key: 'innerLandMineDamage' },
      { name: 'Smart Missiles', key: 'smartMissileDamage' },
      { name: 'Death Wave Damage', key: 'deathWaveDamage' }
    ];

    damageAttributions.forEach((attr) => {
      const share = (referenceRun!.fields[attr.key] || 0) / referenceRun!.fields.damageDealt;
      if (share > 0 && share < 0.001) {
        deadLevers.push({ name: attr.name, share });
      }
    });
  }

  const handleAddMasterLabToCatalog = (lab: typeof masterWikiLabs[0]) => {
    const existing = build.researchCatalog.find((r) => r.id === lab.id);
    if (existing) return;

    const newEntry: ResearchEntry = {
      id: lab.id,
      name: lab.name,
      level: 1,
      change: 'Lv.1 → Lv.2',
      coinCost: 1000000,
      baseTimeSeconds: 86400,
      targetLevel: Math.min(2, lab.maxLevel),
      effect: {
        channel: lab.defaultChannel || 'coins.global',
        from: 1.0,
        to: 1.05,
        kind: lab.defaultEffectKind || 'percent'
      },
      reason: lab.defaultReason
    };

    addResearchCatalogItem(newEntry);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <ListOrdered className="w-6 h-6 text-indigo-400" />
            <span>Research Queue</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Prioritized laboratory upgrade rankings evaluated from your actual Battle Reports & ROI.
          </p>
        </div>

        {/* Wiki Catalog Button */}
        <button
          type="button"
          onClick={() => setShowWikiCatalog(!showWikiCatalog)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-indigo-500/60 text-zinc-200 text-xs font-mono font-semibold transition-all shadow-sm hover:shadow-indigo-500/10 cursor-pointer self-start md:self-auto"
        >
          <Database className="w-4 h-4 text-indigo-400" />
          <span>{showWikiCatalog ? 'Hide Wiki Master Catalog' : 'Explore Full Wiki Lab Database (45+)'}</span>
          {showWikiCatalog ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
        </button>
      </div>

      {/* Wiki Master Catalog Section */}
      {showWikiCatalog && (
        <div className="p-5 glass-panel rounded-xl border border-indigo-500/40 bg-zinc-950/60 space-y-4 animate-fadeIn glow-indigo">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>The Tower — Full Master Lab Encyclopedia</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every research from the official wiki. Add any lab to your active planner or view wiki guides.
              </p>
            </div>

            {/* Wiki Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search master labs..."
                value={wikiSearchQuery}
                onChange={(e) => setWikiSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Wiki Category Pills */}
          <div className="flex flex-wrap gap-1.5">
            {LAB_CATEGORIES.map((cat) => {
              const isSelected = wikiCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setWikiCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-500/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Master Labs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {masterWikiLabs.map((lab) => {
              const isAlreadyInPlanner = build.researchCatalog.some((r) => r.id === lab.id);
              return (
                <div
                  key={lab.id}
                  className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-lg flex flex-col justify-between space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-800 dark:text-zinc-100">{lab.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 shrink-0">
                        Max Lv.{lab.maxLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight mt-1">
                      {lab.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-zinc-800/50">
                    <a
                      href={lab.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center space-x-1"
                    >
                      <span>Wiki</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    {isAlreadyInPlanner ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>In Planner</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeResearchCatalogItem(lab.id)}
                          className="text-[9px] font-mono text-zinc-500 hover:text-rose-400 hover:underline cursor-pointer"
                          title="Remove from planner"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddMasterLabToCatalog(lab)}
                        className="text-[10px] font-mono px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        Add to planner
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dead Levers Warning Banner */}
      {deadLevers.length > 0 && (
        <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl flex items-start space-x-3 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-sm block">Dead Lever Alert!</span>
            <p className="text-zinc-400 leading-normal">
              Based on reference run #{referenceRun?.id.slice(0, 6)}, the following damage sources contributed <strong className="text-amber-300">&lt; 0.1%</strong> total damage:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {deadLevers.map((lever) => (
                <span key={lever.name} className="px-2 py-0.5 rounded bg-zinc-950 border border-amber-800/40 text-zinc-300 font-mono text-[10px]">
                  {lever.name}: {(lever.share * 100).toFixed(4)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reference Run & Boost Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div>
          <label className="text-xs text-zinc-500 font-mono uppercase block mb-1">Reference Run</label>
          <select
            value={selectedRunId}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none w-full font-mono cursor-pointer"
          >
            <option value="latest">Latest Farm Run</option>
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                T{r.tier} Wave {r.wave} ({r.battleDate || 'No Date'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-500 font-mono uppercase block mb-1">Target Lab Boost</label>
          <select
            value={labBoostSelect}
            onChange={(e) => setLabBoostSelect(parseFloat(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none w-full font-mono cursor-pointer"
          >
            <option value="1">1.0x (No Boost)</option>
            <option value="1.5">1.5x boost</option>
            <option value="2">2.0x boost</option>
            <option value="3">3.0x boost</option>
            <option value="4">4.0x boost</option>
            <option value="5">5.0x boost</option>
            <option value="6">6.0x boost</option>
            <option value="7">7.0x boost</option>
            <option value="8">8.0x boost</option>
          </select>
        </div>

        <div className="flex space-x-2 justify-end self-end">
          <button
            onClick={() => setCurrencyMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer transition-all ${
              currencyMode === 'split' 
                ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40' 
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Split (Score / Day)
          </button>
          <button
            onClick={() => setCurrencyMode('unified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer transition-all ${
              currencyMode === 'unified' 
                ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40' 
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Unified (Score / Coin)
          </button>
        </div>
      </div>

      {/* Unified Currency Slider */}
      {currencyMode === 'unified' && (
        <div className="p-4 bg-zinc-900/30 border border-zinc-800/60 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">Cell-to-Coin Shadow Price (Exchange Rate):</span>
            <span className="text-indigo-400 font-bold">{formatCompact(exchangeRateOverride)} coins / cell</span>
          </div>
          <input
            type="range"
            min="1000000"
            max="100000000"
            step="1000000"
            value={exchangeRateOverride}
            onChange={(e) => setExchangeRateOverride(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>1M (Low cells value)</span>
            <span>Default ratio: {formatCompact(defaultExchangeRate)}</span>
            <span>100M (High cells value)</span>
          </div>
        </div>
      )}

      {/* Category & Search Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Research Rankings ({filteredResearches.length})
            </h3>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search active research queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {LAB_CATEGORIES.map((cat) => {
            const count = cat.id === 'all' 
              ? scoredCatalog.length 
              : scoredCatalog.filter((r) => r.category === cat.id).length;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-500/40'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Research Rankings Table */}
      <div className="space-y-4">
        <div className="overflow-auto border border-zinc-800/80 rounded-xl glass-panel max-h-[60vh] scrollbar-gutter-stable">
          <table className="w-full text-left text-sm text-zinc-300 min-w-[950px]">
            <thead className="bg-zinc-900/95 backdrop-blur-sm text-zinc-400 text-xs font-mono uppercase border-b border-zinc-800 sticky top-0 z-10">
              {currencyMode === 'split' ? (
                <tr>
                  <th className="p-3">Research Name</th>
                  <th className="p-3">Delta (Δ)</th>
                  <th className="p-3">Channel Share</th>
                  <th className="p-3">Total Impact</th>
                  <th className="p-3">Coin Cost</th>
                  <th className="p-3">Days Pre-Boost</th>
                  <th className="p-3">Effective Days</th>
                  <th className="p-3">Boost Cell Cost</th>
                  <th className="p-3">Impact / Slot-Day</th>
                  <th className="p-3">Buyable?</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-3">Research Name</th>
                  <th className="p-3">Total Impact</th>
                  <th className="p-3">Coin Cost</th>
                  <th className="p-3">Boost Cell Cost</th>
                  <th className="p-3">Cell Cost Converted</th>
                  <th className="p-3">Unified Cost Equiv</th>
                  <th className="p-3">Impact / B Coins Equiv</th>
                  <th className="p-3">Buyable?</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/20">
              {(currencyMode === 'split' ? sortedResearches : unifiedResearches).map((item) => {
                const isBuyable = item.coinCost <= build.resources.coins;
                
                const activeTasks = tasks.filter((t) => t.status === 'active');
                const matchingTask = activeTasks.find(
                  (t) => t.type === 'research' && t.targetResearchId === item.id
                );
                const isTask = !!matchingTask;

                const togglePin = () => {
                  if (isTask && matchingTask) {
                    deleteTask(matchingTask.id);
                  } else {
                    addTask({
                      type: 'research',
                      name: `${item.name} to Lv.${item.targetLevel || item.level + 1}`,
                      targetResearchId: item.id,
                      targetLevel: item.targetLevel || item.level + 1,
                      notes: item.reason || `Target level: ${item.targetLevel || item.level + 1}`
                    });
                  }
                };

                // Split Mode Rows
                if (currencyMode === 'split') {
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-zinc-900/20 transition-all group ${
                        isTask ? 'bg-indigo-550/10 border-l-2 border-indigo-500/80' : ''
                      }`}
                    >
                      <td className="p-3 font-semibold text-white">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={togglePin}
                            className={`p-1 rounded transition-colors shrink-0 cursor-pointer ${
                              isTask 
                                ? 'text-indigo-400 hover:text-indigo-300' 
                                : 'text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 focus:opacity-100'
                            }`}
                            title={isTask ? "Remove from Goals" : "Pin as Goal"}
                          >
                            <Pin className={`w-3.5 h-3.5 ${isTask ? 'fill-indigo-500/20' : ''}`} />
                          </button>
                          <span className="truncate">{item.name}</span>
                          {item.isEstimated && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-500 font-mono uppercase">
                              Est
                            </span>
                          )}
                          {isTask && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/30 text-[9px] text-indigo-400 font-mono uppercase font-bold tracking-wider">
                              Goal
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase pl-7 block">{item.change}</span>
                      </td>
                      <td className="p-3 font-mono text-zinc-300">
                        {item.isEstimated ? 'N/A' : `+${(item.channelDelta * 100).toFixed(2)}%`}
                      </td>
                      <td className="p-3 font-mono text-zinc-300">
                        {item.isEstimated ? 'N/A' : `${(item.channelShare * 100).toFixed(2)}%`}
                      </td>
                      <td className="p-3 font-mono font-semibold text-indigo-400">
                        +{(item.totalImpact * 100).toFixed(3)}%
                      </td>
                      <td className="p-3 font-mono text-amber-500">{formatCompact(item.coinCost)}</td>
                      <td className="p-3 font-mono text-zinc-400">
                        {(item.baseTimeSeconds / 86400).toFixed(1)}d
                      </td>
                      <td className="p-3 font-mono font-semibold text-zinc-200">
                        {item.effectiveDays.toFixed(1)}d
                      </td>
                      <td className="p-3 font-mono text-purple-400">{formatCompact(item.boostCellCost)}</td>
                      <td className="p-3 font-mono font-bold text-white text-base">
                        {item.score.toFixed(4)}
                      </td>
                      <td className="p-3">
                        {isBuyable ? (
                          <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="text-xs text-rose-400 block font-mono">
                            {item.daysToAfford.toFixed(1)}d wait
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }

                // Unified Mode Rows
                const cellCostConverted = item.boostCellCost * exchangeRateOverride;
                const unifiedCost = item.coinCost + cellCostConverted;
                const unifiedScore = unifiedCost > 0 ? (item.totalImpact / (unifiedCost / 1e9)) : 0;

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-zinc-900/20 transition-all group ${
                      isTask ? 'bg-indigo-550/10 border-l-2 border-indigo-500/80' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={togglePin}
                          className={`p-1 rounded transition-colors shrink-0 cursor-pointer ${
                            isTask 
                              ? 'text-indigo-400 hover:text-indigo-300' 
                              : 'text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 focus:opacity-100'
                          }`}
                          title={isTask ? "Remove from Goals" : "Pin as Goal"}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isTask ? 'fill-indigo-500/20' : ''}`} />
                        </button>
                        <span className="truncate">{item.name}</span>
                        {item.isEstimated && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-500 font-mono uppercase">
                            Est
                          </span>
                        )}
                        {isTask && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/30 text-[9px] text-indigo-400 font-mono uppercase font-bold tracking-wider">
                            Goal
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono uppercase pl-7 block">{item.change}</span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-indigo-400">
                      +{(item.totalImpact * 100).toFixed(3)}%
                    </td>
                    <td className="p-3 font-mono text-amber-500">{formatCompact(item.coinCost)}</td>
                    <td className="p-3 font-mono text-purple-400">{formatCompact(item.boostCellCost)}</td>
                    <td className="p-3 font-mono text-zinc-400">{formatCompact(cellCostConverted)}</td>
                    <td className="p-3 font-mono font-semibold text-white">{formatCompact(unifiedCost)}</td>
                    <td className="p-3 font-mono font-bold text-indigo-400 text-base">
                      {unifiedScore.toFixed(4)}
                    </td>
                    <td className="p-3">
                      {isBuyable ? (
                        <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="text-xs text-rose-400 block font-mono">
                          {item.daysToAfford.toFixed(1)}d wait
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Estimate Overrides Form */}
      <div className="p-5 glass-panel rounded-xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">
          Estimate Flat & Unlock Researches
        </h3>
        <p className="text-xs text-zinc-400 leading-normal">
          Researches like Ban Perks or Waves Required have no report attribution path. Adjust your manually estimated total impacts below:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {build.researchCatalog.filter((r) => !r.effect || r.effect.kind === 'unlock' || r.id === 'waves_required' || r.id === 'ban_perks').map((research) => (
            <div key={research.id} className="flex justify-between items-center p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs">
              <span className="font-semibold text-zinc-200">{research.name}</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={research.estimatedImpact || 0}
                  placeholder="Impact (e.g. 0.05)"
                  onChange={(e) => updateResearchCatalog(research.id, { estimatedImpact: parseFloat(e.target.value) || 0.0 })}
                  className="bg-zinc-900 border border-zinc-850 rounded p-1 text-center font-mono w-24 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-zinc-500 font-mono">% Impact</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
