import { useMemo, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

function createSchoolCode(name: string) {
  const compact = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, "").slice(0, 1))
    .join("")
    .toUpperCase();

  const base = initials.length >= 3 ? initials : (initials + compact).slice(0, 6);
  return (base || "SCH").slice(0, 6);
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    schoolName: "",
    schoolCode: "",
    schoolEmail: "",
    schoolPhone: "",
    schoolAddress: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
    logo: "",
  });

  const suggestedSchoolCode = useMemo(() => createSchoolCode(formData.schoolName), [formData.schoolName]);
  const previewSchoolCode = formData.schoolCode.trim() || suggestedSchoolCode;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "schoolCode" ? value.replace(/\s+/g, "").toUpperCase() : value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please upload an image file" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 2MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoPreview(dataUrl);
      setFormData((prev) => ({ ...prev, logo: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const schoolCode = previewSchoolCode.toUpperCase();

    if (
      !formData.schoolName.trim() ||
      !schoolCode ||
      !formData.schoolEmail.trim() ||
      !formData.adminFirstName.trim() ||
      !formData.adminLastName.trim() ||
      !formData.adminEmail.trim() ||
      !formData.password
    ) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please complete the required school and admin fields before continuing.",
      });
      return;
    }

    if (schoolCode.length < 3) {
      toast({ variant: "destructive", title: "School code too short", description: "Use at least 3 characters for the school code." });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/public/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: formData.schoolName.trim(),
          schoolCode,
          schoolEmail: formData.schoolEmail.trim(),
          schoolPhone: formData.schoolPhone.trim(),
          schoolAddress: formData.schoolAddress.trim(),
          adminFirstName: formData.adminFirstName.trim(),
          adminLastName: formData.adminLastName.trim(),
          adminEmail: formData.adminEmail.trim(),
          adminPassword: formData.password,
          logo: formData.logo || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Registration failed");
      }

      const registeredCode = payload.school?.code || schoolCode;

      toast({
        title: "Registration Submitted",
        description: `Your school workspace was created with code ${registeredCode}. A super admin must approve the school and admin account before login.`,
      });

      setLocation("/login");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-hero min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-background/65 shadow-2xl backdrop-blur-xl lg:grid-cols-[0.96fr_1.04fr]">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.22),transparent_26%)]" />
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
            <span className="section-kicker border-white/10 bg-white/10 text-white">School onboarding</span>
            <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-[-0.06em]">
              Launch a branded result workspace that feels premium from day one.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Set up your school identity, admin owner, and approval-ready details in one polished onboarding flow.
            </p>
          </div>

          <div className="relative mt-10 space-y-4">
            {[
              "School branding carries through public result checks and internal dashboards",
              "Admin approval keeps new institutions controlled and trustworthy",
              "Structured signup reduces back-and-forth before the school goes live",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
                <div className="mt-0.5 rounded-full bg-emerald-400/15 p-1.5 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-sm leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-auto rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <BrandMark size="sm" className="shadow-none" />
              <div>
                <p className="text-sm font-semibold">Designed to build confidence</p>
                <p className="text-xs text-slate-300">A polished interface helps schools look organized, modern, and trustworthy from the first interaction.</p>
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
          <div className="w-full max-w-3xl">
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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <BrandMark size="lg" />
                    <div>
                      <p className="text-sm font-semibold">SmartResultChecker</p>
                      <p className="text-xs text-muted-foreground">Premium school onboarding</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 text-primary">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Structured
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold tracking-tight">Register your school</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6">
                    Create the school workspace, set the primary admin owner, and submit the account for activation.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-background/80 p-4 sm:grid-cols-[1.05fr_0.95fr]">
                    <div>
                      <p className="text-sm font-semibold">School profile</p>
                      <p className="mt-1 text-xs leading-6 text-muted-foreground">This powers school branding, communication, and the approval workflow.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 text-primary">
                        Pending approval
                      </Badge>
                      <Badge variant="outline" className="rounded-full mono-data">
                        Code: {previewSchoolCode}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name *</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        placeholder="Demo High School"
                        value={formData.schoolName}
                        onChange={handleChange}
                        required
                        data-testid="input-school-name"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolCode">School Code</Label>
                      <Input
                        id="schoolCode"
                        name="schoolCode"
                        placeholder={suggestedSchoolCode}
                        value={formData.schoolCode}
                        onChange={handleChange}
                        data-testid="input-school-code"
                        className="h-12 rounded-xl mono-data uppercase"
                      />
                      <p className="text-xs text-muted-foreground">Leave blank to use the suggested code, or enter your preferred short code.</p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="schoolEmail">School Email *</Label>
                      <Input
                        id="schoolEmail"
                        name="schoolEmail"
                        type="email"
                        placeholder="info@school.edu.ng"
                        value={formData.schoolEmail}
                        onChange={handleChange}
                        required
                        data-testid="input-school-email"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolPhone">School Phone</Label>
                      <Input
                        id="schoolPhone"
                        name="schoolPhone"
                        type="tel"
                        placeholder="0800 000 0000"
                        value={formData.schoolPhone}
                        onChange={handleChange}
                        data-testid="input-school-phone"
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolAddress">School Address</Label>
                    <Textarea
                      id="schoolAddress"
                      name="schoolAddress"
                      placeholder="Campus address or administrative office location"
                      value={formData.schoolAddress}
                      onChange={handleChange}
                      data-testid="input-school-address"
                      className="min-h-[110px] rounded-xl"
                    />
                  </div>

                  <div className="rounded-[1.35rem] border border-border/70 bg-background/80 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        {logoPreview ? (
                          <div className="relative">
                            <Avatar className="h-20 w-20 border border-white/10 shadow-sm">
                              <AvatarImage src={logoPreview} alt="School logo" />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {formData.schoolName.slice(0, 2).toUpperCase() || "SR"}
                              </AvatarFallback>
                            </Avatar>
                            <Button type="button" variant="destructive" size="icon" className="absolute -right-2 -top-2 h-7 w-7 rounded-full" onClick={removeLogo} data-testid="button-remove-logo">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="flex h-20 w-20 items-center justify-center rounded-[1.2rem] border border-dashed border-border bg-muted/50 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-5 w-5" />
                          </button>
                        )}
                        <div>
                          <p className="font-medium">School logo</p>
                          <p className="mt-1 text-sm text-muted-foreground">Optional, but it strengthens branding across result sheets, the public checker, and approval views.</p>
                        </div>
                      </div>
                      <div className="sm:ml-auto">
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" data-testid="input-logo" />
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => fileInputRef.current?.click()} data-testid="button-upload-logo">
                          <Upload className="mr-2 h-4 w-4" /> Upload logo
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="surface-divider pt-1" />

                  <div>
                    <p className="text-sm font-semibold">Primary admin owner</p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">This person receives the first school admin account after approval.</p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="adminFirstName">First Name *</Label>
                      <Input
                        id="adminFirstName"
                        name="adminFirstName"
                        placeholder="Amina"
                        value={formData.adminFirstName}
                        onChange={handleChange}
                        required
                        data-testid="input-admin-first-name"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminLastName">Last Name *</Label>
                      <Input
                        id="adminLastName"
                        name="adminLastName"
                        placeholder="Okafor"
                        value={formData.adminLastName}
                        onChange={handleChange}
                        required
                        data-testid="input-admin-last-name"
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email *</Label>
                    <Input
                      id="adminEmail"
                      name="adminEmail"
                      type="email"
                      placeholder="admin@school.edu.ng"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      required
                      data-testid="input-admin-email"
                      className="h-12 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">This email is used for the initial admin login after the school is approved.</p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        data-testid="input-password"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        data-testid="input-confirm-password"
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
                    After registration, a super admin activates the school and admin account before live use. Until approval, the submitted admin credentials will not sign in.
                  </div>

                  <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={loading} data-testid="button-submit">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : "Create School Workspace"}
                  </Button>
                </form>

                <div className="surface-divider mt-6 pt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login">
                    <span className="cursor-pointer font-medium text-primary hover:underline" data-testid="link-login">Login here</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
