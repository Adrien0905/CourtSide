import React, { createContext, useContext, useState, useEffect } from 'react';
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
  SAMPLE_REPORT,
  SAMPLE_NOTE,
  SAMPLE_GAME_LOG,
  SAMPLE_VIDEO,
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

  // Actions
  addProspect: (newProspect: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt' | 'reportsCount' | 'notesCount' | 'gamesObservedCount' | 'videoCount' | 'stats'>) => string;
  updateProspect: (id: string, updates: Partial<Prospect>) => void;
  deleteProspect: (id: string) => void;
  addReport: (report: Omit<ScoutingReport, 'id'>) => void;
  addNote: (note: Omit<FreeformNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<FreeformNote>) => void;
  deleteNote: (id: string) => void;
  addGameLog: (log: Omit<GameLogItem, 'id'>) => void;
  addVideoClip: (video: Omit<VideoClip, 'id' | 'createdAt'>) => void;
  updateDraftBoardRank: (prospectId: string, targetRank: number, targetTier: number, justification?: string) => void;
  removeDraftBoardEntry: (prospectId: string) => void;

  // Comparison
  comparisonProspectIds: string[];
  toggleComparisonProspect: (id: string) => void;
  clearComparison: () => void;

  // Data management
  exportJSONBackup: () => void;
  importJSONBackup: (jsonData: string) => boolean;
  resetToSampleData: () => void;
}

const ScoutingContext = createContext<ScoutingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROSPECTS: 'courtside_prospects_v1',
  REPORTS: 'courtside_reports_v1',
  NOTES: 'courtside_notes_v1',
  GAME_LOGS: 'courtside_game_logs_v1',
  VIDEOS: 'courtside_videos_v1',
  DRAFT_BOARD: 'courtside_draft_board_v1',
};

export const ScoutingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>('prospect-sample-cameron-boozer');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [comparisonProspectIds, setComparisonProspectIds] = useState<string[]>(['prospect-sample-cameron-boozer']);

  // Load state with fallback to template benchmark
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
      return saved ? JSON.parse(saved) : [SAMPLE_REPORT];
    } catch {
      return [SAMPLE_REPORT];
    }
  });

  const [notes, setNotes] = useState<FreeformNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : [SAMPLE_NOTE];
    } catch {
      return [SAMPLE_NOTE];
    }
  });

  const [gameLogs, setGameLogs] = useState<GameLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_LOGS);
      return saved ? JSON.parse(saved) : [SAMPLE_GAME_LOG];
    } catch {
      return [SAMPLE_GAME_LOG];
    }
  });

  const [videos, setVideos] = useState<VideoClip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return saved ? JSON.parse(saved) : [SAMPLE_VIDEO];
    } catch {
      return [SAMPLE_VIDEO];
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

  // Local storage auto-sync
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

  // Add Prospect
  const addProspect = (newProspectData: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt' | 'reportsCount' | 'notesCount' | 'gamesObservedCount' | 'videoCount' | 'stats'>) => {
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

    setProspects((prev) => [created, ...prev]);

    // If prospect status is Draft Board, automatically add to board
    if (created.status === 'Draft Board') {
      const nextRank = draftBoard.length + 1;
      setDraftBoard((prev) => [
        ...prev,
        {
          prospectId: id,
          rank: nextRank,
          tier: 3,
          justification: 'Added from prospect registration.',
          updatedAt: now,
        },
      ]);
    }

    setSelectedProspectId(id);
    return id;
  };

  // Update Prospect
  const updateProspect = (id: string, updates: Partial<Prospect>) => {
    const now = new Date().toISOString();
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    );
  };

  // Delete Prospect
  const deleteProspect = (id: string) => {
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
  };

  // Add Scouting Report
  const addReport = (reportData: Omit<ScoutingReport, 'id'>) => {
    const id = `rep-${Date.now()}`;
    const newReport: ScoutingReport = { ...reportData, id };

    setReports((prev) => [newReport, ...prev]);

    // Update prospect latest report and count
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
  };

  // Notes
  const addNote = (noteData: Omit<FreeformNote, 'id' | 'createdAt' | 'updatedAt'>) => {
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
  };

  const updateNote = (id: string, updates: Partial<FreeformNote>) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n))
    );
  };

  const deleteNote = (id: string) => {
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
  };

  // Game Logs
  const addGameLog = (logData: Omit<GameLogItem, 'id'>) => {
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
  };

  // Videos
  const addVideoClip = (videoData: Omit<VideoClip, 'id' | 'createdAt'>) => {
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
  };

  // Draft Board Reordering
  const updateDraftBoardRank = (
    prospectId: string,
    targetRank: number,
    targetTier: number,
    justification?: string
  ) => {
    const now = new Date().toISOString();
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

      // Insert at targetRank - 1
      const clampedIndex = Math.max(0, Math.min(targetRank - 1, filtered.length));
      filtered.splice(clampedIndex, 0, entry);

      // Re-index all ranks sequentially
      return filtered.map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
    });
  };

  const removeDraftBoardEntry = (prospectId: string) => {
    setDraftBoard((prev) => {
      const filtered = prev.filter((e) => e.prospectId !== prospectId);
      return filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));
    });
  };

  // Comparison
  const toggleComparisonProspect = (id: string) => {
    setComparisonProspectIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pId) => pId !== id);
      }
      if (prev.length >= 4) {
        // Max 4 prospects compared
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const clearComparison = () => {
    setComparisonProspectIds([]);
  };

  // JSON Backup Export
  const exportJSONBackup = () => {
    const backupData = {
      version: '1.0',
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

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courtside_scouting_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // JSON Backup Import
  const importJSONBackup = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data.prospects)) {
        setProspects(data.prospects);
        if (Array.isArray(data.reports)) setReports(data.reports);
        if (Array.isArray(data.notes)) setNotes(data.notes);
        if (Array.isArray(data.gameLogs)) setGameLogs(data.gameLogs);
        if (Array.isArray(data.videos)) setVideos(data.videos);
        if (Array.isArray(data.draftBoard)) setDraftBoard(data.draftBoard);

        if (data.prospects.length > 0) {
          setSelectedProspectId(data.prospects[0].id);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import backup JSON', e);
      return false;
    }
  };

  // Reset to Sample Template
  const resetToSampleData = () => {
    setProspects([SAMPLE_PROSPECT]);
    setReports([SAMPLE_REPORT]);
    setNotes([SAMPLE_NOTE]);
    setGameLogs([SAMPLE_GAME_LOG]);
    setVideos([SAMPLE_VIDEO]);
    setDraftBoard(INITIAL_DRAFT_BOARD);
    setSelectedProspectId(SAMPLE_PROSPECT.id);
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
