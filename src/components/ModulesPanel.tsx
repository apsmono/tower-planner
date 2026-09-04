import { useState } from 'react';
import { 
  MASTER_MODULES_CATALOG, 
  MASTER_SUBSTATS_CATALOG, 
  MODULE_RARITIES,
  REROLL_SHARDS_COST_PER_ROLL,
  type ModuleSlot 
} from '../data/modulesCatalog';
import { 
  ModuleEditModal, 
  type EquippedModuleState 
} from './ModuleEditModal';
import { CurrencyIcon, CurrencyBadge } from './CurrencyIcon';
import { 
  Layers, 
  Sparkles, 
  Lock, 
  Edit3, 
  Shield, 
  Zap, 
  Cpu, 
  Crosshair,
  Calculator,
} from 'lucide-react';

export function ModulesPanel() {
  const [equippedModules, setEquippedModules] = useState<Record<ModuleSlot, EquippedModuleState>>({
    cannon: {
      slot: 'cannon',
      moduleId: 'death_penalty',
      rarity: 'ancestral',
      level: 110,
      substats: [
        { substatId: 'attack_speed', rarity: 'ancestral' },
        { substatId: 'crit_factor', rarity: 'ancestral' },
        { substatId: 'super_crit_chance', rarity: 'mythic' },
        { substatId: 'bounce_shot_targets', rarity: 'ancestral' },
        { substatId: 'attack_range', rarity: 'legendary' },
      ],
      lockedSubstats: ['attack_speed', 'crit_factor'],
    },
    armor: {
      slot: 'armor',
      moduleId: 'wormhole_redirector',
      rarity: 'ancestral',
      level: 105,
      substats: [
        { substatId: 'defense_percent', rarity: 'ancestral' },
        { substatId: 'health_regen', rarity: 'ancestral' },
        { substatId: 'wall_health', rarity: 'ancestral' },
        { substatId: 'wall_rebuild_time', rarity: 'mythic' },
        { substatId: 'thorns_damage', rarity: 'legendary' },
      ],
      lockedSubstats: ['defense_percent', 'health_regen', 'wall_health'],
    },
    generator: {
      slot: 'generator',
      moduleId: 'galaxy_compressor',
      rarity: 'ancestral',
      level: 115,
      substats: [
        { substatId: 'coins_per_kill', rarity: 'ancestral' },
        { substatId: 'package_chance', rarity: 'ancestral' },
        { substatId: 'package_max_recovery', rarity: 'ancestral' },
        { substatId: 'free_upgrade_chance', rarity: 'ancestral' },
        { substatId: 'enemy_level_skip', rarity: 'mythic' },
      ],
      lockedSubstats: ['coins_per_kill', 'package_chance'],
    },
    core: {
      slot: 'core',
      moduleId: 'multiverse_nexus',
      rarity: 'ancestral_5_star',
      level: 125,
      substats: [
        { substatId: 'gt_bonus', rarity: 'ancestral' },
        { substatId: 'bh_size', rarity: 'ancestral' },
        { substatId: 'sl_angle', rarity: 'ancestral' },
        { substatId: 'dw_damage', rarity: 'ancestral' },
        { substatId: 'cf_slow', rarity: 'mythic' },
      ],
      lockedSubstats: ['gt_bonus', 'bh_size', 'sl_angle'],
    },
  });

  // Modal State
  const [editingSlot, setEditingSlot] = useState<ModuleSlot | null>(null);

  const handleSaveModule = (updated: EquippedModuleState) => {
    setEquippedModules(prev => ({
      ...prev,
      [updated.slot]: updated,
    }));
  };

  const getSlotIcon = (slot: ModuleSlot) => {
    switch (slot) {
      case 'cannon': return <Crosshair className="w-5 h-5 text-rose-400" />;
      case 'armor': return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'generator': return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'core': return <Cpu className="w-5 h-5 text-amber-400" />;
    }
  };

  // Total Shards Calculation Helper
  const totalLockedLines = Object.values(equippedModules).reduce((acc, m) => acc + m.lockedSubstats.length, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Modules & Substat Planner
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                Ancestral ★★★★★
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Configure loadouts, calculate reroll shard costs, and plan ancestral substats.
            </p>
          </div>
        </div>

        {/* Currency Quick Badges */}
        <div className="flex items-center gap-2">
          <CurrencyBadge currency="reroll_shards" formattedValue="14,250" size="sm" />
          <CurrencyBadge currency="module_shards" formattedValue="85,400" size="sm" />
        </div>
      </div>

      {/* 4 Equipped Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(['cannon', 'armor', 'generator', 'core'] as ModuleSlot[]).map((slot) => {
          const modState = equippedModules[slot];
          const modDef = MASTER_MODULES_CATALOG.find(m => m.id === modState.moduleId) || MASTER_MODULES_CATALOG[0];
          const rarityConfig = MODULE_RARITIES.find(r => r.id === modState.rarity) || MODULE_RARITIES[1];
          const slotSubstatsDef = MASTER_SUBSTATS_CATALOG.filter(s => s.slot === slot);
          const currentCostPerRoll = REROLL_SHARDS_COST_PER_ROLL[modState.lockedSubstats.length] || 10;

          return (
            <div
              key={slot}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                {/* Slot Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                      {getSlotIcon(slot)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                          {slot} Slot
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${rarityConfig.color}`}>
                          {rarityConfig.name}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {modDef.name}
                      </h3>
                    </div>
                  </div>

                  {/* Level & Edit Button (Triggers Edit Modal) */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400">
                      Lvl {modState.level}
                    </span>
                    <button
                      onClick={() => setEditingSlot(slot)}
                      className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                      title="Edit module configuration (Opens Modal)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* Unique Effect Box */}
                <div className="my-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{modDef.uniqueEffectName}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {modDef.uniqueEffectDescription}
                  </p>
                </div>

                {/* Active Substat Lines */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
                    <span>Equipped Substats ({modState.substats.length})</span>
                    <span className="flex items-center gap-1">
                      <CurrencyIcon currency="reroll_shards" size="xs" />
                      <span className="font-mono text-purple-400">{currentCostPerRoll} / roll</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    {modState.substats.map((sub, idx) => {
                      const subDef = slotSubstatsDef.find(s => s.id === sub.substatId) || slotSubstatsDef[0];
                      const isLocked = modState.lockedSubstats.includes(sub.substatId);
                      const val = subDef ? subDef.values[sub.rarity] : 0;
                      const unit = subDef ? subDef.unit : '';

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                              sub.rarity === 'ancestral' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' :
                              sub.rarity === 'mythic' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                              'bg-amber-950 text-amber-300 border border-amber-500/30'
                            }`}>
                              {sub.rarity.substring(0, 3)}
                            </span>
                            <span className="text-slate-200 font-medium">{subDef ? subDef.name : sub.substatId}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400">
                              +{val}{unit}
                            </span>
                            {isLocked && (
                              <span title="Locked during rerolls">
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reroll Shards Economics & Probability Matrix */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Reroll Shard Cost Curve & Lock Efficiency</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Active Locks: <strong className="text-amber-400">{totalLockedLines}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(REROLL_SHARDS_COST_PER_ROLL).map(([locks, cost]) => (
            <div key={locks} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {locks} Locked {locks === '1' ? 'Line' : 'Lines'}
              </span>
              <div className="flex items-center justify-center gap-1 text-sm font-mono font-bold text-purple-300">
                <CurrencyIcon currency="reroll_shards" size="xs" />
                <span>{cost.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal (Opens when user clicks Edit on any slot card) */}
      {editingSlot && (
        <ModuleEditModal
          isOpen={!!editingSlot}
          onClose={() => setEditingSlot(null)}
          initialModule={equippedModules[editingSlot]}
          onSave={handleSaveModule}
        />
      )}

    </div>
  );
}
