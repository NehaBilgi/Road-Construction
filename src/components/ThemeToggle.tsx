import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export type AppTheme = 'dark' | 'light';
export const THEME_STORAGE_KEY = 'CONSTRUCTION_PRO_THEME';

const getInitialTheme = (): AppTheme => {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const applyStoredTheme = () => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = getInitialTheme();
};

export const ThemeToggle: React.FC<{ floating?: boolean }> = ({ floating = false }) => {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const nextTheme: AppTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => setTheme(nextTheme)}
      className={`${floating ? 'fixed top-4 right-4 z-[100]' : ''} p-2 rounded-xl bg-[#121927] hover:bg-[#162032] border border-[#1E293B] text-slate-300 hover:text-white transition-colors cursor-pointer`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
