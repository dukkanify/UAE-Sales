import Link from "next/link";
import { Button } from "@/components/ui/Button";

const steps = [
  { description: "أنشئ حسابك في دقائق.", title: "سجّل حسابك" },
  { description: "أضف الصور والتفاصيل.", title: "أضف إعلانك" },
  { description: "تواصل عبر الدردشة الآمنة.", title: "استقبل العروض" },
  { description: "أتمم البيع بضمان مالي.", title: "بِع بثقة" },
];

export function HowItWorks() {
  return (
    <section className="section-padding">
      <div className="app-container">
        <div className="luxury-gradient overflow-hidden rounded-[var(--radius-2xl)] p-8 md:p-10">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-xs font-bold tracking-wide text-secondary uppercase">
              كيف يعمل
            </p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              أربع خطوات بسيطة
            </h2>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <span className="grid size-8 place-items-center rounded-[var(--radius-sm)] bg-secondary text-xs font-black text-primary">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-sm font-black text-white">{step.title}</h3>
                <p className="mt-1.5 text-xs font-medium leading-6 text-white/70">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/register">
              <Button variant="accent">ابدأ الآن</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
