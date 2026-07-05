import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { getMarketEscrowSteps } from "@/services/content/homepage-marketplace.content";
import { MarketSectionHeader, MarketSectionShell } from "./MarketSectionHeader";

export async function MarketEscrow() {
  const steps = await getMarketEscrowSteps();

  return (
    <MarketSectionShell variant="white">
      <MarketSectionHeader
        description="نظام ضمان مالي يحمي المشتري والبائع — من الدفع حتى التسليم."
        eyebrow="Trust"
        title="الضمان المالي"
      />

      <div className="rounded-2xl border border-border bg-[#fdfbf7] p-6 md:p-10">
        <div className="hidden lg:block">
          <div className="relative">
            <div
              aria-hidden
              className="absolute top-7 end-[8%] start-[8%] h-px bg-[#B8955F]/25"
            />
            <ol className="grid grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <li key={step.title} className="text-center">
                  <span className="relative z-10 mx-auto grid size-12 place-items-center rounded-full border-2 border-[#B8955F]/30 bg-white text-sm font-bold text-ink">
                    {index + 1}
                  </span>
                  <div className="mt-3">
                    <Icon
                      className="mx-auto text-[#B8955F]"
                      name={step.icon as IconName}
                      size={20}
                    />
                    <h3 className="mt-2 text-sm font-bold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-6 text-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <ol className="grid gap-3 lg:hidden">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-3 rounded-xl border border-border bg-white p-4"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#B8955F]/12 text-sm font-bold text-[#8a7040]">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#B8955F]/12 text-[#B8955F]">
              <Icon name="shield" size={22} />
            </span>
            <div>
              <p className="font-bold text-ink">محمي بالكامل</p>
              <p className="text-sm text-muted">لا يُحرَّر المبلغ إلا بعد تأكيد المشتري</p>
            </div>
          </div>
          <Button href="/escrow" size="md" variant="gold">
            كيف يعمل الضمان؟
          </Button>
        </div>
      </div>
    </MarketSectionShell>
  );
}
