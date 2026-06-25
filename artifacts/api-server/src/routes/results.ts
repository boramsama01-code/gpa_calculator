import { Router } from "express";
import { db } from "@workspace/db";
import {
  gradesTable,
  activitiesTable,
  studentProfilesTable,
  regionalPoliciesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const SCHOOL_CUTOFFS: Record<string, { name: string; cutoff: number }[]> = {
  "과학고": [
    { name: "한성과학고", cutoff: 175 },
    { name: "세종과학고", cutoff: 180 },
    { name: "서울과학고", cutoff: 185 },
  ],
  "영재학교": [
    { name: "한국과학영재학교", cutoff: 190 },
    { name: "서울과학고(영재)", cutoff: 185 },
  ],
  "전사고": [
    { name: "상산고", cutoff: 170 },
    { name: "민사고", cutoff: 172 },
    { name: "외대부고", cutoff: 168 },
  ],
  "외고": [
    { name: "서울외고", cutoff: 160 },
    { name: "한영외고", cutoff: 158 },
  ],
  "국제고": [
    { name: "서울국제고", cutoff: 155 },
    { name: "청심국제고", cutoff: 158 },
  ],
};

function getStatus(score: number, cutoff: number): string {
  const rate = score / cutoff;
  if (rate >= 1) return "충족";
  if (rate >= 0.9) return "근접";
  return "미달";
}

function calcAchievementLevelScore(level: string | null): number {
  const map: Record<string, number> = { A: 1.0, B: 0.8, C: 0.6, D: 0.4, E: 0.2 };
  return level ? (map[level.toUpperCase()] ?? 0) : 0;
}

function estimateTopPercentage(rawScore: number, average: number, stdDev: number): number {
  const z = (rawScore - average) / stdDev;
  const p = 0.5 * (1 + erf(z / Math.sqrt(2)));
  return Math.round((1 - p) * 100 * 10) / 10;
}

function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

router.get("/calculate", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });

  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));
  const grades = await db.select().from(gradesTable).where(eq(gradesTable.userId, userId));
  const activities = await db.select().from(activitiesTable).where(eq(activitiesTable.userId, userId));

  let policy = null;
  if (profile?.regionId) {
    const [p] = await db.select().from(regionalPoliciesTable).where(eq(regionalPoliciesTable.id, profile.regionId));
    policy = p;
  }

  const maxAcademic = policy ? Number(policy.academicScore) : 150;
  const maxAttendance = policy ? Number(policy.attendanceScore) : 20;
  const maxVolunteer = policy ? Number(policy.volunteerScore) : 15;
  const maxActivity = policy ? Number(policy.activityScore) : 15;
  const totalMax = policy ? Number(policy.totalMaxScore) : 200;

  const semesterWeights = policy?.semesterWeights as Record<string, number> | null ?? {
    "1-1": 0.2, "1-2": 0.2, "2-1": 0.3, "2-2": 0.3,
  };

  const semesterScores: Record<string, number> = {};
  const gradesBySemester = grades.reduce((acc: Record<string, typeof grades>, g) => {
    if (!acc[g.semester]) acc[g.semester] = [];
    acc[g.semester].push(g);
    return acc;
  }, {});

  let academicScore = 0;
  for (const [semester, semGrades] of Object.entries(gradesBySemester)) {
    const weight = semesterWeights[semester] ?? 0.25;
    let semScore = 0;
    let count = 0;
    for (const g of semGrades) {
      let subjectScore = 0;
      if (g.topPercentage !== null) {
        const pct = Number(g.topPercentage);
        if (pct <= 4) subjectScore = 100;
        else if (pct <= 11) subjectScore = 90;
        else if (pct <= 23) subjectScore = 77;
        else if (pct <= 40) subjectScore = 60;
        else if (pct <= 60) subjectScore = 40;
        else if (pct <= 77) subjectScore = 25;
        else if (pct <= 89) subjectScore = 15;
        else if (pct <= 96) subjectScore = 6;
        else subjectScore = 2;
      } else if (g.rawScore !== null && g.average !== null && g.standardDeviation !== null) {
        const estPct = estimateTopPercentage(Number(g.rawScore), Number(g.average), Number(g.standardDeviation));
        if (estPct <= 4) subjectScore = 100;
        else if (estPct <= 11) subjectScore = 90;
        else if (estPct <= 23) subjectScore = 77;
        else if (estPct <= 40) subjectScore = 60;
        else if (estPct <= 60) subjectScore = 40;
        else subjectScore = 25;
      } else if (g.achievementLevel) {
        subjectScore = calcAchievementLevelScore(g.achievementLevel) * 100;
      }
      semScore += subjectScore;
      count++;
    }
    const avgSemScore = count > 0 ? semScore / count : 0;
    const contributedScore = (avgSemScore / 100) * maxAcademic * weight;
    semesterScores[semester] = Math.round(contributedScore * 10) / 10;
    academicScore += contributedScore;
  }
  academicScore = Math.min(academicScore, maxAcademic);

  const activityScore = Math.min(
    activities.reduce((sum, a) => sum + (a.points ? Number(a.points) : 0), 0),
    maxActivity
  );

  const attendanceScore = maxAttendance;
  const volunteerScore = maxVolunteer * 0.8;

  const totalScore = academicScore + attendanceScore + volunteerScore + activityScore;

  const targetTypes = profile?.targetSchoolTypes ?? [];
  const schoolResults = targetTypes.flatMap(type => {
    const schools = SCHOOL_CUTOFFS[type] ?? [];
    return schools.map(s => ({
      schoolName: s.name,
      schoolType: type,
      estimatedCutoff: s.cutoff,
      status: getStatus(totalScore, s.cutoff),
      achievementRate: Math.round((totalScore / s.cutoff) * 100 * 10) / 10,
    }));
  });

  const gapAnalysis = [];
  const academicDeficit = maxAcademic - academicScore;
  if (academicDeficit > 5) {
    gapAnalysis.push({ area: "학업 성취도", description: "성적 향상이 필요합니다. 특히 상위 석차 과목에 집중하세요.", deficit: Math.round(academicDeficit * 10) / 10 });
  }
  if (activityScore < maxActivity * 0.7) {
    gapAnalysis.push({ area: "교내 활동", description: "임원활동 및 수상 실적을 늘려야 합니다.", deficit: Math.round((maxActivity - activityScore) * 10) / 10 });
  }

  res.json({
    totalScore: Math.round(totalScore * 10) / 10,
    maxPossibleScore: totalMax,
    achievementRate: Math.round((totalScore / totalMax) * 100 * 10) / 10,
    breakdown: {
      academicScore: Math.round(academicScore * 10) / 10,
      attendanceScore: Math.round(attendanceScore * 10) / 10,
      volunteerScore: Math.round(volunteerScore * 10) / 10,
      activityScore: Math.round(activityScore * 10) / 10,
      semesterScores,
    },
    schoolResults,
    gapAnalysis,
  });
});

export default router;
