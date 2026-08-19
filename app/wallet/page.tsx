import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import Link from "next/link";
import { WalletBalances } from "@/features/wallet/components/WalletBalances";
import { CurrencyAmount } from "@/shared/components/CurrencyAmount";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Icon } from "@/shared/ui/Icon";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { requireCurrentUser } from "@/services/profile";
import { getWalletSummary } from "@/services/walletService";
import { getRequestLocale, intlLocale } from "@/shared/i18n/locale";

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
  const user = await requireCurrentUser("/wallet");
  const wallet = await getWalletSummary(user.id);
  const locale = await getRequestLocale();
  const dateLocale = intlLocale(locale);

  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main>
        <DashboardShell
          activePath="/wallet"
          description="رصيدك الحقيقي من عمليات الدفع والضمان. لا تظهر هنا مبالغ تجريبية."
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
              {wallet.recentActivity.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    actionHref="/search"
                    actionLabel="تصفّح الإعلانات"
                    description="عندما تتم عملية دفع أو ضمان ستظهر هنا مباشرة."
                    icon="wallet"
                    title="لا توجد عمليات بعد"
                  />
                </div>
              ) : (
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
                          {new Date(item.date).toLocaleDateString(dateLocale, {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div
                        className={`shrink-0 text-sm font-bold ${item.amount >= 0 ? "text-success" : "text-ink"}`}
                      >
                        <CurrencyAmount
                          amount={item.amount}
                          showSign
                          size="sm"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Link
              className="inline-flex items-center justify-between gap-2 rounded-[1.25rem] border border-border bg-surface px-5 py-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
              href="/escrow"
            >
              <span className="inline-flex items-center gap-2">
                <Icon name="shield" size={16} />
                معاملات الضمان المالي
              </span>
              <Icon className="opacity-40" name="chevron-left" size={16} />
            </Link>
          </div>
        </DashboardShell>
      </main>
      </LocalizedTree>
      <SiteFooter />
    </>
  );
}
