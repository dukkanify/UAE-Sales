import type { DisputeStatus, ListingStatus, OrderStatus } from "@/types";
import { Badge } from "@/shared/ui/Badge";

type AdminStatusBadgeProps = {
  status:
    | ListingStatus
    | OrderStatus
    | DisputeStatus
    | "held"
    | "released"
    | "refunded"
    | "disputed"
    | "active"
    | "suspended";
};

const labels: Record<string, string> = {
  active: "نشط",
  suspended: "موقوف",
  draft: "مسودة",
  pending_review: "بانتظار المراجعة",
  expired: "منتهي",
  rejected: "مرفوض",
  pending: "قيد الانتظار",
  paid: "مدفوع",
  completed: "مكتمل",
  cancelled: "ملغى",
  disputed: "نزاع",
  held: "محجوز",
  released: "مُطلق",
  refunded: "مسترد",
  open: "مفتوح",
  under_review: "قيد المراجعة",
  resolved: "محلول",
  closed: "مغلق",
};

const variants: Record<string, "verified" | "pending" | "rejected" | "escrow" | "muted" | "new"> = {
  active: "verified",
  suspended: "rejected",
  draft: "muted",
  pending_review: "pending",
  expired: "muted",
  rejected: "rejected",
  pending: "pending",
  paid: "escrow",
  completed: "verified",
  cancelled: "muted",
  disputed: "rejected",
  held: "escrow",
  released: "verified",
  refunded: "new",
  open: "rejected",
  under_review: "pending",
  resolved: "verified",
  closed: "muted",
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <Badge variant={variants[status] ?? "muted"}>
      {labels[status] ?? status}
    </Badge>
  );
}
