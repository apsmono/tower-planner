import React, { useState } from 'react';
import { useStore } from '../domain/store';
import { TaskHUD } from './TaskHUD';
import { AuthSyncBanner } from './AuthSyncBanner';
import { AuthModal } from './AuthModal';
import { ThemeToggle } from './ThemeToggle';
import { 
  History, 
  FlaskConical, 
  ListOrdered, 
  Sliders, 
  Trophy, 
  AlertTriangle,
  Clock,
  Zap,
  Cloud,
  CloudCheck
} from 'lucide-react';

export type TabId = 'runs' | 'tier-lab' | 'research-queue' | 'cell-budget' | 'build-state' | 'tournament';

interface LayoutProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  children: React.ReactNode;
}

export function Layout({ activeTab, setActiveTab, children }: LayoutProps) {
  const build = useStore((state) => state.build);
  const runs = useStore((state) => state.runs);
  const user = useStore((state) => state.user);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'register' | 'info'>('register');

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
    { id: 'tier-lab' as TabId, name: 'Tier Lab', icon: FlaskConical, color: 'text-indigo-400 hover:text-indigo-300' },
    { id: 'research-queue' as TabId, name: 'Research Queue', icon: ListOrdered, color: 'text-emerald-400 hover:text-emerald-300' },
    { id: 'cell-budget' as TabId, name: 'Cell Budget', icon: Clock, color: 'text-amber-400 hover:text-amber-300' },
    { id: 'build-state' as TabId, name: 'Build State', icon: Sliders, color: 'text-rose-400 hover:text-rose-300' },
    { id: 'tournament' as TabId, name: 'Tournament', icon: Trophy, color: 'text-cyan-400 hover:text-cyan-300' },
  ];

  // Check how many lab slots are occupied / their boosts
  const activeBoostsCount = build.labs.filter((l) => l.researchId).length;

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-800/80 p-4 flex flex-col justify-between shrink-0 glass-panel md:h-full md:overflow-y-auto">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Tower Planner
                </h1>
                <p className="text-[10px] text-zinc-500 font-mono">v1.0.0</p>
              </div>
            </div>

            {/* Quick Actions: Theme Selector & Cloud Sync */}
            <div className="flex items-center space-x-1.5">
              <ThemeToggle />

              <button
                onClick={() => handleOpenAuth(user?.isLoggedIn ? 'info' : 'register')}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  user?.isLoggedIn
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50 shadow-sm shadow-emerald-500/20'
                    : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/50 hover:border-indigo-400/50'
                }`}
                title={user?.isLoggedIn ? `Cloud Synced as ${user.email}` : 'Sign in / Register to sync online'}
              >
                {user?.isLoggedIn ? <CloudCheck className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-2.5 bg-zinc-950/40 border border-zinc-800/50 rounded-lg">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-mono">Coins</span>
              <span className="text-sm font-semibold text-amber-500">{formatCompact(build.resources.coins)}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-mono">Cells</span>
              <span className="text-sm font-semibold text-purple-400">{formatCompact(build.resources.cells)}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-mono">Stones</span>
              <span className="text-sm font-semibold text-teal-400">{build.resources.stones}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-mono">Runs Logged</span>
              <span className="text-sm font-semibold text-zinc-300">{runs.length}</span>
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
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors duration-100 touch-manipulation ${
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
        <div className="mt-8 space-y-4">
          {/* Active Goals HUD */}
          <TaskHUD />

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

          {/* Labs Status */}
          <div className="p-2.5 bg-zinc-900/50 border border-zinc-800/40 rounded-lg text-xs">
            <div className="flex justify-between text-[10px] text-zinc-500 mb-1 font-mono uppercase">
              <span>Lab Allocations</span>
              <span>{activeBoostsCount}/5</span>
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

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        <AuthSyncBanner onOpenAuth={handleOpenAuth} />
        {children}
      </main>

      {/* Cloud Auth & Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}
