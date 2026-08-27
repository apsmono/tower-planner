import { useStore } from '../domain/store';
import { CurrencyIcon } from './CurrencyIcon';
import { 
  Trophy, 
  TrendingUp, 
  Key
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getTournamentRewards } from '../domain/tournamentModel';

export function TournamentHistory() {
  const runs = useStore((state) => state.runs);

  // Filter only tournament runs
  const tournamentRuns = runs
    .filter((r) => r.runType === 'tournament' || r.tierSuffix === '+')
    .sort((a, b) => new Date(a.battleDate || a.importedAt).getTime() - new Date(b.battleDate || b.importedAt).getTime());

  // Aggregate totals
  const totals = tournamentRuns.reduce((acc, r) => {
    const rewards = getTournamentRewards(r.tournament?.bracket || 'Champion', r.tournament?.rank ?? null);
    acc.gems += rewards.gems;
    acc.stones += rewards.stones;
    acc.keys += rewards.keys;
    return acc;
  }, { gems: 0, stones: 0, keys: 0 });

  // Suffix numbers helper
  const formatCompact = (num: number): string => {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const chartData = tournamentRuns.map((r) => ({
    date: r.battleDate ? r.battleDate.slice(5) : new Date(r.importedAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
    wave: r.wave,
    tier: `T${r.tier}+`,
    rank: r.tournament?.rank ?? 'N/A'
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Tournament History</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Track tournament waves, rank brackets, and rewards over time.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 glass-panel rounded-xl flex items-center space-x-4 glow-emerald">
          <CurrencyIcon currency="gems" size="xl" />
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase block">Total Tourney Gems</span>
            <span className="text-lg font-bold text-white font-mono">{formatCompact(totals.gems)}</span>
          </div>
        </div>

        <div className="p-5 glass-panel rounded-xl flex items-center space-x-4 glow-teal">
          <CurrencyIcon currency="stones" size="xl" />
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase block">Total Tourney Stones</span>
            <span className="text-lg font-bold text-white font-mono">{formatCompact(totals.stones)}</span>
          </div>
        </div>

        <div className="p-5 glass-panel rounded-xl flex items-center space-x-4 glow-purple">
          <Key className="text-purple-400 w-8 h-8 shrink-0" />
          <div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase block">Total Tourney Keys</span>
            <span className="text-lg font-bold text-white font-mono">{formatCompact(totals.keys)}</span>
          </div>
        </div>
      </div>

      {/* Wave progress chart */}
      <div className="p-5 glass-panel rounded-xl border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Wave Progression by Bracket</span>
        </h3>
        
        {chartData.length === 0 ? (
          <div className="p-8 border border-dashed border-zinc-800 rounded-lg text-center text-zinc-500 text-xs">
            No tournament runs logged. Paste reports with T8+ (or other plus tiers) to view progression.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="wave" 
                  name="Wave Reached" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* History table list */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-cyan-400" />
          <span>Tournament Log</span>
        </h3>

        {tournamentRuns.length === 0 ? (
          <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-sm">
            No tournament records.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-800/80 rounded-xl glass-panel">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/60 text-zinc-400 text-xs font-mono uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Battle Date</th>
                  <th className="p-3">Bracket</th>
                  <th className="p-3">Rank Placing</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Wave Reached</th>
                  <th className="p-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CurrencyIcon currency="gems" size="xs" />
                      <span>Gems</span>
                    </span>
                  </th>
                  <th className="p-3">
                    <span className="inline-flex items-center gap-1 text-teal-400">
                      <CurrencyIcon currency="stones" size="xs" />
                      <span>Stones</span>
                    </span>
                  </th>
                  <th className="p-3 text-indigo-400">Keys</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/20">
                {tournamentRuns.map((run) => {
                  const rewards = getTournamentRewards(run.tournament?.bracket || 'Champion', run.tournament?.rank ?? null);
                  return (
                    <tr key={run.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        {run.battleDate || new Date(run.importedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 text-cyan-400 border border-cyan-800/30 text-xs font-semibold">
                          {run.tournament?.bracket || 'Champion'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-indigo-400 font-mono text-sm">
                        {run.tournament?.rank ? `#${run.tournament.rank}` : 'Unranked'}
                      </td>
                      <td className="p-3 font-mono font-semibold">
                        T{run.tier}{run.tierSuffix}
                      </td>
                      <td className="p-3 font-semibold font-mono text-white">
                        {run.wave.toLocaleString()}
                      </td>
                      <td className="p-3 text-emerald-400 font-mono font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <CurrencyIcon currency="gems" size="xs" />
                          <span>{rewards.gems.toLocaleString()}</span>
                        </span>
                      </td>
                      <td className="p-3 text-teal-400 font-mono font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <CurrencyIcon currency="stones" size="xs" />
                          <span>{rewards.stones.toLocaleString()}</span>
                        </span>
                      </td>
                      <td className="p-3 text-indigo-400 font-mono font-semibold">
                        {rewards.keys > 0 ? rewards.keys.toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
