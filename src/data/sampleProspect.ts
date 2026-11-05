import { Prospect, ScoutingReport, FreeformNote, GameLogItem, VideoClip, DraftBoardEntry } from '../types/scouting';

export const SAMPLE_REPORT: ScoutingReport = {
  id: 'rep-sample-01',
  prospectId: 'prospect-sample-cameron-boozer',
  reportDate: '2025-01-28',
  scoutName: 'Lead Scout',
  gameOrEvent: 'Montverde Academy vs Columbus High — Hoophall Classic',
  competition: 'High School National Showcase',
  opponent: 'Montverde Academy',
  minutesObserved: 32,
  confidence: 5,
  categoryGrades: {
    physical: 8.5,
    offensive: 9.0,
    defensive: 8.0,
    basketballIq: 9.5,
    mentality: 9.0,
  },
  detailedGrades: {
    size: 9,
    wingspan: 8,
    mobility: 8,
    speed: 7,
    explosiveness: 7,
    strength: 9,
    balance: 9,
    coordination: 9,
    agility: 8,
    endurance: 9,

    shooting: 8,
    catchAndShoot: 8,
    pullUpShooting: 7,
    threePointShooting: 8,
    midRange: 9,
    freeThrows: 8,
    finishing: 9,
    rimPressure: 8,
    ballHandling: 8,
    shotCreation: 8,
    passing: 9,
    playmaking: 9,
    offBallMovement: 8,
    decisionMakingOffense: 9,

    pointOfAttackDefense: 7,
    perimeterDefense: 7,
    screenNavigation: 7,
    helpDefense: 9,
    rimProtection: 8,
    switchability: 8,
    defensiveAwareness: 9,
    defensiveRebounding: 9,
    defensiveMotor: 9,

    courtVision: 9,
    decisionMakingGeneral: 9,
    gameUnderstanding: 10,
    readingDefenses: 9,
    readingPickAndRoll: 9,
    anticipation: 9,
    tacticalAwareness: 9,

    competitiveness: 9,
    workEthic: 10,
    confidence: 9,
    leadership: 9,
    consistency: 9,
    motor: 9,
    coachability: 10,
  },
  nbaArchetype: 'Hub Forward / Playmaking Frontcourt Engine',
  projectedRole: 'Primary / Secondary Offensive Hub with High-Level Passing',
  offensiveCeiling: 'Perennial 22-26 PPG scorer with 6+ APG versatility',
  defensiveCeiling: 'Smart team defensive quarterback and high-volume rebounder',
  floor: 'High-end starting starting frontcourt connector (Boris Diaw / Al Horford blend)',
  ceiling: 'All-NBA First/Second Team cornerstone (Paolo Banchero with higher IQ)',
  overallPotential: 'Tier 1 Franchise Player',
  strengths: [
    'Elite basketball feel and processing speed out of high-post and short-roll',
    'Advanced footwork and scoring touch inside 15 feet',
    'Exceptional defensive and offensive rebounding instincts and box-out discipline',
    'High-level vision passing over top of defenses against zone and double-teams',
    'Professional work ethic and composed demeanor under high-leverage moments'
  ],
  weaknesses: [
    'Good but not hyper-twitch burst; relies on pacing and angles over pure vertical bounce',
    'Lateral recovery speed against elite NBA speed guards in extreme isolation switches',
    'Pull-up 3PT consistency off the dribble still developing'
  ],
  mainConcerns: [
    'Can he be the sole rim-protector in small-ball lineups, or does he require an athletic 5 beside him?'
  ],
  playerComparisons: [
    'Paolo Banchero',
    'Al Horford',
    'Domantas Sabonis'
  ],
  overallGrade: 9.3,
  executiveSummary:
    'Prototypical modern offensive engine. Plays with an innate maturity, reading defensive coverages three passes ahead. Elite positional passing, soft interior touch, and disciplined team defense make him the premier frontcourt cornerstone of the 2027 NBA Draft class.'
};

export const SAMPLE_NOTE: FreeformNote = {
  id: 'note-sample-01',
  prospectId: 'prospect-sample-cameron-boozer',
  title: 'Midseason Film Evaluation — Short Roll & Decision Speed',
  content: `### Film Session Notes (Q1-Q4 vs Montverde)

- **Pick & Roll Coverage**: Opponents threw hard hedging and blitzes at him. Instead of panicking, he keeps his dribble alive, invites the trap, and hits the weakside corner shooter right in the shooting pocket.
- **Post-Up Fundamentals**: Excellent use of seal and drop-step. Absorbs contact without falling off balance. Made 6 of 7 free throws when fouled in the paint.
- **Conditioning**: Played 32 of 32 minutes without hands-on-knees fatigue. High-motor back-taps on offensive glass yielded 8 second-chance team points.
- **Areas to track**: Watch how comfortable he is firing catch-and-shoot threes above the break against college closeouts next season.`,
  tags: ['Film Study', 'Short Roll', 'High IQ', 'Draft 2027'],
  createdAt: '2025-01-29T14:30:00Z',
  updatedAt: '2025-01-29T15:10:00Z'
};

