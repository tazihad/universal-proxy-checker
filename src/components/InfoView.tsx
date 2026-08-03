import React from 'react';
import { Rocket, Github, BookOpen, Sparkles, ExternalLink, User } from 'lucide-react';

export const InfoView: React.FC = () => {
  const releases = [
    {
      version: 'v0.1.0',
      date: '2026-08-03',
      notes: [
        'Initial release of Universal Proxy Checker v0.1 by tazihad',
        'Complete rewrite in React 19 + TypeScript + Vite 6 + Tailwind CSS v4',
        'Light & Dark mode support with persistent localStorage state',
        'Manual proxy text input box and live HTTP/HTTPS proxy list URL fetcher',
        '1-click IP and Port copy directly from Results table',
        'High-concurrency async checking engine with AbortController cancellation'
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto">
      {/* App Header Info */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 space-y-4 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Universal Proxy Checker</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                v0.1
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              High-performance, multithreaded proxy verification software for raw proxies & live subscription list URLs by <span className="font-semibold text-indigo-600 dark:text-indigo-400">tazihad</span>.
            </p>
          </div>
        </div>

        {/* Developer Contact Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href="https://github.com/tazihad"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-zinc-800/40 text-slate-800 dark:text-zinc-200 transition-all group"
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold">Author Profile (@tazihad)</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          </a>

          <a
            href="https://github.com/tazihad/universal-proxy-checker"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-zinc-800/40 text-slate-800 dark:text-zinc-200 transition-all group"
          >
            <div className="flex items-center space-x-2">
              <Github className="w-4 h-4 text-slate-800 dark:text-zinc-100" />
              <span className="text-xs font-semibold">GitHub Repository</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
          </a>
        </div>
      </div>

      {/* Release Notes */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-900 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-800 pb-3">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Release History & Changelog</span>
        </div>

        <div className="space-y-4">
          {releases.map(rel => (
            <div key={rel.version} className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{rel.version}</span>
                <span className="text-[10px] text-slate-500 font-mono">{rel.date}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-zinc-300">
                {rel.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
