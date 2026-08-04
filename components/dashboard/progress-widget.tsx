"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProgressWidgetProps {
  title: string;
  value: number;
  label?: string;
  className?: string;
}

function ProgressWidget({ title, value, label, className }: ProgressWidgetProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <p className="font-display text-3xl font-semibold">{clamped}%</p>
          {label ? <p className="text-xs text-muted-foreground">{label}</p> : null}
        </div>
        <Progress value={clamped} />
      </CardContent>
    </Card>
  );
}

export { ProgressWidget };
