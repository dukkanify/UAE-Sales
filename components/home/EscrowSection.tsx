import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

const escrowSteps = [
  {
    title: "يدفع المشتري بأمان",
    description: "يظهر السعر والرسوم بوضوح قبل تأكيد الطلب.",
  },
  {
    title: "المبلغ يبقى محجوزاً",
    description: "لا يتم تحرير المبلغ للبائع حتى تأكيد الاستلام.",
  },
  {
    title: "تأكيد أو فتح نزاع",
    description: "المشتري يؤكد المطابقة أو يفتح نزاعاً موثقاً.",
  },
];

export function EscrowSection() {
  return (
    <section className="app-container py-14">
      <div className="luxury-gradient overflow-hidden rounded-[var(--radius-xl)] p-6 text-white md:p-8">
        <SectionHeader
          eyebrow="الضمان المالي"
          title="ثقة أكبر للصفقات عالية القيمة"
          description="تجربة مصممة للسوق الإماراتي حيث تكون الشفافية وحماية المبلغ جزءاً أساسياً من رحلة البيع والشراء."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {escrowSteps.map((step, index) => (
            <Card key={step.title} className="border-white/15 bg-white/10 p-5 text-white">
              <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-sm font-black text-primary">
                {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-black">{step.title}</h3>
              <p className="mt-3 leading-7 text-white/70">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
