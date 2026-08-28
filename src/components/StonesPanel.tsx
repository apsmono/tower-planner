import { useState } from 'react';
import { useStore, UW_CONFIGS, getStatLevels, type UWUpgradeStatConfig } from '../domain/store';
import { CurrencyIcon } from './CurrencyIcon';
import { 
  Sparkles, 
  Database, 
  Layers, 
  ExternalLink, 
  CheckCircle2 
} from 'lucide-react';

export const UW_POWER_STONE_MILESTONES = [
  { index: 1, label: '1st', cost: '5 stones', rawCost: 5 },
  { index: 2, label: '2nd', cost: '50', rawCost: 50 },
  { index: 3, label: '3rd', cost: '150', rawCost: 150 },
  { index: 4, label: '4th', cost: '300', rawCost: 300 },
  { index: 5, label: '5th', cost: '800', rawCost: 800 },
  { index: 6, label: '6th', cost: '1,250', rawCost: 1250 },
  { index: 7, label: '7th', cost: '1,750', rawCost: 1750 },
  { index: 8, label: '8th', cost: '2,400', rawCost: 2400 },
  { index: 9, label: '9th', cost: '3,000', rawCost: 3000 },
];

function UWStatLevelControl({
  statNumber,
  config,
  value,
  onChange
}: {
  statNumber: 1 | 2 | 3;
  config: UWUpgradeStatConfig;
  value: number;
  onChange: (val: number) => void;
}) {
  const levels = getStatLevels(config);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(value.toString());

  const exactIndex = levels.findIndex(l => Math.abs(l.value - value) < 0.001);
  const isCustom = exactIndex === -1;
  const currentLevel = !isCustom ? levels[exactIndex] : null;

  const handlePrevLevel = () => {
    if (exactIndex > 0) {
      onChange(levels[exactIndex - 1].value);
    } else if (isCustom && levels.length > 0) {
      const smaller = levels.slice().reverse().find(l => l.value < value);
      if (smaller) onChange(smaller.value);
      else onChange(levels[0].value);
    }
  };

  const handleNextLevel = () => {
    if (exactIndex !== -1 && exactIndex < levels.length - 1) {
      onChange(levels[exactIndex + 1].value);
    } else if (isCustom && levels.length > 0) {
      const larger = levels.find(l => l.value > value);
      if (larger) onChange(larger.value);
      else onChange(levels[levels.length - 1].value);
    }
  };

  return (
    <div className="p-3.5 bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700/80 transition-all rounded-lg space-y-2.5">
      <div className="flex justify-between items-center text-[11px] font-mono">
        <span className="font-semibold text-zinc-300 uppercase tracking-wide">
          {statNumber}. {config.label}
        </span>
        <div className="flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-md bg-indigo-950/90 text-indigo-200 font-bold border border-indigo-700/60 font-mono text-xs shadow-xs">
            {value}{config.unit}
          </span>
        </div>
      </div>

      {!showCustomInput ? (
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handlePrevLevel}
              disabled={exactIndex === 0}
              className="w-8 h-8 flex items-center justify-center rounded bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-mono font-bold text-sm shrink-0 cursor-pointer"
              title="Previous Level"
            >
              -
            </button>

            <select
              value={!isCustom && currentLevel ? currentLevel.level : 'custom'}
              onChange={(e) => {
                const selected = e.target.value;
                if (selected === 'custom') {
                  setShowCustomInput(true);
                  setCustomInputValue(value.toString());
                } else {
                  const targetLvl = parseInt(selected, 10);
                  const found = levels.find(l => l.level === targetLvl);
                  if (found) onChange(found.value);
                }
              }}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {levels.map((lvl) => (
                <option key={lvl.level} value={lvl.level}>
                  Lv.{lvl.level}: {lvl.value}{config.unit}
                </option>
              ))}
              {isCustom && <option value="custom">Custom ({value}{config.unit})</option>}
            </select>

            <button
              type="button"
              onClick={handleNextLevel}
              disabled={exactIndex !== -1 && exactIndex >= levels.length - 1}
              className="w-8 h-8 flex items-center justify-center rounded bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-mono font-bold text-sm shrink-0 cursor-pointer"
              title="Next Level"
            >
              +
            </button>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono px-0.5">
            <span>
              {exactIndex !== -1 ? `Level ${levels[exactIndex].level} / ${levels.length}` : 'Custom value'}
            </span>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(true);
                setCustomInputValue(value.toString());
              }}
              className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer text-[10px]"
            >
              Custom input
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <input
              type="number"
              step={config.unit === 's' || config.unit === 'm' || config.unit === '°' ? '1' : '0.1'}
              value={customInputValue}
              onChange={(e) => setCustomInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const num = parseFloat(customInputValue);
                  if (!isNaN(num)) onChange(num);
                  setShowCustomInput(false);
                }
              }}
              placeholder={`Enter ${config.label}`}
              className="flex-1 bg-zinc-950 border border-indigo-500/80 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                const num = parseFloat(customInputValue);
                if (!isNaN(num)) onChange(num);
                setShowCustomInput(false);
              }}
              className="px-2.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold cursor-pointer"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono block">
            Press Apply or Enter to save custom value.
          </span>
        </div>
      )}
    </div>
  );
}

