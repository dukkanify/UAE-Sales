import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

const reasons = [
  {
    description:
      "هوية بصرية فاخرة وتجربة استخدام سلسة مصممة خصيصاً للسوق الإماراتي.",
    icon: "✦",
    title: "تصميم عالمي المستوى",
  },
  {
    description:
      "كل معاملة محمية بنظام ضمان مالي يحجز المبلغ حتى تأكيد الاستلام.",
    icon: "🛡",
    title: "ضمان مالي حقيقي",
  },
  {
    description:
      "تحقق من الهوية عبر OTP وUAE PASS لبناء مجتمع بائعين ومشترين موثوقين.",
    icon: "✓",
    title: "بائعون موثقون",
  },
  {
    description:
      "فريق دعم متاح على مدار الساعة لحل أي استفسار أو نزاع بسرعة.",
    icon: "💬",
    title: "دعم احترافي 24/7",
  },
  {
    description:
      "محفظة رقمية آمنة لإدارة الأرصدة والسحوبات والمعاملات بسهولة.",
    icon: "💳",
    title: "محفظة رقمية",
  },
  {
    description:
      "واجهة عربية كاملة مع دعم RTL مثالي لجميع الأجهزة والشاشات.",
    icon: "🌐",
    title: "عربي بالكامل",
  },
];

export function WhyUaeSales() {
  return (
    <section className="section-padding bg-surface-muted/40">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="لماذا يختار آلاف المستخدمين UAE Sales لبيع وشراء منتجاتهم؟"
          eyebrow="لماذا UAE Sales"
          title="سوق مختلف عن البقية"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <Card
              key={reason.title}
              className="p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-black text-white">
                {reason.icon}
              </span>
              <h3 className="mt-4 text-base font-black text-ink">{reason.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{reason.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
