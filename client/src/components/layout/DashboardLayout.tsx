import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { ReactNode } from "react";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrandMark } from "@/components/brand-mark";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  user: User | null;
  onLogout?: () => void;
}

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Command Center", subtitle: "A live view of performance, approvals, and school operations." },
  "/results": { title: "Result Operations", subtitle: "Manage sheets, review submissions, and keep grading workflows moving." },
  "/pins": { title: "PIN Intelligence", subtitle: "Secure access codes with visibility into usage and expiry." },
  "/analytics": { title: "Academic Analytics", subtitle: "Track readiness, quality, and performance signals across the platform." },
  "/students": { title: "Student Directory", subtitle: "Keep enrollment data accurate, organized, and ready for result cycles." },
  "/schools": { title: "School Portfolio", subtitle: "Oversee every institution with a consistent governance layer." },
  "/users": { title: "Team Management", subtitle: "Control roles, onboarding, and accountability across the workspace." },
  "/teachers": { title: "Teaching Staff", subtitle: "Coordinate ownership, assignments, and classroom delivery." },
  "/classes": { title: "Class Structure", subtitle: "Organize levels, arms, and operational capacity with less friction." },
  "/subjects": { title: "Subject Catalog", subtitle: "Manage curriculum coverage with clear subject mapping." },
  "/pin-requests": { title: "PIN Requests", subtitle: "Review requests with clarity and controlled turnarounds." },
  "/profile": { title: "Profile & Branding", subtitle: "Keep school identity, branding, and configuration polished." },
  "/score-metrics": { title: "Score Metrics", subtitle: "Define assessments with a grading model teams can trust." },
};

export function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const [location] = useLocation();
  const style = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "4.25rem",
  };

  const meta = pageMeta[location] ?? pageMeta["/dashboard"];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="mesh-hero flex min-h-screen w-full bg-background">
        <AppSidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-xl">
            <div className="page-shell py-4 lg:py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 pt-1 lg:hidden">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <BrandMark size="sm" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="section-kicker">Premium workspace</span>
                      <Badge variant="outline" className="border-primary/15 bg-primary/10 text-primary">
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Verified flow
                      </Badge>
                    </div>
                    <h1 className="mt-3 text-2xl font-bold tracking-tight lg:text-3xl">{meta.title}</h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground lg:text-base">{meta.subtitle}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <div className="hidden rounded-2xl border border-border/70 bg-card/80 px-4 py-2 shadow-sm lg:block">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Today</p>
                    <p className="mt-1 text-sm font-medium">{format(new Date(), "EEEE, d MMM yyyy")}</p>
                  </div>
                  <NotificationsDropdown />
                  <ThemeToggle className="rounded-xl" />
                  {user && (
                    <div className="hidden items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm sm:flex">
                      <Avatar className="h-9 w-9 border border-white/10">
                        <AvatarFallback className="bg-primary/12 text-primary text-sm font-semibold">
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left leading-tight">
                        <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  )}
                  {onLogout && (
                    <Button variant="outline" onClick={onLogout} data-testid="button-logout" className="rounded-xl gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Trust Signal</p>
                  <p className="mt-1 text-sm font-medium">Structured workflows reduce approval gaps and reporting errors.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Experience Goal</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-chart-4" /> Fast, premium, and stakeholder-ready.</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
