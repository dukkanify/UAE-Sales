"use client";

import Link from "next/link";
import { ActivityDashboardSummary } from "@/features/activity/components/ActivityDashboardSummary";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

const quickActions = [
  { href: "/listings/new", icon: "plus" as const, label: "إضافة إعلان" },
  { href: "/wallet", icon: "wallet" as const, label: "المحفظة" },
  { href: "/escrow", icon: "shield" as const, label: "الضمان" },
  { href: "/chat", icon: "message" as const, label: "الرسائل" },
];

export function DashboardOverviewPanel() {
  return (
<LocalizedTree>
    <div className="grid gap-5">
      <div>
        <h2 className="text-sm font-bold text-ink">ملخص النشاط</h2>
        <p className="mt-1 text-xs text-muted">
          طلباتك وحجوزاتك ومشترياتك — من الخادم مباشرة.
        </p>
        <div className="mt-3">
          <ActivityDashboardSummary />
        </div>
      </div>
      <div className="marketplace-panel p-5">
        <h2 className="text-sm font-bold text-ink">إجراءات سريعة</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
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
      <p className="text-sm text-muted">
        الرصيد والرسائل والإشعارات تظهر هنا فقط عندما تكون هناك بيانات حقيقية من حسابك.
      </p>
      <Link className="text-sm font-semibold text-primary" href="/dashboard/listings">
        إدارة إعلاناتي
      </Link>
    </div>
  </LocalizedTree>
);
}
