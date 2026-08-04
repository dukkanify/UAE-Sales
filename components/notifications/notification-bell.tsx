"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import type { NotificationRecord, PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [unread, setUnread] = React.useState(0);
  const [items, setItems] = React.useState<NotificationRecord[]>([]);
  const [category, setCategory] = React.useState("all");

  const notificationsHref = user
    ? `/${user.role === "super_admin" ? "super-admin" : user.role}/notifications`
    : routes.login;

  const load = React.useCallback(async () => {
    const result = await authFetch<
      PaginatedResponse<NotificationRecord> & { unreadCount: number }
    >(routes.api.notifications);
    if (result.success && result.data) {
      setItems(result.data.data);
      setUnread(result.data.unreadCount);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const markRead = async (id: string) => {
    await authFetch(routes.api.notifications, {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });
    void load();
  };

  const markAll = async () => {
    await authFetch("/api/notifications/read-all", { method: "POST", body: "{}" });
    void load();
  };

  const filtered =
    category === "all"
      ? items
      : category === "unread"
        ? items.filter((n) => !n.readAt)
        : items.filter((n) => n.type === category);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          <TabsContent value={category} className="mt-0">
            <div className="max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No notifications
                </p>
              ) : (
                filtered.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(
                      "w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      !n.readAt && "bg-accent/5",
                    )}
                    onClick={() => void markRead(n.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {n.type}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
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
