"use client";

import * as React from "react";
import { Activity, AlertTriangle, Database, HardDrive, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authFetch } from "@/features/auth/services/auth-api";
import { formatDate } from "@/utils/format";

interface MonitoringData {
  recentLogins: Array<{
    id: string;
    actorId: string | null;
    createdAt: string;
    ipAddress: string | null;
  }>;
  onlineUsers: number;
  failedLoginAttempts24h: number;
  failedLogins: Array<{ id: string; createdAt: string; ipAddress: string | null }>;
  systemWarnings: string[];
  databaseStatus: {
    provider: string;
    users: number;
    sessions: number;
    activityLogs: number;
    auditLogs: number;
    healthy: boolean;
  };
  storageUsage: {
    provider: string;
    uploadsMb: number;
    dataMb: number;
    quotaGb: number;
    percentUsed: number;
  };
  platformStatus: string;
  generatedAt: string;
}

function ActivityMonitoringPage() {
  const [data, setData] = React.useState<MonitoringData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void authFetch<MonitoringData>("/api/admin/monitoring").then((result) => {
      if (result.success && result.data) setData(result.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity monitoring"
        description="Live platform health: logins, sessions, storage, and warnings."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Monitoring" },
        ]}
      />

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Online users" value={data.onlineUsers} icon={Users} />
            <StatCard
              label="Failed logins (24h)"
              value={data.failedLoginAttempts24h}
              icon={AlertTriangle}
            />
            <StatCard
              label="Database users"
              value={data.databaseStatus.users}
              icon={Database}
              hint={data.databaseStatus.healthy ? "Healthy" : "Check required"}
            />
            <StatCard
              label="Storage used"
              value={`${data.storageUsage.percentUsed}%`}
              icon={HardDrive}
              hint={`${data.storageUsage.uploadsMb + data.storageUsage.dataMb} MB of ${data.storageUsage.quotaGb} GB`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System warnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.systemWarnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No warnings.</p>
                ) : (
                  data.systemWarnings.map((w) => (
                    <div
                      key={w}
                      className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
                      {w}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Database status</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="font-medium">{data.databaseStatus.provider}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Platform status</p>
                  <Badge className="mt-1 capitalize">{data.platformStatus}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active sessions</p>
                  <p className="font-medium">{data.databaseStatus.sessions}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Activity / audit logs</p>
                  <p className="font-medium">
                    {data.databaseStatus.activityLogs} / {data.databaseStatus.auditLogs}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" /> Recent logins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.recentLogins.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent logins.</p>
                ) : (
                  data.recentLogins.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0"
                    >
                      <span className="font-mono text-xs">{l.actorId?.slice(0, 8) ?? "—"}</span>
                      <span className="text-muted-foreground">
                        {formatDate(l.createdAt, "MMM d, HH:mm")}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Failed login attempts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.failedLogins.length === 0 ? (
                  <p className="text-sm text-muted-foreground">None in the last 24 hours.</p>
                ) : (
                  data.failedLogins.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0"
                    >
                      <span className="font-mono text-xs">{l.ipAddress ?? "unknown IP"}</span>
                      <span className="text-muted-foreground">
                        {formatDate(l.createdAt, "MMM d, HH:mm")}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default ActivityMonitoringPage;
