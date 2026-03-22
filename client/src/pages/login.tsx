import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

const highlights: Array<{ title: string; copy: string; icon: LucideIcon }> = [
  { title: "Approval control", copy: "Secure review and publish flow", icon: ShieldCheck },
  { title: "Fast operations", copy: "Fewer clicks for routine tasks", icon: Sparkles },
  { title: "Protected access", copy: "Role-aware authentication", icon: LockKeyhole },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      queryClient.cancelQueries();
      queryClient.clear();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });

      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-hero min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-background/65 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.26),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.22),transparent_26%)]" />
          <div className="relative flex items-start justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-white hover:bg-white/10 hover:text-white" data-testid="link-back-home">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <ThemeToggle className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white" />
          </div>

          <div className="relative mt-14 max-w-xl">
            <span className="section-kicker border-white/10 bg-white/10 text-white">Admin access</span>
            <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-[-0.06em]">
              Run school result operations with a UI that feels official.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Sign in to manage grading workflows, approvals, analytics, PIN issuance, and branded academic delivery from one premium workspace.
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <div key={highlight.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3"><Icon className="h-5 w-5" /></div>
                  <p className="font-semibold">{highlight.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{highlight.copy}</p>
                </div>
              );
            })}
          </div>

          <div className="relative mt-auto rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <BrandMark size="sm" className="shadow-none" />
              <div>
                <p className="text-sm font-semibold">Stakeholder-ready experience</p>
                <p className="text-xs text-slate-300">Structured like a system of record, polished like a premium SaaS product.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="flex items-center justify-center p-5 sm:p-8 lg:p-10"
        >
          <div className="w-full max-w-lg">
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 rounded-xl" data-testid="link-back-home-mobile">
                  <ArrowLeft className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <ThemeToggle className="rounded-xl" />
            </div>
            <Card className="premium-shell border-white/10 bg-card/92">
              <CardHeader className="space-y-4 px-6 pt-6 sm:px-8 sm:pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BrandMark size="lg" />
                    <div>
                      <p className="text-sm font-semibold">SmartResultChecker</p>
                      <p className="text-xs text-muted-foreground">Secure operator sign-in</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 text-primary">Trusted</Badge>
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6">
                    Use your admin or teacher credentials to access your workspace.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@school.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                      autoComplete="email"
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="input-password"
                      autoComplete="current-password"
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
                    Your dashboard adapts to your role so approvals, uploads, and analytics stay focused.
                  </div>

                  <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={loading} data-testid="button-submit">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Enter Dashboard"
                    )}
                  </Button>
                </form>

                <div className="surface-divider mt-6 space-y-3 pt-6 text-center text-sm text-muted-foreground">
                  <p>
                    Need to check a result?{" "}
                    <Link href="/check-result">
                      <span className="cursor-pointer font-medium text-primary hover:underline" data-testid="link-check-result">Use a PIN</span>
                    </Link>
                  </p>
                  <p>
                    Want to onboard your school?{" "}
                    <Link href="/register">
                      <span className="cursor-pointer font-medium text-primary hover:underline" data-testid="link-register">Register here</span>
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
