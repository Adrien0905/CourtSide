import React, { useState } from 'react';
import { X, FileSpreadsheet, Star, AlertCircle } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({ isOpen, onClose }) => {
  const { prospects, activeProspect, addReport, setActiveView } = useScouting();

  const [prospectId, setProspectId] = useState(activeProspect?.id || prospects[0]?.id || '');
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [gameOrEvent, setGameOrEvent] = useState('');
  const [competition, setCompetition] = useState('NCAA D1');
  const [opponent, setOpponent] = useState('');
  const [minutesObserved, setMinutesObserved] = useState(30);
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5>(4);

  // 5 core categories (1 to 10 scale)
  const [physicalGrade, setPhysicalGrade] = useState(8.0);
  const [offensiveGrade, setOffensiveGrade] = useState(8.0);
  const [defensiveGrade, setDefensiveGrade] = useState(7.5);
  const [bballIqGrade, setBballIqGrade] = useState(8.5);
  const [mentalityGrade, setMentalityGrade] = useState(8.0);
  const [overallGrade, setOverallGrade] = useState(8.0);

  // Projection
  const [nbaArchetype, setNbaArchetype] = useState('Two-Way Athletic Playmaker');
  const [projectedRole, setProjectedRole] = useState('Starter / High-Usage Creator');
  const [floor, setFloor] = useState('Reliable rotation contributor');
  const [ceiling, setCeiling] = useState('Perennial All-Star');
  const [strengthsText, setStrengthsText] = useState('Open-court vision, quick first step, switchable lateral mobility');
  const [weaknessesText, setWeaknessesText] = useState('Pull-up three consistency, defensive discipline over screens');
  const [comparisonsText, setComparisonsText] = useState('Cade Cunningham, Jalen Johnson');
  const [executiveSummary, setExecutiveSummary] = useState('');

  if (!isOpen) return null;

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

    addReport({
      prospectId,
      reportDate,
      scoutName: 'Lead Scout',
      gameOrEvent: gameOrEvent.trim() || 'Comprehensive Scouting Evaluation',
      competition,
      opponent: opponent.trim() || undefined,
      minutesObserved: Number(minutesObserved),
      confidence,
      categoryGrades: {
        physical: Number(physicalGrade),
        offensive: Number(offensiveGrade),
        defensive: Number(defensiveGrade),
        basketballIq: Number(bballIqGrade),
        mentality: Number(mentalityGrade),
      },
      detailedGrades: {
        size: Math.round(physicalGrade),
        mobility: Math.round(physicalGrade),
        shooting: Math.round(offensiveGrade),
        passing: Math.round(offensiveGrade),
        perimeterDefense: Math.round(defensiveGrade),
        courtVision: Math.round(bballIqGrade),
        competitiveness: Math.round(mentalityGrade),
      },
      nbaArchetype: nbaArchetype.trim(),
      projectedRole: projectedRole.trim(),
      offensiveCeiling: 'High-level creator',
      defensiveCeiling: 'Plus team defender',
      floor: floor.trim(),
      ceiling: ceiling.trim(),
      overallPotential: 'High First Round Value',
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
      <div className="bg-[#101726] border border-[#233352] rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
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
                10-point scale professional evaluation with radar breakdown.
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
          {/* Target Prospect & Context */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Confidence Level (1-5)
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value) as any)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value={5}>5 - Very High (Multi-game live + film)</option>
                <option value={4}>4 - High (Multiple full film games)</option>
                <option value={3}>3 - Moderate (1 full game or showcase)</option>
                <option value={2}>2 - Preliminary (Highlight / cutups)</option>
                <option value={1}>1 - Initial Glance</option>
              </select>
            </div>
          </div>

          {/* Game or Event */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Game / Event Name
              </label>
              <input
                type="text"
                value={gameOrEvent}
                onChange={(e) => setGameOrEvent(e.target.value)}
                placeholder="e.g. Peach Jam Semifinals / Duke vs North Carolina"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Opponent / Context
              </label>
              <input
                type="text"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="e.g. Kentucky / Overtime City Reapers"
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 5-Category Sliders (1 to 10) */}
          <div className="p-4 rounded-lg bg-[#131B2A] border border-[#1E283F] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                Scouting Category Ratings (1 to 10 Scale)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Overall Grade:</span>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={overallGrade}
                  onChange={(e) => setOverallGrade(Number(e.target.value))}
                  className="w-16 bg-[#182337] border border-amber-500/40 rounded px-2 py-0.5 font-mono font-bold text-amber-400 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {[
                { label: 'Physical', val: physicalGrade, setVal: setPhysicalGrade },
                { label: 'Offense', val: offensiveGrade, setVal: setOffensiveGrade },
                { label: 'Defense', val: defensiveGrade, setVal: setDefensiveGrade },
                { label: 'B-Ball IQ', val: bballIqGrade, setVal: setBballIqGrade },
                { label: 'Mentality', val: mentalityGrade, setVal: setMentalityGrade },
              ].map((item) => (
                <div key={item.label} className="p-2.5 rounded bg-[#172236] border border-[#23334F] text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-300">{item.label}</div>
                  <div className="text-base font-bold font-mono text-amber-400 my-1 tabular-nums">
                    {item.val.toFixed(1)}
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={item.val}
                    onChange={(e) => item.setVal(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
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
                placeholder="e.g. Quality starting connector"
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
                placeholder="e.g. All-NBA First Team Anchor"
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
              placeholder="Synthesize the prospect's feel, decision speed, frame projection, and overall translation to the modern NBA game..."
              className="w-full bg-[#141C2E] border border-[#23314D] rounded p-3 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
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
              Save Scouting Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
