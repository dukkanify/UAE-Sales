import Link from "next/link";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCurrentUser } from "@/services/profile";
import { getWalletSummary } from "@/services/wallet";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

const typeLabels = {
  deposit: "إيداع",
  withdrawal: "سحب",
  escrow_hold: "حجز ضمان",
  escrow_release: "إطلاق ضمان",
  escrow_refund: "استرداد",
  payment: "دفع",
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
          activePath="/wallet"
          description="رصيدك المتاح، المبالغ المحجوزة، وسجل العمليات الكامل."
          title="المحفظة"
          user={user}
        >
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="marketplace-stat-card p-6" variant="flat">
                <p className="text-sm font-medium text-muted">الرصيد المتاح</p>
                <p className="mt-2 text-2xl font-bold text-ink">
                  {priceFormatter.format(wallet.availableBalance)} د.إ
                </p>
              </Card>
              <Card className="marketplace-stat-card p-6" variant="flat">
                <p className="text-sm font-medium text-muted">قيد المعالجة</p>
                <p className="mt-2 text-2xl font-bold text-ink">
                  {priceFormatter.format(wallet.pendingBalance)} د.إ
                </p>
              </Card>
              <Card className="marketplace-stat-card p-6" variant="flat">
                <p className="text-sm font-medium text-muted">محجوز في الضمان</p>
                <p className="mt-2 text-2xl font-bold text-ink">
                  {priceFormatter.format(wallet.heldBalance)} د.إ
                </p>
              </Card>
              <Card className="marketplace-stat-card p-6" variant="flat">
                <p className="text-sm font-medium text-muted">إجمالي العمليات</p>
                <p className="mt-2 text-2xl font-bold text-ink">
                  {wallet.totalTransactions}
                </p>
              </Card>
            </div>

            <Card className="marketplace-panel p-6" variant="flat">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">سجل العمليات</h2>
                <Button disabled size="sm" variant="secondary">
                  طلب سحب
                </Button>
              </div>
              <ul className="mt-4 grid gap-3">
                {wallet.transactions.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-[var(--radius-xl)] border border-border bg-surface-muted px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {item.description}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {typeLabels[item.type]} ·{" "}
                        {new Date(item.createdAt).toLocaleDateString("ar-AE", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <p
                        className={`text-sm font-bold ${item.amount >= 0 ? "text-success" : "text-ink"}`}
                      >
                        {item.amount >= 0 ? "+" : ""}
                        {priceFormatter.format(item.amount)} د.إ
                      </p>
                      <Badge variant={item.status === "completed" ? "escrow" : "muted"}>
                        {item.status === "completed" ? "مكتمل" : "قيد المعالجة"}
                      </Badge>
                    </div>
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
