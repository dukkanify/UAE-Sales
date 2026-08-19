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
    title: "الشروط والأحكام",
    description: `شروط استخدام منصة ${BRAND.nameAr}`,
  });
}

const sections = [
  {
    title: "1. القبول",
    body: `باستخدامك ${BRAND.nameAr} فإنك توافق على هذه الشروط. إن لم توافق، يرجى عدم استخدام المنصة.`,
  },
  {
    title: "2. طبيعة الخدمة",
    body: "سوقنا منصة إعلانات وتصنيف ووساطة دفع/ضمان عند تفعيل ميزة «مضمون». نحن لسنا طرفاً في عقد البيع المباشر إلا بالقدر الذي توضحه سياسات الضمان.",
  },
  {
    title: "3. الحسابات والمحتوى",
    body: "أنت مسؤول عن دقة بياناتك ومحتوى إعلاناتك. يُحظر المحتوى المخالف للقوانين الإماراتية أو المضلل أو المسيء. يحق للإدارة تعليق أو رفض الإعلانات والحسابات المخالفة.",
  },
  {
    title: "4. المدفوعات والضمان",
    body: "عند الدفع عبر الضمان المالي تُحجز المبالغ وفق حالة الطلب وسياسة النزاعات المعمول بها. الرسوم والعمولات تُعرض قبل إتمام الدفع.",
  },
  {
    title: "5. النزاعات",
    body: "يمكن فتح نزاع ضمن مدة محددة للطلبات المشمولة بالضمان. قرارات الإدارة تعتمد على الأدلة المقدمة وسجل المعاملة.",
  },
  {
    title: "6. إخلاء المسؤولية",
    body: "نبذل جهداً معقولاً لتأمين المنصة، دون ضمان خلوها من الأعطال. استخدام المنصة على مسؤوليتك ضمن حدود القانون.",
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="اقرأ الشروط قبل إنشاء حساب أو نشر إعلان."
            eyebrow="قانوني"
            title="الشروط والأحكام"
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
              <Link className="font-semibold text-primary" href="/privacy">
                سياسة الخصوصية
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
