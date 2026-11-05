import React, { useState } from 'react';
import { X, Plus, User, Ruler } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { Position, ProspectStatus, LeagueCategory } from '../../types/scouting';

interface NewProspectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProspectModal: React.FC<NewProspectModalProps> = ({ isOpen, onClose }) => {
  const { addProspect, setActiveView } = useScouting();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [primaryPos, setPrimaryPos] = useState<Position>('SF');
  const [secondaryPos, setSecondaryPos] = useState<Position | ''>('');
  const [team, setTeam] = useState('');
  const [league, setLeague] = useState<LeagueCategory>('NCAA D1');
  const [birthDate, setBirthDate] = useState('2007-06-15');
  const [nationality, setNationality] = useState('USA');
  const [birthCountry, setBirthCountry] = useState('USA');

  // Measurements
  const [heightFeet, setHeightFeet] = useState(6);
  const [heightInches, setHeightInches] = useState(8);
  const [weightLbs, setWeightLbs] = useState(215);
  const [wingspanFeet, setWingspanFeet] = useState(7);
  const [wingspanInches, setWingspanInches] = useState(0);
  const [reachFeet, setReachFeet] = useState(8);
  const [reachInches, setReachInches] = useState(10);

  const [status, setStatus] = useState<ProspectStatus>('To Observe');
  const [tagsInput, setTagsInput] = useState('Perimeter Wing, Class of 2027');

  if (!isOpen) return null;

  // Calculate Draft Age at June 2027 draft
  const calculateDraftAge = (dob: string) => {
    try {
      const birth = new Date(dob);
      const draftDate = new Date('2027-06-24');
      const diffTime = draftDate.getTime() - birth.getTime();
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      return Math.round(diffYears * 10) / 10;
    } catch {
      return 19.5;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !team.trim()) return;

    const totalHeightInches = Number(heightFeet) * 12 + Number(heightInches);
    const totalWingspanInches = Number(wingspanFeet) * 12 + Number(wingspanInches);
    const totalReachInches = Number(reachFeet) * 12 + Number(reachInches);

    const draftAge = calculateDraftAge(birthDate);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addProspect({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate,
      draftYear: 2027,
      draftAge,
      nationality: nationality.trim() || 'USA',
      birthCountry: birthCountry.trim() || 'USA',
      measurements: {
        heightInches: totalHeightInches,
        heightFormatted: `${heightFeet}'${heightInches}"`,
        weightLbs: Number(weightLbs),
        wingspanInches: totalWingspanInches,
        wingspanFormatted: `${wingspanFeet}'${wingspanInches}"`,
        standingReachInches: totalReachInches,
        standingReachFormatted: `${reachFeet}'${reachInches}"`,
      },
      primaryPosition: primaryPos,
      secondaryPosition: secondaryPos ? secondaryPos : undefined,
      currentTeam: team.trim(),
      currentLeague: league,
      status,
      tags,
    });

    onClose();
    setActiveView('dossier');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#101726] border border-[#233352] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              +
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Add New Prospect
              </h2>
              <p className="text-xs text-slate-400">
                Register a new prospect into your local scouting database (Class of 2027).
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
          {/* Name & Positions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Darryn"
                required
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Peterson"
                required
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Positions & Team */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Primary Position *
              </label>
              <select
                value={primaryPos}
                onChange={(e) => setPrimaryPos(e.target.value as Position)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="PG">Point Guard (PG)</option>
                <option value="SG">Shooting Guard (SG)</option>
                <option value="SF">Small Forward (SF)</option>
                <option value="PF">Power Forward (PF)</option>
                <option value="C">Center (C)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Secondary Position
              </label>
              <select
                value={secondaryPos}
                onChange={(e) => setSecondaryPos(e.target.value as any)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">None</option>
                <option value="PG">PG</option>
                <option value="SG">SG</option>
                <option value="SF">SF</option>
                <option value="PF">PF</option>
                <option value="C">C</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Scout Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProspectStatus)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="To Observe">To Observe</option>
                <option value="Watchlist">Watchlist</option>
                <option value="In Evaluation">In Evaluation</option>
                <option value="Evaluated">Evaluated</option>
                <option value="Draft Board">Draft Board</option>
                <option value="Cut">Cut / Archive</option>
              </select>
            </div>
          </div>

          {/* Current Team & Competition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Current Team / Program *
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="e.g. Duke / Gonzaga / Ignite"
                required
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                League / Competition
              </label>
              <select
                value={league}
                onChange={(e) => setLeague(e.target.value as LeagueCategory)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="NCAA D1">NCAA D1 (Division I)</option>
                <option value="NBA G League">NBA G League</option>
              </select>
            </div>
          </div>

          {/* Physical Tools Section */}
          <div className="p-4 rounded-lg bg-[#131B2B] border border-[#1E283F] space-y-3">
            <h3 className="text-[11px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" />
              <span>Physical Tools & Anthropometrics</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Height */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Height
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={5}
                    max={7}
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(Number(e.target.value))}
                    className="w-12 bg-[#182338] border border-[#233452] rounded px-2 py-1 text-center font-mono text-white"
                  />
                  <span className="text-slate-400">ft</span>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={heightInches}
                    onChange={(e) => setHeightInches(Number(e.target.value))}
                    className="w-12 bg-[#182338] border border-[#233452] rounded px-2 py-1 text-center font-mono text-white"
                  />
                  <span className="text-slate-400">in</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  min={140}
                  max={330}
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Number(e.target.value))}
                  className="w-full bg-[#182338] border border-[#233452] rounded px-2 py-1 font-mono text-white"
                />
              </div>

              {/* Wingspan */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Wingspan
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={5}
                    max={8}
                    value={wingspanFeet}
                    onChange={(e) => setWingspanFeet(Number(e.target.value))}
                    className="w-12 bg-[#182338] border border-[#233452] rounded px-2 py-1 text-center font-mono text-white"
                  />
                  <span className="text-slate-400">ft</span>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={wingspanInches}
                    onChange={(e) => setWingspanInches(Number(e.target.value))}
                    className="w-12 bg-[#182338] border border-[#233452] rounded px-2 py-1 text-center font-mono text-white"
                  />
                  <span className="text-slate-400">in</span>
                </div>
              </div>

              {/* Standing Reach */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Standing Reach
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={7}
                    max={10}
                    value={reachFeet}
                    onChange={(e) => setReachFeet(Number(e.target.value))}
                    className="w-12 bg-[#182338] border border-[#233452] rounded px-2 py-1 text-center font-mono text-white"
                  />
                  <span className="text-slate-400">ft</span>
                  <input
                    type="number"
                    min={0}
                    max={11}
                    value={reachInches}
                    onChange={(e) => setReachInches(Number(e.target.value))}
                    className="w-12 bg-[#182338] border border-[#233452] rounded px-2 py-1 text-center font-mono text-white"
                  />
                  <span className="text-slate-400">in</span>
                </div>
              </div>
            </div>
          </div>

          {/* DOB & Nationality */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-1.5 font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Nationality
              </label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Draft Age (2027)
              </label>
              <div className="px-3 py-1.5 rounded bg-[#162136] border border-[#22314E] font-mono text-amber-400 font-bold">
                {calculateDraftAge(birthDate)} years old
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Scouting Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Elite Shooter, Rim Protector, High IQ, Floor General"
              className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
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
              Register Prospect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
