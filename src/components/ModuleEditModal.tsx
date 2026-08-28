import { useState } from 'react';
import { 
  MASTER_MODULES_CATALOG, 
  MASTER_SUBSTATS_CATALOG, 
  MODULE_RARITIES,
  type ModuleSlot, 
  type ModuleRarity 
} from '../data/modulesCatalog';
import { 
  X, 
  Sparkles, 
  Lock, 
  Unlock, 
  Check, 
  Sliders,
  Layers
} from 'lucide-react';
import { CurrencyIcon } from './CurrencyIcon';

export interface EquippedModuleState {
  slot: ModuleSlot;
  moduleId: string;
  rarity: ModuleRarity;
  level: number;
  substats: {
    substatId: string;
    rarity: 'rare' | 'epic' | 'legendary' | 'mythic' | 'ancestral';
  }[];
  lockedSubstats: string[]; // substat IDs that are locked
}

interface ModuleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModule: EquippedModuleState;
  onSave: (updated: EquippedModuleState) => void;
}

export function ModuleEditModal({
  isOpen,
  onClose,
  initialModule,
  onSave,
}: ModuleEditModalProps) {
  const [moduleId, setModuleId] = useState(initialModule.moduleId);
  const [rarity, setRarity] = useState<ModuleRarity>(initialModule.rarity);
  const [level, setLevel] = useState(initialModule.level);
  const [substats, setSubstats] = useState(initialModule.substats);
  const [lockedSubstats, setLockedSubstats] = useState<string[]>(initialModule.lockedSubstats);

  if (!isOpen) return null;

  const slotModules = MASTER_MODULES_CATALOG.filter(m => m.slot === initialModule.slot);
  const slotSubstats = MASTER_SUBSTATS_CATALOG.filter(s => s.slot === initialModule.slot);
  const selectedRarityConfig = MODULE_RARITIES.find(r => r.id === rarity) || MODULE_RARITIES[1];
  const maxSlots = selectedRarityConfig.maxSubstats;

  const selectedModule = slotModules.find(m => m.id === moduleId) || slotModules[0];

  const handleSave = () => {
    onSave({
      slot: initialModule.slot,
      moduleId,
      rarity,
      level,
      substats: substats.slice(0, maxSlots),
      lockedSubstats,
    });
    onClose();
  };

  const toggleLock = (substatId: string) => {
    setLockedSubstats(prev => 
      prev.includes(substatId) ? prev.filter(id => id !== substatId) : [...prev, substatId]
    );
  };

  const updateSubstat = (index: number, substatId: string, subRarity: 'rare' | 'epic' | 'legendary' | 'mythic' | 'ancestral') => {
    const updated = [...substats];
    updated[index] = { substatId, rarity: subRarity };
    setSubstats(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${selectedModule.themeColor}20`, borderColor: `${selectedModule.themeColor}40`, borderWidth: 1 }}
            >
              <Layers className="w-5 h-5" style={{ color: selectedModule.themeColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Configure {initialModule.slot.toUpperCase()} Module
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300">
                  {selectedRarityConfig.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Adjust module archetype, upgrade level, and fine-tune substat slots.
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Module Unique Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Unique Module Item
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {slotModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setModuleId(mod.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    moduleId === mod.id
                      ? 'bg-slate-800/90 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-white text-xs">{mod.name}</span>
                  <span className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {mod.uniqueEffectDescription}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rarity & Level Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Rarity Tier</span>
                <span className="font-mono text-purple-400">{selectedRarityConfig.name}</span>
              </label>
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value as ModuleRarity)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-medium"
              >
                {MODULE_RARITIES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.maxSubstats} Substats)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  Module Level
                </label>
                <span className="font-mono font-bold text-emerald-400">Lvl {level} / 160</span>
              </div>
              <input
                type="range"
                min="1"
                max="160"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-3"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Lvl 1</span>
                <span>Lvl 80</span>
                <span>Lvl 160 (Max)</span>
              </div>
            </div>
          </div>

          {/* Substats Slots Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CurrencyIcon currency="reroll_shards" size="xs" />
                Substat Roll Slots ({Math.min(substats.length, maxSlots)}/{maxSlots} Available)
              </label>
              <span className="text-[11px] text-slate-400">
                Click lock icon to preserve lines during rerolls
              </span>
            </div>

            <div className="space-y-2">
              {Array.from({ length: maxSlots }).map((_, index) => {
                const current = substats[index] || { substatId: slotSubstats[index % slotSubstats.length].id, rarity: 'epic' };
                const isLocked = lockedSubstats.includes(current.substatId);
                const substatDef = slotSubstats.find(s => s.id === current.substatId) || slotSubstats[0];

                return (
                  <div
                    key={index}
                    className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <select
                        value={current.substatId}
                        onChange={(e) => updateSubstat(index, e.target.value, current.rarity)}
                        className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-medium focus:outline-none focus:border-purple-500"
                      >
                        {slotSubstats.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={current.rarity}
                        onChange={(e) => updateSubstat(index, current.substatId, e.target.value as any)}
                        className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-purple-300 text-xs font-semibold uppercase focus:outline-none focus:border-purple-500"
                      >
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                        <option value="mythic">Mythic</option>
                        <option value="ancestral">Ancestral</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-400 text-xs font-bold">
                        +{substatDef.values[current.rarity]}{substatDef.unit}
                      </span>

                      <button
                        onClick={() => toggleLock(current.substatId)}
                        className={`p-1.5 rounded-lg border transition ${
                          isLocked
                            ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title={isLocked ? 'Locked (Protected from rolls)' : 'Unlocked'}
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
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
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Apply Changes
          </button>
        </div>

      </div>
    </div>
  );
}
