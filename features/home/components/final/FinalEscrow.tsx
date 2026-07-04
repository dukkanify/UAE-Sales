import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { getFinalEscrowSteps } from "@/services/content/homepage-final.content";
import { FinalSectionHeader } from "./FinalSectionHeader";

export async function FinalEscrow() {
  const steps = await getFinalEscrowSteps();

  return (
    <section className="bg-surface-muted/50 py-16 md:py-20">
      <div className="app-container">
        <FinalSectionHeader
          description="نظام ضمان مالي يحمي الطرفين — من الدفع حتى التسليم. واضح، آمن، ومبني على معايير fintech."
          title="كيف يعمل الضمان المالي؟"
        />

        <div className="rounded-[var(--radius-2xl)] border border-border bg-white p-6 shadow-[var(--shadow-card)] md:p-10">
          <div className="hidden lg:block">
            <div className="relative">
              <div
                aria-hidden
                className="absolute top-7 end-[10%] start-[10%] h-px bg-border"
              />
              <ol className="grid grid-cols-5 gap-4">
                {steps.map((step, index) => (
                  <li key={step.title} className="relative text-center">
                    <span className="relative z-10 mx-auto grid size-14 place-items-center rounded-full border-2 border-secondary/30 bg-secondary-soft text-sm font-bold text-ink">
                      {index + 1}
                    </span>
                    <div className="mt-4">
                      <span className="mx-auto mb-2 grid size-9 place-items-center rounded-[var(--radius-md)] bg-surface-muted text-secondary">
                        <Icon name={step.icon as IconName} size={18} />
                      </span>
                      <h3 className="text-sm font-bold text-ink">{step.title}</h3>
                      <p className="mt-2 text-xs leading-6 text-muted">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <ol className="grid gap-4 lg:hidden">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-[var(--radius-xl)] border border-border bg-surface-muted/30 p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon
                      className="text-secondary"
                      name={step.icon as IconName}
                      size={16}
                    />
                    <h3 className="text-sm font-bold text-ink">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-7 text-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-[var(--radius-xl)] bg-secondary-soft text-secondary">
                <Icon name="shield" size={22} />
              </span>
              <div>
                <p className="font-bold text-ink">محمي بالكامل</p>
                <p className="text-sm text-muted">
                  لا يُحرَّر المبلغ إلا بعد تأكيد المشتري
                </p>
              </div>
            </div>
            <Button href="/escrow" variant="primary">
              تعرّف على الضمان
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
