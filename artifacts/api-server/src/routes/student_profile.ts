import { Router } from "express";
import { db } from "@workspace/db";
import { studentProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SaveStudentProfileBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));
  if (!profile) {
    return res.json({ userId, regionId: null, targetSchoolTypes: [], updatedAt: new Date().toISOString() });
  }
  res.json(profile);
});

router.put("/", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const parsed = SaveStudentProfileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });

  const [existing] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));
  let result;
  if (existing) {
    const [updated] = await db.update(studentProfilesTable).set({
      regionId: parsed.data.regionId ?? null,
      targetSchoolTypes: parsed.data.targetSchoolTypes ?? [],
      updatedAt: new Date(),
    }).where(eq(studentProfilesTable.userId, userId)).returning();
    result = updated;
  } else {
    const [created] = await db.insert(studentProfilesTable).values({
      userId,
      regionId: parsed.data.regionId ?? null,
      targetSchoolTypes: parsed.data.targetSchoolTypes ?? [],
    }).returning();
    result = created;
  }
  res.json(result);
});

export default router;
