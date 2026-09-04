import { useEffect, useState } from 'react';
import { useStore } from '../domain/store';
import { subscribeSyncStatus, triggerFullSync, type SyncStatus } from '../domain/syncEngine';
import { 
  Cloud, 
  CloudCheck, 
  Sparkles, 
  UserPlus, 
  X, 
  RefreshCw, 
  Smartphone, 
  Shield, 
  ArrowRight, 
  AlertTriangle 
} from 'lucide-react';

interface AuthSyncBannerProps {
  onOpenAuth: (tab: 'signin' | 'register' | 'info') => void;
}

export function AuthSyncBanner({ onOpenAuth }: AuthSyncBannerProps) {
  const user = useStore((state) => state.user);
  const isBannerDismissed = useStore((state) => state.isBannerDismissed);
  const setBannerDismissed = useStore((state) => state.setBannerDismissed);
  const runs = useStore((state) => state.runs);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    return subscribeSyncStatus((status) => {
      setSyncStatus(status);
      if (status === 'syncing') setIsSyncing(true);
      else setIsSyncing(false);
    });
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerFullSync();
    setIsSyncing(false);
  };

  // Fully linked (non-anonymous) user: do not render any adoption/sync banner
  if (user?.isLoggedIn && !user.email.includes('Anonymous')) {
    return null;
  }

  // Connected anonymous session state
  if (user?.isLoggedIn && user.email.includes('Anonymous')) {
    if (isBannerDismissed) {
      return null;
    }

    return (
      <div className="mb-4 p-3 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-purple-950/40 border border-indigo-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-indigo-950/20 animate-fadeIn">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            {syncStatus === 'synced' ? (
              <CloudCheck className="w-4 h-4 text-emerald-400" />
            ) : syncStatus === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                Anonymous Cloud Session
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                syncStatus === 'synced'
                  ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
                  : syncStatus === 'syncing'
                  ? 'text-indigo-400 bg-indigo-950/80 border-indigo-800/60'
                  : syncStatus === 'offline'
                  ? 'text-amber-400 bg-amber-950/80 border-amber-800/60'
                  : 'text-rose-400 bg-rose-950/80 border-rose-800/60'
              }`}>
                {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'offline' ? 'Offline' : 'Sync Error'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Device Session • {runs.length} runs backed up (Link email to persist across browser resets)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 border border-zinc-700/60 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Link Email
          </button>
          <button
            onClick={() => setBannerDismissed(true)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Collapsed state
  if (isBannerDismissed) {
    return (
      <div className="mb-4 flex items-center justify-between px-3 py-2 bg-indigo-950/20 border border-indigo-900/30 hover:border-indigo-800/50 rounded-lg text-xs text-zinc-400 transition-all">
        <div className="flex items-center space-x-2">
          <Cloud className="w-3.5 h-3.5 text-indigo-400" />
          <span>Local storage active. Want to sync across devices?</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setBannerDismissed(false);
              onOpenAuth('register');
            }}
            className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Enable Cloud Sync <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setBannerDismissed(false)}
            className="text-zinc-500 hover:text-zinc-300 text-[11px] cursor-pointer"
            title="Expand banner"
          >
            Expand
          </button>
        </div>
      </div>
    );
  }

  // Expanded call-to-action
  return (
    <div className="relative mb-6 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-slate-50 dark:from-indigo-950/80 dark:via-purple-950/60 dark:to-zinc-900/90 border border-indigo-200 dark:border-indigo-500/40 shadow-xl shadow-indigo-100 dark:shadow-indigo-950/40 overflow-hidden animate-fadeIn">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={() => setBannerDismissed(true)}
        className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors z-10 cursor-pointer"
        title="Dismiss banner"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-0">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30">
              <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              Online Cloud Sync
            </span>
            <span className="text-slate-400 dark:text-zinc-500 text-xs hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:inline">Access your Tower planner anywhere</span>
          </div>

          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Save Your Data Online & Review Anywhere
          </h2>

          <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
            Never lose your logged runs, lab queue timers, and build states. Attach an email to sync your planner seamlessly across devices.
          </p>

          {/* Benefit Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/70 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-300">
              <Smartphone className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Mobile & Desktop Sync</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/70 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-300">
              <Shield className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>Safe Cloud Backup</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/70 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-300">
              <Cloud className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Always in Sync</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row sm:flex-row lg:flex-col shrink-0 gap-2.5 pt-2 lg:pt-0">
          <button
            onClick={() => onOpenAuth('register')}
            className="flex-1 lg:w-44 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Link Email Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
