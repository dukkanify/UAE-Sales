import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

const testimonials = [
  {
    city: "دبي",
    name: "محمد الكعبي",
    quote:
      "بعت سيارتي خلال 3 أيام فقط. الضمان المالي أعطى المشتري ثقة كاملة وأتممنا الصفقة بسلاسة.",
    role: "بائع",
  },
  {
    city: "أبوظبي",
    name: "فاطمة النعيمي",
    quote:
      "اشتريت آيفون بحالة ممتازة والسعر كان أفضل من أي مكان. التوثيق والضمان فرقوا معي كثيراً.",
    role: "مشتري",
  },
  {
    city: "الشارقة",
    name: "خالد المرزوقي",
    quote:
      "أضفت 5 إعلانات لمعرضي وكلها ظهرت في نتائج البحث بسرعة. التصميم احترافي والتجربة سهلة.",
    role: "تاجر",
  },
];

export function Testimonials() {
  return (
    <section className="section-padding">
      <div className="app-container">
        <SectionHeader
          align="center"
          description="آراء حقيقية من مستخدمين في الإمارات."
          eyebrow="آراء المستخدمين"
          title="يثقون بنا"
        />

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} className="p-6">
              <p className="text-sm leading-8 text-muted">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-xs font-black text-white">
                  {item.name.slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-black text-ink">{item.name}</p>
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
