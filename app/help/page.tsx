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
    title: "مركز المساعدة",
    description: `إجابات سريعة حول استخدام ${BRAND.nameAr}، نشر الإعلانات، والشراء الآمن.`,
  });
}

const topics = [
  {
    title: "كيف أبحث عن إعلان؟",
    body: "استخدم شريط البحث في الأعلى أو من الصفحة الرئيسية، ثم صفِّ النتائج حسب الإمارة أو القسم أو السعر.",
  },
  {
    title: "كيف أنشر إعلانًا؟",
    body: "من حسابك اختر إضافة إعلان، ارفع صورة واحدة على الأقل، وأكمل بيانات التصنيف. يُراجع الإعلان قبل النشر.",
  },
  {
    title: "كيف أشتري بأمان؟",
    body: "فضّل الدفع عبر الضمان المالي للمبالغ الكبيرة، وتأكد من هوية البائع قبل التحويل المباشر.",
  },
  {
    title: "ماذا أفعل عند مشكلة في الطلب؟",
    body: "للطلبات المشمولة بالضمان يمكن فتح نزاع مع الأدلة خلال المدة المحددة. للدعم العام راسل فريق سوقنا.",
  },
];

const shortcuts = [
  { href: "/safety", label: "نصائح الأمان" },
  { href: "/support", label: "تواصل معنا" },
  { href: "/listings/new", label: "أضف إعلانك" },
  { href: "/search", label: "تصفح الإعلانات" },
];

export default function HelpPage() {
  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="دليل مختصر لأكثر الأسئلة شيوعًا على سوقنا."
            eyebrow="الدعم"
            title="مركز المساعدة"
          />
          <div className="mx-auto mt-6 grid max-w-3xl gap-4">
            {topics.map((topic) => (
              <Card key={topic.title} className="p-5" variant="flat">
                <h2 className="text-sm font-bold text-ink">{topic.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{topic.body}</p>
              </Card>
            ))}
            <Card className="p-5" variant="flat">
              <h2 className="text-sm font-bold text-ink">اختصارات</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {shortcuts.map((item) => (
                  <li key={item.href}>
                    <Link
                      className="flex min-h-11 items-center rounded-[var(--radius-xl)] border border-border px-4 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
            <p className="text-sm text-muted">
              لم تجد إجابتك؟ راسلنا من{" "}
              <Link className="font-semibold text-primary" href="/support">
                صفحة التواصل
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
