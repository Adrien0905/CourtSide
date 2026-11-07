import React from 'react';
import { DetailedGrades } from '../../types/scouting';
import { isRatedGrade, SCOUTING_SKILL_GROUPS } from '../../lib/scoutingSkills';

interface ScoutingReportCardProps {
  grades?: DetailedGrades;
}

export const ScoutingReportCard: React.FC<ScoutingReportCardProps> = ({ grades }) => {
  if (!grades) return null;

  const groups = SCOUTING_SKILL_GROUPS.map((group) => ({
    ...group,
    skills: group.skills.filter((skill) => isRatedGrade(grades[skill.key])),
  })).filter((group) => group.skills.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
      {groups.map((group) => (
        <div key={group.title} className="p-4 rounded bg-[#131C2E] border border-[#202E49] space-y-2">
          <h5 className={`font-bold uppercase tracking-wider text-sm mb-2 ${group.titleClass}`}>
            {group.title}
          </h5>
          <div className="space-y-1.5">
            {group.skills.map((skill) => (
              <div key={skill.key} className="flex justify-between items-center text-slate-300">
                <span>{skill.label}</span>
                <span className={`font-mono font-bold ${group.valueClass}`}>{Number(grades[skill.key])}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
