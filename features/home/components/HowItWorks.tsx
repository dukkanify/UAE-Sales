import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { getHomeHowItWorksSteps } from "@/services/content";

export async function HowItWorks() {
  const steps = await getHomeHowItWorksSteps();

  return (
    <section className="section-padding bg-surface">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="من التسجيل إلى إتمام البيع — أربع خطوات واضحة."
          eyebrow="كيف يعمل"
          title="ابدأ في دقائق"
        />

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.title} className="p-5 text-center" variant="flat">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button href="/register" size="lg" variant="accent">
            ابدأ الآن
          </Button>
        </div>
      </div>
    </section>
  );
}
