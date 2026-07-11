"use client";

import { RouteErrorFallback } from "@/shared/components/RouteErrorFallback";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <section className="app-container page-padding">
      <RouteErrorFallback error={error} reset={reset} />
    </section>
  );
}
