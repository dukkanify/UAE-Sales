import Link from "next/link";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCurrentUser } from "@/services/profile";
import { getWalletSummary } from "@/services/walletService";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

const activityLabels = {
  deposit: "إيداع",
  escrow_hold: "حجز ضمان",
  release: "تحويل",
  withdrawal: "سحب",
} as const;

export default async function WalletPage() {
  const [user, wallet] = await Promise.all([
    getCurrentUser(),
    getWalletSummary(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/profile"
          description="رصيدك المتاح، المبالغ المحجوزة في الضمان، وسجل العمليات الأخير."
          title="المحفظة"
          user={user}
        >
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-6" variant="flat">
                <p className="text-sm font-medium text-muted">الرصيد المتاح</p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {priceFormatter.format(wallet.availableBalance)}{" "}
                  <span className="text-sm font-medium text-muted">د.إ</span>
                </p>
              </Card>
              <Card className="p-6" variant="flat">
                <p className="text-sm font-medium text-muted">قيد المعالجة</p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {priceFormatter.format(wallet.pendingBalance)}{" "}
                  <span className="text-sm font-medium text-muted">د.إ</span>
                </p>
              </Card>
            </div>

            <Card className="p-6" variant="flat">
              <h2 className="text-sm font-semibold text-ink">النشاط الأخير</h2>
              <ul className="mt-4 grid gap-3">
                {wallet.recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-border bg-surface-muted px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {item.description}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {activityLabels[item.type]} ·{" "}
                        {new Date(item.date).toLocaleDateString("ar-AE", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-bold ${item.amount >= 0 ? "text-success" : "text-ink"}`}
                    >
                      {item.amount >= 0 ? "+" : ""}
                      {priceFormatter.format(item.amount)} د.إ
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5" variant="flat">
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                href="/escrow"
              >
                <Icon name="shield" size={16} />
                عرض معاملات الضمان المالي
              </Link>
            </Card>
          </div>
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
