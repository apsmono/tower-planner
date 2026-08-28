import { useState, useEffect } from 'react';
import { useStore } from '../domain/store';
import { TaskHUD } from './TaskHUD';
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Target, 
  FlaskConical, 
  FileText, 
  Sparkles
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

  // Expanded View: Overlays over the middle column without shifting main content width
  return (
    <>
      {/* Static width placeholder to maintain exact main workspace width */}
      <div className="w-13 shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Subtle backdrop overlay: clicking outside collapses the drawer */}
      <div 
        className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px] z-20 transition-opacity duration-200"
        onClick={onToggle}
        title="Click outside to collapse drawer"
      />

      {/* Expanded Overlay Drawer */}
      <aside className="absolute right-0 top-0 bottom-0 w-80 sm:w-88 bg-zinc-900/95 border-l border-zinc-800 shadow-2xl shadow-black/80 backdrop-blur-xl flex flex-col glass-panel overflow-hidden transition-all duration-300 z-30 animate-fadeIn">
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
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-4 h-4 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="truncate">
                          <span className={`block truncate ${assignedResearch ? 'text-zinc-200 font-medium' : 'text-zinc-500 italic'}`}>
                            {assignedResearch ? assignedResearch.name : 'Unassigned (Idle)'}
                          </span>
                          {assignedResearch && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Lv.{lab.level}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {lab.researchId ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950/60 border border-purple-800/40 text-purple-300">
                            {lab.boost}x
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-600">
                            -
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Section 3: Session Scratchpad Notes ───────────────────── */}
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden transition-all">
            <button
              onClick={() => toggleSection('notes')}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors text-left cursor-pointer select-none group"
              aria-expanded={openSections.notes}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                  Session Scratchpad
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {scratchNotes.trim().length > 0 && (
                  <span className="text-[10px] font-mono text-amber-400">
                    Saved
                  </span>
                )}
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
                  placeholder="Type quick strategy notes, perk priorities, or experiment observations here..."
                  rows={4}
                  className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 font-mono resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                  <span>Auto-saved to browser storage</span>
                  {scratchNotes.length > 0 && (
                    <span>{scratchNotes.length} chars</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Section 4: Future Tooling Placeholder ─────────────────── */}
          <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('extensions')}
              className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors text-left cursor-pointer select-none group"
              aria-expanded={openSections.extensions}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Upcoming Tools
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
    </>
  );
}
