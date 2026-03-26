import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { createSchoolCode, slugifySchoolName } from "@shared/onboarding";

type StepId =
  | "schoolName"
  | "adminEmail"
  | "password"
  | "confirmPassword"
  | "preferredSubdomain"
  | "review";

type RegisterFormData = {
  schoolName: string;
  adminEmail: string;
  password: string;
  confirmPassword: string;
  preferredSubdomain: string;
};

type AssistantResponse = {
  suggestedSchoolCode: string;
  suggestedSubdomain: string;
  subdomainCandidates: string[];
  trustSignal: {
    level: "high" | "medium" | "review";
    label: string;
    description: string;
  };
  assistantSummary: string;
  subdomainAvailable?: boolean;
};

const REGISTER_DRAFT_KEY = "register_draft_v3";
const stepOrder: StepId[] = ["schoolName", "adminEmail", "password", "confirmPassword", "preferredSubdomain", "review"];

const emptyForm: RegisterFormData = {
  schoolName: "",
  adminEmail: "",
  password: "",
  confirmPassword: "",
  preferredSubdomain: "",
};

function emailLooksValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeSubdomainInput(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\.smartresult\.app\/?$/, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getStepError(stepId: StepId, formData: RegisterFormData) {
  if (stepId === "schoolName") {
    if (!formData.schoolName.trim()) return "School name is required";
    if (formData.schoolName.trim().length < 3) return "Use at least 3 characters";
    return "";
  }
  if (stepId === "adminEmail") {
    if (!formData.adminEmail.trim()) return "Admin email is required";
    if (!emailLooksValid(formData.adminEmail)) return "Enter a valid email";
    return "";
  }
  if (stepId === "password") {
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    return "";
  }
  if (stepId === "confirmPassword") {
    if (!formData.confirmPassword) return "Confirm your password";
    if (formData.confirmPassword !== formData.password) return "Passwords do not match";
    return "";
  }
  if (stepId === "preferredSubdomain") {
    if (!formData.preferredSubdomain) return "";
    if (formData.preferredSubdomain.length < 3) return "Subdomain must be at least 3 characters";
    return "";
  }
  return "";
}

function getValueForStep(stepId: StepId, formData: RegisterFormData) {
  if (stepId === "schoolName") return formData.schoolName;
  if (stepId === "adminEmail") return formData.adminEmail;
  if (stepId === "password") return formData.password;
  if (stepId === "confirmPassword") return formData.confirmPassword;
  if (stepId === "preferredSubdomain") return formData.preferredSubdomain;
  return "";
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(REGISTER_DRAFT_KEY);
    if (!raw) return { formData: emptyForm, stepId: "schoolName" as StepId };
    const parsed = JSON.parse(raw) as { formData?: Partial<RegisterFormData>; stepId?: StepId };
    return {
      formData: { ...emptyForm, ...parsed.formData },
      stepId: stepOrder.includes(parsed.stepId as StepId) ? (parsed.stepId as StepId) : ("schoolName" as StepId),
    };
  } catch {
    return { formData: emptyForm, stepId: "schoolName" as StepId };
  }
}

