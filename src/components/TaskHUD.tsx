import { useStore, type PlannerTask } from '../domain/store';
import { CurrencyIcon } from './CurrencyIcon';
import { Trash2, CheckCircle2, FlaskConical, Target } from 'lucide-react';

export function TaskHUD() {
  const tasks = useStore((state) => state.tasks);
  const build = useStore((state) => state.build);
  const deleteTask = useStore((state) => state.deleteTask);

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const formatValue = (num: number): string => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const getProgressInfo = (task: PlannerTask) => {
    if (task.type === 'resource' && task.targetResource && task.targetAmount) {
      const current = build.resources[task.targetResource] || 0;
      const target = task.targetAmount;
      const pct = Math.min(100, Math.max(0, (current / target) * 100));
      return {
        label: `${formatValue(current)} / ${formatValue(target)}`,
        pct,
        iconEl: <CurrencyIcon currency={task.targetResource} size="xs" />
      };
    }
    if (task.type === 'research' && task.targetResearchId && task.targetLevel) {
      const research = build.researchCatalog.find((r) => r.id === task.targetResearchId);
      const currentLevel = research ? research.level : 0;
      const targetLevel = task.targetLevel;
      const pct = Math.min(100, Math.max(0, (currentLevel / targetLevel) * 100));
      return {
        label: `Lv.${currentLevel} / Lv.${targetLevel}`,
        pct,
        iconEl: <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
      };
    }
    return { 
      label: 'In Progress', 
      pct: 50, 
      iconEl: <Target className="w-3.5 h-3.5 text-cyan-400" /> 
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
        <span>Pinned Goals</span>
        <span className="font-semibold text-indigo-400">{activeTasks.length} Active</span>
      </div>

      {activeTasks.length === 0 ? (
        <div className="p-3 bg-zinc-900/20 border border-zinc-800/40 rounded-lg text-[11px] text-zinc-500 text-center leading-normal">
          No active goals pinned. 
          <p className="mt-1 text-[10px] text-indigo-400/80">Pin items in the Research Queue or add resource targets in Build State!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {activeTasks.map((task) => {
            const { label, pct, iconEl } = getProgressInfo(task);
            return (
              <div 
                key={task.id} 
                className="p-2.5 bg-zinc-900/50 border border-zinc-800/60 hover:border-zinc-700/80 rounded-lg relative group transition-all"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="pr-4 flex-1">
                    <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5 truncate leading-tight" title={task.name}>
                      {iconEl}
                      <span className="truncate">{task.name}</span>
                    </span>
                    {task.notes && (
                      <span className="text-[9px] text-zinc-500 block truncate leading-normal mt-0.5" title={task.notes}>
                        {task.notes}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-zinc-500 hover:text-rose-400 p-0.5 rounded transition-all"
                    title="Remove goal"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                    <span>Progress</span>
                    <span className="font-semibold text-indigo-400">{label}</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mini notification banner for completed goals */}
      {completedTasks.length > 0 && (
        <div className="space-y-1.5 pt-1.5 border-t border-zinc-900">
          <div className="text-[9px] text-zinc-500 font-mono uppercase">Completed Goals</div>
          {completedTasks.slice(0, 2).map((task) => (
            <div 
              key={task.id} 
              className="flex items-center justify-between p-1.5 bg-emerald-950/15 border border-emerald-900/30 rounded text-[10px] text-emerald-400 animate-fadeIn"
            >
              <div className="flex items-center space-x-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate font-medium">{task.name}</span>
              </div>
              <button 
                onClick={() => deleteTask(task.id)}
                className="text-emerald-600 hover:text-emerald-400 shrink-0 font-mono text-[9px] hover:underline"
              >
                Clear
              </button>
            </div>
          ))}
          {completedTasks.length > 2 && (
            <div className="text-[9px] text-zinc-500 text-center font-mono">
              + {completedTasks.length - 2} more completed goals
            </div>
          )}
        </div>
      )}
    </div>
  );
}
