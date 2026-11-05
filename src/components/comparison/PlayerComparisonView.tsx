import React from 'react';
import { GitCompare, X, Plus, Trophy, Ruler, BarChart2 } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { RadarChart } from '../common/RadarChart';

export const PlayerComparisonView: React.FC = () => {
  const {
    comparisonProspectIds,
    toggleComparisonProspect,
    clearComparison,
    prospects,
    draftBoard,
    setSelectedProspectId,
    setActiveView,
  } = useScouting();

  const selectedProspects = comparisonProspectIds
    .map((id) => prospects.find((p) => p.id === id))
    .filter(Boolean) as typeof prospects;

  const availableProspectsToAdd = prospects.filter(
    (p) => !comparisonProspectIds.includes(p.id)
  );

  const p1 = selectedProspects[0];
  const p2 = selectedProspects[1];

  const p1Radar = p1?.latestReport
    ? [
        { axis: 'Physical', value: p1.latestReport.categoryGrades.physical },
        { axis: 'Offense', value: p1.latestReport.categoryGrades.offensive },
        { axis: 'Defense', value: p1.latestReport.categoryGrades.defensive },
        { axis: 'B-Ball IQ', value: p1.latestReport.categoryGrades.basketballIq },
        { axis: 'Mentality', value: p1.latestReport.categoryGrades.mentality },
      ]
    : [
        { axis: 'Physical', value: 5 },
        { axis: 'Offense', value: 5 },
        { axis: 'Defense', value: 5 },
        { axis: 'B-Ball IQ', value: 5 },
        { axis: 'Mentality', value: 5 },
      ];

  const p2Radar = p2?.latestReport
    ? [
        { axis: 'Physical', value: p2.latestReport.categoryGrades.physical },
        { axis: 'Offense', value: p2.latestReport.categoryGrades.offensive },
        { axis: 'Defense', value: p2.latestReport.categoryGrades.defensive },
        { axis: 'B-Ball IQ', value: p2.latestReport.categoryGrades.basketballIq },
        { axis: 'Mentality', value: p2.latestReport.categoryGrades.mentality },
      ]
    : undefined;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <GitCompare className="w-5 h-5 text-sky-400" />
            <span>Prospect Comparison Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side comparative analysis of physicals, production, advanced metrics, and scouting grades.
          </p>
        </div>

        {selectedProspects.length > 0 && (
          <button
            onClick={clearComparison}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Matrix</span>
          </button>
        )}
      </div>

      {/* Selector pills */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-3.5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 mr-2">
          Add to matrix (max 4):
        </span>
        {availableProspectsToAdd.length === 0 ? (
          <span className="text-xs text-slate-500">All available prospects selected.</span>
        ) : (
          availableProspectsToAdd.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleComparisonProspect(p.id)}
              className="px-2.5 py-1 rounded bg-[#151D2F] hover:bg-[#1C273E] border border-[#23314D] text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3 text-amber-400" />
              <span>{p.firstName} {p.lastName}</span>
              <span className="text-[10px] text-slate-400 font-mono">({p.primaryPosition})</span>
            </button>
          ))
        )}
      </div>

      {selectedProspects.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#111827] border border-[#1E293B] rounded-lg">
          <GitCompare className="w-8 h-8 text-sky-500/40 mx-auto mb-2" />
          <p className="text-sm font-medium">Matrix is empty</p>
          <p className="text-xs text-slate-400 mt-1">
            Select 2 to 4 prospects from the pills above or the Player Database to compare them.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Radar Overlay Comparison if at least 2 prospects */}
          {p1 && p2 && (
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 self-start">
                Comparative Skill Radar Overlay
              </h3>
              <RadarChart
                data={p1Radar}
                comparisonData={p2Radar}
                primaryLabel={`${p1.firstName} ${p1.lastName}`}
                comparisonLabel={`${p2.firstName} ${p2.lastName}`}
                size={300}
              />
            </div>
          )}

          {/* Side-by-side Table */}
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0E1422] border-b border-[#1E293B]">
                  <th className="py-3 px-4 w-48 font-bold uppercase text-slate-400 text-[11px]">
                    Attribute / Metric
                  </th>
                  {selectedProspects.map((p, idx) => (
                    <th key={p.id} className="py-3 px-4 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <button
                            onClick={() => {
                              setSelectedProspectId(p.id);
                              setActiveView('dossier');
                            }}
                            className="font-bold text-white hover:text-amber-400 text-sm block transition-colors"
                          >
                            {p.firstName} {p.lastName}
                          </button>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {p.primaryPosition} · {p.currentTeam}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleComparisonProspect(p.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove from matrix"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182338]">
                {/* Physical Tools */}
                <tr className="bg-[#101726]/80 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  <td colSpan={selectedProspects.length + 1} className="py-2 px-4">
                    Physical Tools & Anthropometrics
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Height / Weight</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono font-bold text-white tabular-nums">
                      {p.measurements.heightFormatted} · {p.measurements.weightLbs} lbs
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Wingspan</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono text-amber-400 tabular-nums">
                      {p.measurements.wingspanFormatted || '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Standing Reach</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono text-slate-300 tabular-nums">
                      {p.measurements.standingReachFormatted || '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Draft Age (2027)</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono text-slate-300 tabular-nums">
                      {p.draftAge ? `${p.draftAge.toFixed(1)} yrs` : '—'}
                    </td>
                  ))}
                </tr>

                {/* Scouting Grades */}
                <tr className="bg-[#101726]/80 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  <td colSpan={selectedProspects.length + 1} className="py-2 px-4">
                    Scout Grades (1 to 10 Scale)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400 font-bold">Overall Scout Grade</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono font-bold text-emerald-400 text-sm tabular-nums">
                      {p.latestReport ? `${p.latestReport.overallGrade.toFixed(1)} / 10` : 'Unrated'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Physical Tools</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono text-slate-200 tabular-nums">
                      {p.latestReport ? p.latestReport.categoryGrades.physical.toFixed(1) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Offensive Grade</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono text-slate-200 tabular-nums">
                      {p.latestReport ? p.latestReport.categoryGrades.offensive.toFixed(1) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Defensive Grade</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono text-slate-200 tabular-nums">
                      {p.latestReport ? p.latestReport.categoryGrades.defensive.toFixed(1) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Basketball IQ</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono text-slate-200 tabular-nums">
                      {p.latestReport ? p.latestReport.categoryGrades.basketballIq.toFixed(1) : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Mentality & Motor</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-mono text-slate-200 tabular-nums">
                      {p.latestReport ? p.latestReport.categoryGrades.mentality.toFixed(1) : '—'}
                    </td>
                  ))}
                </tr>

                {/* NBA Projection */}
                <tr className="bg-[#101726]/80 text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  <td colSpan={selectedProspects.length + 1} className="py-2 px-4">
                    NBA Translation
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">NBA Archetype</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 font-medium text-amber-300">
                      {p.latestReport?.nbaArchetype || '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Ceiling</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-emerald-400 font-medium">
                      {p.latestReport?.ceiling || '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400">Player Comparisons</td>
                  {selectedProspects.map((p) => (
                    <td key={p.id} className="py-2.5 px-4 text-slate-300">
                      {p.latestReport?.playerComparisons.join(', ') || '—'}
                    </td>
                  ))}
                </tr>

                {/* Board Rank */}
                <tr className="bg-[#101726]/80 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  <td colSpan={selectedProspects.length + 1} className="py-2 px-4">
                    Draft Board Standing
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-slate-400 font-bold">Personal Rank & Tier</td>
                  {selectedProspects.map((p) => {
                    const boardEntry = draftBoard.find((b) => b.prospectId === p.id);
                    return (
                      <td key={p.id} className="py-2.5 px-4 font-mono font-bold text-amber-400">
                        {boardEntry ? `#${boardEntry.rank} (Tier ${boardEntry.tier})` : 'Unranked'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
