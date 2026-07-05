import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getMarketEscrowSteps } from "@/services/content/homepage-marketplace.content";
import { getEscrowSummary, getEscrowTransactions } from "@/services/escrowService";
import { getCurrentUser } from "@/services/profile";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

const statusLabels = {
  held: "محجوز",
  released: "مكتمل",
  pending_delivery: "بانتظار التسليم",
} as const;

export default async function EscrowPage() {
  const [user, transactions, summary, steps] = await Promise.all([
    getCurrentUser(),
    getEscrowTransactions(),
    getEscrowSummary(),
    getMarketEscrowSteps(),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/profile"
          description="متابعة المبالغ المحجوزة والمعاملات المحمية بين المشتري والبائع."
          title="الضمان المالي"
          user={user}
        >
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-6" variant="flat">
                <p className="text-sm font-medium text-muted">حجوزات نشطة</p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {summary.activeHolds}
                </p>
              </Card>
              <Card className="p-6" variant="flat">
                <p className="text-sm font-medium text-muted">إجمالي المحمي</p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {priceFormatter.format(summary.totalProtected)} د.إ
                </p>
              </Card>
            </div>

            <Card className="p-6" variant="flat">
              <h2 className="text-sm font-semibold text-ink">معاملاتك</h2>
              <ul className="mt-4 grid gap-3">
                {transactions.map((txn) => (
                  <li
                    key={txn.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {txn.listingTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        مع {txn.buyer} ·{" "}
                        {new Date(txn.createdAt).toLocaleDateString("ar-AE")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-ink">
                        {priceFormatter.format(txn.amount)} د.إ
                      </p>
                      <Badge variant="escrow">{statusLabels[txn.status]}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6" variant="flat">
              <h2 className="text-sm font-semibold text-ink">كيف يعمل الضمان</h2>
              <ol className="mt-4 grid gap-2">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex gap-3 rounded-[var(--radius-xl)] bg-surface-muted px-4 py-3 text-sm"
                  >
                    <span className="font-bold text-primary">{index + 1}.</span>
                    <div>
                      <p className="font-semibold text-ink">{step.title}</p>
                      <p className="text-muted">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
