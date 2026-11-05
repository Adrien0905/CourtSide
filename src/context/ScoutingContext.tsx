import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Prospect,
  ScoutingReport,
  FreeformNote,
  GameLogItem,
  VideoClip,
  DraftBoardEntry,
  Position,
  ProspectStatus,
  LeagueCategory
} from '../types/scouting';
import {
  SAMPLE_PROSPECT,
  INITIAL_DRAFT_BOARD
} from '../data/sampleProspect';

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

  // Status & Sync
  isSyncing: boolean;
  refreshAllData: () => Promise<void>;

  // Actions
  addProspect: (newProspect: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt' | 'reportsCount' | 'notesCount' | 'gamesObservedCount' | 'videoCount' | 'stats'>) => Promise<string>;
  updateProspect: (id: string, updates: Partial<Prospect>) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;
  addReport: (report: Omit<ScoutingReport, 'id'>) => Promise<void>;
  addNote: (note: Omit<FreeformNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<FreeformNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addGameLog: (log: Omit<GameLogItem, 'id'>) => Promise<void>;
  addVideoClip: (video: Omit<VideoClip, 'id' | 'createdAt'>) => Promise<void>;
  updateDraftBoardRank: (prospectId: string, targetRank: number, targetTier: number, justification?: string) => Promise<void>;
  removeDraftBoardEntry: (prospectId: string) => Promise<void>;

  // Comparison
  comparisonProspectIds: string[];
  toggleComparisonProspect: (id: string) => void;
  clearComparison: () => void;

  // Data management
  exportJSONBackup: () => Promise<string | null>;
  importJSONBackup: (jsonData: string) => Promise<boolean>;
  resetToSampleData: () => Promise<void>;
}

const ScoutingContext = createContext<ScoutingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROSPECTS: 'courtside_prospects_v2',
  REPORTS: 'courtside_reports_v2',
  NOTES: 'courtside_notes_v2',
  GAME_LOGS: 'courtside_game_logs_v2',
  VIDEOS: 'courtside_videos_v2',
  DRAFT_BOARD: 'courtside_draft_board_v2',
};

export const ScoutingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(SAMPLE_PROSPECT.id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [comparisonProspectIds, setComparisonProspectIds] = useState<string[]>([SAMPLE_PROSPECT.id]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Initialize with fallback to local storage or template
  const [prospects, setProspects] = useState<Prospect[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROSPECTS);
      return saved ? JSON.parse(saved) : [SAMPLE_PROSPECT];
    } catch {
      return [SAMPLE_PROSPECT];
    }
  });

  const [reports, setReports] = useState<ScoutingReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notes, setNotes] = useState<FreeformNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [gameLogs, setGameLogs] = useState<GameLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [videos, setVideos] = useState<VideoClip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [draftBoard, setDraftBoard] = useState<DraftBoardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRAFT_BOARD);
      return saved ? JSON.parse(saved) : INITIAL_DRAFT_BOARD;
    } catch {
      return INITIAL_DRAFT_BOARD;
    }
  });

  // Fetch all data from SQLite server on mount
  const refreshAllData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const [pRes, rRes, nRes, gRes, vRes, bRes] = await Promise.all([
        fetch('/api/prospects'),
        fetch('/api/reports'),
        fetch('/api/notes'),
        fetch('/api/gamelogs'),
        fetch('/api/videos'),
        fetch('/api/draftboard'),
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData) && pData.length > 0) {
          setProspects(pData);
          if (!selectedProspectId || !pData.some((p: any) => p.id === selectedProspectId)) {
            setSelectedProspectId(pData[0].id);
          }
        }
      }

      if (rRes.ok) {
        const rData = await rRes.json();
        if (Array.isArray(rData)) setReports(rData);
      }

      if (nRes.ok) {
        const nData = await nRes.json();
        if (Array.isArray(nData)) setNotes(nData);
      }

      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData)) setGameLogs(gData);
      }

      if (vRes.ok) {
        const vData = await vRes.json();
        if (Array.isArray(vData)) setVideos(vData);
      }

      if (bRes.ok) {
        const bData = await bRes.json();
        if (Array.isArray(bData)) setDraftBoard(bData);
      }
    } catch (err) {
      console.warn('Backend SQLite sync error, retaining local state:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [selectedProspectId]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Keep local storage synced as resilient offline backup cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROSPECTS, JSON.stringify(prospects));
  }, [prospects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAME_LOGS, JSON.stringify(gameLogs));
  }, [gameLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRAFT_BOARD, JSON.stringify(draftBoard));
  }, [draftBoard]);

  const activeProspect = prospects.find((p) => p.id === selectedProspectId) || prospects[0] || null;

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

  // Add Scouting Report via SQLite API
  const addReport = async (reportData: Omit<ScoutingReport, 'id'>) => {
    const id = `rep-${Date.now()}`;
    const newReport: ScoutingReport = { ...reportData, id };

    // Optimistic UI updates
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
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      });
    } catch (err) {
      console.warn('Could not persist report to SQLite API:', err);
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
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo),
      });
    } catch (err) {
      console.warn('Could not save video clip to SQLite API:', err);
    }
  };

  // Draft Board Reordering via SQLite API
  const updateDraftBoardRank = async (
    prospectId: string,
    targetRank: number,
    targetTier: number,
    justification?: string
  ) => {
    const now = new Date().toISOString();
    let reordered: DraftBoardEntry[] = [];

    setDraftBoard((prev) => {
      const existing = prev.find((e) => e.prospectId === prospectId);
      const filtered = prev.filter((e) => e.prospectId !== prospectId);

      const entry: DraftBoardEntry = {
        prospectId,
        rank: targetRank,
        tier: targetTier,
        justification: justification || existing?.justification || '',
        previousRank: existing ? existing.rank : undefined,
        updatedAt: now,
      };

      const clampedIndex = Math.max(0, Math.min(targetRank - 1, filtered.length));
      filtered.splice(clampedIndex, 0, entry);

      reordered = filtered.map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));

      return reordered;
    });

    try {
      await fetch('/api/draftboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: reordered }),
      });
    } catch (err) {
      console.warn('Could not update draft board on SQLite API:', err);
    }
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
      if (prev.length >= 4) {
        return [...prev.slice(1), id];
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

  // Reset to Sample Template in SQLite
  const resetToSampleData = async () => {
    const resetPayload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      appName: 'COURTSIDE NBA Scouting Database',
      targetDraftYear: 2027,
      prospects: [SAMPLE_PROSPECT],
      reports: [],
      notes: [],
      gameLogs: [],
      videos: [],
      draftBoard: INITIAL_DRAFT_BOARD,
    };

    try {
      await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetPayload),
      });
      await refreshAllData();
    } catch {
      setProspects([SAMPLE_PROSPECT]);
      setReports([]);
      setNotes([]);
      setGameLogs([]);
      setVideos([]);
      setDraftBoard(INITIAL_DRAFT_BOARD);
      setSelectedProspectId(SAMPLE_PROSPECT.id);
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
        isSyncing,
        refreshAllData,
        addProspect,
        updateProspect,
        deleteProspect,
        addReport,
        addNote,
        updateNote,
        deleteNote,
        addGameLog,
        addVideoClip,
        updateDraftBoardRank,
        removeDraftBoardEntry,
        comparisonProspectIds,
        toggleComparisonProspect,
        clearComparison,
        exportJSONBackup,
        importJSONBackup,
        resetToSampleData,
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
