import type { Express, Request, Response } from 'express';
import type Database from 'better-sqlite3';
import {
  finiteOrNull,
  formatInches,
  parseHeightToInches,
  toRatePoints,
  toShotFraction,
  upsertImportedProspect,
  type ImportedProspect,
  type ImportedSeason,
} from './csvEngine.ts';

const CBB_BASE = () => (process.env.CBB_STATS_BASE_URL || 'https://stats-cbb.com').replace(/\/$/, '');
const CBD_BASE = () => (process.env.CBBD_BASE_URL || 'https://api.collegebasketballdata.com').replace(/\/$/, '');
const CACHE_TTL_MS = () => {
  const hours = Number(process.env.NCAA_CACHE_TTL_HOURS || 6);
  return (Number.isFinite(hours) && hours > 0 ? hours : 6) * 60 * 60 * 1000;
};

export interface NcaaSearchHit {
  provider: 'cbb' | 'cbd';
  externalId: string;
  name: string;
  team: string;
  position: string;
  season: number | null;
  imageUrl: string;
}

function cbdKey(): string {
  const key = (process.env.CBBD_API_KEY || '').trim();
  if (!key || key === 'MY_CBBD_API_KEY' || key.startsWith('your-')) return '';
  return key;
}

function logSync(
  db: Database.Database,
  entry: { provider: string; endpoint: string; status: string; message: string; records: number }
) {
  db.prepare(`
    INSERT INTO sync_logs (id, provider, endpoint, status, message, records_synced, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entry.provider,
    entry.endpoint,
    entry.status,
    entry.message.slice(0, 500),
    entry.records,
    new Date().toISOString()
  );
}

function readCache(db: Database.Database, cacheKey: string): { payload: unknown; fetchedAt: string; fresh: boolean } | null {
  const row = db.prepare('SELECT payload, fetched_at, expires_at FROM ncaa_cache WHERE cache_key = ?').get(cacheKey) as
    | { payload: string; fetched_at: string; expires_at: string }
    | undefined;
  if (!row) return null;
  try {
    return {
      payload: JSON.parse(row.payload),
      fetchedAt: row.fetched_at,
      fresh: Date.parse(row.expires_at) > Date.now(),
    };
  } catch {
    return null;
  }
}

function writeCache(
  db: Database.Database,
  cacheKey: string,
  provider: string,
  kind: string,
  query: string,
  externalId: string,
  payload: unknown
) {
  const fetchedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS()).toISOString();
  db.prepare(`
    INSERT INTO ncaa_cache (cache_key, provider, kind, query, external_id, payload, fetched_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(cache_key) DO UPDATE SET
      payload = excluded.payload,
      query = excluded.query,
      external_id = excluded.external_id,
      fetched_at = excluded.fetched_at,
      expires_at = excluded.expires_at
  `).run(cacheKey, provider, kind, query, externalId, JSON.stringify(payload), fetchedAt, expiresAt);
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<{ status: number; data: unknown }> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'COURTSIDE-local', ...headers },
    signal: AbortSignal.timeout(15000),
  });
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text.slice(0, 240) };
    }
  }
  if (!response.ok) {
    const message = data && typeof data === 'object' && data && 'message' in data
      ? String((data as { message: unknown }).message)
      : `Upstream HTTP ${response.status}`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return { status: response.status, data };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function pickNumber(source: Record<string, unknown> | undefined, keys: string[]): number | null {
  if (!source) return null;
  for (const key of keys) {
    const value = finiteOrNull(source[key]);
    if (value != null) return value;
  }
  return null;
}

function seasonLabel(endYear: number): string {
  return `${endYear - 1}-${String(endYear).slice(-2)}`;
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: 'Unknown', lastName: 'Player' };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

function mapPosition(raw: string): { primary: string; secondary: string | null } {
  const text = raw.toUpperCase();
  if (text.includes('PURE PG') || text.includes('SCORING PG')) return { primary: 'PG', secondary: null };
  if (text.includes('COMBO')) return { primary: 'SG', secondary: 'PG' };
  if (text.includes('WING G')) return { primary: 'SG', secondary: 'SF' };
  if (text.includes('WING F')) return { primary: 'SF', secondary: 'PF' };
  const found = ['PG', 'SG', 'SF', 'PF', 'C'].filter((token) => text.split(/[^A-Z]+/).includes(token));
  if (found.length > 0) return { primary: found[0], secondary: found[1] || null };
  if (text.includes('GUARD') || text === 'G') return { primary: 'SG', secondary: null };
  if (text.includes('FORWARD') || text === 'F') return { primary: 'SF', secondary: null };
  if (text.includes('CENTER')) return { primary: 'C', secondary: null };
  return { primary: '', secondary: null };
}

function perGame(total: number | null, games: number | null): number | null {
  if (total == null || games == null || games <= 0) return null;
  return Math.round((total / games) * 10) / 10;
}

function nestedCount(source: Record<string, unknown>, key: string, field: string): number | null {
  return pickNumber(asRecord(source[key]), [field]);
}

function mapCbbPlayer(raw: Record<string, unknown>): ImportedProspect {
  const stats = asRecord(raw.stats);
  const growth = asRecord(raw.statsGrowth);
  const seasonYear = finiteOrNull(raw.season) || new Date().getFullYear();
  const position = mapPosition(String(raw.position || raw.rosterPosition || ''));
  const heightInches = finiteOrNull(raw.heightInches) ?? parseHeightToInches(raw.height);
  const names = splitName(String(raw.name || ''));
  const seasonRows = Array.isArray(raw.seasons) ? raw.seasons.map((item) => asRecord(item)) : [];
  const matchingSeason = seasonRows.find((row) => finiteOrNull(row.season) === seasonYear);
  const gp = pickNumber(stats, ['G', 'GP']) ?? (matchingSeason ? pickNumber(matchingSeason, ['G', 'GP']) : null);
  const season: ImportedSeason = {
    season: seasonLabel(seasonYear),
    team: String(raw.team || ''),
    league: 'NCAA D1',
    gp,
    mpg: pickNumber(stats, ['MPG']),
    ppg: pickNumber(stats, ['PPG']),
    rpg: pickNumber(stats, ['RPG']),
    orpg: pickNumber(stats, ['ORPG']),
    drpg: pickNumber(stats, ['DRPG']),
    apg: pickNumber(stats, ['APG']),
    spg: pickNumber(stats, ['SPG']),
    bpg: pickNumber(stats, ['BPG']),
    tov: pickNumber(stats, ['TOPG', 'TOV']),
    fgPct: toShotFraction(pickNumber(stats, ['FG'])),
    fg3Pct: toShotFraction(pickNumber(stats, ['3P', '3PT']) ?? pickNumber(growth, ['3P'])),
    ftPct: toShotFraction(pickNumber(stats, ['FT']) ?? pickNumber(growth, ['FT'])),
    fgm: null,
    fga: null,
    fg3m: null,
    fg3a: null,
    ftm: null,
    fta: null,
    tsPct: toShotFraction(pickNumber(stats, ['TS']) ?? pickNumber(growth, ['TS'])),
    efgPct: toShotFraction(pickNumber(stats, ['eFG', 'EFG']) ?? pickNumber(growth, ['eFG'])),
    usgPct: toRatePoints(pickNumber(stats, ['Usg', 'USG']) ?? pickNumber(growth, ['Usg'])),
    astPct: toRatePoints(pickNumber(growth, ['ARate'])),
    tovPct: toRatePoints(pickNumber(growth, ['TO'])),
    orbPct: toRatePoints(pickNumber(growth, ['OR'])),
    drbPct: toRatePoints(pickNumber(growth, ['DR'])),
    trbPct: null,
    stlPct: null,
    blkPct: null,
    ortg: pickNumber(stats, ['ORTG']) ?? pickNumber(growth, ['ORTG']),
    drtg: pickNumber(stats, ['DRTG']) ?? pickNumber(growth, ['DRTG']),
    bpm: pickNumber(stats, ['BPM']) ?? pickNumber(growth, ['BPM']),
    source: 'CBB Stats',
  };
  return {
    firstName: names.firstName,
    lastName: names.lastName,
    draftYear: 2027,
    draftAge: null,
    birthDate: '',
    nationality: '',
    birthCountry: '',
    heightInches,
    heightFormatted: formatInches(heightInches),
    weightLbs: null,
    wingspanInches: null,
    wingspanFormatted: '',
    primaryPosition: position.primary,
    secondaryPosition: position.secondary,
    currentTeam: String(raw.team || ''),
    currentLeague: 'NCAA D1',
    classOrYear: String(raw.year || ''),
    status: 'To Observe',
    tags: [],
    avatarUrl: String(raw.imageUrl || ''),
    externalCbbId: String(raw.id || ''),
    externalCbdId: null,
    sourceProvider: 'cbb',
    season,
  };
}

function mapCbdPlayer(player: Record<string, unknown>, stat: Record<string, unknown> | undefined, seasonYear: number, team: string): ImportedProspect {
  const names = splitName(String(player.name || `${player.firstName || ''} ${player.lastName || ''}`));
  const position = mapPosition(String(player.position || stat?.position || ''));
  const heightInches = parseHeightToInches(player.height);
  const games = pickNumber(stat, ['games']);
  const rebounds = asRecord(stat?.rebounds);
  const season: ImportedSeason = {
    season: String(stat?.seasonLabel || seasonLabel(seasonYear)),
    team: String(stat?.team || team),
    league: 'NCAA D1',
    gp: games,
    mpg: perGame(pickNumber(stat, ['minutes']), games),
    ppg: pickNumber(stat, ['pointsPerGame']) ?? perGame(pickNumber(stat, ['points']), games),
    rpg: perGame(pickNumber(rebounds, ['total']) ?? pickNumber(stat, ['rebounds']), games),
    orpg: perGame(pickNumber(rebounds, ['offensive']), games),
    drpg: perGame(pickNumber(rebounds, ['defensive']), games),
    apg: perGame(pickNumber(stat, ['assists']), games),
    spg: perGame(pickNumber(stat, ['steals']), games),
    bpg: perGame(pickNumber(stat, ['blocks']), games),
    tov: perGame(pickNumber(stat, ['turnovers']), games),
    fgPct: toShotFraction(nestedCount(stat || {}, 'fieldGoals', 'pct')),
    fg3Pct: toShotFraction(nestedCount(stat || {}, 'threePointFieldGoals', 'pct')),
    ftPct: toShotFraction(nestedCount(stat || {}, 'freeThrows', 'pct')),
    fgm: perGame(nestedCount(stat || {}, 'fieldGoals', 'made'), games),
    fga: perGame(nestedCount(stat || {}, 'fieldGoals', 'attempted'), games),
    fg3m: perGame(nestedCount(stat || {}, 'threePointFieldGoals', 'made'), games),
    fg3a: perGame(nestedCount(stat || {}, 'threePointFieldGoals', 'attempted'), games),
    ftm: perGame(nestedCount(stat || {}, 'freeThrows', 'made'), games),
    fta: perGame(nestedCount(stat || {}, 'freeThrows', 'attempted'), games),
    tsPct: toShotFraction(pickNumber(stat, ['trueShootingPct'])),
    efgPct: toShotFraction(pickNumber(stat, ['effectiveFieldGoalPct'])),
    usgPct: toRatePoints(pickNumber(stat, ['usage'])),
    astPct: null,
    tovPct: null,
    orbPct: toRatePoints(pickNumber(stat, ['offensiveReboundPct'])),
    drbPct: null,
    trbPct: null,
    stlPct: null,
    blkPct: null,
    ortg: pickNumber(stat, ['offensiveRating']),
    drtg: pickNumber(stat, ['defensiveRating']),
    bpm: null,
    source: 'College Basketball Data',
  };
  const hometown = asRecord(player.hometown);
  return {
    firstName: String(player.firstName || names.firstName),
    lastName: String(player.lastName || names.lastName),
    draftYear: 2027,
    draftAge: null,
    birthDate: String(player.dateOfBirth || ''),
    nationality: '',
    birthCountry: String(hometown.country || ''),
    heightInches,
    heightFormatted: formatInches(heightInches),
    weightLbs: finiteOrNull(player.weight),
    wingspanInches: null,
    wingspanFormatted: '',
    primaryPosition: position.primary,
    secondaryPosition: position.secondary,
    currentTeam: team,
    currentLeague: 'NCAA D1',
    classOrYear: '',
    status: 'To Observe',
    tags: [],
    avatarUrl: '',
    externalCbbId: null,
    externalCbdId: String(player.id || stat?.athleteId || ''),
    sourceProvider: 'cbd',
    season: stat ? season : null,
  };
}

function hitsFromCbb(data: unknown): NcaaSearchHit[] {
  const results = Array.isArray(asRecord(data).results) ? asRecord(data).results as unknown[] : [];
  return results.slice(0, 10).map((item) => {
    const row = asRecord(item);
    return {
      provider: 'cbb' as const,
      externalId: String(row.id || ''),
      name: String(row.name || ''),
      team: String(row.team || ''),
      position: String(row.position || ''),
      season: finiteOrNull(row.season),
      imageUrl: String(row.imageUrl || ''),
    };
  }).filter((hit) => hit.externalId && hit.name);
}

function hitsFromRoster(data: unknown, query: string, season: number, team: string): NcaaSearchHit[] {
  const rosters = Array.isArray(data) ? data : [];
  const needle = query.trim().toLowerCase();
  const hits: NcaaSearchHit[] = [];
  for (const roster of rosters) {
    const players = Array.isArray(asRecord(roster).players) ? asRecord(roster).players as unknown[] : [];
    const rosterTeam = String(asRecord(roster).team || team);
    for (const player of players) {
      const row = asRecord(player);
      const name = String(row.name || `${row.firstName || ''} ${row.lastName || ''}`).trim();
      if (needle && !name.toLowerCase().includes(needle)) continue;
      hits.push({
        provider: 'cbd',
        externalId: String(row.id || ''),
        name,
        team: rosterTeam,
        position: String(row.position || ''),
        season,
        imageUrl: '',
      });
    }
  }
  return hits.filter((hit) => hit.externalId && hit.name).slice(0, 25);
}

async function cachedFetch(
  db: Database.Database,
  cacheKey: string,
  provider: string,
  kind: string,
  query: string,
  externalId: string,
  url: string,
  headers: Record<string, string>
): Promise<{ data: unknown; cached: boolean; stale: boolean; fetchedAt: string | null }> {
  const cached = readCache(db, cacheKey);
  if (cached?.fresh) {
    logSync(db, { provider, endpoint: kind, status: 'cached', message: `Served fresh cache for ${query || externalId}`, records: 1 });
    return { data: cached.payload, cached: true, stale: false, fetchedAt: cached.fetchedAt };
  }
  try {
    const remote = await fetchJson(url, headers);
    writeCache(db, cacheKey, provider, kind, query, externalId, remote.data);
    logSync(db, { provider, endpoint: url, status: 'success', message: `Fetched ${kind}`, records: 1 });
    return { data: remote.data, cached: false, stale: false, fetchedAt: new Date().toISOString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upstream request failed';
    logSync(db, { provider, endpoint: url, status: 'error', message, records: 0 });
    if (cached) {
      return { data: cached.payload, cached: true, stale: true, fetchedAt: cached.fetchedAt };
    }
    throw error;
  }
}

function currentSeason(): number {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
}

export function registerNcaaRoutes(app: Express, db: Database.Database) {
  app.get('/api/ncaa/status', (_req, res) => {
    const cache = db.prepare(`
      SELECT
        COUNT(*) AS entries,
        SUM(CASE WHEN expires_at > ? THEN 1 ELSE 0 END) AS fresh
      FROM ncaa_cache
    `).get(new Date().toISOString()) as { entries: number; fresh: number | null };
    const lastSuccess = db.prepare(
      `SELECT synced_at, provider, message FROM sync_logs WHERE status IN ('success', 'cached') ORDER BY synced_at DESC LIMIT 1`
    ).get() as { synced_at: string; provider: string; message: string } | undefined;
    const lastError = db.prepare(
      `SELECT synced_at, provider, message FROM sync_logs WHERE status = 'error' ORDER BY synced_at DESC LIMIT 1`
    ).get() as { synced_at: string; provider: string; message: string } | undefined;
    const stale = !lastSuccess || Date.now() - Date.parse(lastSuccess.synced_at) > CACHE_TTL_MS();
    res.json({
      ttlHours: CACHE_TTL_MS() / (60 * 60 * 1000),
      stale,
      cache: {
        entries: cache?.entries || 0,
        fresh: cache?.fresh || 0,
        expired: (cache?.entries || 0) - (cache?.fresh || 0),
      },
      providers: [
        {
          id: 'cbb',
          label: 'CBB Stats',
          keyRequired: false,
          keyConfigured: true,
          coverage: 'NCAA Division I men',
        },
        {
          id: 'cbd',
          label: 'College Basketball Data',
          keyRequired: true,
          keyConfigured: Boolean(cbdKey()),
          coverage: 'NCAA Division I men',
        },
      ],
      lastSuccess: lastSuccess
        ? { at: lastSuccess.synced_at, provider: lastSuccess.provider, message: lastSuccess.message }
        : null,
      lastError: lastError && (!lastSuccess || lastError.synced_at > lastSuccess.synced_at)
        ? { at: lastError.synced_at, provider: lastError.provider, message: lastError.message }
        : null,
    });
  });

  app.get('/api/sync/logs', (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 12, 50);
    const rows = db.prepare(
      'SELECT id, provider, endpoint, status, message, records_synced, synced_at FROM sync_logs ORDER BY synced_at DESC LIMIT ?'
    ).all(limit);
    res.json(rows);
  });

  app.get('/api/ncaa/search', async (req: Request, res: Response) => {
    const provider = String(req.query.provider || 'cbb');
    const query = String(req.query.q || '').trim();
    const team = String(req.query.team || '').trim();
    const season = finiteOrNull(req.query.season) || currentSeason();
    try {
      if (provider === 'cbb') {
        if (query.length < 2) {
          res.status(400).json({ error: 'Enter at least 2 characters to search CBB Stats.' });
          return;
        }
        const cacheKey = `cbb:search:${query.toLowerCase()}`;
        const url = `${CBB_BASE()}/api/v1/players/search?q=${encodeURIComponent(query)}`;
        const result = await cachedFetch(db, cacheKey, 'cbb', 'search', query, '', url, {});
        const hits = hitsFromCbb(result.data);
        res.json({ provider, query, season, cached: result.cached, stale: result.stale, fetchedAt: result.fetchedAt, results: hits });
        return;
      }
      if (provider === 'cbd') {
        if (!cbdKey()) {
          logSync(db, {
            provider: 'cbd',
            endpoint: '/teams/roster',
            status: 'error',
            message: 'CBBD_API_KEY is missing from the server environment.',
            records: 0,
          });
          res.status(503).json({
            error: 'College Basketball Data needs CBBD_API_KEY in the server .env file. The key stays on the server and is never sent to the browser.',
          });
          return;
        }
        if (!team) {
          res.status(400).json({
            error: 'College Basketball Data search needs a team name. CBB Stats can search by player name without a key.',
          });
          return;
        }
        const cacheKey = `cbd:roster:${season}:${team.toLowerCase()}`;
        const url = `${CBD_BASE()}/teams/roster?season=${encodeURIComponent(String(season))}&team=${encodeURIComponent(team)}`;
        const result = await cachedFetch(db, cacheKey, 'cbd', 'roster', `${team} ${query}`.trim(), '', url, {
          Authorization: `Bearer ${cbdKey()}`,
        });
        const hits = hitsFromRoster(result.data, query, season, team);
        res.json({
          provider,
          query,
          team,
          season,
          cached: result.cached,
          stale: result.stale,
          fetchedAt: result.fetchedAt,
          results: hits,
          warning: result.stale ? 'Showing the last cached roster because the live request failed.' : undefined,
        });
        return;
      }
      res.status(400).json({ error: 'Provider must be cbb or cbd.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      res.status(502).json({ error: message });
    }
  });

  app.post('/api/ncaa/import', async (req: Request, res: Response) => {
    const provider = String(req.body?.provider || '');
    const externalId = String(req.body?.externalId || '');
    const team = String(req.body?.team || '').trim();
    const season = finiteOrNull(req.body?.season) || currentSeason();
    if (!externalId || (provider !== 'cbb' && provider !== 'cbd')) {
      res.status(400).json({ error: 'provider and externalId are required.' });
      return;
    }
    try {
      let prospect: ImportedProspect;
      let cached = false;
      let stale = false;
      if (provider === 'cbb') {
        const cacheKey = `cbb:player:${externalId}`;
        const url = `${CBB_BASE()}/api/v1/players/${encodeURIComponent(externalId)}`;
        const result = await cachedFetch(db, cacheKey, 'cbb', 'player', externalId, externalId, url, {});
        prospect = mapCbbPlayer(asRecord(result.data));
        cached = result.cached;
        stale = result.stale;
      } else {
        if (!cbdKey()) {
          res.status(503).json({ error: 'CBBD_API_KEY is not configured on the server.' });
          return;
        }
        if (!team) {
          res.status(400).json({ error: 'Team is required to import a College Basketball Data player.' });
          return;
        }
        const headers = { Authorization: `Bearer ${cbdKey()}` };
        const roster = await cachedFetch(
          db,
          `cbd:roster:${season}:${team.toLowerCase()}`,
          'cbd',
          'roster',
          team,
          '',
          `${CBD_BASE()}/teams/roster?season=${season}&team=${encodeURIComponent(team)}`,
          headers
        );
        const stats = await cachedFetch(
          db,
          `cbd:stats:${season}:${team.toLowerCase()}`,
          'cbd',
          'season-stats',
          team,
          '',
          `${CBD_BASE()}/stats/player/season?season=${season}&team=${encodeURIComponent(team)}`,
          headers
        );
        const rosters = Array.isArray(roster.data) ? roster.data : [];
        let player: Record<string, unknown> | undefined;
        for (const entry of rosters) {
          const players = Array.isArray(asRecord(entry).players) ? asRecord(entry).players as unknown[] : [];
          player = players.map(asRecord).find((item) => String(item.id) === externalId);
          if (player) break;
        }
        if (!player) {
          res.status(404).json({ error: 'That player is not in the cached team roster.' });
          return;
        }
        const statRows = Array.isArray(stats.data) ? stats.data.map(asRecord) : [];
        const stat = statRows.find((item) => String(item.athleteId) === externalId);
        prospect = mapCbdPlayer(player, stat, season, team);
        cached = roster.cached && stats.cached;
        stale = roster.stale || stats.stale;
      }
      if (!prospect.externalCbbId && !prospect.externalCbdId) {
        res.status(502).json({ error: 'The upstream player record had no id and was not saved.' });
        return;
      }
      const saved = upsertImportedProspect(db, prospect);
      logSync(db, {
        provider,
        endpoint: 'import',
        status: stale ? 'cached' : 'success',
        message: `${saved.action} ${prospect.firstName} ${prospect.lastName}${stale ? ' from stale cache' : ''}`,
        records: 1,
      });
      const row = db.prepare('SELECT id FROM prospects WHERE id = ?').get(saved.id);
      res.status(saved.action === 'created' ? 201 : 200).json({
        action: saved.action,
        id: saved.id,
        cached,
        stale,
        found: Boolean(row),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      res.status(502).json({ error: message });
    }
  });
}
