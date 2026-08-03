import React from 'react';
import {
  FileText,
  Play,
  ListFilter,
  Sliders,
  Scale,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export type TabType = 'input' | 'checking' | 'results' | 'settings' | 'judges' | 'blacklists' | 'info';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isChecking: boolean;
  resultCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  isChecking,
  resultCount
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'input', label: 'Input', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'checking', label: 'Checker', icon: <Play className="w-3.5 h-3.5" />, badge: isChecking ? 'RUNNING' : undefined },
    { id: 'results', label: 'Results', icon: <ListFilter className="w-3.5 h-3.5" />, badge: resultCount > 0 ? resultCount : undefined },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'judges', label: 'Judges', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'blacklists', label: 'Blacklist', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'info', label: 'About', icon: <HelpCircle className="w-3.5 h-3.5" /> }
  ];

  return (
    <nav className="h-10 bg-slate-100/90 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800/80 px-4 flex items-center space-x-1 select-none shrink-0 overflow-x-auto scrollbar-none transition-colors">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              isActive
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700/60 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/40'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  tab.id === 'checking'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 animate-pulse'
                    : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
