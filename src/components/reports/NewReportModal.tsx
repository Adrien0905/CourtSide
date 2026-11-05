import React, { useState } from 'react';
import { X, FileSpreadsheet, ChevronDown, ChevronUp, Sliders, Check, HelpCircle } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { CONFIDENCE_OPTIONS, ConfidenceLevel } from '../../types/scouting';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({ isOpen, onClose }) => {
  const { prospects, activeProspect, addReport, setActiveView } = useScouting();

  const [prospectId, setProspectId] = useState(activeProspect?.id || prospects[0]?.id || '');
  const [reportType, setReportType] = useState<'Overall Prospect Evaluation' | 'Single Game Report'>('Overall Prospect Evaluation');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [gameOrEvent, setGameOrEvent] = useState('');
  const [competition, setCompetition] = useState<'NCAA D1' | 'NBA G League'>('NCAA D1');
  const [opponent, setOpponent] = useState('');
  const [minutesObserved, setMinutesObserved] = useState(30);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(1);

  // 5 Core Categories: grade (1-10) and unrated flag
  const [physicalRated, setPhysicalRated] = useState(true);
  const [physicalGrade, setPhysicalGrade] = useState(7.5);

  const [offensiveRated, setOffensiveRated] = useState(true);
  const [offensiveGrade, setOffensiveGrade] = useState(7.5);

  const [defensiveRated, setDefensiveRated] = useState(true);
  const [defensiveGrade, setDefensiveGrade] = useState(7.0);

  const [bballIqRated, setBballIqRated] = useState(true);
  const [bballIqGrade, setBballIqGrade] = useState(7.5);

  const [mentalityRated, setMentalityRated] = useState(true);
  const [mentalityGrade, setMentalityGrade] = useState(7.5);

  const [overallGrade, setOverallGrade] = useState(7.5);

  // Expandable Detailed Sub-Skills
  const [showDetailedGrades, setShowDetailedGrades] = useState(false);
  const [subSkills, setSubSkills] = useState<{ [key: string]: number | null }>({
    size: null,
    mobility: null,
    explosiveness: null,
    strength: null,
    shooting: null,
    threePointShooting: null,
    finishing: null,
    rimPressure: null,
    passing: null,
    ballHandling: null,
    pointOfAttackDefense: null,
    perimeterDefense: null,
    rimProtection: null,
    switchability: null,
    courtVision: null,
    decisionMakingGeneral: null,
    competitiveness: null,
    motor: null,
  });

  // Projection
  const [nbaArchetype, setNbaArchetype] = useState('');
  const [projectedRole, setProjectedRole] = useState('');
  const [floor, setFloor] = useState('');
  const [ceiling, setCeiling] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [weaknessesText, setWeaknessesText] = useState('');
  const [comparisonsText, setComparisonsText] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');

  if (!isOpen) return null;

  // Auto-calculate Overall Grade based on currently rated core categories
  const calculateAutoOverall = () => {
    const ratedValues: number[] = [];
    if (physicalRated) ratedValues.push(physicalGrade);
    if (offensiveRated) ratedValues.push(offensiveGrade);
    if (defensiveRated) ratedValues.push(defensiveGrade);
    if (bballIqRated) ratedValues.push(bballIqGrade);
    if (mentalityRated) ratedValues.push(mentalityGrade);

    if (ratedValues.length === 0) {
      setOverallGrade(0);
      return;
    }
    const sum = ratedValues.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / ratedValues.length) * 10) / 10;
    setOverallGrade(avg);
  };

  const handleSubSkillChange = (key: string, val: number | null) => {
    setSubSkills((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectId || !executiveSummary.trim()) return;

    const strengths = strengthsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const weaknesses = weaknessesText
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    const playerComparisons = comparisonsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    // Build cleaned detailed grades without null values
    const cleanedDetailedGrades: { [key: string]: number } = {};
    Object.entries(subSkills).forEach(([k, v]) => {
      if (v !== null && v > 0) {
        cleanedDetailedGrades[k] = v;
      }
    });

    addReport({
      prospectId,
      reportDate,
      reportType,
      scoutName: 'Lead Scout',
      gameOrEvent:
        gameOrEvent.trim() ||
        (reportType === 'Overall Prospect Evaluation' ? 'Season Overview' : 'Single Game Scouting Session'),
      competition,
      opponent: opponent.trim() || undefined,
      minutesObserved: Number(minutesObserved),
      confidence,
      categoryGrades: {
        physical: physicalRated ? Number(physicalGrade) : 0,
        offensive: offensiveRated ? Number(offensiveGrade) : 0,
        defensive: defensiveRated ? Number(defensiveGrade) : 0,
        basketballIq: bballIqRated ? Number(bballIqGrade) : 0,
        mentality: mentalityRated ? Number(mentalityGrade) : 0,
      },
      detailedGrades: Object.keys(cleanedDetailedGrades).length > 0 ? cleanedDetailedGrades : undefined,
      nbaArchetype: nbaArchetype.trim() || 'Unspecified Archetype',
      projectedRole: projectedRole.trim() || 'Role Pending Evaluation',
      offensiveCeiling: 'Projected Translation',
      defensiveCeiling: 'Projected Translation',
      floor: floor.trim() || 'Unspecified Floor',
      ceiling: ceiling.trim() || 'Unspecified Ceiling',
      overallPotential: overallGrade >= 8.5 ? 'Lottery / High First' : overallGrade >= 7.0 ? 'First Round Value' : 'Rotation Flier',
      strengths,
      weaknesses,
      mainConcerns: [],
      playerComparisons,
      overallGrade: Number(overallGrade),
      executiveSummary: executiveSummary.trim(),
    });

    onClose();
    setActiveView('dossier');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#101726] border border-[#233352] rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Create Structured Scouting Report
              </h2>
              <p className="text-xs text-slate-400">
                10-point scale professional evaluation with "Unrated" option & SQLite persistence.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Prospect & Report Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Target Prospect *
              </label>
              <select
                value={prospectId}
                onChange={(e) => setProspectId(e.target.value)}
                required
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {prospects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.primaryPosition} - {p.currentTeam})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Report Type *
              </label>
              <select
                value={reportType}
                onChange={(e) => {
                  const newType = e.target.value as 'Overall Prospect Evaluation' | 'Single Game Report';
                  setReportType(newType);
                  if (newType === 'Overall Prospect Evaluation' && !gameOrEvent) {
                    setGameOrEvent('Season Overview');
                  }
                }}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Overall Prospect Evaluation">Overall Prospect Evaluation</option>
                <option value="Single Game Report">Single Game Report</option>
              </select>
            </div>
          </div>

          {/* Evaluation Date, Competition & Confidence Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Evaluation Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Competition Filter
              </label>
              <select
                value={competition}
                onChange={(e) => setCompetition(e.target.value as 'NCAA D1' | 'NBA G League')}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="NCAA D1">NCAA D1</option>
                <option value="NBA G League">NBA G League</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Confidence Level
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value) as ConfidenceLevel)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {CONFIDENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Evaluation Title / Game Name & Opponent / Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                {reportType === 'Overall Prospect Evaluation' ? 'Evaluation Title' : 'Game / Event Name'}
              </label>
              <input
                type="text"
                value={gameOrEvent}
                onChange={(e) => setGameOrEvent(e.target.value)}
                placeholder={
                  reportType === 'Overall Prospect Evaluation'
                    ? 'e.g. Season Overview'
                    : 'e.g. Duke vs North Carolina / Showcase'
                }
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Opponent / Context {reportType === 'Overall Prospect Evaluation' ? '(Optional)' : ''}
              </label>
              <input
                type="text"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder={
                  reportType === 'Overall Prospect Evaluation'
                    ? 'Optional — e.g. Early Season Sample, Non-Conference'
                    : 'e.g. Kentucky / Rip City Remix'
                }
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 5-Category Sliders with 10-point scale + Unrated Option */}
          <div className="p-4 rounded-lg bg-[#131B2A] border border-[#1E283F] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2A40] pb-2.5">
              <div>
                <h3 className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                  Core Category Ratings (1.0 to 10.0 Scale)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Toggle "Unrated" for categories not yet observed.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={calculateAutoOverall}
                  className="px-2 py-0.5 rounded bg-[#1A263D] hover:bg-[#223250] text-[10px] font-mono text-slate-300 border border-[#283C5E]"
                  title="Average of rated categories"
                >
                  ⚡ Auto-Average
                </button>
                <span className="text-[11px] font-bold text-slate-300 uppercase">Overall:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={overallGrade}
                  onChange={(e) => setOverallGrade(Number(e.target.value))}
                  className="w-16 bg-[#182337] border border-amber-500/40 rounded px-2 py-0.5 font-mono font-bold text-amber-400 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
              {[
                {
                  label: 'Physical',
                  val: physicalGrade,
                  setVal: setPhysicalGrade,
                  rated: physicalRated,
                  setRated: setPhysicalRated,
                },
                {
                  label: 'Offense',
                  val: offensiveGrade,
                  setVal: setOffensiveGrade,
                  rated: offensiveRated,
                  setRated: setOffensiveRated,
                },
                {
                  label: 'Defense',
                  val: defensiveGrade,
                  setVal: setDefensiveGrade,
                  rated: defensiveRated,
                  setRated: setDefensiveRated,
                },
                {
                  label: 'B-Ball IQ',
                  val: bballIqGrade,
                  setVal: setBballIqGrade,
                  rated: bballIqRated,
                  setRated: setBballIqRated,
                },
                {
                  label: 'Mentality',
                  val: mentalityGrade,
                  setVal: setMentalityGrade,
                  rated: mentalityRated,
                  setRated: setMentalityRated,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`p-2.5 rounded border transition-colors ${
                    item.rated
                      ? 'bg-[#172236] border-[#23334F]'
                      : 'bg-[#111722] border-dashed border-[#1C283F] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-300">
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => item.setRated(!item.rated)}
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                        item.rated
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.rated ? 'Rated' : 'Unrated'}
                    </button>
                  </div>

                  <div className="text-base font-bold font-mono my-1 tabular-nums text-center">
                    {item.rated ? (
                      <span className="text-amber-400">{item.val.toFixed(1)}</span>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </div>

                  {item.rated ? (
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={item.val}
                      onChange={(e) => item.setVal(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  ) : (
                    <div className="h-5 flex items-center justify-center text-[10px] text-slate-500 italic">
                      Unrated category
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Detailed Sub-Skills Ratings */}
          <div className="rounded-lg bg-[#111827] border border-[#1E293B] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDetailedGrades(!showDetailedGrades)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-[#152033] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Optional Sub-Skills Breakdown (18 Traits)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span>{showDetailedGrades ? 'Hide' : 'Expand'}</span>
                {showDetailedGrades ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showDetailedGrades && (
              <div className="p-4 border-t border-[#1E293B] bg-[#0E1523] space-y-4">
                <p className="text-[10px] text-slate-400">
                  Fine-tune detailed traits from 1 to 10. Click any unrated trait to assign a grade.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Physical Traits */}
                  <div className="space-y-2.5 bg-[#121B2C] p-3 rounded border border-[#1F2C46]">
                    <div className="text-[10px] uppercase font-bold text-amber-400">Physical & Athletic</div>
                    {[
                      { key: 'size', label: 'Size & Frame' },
                      { key: 'mobility', label: 'Lateral Mobility' },
                      { key: 'explosiveness', label: 'Explosiveness' },
                      { key: 'strength', label: 'Functional Strength' },
                    ].map((trait) => (
                      <div key={trait.key} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-300">{trait.label}</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {subSkills[trait.key] ? `${subSkills[trait.key]?.toFixed(1)}` : 'Unrated'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={subSkills[trait.key] || 0}
                          onChange={(e) =>
                            handleSubSkillChange(
                              trait.key,
                              Number(e.target.value) === 0 ? null : Number(e.target.value)
                            )
                          }
                          className="w-full accent-amber-500 cursor-pointer h-1"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Offensive Traits */}
                  <div className="space-y-2.5 bg-[#121B2C] p-3 rounded border border-[#1F2C46]">
                    <div className="text-[10px] uppercase font-bold text-amber-400">Offensive Traits</div>
                    {[
                      { key: 'shooting', label: 'Shooting Touch' },
                      { key: 'threePointShooting', label: '3PT Range & Volume' },
                      { key: 'finishing', label: 'Finishing at Rim' },
                      { key: 'rimPressure', label: 'Rim Pressure' },
                      { key: 'passing', label: 'Passing Delivery' },
                      { key: 'ballHandling', label: 'Handle in Traffic' },
                    ].map((trait) => (
                      <div key={trait.key} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-300">{trait.label}</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {subSkills[trait.key] ? `${subSkills[trait.key]?.toFixed(1)}` : 'Unrated'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={subSkills[trait.key] || 0}
                          onChange={(e) =>
                            handleSubSkillChange(
                              trait.key,
                              Number(e.target.value) === 0 ? null : Number(e.target.value)
                            )
                          }
                          className="w-full accent-amber-500 cursor-pointer h-1"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Defense & IQ Traits */}
                  <div className="space-y-2.5 bg-[#121B2C] p-3 rounded border border-[#1F2C46]">
                    <div className="text-[10px] uppercase font-bold text-amber-400">Defense, IQ & Motor</div>
                    {[
                      { key: 'pointOfAttackDefense', label: 'Point-of-Attack' },
                      { key: 'perimeterDefense', label: 'Perimeter Defense' },
                      { key: 'rimProtection', label: 'Rim Protection' },
                      { key: 'courtVision', label: 'Court Vision' },
                      { key: 'decisionMakingGeneral', label: 'Decision Making' },
                      { key: 'motor', label: 'Defensive Motor' },
                    ].map((trait) => (
                      <div key={trait.key} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-300">{trait.label}</span>
                          <span className="font-mono text-amber-400 font-bold">
                            {subSkills[trait.key] ? `${subSkills[trait.key]?.toFixed(1)}` : 'Unrated'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={subSkills[trait.key] || 0}
                          onChange={(e) =>
                            handleSubSkillChange(
                              trait.key,
                              Number(e.target.value) === 0 ? null : Number(e.target.value)
                            )
                          }
                          className="w-full accent-amber-500 cursor-pointer h-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* NBA Projection Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                NBA Archetype
              </label>
              <input
                type="text"
                value={nbaArchetype}
                onChange={(e) => setNbaArchetype(e.target.value)}
                placeholder="e.g. High-Post Playmaking Hub / 3&D Wing"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Projected Role
              </label>
              <input
                type="text"
                value={projectedRole}
                onChange={(e) => setProjectedRole(e.target.value)}
                placeholder="e.g. Primary Initiator / High-Leverage Closer"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Floor
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. Quality starting connector / 7th man"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Ceiling
              </label>
              <input
                type="text"
                value={ceiling}
                onChange={(e) => setCeiling(e.target.value)}
                placeholder="e.g. All-NBA First Team Anchor / Primary Option"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Strengths (comma-separated)
              </label>
              <input
                type="text"
                value={strengthsText}
                onChange={(e) => setStrengthsText(e.target.value)}
                placeholder="e.g. Court vision, Finishing through contact, High motor"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Weaknesses (comma-separated)
              </label>
              <input
                type="text"
                value={weaknessesText}
                onChange={(e) => setWeaknessesText(e.target.value)}
                placeholder="e.g. Free throw mechanics, Screen navigation"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Player Comparisons (comma-separated)
            </label>
            <input
              type="text"
              value={comparisonsText}
              onChange={(e) => setComparisonsText(e.target.value)}
              placeholder="e.g. Paolo Banchero, Boris Diaw"
              className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Executive Summary */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Executive Scout Summary *
            </label>
            <textarea
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              rows={3}
              required
              placeholder="Synthesize the prospect's feel, decision speed, frame projection, and translation to the modern NBA game..."
              className="w-full bg-[#141C2E] border border-[#23314D] rounded p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-[#162134] hover:bg-[#1E2B43] text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-sm"
            >
              Save Scouting Report to SQLite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
