/**
 * COURTSIDE - NBA Scouting Database Types
 * Modeled after professional NBA scouting workflows.
 */

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type ProspectStatus =
  | 'Watchlist'
  | 'To Observe'
  | 'In Evaluation'
  | 'Evaluated'
  | 'Draft Board'
  | 'Cut';

export type LeagueCategory =
  | 'NCAA D1'
  | 'NBA G League'
  | 'NCAA D-I'
  | 'NCAA D-II/III'
  | 'G-League'
  | 'Overtime Elite'
  | 'International Pro'
  | 'High School / Prep'
  | 'Other';

export interface PhysicalMeasurements {
  heightInches: number; // e.g. 81 for 6'9"
  heightFormatted: string; // "6'9\""
  weightLbs: number; // e.g. 235
  wingspanInches?: number; // e.g. 86 for 7'2"
  wingspanFormatted?: string; // "7'2\""
  standingReachInches?: number; // e.g. 106 for 8'10"
  standingReachFormatted?: string; // "8'10\""
}

export interface SeasonStats {
  id: string;
  season: string; // e.g. "2024-25"
  team: string;
  league: string;
  gp: number; // Games Played
  mpg: number; // Minutes Per Game
  ppg: number; // Points Per Game
  rpg: number; // Rebounds Per Game
  orpg: number; // Offensive Rebounds Per Game
  drpg: number; // Defensive Rebounds Per Game
  apg: number; // Assists Per Game
  spg: number; // Steals Per Game
  bpg: number; // Blocks Per Game
  tov: number; // Turnovers Per Game
  fgPct: number; // Field Goal % (0.0 to 1.0 or 0 to 100)
  fg3Pct: number; // 3-Point %
  ftPct: number; // Free Throw %
  fgm?: number;
  fga?: number;
  fg3m?: number;
  fg3a?: number;
  ftm?: number;
  fta?: number;
  // Advanced stats
  tsPct?: number; // True Shooting %
  efgPct?: number; // Effective FG %
  usgPct?: number; // Usage Rate %
  astPct?: number; // Assist %
  tovPct?: number; // Turnover %
  orbPct?: number; // Offensive Rebound %
  drbPct?: number; // Defensive Rebound %
  trbPct?: number; // Total Rebound %
  stlPct?: number; // Steal %
  blkPct?: number; // Block %
  ortg?: number; // Offensive Rating
  drtg?: number; // Defensive Rating
  bpm?: number; // Box Plus/Minus
  bpr?: number; // Bayesian Performance Rating
  isCalculated?: boolean;
  source?: string;
}

export interface CategoryGrades {
  physical: number; // 1-10
  offensive: number; // 1-10
  defensive: number; // 1-10
  basketballIq: number; // 1-10
  mentality: number; // 1-10
}

export interface DetailedGrades {
  // Physical (10 items)
  size?: number;
  wingspan?: number;
  mobility?: number;
  speed?: number;
  explosiveness?: number;
  strength?: number;
  balance?: number;
  coordination?: number;
  agility?: number;
  endurance?: number;

  // Offensive Skills (14 items)
  shooting?: number;
  catchAndShoot?: number;
  pullUpShooting?: number;
  threePointShooting?: number;
  midRange?: number;
  freeThrows?: number;
  finishing?: number;
  rimPressure?: number;
  ballHandling?: number;
  shotCreation?: number;
  passing?: number;
  playmaking?: number;
  offBallMovement?: number;
  decisionMakingOffense?: number;

  // Defensive Skills (9 items)
  pointOfAttackDefense?: number;
  perimeterDefense?: number;
  screenNavigation?: number;
  helpDefense?: number;
  rimProtection?: number;
  switchability?: number;
  defensiveAwareness?: number;
  defensiveRebounding?: number;
  defensiveMotor?: number;

  // Basketball IQ (7 items)
  courtVision?: number;
  decisionMakingGeneral?: number;
  gameUnderstanding?: number;
  readingDefenses?: number;
  readingPickAndRoll?: number;
  anticipation?: number;
  tacticalAwareness?: number;

  // Mentality & Intangibles (7 items)
  competitiveness?: number;
  workEthic?: number;
  confidence?: number;
  leadership?: number;
  consistency?: number;
  motor?: number;
  coachability?: number;
}

export type ConfidenceLevel = 1 | 2 | 3 | 4;

