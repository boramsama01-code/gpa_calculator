import React, { useState } from "react";
import { useAnalyzeConsulting } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";

export default function ConsultingPage() {
  const [targetType, setTargetType] = useState("SCIENCE");
  
  const analyzeMutation = useAnalyzeConsulting();

  const handleAnalyze = () => {
    analyzeMutation.mutate({ data: { targetSchoolType: targetType } });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI 컨설팅 리포트</h1>
        <p className="text-muted-foreground mt-1">입력된 데이터를 바탕으로 AI가 맞춤형 입시 전략을 분석합니다.</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> 
              분석 대상 학교 유형
            </h3>
            <p className="text-sm text-muted-foreground">지원하고자 하는 학교 유형을 선택하면 AI가 강점과 약점을 분석합니다.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCIENCE">과학고/영재학교</SelectItem>
                <SelectItem value="FOREIGN">외고/국제고</SelectItem>
                <SelectItem value="AUTONOMOUS">전국단위 자사고</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending}>
              {analyzeMutation.isPending ? "분석 중..." : "분석 시작"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyzeMutation.data && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>종합 분석 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed text-sm">
                {analyzeMutation.data.analysis}
              </p>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            {analyzeMutation.data.academicExcellence && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">학업 역량</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{analyzeMutation.data.academicExcellence}</p>
                </CardContent>
              </Card>
            )}
            {analyzeMutation.data.inquiryCapability && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">탐구 역량 (세특 기반)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{analyzeMutation.data.inquiryCapability}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
