import { useStore } from '../domain/store';
import { getModelCells } from '../domain/cellModel';
import { CurrencyIcon } from './CurrencyIcon';
import { 
  TrendingUp, 
  HelpCircle, 
  CheckCircle,
  XCircle,
  Layers
} from 'lucide-react';

import { getField } from '../domain/parser';

export function TierLab() {
  const runs = useStore((state) => state.runs);

  // Filter only farm runs that are not excluded
  const farmRuns = runs.filter(
    (r) => r.runType === 'farm' && !r.excluded
  );

  // Group by tier
  const tiersData: Record<number, {
    waves: number[];
    coinsHr: number[];
    cellsHr: number[];
    runLengths: number[];
  }> = {};

  farmRuns.forEach((run) => {
    const hours = run.realTimeSec / 3600;
    const coinsEarned = getField(run.fields, 'coinsEarned');
    const cellsEarned = getField(run.fields, 'cellsEarned');
    const coinsHr = hours > 0 ? (coinsEarned / run.dissonanceMultiplier) / hours : 0;
    const cellsHr = hours > 0 ? cellsEarned / hours : 0;

    if (!tiersData[run.tier]) {
      tiersData[run.tier] = { waves: [], coinsHr: [], cellsHr: [], runLengths: [] };
    }
    
    tiersData[run.tier].waves.push(run.wave);
    tiersData[run.tier].coinsHr.push(coinsHr);
    tiersData[run.tier].cellsHr.push(cellsHr);
    tiersData[run.tier].runLengths.push(run.realTimeSec);
  });

  // Calculate averages
  const tierStats = Object.keys(tiersData).map((tStr) => {
    const t = parseInt(tStr, 10);
    const data = tiersData[t];
    const n = data.waves.length;
    
    const meanWave = data.waves.reduce((a, b) => a + b, 0) / n;
    const meanCoinsHr = data.coinsHr.reduce((a, b) => a + b, 0) / n;
    const meanCellsHr = data.cellsHr.reduce((a, b) => a + b, 0) / n;
    const meanRunLength = data.runLengths.reduce((a, b) => a + b, 0) / n;

    return {
      tier: t,
      n,
      meanWave,
      meanCoinsHr,
      meanCellsHr,
      meanRunLength
    };
  }).sort((a, b) => a.tier - b.tier);

  // Suffix numbers helper
  const formatCompact = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(1);
  };

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Find baseline stats (using T9 as the reference benchmark from Spec)
  // Spec: baseline = T9 @ w3242. If player has no runs, fall back to seed baseline
  const t9Stats = tierStats.find((s) => s.tier === 9);
  const baselineWave = t9Stats ? t9Stats.meanWave : 3242;

  // Static break-evens from Spec/math
  const breakEvens = [
    { target: 'T10 vs T9', targetTier: 10, waveNeeded: 2930, ratio: '-9.6% depth budget' },
    { target: 'T11 vs T9', targetTier: 11, waveNeeded: 2658, ratio: '-18.0% depth budget' },
    { target: 'T9 vs T8', targetTier: 9, waveNeeded: 3046, ratio: 'T8 baseline is w3385 (+196 waves margin)' }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Tier Lab</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Compare farming performance across tiers. Tournament and excluded runs are omitted.
        </p>
      </div>

      {/* Decay vs cell discount rule banner */}
      <div className="glass-panel p-5 rounded-xl border border-indigo-900/40 bg-indigo-950/15 flex items-start space-x-4">
        <TrendingUp className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">The 10% Crossover Rule</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Each tier up grants a <strong>~10% discount</strong> on the wave count needed to drop the same amount of cells. 
            However, observed wave decay is typically only <strong>~4%</strong> per tier. 
            Therefore, <strong>always climb tiers</strong> until wave decay between adjacent tiers exceeds <strong>10%</strong>.
          </p>
        </div>
      </div>

      {/* Aggregated stats table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Farming Performance by Tier</span>
        </h3>
        
        {tierStats.length === 0 ? (
          <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
            No farm runs logged. Please import runs first.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-800/80 rounded-xl glass-panel">
            <table className="w-full text-left text-sm text-zinc-300 min-w-[650px]">
              <thead className="bg-zinc-900/60 text-zinc-400 text-xs font-mono uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Tier</th>
                  <th className="p-3 text-center">Runs (n)</th>
                  <th className="p-3">Mean Wave</th>
                  <th className="p-3">Observed Decay</th>
                  <th className="p-3">
                    <span className="inline-flex items-center gap-1">
                      <CurrencyIcon currency="coins" size="xs" />
                      <span>Coins / Hr</span>
                    </span>
                  </th>
                  <th className="p-3">
                    <span className="inline-flex items-center gap-1">
                      <CurrencyIcon currency="cells" size="xs" />
                      <span>Cells / Hr</span>
                    </span>
                  </th>
                  <th className="p-3">Run length</th>
                  <th className="p-3">Verdict / Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/20">
                {tierStats.map((stat, idx) => {
                  // Calculate decay compared to tier-1 if it exists in stats
                  const prevStat = tierStats[idx - 1];
                  let decayText = '-';
                  let isDecayExceeded = false;
                  
                  if (prevStat && prevStat.tier === stat.tier - 1) {
                    const decay = (prevStat.meanWave - stat.meanWave) / prevStat.meanWave;
                    decayText = `${(decay * 100).toFixed(1)}%`;
                    isDecayExceeded = decay >= 0.10;
                  }

                  // Recommendation logic
                  let recommendation = '';
                  let recColor = '';
                  let RecIcon = HelpCircle;

                  if (stat.tier <= 8) {
                    recommendation = 'Closed (Dominated by T9)';
                    recColor = 'text-zinc-500';
                    RecIcon = XCircle;
                  } else if (stat.tier === 9) {
                    recommendation = 'Current Farm Benchmark';
                    recColor = 'text-emerald-400';
                    RecIcon = CheckCircle;
                  } else if (isDecayExceeded) {
                    recommendation = 'Ceiling Found (Decay >= 10%)';
                    recColor = 'text-rose-400';
                    RecIcon = XCircle;
                  } else {
                    recommendation = 'Recommended to Climb';
                    recColor = 'text-indigo-400 font-semibold';
                    RecIcon = CheckCircle;
                  }

                  return (
                    <tr key={stat.tier} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="p-3 font-semibold text-white text-base">T{stat.tier}</td>
                      <td className="p-3 text-center font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          stat.n === 1 ? 'bg-amber-950/40 text-amber-500 border border-amber-800/30' : 'bg-zinc-900 text-zinc-300'
                        }`}>
                          {stat.n}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-semibold">{stat.meanWave.toFixed(0)}</td>
                      <td className={`p-3 font-mono ${isDecayExceeded ? 'text-rose-400 font-bold' : 'text-zinc-400'}`}>
                        {decayText}
                      </td>
                      <td className="p-3 text-amber-500 font-mono font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <CurrencyIcon currency="coins" size="xs" />
                          <span>{formatCompact(stat.meanCoinsHr)}</span>
                        </span>
                      </td>
                      <td className="p-3 text-purple-400 font-mono font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <CurrencyIcon currency="cells" size="xs" />
                          <span>{formatCompact(stat.meanCellsHr)}</span>
                        </span>
                      </td>
                      <td className="p-3 text-zinc-400 font-mono text-xs">{formatDuration(stat.meanRunLength)}</td>
                      <td className="p-3">
                        <div className={`flex items-center space-x-1.5 text-xs ${recColor}`}>
                          <RecIcon className="w-4 h-4 shrink-0" />
                          <span>{recommendation}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Break Even Depth Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model break-evens */}
        <div className="p-5 glass-panel rounded-xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">
            Model Break-Even Waves (vs T9)
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Calculated waves needed in target tiers to match the current <strong>T9 @ {baselineWave.toFixed(0)}</strong> wave baseline cell output:
          </p>
          <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/20">
            {breakEvens.map((be) => {
              // Calculate cells generated by baseline T9
              const baselineCells = getModelCells(9, baselineWave);
              // Find matching wave for target tier
              let waveTarget = be.waveNeeded;
              // Dynamically adjust if baseline wave differs from 3242
              if (Math.abs(baselineWave - 3242) > 10) {
                // simple search to find target wave
                let low = 1000;
                let high = 10000;
                for (let i = 0; i < 20; i++) {
                  const mid = (low + high) / 2;
                  const c = getModelCells(be.targetTier, mid);
                  if (c < baselineCells) {
                    low = mid;
                  } else {
                    high = mid;
                  }
                }
                waveTarget = Math.round((low + high) / 2);
              }

              return (
                <div key={be.target} className="flex justify-between items-center p-3 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-200 block">{be.target}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{be.ratio}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-mono font-semibold block">{waveTarget} waves</span>
                    <span className="text-[10px] text-purple-400 font-mono">
                      ≈ {formatCompact(baselineCells)} cells
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Closed decisions list */}
        <div className="p-5 glass-panel rounded-xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">
            Closed Tier Decisions
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs leading-relaxed text-zinc-400">
              <span className="font-semibold text-zinc-200 block mb-1">Tier 8 (Closed Decision)</span>
              A T8 run ending at wave 3385 loses <strong>10% coins</strong> and <strong>17–26% cells</strong> compared to T9. Suggesting T8 is dominated and closed.
            </div>
            <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs leading-relaxed text-zinc-400">
              <span className="font-semibold text-zinc-200 block mb-1">Tier 7 / Tier 5 (Discontinued)</span>
              Dominated. Cell efficiency is extremely low compared to the T9 benchmark (T5 cells count drops by &gt;60%). Omitted from active suggestions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
