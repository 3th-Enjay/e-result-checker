import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileText,
  GraduationCap,
  Key,
  School,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import type { PIN, PINRequest, Result, ResultSheet, School as SchoolType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  buildActivityTimeline,
  buildInsightMessages,
  buildPerformanceBands,
  buildPinRequestDistribution,
  buildPinUsageDistribution,
  buildResultStatusDistribution,
  buildResultTrend,
  buildSheetStatusDistribution,
  buildTopClasses,
} from "@/lib/dashboard-insights";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalSchools?: number;
  totalUsers?: number;
  totalStudents?: number;
  totalResults?: number;
  totalPins?: number;
  usedPins?: number;
  unusedPins?: number;
  pendingResults?: number;
  approvedResults?: number;
  rejectedResults?: number;
  pendingPinRequests?: number;
}

const statusColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role as string;
  const isSuperAdmin = role === "super_admin";
  const isSchoolAdmin = role === "school_admin";

  const { data: stats, isLoading } = useQuery<DashboardStats>({ queryKey: ["/api/analytics/dashboard"] });
  const { data: results = [] } = useQuery<Result[]>({ queryKey: ["/api/results"], enabled: !isSuperAdmin });
  const { data: sheets = [] } = useQuery<ResultSheet[]>({ queryKey: ["/api/result-sheets"], enabled: !isSuperAdmin });
  const { data: pins = [] } = useQuery<PIN[]>({ queryKey: ["/api/pins"], enabled: !isSuperAdmin });
  const { data: pinRequests = [] } = useQuery<PINRequest[]>({ queryKey: ["/api/pin-requests"], enabled: role !== "teacher" });
  const { data: schools = [] } = useQuery<SchoolType[]>({ queryKey: ["/api/schools"], enabled: isSuperAdmin });

  const resultTrend = useMemo(() => buildResultTrend(results), [results]);
  const resultStatus = useMemo(() => buildResultStatusDistribution(results), [results]);
  const sheetStatus = useMemo(() => buildSheetStatusDistribution(sheets), [sheets]);
  const performanceBands = useMemo(() => buildPerformanceBands(results), [results]);
  const pinUsage = useMemo(() => buildPinUsageDistribution(pins), [pins]);
  const requestStatus = useMemo(() => buildPinRequestDistribution(pinRequests), [pinRequests]);
  const topClasses = useMemo(() => buildTopClasses(results), [results]);
  const activity = useMemo(() => buildActivityTimeline({ results, sheets, pins, pinRequests, schools }), [results, sheets, pins, pinRequests, schools]);
  const insights = useMemo(() => buildInsightMessages({ results, sheets, pins, pinRequests }), [results, sheets, pins, pinRequests]);

  const schoolHealth = useMemo(() => {
    const active = schools.filter((school) => school.isActive).length;
    const inactive = schools.length - active;
    return [
      { name: "active", label: "Active", value: active },
      { name: "inactive", label: "Pending", value: inactive },
    ];
  }, [schools]);

  const schoolGrowth = useMemo(() => {
    const grouped = new Map<string, { label: string; schools: number }>();
    for (const school of schools) {
      const date = new Date(String(school.createdAt));
      const label = date.toLocaleString("en-US", { month: "short" });
      const item = grouped.get(label) ?? { label, schools: 0 };
      item.schools += 1;
      grouped.set(label, item);
    }
    return Array.from(grouped.values()).slice(-6);
  }, [schools]);

  const quickLinks = isSuperAdmin
    ? [
        { href: "/schools", label: "Manage schools" },
        { href: "/users", label: "Review users" },
        { href: "/analytics", label: "Open analytics" },
      ]
    : isSchoolAdmin
      ? [
          { href: "/results", label: "Review results" },
          { href: "/pins", label: "Manage PINs" },
          { href: "/students", label: "Open student directory" },
        ]
      : [
          { href: "/results", label: "Continue result entry" },
          { href: "/students", label: "Review class list" },
          { href: "/analytics", label: "Open my analytics" },
        ];

  return (
    <div className="page-shell space-y-6 lg:space-y-8">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="premium-shell overflow-hidden border-white/10 bg-card/92">
          <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <span className="section-kicker">Role-aware dashboard</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {user.firstName || "there"}.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {isSuperAdmin
                  ? "Monitor portfolio growth, activation health, and platform operations from one clean control center."
                  : isSchoolAdmin
                    ? "Track school readiness, keep approvals moving, and maintain confident result delivery."
                    : "Stay focused on your teaching workflow, submissions, and classroom performance signals."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 px-3 py-1 text-primary">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Operational trust
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  <TrendingUp className="mr-1 h-3.5 w-3.5" /> Premium workflow visibility
                </Badge>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {quickLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="outline" className="h-auto w-full justify-between rounded-2xl px-4 py-4 text-left">
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {isSuperAdmin ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Schools" value={isLoading ? "-" : stats?.totalSchools || 0} detail="Institutions in your portfolio" icon={School} tone="primary" />
            <MetricCard label="Total Users" value={isLoading ? "-" : stats?.totalUsers || 0} detail="Admins and teachers on the platform" icon={Users} tone="violet" />
            <MetricCard label="Total Students" value={isLoading ? "-" : stats?.totalStudents || 0} detail="Students represented across connected schools" icon={GraduationCap} tone="emerald" />
            <MetricCard label="Total Results" value={isLoading ? "-" : stats?.totalResults || 0} detail="Recorded results in the system" icon={FileText} tone="amber" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <CardTitle className="text-xl">School Portfolio Health</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <ChartContainer
                    className="h-[260px]"
                    config={{ active: { label: "Active", color: "hsl(var(--chart-2))" }, inactive: { label: "Pending", color: "hsl(var(--chart-4))" } }}
                  >
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie data={schoolHealth} dataKey="value" nameKey="label" innerRadius={70} outerRadius={100} paddingAngle={4}>
                        {schoolHealth.map((entry, index) => (
                          <Cell key={entry.name} fill={statusColors[index]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="space-y-4">
                  {schoolHealth.map((item, index) => (
                    <div key={item.name} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{item.label}</p>
                          <p className="mono-data mt-2 text-2xl font-bold">{item.value}</p>
                        </div>
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: statusColors[index] }} />
                      </div>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm leading-7 text-muted-foreground">
                    Use the schools workspace to activate pending institutions and keep portfolio onboarding consistent.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <CardTitle className="text-xl">New School Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[320px]"
                  config={{ schools: { label: "Schools", color: "hsl(var(--chart-1))" } }}
                >
                  <BarChart data={schoolGrowth}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                    <Bar dataKey="schools" fill="var(--color-schools)" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label={isSchoolAdmin ? "Students" : "My Students"} value={isLoading ? "-" : stats?.totalStudents || 0} detail={isSchoolAdmin ? "Learners currently enrolled" : "Students under your result workflow"} icon={GraduationCap} tone="primary" />
            <MetricCard label={isSchoolAdmin ? "Teachers" : "Results Uploaded"} value={isLoading ? "-" : isSchoolAdmin ? stats?.totalUsers || 0 : stats?.totalResults || 0} detail={isSchoolAdmin ? "Active staff participating in delivery" : "Submitted or drafted result records"} icon={isSchoolAdmin ? Users : FileText} tone="violet" />
            <MetricCard label={isSchoolAdmin ? "Available PINs" : "Pending Approval"} value={isLoading ? "-" : isSchoolAdmin ? stats?.unusedPins || 0 : stats?.pendingResults || 0} detail={isSchoolAdmin ? "PINs with remaining usage" : "Items waiting for admin review"} icon={isSchoolAdmin ? Key : Clock3} tone="emerald" />
            <MetricCard label="Result Sheets" value={sheets.length} detail="Draft, submitted, or approved sheets in circulation" icon={ClipboardList} tone="amber" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">Result Throughput</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Term-by-term flow of submissions and approved releases</p>
                </div>
                <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 text-primary">Performance</Badge>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-[320px]"
                  config={{ total: { label: "Total", color: "hsl(var(--chart-1))" }, approved: { label: "Approved", color: "hsl(var(--chart-2))" }, pending: { label: "Pending", color: "hsl(var(--chart-4))" } }}
                >
                  <AreaChart data={resultTrend}>
                    <defs>
                      <linearGradient id="throughputTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area type="monotone" dataKey="total" stroke="var(--color-total)" fill="url(#throughputTotal)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="approved" stroke="var(--color-approved)" fillOpacity={0} strokeWidth={2} />
                    <Area type="monotone" dataKey="pending" stroke="var(--color-pending)" fillOpacity={0} strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <CardTitle className="text-xl">Actionable Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.title} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="font-semibold">{insight.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{insight.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <CardTitle className="text-xl">Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[310px]" config={{ draft: { label: "Draft", color: "hsl(var(--chart-5))" }, submitted: { label: "Submitted", color: "hsl(var(--chart-4))" }, approved: { label: "Approved", color: "hsl(var(--chart-2))" }, published: { label: "Published", color: "hsl(var(--chart-1))" }, rejected: { label: "Rejected", color: "hsl(var(--destructive))" } }}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={resultStatus} dataKey="value" nameKey="label" innerRadius={64} outerRadius={102} paddingAngle={4}>
                      {resultStatus.map((entry, index) => (
                        <Cell key={entry.name} fill={statusColors[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-5 grid gap-3">
                  {resultStatus.map((status, index) => (
                    <div key={status.name} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[index] }} />
                        <span>{status.label}</span>
                      </div>
                      <span className="mono-data font-semibold">{status.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {isSchoolAdmin && (
                <Card className="premium-shell border-white/10 bg-card/92">
                  <CardHeader>
                    <CardTitle className="text-xl">PIN & Request Health</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      {pinUsage.summary.map((item, index) => (
                        <div key={item.name} className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{item.label}</p>
                              <p className="mono-data mt-2 text-2xl font-bold">{item.value}</p>
                            </div>
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: statusColors[index] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <ChartContainer className="h-[240px]" config={{ pending: { label: "Pending", color: "hsl(var(--chart-4))" }, approved: { label: "Approved", color: "hsl(var(--chart-2))" }, rejected: { label: "Rejected", color: "hsl(var(--destructive))" } }}>
                        <BarChart data={requestStatus}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                          <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                          <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                            {requestStatus.map((entry, index) => (
                              <Cell key={entry.name} fill={statusColors[index + 1]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="premium-shell border-white/10 bg-card/92">
                <CardHeader>
                  <CardTitle className="text-xl">Top Performing Classes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topClasses.length > 0 ? topClasses.map((item, index) => (
                    <div key={item.className} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">#{index + 1} {item.className}</p>
                        <p className="text-xs text-muted-foreground">{item.count} result entries</p>
                      </div>
                      <Badge variant="outline" className="mono-data rounded-full border-primary/15 bg-primary/10 text-primary">{item.average}% avg</Badge>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                      No class performance data yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="premium-shell border-white/10 bg-card/92">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length > 0 ? activity.map((event) => (
              <div key={`${event.group}-${event.id}`} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">{formatDistanceToNow(new Date(String(event.createdAt)), { addSuffix: true })}</Badge>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                Activity will appear here as your team works.
              </div>
            )}
          </CardContent>
        </Card>

        {!isSuperAdmin && (
          <Card className="premium-shell border-white/10 bg-card/92">
            <CardHeader>
              <CardTitle className="text-xl">Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[320px]" config={{ count: { label: "Results", color: "hsl(var(--chart-1))" } }}>
                <BarChart data={performanceBands}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="band" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ChartContainer>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {sheetStatus.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[index] }} />
                      <span>Sheets {item.label}</span>
                    </div>
                    <span className="mono-data font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

