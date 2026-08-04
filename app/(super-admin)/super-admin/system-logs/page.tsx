"use client";

import * as React from "react";
import { Download, HardDrive, RefreshCw, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authFetch } from "@/features/auth/services/auth-api";

type Health = {
  status: string;
  checks: Array<{ id: string; label: string; status: string; detail: string }>;
  timestamp: string;
};

type LogRow = {
  id: string;
  level: string;
  category: string;
  message: string;
  path?: string | null;
  createdAt: string;
};

type Backup = {
  id: string;
  retention: string;
  createdAt: string;
  files: unknown[];
  restoreTestedAt: string | null;
};

type ChecklistItem = { id: string; label: string; status: string; detail: string };

function SystemLogsPage() {
  const [health, setHealth] = React.useState<Health | null>(null);
  const [logs, setLogs] = React.useState<LogRow[]>([]);
  const [backups, setBackups] = React.useState<Backup[]>([]);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [q, setQ] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const [h, l, b, c] = await Promise.all([
      authFetch<Health>("/api/ops?view=health"),
      authFetch<LogRow[]>(
        `/api/ops?view=logs&category=${category}&q=${encodeURIComponent(q)}&limit=100`,
      ),
      authFetch<Backup[]>("/api/ops?view=backups"),
      authFetch<ChecklistItem[]>("/api/ops?view=checklist"),
    ]);
    setHealth(h.data);
    setLogs(l.data ?? []);
    setBackups(b.data ?? []);
    setChecklist(c.data ?? []);
    if (!h.success) setError(h.error);
  }, [category, q]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function runBackup() {
    const csrf = document.cookie
      .split("; ")
      .find((c) => c.startsWith("aep_csrf="))
      ?.split("=")[1];
    const res = await fetch("/api/ops", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}),
      },
      body: JSON.stringify({ action: "backup", retention: "daily" }),
    });
    const json = (await res.json()) as { success: boolean; error: string | null };
    if (!json.success) setError(json.error);
    void load();
  }

  async function testRestore(backupId: string) {
    const csrf = document.cookie
      .split("; ")
      .find((c) => c.startsWith("aep_csrf="))
      ?.split("=")[1];
    await fetch("/api/ops", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}),
      },
      body: JSON.stringify({ action: "test_restore", backupId }),
    });
    void load();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System logs & operations"
        description="Centralized logs, health checks, backups, and production readiness."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "System logs" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void load()}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="/api/ops?view=logs&format=csv">
                <Download className="size-4" />
                Export logs
              </a>
            </Button>
            <Button size="sm" onClick={() => void runBackup()}>
              <HardDrive className="size-4" />
              Run backup
            </Button>
          </div>
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {health ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase text-muted-foreground">Platform status</p>
              <p className="font-display text-2xl capitalize">{health.status}</p>
            </CardContent>
          </Card>
          {health.checks.slice(0, 3).map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase text-muted-foreground">{c.label}</p>
                  <Badge variant={c.status === "fail" ? "destructive" : "secondary"}>
                    {c.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm">{c.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4" />
            Production checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {checklist.map((item) => (
            <div key={item.id} className="rounded-lg border px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{item.label}</p>
                <Badge variant={item.status === "fail" ? "destructive" : "secondary"}>
                  {item.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Backups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {backups.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{b.id}</p>
                <p className="text-xs text-muted-foreground">
                  {b.retention} · {new Date(b.createdAt).toLocaleString()} · {b.files.length} files
                  {b.restoreTestedAt ? ` · tested ${new Date(b.restoreTestedAt).toLocaleString()}` : ""}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => void testRestore(b.id)}>
                Test restore
              </Button>
            </div>
          ))}
          {!backups.length ? (
            <p className="text-sm text-muted-foreground">No backups yet. Run a backup to start retention.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Centralized logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search logs…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-xs"
            />
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["all", "application", "error", "security", "audit", "api", "job", "backup"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="max-h-[28rem] space-y-2 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{log.level}</Badge>
                  <Badge variant="outline">{log.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1">{log.message}</p>
                {log.path ? (
                  <p className="text-xs text-muted-foreground">{log.path}</p>
                ) : null}
              </div>
            ))}
            {!logs.length ? (
              <p className="text-sm text-muted-foreground">No log entries for this filter.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SystemLogsPage;
