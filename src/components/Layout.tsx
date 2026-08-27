import React, { useState, useEffect } from 'react';
import { useStore } from '../domain/store';
import { AuthSyncBanner } from './AuthSyncBanner';
import { AuthModal } from './AuthModal';
import { ThemeToggle } from './ThemeToggle';
import { CurrencyIcon } from './CurrencyIcon';
import { RightSidebar } from './RightSidebar';
import { 
  History, 
  FlaskConical, 
  TrendingUp, 
  Sliders, 
  Trophy, 
  AlertTriangle,
  Clock,
  Cloud,
  CloudCheck,
  LogIn,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type TabId = 'runs' | 'tier-lab' | 'research-queue' | 'cell-budget' | 'build-state' | 'tournament';

interface LayoutProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  children: React.ReactNode;
}

export function Layout({ activeTab, setActiveTab, children }: LayoutProps) {
  const build = useStore((state) => state.build);
  const user = useStore((state) => state.user);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'register' | 'info'>('register');

  // Sidebar collapse states with localStorage persistence
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tower_left_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tower_right_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tower_left_collapsed', String(isLeftCollapsed));
    } catch {
      // ignore
    }
  }, [isLeftCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem('tower_right_collapsed', String(isRightCollapsed));
    } catch {
      // ignore
    }
  }, [isRightCollapsed]);

  const handleOpenAuth = (tab: 'signin' | 'register' | 'info' = 'register') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // Suffix numbers helper
  const formatCompact = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const navItems = [
    { id: 'runs' as TabId, name: 'Import & Runs', icon: History, color: 'text-blue-400 hover:text-blue-300' },
    { id: 'tier-lab' as TabId, name: 'Tier Lab', icon: TrendingUp, color: 'text-indigo-400 hover:text-indigo-300' },
    { id: 'research-queue' as TabId, name: 'Research Queue', icon: FlaskConical, color: 'text-emerald-400 hover:text-emerald-300' },
    { id: 'cell-budget' as TabId, name: 'Cell Budget', icon: Clock, color: 'text-amber-400 hover:text-amber-300' },
    { id: 'build-state' as TabId, name: 'Build State', icon: Sliders, color: 'text-rose-400 hover:text-rose-300' },
    { id: 'tournament' as TabId, name: 'Tournament', icon: Trophy, color: 'text-cyan-400 hover:text-cyan-300' },
  ];

  // Check how many lab slots are occupied / their boosts
  const activeBoostsCount = build.labs.filter((l) => l.researchId).length;

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">

      {/* ── Top Header Bar ─────────────────────────────────────── */}
      <header className="shrink-0 h-12 flex items-center justify-between px-4 bg-zinc-900/70 border-b border-zinc-800/80 backdrop-blur-sm z-20">
        {/* Left: subtle breadcrumb / page title placeholder */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span className="text-zinc-600">Tower Planner</span>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400 capitalize">{activeTab.replace('-', ' ')}</span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Divider */}
          <div className="w-px h-5 bg-zinc-700/60 mx-1" />

          {user?.isLoggedIn ? (
            /* Logged-in: compact account button */
            <button
              onClick={() => handleOpenAuth('info')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
              title={`Signed in as ${user.email}`}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline max-w-[140px] truncate text-zinc-300">{user.email}</span>
              <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          ) : (
            /* Logged-out: Sign In only */
            <button
              onClick={() => handleOpenAuth('signin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Body: 3 Columns (Left Sidebar + Middle Main + Right Sidebar) ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── 1. Left Column (Navigation & System Hub) ─────────────── */}
        {isLeftCollapsed ? (
          /* Collapsed Rail (64px) */
          <aside className="w-16 shrink-0 bg-zinc-900/40 border-r border-zinc-800/80 py-3.5 flex flex-col items-center justify-between glass-panel transition-all duration-300 z-10 select-none">
            <div className="flex flex-col items-center space-y-4 w-full px-2">
              {/* Brand icon */}
              <div className="w-8 h-8 shrink-0 mb-1" title="Tower Planner v1.0.0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
                  <defs>
                    <filter id="si-glow-r-c" x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="3" result="b"/>
                      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect width="100" height="100" fill="#050508" rx="12"/>
                  <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="none" stroke="#ff3300" strokeWidth="2.8" filter="url(#si-glow-r-c)" opacity="0.95"/>
                  <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" fill="none" stroke="#00ff88" strokeWidth="2.3" opacity="0.95"/>
                  <polygon points="50,34 64,42 64,58 50,66 36,58 36,42" fill="none" stroke="#9900ff" strokeWidth="2" opacity="0.95"/>
                </svg>
              </div>

              {/* Expand Left Arrow Button */}
              <button
                onClick={() => setIsLeftCollapsed(false)}
                className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-indigo-500/50 text-zinc-400 hover:text-indigo-300 transition-all cursor-pointer shadow-xs group"
                title="Expand left navigation"
                aria-label="Expand left navigation"
              >
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="w-8 h-px bg-zinc-800/60 my-1" />

              {/* Icon-only Navigation */}
              <nav className="flex flex-col space-y-2 w-full items-center">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      title={item.name}
                      aria-label={item.name}
                      className={`p-2.5 rounded-lg border transition-all duration-100 cursor-pointer touch-manipulation group relative ${
                        isActive 
                          ? 'bg-zinc-800 text-white border-zinc-700 shadow-inner' 
                          : 'border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color} ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom collapsed stats hint */}
            <div className="flex flex-col items-center space-y-2 pb-1">
              <button
                onClick={() => handleOpenAuth(user?.isLoggedIn ? 'info' : 'register')}
                className="p-2 rounded-lg border transition-all cursor-pointer bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700"
                title={user?.isLoggedIn ? `Cloud Synced as ${user.email}` : 'Sign in / Register'}
              >
                {user?.isLoggedIn
                  ? <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                  : <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                }
              </button>
            </div>
          </aside>
        ) : (
          /* Expanded Left Sidebar (256px) */
          <aside className="w-64 shrink-0 bg-zinc-900/40 border-r border-zinc-800/80 p-4 flex flex-col justify-between glass-panel overflow-y-auto transition-all duration-300 z-10">
            <div>
              {/* Brand Header & Controls */}
              <div className="flex items-center justify-between mb-6 ps-1 pe-0">
                <div className="flex items-center space-x-2.5">
                  {/* Neon hexagon icon */}
                  <div className="w-7 h-7 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28">
                      <defs>
                        <filter id="si-glow-r" x="-60%" y="-60%" width="220%" height="220%">
                          <feGaussianBlur stdDeviation="3" result="b"/>
                          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                        <filter id="si-glow-g" x="-60%" y="-60%" width="220%" height="220%">
                          <feGaussianBlur stdDeviation="2.5" result="b"/>
                          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                        <filter id="si-glow-v" x="-60%" y="-60%" width="220%" height="220%">
                          <feGaussianBlur stdDeviation="2" result="b"/>
                          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                      </defs>
                      <rect width="100" height="100" fill="#050508" rx="12"/>
                      <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="none" stroke="#ff3300" strokeWidth="2.8" filter="url(#si-glow-r)" opacity="0.95"/>
                      <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="none" stroke="#ff6600" strokeWidth="1" opacity="0.6"/>
                      <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" fill="none" stroke="#00ff88" strokeWidth="2.3" filter="url(#si-glow-g)" opacity="0.95"/>
                      <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" fill="none" stroke="#00ffcc" strokeWidth="0.9" opacity="0.55"/>
                      <polygon points="50,34 64,42 64,58 50,66 36,58 36,42" fill="none" stroke="#9900ff" strokeWidth="2" filter="url(#si-glow-v)" opacity="0.95"/>
                      <polygon points="50,34 64,42 64,58 50,66 36,58 36,42" fill="none" stroke="#cc44ff" strokeWidth="0.8" opacity="0.6"/>
                      <line x1="50" y1="6" x2="50" y2="-2" stroke="#ff4400" strokeWidth="1.5" strokeLinecap="round" filter="url(#si-glow-r)" opacity="0.9"/>
                      <line x1="88" y1="28" x2="95" y2="24" stroke="#ffaa00" strokeWidth="1.5" strokeLinecap="round" opacity="0.85"/>
                      <line x1="88" y1="72" x2="95" y2="76" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" filter="url(#si-glow-g)" opacity="0.85"/>
                      <line x1="50" y1="94" x2="50" y2="102" stroke="#00ccff" strokeWidth="1.5" strokeLinecap="round" opacity="0.85"/>
                      <line x1="12" y1="72" x2="5" y2="76" stroke="#6600ff" strokeWidth="1.5" strokeLinecap="round" filter="url(#si-glow-v)" opacity="0.85"/>
                      <line x1="12" y1="28" x2="5" y2="24" stroke="#aa00ff" strokeWidth="1.5" strokeLinecap="round" filter="url(#si-glow-v)" opacity="0.85"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                      Tower Planner
                    </h1>
                    <p className="text-[10px] text-zinc-500 font-mono">v1.0.0</p>
                  </div>
                </div>

                {/* Right controls: Cloud sync + Collapse Left arrow */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenAuth(user?.isLoggedIn ? 'info' : 'register')}
                    className="p-1.5 rounded-lg border transition-all cursor-pointer bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700"
                    title={user?.isLoggedIn ? `Cloud Synced as ${user.email}` : 'Sign in / Register'}
                  >
                    {user?.isLoggedIn
                      ? <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                      : <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                    }
                  </button>

                  <button
                    onClick={() => setIsLeftCollapsed(true)}
                    className="p-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer group"
                    title="Collapse left sidebar"
                    aria-label="Collapse left sidebar"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-6 p-2 bg-zinc-950/40 border border-zinc-800/50 rounded-xl">
                <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/40 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <span className="w-4 h-4 rounded-full bg-amber-950/40 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
                      <CurrencyIcon currency="coins" size="xs" />
                    </span>
                    Coins
                  </span>
                  <span className="text-sm font-bold text-amber-500 mt-1 font-mono">{formatCompact(build.resources.coins)}</span>
                </div>

                <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/40 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <span className="w-4 h-4 rounded-full bg-purple-950/40 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-xs">
                      <CurrencyIcon currency="cells" size="xs" />
                    </span>
                    Cells
                  </span>
                  <span className="text-sm font-bold text-purple-400 mt-1 font-mono">{formatCompact(build.resources.cells)}</span>
                </div>

                <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/40 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <span className="w-4 h-4 rounded-full bg-teal-950/40 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-xs">
                      <CurrencyIcon currency="stones" size="xs" />
                    </span>
                    Stones
                  </span>
                  <span className="text-sm font-bold text-teal-400 mt-1 font-mono">{build.resources.stones}</span>
                </div>

                <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/40 flex flex-col justify-between">
                  <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <span className="w-4 h-4 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
                      <CurrencyIcon currency="gems" size="xs" />
                    </span>
                    Gems
                  </span>
                  <span className="text-sm font-bold text-emerald-400 mt-1 font-mono">{build.resources.gems}</span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors duration-100 touch-manipulation cursor-pointer ${
                        isActive 
                          ? 'bg-zinc-800 text-white border-zinc-700 shadow-inner' 
                          : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color} ${isActive ? 'scale-110' : ''}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Labs Status & Warning Banner */}
            <div className="mt-6 space-y-3">
              {/* Verification Warnings */}
              {build.verificationFlags.length > 0 && (
                <div className="flex items-start space-x-2 p-2.5 bg-rose-950/20 border border-rose-800/30 rounded-lg text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    <span className="font-semibold block">In-Game Check Required</span>
                    <p className="text-[10px] text-rose-400/80 leading-relaxed mt-0.5">
                      Some build metrics are marked unverified. Estimates might vary.
                    </p>
                  </div>
                </div>
              )}

              {/* Labs Status Overview */}
              <div className="p-2.5 bg-zinc-900/50 border border-zinc-800/40 rounded-lg text-xs">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5 font-mono uppercase">
                  <span>Lab Allocations</span>
                  <span className="text-emerald-400 font-semibold">{activeBoostsCount}/5 Active</span>
                </div>
                <div className="flex space-x-1.5 justify-center py-1">
                  {build.labs.map((lab, i) => (
                    <div 
                      key={i} 
                      title={lab.researchId ? `Lab ${i+1}: ${lab.boost}x boost` : `Lab ${i+1}: Idle`}
                      className={`h-2 w-full rounded-full transition-all duration-300 ${
                        lab.researchId 
                          ? lab.boost >= 3 
                            ? 'bg-amber-500 shadow-sm shadow-amber-500/50 animate-pulse'
                            : 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                          : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ── 2. Middle Column (Active Workspace Content) ──────────── */}
        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <AuthSyncBanner onOpenAuth={handleOpenAuth} />
            {children}
          </div>
        </main>

        {/* ── 3. Right Column (Goals, Overview & Future Widgets) ────── */}
        <RightSidebar
          isCollapsed={isRightCollapsed}
          onToggle={() => setIsRightCollapsed(!isRightCollapsed)}
        />
      </div>

      {/* Cloud Auth & Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}

