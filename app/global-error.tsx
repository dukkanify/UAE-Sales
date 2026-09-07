"use client";

import { useEffect, useState } from "react";
import { ErrorState } from "@/shared/components/ErrorState";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";
import { getErrorMessage } from "@/services/api";
import { getStoredLocale, LOCALE_COOKIE, type AppLocale } from "@/shared/i18n/locale";
import { tx } from "@/shared/i18n/tx";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [locale] = useState<AppLocale>(() =>
    typeof document !== "undefined" ? getStoredLocale() : "ar",
  );

  useEffect(() => {
    console.error("[GlobalError]", error);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }, [error, locale]);

  const title = tx(locale, "حدث خطأ في التطبيق");

  return (
    <html dir={locale === "en" ? "ltr" : "rtl"} lang={locale}>
      <body>
        <SiteHeader />
        <main className="app-container page-padding">
          <ErrorState
            description={getErrorMessage(error)}
            onRetry={reset}
            title={title}
            variant="server"
          />
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
