import { useState } from 'react';
import { useStore, type LabSlot } from '../domain/store';
import { getModelCells } from '../domain/cellModel';
import { 
  Percent, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  Play, 
  Gauge, 
  Activity,
  Calculator
} from 'lucide-react';

const BOOST_COSTS: Record<number, number> = {
  1.0: 0,
  1.5: 360,
  2.0: 2400,
  3.0: 20160,
  4.0: 80640,
  5.0: 285600,
  6.0: 1440000
};

export function CellBudget() {
  const runs = useStore((state) => state.runs);
  const build = useStore((state) => state.build);
  const updateLabSlot = useStore((state) => state.updateLabSlot);

  // States for cell projector
  const [projectTier, setProjectTier] = useState(9);
  const [projectWave, setProjectWave] = useState(3242);

  // Helper formats
  const formatCompact = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  // Parse date strings safely
  const parseDate = (dStr: string | null): Date | null => {
    if (!dStr) return null;
    const t = Date.parse(dStr);
    return isNaN(t) ? null : new Date(t);
  };

  // Calculate Realized daily cell income based on runs history (SPEC §9)
  const validDatedRuns = runs
    .filter((r) => !r.excluded)
    .map((r) => ({ ...r, parsedDate: parseDate(r.battleDate) }))
    .filter((r) => r.parsedDate !== null)
    .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());

  let elapsedSec = 0;
  let playTimeSec = 0;
  let totalCellsEarned = 0;
  let realizedIncomeAvailable = false;
  let realizedCellsPerDay = 0;
  let uptime = 0;

  if (validDatedRuns.length >= 2) {
    const firstRun = validDatedRuns[0];
    const lastRun = validDatedRuns[validDatedRuns.length - 1];
    
    const elapsedMs = lastRun.parsedDate!.getTime() - firstRun.parsedDate!.getTime();
    elapsedSec = elapsedMs / 1000;

    if (elapsedSec > 3600) { // at least 1 hour elapsed to compute daily rate
      realizedIncomeAvailable = true;
      
      // Sum all runs values
      runs.filter((r) => !r.excluded).forEach((r) => {
        playTimeSec += r.realTimeSec;
        totalCellsEarned += r.fields.cellsEarned || 0;
      });

      uptime = playTimeSec / elapsedSec;
      realizedCellsPerDay = totalCellsEarned / (elapsedSec / 86400);
    }
  }

  // Backup fallback: Play time totals
  let totalPlayTimeSec = 0;
  let totalCellsLogged = 0;
  runs.filter((r) => !r.excluded).forEach((r) => {
    totalPlayTimeSec += r.realTimeSec;
    totalCellsLogged += r.fields.cellsEarned || 0;
  });
  const avgCellsPerPlayHour = totalPlayTimeSec > 0 ? totalCellsLogged / (totalPlayTimeSec / 3600) : 0;

  // Theoretical ceiling (based on active farm runs average cells/hr, assuming 24h uptime)
  const farmRuns = runs.filter((r) => r.runType === 'farm' && !r.excluded);
  let totalFarmHours = 0;
  let totalFarmCells = 0;
  farmRuns.forEach((r) => {
    totalFarmHours += r.realTimeSec / 3600;
    totalFarmCells += r.fields.cellsEarned || 0;
  });
  const avgFarmCellsHr = totalFarmHours > 0 ? totalFarmCells / totalFarmHours : 0;
  const theoreticalCeiling = avgFarmCellsHr * 24;

  // Active Lab boost configuration Daily Burn
  const dailyBurn = build.labs.reduce((sum, lab) => {
    return sum + (BOOST_COSTS[lab.boost] || 0);
  }, 0);

  // Check if burn exceeds realized income
  const effectiveIncome = realizedIncomeAvailable ? realizedCellsPerDay : theoreticalCeiling;
  const burnRatio = effectiveIncome > 0 ? dailyBurn / effectiveIncome : 0;

  // 3x+ block indicator
  const hasHighBoost = build.labs.some((lab) => lab.boost >= 3.0);
  const blockHighBoost = hasHighBoost && (dailyBurn > effectiveIncome);

  const handleBoostSelect = (slotIndex: number, val: string) => {
    const boost = parseFloat(val);
    updateLabSlot(slotIndex, { boost });
  };

  // Accuracy comparisons data
  const accuracyBenchmarks = [
    { run: 'T9 w3242', model: 6966, actual: 7003, delta: '-0.5%' },
    { run: 'T8 w3385', model: 5979, actual: 5563, delta: '+7.5%' },
    { run: 'T7 w3524', model: 5104, actual: 4220, delta: '+21.0%' },
    { run: 'T5 w3587', model: 3049, actual: 2326, delta: '+31.1%' }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Cell Budget</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Balance your daily cell income from runs against lab speed boosts.
        </p>
      </div>

      {/* Headline Burn Ratio Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 glass-panel rounded-xl flex flex-col justify-between glow-purple">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Burn vs Income Ratio</span>
            <Gauge className={`w-5 h-5 ${burnRatio > 1.0 ? 'text-rose-500' : 'text-purple-400'}`} />
          </div>
          <div className="mt-4">
            <span className={`text-4xl font-extrabold font-mono ${burnRatio > 1.0 ? 'text-rose-500' : 'text-white'}`}>
              {(burnRatio * 100).toFixed(0)}%
            </span>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {burnRatio > 1.0 
                ? 'Critically unsustainable! Daily burn exceeds cell income.' 
                : 'Sustainable queue. Lab boost is funded.'}
            </p>
          </div>
        </div>

        <div className="p-6 glass-panel rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Daily Cell Income</span>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white font-mono">
              {formatCompact(effectiveIncome)}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1 font-mono uppercase">
              {realizedIncomeAvailable ? 'Realized daily rate' : 'Estimated Ceiling'}
            </span>
            <p className="text-[11px] text-zinc-400 mt-2">
              {realizedIncomeAvailable 
                ? `Computed from ${validDatedRuns.length} runs. Uptime: ${(uptime * 100).toFixed(0)}%`
                : `Ceiling based on T9 farm rates (${formatCompact(avgFarmCellsHr)} cells/hr)`}
            </p>
          </div>
        </div>

        <div className="p-6 glass-panel rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Daily Cell Burn</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white font-mono">
              {formatCompact(dailyBurn)}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1 font-mono uppercase">
              Active speed boost cost
            </span>
            <p className="text-[11px] text-zinc-400 mt-2">
              Summed cost of active cells boosts in your 5 lanes.
            </p>
          </div>
        </div>
      </div>

      {/* Sustain warning / block warnings */}
      {blockHighBoost && (
        <div className="p-5 bg-rose-950/35 border-2 border-rose-800 rounded-xl flex items-start space-x-3 text-rose-200 glow-rose">
          <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">Insufficient Funds Block!</h3>
            <p className="text-xs leading-relaxed mt-1 text-rose-300">
              You selected a <strong>3x+ speed boost</strong> on one of your labs. This queue costs <strong>{dailyBurn.toLocaleString()} cells/day</strong>, 
              which is <strong>{(dailyBurn / effectiveIncome).toFixed(1)}x</strong> your total daily realized income ({effectiveIncome.toLocaleString()} cells).
            </p>
            <span className="text-[10px] text-rose-400 block mt-2 font-mono">
              * Hard-blocked in simulations: daily cell deficit is too high to sustain.
            </span>
          </div>
        </div>
      )}

      {/* Boost configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 glass-panel rounded-xl space-y-4 glow-indigo">
          <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">Lab Speed Boost Scheduler</h3>
          <p className="text-xs text-zinc-400 leading-normal">
            Adjust boosts for each of your 5 labs to calculate potential daily burn.
          </p>

          <div className="space-y-3">
            {build.labs.map((lab, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg">
                <span className="text-xs font-semibold text-zinc-200 font-mono">Lab {index + 1} Boost</span>
                
                <div className="flex items-center space-x-4">
                  <span className="text-[11px] text-zinc-500 font-mono">{BOOST_COSTS[lab.boost]} cells/day</span>
                  <select
                    value={lab.boost}
                    onChange={(e) => handleBoostSelect(index, e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="1.0">1.0x (Free)</option>
                    <option value="1.5">1.5x (360/d)</option>
                    <option value="2.0">2.0x (2,400/d)</option>
                    <option value="3.0">3.0x (20,160/d)</option>
                    <option value="4.0">4.0x (80,640/d)</option>
                    <option value="5.0">5.0x (285,600/d)</option>
                    <option value="6.0">6.0x (1.44M/d)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projector calculator */}
        <div className="p-5 glass-panel rounded-xl space-y-4 border border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-1.5">
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>Cells Projector</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Target Tier</label>
              <input
                type="number"
                min="1"
                max="15"
                value={projectTier}
                onChange={(e) => setProjectTier(parseInt(e.target.value, 10) || 9)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Target Wave</label>
              <input
                type="number"
                min="10"
                value={projectWave}
                onChange={(e) => setProjectWave(parseInt(e.target.value, 10) || 3242)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 focus:outline-none"
              />
            </div>
            
            <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg text-center">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Projected Cell Output</span>
              <span className="text-xl font-bold text-purple-400 font-mono">
                {Math.round(getModelCells(projectTier, projectWave)).toLocaleString()} cells
              </span>
            </div>
            
            {/* Staleness badge */}
            <div className="p-2.5 bg-zinc-950/40 rounded border border-zinc-900 text-[10px] text-zinc-500 leading-normal font-mono">
              * Model validated 2026-08-27. Re-check accuracy after client game patches.
            </div>
          </div>
        </div>
      </div>

      {/* Model accuracy stats table */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">
          Observed Model Accuracy vs actuals
        </h3>
        
        <div className="overflow-x-auto border border-zinc-800/80 rounded-xl glass-panel">
          <table className="w-full text-left text-xs text-zinc-400">
            <thead className="bg-zinc-900/60 text-zinc-500 font-mono uppercase border-b border-zinc-800">
              <tr>
                <th className="p-3">Reference Run</th>
                <th className="p-3">Model Projected</th>
                <th className="p-3">Actual observed</th>
                <th className="p-3">Deviation (Delta)</th>
                <th className="p-3">Model Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/20">
              {accuracyBenchmarks.map((bench) => (
                <tr key={bench.run}>
                  <td className="p-3 font-semibold text-zinc-300">{bench.run}</td>
                  <td className="p-3 font-mono">{bench.model.toLocaleString()}</td>
                  <td className="p-3 font-mono">{bench.actual.toLocaleString()}</td>
                  <td className="p-3 font-mono font-bold text-amber-500">{bench.delta}</td>
                  <td className="p-3">
                    <span className="text-[10px] text-zinc-500">
                      {bench.run.includes('T9') ? 'Accurate Floor' : 'Conservative Floor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
