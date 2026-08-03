import React, { useState } from 'react';
import { Scale, Plus, Trash2, RefreshCw, CheckCircle2, XCircle, Shuffle } from 'lucide-react';
import { JudgeItem } from '../types';
import { JudgeManager } from '../utils/judgeManager';

interface JudgesViewProps {
  judges: JudgeItem[];
  onUpdateJudges: (judges: JudgeItem[]) => void;
  swapJudges: boolean;
  onToggleSwap: (swap: boolean) => void;
}

export const JudgesView: React.FC<JudgesViewProps> = ({
  judges,
  onUpdateJudges,
  swapJudges,
  onToggleSwap
}) => {
  const [newUrl, setNewUrl] = useState('');
  const [newValidate, setNewValidate] = useState('');
  const [isPingTesting, setIsPingTesting] = useState(false);

  const handleAddJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    try {
      new URL(newUrl.trim());
    } catch {
      alert('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    const newJudge: JudgeItem = {
      id: Date.now().toString(),
      url: newUrl.trim(),
      title: newUrl.replace(/^https?:\/\//, '').split('/')[0],
      validate: newValidate.trim() || undefined,
      working: true,
      checking: false
    };

    onUpdateJudges([...judges, newJudge]);
    setNewUrl('');
    setNewValidate('');
  };

  const handleDeleteJudge = (id: string) => {
    onUpdateJudges(judges.filter(j => j.id !== id));
  };

  const handleTestPingAll = async () => {
    setIsPingTesting(true);
    const manager = new JudgeManager(judges);
    const updated = [...judges];

    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], checking: true };
      onUpdateJudges([...updated]);

      const res = await manager.pingJudge(updated[i]);
      updated[i] = {
        ...updated[i],
        working: res.working,
        timeout: res.timeout,
        checking: false
      };
      onUpdateJudges([...updated]);
    }

    setIsPingTesting(false);
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto">
      {/* Judges List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center space-x-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Active Proxy Judges ({judges.length})</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer select-none text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={swapJudges}
                onChange={e => onToggleSwap(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
              />
              <Shuffle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Rotate Judges</span>
            </label>

            <button
              onClick={handleTestPingAll}
              disabled={isPingTesting}
              className="px-3 py-1 bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isPingTesting ? 'animate-spin' : ''}`} />
              <span>Ping All</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {judges.map(judge => (
            <div
              key={judge.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg text-xs"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                {judge.checking ? (
                  <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
                ) : judge.working ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}

                <div className="truncate">
                  <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-200 truncate">{judge.url}</div>
                  {judge.validate && (
                    <div className="text-[10px] text-zinc-500">Validation regex: {judge.validate}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {judge.timeout !== undefined && (
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{judge.timeout}ms</span>
                )}

                <button
                  onClick={() => handleDeleteJudge(judge.id)}
                  title="Remove judge"
                  className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Judge Form */}
      <form onSubmit={handleAddJudge} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-sm transition-colors">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Add Custom Judge</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Judge URL</label>
            <input
              type="text"
              placeholder="http://azenv.net/ or https://..."
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 font-mono"
            />
          </div>

          <div>
            <label className="text-zinc-600 dark:text-zinc-400 block mb-1">Validation String / Regex (Optional)</label>
            <input
              type="text"
              placeholder="e.g. REMOTE_ADDR or origin"
              value={newValidate}
              onChange={e => setNewValidate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div className="pt-1 text-right">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            Add Judge URL
          </button>
        </div>
      </form>
    </div>
  );
};
