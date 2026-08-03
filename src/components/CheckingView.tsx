import React from 'react';
import { Square, Gauge, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CheckingStats } from '../types';

interface CheckingViewProps {
  stats: CheckingStats;
  isChecking: boolean;
  onStop: () => void;
  onViewResults: () => void;
}

export const CheckingView: React.FC<CheckingViewProps> = ({
  stats,
  isChecking,
  onStop,
  onViewResults
}) => {
  const percent = stats.all > 0 ? Math.min(100, Math.round((stats.done / stats.all) * 100)) : 0;
  const remainingCount = Math.max(0, stats.all - stats.done);
  const etaSec = stats.speed > 0 ? Math.round(remainingCount / stats.speed) : 0;

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto">
      {/* Progress & Speed Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {isChecking ? 'Checking Proxies in Progress...' : 'Check Complete'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Elapsed: {stats.elapsed}s</span>
            </div>
            {isChecking && stats.speed > 0 && (
              <div>ETA: ~{etaSec}s</div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{percent}% ({stats.done} / {stats.all})</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Live Speed Indicator */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Speed</div>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.speed} <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">p/sec</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Checked</div>
            <div className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
              {stats.done.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Remaining</div>
            <div className="text-lg font-bold font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
              {remainingCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Alive Total</div>
            <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
              {(
                stats.protocols.http +
                stats.protocols.https +
                stats.protocols.socks4 +
                stats.protocols.socks5
              ).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Counters Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-sm transition-colors">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-800 dark:text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Alive Proxies by Protocol</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-zinc-950/80 p-3 rounded-lg border border-indigo-500/30">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">HTTP</div>
            <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              {stats.protocols.http.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-950/80 p-3 rounded-lg border border-emerald-500/30">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">HTTPS (SSL)</div>
            <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              {stats.protocols.https.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-950/80 p-3 rounded-lg border border-amber-500/30">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-300">SOCKS4</div>
            <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              {stats.protocols.socks4.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-950/80 p-3 rounded-lg border border-cyan-500/30">
            <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-300">SOCKS5</div>
            <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              {stats.protocols.socks5.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3 pt-2">
        {isChecking ? (
          <button
            onClick={onStop}
            className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Stop Checking</span>
          </button>
        ) : (
          <button
            onClick={onViewResults}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>View Filtered Results</span>
          </button>
        )}
      </div>
    </div>
  );
};
