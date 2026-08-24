"use client";

import * as React from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authFetch } from "@/features/auth/services/auth-api";
import { routes } from "@/constants/routes";
import type { NotificationRecord, PaginatedResponse } from "@/types";
import { cn } from "@/lib/utils";

function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const [unread, setUnread] = React.useState(0);
  const [items, setItems] = React.useState<NotificationRecord[]>([]);

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
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="font-display text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">{unread} unread</p>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                className={cn(
                  "w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50",
                  !n.readAt && "bg-accent/5",
                )}
                onClick={() => void markRead(n.id)}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { NotificationBell };
