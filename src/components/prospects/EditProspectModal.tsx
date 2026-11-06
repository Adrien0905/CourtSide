import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { Position, Prospect } from '../../types/scouting';

interface EditProspectModalProps {
  prospect: Prospect | null;
  onClose: () => void;
}

function splitMeasure(total?: number, formatted?: string): { feet: number; inches: number } {
  const match = formatted?.match(/(\d+)\s*'\s*(\d+)/);
  if (match) return { feet: Number(match[1]), inches: Number(match[2]) };
  const inchesTotal = Number(total) || 0;
  return { feet: Math.floor(inchesTotal / 12), inches: inchesTotal % 12 };
}

const positions: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

export const EditProspectModal: React.FC<EditProspectModalProps> = ({ prospect, onClose }) => {
  const { updateProspect } = useScouting();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [primaryPos, setPrimaryPos] = useState<Position>('SF');
  const [team, setTeam] = useState('');
  const [heightFeet, setHeightFeet] = useState(0);
  const [heightInches, setHeightInches] = useState(0);
  const [weightLbs, setWeightLbs] = useState(0);
  const [wingspanFeet, setWingspanFeet] = useState(0);
  const [wingspanInches, setWingspanInches] = useState(0);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!prospect) return;
    const height = splitMeasure(prospect.measurements.heightInches, prospect.measurements.heightFormatted);
    const wingspan = splitMeasure(prospect.measurements.wingspanInches, prospect.measurements.wingspanFormatted);
    setFirstName(prospect.firstName);
    setLastName(prospect.lastName);
    setPrimaryPos(prospect.primaryPosition);
    setTeam(prospect.currentTeam);
    setHeightFeet(height.feet);
    setHeightInches(height.inches);
    setWeightLbs(prospect.measurements.weightLbs || 0);
    setWingspanFeet(wingspan.feet);
    setWingspanInches(wingspan.inches);
    setTagsInput(prospect.tags.join(', '));
    setError('');
  }, [prospect]);

  if (!prospect) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !team.trim()) return;
    const heightTotal = Number(heightFeet) * 12 + Number(heightInches);
    const wingspanTotal = Number(wingspanFeet) * 12 + Number(wingspanInches);
    setSaving(true);
    setError('');
    try {
      await updateProspect(prospect.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        primaryPosition: primaryPos,
        currentTeam: team.trim(),
        tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
        measurements: {
          ...prospect.measurements,
          heightInches: heightTotal,
          heightFormatted: `${Number(heightFeet)}'${Number(heightInches)}"`,
          weightLbs: Number(weightLbs) || 0,
          wingspanInches: wingspanTotal,
          wingspanFormatted: `${Number(wingspanFeet)}'${Number(wingspanInches)}"`,
        },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-[#101726] border border-[#233352] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Edit Profile</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="First name" className="bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white" />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Last name" className="bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white" />
          <select value={primaryPos} onChange={(e) => setPrimaryPos(e.target.value as Position)} className="bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white">
            {positions.map((position) => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
          <input value={team} onChange={(e) => setTeam(e.target.value)} required placeholder="Team" className="bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white" />
          <label className="text-slate-400">Height
            <span className="mt-1 flex gap-2">
              <input type="number" min="4" max="8" value={heightFeet} onChange={(e) => setHeightFeet(Number(e.target.value))} className="w-full bg-[#141C2E] border border-[#23314D] rounded px-2 py-2 text-white" />
              <input type="number" min="0" max="11" value={heightInches} onChange={(e) => setHeightInches(Number(e.target.value))} className="w-full bg-[#141C2E] border border-[#23314D] rounded px-2 py-2 text-white" />
            </span>
          </label>
          <label className="text-slate-400">Weight (lbs)
            <input type="number" min="0" value={weightLbs} onChange={(e) => setWeightLbs(Number(e.target.value))} className="mt-1 w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white" />
          </label>
          <label className="col-span-2 text-slate-400">Wingspan
            <span className="mt-1 flex gap-2">
              <input type="number" min="0" max="9" value={wingspanFeet} onChange={(e) => setWingspanFeet(Number(e.target.value))} className="w-full bg-[#141C2E] border border-[#23314D] rounded px-2 py-2 text-white" />
              <input type="number" min="0" max="11" value={wingspanInches} onChange={(e) => setWingspanInches(Number(e.target.value))} className="w-full bg-[#141C2E] border border-[#23314D] rounded px-2 py-2 text-white" />
            </span>
          </label>
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags, comma separated" className="col-span-2 bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white" />
        </div>
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-xs text-slate-300">Cancel</button>
          <button type="submit" disabled={saving} className="px-3 py-2 bg-amber-500 text-slate-950 font-semibold rounded-md text-xs disabled:opacity-60">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
};
