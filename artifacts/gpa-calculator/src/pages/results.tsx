import React from "react";
import { useCalculateResults } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsPage() {
  const { data: results, isLoading } = useCalculateResults({
    query: { queryKey: ["results"] }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">분석 결과</h1>
        <p className="text-muted-foreground mt-1">내신 환산 점수 및 목표 학교별 달성률을 확인하세요.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : results ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">총 환산 점수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{results.totalScore.toFixed(2)}점</div>
                <p className="text-xs text-muted-foreground mt-1">만점: {results.maxPossibleScore}점</p>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">영역별 점수 비중</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 items-center">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>교과</span>
                    <span className="font-medium">{results.breakdown.academicScore?.toFixed(1) || 0}점</span>
                  </div>
                  <Progress value={(results.breakdown.academicScore || 0) / (results.maxPossibleScore || 1) * 100} />
                </div>
                {/* Other scores mocked for brevity */}
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold tracking-tight mt-8 mb-4">목표 학교별 분석</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {results.schoolResults?.map((school, idx) => (
              <Card key={idx} className={school.status === "충족" ? "border-green-500" : ""}>
                <CardHeader>
                  <CardTitle>{school.schoolName}</CardTitle>
                  <CardDescription>{school.schoolType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">예상 커트라인</span>
                    <span className="font-medium">{school.estimatedCutoff}점</span>
                  </div>
                  <div className={`mt-4 px-3 py-1 inline-flex text-sm rounded-full font-medium ${
                    school.status === "충족" ? "bg-green-100 text-green-800" : 
                    school.status === "근접" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-red-100 text-red-800"
                  }`}>
                    {school.status}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            계산할 성적 데이터가 부족합니다. 입력을 먼저 진행해주세요.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
