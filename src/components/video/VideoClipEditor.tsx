import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { VideoTimestamp } from '../../types/scouting';
import { GroupedVideoClip } from '../../lib/videoTime';
import { collectClipMarkers, parseTimeToSeconds } from '../../lib/videoTime';
import { useScouting } from '../../context/ScoutingContext';

interface VideoClipEditorProps {
  clip: GroupedVideoClip | null;
  onClose: () => void;
}

export const VideoClipEditor: React.FC<VideoClipEditorProps> = ({ clip, onClose }) => {
  const { updateVideoClip, deleteVideoClip } = useScouting();
  const [title, setTitle] = useState(clip?.title || '');
  const [videoUrl, setVideoUrl] = useState(clip?.videoUrl || '');
  const [description, setDescription] = useState(clip?.description || '');
  const [timestamps, setTimestamps] = useState<VideoTimestamp[]>(clip?.timestamps || []);
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clip) return;
    setTitle(clip.title);
    setVideoUrl(clip.videoUrl);
    setDescription(clip.description || '');
    setTimestamps(clip.timestamps || []);
    setLabel('');
    setNote('');
    setError('');
  }, [clip?.id]);

  if (!clip) return null;

  const addStamp = () => {
    if (!label.trim() || !note.trim()) return;
    const seconds = parseTimeToSeconds(label) ?? 0;
    setTimestamps((prev) => [
      ...prev,
      { seconds, label: label.trim(), note: note.trim() },
    ]);
    setLabel('');
    setNote('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setError('Le titre et l’URL sont requis.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const nextTimestamps = collectClipMarkers({ timestamps, description });
      await updateVideoClip(clip.id, {
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        platform: videoUrl.includes('youtu') ? 'youtube' : 'other',
        description: description.trim() || undefined,
        timestamps: nextTimestamps,
      });
      const extras = (clip.sourceIds || []).filter((id) => id !== clip.id);
      for (const id of extras) {
        await deleteVideoClip(id);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-[#101726] border border-[#233352] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Edit video clip</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block text-sm text-slate-300 space-y-1">
          <span>Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-slate-300 space-y-1">
          <span>Video URL</span>
          <input
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-slate-300 space-y-1">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white"
          />
        </label>

        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-400">Timestamps</div>
          <ul className="space-y-1.5">
            {timestamps.map((stamp, index) => (
              <li key={`${stamp.label}-${index}`} className="flex items-center gap-2 text-sm">
                <span className="font-mono text-amber-400 w-16 shrink-0">{stamp.label}</span>
                <span className="text-slate-200 flex-1">{stamp.note}</span>
                <button
                  type="button"
                  onClick={() => setTimestamps((prev) => prev.filter((_, item) => item !== index))}
                  className="text-slate-500 hover:text-rose-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="01:30"
              className="w-24 bg-[#141C2E] border border-[#23314D] rounded px-2 py-1.5 font-mono text-white"
            />
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Observation"
              className="flex-1 bg-[#141C2E] border border-[#23314D] rounded px-3 py-1.5 text-white"
            />
            <button type="button" onClick={addStamp} className="px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded">
              Add
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-slate-300">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold rounded-md disabled:opacity-60"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};
