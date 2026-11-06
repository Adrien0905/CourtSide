import { VideoTimestamp } from '../types/scouting';

const CLOCK = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/;
const INLINE_CLOCK = /(?<![\d:])(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?!:\d)/g;
const NOTE_LINE = /^\s*((?:\d{1,2}:)?\d{1,2}:\d{2})\s*(?:[-–—:]|\s)\s*(.+)$/;

export function parseTimeToSeconds(timeStr: string): number | null {
  const trimmed = timeStr.trim();
  const match = trimmed.match(CLOCK);
  if (!match) return null;
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (seconds > 59) return null;
  if (match[1] != null) {
    if (minutes > 59) return null;
    return Number(match[1]) * 3600 + minutes * 60 + seconds;
  }
  return minutes * 60 + seconds;
}

export function resolveSeconds(marker: { seconds?: number; label?: string }): number {
  if (marker.label) {
    const parsed = parseTimeToSeconds(marker.label);
    if (parsed != null) return parsed;
  }
  const seconds = Number(marker.seconds);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : 0;
}

export function parseTimestampedNotes(text: string): VideoTimestamp[] {
  if (!text.trim()) return [];
  const markers: VideoTimestamp[] = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(NOTE_LINE);
    if (!match) continue;
    const label = match[1];
    const note = match[2].trim();
    const seconds = parseTimeToSeconds(label);
    if (seconds == null || !note) continue;
    markers.push({ seconds, label, note });
  }
  return markers;
}

export function collectClipMarkers(clip: {
  timestamps?: Array<Partial<VideoTimestamp> & { note?: string; notes?: string }>;
  description?: string;
}): VideoTimestamp[] {
  const explicit = (clip.timestamps || [])
    .map((marker) => {
      const label = String(marker.label || '').trim();
      const note = String(marker.note || marker.notes || '').trim();
      if (!label && !note) return null;
      return {
        seconds: resolveSeconds({ seconds: marker.seconds, label }),
        label: label || formatClock(resolveSeconds({ seconds: marker.seconds, label })),
        note,
      };
    })
    .filter((marker): marker is VideoTimestamp => marker != null);

  const merged = [...explicit];
  for (const parsed of parseTimestampedNotes(clip.description || '')) {
    const duplicate = merged.some(
      (marker) => marker.seconds === parsed.seconds && marker.note === parsed.note
    );
    if (!duplicate) merged.push(parsed);
  }

  return merged.sort((a, b) => a.seconds - b.seconds || a.label.localeCompare(b.label));
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) return `${hours}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export interface TimestampToken {
  text: string;
  seconds: number | null;
}

export function splitTimestampTokens(text: string): TimestampToken[] {
  const parts: TimestampToken[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_CLOCK)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: text.slice(last, index), seconds: null });
    const token = match[0];
    parts.push({ text: token, seconds: parseTimeToSeconds(token) });
    last = index + token.length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), seconds: null });
  if (parts.length === 0) parts.push({ text, seconds: null });
  return parts;
}

export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const fromQuery = parsed.searchParams.get('v');
      if (fromQuery) return fromQuery;
      const embed = parsed.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/);
      return embed?.[1] ?? null;
    }
  } catch {
    // Fall through to a loose match for pasted fragments.
  }
  const loose = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{6,})/);
  return loose?.[1] ?? null;
}

export function youtubeWatchUrl(videoId: string, seconds?: number): string {
  const base = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  if (seconds == null || seconds < 0) return base;
  return `${base}&t=${Math.floor(seconds)}s`;
}
