import React from 'react';
import { GitCompare, X, Plus, Trophy, Ruler, BarChart2 } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { RadarChart, categoryRadarPoints } from '../common/RadarChart';

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

  const toRadar = (prospect: typeof p1) =>
    prospect?.latestReport ? categoryRadarPoints(prospect.latestReport.categoryGrades) : undefined;

  const p1Radar = toRadar(p1);
  const p2Radar = toRadar(p2);
  const overlayPrimary = p1Radar || p2Radar;
  const overlayComparison = p1Radar && p2Radar ? p2Radar : undefined;

  const otherOf = (index: number, read: (prospect: (typeof selectedProspects)[number]) => number | undefined) => {
    const other = selectedProspects[index === 0 ? 1 : 0];
    return other ? read(other) : undefined;
  };

  const leadClass = (value?: number, other?: number) => {
    if (value === undefined || other === undefined || value === other) return 'text-slate-200';
    return value > other ? 'text-emerald-400 font-bold' : 'text-rose-300';
  };

  const deltaLabel = (value?: number, other?: number) => {
    if (value === undefined || other === undefined || value === other) return '';
    const gap = value - other;
    return ` ${gap > 0 ? '+' : ''}${gap.toFixed(1)}`;
  };

  return (
    <div className="min-h-full w-full px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <GitCompare className="w-5 h-5 text-sky-400" />
            <span>Prospect Comparison Matrix</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Side-by-side comparative analysis of physicals, production, advanced metrics, and scouting grades.
          </p>
        </div>

        {selectedProspects.length > 0 && (
          <button
            onClick={clearComparison}
            className="text-sm text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Matrix</span>
          </button>
        )}
      </div>

      {/* Selector pills */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-3.5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-400 mr-2">
          Select 2 prospects:
        </span>
        {availableProspectsToAdd.length === 0 ? (
          <span className="text-sm text-slate-500">All available prospects selected.</span>
        ) : (
          availableProspectsToAdd.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleComparisonProspect(p.id)}
              className="px-2.5 py-1 rounded bg-[#151D2F] hover:bg-[#1C273E] border border-[#23314D] text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3 text-amber-400" />
              <span>{p.firstName} {p.lastName}</span>
              <span className="text-sm text-slate-400 font-mono">({p.primaryPosition})</span>
            </button>
          ))
        )}
      </div>

      {selectedProspects.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#111827] border border-[#1E293B] rounded-lg">
          <GitCompare className="w-8 h-8 text-sky-500/40 mx-auto mb-2" />
          <p className="text-sm font-medium">Matrix is empty</p>
          <p className="text-sm text-slate-400 mt-1">
            Select two prospects to compare physicals, production, and personal scouting grades.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Radar Overlay Comparison if at least 2 prospects and at least one has an authored report */}
          {p1 && p2 && overlayPrimary && (
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-slate-300 self-start">
                Comparative Skill Radar Overlay
              </h3>
              <RadarChart
                data={overlayPrimary}
                comparisonData={overlayComparison}
                primaryLabel={p1Radar ? `${p1.firstName} ${p1.lastName}` : `${p2.firstName} ${p2.lastName}`}
                comparisonLabel={p2 ? `${p2.firstName} ${p2.lastName}` : 'Comparison'}
                size={320}
              />
            </div>
          )}

          {/* Side-by-side Table */}
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg overflow-x-auto shadow-xl">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#0E1422] border-b border-[#1E293B]">
                  <th className="py-3 px-4 w-48 font-bold uppercase text-slate-400 text-sm">
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
                          <div className="text-sm text-slate-400 font-mono">
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
                <tr className="bg-[#101726]/80 text-base font-bold uppercase tracking-wider text-amber-400">
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
                <tr className="bg-[#101726]/80 text-base font-bold uppercase tracking-wider text-emerald-400">
                  <td colSpan={selectedProspects.length + 1} className="py-2 px-4">
                    Scout Grades (1 to 10 Scale)
                  </td>
                </tr>
                {(
                  [
                    ['Overall Scout Grade', (p: (typeof selectedProspects)[number]) => p.latestReport?.overallGrade],
                    ['Physical', (p: (typeof selectedProspects)[number]) => p.latestReport?.categoryGrades.physical],
                    ['Offense', (p: (typeof selectedProspects)[number]) => p.latestReport?.categoryGrades.offensive],
                    ['Defense', (p: (typeof selectedProspects)[number]) => p.latestReport?.categoryGrades.defensive],
                    ['B-Ball IQ', (p: (typeof selectedProspects)[number]) => p.latestReport?.categoryGrades.basketballIq],
                    ['Mentality', (p: (typeof selectedProspects)[number]) => p.latestReport?.categoryGrades.mentality],
                    ['PPG', (p: (typeof selectedProspects)[number]) => p.stats[0]?.ppg],
                    ['RPG', (p: (typeof selectedProspects)[number]) => p.stats[0]?.rpg],
                    ['APG', (p: (typeof selectedProspects)[number]) => p.stats[0]?.apg],
                  ] as const
                ).map(([label, read]) => (
                  <tr key={label}>
                    <td className="py-2.5 px-4 text-slate-400">{label}</td>
                    {selectedProspects.map((prospect, index) => {
                      const value = read(prospect);
                      const other = otherOf(index, read);
                      return (
                        <td key={prospect.id} className={`py-2.5 px-4 font-mono tabular-nums ${leadClass(value, other)}`}>
                          {value === undefined || value <= 0 ? '—' : value.toFixed(1)}
                          <span className="text-sm">{deltaLabel(value, other)}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* NBA Projection */}
                <tr className="bg-[#101726]/80 text-base font-bold uppercase tracking-wider text-sky-400">
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
                <tr className="bg-[#101726]/80 text-base font-bold uppercase tracking-wider text-slate-300">
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
