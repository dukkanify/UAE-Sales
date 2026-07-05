import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { DashboardActivityWidget } from "@/features/dashboard/components/DashboardActivityWidget";
import { getSavedListings } from "@/services/activityService";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

export async function ProfileActivityPanel() {
  const saved = await getSavedListings();

  return (
    <div className="mt-6 grid gap-5">
      <DashboardActivityWidget />

      <Card className="p-5" variant="flat">
        <h2 className="text-sm font-semibold text-ink">المحفوظات</h2>
        <ul className="mt-4 grid gap-2">
          {saved.map((item) => (
            <li key={item.slug}>
              <Link
                className="flex items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-border px-4 py-3 transition hover:bg-surface-muted"
                href={`/listings/${item.slug}`}
              >
                <span className="truncate text-sm font-medium text-ink">
                  {item.title}
                </span>
                <span className="shrink-0 text-sm font-bold text-ink">
                  {priceFormatter.format(item.price)} د.إ
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/wallet", icon: "wallet" as const, label: "المحفظة" },
          { href: "/escrow", icon: "shield" as const, label: "الضمان المالي" },
          { href: "/notifications", icon: "message" as const, label: "الإشعارات" },
        ].map((link) => (
          <Link
            key={link.href}
            className="flex items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink transition hover:border-primary/30"
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
