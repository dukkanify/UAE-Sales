import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { BRAND } from "@/shared/constants/brand";
import { Card } from "@/shared/ui/Card";
import { PageHero } from "@/shared/ui/PageHero";
import {
  escrowProtectionSteps,
  listingSafetyTips,
} from "@/services/content/homepage-marketplace.content";

export const metadata: Metadata = {
  title: "الأمان",
  description: `نصائح الأمان والضمان المالي على ${BRAND.nameAr} لحماية المشترين والبائعين.`,
};

export default function SafetyPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <PageHero
            description="تعامل بثقة: تحقق من الطرف الآخر، واحفظ حقوقك عبر الضمان المالي عند الحاجة."
            eyebrow="حماية الصفقة"
            title="الأمان على سوقنا"
          />
          <div className="mx-auto mt-6 grid max-w-3xl gap-4">
            <Card className="p-5" variant="flat">
              <h2 className="text-sm font-bold text-ink">نصائح قبل الشراء أو البيع</h2>
              <ul className="mt-3 grid gap-2.5">
                {listingSafetyTips.map((tip) => (
                  <li key={tip} className="text-sm leading-7 text-muted">
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5" variant="flat">
              <h2 className="text-sm font-bold text-ink">كيف يعمل الضمان المالي</h2>
              <ol className="mt-3 grid gap-2.5">
                {escrowProtectionSteps.map((step, index) => (
                  <li key={step} className="text-sm leading-7 text-muted">
                    {index + 1}. {step}
                  </li>
                ))}
              </ol>
            </Card>
            <p className="text-sm text-muted">
              لمتابعة معاملاتك المحمية سجّل الدخول إلى{" "}
              <Link className="font-semibold text-primary" href="/escrow">
                الضمان المالي
              </Link>
              ، أو اطلب المساعدة من{" "}
              <Link className="font-semibold text-primary" href="/support">
                الدعم
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
