import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

const trustItems = [
  "هوية إماراتية واضحة وتجربة عربية RTL",
  "مسارات جاهزة لـ UAE PASS وOTP",
  "حالات إعلان واضحة ومراجعة قبل النشر",
  "دعم النزاعات والضمان المالي في الواجهة",
];

export function TrustSafetySection() {
  return (
    <section className="app-container py-14">
      <SectionHeader
        eyebrow="الثقة والسلامة"
        title="منصة مصممة للثقة قبل التوسع"
        description="كل نقطة تفاعل في UAE Sales مصممة لتقليل المخاطر، توضيح الحالة، وتحسين تجربة المستخدم قبل الربط بالـ Backend."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <Card key={item} className="p-6">
            <div className="uae-flag-strip h-2 w-20 rounded-full" />
            <p className="mt-5 text-lg font-black leading-8 text-ink">{item}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
