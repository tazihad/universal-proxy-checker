import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { InputView } from './components/InputView';
import { CheckingView } from './components/CheckingView';
import { ResultsView } from './components/ResultsView';
import { SettingsView } from './components/SettingsView';
import { JudgesView } from './components/JudgesView';
import { BlacklistView } from './components/BlacklistView';
import { InfoView } from './components/InfoView';
import { ResultInspectorModal } from './components/ResultInspectorModal';
import { CountryFilterModal } from './components/CountryFilterModal';
import { ExportModal } from './components/ExportModal';

import {
  RawProxy,
  ProxyResultItem,
  CoreOptions,
  JudgeItem,
  BlacklistItem,
  ResultsFilterState,
  CheckingStats
} from './types';
import { DEFAULT_JUDGES, JudgeManager } from './utils/judgeManager';
import { DEFAULT_BLACKLISTS, BlacklistManager } from './utils/blacklistManager';
import { CheckerEngine } from './utils/checkerEngine';

export const App: React.FC = () => {
  // Persistent Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme_mode');
      if (saved !== null) {
        return saved === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('input');

  // Synchronize document dark class and save setting to localStorage
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme_mode', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme_mode', 'light');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [darkMode]);

  // State: Loaded Proxy Data
  const [loadedData, setLoadedData] = useState<{
    list: RawProxy[];
    errors: string[];
    total: number;
    unique: number;
    name: string;
  } | null>(null);

  // State: Core Options
  const [options, setOptions] = useState<CoreOptions>({
    protocols: { http: true, https: true, socks4: true, socks5: true },
    captureFullData: true,
    captureServer: true,
    keepAlive: true,
    threads: 50,
    retries: 0,
    timeout: 10000,
    shuffle: false
  });

  // State: Judges & Blacklists
  const [judges, setJudges] = useState<JudgeItem[]>(DEFAULT_JUDGES);
  const [swapJudges, setSwapJudges] = useState(true);
  const [blacklists, setBlacklists] = useState<BlacklistItem[]>(DEFAULT_BLACKLISTS);
  const [filteringEnabled, setFilteringEnabled] = useState(true);

  // State: Checking Execution & Results
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<ProxyResultItem[]>([]);
  const [checkingStats, setCheckingStats] = useState<CheckingStats>({
    all: 0,
    done: 0,
    speed: 0,
    elapsed: 0,
    protocols: { http: 0, https: 0, socks4: 0, socks5: 0 }
  });

  // State: Filters for Results
  const [filterState, setFilterState] = useState<ResultsFilterState>({
    search: '',
    anons: { elite: true, anonymous: true, transparent: true },
    protocols: { http: true, https: true, socks4: true, socks5: true },
    misc: { onlyKeepAlive: false },
    blacklists: {},
    ports: { input: '', allow: true },
    maxTimeout: 60000,
    selectedCountries: [],
    sorting: { key: 'timeout', dir: 'asc' }
  });

  // State: Modals
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [inspectedProxy, setInspectedProxy] = useState<ProxyResultItem | null>(null);

  const engineRef = useRef<CheckerEngine | null>(null);

  // Available countries summary for modal picker
  const availableCountries = useMemo(() => {
    const map = new Map<string, { count: number; flag: string }>();
    results.forEach(r => {
      const name = r.country.name;
      const current = map.get(name);
      if (current) {
        current.count++;
      } else {
        map.set(name, { count: 1, flag: r.country.flag });
      }
    });
    return Array.from(map.entries()).map(([name, val]) => ({
      name,
      count: val.count,
      flag: val.flag
    }));
  }, [results]);

  // Start Proxy Checker execution
  const handleStartCheck = async () => {
    if (!loadedData || loadedData.list.length === 0) return;

    setResults([]);
    setCheckingStats({
      all: loadedData.list.length,
      done: 0,
      speed: 0,
      elapsed: 0,
      protocols: { http: 0, https: 0, socks4: 0, socks5: 0 }
    });

    const judgeMgr = new JudgeManager(judges, swapJudges);
    const blacklistMgr = new BlacklistManager(filteringEnabled);

    // Register active blacklists
    blacklists.forEach(b => {
      if (b.active && b.addresses) {
        blacklistMgr.addList(b.title, b.addresses);
      }
    });

    const engine = new CheckerEngine(loadedData.list, options, judgeMgr, blacklistMgr);
    engineRef.current = engine;

    setIsChecking(true);
    setActiveTab('checking');

    engine.start({
      onProgress: stats => {
        setCheckingStats(stats);
      },
      onProxyDone: proxy => {
        setResults(prev => [...prev, proxy]);
      },
      onComplete: finalResults => {
        setResults(finalResults);
        setIsChecking(false);
      }
    });
  };

  const handleStopCheck = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setIsChecking(false);
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden transition-colors ${darkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenInfo={() => setActiveTab('info')}
        isChecking={isChecking}
        totalProxies={loadedData ? loadedData.unique : 0}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isChecking={isChecking}
        resultCount={results.length}
      />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'input' && (
          <InputView
            onLoadData={setLoadedData}
            onStartCheck={handleStartCheck}
            shuffle={options.shuffle}
            onToggleShuffle={shuffle => setOptions({ ...options, shuffle })}
            loadedData={loadedData}
          />
        )}

        {activeTab === 'checking' && (
          <CheckingView
            stats={checkingStats}
            isChecking={isChecking}
            onStop={handleStopCheck}
            onViewResults={() => setActiveTab('results')}
          />
        )}

        {activeTab === 'results' && (
          <ResultsView
            results={results}
            filterState={filterState}
            onFilterChange={setFilterState}
            onOpenCountryPicker={() => setIsCountryPickerOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onInspectProxy={setInspectedProxy}
            hasKeepAliveOption={options.keepAlive}
            activeBlacklistsCount={blacklists.filter(b => b.active).length}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView options={options} onOptionsChange={setOptions} />
        )}

        {activeTab === 'judges' && (
          <JudgesView
            judges={judges}
            onUpdateJudges={setJudges}
            swapJudges={swapJudges}
            onToggleSwap={setSwapJudges}
          />
        )}

        {activeTab === 'blacklists' && (
          <BlacklistView
            blacklists={blacklists}
            onUpdateBlacklists={setBlacklists}
            filteringEnabled={filteringEnabled}
            onToggleFiltering={setFilteringEnabled}
          />
        )}

        {activeTab === 'info' && <InfoView />}
      </main>

      {/* Modals */}
      <CountryFilterModal
        isOpen={isCountryPickerOpen}
        onClose={() => setIsCountryPickerOpen(false)}
        availableCountries={availableCountries}
        selectedCountries={filterState.selectedCountries}
        onSelectCountries={countries =>
          setFilterState({ ...filterState, selectedCountries: countries })
        }
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        items={results}
      />

      <ResultInspectorModal
        proxy={inspectedProxy}
        onClose={() => setInspectedProxy(null)}
      />
    </div>
  );
};
