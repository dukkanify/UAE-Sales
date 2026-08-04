"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  Bug,
  CheckCircle2,
  ClipboardList,
  Database,
  GitBranch,
  HardDrive,
  Map,
  RefreshCw,
  Server,
  ShieldAlert,
  Wrench,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authFetch, csrfHeaders } from "@/features/auth/services/auth-api";
import { PostLaunchTabs } from "@/features/ops/components/post-launch-panels";
import { OpsStatusBadge } from "@/features/ops/components/ops-status-badge";

type Dashboard = {
  serverStatus: string;
  databaseStatus: string;
  apiStatus: string;
  storage: { uploadsMb: number; dataMb: number; percentUsed: number; quotaGb: number };
  queueHealth: string;
  emailStatus?: string;
  zoomStatus?: string;
  paymentsStatus?: string;
  jobsStatus?: string;
  activeUsers: number;
  errorCount: number;
  openAlerts: Array<{
    id: string;
    severity: string;
    status: string;
    title: string;
    detail: string;
    createdAt: string;
  }>;
  checks: Array<{ id: string; label: string; status: string; detail: string }>;
  backups: {
    total: number;
    latest: { id: string; createdAt: string; retention: string } | null;
    dailyOk: boolean;
    weeklyOk: boolean;
    restoreTested: boolean;
  };
  maintenance: {
    enabled: boolean;
    statusMessage: string;
    estimatedReturnAt: string | null;
    contactEmail: string;
  };
  hypercare?: Record<string, unknown>;
  recentReleases?: Array<Record<string, unknown>>;
  sla: {
    critical: { responseHours: number; resolutionHours: number };
    high: { responseHours: number; resolutionHours: number };
    medium: { responseHours: number; resolutionHours: number };
    low: { responseHours: number; resolutionHours: number };
  };
  timestamp: string;
};

type Summary = {
  openSupport: number;
  openBugs: number;
  pendingCrs: number;
  pendingFeatures?: number;
  openIncidents: number;
  openAlerts: number;
  releases: number;
  roadmapActive: number;
  knowledgeArticles?: number;
  feedbackNew?: number;
  hypercareEnabled?: boolean;
  optimizationOpen?: number;
};

async function postAction(body: Record<string, unknown>) {
  const res = await fetch("/api/support-ops", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...csrfHeaders() },
    body: JSON.stringify(body),
  });
  return (await res.json()) as { success: boolean; data?: unknown; error: string | null };
}

function statusBadge(status: string) {
  return <OpsStatusBadge status={status} />;
}

