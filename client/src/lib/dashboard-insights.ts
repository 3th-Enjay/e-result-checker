import type { PIN, PINRequest, Result, ResultSheet, School } from "@shared/schema";

const termOrder: Record<string, number> = { First: 1, Second: 2, Third: 3 };

export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value || "0") || 0;
  return 0;
}

export function buildResultTrend(results: Result[] = []) {
  const map = new Map<string, { label: string; total: number; approved: number; pending: number }>();

  for (const result of results) {
    const key = `${result.session}-${result.term}`;
    const current = map.get(key) ?? { label: `${result.term.slice(0, 3)} ${result.session}`, total: 0, approved: 0, pending: 0 };
    current.total += 1;
    if (["approved", "published"].includes(result.status)) current.approved += 1;
    if (["draft", "submitted"].includes(result.status)) current.pending += 1;
    map.set(key, current);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => sortAcademicKeys(a, b))
    .slice(-6)
    .map(([, value]) => value);
}

export function buildPerformanceBands(results: Result[] = []) {
  const buckets = [
    { band: "A", min: 70, count: 0 },
    { band: "B", min: 60, count: 0 },
    { band: "C", min: 50, count: 0 },
    { band: "D", min: 40, count: 0 },
    { band: "E/F", min: 0, count: 0 },
  ];

  for (const result of results) {
    const average = toNumber(result.averageScore);
    const bucket = buckets.find((item, index) => average >= item.min && (index === 0 || average < buckets[index - 1].min)) ?? buckets[buckets.length - 1];
    bucket.count += 1;
  }

  return buckets.map(({ band, count }) => ({ band, count }));
}

export function buildResultStatusDistribution(results: Result[] = []) {
  const counts = new Map<string, number>();
  for (const result of results) {
    counts.set(result.status, (counts.get(result.status) ?? 0) + 1);
  }
  return [
    { name: "draft", label: "Draft", value: counts.get("draft") ?? 0 },
    { name: "submitted", label: "Submitted", value: counts.get("submitted") ?? 0 },
    { name: "approved", label: "Approved", value: counts.get("approved") ?? 0 },
    { name: "published", label: "Published", value: counts.get("published") ?? 0 },
    { name: "rejected", label: "Rejected", value: counts.get("rejected") ?? 0 },
  ];
}

export function buildSheetStatusDistribution(sheets: ResultSheet[] = []) {
  const counts = new Map<string, number>();
  for (const sheet of sheets) {
    counts.set(sheet.status, (counts.get(sheet.status) ?? 0) + 1);
  }
  return [
    { name: "draft", label: "Draft", value: counts.get("draft") ?? 0 },
    { name: "submitted", label: "Submitted", value: counts.get("submitted") ?? 0 },
    { name: "approved", label: "Approved", value: counts.get("approved") ?? 0 },
    { name: "rejected", label: "Rejected", value: counts.get("rejected") ?? 0 },
  ];
}

export function buildPinUsageDistribution(pins: PIN[] = []) {
  let available = 0;
  let exhausted = 0;
  let multiUse = 0;

  for (const pin of pins) {
    const usageCount = pin.usageCount ?? 0;
    const maxUsage = pin.maxUsageCount ?? 1;
    if (usageCount >= maxUsage) exhausted += 1;
    else available += 1;
    if (maxUsage > 1) multiUse += 1;
  }

  return {
    summary: [
      { name: "available", label: "Available", value: available },
      { name: "exhausted", label: "Exhausted", value: exhausted },
      { name: "multiUse", label: "Reusable", value: multiUse },
    ],
    available,
    exhausted,
    multiUse,
  };
}

export function buildPinRequestDistribution(requests: PINRequest[] = []) {
  const counts = new Map<string, number>();
  for (const request of requests) {
    counts.set(request.status, (counts.get(request.status) ?? 0) + 1);
  }
  return [
    { name: "pending", label: "Pending", value: counts.get("pending") ?? 0 },
    { name: "approved", label: "Approved", value: counts.get("approved") ?? 0 },
    { name: "rejected", label: "Rejected", value: counts.get("rejected") ?? 0 },
  ];
}

