import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Icon } from "@/shared/ui/Icon";
import { getNotifications } from "@/services/activityService";
import { markNotificationsReadForUser } from "@/services/payments/notification-store";

export async function ProfileActivityPanel({ userId }: { userId: string }) {
  const notifications = await getNotifications(userId);
  const unread = notifications.filter((n) => !n.read).length;
  if (unread > 0) {
    await markNotificationsReadForUser(userId);
  }

  return (
    <div className="mt-6 grid gap-5">
      <Card className="scroll-mt-24 p-5" id="notifications" variant="flat">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">الإشعارات</h2>
          {unread > 0 ? (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent">
              {unread} جديد
            </span>
          ) : null}
        </div>
        {notifications.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              actionHref="/search"
              actionLabel="استكشف السوق"
              description="ستظهر هنا رسالة الترحيب وتنبيهات الطلبات والضمان عندما تحدث فعلاً."
              icon="message"
              title="لا إشعارات حتى الآن"
            />
          </div>
        ) : (
          <ul className="mt-4 grid gap-2">
            {notifications.slice(0, 8).map((item) => {
              const content = (
                <>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-xs">{item.body}</p>
                </>
              );
              return (
                <li
                  key={item.id}
                  className={`rounded-[var(--radius-xl)] px-4 py-3 text-sm ${item.read ? "bg-surface-muted text-muted" : "border border-primary/15 bg-primary-soft"}`}
                >
                  {item.href ? (
                    <Link className="block" href={item.href}>
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/dashboard/disputes", icon: "shield" as const, label: "النزاعات" },
          { href: "/wallet", icon: "wallet" as const, label: "المحفظة" },
          { href: "/escrow", icon: "shield" as const, label: "الضمان المالي" },
          { href: "/chat", icon: "message" as const, label: "الرسائل" },
        ].map((link) => (
          <Link
            key={link.href}
            className="flex items-center gap-2 rounded-[var(--radius-xl)] border border-border px-4 py-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            href={link.href}
          >
            <Icon name={link.icon} size={16} />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
