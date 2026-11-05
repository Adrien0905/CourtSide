import type Database from 'better-sqlite3';
import { mergeIncomingSeason, normalizeSeasonLabel, dedupeSeasonStats, type SeasonStatRow } from '../src/lib/seasonStats.ts';

export interface ImportedSeason {
  season: string;
  team: string;
  league: string;
  gp: number | null;
  mpg: number | null;
  ppg: number | null;
  rpg: number | null;
  orpg: number | null;
  drpg: number | null;
  apg: number | null;
  spg: number | null;
  bpg: number | null;
  tov: number | null;
  fgPct: number | null;
  fg3Pct: number | null;
  ftPct: number | null;
  fgm: number | null;
  fga: number | null;
  fg3m: number | null;
  fg3a: number | null;
  ftm: number | null;
  fta: number | null;
  tsPct: number | null;
  efgPct: number | null;
  usgPct: number | null;
  astPct: number | null;
  tovPct: number | null;
  orbPct: number | null;
  drbPct: number | null;
  trbPct: number | null;
  stlPct: number | null;
  blkPct: number | null;
  ortg: number | null;
  drtg: number | null;
  bpm: number | null;
  source: string;
}

export interface ImportedProspect {
  firstName: string;
  lastName: string;
  draftYear: number;
  draftAge: number | null;
  birthDate: string;
  nationality: string;
  birthCountry: string;
  heightInches: number | null;
  heightFormatted: string;
  weightLbs: number | null;
  wingspanInches: number | null;
  wingspanFormatted: string;
  primaryPosition: string;
  secondaryPosition: string | null;
  currentTeam: string;
  currentLeague: string;
  classOrYear: string;
  status: string;
  tags: string[];
  avatarUrl: string;
  externalCbbId: string | null;
  externalCbdId: string | null;
  sourceProvider: string;
  season: ImportedSeason | null;
}

export interface CsvImportIssue {
  row: number;
  message: string;
}

export interface CsvImportSummary {
  created: number;
  updated: number;
  skipped: number;
  errors: CsvImportIssue[];
}

const CSV_HEADERS = [
  'first_name',
  'last_name',
  'draft_year',
  'birth_date',
  'nationality',
  'position',
  'secondary_position',
  'team',
  'league',
  'height',
  'weight_lbs',
  'wingspan',
  'class_year',
  'status',
  'tags',
  'season',
  'gp',
  'mpg',
  'ppg',
  'rpg',
  'orpg',
  'drpg',
  'apg',
  'spg',
  'bpg',
  'tov',
  'fg_pct',
  'fg3_pct',
  'ft_pct',
  'ts_pct',
  'efg_pct',
  'usg_pct',
  'ast_pct',
  'bpm',
  'source',
] as const;

const HEADER_ALIASES: Record<string, string> = {
  first: 'first_name',
  firstname: 'first_name',
  prenom: 'first_name',
  last: 'last_name',
  lastname: 'last_name',
  nom: 'last_name',
  player: 'name',
  player_name: 'name',
  full_name: 'name',
  draftyear: 'draft_year',
  year: 'draft_year',
  dob: 'birth_date',
  birthdate: 'birth_date',
  pos: 'position',
  primary_position: 'position',
  secondary: 'secondary_position',
  club: 'team',
  current_team: 'team',
  school: 'team',
  competition: 'league',
  current_league: 'league',
  ht: 'height',
  height_in: 'height',
  wt: 'weight_lbs',
  weight: 'weight_lbs',
  ws: 'wingspan',
  class: 'class_year',
  eligibility_year: 'class_year',
  fg: 'fg_pct',
  fg_percentage: 'fg_pct',
  fg3: 'fg3_pct',
  three_pt_pct: 'fg3_pct',
  '3p_pct': 'fg3_pct',
  '3pt_pct': 'fg3_pct',
  ft: 'ft_pct',
  ft_percentage: 'ft_pct',
  ts: 'ts_pct',
  efg: 'efg_pct',
  usg: 'usg_pct',
  usage: 'usg_pct',
  ast_rate: 'ast_pct',
};

