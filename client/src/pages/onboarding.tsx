import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, Loader2, Sparkles, ArrowRight, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OnboardingAssistantOutput } from "@shared/onboarding";

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
  assistant?: OnboardingAssistantOutput;
};

export default function Onboarding() {
  const STORAGE_KEY = "onboarding_status_cache_v1";
  const [cachedStatus, setCachedStatus] = useState<OnboardingStatus | null>(null);
  const { data, isLoading } = useQuery<OnboardingStatus>({
    queryKey: ["/api/onboarding/status"],
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as OnboardingStatus;
      if (parsed && typeof parsed.completionPercent === "number" && Array.isArray(parsed.steps)) {
        setCachedStatus(parsed);
      }
    } catch {
      // Ignore cache failures.
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore cache failures.
    }
  }, [data]);

  const status = data ?? cachedStatus;

  const nextStep = useMemo(() => {
    if (!status) return null;
    return status.steps.find((s) => !s.done) ?? null;
  }, [status]);

  const canGoToDashboard = Boolean(status && status.completionPercent >= 100);

  const stepOrder = status?.steps?.map((s) => s.id) ?? [];
  const doneById = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const s of status?.steps ?? []) map.set(s.id, s.done);
    return map;
  }, [status]);

  const canAccessStep = (stepId: string) => {
    const idx = stepOrder.indexOf(stepId);
    if (idx <= 0) return true;
    const prereqs = stepOrder.slice(0, idx);
    return prereqs.every((id) => doneById.get(id) === true);
  };

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
                <div className="text-2xl font-semibold mono-data">{status?.completionPercent ?? 0}%</div>
                <div className="text-sm text-muted-foreground">
                  {status && status.completionPercent >= 100 ? "Complete" : "In progress"}
                </div>
              </div>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-border/70">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#1e3a8a,#2563eb,#10b981)] transition-all"
              style={{ width: `${status?.completionPercent ?? 0}%` }}
            />
          </div>

          {isLoading && !status ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading onboarding progress...
            </div>
          ) : (
            <>
              {status?.assistant ? (
                <Card className="border-border/70 bg-background/70 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" /> Contextual AI help
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {status.assistant.assistantSummary}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="rounded-full">
                          {status.assistant.trustSignal.label}
                        </Badge>
                        <Badge variant="outline" className="rounded-full mono-data">
                          Suggested code: {status.assistant.suggestedSchoolCode}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recommended classes</p>
                        <div className="flex flex-wrap gap-2">
                          {status.assistant.recommendedClasses.map((c) => (
                            <Badge key={c} variant="secondary" className="rounded-full">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recommended subjects</p>
                        <div className="flex flex-wrap gap-2">
                          {status.assistant.recommendedSubjects.map((s) => (
                            <Badge key={s} variant="secondary" className="rounded-full">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {(status?.steps ?? []).map((step) => {
                  const prerequisitesOk = canAccessStep(step.id);
                  const locked = !step.done && !prerequisitesOk;
                  return (
                    <Card key={step.id} className="border-border/70 bg-background/70 shadow-none">
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
                              {locked
                                ? "Complete previous steps first to unlock this setup."
                                : step.progressHint ?? (step.done ? "Completed" : "Not completed yet")}
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
                          ) : locked ? (
                            <Button variant="outline" disabled className="w-full rounded-xl">
                              Locked
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
                  );
                })}
              </div>

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
                      <Button className="rounded-xl gap-2" disabled={!canAccessStep(nextStep.id)}>
                        Start {nextStep.id} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

