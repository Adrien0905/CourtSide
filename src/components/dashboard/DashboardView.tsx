import React from 'react';
import {
  Users,
  FileSpreadsheet,
  Trophy,
  CalendarDays,
  Clock,
  ArrowRight,
  PlusCircle,
  AlertCircle,
  Star,
  Film
} from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';

interface DashboardViewProps {
  onOpenNewProspectModal: () => void;
  onOpenNewReportModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewProspectModal,
  onOpenNewReportModal,
}) => {
  const {
    prospects,
    reports,
    gameLogs,
    draftBoard,
    videos,
    setSelectedProspectId,
    setActiveView,
  } = useScouting();

  const unevaluatedCount = prospects.filter(
    (p) => !p.latestReport || p.status === 'Watchlist' || p.status === 'To Observe'
  ).length;

  const watchlistProspects = prospects.filter((p) => p.status === 'Watchlist');
  const draftBoardProspects = draftBoard
    .slice(0, 5)
    .map((entry) => ({
      entry,
      prospect: prospects.find((p) => p.id === entry.prospectId),
    }))
    .filter((item) => item.prospect !== undefined);

  const handleOpenProspect = (id: string) => {
    setSelectedProspectId(id);
    setActiveView('dossier');
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Scout Command Center</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              Class of 2027
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personal talent intelligence database for tracking, grading, and ranking prospects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewProspectModal}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Prospect</span>
          </button>
          <button
            onClick={onOpenNewReportModal}
            className="px-3 py-1.5 bg-[#172238] hover:bg-[#1E2D4A] text-slate-200 border border-[#27385A] text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-[#111827] border border-[#1F293D] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Total Prospects</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {prospects.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Tracked in database
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1F293D] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Scouting Reports</span>
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {reports.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            In-depth evaluations
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1F293D] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Games Scouted</span>
            <CalendarDays className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {gameLogs.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Film logs & observations
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1F293D] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Draft Board</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {draftBoard.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Prospects on personal board
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1F293D] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Pending Eval</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {unevaluatedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Awaiting full scout report
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): Active Roster & Recent Evaluations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Prospects List */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1F293D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Recent Prospects Database
                </h2>
              </div>
              <button
                onClick={() => setActiveView('database')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>View All ({prospects.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#1B2436]">
              {prospects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleOpenProspect(p.id)}
                  className="px-5 py-3 hover:bg-[#151E31] transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-md bg-[#182238] border border-[#243352] flex items-center justify-center text-xs font-bold font-mono text-amber-400 group-hover:border-amber-500/50 transition-colors">
                      {p.primaryPosition}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                        <span>{p.firstName} {p.lastName}</span>
                        {p.latestReport && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            Grade: {p.latestReport.overallGrade.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{p.currentTeam}</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.measurements.heightFormatted}</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.currentLeague}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] font-mono text-slate-300">
                        Class of {p.draftYear}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.reportsCount} report{p.reportsCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#182338] text-slate-300 border border-[#243350]">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Scouting Reports */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1F293D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Latest In-Depth Scouting Reports
                </h2>
              </div>
              <button
                onClick={() => setActiveView('reports')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>All Reports ({reports.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#1B2436]">
              {reports.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <p className="font-medium text-slate-300">No scouting reports authored yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select a prospect and click &ldquo;Create Report&rdquo; to begin subjective evaluation.
                  </p>
                </div>
              ) : (
                reports.slice(0, 3).map((r) => {
                  const prospect = prospects.find((p) => p.id === r.prospectId);
                  return (
                    <div
                      key={r.id}
                      onClick={() => prospect && handleOpenProspect(prospect.id)}
                      className="p-5 hover:bg-[#151E31] transition-colors cursor-pointer group space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            {prospect ? `${prospect.firstName} ${prospect.lastName}` : 'Prospect Report'}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {r.overallGrade.toFixed(1)} / 10
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {r.reportDate}
                        </span>
                      </div>

                      <div className="text-xs text-amber-300 font-medium">
                        {r.nbaArchetype}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {r.executiveSummary}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>Ceiling: {r.ceiling}</span>
                        <span aria-hidden="true">·</span>
                        <span>Comps: {r.playerComparisons.join(', ')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Draft Board Preview & Watchlist */}
        <div className="space-y-6">
          {/* Top of Draft Board */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#1F293D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Draft Board Top 5
                </h2>
              </div>
              <button
                onClick={() => setActiveView('draftboard')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Full Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#1B2436]">
              {draftBoardProspects.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No prospects ranked yet. Add prospects to your Draft Board.
                </div>
              ) : (
                draftBoardProspects.map(({ entry, prospect }) => {
                  if (!prospect) return null;
                  return (
                    <div
                      key={entry.prospectId}
                      onClick={() => handleOpenProspect(prospect.id)}
                      className="px-4 py-3 hover:bg-[#151E31] transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
                          #{entry.rank}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                            {prospect.firstName} {prospect.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {prospect.primaryPosition} · {prospect.currentTeam}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                          Tier {entry.tier}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Watchlist & Quick Actions */}
          <div className="bg-[#111827] border border-[#1F293D] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Priority Watchlist</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {watchlistProspects.length} players
              </span>
            </div>

            {watchlistProspects.length === 0 ? (
              <p className="text-xs text-slate-400">
                No prospects marked as Watchlist yet. Assign the "Watchlist" status to prospects you want to monitor closely.
              </p>
            ) : (
              <div className="space-y-2">
                {watchlistProspects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleOpenProspect(p.id)}
                    className="p-2.5 rounded bg-[#151D2F] hover:bg-[#1A253C] border border-[#22314E] cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-slate-200">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-[11px] font-mono text-amber-400">
                      {p.primaryPosition}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-[#1E293B] flex flex-col gap-2">
              <button
                onClick={() => setActiveView('comparison')}
                className="w-full py-2 px-3 bg-[#151F33] hover:bg-[#1D2A45] border border-[#243557] rounded-md text-xs font-medium text-slate-200 text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Prospect Comparison Matrix</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
