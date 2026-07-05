"use client";

import { useEffect } from "react";
import { ErrorState } from "@/shared/components/ErrorState";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getErrorMessage } from "@/services/api";

type CategoriesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CategoriesError({ error, reset }: CategoriesErrorProps) {
  useEffect(() => {
    console.error("[CategoriesError]", error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <ErrorState
            description={getErrorMessage(error)}
            onRetry={reset}
            title="تعذر تحميل الأقسام"
            variant="server"
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
