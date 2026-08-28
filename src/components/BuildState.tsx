import { useState } from 'react';
import { useStore, type LabSlot } from '../domain/store';
import { CurrencyIcon } from './CurrencyIcon';
import { StonesPanel } from './StonesPanel';
import { CardsPanel } from './CardsPanel';
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
  CheckCircle2 
} from 'lucide-react';

type SubTabId = 'resources' | 'labs' | 'stones' | 'cards' | 'modules' | 'flags' | 'goals';

const SUB_TABS: { id: SubTabId; label: string }[] = [
  { id: 'resources', label: 'Resources' },
  { id: 'labs', label: 'Labs' },
  { id: 'stones', label: 'Stones & UWs' },
  { id: 'cards', label: 'Cards' },
  { id: 'modules', label: 'Modules' },
  { id: 'flags', label: 'Flags' },
  { id: 'goals', label: 'Goals' },
];

export function BuildState() {
  const build = useStore((state) => state.build);
  const updateResources = useStore((state) => state.updateResources);
  const updateLabSlot = useStore((state) => state.updateLabSlot);
  const updateLabSpeedMultiplier = useStore((state) => state.updateLabSpeedMultiplier);
  const updateModule = useStore((state) => state.updateModule);
  const addVerificationFlag = useStore((state) => state.addVerificationFlag);
  const removeVerificationFlag = useStore((state) => state.removeVerificationFlag);

  const tasks = useStore((state) => state.tasks);
  const addTask = useStore((state) => state.addTask);
  const deleteTask = useStore((state) => state.deleteTask);

  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('resources');

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Build State</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Configure your current in-game statistics, module levels, and research status.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-2 border-b border-zinc-800 pb-px overflow-x-auto">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === tab.id 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
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
              <div key={index} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    #{index + 1}
                  </span>
                  <select
                    value={lab.researchId || ''}
                    onChange={(e) => handleLabChange(index, 'researchId', e.target.value || null)}
                    className="bg-zinc-900 border border-zinc-700/80 rounded p-2 text-sm text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none min-w-[200px]"
                  >
                    <option value="">-- Unassigned / Idle --</option>
                    {build.researchCatalog.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Lv.{r.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-mono block">Level</label>
                    <input
                      type="number"
                      min="1"
                      value={lab.level}
                      onChange={(e) => handleLabChange(index, 'level', e.target.value)}
                      className="w-16 bg-zinc-900 border border-zinc-700/80 rounded p-1.5 text-xs text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 font-mono block">Speed Boost</label>
                    <select
                      value={lab.boost}
                      onChange={(e) => handleLabChange(index, 'boost', e.target.value)}
                      className="bg-zinc-900 border border-zinc-700/80 rounded p-1.5 text-xs text-purple-300 font-mono focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="1">1.0x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2.0x</option>
                      <option value="3">3.0x</option>
                      <option value="4">4.0x</option>
                      <option value="5">5.0x</option>
                      <option value="6">6.0x</option>
                      <option value="7">7.0x</option>
                      <option value="8">8.0x</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stones & Ultimate Weapons Panel */}
      {activeSubTab === 'stones' && (
        <StonesPanel />
      )}

      {/* Cards & Slots Panel */}
      {activeSubTab === 'cards' && (
        <CardsPanel />
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
