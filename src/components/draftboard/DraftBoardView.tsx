import React, { useState } from 'react';
import { Trophy, ArrowUp, ArrowDown, Plus, Trash2, GripVertical } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { DraftBoardEntry } from '../../types/scouting';

const TIERS = [1, 2, 3, 4, 5, 6];

export const DraftBoardView: React.FC = () => {
  const {
    draftBoard,
    prospects,
    replaceDraftBoard,
    removeDraftBoardEntry,
    setSelectedProspectId,
    setActiveView,
  } = useScouting();

  const [activeBoardFilter, setActiveBoardFilter] = useState<'TOP10' | 'TOP30' | 'TOP60' | 'ALL'>('ALL');
  const [addProspectSelectId, setAddProspectSelectId] = useState('');
  const [addTier, setAddTier] = useState(3);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingJustificationId, setEditingJustificationId] = useState<string | null>(null);
  const [justificationText, setJustificationText] = useState('');

  const ordered = [...draftBoard].sort((a, b) => a.rank - b.rank);
  const unrankedProspects = prospects.filter(
    (prospect) => !draftBoard.some((entry) => entry.prospectId === prospect.id)
  );

  const visible = (entry: DraftBoardEntry) => {
    if (activeBoardFilter === 'TOP10') return entry.rank <= 10;
    if (activeBoardFilter === 'TOP30') return entry.rank <= 30;
    if (activeBoardFilter === 'TOP60') return entry.rank <= 60;
    return true;
  };

  const commit = (entries: DraftBoardEntry[]) => {
    replaceDraftBoard(
      entries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        consensusRank: undefined,
        consensusSource: undefined,
      }))
    );
  };

  const moveToIndex = (prospectId: string, index: number, tier: number) => {
    const current = ordered.find((entry) => entry.prospectId === prospectId);
    if (!current) return;
    const without = ordered.filter((entry) => entry.prospectId !== prospectId);
    const clamped = Math.max(0, Math.min(index, without.length));
    without.splice(clamped, 0, {
      ...current,
      tier,
      previousRank: current.rank,
      justification: current.justification || '',
      updatedAt: new Date().toISOString(),
    });
    commit(without);
  };

  const shift = (prospectId: string, direction: -1 | 1, tier: number) => {
    const tierEntries = ordered.filter((entry) => entry.tier === tier);
    const localIndex = tierEntries.findIndex((entry) => entry.prospectId === prospectId);
    const neighbor = tierEntries[localIndex + direction];
    if (!neighbor) return;
    const without = ordered.filter((entry) => entry.prospectId !== prospectId);
    const neighborIndex = without.findIndex((entry) => entry.prospectId === neighbor.prospectId);
    const insertAt = direction < 0 ? neighborIndex : neighborIndex + 1;
    moveToIndex(prospectId, insertAt, tier);
  };

  const dropOnTier = (tier: number) => {
    if (!dragId) return;
    const without = ordered.filter((entry) => entry.prospectId !== dragId);
    const sameTier = without.filter((entry) => entry.tier === tier);
    let index = without.length;
    if (sameTier.length > 0) {
      const lastId = sameTier[sameTier.length - 1].prospectId;
      index = without.findIndex((entry) => entry.prospectId === lastId) + 1;
    } else {
      const firstHigher = without.findIndex((entry) => entry.tier > tier);
      index = firstHigher < 0 ? without.length : firstHigher;
    }
    moveToIndex(dragId, index, tier);
    setDragId(null);
  };

  const dropOnCard = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const target = ordered.find((entry) => entry.prospectId === targetId);
    if (!target) return;
    const without = ordered.filter((entry) => entry.prospectId !== dragId);
    const index = without.findIndex((entry) => entry.prospectId === targetId);
    moveToIndex(dragId, index, target.tier);
    setDragId(null);
  };

  return (
    <div className="min-h-full w-full px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>My Personal Draft Board</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Personal tiers only. Rankings are written by you and saved in SQLite.
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-[#111827] border border-[#1E293B] rounded-lg">
          {(['TOP10', 'TOP30', 'TOP60', 'ALL'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveBoardFilter(filter)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                activeBoardFilter === filter
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'ALL' ? 'Full Board' : `Top ${filter.replace('TOP', '')}`}
            </button>
          ))}
        </div>
      </div>

      {unrankedProspects.length > 0 && (
        <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-3.5 flex flex-col sm:flex-row items-center gap-3 text-sm">
          <Plus className="w-4 h-4 text-amber-400" />
          <select
            value={addProspectSelectId}
            onChange={(e) => setAddProspectSelectId(e.target.value)}
            className="bg-[#141C2E] border border-[#23314D] rounded px-3 py-1.5 text-sm text-white"
          >
            <option value="">Select prospect...</option>
            {unrankedProspects.map((prospect) => (
              <option key={prospect.id} value={prospect.id}>
                {prospect.firstName} {prospect.lastName} ({prospect.primaryPosition})
              </option>
            ))}
          </select>
          <select
            value={addTier}
            onChange={(e) => setAddTier(Number(e.target.value))}
            className="bg-[#141C2E] border border-[#23314D] rounded px-3 py-1.5 text-sm text-sky-300"
          >
            {TIERS.map((tier) => (
              <option key={tier} value={tier}>Tier {tier}</option>
            ))}
          </select>
          <button
            disabled={!addProspectSelectId}
            onClick={() => {
              commit([
                ...ordered,
                {
                  prospectId: addProspectSelectId,
                  rank: ordered.length + 1,
                  tier: addTier,
                  justification: '',
                  updatedAt: new Date().toISOString(),
                },
              ]);
              setAddProspectSelectId('');
            }}
            className="px-3 py-1.5 bg-amber-500 disabled:opacity-40 text-slate-950 font-semibold rounded"
          >
            Add to Board
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {TIERS.map((tier) => {
          const entries = ordered.filter((entry) => entry.tier === tier && visible(entry));
          return (
            <section
              key={tier}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOnTier(tier)}
              className="bg-[#111827] border border-[#1E293B] rounded-lg min-h-40"
            >
              <header className="px-4 py-3 border-b border-[#1E293B] text-base font-bold uppercase tracking-wider text-sky-300">
                Tier {tier}
                <span className="ml-2 text-slate-500 font-mono">{entries.length}</span>
              </header>
              <div className="p-3 space-y-2">
                {entries.length === 0 && (
                  <p className="text-sm text-slate-500 px-1 py-4">Drop a prospect here.</p>
                )}
                {entries.map((entry) => {
                  const prospect = prospects.find((item) => item.id === entry.prospectId);
                  if (!prospect) return null;
                  return (
                    <article
                      key={entry.prospectId}
                      draggable
                      onDragStart={() => setDragId(entry.prospectId)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.stopPropagation();
                        dropOnCard(entry.prospectId);
                      }}
                      className="bg-[#141C2E] border border-[#23314D] rounded-md p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedProspectId(prospect.id);
                            setActiveView('dossier');
                          }}
                          className="text-left"
                        >
                          <div className="text-sm font-bold text-white">
                            <span className="font-mono text-amber-400 mr-2">#{entry.rank}</span>
                            {prospect.firstName} {prospect.lastName}
                          </div>
                          <div className="text-sm text-slate-400">
                            {prospect.primaryPosition} · {prospect.currentTeam}
                            {entry.previousRank && entry.previousRank !== entry.rank
                              ? ` · ${entry.rank < entry.previousRank ? '+' : '-'}${Math.abs(entry.previousRank - entry.rank)}`
                              : ''}
                          </div>
                        </button>
                        <GripVertical className="w-4 h-4 text-slate-500 shrink-0" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => shift(entry.prospectId, -1, entry.tier)}
                          className="p-1 rounded hover:bg-[#1E293B] text-slate-400"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => shift(entry.prospectId, 1, entry.tier)}
                          className="p-1 rounded hover:bg-[#1E293B] text-slate-400"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeDraftBoardEntry(entry.prospectId)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 ml-auto"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {editingJustificationId === entry.prospectId ? (
                        <div className="flex gap-2">
                          <input
                            value={justificationText}
                            onChange={(event) => setJustificationText(event.target.value)}
                            className="flex-1 bg-[#182338] border border-amber-500 rounded px-2 py-1 text-sm text-white"
                          />
                          <button
                            onClick={() => {
                              commit(
                                ordered.map((item) =>
                                  item.prospectId === entry.prospectId
                                    ? { ...item, justification: justificationText }
                                    : item
                                )
                              );
                              setEditingJustificationId(null);
                            }}
                            className="px-2 py-1 bg-amber-500 text-slate-950 rounded text-sm font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingJustificationId(entry.prospectId);
                            setJustificationText(entry.justification || '');
                          }}
                          className="text-left text-sm italic text-slate-400 hover:text-slate-200"
                        >
                          {entry.justification || 'Add a personal justification...'}
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
