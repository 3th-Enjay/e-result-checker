import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, Download, GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { format } from "date-fns";

interface SubjectScore {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

interface ResultData {
  student: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
    class: string;
  };
  school: {
    name: string;
    logo?: string;
    motto?: string;
  };
  session: string;
  term: string;
  subjects: SubjectScore[];
  totalScore: number;
  averageScore: number;
  position?: number;
  totalStudents?: number;
  teacherComment?: string;
  principalComment?: string;
  attendance?: {
    present: number;
    absent: number;
    total: number;
  };
}

export default function CheckResult() {
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  const currentYear = new Date().getFullYear();
  const sessions = [`${currentYear - 2}/${currentYear - 1}`, `${currentYear - 1}/${currentYear}`, `${currentYear}/${currentYear + 1}`];

  const handleCheckResult = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !term) {
      toast({ variant: "destructive", title: "Error", description: "Please select academic year and term" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/public/check-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: pin.toUpperCase(),
          admissionNumber: registrationNumber.toUpperCase(),
          session,
          term,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to check result");
      }

      const data = await response.json();
      setResult(data);
      toast({ title: "Result Retrieved", description: "Your result has been found successfully!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Invalid PIN or registration number" });
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300";
      case "B":
        return "bg-blue-500/12 text-blue-700 dark:text-blue-300";
      case "C":
        return "bg-amber-500/12 text-amber-700 dark:text-amber-300";
      case "D":
      case "E":
      case "F":
        return "bg-rose-500/12 text-rose-700 dark:text-rose-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleReset = () => {
    setResult(null);
    setPin("");
    setRegistrationNumber("");
  };

  return (
    <div className="mesh-hero min-h-screen">
      <div className="page-shell">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 rounded-xl" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <ThemeToggle className="rounded-xl" />
        </div>

        {!result ? (
          <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:gap-8">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="premium-shell h-full border-white/10 bg-slate-950 text-white">
                <CardContent className="p-8 sm:p-10">
                  <span className="section-kicker border-white/10 bg-white/10 text-white">Student access</span>
                  <h1 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-0.06em] sm:text-5xl">
                    Check your result through a secure, verified workflow.
                  </h1>
                  <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">
                    Enter your admission number, academic session, term, and PIN to retrieve the released result record for your school.
                  </p>
                  <div className="mt-8 space-y-4">
                    {[
                      "PIN-protected result access",
                      "Official school identity displayed on release",
                      "Printable summary for parents and students",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="rounded-full bg-emerald-400/15 p-1.5 text-emerald-300">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <p className="text-sm leading-7 text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
              <Card className="premium-shell border-white/10 bg-card/92">
                <CardHeader className="space-y-4 px-6 pt-6 sm:px-8 sm:pt-8">
                  <div className="flex items-center gap-3">
                    <BrandMark size="lg" />
                    <div>
                      <CardTitle className="text-3xl font-bold tracking-tight">Check your result</CardTitle>
                      <CardDescription className="mt-1 text-sm leading-6">
                        Fill in the details exactly as provided by your school.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
                  <form onSubmit={handleCheckResult} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        type="text"
                        placeholder="STU2024001"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                        required
                        data-testid="input-registration-number"
                        className="h-12 rounded-xl uppercase"
                      />
                      <p className="text-xs text-muted-foreground">Use the exact admission or registration number on record.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Academic Year</Label>
                        <Select value={session} onValueChange={setSession}>
                          <SelectTrigger className="h-12 rounded-xl" data-testid="select-session">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {sessions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Term</Label>
                        <Select value={term} onValueChange={setTerm}>
                          <SelectTrigger className="h-12 rounded-xl" data-testid="select-term">
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="First">First Term</SelectItem>
                            <SelectItem value="Second">Second Term</SelectItem>
                            <SelectItem value="Third">Third Term</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pin">Result PIN</Label>
                      <Input
                        id="pin"
                        type="text"
                        placeholder="XXXX-XXXX-XXXX"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.toUpperCase())}
                        required
                        data-testid="input-pin"
                        className="mono-data h-12 rounded-xl uppercase"
                      />
                      <p className="text-xs text-muted-foreground">If you do not have a PIN yet, contact your school administrator.</p>
                    </div>

                    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
                      This flow helps ensure only authorized users can view released result records.
                    </div>

                    <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={loading || !session || !term} data-testid="button-submit">
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</> : "Retrieve Result"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
            <Card className="premium-shell overflow-hidden border-white/10 bg-card/95">
              <CardHeader className="relative overflow-hidden border-b border-border/70 bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10 px-6 py-8 sm:px-8">
                <div className="absolute right-6 top-6 hidden text-right text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
                  <p>Generated</p>
                  <p className="mt-2">{format(new Date(), "PPP p")}</p>
                </div>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {result.school.logo ? (
                      <Avatar className="h-24 w-24 rounded-[1.8rem] border border-white/10 shadow-lg">
                        <AvatarImage src={result.school.logo} alt={result.school.name} />
                        <AvatarFallback className="rounded-[1.8rem] bg-primary text-primary-foreground text-2xl font-bold">
                          {result.school.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-[1.8rem] bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
                        {result.school.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 text-primary">
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Verified release
                        </Badge>
                        <Badge variant="outline" className="rounded-full">{result.session}</Badge>
                        <Badge className="rounded-full">{result.term} Term</Badge>
                      </div>
                      <h2 className="mt-4 text-3xl font-bold tracking-tight" data-testid="text-school-name">{result.school.name}</h2>
                      {result.school.motto && <p className="mt-2 text-sm italic text-muted-foreground">"{result.school.motto}"</p>}
                    </div>
                  </div>
                  <BrandMark size="lg" className="hidden sm:inline-flex" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 px-6 py-6 sm:px-8">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="metric-card">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Student Name</p>
                    <p className="mt-3 text-lg font-semibold" data-testid="text-student-name">{result.student.firstName} {result.student.lastName}</p>
                  </div>
                  <div className="metric-card">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Admission No.</p>
                    <p className="mono-data mt-3 text-lg font-semibold" data-testid="text-registration-number">{result.student.admissionNumber}</p>
                  </div>
                  <div className="metric-card">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Class</p>
                    <p className="mt-3 text-lg font-semibold">{result.student.class}</p>
                  </div>
                  <div className="metric-card">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Position</p>
                    <p className="mt-3 text-lg font-semibold">{result.position && result.totalStudents ? `${result.position} of ${result.totalStudents}` : "Pending"}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-background/85">
                  <Table className="table-premium">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">CA1</TableHead>
                        <TableHead className="text-center">CA2</TableHead>
                        <TableHead className="text-center">Exam</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead>Remark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.subjects.map((subject, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{subject.subject}</TableCell>
                          <TableCell className="mono-data text-center">{subject.ca1}</TableCell>
                          <TableCell className="mono-data text-center">{subject.ca2}</TableCell>
                          <TableCell className="mono-data text-center">{subject.exam}</TableCell>
                          <TableCell className="mono-data text-center font-semibold">{subject.total}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`rounded-full border-0 ${getGradeColor(subject.grade)}`}>{subject.grade}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{subject.remark}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="metric-card">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Total Score</p>
                    <p className="mono-data mt-3 text-3xl font-bold" data-testid="text-total-score">{result.totalScore}</p>
                  </div>
                  <div className="metric-card">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Average</p>
                    <p className="mono-data mt-3 text-3xl font-bold" data-testid="text-average">{result.averageScore}%</p>
                  </div>
                  {result.attendance && (
                    <div className="metric-card">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Attendance</p>
                      <p className="mono-data mt-3 text-3xl font-bold">{result.attendance.present}/{result.attendance.total}</p>
                    </div>
                  )}
                  <div className="metric-card">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Access Time</p>
                    <p className="mt-3 text-lg font-semibold">{format(new Date(), "p")}</p>
                  </div>
                </div>

                {(result.teacherComment || result.principalComment) && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {result.teacherComment && (
                      <div className="rounded-[1.35rem] border border-border/70 bg-background/85 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Teacher Comment</p>
                        <p className="mt-3 text-sm leading-7">{result.teacherComment}</p>
                      </div>
                    )}
                    {result.principalComment && (
                      <div className="rounded-[1.35rem] border border-border/70 bg-background/85 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Principal Comment</p>
                        <p className="mt-3 text-sm leading-7">{result.principalComment}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={handleReset} data-testid="button-check-another">
                    Check Another Result
                  </Button>
                  <Button className="h-12 flex-1 rounded-xl" onClick={() => window.print()} data-testid="button-download">
                    <Download className="mr-2 h-4 w-4" /> Print / Save PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
