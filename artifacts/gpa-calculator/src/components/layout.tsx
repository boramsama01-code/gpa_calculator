import React from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { Calculator, BarChart3, Settings, BookOpen, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const navigation = [
    { name: "대시보드", href: "/", icon: BarChart3 },
    { name: "성적/활동 입력", href: "/input", icon: Calculator },
    { name: "분석 결과", href: "/results", icon: BarChart3 },
    { name: "AI 컨설팅", href: "/consulting", icon: BookOpen },
    { name: "관리자 설정", href: "/admin", icon: Settings },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4 py-2">
          <span className="font-bold text-lg text-primary tracking-tight">입시 관리 도구</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.firstName || "학생/학부모"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.emailAddresses?.[0]?.emailAddress}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground" 
            onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex md:hidden h-14 items-center justify-between border-b border-border bg-card px-4">
          <span className="font-bold text-lg text-primary">입시 관리 도구</span>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
