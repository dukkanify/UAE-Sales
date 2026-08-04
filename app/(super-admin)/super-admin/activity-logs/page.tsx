import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { listActivityLogs } from "@/services/auth/activity-log";
import { ensureSuperAdminSeeded } from "@/services/auth/seed";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "Activity Logs" };

export default function ActivityLogsPage() {
  ensureSuperAdminSeeded();
  const logs = listActivityLogs({ page: 1, pageSize: 50 });

  return (
    <div>
      <PageHeader
        title="Activity logs"
        description="Security-relevant actions across the platform. Visible to Super Admin only."
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "Activity Logs" },
        ]}
      />

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
            {logs.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No activity yet. Sign-in and profile events will appear here.
                </TableCell>
              </TableRow>
            ) : (
              logs.data.map((log) => (
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
    </div>
  );
}
