import { useState } from 'react';
import { useStore } from '../domain/store';
import { CARD_CATALOG, CARD_SLOT_COSTS, type CardRarity } from '../data/cardCatalog';
import { CurrencyIcon } from './CurrencyIcon';
import { 
  Layers, 
  Sparkles, 
  ExternalLink, 
  Shield, 
  Zap, 
  Coins, 
  Plus, 
  Minus,
  Search
} from 'lucide-react';

const RARITY_STYLES: Record<CardRarity, {
  border: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glow: string;
  starColor: string;
}> = {
  common: {
    border: 'border-slate-800 hover:border-slate-600',
    badgeBg: 'bg-slate-900/80',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-700/60',
    glow: 'hover:shadow-slate-500/10',
    starColor: 'text-amber-400'
  },
  rare: {
    border: 'border-sky-800/60 hover:border-sky-500/80',
    badgeBg: 'bg-sky-950/80',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-700/60',
    glow: 'hover:shadow-sky-500/20',
    starColor: 'text-sky-400'
  },
  epic: {
    border: 'border-purple-800/60 hover:border-purple-500/80',
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-700/60',
    glow: 'hover:shadow-purple-500/20',
    starColor: 'text-purple-400'
  }
};

const CATEGORY_ICONS = {
  attack: Zap,
  defense: Shield,
  economy: Coins,
  utility: Layers,
  ultimate: Sparkles,
};

