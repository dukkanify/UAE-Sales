import Link from "next/link";
import { Suspense } from "react";
import { DisputeForm } from "@/features/disputes/components/DisputeForm";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { Card } from "@/shared/ui/Card";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getCurrentUser } from "@/services/profile";

export default async function NewDisputePage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader />
      <main>
        <DashboardShell
          activePath="/orders"
          description="قدّم تفاصيل المشكلة وسيقوم فريق الدعم بمراجعة النزاع خلال 48 ساعة."
          title="فتح نزاع جديد"
          user={user}
        >
          <div className="grid gap-4">
            <Card className="marketplace-panel p-5" variant="flat">
              <p className="text-sm text-muted">
                يُستخدم النزاع عند وجود مشكلة في الطلب أو التسليم. تأكد من
                إرفاق وصف واضح للأدلة المتاحة.
              </p>
              <Link
                className="mt-2 inline-block text-sm font-semibold text-primary"
                href="/escrow"
              >
                تعرّف على سياسة الضمان المالي
              </Link>
            </Card>
            <Suspense fallback={<Card className="p-6" variant="flat">جاري التحميل...</Card>}>
              <DisputeForm />
            </Suspense>
          </div>
        </DashboardShell>
      </main>
      <SiteFooter />
    </>
  );
}
