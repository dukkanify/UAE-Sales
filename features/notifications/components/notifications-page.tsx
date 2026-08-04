"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import type { NotificationRecord, PaginatedResponse } from "@/types";

interface NotificationsPageViewProps {
  roleSegment: string;
}

function NotificationsPageView({ roleSegment }: NotificationsPageViewProps) {
  const [items, setItems] = React.useState<NotificationRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [pending, startTransition] = React.useTransition();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await authFetch<
        PaginatedResponse<NotificationRecord> & { unreadCount: number }
      >(routes.api.notifications);
      setItems(result.data?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay on top of platform updates, class reminders, and account activity."
        breadcrumbs={[
          { label: "Dashboard", href: `/${roleSegment}/dashboard` },
          { label: "Notifications" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await authFetch("/api/notifications/read-all", {
                  method: "POST",
                  body: "{}",
                });
                toast.success("All notifications marked as read");
                void load();
              })
            }
          >
            Mark all read
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No notifications"
          description="You're all caught up. New alerts will appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <Card key={n.id} className={n.readAt ? "opacity-70" : undefined}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.readAt ? <Badge variant="accent">New</Badge> : null}
                    <Badge variant="outline" className="capitalize">
                      {n.type.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.readAt ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      startTransition(async () => {
                        await authFetch(routes.api.notifications, {
                          method: "PATCH",
                          body: JSON.stringify({ id: n.id }),
                        });
                        void load();
                      })
                    }
                  >
                    Mark read
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { NotificationsPageView };
