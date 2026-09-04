import { useState } from 'react';
import { 
  X, 
  Sparkles, 
  RotateCcw, 
  FlaskConical, 
  Info,
  Swords,
  Shield,
  Star,
  Triangle
} from 'lucide-react';
import { 
  useStore, 
  calculateEffectiveDissonance, 
  computeDissonanceFromWave,
  type DissonanceTierConfig 
} from '../domain/store';

interface DissonanceDatabankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DissonanceDatabankModal({ isOpen, onClose }: DissonanceDatabankModalProps) {
  const dissonanceDatabank = useStore((state) => state.dissonanceDatabank);
  const setTierDissonance = useStore((state) => state.setTierDissonance);
  const setEchoPercent = useStore((state) => state.setEchoPercent);
  const setDissonanceLabLevel = useStore((state) => state.setDissonanceLabLevel);
  const resetDissonanceDatabank = useStore((state) => state.resetDissonanceDatabank);

  const [searchTier, setSearchTier] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  if (!isOpen) return null;

  const databank = dissonanceDatabank || {
    tiers: {},
    echoPercent: 0.5,
    dissonanceLabLevel: 0,
    labMultiplierBonusPerLevel: 0.01
  };

  const echoPct = databank.echoPercent ?? 0.5;
  const labLevel = databank.dissonanceLabLevel || 0;
  const labBonusPct = (labLevel * (databank.labMultiplierBonusPerLevel || 0.01) * 100).toFixed(1);

  // Generate list of 1..23 tiers
  const tierNumbers = Array.from({ length: 23 }, (_, i) => i + 1);

  const filteredTiers = tierNumbers.filter((t) => {
    const config = databank.tiers[t] || {
      tier: t,
      maxWave: 0,
      active: true
    };
    
    if (activeOnly && (!config.active || !config.maxWave)) return false;
    if (searchTier.trim()) {
      const q = searchTier.toLowerCase().replace('t', '');
      return t.toString().includes(q) || (config.notes && config.notes.toLowerCase().includes(searchTier.toLowerCase()));
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-750 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Dissonant Boosts Databank</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                  Wave Calculator
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Specify your highest milestone wave run per tier. Tower Planner automatically calculates the exact boost multiplier for imports.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Dissonant Echo & Lab Settings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dissonant Echo Banner */}
            <div className="p-4 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Dissonant Echo</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400">Bonus:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={echoPct}
                    onChange={(e) => setEchoPercent(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-center font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-xs text-purple-300 font-mono">%</span>
                </div>
              </div>

              {/* Echo 4 Category Pillars */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[
                  { label: 'Attack', icon: Swords, color: 'text-rose-400 bg-rose-950/40 border-rose-800/40' },
                  { label: 'Defense', icon: Shield, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40' },
                  { label: 'Coins', icon: Star, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
                  { label: 'Cells', icon: Triangle, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
                ].map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.label} className={`p-2 rounded-lg border text-center ${pillar.color}`}>
                      <Icon className="w-4 h-4 mx-auto mb-1 opacity-90" />
                      <div className="text-[10px] text-zinc-300 font-medium">{pillar.label}</div>
                      <div className="text-[11px] font-bold font-mono text-white mt-0.5">+{echoPct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dissonance Lab Amplifier */}
            <div className="p-4 bg-indigo-950/20 border border-indigo-800/40 rounded-xl space-y-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dissonance Amplifier Lab</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 text-[11px] font-mono font-bold border border-indigo-500/30">
                  +{labBonusPct}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Research Level: <strong className="text-white">Lv. {labLevel}</strong> / 50</span>
                  <span className="text-[11px] font-mono text-zinc-500">+1.0% / lvl</span>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="range"
                    min="0"
                    max="50"
                    value={labLevel}
                    onChange={(e) => setDissonanceLabLevel(parseInt(e.target.value, 10) || 0)}
                    className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={labLevel}
                    onChange={(e) => setDissonanceLabLevel(Math.max(0, Math.min(50, parseInt(e.target.value, 10) || 0)))}
                    className="w-14 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-center font-mono text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search tier (e.g. 4 or T4)..."
                value={searchTier}
                onChange={(e) => setSearchTier(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 placeholder-zinc-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activeOnly}
                  onChange={(e) => setActiveOnly(e.target.checked)}
                  className="rounded bg-zinc-800 border-zinc-700 text-purple-600 focus:ring-purple-500"
                />
                <span>Active wave runs only</span>
              </label>

              <button
                onClick={resetDissonanceDatabank}
                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Boosts per Tier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTiers.map((t) => {
              const tierConfig: DissonanceTierConfig = databank.tiers[t] || {
                tier: t,
                maxWave: 0,
                active: true
              };

              const waveVal = tierConfig.maxWave || 0;
              const rawBoost = computeDissonanceFromWave(waveVal, echoPct);
              const effectiveMult = calculateEffectiveDissonance(t, databank);
              const hasWaveRun = waveVal > 0;

              return (
                <div 
                  key={t}
                  className={`p-3.5 rounded-xl border transition-all ${
                    hasWaveRun
                      ? 'bg-purple-950/20 border-purple-500/40 glow-purple shadow-lg shadow-purple-950/20'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white font-mono">Tier {t}</span>
                      {hasWaveRun && (
                        <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-semibold">
                          Wave {waveVal.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-zinc-500 font-mono">Active</span>
                      <input
                        type="checkbox"
                        checked={tierConfig.active}
                        onChange={(e) => setTierDissonance(t, { active: e.target.checked })}
                        className="rounded bg-zinc-800 border-zinc-700 text-purple-500 focus:ring-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Max Wave Input */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Milestone Wave:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="20000"
                          placeholder="0 (None)"
                          value={tierConfig.maxWave || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setTierDissonance(t, { maxWave: isNaN(val) ? 0 : Math.max(0, val) });
                          }}
                          className="w-24 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded px-2 py-0.5 text-xs text-right font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Calculated Boost */}
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800/60">
                      <span className="text-zinc-400">Calculated Boost:</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${hasWaveRun ? 'text-purple-300' : 'text-zinc-400'}`}>
                          x{rawBoost.toFixed(2)}
                        </span>
                        {labLevel > 0 && (
                          <span className="text-[10px] font-mono text-indigo-400" title={`Effective with lab: x${effectiveMult.toFixed(2)}`}>
                            (x{effectiveMult.toFixed(2)} w/ lab)
                          </span>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Optional notes..."
                      value={tierConfig.notes || ''}
                      onChange={(e) => setTierDissonance(t, { notes: e.target.value })}
                      className="w-full bg-zinc-950/60 border border-zinc-850 rounded px-2 py-1 text-[11px] text-zinc-400 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
            <Info className="w-3.5 h-3.5 text-zinc-500" />
            <span>Multipliers automatically compute from Milestone Wave: <code className="text-purple-300 font-mono">1 + (Wave / 4000) + Echo</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
