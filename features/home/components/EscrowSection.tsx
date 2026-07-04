import Link from "next/link";
import type { HomeEscrowStep } from "@/types";
import { SectionBackdrop } from "@/shared/components/SectionBackdrop";
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
    <section className="relative overflow-hidden">
      <SectionBackdrop variant="mesh" />

      <div className="app-container relative section-padding">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden lg:block">
            <div className="cta-panel-premium overflow-hidden rounded-[var(--radius-2xl)] p-8">
              <div className="absolute -end-8 -top-8 size-32 rounded-full bg-secondary/20 blur-3xl" />
              <span className="grid size-16 place-items-center rounded-[var(--radius-2xl)] bg-secondary/20 text-secondary">
                <Icon name="shield" size={32} />
              </span>
              <h3 className="mt-6 text-2xl font-black text-white">
                معاملات محمية
              </h3>
              <p className="mt-3 max-w-sm text-sm font-medium leading-7 text-white/75">
                كل درهم يمر عبر نظام ضمان مالي ذكي يحمي المشتري والبائع حتى
                اكتمال الصفقة بنجاح.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-[var(--radius-xl)] border border-white/15 bg-white/8 p-4 backdrop-blur-md">
                <Icon className="text-secondary" name="check" size={20} />
                <span className="text-sm font-semibold text-white">
                  +12,000 معاملة آمنة مكتملة
                </span>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader
              description="نظام ضمان مالي يحمي حقوق المشتري والبائع في كل خطوة."
              eyebrow="الضمان المالي"
              title="تسوّق بثقة تامة"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((step, index) => (
                <Card key={step.title} className="p-5" interactive variant="glass">
                  <span className="grid size-11 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
                    <Icon name={step.icon as IconName} size={20} />
                  </span>
                  <p className="mt-3 text-xs font-bold text-secondary">
                    الخطوة {index + 1}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-xs font-medium leading-6 text-muted">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button href="/escrow" variant="accent">
                تعرّف على الضمان المالي
              </Button>
              <Link
                className="text-sm font-bold text-primary transition hover:text-secondary"
                href="/register"
              >
                ابدأ بثقة ←
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
