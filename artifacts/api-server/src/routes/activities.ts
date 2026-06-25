import { Router } from "express";
import { db } from "@workspace/db";
import { activitiesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateActivityBody, UpdateActivityBody } from "@workspace/api-zod";

const router = Router();

function formatActivity(a: typeof activitiesTable.$inferSelect) {
  return {
    ...a,
    points: a.points !== null ? Number(a.points) : null,
  };
}

router.get("/", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const activities = await db.select().from(activitiesTable).where(eq(activitiesTable.userId, userId));
  res.json(activities.map(formatActivity));
});

router.post("/", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const parsed = CreateActivityBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });
  const [created] = await db.insert(activitiesTable).values({
    userId,
    semester: parsed.data.semester,
    activityType: parsed.data.activityType,
    details: parsed.data.details ?? null,
    points: parsed.data.points !== null && parsed.data.points !== undefined ? String(parsed.data.points) : null,
  }).returning();
  res.status(201).json(formatActivity(created));
});

router.put("/:id", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const id = Number(req.params.id);
  const parsed = UpdateActivityBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });
  const [updated] = await db.update(activitiesTable).set({
    semester: parsed.data.semester,
    activityType: parsed.data.activityType,
    details: parsed.data.details ?? null,
    points: parsed.data.points !== null && parsed.data.points !== undefined ? String(parsed.data.points) : null,
  }).where(and(eq(activitiesTable.id, id), eq(activitiesTable.userId, userId))).returning();
  if (!updated) return res.status(404).json({ error: "활동을 찾을 수 없습니다" });
  res.json(formatActivity(updated));
});

router.delete("/:id", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const id = Number(req.params.id);
  await db.delete(activitiesTable).where(and(eq(activitiesTable.id, id), eq(activitiesTable.userId, userId)));
  res.status(204).send();
});

export default router;