export const CONFIDENCE_OPTIONS: { value: ConfidenceLevel; label: string }[] = [
  { value: 1, label: '1 - Initial Impression (Highlights / Quick cutups)' },
  { value: 2, label: '2 - Single Game (Full film / Showcase)' },
  { value: 3, label: '3 - Multi-Game (Multiple full films)' },
  { value: 4, label: '4 - Deep Evaluation (Live + Full film)' },
];

export function confidenceLabel(level: number | undefined): string {
  const match = CONFIDENCE_OPTIONS.find((option) => option.value === level);
  if (match) return match.label;
  if (level !== undefined && level >= 5) return CONFIDENCE_OPTIONS[3].label;
  return 'Unrated';
}

export interface ScoutingReport {
  id: string;
  prospectId: string;
  reportDate: string; // ISO string "2025-02-14"
  reportType?: 'Overall Prospect Evaluation' | 'Single Game Report';
  scoutName: string; // Personal scout name
  gameOrEvent?: string; // e.g. "Duke vs Kentucky - Champions Classic" or "Season Overview"
  competition?: string;
  opponent?: string;
  minutesObserved?: number;
  confidence: ConfidenceLevel;

  categoryGrades: CategoryGrades;
  detailedGrades?: DetailedGrades;

  // NBA Projection
  nbaArchetype: string; // e.g. "Two-Way Playmaking Wing", "Drop Big / Rim Runner"
  projectedRole: string; // e.g. "Primary Option / All-Star Ceiling", "Rotation 3&D"
  offensiveCeiling: string;
  defensiveCeiling: string;
  floor: string; // e.g. "High-end backup combo forward"
  ceiling: string; // e.g. "Perennial All-NBA Forward"
  overallPotential: string;

  strengths: string[];
  weaknesses: string[];
  mainConcerns: string[];
  playerComparisons: string[]; // e.g. ["Paolo Banchero", "Al Horford"]
  overallGrade: number; // 1.0 to 10.0
  executiveSummary: string; // Concise scout conclusion
}

export interface FreeformNote {
  id: string;
  prospectId?: string; // Optional if general note
  title: string;
  content: string; // Markdown / rich text
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GameLogItem {
  id: string;
  prospectId: string;
  gameDate: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  minutesWatched: number;
  pts?: number;
  reb?: number;
  ast?: number;
  stl?: number;
  blk?: number;
  tov?: number;
  fg?: string; // "7/13"
  fg3?: string; // "2/5"
  replayUrl?: string;
  observations: string;
}

export interface VideoTimestamp {
  seconds: number;
  endSeconds?: number;
  label: string; // "02:15" or "01:30 - 01:42"
  note: string; // "Sharp cut back-door finish with left hand"
}

export interface VideoClip {
  id: string;
  prospectId: string;
  title: string;
  videoUrl: string;
  platform: 'youtube' | 'vimeo' | 'other';
  description?: string;
  tags: string[];
  timestamps: VideoTimestamp[];
  createdAt: string;
}

export interface DraftBoardEntry {
  prospectId: string;
  rank: number; // 1 to N
  tier: number; // 1 to 6
  justification?: string;
  previousRank?: number;
  consensusRank?: number;
  consensusSource?: string;
  updatedAt: string;
}

export interface Prospect {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  birthDate: string; // YYYY-MM-DD
  draftYear: number; // e.g. 2027
  draftAge: number; // e.g. 19.3
  nationality: string;
  birthCountry: string;

  measurements: PhysicalMeasurements;

  primaryPosition: Position;
  secondaryPosition?: Position;

  currentTeam: string;
  currentLeague: LeagueCategory;
  previousTeams?: string[];
  classOrYear?: string; // "Freshman", "Sophomore", "1st Year Pro", "Senior HS"

  eligibilityStatus?: string; // "Eligible 2027", "International Auto-Eligible"
  infoSourceLinks?: string[];

  status: ProspectStatus;
  tags: string[];

  // Linked sub-data
  stats: SeasonStats[];
  latestReport?: ScoutingReport;
  reportsCount: number;
  notesCount: number;
  gamesObservedCount: number;
  videoCount: number;

  externalCbbId?: string;
  externalCbdId?: string;
  sourceProvider?: string;

  createdAt: string;
  updatedAt: string;
}
