import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Zap, 
  TrendingUp,
  FlaskConical,
  Trophy
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  const handleGetStarted = () => {
    localStorage.setItem('tower-planner-welcome-seen', 'true');
    onClose();
  };

  const featureCards = [
    {
      icon: TrendingUp,
      title: 'Battle Report Analytics',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      description: 'Paste in-game battle summaries to calculate true Coins/hr, Cells/hr, and normalize rotating Dissonance multipliers.'
    },
    {
      icon: FlaskConical,
      title: 'Lab Queue & Cell Speedups',
      color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-400',
      description: 'Optimize research progression across all 5 lab lanes, with 1.5x–5x cell boost scheduling and coin discount calculators.'
    },
    {
      icon: Cpu,
      title: 'Modules & Perks Database',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
      description: 'Browse complete reference databases for perks, pick/ban priorities, unique modules, and substat reroll tiers.'
    },
    {
      icon: Trophy,
      title: 'Tournament & Build State',
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
      description: 'Track league brackets, Heat conditions, card levels, and Ultimate Weapon cooldown sync timings (GT / BH / DW).'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl flex flex-col bg-zinc-950 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-indigo-950/40 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-indigo-600/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-zinc-800/80 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl shadow-lg shadow-indigo-500/10">
              <Zap className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  Welcome to Tower Planner
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-semibold">
                  v25.0 Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                The ultimate companion tool for min-maxing <em>The Tower — Idle Tower Defense</em>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[68vh]">
          {/* Quick Intro Banner */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-300 leading-relaxed space-y-2">
            <p>
              Tower Planner helps you log battle runs, calculate true coin yields, simulate lab boost investments, and plan long-term upgrades without guesswork.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto OCR & Clipboard Parser
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Offline IndexedDB & Cloud Sync
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Multi-theme Cyberpunk UI
              </span>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {featureCards.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.title}
                  className={`p-3.5 rounded-xl border bg-gradient-to-br ${feat.color} space-y-1.5 transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                      {feat.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-300/90 leading-normal">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400">
            You can always reopen this guide anytime from the top bar.
          </div>
          <button
            onClick={handleGetStarted}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
