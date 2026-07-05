"use client";

import Link from "next/link";
import {
  mockDashboardNotifications,
  mockDashboardQuickActions,
  mockDashboardRecentActivity,
  mockDashboardSummaryCards,
  mockDashboardViewsChart,
} from "@/mock";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";

const maxViews = Math.max(...mockDashboardViewsChart.map((d) => d.value));
const unreadCount = mockDashboardNotifications.filter((item) => !item.read).length;

export function DashboardOverviewPanel() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {mockDashboardSummaryCards.map((card) => (
          <Link
            key={card.label}
            className="marketplace-stat-card interactive-lift block p-5"
            href={card.href}
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
                <Icon name={card.icon} size={18} />
              </span>
              <p className="text-lg font-bold text-ink">{card.value}</p>
            </div>
            <p className="mt-2 text-xs font-medium text-muted">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="marketplace-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-ink">تحليلات المشاهدات</h2>
            <span className="text-xs font-medium text-muted">آخر 7 أيام</span>
          </div>
          <div
            aria-label="مخطط المشاهدات الأسبوعي"
            className="mt-6 flex h-36 items-end justify-between gap-2"
            role="img"
          >
            {mockDashboardViewsChart.map((bar) => (
              <div key={bar.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full max-w-10 rounded-t-[var(--radius-md)] bg-gradient-to-t from-primary/80 to-secondary transition-all duration-500"
                  style={{ height: `${(bar.value / maxViews) * 100}%`, minHeight: "0.5rem" }}
                  title={`${bar.value} مشاهدة`}
                />
                <span className="text-[0.6rem] font-medium text-muted">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="marketplace-panel p-5">
          <h2 className="text-sm font-bold text-ink">إجراءات سريعة</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {mockDashboardQuickActions.map((action) => (
              <Button
                key={action.href}
                className="!justify-start"
                href={action.href}
                size="sm"
                variant="secondary"
              >
                <Icon name={action.icon} size={14} />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="marketplace-panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">الإشعارات</h2>
            {unreadCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-error-soft px-2 py-0.5 text-[0.65rem] font-bold text-error">
                <Icon name="bell" size={10} />
                {unreadCount} جديد
              </span>
            ) : null}
          </div>
          <ul className="mt-4 grid gap-3">
            {mockDashboardNotifications.map((item) => (
              <li
                key={item.id}
                className={`rounded-[var(--radius-xl)] border px-3 py-2.5 ${item.read ? "border-border bg-surface" : "border-secondary/30 bg-secondary-soft/40"}`}
              >
                <p className="text-xs font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-xs font-medium text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="marketplace-panel p-5">
          <h2 className="text-sm font-bold text-ink">النشاط الأخير</h2>
          <ul className="mt-4 grid gap-3">
            {mockDashboardRecentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-border/80 pb-3 last:border-0 last:pb-0"
              >
                <p className="text-xs font-semibold text-ink">{item.text}</p>
                <span className="shrink-0 text-[0.65rem] font-medium text-muted">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
