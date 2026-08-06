"use client";

import Link from "@/components/ui/app-link";
import { formatDistanceToNow, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  badge?: string;
}

interface RecentActivityProps {
  title?: string;
  items: ActivityItem[];
  viewAllHref?: string;
  className?: string;
  emptyMessage?: string;
}

function RecentActivity({
  title = "Recent activity",
  items,
  viewAllHref,
  className,
  emptyMessage = "No recent activity",
}: RecentActivityProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {viewAllHref ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={viewAllHref}>View all</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                </p>
              </div>
              {item.badge ? <Badge variant="secondary">{item.badge}</Badge> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export { RecentActivity };
