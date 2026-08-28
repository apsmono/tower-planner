import { useState } from 'react';
import { MASTER_LAB_CATALOG } from '../data/labCatalog';
import { getBaseLabTime, getLabCoinCost, calculateLabResearchSummary } from '../data/labLevelData';
import { 
  X, 
  FlaskConical, 
  Check, 
  Layers, 
  Zap,
} from 'lucide-react';
import { CurrencyIcon } from './CurrencyIcon';

interface ResearchItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  initialLevel: number;
  initialTargetLevel?: number;
  onSave: (labId: string, newLevel: number, targetLevel: number, assignedSlot: number | null) => void;
}

export function ResearchItemModal({
  isOpen,
  onClose,
  labId,
  initialLevel,
  initialTargetLevel,
  onSave,
}: ResearchItemModalProps) {
  const labDef = MASTER_LAB_CATALOG.find(l => l.id === labId);
  const maxLevel = labDef?.maxLevel || 100;

  const [currentLevel, setCurrentLevel] = useState<number>(initialLevel);
  const [targetLevel, setTargetLevel] = useState<number>(initialTargetLevel || Math.min(initialLevel + 5, maxLevel));
  const [assignedSlot, setAssignedSlot] = useState<number | null>(null);
  const [boostMultiplier, setBoostMultiplier] = useState<number>(2.0);

  if (!isOpen || !labDef) return null;

  // Format seconds into readable days/hours/minutes
  const formatTime = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return '0s';
    const effectiveSec = totalSeconds / boostMultiplier;
    const days = Math.floor(effectiveSec / 86400);
    const hours = Math.floor((effectiveSec % 86400) / 3600);
    const minutes = Math.floor((effectiveSec % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
    return parts.join(' ');
  };

  const formatCompactCoins = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  // Next level stats
  const nextLevelTime = getBaseLabTime(labId, currentLevel + 1);
  const nextLevelCost = getLabCoinCost(labId, currentLevel + 1);

  // Range stats (from current to target)
  const rangeStats = calculateLabResearchSummary({
    labId,
    startLevel: currentLevel,
    targetLevel,
    cellBoost: boostMultiplier,
  });

  const handleApply = () => {
    onSave(labId, currentLevel, targetLevel, assignedSlot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {labDef.name}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                  {labDef.category}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {labDef.description || 'Master lab research item.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Level Adjustments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Current Level */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Current Researched Level</span>
                <span className="font-mono font-bold text-emerald-400">Lvl {currentLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentLevel(prev => Math.max(0, prev - 1))}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  -1
                </button>
                <input
                  type="number"
                  min="0"
                  max={maxLevel}
                  value={currentLevel}
                  onChange={(e) => {
                    const val = Math.min(maxLevel, Math.max(0, Number(e.target.value)));
                    setCurrentLevel(val);
                    if (val > targetLevel) setTargetLevel(val);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-mono font-bold text-white text-xs"
                />
                <button
                  onClick={() => {
                    const val = Math.min(maxLevel, currentLevel + 1);
                    setCurrentLevel(val);
                    if (val > targetLevel) setTargetLevel(val);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  +1
                </button>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Min: 0</span>
                <span>Max: {maxLevel}</span>
              </div>
            </div>

            {/* Target Goal Level */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Target Queue Level</span>
                <span className="font-mono font-bold text-purple-400">Lvl {targetLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTargetLevel(prev => Math.max(currentLevel, prev - 1))}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  -1
                </button>
                <input
                  type="number"
                  min={currentLevel}
                  max={maxLevel}
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(Math.min(maxLevel, Math.max(currentLevel, Number(e.target.value))))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-mono font-bold text-white text-xs"
                />
                <button
                  onClick={() => setTargetLevel(prev => Math.min(maxLevel, prev + 1))}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  +1
                </button>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => setTargetLevel(Math.min(maxLevel, currentLevel + 5))}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                >
                  +5
                </button>
                <button
                  onClick={() => setTargetLevel(Math.min(maxLevel, currentLevel + 10))}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                >
                  +10
                </button>
                <button
                  onClick={() => setTargetLevel(maxLevel)}
                  className="text-[10px] px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300 hover:text-white"
                >
                  Max ({maxLevel})
                </button>
              </div>
            </div>

          </div>

          {/* Boost Speed Simulator */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Cell Speedup Boost
              </label>
              <span className="font-mono text-amber-400 font-bold">{boostMultiplier}x Speed</span>
            </div>
            <div className="flex items-center gap-2">
              {[1.0, 1.5, 2.0, 3.0, 4.0, 5.0].map((b) => (
                <button
                  key={b}
                  onClick={() => setBoostMultiplier(b)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    boostMultiplier === b
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {b}x
                </button>
              ))}
            </div>
          </div>

          {/* Next Level & Target Range Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 block">Next Single Level (Lvl {currentLevel + 1})</span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400">Duration:</span>
                <span className="text-white font-bold">{formatTime(nextLevelTime)}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400">Cost:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <CurrencyIcon currency="coins" size="xs" />
                  {formatCompactCoins(nextLevelCost)}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-purple-500/20 space-y-1.5">
              <span className="text-[11px] font-bold text-purple-300 block">
                Target Batch (Lvl {currentLevel} → {targetLevel})
              </span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400">Total Time:</span>
                <span className="text-purple-300 font-bold">{formatTime(rangeStats.totalEffectiveTimeSeconds)}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400">Total Cost:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <CurrencyIcon currency="coins" size="xs" />
                  {formatCompactCoins(rangeStats.totalEffectiveCoinCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Active Lab Slot Assignment */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Assign to Active Lab Slot
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAssignedSlot(null)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  assignedSlot === null
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Backlog Queue
              </button>
              {[1, 2, 3, 4, 5].map((slotNum) => (
                <button
                  key={slotNum}
                  onClick={() => setAssignedSlot(slotNum)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                    assignedSlot === slotNum
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Slot {slotNum}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Save Details
          </button>
        </div>

      </div>
    </div>
  );
}