const STATUSES = new Set([
  'Watchlist',
  'To Observe',
  'In Evaluation',
  'Evaluated',
  'Draft Board',
  'Cut',
]);

export function csvTemplate(): string {
  const comments = [
    '# COURTSIDE import for non-NCAA leagues. Required columns: first_name, last_name, league.',
    '# Leagues: Overtime Elite, International Pro, High School / Prep, G-League, NCAA D-II/III, Other.',
    '# Europe, EuroLeague, ACB, NBL and FIBA map to International Pro. OTE maps to Overtime Elite. EYBL and prep map to High School / Prep.',
    '# Height accepts 6\'7", 6-7 or inches. Shooting percentages accept 0.468 or 46.8. Leave unknown stats blank.',
  ];
  return `${comments.join('\n')}\n${CSV_HEADERS.join(',')}\n`;
}

export function normalizeLeague(raw: string): string | null {
  const text = raw.trim().toLowerCase().replace(/[_/]+/g, ' ').replace(/\s+/g, ' ');
  if (!text) return null;
  if (['overtime elite', 'overtime', 'ote'].includes(text)) return 'Overtime Elite';
  if (
    [
      'international pro',
      'international',
      'europe',
      'euro',
      'euroleague',
      'euro league',
      'eurocup',
      'acb',
      'nbl',
      'fiba',
      'liga acb',
      'bbl',
      'lnb',
      'pro a',
      'pro b',
    ].includes(text) ||
    text.includes('euro') ||
    text.includes('fiba')
  ) {
    return 'International Pro';
  }
  if (
    ['high school / prep', 'high school', 'hs', 'prep', 'eybl', 'nike eybl', '3ssb', 'u18'].includes(text) ||
    text.includes('high school') ||
    text.includes('prep')
  ) {
    return 'High School / Prep';
  }
  if (['g-league', 'g league', 'gleague', 'nba g league', 'nba g-league'].includes(text)) return 'G-League';
  if (['ncaa d-ii/iii', 'ncaa d2', 'ncaa d3', 'ncaa d-ii', 'ncaa d-iii', 'ncaa ii', 'ncaa iii', 'd2', 'd3'].includes(text)) {
    return 'NCAA D-II/III';
  }
  if (['ncaa d1', 'ncaa d-i', 'ncaa', 'ncaa division i'].includes(text)) return 'NCAA D1';
  if (text === 'other') return 'Other';
  return null;
}

export function parseHeightToInches(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value >= 60 && value <= 100) return Math.round(value);
    if (value > 140 && value < 250) return Math.round(value / 2.54);
    return null;
  }
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text) return null;
  const feet = text.match(/(\d+)\s*['′]\s*(\d{1,2})/);
  if (feet) return Number(feet[1]) * 12 + Number(feet[2]);
  const dashed = text.match(/^(\d)\s*[-–]\s*(\d{1,2})$/);
  if (dashed) return Number(dashed[1]) * 12 + Number(dashed[2]);
  const cm = text.match(/^(\d{3}(?:\.\d+)?)\s*cm$/i);
  if (cm) return Math.round(Number(cm[1]) / 2.54);
  const numeric = Number(text);
  if (Number.isFinite(numeric)) return parseHeightToInches(numeric);
  return null;
}

export function formatInches(inches: number | null): string {
  if (inches == null || !Number.isFinite(inches)) return '';
  const whole = Math.round(inches);
  const feet = Math.floor(whole / 12);
  const remainder = whole % 12;
  return `${feet}'${remainder}"`;
}

/** Shooting splits are stored as 0–1 fractions, matching the dossier. */
export function toShotFraction(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (Math.abs(value) > 1.5) return value / 100;
  return value;
}

/** Usage and rebound rates are stored as percent points (21.8), matching existing manual stats. */
export function toRatePoints(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (Math.abs(value) <= 1) return Math.round(value * 1000) / 10;
  return value;
}

export function finiteOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/%$/, '').trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function parseCsvTable(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  const source = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((entry) => entry.some((value) => value.trim() !== '') && !entry[0].trim().startsWith('#'));
}

