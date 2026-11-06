import React, { useCallback, useEffect, useState } from 'react';
import { Download, Upload, Search, RefreshCw, AlertTriangle, Check, Radio } from 'lucide-react';

interface ProviderStatus {
  id: string;
  label: string;
  keyRequired: boolean;
  keyConfigured: boolean;
  coverage: string;
}

interface SyncStatus {
  ttlHours: number;
  stale: boolean;
  cache: { entries: number; fresh: number; expired: number };
  providers: ProviderStatus[];
  lastSuccess: { at: string; provider: string; message: string } | null;
  lastError: { at: string; provider: string; message: string } | null;
}

interface SyncLog {
  id: string;
  provider: string;
  endpoint: string;
  status: string;
  message: string;
  records_synced: number;
  synced_at: string;
}

interface SearchHit {
  provider: 'cbb' | 'cbd';
  externalId: string;
  name: string;
  team: string;
  position: string;
  season: number | null;
  imageUrl: string;
}

interface SearchResponse {
  results: SearchHit[];
  cached?: boolean;
  stale?: boolean;
  warning?: string;
  fetchedAt?: string | null;
}

interface ImportSummary {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

function formatWhen(value: string | null | undefined): string {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // Response was not JSON.
  }
  return `Request failed (${response.status})`;
}

