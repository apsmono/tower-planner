import React, { useState } from 'react';
import { useStore, type LabSlot, UW_CONFIGS, getStatLevels, type UWUpgradeStatConfig } from '../domain/store';
import { CurrencyIcon } from './CurrencyIcon';
import { 
  Sliders, 
  AlertTriangle, 
  Database,
  Layers,
  Wrench,
  Sparkles,
  Clock,
  Trash2,
  CheckCircle,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const UW_POWER_STONE_MILESTONES = [
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
  onChange,
  formatSecondsToTime
}: {
  statNumber: 1 | 2 | 3;
  config: UWUpgradeStatConfig;
  value: number;
  onChange: (val: number) => void;
  formatSecondsToTime: (sec: number) => string;
}) {
  const levels = getStatLevels(config);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(value.toString());

  // Find matching exact level or closest
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
      {/* Top Header: Stat Title & Actual Value Pill */}
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

      {/* Level Selection Control */}
      {!showCustomInput ? (
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5">
            {/* Quick Decrement Stepper */}
            <button
              type="button"
              onClick={handlePrevLevel}
              disabled={exactIndex === 0}
              className="w-8 h-8 flex items-center justify-center rounded bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-mono font-bold text-sm shrink-0 cursor-pointer"
              title="Previous Level"
            >
              -
            </button>

            {/* Level Select Dropdown */}
            <select
              value={!isCustom ? value : '__custom__'}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setCustomInputValue(value.toString());
                  setShowCustomInput(true);
                } else {
                  onChange(parseFloat(e.target.value));
                }
              }}
              className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer truncate"
            >
              {levels.map((l) => (
                <option key={l.level} value={l.value}>
                  Lv.{l.level} — {l.value}{config.unit}{config.unit === 's' && statNumber === 3 ? ` (${formatSecondsToTime(l.value)})` : ''}{l.level === levels.length ? ' (Max)' : ''}
                </option>
              ))}
              {isCustom && (
                <option value="__custom__">
                  Custom — {value}{config.unit}
                </option>
              )}
            </select>

            {/* Quick Increment Stepper */}
            <button
              type="button"
              onClick={handleNextLevel}
              disabled={exactIndex === levels.length - 1}
              className="w-8 h-8 flex items-center justify-center rounded bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-mono font-bold text-sm shrink-0 cursor-pointer"
              title="Next Level"
            >
              +
            </button>
          </div>

          {/* Sub-info Line */}
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
            <span>
              {currentLevel ? (
                <>Level <strong className="text-zinc-200">{currentLevel.level}</strong> of {levels.length}</>
              ) : (
                <strong className="text-amber-400">Custom Value</strong>
              )}
            </span>
            <button
              type="button"
              onClick={() => {
                setCustomInputValue(value.toString());
                setShowCustomInput(true);
              }}
              className="text-zinc-500 hover:text-indigo-400 underline transition-colors cursor-pointer"
            >
              Direct edit
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <input
              type="number"
              step={Math.abs(config.step ?? 1)}
              value={customInputValue}
              onChange={(e) => {
                setCustomInputValue(e.target.value);
                const parsed = parseFloat(e.target.value);
                if (!isNaN(parsed)) onChange(parsed);
              }}
              className="flex-1 min-w-0 bg-zinc-950 border border-indigo-500/80 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none"
              placeholder={`Enter custom ${config.label}`}
            />
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-semibold transition-colors shrink-0 cursor-pointer"
            >
              Done
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Custom numeric value</span>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              ← Back to level selection
            </button>
          </div>
        </div>
      )}

      {/* Cooldown Interval Display */}
      {config.unit === 's' && statNumber === 3 && (
        <div className="pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-500">Cycle Frequency:</span>
          <span className="text-amber-300 font-semibold">{formatSecondsToTime(value)}</span>
        </div>
      )}
    </div>
  );
}

