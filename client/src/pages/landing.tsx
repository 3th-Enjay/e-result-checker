import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Key,
  LayoutDashboard,
  LockKeyhole,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Trust-first approvals",
    copy: "Structured draft, review, and publish flows keep academic data official and auditable.",
  },
  {
    icon: LayoutDashboard,
    title: "Role-based clarity",
    copy: "Super admins, school admins, teachers, and students each get an interface tuned to their workflow.",
  },
  {
    icon: Key,
    title: "Secure PIN access",
    copy: "Result checking stays controlled with expiry-aware PINs, usage visibility, and clean distribution.",
  },
  {
    icon: BarChart3,
    title: "Operational insight",
    copy: "Monitor approvals, result volume, performance trends, and bottlenecks from a premium analytics layer.",
  },
];

const roleCards = [
  {
    title: "Super Admin",
    detail: "Portfolio-wide oversight, school activation, analytics, and PIN governance.",
  },
  {
    title: "School Admin",
    detail: "Operational control for results, approvals, staff, and school branding.",
  },
  {
    title: "Teacher",
    detail: "Fast sheet submission, less back-and-forth, and cleaner grading workflows.",
  },
  {
    title: "Student",
    detail: "Straightforward result retrieval with verified academic records and fewer steps.",
  },
];

const workflowSteps = [
  "Create classes, subjects, and staff structure",
  "Upload or enter scores with fewer manual calculations",
  "Review result sheets through clear approval checkpoints",
  "Publish verified results and distribute secure PIN access",
];

export default function Landing() {
  return (
    <div className="mesh-hero min-h-screen overflow-x-hidden">
      <div className="page-shell pb-0">
        <motion.nav
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.45 }}
          className="glass-panel flex items-center justify-between px-4 py-3 sm:px-6"
        >
          <div className="flex items-center gap-3">
            <BrandMark size="md" />
            <div>
              <p className="text-base font-semibold tracking-tight">SmartResultChecker</p>
              <p className="text-xs text-muted-foreground">Premium school result management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="rounded-xl" />
            <Link href="/check-result">
              <Button variant="outline" className="hidden rounded-xl sm:inline-flex" data-testid="link-check-result">
                Check Result
              </Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-xl" data-testid="link-login">Login</Button>
            </Link>
          </div>
        </motion.nav>
      </div>

      <section className="page-shell pt-10 lg:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.55 }}>
            <span className="section-kicker">Reliable like a system of record</span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.06em] text-balance sm:text-6xl">
              Premium school result operations with <span className="headline-gradient">clarity, trust, and speed</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Built for schools that need official-looking workflows, stakeholder confidence, and enterprise-grade control over grading, approvals, analytics, and result access.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="hero-ring rounded-2xl px-7" data-testid="button-register-hero">
                  Start your school workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/check-result">
                <Button size="lg" variant="outline" className="rounded-2xl px-7" data-testid="button-check-result-hero">
                  Check result with PIN
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 px-3 py-1 text-primary">
                <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Approval workflow
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                <LockKeyhole className="mr-2 h-3.5 w-3.5" /> Secure PIN delivery
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Enterprise-grade UX
              </Badge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="premium-shell p-4 sm:p-6"
          >
            <div className="data-grid-bg rounded-[1.4rem] border border-border/60 bg-slate-950 px-4 py-4 text-white sm:px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Live dashboard</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">Academic Command Center</h2>
                </div>
                <BrandMark size="sm" className="shadow-none" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Results Ready", "1,248"],
                  ["Pending Approval", "38"],
                  ["Active PINs", "624"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
                    <p className="mt-3 mono-data text-2xl font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">Result throughput</p>
                      <p className="text-xs text-slate-400">Weekly grading activity</p>
                    </div>
                    <Badge className="border-0 bg-emerald-500/15 text-emerald-300">+18%</Badge>
                  </div>
                  <div className="flex h-36 items-end gap-3">
                    {[54, 72, 68, 96, 88, 110, 124].map((value, index) => (
                      <div key={index} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-2xl bg-gradient-to-t from-blue-500 to-indigo-300"
                          style={{ height: `${Math.max(value, 20)}px` }}
                        />
                        <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                          {"MTWTFSS"[index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <ClipboardList className="h-5 w-5 text-indigo-300" />
                    <div>
                      <p className="text-sm font-medium">Result sheet review queue</p>
                      <p className="text-xs text-slate-400">Prioritized by class and subject</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <Users className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="text-sm font-medium">Role-aware dashboards</p>
                      <p className="text-xs text-slate-400">Each team sees only what matters</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <BookOpenCheck className="h-5 w-5 text-amber-300" />
                    <div>
                      <p className="text-sm font-medium">Fewer manual errors</p>
                      <p className="text-xs text-slate-400">Cleaner data entry and summary visibility</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="page-shell pt-16 lg:pt-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} className="mb-8 max-w-2xl">
          <span className="section-kicker">Why it stands out</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Designed for schools that need to look credible in every interaction.</h2>
        </motion.div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              transition={{ delay: index * 0.06, duration: 0.4 }}
            >
              <Card className="premium-shell h-full border-white/10 bg-card/90">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.copy}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="page-shell pt-12 lg:pt-20">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="premium-shell border-white/10 bg-card/90">
            <CardContent className="p-6 sm:p-8">
              <span className="section-kicker">Built for every role</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight">One platform, tailored experiences.</h2>
              <div className="mt-6 space-y-4">
                {roleCards.map((role) => (
                  <div key={role.title} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="font-semibold">{role.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{role.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="premium-shell border-white/10 bg-slate-950 text-white">
            <CardContent className="p-6 sm:p-8">
              <span className="section-kicker border-white/10 bg-white/10 text-white">Operational flow</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight">Result management that feels structured from day one.</h2>
              <div className="mt-8 space-y-4">
                {workflowSteps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                      0{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{step}</p>
                      <p className="mt-1 text-sm text-slate-300">Designed to minimize friction, protect accuracy, and keep administrators in control.</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="page-shell py-16 lg:py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <Card className="premium-shell overflow-hidden border-white/10 bg-gradient-to-br from-primary via-primary to-chart-2 text-primary-foreground shadow-2xl">
            <CardContent className="relative p-8 sm:p-10 lg:p-12">
              <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_60%)] lg:block" />
              <div className="relative max-w-3xl">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/90">
                  Ready to start
                </span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Make your school’s result experience look official, modern, and trustworthy.</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-primary-foreground/85 sm:text-lg">
                  Launch a polished workspace for result entry, approvals, analytics, and PIN-based student access without settling for generic admin UI.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="rounded-2xl px-7 text-primary" data-testid="button-register-cta">
                      Register your school
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="rounded-2xl border-white/20 bg-white/10 px-7 text-white hover:bg-white/15" data-testid="button-login-cta">
                      Open the dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
