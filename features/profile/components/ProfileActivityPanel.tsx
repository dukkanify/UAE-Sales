import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { getNotifications } from "@/services/activityService";

export async function ProfileActivityPanel() {
  const notifications = await getNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mt-6">
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
              description="ستظهر هنا تنبيهات الطلبات والضمان والرسائل عندما تحدث فعلاً."
              icon="message"
              title="لا إشعارات حتى الآن"
            />
          </div>
        ) : (
          <ul className="mt-4 grid gap-2">
            {notifications.slice(0, 4).map((item) => (
              <li
                key={item.id}
                className={`rounded-[var(--radius-xl)] px-4 py-3 text-sm ${item.read ? "bg-surface-muted text-muted" : "border border-primary/15 bg-primary-soft"}`}
              >
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs">{item.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