export function StonesPanel() {
  const build = useStore((state) => state.build);
  const updateUW = useStore((state) => state.updateUW);

  const [uwFilter, setUwFilter] = useState<'all' | 'acquired' | 'locked'>('all');

  const formatSecondsToTime = (totalSeconds: number): string => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    if (min === 0) return `${sec}s`;
    if (sec === 0) return `${min}m`;
    return `${min}m ${sec}s`;
  };

  const unlockedCount = build.ultimateWeapons.filter(u => u.unlocked).length;
  const activeCount = build.ultimateWeapons.filter(u => u.unlocked && u.active).length;
  
  const gtUW = build.ultimateWeapons.find(u => u.id === 'gt');
  const bhUW = build.ultimateWeapons.find(u => u.id === 'bh');
  const gtCooldown = gtUW?.upgrades?.stat3 ?? UW_CONFIGS.gt.stat3.defaultVal;
  const bhCooldown = bhUW?.upgrades?.stat3 ?? UW_CONFIGS.bh.stat3.defaultVal;
  const isGtBhSynced = gtUW?.unlocked && bhUW?.unlocked && gtCooldown === bhCooldown;

  const stonesSpentOnUnlocks = UW_POWER_STONE_MILESTONES
    .filter(m => m.index <= unlockedCount)
    .reduce((sum, m) => sum + m.rawCost, 0);
  const currentStones = build.resources.stones || 0;
  const totalAcquiredStones = stonesSpentOnUnlocks + currentStones;

  const sortedUWs = [...build.ultimateWeapons].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return 0;
  });

  const filteredUWs = sortedUWs.filter(u => {
    if (uwFilter === 'acquired') return u.unlocked;
    if (uwFilter === 'locked') return !u.unlocked;
    return true;
  });

  const handleUpgradeChange = (uwId: string, statKey: 'stat1' | 'stat2' | 'stat3', val: number) => {
    const currUW = build.ultimateWeapons.find(u => u.id === uwId);
    const config = UW_CONFIGS[uwId];
    const currUpgrades = currUW?.upgrades || {
      stat1: config.stat1.defaultVal,
      stat2: config.stat2.defaultVal,
      stat3: config.stat3.defaultVal
    };
    updateUW(uwId, {
      upgrades: {
        ...currUpgrades,
        [statKey]: isNaN(val) ? 0 : val
      }
    });
  };

  const handleToggleUnlocked = (uwId: string, unlocked: boolean) => {
    const config = UW_CONFIGS[uwId];
    const currUW = build.ultimateWeapons.find(u => u.id === uwId);
    const upgrades = currUW?.upgrades || {
      stat1: config.stat1.defaultVal,
      stat2: config.stat2.defaultVal,
      stat3: config.stat3.defaultVal
    };
    updateUW(uwId, {
      unlocked,
      active: unlocked ? (currUW?.active ?? true) : false,
      upgrades
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header / Summary Bar */}
      <div className="p-5 glass-panel rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 glow-indigo">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
            <CurrencyIcon currency="stones" size="sm" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Power Stones & Ultimate Weapons
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-mono font-medium">
                {unlockedCount} / {build.ultimateWeapons.length} Acquired
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-medium">
                {activeCount} Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your acquired Ultimate Weapons, active run toggles, and exact Power Stone upgrades.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-zinc-950/80 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setUwFilter('all')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              uwFilter === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            All ({build.ultimateWeapons.length})
          </button>
          <button
            type="button"
            onClick={() => setUwFilter('acquired')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              uwFilter === 'acquired'
                ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Acquired ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setUwFilter('locked')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              uwFilter === 'locked'
                ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Locked ({build.ultimateWeapons.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Power Stone Economy Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
              Stones Total Spent
            </span>
            <span className="text-xl font-bold text-amber-400">
              {stonesSpentOnUnlocks.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 block font-sans">
              on {unlockedCount} UW unlocks
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
              Stones Rest (Inventory)
            </span>
            <span className="text-xl font-bold text-teal-400">
              {currentStones.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 block font-sans">
              available balance
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <CurrencyIcon currency="stones" size="sm" />
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
              Lifetime Stones Acquired
            </span>
            <span className="text-xl font-bold text-indigo-400">
              {totalAcquiredStones.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 block font-sans">
              spent + saved
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Power Stone Milestone Roadmap */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-3 font-mono">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Power Stone UW Milestone Progression</span>
          </span>
          <span className="text-[11px] text-indigo-400 font-semibold">
            {unlockedCount}/9 Unlocked
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center text-xs">
          {UW_POWER_STONE_MILESTONES.map((m) => {
            const isAcquired = m.index <= unlockedCount;
            const isNext = m.index === unlockedCount + 1;
            return (
              <div
                key={m.index}
                className={`p-2 rounded-lg border flex flex-col justify-between transition-all ${
                  isAcquired
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-xs'
                    : isNext
                    ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-200 ring-1 ring-indigo-500/40'
                    : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-500'
                }`}
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold">{m.label}</span>
                  {isAcquired && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
                <span className="font-bold my-1 text-xs">{m.cost}</span>
                <span className="text-[9px] text-zinc-500">
                  {isAcquired ? 'Owned' : isNext ? 'Next UW' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ultimate Weapons List */}
      <div className="space-y-4">
        {filteredUWs.map((uw) => {
          const config = UW_CONFIGS[uw.id];
          const upgrades = uw.upgrades || {
            stat1: config.stat1.defaultVal,
            stat2: config.stat2.defaultVal,
            stat3: config.stat3.defaultVal
          };

          const isGtOrBh = uw.id === 'gt' || uw.id === 'bh';

          return (
            <div 
              key={uw.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                uw.unlocked 
                  ? 'bg-zinc-900/60 border-zinc-700/80 shadow-md shadow-black/30' 
                  : 'bg-zinc-950/40 border-zinc-800/40 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center text-indigo-300 font-mono text-xs font-bold">
                    {config.shortName}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-white tracking-wide">
                        {config.name}
                      </h4>
                      {isGtOrBh && isGtBhSynced && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold animate-pulse">
                          GT+BH Synced ({formatSecondsToTime(gtCooldown)})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </div>

                {/* Status Toggles & Wiki */}
                <div className="flex items-center space-x-3 self-end sm:self-center font-mono text-xs">
                  <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={uw.unlocked}
                      onChange={(e) => handleToggleUnlocked(uw.id, e.target.checked)}
                      className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500/30 w-4 h-4"
                    />
                    <span className={uw.unlocked ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
                      {uw.unlocked ? 'Acquired' : 'Locked'}
                    </span>
                  </label>

                  {uw.unlocked && (
                    <label className="flex items-center space-x-1.5 cursor-pointer select-none pl-2 border-l border-zinc-800">
                      <input
                        type="checkbox"
                        checked={uw.active}
                        onChange={(e) => updateUW(uw.id, { active: e.target.checked })}
                        className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500/30 w-4 h-4"
                      />
                      <span className={uw.active ? 'text-zinc-200' : 'text-zinc-500'}>
                        Active in Run
                      </span>
                    </label>
                  )}

                  {config.wikiUrl && (
                    <a
                      href={config.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-zinc-500 hover:text-indigo-400 transition-colors"
                      title="Open Wiki Guide"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Upgrades Controls Grid */}
              {uw.unlocked ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                  <UWStatLevelControl
                    statNumber={1}
                    config={config.stat1}
                    value={upgrades.stat1}
                    onChange={(val) => handleUpgradeChange(uw.id, 'stat1', val)}
                  />
                  <UWStatLevelControl
                    statNumber={2}
                    config={config.stat2}
                    value={upgrades.stat2}
                    onChange={(val) => handleUpgradeChange(uw.id, 'stat2', val)}
                  />
                  <UWStatLevelControl
                    statNumber={3}
                    config={config.stat3}
                    value={upgrades.stat3}
                    onChange={(val) => handleUpgradeChange(uw.id, 'stat3', val)}
                  />
                </div>
              ) : (
                <div className="pt-3 text-center py-2 text-xs font-mono text-zinc-500">
                  Weapon locked. Check "Acquired" above to configure stone workshop levels.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
