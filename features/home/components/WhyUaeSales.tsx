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
    <section className="section-padding bg-surface-muted/50">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="لماذا يختار آلاف المستخدمين UAE Sales."
          eyebrow="لماذا نحن"
          title="سوق مختلف"
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((reason) => (
            <Card key={reason.title} className="p-5" interactive>
              <span className="grid size-9 place-items-center rounded-[var(--radius-md)] bg-primary text-white">
                <Icon name={reason.icon as IconName} size={16} />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-ink">{reason.title}</h3>
              <p className="mt-1.5 text-xs font-medium leading-6 text-muted">
                {reason.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
