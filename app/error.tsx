"use client";

import { useEffect } from "react";
import { ErrorState } from "@/shared/components/ErrorState";
import { getErrorMessage } from "@/services/api";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[RouteError]", error);
  }, [error]);

  return (
    <section className="app-container page-padding">
      <ErrorState
        description={getErrorMessage(error)}
        onRetry={reset}
        title="تعذر تحميل الصفحة"
        variant="server"
      />
    </section>
  );
}
