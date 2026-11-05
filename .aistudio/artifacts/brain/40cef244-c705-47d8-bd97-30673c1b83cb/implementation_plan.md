# COURTSIDE — Personal Professional NBA Scouting Database

An uncompromising, desktop-first personal NBA scouting database designed for dedicated solo talent evaluation (targeting the 2027 NBA Draft class and beyond). Built with a sleek dark sports-analytics visual language, zero ongoing costs, zero paid AI dependencies, resilient local data ownership via SQLite, and an offline-first scouting workflow.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following core design decisions and operational constraints have been aligned based on your specification and clarifying answers:

- **Confirmed Decision 1 — Local Storage & Persistence**: Local SQLite database with automated JSON backups and full CSV import/export. Runs locally on your Windows machine with zero cloud configuration or database hosting fees.
- **Confirmed Decision 2 — Initial Phase 1 Dataset**: Empty database pre-configured with a single complete sample prospect template (structured after a top 2027 draft prospect) to allow immediate interactive testing of all cards, radar charts, and rating scales without visual clutter.
- **Confirmed Decision 3 — External Stat Integration**: Manual entry, tailored forms, and CSV imports first (Phases 1–3) to ensure 100% data reliability and zero external blockers; free NCAA API connectivity (CBB Stats & College Basketball Data) will be introduced in Phase 4 with defensive caching.
- **Confirmed Decision 4 — Budget & AI Policy**: Zero paid services, zero paid APIs, zero token consumption on automated summaries in v1. The application acts as your personal scouting workbench, prioritizing fast data entry, high informational density, and dependable note-taking.

---

## 1. Overview & Core Concept

- **What It Does**: Centralizes prospect biographical and physical profiles, comprehensive traditional and advanced statistics, structured 10-point scouting evaluations (across physical, offensive, defensive, basketball IQ, and intangibles), freeform rich-text scouting notebooks, timestamped video sequence logs (YouTube/video links), a drag-and-drop tiered Draft Board, and a 2-to-4 player comparison matrix.
- **Target Audience**: A single dedicated scout/analyst conducting in-depth film study and draft evaluation for the 2027 NBA Draft and subsequent classes.
- **Key Value**: Replaces fragmented spreadsheets, YouTube bookmarks, and notes apps with a unified franchise-grade scouting workspace modeled after NBA front-office tools (as shown in Synergy/FastScout-style environments), running fast and privately on your computer.

---

## 2. Technical Feasibility & Architecture Recommendation

### A. Feasibility Evaluation
The project is **100% technically feasible** within a modern TypeScript/React + Node.js stack:
- **UI & Interaction**: React 19 + Tailwind CSS v4 provides instant responsiveness and dense, tabular layouts without layout lag.
- **Local Database**: SQLite (`better-sqlite3` or `sqlite3`) running inside a lightweight local Express backend (`server.ts`) embedded directly into the Vite development runtime.
- **Reliability for Beginners**: No external database servers to configure, no Docker containers required, and no native cloud credential setups. A single `npm run dev` command starts the entire app and opens it in the browser.

### B. Simplest Reliable Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COURTSIDE DESKTOP BROWSER                       │
│                           (React 19 + Vite)                            │
│                                                                        │
│  ┌─────────────────┐  ┌──────────────────────────────────────────────┐ │
│  │ Permanent       │  │ Main Workspace Viewport                      │ │
│  │ Sidebar Nav     │  │  ├─ Dashboard (KPIs, Recents, Watchlist)     │ │
│  │  ├─ Dashboard   │  │  ├─ Player Database (Data Grid & Filters)    │ │
│  │  ├─ Prospects   │  │  ├─ Player Dossier (Overview/Stats/Scout)    │ │
│  │  ├─ Reports     │  │  ├─ Scouting Reports & Freeform Notes        │ │
│  │  ├─ Game Log    │  │  ├─ Video Library (Timestamped film log)     │ │
│  │  ├─ Videos      │  │  ├─ My Draft Board (Drag-and-Drop Tiers)     │ │
│  │  ├─ Draft Board │  │  ├─ Player Comparison (2-4 Prospect Matrix)  │ │
│  │  ├─ Compare     │  │  └─ Settings & Backup Management             │ │
│  │  └─ Settings    │  └──────────────────────────────────────────────┘ │
└───────────────┬───────────────────────────────────▲────────────────────┘
                │ Client REST API Requests          │ JSON Responses
                ▼                                   │
┌───────────────────────────────────────────────────┴────────────────────┐
│                    LOCAL NODE.JS / EXPRESS SERVER                      │
│                             (server.ts)                                │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │ Express REST Endpoints│  │ External API     │  │ Automated JSON  │ │
│  │ (/api/prospects, etc.)│  │ Cache Proxy      │  │ Backup Engine   │ │
│  └───────────┬───────────┘  └────────┬─────────┘  └────────┬────────┘ │
└──────────────┼───────────────────────┼─────────────────────┼───────────┘
               ▼                       ▼                     ▼
