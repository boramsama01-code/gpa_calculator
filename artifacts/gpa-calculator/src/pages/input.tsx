import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useListPolicies, useSaveStudentProfile, useGetStudentProfile,
  useListGrades, useBulkSaveGrades,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

// ── 표준 중등 과목 ──
const SUBJECTS = ["국어", "영어", "수학", "과학", "사회", "역사", "도덕", "기술·가정", "정보", "체육", "음악", "미술", "한문"];
const SEMESTERS = [
  { v: "1-2", label: "1학년 2학기" },
  { v: "2-1", label: "2학년 1학기" },
  { v: "2-2", label: "2학년 2학기" },
  { v: "3-1", label: "3학년 1학기" },
];

// 원점수 → 성취도(절대평가 90/80/70/60)
function scoreToAchievement(raw: string): string {
  const n = Number(raw);
  if (raw.trim() === "" || Number.isNaN(n)) return "";
  if (n >= 90) return "A";
  if (n >= 80) return "B";
  if (n >= 70) return "C";
  if (n >= 60) return "D";
  return "E";
}

interface GradeRow {
  semester: string; subject: string; achievementLevel: string; // "AUTO" | A~E
  rawScore: string; average: string; standardDeviation: string; rank: string; totalStudents: string;
}
const emptyRow = (): GradeRow => ({
  semester: "1-2", subject: "", achievementLevel: "AUTO",
  rawScore: "", average: "", standardDeviation: "", rank: "", totalStudents: "",
});