export function BuildState() {
  const build = useStore((state) => state.build);
  const updateResources = useStore((state) => state.updateResources);
  const updateLabSlot = useStore((state) => state.updateLabSlot);
  const updateLabSpeedMultiplier = useStore((state) => state.updateLabSpeedMultiplier);
  const updateUW = useStore((state) => state.updateUW);
  const updateModule = useStore((state) => state.updateModule);
  const addVerificationFlag = useStore((state) => state.addVerificationFlag);
  const removeVerificationFlag = useStore((state) => state.removeVerificationFlag);

  const tasks = useStore((state) => state.tasks);
  const addTask = useStore((state) => state.addTask);
  const deleteTask = useStore((state) => state.deleteTask);

  const [activeSubTab, setActiveSubTab] = useState<'resources' | 'labs' | 'uws' | 'modules' | 'flags' | 'goals'>('resources');
  const [uwFilter, setUwFilter] = useState<'all' | 'acquired' | 'locked'>('all');
  const [isWikiOpen, setIsWikiOpen] = useState<boolean>(true);

  const formatSecondsToTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Add Goal form state
  const [newGoalType, setNewGoalType] = useState<'research' | 'resource'>('research');
  const [newGoalResource, setNewGoalResource] = useState<'coins' | 'cells' | 'gems' | 'stones' | 'shards'>('stones');
  const [newGoalAmount, setNewGoalAmount] = useState<string>('');
  const [newGoalResearchId, setNewGoalResearchId] = useState<string>(build.researchCatalog[0]?.id || '');
  const [newGoalLevel, setNewGoalLevel] = useState<string>('');
  const [newGoalNotes, setNewGoalNotes] = useState<string>('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalType === 'resource') {
      const amount = parseInt(newGoalAmount, 10);
      if (!amount || amount <= 0) return;
      addTask({
        type: 'resource',
        name: `Save ${amount.toLocaleString()} ${newGoalResource.charAt(0).toUpperCase() + newGoalResource.slice(1)}`,
        targetResource: newGoalResource,
        targetAmount: amount,
        notes: newGoalNotes
      });
      setNewGoalAmount('');
      setNewGoalNotes('');
    } else {
      const catalogItem = build.researchCatalog.find(r => r.id === newGoalResearchId);
      const level = parseInt(newGoalLevel, 10);
      if (!catalogItem || !level || level <= 0) return;
      addTask({
        type: 'research',
        name: `${catalogItem.name} to Lv.${level}`,
        targetResearchId: newGoalResearchId,
        targetLevel: level,
        notes: newGoalNotes || `Target level: ${level}`
      });
      setNewGoalLevel('');
      setNewGoalNotes('');
    }
  };

  const handleResourceChange = (key: keyof typeof build.resources, val: string) => {
    const num = parseInt(val, 10) || 0;
    updateResources({ [key]: num });
  };

  const handleLabChange = (index: number, key: keyof LabSlot, val: any) => {
    let finalVal = val;
    if (key === 'level') finalVal = parseInt(val, 10) || 0;
    if (key === 'boost') finalVal = parseFloat(val) || 1.0;
    updateLabSlot(index, { [key]: finalVal });
  };

  // Pre-defined brackets / tiers
  const moduleTiers = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Ancestral'] as const;

  const flagOptions = [
    { id: 'golden_tower_bonus', name: 'Golden Tower Bonus (Logged x14.6 vs x15.4)', desc: 'Verify actual GT bonus magnitude on in-game detail screen.' },
    { id: 'wall_health_level', name: 'Wall Health Level Verification', desc: 'Wiki says various values, double check in-game health multipliers.' },
    { id: 'wall_unlock_cost', name: 'Wall Unlock Cost (500B in-game vs 500M wiki)', desc: 'Confirm unlock cost matches the massive 500B price tag.' }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Build State</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Configure your current in-game statistics, module levels, and research status.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-zinc-800 pb-px">
        {(['resources', 'labs', 'uws', 'modules', 'flags', 'goals'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-mono border-b-2 transition-all ${
              activeSubTab === tab 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab === 'uws' ? 'UWs' : tab}
          </button>
        ))}
      </div>

      {/* Resources & General */}
      {activeSubTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <div className="p-5 glass-panel rounded-xl space-y-4 glow-indigo">
            <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>In-Game Currencies</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mb-1 font-mono">
                  <CurrencyIcon currency="coins" size="xs" />
                  <span>Coins Balance</span>
                </label>
                <input
                  type="number"
                  value={build.resources.coins}
                  onChange={(e) => handleResourceChange('coins', e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-amber-400 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mb-1 font-mono">
                  <CurrencyIcon currency="cells" size="xs" />
                  <span>Cells Balance</span>
                </label>
                <input
                  type="number"
                  value={build.resources.cells}
                  onChange={(e) => handleResourceChange('cells', e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-purple-400 font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mb-1 font-mono">
                  <CurrencyIcon currency="gems" size="xs" />
                  <span>Gems</span>
                </label>
                <input
                  type="number"
                  value={build.resources.gems}
                  onChange={(e) => handleResourceChange('gems', e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-emerald-400 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mb-1 font-mono">
                  <CurrencyIcon currency="stones" size="xs" />
                  <span>Power Stones</span>
                </label>
                <input
                  type="number"
                  value={build.resources.stones}
                  onChange={(e) => handleResourceChange('stones', e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-teal-400 font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mb-1 font-mono">
                  <CurrencyIcon currency="shards" size="xs" />
                  <span>Reroll Shards</span>
                </label>
                <input
                  type="number"
                  value={build.resources.shards || 0}
                  onChange={(e) => handleResourceChange('shards', e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-purple-400 font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 block mb-1">Lab Speed Research Multiplier</label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                value={build.labSpeedMultiplier}
                onChange={(e) => updateLabSpeedMultiplier(parseFloat(e.target.value) || 1.0)}
                className="w-1/2 bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Gaps tracking panel */}
          <div className="p-5 glass-panel rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-indigo-400" />
              <span>Gaps & Warnings</span>
            </h3>
            
            <div className="space-y-3">
              {/* Thorns check */}
              <div className="p-3.5 bg-rose-950/15 border border-rose-900/30 rounded-lg text-xs flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-semibold text-rose-300 block">Wall Thorns Gap</span>
                  <p className="text-zinc-400 leading-normal mt-0.5">
                    Wall Thorns is currently below the recommended <strong>Lv.13–15</strong> baseline. 
                    <strong className="text-rose-400 block mt-1">Warning: The heat-up footgun is live below this baseline!</strong>
                  </p>
                </div>
              </div>

              {/* Regen check */}
              <div className="p-3.5 bg-amber-950/15 border border-amber-900/30 rounded-lg text-xs flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300 block">Wall Regen Gap</span>
                  <p className="text-zinc-400 leading-normal mt-0.5">
                    Wall Regen is currently Lv.7. Baseline recommends pushing to <strong>Lv.10+</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Labs Lanes configuration */}
      {activeSubTab === 'labs' && (
        <div className="p-5 glass-panel rounded-xl space-y-6 animate-fadeIn glow-indigo">
          <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Active Labs Scheduler (5 lanes)</span>
          </h3>

          <div className="space-y-4">
            {build.labs.map((lab, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-lg text-sm items-center">
                <div className="font-semibold text-zinc-300 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-mono flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span>Lab Lane {index + 1}</span>
                </div>
                
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Active Research ID</label>
                  <input
                    type="text"
                    value={lab.researchId || ''}
                    placeholder="Idle"
                    onChange={(e) => handleLabChange(index, 'researchId', e.target.value || null)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Level</label>
                  <input
                    type="number"
                    value={lab.level}
                    onChange={(e) => handleLabChange(index, 'level', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Cell Speed Boost</label>
                  <select
                    value={lab.boost}
                    onChange={(e) => handleLabChange(index, 'boost', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="1">1.0x (No Boost)</option>
                    <option value="1.5">1.5x Boost</option>
                    <option value="2">2.0x Boost</option>
                    <option value="3">3.0x Boost</option>
                    <option value="4">4.0x Boost</option>
                    <option value="5">5.0x Boost</option>
                    <option value="6">6.0x Boost</option>
                    <option value="7">7.0x Boost</option>
                    <option value="8">8.0x Boost</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ultimate Weapons */}
      {activeSubTab === 'uws' && (() => {
        const unlockedCount = build.ultimateWeapons.filter(u => u.unlocked).length;
        const activeCount = build.ultimateWeapons.filter(u => u.unlocked && u.active).length;
        
        const gtUW = build.ultimateWeapons.find(u => u.id === 'gt');
        const bhUW = build.ultimateWeapons.find(u => u.id === 'bh');
        const gtCooldown = gtUW?.upgrades?.stat3 ?? UW_CONFIGS.gt.stat3.defaultVal;
        const bhCooldown = bhUW?.upgrades?.stat3 ?? UW_CONFIGS.bh.stat3.defaultVal;
        const isGtBhSynced = gtUW?.unlocked && bhUW?.unlocked && gtCooldown === bhCooldown;

        // Calculate stone metrics
        const stonesSpentOnUnlocks = UW_POWER_STONE_MILESTONES
          .filter(m => m.index <= unlockedCount)
          .reduce((sum, m) => sum + m.rawCost, 0);
        const currentStones = build.resources.stones || 0;
        const totalAcquiredStones = stonesSpentOnUnlocks + currentStones;

        // Sort acquired UWs always at top
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

        const handleUpgradeChange = (uwId: string, statKey: 'stat1' | 'stat2' | 'stat3', val: string) => {
          const num = parseFloat(val);
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
              [statKey]: isNaN(num) ? 0 : num
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
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-semibold text-white tracking-wide">
                    Ultimate Weapons Armory
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-mono font-medium">
                    {unlockedCount} / {build.ultimateWeapons.length} Acquired
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-medium">
                    {activeCount} Active
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage acquired weapon statuses, active run toggles, and their 3 primary stone workshop upgrades.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center bg-zinc-950/80 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setUwFilter('all')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    uwFilter === 'all'
                      ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40 dark:shadow-black/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  All ({build.ultimateWeapons.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUwFilter('acquired')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    uwFilter === 'acquired'
                      ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40 dark:shadow-black/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Acquired ({unlockedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setUwFilter('locked')}
                  className={`px-3 py-1.5 rounded transition-all ${
                    uwFilter === 'locked'
                      ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40 dark:shadow-black/20'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Locked ({build.ultimateWeapons.length - unlockedCount})
                </button>
              </div>
            </div>

            {/* Power Stone Economy Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                    Stones Total Spent
                  </span>
                  <span className="text-base sm:text-lg font-bold text-amber-400">
                    {stonesSpentOnUnlocks.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500 block font-sans">
                    on {unlockedCount} UW unlocks
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                    Stones Rest (Inventory)
                  </span>
                  <span className="text-base sm:text-lg font-bold text-teal-400">
                    {currentStones.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500 block font-sans">
                    available balance
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                    Total Acquired Stones
                  </span>
                  <span className="text-base sm:text-lg font-bold text-emerald-400">
                    {totalAcquiredStones.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500 block font-sans">
                    lifetime stones earned
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Synergy Check Banner (GT + BH) */}
            {gtUW?.unlocked && bhUW?.unlocked && (
              <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
                isGtBhSynced 
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : 'bg-amber-950/20 border-amber-800/40 text-amber-300'
              }`}>
                {isGtBhSynced ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <span className="font-semibold text-sm block">
                    {isGtBhSynced
                      ? `Golden Tower & Black Hole Synchronized (${formatSecondsToTime(gtCooldown)})`
                      : 'Golden Tower & Black Hole Desynchronized!'}
                  </span>
                  <p className="text-zinc-400 leading-normal">
                    {isGtBhSynced ? (
                      <>GT and BH are activating at identical intervals ({gtCooldown}s). Coin multipliers stack multiplicatively inside the Black Hole for max yield.</>
                    ) : (
                      <>GT cooldown is <strong>{gtCooldown}s</strong> ({formatSecondsToTime(gtCooldown)}) while BH is <strong>{bhCooldown}s</strong> ({formatSecondsToTime(bhCooldown)}). Community golden rule: synchronize cooldowns to match simultaneously.</>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* UW List */}
            <div className="space-y-4">
              {filteredUWs.map((uw) => {
                const config = UW_CONFIGS[uw.id] || {
                  id: uw.id,
                  name: uw.name,
                  shortName: uw.id.toUpperCase(),
                  description: 'Ultimate Weapon upgrade stats.',
                  wikiUrl: `https://the-tower-idle-tower-defense.fandom.com/wiki/${encodeURIComponent(uw.name.replace(/\s+/g, '_'))}`,
                  themeColor: 'from-zinc-800/20 to-zinc-900/10 border-zinc-700/40 text-zinc-300',
                  stat1: { label: 'Stat 1', unit: '', defaultVal: 0, step: 1 },
                  stat2: { label: 'Stat 2', unit: '', defaultVal: 0, step: 1 },
                  stat3: { label: 'Stat 3', unit: '', defaultVal: 0, step: 1 }
                };

                const upgrades = uw.upgrades || {
                  stat1: config.stat1.defaultVal,
                  stat2: config.stat2.defaultVal,
                  stat3: config.stat3.defaultVal
                };

                const isAcquired = uw.unlocked;
                const isActive = uw.unlocked && (uw.active ?? true);

                return (
                  <div
                    key={uw.id}
                    className={`glass-panel rounded-xl border transition-all overflow-hidden ${
                      isAcquired
                        ? 'bg-zinc-950/50 border-zinc-800 shadow-md hover:border-zinc-700'
                        : 'bg-zinc-950/20 border-zinc-800/40 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {/* Top Row / Card Header */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/40 via-transparent to-transparent">
                      <div className="flex items-center space-x-3.5">
                        {/* Acquired Checkbox */}
                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={isAcquired}
                            onChange={(e) => handleToggleUnlocked(uw.id, e.target.checked)}
                            className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                            isAcquired ? 'text-indigo-300' : 'text-zinc-500 group-hover:text-zinc-300'
                          }`}>
                            {isAcquired ? 'Acquired' : 'Locked'}
                          </span>
                        </label>

                        <span className="text-zinc-700">|</span>

                        {/* Title & Badge */}
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border ${config.themeColor}`}>
                            {config.shortName}
                          </span>
                          <span className={`font-semibold text-sm sm:text-base ${isAcquired ? 'text-white' : 'text-zinc-400'}`}>
                            {uw.name}
                          </span>
                        </div>
                      </div>

                      {/* Right Action Controls */}
                      <div className="flex items-center space-x-3 self-end sm:self-auto">
                        {/* Active in Run Checkbox */}
                        {isAcquired && (
                          <label className="flex items-center space-x-2 cursor-pointer px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => updateUW(uw.id, { active: e.target.checked })}
                              className="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className={`text-xs font-mono ${isActive ? 'text-emerald-400 font-medium' : 'text-zinc-500'}`}>
                              {isActive ? 'Active in Run' : 'Disabled'}
                            </span>
                          </label>
                        )}

                        {/* Direct Wiki Link Button */}
                        <a
                          href={config.wikiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`View ${uw.name} Wiki Guide`}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-300 hover:border-indigo-800/60 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Wiki</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                        </a>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Description */}
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {config.description}
                      </p>

                      {/* 3 Main Upgrades */}
                      {isAcquired ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                          <UWStatLevelControl
                            statNumber={1}
                            config={config.stat1}
                            value={upgrades.stat1}
                            onChange={(val) => handleUpgradeChange(uw.id, 'stat1', val.toString())}
                            formatSecondsToTime={formatSecondsToTime}
                          />
                          <UWStatLevelControl
                            statNumber={2}
                            config={config.stat2}
                            value={upgrades.stat2}
                            onChange={(val) => handleUpgradeChange(uw.id, 'stat2', val.toString())}
                            formatSecondsToTime={formatSecondsToTime}
                          />
                          <UWStatLevelControl
                            statNumber={3}
                            config={config.stat3}
                            value={upgrades.stat3}
                            onChange={(val) => handleUpgradeChange(uw.id, 'stat3', val.toString())}
                            formatSecondsToTime={formatSecondsToTime}
                          />
                        </div>
                      ) : (
                        <div className="p-3.5 bg-zinc-900/30 border border-zinc-800/40 rounded-lg flex items-center justify-between">
                          <span className="text-xs text-zinc-500">
                            Weapon currently unacquired. Click to acquire and configure stone upgrades:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleUnlocked(uw.id, true)}
                            className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-xs font-semibold font-mono transition-colors"
                          >
                            + Acquire Weapon
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wiki Reference Section */}
            <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsWikiOpen(!isWikiOpen)}
                className="w-full p-4 flex items-center justify-between bg-zinc-950/60 hover:bg-zinc-900/40 transition-colors text-left"
              >
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-zinc-200 font-mono uppercase tracking-wider">
                    Wiki Knowledge Base & Strategy Reference
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-zinc-500">
                  <span>{isWikiOpen ? 'Collapse' : 'Expand Guide'}</span>
                  {isWikiOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isWikiOpen && (
                <div className="p-5 space-y-6 border-t border-zinc-800 bg-zinc-950/40 text-xs text-zinc-300 animate-fadeIn">
                  {/* Grid of Strategy Callouts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strategy 1: Holy Trinity Sync */}
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
                        <Zap className="w-4 h-4" />
                        <span>The "Holy Trinity" Synchronization (GT + BH + DW)</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">
                        Golden Tower, Black Hole, and Death Wave form the core economic engine. Their multipliers compound multiplicatively when triggered simultaneously.
                      </p>
                      <div className="p-2 bg-zinc-950 rounded border border-zinc-800 font-mono text-[11px] text-zinc-300">
                        Target Baseline Sync: <strong>3:20 (200s)</strong> cooldown across GT, BH, and DW.
                      </div>
                    </div>

                    {/* Strategy 2: Stone Economy */}
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                          <Database className="w-4 h-4" />
                          <span>Power Stone Milestone Costs</span>
                        </div>
                        {unlockedCount < 9 ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
                            Next ({UW_POWER_STONE_MILESTONES[unlockedCount]?.label}): {UW_POWER_STONE_MILESTONES[unlockedCount]?.rawCost.toLocaleString()} stones
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                            All UWs Unlocked (9/9)
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 leading-relaxed text-xs">
                        Power Stones are the rarest progression currency. Unlocking new UWs scales exponentially:
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                        {UW_POWER_STONE_MILESTONES.map((m) => {
                          const isNext = m.index === unlockedCount + 1;
                          const isUnlocked = m.index <= unlockedCount;
                          return (
                            <span
                              key={m.index}
                              className={`px-1.5 py-0.5 rounded transition-colors flex items-center justify-between ${
                                isNext
                                  ? 'text-emerald-300 font-bold bg-emerald-500/20 border border-emerald-500/40 shadow-xs'
                                  : isUnlocked
                                  ? 'text-zinc-500 line-through decoration-zinc-700'
                                  : 'text-zinc-400'
                              }`}
                              title={
                                isNext
                                  ? `Next UW unlock cost (${m.cost} stones)`
                                  : isUnlocked
                                  ? `Already unlocked (${m.label} UW)`
                                  : `Future unlock (${m.cost} stones)`
                              }
                            >
                              <span>{m.label}: {m.cost}</span>
                              {isNext && (
                                <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider ml-1 bg-emerald-400/20 px-1 rounded">
                                  Next
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Strategy 3: UW Plus */}
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2 text-purple-400 font-semibold">
                        <Sparkles className="w-4 h-4" />
                        <span>Ultimate Weapon Plus (UW+)</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">
                        Once all 9 Ultimate Weapons are unlocked, UW+ abilities become available:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-zinc-400 font-mono text-[11px]">
                        <li><strong>Golden Combo (GT):</strong> Incremental kill multiplier.</li>
                        <li><strong>Consume (BH):</strong> Deals % current wave HP.</li>
                        <li><strong>Cover Fire (SM):</strong> Launches passive missile salvos.</li>
                      </ul>
                    </div>

                    {/* Strategy 4: Cooldown Golden Rule */}
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2 text-rose-400 font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>The Cooldown Upgrade Warning</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">
                        <strong>Never upgrade GT or DW cooldown piecemeal</strong> if it breaks synchronization with Black Hole. Save enough Power Stones to drop down in a single synchronized tier leap.
                      </p>
                    </div>
                  </div>

                  {/* Quick Wiki Links Table / Grid */}
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2 font-semibold">
                      Direct Official Fandom Wiki References
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {Object.values(UW_CONFIGS).map((config) => (
                        <a
                          key={config.id}
                          href={config.wikiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-between text-xs font-mono text-zinc-300 transition-colors"
                        >
                          <span className="truncate">{config.name}</span>
                          <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0 ml-1 opacity-75" />
                        </a>
                      ))}
                      <a
                        href="https://the-tower-idle-tower-defense.fandom.com/wiki/Ultimate_Weapons"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-800/40 rounded-lg flex items-center justify-between text-xs font-mono text-indigo-300 transition-colors"
                      >
                        <span className="font-semibold truncate">All UWs Wiki</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modules */}
      {activeSubTab === 'modules' && (
        <div className="p-5 glass-panel rounded-xl space-y-6 animate-fadeIn glow-indigo">
          <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Modules Progression</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {build.modules.map((mod) => (
              <div key={mod.id} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white text-base">{mod.name} Module</span>
                  <select
                    value={mod.tier}
                    onChange={(e) => updateModule(mod.id, { tier: e.target.value as any })}
                    className="bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none"
                  >
                    {moduleTiers.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>
                
                <div className="p-3 bg-zinc-900/50 border border-zinc-800/40 rounded text-xs space-y-1.5">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Sub-Effects Plan</span>
                  <p className="text-zinc-400">
                    Active strategy: Reroll Common/Rare subs only, lock Epics.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Flags */}
      {activeSubTab === 'flags' && (
        <div className="p-5 glass-panel rounded-xl space-y-6 animate-fadeIn glow-indigo">
          <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Verification Checklist</span>
          </h3>

          <div className="space-y-4">
            {flagOptions.map((flag) => {
              const isChecked = build.verificationFlags.includes(flag.id);
              return (
                <label key={flag.id} className="flex items-start space-x-3 p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-lg cursor-pointer hover:bg-zinc-900/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        addVerificationFlag(flag.id);
                      } else {
                        removeVerificationFlag(flag.id);
                      }
                    }}
                    className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-rose-500 w-4 h-4 mt-0.5 shrink-0"
                  />
                  <div>
                    <span className={`font-semibold text-sm block ${isChecked ? 'text-rose-300' : 'text-zinc-300'}`}>
                      {flag.name}
                    </span>
                    <span className="text-xs text-zinc-500 leading-normal block mt-1">
                      {flag.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Goals Manager */}
      {activeSubTab === 'goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Add Goal Form */}
          <div className="lg:col-span-1 p-5 glass-panel rounded-xl border border-zinc-800 space-y-4 glow-indigo">
            <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Create Pinned Goal</span>
            </h3>

            <form onSubmit={handleAddGoal} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-500 block mb-1">Goal Type</label>
                <div className="flex space-x-2 bg-zinc-950 p-1 rounded border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setNewGoalType('research')}
                    className={`flex-1 py-1.5 rounded text-center transition-all ${
                      newGoalType === 'research' 
                        ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40 dark:shadow-black/20' 
                        : 'text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    Research
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGoalType('resource')}
                    className={`flex-1 py-1.5 rounded text-center transition-all ${
                      newGoalType === 'resource' 
                        ? 'bg-indigo-600 text-white font-semibold shadow shadow-indigo-500/40 dark:shadow-black/20' 
                        : 'text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    Resource
                  </button>
                </div>
              </div>

              {newGoalType === 'resource' ? (
                <>
                  <div>
                    <label className="text-zinc-500 block mb-1">Resource Currency</label>
                    <select
                      value={newGoalResource}
                      onChange={(e) => setNewGoalResource(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none"
                    >
                      <option value="coins">Coins</option>
                      <option value="cells">Cells</option>
                      <option value="gems">Gems</option>
                      <option value="stones">Stones</option>
                      <option value="shards">Shards</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1">Target Amount</label>
                    <input
                      type="number"
                      placeholder="e.g. 1250"
                      value={newGoalAmount}
                      onChange={(e) => setNewGoalAmount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-zinc-500 block mb-1">Research Project</label>
                    <select
                      value={newGoalResearchId}
                      onChange={(e) => setNewGoalResearchId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none"
                    >
                      {build.researchCatalog.map((res) => (
                        <option key={res.id} value={res.id}>
                          {res.name} (Lv.{res.level})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1">Target Level</label>
                    <input
                      type="number"
                      placeholder={`e.g. ${(build.researchCatalog.find(r => r.id === newGoalResearchId)?.level || 0) + 1}`}
                      value={newGoalLevel}
                      onChange={(e) => setNewGoalLevel(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-zinc-500 block mb-1">Notes / Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. unlock footgun baseline"
                  value={newGoalNotes}
                  onChange={(e) => setNewGoalNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-semibold py-2 rounded transition-colors"
              >
                Add Goal
              </button>
            </form>
          </div>

          {/* Goal List */}
          <div className="lg:col-span-2 p-5 glass-panel rounded-xl border border-zinc-800 space-y-6">
            <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              <span>Current Goals Checklist</span>
            </h3>

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  No goals found. Create a goal on the left or pin upgrades in the Upgrade Queue!
                </div>
              ) : (
                tasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  
                  // Calculate progress display details
                  let progressLabel = '';
                  let progressPercent = 0;
                  
                  if (task.type === 'resource' && task.targetResource && task.targetAmount) {
                    const current = build.resources[task.targetResource];
                    progressLabel = `${current.toLocaleString()} / ${task.targetAmount.toLocaleString()} ${task.targetResource}`;
                    progressPercent = Math.min(100, (current / task.targetAmount) * 100);
                  } else if (task.type === 'research' && task.targetResearchId && task.targetLevel) {
                    const research = build.researchCatalog.find(r => r.id === task.targetResearchId);
                    const current = research ? research.level : 0;
                    progressLabel = `Lv. ${current} / Lv. ${task.targetLevel}`;
                    progressPercent = Math.min(100, (current / task.targetLevel) * 100);
                  }

                  return (
                    <div 
                      key={task.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        isCompleted 
                          ? 'bg-emerald-950/10 border-emerald-900/30' 
                          : 'bg-zinc-950/40 border-zinc-800/80'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isCompleted ? 'bg-emerald-500/20 text-emerald-450' : 'bg-zinc-900 border border-zinc-800 text-zinc-550'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            )}
                          </div>
                          <div>
                            <span className={`font-semibold text-sm block ${isCompleted ? 'text-zinc-500 line-through font-normal' : 'text-zinc-200'}`}>
                              {task.name}
                            </span>
                            {task.notes && (
                              <span className="text-xs text-zinc-500 leading-normal block mt-0.5">
                                {task.notes}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-zinc-500 hover:text-rose-450 transition-colors p-1"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {!isCompleted && progressLabel && (
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-zinc-500">Goal Progress</span>
                            <span className="text-indigo-400 font-semibold">{progressLabel}</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
