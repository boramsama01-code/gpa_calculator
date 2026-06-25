import React from "react";
import { useGetStudentProfile, useListGrades } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Calculator, FileText, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: profile, isLoading: isLoadingProfile } = useGetStudentProfile({
    query: { queryKey: ["profile"] }
  });
  const { data: grades, isLoading: isLoadingGrades } = useListGrades({
    query: { queryKey: ["grades"] }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground mt-1">입시 준비 현황을 한눈에 확인하세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">입력된 성적</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingGrades ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold">{grades?.length || 0}건</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">목표 학교 수</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingProfile ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold">{profile?.targetSchoolTypes?.length || 0}개</div>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold tracking-tight mt-8 mb-4">빠른 이동</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              성적 및 활동 입력하기
            </CardTitle>
            <CardDescription>학기별 성적, 수상 경력, 창체 활동을 입력하고 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/input">
              <Button className="w-full">
                입력 마법사 시작 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              분석 결과 확인
            </CardTitle>
            <CardDescription>입력된 데이터를 바탕으로 목표 학교의 합격 가능성을 분석합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/results">
              <Button variant="outline" className="w-full">
                결과 리포트 보기 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
