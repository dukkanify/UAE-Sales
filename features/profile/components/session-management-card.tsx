"use client";

import * as React from "react";
import { toast } from "sonner";
import { MonitorSmartphone, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import type { SessionListItem } from "@/types";

function SessionManagementCard() {
  const [sessions, setSessions] = React.useState<SessionListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const result = await authFetch<{ sessions: SessionListItem[] }>(routes.api.auth.sessions);
    setSessions(result.data?.sessions ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function revokeOne(id: string) {
    setBusyId(id);
    const result = await authFetch<{ revoked: boolean; signedOut: boolean }>(
      `${routes.api.auth.sessions}/${id}`,
      { method: "DELETE" },
    );
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error ?? "Unable to revoke session");
      return;
    }
    if (result.data?.signedOut) {
      toast.success("Current session ended");
      window.location.href = routes.login;
      return;
    }
    toast.success("Session revoked");
    void load();
  }

  async function revokeOthers() {
    setBusyId("__others__");
    const result = await authFetch<{ revoked: number }>(routes.api.auth.sessions, {
      method: "DELETE",
    });
    setBusyId(null);
    if (!result.success) {
      toast.error(result.error ?? "Unable to revoke sessions");
      return;
    }
    toast.success(`Revoked ${result.data?.revoked ?? 0} other session(s)`);
    void load();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="font-display text-xl">Devices & sessions</CardTitle>
          <CardDescription>
            Account protection limits sharing. New sign-ins on another device can end older
            sessions.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void revokeOthers()}
          disabled={busyId !== null || sessions.filter((s) => !s.current).length === 0}
        >
          <ShieldOff className="mr-2 h-4 w-4" />
          Sign out other devices
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active sessions.</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <MonitorSmartphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {session.deviceLabel || "Unknown device"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last active {new Date(session.lastActiveAt).toLocaleString()}
                    {session.ipAddress ? ` · ${session.ipAddress}` : ""}
                    {session.deviceFingerprint ? ` · fp ${session.deviceFingerprint}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.current ? <Badge variant="success">This device</Badge> : null}
                {!session.current ? (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={busyId === session.id}
                    onClick={() => void revokeOne(session.id)}
                  >
                    Revoke
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export { SessionManagementCard };
