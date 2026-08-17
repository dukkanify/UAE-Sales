import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { BRAND } from "@/shared/constants/brand";
import { Card } from "@/shared/ui/Card";
import { PageHero } from "@/shared/ui/PageHero";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: `كيف تتعامل ${BRAND.nameAr} مع بياناتك الشخصية`,
};

const sections = [
  {
    title: "1. البيانات التي نجمعها",
    body: "بيانات الحساب (الاسم، البريد، الهاتف)، محتوى الإعلانات، بيانات المعاملات والدفع عبر مزودي الخدمة، وسجلات الاستخدام لأغراض الأمان وتحسين الخدمة.",
  },
  {
    title: "2. الغرض من المعالجة",
    body: "تشغيل الحسابات، نشر الإعلانات، إتمام المدفوعات والضمان، منع الاحتيال، الدعم الفني، والامتثال للمتطلبات القانونية في دولة الإمارات.",
  },
  {
    title: "3. المشاركة مع أطراف ثالثة",
    body: "قد نشارك بيانات ضرورية مع مزودي الدفع (مثل Stripe) وخدمات البريد والاستضافة وفق عقود معالجة بيانات، دون بيع بياناتك لأغراض تسويقية خارجية.",
  },
  {
    title: "4. الاحتفاظ والأمان",
    body: "نحتفظ بالبيانات للمدة اللازمة لتشغيل الخدمة والالتزامات القانونية، ونطبّق إجراءات حماية معقولة. لا توجد حماية مطلقة عبر الإنترنت.",
  },
  {
    title: "5. حقوقك",
    body: "يمكنك طلب الاطلاع أو التصحيح أو حذف بعض البيانات عبر صفحة الدعم، مع مراعاة القيود النظامية وسجلات المعاملات المالية.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="شفافية حول جمع واستخدام بياناتك على سوقنا."
            eyebrow="قانوني"
            title="سياسة الخصوصية"
          />
          <div className="mx-auto mt-6 grid max-w-3xl gap-4">
            {sections.map((section) => (
              <Card key={section.title} className="p-5" variant="flat">
                <h2 className="text-sm font-bold text-ink">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{section.body}</p>
              </Card>
            ))}
            <p className="text-sm text-muted">
              بالتسجيل فإنك توافق أيضاً على{" "}
              <Link className="font-semibold text-primary" href="/terms">
                الشروط والأحكام
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
