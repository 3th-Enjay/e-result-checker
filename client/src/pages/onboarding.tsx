import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, Loader2, Sparkles, ArrowRight, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type OnboardingStep = {
  id: string;
  title: string;
  done: boolean;
  nextActionUrl: string;
  progressHint?: string;
};

type OnboardingStatus = {
  completionPercent: number;
  steps: OnboardingStep[];
  nextStepId?: string;
};

export default function Onboarding() {
  const { data, isLoading } = useQuery<OnboardingStatus>({
    queryKey: ["/api/onboarding/status"],
  });

  const nextStep = useMemo(() => {
    if (!data) return null;
    return data.steps.find((s) => !s.done) ?? null;
  }, [data]);

  const canGoToDashboard = Boolean(data && data.completionPercent >= 100);

  return (
    <div className="page-shell space-y-6 lg:space-y-8">
      <div className="premium-shell overflow-hidden border-white/10 bg-card/92">
        <div className="relative flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <span className="section-kicker">Phase 2 onboarding</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Finish setup to unlock full operations
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                This dashboard stays fast on purpose: complete the checklist below and then continue to your school workspace.
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 text-primary">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> Guided checklist
              </Badge>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-semibold mono-data">{data?.completionPercent ?? 0}%</div>
                <div className="text-sm text-muted-foreground">{data && data.completionPercent >= 100 ? "Complete" : "In progress"}</div>
              </div>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-border/70">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#1e3a8a,#2563eb,#10b981)] transition-all"
              style={{ width: `${data?.completionPercent ?? 0}%` }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(data?.steps ?? []).map((step) => (
              <Card
                key={step.id}
                className="border-border/70 bg-background/70 shadow-none"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ClipboardList className="h-4 w-4 text-primary" />
                        )}
                        <p className="font-semibold">{step.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {step.progressHint ?? (step.done ? "Completed" : "Not completed yet")}
                      </p>
                    </div>
                    {step.done ? (
                      <Badge variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Done
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    {step.done ? (
                      <Button variant="outline" disabled className="w-full rounded-xl">
                        Completed
                      </Button>
                    ) : (
                      <Link href={step.nextActionUrl}>
                        <Button className="w-full rounded-xl gap-2">
                          Continue <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading onboarding progress...
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {nextStep ? (
                  <>
                    Next up: <span className="font-semibold text-foreground">{nextStep.title}</span>
                  </>
                ) : (
                  <>Everything is completed. You can continue.</>
                )}
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard">
                  <Button disabled={!canGoToDashboard} variant="outline" className="rounded-xl">
                    Go to dashboard
                  </Button>
                </Link>
                {nextStep ? (
                  <Link href={nextStep.nextActionUrl}>
                    <Button className="rounded-xl gap-2">
                      Start {nextStep.id} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

