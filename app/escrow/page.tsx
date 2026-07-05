import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getMarketEscrowSteps } from "@/services/content/homepage-marketplace.content";
import { ESCROW_FAQ, getEscrowSummary, getEscrowTransactions } from "@/services/escrow";
import { getCurrentUser } from "@/services/profile";

const priceFormatter = new Intl.NumberFormat("ar-AE", {
  maximumFractionDigits: 0,
});

const statusLabels = {
  held: "محجوز",
  released: "مكتمل",
  refunded: "مسترد",
  disputed: "نزاع",
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
          activePath="/escrow"
          description="نظام الضمان المالي يحمي المشتري والبائع في كل معاملة."
          title="الضمان المالي"
          user={user}
        >
          <div className="grid gap-5">
            <Card className="marketplace-panel p-6" variant="flat">
              <div className="flex items-start gap-3">
                <span className="grid size-12 place-items-center rounded-[var(--radius-xl)] bg-success-soft text-success">
                  <Icon name="shield" size={22} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-ink">ما هو الضمان المالي؟</h2>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    عند الشراء عبر UAE Sales، يُحجز المبلغ بأمان لدى المنصة حتى
                    يؤكد المشتري استلام المنتج. هذا يحمي المشتري من الاحتيال
                    ويضمن للبائع استلام المبلغ بعد التسليم.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="marketplace-stat-card p-6" variant="flat">
                <p className="text-sm font-medium text-muted">حجوزات نشطة</p>
                <p className="mt-2 text-3xl font-bold text-ink">{summary.activeHolds}</p>
              </Card>
              <Card className="marketplace-stat-card p-6" variant="flat">
                <p className="text-sm font-medium text-muted">إجمالي المحمي</p>
                <p className="mt-2 text-3xl font-bold text-ink">
                  {priceFormatter.format(summary.totalProtected)} د.إ
                </p>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="marketplace-panel p-6" variant="flat">
                <h3 className="text-sm font-semibold text-ink">حماية المشتري</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted">
                  <li>· المبلغ محجوز حتى تأكيد الاستلام</li>
                  <li>· إمكانية فتح نزاع خلال 7 أيام</li>
                  <li>· استرداد كامل عند عدم التسليم</li>
                </ul>
              </Card>
              <Card className="marketplace-panel p-6" variant="flat">
                <h3 className="text-sm font-semibold text-ink">حماية البائع</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted">
                  <li>· ضمان استلام المبلغ بعد التسليم</li>
                  <li>· حماية من الدفع الوهمي</li>
                  <li>· دعم في حالات النزاع</li>
                </ul>
              </Card>
            </div>

            <Card className="marketplace-panel p-6" variant="flat">
              <h2 className="text-sm font-semibold text-ink">معاملات الضمان</h2>
              <ul className="mt-4 grid gap-3">
                {transactions.map((txn) => (
                  <li
                    key={txn.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{txn.listingTitle}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {txn.buyerName} · {txn.sellerName}
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

            <Card className="marketplace-panel p-6" variant="flat">
              <h2 className="text-sm font-semibold text-ink">مسار الضمان</h2>
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

            <Card className="marketplace-panel p-6" variant="flat">
              <h2 className="text-sm font-semibold text-ink">الأسئلة الشائعة</h2>
              <dl className="mt-4 grid gap-4">
                {ESCROW_FAQ.map((item) => (
                  <div key={item.question}>
                    <dt className="text-sm font-bold text-ink">{item.question}</dt>
                    <dd className="mt-1 text-sm text-muted">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="marketplace-panel p-6 text-center" variant="flat">
              <p className="text-sm text-muted">
                تصفح الإعلانات المحمية بالضمان المالي
              </p>
              <Button className="mt-4" href="/featured" variant="gold">
                إعلانات مميزة محمية
              </Button>
            </Card>
          </div>
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
