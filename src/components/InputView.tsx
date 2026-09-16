import React, { useState, useRef } from 'react';
import { Clipboard, FolderOpen, AlertCircle, Shuffle, Play, CheckCircle2, Copy, Globe, ArrowRight } from 'lucide-react';
import { RawProxy } from '../types';
import { parseProxyListAsync } from '../utils/proxyParser';

interface InputViewProps {
  onLoadData: (data: {
    list: RawProxy[];
    errors: string[];
    total: number;
    unique: number;
    name: string;
  }) => void;
  onStartCheck: () => void;
  shuffle: boolean;
  onToggleShuffle: (shuffle: boolean) => void;
  loadedData: {
    list: RawProxy[];
    errors: string[];
    total: number;
    unique: number;
    name: string;
  } | null;
}

export const InputView: React.FC<InputViewProps> = ({
  onLoadData,
  onStartCheck,
  shuffle,
  onToggleShuffle,
  loadedData
}) => {
  const [manualText, setManualText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedErrors, setCopiedErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessManualText = async () => {
    if (!manualText.trim()) {
      alert('Please enter proxies or proxy list URLs');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await parseProxyListAsync(manualText);
      if (res.list.length === 0) {
        alert('No valid proxies found in manual input or fetched links.');
        setIsProcessing(false);
        return;
      }

      onLoadData({
        ...res,
        name: res.fetchedUrlsCount && res.fetchedUrlsCount > 0
          ? `Manual Text (${res.fetchedUrlsCount} URL list fetched)`
          : 'Manual Text Input'
      });
    } catch (err) {
      alert('Error parsing input: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        alert('Clipboard is empty');
        return;
      }
      setIsProcessing(true);
      const res = await parseProxyListAsync(text);
      if (res.list.length === 0) {
        alert('No valid proxies found in clipboard text');
        setIsProcessing(false);
        return;
      }
      onLoadData({
        ...res,
        name: 'Clipboard'
      });
    } catch (err) {
      alert('Unable to read clipboard: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    let combinedText = '';
    const fileNames: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileNames.push(file.name);
      combinedText += (await file.text()) + '\n';
    }

    const res = await parseProxyListAsync(combinedText);
    if (res.list.length === 0) {
      alert('No valid proxies found in selected files');
      setIsProcessing(false);
      return;
    }

    onLoadData({
      ...res,
      name: fileNames.join(', ')
    });
    setIsProcessing(false);
  };

  const handleCopyErrors = () => {
    if (loadedData && loadedData.errors.length > 0) {
      navigator.clipboard.writeText(loadedData.errors.join('\n'));
      setCopiedErrors(true);
      setTimeout(() => setCopiedErrors(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full space-y-4 overflow-y-auto">
      {/* Empty Text Box for Manual Paste & Proxy List Links */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Manual Proxy Input & List URLs</span>
          </label>
          <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
            Supports: IP:Port, IP:Port:Country, IP:Port:User:Pass, URLs with proxy lists
          </span>
        </div>

        <textarea
          rows={5}
          value={manualText}
          onChange={e => setManualText(e.target.value)}
          placeholder={"Paste proxies in any format:\n  1.2.3.4:8080\n  1.2.3.4:8080:Singapore\n  1.2.3.4:8080:user:pass\n  1.2.3.4:8080:user:pass:Singapore\nor paste links full of proxies (e.g. https://raw.githubusercontent.com/.../proxies.txt)..."}
          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 rounded-lg p-3 text-xs font-mono text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-y"
        />

        <div className="flex justify-end">
          <button
            onClick={handleProcessManualText}
            disabled={isProcessing || !manualText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all disabled:opacity-40 shadow-sm"
          >
            <span>{isProcessing ? 'Fetching & Parsing...' : 'Parse Text & Fetch Links'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handlePasteClipboard}
          disabled={isProcessing}
          className="flex items-center justify-center space-x-2.5 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 transition-all group shadow-sm disabled:opacity-50"
        >
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all">
            <Clipboard className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">Paste From Clipboard</div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">Quickly parse proxies from copied clipboard text</div>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center justify-center space-x-2.5 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 transition-all group shadow-sm disabled:opacity-50"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".txt,.log"
            className="hidden"
          />
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">Load From Files</div>
            <div className="text-xs text-slate-500 dark:text-zinc-400">Select one or multiple .txt proxy files</div>
          </div>
        </button>
      </div>

      {/* Loaded Proxy Information & Stats */}
      {loadedData ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-900 dark:text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Loaded Data Summary</span>
            </div>

            <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shuffle}
                onChange={e => onToggleShuffle(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-0"
              />
              <Shuffle className="w-3.5 h-3.5 text-slate-400" />
              <span>Shuffle Proxies</span>
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800/80">
              <div className="text-xs text-slate-500 dark:text-zinc-400">Total Lines</div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-zinc-100 mt-0.5">
                {loadedData.total.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800/80">
              <div className="text-xs text-slate-500 dark:text-zinc-400">Unique Parsed</div>
              <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {loadedData.unique.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>Parse Errors</span>
                {loadedData.errors.length > 0 && (
                  <button
                    onClick={handleCopyErrors}
                    title="Click to copy errors"
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedErrors ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <div
                className={`text-lg font-bold font-mono mt-0.5 ${
                  loadedData.errors.length > 0 ? 'text-rose-600 dark:text-rose-400 cursor-pointer' : 'text-slate-400'
                }`}
                onClick={handleCopyErrors}
              >
                {loadedData.errors.length.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950/60 p-3 rounded-lg border border-slate-200 dark:border-zinc-800/80 truncate">
              <div className="text-xs text-slate-500 dark:text-zinc-400">Source</div>
              <div className="text-xs font-medium text-slate-900 dark:text-zinc-200 mt-1 truncate" title={loadedData.name}>
                {loadedData.name}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl p-8 text-center text-slate-500 dark:text-zinc-400 flex flex-col items-center justify-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400" />
          <div className="text-sm font-medium text-slate-800 dark:text-zinc-300">No proxies loaded yet</div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
            Paste proxies or links into the box above, or load files to begin checking.
          </div>
        </div>
      )}

      {/* Start Button */}
      <div className="pt-2">
        <button
          disabled={!loadedData || loadedData.list.length === 0 || isProcessing}
          onClick={onStartCheck}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Start Checking Proxies</span>
        </button>
      </div>
    </div>
  );
};
