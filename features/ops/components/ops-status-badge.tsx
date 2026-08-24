"use client";

import { Badge } from "@/components/ui/badge";

const POSITIVE = new Set([
  "pass",
  "up",
  "healthy",
  "closed",
  "verified",
  "approved",
  "done",
  "stable",
  "available",
  "published",
  "resolved",
]);

const WARNING = new Set([
  "warn",
  "degraded",
  "open",
  "new",
  "pending",
  "in_progress",
  "acknowledged",
  "planned",
  "triaged",
]);

const DESTRUCTIVE = new Set(["fail", "critical"]);

/** Shared status chip for Ops Center lists. */
export function OpsStatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const variant = POSITIVE.has(key)
    ? "default"
    : WARNING.has(key)
      ? "warning"
      : DESTRUCTIVE.has(key)
        ? "destructive"
        : "secondary";

  return (
    <Badge
      variant={variant as "default" | "warning" | "destructive" | "secondary"}
      className="capitalize"
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
