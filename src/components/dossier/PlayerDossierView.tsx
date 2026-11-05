import React, { useState } from 'react';
import {
  User,
  Ruler,
  Calendar,
  Globe,
  Award,
  FileSpreadsheet,
  Film,
  CalendarDays,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Play,
  Clock,
  Tag,
  Edit,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { RadarChart } from '../common/RadarChart';
import { ProspectStatus } from '../../types/scouting';

interface PlayerDossierViewProps {
  onOpenNewReportModal: () => void;
}

export const PlayerDossierView: React.FC<PlayerDossierViewProps> = ({
  onOpenNewReportModal,
}) => {
  const {
    activeProspect,
    updateProspect,
    reports,
    notes,
    gameLogs,
    videos,
    addNote,
    deleteNote,
    setActiveView,
    toggleComparisonProspect,
    comparisonProspectIds,
  } = useScouting();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'statistics' | 'scouting' | 'gamelog' | 'video' | 'history'
  >('overview');

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!activeProspect) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-base font-medium">No prospect selected</p>
        <p className="text-xs text-slate-400 mt-1">
          Select a prospect from the Database or create a new prospect to begin.
        </p>
        <button
          onClick={() => setActiveView('database')}
          className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-md text-xs hover:bg-amber-400 transition-colors"
        >
          Go to Player Database
        </button>
      </div>
    );
  }

  const p = activeProspect;
  const isCompared = comparisonProspectIds.includes(p.id);
  const playerReports = reports.filter((r) => r.prospectId === p.id);
  const playerNotes = notes.filter((n) => n.prospectId === p.id);
  const playerGameLogs = gameLogs.filter((g) => g.prospectId === p.id);
  const playerVideos = videos.filter((v) => v.prospectId === p.id);
  const latestReport = playerReports[0] || p.latestReport;
  const currentStats = p.stats[0];

  const handleStatusChange = (newStatus: ProspectStatus) => {
    updateProspect(p.id, { status: newStatus });
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    addNote({
      prospectId: p.id,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tags: newNoteTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTags('');
    setIsAddingNote(false);
  };

  // Radar data points from report
  const radarData = latestReport
    ? [
        { axis: 'Physical', value: latestReport.categoryGrades.physical },
        { axis: 'Offense', value: latestReport.categoryGrades.offensive },
        { axis: 'Defense', value: latestReport.categoryGrades.defensive },
        { axis: 'B-Ball IQ', value: latestReport.categoryGrades.basketballIq },
        { axis: 'Mentality', value: latestReport.categoryGrades.mentality },
      ]
    : [
        { axis: 'Physical', value: 5.0 },
        { axis: 'Offense', value: 5.0 },
        { axis: 'Defense', value: 5.0 },
        { axis: 'B-Ball IQ', value: 5.0 },
        { axis: 'Mentality', value: 5.0 },
      ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Prospect Dossier Banner */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Biographical Information */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#1A253D] to-[#121A2C] border-2 border-[#243452] flex items-center justify-center text-2xl font-bold font-mono text-amber-400 shadow-md shrink-0">
              {p.firstName[0]}
              {p.lastName[0]}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  {p.firstName} {p.lastName}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  {p.primaryPosition}
                  {p.secondaryPosition ? ` / ${p.secondaryPosition}` : ''}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1A2438] text-slate-300 border border-[#23314B]">
                  Class of {p.draftYear}
                </span>
              </div>

              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                <span className="font-semibold text-slate-200">{p.currentTeam}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">{p.currentLeague}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">{p.nationality}</span>
                {p.draftAge && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-mono text-slate-300">
                      Draft Age: {p.draftAge.toFixed(1)} yrs
                    </span>
                  </>
                )}
              </div>

              {/* Physical measurements strip */}
              <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 uppercase text-[10px]">Height:</span>
                  <span className="font-bold text-white">{p.measurements.heightFormatted}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 uppercase text-[10px]">Weight:</span>
                  <span className="font-bold text-white">{p.measurements.weightLbs} lbs</span>
                </div>
                {p.measurements.wingspanFormatted && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 uppercase text-[10px]">Wingspan:</span>
                    <span className="font-bold text-amber-400">{p.measurements.wingspanFormatted}</span>
                  </div>
                )}
                {p.measurements.standingReachFormatted && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 uppercase text-[10px]">Reach:</span>
                    <span className="font-bold text-white">{p.measurements.standingReachFormatted}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status & Quick Action Controls */}
          <div className="flex flex-col sm:flex-row items-start lg:items-end gap-3 shrink-0">
            {/* Status Dropdown */}
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Scout Status
              </label>
              <select
                value={p.status}
                onChange={(e) => handleStatusChange(e.target.value as ProspectStatus)}
                className="bg-[#141C2E] border border-[#243350] rounded-md px-3 py-1.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Watchlist">Watchlist</option>
                <option value="To Observe">To Observe</option>
                <option value="In Evaluation">In Evaluation</option>
                <option value="Evaluated">Evaluated</option>
                <option value="Draft Board">Draft Board</option>
                <option value="Cut">Cut / Archive</option>
              </select>
            </div>

            {/* Compare toggle */}
            <button
              onClick={() => toggleComparisonProspect(p.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                isCompared
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-[#151D2F] text-slate-300 border-[#23314D] hover:text-white'
              }`}
            >
              {isCompared ? '✓ Selected in Matrix' : '+ Compare'}
            </button>

            {/* Add Report button */}
            <button
              onClick={onOpenNewReportModal}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Report</span>
            </button>
          </div>
        </div>

        {/* Tags bar */}
        {p.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-4 mt-4 border-t border-[#1C263B]">
            <span className="text-[11px] text-slate-400 mr-1">Tags:</span>
            {p.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded bg-[#172237] text-slate-200 border border-[#233452]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-[#1E293B] pb-px text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'statistics', label: 'Statistics' },
          { id: 'scouting', label: `Scouting & Grades (${playerReports.length})` },
          { id: 'gamelog', label: `Game Log (${playerGameLogs.length})` },
          { id: 'video', label: `Video Film (${playerVideos.length})` },
          { id: 'history', label: `Notes & History (${playerNotes.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-t-md transition-all font-semibold ${
              activeTab === tab.id
                ? 'bg-[#121A2C] text-amber-400 border-t-2 border-x border-amber-500 border-b-transparent -mb-px'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#121927]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Strip */}
          {currentStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
              {[
                { label: 'PPG', val: currentStats.ppg.toFixed(1), highlight: true },
                { label: 'RPG', val: currentStats.rpg.toFixed(1) },
                { label: 'APG', val: currentStats.apg.toFixed(1) },
                { label: 'SPG', val: currentStats.spg.toFixed(1) },
                { label: 'BPG', val: currentStats.bpg.toFixed(1) },
                { label: 'FG%', val: `${(currentStats.fgPct * 100).toFixed(1)}%` },
                { label: '3P%', val: `${(currentStats.fg3Pct * 100).toFixed(1)}%` },
                { label: 'TS%', val: currentStats.tsPct ? `${(currentStats.tsPct * 100).toFixed(1)}%` : '—' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[#111827] border border-[#1E293B] rounded-lg p-3 text-center"
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {s.label}
                  </div>
                  <div
                    className={`text-base font-bold font-mono mt-0.5 tabular-nums ${
                      s.highlight ? 'text-amber-400' : 'text-white'
                    }`}
                  >
                    {s.val}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#111827] border border-[#1E293B] text-xs text-slate-400 text-center">
              No season statistics recorded yet. You can add stats via the Statistics tab or CSV import.
            </div>
          )}

          {/* Scouting Executive Summary Split */}
          {latestReport ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Summary & Projection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Executive Summary */}
                <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Scout Executive Evaluation
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {latestReport.reportDate}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Grade: {latestReport.overallGrade.toFixed(1)} / 10
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {latestReport.executiveSummary}
                  </p>
                </div>

                {/* NBA Projection Matrix */}
                <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    NBA Projection & Role Trajectory
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded bg-[#141C2D] border border-[#22304C]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        NBA Archetype
                      </div>
                      <div className="font-semibold text-amber-300 mt-0.5">
                        {latestReport.nbaArchetype}
                      </div>
                    </div>

                    <div className="p-3 rounded bg-[#141C2D] border border-[#22304C]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Projected Role
                      </div>
                      <div className="font-semibold text-slate-200 mt-0.5">
                        {latestReport.projectedRole}
                      </div>
                    </div>

                    <div className="p-3 rounded bg-[#141C2D] border border-[#22304C]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Floor
                      </div>
                      <div className="text-slate-300 mt-0.5">{latestReport.floor}</div>
                    </div>

                    <div className="p-3 rounded bg-[#141C2D] border border-[#22304C]">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Ceiling
                      </div>
                      <div className="text-emerald-400 font-medium mt-0.5">
                        {latestReport.ceiling}
                      </div>
                    </div>
                  </div>

                  {/* Comparisons */}
                  <div className="pt-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                      Player Comparisons
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {latestReport.playerComparisons.map((c) => (
                        <span
                          key={c}
                          className="px-2.5 py-1 rounded bg-[#182337] text-slate-200 text-xs font-medium border border-[#253654]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Key Strengths</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {latestReport.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Areas for Growth</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {latestReport.weaknesses.map((weak, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold">⚠</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Col: Radar Chart */}
              <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 flex flex-col items-center justify-center space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 self-start">
                  Skill Evaluation Radar
                </h3>
                <RadarChart data={radarData} primaryLabel={`${p.firstName} ${p.lastName}`} size={270} />

                {/* Grade breakdown mini table */}
                <div className="w-full space-y-2 pt-2 border-t border-[#1C263B]">
                  {radarData.map((d) => (
                    <div
                      key={d.axis}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-400">{d.axis}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(d.value / 10) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-white tabular-nums w-8 text-right">
                          {d.value.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-8 text-center space-y-3">
              <FileSpreadsheet className="w-8 h-8 text-amber-500/50 mx-auto" />
              <h3 className="text-sm font-bold text-white">Unrated / No Report Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No personal scouting evaluations have been authored for this prospect. File a report to grade their physical tools, offensive/defensive traits, and establish their skill radar.
              </p>
              <button
                onClick={onOpenNewReportModal}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md text-xs transition-colors"
              >
                Create First Scouting Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STATISTICS */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Season Traditional Box Scores
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Source: {currentStats?.source || 'Manual / Verified Entry'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono tabular-nums">
                <thead>
                  <tr className="bg-[#0E1422] border-b border-[#1E293B] text-[11px] uppercase text-slate-400">
                    <th className="py-2.5 px-3">Season</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-3">League</th>
                    <th className="py-2.5 px-2 text-right">GP</th>
                    <th className="py-2.5 px-2 text-right">MPG</th>
                    <th className="py-2.5 px-2 text-right text-amber-400 font-bold">PPG</th>
                    <th className="py-2.5 px-2 text-right">RPG</th>
                    <th className="py-2.5 px-2 text-right">APG</th>
                    <th className="py-2.5 px-2 text-right">SPG</th>
                    <th className="py-2.5 px-2 text-right">BPG</th>
                    <th className="py-2.5 px-2 text-right">TOV</th>
                    <th className="py-2.5 px-2 text-right">FG%</th>
                    <th className="py-2.5 px-2 text-right">3P%</th>
                    <th className="py-2.5 px-2 text-right">FT%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182338]">
                  {p.stats.map((s) => (
                    <tr key={s.id} className="hover:bg-[#141D30]">
                      <td className="py-2.5 px-3 font-semibold text-white">{s.season}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{s.team}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-400">{s.league}</td>
                      <td className="py-2.5 px-2 text-right">{s.gp}</td>
                      <td className="py-2.5 px-2 text-right">{s.mpg.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-amber-400">{s.ppg.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-right">{s.rpg.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-right">{s.apg.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-right">{s.spg.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-right">{s.bpg.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-right text-slate-400">{s.tov.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-right font-semibold text-emerald-400">
                        {(s.fgPct * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-sky-400">
                        {(s.fg3Pct * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {(s.ftPct * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advanced Analytics */}
          {currentStats && (
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
                Advanced Analytical Profile
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {[
                  { label: 'TS% (True Shooting)', val: currentStats.tsPct ? `${(currentStats.tsPct * 100).toFixed(1)}%` : '—' },
                  { label: 'eFG% (Effective FG)', val: currentStats.efgPct ? `${(currentStats.efgPct * 100).toFixed(1)}%` : '—' },
                  { label: 'USG% (Usage Rate)', val: currentStats.usgPct ? `${currentStats.usgPct.toFixed(1)}%` : '—' },
                  { label: 'AST% (Assist %)', val: currentStats.astPct ? `${currentStats.astPct.toFixed(1)}%` : '—' },
                  { label: 'TRB% (Total Rebound)', val: currentStats.trbPct ? `${currentStats.trbPct.toFixed(1)}%` : '—' },
                  { label: 'BPM (Box Plus/Minus)', val: currentStats.bpm ? `+${currentStats.bpm.toFixed(1)}` : '—' },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-[#131B2D] border border-[#1F2C45] rounded-md">
                    <div className="text-[10px] uppercase font-bold text-slate-400">{item.label}</div>
                    <div className="text-base font-bold font-mono text-white mt-1 tabular-nums">
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCOUTING & DETAILED GRADES */}
      {activeTab === 'scouting' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Scouting Reports ({playerReports.length})
            </h3>
            <button
              onClick={onOpenNewReportModal}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-md text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Scouting Report</span>
            </button>
          </div>

          {playerReports.length === 0 ? (
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-8 text-center space-y-3">
              <FileSpreadsheet className="w-8 h-8 text-amber-500/50 mx-auto" />
              <h4 className="text-sm font-bold text-white">Unrated / No Report Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No subjective scouting evaluations have been authored for this prospect. Click the button below to rate their physical tools, skills, and NBA projection.
              </p>
              <button
                onClick={onOpenNewReportModal}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md text-xs transition-colors"
              >
                Create First Scouting Report
              </button>
            </div>
          ) : (
            playerReports.map((rep) => (
              <div key={rep.id} className="bg-[#111827] border border-[#1E293B] rounded-lg p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-3">
                      <span>{rep.gameOrEvent || 'Comprehensive Evaluation'}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Overall: {rep.overallGrade.toFixed(1)} / 10
                      </span>
                    </h4>
                    <div className="text-xs text-slate-400 mt-1">
                      Scouted on {rep.reportDate} · Confidence: {rep.confidence}/5
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-medium text-amber-400">
                      {rep.nbaArchetype}
                    </span>
                  </div>
                </div>

                {/* Sub-skill Grids */}
                {rep.detailedGrades && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    {/* Physical & Athleticism */}
                    <div className="p-4 rounded bg-[#131C2E] border border-[#202E49] space-y-2">
                      <h5 className="font-bold uppercase tracking-wider text-amber-400 text-[11px] mb-2">
                        Physical Tools & Athleticism
                      </h5>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Size & Frame', val: rep.detailedGrades.size },
                          { name: 'Wingspan & Length', val: rep.detailedGrades.wingspan },
                          { name: 'Functional Mobility', val: rep.detailedGrades.mobility },
                          { name: 'Strength & Balance', val: rep.detailedGrades.strength },
                          { name: 'Explosiveness', val: rep.detailedGrades.explosiveness },
                        ].map((item) => (
                          <div key={item.name} className="flex justify-between items-center text-slate-300">
                            <span>{item.name}</span>
                            <span className="font-mono font-bold text-amber-300">{item.val ?? '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Offensive Skills */}
                    <div className="p-4 rounded bg-[#131C2E] border border-[#202E49] space-y-2">
                      <h5 className="font-bold uppercase tracking-wider text-sky-400 text-[11px] mb-2">
                        Offensive Skillset
                      </h5>
                      <div className="space-y-1.5">
                        {[
                          { name: '3-Point Shooting', val: rep.detailedGrades.threePointShooting },
                          { name: 'Rim Finishing', val: rep.detailedGrades.finishing },
                          { name: 'Shot Creation', val: rep.detailedGrades.shotCreation },
                          { name: 'Passing & Playmaking', val: rep.detailedGrades.passing },
                          { name: 'Decision Making', val: rep.detailedGrades.decisionMakingOffense },
                        ].map((item) => (
                          <div key={item.name} className="flex justify-between items-center text-slate-300">
                            <span>{item.name}</span>
                            <span className="font-mono font-bold text-sky-300">{item.val ?? '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Defense & Basketball IQ */}
                    <div className="p-4 rounded bg-[#131C2E] border border-[#202E49] space-y-2">
                      <h5 className="font-bold uppercase tracking-wider text-emerald-400 text-[11px] mb-2">
                        Defense & Basketball IQ
                      </h5>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Point of Attack Defense', val: rep.detailedGrades.pointOfAttackDefense },
                          { name: 'Rim Protection & Help', val: rep.detailedGrades.rimProtection },
                          { name: 'Court Vision', val: rep.detailedGrades.courtVision },
                          { name: 'Pick & Roll Reading', val: rep.detailedGrades.readingPickAndRoll },
                          { name: 'Competitive Motor', val: rep.detailedGrades.competitiveness },
                        ].map((item) => (
                          <div key={item.name} className="flex justify-between items-center text-slate-300">
                            <span>{item.name}</span>
                            <span className="font-mono font-bold text-emerald-300">{item.val ?? '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Written Summary */}
                <div className="text-xs text-slate-300 leading-relaxed bg-[#131B2B] p-4 rounded border border-[#1F2C45]">
                  {rep.executiveSummary}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: GAME LOG */}
      {activeTab === 'gamelog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Scouted Match Logs ({playerGameLogs.length})
            </h3>
            <button
              onClick={() => setActiveView('gamelog')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>Open Full Match Tracker</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {playerGameLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-[#111827] border border-[#1E293B] rounded-lg">
              No individual game logs scouted for this player yet.
            </div>
          ) : (
            <div className="space-y-4">
              {playerGameLogs.map((log) => (
                <div key={log.id} className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
                    <div>
                      <div className="text-xs font-bold text-white">
                        {log.homeTeam} vs {log.awayTeam} · <span className="font-mono text-amber-400">{log.score}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {log.competition} · {log.gameDate} · {log.minutesWatched} mins watched
                      </div>
                    </div>
                    {log.replayUrl && (
                      <a
                        href={log.replayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        <span>Replay Stream</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {log.pts !== undefined && (
                    <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-200">
                      <span><strong>{log.pts}</strong> PTS</span>
                      <span><strong>{log.reb}</strong> REB</span>
                      <span><strong>{log.ast}</strong> AST</span>
                      <span><strong>{log.stl}</strong> STL</span>
                      <span><strong>{log.blk}</strong> BLK</span>
                      <span><strong>{log.fg}</strong> FG</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#131B2C] p-3 rounded border border-[#1E283F]">
                    {log.observations}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: VIDEO FILM & TIMESTAMPS */}
      {activeTab === 'video' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Video Breakdowns & Timestamps ({playerVideos.length})
            </h3>
            <button
              onClick={() => setActiveView('video')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              <span>Open Video Library</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {playerVideos.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-[#111827] border border-[#1E293B] rounded-lg">
              No video cutups linked to this prospect yet. Add YouTube game cutups with timestamp notes in the Video Library.
            </div>
          ) : (
            <div className="space-y-6">
              {playerVideos.map((vid) => (
                <div key={vid.id} className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 text-amber-400" />
                        <span>{vid.title}</span>
                      </h4>
                      {vid.description && (
                        <p className="text-xs text-slate-400 mt-1">{vid.description}</p>
                      )}
                    </div>
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <span>Watch Full Film</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Interactive Timestamps */}
                  <div className="space-y-2 pt-2 border-t border-[#1C263B]">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Horodatages & Observations
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {vid.timestamps.map((ts, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded bg-[#131C2D] border border-[#202E4A] flex items-start gap-2.5 text-xs"
                        >
                          <a
                            href={`${vid.videoUrl}&t=${ts.seconds}s`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 hover:bg-amber-400/20 shrink-0"
                            title="Jump to play in video"
                          >
                            {ts.label}
                          </a>
                          <span className="text-slate-300 leading-snug">{ts.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: FREEFORM NOTES & AUDIT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Scouting Notebook & Observations
            </h3>
            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-md text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNote ? 'Cancel' : 'Write Freeform Note'}</span>
            </button>
          </div>

          {/* New Note Form */}
          {isAddingNote && (
            <form onSubmit={handleSaveNote} className="bg-[#111827] border border-amber-500/40 rounded-lg p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase text-amber-400">Add Scouting Observation</h4>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="e.g. Shooting Mechanics Breakdown, Lateral Speed in Switches"
                  className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Observation Content (Markdown supported)
                </label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record your scouting impressions, tendencies, touch, motor, discipline..."
                  rows={4}
                  className="w-full bg-[#141C2E] border border-[#23314D] rounded p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  placeholder="Film Study, Shooting, Draft 2027"
                  className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1.5 bg-[#182337] text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          )}

          {/* Notes list */}
          {playerNotes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-[#111827] border border-[#1E293B] rounded-lg">
              No freeform notes written for this prospect yet. Use the button above to record your scouting thoughts.
            </div>
          ) : (
            <div className="space-y-4">
              {playerNotes.map((note) => (
                <div key={note.id} className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <h4 className="text-xs font-bold text-white">{note.title}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                    {note.content}
                  </div>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#172236] text-slate-400 border border-[#21304C]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
