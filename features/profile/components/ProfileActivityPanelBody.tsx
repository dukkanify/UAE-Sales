"use client";

import Link from "next/link";
import { Suspense } from "react";
import type { AppNotification } from "@/types/domain/notification";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { ActivityDashboardSummary } from "@/features/activity/components/ActivityDashboardSummary";
import { MarkNotificationsRead } from "@/features/notifications/MarkNotificationsRead";
import { NotificationsList } from "@/features/notifications/NotificationsList";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Icon } from "@/shared/ui/Icon";

type ProfileActivityPanelBodyProps = {
  notifications: AppNotification[];
  unread: number;
};

export function ProfileActivityPanelBody({
  notifications,
  unread,
}: ProfileActivityPanelBodyProps) {
  return (
    <LocalizedTree>
      <div className="mt-6 grid gap-5">
        <ActivityDashboardSummary />

        <Card className="scroll-mt-24 p-5" id="activity" variant="flat">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">طلباتي ونشاطاتي</h2>
              <p className="mt-1 text-xs text-muted">
                الوظائف، الحجوزات، الخدمات، الطلبات، والإعلانات — من الخادم مباشرة.
              </p>
            </div>
            <Link className="text-xs font-semibold text-primary hover:underline" href="/notifications">
              الإشعارات
            </Link>
          </div>
          <div className="mt-4">
            <Suspense fallback={<p className="text-sm text-muted">جاري تحميل النشاط...</p>}>
              <ActivityFeed />
            </Suspense>
          </div>
        </Card>

        <Card className="scroll-mt-24 p-5" id="notifications" variant="flat">
          <MarkNotificationsRead />
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
                description="ستظهر هنا رسالة الترحيب بعد التحقق والاعتماد، وتنبيهات الطلبات والضمان عندما تحدث فعلاً."
                icon="message"
                title="لا إشعارات حتى الآن"
              />
            </div>
          ) : (
            <div className="mt-4">
              <NotificationsList items={notifications.slice(0, 8)} />
              <Link className="mt-3 inline-block text-xs font-semibold text-primary hover:underline" href="/notifications">
                عرض كل الإشعارات
              </Link>
            </div>
          )}
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
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
    </LocalizedTree>
  );
}
