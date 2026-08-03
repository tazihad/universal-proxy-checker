import React from 'react';
import { Moon, Sun, Info, ShieldCheck, Activity } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenInfo: () => void;
  isChecking: boolean;
  totalProxies: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenInfo,
  isChecking,
  totalProxies
}) => {
  return (
    <header className="h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 select-none shrink-0 transition-colors">
      <div className="flex items-center space-x-2.5">
        <img
          src="/favicon.svg"
          alt="Universal Proxy Checker Logo"
          className="w-6 h-6 rounded-md shadow-sm hover:scale-105 transition-transform"
        />
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">Universal Proxy Checker</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">v0.1</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {isChecking && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-medium">Checking Active</span>
          </div>
        )}

        {totalProxies > 0 && !isChecking && (
          <div className="flex items-center space-x-1 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700/40">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{totalProxies.toLocaleString()} Proxies Loaded</span>
          </div>
        )}

        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={onOpenInfo}
            title="App Info & Releases"
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
