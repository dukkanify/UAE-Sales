"use client";

import { useEffect } from "react";
import { ErrorState } from "@/shared/components/ErrorState";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getErrorMessage } from "@/services/api";

type SearchErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SearchError({ error, reset }: SearchErrorProps) {
  useEffect(() => {
    console.error("[SearchError]", error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <ErrorState
            description={getErrorMessage(error)}
            onRetry={reset}
            title="تعذر تحميل نتائج البحث"
            variant="server"
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
