import { Router } from "express";
import { db } from "@workspace/db";
import { regionalPoliciesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreatePolicyBody, UpdatePolicyBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const policies = await db.select().from(regionalPoliciesTable).orderBy(regionalPoliciesTable.regionName);
  res.json(policies.map(p => ({
    ...p,
    totalMaxScore: Number(p.totalMaxScore),
    academicScore: Number(p.academicScore),
    attendanceScore: Number(p.attendanceScore),
    volunteerScore: Number(p.volunteerScore),
    activityScore: Number(p.activityScore),
  })));
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [policy] = await db.select().from(regionalPoliciesTable).where(eq(regionalPoliciesTable.id, id));
  if (!policy) return res.status(404).json({ error: "정책을 찾을 수 없습니다" });
  res.json({
    ...policy,
    totalMaxScore: Number(policy.totalMaxScore),
    academicScore: Number(policy.academicScore),
    attendanceScore: Number(policy.attendanceScore),
    volunteerScore: Number(policy.volunteerScore),
    activityScore: Number(policy.activityScore),
  });
});

router.post("/", async (req, res) => {
  const parsed = CreatePolicyBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다", details: parsed.error });
  const [created] = await db.insert(regionalPoliciesTable).values({
    regionName: parsed.data.regionName,
    targetYear: parsed.data.targetYear,
    totalMaxScore: String(parsed.data.totalMaxScore),
    academicScore: String(parsed.data.academicScore),
    attendanceScore: String(parsed.data.attendanceScore),
    volunteerScore: String(parsed.data.volunteerScore),
    activityScore: String(parsed.data.activityScore),
    gradingScale: parsed.data.gradingScale ?? null,
    semesterWeights: parsed.data.semesterWeights ?? null,
  }).returning();
  res.status(201).json({
    ...created,
    totalMaxScore: Number(created.totalMaxScore),
    academicScore: Number(created.academicScore),
    attendanceScore: Number(created.attendanceScore),
    volunteerScore: Number(created.volunteerScore),
    activityScore: Number(created.activityScore),
  });
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = UpdatePolicyBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });
  const [updated] = await db.update(regionalPoliciesTable).set({
    regionName: parsed.data.regionName,
    targetYear: parsed.data.targetYear,
    totalMaxScore: String(parsed.data.totalMaxScore),
    academicScore: String(parsed.data.academicScore),
    attendanceScore: String(parsed.data.attendanceScore),
    volunteerScore: String(parsed.data.volunteerScore),
    activityScore: String(parsed.data.activityScore),
    gradingScale: parsed.data.gradingScale ?? null,
    semesterWeights: parsed.data.semesterWeights ?? null,
  }).where(eq(regionalPoliciesTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "정책을 찾을 수 없습니다" });
  res.json({
    ...updated,
    totalMaxScore: Number(updated.totalMaxScore),
    academicScore: Number(updated.academicScore),
    attendanceScore: Number(updated.attendanceScore),
    volunteerScore: Number(updated.volunteerScore),
    activityScore: Number(updated.activityScore),
  });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(regionalPoliciesTable).where(eq(regionalPoliciesTable.id, id));
  res.status(204).send();
});

export default router;
