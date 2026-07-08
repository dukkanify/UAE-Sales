import Link from "next/link";
import { WalletBalances } from "@/features/wallet/components/WalletBalances";
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
  refund: "استرداد",
  stripe_payment: "دفع Stripe",
  platform_fee: "رسوم المنصة",
  escrow_release: "تحويل ضمان",
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
            <WalletBalances
              defaultAvailable={wallet.availableBalance}
              defaultHeldInEscrow={wallet.heldInEscrow}
              defaultPending={wallet.pendingBalance}
            />

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
