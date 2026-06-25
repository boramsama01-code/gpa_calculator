import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateGrade, useCreateActivity, useListPolicies, useSaveStudentProfile } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

export default function InputPage() {
  const [step, setStep] = useState("profile");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple state for demo
  const [regionId, setRegionId] = useState("");
  const [semester, setSemester] = useState("1-2");   // 자유학기 1-1 대신 1-2가 기본
  const [subject, setSubject] = useState("");
  const [rawScore, setRawScore] = useState("");

  const { data: policies } = useListPolicies({ query: { queryKey: ["policies"] } });

  const saveProfileMutation = useSaveStudentProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: "프로필 저장됨", description: "성공적으로 저장되었습니다." });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        setStep("grades");                       // 성공 시 다음 탭으로 이동
      },
      onError: (e: any) => {                      // 실패가 조용히 묻히던 원인
        toast({ title: "저장 실패", description: `${e?.status ?? ""} ${e?.message ?? "오류"}`, variant: "destructive" });
      },
    },
  });

  const createGradeMutation = useCreateGrade({
    mutation: {
      onSuccess: () => {
        toast({ title: "성적 저장됨", description: "성공적으로 추가되었습니다." });
        queryClient.invalidateQueries({ queryKey: ["grades"] });
        setSubject("");
        setRawScore("");
      },
      onError: (e: any) => {
        toast({ title: "저장 실패", description: `${e?.status ?? ""} ${e?.message ?? "오류"}`, variant: "destructive" });
      },
    },
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>1단계: 지역 및 목표 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>지원 지역 (시/도)</Label>
                <Select value={regionId} onValueChange={setRegionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies?.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.regionName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => saveProfileMutation.mutate({ data: { regionId: parseInt(regionId), targetSchoolTypes: ["SCIENCE"] } })}
                disabled={!regionId || saveProfileMutation.isPending}
              >
                저장 후 다음 단계로
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>2단계: 학기별 성적 입력</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>학기</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1학년 2학기</SelectItem>
                      <SelectItem value="2-1">2학년 1학기</SelectItem>
                      <SelectItem value="2-2">2학년 2학기</SelectItem>
                      <SelectItem value="3-1">3학년 1학기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>과목명</Label>
                  <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="예: 국어, 수학, 영어" />
                </div>
                <div className="space-y-2">
                  <Label>원점수</Label>
                  <Input type="number" value={rawScore} onChange={e => setRawScore(e.target.value)} placeholder="100" />
                </div>
              </div>
              <Button
                onClick={() => createGradeMutation.mutate({
                  data: { semester, subject, rawScore: parseInt(rawScore) }
                })}
                disabled={!subject || !rawScore || createGradeMutation.isPending}
              >
                성적 추가하기
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mocks for other tabs */}
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
