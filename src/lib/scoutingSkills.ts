import { DetailedGrades } from '../types/scouting';

export type ScoutingSkillKey = keyof DetailedGrades;

export interface ScoutingSkill {
  key: ScoutingSkillKey;
  label: string;
}

export interface ScoutingSkillGroup {
  title: string;
  titleClass: string;
  valueClass: string;
  skills: ScoutingSkill[];
}

/** Shared 1:1 catalog for the scouting form and the report card. */
export const SCOUTING_SKILL_GROUPS: ScoutingSkillGroup[] = [
  {
    title: 'Physical Tools & Athleticism',
    titleClass: 'text-amber-400',
    valueClass: 'text-amber-300',
    skills: [
      { key: 'size', label: 'Size & Frame' },
      { key: 'wingspan', label: 'Wingspan & Length' },
      { key: 'mobility', label: 'Functional Mobility' },
      { key: 'strength', label: 'Strength & Balance' },
      { key: 'explosiveness', label: 'Explosiveness' },
    ],
  },
  {
    title: 'Offensive Skillset',
    titleClass: 'text-sky-400',
    valueClass: 'text-sky-300',
    skills: [
      { key: 'threePointShooting', label: '3-Point Shooting' },
      { key: 'finishing', label: 'Rim Finishing' },
      { key: 'shotCreation', label: 'Shot Creation' },
      { key: 'passing', label: 'Passing & Playmaking' },
      { key: 'decisionMakingOffense', label: 'Decision Making' },
    ],
  },
  {
    title: 'Defense & Basketball IQ',
    titleClass: 'text-emerald-400',
    valueClass: 'text-emerald-300',
    skills: [
      { key: 'pointOfAttackDefense', label: 'Point of Attack Defense' },
      { key: 'rimProtection', label: 'Rim Protection & Help' },
      { key: 'courtVision', label: 'Court Vision' },
      { key: 'readingPickAndRoll', label: 'Pick & Roll Reading' },
      { key: 'competitiveness', label: 'Competitive Motor' },
    ],
  },
];

export const SCOUTING_SKILL_COUNT = SCOUTING_SKILL_GROUPS.reduce(
  (count, group) => count + group.skills.length,
  0
);

export function emptyScoutingSkills(): Record<string, number | null> {
  return Object.fromEntries(
    SCOUTING_SKILL_GROUPS.flatMap((group) => group.skills.map((skill) => [skill.key, null]))
  );
}

export function isRatedGrade(value: unknown): boolean {
  const grade = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(grade) && grade > 0;
}
