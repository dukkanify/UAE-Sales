"use client";

import * as React from "react";
import {
  BarChart3,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Pin,
  Printer,
  RefreshCw,
  Save,
} from "lucide-react";

import {
  AreaTrendChart,
  BarsChart,
  ChartCard,
  DonutChart,
  LineTrendChart,
} from "@/components/dashboard/charts";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { analyticsFetch, analyticsJson, buildAnalyticsQuery } from "@/features/analytics/lib/api";
import type {
  AnalyticsScope,
  ChartSeries,
  KpiCard,
  ReportFrequency,
  ReportHistoryEntry,
  SavedReport,
  ScheduledReport,
  UserDashboardPrefs,
} from "@/types/analytics";

const SCOPE_LABELS: Record<AnalyticsScope, string> = {
  executive: "Executive",
  learning: "Learning",
  instructor: "Instructor",
  student: "Student",
  financial: "Financial",
  course: "Courses",
  live: "Live Classes",
  community: "Community",
  support: "Support",
  health: "Platform Health",
};

type Snapshot = {
  kpis?: KpiCard[];
  charts?: ChartSeries[];
  courses?: Array<{
    courseId: string;
    title: string;
    enrollments: number;
    completionRate: number;
    dropOffRate: number;
  }>;
  topCourses?: Array<{ name: string; revenue: number; orders: number }>;
  topCommunities?: Array<{ name: string; members: number; posts: number }>;
  byCategory?: Array<{ type: string; count: number }>;
  warnings?: string[];
  instructorName?: string;
  studentName?: string;
  generatedAt?: string;
};

interface AnalyticsHubViewProps {
  roleLabel: string;
  defaultScope?: AnalyticsScope;
  allowedScopes?: AnalyticsScope[];
}

