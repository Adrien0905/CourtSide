import { VideoClip, VideoTimestamp } from '../types/scouting';

const CLOCK = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/;
const CLOCK_BODY = '(?:\\d{1,2}:)?\\d{1,2}:\\d{2}';
const INLINE_CLOCK = /(?<![\d:])(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?!:\d)/g;
const INLINE_RANGE_OR_CLOCK = new RegExp(
  `(?<![\\d:])(?:(${CLOCK_BODY})\\s*[-–—]\\s*(${CLOCK_BODY})|(${CLOCK_BODY}))(?!:\\d)`,
  'g'
);
const RANGE_LINE = new RegExp(`^(${CLOCK_BODY})\\s*[-–—]\\s*(${CLOCK_BODY})$`);
const RANGE_NOTE = new RegExp(
  `^\\s*(${CLOCK_BODY})\\s*[-–—]\\s*(${CLOCK_BODY})\\s*(?:[-–—:]|\\s)\\s*(.+)$`
);
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

export function parseTimeRange(timeStr: string): { start: number; end: number } | null {
  const match = timeStr.trim().match(RANGE_LINE);
  if (!match) return null;
  const start = parseTimeToSeconds(match[1]);
  const end = parseTimeToSeconds(match[2]);
  if (start == null || end == null || end <= start) return null;
  return { start, end };
}

export function formatRangeLabel(start: number, end?: number | null): string {
  if (end != null && end > start) return `${formatClock(start)} - ${formatClock(end)}`;
  return formatClock(start);
}

export function createTimestamp(startRaw: string, endRaw: string, note: string): VideoTimestamp | null {
  const noteText = note.trim();
  const startText = startRaw.trim();
  const endText = endRaw.trim();
  if (!noteText || !startText) return null;

  if (!endText) {
    const range = parseTimeRange(startText);
    if (range) {
      return {
        seconds: range.start,
        endSeconds: range.end,
        label: formatRangeLabel(range.start, range.end),
        note: noteText,
      };
    }
    const start = parseTimeToSeconds(startText);
    if (start == null) return null;
    return { seconds: start, label: formatClock(start), note: noteText };
  }

  const start = parseTimeToSeconds(startText);
  const end = parseTimeToSeconds(endText);
  if (start == null || end == null || end <= start) return null;
  return {
    seconds: start,
    endSeconds: end,
    label: formatRangeLabel(start, end),
    note: noteText,
  };
}

export function summaryDescription(text: string): string {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim() && !RANGE_NOTE.test(line) && !NOTE_LINE.test(line))
    .join('\n')
    .trim();
}

export function parseTimestampedNotes(text: string): VideoTimestamp[] {
  if (!text.trim()) return [];
  const markers: VideoTimestamp[] = [];
  for (const line of text.split(/\r?\n/)) {
    const range = line.match(RANGE_NOTE);
    if (range) {
      const start = parseTimeToSeconds(range[1]);
      const end = parseTimeToSeconds(range[2]);
      const note = range[3].trim();
      if (start == null || end == null || end <= start || !note) continue;
      markers.push({
        seconds: start,
        endSeconds: end,
        label: formatRangeLabel(start, end),
        note,
      });
      continue;
    }
    const match = line.match(NOTE_LINE);
    if (!match) continue;
    const label = match[1];
    const note = match[2].trim();
    const seconds = parseTimeToSeconds(label);
    if (seconds == null || !note || parseTimeToSeconds(note) != null) continue;
    markers.push({ seconds, label: formatClock(seconds), note });
  }
  return markers;
}

