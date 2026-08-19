"use client";

import { LocalizedTree } from "@/shared/i18n/LocalizedTree";

import { RouteErrorFallback } from "@/shared/components/RouteErrorFallback";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

type CategoriesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CategoriesError({ error, reset }: CategoriesErrorProps) {
  return (
    <>
      <SiteHeader />
      <LocalizedTree>
      <main>
        <section className="app-container page-padding">
          <RouteErrorFallback error={error} reset={reset} title="تعذر تحميل الأقسام" />
        </section>
      </main>
      </LocalizedTree>
      <SiteFooter />
    </>
  );
}
