"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { PageHero } from "@/shared/ui/PageHero";
import { getSessionUser } from "@/services/storage";

type CheckoutAuthGateProps = {
  children: ReactNode;
  listingId: string;
};

export function CheckoutAuthGate({ children, listingId }: CheckoutAuthGateProps) {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkoutPath = `/checkout?listingId=${listingId}`;
    const timeoutId = window.setTimeout(() => {
      const sessionUser = getSessionUser();
      if (sessionUser) {
        setAllowed(true);
        return;
      }
      router.replace(`/login?next=${encodeURIComponent(checkoutPath)}`);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [listingId, router]);

  if (!allowed) {
    return (
      <section className="app-container page-padding">
        <Card className="p-8 text-center" variant="flat">
          <p className="text-sm font-medium text-muted">جاري التحقق من الجلسة...</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="app-container page-padding">
      <PageHero
        description="راجع تفاصيل طلبك وأكّد الدفع بأمان عبر الضمان المالي."
        eyebrow="الدفع"
        title="إتمام الشراء"
      />
      {children}
    </section>
  );
}