export function OpsCenterShell() {
  const [dash, setDash] = React.useState<Dashboard | null>(null);
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [bugs, setBugs] = React.useState<Array<Record<string, unknown>>>([]);
  const [support, setSupport] = React.useState<Array<Record<string, unknown>>>([]);
  const [crs, setCrs] = React.useState<Array<Record<string, unknown>>>([]);
  const [releases, setReleases] = React.useState<Array<Record<string, unknown>>>([]);
  const [roadmap, setRoadmap] = React.useState<Array<Record<string, unknown>>>([]);
  const [incidents, setIncidents] = React.useState<Array<Record<string, unknown>>>([]);
  const [backupReports, setBackupReports] = React.useState<Array<Record<string, unknown>>>([]);
  const [hypercare, setHypercare] = React.useState<Record<string, unknown> | null>(null);
  const [features, setFeatures] = React.useState<Array<Record<string, unknown>>>([]);
  const [knowledge, setKnowledge] = React.useState<Array<Record<string, unknown>>>([]);
  const [feedback, setFeedback] = React.useState<Array<Record<string, unknown>>>([]);
  const [feedbackSummary, setFeedbackSummary] = React.useState<Record<string, unknown> | null>(
    null,
  );
  const [optimization, setOptimization] = React.useState<Array<Record<string, unknown>>>([]);
  const [maintenanceDash, setMaintenanceDash] = React.useState<Record<string, unknown> | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [maintMessage, setMaintMessage] = React.useState("");
  const [maintEta, setMaintEta] = React.useState("");
  const [bugTitle, setBugTitle] = React.useState("");
  const [crDesc, setCrDesc] = React.useState("");
  const [releaseVersion, setReleaseVersion] = React.useState("");
  const [roadmapTitle, setRoadmapTitle] = React.useState("");
  const [slaDraft, setSlaDraft] = React.useState<Dashboard["sla"] | null>(null);

  const load = React.useCallback(async () => {
    const [d, s, b, sup, c, r, road, inc, br, hc, feat, kb, fb, fbs, opt, md] = await Promise.all([
      authFetch<Dashboard>("/api/support-ops?view=dashboard"),
      authFetch<Summary>("/api/support-ops?view=summary"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=bugs"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=support"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=change-requests"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=releases"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=roadmap"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=incidents"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=backup-reports"),
      authFetch<Record<string, unknown>>("/api/support-ops?view=hypercare"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=features"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=knowledge"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=feedback"),
      authFetch<Record<string, unknown>>("/api/support-ops?view=feedback-summary"),
      authFetch<Array<Record<string, unknown>>>("/api/support-ops?view=optimization"),
      authFetch<Record<string, unknown>>("/api/support-ops?view=maintenance-dashboard"),
    ]);
    if (d.data) {
      setDash(d.data);
      setSlaDraft(d.data.sla);
      setMaintMessage(d.data.maintenance.statusMessage);
      setMaintEta(d.data.maintenance.estimatedReturnAt?.slice(0, 16) ?? "");
    }
    if (s.data) setSummary(s.data);
    setBugs(b.data ?? []);
    setSupport(sup.data ?? []);
    setCrs(c.data ?? []);
    setReleases(r.data ?? []);
    setRoadmap(road.data ?? []);
    setIncidents(inc.data ?? []);
    setBackupReports(br.data ?? []);
    setHypercare(hc.data ?? d.data?.hypercare ?? null);
    setFeatures(feat.data ?? []);
    setKnowledge(kb.data ?? []);
    setFeedback(fb.data ?? []);
    setFeedbackSummary(fbs.data ?? null);
    setOptimization(opt.data ?? []);
    setMaintenanceDash(md.data ?? null);
    if (!d.success) setError(d.error);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function run(action: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const json = await postAction(action);
    if (!json.success) setError(json.error);
    await load();
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ops Center"
        description="Post-launch hypercare, SLA support, incidents, feature requests, knowledge base, and Version 1.1 roadmap."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Ops Center" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void load()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void run({ action: "capture_health" })}
            >
              Snapshot health
            </Button>
          </div>
        }
      />

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Server" value={dash?.serverStatus ?? "—"} icon={Server} />
        <StatCard label="Active users" value={dash?.activeUsers ?? "—"} icon={Activity} />
        <StatCard
          label="Open alerts"
          value={summary?.openAlerts ?? dash?.openAlerts.length ?? "—"}
          icon={AlertTriangle}
        />
        <StatCard
          label={summary?.hypercareEnabled ? "Hypercare on" : "Errors (buffer)"}
          value={
            summary?.hypercareEnabled
              ? (summary.pendingFeatures ?? summary.openIncidents ?? "—")
              : (dash?.errorCount ?? "—")
          }
          icon={ShieldAlert}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="hypercare">Hypercare</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="bugs">Bugs</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="crs">Change requests</TabsTrigger>
          <TabsTrigger value="releases">Releases</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="optimization">Optimize</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <PostLaunchTabs
          busy={busy}
          run={run}
          hypercare={hypercare}
          features={features}
          knowledge={knowledge}
          feedback={feedback}
          feedbackSummary={feedbackSummary}
          optimization={optimization}
          maintenanceDash={maintenanceDash}
        />

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="h-4 w-4" /> System checks
                </CardTitle>
                <CardDescription>
                  API · DB · storage · email · Zoom · payments · auth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(dash?.checks ?? []).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 border-b border-border/60 py-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      <p className="text-xs text-muted-foreground">{c.detail}</p>
                    </div>
                    {statusBadge(c.status)}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <HardDrive className="h-4 w-4" /> Capacity & queues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  Storage: {dash?.storage.dataMb ?? 0} MB data · {dash?.storage.uploadsMb ?? 0} MB
                  uploads ({dash?.storage.percentUsed ?? 0}% of {dash?.storage.quotaGb ?? 0} GB)
                </p>
                <p>
                  Queue health: <span className="capitalize">{dash?.queueHealth}</span>
                </p>
                <p className="flex flex-wrap items-center gap-2">
                  Email {statusBadge(dash?.emailStatus ?? "warn")} · Zoom{" "}
                  {statusBadge(dash?.zoomStatus ?? "warn")} · Payments{" "}
                  {statusBadge(dash?.paymentsStatus ?? "warn")} · Jobs{" "}
                  {statusBadge(dash?.jobsStatus ?? "warn")}
                </p>
                <p>
                  Database: {statusBadge(dash?.databaseStatus ?? "warn")} · API:{" "}
                  {statusBadge(dash?.apiStatus ?? "pass")}
                </p>
                <div className="pt-2">
                  <p className="mb-2 font-medium">Open alerts</p>
                  {(dash?.openAlerts ?? []).length === 0 ? (
                    <p className="text-muted-foreground">No open alerts</p>
                  ) : (
                    (dash?.openAlerts ?? []).map((a) => (
                      <div key={a.id} className="mb-2 rounded-md border p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{a.title}</span>
                          {statusBadge(a.severity)}
                        </div>
                        <p className="text-xs text-muted-foreground">{a.detail}</p>
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void run({ action: "ack_alert", id: a.id })}
                          >
                            Ack
                          </Button>
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => void run({ action: "resolve_alert", id: a.id })}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4" /> Support requests
              </CardTitle>
              <CardDescription>
                Channels: ticket · email · admin report · Categories include technical, Zoom,
                payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  void run({
                    action: "create_support",
                    subject: "Ops Center follow-up",
                    description: "Internal admin report from Ops Center",
                    category: "general",
                    channel: "admin_report",
                    priority: "medium",
                  })
                }
              >
                New admin report
              </Button>
              {support.map((row) => (
                <div key={String(row.id)} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {String(row.number)} — {String(row.subject)}
                    </span>
                    <div className="flex gap-2">
                      {statusBadge(String(row.priority))}
                      {statusBadge(String(row.status))}
                      {row.slaBreached ? <Badge variant="destructive">SLA breach</Badge> : null}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {String(row.category)} · {String(row.channel)} · {String(row.requesterEmail)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["acknowledged", "in_progress", "resolved", "closed"].map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          void run({ action: "update_support", id: row.id, status: st })
                        }
                      >
                        {st.replaceAll("_", " ")}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bugs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bug className="h-4 w-4" /> Bug workflow
              </CardTitle>
              <CardDescription>
                New → Confirmed → In Progress → Ready for Testing → Verified → Closed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Bug title"
                  value={bugTitle}
                  onChange={(e) => setBugTitle(e.target.value)}
                />
                <Button
                  disabled={busy || !bugTitle.trim()}
                  onClick={() => {
                    void run({
                      action: "create_bug",
                      title: bugTitle,
                      description: bugTitle,
                      priority: "medium",
                      module: "general",
                    }).then(() => setBugTitle(""));
                  }}
                >
                  File bug
                </Button>
              </div>
              {bugs.map((row) => (
                <div key={String(row.id)} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {String(row.number)} — {String(row.title)}
                    </span>
                    <div className="flex gap-2">
                      {statusBadge(String(row.priority))}
                      {statusBadge(String(row.status))}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Module: {String(row.module)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["confirmed", "in_progress", "ready_for_testing", "verified", "closed"].map(
                      (st) => (
                        <Button
                          key={st}
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => void run({ action: "update_bug", id: row.id, status: st })}
                        >
                          {st.replaceAll("_", " ")}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitBranch className="h-4 w-4" /> Change requests
              </CardTitle>
              <CardDescription>
                Approved requests promote into the roadmap as future phases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Describe the change and business impact…"
                value={crDesc}
                onChange={(e) => setCrDesc(e.target.value)}
              />
              <Button
                disabled={busy || !crDesc.trim()}
                onClick={() => {
                  void run({
                    action: "create_cr",
                    description: crDesc,
                    businessImpact: crDesc,
                    estimatedTimeHours: 8,
                    estimatedCost: 0,
                    futurePhase: "1.1",
                  }).then(() => setCrDesc(""));
                }}
              >
                Submit change request
              </Button>
              {crs.map((row) => (
                <div key={String(row.id)} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{String(row.number)}</span>
                    <div className="flex gap-2">
                      {statusBadge(String(row.approvalStatus))}
                      {statusBadge(String(row.developmentStatus))}
                    </div>
                  </div>
                  <p className="mt-1">{String(row.description)}</p>
                  <p className="text-xs text-muted-foreground">
                    Impact: {String(row.businessImpact)} · Est. {String(row.estimatedTimeHours)}h ·{" "}
                    {String(row.estimatedCost)} {String(row.currency)}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run({ action: "update_cr", id: row.id, approvalStatus: "approved" })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void run({ action: "update_cr", id: row.id, approvalStatus: "rejected" })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="releases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4" /> Release management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Version e.g. 1.1.0"
                  value={releaseVersion}
                  onChange={(e) => setReleaseVersion(e.target.value)}
                />
                <Button
                  disabled={busy || !releaseVersion.trim()}
                  onClick={() => {
                    void run({
                      action: "create_release",
                      version: releaseVersion,
                      title: `Release ${releaseVersion}`,
                      summary: `ATPL PASS ${releaseVersion}`,
                      highlights: [],
                      fixes: [],
                    }).then(() => setReleaseVersion(""));
                  }}
                >
                  Record release
                </Button>
              </div>
              {releases.map((row) => (
                <div key={String(row.id)} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      v{String(row.version)} — {String(row.title)}
                    </span>
                    {row.deployedAt ? (
                      <Badge>Deployed</Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => void run({ action: "deploy_release", id: row.id })}
                      >
                        Mark deployed
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground">{String(row.summary)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Map className="h-4 w-4" /> Future roadmap
              </CardTitle>
              <CardDescription>
                Planned · Approved · In development · Completed · Deferred
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Roadmap item title"
                  value={roadmapTitle}
                  onChange={(e) => setRoadmapTitle(e.target.value)}
                />
                <Button
                  disabled={busy || !roadmapTitle.trim()}
                  onClick={() => {
                    void run({
                      action: "create_roadmap",
                      title: roadmapTitle,
                      description: roadmapTitle,
                      status: "planned",
                      priority: "medium",
                    }).then(() => setRoadmapTitle(""));
                  }}
                >
                  Add item
                </Button>
              </div>
              {roadmap.map((row) => (
                <div key={String(row.id)} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{String(row.title)}</span>
                    {statusBadge(String(row.status))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target: {String(row.targetVersion ?? "TBD")} · {String(row.priority)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["approved", "in_development", "completed", "deferred"].map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          void run({ action: "update_roadmap", id: row.id, status: st })
                        }
                      >
                        {st.replaceAll("_", " ")}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" /> Incident reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  void run({
                    action: "create_incident",
                    title: "Service degradation",
                    summary: "Investigating elevated error rate",
                    severity: "high",
                    affectedModule: "api",
                    affectedServices: ["api", "auth"],
                    rootCause: null,
                    resolution: null,
                    preventiveAction: null,
                  })
                }
              >
                Open incident
              </Button>
              {incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No incidents recorded</p>
              ) : (
                incidents.map((row) => (
                  <div key={String(row.id)} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">
                        {String(row.number)} — {String(row.title)}
                      </span>
                      <div className="flex gap-2">
                        {statusBadge(String(row.severity))}
                        {statusBadge(String(row.status))}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Module: {String(row.affectedModule ?? "general")} ·{" "}
                      {Array.isArray(row.affectedServices)
                        ? (row.affectedServices as string[]).join(", ")
                        : ""}
                    </p>
                    {row.rootCause ? (
                      <p className="mt-1 text-xs">Root cause: {String(row.rootCause)}</p>
                    ) : null}
                    {row.resolution ? (
                      <p className="text-xs">Resolution: {String(row.resolution)}</p>
                    ) : null}
                    {row.preventiveAction ? (
                      <p className="text-xs">Preventive: {String(row.preventiveAction)}</p>
                    ) : null}
                    <Button
                      className="mt-2"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        void run({ action: "update_incident", id: row.id, status: "resolved" })
                      }
                    >
                      Resolve
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="h-4 w-4" /> Backup verification
              </CardTitle>
              <CardDescription>
                Daily/weekly presence · integrity · restore testing · reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-3">
                {statusBadge(dash?.backups.dailyOk ? "pass" : "warn")} Daily
                {statusBadge(dash?.backups.weeklyOk ? "pass" : "warn")} Weekly
                {statusBadge(dash?.backups.restoreTested ? "pass" : "warn")} Restore tested
              </div>
              <p>
                Total backups: {dash?.backups.total ?? 0}
                {dash?.backups.latest
                  ? ` · Latest ${dash.backups.latest.retention} @ ${dash.backups.latest.createdAt}`
                  : " · none yet"}
              </p>
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  void run({ action: "backup_report", period: "ad_hoc", runRestoreTest: true })
                }
              >
                Generate verification report
              </Button>
              {backupReports.map((row) => (
                <div key={String(row.id)} className="rounded-md border p-2">
                  <div className="flex justify-between gap-2">
                    <span>{String(row.notes)}</span>
                    {statusBadge(row.success ? "pass" : "fail")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Integrity {String(row.integrityOk)} · Restore {String(row.restoreTestOk)} ·{" "}
                    {String(row.generatedAt)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurable SLA targets</CardTitle>
              <CardDescription>Response and resolution hours by priority</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {slaDraft
                ? (["critical", "high", "medium", "low"] as const).map((tier) => (
                    <div key={tier} className="grid gap-2 sm:grid-cols-3 sm:items-end">
                      <p className="text-sm font-medium capitalize">{tier}</p>
                      <label className="text-xs">
                        Response (h)
                        <Input
                          type="number"
                          className="mt-1"
                          value={slaDraft[tier].responseHours}
                          onChange={(e) =>
                            setSlaDraft({
                              ...slaDraft,
                              [tier]: {
                                ...slaDraft[tier],
                                responseHours: Number(e.target.value),
                              },
                            })
                          }
                        />
                      </label>
                      <label className="text-xs">
                        Resolution (h)
                        <Input
                          type="number"
                          className="mt-1"
                          value={slaDraft[tier].resolutionHours}
                          onChange={(e) =>
                            setSlaDraft({
                              ...slaDraft,
                              [tier]: {
                                ...slaDraft[tier],
                                resolutionHours: Number(e.target.value),
                              },
                            })
                          }
                        />
                      </label>
                    </div>
                  ))
                : null}
              <Button
                disabled={busy || !slaDraft}
                onClick={() =>
                  void run({
                    action: "update_sla",
                    critical: slaDraft!.critical,
                    high: slaDraft!.high,
                    medium: slaDraft!.medium,
                    low: slaDraft!.low,
                  })
                }
              >
                Save SLA policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-4 w-4" /> Maintenance mode
              </CardTitle>
              <CardDescription>
                Super Admins stay signed in; everyone else sees the public maintenance page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                Current:{" "}
                {dash?.maintenance.enabled ? (
                  <Badge variant="warning">Enabled</Badge>
                ) : (
                  <Badge>Online</Badge>
                )}
              </p>
              <Textarea
                value={maintMessage}
                onChange={(e) => setMaintMessage(e.target.value)}
                placeholder="Status message shown to visitors"
              />
              <label className="block text-xs">
                Estimated return (local)
                <Input
                  type="datetime-local"
                  className="mt-1"
                  value={maintEta}
                  onChange={(e) => setMaintEta(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy}
                  onClick={() =>
                    void run({
                      action: "set_maintenance",
                      enabled: true,
                      statusMessage: maintMessage,
                      estimatedReturnAt: maintEta ? new Date(maintEta).toISOString() : null,
                    })
                  }
                >
                  Enable maintenance
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void run({
                      action: "set_maintenance",
                      enabled: false,
                      statusMessage: maintMessage || "Platform is online.",
                    })
                  }
                >
                  Disable maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
