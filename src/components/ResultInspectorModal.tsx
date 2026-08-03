import React from 'react';
import { X, ShieldCheck, FileCode } from 'lucide-react';
import { ProxyResultItem } from '../types';

interface ResultInspectorModalProps {
  proxy: ProxyResultItem | null;
  onClose: () => void;
}

export const ResultInspectorModal: React.FC<ResultInspectorModalProps> = ({ proxy, onClose }) => {
  if (!proxy) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                {proxy.auth !== 'none' ? `${proxy.auth}@` : ''}
                {proxy.host}:{proxy.port}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center space-x-2">
                <span>{proxy.country.flag} {proxy.country.name}</span>
                <span>•</span>
                <span className="capitalize text-indigo-600 dark:text-indigo-400 font-medium">{proxy.anon} anonymity</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {/* General Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-zinc-500 text-[10px]">Latency</div>
              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{proxy.timeout} ms</div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-zinc-500 text-[10px]">Protocols</div>
              <div className="font-mono font-bold text-zinc-900 dark:text-zinc-200 mt-0.5 uppercase">
                {proxy.protocols.join(', ')}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-zinc-500 text-[10px]">Server</div>
              <div className="font-mono font-bold text-zinc-900 dark:text-zinc-200 mt-0.5 truncate">
                {proxy.server || 'Standard'}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-zinc-500 text-[10px]">Keep-Alive</div>
              <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {proxy.keepAlive ? 'Supported' : 'No'}
              </div>
            </div>
          </div>

          {/* Captured Data per protocol */}
          {proxy.fullData && proxy.fullData.length > 0 ? (
            <div className="space-y-3">
              <div className="font-semibold text-zinc-800 dark:text-zinc-300 flex items-center space-x-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Captured Data per Protocol</span>
              </div>

              {proxy.fullData.map((data, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-zinc-950 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono">{data.protocol}</span>
                    <span className="text-[11px] truncate max-w-xs" title={data.judge}>
                      Judge: {data.judge}
                    </span>
                  </div>

                  {data.response?.headers && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Headers</div>
                      <pre className="bg-slate-100 dark:bg-zinc-900 p-2 rounded text-[11px] font-mono text-zinc-800 dark:text-zinc-300 overflow-x-auto border border-zinc-200 dark:border-zinc-800/80">
                        {JSON.stringify(data.response.headers, null, 2)}
                      </pre>
                    </div>
                  )}

                  {data.response?.body && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Body Snippet</div>
                      <pre className="bg-slate-100 dark:bg-zinc-900 p-2 rounded text-[11px] font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 max-h-32">
                        {data.response.body}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center text-zinc-500">
              Full inspection data capturing was disabled during test run.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 rounded-lg font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
