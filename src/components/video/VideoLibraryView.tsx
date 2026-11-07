import React, { useState } from 'react';
import { Film, Plus, Play, ExternalLink, Trash2, Edit } from 'lucide-react';
import { useScouting } from '../../context/ScoutingContext';
import { VideoTimestamp } from '../../types/scouting';
import { collectClipMarkers, groupVideoClips, parseTimeToSeconds } from '../../lib/videoTime';
import { FilmSequencePlayer } from './FilmSequencePlayer';
import { VideoClipEditor } from './VideoClipEditor';

export const VideoLibraryView: React.FC = () => {
  const { videos, prospects, addVideoClip, deleteVideoClip, openProspect } = useScouting();
  const libraryVideos = groupVideoClips(videos);

  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  // Form states
  const [prospectId, setProspectId] = useState(prospects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Pick and Roll, Finishing, Defense');

  // Timestamps builder
  const [timestamps, setTimestamps] = useState<VideoTimestamp[]>([
    { seconds: 34, label: '00:34', note: 'Read the weakside trap and skipped to corner' },
  ]);
  const [newTsLabel, setNewTsLabel] = useState('');
  const [newTsNote, setNewTsNote] = useState('');

  const handleAddTimestamp = () => {
    if (!newTsLabel.trim() || !newTsNote.trim()) return;
    const seconds = parseTimeToSeconds(newTsLabel) ?? 0;
    setTimestamps((prev) => [
      ...prev,
      { seconds, label: newTsLabel.trim(), note: newTsNote.trim() },
    ]);
    setNewTsLabel('');
    setNewTsNote('');
  };

  const handleRemoveTimestamp = (idx: number) => {
    setTimestamps((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectId || !title.trim() || !videoUrl.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const trimmedDescription = description.trim();
    addVideoClip({
      prospectId,
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      platform: videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? 'youtube' : 'other',
      description: trimmedDescription || undefined,
      tags,
      timestamps: collectClipMarkers({ timestamps, description: trimmedDescription }),
    });

    setIsAddingVideo(false);
    setTitle('');
    setVideoUrl('');
    setDescription('');
  };

  return (
    <div className="min-h-full w-full px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Film className="w-5 h-5 text-amber-400" />
            <span>Video Library & Timestamp Notes</span>
            <span className="text-sm font-mono font-medium text-slate-400">
              ({libraryVideos.length} clips recorded)
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Film study database with clickable timestamps for precise possession analysis.
          </p>
        </div>

        <button
          onClick={() => setIsAddingVideo(!isAddingVideo)}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-md transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isAddingVideo ? 'Cancel' : 'Add Video Breakdown'}</span>
        </button>
      </div>

      {/* New Video Form */}
      {isAddingVideo && (
        <form onSubmit={handleSubmit} className="bg-[#111827] border border-amber-500/40 rounded-lg p-6 space-y-4 text-sm shadow-xl">
          <h2 className="text-base font-bold uppercase tracking-wider text-amber-400">
            Log New Video Film Study
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm uppercase font-bold text-slate-400 mb-1">
                Target Prospect *
              </label>
              <select
                value={prospectId}
                onChange={(e) => setProspectId(e.target.value)}
                required
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {prospects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.primaryPosition} - {p.currentTeam})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm uppercase font-bold text-slate-400 mb-1">
                Video Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kentucky vs Auburn — Transition & Isolation Defense"
                required
                className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm uppercase font-bold text-slate-400 mb-1">
              Video URL (YouTube or Replay Link) *
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              className="w-full bg-[#141C2E] border border-[#23314D] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm uppercase font-bold text-slate-400 mb-1">
              Description / Film Context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Focus of film session: rim pressure, weakside defensive help rotations..."
              className="w-full bg-[#141C2E] border border-[#23314D] rounded p-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Timestamps Builder */}
          <div className="p-4 rounded-lg bg-[#131B2A] border border-[#1E283F] space-y-3">
            <h3 className="text-sm uppercase font-bold text-amber-400 tracking-wider">
              Timestamped Observations
            </h3>

            {/* List of current timestamps */}
            <div className="space-y-2">
              {timestamps.map((ts, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-[#182337] border border-[#23334F]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-sm">
                      {ts.label}
                    </span>
                    <span className="text-slate-200">{ts.note}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTimestamp(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add timestamp row */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1C263B]">
              <input
                type="text"
                value={newTsLabel}
                onChange={(e) => setNewTsLabel(e.target.value)}
                placeholder="02:15"
                className="w-20 bg-[#141C2E] border border-[#23314D] rounded px-2.5 py-1.5 font-mono text-center text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                value={newTsNote}
                onChange={(e) => setNewTsNote(e.target.value)}
                placeholder="Observation (e.g. Sharp backdoor cut, weak rotation)"
                className="flex-1 bg-[#141C2E] border border-[#23314D] rounded px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddTimestamp}
                className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold rounded"
              >
                + Add Stamp
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingVideo(false)}
              className="px-4 py-2 bg-[#182337] text-slate-300 rounded font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
            >
              Save Video Film
            </button>
          </div>
        </form>
      )}

      {/* Videos List */}
      {libraryVideos.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#111827] border border-[#1E293B] rounded-lg">
          <Film className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
          <p className="text-sm font-medium">No video cutups recorded</p>
          <p className="text-sm text-slate-400 mt-1">
            Add YouTube or game film links with timestamped observations.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {libraryVideos.map((vid) => {
            const p = prospects.find((item) => item.id === vid.prospectId);
            return (
              <div
                key={vid.id}
                className="bg-[#111827] border border-[#1E293B] hover:border-slate-700 rounded-lg p-6 space-y-4 shadow-lg transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Play className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                        <span>{vid.title}</span>
                      </h3>
                    </div>
                    {p && (
                      <button
                        onClick={() => openProspect(p.id, 'video')}
                        className="text-sm text-amber-400 hover:underline mt-1 block"
                      >
                        Prospect: {p.firstName} {p.lastName} ({p.primaryPosition} · {p.currentTeam})
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setEditingVideoId(vid.id)}
                      className="px-2.5 py-1.5 bg-[#182337] hover:bg-[#1E2B47] text-slate-200 border border-[#253450] rounded text-sm font-semibold inline-flex items-center gap-1.5"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        for (const id of vid.sourceIds) deleteVideoClip(id);
                      }}
                      className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-sm font-semibold inline-flex items-center gap-1.5"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open External Video</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <FilmSequencePlayer
                  videoUrl={vid.videoUrl}
                  description={vid.description}
                  timestamps={vid.timestamps}
                />
              </div>
            );
          })}
        </div>
      )}

      <VideoClipEditor
        clip={libraryVideos.find((video) => video.sourceIds.includes(editingVideoId || '')) || null}
        onClose={() => setEditingVideoId(null)}
      />
    </div>
  );
};