┌──────────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  LOCAL SQLITE DATABASE   │ │ Free NCAA APIs   │ │ Automatic Backups    │
│  (/data/courtside.db)    │ │ (CBB Stats / CBD)│ │ (/backups/*.json)    │
└──────────────────────────┘ └──────────────────┘ └──────────────────────┘
```

---

## 3. Free Data Sources & API Analysis

| Data Source | Coverage | Cost / Authentication | Strengths | Critical Limitations & Defense Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **CBB Stats** (`stats-cbb.com/developers`) | NCAA Division I Men's Basketball | **100% Free, No API Key Required** (OpenAPI) | Pre-computed percentiles, advanced metrics (BPR, BPM, USG%, TS%), direct player search, national rankings. | **Limitations**: Exclusively NCAA D-I; community-maintained API that may change schema; rate-limits on aggressive scraping.<br>**Mitigation**: Server-side proxy with caching; query on-demand only; store snapshots in local SQLite so remote API outages never blank out data. |
| **College Basketball Data** (`collegebasketballdata.com`) | NCAA Division I Men's Basketball | **Free Account** (Requires personal API key via registration) | Detailed team schedules, official box scores, rosters, recruiting rank histories, draft history. | **Limitations**: Requires free personal API key; rate limited on free tier (~100 req/min); college-only.<br>**Mitigation**: Store user key securely in `.env`; fetch box scores on-demand; persist box scores locally once fetched. |
| **International Leagues** (EuroLeague, ACB, NBL, FIBA U17/U19) | International Prospects | **No official free open API** | N/A | **Strategy**: Standardized CSV importer + clean manual entry templates. Pre-formatted CSV files can be dropped directly into the app for tournament rosters (e.g., FIBA U17 World Cup). |
| **G-League & High School** (Overtime Elite, Nike EYBL, 3SSB) | Overtime Elite, Prep Circuits | **No public structured APIs** | N/A | **Strategy**: High school prospects enter via manual profile creation with prep team, class year, wingspan/height measurements, and video links. |

---

## 4. Database Schema Structure (SQLite)

The database will be structured in SQLite with relational tables and foreign keys:

1. **`prospects`**:
   - `id` (TEXT PRIMARY KEY, UUID/cuid)
   - `first_name`, `last_name`, `avatar_url`
   - `birth_date` (ISO string), `draft_year` (INTEGER, e.g. 2027), `draft_age` (DECIMAL)
   - `nationality`, `birth_country`
   - `height_in`, `weight_lbs`, `wingspan_in`, `standing_reach_in`
   - `primary_position` (PG, SG, SF, PF, C), `secondary_position`
   - `current_team`, `current_league` (NCAA D1, Overtime Elite, NBL, EuroLeague, High School, etc.)
   - `previous_teams` (TEXT / JSON)
   - `status` ('Watchlist', 'To Observe', 'In Evaluation', 'Evaluated', 'Draft Board', 'Archived')
   - `tags` (JSON array: `["Rim Protector", "Elite Shooter", "High Upside"]`)
   - `external_cbb_id`, `external_cbd_id`, `source_provider`
   - `created_at`, `updated_at`

2. **`season_stats`**:
   - `id` (TEXT PRIMARY KEY), `prospect_id` (FK -> prospects.id)
   - `season` (TEXT, e.g. "2025-26"), `team`, `league`
   - Traditional: `gp`, `mpg`, `ppg`, `rpg`, `orpg`, `drpg`, `apg`, `spg`, `bpg`, `tov`, `fg_pct`, `fg3_pct`, `ft_pct`, `fgm`, `fga`, `fg3m`, `fg3a`, `ftm`, `fta`
   - Advanced: `ts_pct`, `efg_pct`, `usg_pct`, `ast_pct`, `tov_pct`, `orb_pct`, `drb_pct`, `trb_pct`, `stl_pct`, `blk_pct`, `ortg`, `drtg`, `bpm`, `bpr`
   - `is_calculated` (BOOLEAN), `source` (TEXT), `updated_at`

3. **`scouting_reports`**:
   - `id` (TEXT PRIMARY KEY), `prospect_id` (FK -> prospects.id)
   - `report_date`, `game_or_event`, `competition`, `opponent`, `minutes_observed`, `confidence_rating` (1–5)
   - Sub-skill grades (JSON scores 1–10 + "unrated"):
     - `physical_grades` (size, length, mobility, speed, explosiveness, strength, balance, coordination, agility, endurance)
     - `offensive_grades` (shooting, catch_shoot, pull_up, three_pt, mid_range, ft, finishing, rim_pressure, ball_handling, shot_creation, passing, playmaking, off_ball, decision_making)
     - `defensive_grades` (poa_defense, perimeter_defense, screen_nav, help_defense, rim_protection, switchability, defensive_awareness, defensive_rebounding, defensive_motor)
     - `bball_iq_grades` (court_vision, decision_making, game_understanding, reading_defenses, reading_pnr, anticipation, tactical_awareness)
     - `intangibles_grades` (competitiveness, work_ethic, confidence, leadership, consistency, motor, coachability)
   - Projection: `nba_archetype`, `projected_role`, `floor`, `ceiling`, `strengths`, `weaknesses`, `main_concerns`, `player_comparisons`, `overall_grade` (1–10)

4. **`freeform_notes`**:
   - `id` (TEXT PRIMARY KEY), `prospect_id` (FK -> prospects.id, nullable)
   - `title`, `content_html`, `content_text`, `tags` (JSON array), `created_at`, `updated_at`

5. **`game_logs`**:
   - `id` (TEXT PRIMARY KEY), `prospect_id` (FK -> prospects.id)
   - `game_date`, `competition`, `home_team`, `away_team`, `score`, `minutes_watched`
   - `pts`, `reb`, `ast`, `stl`, `blk`, `tov`, `fgm`, `fga`, `replay_url`, `observations`

6. **`video_clips`**:
   - `id` (TEXT PRIMARY KEY), `prospect_id` (FK -> prospects.id)
   - `title`, `video_url`, `platform` (YouTube, Vimeo, Other), `description`, `tags` (JSON)
   - `timestamps` (JSON array: `[{"seconds": 34, "label": "00:34", "notes": "Great PnR read and pocket pass"}]`)

7. **`draft_boards` & `draft_board_entries`**:
   - `draft_boards`: `id`, `name` (e.g. "2027 Big Board - Post U17"), `draft_year`, `is_active`
   - `draft_board_entries`: `id`, `board_id` (FK), `prospect_id` (FK), `rank` (1..60+), `tier` (Tier 1..Tier 6), `justification`, `previous_rank`, `consensus_rank`, `consensus_source`

8. **`sync_logs`**:
   - `id`, `provider`, `endpoint`, `status`, `message`, `synced_at`

---

## 5. User Experience & Visual Design

- **Aesthetic Direction**: NBA Front-Office Analytical Dark Suite. Inspired by Synergy Sports, Second Spectrum, and modern terminal analytics workstations.
- **Color Discipline**:
  - Canvas: Deep charcoal / slate black (`#0B0F17` / `#111827`)
  - Structural Surfaces: Card & panel containers (`#1A2234` / `#1E293B`) with hairline borders (`#2A364F`)
  - Accents: Courtside Amber / Court Gold (`#F59E0B`) and Electric Blue (`#38BDF8`) reserved exclusively for active states, CTA triggers, and rating highlights
  - Rating Scales: Semantic green-to-red gradient tokens for 1–10 scout scores (1–4: muted red/rose, 5–6: slate/neutral, 7–8: emerald, 9–10: cyan/gold).
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` or `Barlow Condensed` for athletic/scouting authority
  - Body & Form Controls: `DM Sans` / `Plus Jakarta Sans`
  - Metrics, Percentiles, and Timestamps: Tabular monospace figures (`font-mono tabular-nums`)
- **Key Views**:
  1. **Dashboard**: High-level counters, recent scouting edits, pinned 2027 watchlist, prospects needing reports.
  2. **Player Database**: Multi-column sortable table with sticky headers, position badges, quick filters (League, Age, Wingspan, Status, Tags), and instant search.
  3. **Player Dossier**: Multi-tab dossier (Overview, Statistics & Percentiles, Scouting Reports, Game Log, Video Breakdown, History).
  4. **Scouting Report Creator**: Dual mode — Freeform rich-text markdown/WYSIWYG note editor OR full 10-point structured radar evaluation form.
  5. **Draft Board**: Multi-tier drag-and-drop board with rank reordering, tier grouping, delta indicators (+2, -1), and quick justification popover.
  6. **Player Comparison**: Side-by-side 2–4 prospect matrix highlighting statistical differentials and radar skill overlays.
  7. **Data Management**: One-click JSON backup export, SQLite database file download, and CSV prospect import.

---

## 6. Technical Difficulties & Prevention Plan

| Potential Difficulty | Risk | Prevention / Solution |
| :--- | :--- | :--- |
| **1. Missing / Non-Existent APIs for HS & Overseas** | Scout cannot add prospects from Europe, Overtime Elite, or High School circuits. | **Defensive Design**: Built-in Manual Prospect Builder and CSV Batch Importer. No field is required except First Name, Last Name, and Draft Year. Empty stats remain cleanly displayed as `—` (never fabricated or defaulted to 0.0). |
| **2. API Rate Limiting or Breaking Schema** | Remote API changes break the app or lock out the scout. | **Cache-First Architecture**: Remote stats are cached locally in SQLite. The app works 100% offline once data is fetched. If an API request fails, existing data is preserved and a clear error notification is displayed without crashing the UI. |
| **3. Video Timestamp Playback Restrictions** | Embedded video players failing to seek to exact timestamps. | **Robust Player Wrapper**: Use YouTube IFrame API with `player.seekTo(seconds, true)` and standard `https://youtu.be/<id>?t=<sec>` deep-link fallback buttons. |
| **4. Drag-and-Drop Stutter on Large Boards** | Laggy reordering with 60+ prospects on the Draft Board. | Use `@dnd-kit/core` with virtualized or lightweight card components, maintaining state in local memory and committing rank updates via batch debouncing. |
| **5. Data Loss on Windows Reboots** | Scout loses hours of detailed scouting notes. | Autosave debounce on all text inputs + SQLite Write-Ahead Logging (WAL) + automated timestamped JSON backup generated on every major edit session. |

---

## 7. GitHub Preservation & Data Safety Strategy

To preserve your work, data, and notes on GitHub without exposing secrets or corrupting binary files:

1. **Repository Structure**:
   - `src/`: All frontend React code, components, and styles.
   - `server.ts`: Local backend server.
   - `data/`: Local storage directory (contains `courtside.db`).
   - `backups/`: Human-readable JSON export directory.
   - `templates/`: Clean CSV templates (`prospects_template.csv`, `stats_template.csv`).
2. **Git Configuration (`.gitignore`)**:
   - `.env`: Prevents exposing personal API keys.
   - `node_modules/`: Standard dependency exclusion.
   - `data/*.db`, `data/*.db-wal`, `data/*.db-shm`: Binary database files are excluded from Git to prevent merge conflicts and Git repo bloat.
3. **Automated Human-Readable JSON Backups**:
   - A single-click **"Export Full Database to JSON"** creates `backups/courtside_scouting_export.json`.
   - This JSON file **can safely be committed to your private GitHub repository**, ensuring every prospect, note, grade, and timestamp is version-controlled and human-readable.
4. **Instant Restoration**:
   - A **"Restore from JSON"** button in Settings recreates the SQLite database from your backup JSON file in 2 seconds on any new machine.

---

## 8. Phased Development Roadmap

### Phase 1 — Interface Shell & Professional Design System
- Permanent responsive sidebar navigation with brand identity (`COURTSIDE`).
- Dashboard view with analytical KPI cards, recent activity, and 2027 watchlist.
- Player Database with compact sortable data table, column toggle, position filters, and instant search.
- Complete Player Dossier view with tab navigation (Overview, Stats, Scouting, Game Log, Video, History).
- Single comprehensive sample prospect template (pre-loaded with a 2027 top prospect profile) to verify all UI components.

### Phase 2 — Local SQLite Persistence & Scouting Report Engine
- Express backend routes (`/api/prospects`, `/api/reports`, `/api/notes`).
- Local SQLite database setup with auto-migration and WAL mode.
- Full CRUD operations: Add new prospect, edit biographical/physical metrics, assign tags/status.
- Rich-text Freeform Notes editor with autosave.
- Structured 10-point Scouting Evaluation engine (6 skill categories, radar chart visualization, NBA archetype/ceiling projection).
- Automatic local JSON backup generator.

### Phase 3 — Interactive Draft Board & Player Comparison
- Multi-tier personal Draft Board (Top 10, Top 30, Top 60, Full).
- Drag-and-drop prospect reordering using `@dnd-kit` with rank delta indicators.
- Tier customization (Tier 1, Tier 2, etc.) and per-prospect justification notes.
- Multi-prospect comparison matrix (side-by-side comparison of 2 to 4 prospects across physicals, stats, and scouting grades).

### Phase 4 — NCAA API Integration & CSV Import/Export
- Server-side proxy for CBB Stats (keyless) and College Basketball Data (with user API key).
- In-app player search and one-click stat synchronization with local caching.
- Manual CSV import and export engine for non-NCAA leagues (Overtime Elite, Europe, High School).
- Sync status monitor with clear error messaging and cache indicators.

### Phase 5 — Game Log & Timestamped Video Library
- Match scouting log: record games, score, opponent, minutes watched, and player-specific game grades.
- Video library: embed YouTube/video links with interactive timestamped notes.
- Clickable timestamp triggers that jump directly to the exact play/possession.
- Automatic aggregation of game logs and video clips into the player's personal dossier.

### Phase 6 — Hardening, Offline Verification & GitHub Guide
- Comprehensive `README.md` with Windows quick-start commands and GitHub backup instructions.
- Data export/import verification and edge-case testing.
- Final UI polish, keyboard navigation shortcuts, and build validation.
