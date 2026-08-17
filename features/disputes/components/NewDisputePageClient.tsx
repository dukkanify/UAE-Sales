"use client";

import { useSearchParams } from "next/navigation";
import { NewDisputeForm } from "@/features/disputes/components/NewDisputeForm";
import { PageHero } from "@/shared/ui/PageHero";

export function NewDisputePageClient() {
  const searchParams = useSearchParams();
  const orderId = (searchParams.get("orderId") ?? "").trim();

  return (
    <section className="app-container page-padding">
      <PageHero
        description="افتح نزاعاً على طلب مدفوع عبر الضمان خلال المهلة المحددة."
        eyebrow="النزاعات"
        title="فتح نزاع جديد"
      />
      <div className="mx-auto mt-6 max-w-xl">
        <NewDisputeForm orderId={orderId} />
      </div>
    </section>
  );
}