export default function Register() {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const initialDraft = useMemo(() => loadDraft(), []);

  const [formData, setFormData] = useState<RegisterFormData>(initialDraft.formData);
  const [currentStepId, setCurrentStepId] = useState<StepId>(initialDraft.stepId);
  const [assistant, setAssistant] = useState<AssistantResponse | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptedAdvance, setAttemptedAdvance] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    school?: { code?: string; subdomain?: string };
    emailDelivery?: { mode?: string };
    verificationPreviewUrl?: string;
  } | null>(null);

  const deferredSchoolName = useDeferredValue(formData.schoolName);
  const deferredAdminEmail = useDeferredValue(formData.adminEmail);
  const deferredSubdomain = useDeferredValue(formData.preferredSubdomain);

  const stepIndex = stepOrder.indexOf(currentStepId);
  const progressPercent = ((stepIndex + 1) / stepOrder.length) * 100;
  const currentError = getStepError(currentStepId, formData);
  const localSuggestedSubdomain = slugifySchoolName(formData.schoolName.trim() || "school-workspace");
  const previewSubdomain = formData.preferredSubdomain.trim() || assistant?.suggestedSubdomain || localSuggestedSubdomain;
  const previewSchoolCode = assistant?.suggestedSchoolCode || createSchoolCode(formData.schoolName.trim() || "School");

  useEffect(() => {
    if (result) return;
    localStorage.setItem(
      REGISTER_DRAFT_KEY,
      JSON.stringify({
        formData,
        stepId: currentStepId,
      }),
    );
  }, [formData, currentStepId, result]);

  useEffect(() => {
    setAttemptedAdvance(false);
    if (currentStepId === "review") return;
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 120);
    return () => window.clearTimeout(id);
  }, [currentStepId]);

  useEffect(() => {
    let cancelled = false;
    if (!deferredSchoolName.trim() || !emailLooksValid(deferredAdminEmail)) {
      setAssistant(null);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setAssistantLoading(true);
        const response = await fetch("/api/public/onboarding-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolName: deferredSchoolName.trim(),
            adminEmail: deferredAdminEmail.trim(),
            preferredSubdomain: normalizeSubdomainInput(deferredSubdomain) || undefined,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Unable to load assistant");
        if (!cancelled) setAssistant(payload);
      } catch {
        if (!cancelled) setAssistant(null);
      } finally {
        if (!cancelled) setAssistantLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [deferredSchoolName, deferredAdminEmail, deferredSubdomain]);

  const handleFieldChange = (name: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "preferredSubdomain" ? normalizeSubdomainInput(value) : value,
    }));
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setCurrentStepId(stepOrder[stepIndex - 1]);
  };

  const goNext = () => {
    if (currentStepId === "review") return;
    if (currentError) {
      setAttemptedAdvance(true);
      return;
    }
    setCurrentStepId(stepOrder[stepIndex + 1]);
  };

  const handleSubmit = async () => {
    const blockingStep = stepOrder.find((step) => getStepError(step, formData));
    if (blockingStep) {
      setCurrentStepId(blockingStep);
      setAttemptedAdvance(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/public/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: formData.schoolName.trim(),
          adminEmail: formData.adminEmail.trim(),
          adminPassword: formData.password,
          schoolCode: previewSchoolCode,
          preferredSubdomain: previewSubdomain,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Registration failed");

      localStorage.removeItem(REGISTER_DRAFT_KEY);
      setResult(payload);
      toast({ title: "Signup created", description: payload.message });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration failed", description: error.message || "Unable to register." });
    } finally {
      setLoading(false);
    }
  };

  const inputLabel = (() => {
    if (currentStepId === "schoolName") return "School name";
    if (currentStepId === "adminEmail") return "Admin email";
    if (currentStepId === "password") return "Create password";
    if (currentStepId === "confirmPassword") return "Confirm password";
    return "Preferred subdomain (optional)";
  })();

  const inputType = currentStepId === "adminEmail" ? "email" : currentStepId.includes("password") ? "password" : "text";
  const inputName = currentStepId as keyof RegisterFormData;
  const inputPlaceholder =
    currentStepId === "schoolName"
      ? "Greenfield Academy"
      : currentStepId === "adminEmail"
        ? "admin@school.edu.ng"
        : currentStepId === "password"
          ? "Minimum 6 characters"
          : currentStepId === "confirmPassword"
            ? "Re-enter password"
            : "greenfield-academy";

  const showInlineError = currentStepId !== "review" && currentError && (attemptedAdvance || Boolean(getValueForStep(currentStepId, formData)));

  if (result) {
    return (
      <div className="mesh-hero min-h-screen p-4 lg:p-6">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl items-center justify-center">
          <Card className="w-full premium-shell border-white/10 bg-card/94">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <BrandMark size="lg" />
                <div>
                  <p className="text-sm font-semibold">SmartResultChecker</p>
                  <p className="text-xs text-muted-foreground">Guided signup complete</p>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Your school account is created</CardTitle>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">School code</p>
                <p className="text-2xl font-semibold mono-data">{result.school?.code || previewSchoolCode}</p>
                <p className="mt-3 text-sm text-muted-foreground">Workspace</p>
                <p className="text-lg font-semibold">{(result.school?.subdomain || previewSubdomain)}.smartresult.app</p>
              </div>
              <div className="flex gap-3">
                {result.verificationPreviewUrl ? (
                  <Button className="rounded-xl" onClick={() => window.location.assign(result.verificationPreviewUrl!)}>Open verification link</Button>
                ) : null}
                <Link href="/login">
                  <Button variant="outline" className="rounded-xl">Go to login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-hero min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-background/65 shadow-2xl backdrop-blur-xl lg:grid-cols-[1fr_1fr]">
        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col">
          <div className="flex items-start justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-white hover:bg-white/10 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <ThemeToggle className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white" />
          </div>
          <div className="mt-16">
            <span className="section-kicker border-white/10 bg-white/10 text-white">Fast signup</span>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.05em]">One decision at a time.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              This signup captures only essentials, sends verification immediately, and leaves full setup for onboarding after approval.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-2xl">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                  <ArrowLeft className="h-4 w-4" /> Home
                </Button>
              </Link>
              <ThemeToggle className="rounded-xl" />
            </div>

            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BrandMark size="lg" />
                    <div>
                      <p className="text-sm font-semibold">SmartResultChecker</p>
                      <p className="text-xs text-muted-foreground">Minimal guided signup</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 text-primary">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Step {stepIndex + 1}/{stepOrder.length}
                  </Badge>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-border/70">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#1e3a8a,#2563eb,#10b981)] transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight">Register your school</CardTitle>
                <CardDescription>
                  {currentStepId === "review"
                    ? "Confirm details and create the pending school account."
                    : "Enter one field, continue, and keep momentum."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {currentStepId !== "review" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={currentStepId}>{inputLabel}</Label>
                      <Input
                        ref={inputRef}
                        id={currentStepId}
                        type={inputType}
                        value={getValueForStep(currentStepId, formData)}
                        placeholder={inputPlaceholder}
                        onChange={(e) => handleFieldChange(inputName, e.target.value)}
                        className="h-12 rounded-xl"
                      />
                      {showInlineError ? <p className="text-sm text-destructive">{currentError}</p> : null}
                    </div>
                    {currentStepId === "preferredSubdomain" ? (
                      <div className="text-xs text-muted-foreground">
                        Workspace preview: <span className="font-semibold text-foreground">{previewSubdomain}.smartresult.app</span>
                        {" · "}
                        {assistantLoading ? "Checking..." : assistant?.subdomainAvailable === false ? "Taken (we will suggest a safe alternative)." : "Looks good."}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">School name</span>
                      <span className="font-medium">{formData.schoolName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Admin email</span>
                      <span className="font-medium">{formData.adminEmail}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">School code</span>
                      <span className="font-semibold mono-data">{previewSchoolCode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Workspace</span>
                      <span className="font-semibold">{previewSubdomain}.smartresult.app</span>
                    </div>
                    {assistant ? (
                      <div className="mt-2 rounded-lg border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
                        <p className="font-semibold flex items-center gap-1 text-foreground"><Sparkles className="h-3.5 w-3.5" /> Assistant</p>
                        <p className="mt-1">{assistant.assistantSummary}</p>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <Button variant="outline" className="rounded-xl" onClick={goBack} disabled={stepIndex === 0 || loading}>
                    Back
                  </Button>
                  {currentStepId === "review" ? (
                    <Button className="rounded-xl gap-2" onClick={handleSubmit} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                      {loading ? "Creating..." : "Create School Account"}
                    </Button>
                  ) : (
                    <Button className="rounded-xl gap-2" onClick={goNext}>
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login">
                    <span className="cursor-pointer font-medium text-primary hover:underline">Login here</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

