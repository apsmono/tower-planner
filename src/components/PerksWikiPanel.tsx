import { useState, useMemo } from 'react';
import { 
  MASTER_PERK_CATALOG, 
  type PerkCategory 
} from '../data/perksCatalog';
import { GAME_CHANGELOG } from '../data/changelogData';
import { 
  Sparkles, 
  Search, 
  Ban, 
  Award, 
  ShieldAlert, 
  History, 
  BookOpen, 
  TrendingUp,
  Cpu,
  Coins,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';

export function PerksWikiPanel() {
  const [subTab, setSubTab] = useState<'perks' | 'changelog' | 'wiki'>('perks');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PerkCategory>('all');
  const [tierScoreFilter] = useState<number | 'all'>('all');
  
  // Planner State
  const [standardPerkLab, setStandardPerkLab] = useState<number>(20); // 0 to 25 (+1% per level = +20%)
  const [firstPerkChoice, setFirstPerkChoice] = useState<string>('std_pwr_reduction');
  const [bannedPerkIds, setBannedPerkIds] = useState<string[]>([
    'tradeoff_lifesteal_knockback',
    'std_interest_bonus',
  ]);
  const [autoPickQueue, setAutoPickQueue] = useState<string[]>([
    'std_pwr_reduction',
    'tradeoff_coins_health',
    'std_coins_bonus',
    'std_health_bonus',
    'std_defense_percent',
    'uw_golden_tower',
    'uw_black_hole',
  ]);

  const perkBonusMultiplier = 1 + (standardPerkLab * 0.01);

  const toggleBan = (id: string) => {
    setBannedPerkIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAutoPick = (id: string) => {
    setAutoPickQueue(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const filteredPerks = useMemo(() => {
    return MASTER_PERK_CATALOG.filter(perk => {
      const matchesSearch = 
        perk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perk.positiveEffect.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perk.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || perk.category === categoryFilter;
      const matchesScore = tierScoreFilter === 'all' || perk.tierScore === tierScoreFilter;

      return matchesSearch && matchesCategory && matchesScore;
    });
  }, [searchQuery, categoryFilter, tierScoreFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Navigation Bar */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Wiki & Perks Database
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                  Patch v25.0
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Master reference wiki, trade-off analysis, ban manager, and patch changelog.
              </p>
            </div>
          </div>
        </div>

        {/* Subtab Selector */}
        <div className="flex items-center p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSubTab('perks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              subTab === 'perks'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Perks & Ban Planner
          </button>
          <button
            onClick={() => setSubTab('changelog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              subTab === 'changelog'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Changelog & Patches
          </button>
          <button
            onClick={() => setSubTab('wiki')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              subTab === 'wiki'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Game Mechanics Wiki
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PERKS DATABASE & PLANNER */}
      {subTab === 'perks' && (
        <div className="space-y-6">
          {/* Perk Planner Configurations (Lab Bonus, First Perk, Bans) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Standard Perk Bonus Lab */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-200">Standard Perk Bonus Lab</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  Lvl {standardPerkLab} (+{standardPerkLab}%)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Scales positive values of all standard white perks (+1% per lab level up to level 25).
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={standardPerkLab}
                  onChange={(e) => setStandardPerkLab(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-xs font-mono text-slate-300 w-12 text-right">
                  {perkBonusMultiplier.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* First Perk Choice Simulator */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-200">First Perk Choice (Lab)</h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
                  Guaranteed Pick
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pre-select the first guaranteed perk offered on wave 1.
              </p>
              <select
                value={firstPerkChoice}
                onChange={(e) => setFirstPerkChoice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="std_pwr_reduction">Perk Wave Requirement (Best for Farm)</option>
                <option value="std_coins_bonus">Coins Bonus (+15% Coins)</option>
                <option value="tradeoff_coins_health">1.80x Coins / -70% Health</option>
                <option value="std_free_upgrades">Free Upgrades Chance</option>
                <option value="std_defense_percent">Defense %</option>
                <option value="std_health_bonus">Tower Health</option>
              </select>
            </div>

            {/* Ban Manager Summary */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-slate-200">Banned Perks ({bannedPerkIds.length}/8)</h3>
                </div>
                <button
                  onClick={() => setBannedPerkIds([])}
                  className="text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  Clear All
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Excludes harmful trade-offs from clogging roll options.
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
                {bannedPerkIds.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No perks currently banned.</span>
                ) : (
                  bannedPerkIds.map(id => {
                    const perk = MASTER_PERK_CATALOG.find(p => p.id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300"
                      >
                        {perk ? perk.name : id}
                        <button
                          onClick={() => toggleBan(id)}
                          className="hover:text-white font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Search, Categories, and Score Filters */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search perk name, effect, or stat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    categoryFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({MASTER_PERK_CATALOG.length})
                </button>
                <button
                  onClick={() => setCategoryFilter('standard')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    categoryFilter === 'standard' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setCategoryFilter('tradeoff')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    categoryFilter === 'tradeoff' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Trade-Off (Purple)
                </button>
                <button
                  onClick={() => setCategoryFilter('ultimate_weapon')}
                  className={`px-2.5 py-1 rounded font-medium transition ${
                    categoryFilter === 'ultimate_weapon' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  UW Perks (Green)
                </button>
              </div>
            </div>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPerks.map((perk) => {
              const isBanned = bannedPerkIds.includes(perk.id);
              const isAutoPicked = autoPickQueue.includes(perk.id);
              const isFirstChoice = firstPerkChoice === perk.id;

              // Calculate scaled positive value for standard perks
              let displayPositive = perk.positiveEffect;
              if (perk.category === 'standard' && perk.unit === '%') {
                const scaled = (perk.baseValue * perkBonusMultiplier).toFixed(1);
                displayPositive = `+${scaled}% per stack (${perk.baseValue}% base × ${perkBonusMultiplier.toFixed(2)}x lab)`;
              }

              return (
                <div
                  key={perk.id}
                  className={`relative rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                    isBanned
                      ? 'bg-rose-950/20 border-rose-800/40 opacity-70'
                      : isFirstChoice
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-950/20'
                      : perk.category === 'tradeoff'
                      ? 'bg-purple-950/20 border-purple-800/40 hover:border-purple-600/60 shadow-lg shadow-purple-950/10'
                      : perk.category === 'ultimate_weapon'
                      ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-600/60 shadow-lg shadow-amber-950/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-lg shadow-slate-950/30'
                  }`}
                >
                  <div>
                    {/* Perk Header (Tier badge, category, max picks) */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              perk.category === 'tradeoff'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : perk.category === 'ultimate_weapon'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {perk.category === 'tradeoff'
                              ? 'Trade-Off'
                              : perk.category === 'ultimate_weapon'
                              ? 'UW Perk'
                              : 'Standard'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            Max: {perk.maxPicks} {perk.maxPicks === 1 ? 'pick' : 'picks'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                          {perk.name}
                        </h4>
                      </div>

                      {/* Tier Rating Score */}
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded border shrink-0 ${
                          perk.tierScore === 5
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : perk.tierScore === 4
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : perk.tierScore === 3
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                        title={`Tier Priority: ${perk.tierScore}/5`}
                      >
                        {perk.tierScore === 5 ? 'S-Tier' : perk.tierScore === 4 ? 'A-Tier' : perk.tierScore === 3 ? 'B-Tier' : 'Ban Pick'}
                      </span>
                    </div>

                    {/* Positive & Negative Effects */}
                    <div className="space-y-1.5 my-3 text-xs">
                      <div className="flex items-start gap-1.5 text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="font-medium">{displayPositive}</span>
                      </div>
                      {perk.negativeEffect && (
                        <div className="flex items-start gap-1.5 text-rose-400">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="font-medium">{perk.negativeEffect}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {perk.description}
                    </p>
                  </div>

                  {/* Action Buttons: Ban, Auto-Pick, First Choice */}
                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => toggleBan(perk.id)}
                      className={`text-xs font-medium px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
                        isBanned
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-rose-400 bg-slate-950/60 border border-slate-800'
                      }`}
                    >
                      <Ban className="w-3 h-3" />
                      {isBanned ? 'Banned' : 'Ban Perk'}
                    </button>

                    <button
                      onClick={() => toggleAutoPick(perk.id)}
                      className={`text-xs font-medium px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
                        isAutoPicked
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-purple-300 bg-slate-950/60 border border-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {isAutoPicked ? 'Auto-Pick' : 'Queue'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: GAME CHANGELOG & PATCH NOTES */}
      {subTab === 'changelog' && (
        <div className="space-y-6">
          <div className="space-y-6">
            {GAME_CHANGELOG.map((patch) => (
              <div
                key={patch.version}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {patch.version}
                      </span>
                      <h3 className="text-lg font-bold text-white">{patch.title}</h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Released: {patch.releaseDate}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {patch.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Highlights & Additions
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {patch.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {patch.balanceChanges && (
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" />
                        Balance & Economy Adjustments
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {patch.balanceChanges.map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: GAME MECHANICS WIKI */}
      {subTab === 'wiki' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Economy & Coins Formula */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Coin Multipliers & CPM</h3>
                <p className="text-xs text-slate-400">Understanding multiplicative income stacking</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Coin generation in The Tower is completely multiplicative. Syncing your Ultimate Weapon cooldowns (Golden Tower + Black Hole + Death Wave) produces compound multipliers:
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl font-mono text-xs text-amber-300 border border-amber-500/20 space-y-1">
              <div>Total Multiplier = GT_Bonus × BH_Bonus × DW_Coin × SL_Coin × Themes × Relics × 1.8x Perk</div>
            </div>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Golden Tower + Black Hole sync (at 3m 20s or 2m 30s) is the #1 priority.</li>
              <li>• 1.80x Coins trade-off perk boosts all coin sources, even during UW activations.</li>
            </ul>
          </div>

          {/* Elite Cells & Lab Boosts */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Elite Cells & Lab Speedups</h3>
                <p className="text-xs text-slate-400">Vampires, Scatters, and Rays drop mechanics</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Elite enemies begin spawning at wave 100+ and scale in frequency. Higher tiers yield more cells per elite kill, providing the fuel for continuous 1.5x, 2.0x, and 3.0x lab research boosts.
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl font-mono text-xs text-purple-300 border border-purple-500/20 space-y-1">
              <div>Continuous 1.5x on 5 labs: 4,320 Cells / 24h</div>
              <div>Continuous 2.0x on 5 labs: 15,360 Cells / 24h</div>
              <div>Continuous 3.0x on 5 labs: 46,080 Cells / 24h</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
