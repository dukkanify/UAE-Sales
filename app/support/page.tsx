import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { BRAND } from "@/shared/constants/brand";
import { SupportContactForm } from "@/features/support/components/SupportContactForm";
import { Card } from "@/shared/ui/Card";
import { PageHero } from "@/shared/ui/PageHero";

export const metadata: Metadata = {
  title: "الدعم",
  description: `تواصل مع فريق ${BRAND.nameAr} للأسئلة حول الطلبات والإعلانات والضمان.`,
};

const faqs = [
  {
    q: "كيف أشتري بأمان؟",
    a: "اختر الإعلان ثم أكمل الدفع عبر الضمان المالي. يبقى المبلغ محجوزًا حتى تأكيد الاستلام.",
  },
  {
    q: "متى يصل إيميل الترحيب أو تأكيد الحجز؟",
    a: "بعد إنشاء الحساب أو حجز معاينة نرسل التأكيد فورًا إلى بريدك، ويظهر أيضًا في إشعارات الملف الشخصي.",
  },
  {
    q: "كيف أفتح نزاعًا؟",
    a: "من تفاصيل الطلب المشمول بالضمان يمكنك فتح نزاع مع الأدلة خلال مدة النزاع المحددة.",
  },
  {
    q: "كيف أنشر إعلانًا؟",
    a: "من حسابك اختر إضافة إعلان، ارفع صورة واحدة على الأقل، وأكمل بيانات التصنيف. الإعلان يُراجع قبل النشر.",
  },
];

const shortcuts = [
  { href: "/orders", label: "طلباتي" },
  { href: "/disputes/new", label: "فتح نزاع" },
  { href: "/chat", label: "الرسائل" },
  { href: "/escrow", label: "الضمان المالي" },
];

export default function SupportPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="أسئلة شائعة، وتتبع الطلبات، ونموذج تواصل مباشر مع فريق سوقنا."
            eyebrow="الدعم"
            title="كيف نقدر نساعدك؟"
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-6" variant="flat">
              <h2 className="text-sm font-semibold text-ink">تواصل معنا</h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                راسلنا على{" "}
                <a className="font-semibold text-ink" dir="ltr" href={`mailto:${BRAND.supportEmail}`}>
                  {BRAND.supportEmail}
                </a>{" "}
                أو أرسل النموذج وسنعود إليك.
              </p>
              <div className="mt-5">
                <SupportContactForm />
              </div>
            </Card>

            <div className="grid gap-5">
              <Card className="p-6" variant="flat">
                <h2 className="text-sm font-semibold text-ink">اختصارات</h2>
                <ul className="mt-4 grid gap-2">
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

              <Card className="p-6" variant="flat">
                <h2 className="text-sm font-semibold text-ink">أسئلة شائعة</h2>
                <ul className="mt-4 grid gap-4">
                  {faqs.map((item) => (
                    <li key={item.q}>
                      <p className="text-sm font-semibold text-ink">{item.q}</p>
                      <p className="mt-1 text-sm leading-7 text-muted">{item.a}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
