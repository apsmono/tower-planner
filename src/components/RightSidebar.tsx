import React, { useState, useEffect } from 'react';
import { useStore } from '../domain/store';
import { TaskHUD } from './TaskHUD';
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Target, 
  FlaskConical, 
  FileText, 
  Sparkles,
  Zap
} from 'lucide-react';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface OpenSections {
  goals: boolean;
  labs: boolean;
  notes: boolean;
  extensions: boolean;
}

export function RightSidebar({ isCollapsed, onToggle }: RightSidebarProps) {
  const build = useStore((state) => state.build);
  const tasks = useStore((state) => state.tasks);
  const activeTasks = tasks.filter((t) => t.status === 'active');
  const activeBoostsCount = build.labs.filter((l) => l.researchId).length;

  // Session scratchpad notes stored in localStorage
  const [scratchNotes, setScratchNotes] = useState<string>(() => {
    try {
      return localStorage.getItem('tower_planner_scratch_notes') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tower_planner_scratch_notes', scratchNotes);
    } catch {
      // ignore
    }
  }, [scratchNotes]);

  // Section collapse states stored in localStorage
  const [openSections, setOpenSections] = useState<OpenSections>(() => {
    try {
      const saved = localStorage.getItem('tower_right_sections');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      goals: true,
      labs: true,
      notes: true,
      extensions: false,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('tower_right_sections', JSON.stringify(openSections));
    } catch {
      // ignore
    }
  }, [openSections]);

  const toggleSection = (section: keyof OpenSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Collapsed rail view
  if (isCollapsed) {
    return (
      <aside 
        className="w-13 shrink-0 bg-zinc-900/40 border-l border-zinc-800/80 flex flex-col items-center py-3.5 glass-panel transition-all duration-300 select-none z-10"
        title="Click to expand panel"
      >
        {/* Expand Arrow Button */}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-indigo-500/50 text-zinc-400 hover:text-indigo-300 transition-all cursor-pointer shadow-xs mb-4 group"
          title="Expand right sidebar"
          aria-label="Expand right sidebar"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </button>

        {/* Vertical Icon Rail */}
        <div className="flex flex-col items-center space-y-4 flex-1">
          {/* Goals Badge */}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 text-zinc-400 hover:text-indigo-300 relative transition-all cursor-pointer group"
            title={`${activeTasks.length} Active Goals (Click to expand)`}
          >
            <Target className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            {activeTasks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-bold font-mono text-white flex items-center justify-center border border-zinc-900 shadow-xs">
                {activeTasks.length}
              </span>
            )}
          </button>

          {/* Labs Mini Indicator */}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 text-zinc-400 hover:text-emerald-300 relative transition-all cursor-pointer group"
            title={`${activeBoostsCount}/5 Active Labs (Click to expand)`}
          >
            <FlaskConical className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600/90 text-[9px] font-bold font-mono text-white flex items-center justify-center border border-zinc-900 shadow-xs">
              {activeBoostsCount}
            </span>
          </button>

          {/* Quick Notes Mini Indicator */}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 text-zinc-400 hover:text-amber-300 relative transition-all cursor-pointer group"
            title="Session Scratchpad (Click to expand)"
          >
            <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            {scratchNotes.trim().length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Bottom subtle expand hint */}
        <button
          onClick={onToggle}
          className="text-[9px] text-zinc-500 hover:text-zinc-300 font-mono tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 py-2 cursor-pointer transition-colors"
        >
          Goals Hub
        </button>
      </aside>
    );
  }

  // Expanded View
  return (
    <aside className="w-72 sm:w-80 shrink-0 bg-zinc-900/40 border-l border-zinc-800/80 flex flex-col glass-panel overflow-hidden transition-all duration-300 z-10">
      {/* Top Header */}
      <div className="h-11 shrink-0 px-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/30">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">Planner Hub</span>
          {activeTasks.length > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activeTasks.length}
            </span>
          )}
        </div>

        {/* Collapse Arrow Button */}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer group"
          title="Collapse right sidebar"
          aria-label="Collapse right sidebar"
        >
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        
        {/* ── Section 1: Pinned Goals HUD ───────────────────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('goals')}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors text-left cursor-pointer select-none group"
            aria-expanded={openSections.goals}
          >
            <div className="flex items-center space-x-2">
              <Target className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Pinned Goals
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-semibold text-indigo-400">
                {activeTasks.length} Active
              </span>
              {openSections.goals ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
              )}
            </div>
          </button>

          {openSections.goals && (
            <div className="p-3 pt-1 border-t border-zinc-800/40">
              <TaskHUD />
            </div>
          )}
        </div>

        {/* ── Section 2: Active Lab Allocation & Speeds ──────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('labs')}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors text-left cursor-pointer select-none group"
            aria-expanded={openSections.labs}
          >
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Lab Allocations
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                {activeBoostsCount}/5 Active
              </span>
              {openSections.labs ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
              )}
            </div>
          </button>

          {openSections.labs && (
            <div className="p-3 pt-2 border-t border-zinc-800/40 space-y-1.5">
              {build.labs.map((lab, index) => {
                const assignedResearch = lab.researchId 
                  ? build.researchCatalog.find((r) => r.id === lab.researchId)
                  : null;

                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-zinc-950/40 border border-zinc-800/40 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-[10px] font-mono text-zinc-500 font-bold">#{index + 1}</span>
                      <span className="text-[11px] text-zinc-300 truncate">
                        {assignedResearch ? assignedResearch.name : <span className="text-zinc-500 italic">Idle</span>}
                      </span>
                    </div>

                    {lab.researchId ? (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-0.5 shrink-0 ${
                        lab.boost >= 3 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : lab.boost > 1
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <Zap className="w-2.5 h-2.5" />
                        {lab.boost}x
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-600">--</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section 3: Quick Session Notes / Scratchpad ───────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('notes')}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors text-left cursor-pointer select-none group"
            aria-expanded={openSections.notes}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Scratchpad
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-mono text-zinc-500">Auto-saved</span>
              {openSections.notes ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform" />
              )}
            </div>
          </button>

          {openSections.notes && (
            <div className="p-3 pt-2 border-t border-zinc-800/40 space-y-2">
              <textarea
                value={scratchNotes}
                onChange={(e) => setScratchNotes(e.target.value)}
                placeholder="Quick planning notes, target waves, build priority reminders..."
                className="w-full h-24 p-2 text-xs bg-zinc-950/60 border border-zinc-800/60 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* ── Section 4: Extensible Slot / Future Development Widget ─── */}
        <div className="bg-zinc-900/30 border border-dashed border-zinc-800/60 rounded-xl overflow-hidden transition-all">
          <button
            onClick={() => toggleSection('extensions')}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-900/60 transition-colors text-left cursor-pointer select-none group"
            aria-expanded={openSections.extensions}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300">
                Future Extensions
              </span>
            </div>
            {openSections.extensions ? (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform" />
            )}
          </button>

          {openSections.extensions && (
            <div className="p-3 pt-2 border-t border-dashed border-zinc-800/50 text-center space-y-1">
              <p className="text-[10px] text-zinc-500 leading-normal">
                Tournament sync, UW Timers & Event Mission trackers coming soon.
              </p>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
