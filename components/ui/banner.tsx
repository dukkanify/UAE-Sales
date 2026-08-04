import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type BannerVariant = "info" | "success" | "warning" | "error";

const icons: Record<BannerVariant, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const styles: Record<BannerVariant, string> = {
  info: "border-accent/30 bg-accent/10 text-foreground",
  success: "border-success/30 bg-success/10 text-foreground",
  warning: "border-warning/30 bg-warning/10 text-foreground",
  error: "border-destructive/30 bg-destructive/10 text-foreground",
};

interface BannerProps {
  variant?: BannerVariant;
  title: string;
  description?: string;
  className?: string;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

function Banner({
  variant = "info",
  title,
  description,
  className,
  onDismiss,
  action,
}: BannerProps) {
  const Icon = icons[variant];
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-soft",
        styles[variant],
        className,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
      {onDismiss ? (
        <Button variant="ghost" size="icon-sm" onClick={onDismiss} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

export { Banner };