export const DataSyncPanel: React.FC<{
  variant?: 'full' | 'compact';
  onDataChanged: () => Promise<void> | void;
}> = ({ variant = 'full', onDataChanged }) => {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [provider, setProvider] = useState<'cbb' | 'cbd'>('cbb');
  const [query, setQuery] = useState('');
  const [team, setTeam] = useState('');
  const [season, setSeason] = useState('2027');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searchNote, setSearchNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<'ok' | 'err'>('ok');

  const refreshMonitor = useCallback(async () => {
    const [statusRes, logRes] = await Promise.all([
      fetch('/api/ncaa/status'),
      fetch('/api/sync/logs?limit=8'),
    ]);
    if (statusRes.ok) setStatus(await statusRes.json());
    if (logRes.ok) setLogs(await logRes.json());
  }, []);

  useEffect(() => {
    refreshMonitor().catch(() => {
      setNoticeTone('err');
      setNotice('Sync status is unavailable. The local server may still be starting.');
    });
  }, [refreshMonitor]);

  const show = (tone: 'ok' | 'err', message: string) => {
    setNoticeTone(tone);
    setNotice(message);
  };

  const downloadCsv = async (path: string, fallbackName: string) => {
    setBusy('download');
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(await readError(response));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const header = response.headers.get('Content-Disposition') || '';
      const named = header.match(/filename="([^"]+)"/);
      link.download = named?.[1] || fallbackName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      show('err', error instanceof Error ? error.message : 'Download failed');
    } finally {
      setBusy(null);
    }
  };

  const uploadCsv = async (file: File) => {
    setBusy('upload');
    try {
      const csv = await file.text();
      const response = await fetch('/api/csv/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const summary = (await response.json()) as ImportSummary;
      const problem = summary.errors.slice(0, 3).map((issue) => `Row ${issue.row}: ${issue.message}`).join(' ');
      show(
        summary.created + summary.updated > 0 ? 'ok' : 'err',
        `CSV import: ${summary.created} created, ${summary.updated} updated, ${summary.skipped} skipped. ${problem}`
      );
      await onDataChanged();
      await refreshMonitor();
    } catch (error) {
      show('err', error instanceof Error ? error.message : 'CSV import failed');
    } finally {
      setBusy(null);
    }
  };

  const searchPlayers = async () => {
    setBusy('search');
    setSearchNote(null);
    setHits([]);
    try {
      const params = new URLSearchParams({ provider, q: query, team, season });
      const response = await fetch(`/api/ncaa/search?${params.toString()}`);
      if (!response.ok) throw new Error(await readError(response));
      const data = (await response.json()) as SearchResponse;
      setHits(data.results || []);
      const cacheLabel = data.stale ? 'stale cache' : data.cached ? 'fresh cache' : 'live fetch';
      setSearchNote(data.warning || `${data.results?.length || 0} result(s) from ${cacheLabel}.`);
      await refreshMonitor();
    } catch (error) {
      show('err', error instanceof Error ? error.message : 'Search failed');
    } finally {
      setBusy(null);
    }
  };

  const importHit = async (hit: SearchHit) => {
    setBusy(hit.externalId);
    try {
      const response = await fetch('/api/ncaa/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: hit.provider,
          externalId: hit.externalId,
          team: hit.team,
          season: hit.season || Number(season),
        }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json();
      const cacheLabel = data.stale ? ' using the last cached snapshot' : '';
      show('ok', `${hit.name} ${data.action === 'created' ? 'added' : 'updated'}${cacheLabel}.`);
      await onDataChanged();
      await refreshMonitor();
    } catch (error) {
      show('err', error instanceof Error ? error.message : 'Import failed');
    } finally {
      setBusy(null);
    }
  };

  const tone = status?.lastError ? 'error' : status?.stale ? 'stale' : 'fresh';
  const dotClass = tone === 'error' ? 'bg-rose-400' : tone === 'stale' ? 'bg-amber-400' : 'bg-emerald-400';
  const label = tone === 'error' ? 'Sync error' : tone === 'stale' ? 'Cache aging' : 'Cache current';

  const csvButtons = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => downloadCsv('/api/csv/export', 'courtside_players.csv')}
        disabled={busy === 'download'}
        className="px-3 py-1.5 bg-[#14231E] hover:bg-[#1B2F28] text-emerald-300 border border-emerald-500/30 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download CSV</span>
      </button>
      {variant === 'full' && (
        <button
          type="button"
          onClick={() => downloadCsv('/api/csv/template', 'courtside_non_ncaa_template.csv')}
          className="px-3 py-1.5 bg-[#131B2C] hover:bg-[#1A2438] text-slate-200 border border-[#23314D] rounded text-xs font-medium transition-colors"
        >
          Template
        </button>
      )}
      <label className="px-3 py-1.5 bg-[#162035] hover:bg-[#1E2B47] text-slate-200 border border-[#23314D] rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer">
        <Upload className="w-3.5 h-3.5 text-sky-400" />
        <span>{busy === 'upload' ? 'Importing…' : 'Upload CSV'}</span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) uploadCsv(file);
          }}
        />
      </label>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className="bg-[#101726] border border-[#1E293B] rounded-lg px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-slate-100">{label}</span>
            <span className="text-slate-500"> · </span>
            <span>Last sync {formatWhen(status?.lastSuccess?.at)}</span>
            <span className="text-slate-500"> · </span>
            <span className="font-mono">{status?.cache.fresh ?? 0} fresh / {status?.cache.entries ?? 0} cached</span>
          </div>
        </div>
        {notice && (
          <p className={`w-full text-[11px] ${noticeTone === 'ok' ? 'text-emerald-300' : 'text-rose-300'}`}>{notice}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              NCAA sync status
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              CBB Stats is queried without a key. College Basketball Data uses CBBD_API_KEY from the server .env file. Snapshots stay in SQLite for {status?.ttlHours ?? 6} hours, and a failed request keeps the last cached copy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refreshMonitor()}
            className="px-2.5 py-1.5 rounded bg-[#131B2C] border border-[#22314E] text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          <span className="font-semibold text-slate-100">{label}</span>
          <span className="text-slate-500">Last success {formatWhen(status?.lastSuccess?.at)}</span>
        </div>

        {status?.lastError && (
          <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{status.lastError.provider}: {status.lastError.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {status?.providers.map((item) => (
            <div key={item.id} className="p-3 rounded bg-[#141C2E] border border-[#1F2C46]">
              <div className="text-[10px] uppercase font-bold text-slate-400">{item.label}</div>
              <div className={`mt-1 font-semibold ${item.keyConfigured ? 'text-emerald-300' : 'text-amber-300'}`}>
                {item.keyRequired ? (item.keyConfigured ? 'Key configured' : 'Key missing in .env') : 'No key required'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{item.coverage}</div>
            </div>
          ))}
          <div className="p-3 rounded bg-[#141C2E] border border-[#1F2C46]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Local cache</div>
            <div className="mt-1 font-mono text-white">{status?.cache.fresh ?? 0} fresh · {status?.cache.expired ?? 0} expired</div>
            <div className="text-[11px] text-slate-500 mt-1">{status?.cache.entries ?? 0} stored responses</div>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-500">Sync log</div>
            <ul className="divide-y divide-[#1E293B] border border-[#1E293B] rounded-md overflow-hidden">
              {logs.map((log) => (
                <li key={log.id} className="px-3 py-2 bg-[#0E1422] text-[11px] flex items-start justify-between gap-3">
                  <span className="text-slate-300">
                    <span className={log.status === 'error' ? 'text-rose-300' : 'text-emerald-300'}>{log.status}</span>
                    <span className="text-slate-500"> · {log.provider}</span>
                    <span> · {log.message}</span>
                  </span>
                  <span className="font-mono text-slate-500 shrink-0">{formatWhen(log.synced_at)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Find an NCAA player</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value as 'cbb' | 'cbd')}
            className="bg-[#141C2E] border border-[#23314D] rounded-md px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="cbb">CBB Stats (name)</option>
            <option value="cbd">College Basketball Data (team)</option>
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={provider === 'cbb' ? 'Player name' : 'Optional name filter'}
            className="bg-[#141C2E] border border-[#23314D] rounded-md px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500"
          />
          <input
            value={team}
            onChange={(event) => setTeam(event.target.value)}
            placeholder={provider === 'cbd' ? 'Team, e.g. Duke' : 'Team (CBD only)'}
            className="bg-[#141C2E] border border-[#23314D] rounded-md px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500"
          />
          <input
            value={season}
            onChange={(event) => setSeason(event.target.value)}
            placeholder="Season end year"
            className="bg-[#141C2E] border border-[#23314D] rounded-md px-2.5 py-1.5 text-xs text-slate-100"
          />
        </div>
        <button
          type="button"
          onClick={searchPlayers}
          disabled={busy === 'search'}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" />
          {busy === 'search' ? 'Searching…' : 'Search and cache'}
        </button>
        {searchNote && <p className="text-[11px] text-slate-400">{searchNote}</p>}
        {hits.length > 0 && (
          <ul className="divide-y divide-[#1E293B] border border-[#1E293B] rounded-md overflow-hidden">
            {hits.map((hit) => (
              <li key={`${hit.provider}-${hit.externalId}`} className="px-3 py-2 bg-[#0E1422] flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-slate-100 font-semibold">{hit.name}</div>
                  <div className="text-[11px] text-slate-400">{hit.team} · {hit.position || 'Position unavailable'} · {hit.season || 'Season n/a'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => importHit(hit)}
                  disabled={busy === hit.externalId}
                  className="px-2.5 py-1 rounded bg-[#162035] border border-[#23314D] text-sky-300 hover:text-white disabled:opacity-50"
                >
                  {busy === hit.externalId ? 'Saving…' : 'Add to database'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Non-NCAA CSV import and export</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Overtime Elite, Europe, High School, G League, and NCAA Division II/III have no free player API here. Upload a CSV to map those rows onto the local player and season-stat tables. Download exports the current database, including NCAA rows already cached.
        </p>
        {csvButtons}
      </div>

      {notice && (
        <div className={`p-3.5 rounded-lg text-xs font-medium flex items-center gap-2 ${noticeTone === 'ok' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-200'}`}>
          {noticeTone === 'ok' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
};
