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
    <section className="relative overflow-hidden section-padding bg-[linear-gradient(180deg,var(--color-secondary-soft),#fff_58%)]">
      <div className="pointer-events-none absolute end-10 top-12 h-60 w-60 rounded-full bg-secondary/12 blur-3xl" />
      <div className="app-container">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeader
              description="نظام ضمان مالي يحمي حقوق المشتري والبائع في كل خطوة، من الدفع إلى تأكيد الاستلام."
              eyebrow="الضمان المالي"
              title="كيف يعمل الضمان؟"
            />

            <div className="rounded-[var(--radius-2xl)] border border-secondary/20 bg-surface p-6 shadow-[var(--shadow-card)]">
              <span className="grid size-14 place-items-center rounded-[var(--radius-2xl)] bg-secondary-soft text-secondary">
                <Icon name="shield" size={26} />
              </span>
              <h3 className="mt-5 text-xl font-black text-ink">
                ثقة قبل تحويل الأموال
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-muted">
                يبقى المبلغ محجوزاً حتى يتأكد المشتري من مطابقة المنتج، ثم يتم
                تحريره للبائع بأمان.
              </p>
              <Button className="mt-6" href="/escrow" variant="primary">
                تعرّف على الضمان المالي
              </Button>
              <p className="mt-4">
                <Link className="text-sm font-semibold text-primary" href="/register">
                  إنشاء حساب مجاني ←
                </Link>
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-8 start-5 hidden w-px bg-gradient-to-b from-secondary/10 via-secondary/35 to-secondary/10 sm:block" />
            <div className="grid gap-4">
              {items.map((step, index) => (
                <Card key={step.title} className="relative p-5" variant="elevated">
                  <div className="flex items-start gap-4">
                    <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-[var(--radius-xl)] bg-secondary text-sm font-black text-primary shadow-[var(--shadow-xs)]">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="text-secondary" name={step.icon as IconName} size={18} />
                        <h3 className="text-sm font-black text-ink">{step.title}</h3>
                      </div>
                      <p className="mt-2 text-sm font-medium leading-7 text-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
