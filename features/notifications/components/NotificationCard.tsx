import type { NotificationRecord, NotificationType } from "@/types/domain/notification";
import { Badge } from "@/shared/ui/Badge";
import { Icon } from "@/shared/ui/Icon";

const typeLabels: Record<NotificationType, string> = {
  new_message: "رسالة",
  listing_approved: "إعلان",
  listing_rejected: "إعلان",
  order_created: "طلب",
  payment_held: "ضمان",
  payment_released: "ضمان",
  dispute_opened: "نزاع",
  wallet_updated: "محفظة",
};

const typeVariants: Record<
  NotificationType,
  "verified" | "pending" | "rejected" | "escrow" | "muted" | "new" | "featured"
> = {
  new_message: "new",
  listing_approved: "verified",
  listing_rejected: "rejected",
  order_created: "pending",
  payment_held: "escrow",
  payment_released: "verified",
  dispute_opened: "rejected",
  wallet_updated: "featured",
};

const typeIcons = {
  new_message: "message",
  listing_approved: "check",
  listing_rejected: "close",
  order_created: "package",
  payment_held: "shield",
  payment_released: "shield",
  dispute_opened: "shield",
  wallet_updated: "wallet",
} as const;

type NotificationCardProps = {
  notification: NotificationRecord;
  onMarkRead?: (id: string) => void;
};

export function NotificationCard({
  notification,
  onMarkRead,
}: NotificationCardProps) {
  return (
    <article
      className={`rounded-[var(--radius-xl)] border px-4 py-4 transition ${
        notification.read
          ? "border-border/70 bg-surface"
          : "border-primary/20 bg-primary-soft/35"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-xl)] bg-surface-muted text-primary">
          <Icon name={typeIcons[notification.type]} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{notification.title}</h3>
            <Badge variant={typeVariants[notification.type]}>
              {typeLabels[notification.type]}
            </Badge>
            {!notification.read ? (
              <span className="size-2 rounded-full bg-accent" />
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-7 text-muted">{notification.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>
              {new Date(notification.createdAt).toLocaleString("ar-AE", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {notification.href ? (
              <a className="font-semibold text-primary" href={notification.href}>
                عرض التفاصيل
              </a>
            ) : null}
            {!notification.read && onMarkRead ? (
              <button
                className="font-semibold text-ink"
                onClick={() => onMarkRead(notification.id)}
                type="button"
              >
                تعليم كمقروء
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
