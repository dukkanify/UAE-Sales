import { Suspense } from "react";
import { NewDisputePageClient } from "@/features/disputes/components/NewDisputePageClient";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { Card } from "@/shared/ui/Card";

export default function NewDisputePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Suspense
          fallback={
            <section className="app-container page-padding">
              <Card className="p-8 text-center" variant="flat">
                <p className="text-sm text-muted">جاري التحميل...</p>
              </Card>
            </section>
          }
        >
          <NewDisputePageClient />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
