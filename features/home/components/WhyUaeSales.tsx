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
    <section className="section-padding bg-[var(--color-background)]">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="لماذا يختار آلاف المستخدمين UAE Sales."
          eyebrow="لماذا نحن"
          title="سوق موثوق للإمارات"
        />

        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((reason) => (
            <Card key={reason.title} className="p-5" variant="flat">
              <span className="grid size-10 place-items-center rounded-[var(--radius-lg)] bg-surface-muted text-secondary">
                <Icon name={reason.icon as IconName} size={18} />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink">{reason.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{reason.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
