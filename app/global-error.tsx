"use client";

import { useEffect } from "react";
import { ErrorState } from "@/shared/components/ErrorState";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getErrorMessage } from "@/services/api";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <SiteHeader />
        <main className="app-container page-padding">
          <ErrorState
            description={getErrorMessage(error)}
            onRetry={reset}
            title="حدث خطأ في التطبيق"
            variant="server"
          />
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
