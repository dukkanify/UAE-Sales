import type { HomeReason } from "@/types";
import { SectionBackdrop } from "@/shared/components/SectionBackdrop";
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
    <section className="relative overflow-hidden">
      <SectionBackdrop variant="gold" />

      <div className="app-container relative section-padding">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeader
              description="لماذا يختار آلاف المستخدمين UAE Sales كمنصتهم الأولى في الإمارات."
              eyebrow="لماذا نحن"
              title="سوق مختلف بمعايير عالمية"
            />

            <div className="mt-6 hidden rounded-[var(--radius-2xl)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "shield", label: "أمان", value: "100%" },
                  { icon: "star", label: "تقييم", value: "4.9" },
                  { icon: "chart", label: "إعلانات", value: "24K+" },
                  { icon: "check", label: "موثقون", value: "18K+" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[var(--radius-xl)] bg-surface-muted p-4 text-center"
                  >
                    <Icon className="mx-auto text-secondary" name={item.icon as IconName} size={22} />
                    <p className="mt-2 text-lg font-black text-ink">{item.value}</p>
                    <p className="text-xs font-semibold text-muted">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((reason) => (
              <Card key={reason.title} className="p-5" interactive variant="elevated">
                <span className="grid size-11 place-items-center rounded-[var(--radius-xl)] bg-gradient-to-br from-primary to-night-soft text-white shadow-[var(--shadow-sm)]">
                  <Icon name={reason.icon as IconName} size={18} />
                </span>
                <h3 className="mt-4 text-sm font-bold text-ink">{reason.title}</h3>
                <p className="mt-2 text-xs font-medium leading-6 text-muted">
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
