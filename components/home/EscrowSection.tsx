import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

const escrowSteps = [
  {
    description: "يتم حجز المبلغ في حساب الضمان حتى تأكيد الاستلام.",
    icon: "🔒",
    title: "ادفع بأمان",
  },
  {
    description: "تواصل مع البائع واستلم منتجك بكل راحة.",
    icon: "📦",
    title: "استلم المنتج",
  },
  {
    description: "راجع المنتج وأكد أنه مطابق للوصف.",
    icon: "✓",
    title: "أكد الاستلام",
  },
  {
    description: "يُحوَّل المبلغ للبائع بعد تأكيدك أو انتهاء المهلة.",
    icon: "💰",
    title: "تحرير المبلغ",
  },
];

export function EscrowSection() {
  return (
    <section className="section-padding">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="نظام ضمان مالي يحمي حقوق المشتري والبائع في كل معاملة."
          eyebrow="الضمان المالي"
          title="تسوّق بثقة تامة"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {escrowSteps.map((step, index) => (
            <Card
              key={step.title}
              className="group p-6 text-center transition hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <span className="mx-auto grid size-12 place-items-center rounded-xl bg-secondary-soft text-xl transition group-hover:scale-105">
                {step.icon}
              </span>
              <span className="mt-4 block text-xs font-bold text-secondary">
                الخطوة {index + 1}
              </span>
              <h3 className="mt-2 text-base font-black text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{step.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-bold text-ink transition hover:bg-surface-muted"
            href="/escrow"
          >
            تعرّف على الضمان المالي
          </Link>
        </div>
      </div>
    </section>
  );
}
