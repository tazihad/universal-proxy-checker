import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { BlacklistItem } from '../types';

interface BlacklistViewProps {
  blacklists: BlacklistItem[];
  onUpdateBlacklists: (blacklists: BlacklistItem[]) => void;
  filteringEnabled: boolean;
  onToggleFiltering: (enabled: boolean) => void;
}

export const BlacklistView: React.FC<BlacklistViewProps> = ({
  blacklists,
  onUpdateBlacklists,
  filteringEnabled,
  onToggleFiltering
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPath, setNewPath] = useState('');

  const handleAddBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPath.trim()) return;

    const newItem: BlacklistItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      path: newPath.trim(),
      active: true,
      count: 0
    };

    onUpdateBlacklists([...blacklists, newItem]);
    setNewTitle('');
    setNewPath('');
  };

  const handleDelete = (id: string) => {
    onUpdateBlacklists(blacklists.filter(b => b.id !== id));
  };

  const handleToggleActive = (id: string) => {
    onUpdateBlacklists(
      blacklists.map(b => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto">
      {/* Blacklist Sources */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center space-x-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Blacklist Databases ({blacklists.length})</span>
          </div>

          <label className="flex items-center space-x-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filteringEnabled}
              onChange={e => onToggleFiltering(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
            />
            <span className="font-semibold">Enable Blacklist Filtering</span>
          </label>
        </div>

        <div className="space-y-2">
          {blacklists.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg text-xs"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={() => handleToggleActive(item.id)}
                  className="w-4 h-4 rounded bg-slate-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0 shrink-0"
                />
                <div className="truncate">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-200">{item.title}</div>
                  <div className="text-[10px] font-mono text-zinc-500 truncate">{item.path}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Remove blacklist"
                  className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Blacklist Form */}
      <form onSubmit={handleAddBlacklist} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-sm transition-colors">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Add Custom Blacklist Database</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Blacklist Title</label>
            <input
              type="text"
              placeholder="e.g. My Spam List"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Database File or URL</label>
            <input
              type="text"
              placeholder="https://... or C:\blacklist.txt"
              value={newPath}
              onChange={e => setNewPath(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 font-mono"
            />
          </div>
        </div>

        <div className="pt-1 text-right">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            Add Blacklist Database
          </button>
        </div>
      </form>
    </div>
  );
};
