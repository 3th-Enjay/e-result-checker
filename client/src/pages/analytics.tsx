import { useMemo } from "react";
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
import { AlertCircle, CheckCircle2, FileText, KeyRound, School, Users } from "lucide-react";
import type { PIN, PINRequest, Result, ResultSheet, School as SchoolType } from "@shared/schema";
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
  unusedPins?: number;
  pendingResults?: number;
  pendingPinRequests?: number;
}

const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Analytics() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role as string;
  const isSuperAdmin = role === "super_admin";
  const isSchoolAdmin = role === "school_admin";

  const { data: stats } = useQuery<DashboardStats>({ queryKey: ["/api/analytics/dashboard"] });
  const { data: results = [] } = useQuery<Result[]>({ queryKey: ["/api/results"], enabled: !isSuperAdmin });
  const { data: sheets = [] } = useQuery<ResultSheet[]>({ queryKey: ["/api/result-sheets"], enabled: !isSuperAdmin });
  const { data: pins = [] } = useQuery<PIN[]>({ queryKey: ["/api/pins"], enabled: !isSuperAdmin });
  const { data: pinRequests = [] } = useQuery<PINRequest[]>({ queryKey: ["/api/pin-requests"], enabled: role !== "teacher" });
  const { data: schools = [] } = useQuery<SchoolType[]>({ queryKey: ["/api/schools"], enabled: isSuperAdmin });

  const resultTrend = useMemo(() => buildResultTrend(results), [results]);
  const resultStatus = useMemo(() => buildResultStatusDistribution(results), [results]);
  const performanceBands = useMemo(() => buildPerformanceBands(results), [results]);
  const pinUsage = useMemo(() => buildPinUsageDistribution(pins), [pins]);
  const requestStatus = useMemo(() => buildPinRequestDistribution(pinRequests), [pinRequests]);
  const sheetStatus = useMemo(() => buildSheetStatusDistribution(sheets), [sheets]);
  const topClasses = useMemo(() => buildTopClasses(results), [results]);
  const activity = useMemo(() => buildActivityTimeline({ results, sheets, pins, pinRequests, schools }), [results, sheets, pins, pinRequests, schools]);
  const insights = useMemo(() => buildInsightMessages({ results, sheets, pins, pinRequests }), [results, sheets, pins, pinRequests]);

  const schoolHealth = useMemo(() => {
    const active = schools.filter((school) => school.isActive).length;
    const pending = schools.length - active;
    return [
      { name: "active", label: "Active", value: active },
      { name: "pending", label: "Pending", value: pending },
    ];
  }, [schools]);

  const schoolGrowth = useMemo(() => {
    const grouped = new Map<string, { label: string; schools: number }>();
    for (const school of schools) {
      const date = new Date(String(school.createdAt));
      const label = date.toLocaleString("en-US", { month: "short" });
      const current = grouped.get(label) ?? { label, schools: 0 };
      current.schools += 1;
      grouped.set(label, current);
    }
    return Array.from(grouped.values()).slice(-6);
  }, [schools]);

  return (
    <div className="page-shell space-y-6 lg:space-y-8">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="premium-shell border-white/10 bg-card/92">
          <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="section-kicker">Analytics layer</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {isSuperAdmin ? "Portfolio visibility for every school" : "Academic intelligence for every release cycle"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {isSuperAdmin
                  ? "See adoption, approvals, and request pressure across the institutions using the platform."
                  : "Measure grading velocity, release readiness, and performance distribution with cleaner operational context."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Primary signal</p>
                <p className="mt-3 text-sm font-medium">
                  {isSuperAdmin ? `${schoolHealth[0]?.value ?? 0} active schools in portfolio` : `${stats?.pendingResults ?? 0} results awaiting action`}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Attention needed</p>
                <p className="mt-3 text-sm font-medium">
                  {role !== "teacher" ? `${stats?.pendingPinRequests ?? 0} pending PIN requests` : `${sheetStatus.find((item) => item.name === "submitted")?.value ?? 0} submitted sheets`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {isSuperAdmin ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Schools" value={stats?.totalSchools ?? 0} detail="Institutions connected to the platform" icon={School} tone="primary" />
            <MetricCard label="Users" value={stats?.totalUsers ?? 0} detail="Admins and teachers across all schools" icon={Users} tone="violet" />
            <MetricCard label="Pending PIN Requests" value={stats?.pendingPinRequests ?? 0} detail="Requests awaiting platform action" icon={AlertCircle} tone="amber" />
            <MetricCard label="Students" value={stats?.totalStudents ?? 0} detail="Total learners represented in the portfolio" icon={FileText} tone="emerald" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <CardTitle className="text-xl">School Activation Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[320px]" config={{ active: { label: "Active", color: "hsl(var(--chart-2))" }, pending: { label: "Pending", color: "hsl(var(--chart-4))" } }}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={schoolHealth} dataKey="value" nameKey="label" innerRadius={68} outerRadius={110} paddingAngle={4}>
                      {schoolHealth.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index + 1]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <CardTitle className="text-xl">School Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[320px]" config={{ schools: { label: "Schools", color: "hsl(var(--chart-1))" } }}>
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
            <MetricCard label="Published Results" value={resultStatus.find((item) => item.name === "published")?.value ?? 0} detail="Records already released to students" icon={CheckCircle2} tone="emerald" />
            <MetricCard label="Submitted Results" value={resultStatus.find((item) => item.name === "submitted")?.value ?? 0} detail="Awaiting approval or action" icon={AlertCircle} tone="amber" />
            <MetricCard label="Active PINs" value={pinUsage.available} detail="PINs with remaining usage capacity" icon={KeyRound} tone="primary" />
            <MetricCard label="Top Class Avg" value={topClasses[0] ? `${topClasses[0].average}%` : "-"} detail={topClasses[0] ? `${topClasses[0].className} leads current averages` : "No class ranking yet"} icon={School} tone="violet" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <CardTitle className="text-xl">Result Trend by Term</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[320px]" config={{ total: { label: "Total", color: "hsl(var(--chart-1))" }, approved: { label: "Approved", color: "hsl(var(--chart-2))" }, pending: { label: "Pending", color: "hsl(var(--chart-4))" } }}>
                  <AreaChart data={resultTrend}>
                    <defs>
                      <linearGradient id="analyticsArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area type="monotone" dataKey="total" stroke="var(--color-total)" fill="url(#analyticsArea)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="approved" stroke="var(--color-approved)" fillOpacity={0} strokeWidth={2} />
                    <Area type="monotone" dataKey="pending" stroke="var(--color-pending)" fillOpacity={0} strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <CardTitle className="text-xl">Insight Cards</CardTitle>
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
              </CardContent>
            </Card>

            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <CardTitle className="text-xl">Result Status Mix</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                <ChartContainer className="h-[280px]" config={{ draft: { label: "Draft", color: "hsl(var(--chart-5))" }, submitted: { label: "Submitted", color: "hsl(var(--chart-4))" }, approved: { label: "Approved", color: "hsl(var(--chart-2))" }, published: { label: "Published", color: "hsl(var(--chart-1))" }, rejected: { label: "Rejected", color: "hsl(var(--destructive))" } }}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={resultStatus} dataKey="value" nameKey="label" innerRadius={64} outerRadius={94} paddingAngle={4}>
                      {resultStatus.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="space-y-3">
                  {resultStatus.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index] }} />
                        <span>{item.label}</span>
                      </div>
                      <span className="mono-data font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {isSchoolAdmin && (
            <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <Card className="premium-shell border-white/10 bg-card/92">
                <CardHeader>
                  <CardTitle className="text-xl">PIN Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pinUsage.summary.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index + 1] }} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className="mono-data font-semibold">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="premium-shell border-white/10 bg-card/92">
                <CardHeader>
                  <CardTitle className="text-xl">PIN Request Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer className="h-[300px]" config={{ value: { label: "Requests", color: "hsl(var(--chart-1))" } }}>
                    <BarChart data={requestStatus}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                        {requestStatus.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index + 1]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </section>
          )}
        </>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="premium-shell border-white/10 bg-card/92">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity Timeline</CardTitle>
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
                <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                  No class performance data yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
