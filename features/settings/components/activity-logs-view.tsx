"use client";

import * as React from "react";

import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/format";
import { authFetch } from "@/features/auth/services/auth-api";
import type { ActivityLogRecord, AuditLogRecord, PaginatedResponse } from "@/types";

function ActivityLogsView() {
  const [activity, setActivity] = React.useState<ActivityLogRecord[]>([]);
  const [audit, setAudit] = React.useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void (async () => {
      setLoading(true);
      const [activityRes, auditRes] = await Promise.all([
        authFetch<PaginatedResponse<ActivityLogRecord>>("/api/admin/activity-logs?page=1&pageSize=50"),
        authFetch<PaginatedResponse<AuditLogRecord>>("/api/admin/audit-logs?page=1&pageSize=50"),
      ]);
      setActivity(activityRes.data?.data ?? []);
      setAudit(auditRes.data?.data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System logs"
        description="Activity and audit trails. Visible to Super Admin only."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "System Logs" },
        ]}
      />

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-4">
          <div className="rounded-xl border border-border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Entity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : activity.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No activity yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  activity.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(log.createdAt, "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.actorId?.slice(0, 8) ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {[log.entityType, log.entityId?.slice(0, 8)].filter(Boolean).join(" · ") ||
                          "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <div className="rounded-xl border border-border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : audit.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No audit events yet. Settings changes will appear here.
                    </TableCell>
                  </TableRow>
                ) : (
                  audit.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(log.createdAt, "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.resource}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.actorId?.slice(0, 8) ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { ActivityLogsView };
