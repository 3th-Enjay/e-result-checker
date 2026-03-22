import { useDeferredValue, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Check, XCircle, KeyRound, Search, Download, FileText, FileSpreadsheet, CalendarIcon, ExternalLink, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PIN, School } from "@shared/schema";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { buildPinUsageDistribution } from "@/lib/dashboard-insights";
import { BrandMark } from "@/components/brand-mark";

export default function Pins() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [termFilter, setTermFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState("10");
  const [session, setSession] = useState("2024/2025");
  const [term, setTerm] = useState("First");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [maxUsageCount, setMaxUsageCount] = useState("1");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [neverExpires, setNeverExpires] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(searchQuery);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "super_admin";

  const sessionOptions = useMemo(() => {
    const options = [];
    for (let year = 2024; year <= 2098; year++) {
      options.push(`${year}/${year + 1}`);
    }
    return options;
  }, []);

  const termOptions = ["First", "Second", "Third"];

  const { data: pins = [], isLoading } = useQuery<PIN[]>({
    queryKey: ["/api/pins"],
  });

  const { data: schools } = useQuery<School[]>({
    queryKey: ["/api/schools"],
    enabled: isSuperAdmin,
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/pins", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pins"] });
      setDialogOpen(false);
      setQuantity("10");
      setMaxUsageCount("1");
      setSelectedSchoolId("");
      setExpiryDate(undefined);
      setNeverExpires(false);
      toast({ title: "Success", description: "PINs generated successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const filteredPins = useMemo(() => {
    const query = deferredSearch.toLowerCase();
    return pins.filter((pin) => {
      const matchesSearch =
        pin.pin.toLowerCase().includes(query) ||
        pin.session.toLowerCase().includes(query) ||
        pin.term.toLowerCase().includes(query);
      const matchesTerm = termFilter === "all" || pin.term === termFilter;
      return matchesSearch && matchesTerm;
    });
  }, [pins, deferredSearch, termFilter]);

  const usageSummary = useMemo(() => buildPinUsageDistribution(pins), [pins]);

  const sessionBreakdown = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const pin of pins) {
      grouped.set(pin.session, (grouped.get(pin.session) ?? 0) + 1);
    }
    return Array.from(grouped.entries()).map(([label, value]) => ({ label, value })).slice(-4);
  }, [pins]);

  const handleGenerate = async () => {
    const schoolId = isSuperAdmin ? selectedSchoolId : user.schoolId;

    if (!schoolId) {
      toast({ variant: "destructive", title: "Error", description: "Please select a school" });
      return;
    }

    if (!neverExpires && !expiryDate) {
      toast({ variant: "destructive", title: "Error", description: "Please select an expiry date or check 'Never Expires'" });
      return;
    }

    const calculatedExpiryDate = neverExpires ? new Date("2099-12-31") : expiryDate;

    await generateMutation.mutateAsync({
      schoolId,
      quantity: parseInt(quantity, 10),
      session,
      term,
      maxUsageCount: parseInt(maxUsageCount, 10),
      expiryDate: calculatedExpiryDate?.toISOString(),
      generatedBy: user.id,
    });
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    toast({ title: "Copied!", description: "PIN copied to clipboard" });
  };

  const downloadCSV = (pinsToDownload: PIN[], filename = "pins") => {
    const headers = ["PIN", "Session", "Term", "Status", "Usage", "Max Usage", "Expiry Date"];
    const rows = pinsToDownload.map((pin) => {
      const usageCount = pin.usageCount ?? 0;
      const maxUsage = pin.maxUsageCount ?? 1;
      const isExhausted = usageCount >= maxUsage;
      const expiryDisplay = new Date(pin.expiryDate).getFullYear() >= 2099 ? "Never" : new Date(pin.expiryDate).toLocaleDateString();
      return [pin.pin, pin.session, pin.term, isExhausted ? "Exhausted" : "Available", usageCount.toString(), maxUsage.toString(), expiryDisplay];
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Downloaded", description: `${pinsToDownload.length} PIN(s) exported as CSV` });
  };

  const downloadPDF = (pinsToDownload: PIN[], filename = "pins") => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SmartResultChecker PIN Register", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total PINs: ${pinsToDownload.length}`, 14, 34);

    const tableData = pinsToDownload.map((pin) => {
      const usageCount = pin.usageCount ?? 0;
      const maxUsage = pin.maxUsageCount ?? 1;
      const expiryDisplay = new Date(pin.expiryDate).getFullYear() >= 2099 ? "Never" : new Date(pin.expiryDate).toLocaleDateString();
      return [pin.pin, pin.session, pin.term, usageCount >= maxUsage ? "Exhausted" : "Available", `${usageCount}/${maxUsage}`, expiryDisplay];
    });

    autoTable(doc, {
      head: [["PIN", "Session", "Term", "Status", "Usage", "Expiry"]],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 58, 138] },
    });

    doc.save(`${filename}.pdf`);
    toast({ title: "Downloaded", description: `${pinsToDownload.length} PIN(s) exported as PDF` });
  };

  const downloadSinglePIN = (pin: PIN, format: "pdf" | "csv") => {
    if (format === "csv") downloadCSV([pin], `pin-${pin.pin}`);
    else downloadPDF([pin], `pin-${pin.pin}`);
  };

  const downloadAllPINs = (format: "pdf" | "csv") => {
    const pinsToDownload = filteredPins;
    if (pinsToDownload.length === 0) {
      toast({ variant: "destructive", title: "No PINs", description: "No PINs available to download" });
      return;
    }
    if (format === "csv") downloadCSV(pinsToDownload, `all-pins-${new Date().toISOString().split("T")[0]}`);
    else downloadPDF(pinsToDownload, `all-pins-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <div className="page-shell space-y-6 lg:space-y-8">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="premium-shell overflow-hidden border-white/10 bg-card/92">
          <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <span className="section-kicker">PIN intelligence</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Secure result access with clearer operational visibility.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Track access inventory, export PIN registers, and manage release windows without losing the premium, trustworthy feel of the platform.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/10 text-primary">PIN usage analytics</Badge>
                <Badge variant="outline" className="rounded-full">Monospace access codes</Badge>
                <Badge variant="outline" className="rounded-full">Export-ready register</Badge>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-14 justify-between rounded-2xl px-4" data-testid="button-download-pins">
                    <span>Download register</span>
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl">
                  <DropdownMenuLabel>Export format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => downloadAllPINs("pdf")} data-testid="button-download-pdf"><FileText className="mr-2 h-4 w-4" /> Download as PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadAllPINs("csv")} data-testid="button-download-csv"><FileSpreadsheet className="mr-2 h-4 w-4" /> Download as CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isSuperAdmin ? (
                <Button onClick={() => setDialogOpen(true)} className="h-14 rounded-2xl" data-testid="button-generate-pins">
                  <Plus className="mr-2 h-4 w-4" /> Generate PINs
                </Button>
              ) : (
                <a href="/check-result" className="block">
                  <Button variant="outline" className="h-14 w-full justify-between rounded-2xl px-4">
                    <span>Open result checker</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total PINs" value={pins.length} detail="All generated access codes" icon={KeyRound} tone="primary" />
        <MetricCard label="Available" value={usageSummary.available} detail="PINs still usable by students" icon={Check} tone="emerald" />
        <MetricCard label="Exhausted" value={usageSummary.exhausted} detail="PINs with no remaining uses" icon={XCircle} tone="amber" />
        <MetricCard label="Reusable" value={usageSummary.multiUse} detail="PINs configured for more than one check" icon={Sparkles} tone="violet" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card className="premium-shell border-white/10 bg-card/92">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">PIN Register</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Search, scan, copy, and export individual PIN records.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search PIN, session, or term"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-xl pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={termFilter} onValueChange={setTermFilter}>
                <SelectTrigger className="h-12 w-full rounded-xl sm:w-[170px]">
                  <SelectValue placeholder="All terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {termOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                  Loading PINs...
                </div>
              ) : filteredPins.length > 0 ? (
                filteredPins.map((pin) => {
                  const usageCount = pin.usageCount ?? 0;
                  const maxUsage = pin.maxUsageCount ?? 1;
                  const isExhausted = usageCount >= maxUsage;
                  const isCopied = copiedId === pin.id;
                  return (
                    <Card key={pin.id} className="metric-card border-white/10 bg-background/80" data-testid={`card-pin-${pin.id}`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="outline" className={cn("rounded-full border-0", isExhausted ? "bg-rose-500/12 text-rose-700 dark:text-rose-300" : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300")}>
                            {isExhausted ? "Exhausted" : "Available"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="rounded-xl" data-testid={`button-download-single-${pin.id}`}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl">
                              <DropdownMenuItem onClick={() => downloadSinglePIN(pin, "pdf")}><FileText className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => downloadSinglePIN(pin, "csv")}><FileSpreadsheet className="mr-2 h-4 w-4" /> CSV</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="rounded-[1.15rem] border border-border/70 bg-card px-4 py-4 text-center shadow-sm">
                          <div className="mb-3 flex items-center justify-center"><BrandMark size="sm" className="shadow-none" /></div>
                          <p className="mono-data text-xl font-bold tracking-tight">{pin.pin}</p>
                        </div>
                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center justify-between"><span>Session</span><span className="mono-data font-medium text-foreground">{pin.session}</span></div>
                          <div className="flex items-center justify-between"><span>Term</span><span className="font-medium text-foreground">{pin.term}</span></div>
                          <div className="flex items-center justify-between"><span>Usage</span><span className="mono-data font-medium text-foreground">{usageCount}/{maxUsage}</span></div>
                          <div className="flex items-center justify-between"><span>Expires</span><span className="font-medium text-foreground">{new Date(pin.expiryDate).getFullYear() >= 2099 ? "Never" : new Date(pin.expiryDate).toLocaleDateString()}</span></div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => copyToClipboard(pin.id, pin.pin)} data-testid={`button-copy-${pin.id}`}>
                            {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            {isCopied ? "Copied" : "Copy"}
                          </Button>
                          <a href="/check-result" className="flex-1">
                            <Button className="h-11 w-full rounded-xl" variant="ghost">
                              Open Checker
                            </Button>
                          </a>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                  No PINs found for the current filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="premium-shell border-white/10 bg-card/92">
            <CardHeader>
              <CardTitle className="text-xl">Session Mix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessionBreakdown.length > 0 ? sessionBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Badge variant="outline" className="mono-data rounded-full border-primary/15 bg-primary/10 text-primary">{item.value}</Badge>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                  Session analytics will appear once PINs exist.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="premium-shell border-white/10 bg-card/92">
            <CardHeader>
              <CardTitle className="text-xl">Access Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="font-semibold">Keep expiry windows intentional</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">Shorter expiry windows reduce credential sprawl during release periods.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="font-semibold">Reserve reusable PINs carefully</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">Use multi-use access only where repeated family or admin checks are expected.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="font-semibold">Export before distribution</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">Generate PDF or CSV registers so school teams can reconcile issue lists quickly.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-[1.5rem] border-white/10 bg-background/95">
          <DialogHeader>
            <DialogTitle>Generate PINs</DialogTitle>
            <DialogDescription>Create secure result checker PINs with clear expiry and reuse rules.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pb-2">
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                  <SelectTrigger className="h-12 rounded-xl" data-testid="select-school">
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools?.filter((school) => school.isActive).map((school) => (
                      <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" min="1" max="1000" value={quantity} onChange={(e) => setQuantity(e.target.value)} data-testid="input-quantity" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUsageCount">Max Uses</Label>
                <Input id="maxUsageCount" type="number" min="1" max="100" value={maxUsageCount} onChange={(e) => setMaxUsageCount(e.target.value)} data-testid="input-max-usage" className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session">Session</Label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger className="h-12 rounded-xl" data-testid="select-session">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {sessionOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term</Label>
                <Select value={term} onValueChange={setTerm}>
                  <SelectTrigger className="h-12 rounded-xl" data-testid="select-term">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {termOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("h-12 w-full justify-start rounded-xl text-left font-normal", !expiryDate && !neverExpires && "text-muted-foreground")}
                      disabled={neverExpires}
                      data-testid="button-expiry-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {neverExpires ? "Never Expires" : expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus disabled={(date) => date < new Date()} />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="neverExpires"
                    checked={neverExpires}
                    onCheckedChange={(checked) => {
                      setNeverExpires(checked as boolean);
                      if (checked) setExpiryDate(undefined);
                    }}
                    data-testid="checkbox-never-expires"
                  />
                  <label htmlFor="neverExpires" className="text-sm font-medium leading-none">Never Expires</label>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
              Single-use PINs are best for student releases. Increase max uses only when your workflow truly needs repeat access.
            </div>

            <Button onClick={handleGenerate} disabled={generateMutation.isPending || (isSuperAdmin && !selectedSchoolId)} className="h-12 w-full rounded-xl" data-testid="button-submit">
              {generateMutation.isPending ? "Generating..." : "Generate PINs"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
