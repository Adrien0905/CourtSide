import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { DataSyncPanel } from './DataSyncPanel';

export const SettingsView: React.FC = () => {
  const {
    exportJSONBackup,
    importJSONBackup,
    prospects,
    reports,
    draftBoard,
    notes,
    refreshAllData,
  } = useScouting();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  // File upload handler for JSON backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importJSONBackup(content);
        if (success) {
          setImportStatus('Database successfully restored from JSON backup!');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('Invalid JSON backup file format.');
          setTimeout(() => setImportStatus(null), 4000);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Database className="w-5 h-5 text-amber-400" />
          <span>Settings & Data Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage local database backups, export CSV spreadsheets, and preserve your scouting work on GitHub.
        </p>
      </div>

      {importStatus && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Database Stats Card */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Database Health & Local Storage
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-[#141C2E] border border-[#1F2C46]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Prospects</div>
            <div className="text-lg font-mono font-bold text-white mt-0.5">{prospects.length}</div>
          </div>
          <div className="p-3 rounded bg-[#141C2E] border border-[#1F2C46]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Reports</div>
            <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">{reports.length}</div>
          </div>
          <div className="p-3 rounded bg-[#141C2E] border border-[#1F2C46]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Draft Board</div>
            <div className="text-lg font-mono font-bold text-sky-400 mt-0.5">{draftBoard.length}</div>
          </div>
          <div className="p-3 rounded bg-[#141C2E] border border-[#1F2C46]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Notes</div>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">{notes.length}</div>
          </div>
        </div>
      </div>

      {/* Backup and Restore Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export JSON */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Export Full Database Backup
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Downloads a single human-readable JSON file containing all prospects, scouting reports, radar evaluations, notes, and Draft Board rankings.
          </p>
          <button
            onClick={exportJSONBackup}
            className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download courtside_backup.json</span>
          </button>
        </div>

        {/* Restore from JSON */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Upload className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Restore from Backup File
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Restore your entire scouting database from a previous JSON export. Ideal for moving to a new computer or recovering notes.
          </p>
          <label className="w-full py-2 px-3 bg-[#162035] hover:bg-[#1E2B47] text-slate-200 border border-[#23314D] font-medium rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Select JSON Backup File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <DataSyncPanel onDataChanged={refreshAllData} />

      {/* GitHub Preservation Guide */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>How to Preserve Your Scouting Work on GitHub</span>
        </h3>
        <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
          <p>
            Because COURTSIDE stores your notes and evaluations locally, you can easily preserve them in a private GitHub repository:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 font-mono text-[11px]">
            <li>Click <strong>"Download courtside_backup.json"</strong> above at the end of a scouting session.</li>
            <li>Place the exported file inside your project folder (e.g., in a <code>backups/</code> folder).</li>
            <li>Commit the file: <code>git add . && git commit -m "Scouting update: 2027 draft class" && git push</code></li>
          </ol>
          <p className="text-[11px] text-slate-400 pt-1">
            This guarantees your scouting intellectual property is safely preserved and version-controlled over the years.
          </p>
        </div>
      </div>

    </div>
  );
};
