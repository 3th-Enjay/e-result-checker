import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Clock3, MailCheck, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { School } from "@shared/schema";

type ReviewQueueSchool = School & {
  reviewStatus: "pending" | "activated" | "rejected";
  emailVerified: boolean;
  primaryAdmin: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  } | null;
};

type FilterId = "all" | "verified_only" | "pending_too_long" | "generic_email";

export default function SchoolReviewQueue() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [pendingTooLongDays, setPendingTooLongDays] = useState(7);

  const { data: schools, isLoading } = useQuery<ReviewQueueSchool[]>({
    queryKey: ["/api/schools/review-queue", `?filter=${filter}&pendingTooLongDays=${pendingTooLongDays}`],
  });

  const approve = async (id: string) => {
    try {
      await apiRequest("PATCH", `/api/schools/${id}/status`, { isActive: true });
      queryClient.invalidateQueries({ queryKey: ["/api/schools/review-queue"] });
      toast({ title: "School approved", description: "The school and verified admins can now log in." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Approval failed", description: error.message });
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return schools ?? [];
    return (schools ?? []).filter((school) =>
      school.name.toLowerCase().includes(q) ||
      (school.code || "").toLowerCase().includes(q) ||
      (school.subdomain || "").toLowerCase().includes(q) ||
      (school.primaryAdmin?.email || "").toLowerCase().includes(q),
    );
  }, [schools, searchQuery]);

  const pendingCount = (schools ?? []).filter((s) => s.reviewStatus === "pending").length;
  const activeCount = (schools ?? []).filter((s) => s.reviewStatus === "activated").length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">School Review Queue</h2>
          <p className="text-sm text-muted-foreground md:text-base">Filter signups, verify trust, and approve intentionally.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              className="bg-transparent text-sm outline-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterId)}
            >
              <option value="all">All</option>
              <option value="verified_only">Verified only</option>
              <option value="pending_too_long">Pending too long</option>
              <option value="generic_email">Generic email domains</option>
            </select>
            {filter === "pending_too_long" ? (
              <input
                className="w-14 rounded-md border border-border/70 bg-background px-2 py-1 text-sm outline-none"
                type="number"
                min={1}
                max={365}
                value={pendingTooLongDays}
                onChange={(e) => setPendingTooLongDays(Number(e.target.value || 7))}
                title="Days"
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-card/85 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Pending review</p>
          <p className="mt-3 text-3xl font-bold text-foreground">{pendingCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Signups waiting for activation.</p>
        </Card>
        <Card className="border-white/10 bg-card/85 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Active schools</p>
          <p className="mt-3 text-3xl font-bold text-foreground">{activeCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Already approved and operational.</p>
        </Card>
      </div>

      <Card className="border-white/10 bg-card/92 p-4 md:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools, codes, subdomains, or admin emails"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full sm:max-w-md"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead className="hidden lg:table-cell">Primary admin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Verification</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">Loading schools...</TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                filtered.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{school.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {school.code && <Badge variant="outline" className="rounded-full mono-data">{school.code}</Badge>}
                        <span className="text-xs text-muted-foreground">{school.subdomain ? `${school.subdomain}.smartresult.app` : "No subdomain"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {school.primaryAdmin ? (
                        <div>
                          <div className="font-medium text-foreground">{school.primaryAdmin.firstName} {school.primaryAdmin.lastName}</div>
                          <div className="text-sm text-muted-foreground">{school.primaryAdmin.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No primary admin</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {school.reviewStatus === "activated" && <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Active</Badge>}
                      {school.reviewStatus === "pending" && <Badge variant="secondary" className="rounded-full"><Clock3 className="mr-1 h-3 w-3" /> Pending</Badge>}
                      {school.reviewStatus === "rejected" && <Badge variant="destructive" className="rounded-full">Rejected</Badge>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {school.emailVerified ? (
                        <Badge variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <MailCheck className="mr-1 h-3 w-3" /> Email verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-full">Email pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {school.reviewStatus !== "activated" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => approve(school.id)}
                            disabled={!school.emailVerified}
                          >
                            <BadgeCheck className="mr-2 h-4 w-4" /> Approve
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No schools found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

