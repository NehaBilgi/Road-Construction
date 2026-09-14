import React, { useState } from 'react';
import { Archive, Download, Upload, RefreshCw, CheckCircle2, FileText, Database } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const YearlyArchiveModule: React.FC = () => {
  const { exportDatabaseJSON, importDatabaseJSON, resetToSampleData } = useERP();
  const [importedJson, setImportedJson] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleExport = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bilgi_Crusher_ERP_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg({ text: 'Database backup downloaded successfully!' });
  };

  const handleImport = () => {
    if (!importedJson.trim()) {
      setStatusMsg({ text: 'Please paste valid backup JSON data', isError: true });
      return;
    }
    const success = importDatabaseJSON(importedJson);
    if (success) {
      setStatusMsg({ text: 'Database restored successfully! Reloading session...' });
      setTimeout(() => window.location.reload(), 800);
    } else {
      setStatusMsg({ text: 'Failed to import JSON. Invalid schema.', isError: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Archive className="w-6 h-6 text-blue-400" />
            Yearly Archive & Database Backups
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Financial year closing, audit export archives, and complete offline JSON restore engine.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.isError
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-[#0c1427] border border-[#182643] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Full Backup Export</h3>
                <p className="text-xs text-slate-400">Download complete ledger & stock data as JSON</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Export all 14 materials, stock ledgers, machinery operational logs, bowser diesel fills, employee muster rolls, and highway chainage progress in encrypted format.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
          >
            <Download className="w-4 h-4" />
            Download Database (.json)
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-[#0c1427] border border-[#182643] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Restore / Import Archive</h3>
                <p className="text-xs text-slate-400">Restore state from saved JSON file</p>
              </div>
            </div>
            <textarea
              value={importedJson}
              onChange={(e) => setImportedJson(e.target.value)}
              placeholder="Paste JSON database backup string here..."
              rows={3}
              className="w-full bg-[#080e1e] border border-[#1c2944] focus:border-emerald-500 rounded-lg p-3 text-xs text-slate-200 outline-none font-mono"
            />
          </div>

          <button
            onClick={handleImport}
            className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
          >
            <Upload className="w-4 h-4" />
            Restore Database
          </button>
        </div>
      </div>
    </div>
  );
};
