import React, { useState } from 'react';
import { Edit, FileSpreadsheet, Plus, Search, Star, ExternalLink, Filter, Trash2 } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { ScoutingReport, confidenceLabel } from '../../types/scouting';

interface ScoutingReportsViewProps {
  onOpenNewReportModal: () => void;
  onEditReport: (report: ScoutingReport) => void;
}

export const ScoutingReportsView: React.FC<ScoutingReportsViewProps> = ({
  onOpenNewReportModal,
  onEditReport,
}) => {
  const { reports, prospects, setSelectedProspectId, setActiveView, deleteReport } = useScouting();
  const [search, setSearch] = useState('');

  const filteredReports = reports.filter((r) => {
    const p = prospects.find((item) => item.id === r.prospectId);
    const query = search.toLowerCase();
    const playerName = p ? `${p.firstName} ${p.lastName}`.toLowerCase() : '';
    const archetype = r.nbaArchetype.toLowerCase();
    const summary = r.executiveSummary.toLowerCase();
    return playerName.includes(query) || archetype.includes(query) || summary.includes(query);
  });

  const handleOpenProspect = (id: string) => {
    setSelectedProspectId(id);
    setActiveView('dossier');
  };

  return (
    <div className="min-h-full w-full px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Scouting Reports</span>
            <span className="text-sm font-mono font-medium text-slate-400">
              ({filteredReports.length} reports filed)
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Structured 10-point scouting evaluations with archetypes and projection models.
          </p>
        </div>

        <button
          onClick={onOpenNewReportModal}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-md transition-colors flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Scouting Report</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by prospect name, archetype, notes..."
          className="w-full bg-[#111827] border border-[#1E293B] rounded-md pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#111827] border border-[#1E293B] rounded-lg">
          <p className="text-sm font-medium">No scouting reports found</p>
          <p className="text-sm text-slate-400 mt-1">
            Create your first report using the button above to begin grading prospects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const prospect = prospects.find((p) => p.id === report.prospectId);
            return (
              <div
                key={report.id}
                onClick={() => prospect && handleOpenProspect(prospect.id)}
                className="bg-[#111827] border border-[#1E293B] hover:border-amber-500/40 rounded-lg p-5 transition-all cursor-pointer group space-y-4 shadow-lg"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                      <span>{prospect ? `${prospect.firstName} ${prospect.lastName}` : 'Prospect'}</span>
                      {prospect && (
                        <span className="text-sm font-mono px-1.5 py-0.2 rounded bg-[#182338] text-slate-300">
                          {prospect.primaryPosition} · {prospect.currentTeam}
                        </span>
                      )}
                    </h3>
                    <div className="text-sm text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span>{report.gameOrEvent}</span>
                      {report.reportType && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                          {report.reportType}
                        </span>
                      )}
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>{report.reportDate}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {Number(report.overallGrade || 0).toFixed(1)} / 10
                    </span>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditReport(report);
                        }}
                        className="px-2 py-1 rounded bg-[#1A263D] hover:bg-[#223250] text-sm font-semibold text-slate-200 border border-[#283C5E] inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const confirmed = window.confirm('Delete this scouting report? This cannot be undone.');
                          if (!confirmed) return;
                          deleteReport(report.id).catch((err) => {
                            console.error('[COURTSIDE] Failed to delete scouting report from list', err);
                          });
                        }}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-sm font-semibold text-rose-300 border border-rose-500/30 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Archetype banner */}
                <div className="p-2.5 rounded bg-[#141C2E] border border-[#1F2C45] flex items-center justify-between text-sm">
                  <div>
                    <span className="text-sm uppercase font-bold text-slate-400 block">
                      Archetype
                    </span>
                    <span className="font-semibold text-amber-300">
                      {report.nbaArchetype}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm uppercase font-bold text-slate-400 block">
                      Confidence
                    </span>
                    <span className="font-mono text-slate-300">
                      {confidenceLabel(report.confidence)}
                    </span>
                  </div>
                </div>

                {/* Categories scores pill row */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-sm font-mono">
                  <div className="p-1 rounded bg-[#162035] border border-[#22314E]">
                    <div className="text-slate-400">PHYS</div>
                    <div className="font-bold text-white mt-0.5">
                      {report.categoryGrades.physical > 0 ? report.categoryGrades.physical.toFixed(1) : '—'}
                    </div>
                  </div>
                  <div className="p-1 rounded bg-[#162035] border border-[#22314E]">
                    <div className="text-slate-400">OFF</div>
                    <div className="font-bold text-white mt-0.5">
                      {report.categoryGrades.offensive > 0 ? report.categoryGrades.offensive.toFixed(1) : '—'}
                    </div>
                  </div>
                  <div className="p-1 rounded bg-[#162035] border border-[#22314E]">
                    <div className="text-slate-400">DEF</div>
                    <div className="font-bold text-white mt-0.5">
                      {report.categoryGrades.defensive > 0 ? report.categoryGrades.defensive.toFixed(1) : '—'}
                    </div>
                  </div>
                  <div className="p-1 rounded bg-[#162035] border border-[#22314E]">
                    <div className="text-slate-400">IQ</div>
                    <div className="font-bold text-white mt-0.5">
                      {report.categoryGrades.basketballIq > 0 ? report.categoryGrades.basketballIq.toFixed(1) : '—'}
                    </div>
                  </div>
                  <div className="p-1 rounded bg-[#162035] border border-[#22314E]">
                    <div className="text-slate-400">MENT</div>
                    <div className="font-bold text-white mt-0.5">
                      {report.categoryGrades.mentality > 0 ? report.categoryGrades.mentality.toFixed(1) : '—'}
                    </div>
                  </div>
                </div>

                {/* Summary excerpt */}
                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {report.executiveSummary}
                </p>

                {/* Comps & Floor/Ceiling */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1C263B] text-sm text-slate-400">
                  <span>Ceiling: <strong className="text-slate-200">{report.ceiling}</strong></span>
                  <span>Comps: <strong className="text-slate-200">{report.playerComparisons.slice(0, 2).join(', ')}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
