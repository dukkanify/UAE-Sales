"use client";

import * as React from "react";
import Link from "@/components/ui/app-link";
import { Archive, Bell, CheckCheck, CircleAlert, Info, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import type { NotificationRecord, PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type ListPayload = PaginatedResponse<NotificationRecord> & {
  unreadCount: number;
  groups?: Array<{
    kind: "group" | "single";
    groupKey: string | null;
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
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function PriorityIcon({ priority }: { priority?: string }) {
  if (priority === "critical" || priority === "high") {
    return <CircleAlert className="h-3.5 w-3.5 text-destructive" />;
  }
  if (priority === "medium") return <Shield className="h-3.5 w-3.5 text-accent" />;
  return <Info className="h-3.5 w-3.5 text-muted-foreground" />;
}

function categoryColor(category?: string): string {
  switch (category) {
    case "security":
      return "border-l-destructive";
    case "payment":
      return "border-l-emerald-500";
    case "booking":
    case "reminder":
      return "border-l-sky-500";
    case "course":
    case "assignment":
      return "border-l-indigo-500";
    case "message":
      return "border-l-violet-500";
    default:
      return "border-l-border";
  }
}

function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [unread, setUnread] = React.useState(0);
  const [payload, setPayload] = React.useState<ListPayload | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [category, setCategory] = React.useState("all");

  const notificationsHref = user
    ? `/${user.role === "super_admin" ? "super-admin" : user.role === "chief_ground_instructor" ? "cgi" : user.role}/notifications`
    : routes.login;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await authFetch<ListPayload>(
        `${routes.api.notifications}?grouped=true&pageSize=20`,
      );
      if (result.success && result.data) {
        setPayload(result.data);
        setUnread(result.data.unreadCount);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const pollUnread = React.useCallback(async () => {
    const result = await authFetch<{ unreadCount: number }>(routes.api.notificationUnreadCount);
    if (result.success && result.data) setUnread(result.data.unreadCount);
  }, []);

  React.useEffect(() => {
    void load();
    const id = window.setInterval(() => void pollUnread(), 15_000);
    return () => window.clearInterval(id);
  }, [load, pollUnread]);

  React.useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const markRead = async (id: string) => {
    await authFetch(routes.api.notifications, {
      method: "PATCH",
      body: JSON.stringify({ id, action: "read" }),
    });
    void load();
  };

  const markAll = async () => {
    await authFetch("/api/notifications/read-all", { method: "POST", body: "{}" });
    void load();
  };

  const groups = payload?.groups ?? [];
  const filtered = groups.filter((g) => {
    if (category === "all") return true;
    if (category === "unread") return !g.latest.readAt;
    if (category === "security")
      return g.latest.category === "security" || g.latest.type.startsWith("security");
    return g.latest.category === category || g.latest.type === category;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground animate-in zoom-in-50">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="font-display text-sm font-semibold">Notification center</p>
            <p className="text-xs text-muted-foreground">{unread} unread</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void markAll()} disabled={unread === 0}>
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all
          </Button>
        </div>

        <Tabs value={category} onValueChange={setCategory} className="px-2 pt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="course">Course</TabsTrigger>
          </TabsList>
          <TabsContent value={category} className="mt-0">
            <div className="max-h-80 overflow-y-auto">
              {loading && !payload ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Archive className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
                </div>
              ) : (
                filtered.map((g) => (
                  <button
                    key={`${g.groupKey ?? g.latest.id}-${g.latest.id}`}
                    type="button"
                    className={cn(
                      "w-full border-b border-border border-l-2 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      categoryColor(g.latest.category),
                      !g.latest.readAt && "bg-accent/5",
                    )}
                    onClick={() => void markRead(g.latest.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <PriorityIcon priority={g.latest.priority} />
                        <p className="text-sm font-medium leading-snug">{g.title}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {relativeTime(g.latest.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 pl-5 text-xs text-muted-foreground">
                      {g.body}
                    </p>
                    {g.count > 1 ? (
                      <Badge variant="secondary" className="mt-1 ml-5 text-[10px]">
                        {g.count} grouped
                      </Badge>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t border-border p-2">
          <Button variant="ghost" className="w-full" asChild>
            <Link href={notificationsHref} onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { NotificationBell };
