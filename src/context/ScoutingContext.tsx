import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Prospect,
  ScoutingReport,
  FreeformNote,
  GameLogItem,
  VideoClip,
  DraftBoardEntry,
} from '../types/scouting';
import { dedupeSeasonStats } from '../lib/seasonStats';

export type ActiveView =
  | 'dashboard'
  | 'database'
  | 'dossier'
  | 'reports'
  | 'gamelog'
  | 'video'
  | 'draftboard'
  | 'comparison'
  | 'settings';

export type DossierTab = 'overview' | 'statistics' | 'scouting' | 'gamelog' | 'video' | 'history';

interface ScoutingContextType {
  // Navigation & Active items
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedProspectId: string | null;
  setSelectedProspectId: (id: string | null) => void;
  activeProspect: Prospect | null;

  // Data collections
  prospects: Prospect[];
  reports: ScoutingReport[];
  notes: FreeformNote[];
  gameLogs: GameLogItem[];
  videos: VideoClip[];
  draftBoard: DraftBoardEntry[];

  // Global search & filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Dossier sub-tab (reports, game log, and video live here)
  dossierFocus: DossierTab;
  setDossierFocus: (tab: DossierTab) => void;
  openProspect: (id: string, tab?: DossierTab) => void;

  // Status & Sync
  isSyncing: boolean;
  hasLoaded: boolean;
  loadError: string | null;
  refreshAllData: () => Promise<void>;

  // Actions
  addProspect: (newProspect: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt' | 'reportsCount' | 'notesCount' | 'gamesObservedCount' | 'videoCount' | 'stats'>) => Promise<string>;
  updateProspect: (id: string, updates: Partial<Prospect>) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;
  addReport: (report: Omit<ScoutingReport, 'id'>) => Promise<void>;
  updateReport: (id: string, report: Omit<ScoutingReport, 'id'>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  addNote: (note: Omit<FreeformNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<FreeformNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addGameLog: (log: Omit<GameLogItem, 'id'>) => Promise<void>;
  addVideoClip: (video: Omit<VideoClip, 'id' | 'createdAt'>) => Promise<void>;
  updateDraftBoardRank: (prospectId: string, targetRank: number, targetTier: number, justification?: string) => Promise<void>;
  replaceDraftBoard: (entries: DraftBoardEntry[]) => Promise<void>;
  removeDraftBoardEntry: (prospectId: string) => Promise<void>;

  // Comparison
  comparisonProspectIds: string[];
  toggleComparisonProspect: (id: string) => void;
  clearComparison: () => void;

  // Data management
  exportJSONBackup: () => Promise<string | null>;
  importJSONBackup: (jsonData: string) => Promise<boolean>;
}

const ScoutingContext = createContext<ScoutingContextType | undefined>(undefined);

async function requestJson<T = ScoutingReport>(url: string, method: string, body?: unknown): Promise<T> {
  console.log(`[COURTSIDE] ${method} ${url}`, body ?? '');
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: unknown }).error)
        : `HTTP ${res.status}`;
    console.error(`[COURTSIDE] ${method} ${url} failed`, res.status, data);
    throw new Error(message);
  }
  console.log(`[COURTSIDE] ${method} ${url} ok`, data);
  return data as T;
}

function stripBrowserCache() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith('courtside_')) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Private mode or blocked storage: nothing is persisted either way.
  }
}

