import { Prospect, ScoutingReport, FreeformNote, GameLogItem, VideoClip, DraftBoardEntry } from '../types/scouting';

/**
 * Fictional baseline prospect template for testing interface without subjective scouting bias.
 * All subjective fields (ratings, strengths, weaknesses, projections, comparisons) are strictly null/empty.
 */
export const SAMPLE_PROSPECT: Prospect = {
  id: 'prospect-demo-alex-morgan',
  firstName: 'Alex',
  lastName: 'Morgan',
  avatarUrl: '',
  birthDate: '2007-03-18',
  draftYear: 2027,
  draftAge: 20.2,
  nationality: 'USA',
  birthCountry: 'USA',
  measurements: {
    heightInches: 79,
    heightFormatted: `6'7"`,
    weightLbs: 215,
    wingspanInches: 83,
    wingspanFormatted: `6'11"`,
    standingReachInches: 104,
    standingReachFormatted: `8'8"`
  },
  primaryPosition: 'SF',
  secondaryPosition: 'SG',
  currentTeam: 'State University',
  currentLeague: 'NCAA D1',
  previousTeams: [],
  classOrYear: 'Freshman',
  eligibilityStatus: 'Eligible 2027 NBA Draft',
  infoSourceLinks: [],
  status: 'To Observe',
  tags: ['Perimeter Wing', 'Class of 2027'],
  stats: [
    {
      id: 'stat-demo-01',
      season: '2025-26',
      team: 'State University',
      league: 'NCAA D1',
      gp: 14,
      mpg: 28.4,
      ppg: 13.8,
      rpg: 5.2,
      orpg: 1.2,
      drpg: 4.0,
      apg: 2.6,
      spg: 1.1,
      bpg: 0.6,
      tov: 1.7,
      fgPct: 0.468,
      fg3Pct: 0.362,
      ftPct: 0.784,
      fgm: 5.1,
      fga: 10.9,
      fg3m: 1.4,
      fg3a: 3.9,
      ftm: 2.2,
      fta: 2.8,
      tsPct: 0.569,
      efgPct: 0.532,
      usgPct: 21.8,
      astPct: 14.5,
      tovPct: 12.3,
      orbPct: 4.8,
      drbPct: 15.2,
      trbPct: 10.1,
      stlPct: 2.0,
      blkPct: 1.8,
      ortg: 108.5,
      drtg: 99.2,
      bpm: 3.4,
      source: 'NCAA D1 Verified Box Scores'
    }
  ],
  latestReport: undefined,
  reportsCount: 0,
  notesCount: 0,
  gamesObservedCount: 0,
  videoCount: 0,
  createdAt: '2025-02-01T10:00:00Z',
  updatedAt: '2025-02-01T10:00:00Z'
};

export const INITIAL_DRAFT_BOARD: DraftBoardEntry[] = [];
