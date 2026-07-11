"use client";

import { RouteErrorFallback } from "@/shared/components/RouteErrorFallback";
import { SiteFooter } from "@/shared/layouts/SiteFooter";
import { SiteHeader } from "@/shared/layouts/SiteHeader";

type SearchErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SearchError({ error, reset }: SearchErrorProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="app-container page-padding">
          <RouteErrorFallback error={error} reset={reset} title="تعذر تحميل نتائج البحث" />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
