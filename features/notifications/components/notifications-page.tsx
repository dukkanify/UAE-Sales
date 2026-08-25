"use client";

import * as React from "react";
import { Archive, Bell, CheckCheck, Search, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import type { NotificationRecord, PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";

interface NotificationsPageViewProps {
  roleSegment: string;
}

type Prefs = {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  marketingEnabled: boolean;
  reminderEnabled: boolean;
  securityEnabled: boolean;
  courseEnabled: boolean;
  bookingEnabled: boolean;
  paymentEnabled: boolean;
  messageEnabled: boolean;
};

type ListPayload = PaginatedResponse<NotificationRecord> & {
  unreadCount: number;
  groups?: Array<{
    kind: "group" | "single";
    count: number;
    title: string;
    body: string;
    latest: NotificationRecord;
  }>;
  tookMs?: number;
};

function relativeTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function NotificationsPageView({ roleSegment }: NotificationsPageViewProps) {
  const [items, setItems] = React.useState<NotificationRecord[]>([]);
  const [groups, setGroups] = React.useState<ListPayload["groups"]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [unread, setUnread] = React.useState(0);
  const [tookMs, setTookMs] = React.useState<number | null>(null);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("active");
  const [category, setCategory] = React.useState("all");
  const [priority, setPriority] = React.useState("all");
  const [showPrefs, setShowPrefs] = React.useState(false);
  const [prefs, setPrefs] = React.useState<Prefs | null>(null);
  const [pending, startTransition] = React.useTransition();
  const deferredQ = React.useDeferredValue(q);

  const load = React.useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          pageSize: "20",
          grouped: "true",
          status,
        });
        if (deferredQ.trim()) params.set("q", deferredQ.trim());
        if (category !== "all") params.set("category", category);
        if (priority !== "all") params.set("priority", priority);
        const result = await authFetch<ListPayload>(
          `${routes.api.notifications}?${params.toString()}`,
        );
        const data = result.data;
        if (!data) return;
        setUnread(data.unreadCount);
        setTookMs(data.tookMs ?? null);
        setTotalPages(data.totalPages);
        setPage(data.page);
        if (append) {
          setItems((prev) => [...prev, ...data.data]);
          setGroups((prev) => [...(prev ?? []), ...(data.groups ?? [])]);
        } else {
          setItems(data.data);
          setGroups(data.groups ?? []);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [status, category, priority, deferredQ],
  );

  React.useEffect(() => {
    void load(1, false);
  }, [load]);

  React.useEffect(() => {
    if (!showPrefs) return;
    void (async () => {
      const result = await authFetch<Prefs>(routes.api.notificationPreferences);
      if (result.success && result.data) setPrefs(result.data);
    })();
  }, [showPrefs]);

  const act = (id: string, action: "read" | "archive" | "delete") => {
    startTransition(async () => {
      await authFetch(routes.api.notifications, {
        method: "PATCH",
        body: JSON.stringify({ id, action }),
      });
      void load(1, false);
    });
  };

  const savePrefs = (next: Prefs) => {
    setPrefs(next);
    startTransition(async () => {
      await authFetch(routes.api.notificationPreferences, {
        method: "PATCH",
        body: JSON.stringify(next),
      });
      toast.success("Notification preferences saved");
    });
  };

  const display =
    groups && groups.length
      ? groups
      : items.map((n) => ({
          kind: "single" as const,
          count: 1,
          title: n.title,
          body: n.body,
          latest: n,
        }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification center"
        description="Intelligent alerts across courses, bookings, payments, and security."
        breadcrumbs={[
          { label: "Dashboard", href: `/${roleSegment}/dashboard` },
          { label: "Notifications" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPrefs((v) => !v)}>
              <Settings2 className="h-3.5 w-3.5" />
              Preferences
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending || unread === 0}
              onClick={() =>
                startTransition(async () => {
                  await authFetch("/api/notifications/read-all", {
                    method: "POST",
                    body: "{}",
                  });
                  toast.success("All notifications marked as read");
                  void load(1, false);
                })
              }
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          </div>
        }
      />

      {showPrefs && prefs ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["inAppEnabled", "In-app"],
                ["emailEnabled", "Email"],
                ["pushEnabled", "Push (coming soon)"],
                ["securityEnabled", "Security"],
                ["reminderEnabled", "Reminders"],
                ["courseEnabled", "Courses"],
                ["bookingEnabled", "Bookings"],
                ["paymentEnabled", "Payments"],
                ["messageEnabled", "Messages"],
                ["marketingEnabled", "Marketing"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2"
              >
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={Boolean(prefs[key])}
                  disabled={key === "pushEnabled"}
                  onCheckedChange={(checked) => savePrefs({ ...prefs, [key]: checked })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search notifications…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="course">Course</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="reminder">Reminders</SelectItem>
            <SelectItem value="ops">Ops</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="informational">Informational</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{unread} unread</span>
        {tookMs != null ? <span>Loaded in {tookMs}ms</span> : null}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : display.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No notifications"
          description="You're all caught up. New alerts will appear here."
        />
      ) : (
        <div className="space-y-3">
          {display.map((g) => {
            const n = g.latest;
            return (
              <Card
                key={n.id}
                className={cn("transition-opacity", n.readAt ? "opacity-75" : "border-accent/30")}
              >
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{g.title}</p>
                      {!n.readAt ? <Badge variant="accent">New</Badge> : null}
                      {g.count > 1 ? <Badge variant="secondary">{g.count} grouped</Badge> : null}
                      <Badge variant="outline" className="capitalize">
                        {(n.priority ?? "informational").replaceAll("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {(n.category ?? n.type).replaceAll(".", " ").replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{g.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {relativeTime(n.createdAt)} · {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {!n.readAt ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => act(n.id, "read")}
                      >
                        Mark read
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => act(n.id, "archive")}
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => act(n.id, "delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {page < totalPages ? (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                disabled={loadingMore}
                onClick={() => void load(page + 1, true)}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export { NotificationsPageView };
