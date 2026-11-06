import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Plus,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { Position, ProspectStatus, LeagueCategory } from '../../types/scouting';
import { DataSyncPanel } from '../settings/DataSyncPanel';

interface PlayerDatabaseViewProps {
  onOpenNewProspectModal: () => void;
}

type SortField =
  | 'name'
  | 'position'
  | 'team'
  | 'league'
  | 'height'
  | 'wingspan'
  | 'age'
  | 'status'
  | 'grade'
  | 'ppg';

export const PlayerDatabaseView: React.FC<PlayerDatabaseViewProps> = ({
  onOpenNewProspectModal,
}) => {
  const { prospects, setSelectedProspectId, setActiveView, toggleComparisonProspect, comparisonProspectIds, refreshAllData } = useScouting();

  const [search, setSearch] = useState('');
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [gradeRange, setGradeRange] = useState<'ALL' | 'ELITE' | 'ABOVE' | 'MID' | 'UNRATED'>('ALL');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isCompact, setIsCompact] = useState(false);

  // Column visibility
  const [showWingspan, setShowWingspan] = useState(true);
  const [showAge, setShowAge] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);

  const positions: (Position | 'ALL')[] = ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'];
  const leagues: (LeagueCategory | 'ALL')[] = [
    'ALL',
    'NCAA D1',
    'NCAA D-II/III',
    'Overtime Elite',
    'International Pro',
    'High School / Prep',
    'G-League',
    'NBA G League',
    'Other',
  ];
  const statuses: (ProspectStatus | 'ALL')[] = [
    'ALL',
    'Draft Board',
    'Evaluated',
    'In Evaluation',
    'To Observe',
    'Watchlist',
    'Cut',
  ];

  // Sorting and Filtering
  const filteredProspects = useMemo(() => {
    return prospects
      .filter((p) => {
        const matchesSearch =
          search === '' ||
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          p.currentTeam.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

        const matchesPos =
          selectedPos === 'ALL' ||
          p.primaryPosition === selectedPos ||
          p.secondaryPosition === selectedPos;

        const matchesLeague =
          selectedLeague === 'ALL' ||
          (selectedLeague === 'NCAA D1' && (p.currentLeague === 'NCAA D1' || p.currentLeague === 'NCAA D-I')) ||
          (selectedLeague === 'NBA G League' && (p.currentLeague === 'NBA G League' || p.currentLeague === 'G-League')) ||
          p.currentLeague === selectedLeague;

        const grade = p.latestReport?.overallGrade;
        const matchesGrade =
          gradeRange === 'ALL' ||
          (gradeRange === 'UNRATED' && (grade === undefined || grade <= 0)) ||
          (gradeRange === 'ELITE' && grade !== undefined && grade >= 8) ||
          (gradeRange === 'ABOVE' && grade !== undefined && grade >= 6 && grade < 8) ||
          (gradeRange === 'MID' && grade !== undefined && grade > 0 && grade < 6);

        const matchesStatus =
          selectedStatus === 'ALL' || p.status === selectedStatus;

        return matchesSearch && matchesPos && matchesLeague && matchesStatus && matchesGrade;
      })
      .sort((a, b) => {
        let aVal: any = 0;
        let bVal: any = 0;

        switch (sortField) {
          case 'name':
            aVal = `${a.lastName} ${a.firstName}`;
            bVal = `${b.lastName} ${b.firstName}`;
            return sortDirection === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          case 'position':
            aVal = a.primaryPosition;
            bVal = b.primaryPosition;
            return sortDirection === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          case 'team':
            aVal = a.currentTeam;
            bVal = b.currentTeam;
            return sortDirection === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          case 'league':
            aVal = a.currentLeague;
            bVal = b.currentLeague;
            return sortDirection === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          case 'height':
            aVal = a.measurements.heightInches;
            bVal = b.measurements.heightInches;
            break;
          case 'wingspan':
            aVal = a.measurements.wingspanInches || 0;
            bVal = b.measurements.wingspanInches || 0;
            break;
          case 'age':
            aVal = a.draftAge || 0;
            bVal = b.draftAge || 0;
            break;
          case 'status':
            aVal = a.status;
            bVal = b.status;
            return sortDirection === 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          case 'grade':
            aVal = a.latestReport?.overallGrade || 0;
            bVal = b.latestReport?.overallGrade || 0;
            break;
          case 'ppg':
            aVal = a.stats[0]?.ppg || 0;
            bVal = b.stats[0]?.ppg || 0;
            break;
        }

        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [
    prospects,
    search,
    selectedPos,
    selectedLeague,
    selectedStatus,
    gradeRange,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleRowClick = (id: string) => {
    setSelectedProspectId(id);
    setActiveView('dossier');
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Fast Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Player Database</span>
            <span className="text-xs font-mono font-medium text-slate-400">
              ({filteredProspects.length} of {prospects.length} prospects)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            NCAA stats can be cached from Settings. CSV covers Overtime Elite, Europe, and high school.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Density toggle */}
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="px-2.5 py-1.5 rounded bg-[#131B2C] border border-[#22314E] text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            {isCompact ? 'Standard Density' : 'Compact Rows'}
          </button>

          {/* Columns dropdown */}
          <div className="relative">
            <button
              onClick={() => setColumnMenuOpen(!columnMenuOpen)}
              className="px-2.5 py-1.5 rounded bg-[#131B2C] border border-[#22314E] text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Columns</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {columnMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#12192A] border border-[#243350] rounded-md shadow-2xl p-2 z-50 space-y-1 text-xs">
                <label className="flex items-center gap-2 px-2 py-1 hover:bg-[#192338] rounded cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={showWingspan}
                    onChange={(e) => setShowWingspan(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                  <span>Wingspan & Reach</span>
                </label>
                <label className="flex items-center gap-2 px-2 py-1 hover:bg-[#192338] rounded cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={showAge}
                    onChange={(e) => setShowAge(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                  <span>Draft Age</span>
                </label>
                <label className="flex items-center gap-2 px-2 py-1 hover:bg-[#192338] rounded cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={showStats}
                    onChange={(e) => setShowStats(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                  <span>Season Stats</span>
                </label>
                <label className="flex items-center gap-2 px-2 py-1 hover:bg-[#192338] rounded cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={showTags}
                    onChange={(e) => setShowTags(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                  <span>Scout Tags</span>
                </label>
              </div>
            )}
          </div>

          <button
            onClick={onOpenNewProspectModal}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Prospect</span>
          </button>
        </div>
      </div>

      <DataSyncPanel variant="compact" onDataChanged={refreshAllData} />

      {/* Filter Strip */}
      <div className="bg-[#101726] border border-[#1E293B] rounded-lg p-3.5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, team, tags..."
              className="w-full bg-[#141C2E] border border-[#23314D] rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* League Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#141C2E] border border-[#23314D] rounded-md px-2.5 py-1">
            <span className="text-[11px] text-slate-500 shrink-0">League:</span>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              {leagues.map((lg) => (
                <option key={lg} value={lg} className="bg-[#141C2E] text-slate-200">
                  {lg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#141C2E] border border-[#23314D] rounded-md px-2.5 py-1">
            <span className="text-[11px] text-slate-500 shrink-0">Grade:</span>
            <select
              value={gradeRange}
              onChange={(e) => setGradeRange(e.target.value as typeof gradeRange)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-[#141C2E]">All grades</option>
              <option value="ELITE" className="bg-[#141C2E]">8.0 – 10</option>
              <option value="ABOVE" className="bg-[#141C2E]">6.0 – 7.9</option>
              <option value="MID" className="bg-[#141C2E]">1.0 – 5.9</option>
              <option value="UNRATED" className="bg-[#141C2E]">Unrated</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#141C2E] border border-[#23314D] rounded-md px-2.5 py-1">
            <span className="text-[11px] text-slate-500 shrink-0">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st} className="bg-[#141C2E] text-slate-200">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Active comparison count button */}
          <div className="flex items-center justify-end">
            {comparisonProspectIds.length > 0 && (
              <button
                onClick={() => setActiveView('comparison')}
                className="w-full py-1.5 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>Compare Selected ({comparisonProspectIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Position Filter Pills */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-[#182337] text-xs">
          <span className="text-[11px] text-slate-500 mr-2">Position:</span>
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPos(pos)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                selectedPos === pos
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-[#151D2F] text-slate-400 hover:text-slate-200 hover:bg-[#1A243A]'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prospects Table */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0E1422] border-b border-[#1E293B] text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                <th className="py-3 px-4 w-12 text-center">Compare</th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-amber-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Prospect Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('position')}
                  className="py-3 px-3 cursor-pointer hover:text-amber-400 transition-colors w-16 text-center"
                >
                  Pos
                </th>
                <th
                  onClick={() => handleSort('team')}
                  className="py-3 px-4 cursor-pointer hover:text-amber-400 transition-colors"
                >
                  Current Team
                </th>
                <th
                  onClick={() => handleSort('league')}
                  className="py-3 px-3 cursor-pointer hover:text-amber-400 transition-colors"
                >
                  League
                </th>
                <th
                  onClick={() => handleSort('height')}
                  className="py-3 px-3 cursor-pointer hover:text-amber-400 transition-colors font-mono"
                >
                  Ht / Wt
                </th>
                {showWingspan && (
                  <th
                    onClick={() => handleSort('wingspan')}
                    className="py-3 px-3 cursor-pointer hover:text-amber-400 transition-colors font-mono"
                  >
                    Wingspan
                  </th>
                )}
                {showAge && (
                  <th
                    onClick={() => handleSort('age')}
                    className="py-3 px-3 cursor-pointer hover:text-amber-400 transition-colors font-mono text-center"
                  >
                    Draft Age
                  </th>
                )}
                {showStats && (
                  <th
                    onClick={() => handleSort('ppg')}
                    className="py-3 px-6 w-[22%] min-w-[16rem] cursor-pointer hover:text-amber-400 transition-colors font-mono text-right"
                  >
                    PPG / RPG / APG
                  </th>
                )}
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 cursor-pointer hover:text-amber-400 transition-colors text-center"
                >
                  Status
                </th>
                {showTags && <th className="py-3 px-4">Tags</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182338]">
              {filteredProspects.length === 0 ? (
                <tr>
                  <td colSpan={7 + Number(showWingspan) + Number(showAge) + Number(showStats) + Number(showTags)} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">No prospects found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Adjust your filters or add a new prospect to your database.
                    </p>
                    <button
                      onClick={onOpenNewProspectModal}
                      className="mt-4 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-md inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Prospect</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProspects.map((p) => {
                  const isCompared = comparisonProspectIds.includes(p.id);
                  const stat = p.stats[0];

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleRowClick(p.id)}
                      className={`hover:bg-[#141D30] transition-colors cursor-pointer group ${
                        isCompact ? 'py-1.5' : 'py-3'
                      }`}
                    >
                      {/* Compare Checkbox */}
                      <td
                        className="py-2.5 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComparisonProspect(p.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => {}}
                          className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Name & Draft Year */}
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-white group-hover:text-amber-400 transition-colors">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Class of {p.draftYear} · {p.nationality}
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 text-[11px]">
                          {p.primaryPosition}
                        </span>
                      </td>

                      {/* Team */}
                      <td className="py-2.5 px-4 text-slate-200 font-medium">
                        {p.currentTeam}
                      </td>

                      {/* League */}
                      <td className="py-2.5 px-3 text-slate-400">
                        {p.currentLeague}
                      </td>

                      {/* Height & Weight */}
                      <td className="py-2.5 px-3 font-mono text-slate-300 tabular-nums">
                        {p.measurements.heightFormatted || '—'} · {p.measurements.weightLbs ? `${p.measurements.weightLbs} lbs` : '—'}
                      </td>

                      {/* Wingspan */}
                      {showWingspan && (
                        <td className="py-2.5 px-3 font-mono text-slate-300 tabular-nums">
                          {p.measurements.wingspanFormatted || '—'}
                        </td>
                      )}

                      {/* Age */}
                      {showAge && (
                        <td className="py-2.5 px-3 font-mono text-slate-300 tabular-nums text-center">
                          {p.draftAge ? p.draftAge.toFixed(1) : '—'}
                        </td>
                      )}

                      {/* Stats */}
                      {showStats && (
                        <td className="py-2.5 px-6 w-[22%] min-w-[16rem] font-mono text-right tabular-nums text-slate-200">
                          {stat ? (
                            <span className="inline-flex justify-end gap-5 whitespace-nowrap">
                              <span><strong className="text-white">{stat.ppg == null ? '—' : stat.ppg.toFixed(1)}</strong> <span className="text-[10px] text-slate-500">PPG</span></span>
                              <span><strong className="text-white">{stat.rpg == null ? '—' : stat.rpg.toFixed(1)}</strong> <span className="text-[10px] text-slate-500">RPG</span></span>
                              <span><strong className="text-white">{stat.apg == null ? '—' : stat.apg.toFixed(1)}</strong> <span className="text-[10px] text-slate-500">APG</span></span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#182337] text-slate-300 border border-[#253450]">
                          {p.status}
                        </span>
                      </td>

                      {/* Tags */}
                      {showTags && (
                        <td className="py-2.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[#162135] text-slate-300 border border-[#22314E]"
                              >
                                {t}
                              </span>
                            ))}
                            {p.tags.length > 2 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{p.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
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
