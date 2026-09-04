import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tower-planner-theme') as ThemeMode | null;
    return saved || 'system';
  });

  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('tower-planner-theme', theme);

    const applyTheme = (isDark: boolean) => {
      const mode = isDark ? 'dark' : 'light';
      root.setAttribute('data-theme', mode);
      document.body.setAttribute('data-theme', mode);
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        document.body.classList.add('dark');
        document.body.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        document.body.classList.add('light');
        document.body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
      // No cleanup needed for non-system modes
      return undefined;
    }
  }, [theme]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const options: { id: ThemeMode; label: string; icon: typeof Sun; subtitle: string }[] = [
    { id: 'light', label: 'Light view', icon: Sun, subtitle: 'Clean & high-contrast' },
    { id: 'dark', label: 'Dark view', icon: Moon, subtitle: 'Cyberpunk deep dark' },
    { id: 'system', label: 'System default', icon: Monitor, subtitle: 'Follows OS preference (Default)' },
  ];

  const currentOption = options.find((o) => o.id === theme) || options[2];
  const CurrentIcon = currentOption.icon;

  const cycleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Theme Trigger Button (Click to toggle/cycle, Hover to show options) */}
      <button
        onClick={cycleTheme}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Theme selector (current: ${currentOption.label} - click to toggle, hover for menu)`}
        className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
          isOpen
            ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
            : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
        }`}
        title={`Theme: ${currentOption.label} (Click to cycle, Hover for options)`}
      >
        <CurrentIcon className="w-4 h-4 text-indigo-400 transition-transform duration-200 hover:scale-110" />
      </button>

      {/* OnHover Floating Options Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-56 p-1.5 bg-zinc-900/95 border border-zinc-700/90 rounded-xl shadow-2xl shadow-black/80 backdrop-blur-xl z-50 animate-fadeIn"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-b border-zinc-800 mb-1">
            Display Theme
          </div>

          <div className="space-y-1">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white border border-transparent'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center space-x-2.5 text-left">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-400'}`} />
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        {opt.label}
                        {opt.id === 'system' && (
                          <span className="text-[9px] font-mono text-zinc-500 bg-zinc-800 px-1 py-0.2 rounded">
                            Auto
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-normal">
                        {opt.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
