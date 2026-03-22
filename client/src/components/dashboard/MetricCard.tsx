import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "primary" | "emerald" | "violet" | "amber" | "rose";
}

const toneMap = {
  primary: "text-primary bg-primary/10 border-primary/10",
  emerald: "text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/10",
  violet: "text-violet-600 dark:text-violet-300 bg-violet-500/10 border-violet-500/10",
  amber: "text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/10",
  rose: "text-rose-600 dark:text-rose-300 bg-rose-500/10 border-rose-500/10",
} as const;

export function MetricCard({ label, value, detail, icon: Icon, tone = "primary" }: MetricCardProps) {
  return (
    <Card className="metric-card border-white/10 bg-card/92">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
          <p className="mono-data mt-4 text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
        </div>
        <div className={cn("rounded-2xl border p-3 shadow-sm", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
