import React, { useState, useMemo } from 'react';
import { X, Download, Copy, Check, FileText } from 'lucide-react';
import { ProxyResultItem, ExportOptions } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ProxyResultItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, items }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    protocolFormat: 1,
    authFormat: 1
  });
  const [copied, setCopied] = useState(false);

  const hasAuthProxies = useMemo(
    () => items.some(item => item.auth !== 'none'),
    [items]
  );

  const formattedOutput = useMemo(() => {
    return items
      .map(item => {
        let authPart = '';
        if (item.auth !== 'none') {
          authPart = item.auth;
        }

        const hostPort = `${item.host}:${item.port}`;
        const mainProto = item.protocols[0] || 'http';

        let result = '';

        if (exportOptions.protocolFormat === 1) {
          // Host:Port format
          if (authPart) {
            result =
              exportOptions.authFormat === 1
                ? `${authPart}@${hostPort}`
                : `${hostPort}:${authPart}`;
          } else {
            result = hostPort;
          }
        } else {
          // Protocol://Host:Port format
          if (authPart) {
            result =
              exportOptions.authFormat === 1
                ? `${mainProto}://${authPart}@${hostPort}`
                : `${mainProto}://${hostPort}:${authPart}`;
          } else {
            result = `${mainProto}://${hostPort}`;
          }
        }

        return result;
      })
      .join('\n');
  }, [items, exportOptions]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTxt = () => {
    const blob = new Blob([formattedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proxies_export_${items.length}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Export Proxies ({items.length.toLocaleString()})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Protocol Type Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-800 dark:text-zinc-300">Protocol Format</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setExportOptions({ ...exportOptions, protocolFormat: 1 })}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  exportOptions.protocolFormat === 1
                    ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-500 text-zinc-900 dark:text-zinc-100'
                    : 'bg-slate-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="font-mono font-bold text-xs">Host:Port</div>
                <div className="text-[11px] text-zinc-500 mt-1">192.168.1.1:8080</div>
              </label>

              <label
                onClick={() => setExportOptions({ ...exportOptions, protocolFormat: 2 })}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  exportOptions.protocolFormat === 2
                    ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-500 text-zinc-900 dark:text-zinc-100'
                    : 'bg-slate-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="font-mono font-bold text-xs">Protocol://Host:Port</div>
                <div className="text-[11px] text-zinc-500 mt-1">socks5://192.168.1.1:8080</div>
              </label>
            </div>
          </div>

          {/* Auth Format Selection */}
          {hasAuthProxies && (
            <div className="space-y-2">
              <label className="font-semibold text-zinc-800 dark:text-zinc-300">Authentication Format</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setExportOptions({ ...exportOptions, authFormat: 1 })}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    exportOptions.authFormat === 1
                      ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-500 text-zinc-900 dark:text-zinc-100'
                      : 'bg-slate-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="font-mono font-bold text-xs">User:Pass@Host:Port</div>
                  <div className="text-[11px] text-zinc-500 mt-1">user:pass@192.168.1.1:8080</div>
                </label>

                <label
                  onClick={() => setExportOptions({ ...exportOptions, authFormat: 2 })}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    exportOptions.authFormat === 2
                      ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-500 text-zinc-900 dark:text-zinc-100'
                      : 'bg-slate-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="font-mono font-bold text-xs">Host:Port:User:Pass</div>
                  <div className="text-[11px] text-zinc-500 mt-1">192.168.1.1:8080:user:pass</div>
                </label>
              </div>
            </div>
          )}

          {/* Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-800 dark:text-zinc-300">Export Preview</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Showing first {Math.min(5, items.length)} lines
              </span>
            </div>
            <textarea
              readOnly
              rows={5}
              value={formattedOutput.split('\n').slice(0, 5).join('\n') + (items.length > 5 ? '\n...' : '')}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
          </button>

          <button
            onClick={handleSaveTxt}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Save as .txt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
