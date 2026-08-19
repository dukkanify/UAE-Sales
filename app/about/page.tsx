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
    title: "من نحن",
    description: `تعرّف على ${BRAND.nameAr} — منصة سوق إماراتية موثوقة للبيع والشراء.`,
  });
}

const values = [
  {
    title: "ثقة أوّلاً",
    body: "نضع الضمان المالي وتوثيق الحسابات في قلب التجربة، حتى تتم الصفقة بوضوح للطرفين.",
  },
  {
    title: "سوق محلي",
    body: "صُمّمت سوقنا للإمارات: لغة عربية، اتجاه من اليمين لليسار، وتغطية للإمارات السبع.",
  },
  {
    title: "تجربة بسيطة",
    body: "تصفّح أوضح، نشر أسهل، ودعم بالعربية عندما تحتاج مساعدة.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main>
        <section className="app-container page-padding">
          <PageHero
            description={`${BRAND.description}`}
            eyebrow={BRAND.nameAr}
            title="من نحن"
          />
          <div className="mx-auto mt-6 grid max-w-3xl gap-4">
            <Card className="p-5" variant="flat">
              <h2 className="text-sm font-bold text-ink">قصتنا</h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                {BRAND.nameAr} ({BRAND.nameEn}) منصة إعلانات مبوبة تجمع السيارات والعقارات
                والإلكترونيات والوظائف والخدمات في مكان واحد. نسعى لسوق أوضح وأكثر أمانًا،
                مع محفظة وخيارات دفع محمية عند تفعيل الضمان.
              </p>
            </Card>
            {values.map((value) => (
              <Card key={value.title} className="p-5" variant="flat">
                <h2 className="text-sm font-bold text-ink">{value.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{value.body}</p>
              </Card>
            ))}
            <p className="text-sm text-muted">
              لديك سؤال؟{" "}
              <Link className="font-semibold text-primary" href="/support">
                تواصل معنا
              </Link>{" "}
              أو راجع{" "}
              <Link className="font-semibold text-primary" href="/help">
                مركز المساعدة
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
