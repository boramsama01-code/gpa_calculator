import { Router } from "express";
import { db } from "@workspace/db";
import { gradesTable, studentRecordsTable, studentProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AnalyzeConsultingBody } from "@workspace/api-zod";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/analyze", async (req, res) => {
  const userId = (req as any).auth?.userId;
  if (!userId) return res.status(401).json({ error: "인증이 필요합니다" });

  const parsed = AnalyzeConsultingBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "잘못된 입력입니다" });

  const { targetSchoolType } = parsed.data;

  const grades = await db.select().from(gradesTable).where(eq(gradesTable.userId, userId));
  const records = await db.select().from(studentRecordsTable).where(eq(studentRecordsTable.userId, userId));
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId));

  const gradesSummary = grades.map(g =>
    `[${g.semester}] ${g.subject}: 원점수=${g.rawScore ?? "미입력"}, 석차=${g.rank ?? "미입력"}, 상위${g.topPercentage ?? "?"}%, 성취도=${g.achievementLevel ?? "미입력"}`
  ).join("\n");

  const recordsSummary = records.map(r =>
    `[${r.subject}] ${r.recordText ?? "내용 없음"}`
  ).join("\n\n");

  const systemPrompt = `당신은 대한민국 특목고 입시 전문 컨설턴트입니다. 학생의 성적 데이터와 학교생활기록부(생기부) 세부능력 및 특기사항을 분석하여, 목표 학교 유형(${targetSchoolType})에 대한 입시 가능성을 평가하세요.

응답은 반드시 다음 3가지 섹션으로 구성하세요:

**1. 학업 우수성 (Academic Excellence)**
성취도와 석차 백분율을 기반으로 학업 역량을 분석하세요.

**2. 탐구 역량 (Inquiry Capability)**  
생기부 세특 내용을 기반으로 학생의 탐구력, 창의력, 지적 호기심을 평가하세요.

**3. 약점 및 개선 방향 (Weaknesses & Improvement Plan)**
구체적으로 부족한 부분과 앞으로의 준비 방향을 제시하세요.

분석 톤은 객관적이고 분석적으로 유지하며, 구체적인 수치와 근거를 바탕으로 평가하세요.`;

  const userContent = `목표 학교 유형: ${targetSchoolType}

[성적 데이터]
${gradesSummary || "성적 데이터가 없습니다."}

[생기부 세특]
${recordsSummary || "생기부 내용이 없습니다."}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const analysis = completion.choices[0]?.message?.content ?? "분석 결과를 생성할 수 없습니다.";

  const sections = analysis.split(/\*\*\d+\./);
  const academicExcellence = sections[1]?.split("**")[1]?.trim() ?? "";
  const inquiryCapability = sections[2]?.split("**")[1]?.trim() ?? "";
  const weaknessesAndPlan = sections[3]?.split("**")[1]?.trim() ?? "";

  res.json({ academicExcellence, inquiryCapability, weaknessesAndPlan, analysis });
});

export default router;
