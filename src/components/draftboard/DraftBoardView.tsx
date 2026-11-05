import React, { useState } from 'react';
import {
  Trophy,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';

export const DraftBoardView: React.FC = () => {
  const {
    draftBoard,
    prospects,
    updateDraftBoardRank,
    removeDraftBoardEntry,
    setSelectedProspectId,
    setActiveView,
  } = useScouting();

  const [activeBoardFilter, setActiveBoardFilter] = useState<'TOP10' | 'TOP30' | 'TOP60' | 'ALL'>('ALL');
  const [editingJustificationId, setEditingJustificationId] = useState<string | null>(null);
  const [justificationText, setJustificationText] = useState('');
  const [addProspectSelectId, setAddProspectSelectId] = useState('');

  // Group by Tiers
  const unrankedProspects = prospects.filter(
    (p) => !draftBoard.some((b) => b.prospectId === p.id)
  );

  const filteredBoard = draftBoard
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .filter((entry) => {
      if (activeBoardFilter === 'TOP10') return entry.rank <= 10;
      if (activeBoardFilter === 'TOP30') return entry.rank <= 30;
      if (activeBoardFilter === 'TOP60') return entry.rank <= 60;
      return true;
    });

  const handleMoveUp = (prospectId: string, currentRank: number, currentTier: number) => {
    if (currentRank <= 1) return;
    updateDraftBoardRank(prospectId, currentRank - 1, currentTier);
  };

  const handleMoveDown = (prospectId: string, currentRank: number, currentTier: number) => {
    if (currentRank >= draftBoard.length) return;
    updateDraftBoardRank(prospectId, currentRank + 1, currentTier);
  };

  const handleTierChange = (prospectId: string, currentRank: number, newTier: number) => {
    updateDraftBoardRank(prospectId, currentRank, newTier);
  };

  const handleSaveJustification = (prospectId: string, rank: number, tier: number) => {
    updateDraftBoardRank(prospectId, rank, tier, justificationText);
    setEditingJustificationId(null);
    setJustificationText('');
  };

  const handleAddProspectToBoard = () => {
    if (!addProspectSelectId) return;
    const nextRank = draftBoard.length + 1;
    updateDraftBoardRank(addProspectSelectId, nextRank, 3, 'Added to draft board.');
    setAddProspectSelectId('');
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Board Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>My Personal Draft Board</span>
            <span className="text-xs font-mono font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              Class of 2027
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Custom tiered big board with positional rankings, draft tiers, and scout rationale.
          </p>
        </div>

        {/* Board View Mode Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#111827] border border-[#1E293B] rounded-lg">
          {(['TOP10', 'TOP30', 'TOP60', 'ALL'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveBoardFilter(filter)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeBoardFilter === filter
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'ALL' ? 'Full Board' : `Top ${filter.replace('TOP', '')}`}
            </button>
          ))}
        </div>
      </div>

      {/* Add Prospect Quick Bar */}
      {unrankedProspects.length > 0 && (
        <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add untracked prospect to Draft Board:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={addProspectSelectId}
              onChange={(e) => setAddProspectSelectId(e.target.value)}
              className="bg-[#141C2E] border border-[#23314D] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Select prospect...</option>
              {unrankedProspects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.primaryPosition} - {p.currentTeam})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddProspectToBoard}
              disabled={!addProspectSelectId}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-semibold rounded text-xs transition-colors shrink-0"
            >
              Add to Board
            </button>
          </div>
        </div>
      )}

      {/* Draft Board Table */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0E1422] border-b border-[#1E293B] text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-3 w-16 text-center">Reorder</th>
                <th className="py-3 px-4">Prospect</th>
                <th className="py-3 px-3 text-center">Pos</th>
                <th className="py-3 px-3 text-center">Tier</th>
                <th className="py-3 px-4">Team & League</th>
                <th className="py-3 px-3 text-center">Scout Grade</th>
                <th className="py-3 px-4">NBA Projection</th>
                <th className="py-3 px-6">Scout Justification / Rationale</th>
                <th className="py-3 px-3 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182338]">
              {filteredBoard.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No prospects in current view</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Add prospects to your board using the selector above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBoard.map((entry) => {
                  const prospect = prospects.find((p) => p.id === entry.prospectId);
                  if (!prospect) return null;

                  const isEditingThisJustification = editingJustificationId === entry.prospectId;

                  return (
                    <tr
                      key={entry.prospectId}
                      className="hover:bg-[#141D30] transition-colors group"
                    >
                      {/* Rank with delta */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono font-extrabold text-sm text-amber-400 tabular-nums">
                            #{entry.rank}
                          </span>
                          {entry.previousRank && entry.previousRank !== entry.rank && (
                            <span
                              className={`text-[9px] font-mono font-semibold ${
                                entry.rank < entry.previousRank
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {entry.rank < entry.previousRank ? `+${entry.previousRank - entry.rank}` : `-${entry.rank - entry.previousRank}`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reorder Buttons */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleMoveUp(entry.prospectId, entry.rank, entry.tier)}
                            disabled={entry.rank === 1}
                            className="p-1 rounded hover:bg-[#1E293B] text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move up in rank"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(entry.prospectId, entry.rank, entry.tier)}
                            disabled={entry.rank === draftBoard.length}
                            className="p-1 rounded hover:bg-[#1E293B] text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move down in rank"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Prospect Name & Click to Dossier */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setSelectedProspectId(prospect.id);
                            setActiveView('dossier');
                          }}
                          className="text-left font-bold text-white hover:text-amber-400 transition-colors block"
                        >
                          {prospect.firstName} {prospect.lastName}
                        </button>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {prospect.measurements.heightFormatted} · {prospect.measurements.weightLbs} lbs
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          {prospect.primaryPosition}
                        </span>
                      </td>

                      {/* Tier Selector */}
                      <td className="py-3 px-3 text-center">
                        <select
                          value={entry.tier}
                          onChange={(e) =>
                            handleTierChange(entry.prospectId, entry.rank, Number(e.target.value))
                          }
                          className="bg-[#141C2E] border border-[#23314D] rounded px-2 py-1 text-xs font-mono font-bold text-sky-300 focus:outline-none cursor-pointer"
                        >
                          <option value={1}>Tier 1 (Franchise Anchor)</option>
                          <option value={2}>Tier 2 (High-End All-Star)</option>
                          <option value={3}>Tier 3 (Core Starter)</option>
                          <option value={4}>Tier 4 (Rotation Lock)</option>
                          <option value={5}>Tier 5 (Upside Project)</option>
                          <option value={6}>Tier 6 (Two-Way / Stash)</option>
                        </select>
                      </td>

                      {/* Team & League */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{prospect.currentTeam}</div>
                        <div className="text-[10px] text-slate-400">{prospect.currentLeague}</div>
                      </td>

                      {/* Overall Grade */}
                      <td className="py-3 px-3 text-center font-mono">
                        {prospect.latestReport ? (
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {prospect.latestReport.overallGrade.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Unrated</span>
                        )}
                      </td>

                      {/* NBA Projection */}
                      <td className="py-3 px-4 text-xs">
                        <span className="text-amber-300 font-medium block">
                          {prospect.latestReport?.nbaArchetype || 'Awaiting Evaluation'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {prospect.latestReport?.ceiling ? `Ceiling: ${prospect.latestReport.ceiling}` : ''}
                        </span>
                      </td>

                      {/* Justification Column */}
                      <td className="py-3 px-6 max-w-md">
                        {isEditingThisJustification ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={justificationText}
                              onChange={(e) => setJustificationText(e.target.value)}
                              placeholder="Add scouting justification for this rank..."
                              className="w-full bg-[#182338] border border-amber-500 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveJustification(entry.prospectId, entry.rank, entry.tier)}
                              className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingJustificationId(entry.prospectId);
                              setJustificationText(entry.justification || '');
                            }}
                            className="cursor-pointer group-hover:text-slate-200 text-slate-400 text-xs italic hover:underline flex items-center justify-between"
                            title="Click to edit justification"
                          >
                            <span className="line-clamp-2">
                              {entry.justification || 'Click to write ranking rationale...'}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-600 group-hover:text-amber-400 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>

                      {/* Remove Button */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => removeDraftBoardEntry(entry.prospectId)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-[#1E293B] transition-colors"
                          title="Remove from Draft Board"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
