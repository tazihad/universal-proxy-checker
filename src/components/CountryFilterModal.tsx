import React, { useState } from 'react';
import { X, Search, Globe, Check } from 'lucide-react';

interface CountryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCountries: { name: string; count: number; flag: string }[];
  selectedCountries: string[];
  onSelectCountries: (countries: string[]) => void;
}

export const CountryFilterModal: React.FC<CountryFilterModalProps> = ({
  isOpen,
  onClose,
  availableCountries,
  selectedCountries,
  onSelectCountries
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = availableCountries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleCountry = (countryName: string) => {
    if (selectedCountries.length === 0) {
      // If currently "All", selecting one means selecting only that one
      onSelectCountries([countryName]);
    } else if (selectedCountries.includes(countryName)) {
      const next = selectedCountries.filter(c => c !== countryName);
      onSelectCountries(next);
    } else {
      onSelectCountries([...selectedCountries, countryName]);
    }
  };

  const handleSelectAll = () => {
    onSelectCountries([]); // empty array signifies ALL
  };

  const handleDeselectAll = () => {
    onSelectCountries(['__NONE__']); // no proxies match
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Filter by Countries</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 space-y-2 bg-slate-50 dark:bg-zinc-900/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Select All
              </button>
              <span className="text-zinc-400">•</span>
              <button
                onClick={handleDeselectAll}
                className="text-zinc-500 dark:text-zinc-400 hover:underline font-medium"
              >
                Deselect All
              </button>
            </div>
            <span className="text-zinc-500 text-[11px]">
              {selectedCountries.length === 0
                ? 'All Countries Selected'
                : `${selectedCountries.length} Selected`}
            </span>
          </div>
        </div>

        {/* Country List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-200 dark:divide-zinc-800/40">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">No countries found</div>
          ) : (
            filtered.map(c => {
              const isSelected =
                selectedCountries.length === 0 || selectedCountries.includes(c.name);
              return (
                <label
                  key={c.name}
                  onClick={() => handleToggleCountry(c.name)}
                  className="flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-zinc-800/60 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5 text-xs text-zinc-900 dark:text-zinc-200">
                    <span>{c.flag}</span>
                    <span className="font-medium">{c.name}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono text-zinc-500">
                      {c.count.toLocaleString()}
                    </span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-zinc-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            Apply Country Filter
          </button>
        </div>
      </div>
    </div>
  );
};
