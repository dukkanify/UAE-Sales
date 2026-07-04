import Link from "next/link";
import type { HomeEscrowStep } from "@/types";
import { Card } from "@/shared/ui/Card";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { getHomeEscrowSteps } from "@/services/content";

type EscrowSectionProps = {
  steps?: HomeEscrowStep[];
};

export async function EscrowSection(props: EscrowSectionProps = {}) {
  const items = props.steps ?? (await getHomeEscrowSteps());

  return (
    <section className="section-padding">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="نظام ضمان مالي يحمي حقوق المشتري والبائع."
          eyebrow="الضمان المالي"
          title="تسوّق بثقة تامة"
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {items.map((step, index) => (
            <Card key={step.title} className="p-5 text-center" interactive>
              <span className="mx-auto grid size-10 place-items-center rounded-[var(--radius-md)] bg-secondary-soft text-secondary">
                <Icon name={step.icon as IconName} size={18} />
              </span>
              <p className="mt-3 text-xs font-semibold text-secondary">
                {index + 1}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-xs font-medium leading-6 text-muted">
                {step.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            className="text-sm font-semibold text-primary transition hover:text-secondary"
            href="/escrow"
          >
            تعرّف على الضمان المالي ←
          </Link>
        </div>
      </div>
    </section>
  );
}
