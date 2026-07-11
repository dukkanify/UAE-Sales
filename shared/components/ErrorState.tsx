"use client";

import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";

type ErrorStateProps = {
  children?: React.ReactNode;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  title: string;
  variant?: "network" | "not-found" | "server" | "offline";
};

const iconMap = {
  network: "package",
  "not-found": "search",
  offline: "package",
  server: "package",
} as const;

export function ErrorState({
  children,
  description,
  onRetry,
  retryLabel = "إعادة المحاولة",
  title,
  variant = "server",
}: ErrorStateProps) {
  return (
    <Card className="p-10 text-center" role="alert" variant="flat">
      <span className="mx-auto grid size-14 place-items-center rounded-[var(--radius-2xl)] bg-accent-soft text-accent">
        <Icon name={iconMap[variant]} size={24} />
      </span>
      <h2 className="mt-5 text-xl font-black text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-7 text-muted">
        {description}
      </p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry} type="button">
          {retryLabel}
        </Button>
      ) : null}
      {children}
    </Card>
  );
}