function AnalyticsHubView({
  roleLabel,
  defaultScope = "executive",
  allowedScopes,
}: AnalyticsHubViewProps) {
  const [scopes, setScopes] = React.useState<AnalyticsScope[]>(allowedScopes ?? [defaultScope]);
  const [scope, setScope] = React.useState<AnalyticsScope>(defaultScope);
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [courseId, setCourseId] = React.useState("");
  const [snapshot, setSnapshot] = React.useState<Snapshot | null>(null);
  const [prefs, setPrefs] = React.useState<UserDashboardPrefs | null>(null);
  const [savedReports, setSavedReports] = React.useState<SavedReport[]>([]);
  const [scheduled, setScheduled] = React.useState<ScheduledReport[]>([]);
  const [history, setHistory] = React.useState<ReportHistoryEntry[]>([]);
  const [reportName, setReportName] = React.useState("");
  const [scheduleName, setScheduleName] = React.useState("Weekly Executive");
  const [frequency, setFrequency] = React.useState<ReportFrequency>("weekly");
  const [recipients, setRecipients] = React.useState("superadmin@eagerpilots.com");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filters = React.useMemo(
    () => ({
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      courseId: courseId || null,
    }),
    [dateFrom, dateTo, courseId],
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const qs = buildAnalyticsQuery(scope, filters);
    const [overview, dash, sched, hist, scopeList] = await Promise.all([
      analyticsFetch<{ scope: AnalyticsScope; snapshot: Snapshot }>(
        `/api/analytics/overview?${qs}`,
      ),
      analyticsFetch<{ prefs: UserDashboardPrefs; savedReports: SavedReport[] }>(
        "/api/analytics/dashboard",
      ),
      analyticsFetch<ScheduledReport[]>("/api/analytics/reports"),
      analyticsFetch<ReportHistoryEntry[]>("/api/analytics/reports?view=history"),
      analyticsFetch<AnalyticsScope[]>("/api/analytics/overview?view=scopes"),
    ]);

    if (!overview.success) {
      setError(overview.error ?? "Failed to load analytics");
      setLoading(false);
      return;
    }
    setSnapshot(overview.data?.snapshot ?? null);
    if (dash.data) {
      setPrefs(dash.data.prefs);
      setSavedReports(dash.data.savedReports);
    }
    setScheduled(sched.data ?? []);
    setHistory(hist.data ?? []);
    if (scopeList.data?.length) {
      const next = allowedScopes
        ? scopeList.data.filter((s) => allowedScopes.includes(s))
        : scopeList.data;
      setScopes(next.length ? next : [defaultScope]);
    }
    setLoading(false);
  }, [scope, filters, allowedScopes, defaultScope]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function saveCurrentReport() {
    const name = reportName.trim() || `${SCOPE_LABELS[scope]} snapshot`;
    const result = await analyticsJson("/api/analytics/dashboard", "POST", {
      name,
      scope,
      filters,
      pinned: false,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setReportName("");
    void load();
  }

  async function scheduleCurrent() {
    const result = await analyticsJson("/api/analytics/reports", "POST", {
      name: scheduleName,
      scope,
      frequency,
      recipients: recipients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      filters,
    });
    if (!result.success) {
      setError(result.error);
      return;
    }
    void load();
  }

  async function toggleWidget(widgetId: string) {
    await analyticsJson("/api/analytics/dashboard", "PATCH", {
      action: "toggle_widget",
      widgetId,
    });
    void load();
  }

  async function favoriteScope() {
    if (!prefs) return;
    const ids = prefs.favoriteDashboardIds.includes(scope)
      ? prefs.favoriteDashboardIds.filter((id) => id !== scope)
      : [...prefs.favoriteDashboardIds, scope];
    await analyticsJson("/api/analytics/dashboard", "PATCH", {
      favoriteDashboardIds: ids,
    });
    void load();
  }

  const exportBase = `/api/analytics/export?${buildAnalyticsQuery(scope, filters)}`;
  const kpis = snapshot?.kpis ?? [];
  const charts = snapshot?.charts ?? [];
  const visibleWidgets = (prefs?.widgets ?? [])
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & BI"
        description="Executive KPIs, learning insights, finance, live classes, community, support, and platform health."
        breadcrumbs={[{ label: roleLabel }, { label: "Analytics" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void load()}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`${exportBase}&format=csv`}>
                <Download className="size-4" />
                CSV
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`${exportBase}&format=xlsx`}>
                <FileSpreadsheet className="size-4" />
                Excel
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`${exportBase}&format=print`} target="_blank" rel="noreferrer">
                <Printer className="size-4" />
                Print / PDF
              </a>
            </Button>
          </div>
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        {scopes.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={s === scope ? "default" : "outline"}
            onClick={() => setScope(s)}
          >
            {SCOPE_LABELS[s]}
            {prefs?.favoriteDashboardIds.includes(s) ? <Pin className="ms-1 size-3" /> : null}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => void favoriteScope()}>
          Favorite tab
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Date from</span>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Date to</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Course ID</span>
            <Input
              placeholder="Optional course filter"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            />
          </label>
          <div className="flex items-end">
            <Badge variant="secondary" className="h-9 px-3">
              {loading ? "Loading…" : `${kpis.length} KPIs · ${charts.length} charts`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="border-border/70 bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {formatKpi(kpi)}
              </p>
              {kpi.trend ? (
                <p className="mt-1 text-xs text-muted-foreground">Trend: {kpi.trend}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {charts.map((chart) => (
          <ChartCard key={chart.id} title={chart.title}>
            {renderChart(chart)}
          </ChartCard>
        ))}
      </div>

      {snapshot?.courses?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course analytics</CardTitle>
          </CardHeader>
          <CardContent className="table-scroll">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-b text-start text-muted-foreground">
                  <th className="py-2 pe-3 text-start">Course</th>
                  <th className="py-2 pe-3 text-start">Enrollments</th>
                  <th className="py-2 pe-3 text-start">Completion</th>
                  <th className="py-2 text-start">Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.courses.slice(0, 12).map((c) => (
                  <tr key={c.courseId} className="border-b border-border/60">
                    <td className="py-2 pe-3">{c.title}</td>
                    <td className="py-2 pe-3">{c.enrollments}</td>
                    <td className="py-2 pe-3">{c.completionRate}%</td>
                    <td className="py-2">{c.dropOffRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {snapshot?.warnings?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Health warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
            {snapshot.warnings.map((w) => (
              <p key={w}>• {w}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Save className="size-4" />
              Report builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Saved report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
            <Button size="sm" onClick={() => void saveCurrentReport()}>
              Save current view
            </Button>
            <div className="space-y-2">
              {savedReports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <button
                    type="button"
                    className="text-start hover:underline"
                    onClick={() => setScope(r.scope)}
                  >
                    {r.name}{" "}
                    <span className="text-muted-foreground">({SCOPE_LABELS[r.scope]})</span>
                  </button>
                  {r.pinned ? <Badge>Pinned</Badge> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4" />
              Scheduled reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} />
            <select
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as ReportFrequency)}
            >
              {(["daily", "weekly", "monthly", "quarterly", "yearly"] as const).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <Input
              placeholder="Recipients (comma-separated emails)"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
            <Button size="sm" onClick={() => void scheduleCurrent()}>
              Schedule (Super Admin)
            </Button>
            <div className="space-y-2">
              {scheduled.map((s) => (
                <div key={s.id} className="rounded-lg border px-3 py-2 text-sm">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-muted-foreground">
                    {s.frequency} · next{" "}
                    {s.nextRunAt ? new Date(s.nextRunAt).toLocaleString() : "—"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dashboard customization</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(prefs?.widgets ?? []).map((w) => (
            <Button
              key={w.id}
              size="sm"
              variant={w.visible ? "secondary" : "outline"}
              onClick={() => void toggleWidget(w.id)}
            >
              {w.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              {w.title}
            </Button>
          ))}
          {!prefs?.widgets.length ? (
            <p className="text-sm text-muted-foreground">
              Default widgets will appear after first load.
            </p>
          ) : null}
          {visibleWidgets.length ? (
            <p className="w-full text-xs text-muted-foreground">
              Visible order: {visibleWidgets.map((w) => w.title).join(" → ")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {history.slice(0, 12).map((h) => (
            <div key={h.id} className="flex justify-between border-b border-border/50 py-2">
              <span>
                {h.reportName} · {h.format.toUpperCase()} · {SCOPE_LABELS[h.scope]}
              </span>
              <span className="text-muted-foreground">
                {new Date(h.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
          {!history.length ? <p className="text-muted-foreground">No exports yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function formatKpi(kpi: KpiCard) {
  if (typeof kpi.value === "string") return kpi.value;
  if (kpi.format === "percent") return `${kpi.value}${kpi.unit ?? "%"}`;
  if (kpi.unit) return `${kpi.value}${kpi.unit}`;
  return kpi.value;
}

function renderChart(chart: ChartSeries) {
  const data = chart.points.map((p) => ({
    name: p.name,
    value: p.value,
    secondary: p.secondary,
  }));
  if (chart.kind === "pie") return <DonutChart data={data} />;
  if (chart.kind === "bar") return <BarsChart data={data} />;
  if (chart.kind === "line") return <LineTrendChart data={data} />;
  return <AreaTrendChart data={data} gradientId={`grad-${chart.id}`} />;
}

export { AnalyticsHubView };
