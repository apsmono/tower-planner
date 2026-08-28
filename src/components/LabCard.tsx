import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { LabDefinition } from '../data/labCatalog';
import { LabDatabase } from '../domain/labDatabase';
import { calculateLabCoinDiscount } from '../data/labLevelData';
import { useStore, type ResearchEntry } from '../domain/store';
import { CurrencyIcon } from './CurrencyIcon';
import { 
  ExternalLink, 
  Calculator, 
  Check, 
  Plus, 
  Clock, 
  Zap, 
  Sparkles,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface LabCardProps {
  lab: LabDefinition;
  onOpenCalculator: (labId: string) => void;
  cellBoost?: number;
}

/**
 * Custom Scrollable Level Picker with max-height restricted to 5-7 items
 */
function CustomLevelPicker({
  currentLevel,
  maxLevel,
  onSelect
}: {
  currentLevel: number;
  maxLevel: number;
  onSelect: (lvl: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Immediately set scrollTop without any animation
      if (selectedItemRef.current && listRef.current) {
        listRef.current.scrollTop = Math.max(0, selectedItemRef.current.offsetTop - 60);
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono font-bold flex items-center justify-between focus:border-indigo-500 focus:outline-none cursor-pointer transition-colors shadow-xs"
      >
        <span className="truncate">
          {currentLevel === 0 ? 'Lv.0 (Not Researched)' : `Lv.${currentLevel} ${currentLevel === maxLevel ? '(MAX)' : ''}`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 ml-1 shrink-0 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
      </button>

      {isOpen && (
        <div ref={listRef} className="absolute left-0 right-0 top-full mt-1 z-30 bg-zinc-950/95 border border-indigo-500/50 rounded-lg shadow-2xl shadow-black backdrop-blur-md max-h-[196px] overflow-y-auto p-1 space-y-0.5 glow-indigo">
          <button
            type="button"
            ref={currentLevel === 0 ? selectedItemRef : null}
            onClick={() => {
              onSelect(0);
              setIsOpen(false);
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono font-semibold transition-colors flex items-center justify-between cursor-pointer ${
              currentLevel === 0
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-300 hover:bg-zinc-850 hover:text-white'
            }`}
          >
            <span>Lv.0 (Not Researched)</span>
            {currentLevel === 0 && <Check className="w-3.5 h-3.5" />}
          </button>
          {Array.from({ length: maxLevel }, (_, i) => i + 1).map((lvl) => {
            const isSelected = currentLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                ref={isSelected ? selectedItemRef : null}
                onClick={() => {
                  onSelect(lvl);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-300 hover:bg-zinc-850 hover:text-white'
                }`}
              >
                <span>Lv.{lvl} {lvl === maxLevel ? '(MAX)' : ''}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LabCard({ lab, onOpenCalculator, cellBoost = 2.0 }: LabCardProps) {
  const build = useStore((state) => state.build);
  const updateResearchCatalog = useStore((state) => state.updateResearchCatalog);
  const addResearchCatalogItem = useStore((state) => state.addResearchCatalogItem);
  const removeResearchCatalogItem = useStore((state) => state.removeResearchCatalogItem);

  const existingEntry = build.researchCatalog.find((r) => r.id === lab.id);
  const currentLevel = existingEntry ? existingEntry.level : 0;
  const isMaxed = currentLevel >= lab.maxLevel;

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(currentLevel.toString());

  // Cursor-following Tooltip State
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Next level metrics
  const nextLevel = Math.min(lab.maxLevel, currentLevel + 1);
  const baseTime = !isMaxed ? LabDatabase.getLabBaseTime(lab.id, nextLevel) : 0;
  const effectiveTime = !isMaxed ? LabDatabase.getEffectiveTime(baseTime, build.labSpeedMultiplier || 1.0, cellBoost) : 0;
  
  const baseCost = !isMaxed ? LabDatabase.getLabCost(lab.id, nextLevel) : 0;
  const { costMultiplier } = calculateLabCoinDiscount(build.labCoinDiscountLevel ?? 0);
  const effectiveCost = Math.round(baseCost * costMultiplier);

  // Format compact numbers
  const formatCompact = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };

  const handleSetLevel = (newLevel: number) => {
    const safeLevel = Math.max(0, Math.min(lab.maxLevel, newLevel));
    const targetLvl = safeLevel >= lab.maxLevel ? lab.maxLevel : safeLevel + 1;
    const targetBaseTime = safeLevel >= lab.maxLevel ? 0 : LabDatabase.getLabBaseTime(lab.id, targetLvl);
    const targetCoinCost = safeLevel >= lab.maxLevel ? 0 : LabDatabase.getLabCost(lab.id, targetLvl);

    const updates: Partial<ResearchEntry> = {
      name: lab.name,
      level: safeLevel,
      targetLevel: targetLvl,
      change: safeLevel >= lab.maxLevel ? `Lv.${safeLevel} (Max)` : `Lv.${safeLevel} → Lv.${targetLvl}`,
      baseTimeSeconds: targetBaseTime,
      coinCost: targetCoinCost,
      effect: {
        channel: lab.defaultChannel || 'coins.global',
        from: 1.0,
        to: 1.05,
        kind: lab.defaultEffectKind || 'percent'
      },
      reason: lab.defaultReason
    };

    if (existingEntry) {
      updateResearchCatalog(lab.id, updates);
    } else {
      addResearchCatalogItem({
        id: lab.id,
        name: lab.name,
        level: safeLevel,
        targetLevel: targetLvl,
        change: safeLevel >= lab.maxLevel ? `Lv.${safeLevel} (Max)` : `Lv.${safeLevel} → Lv.${targetLvl}`,
        baseTimeSeconds: targetBaseTime,
        coinCost: targetCoinCost,
        effect: {
          channel: lab.defaultChannel || 'coins.global',
          from: 1.0,
          to: 1.05,
          kind: lab.defaultEffectKind || 'percent'
        },
        reason: lab.defaultReason
      });
    }
  };

  const handlePrevLevel = () => {
    if (currentLevel > 0) {
      handleSetLevel(currentLevel - 1);
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < lab.maxLevel) {
      handleSetLevel(currentLevel + 1);
    }
  };

  const handleAddOrPlanNext = () => {
    if (!existingEntry) {
      handleSetLevel(0);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div 
      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 relative ${
        isMaxed
          ? 'bg-zinc-900/80 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
          : currentLevel > 0
          ? 'bg-zinc-900/60 border-zinc-700/80 shadow-sm'
          : 'bg-zinc-950/40 border-zinc-800/60 opacity-80 hover:opacity-100 hover:border-zinc-700'
      }`}
    >
      {/* Card Top: Title & Level Badge */}
      <div>
        <div 
          className="flex items-start justify-between gap-2 cursor-pointer group"
          onMouseEnter={(e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            setIsHovered(true);
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-slate-800 dark:text-zinc-100 group-hover:text-indigo-400 transition-colors">
                {lab.name}
              </span>
              {isMaxed && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight mt-1 line-clamp-2">
              {lab.description}
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0 gap-1">
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
              isMaxed
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : currentLevel > 0
                ? 'bg-indigo-950/80 text-indigo-200 border-indigo-700/60'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              Lv.{currentLevel} / {lab.maxLevel}
            </span>
          </div>
        </div>

        {/* Level Controls (UW-style: - / custom picker / +) */}
        <div className="mt-3 p-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <span>Current Research Level:</span>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(!showCustomInput);
                setCustomInputValue(currentLevel.toString());
              }}
              className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer text-[10px]"
            >
              {showCustomInput ? 'Select Mode' : 'Custom Input'}
            </button>
          </div>

          {!showCustomInput ? (
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handlePrevLevel}
                disabled={currentLevel <= 0}
                className="w-8 h-8 flex items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-mono font-bold text-sm shrink-0 cursor-pointer"
                title="Decrease Level"
              >
                -
              </button>

              {/* Custom Scrollable Level Picker (5-7 items height) */}
              <CustomLevelPicker
                currentLevel={currentLevel}
                maxLevel={lab.maxLevel}
                onSelect={(lvl) => handleSetLevel(lvl)}
              />

              <button
                type="button"
                onClick={handleNextLevel}
                disabled={currentLevel >= lab.maxLevel}
                className="w-8 h-8 flex items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-mono font-bold text-sm shrink-0 cursor-pointer"
                title="Increase Level"
              >
                +
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                min="0"
                max={lab.maxLevel}
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const num = parseInt(customInputValue, 10);
                    if (!isNaN(num)) handleSetLevel(num);
                    setShowCustomInput(false);
                  }
                }}
                placeholder={`0 - ${lab.maxLevel}`}
                className="flex-1 bg-zinc-900 border border-indigo-500/80 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono font-bold focus:outline-none text-center"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  const num = parseInt(customInputValue, 10);
                  if (!isNaN(num)) handleSetLevel(num);
                  setShowCustomInput(false);
                }}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-mono font-bold cursor-pointer"
              >
                Set
              </button>
            </div>
          )}
        </div>

        {/* Next Level Stats Preview */}
        {!isMaxed ? (
          <div className="mt-2.5 p-2 bg-zinc-950/40 rounded-lg border border-zinc-800/60 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
              <span className="font-semibold text-zinc-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Next: Lv.{nextLevel}</span>
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                <CurrencyIcon currency="coins" size="xs" />
                <span>{formatCompact(effectiveCost)}</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-mono pt-0.5 border-t border-zinc-800/40">
              <span className="text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>Base: {LabDatabase.formatDuration(baseTime)}</span>
              </span>
              <span className="text-indigo-300 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-indigo-400" />
                <span>⚡ {LabDatabase.formatDuration(effectiveTime)}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-2.5 p-2 bg-emerald-950/20 rounded-lg border border-emerald-900/40 flex items-center justify-center space-x-1.5 text-xs font-mono text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Research Fully Mastered!</span>
          </div>
        )}
      </div>

      {/* Card Footer: Wiki, Calc, and Queue Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800/70 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <a
            href={lab.wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-zinc-400 hover:text-indigo-300 flex items-center space-x-1"
            title="Open Wiki Page"
          >
            <span>Wiki</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>

          <button
            type="button"
            onClick={() => onOpenCalculator(lab.id)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
            title="Open Level Calculator"
          >
            <Calculator className="w-3 h-3" />
            <span>Calc</span>
          </button>
        </div>

        <div>
          {existingEntry ? (
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-0.5">
                <Check className="w-3 h-3" />
                <span>In Queue</span>
              </span>
              <button
                type="button"
                onClick={() => removeResearchCatalogItem(lab.id)}
                className="text-[9px] text-zinc-500 hover:text-rose-400 hover:underline cursor-pointer"
                title="Remove from queue"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddOrPlanNext}
              className="text-[10px] px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-colors cursor-pointer shadow-xs flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add to Queue</span>
            </button>
          )}
        </div>
      </div>

      {/* OnHover Cursor-Following Sleek Description Box */}
      {isHovered && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${Math.min(mousePos.x + 16, window.innerWidth - 320)}px`,
            top: `${Math.min(mousePos.y + 16, window.innerHeight - 230)}px`,
            zIndex: 9999,
            pointerEvents: 'none'
          }}
          className="w-76 p-4 rounded-xl bg-zinc-950/95 border border-indigo-500/60 shadow-2xl backdrop-blur-md glow-indigo text-zinc-200 animate-fadeIn space-y-2.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lab.name}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-bold">
              Max Lv.{lab.maxLevel}
            </span>
          </div>

          {/* Detailed Description */}
          <p className="text-xs text-zinc-300 leading-relaxed font-sans font-normal">
            {lab.description}
          </p>

          {/* Channels and Progress Stats */}
          <div className="pt-2 border-t border-zinc-800/70 space-y-1 text-[11px] font-mono">
            {lab.defaultChannel && (
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-zinc-500">Effect Channel:</span>
                <span className="text-indigo-300 font-semibold">{lab.defaultChannel}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-zinc-500">Current Status:</span>
              <span className={currentLevel > 0 ? (isMaxed ? 'text-emerald-400 font-bold' : 'text-indigo-300 font-bold') : 'text-zinc-400'}>
                {isMaxed ? 'Mastered (Max)' : currentLevel > 0 ? `Researched (Lv.${currentLevel})` : 'Not Started (Lv.0)'}
              </span>
            </div>
            {!isMaxed && (
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
                <span className="text-zinc-500">Next Cost:</span>
                <span className="text-amber-400 font-bold">{formatCompact(effectiveCost)} Coins</span>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
