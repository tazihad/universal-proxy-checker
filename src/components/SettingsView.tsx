import React from 'react';
import { Sliders, Shield, Database, Cpu, RefreshCw, Timer } from 'lucide-react';
import { CoreOptions, Protocol } from '../types';

interface SettingsViewProps {
  options: CoreOptions;
  onOptionsChange: (options: CoreOptions) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ options, onOptionsChange }) => {
  const handleProtocolToggle = (proto: Protocol) => {
    onOptionsChange({
      ...options,
      protocols: {
        ...options.protocols,
        [proto]: !options.protocols[proto]
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto">
      {/* Target Protocols */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-sm transition-colors">
        <div className="flex items-center space-x-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Target Protocols</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['http', 'https', 'socks4', 'socks5'] as Protocol[]).map(proto => (
            <label
              key={proto}
              onClick={() => handleProtocolToggle(proto)}
              className={`p-3 rounded-lg border cursor-pointer select-none flex items-center justify-between transition-all ${
                options.protocols[proto]
                  ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-500/60 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'bg-slate-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
              }`}
            >
              <span className="font-bold text-xs uppercase">{proto}</span>
              <input
                type="checkbox"
                checked={options.protocols[proto]}
                onChange={() => {}}
                className="w-4 h-4 rounded bg-slate-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Data Capturing & Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data Capturing */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Data Capturing</span>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-200">Full Inspection Data</div>
                <div className="text-zinc-500 text-[11px]">Capture response headers & body snippets</div>
              </div>
              <input
                type="checkbox"
                checked={options.captureFullData}
                onChange={e => onOptionsChange({ ...options, captureFullData: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-200">Capture Server Header</div>
                <div className="text-zinc-500 text-[11px]">Identify Squid, MikroTik, Tinyproxy, etc.</div>
              </div>
              <input
                type="checkbox"
                checked={options.captureServer}
                onChange={e => onOptionsChange({ ...options, captureServer: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Connection Options */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Connection Options</span>
          </div>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
              <div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-200">Test Keep-Alive Support</div>
                <div className="text-zinc-500 text-[11px]">Verify persistent HTTP connection header</div>
              </div>
              <input
                type="checkbox"
                checked={options.keepAlive}
                onChange={e => onOptionsChange({ ...options, keepAlive: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Performance Sliders */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center space-x-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Performance & Concurrency Tuning</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Threads Slider */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-300 flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Threads</span>
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{options.threads}</span>
            </div>
            <input
              type="range"
              min="1"
              max="500"
              value={options.threads}
              onChange={e => onOptionsChange({ ...options, threads: Number(e.target.value) })}
              className="w-full h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-[10px] text-zinc-500">Concurrent worker threads (1 - 500)</div>
          </div>

          {/* Retries Slider */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-300 flex items-center space-x-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Retries</span>
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {options.retries === 0 ? 'Off' : options.retries}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={options.retries}
              onChange={e => onOptionsChange({ ...options, retries: Number(e.target.value) })}
              className="w-full h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-[10px] text-zinc-500">Max retry attempts on failure (0 - 10)</div>
          </div>

          {/* Timeout Slider */}
          <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-300 flex items-center space-x-1.5">
                <Timer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Timeout</span>
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{options.timeout} ms</span>
            </div>
            <input
              type="range"
              min="1000"
              max="60000"
              step="100"
              value={options.timeout}
              onChange={e => onOptionsChange({ ...options, timeout: Number(e.target.value) })}
              className="w-full h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-[10px] text-zinc-500">Max connection timeout ms (1s - 60s)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
