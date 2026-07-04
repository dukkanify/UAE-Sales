import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

const reasons = [
  { description: "تجربة استخدام سلسة مصممة للسوق الإماراتي.", icon: "star" as const, title: "تصميم عالمي" },
  { description: "كل معاملة محمية بنظام ضمان مالي.", icon: "shield" as const, title: "ضمان حقيقي" },
  { description: "تحقق عبر OTP وUAE PASS.", icon: "check" as const, title: "بائعون موثقون" },
  { description: "فريق دعم متاح على مدار الساعة.", icon: "message" as const, title: "دعم 24/7" },
  { description: "محفظة رقمية آمنة لإدارة الأرصدة.", icon: "wallet" as const, title: "محفظة رقمية" },
  { description: "واجهة عربية كاملة مع RTL مثالي.", icon: "home" as const, title: "عربي بالكامل" },
];

export function WhyUaeSales() {
  return (
    <section className="section-padding bg-surface-muted/50">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="لماذا يختار آلاف المستخدمين UAE Sales."
          eyebrow="لماذا نحن"
          title="سوق مختلف"
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <Card key={reason.title} className="p-5" interactive>
              <span className="grid size-9 place-items-center rounded-[var(--radius-md)] bg-primary text-white">
                <Icon name={reason.icon} size={16} />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-ink">{reason.title}</h3>
              <p className="mt-1.5 text-xs font-medium leading-6 text-muted">
                {reason.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
