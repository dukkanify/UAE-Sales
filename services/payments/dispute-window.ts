import type { Order, OrderStatus } from "@/types/domain/order";
import type { AdminSiteSettings } from "@/services/admin/admin-settings-store";

export const DISPUTE_ELIGIBLE_STATUSES: OrderStatus[] = [
  "paid_held_in_escrow",
  "delivered",
  "confirmed",
];

export type DisputeWindow = {
  canOpen: boolean;
  closed: boolean;
  closesAt: string;
  eligibleStatus: boolean;
  remainingDays: number;
  remainingMs: number;
  responseDays: number;
  startsAt: string;
  windowDays: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeDisputeWindow(
  order: Order,
  settings: Pick<AdminSiteSettings, "disputeWindowDays" | "disputeResponseDays">,
): DisputeWindow {
  const startsAt = order.paidAt ?? order.createdAt;
  const startMs = new Date(startsAt).getTime();
  const windowDays = Math.max(1, settings.disputeWindowDays ?? 7);
  const responseDays = Math.max(1, settings.disputeResponseDays ?? 3);
  const closeMs = startMs + windowDays * DAY_MS;
  const remainingMs = closeMs - Date.now();
  const eligibleStatus = DISPUTE_ELIGIBLE_STATUSES.includes(order.status);
  const closed = !Number.isFinite(startMs) || remainingMs <= 0;
  const alreadyOpen = order.status === "disputed";

  return {
    windowDays,
    responseDays,
    startsAt,
    closesAt: new Date(closeMs).toISOString(),
    remainingMs: Math.max(0, remainingMs),
    remainingDays: Math.max(0, Math.ceil(remainingMs / DAY_MS)),
    eligibleStatus,
    closed,
    canOpen: eligibleStatus && !closed && !alreadyOpen,
  };
}

export function formatRemainingDays(days: number): string {
  if (days <= 0) return "أقل من يوم";
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومان";
  if (days <= 10) return `${days} أيام`;
  return `${days} يوماً`;
}
