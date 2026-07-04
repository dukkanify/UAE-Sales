import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

const testimonials = [
  {
    city: "دبي",
    name: "محمد الكعبي",
    quote: "بعت سيارتي خلال 3 أيام. الضمان المالي أعطى المشتري ثقة كاملة.",
    role: "بائع",
  },
  {
    city: "أبوظبي",
    name: "فاطمة النعيمي",
    quote: "اشتريت آيفون بحالة ممتازة. التوثيق والضمان فرقوا معي كثيراً.",
    role: "مشتري",
  },
  {
    city: "الشارقة",
    name: "خالد المرزوقي",
    quote: "أضفت 5 إعلانات لمعرضي وكلها ظهرت في نتائج البحث بسرعة.",
    role: "تاجر",
  },
];

export function Testimonials() {
  return (
    <section className="section-padding">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="آراء من مستخدمين في الإمارات."
          eyebrow="آراء المستخدمين"
          title="يثقون بنا"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} className="p-5">
              <div className="flex gap-0.5 text-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon key={index} name="star" size={12} />
                ))}
              </div>
              <p className="mt-4 text-sm font-medium leading-7 text-muted">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <span className="grid size-9 place-items-center rounded-[var(--radius-md)] bg-primary text-xs font-black text-white">
                  {item.name.slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{item.name}</p>
                  <p className="text-xs font-medium text-muted">
                    {item.role} — {item.city}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
