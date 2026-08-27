import React, { useState, useEffect } from 'react';
import { useStore } from '../domain/store';
import { 
  signInWithEmailPassword, 
  signUpWithEmailPassword, 
  upgradeAccountWithEmail, 
  signOutUser,
  initAuth 
} from '../domain/authService';
import { triggerFullSync } from '../domain/syncEngine';
import { 
  X, 
  Cloud, 
  CloudCheck, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  UserPlus, 
  LogIn,
  RefreshCw,
  LogOut,
  Mail,
  Lock,
  User
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'register' | 'info';
}

export function AuthModal({ isOpen, onClose, initialTab = 'signin' }: AuthModalProps) {
  const user = useStore((state) => state.user);
  const runs = useStore((state) => state.runs);
  const build = useStore((state) => state.build);

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab === 'register' ? 'register' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
    if (initialTab === 'register') setActiveTab('register');
    else if (initialTab === 'signin') setActiveTab('signin');
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

  const isAnonymous = user?.email?.includes('Anonymous') || false;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await signInWithEmailPassword(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Signed in successfully! Local runs and build state adopted to cloud.');
      setTimeout(() => onClose(), 1500);
    } else {
      setError(res.error || 'Failed to sign in.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const res = await signUpWithEmailPassword(email.trim(), password, name.trim());
    setIsLoading(false);

    if (res.success) {
      if (res.needsEmailConfirmation) {
        setSuccessMessage('Account created! Please check your email to confirm your account before logging in.');
      } else {
        setSuccessMessage('Account created! Your data is now backed up to your cloud account.');
        setTimeout(() => onClose(), 1500);
      }
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const res = await upgradeAccountWithEmail(email.trim());
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(`Confirmation sent to ${email.trim()}. Click the link in your email to finalize.`);
    } else {
      setError(res.error || 'Failed to update account email.');
    }
  };

  const handleTryAnonymous = async () => {
    setIsLoading(true);
    await initAuth();
    setIsLoading(false);
    setSuccessMessage('Anonymous session initialized.');
    setTimeout(() => onClose(), 1000);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setSuccessMessage('Signed out. Local browser storage remains preserved.');
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    await triggerFullSync();
    setIsLoading(false);
    setSuccessMessage('Full cloud sync completed.');
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
                  PostgreSQL
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Sync and backup runs, lab timers, and build state
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Notifications */}
          {successMessage && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <CloudCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 animate-fadeIn">
              {error}
            </div>
          )}

          {/* User Already Logged In */}
          {user?.isLoggedIn ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{user?.name || 'Tower Commander'}</div>
                      <div className="text-xs text-zinc-400">{user?.email}</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded-md">
                    <CloudCheck className="w-3.5 h-3.5" />
                    {isAnonymous ? 'Anonymous Session' : 'Connected'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Runs Synced</span>
                    <span className="text-zinc-200 font-semibold">{runs.length} runs</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Active Labs</span>
                    <span className="text-zinc-300 font-mono text-[11px]">
                      {build.labs.filter((l) => l.researchId).length}/5 running
                    </span>
                  </div>
                </div>
              </div>

              {isAnonymous && (
                <form onSubmit={handleLinkEmail} className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Mail className="w-4 h-4" />
                    <span>Link Your Email</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Attach an email to access your data on another device and protect against browser cache clears.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="commander@the-tower.io"
                      required
                      className="flex-1 px-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Sending...' : 'Link'}</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleManualSync}
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Sync Now
                </button>
                <button
                  onClick={handleSignOut}
                  className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-rose-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/60 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* User Not Logged In: Form Tabs */
            <div className="space-y-4 animate-fadeIn">
              <div className="flex border-b border-zinc-800">
                <button
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'signin'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'register'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {activeTab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="commander@the-tower.io"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Signing In...' : 'Sign In & Sync'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Commander Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tower Veteran"
                        className="w-full pl-9 pr-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="commander@the-tower.io"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-zinc-600 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isLoading ? 'Creating...' : 'Create Account & Adopt Data'}</span>
                  </button>
                </form>
              )}

              <div className="pt-2 border-t border-zinc-800/60 text-center">
                <button
                  type="button"
                  onClick={handleTryAnonymous}
                  className="text-xs text-zinc-400 hover:text-indigo-400 underline transition-colors cursor-pointer"
                >
                  Or start with device anonymous session
                </button>
              </div>
            </div>
          )}

          {/* Value Proposers */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-zinc-400 text-center">
            <div className="p-2 bg-zinc-950/40 border border-zinc-800/60 rounded-lg">
              <Laptop className="w-3.5 h-3.5 mx-auto text-indigo-400 mb-1" />
              <span>Multi-Device</span>
            </div>
            <div className="p-2 bg-zinc-950/40 border border-zinc-800/60 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 mx-auto text-purple-400 mb-1" />
              <span>Local First</span>
            </div>
            <div className="p-2 bg-zinc-950/40 border border-zinc-800/60 rounded-lg">
              <Smartphone className="w-3.5 h-3.5 mx-auto text-emerald-400 mb-1" />
              <span>Zero Latency</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-[10px] text-zinc-500 text-center flex items-center justify-between px-5">
          <span>Encrypted PostgreSQL Sync</span>
          <span>Tower Planner v3</span>
        </div>
      </div>
    </div>
  );
}