export function buildTopClasses(results: Result[] = []) {
  const classMap = new Map<string, { className: string; avg: number; count: number }>();
  for (const result of results) {
    const key = result.class || "Unknown";
    const current = classMap.get(key) ?? { className: key, avg: 0, count: 0 };
    current.avg += toNumber(result.averageScore);
    current.count += 1;
    classMap.set(key, current);
  }

  return Array.from(classMap.values())
    .map((item) => ({ className: item.className, average: item.count ? Number((item.avg / item.count).toFixed(1)) : 0, count: item.count }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 5);
}

export function buildActivityTimeline({
  results = [],
  sheets = [],
  pins = [],
  pinRequests = [],
  schools = [],
}: {
  results?: Result[];
  sheets?: ResultSheet[];
  pins?: PIN[];
  pinRequests?: PINRequest[];
  schools?: School[];
}) {
  const schoolLookup = new Map(schools.map((school) => [school.id, school.name]));

  const events = [
    ...results.map((result) => ({
      id: result.id,
      title: `${capitalize(result.status)} result`,
      detail: `${result.class} • ${result.term} ${result.session}`,
      createdAt: result.updatedAt ?? result.createdAt,
      group: "results",
    })),
    ...sheets.map((sheet) => ({
      id: sheet.id,
      title: `${capitalize(sheet.status)} sheet`,
      detail: `${sheet.term} ${sheet.session}`,
      createdAt: sheet.updatedAt ?? sheet.createdAt,
      group: "sheets",
    })),
    ...pins.map((pin) => ({
      id: pin.id,
      title: "PIN generated",
      detail: `${schoolLookup.get(pin.schoolId) ?? "School"} • ${pin.term} ${pin.session}`,
      createdAt: pin.createdAt,
      group: "pins",
    })),
    ...pinRequests.map((request) => ({
      id: request.id,
      title: `${capitalize(request.status)} PIN request`,
      detail: `${request.quantity} PINs • ${request.term} ${request.session}`,
      createdAt: request.updatedAt ?? request.createdAt,
      group: "requests",
    })),
  ];

  return events
    .filter((event) => event.createdAt)
    .sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime())
    .slice(0, 6);
}

export function buildInsightMessages({
  results = [],
  sheets = [],
  pins = [],
  pinRequests = [],
}: {
  results?: Result[];
  sheets?: ResultSheet[];
  pins?: PIN[];
  pinRequests?: PINRequest[];
}) {
  const pendingSheets = sheets.filter((sheet) => sheet.status === "submitted").length;
  const publishedResults = results.filter((result) => result.status === "published").length;
  const pendingRequests = pinRequests.filter((request) => request.status === "pending").length;
  const pinUsage = buildPinUsageDistribution(pins);

  return [
    {
      title: "Approval readiness",
      body: pendingSheets > 0 ? `${pendingSheets} submitted sheet${pendingSheets === 1 ? " is" : "s are"} waiting for review.` : "No submitted sheets are waiting for review right now.",
    },
    {
      title: "Release confidence",
      body: publishedResults > 0 ? `${publishedResults} published result${publishedResults === 1 ? " is" : "s are"} already available to students.` : "No published results yet. Approvals are the next milestone.",
    },
    {
      title: "PIN availability",
      body: pinUsage.available > 0 ? `${pinUsage.available} PINs still have remaining usage.` : "No active PINs remain. Generate or approve more access codes.",
    },
    {
      title: "Request pressure",
      body: pendingRequests > 0 ? `${pendingRequests} PIN request${pendingRequests === 1 ? " is" : "s are"} still pending action.` : "PIN request queue is clear.",
    },
  ];
}

function sortAcademicKeys(a: string, b: string) {
  const [aSession, aTerm] = a.split("-");
  const [bSession, bTerm] = b.split("-");
  const aYear = Number.parseInt((aSession || "0").split("/")[0] || "0", 10);
  const bYear = Number.parseInt((bSession || "0").split("/")[0] || "0", 10);
  if (aYear !== bYear) return aYear - bYear;
  return (termOrder[aTerm] ?? 0) - (termOrder[bTerm] ?? 0);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
