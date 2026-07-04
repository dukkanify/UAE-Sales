import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import type { IconName } from "@/shared/ui/Icon";
import { getHomeEscrowSteps } from "@/services/content";
import { Home3SectionHeader } from "./Home3SectionHeader";

export async function Home3Escrow() {
  const steps = await getHomeEscrowSteps();

  return (
    <section className="relative overflow-hidden bg-white py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-secondary/35 to-transparent" />
      <div className="app-container">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Home3SectionHeader
              description="يحجز النظام المبلغ حتى يتأكد المشتري من المنتج، ثم يحرره للبائع. واضح، حديث، ومبني للثقة."
              eyebrow="Escrow Protection"
              title="الضمان المالي الذي يغيّر تجربة الإعلانات"
            />

            <div className="rounded-[2rem] border border-secondary/25 bg-[linear-gradient(135deg,var(--color-secondary-soft),#fff)] p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-[1.25rem] bg-white text-secondary shadow-[var(--shadow-xs)]">
                  <Icon name="shield" size={26} />
                </span>
                <div>
                  <h3 className="text-xl font-black text-ink">لا تحويل قبل الاطمئنان</h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-muted">
                    من لحظة الدفع حتى تأكيد الاستلام، يبقى كل شيء واضحاً ومحمياً.
                  </p>
                </div>
              </div>
              <Button className="mt-7" href="/escrow" variant="primary">
                كيف يعمل الضمان؟
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-12 start-6 hidden w-px bg-gradient-to-b from-secondary/15 via-secondary/45 to-secondary/15 sm:block" />
            <div className="grid gap-5">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="relative rounded-[2rem] border border-border bg-white p-6 shadow-[0_18px_55px_rgb(15_20_25/9%)]"
                >
                  <div className="flex gap-5">
                    <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon
                          className="text-secondary"
                          name={step.icon as IconName}
                          size={19}
                        />
                        <h3 className="text-base font-black text-ink">{step.title}</h3>
                      </div>
                      <p className="mt-2 text-sm font-medium leading-7 text-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
