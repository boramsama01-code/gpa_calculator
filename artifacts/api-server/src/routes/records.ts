import { Router } from "express";
import { db } from "@workspace/db";
import { studentRecordsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateRecordBody, UpdateRecordBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const records = await db.select().from(studentRecordsTable).where(eq(studentRecordsTable.userId, userId));
  res.json(records);
});

router.post("/", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const parsed = CreateRecordBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });
  const [created] = await db.insert(studentRecordsTable).values({
    userId,
    subject: parsed.data.subject,
    recordText: parsed.data.recordText ?? null,
  }).returning();
  res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const id = Number(req.params.id);
  const parsed = UpdateRecordBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });
  const [updated] = await db.update(studentRecordsTable).set({
    subject: parsed.data.subject,
    recordText: parsed.data.recordText ?? null,
  }).where(and(eq(studentRecordsTable.id, id), eq(studentRecordsTable.userId, userId))).returning();
  if (!updated) return res.status(404).json({ error: "생기부를 찾을 수 없습니다" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });
  const id = Number(req.params.id);
  await db.delete(studentRecordsTable).where(and(eq(studentRecordsTable.id, id), eq(studentRecordsTable.userId, userId)));
  res.status(204).send();
});

export default router;
