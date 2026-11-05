const COUNTING_KEYS = ['mpg', 'ppg', 'rpg', 'apg', 'spg', 'bpg', 'tov'] as const;

export type CountingStatKey = (typeof COUNTING_KEYS)[number];

export interface SeasonStatRow {
  id?: string;
  season: string;
  source?: string | null;
  mpg?: number | null;
  ppg?: number | null;
  rpg?: number | null;
  apg?: number | null;
  spg?: number | null;
  bpg?: number | null;
  tov?: number | null;
}

/** "20262027" and "2026-2027" both become "2026-27". */
export function normalizeSeasonLabel(value: unknown): string {
  const text = String(value ?? '').trim();
  if (!text) return '';
  const digits = text.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(6)}`;
  }
  if (digits.length === 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  const ranged = text.match(/^(\d{4})\s*[-/–—]\s*(\d{2}|\d{4})$/);
  if (ranged) {
    const end = ranged[2].length === 4 ? ranged[2].slice(-2) : ranged[2];
    return `${ranged[1]}-${end}`;
  }
  return text;
}

export function isCollegeBasketballDataSource(source: unknown): boolean {
  const text = String(source ?? '').trim().toLowerCase();
  return text === 'cbd' || text.includes('college basketball data');
}

function isPresent(value: unknown): boolean {
  return value != null && value !== '';
}

export function hasCountingStats(row: SeasonStatRow): boolean {
  return COUNTING_KEYS.some((key) => isPresent(row[key]));
}

function countingCount(row: SeasonStatRow): number {
  return COUNTING_KEYS.filter((key) => isPresent(row[key])).length;
}

function asRecord(row: SeasonStatRow): Record<string, unknown> {
  return { ...row };
}

function mergeSeasonGroup<T extends SeasonStatRow>(rows: T[]): T {
  const cbd = rows.find((row) => isCollegeBasketballDataSource(row.source) && hasCountingStats(row))
    ?? rows.find((row) => isCollegeBasketballDataSource(row.source));
  const richest = [...rows].sort((a, b) => countingCount(b) - countingCount(a))[0];
  const merged = asRecord(cbd ?? richest);
  for (const row of rows) {
    const record = asRecord(row);
    for (const key of Object.keys(record)) {
      if (merged[key] == null && record[key] != null) merged[key] = record[key];
    }
  }
  if (cbd && hasCountingStats(cbd)) {
    const cbdRecord = asRecord(cbd);
    for (const key of COUNTING_KEYS) {
      if (cbdRecord[key] != null) merged[key] = cbdRecord[key];
    }
    merged.source = cbd.source;
    if (cbd.id) merged.id = cbd.id;
  }
  merged.season = normalizeSeasonLabel(merged.season) || merged.season;
  return merged as T;
}

export function dedupeSeasonStats<T extends SeasonStatRow>(rows: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const season = normalizeSeasonLabel(row.season) || row.season || '';
    const key = season || '__blank__';
    const bucket = groups.get(key) ?? [];
    bucket.push({ ...row, season });
    groups.set(key, bucket);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([, bucket]) => mergeSeasonGroup(bucket));
}

/** A fresh College Basketball Data payload replaces counting stats. Other sources do not override them. */
export function mergeIncomingSeason<T extends SeasonStatRow>(existing: T[], incoming: T): T {
  const season = normalizeSeasonLabel(incoming.season) || incoming.season;
  const related = existing.map((row) => ({ ...row, season: normalizeSeasonLabel(row.season) || row.season }));
  const incomingRow = { ...incoming, season, id: incoming.id };
  const merged = dedupeSeasonStats([...related, { ...incomingRow, id: undefined }])[0];
  const cbdLocked = related.some((row) => isCollegeBasketballDataSource(row.source) && hasCountingStats(row))
    && !isCollegeBasketballDataSource(incoming.source);
  if (cbdLocked) return merged;
  const refreshed = asRecord(merged);
  const incomingRecord = asRecord(incomingRow);
  for (const [key, value] of Object.entries(incomingRecord)) {
    if (key === 'id') continue;
    if (value != null) refreshed[key] = value;
  }
  if (merged.id) refreshed.id = merged.id;
  return refreshed as T;
}
