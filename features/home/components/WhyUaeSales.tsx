import type { HomeReason } from "@/types";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { getHomeReasons } from "@/services/content";

type WhyUaeSalesProps = {
  reasons?: HomeReason[];
};

export async function WhyUaeSales(props: WhyUaeSalesProps = {}) {
  const items = props.reasons ?? (await getHomeReasons());

  return (
    <section className="relative overflow-hidden section-padding bg-[linear-gradient(180deg,#fff,var(--color-background))]">
      <div className="pointer-events-none absolute start-0 top-16 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      <div className="app-container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeader
              description="تجربة مصممة للسوق الإماراتي: واضحة، آمنة، وسريعة من أول بحث إلى آخر خطوة."
              eyebrow="لماذا نحن"
              title="منصة ذكية، بهوية إماراتية"
            />

            <div className="rounded-[var(--radius-2xl)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["24K+", "إعلان نشط"],
                  ["18K+", "مستخدم موثق"],
                  ["4.9", "تقييم المستخدمين"],
                  ["12K+", "معاملة آمنة"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[var(--radius-xl)] bg-surface-muted p-4">
                    <p className="text-xl font-black text-ink">{value}</p>
                    <p className="mt-1 text-xs font-medium text-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((reason) => (
              <Card key={reason.title} className="p-5" interactive variant="elevated">
                <span className="grid size-11 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
                  <Icon name={reason.icon as IconName} size={19} />
                </span>
                <h3 className="mt-4 text-sm font-black text-ink">{reason.title}</h3>
                <p className="mt-2 text-sm font-medium leading-7 text-muted">
                  {reason.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
