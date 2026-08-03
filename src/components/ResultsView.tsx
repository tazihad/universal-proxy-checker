import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Download,
  ArrowUpDown,
  Copy,
  Check
} from 'lucide-react';
import { ProxyResultItem, ResultsFilterState, AnonymityLevel, Protocol } from '../types';

interface ResultsViewProps {
  results: ProxyResultItem[];
  filterState: ResultsFilterState;
  onFilterChange: (filters: ResultsFilterState) => void;
  onOpenCountryPicker: () => void;
  onOpenExport: () => void;
  onInspectProxy: (proxy: ProxyResultItem) => void;
  hasKeepAliveOption: boolean;
  activeBlacklistsCount: number;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  results,
  filterState,
  onFilterChange,
  onOpenCountryPicker,
  onOpenExport,
  onInspectProxy,
  hasKeepAliveOption
}) => {
  const [pageSize, setPageSize] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopyField = (e: React.MouseEvent, item: ProxyResultItem, field: 'host' | 'port') => {
    e.stopPropagation(); // Don't trigger inspect modal on IP/Port copy click
    const textToCopy = field === 'host' ? item.host : item.port.toString();
    navigator.clipboard.writeText(textToCopy);

    setToastMessage(`Copied ${field === 'host' ? 'IP' : 'Port'}: ${textToCopy}`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Apply all active filters
  const filteredResults = useMemo(() => {
    return results.filter(item => {
      // 1. Text Search (IP, Port, Country, Server)
      if (filterState.search.trim()) {
        const query = filterState.search.toLowerCase();
        const matchHost = item.host.toLowerCase().includes(query);
        const matchPort = item.port.toString().includes(query);
        const matchCountry = item.country.name.toLowerCase().includes(query);
        const matchServer = item.server?.toLowerCase().includes(query) || false;
        if (!matchHost && !matchPort && !matchCountry && !matchServer) return false;
      }

      // 2. Anonymity filter
      if (!filterState.anons[item.anon]) return false;

      // 3. Protocol filter (matches if ANY of item's protocols is checked)
      const matchesProtocol = item.protocols.some(p => filterState.protocols[p]);
      if (!matchesProtocol) return false;

      // 4. Misc filter (Only Keep-Alive)
      if (filterState.misc.onlyKeepAlive && !item.keepAlive) return false;

      // 5. Ports filter
      if (filterState.ports.input.trim()) {
        const portList = filterState.ports.input
          .split(',')
          .map(p => p.trim())
          .filter(p => p.length > 0)
          .map(Number);

        if (portList.length > 0) {
          const inList = portList.includes(item.port);
          if (filterState.ports.allow && !inList) return false;
          if (!filterState.ports.allow && inList) return false;
        }
      }

      // 6. Max Timeout filter
      if (item.timeout > filterState.maxTimeout) return false;

      // 7. Selected Countries filter
      if (filterState.selectedCountries.length > 0) {
        if (!filterState.selectedCountries.includes(item.country.name)) return false;
      }

      return true;
    });
  }, [results, filterState]);

  // Apply sorting
  const sortedResults = useMemo(() => {
    const list = [...filteredResults];
    const { key, dir } = filterState.sorting;

    list.sort((a, b) => {
      let valA: any = a[key as keyof ProxyResultItem];
      let valB: any = b[key as keyof ProxyResultItem];

      if (key === 'country') {
        valA = a.country.name;
        valB = b.country.name;
      } else if (key === 'protocols') {
        valA = a.protocols.join(',');
        valB = b.protocols.join(',');
      }

      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredResults, filterState.sorting]);

  const handleSort = (key: ResultsFilterState['sorting']['key']) => {
    if (filterState.sorting.key === key) {
      onFilterChange({
        ...filterState,
        sorting: {
          key,
          dir: filterState.sorting.dir === 'asc' ? 'desc' : 'asc'
        }
      });
    } else {
      onFilterChange({
        ...filterState,
        sorting: { key, dir: 'asc' }
      });
    }
  };

  const visibleItems = sortedResults.slice(0, pageSize);

  const getLatencyBadgeClass = (ms: number) => {
    if (ms <= 150) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (ms <= 400) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
  };

  const getAnonBadgeClass = (anon: AnonymityLevel) => {
    if (anon === 'elite') return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
    if (anon === 'anonymous') return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30';
    return 'bg-slate-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-zinc-950 transition-colors relative">
      {/* Top Filter Bar */}
      <div className="bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 p-3 space-y-2.5 shrink-0 select-none">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by IP, Port, Country, or Server..."
              value={filterState.search}
              onChange={e => onFilterChange({ ...filterState, search: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Country Selector Button */}
            <button
              onClick={onOpenCountryPicker}
              className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center space-x-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                {filterState.selectedCountries.length === 0
                  ? 'All Countries'
                  : `${filterState.selectedCountries.length} Countries`}
              </span>
            </button>

            {/* Export Button */}
            <button
              onClick={onOpenExport}
              disabled={filteredResults.length === 0}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-40 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ({filteredResults.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Checkboxes Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-zinc-800 dark:text-zinc-300">
          {/* Anonymity */}
          <div className="flex items-center space-x-3 bg-slate-100 dark:bg-zinc-950/60 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800/80">
            <span className="text-zinc-500 font-medium text-[11px]">Anon:</span>
            {(['elite', 'anonymous', 'transparent'] as AnonymityLevel[]).map(anon => (
              <label key={anon} className="flex items-center space-x-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterState.anons[anon]}
                  onChange={e =>
                    onFilterChange({
                      ...filterState,
                      anons: { ...filterState.anons, [anon]: e.target.checked }
                    })
                  }
                  className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
                />
                <span className="capitalize text-zinc-800 dark:text-zinc-300 text-[11px]">{anon}</span>
              </label>
            ))}
          </div>

          {/* Protocols */}
          <div className="flex items-center space-x-3 bg-slate-100 dark:bg-zinc-950/60 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800/80">
            <span className="text-zinc-500 font-medium text-[11px]">Proto:</span>
            {(['http', 'https', 'socks4', 'socks5'] as Protocol[]).map(proto => (
              <label key={proto} className="flex items-center space-x-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterState.protocols[proto]}
                  onChange={e =>
                    onFilterChange({
                      ...filterState,
                      protocols: { ...filterState.protocols, [proto]: e.target.checked }
                    })
                  }
                  className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
                />
                <span className="uppercase text-zinc-800 dark:text-zinc-300 text-[11px]">{proto}</span>
              </label>
            ))}
          </div>

          {/* Ports Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-950/60 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800/80">
            <span className="text-zinc-500 font-medium text-[11px]">Ports:</span>
            <button
              onClick={() =>
                onFilterChange({
                  ...filterState,
                  ports: { ...filterState.ports, allow: !filterState.ports.allow }
                })
              }
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                filterState.ports.allow
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {filterState.ports.allow ? 'ALLOW' : 'BLOCK'}
            </button>
            <input
              type="text"
              placeholder="8080, 80, 3128"
              value={filterState.ports.input}
              onChange={e =>
                onFilterChange({
                  ...filterState,
                  ports: { ...filterState.ports, input: e.target.value }
                })
              }
              className="w-24 px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded text-[11px] text-zinc-900 dark:text-zinc-200 focus:outline-none"
            />
          </div>

          {/* Max Timeout Slider */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-zinc-950/60 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800/80">
            <span className="text-zinc-500 font-medium text-[11px]">Max Timeout:</span>
            <input
              type="range"
              min="100"
              max="60000"
              step="100"
              value={filterState.maxTimeout}
              onChange={e => onFilterChange({ ...filterState, maxTimeout: Number(e.target.value) })}
              className="w-20 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 w-12 text-right">
              {filterState.maxTimeout}ms
            </span>
          </div>

          {hasKeepAliveOption && (
            <label className="flex items-center space-x-1 cursor-pointer select-none bg-slate-100 dark:bg-zinc-950/60 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800/80">
              <input
                type="checkbox"
                checked={filterState.misc.onlyKeepAlive}
                onChange={e =>
                  onFilterChange({
                    ...filterState,
                    misc: { ...filterState.misc, onlyKeepAlive: e.target.checked }
                  })
                }
                className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
              />
              <span className="text-zinc-800 dark:text-zinc-300 text-[11px]">Only Keep-Alive</span>
            </label>
          )}
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 select-none">
        <div>
          Showing <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{sortedResults.length.toLocaleString()}</span> filtered (from {results.length.toLocaleString()} total alive)
        </div>
        <div className="text-[11px]">Click IP or Port to copy. Click row for details.</div>
      </div>

      {/* Main Dense Results Table */}
      <div className="flex-1 overflow-auto bg-white dark:bg-zinc-950">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 font-medium select-none z-10">
            <tr>
              <th onClick={() => handleSort('host')} className="py-2 px-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200">
                <div className="flex items-center space-x-1">
                  <span>Host (IP)</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th onClick={() => handleSort('port')} className="py-2 px-2 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200 w-20">
                <div className="flex items-center space-x-1">
                  <span>Port</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th onClick={() => handleSort('protocols')} className="py-2 px-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200">
                <div className="flex items-center space-x-1">
                  <span>Protocols</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th onClick={() => handleSort('anon')} className="py-2 px-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200 w-28">
                <div className="flex items-center space-x-1">
                  <span>Anonymity</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th onClick={() => handleSort('timeout')} className="py-2 px-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200 w-24">
                <div className="flex items-center space-x-1">
                  <span>Latency</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th onClick={() => handleSort('country')} className="py-2 px-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200">
                <div className="flex items-center space-x-1">
                  <span>Country</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th onClick={() => handleSort('server')} className="py-2 px-3 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200">
                <span>Server / Details</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50 font-mono text-zinc-800 dark:text-zinc-300">
            {visibleItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400">
                  No proxies match current filter criteria.
                </td>
              </tr>
            ) : (
              visibleItems.map(item => (
                <tr
                  key={item.id}
                  onClick={() => onInspectProxy(item)}
                  className="hover:bg-slate-100 dark:hover:bg-zinc-900/80 cursor-pointer transition-colors"
                >
                  {/* Clickable Host / IP Cell */}
                  <td
                    onClick={e => handleCopyField(e, item, 'host')}
                    className="py-1.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                    title="Click to copy IP"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{item.host}</span>
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-400 transition-opacity" />
                    </div>
                  </td>

                  {/* Clickable Port Cell */}
                  <td
                    onClick={e => handleCopyField(e, item, 'port')}
                    className="py-1.5 px-2 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                    title="Click to copy Port"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{item.port}</span>
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-400 transition-opacity" />
                    </div>
                  </td>

                  <td className="py-1.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {item.protocols.map(p => (
                        <span
                          key={p}
                          className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700/50"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-1.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getAnonBadgeClass(
                        item.anon
                      )}`}
                    >
                      {item.anon}
                    </span>
                  </td>
                  <td className="py-1.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getLatencyBadgeClass(
                        item.timeout
                      )}`}
                    >
                      {item.timeout}ms
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-zinc-800 dark:text-zinc-200">
                    <span className="mr-1.5">{item.country.flag}</span>
                    <span className="font-sans text-xs">{item.country.name}</span>
                  </td>
                  <td className="py-1.5 px-3 text-zinc-500 dark:text-zinc-400 font-sans text-xs">
                    {item.server ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300">
                        {item.server}
                      </span>
                    ) : item.blacklists && item.blacklists.length > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-300 font-mono text-[10px]">
                        Blacklisted ({item.blacklists.length})
                      </span>
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-600">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Load More */}
      {pageSize < sortedResults.length && (
        <div className="p-2 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-center shrink-0">
          <button
            onClick={() => setPageSize(prev => prev + 200)}
            className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Load More Results ({sortedResults.length - pageSize} remaining)
          </button>
        </div>
      )}

      {/* Floating UI Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 dark:border-zinc-700 text-zinc-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2.5 text-xs font-mono animate-bounce-short">
          <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
