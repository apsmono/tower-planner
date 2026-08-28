import { useState, useMemo } from 'react';
import { MASTER_LAB_CATALOG, LAB_CATEGORIES, type LabCategory } from '../data/labCatalog';
import { 
  calculateLabResearchSummary, 
  formatLabDuration, 
  formatLabDurationDetailed 
} from '../data/labLevelData';
import { useStore, type ResearchEntry } from '../domain/store';
import { CurrencyIcon } from './CurrencyIcon';
import { 
  X, 
  Calculator, 
  Clock, 
  Zap, 
  Sparkles, 
  Sliders, 
  Plus, 
  Check, 
  Search,
  ExternalLink,
  Info
} from 'lucide-react';

interface LabCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLabId?: string;
}

export function LabCalculatorModal({ isOpen, onClose, initialLabId }: LabCalculatorModalProps) {
  const build = useStore((state) => state.build);
  const setLabSpeedSettings = useStore((state) => state.setLabSpeedSettings);
  const setDiscountSettings = useStore((state) => state.setDiscountSettings);
  const addResearchCatalogItem = useStore((state) => state.addResearchCatalogItem);
  const updateResearchCatalog = useStore((state) => state.updateResearchCatalog);

  // Selected Lab & Levels
  const [selectedLabId, setSelectedLabId] = useState<string>(initialLabId || 'wall_thorns');
  const [activeCategory, setActiveCategory] = useState<LabCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lab Definition
  const currentLab = useMemo(() => {
    return MASTER_LAB_CATALOG.find((l) => l.id === selectedLabId) || MASTER_LAB_CATALOG[0];
  }, [selectedLabId]);

  // Existing catalog entry if present
  const existingInCatalog = useMemo(() => {
    return build.researchCatalog.find((r) => r.id === selectedLabId);
  }, [build.researchCatalog, selectedLabId]);

  const [startLevel, setStartLevel] = useState<number>(existingInCatalog ? existingInCatalog.level : 12);
  const [targetLevel, setTargetLevel] = useState<number>(existingInCatalog ? (existingInCatalog.targetLevel || existingInCatalog.level + 1) : 13);

  // Multiplier / Factor Settings (initialized from build or defaults)
  const [labSpeedLevel, setLabSpeedLevel] = useState<number>(build.labSpeedLevel ?? 89);
  const [labSpeedRelicMult, setLabSpeedRelicMult] = useState<number>(build.labSpeedRelicMult ?? 1.02);
  const [cellBoost, setCellBoost] = useState<number>(2.0); // 2.0x cell boost default
  const [labCoinDiscountLevel, setLabCoinDiscountLevel] = useState<number>(build.labCoinDiscountLevel ?? 30);
  const [relicDiscountMult, setRelicDiscountMult] = useState<number>(1.0);

  // Filtered labs for picker
  const filteredLabs = useMemo(() => {
    return MASTER_LAB_CATALOG.filter((lab) => {
      if (activeCategory !== 'all' && lab.category !== activeCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return lab.name.toLowerCase().includes(q) || lab.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  // Sync state if initialLabId changes
  useMemo(() => {
    if (initialLabId) {
      setSelectedLabId(initialLabId);
      const inCat = build.researchCatalog.find((r) => r.id === initialLabId);
      if (inCat) {
        setStartLevel(inCat.level);
        setTargetLevel(inCat.targetLevel || inCat.level + 1);
      }
    }
  }, [initialLabId, build.researchCatalog]);

  // Calculation Results
  const summary = useMemo(() => {
    return calculateLabResearchSummary({
      labId: selectedLabId,
      startLevel: Math.max(0, startLevel),
      targetLevel: Math.max(startLevel + 1, Math.min(currentLab.maxLevel, targetLevel)),
      labSpeedLevel,
      labSpeedRelicMult,
      cellBoost,
      labCoinDiscountLevel,
      relicDiscountMult
    });
  }, [selectedLabId, startLevel, targetLevel, currentLab.maxLevel, labSpeedLevel, labSpeedRelicMult, cellBoost, labCoinDiscountLevel, relicDiscountMult]);

  // Format compact numbers
  const formatCompact = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const handleSyncToBuild = () => {
    setLabSpeedSettings(labSpeedLevel, labSpeedRelicMult);
    setDiscountSettings(labCoinDiscountLevel);
  };

  const handleAddToPlanner = () => {
    if (existingInCatalog) {
      updateResearchCatalog(selectedLabId, {
        level: startLevel,
        targetLevel: targetLevel,
        change: `Lv.${startLevel} → Lv.${targetLevel}`,
        coinCost: summary.totalEffectiveCoinCost,
        baseTimeSeconds: summary.totalBaseTimeSeconds
      });
    } else {
      const newEntry: ResearchEntry = {
        id: currentLab.id,
        name: currentLab.name,
        level: startLevel,
        change: `Lv.${startLevel} → Lv.${targetLevel}`,
        coinCost: summary.totalEffectiveCoinCost,
        baseTimeSeconds: summary.totalBaseTimeSeconds,
        targetLevel: targetLevel,
        effect: {
          channel: currentLab.defaultChannel || 'coins.global',
          from: 1.0,
          to: 1.05,
          kind: currentLab.defaultEffectKind || 'percent'
        },
        reason: currentLab.defaultReason
      };
      addResearchCatalogItem(newEntry);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-950 border border-indigo-500/40 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-zinc-200 glow-indigo">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Lab Level Lookup & Time Calculator</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-normal">
                  All Levels
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Calculate exact research durations and coin costs factored by Lab Speed, Relics, Cell Boosts, and Lab Discounts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Lab Selector & Level Range (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Select Research Item</span>
                  </label>
                  <a
                    href={currentLab.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Wiki</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Lab Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search 100+ master labs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1">
                  {LAB_CATEGORIES.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Lab Select Dropdown */}
                <select
                  value={selectedLabId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedLabId(newId);
                    const lab = MASTER_LAB_CATALOG.find((l) => l.id === newId);
                    if (lab) {
                      setStartLevel(Math.min(startLevel, lab.maxLevel - 1));
                      setTargetLevel(Math.min(targetLevel, lab.maxLevel));
                    }
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-100 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {filteredLabs.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name} (Max Lv.{lab.maxLevel})
                    </option>
                  ))}
                </select>

                <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/50">
                  {currentLab.description}
                </p>

                {/* Level Range Sliders */}
                <div className="pt-2 space-y-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-400">Level Progression:</span>
                    <span className="font-mono font-bold text-indigo-400">
                      Lv.{startLevel} → Lv.{targetLevel} (Max {currentLab.maxLevel})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 block mb-1">Starting Level</label>
                      <input
                        type="number"
                        min="0"
                        max={currentLab.maxLevel - 1}
                        value={startLevel}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(currentLab.maxLevel - 1, parseInt(e.target.value) || 0));
                          setStartLevel(val);
                          if (targetLevel <= val) setTargetLevel(val + 1);
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-center font-mono font-bold text-zinc-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 block mb-1">Target Level</label>
                      <input
                        type="number"
                        min={startLevel + 1}
                        max={currentLab.maxLevel}
                        value={targetLevel}
                        onChange={(e) => {
                          const val = Math.max(startLevel + 1, Math.min(currentLab.maxLevel, parseInt(e.target.value) || startLevel + 1));
                          setTargetLevel(val);
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-center font-mono font-bold text-indigo-400 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Multiplier & Discount Settings (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Your Lab Multipliers & Discounts</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSyncToBuild}
                    className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    title="Save to your player profile"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save to Build Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Lab Speed Level */}
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Lab Speed Level</span>
                      <span className="font-mono text-indigo-400 font-bold">Lv.{labSpeedLevel} (+{(labSpeedLevel * 2)}%)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="99"
                      value={labSpeedLevel}
                      onChange={(e) => setLabSpeedLevel(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Lv.0 (1.0x)</span>
                      <span>Lv.99 (2.98x)</span>
                    </div>
                  </div>

                  {/* Relic / Artifact Lab Speed Multiplier */}
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Artifact / Relic Mult</span>
                      <span className="font-mono text-indigo-400 font-bold">{labSpeedRelicMult.toFixed(2)}x</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1.00, 1.02, 1.04, 1.06, 1.08, 1.10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setLabSpeedRelicMult(val)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            labSpeedRelicMult === val
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {val === 1.0 ? 'None' : `${val.toFixed(2)}x`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cell Boost Speedup */}
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Slot Cell Boost</span>
                      <span className="font-mono text-purple-400 font-bold">{cellBoost.toFixed(1)}x Speed</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1.0, 1.5, 2.0, 3.0, 4.0, 5.0].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCellBoost(val)}
                          className={`flex-1 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            cellBoost === val
                              ? 'bg-purple-600 text-white font-bold shadow-xs'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {val.toFixed(1)}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lab Coin Discount Level */}
                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Lab Coin Discount</span>
                      <span className="font-mono text-amber-400 font-bold">Lv.{labCoinDiscountLevel} (-{(labCoinDiscountLevel * 0.5).toFixed(1)}%)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="99"
                      value={labCoinDiscountLevel}
                      onChange={(e) => setLabCoinDiscountLevel(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                      <span>Relic Discount:</span>
                      <div className="flex gap-1">
                        {[1.0, 0.98, 0.96, 0.95].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRelicDiscountMult(val)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer ${
                              relicDiscountMult === val
                                ? 'bg-amber-600 text-white font-bold'
                                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {val === 1.0 ? '0%' : `-${Math.round((1 - val) * 100)}%`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Speedup Formula Summary */}
                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <span>Combined Lab Speedup:</span>
                  </div>
                  <div className="text-right font-bold text-indigo-200">
                    <span>{summary.labSpeedMultiplier.toFixed(4)}x (Lab) × {cellBoost.toFixed(1)}x (Cells) = </span>
                    <span className="text-indigo-400 text-sm"> {summary.effectiveSpeedup.toFixed(2)}x faster</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border border-indigo-500/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">Calculation Output</span>
                <h3 className="text-lg font-bold text-white">
                  {currentLab.name}: Lv.{startLevel} → Lv.{targetLevel}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddToPlanner}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/25 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{existingInCatalog ? 'Update in Research Queue' : 'Add to Research Queue'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Effective Duration */}
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Effective Research Time</span>
                </span>
                <div className="text-2xl font-mono font-bold text-white tracking-tight">
                  {formatLabDuration(summary.totalEffectiveTimeSeconds)}
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  Base time: <span className="text-zinc-500 line-through">{formatLabDuration(summary.totalBaseTimeSeconds)}</span>
                  <span className="text-emerald-400 ml-1">({summary.effectiveSpeedup.toFixed(2)}x speedup)</span>
                </div>
              </div>

              {/* Effective Coin Cost */}
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <CurrencyIcon currency="coins" size="xs" />
                  <span>Discounted Coin Cost</span>
                </span>
                <div className="text-2xl font-mono font-bold text-amber-400 tracking-tight flex items-center gap-1.5">
                  <CurrencyIcon currency="coins" size="md" />
                  <span>{formatCompact(summary.totalEffectiveCoinCost)}</span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  Base cost: <span className="text-zinc-500 line-through">{formatCompact(summary.totalBaseCoinCost)}</span>
                  <span className="text-emerald-400 ml-1">(-{summary.coinDiscountPercent.toFixed(1)}% off)</span>
                </div>
              </div>

              {/* Exact Breakdown detail */}
              <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span>Detailed Time Breakdown</span>
                </span>
                <div className="text-xs text-zinc-300 font-mono pt-1 leading-relaxed">
                  {formatLabDurationDetailed(summary.totalEffectiveTimeSeconds)}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Coins: {summary.totalEffectiveCoinCost.toLocaleString()} coins
                </div>
              </div>
            </div>
          </div>

          {/* Level-by-level step table (if multiple or single level) */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider">
              Level-by-Level Step Breakdown ({summary.levels.length} {summary.levels.length === 1 ? 'level' : 'levels'})
            </h4>
            <div className="border border-zinc-800 rounded-xl overflow-hidden glass-panel max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono text-zinc-300">
                <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] sticky top-0 border-b border-zinc-800">
                  <tr>
                    <th className="p-2.5">Level Step</th>
                    <th className="p-2.5">Base Duration</th>
                    <th className="p-2.5">Effective Duration ({summary.effectiveSpeedup.toFixed(2)}x)</th>
                    <th className="p-2.5">Base Coins</th>
                    <th className="p-2.5">Effective Coins (-{summary.coinDiscountPercent.toFixed(1)}%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 bg-zinc-950/30">
                  {summary.levels.map((step) => (
                    <tr key={step.level} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="p-2.5 font-bold text-white">
                        Lv.{step.level - 1} → Lv.{step.level}
                      </td>
                      <td className="p-2.5 text-zinc-400">
                        {formatLabDuration(step.baseTimeSeconds)}
                      </td>
                      <td className="p-2.5 font-bold text-indigo-400">
                        {formatLabDuration(step.effectiveTimeSeconds)}
                      </td>
                      <td className="p-2.5 text-zinc-400">
                        {formatCompact(step.baseCoinCost)}
                      </td>
                      <td className="p-2.5 font-bold text-amber-400">
                        {formatCompact(step.effectiveCoinCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400">
            Calculated with official formulas for The Tower v24+
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