export function CardsPanel() {
  const build = useStore((state) => state.build);
  const updateCards = useStore((state) => state.updateCards);

  const [rarityFilter, setRarityFilter] = useState<'all' | CardRarity | 'equipped'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cardSlots = build.cards?.slots ?? 15;
  const cardLevels = build.cards?.levels ?? {};

  // Equipped card IDs list (stored in levels with positive level)
  const equippedCount = Object.keys(cardLevels).filter(k => (cardLevels[k] ?? 0) > 0).length;

  const currentSlotCost = CARD_SLOT_COSTS.find(s => s.slot === cardSlots + 1)?.costGems ?? null;

  const handleLevelChange = (cardId: string, level: number) => {
    const clamped = Math.max(0, Math.min(7, level));
    updateCards({
      levels: {
        ...cardLevels,
        [cardId]: clamped
      }
    });
  };

  const handleMaxAll = () => {
    const allMaxed: Record<string, number> = {};
    CARD_CATALOG.forEach(c => {
      allMaxed[c.id] = c.maxLevel;
    });
    updateCards({ levels: allMaxed });
  };

  const handleResetAll = () => {
    updateCards({ levels: {} });
  };

  const handleSlotsChange = (delta: number) => {
    const newSlots = Math.max(1, Math.min(19, cardSlots + delta));
    updateCards({ slots: newSlots });
  };

  const filteredCards = CARD_CATALOG.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (rarityFilter === 'all') return true;
    if (rarityFilter === 'equipped') {
      return (cardLevels[card.id] ?? 0) > 0;
    }
    return card.rarity === rarityFilter;
  });

  const maxedCount = CARD_CATALOG.filter(c => (cardLevels[c.id] ?? 0) >= c.maxLevel).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="p-5 glass-panel rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 glow-indigo">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Cards & Slots Manager
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Track your active card slots, card collection levels (1–7★), and gacha pull completion.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleMaxAll}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white font-mono text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Max All Cards (7★)
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-mono text-xs transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        {/* Card Slots Status */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Unlocked Card Slots
            </span>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <CurrencyIcon currency="gems" size="xs" />
              {currentSlotCost ? `Next: ${currentSlotCost} Gems` : 'MAX Slots'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-white font-mono">{cardSlots}</span>
              <span className="text-xs text-zinc-500 font-mono">/ 19 Max</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => handleSlotsChange(-1)}
                disabled={cardSlots <= 1}
                className="w-7 h-7 flex items-center justify-center rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                title="Decrease Slots"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSlotsChange(1)}
                disabled={cardSlots >= 19}
                className="w-7 h-7 flex items-center justify-center rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                title="Increase Slots"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Maxed Cards Progress */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Maxed Cards (7★)
            </span>
            <span className="text-xs text-indigo-400 font-semibold">
              {((maxedCount / CARD_CATALOG.length) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-indigo-400 font-mono">{maxedCount}</span>
              <span className="text-xs text-zinc-500 font-mono">/ {CARD_CATALOG.length} Cards</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${(maxedCount / CARD_CATALOG.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active In-Use / Equipped */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Active / Collection
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              {equippedCount} / {cardSlots} Active
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Common: <strong className="text-slate-100">{CARD_CATALOG.filter(c => c.rarity === 'common').length}</strong></span>
            <span className="text-sky-400">Rare: <strong className="text-sky-300">{CARD_CATALOG.filter(c => c.rarity === 'rare').length}</strong></span>
            <span className="text-purple-400">Epic: <strong className="text-purple-300">{CARD_CATALOG.filter(c => c.rarity === 'epic').length}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
        {/* Rarity Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {(['all', 'common', 'rare', 'epic', 'equipped'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setRarityFilter(filter)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                rarityFilter === filter
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-500/40'
                  : 'bg-zinc-950/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {filter === 'all' ? `All (${CARD_CATALOG.length})` : filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search card by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => {
          const currentLevel = cardLevels[card.id] ?? 0;
          const isMax = currentLevel >= card.maxLevel;
          const isUnlocked = currentLevel > 0;
          const style = RARITY_STYLES[card.rarity];
          const CategoryIcon = CATEGORY_ICONS[card.category];

          return (
            <div
              key={card.id}
              className={`p-4 rounded-xl bg-zinc-900/60 border ${style.border} transition-all duration-200 flex flex-col justify-between space-y-3 ${style.glow}`}
            >
              {/* Card Header: Rarity Tag + Category + Wiki */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}>
                      {card.rarity}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 capitalize">
                      <CategoryIcon className="w-3 h-3 text-zinc-500" />
                      {card.category}
                    </span>
                  </div>

                  {card.wikiUrl && (
                    <a
                      href={card.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-indigo-400 transition-colors p-1"
                      title="Open Card Wiki"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white tracking-wide">
                    {card.name}
                  </h4>
                  {isMax ? (
                    <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/50 text-amber-300 text-[10px] font-mono font-bold">
                      MAX (7★)
                    </span>
                  ) : isUnlocked ? (
                    <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-[10px] font-mono">
                      Lv.{currentLevel}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 text-[10px] font-mono">
                      Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {card.description}
                </p>

                <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded p-1.5">
                  Bonus: {card.bonusSummary}
                </div>
              </div>

              {/* Star Rating & Level Stepper */}
              <div className="pt-2 border-t border-zinc-800/60 space-y-2">
                {/* 7 Star indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-0.5">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleLevelChange(card.id, i + 1)}
                        className={`text-sm cursor-pointer transition-transform hover:scale-125 ${
                          i < currentLevel ? style.starColor : 'text-zinc-700 hover:text-zinc-500'
                        }`}
                        title={`Set to Level ${i + 1}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  {/* Level Stepper Buttons */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleLevelChange(card.id, currentLevel - 1)}
                      disabled={currentLevel <= 0}
                      className="w-6 h-6 flex items-center justify-center rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs font-mono font-bold transition-colors"
                      title="Decrease Level"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLevelChange(card.id, currentLevel + 1)}
                      disabled={currentLevel >= card.maxLevel}
                      className="w-6 h-6 flex items-center justify-center rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs font-mono font-bold transition-colors"
                      title="Increase Level"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLevelChange(card.id, isMax ? 0 : card.maxLevel)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                        isMax 
                          ? 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30' 
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {isMax ? 'Reset' : 'Max'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
