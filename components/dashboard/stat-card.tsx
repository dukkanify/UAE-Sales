"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  className?: string;
}

function StatCard({ label, value, hint, icon: Icon, trend, className }: StatCardProps) {
  const positive = (trend?.value ?? 0) >= 0;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-[box-shadow,border-color] duration-200 hover:border-border/80 hover:shadow-soft",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-display text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            {trend ? (
              <p
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium",
                  positive ? "text-success" : "text-destructive",
                )}
              >
                {positive ? (
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                )}
                {positive ? "+" : ""}
                {trend.value}%
                {trend.label ? (
                  <span className="font-normal text-muted-foreground"> {trend.label}</span>
                ) : null}
              </p>
            ) : hint ? (
              <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </div>
          {Icon ? (
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent"
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export { StatCard };
