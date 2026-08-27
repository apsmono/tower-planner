import { useState } from 'react';
import { useStore, type ResearchEntry, type Run } from '../domain/store';
import { 
  ListOrdered, 
  HelpCircle, 
  AlertTriangle, 
  Check, 
  Coins, 
  Activity, 
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';

export function UpgradeQueue() {
  const runs = useStore((state) => state.runs);
  const build = useStore((state) => state.build);
  const updateResearchCatalog = useStore((state) => state.updateResearchCatalog);

  // States
  const [currencyMode, setCurrencyMode] = useState<'split' | 'unified'>('split');
  const [selectedRunId, setSelectedRunId] = useState<string>('latest');
  const [labBoostSelect, setLabBoostSelect] = useState<number>(2.0); // Default 2.0x boost for queue calculations
  
  // Custom Unified conversion rate (coins per cell)
  // Default is computed from runs, otherwise fallback
  const farmRuns = runs.filter((r) => r.runType === 'farm' && !r.excluded);
  let totalCoins = 0;
  let totalCells = 0;
  farmRuns.forEach((r) => {
    totalCoins += r.fields.coinsEarned;
    totalCells += r.fields.cellsEarned;
  });
  
  const defaultExchangeRate = totalCells > 0 ? totalCoins / totalCells : 23000000; // 23M coins per cell
  const [exchangeRateOverride, setExchangeRateOverride] = useState<number>(defaultExchangeRate);

  // Map effect channel to report field key
  const CHANNEL_FIELDS: Record<string, string> = {
    'coins.goldenTower': 'coinsFromGoldenTower',
    'coins.blackHole': 'coinsFromBlackhole',
    'coins.deathWave': 'coinsFromDeathWave',
    'coins.spotlight': 'coinsFromSpotlight',
    'coins.orbs': 'coinsFromOrbs',
    'coins.coinUpgrade': 'coinsFromCoinUpgrade',
    'coins.coinBonuses': 'coinsFromCoinBonuses',
    'cells.deathWave': 'cellsFromDeathWave',
    'cells.global': 'cellsFromGlobal',
    'damage.projectiles': 'projectilesDamage',
    'damage.smartMissile': 'smartMissileDamage',
    'damage.chainLightning': 'chainLightningDamage',
    'damage.deathWave': 'deathWaveDamage'
  };

  // Helper formatters
  const formatCompact = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  // Select reference run
  let referenceRun: Run | null = null;
  if (selectedRunId === 'latest' && farmRuns.length > 0) {
    // get latest farm run
    referenceRun = farmRuns[farmRuns.length - 1];
  } else if (selectedRunId !== 'latest') {
    referenceRun = runs.find((r) => r.id === selectedRunId) || null;
  }

  // Calculate daily coins speed (to compute days-to-afford)
  let totalRealTimeSec = 0;
  farmRuns.forEach((r) => {
    totalRealTimeSec += r.realTimeSec;
  });
  const coinsPerSec = totalRealTimeSec > 0 ? totalCoins / totalRealTimeSec : 0;
  const coinsPerDay = coinsPerSec * 86400;

  // Calculate score for each candidate research
  const scoredCatalog = build.researchCatalog.map((research) => {
    let channelDelta = 0;
    let channelShare = 0;
    let totalImpact = 0;
    let isEstimated = false;

    const effect = research.effect;
    
    if (effect) {
      // Calculate delta
      if (effect.kind === 'multiplier') {
        channelDelta = (effect.to / effect.from) - 1;
      } else if (effect.kind === 'percent') {
        channelDelta = (effect.to - effect.from) / 100;
      } else if (effect.kind === 'flat') {
        channelDelta = (effect.to - effect.from) / effect.from;
      } else if (effect.kind === 'unlock') {
        channelDelta = 0; // Handled below by estimatedImpact
      }

      // Calculate share
      const fieldName = CHANNEL_FIELDS[effect.channel];
      if (fieldName && referenceRun) {
        const isCoin = effect.channel.startsWith('coins.');
        const isDamage = effect.channel.startsWith('damage.');
        const isCell = effect.channel.startsWith('cells.');
        
        if (isCoin && referenceRun.fields.coinsEarned > 0) {
          channelShare = (referenceRun.fields[fieldName] || 0) / referenceRun.fields.coinsEarned;
        } else if (isDamage && referenceRun.fields.damageDealt > 0) {
          channelShare = (referenceRun.fields[fieldName] || 0) / referenceRun.fields.damageDealt;
        } else if (isCell && referenceRun.fields.cellsEarned > 0) {
          channelShare = (referenceRun.fields[fieldName] || 0) / referenceRun.fields.cellsEarned;
        } else {
          channelShare = 0.0;
        }
        totalImpact = channelDelta * channelShare;
      } else if (effect.channel === 'coins.global' || effect.channel === 'cells.global') {
        channelShare = 1.0;
        totalImpact = channelDelta; // global multipliers apply to everything
      } else {
        // No matching field key, treat as estimate
        isEstimated = true;
        totalImpact = research.estimatedImpact || 0.0;
      }
    } else {
      isEstimated = true;
      totalImpact = research.estimatedImpact || 0.0;
    }

    // Effective days = baseTimeSeconds / (labSpeedMult * boost) / 86400
    const labSpeedMult = build.labSpeedMultiplier || 1.0;
    const effectiveDays = (research.baseTimeSeconds / (labSpeedMult * labBoostSelect)) / 86400;

    // Score = totalImpact / effectiveDays
    const score = effectiveDays > 0 ? (totalImpact / effectiveDays) * 100 : 0; // scaled by 100 for visibility

    // Cell Boost daily cost
    const boostCostPerDay = labBoostSelect === 1.5 ? 360 : labBoostSelect === 2.0 ? 2400 : labBoostSelect === 3.0 ? 20160 : labBoostSelect === 4.0 ? 80640 : labBoostSelect === 5.0 ? 285600 : labBoostSelect === 6.0 ? 1440000 : 0;
    const boostCellCost = boostCostPerDay * effectiveDays;

    // Days to afford
    const coinBalance = build.resources.coins;
    let daysToAfford = 0;
    if (research.coinCost > coinBalance && coinsPerDay > 0) {
      daysToAfford = (research.coinCost - coinBalance) / coinsPerDay;
    }

    return {
      ...research,
      channelDelta,
      channelShare,
      totalImpact,
      effectiveDays,
      boostCellCost,
      score,
      daysToAfford,
      isEstimated
    };
  });

  // Split calculations
  // Coin researches: scoredCatalog
  const sortedResearches = [...scoredCatalog].sort((a, b) => b.score - a.score);

  // Dead Levers Callout Finder
  const deadLevers: { name: string; share: number }[] = [];
  if (referenceRun) {
    const damageAttributions = [
      { name: 'Chain Lightning', key: 'chainLightningDamage' },
      { name: 'Poison Swamp', key: 'swampDamage' },
      { name: 'Inner Land Mines', key: 'innerLandMineDamage' },
      { name: 'Smart Missiles', key: 'smartMissileDamage' },
      { name: 'Death Wave Damage', key: 'deathWaveDamage' }
    ];

    damageAttributions.forEach((attr) => {
      const share = (referenceRun!.fields[attr.key] || 0) / referenceRun!.fields.damageDealt;
      if (share > 0 && share < 0.001) {
        deadLevers.push({ name: attr.name, share });
      }
    });
  }

  // Unified mode calculation: convert cell boost cost to coin-equivalent
  const getUnifiedScore = (item: typeof scoredCatalog[0]) => {
    // Unified score: totalImpact / (effectiveDays + cellBoostCostConvertedToCoins)
    // Actually cell cost converted to coins: boostCellCost * exchangeRateOverride
    // Let's express this as a marginal value:
    // unifiedCostInCoins = coinCost + (boostCellCost * exchangeRateOverride)
    // Unified score: totalImpact / unifiedCostInCoins * 1e12 (scaled for readability)
    const unifiedCost = item.coinCost + (item.boostCellCost * exchangeRateOverride);
    return unifiedCost > 0 ? (item.totalImpact / (unifiedCost / 1e9)) : 0; // impact per billion coins
  };

  const unifiedResearches = [...scoredCatalog].sort((a, b) => {
    return getUnifiedScore(b) - getUnifiedScore(a);
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Upgrade Queue</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Scored list of candidate research projects, mapped using your own run history.
        </p>
      </div>

      {/* Select Reference Run */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div>
          <label className="text-xs text-zinc-500 font-mono uppercase block mb-1">Reference Run</label>
          <select
            value={selectedRunId}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none w-full"
          >
            <option value="latest">Latest Farm Run</option>
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                T{r.tier} Wave {r.wave} ({r.battleDate || 'No Date'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-500 font-mono uppercase block mb-1">Target Lab Boost</label>
          <select
            value={labBoostSelect}
            onChange={(e) => setLabBoostSelect(parseFloat(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200 focus:outline-none w-full"
          >
            <option value="1.0">1.0x boost</option>
            <option value="1.5">1.5x boost</option>
            <option value="2.0">2.0x boost</option>
            <option value="3.0">3.0x boost</option>
            <option value="4.0">4.0x boost</option>
            <option value="5.0">5.0x boost</option>
          </select>
        </div>

        <div className="flex space-x-2 justify-end self-end">
          <button
            onClick={() => setCurrencyMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider ${
              currencyMode === 'split' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            Split Mode
          </button>
          <button
            onClick={() => setCurrencyMode('unified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider ${
              currencyMode === 'unified' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            Unified Mode
          </button>
        </div>
      </div>

      {/* Dead Levers Callout */}
      {deadLevers.length > 0 && (
        <div className="p-4 bg-rose-950/15 border border-rose-900/30 rounded-xl flex items-start space-x-3 text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">Dead Levers Identified!</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
              The following channels contribute <strong>under 0.1%</strong> of your total damage output. 
              Researches targeting these are currently useless:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {deadLevers.map((lever) => (
                <span key={lever.name} className="px-2 py-0.5 rounded bg-zinc-950 text-[10px] text-rose-400 border border-rose-800/30 font-mono">
                  {lever.name}: {(lever.share * 100).toFixed(5)}% share
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Unified Mode Slider */}
      {currencyMode === 'unified' && (
        <div className="p-5 glass-panel rounded-xl border border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-300 font-mono uppercase">Cell Conversion Rate (Coins per cell)</span>
            <span className="text-indigo-400 font-mono font-semibold">{formatCompact(exchangeRateOverride)}</span>
          </div>
          <input
            type="range"
            min="1000000"
            max="100000000"
            step="1000000"
            value={exchangeRateOverride}
            onChange={(e) => setExchangeRateOverride(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>1M (Low cells value)</span>
            <span>Default ratio: {formatCompact(defaultExchangeRate)}</span>
            <span>100M (High cells value)</span>
          </div>
        </div>
      )}

      {/* Upgrade Queue Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <ListOrdered className="w-5 h-5 text-indigo-400" />
          <span>Research Rankings</span>
        </h3>

        <div className="overflow-x-auto border border-zinc-800/80 rounded-xl glass-panel">
          <table className="w-full text-left text-sm text-zinc-300 min-w-[950px]">
            <thead className="bg-zinc-900/60 text-zinc-400 text-xs font-mono uppercase border-b border-zinc-800">
              {currencyMode === 'split' ? (
                <tr>
                  <th className="p-3">Research Name</th>
                  <th className="p-3">Delta (Δ)</th>
                  <th className="p-3">Channel Share</th>
                  <th className="p-3">Total Impact</th>
                  <th className="p-3">Coin Cost</th>
                  <th className="p-3">Days Pre-Boost</th>
                  <th className="p-3">Effective Days</th>
                  <th className="p-3">Boost Cell Cost</th>
                  <th className="p-3">Impact / Slot-Day</th>
                  <th className="p-3">Buyable?</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-3">Research Name</th>
                  <th className="p-3">Total Impact</th>
                  <th className="p-3">Coin Cost</th>
                  <th className="p-3">Boost Cell Cost</th>
                  <th className="p-3">Cell Cost Converted</th>
                  <th className="p-3">Unified Cost Equiv</th>
                  <th className="p-3">Impact / B Coins Equiv</th>
                  <th className="p-3">Buyable?</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/20">
              {(currencyMode === 'split' ? sortedResearches : unifiedResearches).map((item) => {
                const isBuyable = item.coinCost <= build.resources.coins;
                
                // Render Split Mode Rows
                if (currencyMode === 'split') {
                  return (
                    <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        <div>
                          {item.name}
                          {item.isEstimated && (
                            <span className="ms-2 px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-500 font-mono uppercase">
                              Est
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase">{item.change}</span>
                      </td>
                      <td className="p-3 font-mono text-zinc-300">
                        {item.isEstimated ? 'N/A' : `+${(item.channelDelta * 100).toFixed(2)}%`}
                      </td>
                      <td className="p-3 font-mono text-zinc-300">
                        {item.isEstimated ? 'N/A' : `${(item.channelShare * 100).toFixed(2)}%`}
                      </td>
                      <td className="p-3 font-mono font-semibold text-indigo-400">
                        +{(item.totalImpact * 100).toFixed(3)}%
                      </td>
                      <td className="p-3 font-mono text-amber-500">{formatCompact(item.coinCost)}</td>
                      <td className="p-3 font-mono text-zinc-400">
                        {(item.baseTimeSeconds / 86400).toFixed(1)}d
                      </td>
                      <td className="p-3 font-mono font-semibold text-zinc-200">
                        {item.effectiveDays.toFixed(1)}d
                      </td>
                      <td className="p-3 font-mono text-purple-400">{formatCompact(item.boostCellCost)}</td>
                      <td className="p-3 font-mono font-bold text-white text-base">
                        {item.score.toFixed(4)}
                      </td>
                      <td className="p-3">
                        {isBuyable ? (
                          <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="text-xs text-rose-400 block font-mono">
                            {item.daysToAfford.toFixed(1)}d wait
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }

                // Render Unified Mode Rows
                const cellCostConverted = item.boostCellCost * exchangeRateOverride;
                const unifiedCost = item.coinCost + cellCostConverted;
                const unifiedScore = getUnifiedScore(item);

                return (
                  <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-3 font-semibold text-white">
                      <div>
                        {item.name}
                        {item.isEstimated && (
                          <span className="ms-2 px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-500 font-mono uppercase">
                            Est
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">{item.change}</span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-indigo-400">
                      +{(item.totalImpact * 100).toFixed(3)}%
                    </td>
                    <td className="p-3 font-mono text-amber-500">{formatCompact(item.coinCost)}</td>
                    <td className="p-3 font-mono text-purple-400">{formatCompact(item.boostCellCost)}</td>
                    <td className="p-3 font-mono text-zinc-400">{formatCompact(cellCostConverted)}</td>
                    <td className="p-3 font-mono font-semibold text-white">{formatCompact(unifiedCost)}</td>
                    <td className="p-3 font-mono font-bold text-indigo-400 text-base">
                      {unifiedScore.toFixed(4)}
                    </td>
                    <td className="p-3">
                      {isBuyable ? (
                        <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="text-xs text-rose-400 block font-mono">
                          {item.daysToAfford.toFixed(1)}d wait
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Estimate Overrides Form */}
      <div className="p-5 glass-panel rounded-xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">
          Estimate Flat & Unlock Researches
        </h3>
        <p className="text-xs text-zinc-400 leading-normal">
          Researches like Ban Perks or Waves Required have no report attribution path. Adjust your manually estimated total impacts below:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {build.researchCatalog.filter((r) => !r.effect || r.effect.kind === 'unlock' || r.id === 'waves_required' || r.id === 'ban_perks').map((research) => (
            <div key={research.id} className="flex justify-between items-center p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs">
              <span className="font-semibold text-zinc-200">{research.name}</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={research.estimatedImpact || 0}
                  placeholder="Impact (e.g. 0.05)"
                  onChange={(e) => updateResearchCatalog(research.id, { estimatedImpact: parseFloat(e.target.value) || 0.0 })}
                  className="bg-zinc-900 border border-zinc-850 rounded p-1 text-center font-mono w-24 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-zinc-500 font-mono">% Impact</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
