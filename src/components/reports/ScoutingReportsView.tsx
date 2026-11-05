import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Search, Star, ExternalLink, Filter } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { confidenceLabel } from '../../types/scouting';

interface ScoutingReportsViewProps {
  onOpenNewReportModal: () => void;
}

export const ScoutingReportsView: React.FC<ScoutingReportsViewProps> = ({
  onOpenNewReportModal,
}) => {
  const { reports, prospects, setSelectedProspectId, setActiveView } = useScouting();
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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Scouting Reports</span>
            <span className="text-xs font-mono font-medium text-slate-400">
              ({filteredReports.length} reports filed)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured 10-point scouting evaluations with archetypes and projection models.
          </p>
        </div>

        <button
          onClick={onOpenNewReportModal}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-sm shrink-0 self-start sm:self-auto"
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
          className="w-full bg-[#111827] border border-[#1E293B] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#111827] border border-[#1E293B] rounded-lg">
          <p className="text-sm font-medium">No scouting reports found</p>
          <p className="text-xs text-slate-400 mt-1">
            Create your first report using the button above to begin grading prospects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#182338] text-slate-300">
                          {prospect.primaryPosition} · {prospect.currentTeam}
                        </span>
                      )}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
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

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {report.overallGrade.toFixed(1)} / 10
                    </span>
                  </div>
                </div>

                {/* Archetype banner */}
                <div className="p-2.5 rounded bg-[#141C2E] border border-[#1F2C45] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Archetype
                    </span>
                    <span className="font-semibold text-amber-300">
                      {report.nbaArchetype}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Confidence
                    </span>
                    <span className="font-mono text-slate-300">
                      {confidenceLabel(report.confidence)}
                    </span>
                  </div>
                </div>

                {/* Categories scores pill row */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
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
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {report.executiveSummary}
                </p>

                {/* Comps & Floor/Ceiling */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1C263B] text-[11px] text-slate-400">
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
