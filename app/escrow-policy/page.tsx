import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { BRAND } from "@/shared/constants/brand";
import { Card } from "@/shared/ui/Card";
import { PageHero } from "@/shared/ui/PageHero";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { localizedMetadata } from "@/shared/i18n/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    title: "سياسة الضمان المالي (مضمون)",
    description: `كيف يعمل الضمان المالي «مضمون» على ${BRAND.nameAr}`,
  });
}

const sections = [
  {
    title: "1. ما هو مضمون؟",
    body: "مضمون خدمة ضمان مالي داخل سوقنا تحجز مبلغ المشتري بأمان حتى تأكيد استلام المنتج ومطابقته للإعلان، ثم تُفرج للبائع أو تُعالج عبر مسار النزاع عند الحاجة.",
  },
  {
    title: "2. متى تُفعّل؟",
    body: "تُفعّل عند الدفع عبر مسار مضمون على المعاملات المؤهلة. ليست كل الإعلانات مشمولة تلقائياً؛ تظهر الأهلية داخل صفحة الدفع/الطلب.",
  },
  {
    title: "3. توثيق المنتج",
    body: "بعد الدفع يرفع البائع صوراً و/أو فيديو حديثاً للمنتج. يراجع المشتري التوثيق ويؤكد المطابقة قبل استكمال مراحل الضمان. جميع الملفات مربوطة برقم المعاملة.",
  },
  {
    title: "4. الإفراج والاسترداد",
    body: "بعد تأكيد المطابقة/الاستلام يمكن الإفراج عن المبلغ للبائع وفق حالة الطلب. في حال النزاع تُراجع الأدلة من الإدارة وفق سياسة النزاعات.",
  },
  {
    title: "5. الرسوم",
    body: "أي رسوم أو عمولات تُعرض بوضوح قبل إتمام الدفع. العملة المعتمدة للعرض هي الدرهم الإماراتي (AED).",
  },
];

export default function EscrowPolicyPage() {
  return (
    <>
      <SiteHeader />
      <LocalizedTree>
        <main>
          <section className="app-container page-padding">
            <PageHero
              description="تفاصيل خدمة الضمان المالي داخل المعاملات المؤهلة."
              eyebrow="قانوني"
              title="سياسة الضمان المالي (مضمون)"
            />
            <div className="mx-auto mt-6 grid max-w-3xl gap-4">
              {sections.map((section) => (
                <Card key={section.title} className="p-5" variant="flat">
                  <h2 className="text-sm font-bold text-ink">{section.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted">{section.body}</p>
                </Card>
              ))}
              <p className="text-sm text-muted">
                راجع أيضاً{" "}
                <Link className="font-semibold text-primary" href="/dispute-policy">
                  سياسة النزاعات
                </Link>{" "}
                و{" "}
                <Link className="font-semibold text-primary" href="/escrow">
                  صفحة الضمان
                </Link>
                .
              </p>
            </div>
          </section>
        </main>
      </LocalizedTree>
      <SiteFooter />
    </>
  );
}
