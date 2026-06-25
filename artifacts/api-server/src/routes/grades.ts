import { Router } from "express";
import { db } from "@workspace/db";
import { gradesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateGradeBody, UpdateGradeBody, BulkSaveGradesBody } from "@workspace/api-zod";

const router = Router();

function formatGrade(g: typeof gradesTable.$inferSelect) {
  return {
    ...g,
    rawScore: g.rawScore !== null ? Number(g.rawScore) : null,
    standardDeviation: g.standardDeviation !== null ? Number(g.standardDeviation) : null,
    average: g.average !== null ? Number(g.average) : null,
    topPercentage: g.topPercentage !== null ? Number(g.topPercentage) : null,
  };
}

router.get("/", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const grades = await db.select().from(gradesTable).where(eq(gradesTable.userId, userId));
  res.json(grades.map(formatGrade));
});

router.post("/", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const parsed = CreateGradeBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });
  const [created] = await db.insert(gradesTable).values({
    userId,
    semester: parsed.data.semester,
    subject: parsed.data.subject,
    rawScore: parsed.data.rawScore !== null && parsed.data.rawScore !== undefined ? String(parsed.data.rawScore) : null,
    standardDeviation: parsed.data.standardDeviation !== null && parsed.data.standardDeviation !== undefined ? String(parsed.data.standardDeviation) : null,
    average: parsed.data.average !== null && parsed.data.average !== undefined ? String(parsed.data.average) : null,
    rank: parsed.data.rank ?? null,
    topPercentage: parsed.data.topPercentage !== null && parsed.data.topPercentage !== undefined ? String(parsed.data.topPercentage) : null,
    achievementLevel: parsed.data.achievementLevel ?? null,
    totalStudents: parsed.data.totalStudents ?? null,
  }).returning();
  res.status(201).json(formatGrade(created));
});

router.put("/:id", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const id = Number(req.params.id);
  const parsed = UpdateGradeBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });
  const [updated] = await db.update(gradesTable).set({
    semester: parsed.data.semester,
    subject: parsed.data.subject,
    rawScore: parsed.data.rawScore !== null && parsed.data.rawScore !== undefined ? String(parsed.data.rawScore) : null,
    standardDeviation: parsed.data.standardDeviation !== null && parsed.data.standardDeviation !== undefined ? String(parsed.data.standardDeviation) : null,
    average: parsed.data.average !== null && parsed.data.average !== undefined ? String(parsed.data.average) : null,
    rank: parsed.data.rank ?? null,
    topPercentage: parsed.data.topPercentage !== null && parsed.data.topPercentage !== undefined ? String(parsed.data.topPercentage) : null,
    achievementLevel: parsed.data.achievementLevel ?? null,
    totalStudents: parsed.data.totalStudents ?? null,
  }).where(and(eq(gradesTable.id, id), eq(gradesTable.userId, userId))).returning();
  if (!updated) return res.status(404).json({ error: "성적을 찾을 수 없습니다" });
  res.json(formatGrade(updated));
});

router.delete("/:id", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const id = Number(req.params.id);
  await db.delete(gradesTable).where(and(eq(gradesTable.id, id), eq(gradesTable.userId, userId)));
  res.status(204).send();
});

router.post("/bulk", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const parsed = BulkSaveGradesBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });

  await db.delete(gradesTable).where(eq(gradesTable.userId, userId));

  if (parsed.data.grades.length === 0) return res.json([]);

  const inserted = await db.insert(gradesTable).values(
    parsed.data.grades.map(g => ({
      userId,
      semester: g.semester,
      subject: g.subject,
      rawScore: g.rawScore !== null && g.rawScore !== undefined ? String(g.rawScore) : null,
      standardDeviation: g.standardDeviation !== null && g.standardDeviation !== undefined ? String(g.standardDeviation) : null,
      average: g.average !== null && g.average !== undefined ? String(g.average) : null,
      rank: g.rank ?? null,
      topPercentage: g.topPercentage !== null && g.topPercentage !== undefined ? String(g.topPercentage) : null,
      achievementLevel: g.achievementLevel ?? null,
      totalStudents: g.totalStudents ?? null,
    }))
  ).returning();

  res.json(inserted.map(formatGrade));
});

export default router;
