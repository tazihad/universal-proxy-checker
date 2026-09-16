import React, { useState, useEffect } from 'react';
import { Moon, Sun, Info, ShieldCheck, Activity, Minus, Square, Copy, X } from 'lucide-react';

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
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        setIsElectron(true);

        const handleMaximize = () => setIsMaximized(true);
        const handleUnmaximize = () => setIsMaximized(false);

        ipcRenderer.on('on-window-maximize', handleMaximize);
        ipcRenderer.on('on-window-unmaximize', handleUnmaximize);

        return () => {
          ipcRenderer.removeListener('on-window-maximize', handleMaximize);
          ipcRenderer.removeListener('on-window-unmaximize', handleUnmaximize);
        };
      } catch (e) {
        setIsElectron(false);
      }
    }
  }, []);

  const handleMinimize = () => {
    if (isElectron) {
      const { ipcRenderer } = (window as any).require('electron');
      ipcRenderer.send('window-minimize');
    }
  };

  const handleMaximizeToggle = () => {
    if (isElectron) {
      const { ipcRenderer } = (window as any).require('electron');
      if (isMaximized) {
        ipcRenderer.send('window-unmaximize');
      } else {
        ipcRenderer.send('window-maximize');
      }
    }
  };

  const handleClose = () => {
    if (isElectron) {
      const { ipcRenderer } = (window as any).require('electron');
      ipcRenderer.send('window-close');
    }
  };

  return (
    <header
      className="h-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-3 select-none shrink-0 transition-colors"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center space-x-2.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <img
          src="/favicon.svg"
          alt="Universal Proxy Checker Logo"
          className="w-5 h-5 rounded-md shadow-sm hover:scale-105 transition-transform"
        />
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">Universal Proxy Checker</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">v0.2.0</span>
        </div>
      </div>

      <div className="flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {isChecking && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
            <Activity className="w-3 h-3" />
            <span className="font-medium text-[11px]">Checking</span>
          </div>
        )}

        {totalProxies > 0 && !isChecking && (
          <div className="flex items-center space-x-1 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700/40">
            <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px]">{totalProxies.toLocaleString()} Proxies</span>
          </div>
        )}

        <div className="flex items-center space-x-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-2">
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          <button
            onClick={onOpenInfo}
            title="App Info & Releases"
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window Control Buttons */}
        <div className="flex items-center space-x-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-2">
          <button
            onClick={handleMinimize}
            title="Minimize"
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximizeToggle}
            title={isMaximized ? "Restore" : "Maximize"}
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleClose}
            title="Close"
            className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
