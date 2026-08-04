"use client";

import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className={cn("overflow-hidden", className)}>
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
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
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
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent">
                <Icon className="h-5 w-5" />
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { StatCard };