export const SAMPLE_GAME_LOG: GameLogItem = {
  id: 'gamelog-sample-01',
  prospectId: 'prospect-sample-cameron-boozer',
  gameDate: '2025-01-20',
  competition: 'Hoophall Classic 2025',
  homeTeam: 'Columbus Explorers',
  awayTeam: 'Montverde Academy',
  score: '71 - 68',
  minutesWatched: 32,
  pts: 26,
  reb: 14,
  ast: 6,
  stl: 2,
  blk: 2,
  tov: 2,
  fg: '10/16',
  fg3: '2/4',
  replayUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  observations:
    'Dominant head-to-head performance against top 5-star rim protectors. Controlled the pace of the game in the 4th quarter and hit the go-ahead baseline jumper with 44 seconds remaining.'
};

export const SAMPLE_VIDEO: VideoClip = {
  id: 'vid-sample-01',
  prospectId: 'prospect-sample-cameron-boozer',
  title: 'Columbus vs Montverde — Complete Possession Breakdown',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  platform: 'youtube',
  description: 'Full game scouting cutups focusing on halfcourt creation, defensive anchor rotations, and transition pushes.',
  tags: ['Halfcourt Passing', 'Rim Protection', 'Clutch'],
  timestamps: [
    { seconds: 34, label: '00:34', note: 'Weakside block and immediate outlet pass to guard in stride' },
    { seconds: 125, label: '02:05', note: 'Short-roll skip pass over zone defense to weakside corner 3' },
    { seconds: 284, label: '04:44', note: 'Drop-step seal with left-hand hook over 7-footer' },
    { seconds: 432, label: '07:12', note: 'Ice pick-and-roll defense forcing contested floater' }
  ],
  createdAt: '2025-01-22T10:00:00Z'
};

export const SAMPLE_PROSPECT: Prospect = {
  id: 'prospect-sample-cameron-boozer',
  firstName: 'Cameron',
  lastName: 'Boozer',
  avatarUrl: '',
  birthDate: '2007-07-18',
  draftYear: 2027,
  draftAge: 19.9,
  nationality: 'USA',
  birthCountry: 'USA',
  measurements: {
    heightInches: 81,
    heightFormatted: `6'9"`,
    weightLbs: 235,
    wingspanInches: 86,
    wingspanFormatted: `7'2"`,
    standingReachInches: 107,
    standingReachFormatted: `8'11"`
  },
  primaryPosition: 'PF',
  secondaryPosition: 'C',
  currentTeam: 'Duke Blue Devils (Commit) / Columbus',
  currentLeague: 'High School / Prep',
  previousTeams: ['Nightrydas Elite (EYBL)'],
  classOrYear: 'Class of 2025 / College Freshman 2025-26',
  eligibilityStatus: 'First Eligible 2027 NBA Draft',
  infoSourceLinks: ['https://www.on3.com', 'https://247sports.com'],
  status: 'Draft Board',
  tags: ['Playmaker', 'High Upside', 'High IQ', 'Elite Rebounder', 'Franchise Hub'],
  stats: [
    {
      id: 'stat-sample-01',
      season: '2024-25',
      team: 'Columbus HS',
      league: 'Nike EYBL / Scholastic',
      gp: 28,
      mpg: 31.4,
      ppg: 22.8,
      rpg: 12.4,
      orpg: 3.6,
      drpg: 8.8,
      apg: 4.8,
      spg: 1.6,
      bpg: 2.1,
      tov: 2.0,
      fgPct: 0.612,
      fg3Pct: 0.385,
      ftPct: 0.814,
      fgm: 8.8,
      fga: 14.4,
      fg3m: 1.2,
      fg3a: 3.1,
      ftm: 4.0,
      fta: 4.9,
      tsPct: 0.688,
      efgPct: 0.654,
      usgPct: 27.2,
      astPct: 24.5,
      tovPct: 10.8,
      orbPct: 12.1,
      drbPct: 28.4,
      trbPct: 20.2,
      stlPct: 2.4,
      blkPct: 5.6,
      ortg: 128.4,
      drtg: 88.2,
      bpm: 11.2,
      bpr: 9.8,
      source: 'Verified High School Tracker / EYBL Box Scores'
    }
  ],
  latestReport: SAMPLE_REPORT,
  reportsCount: 1,
  notesCount: 1,
  gamesObservedCount: 1,
  videoCount: 1,
  createdAt: '2025-01-15T08:00:00Z',
  updatedAt: '2025-01-29T15:10:00Z'
};

export const INITIAL_DRAFT_BOARD: DraftBoardEntry[] = [
  {
    prospectId: 'prospect-sample-cameron-boozer',
    rank: 1,
    tier: 1,
    justification: 'Consensus elite modern frontcourt hub. High floor, franchise ceiling with unmatched feel.',
    previousRank: 1,
    consensusRank: 1,
    consensusSource: 'ESPN / The Athletic 2027 Board',
    updatedAt: '2025-01-29T15:10:00Z'
  }
];