export function collectClipMarkers(clip: {
  timestamps?: Array<Partial<VideoTimestamp> & { note?: string; notes?: string }>;
  description?: string;
}): VideoTimestamp[] {
  const explicit = (clip.timestamps || [])
    .map((marker) => {
      const rawLabel = String(marker.label || '').trim();
      const note = String(marker.note || marker.notes || '').trim();
      if (!rawLabel && !note) return null;
      const fromLabel = parseTimeRange(rawLabel);
      const seconds = fromLabel?.start ?? resolveSeconds({ seconds: marker.seconds, label: rawLabel });
      const endCandidate = Number(marker.endSeconds ?? fromLabel?.end);
      const endSeconds = Number.isFinite(endCandidate) && endCandidate > seconds ? endCandidate : undefined;
      return {
        seconds,
        ...(endSeconds != null ? { endSeconds } : {}),
        label: formatRangeLabel(seconds, endSeconds),
        note,
      };
    })
    .filter((marker): marker is VideoTimestamp => marker != null);

  const clockWeight = (value: string) => {
    if (parseTimeRange(value)) return 1;
    INLINE_CLOCK.lastIndex = 0;
    return [...value.matchAll(INLINE_CLOCK)].length;
  };
  const singles = explicit.filter((marker) => clockWeight(marker.label) <= 1);
  const kept = singles.length > 0 ? singles : explicit;

  const merged = [...kept];
  for (const parsed of parseTimestampedNotes(clip.description || '')) {
    const duplicate = merged.some(
      (marker) =>
        marker.seconds === parsed.seconds &&
        (marker.endSeconds ?? null) === (parsed.endSeconds ?? null) &&
        marker.note === parsed.note
    );
    if (!duplicate) merged.push(parsed);
  }

  return merged.sort((a, b) => a.seconds - b.seconds || a.label.localeCompare(b.label));
}

export interface GroupedVideoClip extends VideoClip {
  sourceIds: string[];
}

export function groupVideoClips(clips: VideoClip[]): GroupedVideoClip[] {
  const order: string[] = [];
  const groups = new Map<string, GroupedVideoClip>();

  for (const clip of clips) {
    const youtubeId = extractYouTubeId(clip.videoUrl);
    const key = youtubeId || clip.videoUrl.trim();
    const markers = collectClipMarkers(clip);
    const current = groups.get(key);

    if (!current) {
      order.push(key);
      groups.set(key, {
        ...clip,
        videoUrl: youtubeId ? youtubeWatchUrl(youtubeId) : clip.videoUrl,
        timestamps: markers,
        sourceIds: [clip.id],
      });
      continue;
    }

    const description = [current.description, clip.description].filter(Boolean).join('\n');
    current.timestamps = collectClipMarkers({
      timestamps: [...current.timestamps, ...markers],
      description,
    });
    const summary = [summaryDescription(current.description || ''), summaryDescription(clip.description || '')]
      .filter(Boolean)
      .filter((line, index, all) => all.indexOf(line) === index)
      .join('\n');
    if (summary) current.description = summary;
    current.sourceIds.push(clip.id);
  }

  return order.map((key) => groups.get(key)!);
}

export const LOOP_WINDOW_SECONDS = 6;

export interface LoopWindow {
  start: number;
  end: number;
}

export function loopWindow(startTime: number, endTime?: number | null, seconds = LOOP_WINDOW_SECONDS): LoopWindow {
  const start = Math.max(0, startTime);
  const end = endTime != null && endTime > start ? endTime : start + seconds;
  return { start, end };
}

export type LoopTick = 'wait' | 'arm' | 'restart' | 'release';

const LOOP_EXIT_GRACE = 2.5;

export function evaluateLoopTick(currentTime: number, loop: LoopWindow, armed: boolean): LoopTick {
  if (currentTime >= loop.end) {
    return currentTime <= loop.end + LOOP_EXIT_GRACE ? 'restart' : 'release';
  }
  if (currentTime < loop.start - 1) return 'release';
  if (!armed && currentTime >= loop.start - 0.35) return 'arm';
  return 'wait';
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
  endSeconds?: number | null;
}

export function splitTimestampTokens(text: string): TimestampToken[] {
  const parts: TimestampToken[] = [];
  let last = 0;
  INLINE_RANGE_OR_CLOCK.lastIndex = 0;
  for (const match of text.matchAll(INLINE_RANGE_OR_CLOCK)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: text.slice(last, index), seconds: null });
    const token = match[0];
    if (match[1] && match[2]) {
      const start = parseTimeToSeconds(match[1]);
      const end = parseTimeToSeconds(match[2]);
      parts.push({
        text: token,
        seconds: start,
        endSeconds: start != null && end != null && end > start ? end : null,
      });
    } else {
      parts.push({ text: token, seconds: parseTimeToSeconds(match[3] || token) });
    }
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