export default function InputPage() {
  const [step, setStep] = useState("profile");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [regionId, setRegionId] = useState("");
  const { data: policies } = useListPolicies({ query: { queryKey: ["policies"] } });
  const { data: profile } = useGetStudentProfile({ query: { queryKey: ["profile"] } });
  const { data: gradesData } = useListGrades({ query: { queryKey: ["grades"] } });

  // 성적 표 상태
  const [rows, setRows] = useState<GradeRow[]>([emptyRow()]);
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && gradesData) {
      setRows(
        gradesData.length
          ? gradesData.map((g: any) => ({
              semester: g.semester ?? "1-2",
              subject: g.subject ?? "",
              achievementLevel: g.achievementLevel ?? "AUTO",
              rawScore: g.rawScore != null ? String(g.rawScore) : "",
              average: g.average != null ? String(g.average) : "",
              standardDeviation: g.standardDeviation != null ? String(g.standardDeviation) : "",
              rank: g.rank != null ? String(g.rank) : "",
              totalStudents: g.totalStudents != null ? String(g.totalStudents) : "",
            }))
          : [emptyRow()]
      );
      initialized.current = true;
    }
  }, [gradesData]);

  const updateRow = (i: number, patch: Partial<GradeRow>) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  // 지원 유형별 핵심 과목 안내
  const types: string[] = (profile as any)?.targetSchoolTypes ?? [];
  const hint =
    types.includes("FOREIGN") || types.includes("INTERNATIONAL")
      ? "외고·국제고는 영어 성취도만 반영됩니다. 중2~3 영어 A 유지가 핵심입니다."
      : types.includes("SCIENCE")
      ? "과학고는 수학·과학 성취도가 핵심입니다."
      : types.includes("GIFTED")
      ? "영재고는 내신 점수를 반영하지 않습니다(지필·서류 중심)."
      : "지원 유형에 따라 반영 과목이 다릅니다. 기본 정보에서 목표 유형을 선택하세요.";

  const saveProfileMutation = useSaveStudentProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: "프로필 저장됨", description: "성공적으로 저장되었습니다." });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        setStep("grades");
      },
      onError: (e: any) =>
        toast({ title: "저장 실패", description: `${e?.status ?? ""} ${e?.message ?? "오류"}`, variant: "destructive" }),
    },
  });

  const bulkSaveGrades = useBulkSaveGrades({
    mutation: {
      onSuccess: () => {
        toast({ title: "성적 저장됨", description: "표의 내용으로 저장했습니다." });
        queryClient.invalidateQueries({ queryKey: ["grades"] });
      },
      onError: (e: any) =>
        toast({ title: "저장 실패", description: `${e?.status ?? ""} ${e?.message ?? "오류"}`, variant: "destructive" }),
    },
  });

  const num = (s: string) => (s.trim() === "" ? null : Number(s));
  const handleSaveGrades = () => {
    const grades = rows
      .filter((r) => r.subject.trim() !== "" && r.semester.trim() !== "")
      .map((r) => {
        const rank = num(r.rank), total = num(r.totalStudents);
        const top = rank != null && total != null && total > 0 ? Math.round((rank / total) * 1000) / 10 : null;
        const ach = r.achievementLevel === "AUTO" ? scoreToAchievement(r.rawScore) || null : r.achievementLevel;
        return {
          semester: r.semester, subject: r.subject, achievementLevel: ach,
          rawScore: num(r.rawScore), average: num(r.average), standardDeviation: num(r.standardDeviation),
          rank, totalStudents: total, topPercentage: top,
        };
      });
    bulkSaveGrades.mutate({ data: { grades } });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">데이터 입력 마법사</h1>
        <p className="text-muted-foreground mt-1">정확한 입시 분석을 위해 정보를 입력해주세요.</p>
      </div>

      <Tabs value={step} onValueChange={setStep} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">기본 정보</TabsTrigger>
          <TabsTrigger value="grades">교과 성적</TabsTrigger>
          <TabsTrigger value="activities">비교과 활동</TabsTrigger>
          <TabsTrigger value="records">세특 사항</TabsTrigger>
        </TabsList>

        {/* 1. 기본 정보 */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle>1단계: 지역 및 목표 설정</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>지원 지역 (시/도)</Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger><SelectValue placeholder="지역 선택" /></SelectTrigger>
                  <SelectContent>
                    {policies?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.regionName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => saveProfileMutation.mutate({ data: { regionId: parseInt(regionId), targetSchoolTypes: ["SCIENCE"] } })}
                disabled={!regionId || saveProfileMutation.isPending}
              >저장 후 다음 단계로</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. 교과 성적 — 편집 가능한 표 */}
        <TabsContent value="grades" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>2단계: 학기별 성적 입력</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{hint}</p>
              <p className="text-xs text-muted-foreground">
                성취도는 '자동'으로 두면 원점수(90/80/70/60)로 환산됩니다. 데이터가 일부만 있어도 입력한 것만 저장됩니다.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="overflow-x-auto">
                <div className="min-w-[820px] space-y-2">
                  {/* 헤더 */}
                  <div className="grid grid-cols-[110px_120px_110px_90px_90px_90px_80px_90px_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
                    <div>학기</div><div>과목</div><div>성취도</div><div>원점수</div>
                    <div>과목평균</div><div>표준편차</div><div>석차</div><div>수강자수</div><div></div>
                  </div>
                  {rows.map((r, i) => (
                    <div key={i} className="grid grid-cols-[110px_120px_110px_90px_90px_90px_80px_90px_40px] gap-2 items-center">
                      <Select value={r.semester} onValueChange={(v) => updateRow(i, { semester: v })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SEMESTERS.map((s) => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={r.subject || undefined} onValueChange={(v) => updateRow(i, { subject: v })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="과목" /></SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={r.achievementLevel} onValueChange={(v) => updateRow(i, { achievementLevel: v })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AUTO">자동</SelectItem>
                          {["A", "B", "C", "D", "E"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input className="h-9" type="number" value={r.rawScore} onChange={(e) => updateRow(i, { rawScore: e.target.value })} />
                      <Input className="h-9" type="number" value={r.average} onChange={(e) => updateRow(i, { average: e.target.value })} />
                      <Input className="h-9" type="number" value={r.standardDeviation} onChange={(e) => updateRow(i, { standardDeviation: e.target.value })} />
                      <Input className="h-9" type="number" value={r.rank} onChange={(e) => updateRow(i, { rank: e.target.value })} />
                      <Input className="h-9" type="number" value={r.totalStudents} onChange={(e) => updateRow(i, { totalStudents: e.target.value })} />
                      <Button variant="ghost" size="sm" className="h-9 px-2 text-destructive" onClick={() => removeRow(i)}>✕</Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={addRow}>+ 행 추가</Button>
                <Button onClick={handleSaveGrades} disabled={bulkSaveGrades.isPending}>전체 저장</Button>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep("profile")}>← 기본 정보</Button>
                <Button variant="ghost" onClick={() => setStep("activities")}>비교과 활동 →</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3·4. 다음 단계(C단계에서 구현) */}
        <TabsContent value="activities" className="mt-4">
          <Card><CardContent className="pt-6">비교과 활동 입력 폼 (준비 중)</CardContent></Card>
        </TabsContent>
        <TabsContent value="records" className="mt-4">
          <Card><CardContent className="pt-6">세특 사항 입력 폼 (준비 중)</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
