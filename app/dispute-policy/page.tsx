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
    title: "سياسة النزاعات",
    description: `قواعد فتح ومراجعة النزاعات على ${BRAND.nameAr}`,
  });
}

const sections = [
  {
    title: "1. أهلية النزاع",
    body: "يمكن فتح نزاع فقط على طلبات مدفوعة ضمن الضمان المالي ومؤهلة حسب حالة الطلب ومهلة النزاع المحددة من الإدارة.",
  },
  {
    title: "2. مهلة النزاع",
    body: "تُضبط مدة فتح النزاع من لوحة التحكم. يتلقى المشتري تنبيهات قبل انتهاء المهلة (مثل 48 و24 ساعة). بعد الانتهاء قد تُغلق إمكانية فتح نزاع جديد.",
  },
  {
    title: "3. الأدلة",
    body: "يُربط النزاع بالطلب والإعلان وإثباتات البائع (صور/فيديو) وتأكيدات المشتري. لا يُستبدل الدليل دون تسجيل التغيير في سجل المعاملة.",
  },
  {
    title: "4. المراجعة الإدارية",
    body: "تراجع الإدارة النزاع بناءً على الأدلة وسجل المعاملة. قد يؤدي القرار إلى الإفراج للبائع أو الاسترداد للمشتري أو إجراء آخر معلن.",
  },
  {
    title: "5. التواصل",
    body: `للاستفسارات غير المرتبطة بنزاع مفتوح، استخدم صفحة الدعم أو ${BRAND.supportEmail}.`,
  },
];

export default function DisputePolicyPage() {
  return (
    <>
      <SiteHeader />
      <LocalizedTree>
        <main>
          <section className="app-container page-padding">
            <PageHero
              description="كيف تُفتح النزاعات وكيف تُراجع داخل سوقنا."
              eyebrow="قانوني"
              title="سياسة النزاعات"
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
                <Link className="font-semibold text-primary" href="/escrow-policy">
                  سياسة الضمان المالي
                </Link>{" "}
                و{" "}
                <Link className="font-semibold text-primary" href="/terms">
                  الشروط والأحكام
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
