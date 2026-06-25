import React from "react";
import { useListPolicies } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const { data: policies, isLoading } = useListPolicies({
    query: { queryKey: ["policies"] }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">관리자 설정</h1>
        <p className="text-muted-foreground mt-1">지역별 입시 정책 및 반영 비율 관리</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>등록된 입시 정책 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지역명</TableHead>
                  <TableHead>대상 연도</TableHead>
                  <TableHead>총점</TableHead>
                  <TableHead>교과 배점</TableHead>
                  <TableHead>출결/봉사/활동 배점</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies?.map(policy => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.regionName}</TableCell>
                    <TableCell>{policy.targetYear}</TableCell>
                    <TableCell>{policy.totalMaxScore}</TableCell>
                    <TableCell>{policy.academicScore}</TableCell>
                    <TableCell>
                      {policy.attendanceScore} / {policy.volunteerScore} / {policy.activityScore}
                    </TableCell>
                  </TableRow>
                ))}
                {(!policies || policies.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      등록된 정책이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
