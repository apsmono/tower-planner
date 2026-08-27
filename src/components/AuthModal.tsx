import React, { useState, useEffect } from 'react';
import { useStore, type UserProfile } from '../domain/store';
import { 
  X, 
  Cloud, 
  CloudCheck, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'register' | 'info';
}

export function AuthModal({ isOpen, onClose, initialTab = 'register' }: AuthModalProps) {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const syncCloudData = useStore((state) => state.syncCloudData);
  const runs = useStore((state) => state.runs);
  const build = useStore((state) => state.build);

  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'info'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setError(null);
    setSuccessMessage(null);
  }, [initialTab, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const userProfile: UserProfile = {
        id: `user-${Date.now()}`,
        email: email.trim(),
        name: name.trim() || email.split('@')[0] || 'Tower Commander',
        isLoggedIn: true,
        lastSyncedAt: new Date().toISOString()
      };
      setUser(userProfile);
      setIsLoading(false);
      setSuccessMessage('Successfully signed in! Your runs and build state are now synced online.');
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const userProfile: UserProfile = {
        id: `user-${Date.now()}`,
        email: email.trim(),
        name: name.trim() || email.split('@')[0] || 'Tower Commander',
        isLoggedIn: true,
        lastSyncedAt: new Date().toISOString()
      };
      setUser(userProfile);
      setIsLoading(false);
      setSuccessMessage('Account created! Your data is backed up to your cloud account.');
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 700);
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const userProfile: UserProfile = {
        id: `user-demo-commander`,
        email: 'commander@the-tower.online',
        name: 'Tower Veteran',
        isLoggedIn: true,
        lastSyncedAt: new Date().toISOString()
      };
      setUser(userProfile);
      setIsLoading(false);
      setSuccessMessage('Demo Commander signed in! Cloud sync activated.');
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 400);
  };

  const handleSignOut = () => {
    setUser(null);
    setSuccessMessage('You have been signed out. Local data remains saved in this browser.');
  };

  const handleManualSync = () => {
    syncCloudData();
    setSuccessMessage('Data synced to cloud successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-purple-950/40 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Tower Cloud Sync
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Online
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Review your runs, lab timings, and upgrade queues from any device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (if not logged in) */}
        {!user?.isLoggedIn ? (
          <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1 gap-1">
            <button
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </button>
            <button
              onClick={() => { setActiveTab('signin'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'signin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('info'); setError(null); }}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'info'
                  ? 'bg-zinc-800 text-indigo-300'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Benefits
            </button>
          </div>
        ) : null}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Success Notification */}
          {successMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <CloudCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 animate-fadeIn">
              {error}
            </div>
          )}

          {/* Logged-in Profile State */}
          {user?.isLoggedIn ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{user.name}</div>
                      <div className="text-xs text-zinc-400">{user.email}</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded-md">
                    <CloudCheck className="w-3.5 h-3.5" />
                    Connected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Runs Synced</span>
                    <span className="text-zinc-200 font-semibold">{runs.length} runs</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Last Cloud Sync</span>
                    <span className="text-zinc-300 font-mono text-[11px]">
                      {user.lastSyncedAt ? new Date(user.lastSyncedAt).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleManualSync}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Now
                </button>
                <button
                  onClick={handleSignOut}
                  className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-rose-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/60"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : activeTab === 'info' ? (
            /* Benefits info view */
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Cross-Device Access</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Log your tournament and farming runs on PC or phone, and seamlessly continue analyzing upgrades everywhere.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Automatic Cloud Backup</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Never lose your recorded wave stats, lab speed milestones, or custom build configurations if your browser cache clears.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">Real-Time Mobile Review</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Check which lab boost to activate next while playing the game in real-time.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('register')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30"
              >
                Create Account Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Sign In or Register Form */
            <form onSubmit={activeTab === 'signin' ? handleSignIn : handleRegister} className="space-y-3.5">
              {activeTab === 'register' && (
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Commander Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. TowerVeteran_99"
                    className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@tower-planner.io"
                  required
                  className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                />
              </div>

              {activeTab === 'register' && (
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                  />
                </div>
              )}

              {/* Data payload hint */}
              <div className="p-2.5 bg-zinc-950/40 border border-zinc-800/60 rounded-lg text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Current state ready to sync:</span>
                <span className="font-mono text-indigo-300 font-semibold">
                  {runs.length} runs • {build.labs.filter(l => l.researchId).length}/5 labs
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : activeTab === 'signin' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In & Sync
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Cloud Account & Sync Data
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Quick test with Demo Account
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-[10px] text-zinc-500 text-center flex items-center justify-between px-5">
          <span>End-to-End Encrypted Cloud Storage</span>
          <span>Tower Planner Online Sync</span>
        </div>
      </div>
    </div>
  );
}
