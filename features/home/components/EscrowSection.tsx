import Link from "next/link";
import type { HomeEscrowStep } from "@/types";
import { Button } from "@/shared/ui/Button";
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
    <section className="section-padding bg-surface">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="نظام ضمان مالي يحمي حقوق المشتري والبائع."
          eyebrow="الضمان المالي"
          title="تسوّق بثقة تامة"
        />

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {items.map((step, index) => (
            <Card key={step.title} className="p-5" variant="flat">
              <div className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-lg)] bg-surface-muted text-secondary">
                  <Icon name={step.icon as IconName} size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted">الخطوة {index + 1}</p>
                  <h3 className="mt-1 text-sm font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button href="/escrow" variant="primary">
            تعرّف على الضمان المالي
          </Button>
          <p className="mt-4">
            <Link className="text-sm font-semibold text-primary" href="/register">
              إنشاء حساب مجاني ←
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
