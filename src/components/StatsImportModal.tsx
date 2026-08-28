import { useState } from 'react';
import { parseAccountStatsText, type ParsedLifetimeStats } from '../domain/statsParser';
import { 
  X, 
  FileText, 
  Check, 
  Trophy, 
  Award, 
  Sparkles, 
  Info
} from 'lucide-react';
import { CurrencyIcon } from './CurrencyIcon';

interface StatsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (stats: ParsedLifetimeStats) => void;
}

export function StatsImportModal({
  isOpen,
  onClose,
  onImport,
}: StatsImportModalProps) {
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<ParsedLifetimeStats | null>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setPastedText(text);
    if (text.trim().length > 10) {
      const result = parseAccountStatsText(text);
      setParsedPreview(result);
    } else {
      setParsedPreview(null);
    }
  };

  const formatNumber = (num?: number): string => {
    if (num === undefined) return '—';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const handleConfirm = () => {
    if (parsedPreview) {
      onImport(parsedPreview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-600/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Import Lifetime Account Stats
              </h3>
              <p className="text-xs text-slate-400">
                Copy and paste text directly from <strong className="text-slate-300">Settings &gt; Stats</strong> in The Tower.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Instructions Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Open the game &rarr; tap the top-right Gear icon &rarr; tap <strong>Stats</strong> &rarr; copy the text block or type your highest wave milestones (e.g. <em>Tier 1 Highest Wave: 5,420</em>).
            </p>
          </div>

          {/* Paste Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Paste Stats Text
            </label>
            <textarea
              rows={5}
              value={pastedText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="Paste game stats here...
Example:
Total Coins: 45.2T
Power Stones: 12,450
Tier 1 Highest Wave: 6,500
Tier 2 Highest Wave: 4,800
Tier 10 Highest Wave: 4,520"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Live Parsed Preview */}
          {parsedPreview && (
            <div className="space-y-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 animate-fadeIn">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Parsed Account Summary
              </h4>

              {/* Currency & Kill Totals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium block">Total Coins</span>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                    <CurrencyIcon currency="coins" size="xs" />
                    {formatNumber(parsedPreview.totalCoins)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium block">Power Stones</span>
                  <span className="text-xs font-mono font-bold text-teal-400 flex items-center gap-1 mt-0.5">
                    <CurrencyIcon currency="stones" size="xs" />
                    {formatNumber(parsedPreview.totalStones)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium block">Gems</span>
                  <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1 mt-0.5">
                    <CurrencyIcon currency="gems" size="xs" />
                    {formatNumber(parsedPreview.totalGems)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium block">Elite Cells</span>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                    <CurrencyIcon currency="cells" size="xs" />
                    {formatNumber(parsedPreview.totalCells)}
                  </span>
                </div>
              </div>

              {/* Tier Max Wave Badges */}
              {Object.keys(parsedPreview.tierMaxWaves).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300">
                    Highest Waves by Tier ({Object.keys(parsedPreview.tierMaxWaves).length} Tiers Recognized)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(parsedPreview.tierMaxWaves).map(([tier, wave]) => (
                      <span
                        key={tier}
                        className="px-2 py-1 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold flex items-center gap-1.5"
                      >
                        <Award className="w-3 h-3 text-indigo-400" />
                        <span>T{tier}:</span>
                        <strong className="text-white">{wave.toLocaleString()}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            disabled={!parsedPreview}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-amber-600/30 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Import Career Stats
          </button>
        </div>

      </div>
    </div>
  );
}