function headerKey(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[%]+/g, '').replace(/[\s-]+/g, '_');
  return HEADER_ALIASES[normalized] || normalized;
}

function splitDisplayName(name: string): { firstName: string; lastName: string } | null {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

function emptySeason(league: string, team: string, season: string, source: string): ImportedSeason {
  return {
    season,
    team,
    league,
    gp: null,
    mpg: null,
    ppg: null,
    rpg: null,
    orpg: null,
    drpg: null,
    apg: null,
    spg: null,
    bpg: null,
    tov: null,
    fgPct: null,
    fg3Pct: null,
    ftPct: null,
    fgm: null,
    fga: null,
    fg3m: null,
    fg3a: null,
    ftm: null,
    fta: null,
    tsPct: null,
    efgPct: null,
    usgPct: null,
    astPct: null,
    tovPct: null,
    orbPct: null,
    drbPct: null,
    trbPct: null,
    stlPct: null,
    blkPct: null,
    ortg: null,
    drtg: null,
    bpm: null,
    source,
  };
}

export function parseProspectCsv(text: string): { prospects: ImportedProspect[]; errors: CsvImportIssue[] } {
  const table = parseCsvTable(text);
  if (table.length === 0) {
    return { prospects: [], errors: [{ row: 0, message: 'The CSV file is empty.' }] };
  }
  const headers = table[0].map(headerKey);
  const prospects: ImportedProspect[] = [];
  const errors: CsvImportIssue[] = [];

  for (let index = 1; index < table.length; index += 1) {
    const cells = table[index];
    const record: Record<string, string> = {};
    headers.forEach((header, cellIndex) => {
      record[header] = (cells[cellIndex] || '').trim();
    });
    const rowNumber = index + 1;
    let firstName = record.first_name || '';
    let lastName = record.last_name || '';
    if ((!firstName || !lastName) && record.name) {
      const split = splitDisplayName(record.name);
      if (split) {
        firstName = firstName || split.firstName;
        lastName = lastName || split.lastName;
      }
    }
    if (!firstName || !lastName) {
      errors.push({ row: rowNumber, message: 'First name and last name are required.' });
      continue;
    }
    const league = normalizeLeague(record.league || '');
    if (!league) {
      errors.push({
        row: rowNumber,
        message: `Unrecognized league "${record.league || ''}". Use Overtime Elite, International Pro, High School / Prep, G-League, NCAA D-II/III, or Other.`,
      });
      continue;
    }

    const heightInches = parseHeightToInches(record.height || '');
    const wingspanInches = parseHeightToInches(record.wingspan || '');
    const weight = finiteOrNull(record.weight_lbs);
    const draftYear = finiteOrNull(record.draft_year);
    const status = STATUSES.has(record.status) ? record.status : '';
    const source = record.source || 'CSV Import';
    const seasonLabel = normalizeSeasonLabel(record.season) || record.season || '';
    const statValues = [
      record.gp, record.mpg, record.ppg, record.rpg, record.orpg, record.drpg,
      record.apg, record.spg, record.bpg, record.tov, record.fg_pct, record.fg3_pct, record.ft_pct,
      record.ts_pct, record.efg_pct, record.usg_pct, record.ast_pct, record.bpm,
    ];
    const hasStats = Boolean(seasonLabel) || statValues.some((value) => value.trim() !== '');
    let season: ImportedSeason | null = null;
    if (hasStats) {
      season = emptySeason(league, record.team || '', seasonLabel || 'Unknown', source);
      season.gp = finiteOrNull(record.gp);
      season.mpg = finiteOrNull(record.mpg);
      season.ppg = finiteOrNull(record.ppg);
      season.rpg = finiteOrNull(record.rpg);
      season.orpg = finiteOrNull(record.orpg);
      season.drpg = finiteOrNull(record.drpg);
      season.apg = finiteOrNull(record.apg);
      season.spg = finiteOrNull(record.spg);
      season.bpg = finiteOrNull(record.bpg);
      season.tov = finiteOrNull(record.tov);
      season.fgPct = toShotFraction(finiteOrNull(record.fg_pct));
      season.fg3Pct = toShotFraction(finiteOrNull(record.fg3_pct));
      season.ftPct = toShotFraction(finiteOrNull(record.ft_pct));
      season.tsPct = toShotFraction(finiteOrNull(record.ts_pct));
      season.efgPct = toShotFraction(finiteOrNull(record.efg_pct));
      season.usgPct = toRatePoints(finiteOrNull(record.usg_pct));
      season.astPct = toRatePoints(finiteOrNull(record.ast_pct));
      season.bpm = finiteOrNull(record.bpm);
    }

    prospects.push({
      firstName,
      lastName,
      draftYear: draftYear && draftYear >= 2020 && draftYear <= 2040 ? draftYear : 2027,
      draftAge: null,
      birthDate: record.birth_date || '',
      nationality: record.nationality || '',
      birthCountry: record.birth_country || '',
      heightInches,
      heightFormatted: formatInches(heightInches),
      weightLbs: weight,
      wingspanInches,
      wingspanFormatted: formatInches(wingspanInches),
      primaryPosition: (record.position || '').toUpperCase(),
      secondaryPosition: record.secondary_position ? record.secondary_position.toUpperCase() : null,
      currentTeam: record.team || '',
      currentLeague: league,
      classOrYear: record.class_year || '',
      status,
      tags: (record.tags || '').split(/[|;]/).map((tag) => tag.trim()).filter(Boolean),
      avatarUrl: '',
      externalCbbId: null,
      externalCbdId: null,
      sourceProvider: 'csv',
      season,
    });
  }

  return { prospects, errors };
}

function csvEscape(value: unknown): string {
  if (value == null) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function shotForCsv(value: unknown): string {
  if (value == null || value === '') return '';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '';
  return String(Math.round(numeric * 1000) / 1000);
}

export function exportProspectsCsv(db: Database.Database): string {
  const prospects = db.prepare('SELECT * FROM prospects ORDER BY last_name COLLATE NOCASE, first_name COLLATE NOCASE').all() as Record<string, unknown>[];
  const statStmt = db.prepare('SELECT * FROM season_stats WHERE prospect_id = ? ORDER BY season DESC LIMIT 1');
  const lines = [CSV_HEADERS.join(',')];

  for (const prospect of prospects) {
    const stat = statStmt.get(prospect.id) as Record<string, unknown> | undefined;
    let tags: string[] = [];
    if (typeof prospect.tags === 'string' && prospect.tags) {
      try {
        const parsed = JSON.parse(prospect.tags) as unknown;
        tags = Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        tags = [];
      }
    }
    const values = [
      prospect.first_name,
      prospect.last_name,
      prospect.draft_year,
      prospect.birth_date,
      prospect.nationality,
      prospect.primary_position,
      prospect.secondary_position,
      prospect.current_team,
      prospect.current_league,
      prospect.height_formatted || prospect.height_inches || '',
      prospect.weight_lbs || '',
      prospect.wingspan_formatted || prospect.wingspan_inches || '',
      prospect.class_or_year,
      prospect.status,
      tags.join('|'),
      stat?.season || '',
      stat?.gp ?? '',
      stat?.mpg ?? '',
      stat?.ppg ?? '',
      stat?.rpg ?? '',
      stat?.orpg ?? '',
      stat?.drpg ?? '',
      stat?.apg ?? '',
      stat?.spg ?? '',
      stat?.bpg ?? '',
      stat?.tov ?? '',
      shotForCsv(stat?.fg_pct),
      shotForCsv(stat?.fg3_pct),
      shotForCsv(stat?.ft_pct),
      shotForCsv(stat?.ts_pct),
      shotForCsv(stat?.efg_pct),
      stat?.usg_pct ?? '',
      stat?.ast_pct ?? '',
      stat?.bpm ?? '',
      stat?.source || prospect.source_provider || '',
    ];
    lines.push(values.map(csvEscape).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function seasonStatValues(prospectId: string, row: Record<string, unknown>, now: string) {
  return [
    prospectId,
    normalizeSeasonLabel(row.season) || row.season,
    row.team ?? null,
    row.league ?? null,
    row.gp ?? null,
    row.mpg ?? null,
    row.ppg ?? null,
    row.rpg ?? null,
    row.orpg ?? null,
    row.drpg ?? null,
    row.apg ?? null,
    row.spg ?? null,
    row.bpg ?? null,
    row.tov ?? null,
    row.fg_pct ?? null,
    row.fg3_pct ?? null,
    row.ft_pct ?? null,
    row.fgm ?? null,
    row.fga ?? null,
    row.fg3m ?? null,
    row.fg3a ?? null,
    row.ftm ?? null,
    row.fta ?? null,
    row.ts_pct ?? null,
    row.efg_pct ?? null,
    row.usg_pct ?? null,
    row.ast_pct ?? null,
    row.tov_pct ?? null,
    row.orb_pct ?? null,
    row.drb_pct ?? null,
    row.trb_pct ?? null,
    row.stl_pct ?? null,
    row.blk_pct ?? null,
    row.ortg ?? null,
    row.drtg ?? null,
    row.bpm ?? null,
    row.source ?? null,
    now,
  ];
}

const SEASON_STAT_UPDATE = `
  UPDATE season_stats SET
    prospect_id = ?, season = ?, team = ?, league = ?, gp = ?, mpg = ?, ppg = ?, rpg = ?, orpg = ?, drpg = ?,
    apg = ?, spg = ?, bpg = ?, tov = ?, fg_pct = ?, fg3_pct = ?, ft_pct = ?, fgm = ?, fga = ?, fg3m = ?, fg3a = ?,
    ftm = ?, fta = ?, ts_pct = ?, efg_pct = ?, usg_pct = ?, ast_pct = ?, tov_pct = ?, orb_pct = ?, drb_pct = ?,
    trb_pct = ?, stl_pct = ?, blk_pct = ?, ortg = ?, drtg = ?, bpm = ?, source = ?, updated_at = ?
  WHERE id = ?
`;

function importedSeasonToRow(season: ImportedSeason, team: string, league: string): Record<string, unknown> {
  return {
    season: normalizeSeasonLabel(season.season) || season.season,
    team: season.team || team,
    league: season.league || league,
    gp: season.gp,
    mpg: season.mpg,
    ppg: season.ppg,
    rpg: season.rpg,
    orpg: season.orpg,
    drpg: season.drpg,
    apg: season.apg,
    spg: season.spg,
    bpg: season.bpg,
    tov: season.tov,
    fg_pct: season.fgPct,
    fg3_pct: season.fg3Pct,
    ft_pct: season.ftPct,
    fgm: season.fgm,
    fga: season.fga,
    fg3m: season.fg3m,
    fg3a: season.fg3a,
    ftm: season.ftm,
    fta: season.fta,
    ts_pct: season.tsPct,
    efg_pct: season.efgPct,
    usg_pct: season.usgPct,
    ast_pct: season.astPct,
    tov_pct: season.tovPct,
    orb_pct: season.orbPct,
    drb_pct: season.drbPct,
    trb_pct: season.trbPct,
    stl_pct: season.stlPct,
    blk_pct: season.blkPct,
    ortg: season.ortg,
    drtg: season.drtg,
    bpm: season.bpm,
    source: season.source,
  };
}

function saveSeasonStat(
  db: Database.Database,
  prospectId: string,
  season: ImportedSeason,
  team: string,
  league: string,
  now: string
) {
  const incoming = importedSeasonToRow(season, team, league);
  const seasonKey = String(incoming.season);
  const existing = db.prepare('SELECT * FROM season_stats WHERE prospect_id = ?').all(prospectId) as Record<string, unknown>[];
  const related = existing.filter((row) => (normalizeSeasonLabel(row.season) || row.season) === seasonKey);
  const merged = mergeIncomingSeason<SeasonStatRow>(
    related.map((row) => ({ ...row, season: seasonKey, id: row.id == null ? undefined : String(row.id) })),
    { ...incoming, season: seasonKey }
  );
  const keepId = merged.id && related.some((row) => row.id === merged.id)
    ? String(merged.id)
    : `stat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const values = seasonStatValues(prospectId, merged as unknown as Record<string, unknown>, now);
  if (related.some((row) => row.id === keepId)) {
    db.prepare(SEASON_STAT_UPDATE).run(...values, keepId);
  } else {
    db.prepare(`
      INSERT INTO season_stats (
        id, prospect_id, season, team, league, gp, mpg, ppg, rpg, orpg, drpg, apg, spg, bpg, tov,
        fg_pct, fg3_pct, ft_pct, fgm, fga, fg3m, fg3a, ftm, fta, ts_pct, efg_pct, usg_pct, ast_pct,
        tov_pct, orb_pct, drb_pct, trb_pct, stl_pct, blk_pct, ortg, drtg, bpm, source, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(keepId, ...values);
  }
  for (const row of related) {
    if (row.id !== keepId) db.prepare('DELETE FROM season_stats WHERE id = ?').run(row.id);
  }
}

export function loadCollapsedSeasonStats(db: Database.Database, prospectId: string) {
  const rows = db.prepare('SELECT * FROM season_stats WHERE prospect_id = ?').all(prospectId) as Record<string, unknown>[];
  const collapsed = dedupeSeasonStats(rows.map((row) => ({ ...row, id: String(row.id), season: String(row.season ?? '') })));
  const changed = collapsed.length !== rows.length
    || rows.some((row) => normalizeSeasonLabel(row.season) !== row.season);
  if (!changed) {
    return rows.sort((a, b) => String(b.season).localeCompare(String(a.season)));
  }
  const now = new Date().toISOString();
  const keepIds = new Set<string>();
  const write = db.transaction(() => {
    for (const row of collapsed) {
      const keepId = row.id && rows.some((existing) => existing.id === row.id)
        ? String(row.id)
        : `stat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      keepIds.add(keepId);
      const values = seasonStatValues(prospectId, row, now);
      if (rows.some((existing) => existing.id === keepId)) {
        db.prepare(SEASON_STAT_UPDATE).run(...values, keepId);
      } else {
        db.prepare(`
          INSERT INTO season_stats (
            id, prospect_id, season, team, league, gp, mpg, ppg, rpg, orpg, drpg, apg, spg, bpg, tov,
            fg_pct, fg3_pct, ft_pct, fgm, fga, fg3m, fg3a, ftm, fta, ts_pct, efg_pct, usg_pct, ast_pct,
            tov_pct, orb_pct, drb_pct, trb_pct, stl_pct, blk_pct, ortg, drtg, bpm, source, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `).run(keepId, ...values);
      }
    }
    for (const row of rows) {
      if (!keepIds.has(String(row.id))) db.prepare('DELETE FROM season_stats WHERE id = ?').run(row.id);
    }
  });
  write();
  return db.prepare('SELECT * FROM season_stats WHERE prospect_id = ? ORDER BY season DESC').all(prospectId);
}

export function upsertImportedProspect(db: Database.Database, input: ImportedProspect): { action: 'created' | 'updated'; id: string } {
  const now = new Date().toISOString();
  const byExternal = input.externalCbbId
    ? db.prepare('SELECT * FROM prospects WHERE external_cbb_id = ?').get(input.externalCbbId)
    : input.externalCbdId
      ? db.prepare('SELECT * FROM prospects WHERE external_cbd_id = ?').get(input.externalCbdId)
      : undefined;
  const byName = db.prepare(
    `SELECT * FROM prospects
     WHERE lower(first_name) = lower(?) AND lower(last_name) = lower(?) AND lower(current_league) = lower(?)
     LIMIT 1`
  ).get(input.firstName, input.lastName, input.currentLeague);
  const existing = (byExternal || byName) as Record<string, unknown> | undefined;

  let id: string;
  let action: 'created' | 'updated';
  if (!existing) {
    id = `prospect-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    action = 'created';
    db.prepare(`
      INSERT INTO prospects (
        id, first_name, last_name, avatar_url, birth_date, draft_year, draft_age,
        nationality, birth_country, height_inches, height_formatted, weight_lbs,
        wingspan_inches, wingspan_formatted, standing_reach_inches, standing_reach_formatted,
        primary_position, secondary_position, current_team, current_league,
        previous_teams, class_or_year, eligibility_status, status, tags,
        external_cbb_id, external_cbd_id, source_provider,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )
    `).run(
      id,
      input.firstName,
      input.lastName,
      input.avatarUrl || '',
      input.birthDate || '',
      input.draftYear || 2027,
      input.draftAge,
      input.nationality || '',
      input.birthCountry || '',
      input.heightInches,
      input.heightFormatted || '',
      input.weightLbs,
      input.wingspanInches,
      input.wingspanFormatted || '',
      null,
      '',
      input.primaryPosition || '',
      input.secondaryPosition,
      input.currentTeam || '',
      input.currentLeague,
      '[]',
      input.classOrYear || '',
      '',
      input.status || 'To Observe',
      JSON.stringify(input.tags || []),
      input.externalCbbId,
      input.externalCbdId,
      input.sourceProvider,
      now,
      now
    );
  } else {
    id = String(existing.id);
    action = 'updated';
    const tags = input.tags.length > 0 ? JSON.stringify(input.tags) : null;
    db.prepare(`
      UPDATE prospects SET
        avatar_url = COALESCE(?, avatar_url),
        birth_date = COALESCE(?, birth_date),
        draft_year = COALESCE(?, draft_year),
        draft_age = COALESCE(?, draft_age),
        nationality = COALESCE(?, nationality),
        birth_country = COALESCE(?, birth_country),
        height_inches = COALESCE(?, height_inches),
        height_formatted = COALESCE(?, height_formatted),
        weight_lbs = COALESCE(?, weight_lbs),
        wingspan_inches = COALESCE(?, wingspan_inches),
        wingspan_formatted = COALESCE(?, wingspan_formatted),
        primary_position = COALESCE(?, primary_position),
        secondary_position = COALESCE(?, secondary_position),
        current_team = COALESCE(?, current_team),
        current_league = COALESCE(?, current_league),
        class_or_year = COALESCE(?, class_or_year),
        status = COALESCE(?, status),
        tags = COALESCE(?, tags),
        external_cbb_id = COALESCE(?, external_cbb_id),
        external_cbd_id = COALESCE(?, external_cbd_id),
        source_provider = COALESCE(?, source_provider),
        updated_at = ?
      WHERE id = ?
    `).run(
      blankToNull(input.avatarUrl),
      blankToNull(input.birthDate),
      input.sourceProvider === 'csv' ? input.draftYear : null,
      input.draftAge,
      blankToNull(input.nationality),
      blankToNull(input.birthCountry),
      input.heightInches,
      blankToNull(input.heightFormatted),
      input.weightLbs,
      input.wingspanInches,
      blankToNull(input.wingspanFormatted),
      blankToNull(input.primaryPosition),
      input.secondaryPosition,
      blankToNull(input.currentTeam),
      blankToNull(input.currentLeague),
      blankToNull(input.classOrYear),
      input.sourceProvider === 'csv' ? blankToNull(input.status) : null,
      tags,
      input.externalCbbId,
      input.externalCbdId,
      blankToNull(input.sourceProvider),
      now,
      id
    );
  }

  if (input.season) {
    saveSeasonStat(db, id, input.season, input.currentTeam, input.currentLeague, now);
  }

  return { action, id };
}

export function importProspectsCsv(db: Database.Database, csv: string): CsvImportSummary {
  const parsed = parseProspectCsv(csv);
  const summary: CsvImportSummary = {
    created: 0,
    updated: 0,
    skipped: parsed.errors.length,
    errors: parsed.errors,
  };
  if (parsed.prospects.length > 500) {
    return {
      created: 0,
      updated: 0,
      skipped: parsed.prospects.length,
      errors: [{ row: 0, message: 'CSV imports are limited to 500 player rows.' }],
    };
  }
  const write = db.transaction(() => {
    for (const prospect of parsed.prospects) {
      const result = upsertImportedProspect(db, prospect);
      if (result.action === 'created') summary.created += 1;
      else summary.updated += 1;
    }
  });
  write();
  return summary;
}
