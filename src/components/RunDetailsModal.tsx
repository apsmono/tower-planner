import { useState, useMemo, useEffect } from 'react';
import { type Run, useStore } from '../domain/store';
import { getField } from '../domain/parser';
import { getTournamentRewards } from '../domain/tournamentModel';
import { CurrencyIcon } from './CurrencyIcon';
import {
  X,
  ArrowLeft,
  Clock,
  Shield,
  Swords,
  Skull,
  FileText,
  Edit3,
  Copy,
  Check,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Trophy,
  Activity,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RunDetailsModalProps {
  run: Run | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Run>) => void;
}

type TabType = 'overview' | 'combat' | 'defense' | 'enemies' | 'all_fields' | 'raw_text' | 'edit';

export function RunDetailsModal({
  run,
  isOpen,
  onClose,
  onDelete,
  onUpdate
}: RunDetailsModalProps) {
  const storeUpdateRun = useStore((state) => state.updateRun);
  const storeDeleteRun = useStore((state) => state.deleteRun);

  const updateHandler = onUpdate || storeUpdateRun;
  const deleteHandler = onDelete || storeDeleteRun;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [fieldSearch, setFieldSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isRawTextExpanded, setIsRawTextExpanded] = useState(true);

  // Edit state initialized when run changes
  const [editRunType, setEditRunType] = useState<'farm' | 'tournament' | 'milestone' | 'event'>('farm');
  const [editBracket, setEditBracket] = useState<string>('');
  const [editRank, setEditRank] = useState<number | ''>('');
  const [editDissonance, setEditDissonance] = useState<number>(1.0);
  const [editExcluded, setEditExcluded] = useState<boolean>(false);
  const [editGameVersion, setEditGameVersion] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editSaveSuccess, setEditSaveSuccess] = useState(false);

  useEffect(() => {
    if (run) {
      setEditRunType(run.runType);
      setEditBracket(run.tournament?.bracket || '');
      setEditRank(run.tournament?.rank ?? '');
      setEditDissonance(run.dissonanceMultiplier || 1.0);
      setEditExcluded(run.excluded);
      setEditGameVersion(run.gameVersion || '');
      setEditNotes(run.notes || '');
      setConfirmDelete(false);
      setEditSaveSuccess(false);
      setActiveTab('overview');
    }
  }, [run]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Helpers
  const formatCompact = (num: number): string => {
    if (isNaN(num)) return '0';
    if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0s';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  const hours = run ? run.realTimeSec / 3600 : 0;
  const coinsVal = run ? getField(run.fields, 'coinsEarned') : 0;
  const cellsVal = run ? getField(run.fields, 'cellsEarned') : 0;
  const coinsHrNormalized = (run && hours > 0) ? (coinsVal / run.dissonanceMultiplier) / hours : 0;
  const coinsHrRaw = (run && hours > 0) ? coinsVal / hours : 0;
  const cellsHr = (run && hours > 0) ? cellsVal / hours : 0;
  const gameSpeed = (run && run.realTimeSec > 0) ? (run.gameTimeSec / run.realTimeSec) : 0;

  // Generate complete display raw report text (with fallback reconstruction if rawText was empty)
  const displayRawText = useMemo(() => {
    if (!run) return '';
    if (run.rawText && run.rawText.trim().length > 0) return run.rawText;

    const lines: string[] = ['Battle Report'];
    if (run.battleDate) lines.push(`Battle Date\t${run.battleDate}`);
    lines.push(`Game Time\t${formatDuration(run.gameTimeSec)}`);
    lines.push(`Real Time\t${formatDuration(run.realTimeSec)}`);
    lines.push(`Tier\t${run.tier}${run.tierSuffix || ''}`);
    lines.push(`Wave\t${run.wave}`);
    if (run.killedBy) lines.push(`Killed By\t${run.killedBy}`);

    if (run.raw && Object.keys(run.raw).length > 0) {
      let currentSec = '';
      for (const [scopedKey, val] of Object.entries(run.raw)) {
        if (scopedKey.includes('::')) {
          const [sec, label] = scopedKey.split('::');
          if (sec !== currentSec && sec !== 'Battle Report') {
            currentSec = sec;
            lines.push(`\n${sec}`);
          }
          lines.push(`${label}\t${val}`);
        } else {
          lines.push(`${scopedKey}\t${val}`);
        }
      }
    } else if (run.fields) {
      for (const [key, val] of Object.entries(run.fields)) {
        lines.push(`${key}\t${val}`);
      }
    }
    return lines.join('\n');
  }, [run]);

  const tourneyRewards = useMemo(() => {
    if (!run || run.runType !== 'tournament') return null;
    return getTournamentRewards(run.tournament?.bracket || 'Champion', run.tournament?.rank ?? null);
  }, [run]);

  // UW Damage breakdown extraction
  const uwDamageList = useMemo(() => {
    if (!run) return [];
    const totalDmg = getField(run.fields, 'damageDealt') || 1;
    
    const sources = [
      { name: 'Projectiles', value: getField(run.fields, 'projectilesDamage'), color: 'bg-blue-500' },
      { name: 'Smart Missiles', value: getField(run.fields, 'smartMissileDamage'), color: 'bg-orange-500' },
      { name: 'Chain Lightning', value: getField(run.fields, 'chainLightningDamage'), color: 'bg-sky-400' },
      { name: 'Death Wave', value: getField(run.fields, 'deathWaveDamage'), color: 'bg-rose-500' },
      { name: 'Poison Swamp', value: getField(run.fields, 'swampDamage'), color: 'bg-emerald-500' },
      { name: 'Black Hole', value: getField(run.fields, 'blackHoleDamage'), color: 'bg-purple-500' },
      { name: 'Death Ray', value: getField(run.fields, 'deathRayDamage'), color: 'bg-pink-500' },
      { name: 'Land Mines', value: getField(run.fields, 'landMineDamage'), color: 'bg-amber-500' },
      { name: 'Inner Land Mines', value: getField(run.fields, 'innerLandMineDamage'), color: 'bg-amber-600' },
      { name: 'Thorns', value: getField(run.fields, 'thornDamage'), color: 'bg-teal-500' },
      { name: 'Orbs', value: getField(run.fields, 'orbDamage'), color: 'bg-indigo-500' },
      { name: 'Electrons', value: getField(run.fields, 'electronsDamage'), color: 'bg-cyan-400' },
      { name: 'Flame Bot', value: getField(run.fields, 'flameBotDamage'), color: 'bg-red-500' },
      { name: 'Rend Armor', value: getField(run.fields, 'rendArmorDamage'), color: 'bg-lime-500' },
    ].filter((s) => s.value > 0);

    return sources.map((s) => ({
      ...s,
      percent: totalDmg > 0 ? (s.value / totalDmg) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [run]);

  // UW Coin Sources breakdown extraction
  const uwCoinSources = useMemo(() => {
    if (!run) return [];
    const totalCoins = getField(run.fields, 'coinsEarned') || 1;

    const sources = [
      { name: 'Golden Tower', value: getField(run.fields, 'coinsFromGoldenTower'), color: 'text-amber-400' },
      { name: 'Black Hole Bonus', value: getField(run.fields, 'coinsFromBlackhole'), color: 'text-purple-400' },
      { name: 'Death Wave', value: getField(run.fields, 'coinsFromDeathWave'), color: 'text-rose-400' },
      { name: 'Spotlight', value: getField(run.fields, 'coinsFromSpotlight'), color: 'text-yellow-400' },
      { name: 'Golden Bot', value: getField(run.fields, 'goldenBotCoinsEarned'), color: 'text-amber-300' },
      { name: 'Orbs', value: getField(run.fields, 'coinsFromOrbs'), color: 'text-indigo-400' },
      { name: 'Coin Upgrade', value: getField(run.fields, 'coinsFromCoinUpgrade'), color: 'text-emerald-400' },
      { name: 'Coin Bonuses', value: getField(run.fields, 'coinsFromCoinBonuses'), color: 'text-teal-400' },
      { name: 'Coins Stolen', value: getField(run.fields, 'coinsStolen'), color: 'text-cyan-400' },
      { name: 'Coins Fetched', value: getField(run.fields, 'coinsFetched'), color: 'text-blue-400' },
    ].filter((s) => s.value > 0);

    return sources.map((s) => ({
      ...s,
      percent: totalCoins > 0 ? (s.value / totalCoins) * 100 : 0
    })).sort((a, b) => b.value - a.value);
  }, [run]);

  // All grouped raw fields
  const allGroupedFields = useMemo(() => {
    if (!run) return [];
    const groups: Record<string, { key: string; label: string; value: number | string; rawStr?: string }[]> = {};

    // 1. Group from fields map
    if (run.fields) {
      for (const [scopedKey, numVal] of Object.entries(run.fields)) {
        let section = 'General';
        let label = scopedKey;
        if (scopedKey.includes('::')) {
          const parts = scopedKey.split('::');
          section = parts[0];
          label = parts[1];
        }
        if (!groups[section]) groups[section] = [];
        
        const rawMatch = run.raw ? run.raw[`${section}::${label}`] || run.raw[label] : undefined;

        groups[section].push({
          key: scopedKey,
          label,
          value: numVal,
          rawStr: rawMatch
        });
      }
    }

    // 2. Add raw keys that weren't in fields
    if (run.raw) {
      for (const [scopedRawKey, rawVal] of Object.entries(run.raw)) {
        let section = 'Raw Entries';
        let label = scopedRawKey;
        if (scopedRawKey.includes('::')) {
          const parts = scopedRawKey.split('::');
          section = parts[0];
          label = parts[1];
        }
        if (!groups[section]) groups[section] = [];
        
        const exists = groups[section].some((item) => item.label.toLowerCase() === label.toLowerCase());
        if (!exists) {
          groups[section].push({
            key: scopedRawKey,
            label,
            value: rawVal,
            rawStr: rawVal
          });
        }
      }
    }

    return Object.entries(groups).map(([section, items]) => ({
      section,
      items: items.filter((item) => {
        if (!fieldSearch.trim()) return true;
        const q = fieldSearch.toLowerCase();
        return (
          section.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          String(item.value).toLowerCase().includes(q)
        );
      })
    })).filter((group) => group.items.length > 0);
  }, [run, fieldSearch]);

  const handleCopyRaw = () => {
    if (!displayRawText) return;
    navigator.clipboard.writeText(displayRawText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopySummary = () => {
    if (!run) return;
    const summary = [
      `Tower Battle Report Summary:`,
      `Tier: T${run.tier}${run.tierSuffix || ''} | Wave: ${run.wave.toLocaleString()}`,
      `Date: ${run.battleDate || new Date(run.importedAt).toLocaleString()}`,
      `Duration: Real ${formatDuration(run.realTimeSec)} (Game ${formatDuration(run.gameTimeSec)})`,
      `Coins Earned: ${formatCompact(coinsVal)} (${formatCompact(coinsHrNormalized)}/hr norm)`,
      `Cells Earned: ${formatCompact(cellsVal)} (${formatCompact(cellsHr)}/hr)`,
      `Killed By: ${run.killedBy || 'Unknown'}`,
      run.runType === 'tournament' ? `Tournament: ${run.tournament?.bracket || 'Champion'} Rank #${run.tournament?.rank || 'N/A'}` : `Type: ${run.runType}`,
      run.notes ? `Notes: ${run.notes}` : ''
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Quick switch run type handlers
  const handleQuickSetRunType = (type: 'farm' | 'tournament' | 'milestone' | 'event') => {
    if (!run) return;
    if (type === 'tournament') {
      updateHandler(run.id, {
        runType: 'tournament',
        tournament: run.tournament || { bracket: 'Champion', rank: null }
      });
      setEditRunType('tournament');
    } else if (type === 'milestone') {
      updateHandler(run.id, {
        runType: 'milestone',
        tournament: null
      });
      setEditRunType('milestone');
    } else if (type === 'event') {
      updateHandler(run.id, {
        runType: 'event',
        tournament: null
      });
      setEditRunType('event');
    } else {
      updateHandler(run.id, {
        runType: 'farm',
        tournament: null
      });
      setEditRunType('farm');
    }
  };

  const handleQuickUpdateTournamentBracket = (bracket: string) => {
    if (!run) return;
    updateHandler(run.id, {
      tournament: {
        bracket: bracket || null,
        rank: run.tournament?.rank ?? null
      }
    });
  };

  const handleQuickUpdateTournamentRank = (rankVal: number | null) => {
    if (!run) return;
    updateHandler(run.id, {
      tournament: {
        bracket: run.tournament?.bracket || 'Champion',
        rank: rankVal
      }
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!run) return;

    const updates: Partial<Run> = {
      runType: editRunType,
      tournament: editRunType === 'tournament' ? {
        bracket: editBracket || null,
        rank: typeof editRank === 'number' ? editRank : null
      } : null,
      dissonanceMultiplier: Math.max(1.0, editDissonance || 1.0),
      excluded: editExcluded,
      gameVersion: editGameVersion.trim() || null,
      notes: editNotes.trim()
    };

    updateHandler(run.id, updates);
    setEditSaveSuccess(true);
    setTimeout(() => setEditSaveSuccess(false), 3000);
  };

  const handleDelete = () => {
    if (!run) return;
    deleteHandler(run.id);
    onClose();
  };

  if (!isOpen || !run) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-indigo-500/40 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-zinc-200 glow-indigo">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex flex-wrap items-start justify-between gap-3 bg-zinc-900/70">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-600/30 text-indigo-300 font-mono font-bold border border-indigo-500/40">
                T{run.tier}{run.tierSuffix}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Wave {run.wave.toLocaleString()}</span>
              </h2>

              {/* Run Type Dropdown */}
              <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs font-mono">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Type:</span>
                <select
                  value={run.runType}
                  onChange={(e) => handleQuickSetRunType(e.target.value as any)}
                  className="bg-transparent text-zinc-100 font-bold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="farm" className="bg-zinc-900 text-zinc-100">🚜 Farm Run</option>
                  <option value="tournament" className="bg-zinc-900 text-cyan-300">🏆 Tournament</option>
                  <option value="milestone" className="bg-zinc-900 text-amber-300">🎯 Milestone</option>
                  <option value="event" className="bg-zinc-900 text-rose-300">🎟️ Event / Mission</option>
                </select>
              </div>

              {/* Tournament quick league dropdown if tournament */}
              {run.runType === 'tournament' && (
                <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/50 rounded-lg px-2.5 py-1 text-xs font-mono animate-fadeIn">
                  <span className="text-[10px] text-cyan-400 uppercase font-semibold">League:</span>
                  <select
                    value={run.tournament?.bracket || 'Champion'}
                    onChange={(e) => handleQuickUpdateTournamentBracket(e.target.value)}
                    className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="Copper" className="bg-zinc-900 text-zinc-200">Copper</option>
                    <option value="Silver" className="bg-zinc-900 text-zinc-200">Silver</option>
                    <option value="Gold" className="bg-zinc-900 text-zinc-200">Gold</option>
                    <option value="Platinum" className="bg-zinc-900 text-zinc-200">Platinum</option>
                    <option value="Champion" className="bg-zinc-900 text-zinc-200">Champion</option>
                    <option value="Legend" className="bg-zinc-900 text-zinc-200">Legend</option>
                    <option value="Mythic" className="bg-zinc-900 text-zinc-200">Mythic</option>
                  </select>
                  <span className="text-zinc-600">|</span>
                  <span className="text-[10px] text-purple-400 uppercase font-semibold">Rank:</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    placeholder="#1-30"
                    value={run.tournament?.rank ?? ''}
                    onChange={(e) => handleQuickUpdateTournamentRank(parseInt(e.target.value, 10) || null)}
                    className="w-14 bg-transparent text-purple-300 placeholder-zinc-500 focus:outline-none text-center font-bold"
                    title="Set final rank place (1-30)"
                  />
                </div>
              )}

              {run.dissonanceMultiplier > 1.0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/40" title="Dissonance Bonus multiplier">
                  x{run.dissonanceMultiplier.toFixed(2)} Diss.
                </span>
              )}

              {run.excluded && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono bg-rose-950/60 text-rose-400 border border-rose-800/40">
                  Excluded
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 font-mono">
              <span>Date: <strong className="text-zinc-200">{run.battleDate || new Date(run.importedAt).toLocaleString()}</strong></span>
              {run.killedBy && (
                <span>Killed by: <strong className="text-rose-400">{run.killedBy}</strong></span>
              )}
              {run.gameVersion && (
                <span>Game Ver: <strong className="text-zinc-300">v{run.gameVersion}</strong></span>
              )}
            </div>
          </div>

          {/* Quick Header Actions: Explicit Back Button + Copy + Close */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-mono font-semibold border border-indigo-500/50 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Return to runs table"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Table</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono border border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted summary to clipboard"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedSummary ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top KPI Cards Banner */}
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800/80 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Coins Earned Card */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
              <CurrencyIcon currency="coins" size="xs" />
              <span>Coins Earned</span>
            </span>
            <div className="text-lg font-bold font-mono text-amber-400">
              {formatCompact(coinsVal)}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
              <span className="text-amber-500 font-semibold">{formatCompact(coinsHrNormalized)}/h</span>
              {run.dissonanceMultiplier > 1.0 && (
                <span className="text-[10px] text-zinc-500" title={`Raw rate before dissonance: ${formatCompact(coinsHrRaw)}/h`}>
                  (norm)
                </span>
              )}
            </div>
          </div>

          {/* Cells Earned Card */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
              <CurrencyIcon currency="cells" size="xs" />
              <span>Cells Earned</span>
            </span>
            <div className="text-lg font-bold font-mono text-purple-400">
              {formatCompact(cellsVal)}
            </div>
            <div className="text-[11px] text-purple-400/90 font-mono font-semibold">
              {formatCompact(cellsHr)}/h
            </div>
          </div>

          {/* Durations & Speed Card */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Run Duration</span>
            </span>
            <div className="text-base font-bold font-mono text-zinc-100">
              {formatDuration(run.realTimeSec)}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
              <span>Game: {formatDuration(run.gameTimeSec)}</span>
              {gameSpeed > 0 && (
                <span className="text-indigo-400 font-semibold">({gameSpeed.toFixed(1)}x)</span>
              )}
            </div>
          </div>

          {/* Survival / Damage Card */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
              <Skull className="w-3 h-3 text-rose-400" />
              <span>Death & Waves</span>
            </span>
            <div className="text-base font-bold font-mono text-white truncate">
              {run.killedBy || 'Ended'}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              Tier {run.tier}{run.tierSuffix} @ Wave {run.wave.toLocaleString()}
            </div>
          </div>

          {/* Tournament Rewards or Cash/Interest */}
          {tourneyRewards ? (
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-cyan-900/40 space-y-1 col-span-2 md:col-span-4 lg:col-span-1">
              <span className="text-[10px] text-cyan-400 font-mono uppercase flex items-center gap-1">
                <Trophy className="w-3 h-3 text-cyan-400" />
                <span>Tourney Rewards</span>
              </span>
              <div className="flex items-center gap-3 font-mono text-xs pt-0.5">
                <span className="text-purple-400 flex items-center gap-1">
                  <CurrencyIcon currency="gems" size="xs" />
                  <strong>{tourneyRewards.gems}</strong>
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CurrencyIcon currency="stones" size="xs" />
                  <strong>{tourneyRewards.stones}</strong>
                </span>
                {tourneyRewards.keys > 0 && (
                  <span className="text-rose-400 flex items-center gap-1">
                    <CurrencyIcon currency="keys" size="xs" />
                    <strong>{tourneyRewards.keys}</strong>
                  </span>
                )}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                {run.tournament?.bracket || 'Champion'} #{run.tournament?.rank || '?'}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1 col-span-2 md:col-span-4 lg:col-span-1">
              <span className="text-[10px] text-zinc-400 font-mono uppercase flex items-center gap-1">
                <CurrencyIcon currency="cash" size="xs" />
                <span>Cash & Shards</span>
              </span>
              <div className="text-base font-bold font-mono text-emerald-400">
                ${formatCompact(getField(run.fields, 'cashEarned'))}
              </div>
              <div className="text-[11px] text-purple-400 font-mono flex items-center gap-1">
                <span>Rerolls: +{getField(run.fields, 'rerollShardsEarned') || getField(run.fields, 'rerollShards')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Segmented Pill Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 border-b border-zinc-800/80 bg-zinc-900/60 p-2.5 px-4 overflow-x-auto">
          {[
            { id: 'overview' as const, label: 'Overview & Economy', icon: Sparkles },
            { id: 'combat' as const, label: 'Combat & Damage', icon: Swords },
            { id: 'defense' as const, label: 'Defense & Upgrades', icon: Shield },
            { id: 'enemies' as const, label: 'Enemies & Spawns', icon: Activity },
            { id: 'all_fields' as const, label: 'All Raw Fields', icon: Layers },
            { id: 'raw_text' as const, label: 'Report Text', icon: FileText },
            { id: 'edit' as const, label: 'Edit Metadata', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                    : 'bg-zinc-950/40 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* Sub-tab Navigation Header if not on Overview */}
          {activeTab !== 'overview' && (
            <div className="p-2.5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-400">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span className="text-zinc-200 capitalize font-medium">
                  {activeTab === 'all_fields' ? 'All Raw Fields' : activeTab === 'raw_text' ? 'Report Text' : activeTab === 'edit' ? 'Edit Metadata' : activeTab}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                title="Return to runs table"
              >
                <span>Back to Table</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW & ECONOMY */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Notes Banner if present */}
              {run.notes && (
                <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono font-bold uppercase text-indigo-300 block text-[10px]">Run Notes</span>
                    <p className="mt-0.5 leading-relaxed">{run.notes}</p>
                  </div>
                </div>
              )}

              {/* Economy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Coin Breakdown by Ultimate Weapon */}
                <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                    <CurrencyIcon currency="coins" size="xs" />
                    <span>Coin Sources Breakdown</span>
                  </h4>
                  {uwCoinSources.length === 0 ? (
                    <p className="text-xs text-zinc-500 py-3">No specific coin source telemetry found in report.</p>
                  ) : (
                    <div className="space-y-2.5 pt-1">
                      {uwCoinSources.map((src) => (
                        <div key={src.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className={src.color}>{src.name}</span>
                            <span className="text-zinc-200 font-semibold">
                              {formatCompact(src.value)} ({src.percent.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${Math.min(100, src.percent)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Currency Totals & Cells */}
                <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-4">
                  <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Currencies & Upgrades Earned</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <span className="text-[10px] text-zinc-500 uppercase block">Cash Earned</span>
                      <span className="text-emerald-400 font-bold text-sm">${formatCompact(getField(run.fields, 'cashEarned'))}</span>
                    </div>

                    <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <span className="text-[10px] text-zinc-500 uppercase block">Interest Earned</span>
                      <span className="text-emerald-400 font-bold text-sm">${formatCompact(getField(run.fields, 'interestEarned'))}</span>
                    </div>

                    <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <span className="text-[10px] text-zinc-500 uppercase block">Gem Blocks Tapped</span>
                      <span className="text-purple-400 font-bold text-sm">+{getField(run.fields, 'gemBlocksTapped') || getField(run.fields, 'gems')} Gems</span>
                    </div>

                    <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <span className="text-[10px] text-zinc-500 uppercase block">Reroll Shards</span>
                      <span className="text-purple-400 font-bold text-sm">+{getField(run.fields, 'rerollShardsEarned') || getField(run.fields, 'rerollShards')}</span>
                    </div>

                    <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <span className="text-[10px] text-zinc-500 uppercase block">Cells From DW</span>
                      <span className="text-purple-300 font-bold text-sm">{formatCompact(getField(run.fields, 'cellsFromDeathWave'))}</span>
                    </div>

                    <div className="p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <span className="text-[10px] text-zinc-500 uppercase block">Cells From Global</span>
                      <span className="text-purple-300 font-bold text-sm">{formatCompact(getField(run.fields, 'cellsFromGlobal'))}</span>
                    </div>
                  </div>

                  {/* Modules & Shards Drops if present */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-2">Module & Shard Drops</span>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {getField(run.fields, 'cannonShards') > 0 && (
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-red-400">
                          Cannon: +{getField(run.fields, 'cannonShards')}
                        </span>
                      )}
                      {getField(run.fields, 'armorShards') > 0 && (
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-blue-400">
                          Armor: +{getField(run.fields, 'armorShards')}
                        </span>
                      )}
                      {getField(run.fields, 'generatorShards') > 0 && (
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-amber-400">
                          Generator: +{getField(run.fields, 'generatorShards')}
                        </span>
                      )}
                      {getField(run.fields, 'coreShards') > 0 && (
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-purple-400">
                          Core: +{getField(run.fields, 'coreShards')}
                        </span>
                      )}
                      {getField(run.fields, 'rareModules') > 0 && (
                        <span className="px-2 py-1 bg-blue-950/50 border border-blue-800/60 rounded text-blue-300">
                          Rare Mods: {getField(run.fields, 'rareModules')}
                        </span>
                      )}
                      {getField(run.fields, 'commonModules') > 0 && (
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                          Common Mods: {getField(run.fields, 'commonModules')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline Quick Raw Report Text Section on Overview */}
              <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-3.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold uppercase text-white">
                      Original Battle Report / Raw Text
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyRaw}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Copy raw text to clipboard"
                    >
                      {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRaw ? 'Copied' : 'Copy Text'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRawTextExpanded(!isRawTextExpanded)}
                      className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                      title={isRawTextExpanded ? 'Collapse report text' : 'Expand report text'}
                    >
                      {isRawTextExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isRawTextExpanded && (
                  <div className="p-3 bg-zinc-950/90">
                    <textarea
                      readOnly
                      value={displayRawText}
                      rows={8}
                      className="w-full bg-transparent border-0 text-xs font-mono text-zinc-300 focus:outline-none resize-none leading-relaxed select-all"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMBAT & DAMAGE */}
          {activeTab === 'combat' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Total Damage Dealt</span>
                  <div className="text-lg font-bold text-white">{formatCompact(getField(run.fields, 'damageDealt'))}</div>
                </div>
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Projectiles Fired</span>
                  <div className="text-lg font-bold text-blue-400">{formatCompact(getField(run.fields, 'projectilesCount'))}</div>
                </div>
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Lifesteal Recovered</span>
                  <div className="text-lg font-bold text-emerald-400">{formatCompact(getField(run.fields, 'lifesteal'))}</div>
                </div>
              </div>

              {/* Damage Sources Breakdown List */}
              <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
                <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-orange-400" />
                  <span>Damage Contribution by Weapon / Source</span>
                </h4>

                {uwDamageList.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4">No detailed damage breakdown reported for this run.</p>
                ) : (
                  <div className="space-y-3 pt-1">
                    {uwDamageList.map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-zinc-200 font-medium">{item.name}</span>
                          <span className="text-zinc-300 font-semibold">
                            {formatCompact(item.value)} ({item.percent.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all`}
                            style={{ width: `${Math.max(1, Math.min(100, item.percent))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEFENSE & UPGRADES */}
          {activeTab === 'defense' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Damage Taken (Tower)</span>
                  <span className="text-base font-bold text-rose-400">{formatCompact(getField(run.fields, 'damageTaken'))}</span>
                </div>
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Damage Taken (Wall)</span>
                  <span className="text-base font-bold text-blue-400">{formatCompact(getField(run.fields, 'damageTakenWall'))}</span>
                </div>
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">Death Defies</span>
                  <span className="text-base font-bold text-amber-400">{getField(run.fields, 'deathDefy')} procs</span>
                </div>
                <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block">HP From Death Wave</span>
                  <span className="text-base font-bold text-emerald-400">+{formatCompact(getField(run.fields, 'hpFromDeathWave'))}</span>
                </div>
              </div>

              {/* Utility Upgrades & Skip telemetry */}
              <div className="glass-panel p-5 rounded-xl border border-zinc-800 space-y-4">
                <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Free Upgrades & Utility Triggers</span>
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">Waves Skipped</span>
                    <span className="text-sm font-bold text-indigo-400">{getField(run.fields, 'wavesSkipped')} waves</span>
                  </div>

                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">Recovery Packages</span>
                    <span className="text-sm font-bold text-emerald-400">{getField(run.fields, 'recoveryPackages')}</span>
                  </div>

                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">Free Attack Upgrades</span>
                    <span className="text-sm font-bold text-red-400">{getField(run.fields, 'freeAttackUpgrade')}</span>
                  </div>

                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">Free Defense Upgrades</span>
                    <span className="text-sm font-bold text-blue-400">{getField(run.fields, 'freeDefenseUpgrade')}</span>
                  </div>

                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">Free Utility Upgrades</span>
                    <span className="text-sm font-bold text-amber-400">{getField(run.fields, 'freeUtilityUpgrade')}</span>
                  </div>

                  <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">Thunder Bot Stuns</span>
                    <span className="text-sm font-bold text-yellow-400">{getField(run.fields, 'thunderBotStuns')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENEMIES & SPAWNS */}
          {activeTab === 'enemies' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Enemy Composition */}
                <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold">Standard Enemies</h4>
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      Total: {formatCompact(getField(run.fields, 'totalEnemies'))}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Basic</span>
                      <span className="text-white font-bold">{formatCompact(getField(run.fields, 'basic'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Fast</span>
                      <span className="text-white font-bold">{formatCompact(getField(run.fields, 'fast'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Tank</span>
                      <span className="text-white font-bold">{formatCompact(getField(run.fields, 'tank'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Ranged</span>
                      <span className="text-white font-bold">{formatCompact(getField(run.fields, 'ranged'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Bosses</span>
                      <span className="text-amber-400 font-bold">{formatCompact(getField(run.fields, 'boss'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Protector</span>
                      <span className="text-blue-400 font-bold">{formatCompact(getField(run.fields, 'protector'))}</span>
                    </div>
                  </div>
                </div>

                {/* Elite Enemies Distribution */}
                <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold">Elite Enemies</h4>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      Total: {formatCompact(getField(run.fields, 'totalElites'))}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Vampires</span>
                      <span className="text-rose-400 font-bold">{formatCompact(getField(run.fields, 'vampires'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Rays</span>
                      <span className="text-purple-400 font-bold">{formatCompact(getField(run.fields, 'rays'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Scatters</span>
                      <span className="text-yellow-400 font-bold">{formatCompact(getField(run.fields, 'scatters'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Saboteurs</span>
                      <span className="text-emerald-400 font-bold">{formatCompact(getField(run.fields, 'saboteurs'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Commanders</span>
                      <span className="text-cyan-400 font-bold">{formatCompact(getField(run.fields, 'commanders'))}</span>
                    </div>
                    <div className="p-2 bg-zinc-950/60 border border-zinc-800 rounded">
                      <span className="text-[10px] text-zinc-500 uppercase block">Overcharges</span>
                      <span className="text-amber-400 font-bold">{formatCompact(getField(run.fields, 'overcharges'))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destruction Mechanisms */}
              <div className="glass-panel p-4 rounded-xl border border-zinc-800 space-y-3">
                <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold">Enemy Destruction Channels</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">By Orbs</span>
                    <span className="text-indigo-400 font-bold">{formatCompact(getField(run.fields, 'destroyedByOrbs'))}</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">By Thorns</span>
                    <span className="text-teal-400 font-bold">{formatCompact(getField(run.fields, 'destroyedByThorns'))}</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">By Death Ray</span>
                    <span className="text-pink-400 font-bold">{formatCompact(getField(run.fields, 'destroyedByRay'))}</span>
                  </div>
                  <div className="p-2.5 bg-zinc-950/60 border border-zinc-800 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase block">By Land Mines</span>
                    <span className="text-amber-400 font-bold">{formatCompact(getField(run.fields, 'destroyedByLandMine'))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ALL RAW & PARSED FIELDS */}
          {activeTab === 'all_fields' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search all parsed fields and raw entries..."
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {allGroupedFields.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 text-xs font-mono">
                  No fields match your search.
                </div>
              ) : (
                <div className="space-y-4">
                  {allGroupedFields.map((group) => (
                    <div key={group.section} className="glass-panel rounded-xl border border-zinc-800/80 overflow-hidden">
                      <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                        {group.section} ({group.items.length})
                      </div>
                      <div className="divide-y divide-zinc-800/50">
                        {group.items.map((item) => (
                          <div key={item.key} className="px-4 py-2 flex items-center justify-between text-xs font-mono hover:bg-zinc-900/20">
                            <span className="text-zinc-400">{item.label}</span>
                            <div className="text-right">
                              <span className="text-zinc-100 font-semibold font-mono">
                                {typeof item.value === 'number' ? formatCompact(item.value) : item.value}
                              </span>
                              {item.rawStr && typeof item.value === 'number' && item.rawStr !== String(item.value) && (
                                <span className="text-[10px] text-zinc-500 block font-mono">raw: "{item.rawStr}"</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: RAW REPORT TEXT */}
          {activeTab === 'raw_text' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">
                  Original raw text pasted during report import (parser v{run.parserVersion || 1})
                </span>
                <button
                  type="button"
                  onClick={handleCopyRaw}
                  className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRaw ? 'Copied Raw Text' : 'Copy Raw Text'}</span>
                </button>
              </div>

              <textarea
                readOnly
                value={displayRawText}
                rows={16}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed select-all"
              />
            </div>
          )}

          {/* TAB 7: EDIT METADATA */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveEdit} className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Run Type */}
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1">Run Classification</label>
                  <select
                    value={editRunType}
                    onChange={(e) => setEditRunType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="farm">🚜 Farm Run</option>
                    <option value="tournament">🏆 Tournament</option>
                    <option value="milestone">🎯 Milestone Push</option>
                    <option value="event">🎟️ Event / Mission</option>
                  </select>
                </div>

                {/* Dissonance Multiplier */}
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1">
                    Dissonance Multiplier (e.g. 1.0 for normal, 1.44 for +44% bonus)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    value={editDissonance}
                    onChange={(e) => setEditDissonance(parseFloat(e.target.value) || 1.0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                {/* If Tournament, show League and Rank */}
                {editRunType === 'tournament' && (
                  <>
                    <div>
                      <label className="text-xs font-mono text-zinc-400 uppercase block mb-1">Tournament League</label>
                      <select
                        value={editBracket}
                        onChange={(e) => setEditBracket(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none cursor-pointer font-mono"
                      >
                        <option value="">Unknown / Default</option>
                        <option value="Copper">Copper</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Champion">Champion</option>
                        <option value="Legend">Legend</option>
                        <option value="Mythic">Mythic</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-zinc-400 uppercase block mb-1">Final Placing / Rank (1-30)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        placeholder="e.g. 12"
                        value={editRank}
                        onChange={(e) => setEditRank(parseInt(e.target.value, 10) || '')}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Game Version */}
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1">Game Version</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.24.4"
                    value={editGameVersion}
                    onChange={(e) => setEditGameVersion(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Exclude toggle */}
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-2">Aggregate Inclusion</label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editExcluded}
                      onChange={(e) => setEditExcluded(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600 peer-checked:after:bg-white"></div>
                    <span className="ms-2.5 text-xs text-zinc-300 font-medium font-mono">
                      {editExcluded ? 'Excluded from charts & rates' : 'Included in aggregates'}
                    </span>
                  </label>
                </div>

                {/* Run Notes */}
                <div className="md:col-span-2">
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1">Run Notes / Perks / Strategy</label>
                  <textarea
                    rows={3}
                    placeholder="Add notes e.g. tested free upgrades build, banned speed perks, used auto pick rank..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                {editSaveSuccess ? (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Run metadata updated successfully!</span>
                  </span>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex flex-wrap items-center justify-between gap-3">
          {/* Exclusion quick toggle & Delete run */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => updateHandler(run.id, { excluded: !run.excluded })}
              className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 cursor-pointer"
              title="Quick toggle aggregate exclusion"
            >
              {run.excluded ? (
                <ToggleRight className="w-6 h-6 text-rose-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-zinc-600" />
              )}
              <span>{run.excluded ? 'Excluded' : 'Included'}</span>
            </button>

            {confirmDelete ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 text-xs font-mono border border-zinc-800 hover:border-rose-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Delete this run from the store"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Run</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Table</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
