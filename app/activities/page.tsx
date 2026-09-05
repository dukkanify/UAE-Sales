import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { ActivityDashboardSummary } from "@/features/activity/components/ActivityDashboardSummary";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getValidSessionUser } from "@/services/auth/require-session";
import { LocalizedTree } from "@/shared/i18n/LocalizedTree";
import { getRequestLocale } from "@/shared/i18n/locale";
import { tx } from "@/shared/i18n/tx";
import { Card } from "@/shared/ui/Card";
import { PageHero } from "@/shared/ui/PageHero";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: tx(locale, "نشاطاتي وطلباتي"),
  };
}

export default async function ActivitiesPage() {
  const user = await getValidSessionUser();
  if (!user) {
    redirect("/login?next=/activities");
  }

  const locale = await getRequestLocale();

  return (
    <>
      <SiteHeader />
      <main>
        <LocalizedTree>
          <section className="app-container page-padding">
            <PageHero
              description={tx(
                locale,
                "الوظائف، الحجوزات، الخدمات، الطلبات، والإعلانات — من الخادم مباشرة.",
              )}
              eyebrow={tx(locale, "حسابي")}
              title={tx(locale, "نشاطاتي وطلباتي")}
            />
            <div className="mx-auto mt-6 grid max-w-3xl gap-5">
              <ActivityDashboardSummary />
              <Card className="p-5" variant="flat">
                <h2 className="text-sm font-semibold text-ink">
                  {tx(locale, "سجل النشاط")}
                </h2>
                <div className="mt-4">
                  <Suspense
                    fallback={
                      <p className="text-sm text-muted">
                        {tx(locale, "جاري تحميل النشاط...")}
                      </p>
                    }
                  >
                    <ActivityFeed />
                  </Suspense>
                </div>
              </Card>
            </div>
          </section>
        </LocalizedTree>
      </main>
      <SiteFooter />
    </>
  );
}