export const ScoutingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [dossierFocus, setDossierFocus] = useState<DossierTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [comparisonProspectIds, setComparisonProspectIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [reports, setReports] = useState<ScoutingReport[]>([]);
  const [notes, setNotes] = useState<FreeformNote[]>([]);
  const [gameLogs, setGameLogs] = useState<GameLogItem[]>([]);
  const [videos, setVideos] = useState<VideoClip[]>([]);
  const [draftBoard, setDraftBoard] = useState<DraftBoardEntry[]>([]);

  const draftBoardRef = useRef<DraftBoardEntry[]>([]);
  useEffect(() => {
    draftBoardRef.current = draftBoard;
  }, [draftBoard]);

  const refreshAllData = useCallback(async () => {
    try {
      setIsSyncing(true);
      setLoadError(null);
      const [pRes, rRes, nRes, gRes, vRes, bRes] = await Promise.all([
        fetch('/api/prospects'),
        fetch('/api/reports'),
        fetch('/api/notes'),
        fetch('/api/gamelogs'),
        fetch('/api/videos'),
        fetch('/api/draftboard'),
      ]);

      if (!pRes.ok || !rRes.ok || !nRes.ok || !gRes.ok || !vRes.ok || !bRes.ok) {
        throw new Error('SQLite API returned an error');
      }

      const [pData, rData, nData, gData, vData, bData] = await Promise.all([
        pRes.json(),
        rRes.json(),
        nRes.json(),
        gRes.json(),
        vRes.json(),
        bRes.json(),
      ]);

      const nextProspects: Prospect[] = (Array.isArray(pData) ? pData : []).map((prospect: Prospect) => ({
        ...prospect,
        stats: dedupeSeasonStats(prospect.stats || []),
      }));
      setProspects(nextProspects);
      setReports(Array.isArray(rData) ? rData : []);
      setNotes(Array.isArray(nData) ? nData : []);
      setGameLogs(Array.isArray(gData) ? gData : []);
      setVideos(Array.isArray(vData) ? vData : []);
      setDraftBoard(Array.isArray(bData) ? bData : []);
      setSelectedProspectId((current) => {
        if (current && nextProspects.some((prospect) => prospect.id === current)) return current;
        return nextProspects[0]?.id ?? null;
      });
    } catch (err) {
      console.error('SQLite load failed', err);
      setLoadError('Impossible de lire la base SQLite locale.');
    } finally {
      setIsSyncing(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    stripBrowserCache();
    refreshAllData();
  }, [refreshAllData]);

  const activeProspect = prospects.find((p) => p.id === selectedProspectId) || null;

  const openProspect = (id: string, tab: DossierTab = 'overview') => {
    setSelectedProspectId(id);
    setDossierFocus(tab);
    setActiveView('dossier');
  };

  // Add Prospect via SQLite API
  const addProspect = async (newProspectData: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt' | 'reportsCount' | 'notesCount' | 'gamesObservedCount' | 'videoCount' | 'stats'>) => {
    const id = `prospect-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const created: Prospect = {
      ...newProspectData,
      id,
      stats: [],
      reportsCount: 0,
      notesCount: 0,
      gamesObservedCount: 0,
      videoCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Optimistic update
    setProspects((prev) => [created, ...prev]);
    setSelectedProspectId(id);

    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
      if (res.ok) {
        const serverCreated = await res.json();
        setProspects((prev) => prev.map((p) => (p.id === id ? serverCreated : p)));
      }
    } catch (err) {
      console.warn('Could not persist prospect to SQLite API, kept locally:', err);
    }

    return id;
  };

  // Update Prospect via SQLite API
  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    const now = new Date().toISOString();
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    );

    try {
      await fetch(`/api/prospects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('Could not update prospect on SQLite API:', err);
    }
  };

  // Delete Prospect via SQLite API
  const deleteProspect = async (id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    setReports((prev) => prev.filter((r) => r.prospectId !== id));
    setNotes((prev) => prev.filter((n) => n.prospectId !== id));
    setGameLogs((prev) => prev.filter((g) => g.prospectId !== id));
    setVideos((prev) => prev.filter((v) => v.prospectId !== id));
    setDraftBoard((prev) => prev.filter((b) => b.prospectId !== id));
    setComparisonProspectIds((prev) => prev.filter((pId) => pId !== id));

    if (selectedProspectId === id) {
      const remaining = prospects.filter((p) => p.id !== id);
      setSelectedProspectId(remaining.length > 0 ? remaining[0].id : null);
    }

    try {
      await fetch(`/api/prospects/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete prospect on SQLite API:', err);
    }
  };

  const applySavedReport = (saved: ScoutingReport, previousId?: string) => {
    setReports((prev) => {
      const withoutTemp = prev.filter((report) => report.id !== previousId && report.id !== saved.id);
      return [saved, ...withoutTemp].sort((a, b) => (b.reportDate || '').localeCompare(a.reportDate || ''));
    });
    setProspects((prev) =>
      prev.map((prospect) => {
        if (prospect.id !== saved.prospectId) return prospect;
        const isLatest =
          !prospect.latestReport ||
          prospect.latestReport.id === saved.id ||
          prospect.latestReport.id === previousId ||
          (prospect.latestReport.reportDate || '') <= (saved.reportDate || '');
        return {
          ...prospect,
          latestReport: isLatest ? saved : prospect.latestReport,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Add Scouting Report via SQLite API
  const addReport = async (reportData: Omit<ScoutingReport, 'id'>) => {
    const id = `rep-${Date.now()}`;
    const newReport: ScoutingReport = { ...reportData, id };
    console.log('[COURTSIDE] addReport submit', newReport);

    setReports((prev) => [newReport, ...prev]);
    setProspects((prev) =>
      prev.map((p) => {
        if (p.id === newReport.prospectId) {
          return {
            ...p,
            latestReport: newReport,
            reportsCount: (p.reportsCount || 0) + 1,
            status: p.status === 'Watchlist' || p.status === 'To Observe' ? 'Evaluated' : p.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    try {
      const saved = await requestJson<ScoutingReport>(
        `/api/prospects/${encodeURIComponent(newReport.prospectId)}/reports`,
        'POST',
        newReport
      );
      applySavedReport(saved, id);
    } catch (err) {
      console.error('[COURTSIDE] addReport failed', err);
      await refreshAllData();
      throw err;
    }
  };

  const updateReport = async (id: string, reportData: Omit<ScoutingReport, 'id'>) => {
    const nextReport: ScoutingReport = { ...reportData, id };
    console.log('[COURTSIDE] updateReport submit', nextReport);
    const previousReports = reports;
    const previousProspects = prospects;
    applySavedReport(nextReport, id);

    try {
      const saved = await requestJson<ScoutingReport>(`/api/reports/${encodeURIComponent(id)}`, 'PUT', nextReport);
      applySavedReport(saved, id);
    } catch (err) {
      console.error('[COURTSIDE] updateReport failed', err);
      setReports(previousReports);
      setProspects(previousProspects);
      throw err;
    }
  };

  const deleteReport = async (id: string) => {
    const target = reports.find((report) => report.id === id);
    console.log('[COURTSIDE] deleteReport submit', id, target?.prospectId);
    if (!target) {
      console.error('[COURTSIDE] deleteReport missing local report', id);
      return;
    }

    const previousReports = reports;
    const previousProspects = prospects;
    const remaining = reports.filter((report) => report.id !== id);
    setReports(remaining);
    setProspects((prev) =>
      prev.map((prospect) => {
        if (prospect.id !== target.prospectId) return prospect;
        const latest = remaining
          .filter((report) => report.prospectId === prospect.id)
          .sort((a, b) => (b.reportDate || '').localeCompare(a.reportDate || ''))[0];
        return {
          ...prospect,
          reportsCount: Math.max(0, (prospect.reportsCount || 1) - 1),
          latestReport: latest,
        };
      })
    );

    try {
      await requestJson(`/api/reports/${encodeURIComponent(id)}`, 'DELETE');
    } catch (err) {
      console.error('[COURTSIDE] deleteReport failed, trying nested route', err);
      try {
        await requestJson(
          `/api/prospects/${encodeURIComponent(target.prospectId)}/reports/${encodeURIComponent(id)}`,
          'DELETE'
        );
      } catch (nestedErr) {
        console.error('[COURTSIDE] deleteReport nested route failed', nestedErr);
        setReports(previousReports);
        setProspects(previousProspects);
        throw nestedErr;
      }
    }
  };

  // Notes via SQLite API
  const addNote = async (noteData: Omit<FreeformNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `note-${Date.now()}`;
    const now = new Date().toISOString();
    const newNote: FreeformNote = { ...noteData, id, createdAt: now, updatedAt: now };

    setNotes((prev) => [newNote, ...prev]);

    if (newNote.prospectId) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === newNote.prospectId
            ? { ...p, notesCount: (p.notesCount || 0) + 1, updatedAt: now }
            : p
        )
      );
    }

    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
    } catch (err) {
      console.warn('Could not save note to SQLite API:', err);
    }
  };

  const updateNote = async (id: string, updates: Partial<FreeformNote>) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n))
    );

    try {
      await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('Could not update note on SQLite API:', err);
    }
  };

  const deleteNote = async (id: string) => {
    const target = notes.find((n) => n.id === id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (target?.prospectId) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === target.prospectId
            ? { ...p, notesCount: Math.max(0, (p.notesCount || 1) - 1) }
            : p
        )
      );
    }

    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not delete note on SQLite API:', err);
    }
  };

  // Game Logs via SQLite API
  const addGameLog = async (logData: Omit<GameLogItem, 'id'>) => {
    const id = `gamelog-${Date.now()}`;
    const newLog: GameLogItem = { ...logData, id };
    setGameLogs((prev) => [newLog, ...prev]);

    setProspects((prev) =>
      prev.map((p) =>
        p.id === newLog.prospectId
          ? {
              ...p,
              gamesObservedCount: (p.gamesObservedCount || 0) + 1,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    try {
      await fetch('/api/gamelogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
    } catch (err) {
      console.warn('Could not save game log to SQLite API:', err);
    }
  };

  // Videos via SQLite API
  const addVideoClip = async (videoData: Omit<VideoClip, 'id' | 'createdAt'>) => {
    const id = `vid-${Date.now()}`;
    const newVideo: VideoClip = {
      ...videoData,
      id,
      createdAt: new Date().toISOString(),
    };
    setVideos((prev) => [newVideo, ...prev]);

    setProspects((prev) =>
      prev.map((p) =>
        p.id === newVideo.prospectId
          ? {
              ...p,
              videoCount: (p.videoCount || 0) + 1,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo),
      });
      if (res.ok) {
        const saved = await res.json();
        setVideos((prev) => prev.map((clip) => (clip.id === id ? { ...clip, ...saved, id } : clip)));
      }
    } catch (err) {
      console.warn('Could not save video clip to SQLite API:', err);
    }
  };

  const persistDraftBoard = async (entries: DraftBoardEntry[]) => {
    const normalized = entries.map((item, idx) => ({
      prospectId: item.prospectId,
      rank: idx + 1,
      tier: item.tier,
      justification: item.justification || '',
      previousRank: item.previousRank,
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
    setDraftBoard(normalized);
    const res = await fetch('/api/draftboard', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: normalized }),
    });
    if (!res.ok) {
      throw new Error('Draft board save failed');
    }
    const saved = await res.json();
    if (Array.isArray(saved)) setDraftBoard(saved);
  };

  const replaceDraftBoard = async (entries: DraftBoardEntry[]) => {
    try {
      await persistDraftBoard(entries);
    } catch (err) {
      console.error('Could not update draft board on SQLite API:', err);
      await refreshAllData();
    }
  };

  const updateDraftBoardRank = async (
    prospectId: string,
    targetRank: number,
    targetTier: number,
    justification?: string
  ) => {
    const now = new Date().toISOString();
    const prev = draftBoardRef.current;
    const existing = prev.find((entry) => entry.prospectId === prospectId);
    const filtered = prev
      .filter((entry) => entry.prospectId !== prospectId)
      .sort((a, b) => a.rank - b.rank);

    const entry: DraftBoardEntry = {
      prospectId,
      rank: targetRank,
      tier: targetTier,
      justification: justification ?? existing?.justification ?? '',
      previousRank: existing ? existing.rank : undefined,
      updatedAt: now,
    };

    const clampedIndex = Math.max(0, Math.min(targetRank - 1, filtered.length));
    filtered.splice(clampedIndex, 0, entry);
    await replaceDraftBoard(filtered);
  };

  const removeDraftBoardEntry = async (prospectId: string) => {
    setDraftBoard((prev) => {
      const filtered = prev.filter((e) => e.prospectId !== prospectId);
      return filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));
    });

    try {
      await fetch(`/api/draftboard/${prospectId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not remove entry from SQLite API:', err);
    }
  };

  // Comparison
  const toggleComparisonProspect = (id: string) => {
    setComparisonProspectIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pId) => pId !== id);
      }
      if (prev.length >= 2) {
        return [prev[0], id];
      }
      return [...prev, id];
    });
  };

  const clearComparison = () => {
    setComparisonProspectIds([]);
  };

  // Export JSON Backup (Server-side to backups/ directory + Browser file download)
  const exportJSONBackup = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/backups');
      if (res.ok) {
        const payload = await res.json();
        const data = payload.data || {
          version: '2.0',
          exportedAt: new Date().toISOString(),
          appName: 'COURTSIDE NBA Scouting Database',
          targetDraftYear: 2027,
          prospects,
          reports,
          notes,
          gameLogs,
          videos,
          draftBoard,
        };

        // Trigger browser file download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = payload.backupFile || `courtside_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return payload.backupFile || 'courtside_backup.json';
      }
    } catch (err) {
      console.warn('Server backup error, generating client file fallback:', err);
    }

    // Client fallback download
    const fallbackData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      appName: 'COURTSIDE NBA Scouting Database',
      targetDraftYear: 2027,
      prospects,
      reports,
      notes,
      gameLogs,
      videos,
      draftBoard,
    };
    const blob = new Blob([JSON.stringify(fallbackData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courtside_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return `courtside_backup_${new Date().toISOString().slice(0, 10)}.json`;
  };

  // Restore JSON Backup (Server SQLite restore + state refresh)
  const importJSONBackup = async (jsonData: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data.prospects)) return false;

      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonData,
      });

      if (res.ok) {
        await refreshAllData();
        return true;
      }

      // Fallback local state load
      setProspects(data.prospects);
      if (Array.isArray(data.reports)) setReports(data.reports);
      if (Array.isArray(data.notes)) setNotes(data.notes);
      if (Array.isArray(data.gameLogs)) setGameLogs(data.gameLogs);
      if (Array.isArray(data.videos)) setVideos(data.videos);
      if (Array.isArray(data.draftBoard)) setDraftBoard(data.draftBoard);
      if (data.prospects.length > 0) setSelectedProspectId(data.prospects[0].id);

      return true;
    } catch (e) {
      console.error('Failed to import backup JSON', e);
      return false;
    }
  };

  return (
    <ScoutingContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedProspectId,
        setSelectedProspectId,
        activeProspect,
        prospects,
        reports,
        notes,
        gameLogs,
        videos,
        draftBoard,
        searchQuery,
        setSearchQuery,
        dossierFocus,
        setDossierFocus,
        openProspect,
        isSyncing,
        hasLoaded,
        loadError,
        refreshAllData,
        addProspect,
        updateProspect,
        deleteProspect,
        addReport,
        updateReport,
        deleteReport,
        addNote,
        updateNote,
        deleteNote,
        addGameLog,
        addVideoClip,
        updateDraftBoardRank,
        replaceDraftBoard,
        removeDraftBoardEntry,
        comparisonProspectIds,
        toggleComparisonProspect,
        clearComparison,
        exportJSONBackup,
        importJSONBackup,
      }}
    >
      {children}
    </ScoutingContext.Provider>
  );
};

export const useScouting = () => {
  const context = useContext(ScoutingContext);
  if (!context) {
    throw new Error('useScouting must be used within a ScoutingProvider');
  }
  return context;
};
