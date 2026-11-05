import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// ----------------------------------------------------
// DIRECTORIES & SQLITE INITIALIZATION
// ----------------------------------------------------
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const backupsDir = path.resolve(process.cwd(), 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'courtside.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ----------------------------------------------------
// DATABASE SCHEMA DEFINITIONS
// ----------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS prospects (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    birth_date TEXT,
    draft_year INTEGER DEFAULT 2027,
    draft_age REAL,
    nationality TEXT,
    birth_country TEXT,
    height_inches INTEGER,
    height_formatted TEXT,
    weight_lbs INTEGER,
    wingspan_inches INTEGER,
    wingspan_formatted TEXT,
    standing_reach_inches INTEGER,
    standing_reach_formatted TEXT,
    primary_position TEXT,
    secondary_position TEXT,
    current_team TEXT,
    current_league TEXT,
    previous_teams TEXT,
    class_or_year TEXT,
    eligibility_status TEXT,
    status TEXT,
    tags TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS season_stats (
    id TEXT PRIMARY KEY,
    prospect_id TEXT REFERENCES prospects(id) ON DELETE CASCADE,
    season TEXT,
    team TEXT,
    league TEXT,
    gp INTEGER,
    mpg REAL,
    ppg REAL,
    rpg REAL,
    orpg REAL,
    drpg REAL,
    apg REAL,
    spg REAL,
    bpg REAL,
    tov REAL,
    fg_pct REAL,
    fg3_pct REAL,
    ft_pct REAL,
    fgm REAL,
    fga REAL,
    fg3m REAL,
    fg3a REAL,
    ftm REAL,
    fta REAL,
    ts_pct REAL,
    efg_pct REAL,
    usg_pct REAL,
    ast_pct REAL,
    tov_pct REAL,
    orb_pct REAL,
    drb_pct REAL,
    trb_pct REAL,
    stl_pct REAL,
    blk_pct REAL,
    ortg REAL,
    drtg REAL,
    bpm REAL,
    source TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS scouting_reports (
    id TEXT PRIMARY KEY,
    prospect_id TEXT REFERENCES prospects(id) ON DELETE CASCADE,
    report_date TEXT,
    report_type TEXT,
    scout_name TEXT,
    game_or_event TEXT,
    competition TEXT,
    opponent TEXT,
    minutes_observed INTEGER,
    confidence INTEGER,
    category_grades TEXT,
    detailed_grades TEXT,
    nba_archetype TEXT,
    projected_role TEXT,
    offensive_ceiling TEXT,
    defensive_ceiling TEXT,
    floor TEXT,
    ceiling TEXT,
    overall_potential TEXT,
    strengths TEXT,
    weaknesses TEXT,
    main_concerns TEXT,
    player_comparisons TEXT,
    overall_grade REAL,
    executive_summary TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS freeform_notes (
    id TEXT PRIMARY KEY,
    prospect_id TEXT REFERENCES prospects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS game_logs (
    id TEXT PRIMARY KEY,
    prospect_id TEXT REFERENCES prospects(id) ON DELETE CASCADE,
    game_date TEXT,
    competition TEXT,
    home_team TEXT,
    away_team TEXT,
    score TEXT,
    minutes_watched INTEGER,
    pts REAL,
    reb REAL,
    ast REAL,
    stl REAL,
    blk REAL,
    tov REAL,
    fg TEXT,
    fg3 TEXT,
    replay_url TEXT,
    observations TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS video_clips (
    id TEXT PRIMARY KEY,
    prospect_id TEXT REFERENCES prospects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    platform TEXT,
    description TEXT,
    tags TEXT,
    timestamps TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS draft_boards (
    id TEXT PRIMARY KEY,
    prospect_id TEXT REFERENCES prospects(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    tier INTEGER NOT NULL,
    justification TEXT,
    previous_rank INTEGER,
    consensus_rank INTEGER,
    consensus_source TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS sync_logs (
    id TEXT PRIMARY KEY,
    provider TEXT,
    endpoint TEXT,
    status TEXT,
    message TEXT,
    records_synced INTEGER,
    synced_at TEXT
  );
`);

// Migration safeguard for existing sqlite db
try {
  db.prepare('ALTER TABLE scouting_reports ADD COLUMN report_type TEXT').run();
} catch {
  // column already exists
}

// Phase 3 does not seed demonstration prospects. Records come only from SQLite.

// ----------------------------------------------------
// HELPER: MAP SQLITE PROSPECT TO FRONTEND OBJECT
// ----------------------------------------------------
function mapProspectFromDb(row: any): any {
  if (!row) return null;

  // Fetch season stats
  const statsRows = db.prepare('SELECT * FROM season_stats WHERE prospect_id = ? ORDER BY season DESC').all(row.id) as any[];
  const stats = statsRows.map((s) => ({
    id: s.id,
    season: s.season,
    team: s.team,
    league: s.league,
    gp: s.gp,
    mpg: s.mpg,
    ppg: s.ppg,
    rpg: s.rpg,
    orpg: s.orpg,
    drpg: s.drpg,
    apg: s.apg,
    spg: s.spg,
    bpg: s.bpg,
    tov: s.tov,
    fgPct: s.fg_pct,
    fg3Pct: s.fg3_pct,
    ftPct: s.ft_pct,
    fgm: s.fgm,
    fga: s.fga,
    fg3m: s.fg3m,
    fg3a: s.fg3a,
    ftm: s.ftm,
    fta: s.fta,
    tsPct: s.ts_pct,
    efgPct: s.efg_pct,
    usgPct: s.usg_pct,
    astPct: s.ast_pct,
    tovPct: s.tov_pct,
    orbPct: s.orb_pct,
    drbPct: s.drb_pct,
    trbPct: s.trb_pct,
    stlPct: s.stl_pct,
    blkPct: s.blk_pct,
    ortg: s.ortg,
    drtg: s.drtg,
    bpm: s.bpm,
    source: s.source,
  }));

  // Fetch latest report
  const latestReportRow = db.prepare('SELECT * FROM scouting_reports WHERE prospect_id = ? ORDER BY report_date DESC LIMIT 1').get(row.id) as any;
  const latestReport = latestReportRow ? mapReportFromDb(latestReportRow) : undefined;

  // Counts
  const reportsCount = (db.prepare('SELECT COUNT(*) as count FROM scouting_reports WHERE prospect_id = ?').get(row.id) as any).count;
  const notesCount = (db.prepare('SELECT COUNT(*) as count FROM freeform_notes WHERE prospect_id = ?').get(row.id) as any).count;
  const gamesCount = (db.prepare('SELECT COUNT(*) as count FROM game_logs WHERE prospect_id = ?').get(row.id) as any).count;
  const videoCount = (db.prepare('SELECT COUNT(*) as count FROM video_clips WHERE prospect_id = ?').get(row.id) as any).count;

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url || '',
    birthDate: row.birth_date,
    draftYear: row.draft_year,
    draftAge: row.draft_age,
    nationality: row.nationality,
    birthCountry: row.birth_country,
    measurements: {
      heightInches: row.height_inches,
      heightFormatted: row.height_formatted,
      weightLbs: row.weight_lbs,
      wingspanInches: row.wingspan_inches,
      wingspanFormatted: row.wingspan_formatted,
      standingReachInches: row.standing_reach_inches,
      standingReachFormatted: row.standing_reach_formatted,
    },
    primaryPosition: row.primary_position,
    secondaryPosition: row.secondary_position || undefined,
    currentTeam: row.current_team,
    currentLeague: row.current_league,
    previousTeams: row.previous_teams ? JSON.parse(row.previous_teams) : [],
    classOrYear: row.class_or_year,
    eligibilityStatus: row.eligibility_status,
    status: row.status,
    tags: row.tags ? JSON.parse(row.tags) : [],
    stats,
    latestReport,
    reportsCount,
    notesCount,
    gamesObservedCount: gamesCount,
    videoCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function safeJsonParse(value: any, fallback: any) {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.error('[COURTSIDE] Failed to parse JSON column', err);
    return fallback;
  }
}

function mapReportFromDb(row: any): any {
  if (!row) return null;
  const emptyGrades = { physical: 0, offensive: 0, defensive: 0, basketballIq: 0, mentality: 0 };
  return {
    id: row.id,
    prospectId: row.prospect_id,
    reportDate: row.report_date,
    reportType: row.report_type || 'Overall Prospect Evaluation',
    scoutName: row.scout_name,
    gameOrEvent: row.game_or_event,
    competition: row.competition,
    opponent: row.opponent,
    minutesObserved: row.minutes_observed,
    confidence: row.confidence,
    categoryGrades: { ...emptyGrades, ...safeJsonParse(row.category_grades, emptyGrades) },
    detailedGrades: (() => {
      const parsed = safeJsonParse(row.detailed_grades, undefined);
      if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) return undefined;
      return parsed;
    })(),
    nbaArchetype: row.nba_archetype,
    projectedRole: row.projected_role,
    offensiveCeiling: row.offensive_ceiling,
    defensiveCeiling: row.defensive_ceiling,
    floor: row.floor,
    ceiling: row.ceiling,
    overallPotential: row.overall_potential,
    strengths: safeJsonParse(row.strengths, []),
    weaknesses: safeJsonParse(row.weaknesses, []),
    mainConcerns: safeJsonParse(row.main_concerns, []),
    playerComparisons: safeJsonParse(row.player_comparisons, []),
    overallGrade: row.overall_grade,
    executiveSummary: row.executive_summary,
  };
}

function reportColumnValues(r: any) {
  return [
    r.prospectId,
    r.reportDate || new Date().toISOString().slice(0, 10),
    r.reportType || 'Overall Prospect Evaluation',
    r.scoutName || 'Lead Scout',
    r.gameOrEvent || '',
    r.competition || 'NCAA D1',
    r.opponent || null,
    r.minutesObserved ?? null,
    r.confidence ?? 1,
    JSON.stringify(r.categoryGrades || {}),
    r.detailedGrades && Object.keys(r.detailedGrades).length > 0 ? JSON.stringify(r.detailedGrades) : null,
    r.nbaArchetype || '',
    r.projectedRole || '',
    r.offensiveCeiling || '',
    r.defensiveCeiling || '',
    r.floor || '',
    r.ceiling || '',
    r.overallPotential || '',
    JSON.stringify(r.strengths || []),
    JSON.stringify(r.weaknesses || []),
    JSON.stringify(r.mainConcerns || []),
    JSON.stringify(r.playerComparisons || []),
    r.overallGrade ?? 0,
    r.executiveSummary || '',
  ];
}

function insertReport(r: any) {
  const id = r.id || `rep-${Date.now()}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO scouting_reports (
      id, prospect_id, report_date, report_type, scout_name, game_or_event, competition, opponent,
      minutes_observed, confidence, category_grades, detailed_grades, nba_archetype,
      projected_role, offensive_ceiling, defensive_ceiling, floor, ceiling,
      overall_potential, strengths, weaknesses, main_concerns, player_comparisons,
      overall_grade, executive_summary, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `).run(id, ...reportColumnValues(r), now);

  db.prepare(`
    UPDATE prospects SET
      status = CASE WHEN status IN ('To Observe', 'Watchlist') THEN 'Evaluated' ELSE status END,
      updated_at = ?
    WHERE id = ?
  `).run(now, r.prospectId);

  const created = db.prepare('SELECT * FROM scouting_reports WHERE id = ?').get(id);
  return mapReportFromDb(created);
}

function updateReportRow(id: string, r: any) {
  const existing = db.prepare('SELECT id, prospect_id FROM scouting_reports WHERE id = ?').get(id) as any;
  if (!existing) return null;
  const prospectId = r.prospectId || existing.prospect_id;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE scouting_reports SET
      prospect_id = ?, report_date = ?, report_type = ?, scout_name = ?, game_or_event = ?, competition = ?, opponent = ?,
      minutes_observed = ?, confidence = ?, category_grades = ?, detailed_grades = ?, nba_archetype = ?,
      projected_role = ?, offensive_ceiling = ?, defensive_ceiling = ?, floor = ?, ceiling = ?,
      overall_potential = ?, strengths = ?, weaknesses = ?, main_concerns = ?, player_comparisons = ?,
      overall_grade = ?, executive_summary = ?
    WHERE id = ?
  `).run(...reportColumnValues({ ...r, prospectId }), id);

  db.prepare('UPDATE prospects SET updated_at = ? WHERE id = ?').run(now, prospectId);
  const updated = db.prepare('SELECT * FROM scouting_reports WHERE id = ?').get(id);
  return mapReportFromDb(updated);
}

function deleteReportRow(id: string) {
  return db.prepare('DELETE FROM scouting_reports WHERE id = ?').run(id);
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// Prospects
app.get('/api/prospects', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM prospects ORDER BY updated_at DESC').all();
    const result = rows.map(mapProspectFromDb);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/prospects/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM prospects WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Prospect not found' });
    res.json(mapProspectFromDb(row));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prospects', (req, res) => {
  try {
    const p = req.body;
    const id = p.id || `prospect-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO prospects (
        id, first_name, last_name, avatar_url, birth_date, draft_year, draft_age,
        nationality, birth_country, height_inches, height_formatted, weight_lbs,
        wingspan_inches, wingspan_formatted, standing_reach_inches, standing_reach_formatted,
        primary_position, secondary_position, current_team, current_league,
        previous_teams, class_or_year, eligibility_status, status, tags,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
      )
    `);

    insert.run(
      id,
      p.firstName,
      p.lastName,
      p.avatarUrl || '',
      p.birthDate || '',
      p.draftYear || 2027,
      p.draftAge || 0,
      p.nationality || 'USA',
      p.birthCountry || 'USA',
      p.measurements?.heightInches || 0,
      p.measurements?.heightFormatted || '',
      p.measurements?.weightLbs || 0,
      p.measurements?.wingspanInches || 0,
      p.measurements?.wingspanFormatted || '',
      p.measurements?.standingReachInches || 0,
      p.measurements?.standingReachFormatted || '',
      p.primaryPosition,
      p.secondaryPosition || null,
      p.currentTeam,
      p.currentLeague,
      JSON.stringify(p.previousTeams || []),
      p.classOrYear || 'Freshman',
      p.eligibilityStatus || '',
      p.status || 'To Observe',
      JSON.stringify(p.tags || []),
      now,
      now
    );

    // If stats were provided
    if (Array.isArray(p.stats) && p.stats.length > 0) {
      const insertStat = db.prepare(`
        INSERT INTO season_stats (
          id, prospect_id, season, team, league, gp, mpg, ppg, rpg, orpg, drpg, apg, spg, bpg, tov,
          fg_pct, fg3_pct, ft_pct, ts_pct, efg_pct, usg_pct, ast_pct, source, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      for (const s of p.stats) {
        insertStat.run(
          s.id || `stat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          id,
          s.season || '2025-26',
          s.team || p.currentTeam,
          s.league || p.currentLeague,
          s.gp || 0,
          s.mpg || 0,
          s.ppg || 0,
          s.rpg || 0,
          s.orpg || 0,
          s.drpg || 0,
          s.apg || 0,
          s.spg || 0,
          s.bpg || 0,
          s.tov || 0,
          s.fgPct || 0,
          s.fg3Pct || 0,
          s.ftPct || 0,
          s.tsPct || 0,
          s.efgPct || 0,
          s.usgPct || 0,
          s.astPct || 0,
          s.source || 'Manual Entry',
          now
        );
      }
    }

    const created = db.prepare('SELECT * FROM prospects WHERE id = ?').get(id);
    res.status(201).json(mapProspectFromDb(created));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/prospects/:id', (req, res) => {
  try {
    const p = req.body;
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM prospects WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ error: 'Prospect not found' });

    db.prepare(`
      UPDATE prospects SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        avatar_url = COALESCE(?, avatar_url),
        status = COALESCE(?, status),
        current_team = COALESCE(?, current_team),
        current_league = COALESCE(?, current_league),
        primary_position = COALESCE(?, primary_position),
        secondary_position = COALESCE(?, secondary_position),
        tags = COALESCE(?, tags),
        updated_at = ?
      WHERE id = ?
    `).run(
      p.firstName ?? null,
      p.lastName ?? null,
      p.avatarUrl ?? null,
      p.status ?? null,
      p.currentTeam ?? null,
      p.currentLeague ?? null,
      p.primaryPosition ?? null,
      p.secondaryPosition ?? null,
      p.tags ? JSON.stringify(p.tags) : null,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM prospects WHERE id = ?').get(req.params.id);
    res.json(mapProspectFromDb(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/prospects/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM prospects WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Scouting Reports
app.get('/api/reports', (req, res) => {
  try {
    const { prospectId } = req.query;
    let query = 'SELECT * FROM scouting_reports';
    const params: any[] = [];
    if (prospectId) {
      query += ' WHERE prospect_id = ?';
      params.push(prospectId);
    }
    query += ' ORDER BY report_date DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows.map(mapReportFromDb));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reports', (req, res) => {
  console.log('[COURTSIDE] POST /api/reports', req.body?.id, req.body?.prospectId);
  try {
    const created = insertReport(req.body || {});
    console.log('[COURTSIDE] POST /api/reports created', created?.id);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('[COURTSIDE] POST /api/reports failed', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prospects/:id/reports', (req, res) => {
  console.log('[COURTSIDE] POST /api/prospects/:id/reports', req.params.id);
  try {
    const created = insertReport({ ...(req.body || {}), prospectId: req.params.id });
    console.log('[COURTSIDE] POST /api/prospects/:id/reports created', created?.id);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('[COURTSIDE] POST /api/prospects/:id/reports failed', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reports/:id', (req, res) => {
  console.log('[COURTSIDE] PUT /api/reports/:id', req.params.id);
  try {
    const updated = updateReportRow(req.params.id, { ...(req.body || {}), id: req.params.id });
    if (!updated) {
      console.error('[COURTSIDE] PUT /api/reports/:id not found', req.params.id);
      return res.status(404).json({ error: 'Report not found' });
    }
    console.log('[COURTSIDE] PUT /api/reports/:id updated', updated.id);
    res.json(updated);
  } catch (err: any) {
    console.error('[COURTSIDE] PUT /api/reports/:id failed', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/prospects/:prospectId/reports/:reportId', (req, res) => {
  console.log('[COURTSIDE] PUT /api/prospects/:prospectId/reports/:reportId', req.params.prospectId, req.params.reportId);
  try {
    const updated = updateReportRow(req.params.reportId, {
      ...(req.body || {}),
      id: req.params.reportId,
      prospectId: req.params.prospectId,
    });
    if (!updated) {
      console.error('[COURTSIDE] PUT nested report not found', req.params.reportId);
      return res.status(404).json({ error: 'Report not found' });
    }
    console.log('[COURTSIDE] PUT nested report updated', updated.id);
    res.json(updated);
  } catch (err: any) {
    console.error('[COURTSIDE] PUT nested report failed', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reports/:id', (req, res) => {
  console.log('[COURTSIDE] DELETE /api/reports/:id', req.params.id);
  try {
    const result = deleteReportRow(req.params.id);
    if (result.changes === 0) {
      console.error('[COURTSIDE] DELETE /api/reports/:id not found', req.params.id);
      return res.status(404).json({ error: 'Report not found' });
    }
    console.log('[COURTSIDE] DELETE /api/reports/:id removed', req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    console.error('[COURTSIDE] DELETE /api/reports/:id failed', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/prospects/:prospectId/reports/:reportId', (req, res) => {
  console.log('[COURTSIDE] DELETE /api/prospects/:prospectId/reports/:reportId', req.params.prospectId, req.params.reportId);
  try {
    const existing = db.prepare(
      'SELECT id FROM scouting_reports WHERE id = ? AND prospect_id = ?'
    ).get(req.params.reportId, req.params.prospectId);
    if (!existing) {
      console.error('[COURTSIDE] DELETE nested report not found', req.params.reportId);
      return res.status(404).json({ error: 'Report not found' });
    }
    deleteReportRow(req.params.reportId);
    console.log('[COURTSIDE] DELETE nested report removed', req.params.reportId);
    res.json({ success: true, id: req.params.reportId });
  } catch (err: any) {
    console.error('[COURTSIDE] DELETE nested report failed', err);
    res.status(500).json({ error: err.message });
  }
});

// Freeform Notes
app.get('/api/notes', (req, res) => {
  try {
    const { prospectId } = req.query;
    let query = 'SELECT * FROM freeform_notes';
    const params: any[] = [];
    if (prospectId) {
      query += ' WHERE prospect_id = ?';
      params.push(prospectId);
    }
    query += ' ORDER BY updated_at DESC';
    const rows = db.prepare(query).all(...params) as any[];
    const result = rows.map((n) => ({
      id: n.id,
      prospectId: n.prospect_id,
      title: n.title,
      content: n.content,
      tags: n.tags ? JSON.parse(n.tags) : [],
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notes', (req, res) => {
  try {
    const n = req.body;
    const id = n.id || `note-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO freeform_notes (id, prospect_id, title, content, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      n.prospectId || null,
      n.title,
      n.content,
      JSON.stringify(n.tags || []),
      now,
      now
    );

    const created = db.prepare('SELECT * FROM freeform_notes WHERE id = ?').get(id) as any;
    res.status(201).json({
      id: created.id,
      prospectId: created.prospect_id,
      title: created.title,
      content: created.content,
      tags: created.tags ? JSON.parse(created.tags) : [],
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notes/:id', (req, res) => {
  try {
    const n = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE freeform_notes SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        tags = COALESCE(?, tags),
        updated_at = ?
      WHERE id = ?
    `).run(
      n.title ?? null,
      n.content ?? null,
      n.tags ? JSON.stringify(n.tags) : null,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM freeform_notes WHERE id = ?').get(req.params.id) as any;
    res.json({
      id: updated.id,
      prospectId: updated.prospect_id,
      title: updated.title,
      content: updated.content,
      tags: updated.tags ? JSON.parse(updated.tags) : [],
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM freeform_notes WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Game Logs
app.get('/api/gamelogs', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM game_logs ORDER BY game_date DESC').all() as any[];
    res.json(rows.map((g) => ({
      id: g.id,
      prospectId: g.prospect_id,
      gameDate: g.game_date,
      competition: g.competition,
      homeTeam: g.home_team,
      awayTeam: g.away_team,
      score: g.score,
      minutesWatched: g.minutes_watched,
      pts: g.pts,
      reb: g.reb,
      ast: g.ast,
      stl: g.stl,
      blk: g.blk,
      tov: g.tov,
      fg: g.fg,
      fg3: g.fg3,
      replayUrl: g.replay_url,
      observations: g.observations,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gamelogs', (req, res) => {
  try {
    const g = req.body;
    const id = g.id || `gamelog-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO game_logs (
        id, prospect_id, game_date, competition, home_team, away_team, score,
        minutes_watched, pts, reb, ast, stl, blk, tov, fg, fg3, replay_url, observations, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      g.prospectId,
      g.gameDate,
      g.competition,
      g.homeTeam,
      g.awayTeam,
      g.score,
      g.minutesWatched || 0,
      g.pts,
      g.reb,
      g.ast,
      g.stl,
      g.blk,
      g.tov,
      g.fg,
      g.fg3,
      g.replayUrl || null,
      g.observations,
      now
    );

    res.status(201).json({ id, ...g });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/gamelogs/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM game_logs WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Videos
app.get('/api/videos', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM video_clips ORDER BY created_at DESC').all() as any[];
    res.json(rows.map((v) => ({
      id: v.id,
      prospectId: v.prospect_id,
      title: v.title,
      videoUrl: v.video_url,
      platform: v.platform,
      description: v.description,
      tags: v.tags ? JSON.parse(v.tags) : [],
      timestamps: v.timestamps ? JSON.parse(v.timestamps) : [],
      createdAt: v.created_at,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/videos', (req, res) => {
  try {
    const v = req.body;
    const id = v.id || `vid-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO video_clips (id, prospect_id, title, video_url, platform, description, tags, timestamps, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      v.prospectId,
      v.title,
      v.videoUrl,
      v.platform || 'youtube',
      v.description || null,
      JSON.stringify(v.tags || []),
      JSON.stringify(v.timestamps || []),
      now
    );

    res.status(201).json({ id, ...v, createdAt: now });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/videos/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM video_clips WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Draft Board
app.get('/api/draftboard', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM draft_boards ORDER BY rank ASC').all() as any[];
    res.json(rows.map((b) => ({
      id: b.id,
      prospectId: b.prospect_id,
      rank: b.rank,
      tier: b.tier,
      justification: b.justification,
      previousRank: b.previous_rank,
      updatedAt: b.updated_at,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/draftboard', (req, res) => {
  try {
    const { entries } = req.body; // Full ordered list of entries
    if (!Array.isArray(entries)) return res.status(400).json({ error: 'Entries array required' });

    const now = new Date().toISOString();
    const updateTransaction = db.transaction(() => {
      db.prepare('DELETE FROM draft_boards').run();
      const insert = db.prepare(`
        INSERT INTO draft_boards (id, prospect_id, rank, tier, justification, previous_rank, consensus_rank, consensus_source, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      entries.forEach((e: any, idx: number) => {
        insert.run(
          e.id || `board-${e.prospectId}`,
          e.prospectId,
          idx + 1,
          e.tier || 3,
          e.justification || '',
          e.previousRank || null,
          null,
          null,
          now
        );
      });
    });

    updateTransaction();
    const rows = db.prepare('SELECT * FROM draft_boards ORDER BY rank ASC').all() as any[];
    res.json(rows.map((b) => ({
      id: b.id,
      prospectId: b.prospect_id,
      rank: b.rank,
      tier: b.tier,
      justification: b.justification,
      previousRank: b.previous_rank,
      updatedAt: b.updated_at,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/draftboard/:prospectId', (req, res) => {
  try {
    db.prepare('DELETE FROM draft_boards WHERE prospect_id = ?').run(req.params.prospectId);
    // Re-index remaining ranks
    const remaining = db.prepare('SELECT * FROM draft_boards ORDER BY rank ASC').all() as any[];
    const reindexTx = db.transaction(() => {
      remaining.forEach((r, idx) => {
        db.prepare('UPDATE draft_boards SET rank = ? WHERE id = ?').run(idx + 1, r.id);
      });
    });
    reindexTx();
    res.json({ success: true, prospectId: req.params.prospectId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// BACKUP EXPORT & RESTORE ENDPOINTS
// ----------------------------------------------------
app.get('/api/backups', (req, res) => {
  try {
    const prospects = (db.prepare('SELECT * FROM prospects').all() as any[]).map(mapProspectFromDb);
    const reports = (db.prepare('SELECT * FROM scouting_reports').all() as any[]).map(mapReportFromDb);
    const notes = (db.prepare('SELECT * FROM freeform_notes').all() as any[]).map((n) => ({
      id: n.id,
      prospectId: n.prospect_id,
      title: n.title,
      content: n.content,
      tags: n.tags ? JSON.parse(n.tags) : [],
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));
    const gameLogs = (db.prepare('SELECT * FROM game_logs').all() as any[]).map((g) => ({
      id: g.id,
      prospectId: g.prospect_id,
      gameDate: g.game_date,
      competition: g.competition,
      homeTeam: g.home_team,
      awayTeam: g.away_team,
      score: g.score,
      minutesWatched: g.minutes_watched,
      pts: g.pts,
      reb: g.reb,
      ast: g.ast,
      stl: g.stl,
      blk: g.blk,
      tov: g.tov,
      fg: g.fg,
      fg3: g.fg3,
      replayUrl: g.replay_url,
      observations: g.observations,
    }));
    const videos = (db.prepare('SELECT * FROM video_clips').all() as any[]).map((v) => ({
      id: v.id,
      prospectId: v.prospect_id,
      title: v.title,
      videoUrl: v.video_url,
      platform: v.platform,
      description: v.description,
      tags: v.tags ? JSON.parse(v.tags) : [],
      timestamps: v.timestamps ? JSON.parse(v.timestamps) : [],
      createdAt: v.created_at,
    }));
    const draftBoard = (db.prepare('SELECT * FROM draft_boards ORDER BY rank ASC').all() as any[]).map((b) => ({
      id: b.id,
      prospectId: b.prospect_id,
      rank: b.rank,
      tier: b.tier,
      justification: b.justification,
      previousRank: b.previous_rank,
      updatedAt: b.updated_at,
    }));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `courtside_backup_${timestamp}.json`;
    const backupFilePath = path.join(backupsDir, backupFilename);

    const fullBackupPayload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      appName: 'COURTSIDE NBA Scouting Database',
      targetDraftYear: 2027,
      prospects,
      reports,
      notes,
      gameLogs,
      videos,
      draftBoard,
    };

    // Save copy to backups/ directory
    fs.writeFileSync(backupFilePath, JSON.stringify(fullBackupPayload, null, 2), 'utf-8');

    res.json({
      success: true,
      backupFile: backupFilename,
      backupPath: backupFilePath,
      data: fullBackupPayload,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/backups', (req, res) => {
  try {
    const backupData = req.body;
    if (!backupData || !Array.isArray(backupData.prospects)) {
      return res.status(400).json({ error: 'Invalid backup file structure' });
    }

    // Save a backup of incoming restore
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const restoreFilename = `courtside_restored_${timestamp}.json`;
    fs.writeFileSync(path.join(backupsDir, restoreFilename), JSON.stringify(backupData, null, 2), 'utf-8');

    const restoreTransaction = db.transaction(() => {
      // Clear tables in reverse cascade order
      db.prepare('DELETE FROM sync_logs').run();
      db.prepare('DELETE FROM draft_boards').run();
      db.prepare('DELETE FROM video_clips').run();
      db.prepare('DELETE FROM game_logs').run();
      db.prepare('DELETE FROM freeform_notes').run();
      db.prepare('DELETE FROM scouting_reports').run();
      db.prepare('DELETE FROM season_stats').run();
      db.prepare('DELETE FROM prospects').run();

      // Restore Prospects & Stats
      const insertProspect = db.prepare(`
        INSERT INTO prospects (
          id, first_name, last_name, avatar_url, birth_date, draft_year, draft_age,
          nationality, birth_country, height_inches, height_formatted, weight_lbs,
          wingspan_inches, wingspan_formatted, standing_reach_inches, standing_reach_formatted,
          primary_position, secondary_position, current_team, current_league,
          previous_teams, class_or_year, eligibility_status, status, tags,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?
        )
      `);

      const insertStat = db.prepare(`
        INSERT INTO season_stats (
          id, prospect_id, season, team, league, gp, mpg, ppg, rpg, orpg, drpg, apg, spg, bpg, tov,
          fg_pct, fg3_pct, ft_pct, fgm, fga, fg3m, fg3a, ftm, fta, ts_pct, efg_pct, usg_pct, ast_pct,
          tov_pct, orb_pct, drb_pct, trb_pct, stl_pct, blk_pct, ortg, drtg, bpm, source, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      for (const p of backupData.prospects) {
        insertProspect.run(
          p.id,
          p.firstName,
          p.lastName,
          p.avatarUrl || '',
          p.birthDate || '',
          p.draftYear || 2027,
          p.draftAge || 0,
          p.nationality || 'USA',
          p.birthCountry || 'USA',
          p.measurements?.heightInches || 0,
          p.measurements?.heightFormatted || '',
          p.measurements?.weightLbs || 0,
          p.measurements?.wingspanInches || 0,
          p.measurements?.wingspanFormatted || '',
          p.measurements?.standingReachInches || 0,
          p.measurements?.standingReachFormatted || '',
          p.primaryPosition,
          p.secondaryPosition || null,
          p.currentTeam,
          p.currentLeague,
          JSON.stringify(p.previousTeams || []),
          p.classOrYear || 'Freshman',
          p.eligibilityStatus || '',
          p.status || 'To Observe',
          JSON.stringify(p.tags || []),
          p.createdAt || new Date().toISOString(),
          p.updatedAt || new Date().toISOString()
        );

        if (Array.isArray(p.stats)) {
          for (const s of p.stats) {
            insertStat.run(
              s.id || `stat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              p.id,
              s.season || '2025-26',
              s.team || p.currentTeam,
              s.league || p.currentLeague,
              s.gp || 0,
              s.mpg || 0,
              s.ppg || 0,
              s.rpg || 0,
              s.orpg || 0,
              s.drpg || 0,
              s.apg || 0,
              s.spg || 0,
              s.bpg || 0,
              s.tov || 0,
              s.fgPct || 0,
              s.fg3Pct || 0,
              s.ftPct || 0,
              s.fgm || 0,
              s.fga || 0,
              s.fg3m || 0,
              s.fg3a || 0,
              s.ftm || 0,
              s.fta || 0,
              s.tsPct || 0,
              s.efgPct || 0,
              s.usgPct || 0,
              s.astPct || 0,
              s.tovPct || 0,
              s.orbPct || 0,
              s.drbPct || 0,
              s.trbPct || 0,
              s.stlPct || 0,
              s.blkPct || 0,
              s.ortg || 0,
              s.drtg || 0,
              s.bpm || 0,
              s.source || 'Imported Entry',
              new Date().toISOString()
            );
          }
        }
      }

      // Restore Scouting Reports
      if (Array.isArray(backupData.reports)) {
        const insertReport = db.prepare(`
          INSERT INTO scouting_reports (
            id, prospect_id, report_date, scout_name, game_or_event, competition, opponent,
            minutes_observed, confidence, category_grades, detailed_grades, nba_archetype,
            projected_role, offensive_ceiling, defensive_ceiling, floor, ceiling,
            overall_potential, strengths, weaknesses, main_concerns, player_comparisons,
            overall_grade, executive_summary, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const r of backupData.reports) {
          insertReport.run(
            r.id,
            r.prospectId,
            r.reportDate,
            r.scoutName || 'Lead Scout',
            r.gameOrEvent || '',
            r.competition || 'NCAA D1',
            r.opponent || null,
            r.minutesObserved ?? null,
            r.confidence ?? 1,
            JSON.stringify(r.categoryGrades || {}),
            JSON.stringify(r.detailedGrades || {}),
            r.nbaArchetype || '',
            r.projectedRole || '',
            r.offensiveCeiling || '',
            r.defensiveCeiling || '',
            r.floor || '',
            r.ceiling || '',
            r.overallPotential || '',
            JSON.stringify(r.strengths || []),
            JSON.stringify(r.weaknesses || []),
            JSON.stringify(r.mainConcerns || []),
            JSON.stringify(r.playerComparisons || []),
            r.overallGrade ?? 0,
            r.executiveSummary || '',
            new Date().toISOString()
          );
        }
      }

      // Restore Notes
      if (Array.isArray(backupData.notes)) {
        const insertNote = db.prepare(`
          INSERT INTO freeform_notes (id, prospect_id, title, content, tags, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        for (const n of backupData.notes) {
          insertNote.run(
            n.id,
            n.prospectId || null,
            n.title,
            n.content,
            JSON.stringify(n.tags || []),
            n.createdAt || new Date().toISOString(),
            n.updatedAt || new Date().toISOString()
          );
        }
      }

      // Restore Game Logs
      if (Array.isArray(backupData.gameLogs)) {
        const insertLog = db.prepare(`
          INSERT INTO game_logs (
            id, prospect_id, game_date, competition, home_team, away_team, score,
            minutes_watched, pts, reb, ast, stl, blk, tov, fg, fg3, replay_url, observations, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const g of backupData.gameLogs) {
          insertLog.run(
            g.id,
            g.prospectId,
            g.gameDate,
            g.competition,
            g.homeTeam,
            g.awayTeam,
            g.score,
            g.minutesWatched || 0,
            g.pts,
            g.reb,
            g.ast,
            g.stl,
            g.blk,
            g.tov,
            g.fg,
            g.fg3,
            g.replayUrl || null,
            g.observations,
            new Date().toISOString()
          );
        }
      }

      // Restore Videos
      if (Array.isArray(backupData.videos)) {
        const insertVideo = db.prepare(`
          INSERT INTO video_clips (id, prospect_id, title, video_url, platform, description, tags, timestamps, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const v of backupData.videos) {
          insertVideo.run(
            v.id,
            v.prospectId,
            v.title,
            v.videoUrl,
            v.platform || 'youtube',
            v.description || null,
            JSON.stringify(v.tags || []),
            JSON.stringify(v.timestamps || []),
            v.createdAt || new Date().toISOString()
          );
        }
      }

      // Restore Draft Board
      if (Array.isArray(backupData.draftBoard)) {
        const insertBoard = db.prepare(`
          INSERT INTO draft_boards (id, prospect_id, rank, tier, justification, previous_rank, consensus_rank, consensus_source, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const b of backupData.draftBoard) {
          insertBoard.run(
            b.id || `board-${b.prospectId}`,
            b.prospectId,
            b.rank,
            b.tier || 3,
            b.justification || '',
            b.previousRank || null,
            null,
            null,
            b.updatedAt || new Date().toISOString()
          );
        }
      }
    });

    restoreTransaction();
    res.json({ success: true, message: 'Database state successfully restored' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// VITE CLIENT MOUNTING & SERVER START
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`COURTSIDE Phase 3 Server running at http://localhost:${PORT}`);
  });
}

startServer();
