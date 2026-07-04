import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

const escrowSteps = [
  { description: "يُحجز المبلغ في حساب الضمان.", icon: "wallet" as const, title: "ادفع بأمان" },
  { description: "تواصل مع البائع واستلم منتجك.", icon: "package" as const, title: "استلم المنتج" },
  { description: "راجع المنتج وأكد مطابقته.", icon: "check" as const, title: "أكد الاستلام" },
  { description: "يُحوَّل المبلغ للبائع.", icon: "shield" as const, title: "تحرير المبلغ" },
];

export function EscrowSection() {
  return (
    <section className="section-padding">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="نظام ضمان مالي يحمي حقوق المشتري والبائع."
          eyebrow="الضمان المالي"
          title="تسوّق بثقة تامة"
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {escrowSteps.map((step, index) => (
            <Card key={step.title} className="p-5 text-center" interactive>
              <span className="mx-auto grid size-10 place-items-center rounded-[var(--radius-md)] bg-secondary-soft text-secondary">
                <Icon name={step.icon} size={18} />
              </span>
              <p className="mt-3 text-xs font-bold text-secondary">
                {index + 1}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-xs font-medium leading-6 text-muted">
                {step.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            className="text-sm font-bold text-primary transition hover:text-secondary"
            href="/escrow"
          >
            تعرّف على الضمان المالي ←
          </Link>
        </div>
      </div>
    </section>
  );
}
