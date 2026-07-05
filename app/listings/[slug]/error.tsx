"use client";

import { useEffect } from "react";
import { ErrorState } from "@/shared/components/ErrorState";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getErrorMessage } from "@/services/api";

type ListingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ListingError({ error, reset }: ListingErrorProps) {
  useEffect(() => {
    console.error("[ListingError]", error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <ErrorState
            description={getErrorMessage(error)}
            onRetry={reset}
            title="تعذر تحميل الإعلان"
            variant="server"
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
