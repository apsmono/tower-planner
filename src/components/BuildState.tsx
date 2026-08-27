import React, { useState } from 'react';
import { useStore, type UW, type Module, type LabSlot } from '../domain/store';
import { 
  Sliders, 
  Coins, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle,
  Database,
  Layers,
  Wrench,
  Sparkles,
  Clock
} from 'lucide-react';

export function BuildState() {
  const build = useStore((state) => state.build);
  const updateResources = useStore((state) => state.updateResources);
  const updateLabSlot = useStore((state) => state.updateLabSlot);
  const updateLabSpeedMultiplier = useStore((state) => state.updateLabSpeedMultiplier);
  const updateUW = useStore((state) => state.updateUW);
  const updateModule = useStore((state) => state.updateModule);
  const addVerificationFlag = useStore((state) => state.addVerificationFlag);
  const removeVerificationFlag = useStore((state) => state.removeVerificationFlag);
  const setVerificationFlags = useStore((state) => state.setVerificationFlags);

  const [activeSubTab, setActiveSubTab] = useState<'resources' | 'labs' | 'uws' | 'modules' | 'flags'>('resources');

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
        {(['resources', 'labs', 'uws', 'modules', 'flags'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-mono border-b-2 transition-all ${
              activeSubTab === tab 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Coins Balance</label>
                <input
                  type="number"
                  value={build.resources.coins}
                  onChange={(e) => handleResourceChange('coins', e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Cells Balance</label>
                <input
                  type="number"
                  value={build.resources.cells}
                  onChange={(e) => handleResourceChange('cells', e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Gems</label>
                <input
                  type="number"
                  value={build.resources.gems}
                  onChange={(e) => handleResourceChange('gems', e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Stones</label>
                <input
                  type="number"
                  value={build.resources.stones}
                  onChange={(e) => handleResourceChange('stones', e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded p-2 text-sm text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
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
                    <option value="1.0">1.0x (No Boost)</option>
                    <option value="1.5">1.5x Boost</option>
                    <option value="2.0">2.0x Boost</option>
                    <option value="3.0">3.0x Boost</option>
                    <option value="4.0">4.0x Boost</option>
                    <option value="5.0">5.0x Boost</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ultimate Weapons */}
      {activeSubTab === 'uws' && (
        <div className="p-5 glass-panel rounded-xl space-y-6 animate-fadeIn glow-indigo">
          <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Ultimate Weapons Status</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {build.ultimateWeapons.map((uw) => (
              <div key={uw.id} className="p-3.5 bg-zinc-950/40 border border-zinc-800/80 rounded-lg flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={uw.unlocked}
                    onChange={(e) => updateUW(uw.id, { unlocked: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className={`font-semibold ${uw.unlocked ? 'text-white' : 'text-zinc-500'}`}>{uw.name}</span>
                </div>
                {uw.unlocked && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-zinc-500 font-mono">Lv</span>
                    <input
                      type="number"
                      min="1"
                      value={uw.level}
                      onChange={(e) => updateUW(uw.id, { level: parseInt(e.target.value, 10) || 1 })}
                      className="w-16 bg-zinc-900 border border-zinc-800 rounded p-1 text-center font-mono text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
