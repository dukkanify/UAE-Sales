import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { getHomeHowItWorksSteps } from "@/services/content";

export async function HowItWorks() {
  const steps = await getHomeHowItWorksSteps();

  return (
    <section className="section-padding">
      <div className="app-container">
        <div className="cta-panel-premium relative overflow-hidden rounded-[var(--radius-2xl)] p-8 md:p-12">
          <div className="absolute -end-20 -top-20 size-64 rounded-full bg-secondary/12 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-wide text-secondary uppercase">
              كيف يعمل
            </p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              أربع خطوات بسيطة للبيع بثقة
            </h2>
            <p className="mt-3 text-sm font-medium leading-7 text-white/70">
              من التسجيل إلى إتمام البيع — تجربة سلسة وآمنة في كل خطوة.
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="interactive-lift rounded-[var(--radius-2xl)] border border-white/12 bg-white/6 p-5 backdrop-blur-md"
              >
                <span className="grid size-10 place-items-center rounded-[var(--radius-xl)] bg-secondary text-sm font-black text-primary">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-sm font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-xs font-medium leading-6 text-white/68">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="relative mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button className="gap-2" href="/register" size="lg" variant="accent">
              <Icon name="plus" size={18} />
              ابدأ الآن
            </Button>
            <Button
              className="gap-2 border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              href="/listings/new"
              size="lg"
              variant="ghost"
            >
              أضف إعلانك
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
